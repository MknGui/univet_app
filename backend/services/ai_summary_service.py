# backend/services/ai_summary_service.py

from __future__ import annotations

from datetime import date, datetime, timedelta
from typing import Sequence, Dict, List, Any

from models import Consultation, Pet
from services.local_llm_client import generate_summary_from_prompt


# Cache em memória:
# chave: pet_id
# valor: dict com summary, generated_at e lista de ids de consultas usados
_summary_cache: Dict[int, Dict[str, Any]] = {}

_CACHE_TTL = timedelta(minutes=30)


def _build_consultations_context(pet: Pet, consultations: Sequence[Consultation]) -> str:
    """Monta um texto estruturado com o histórico de consultas do pet."""
    lines: list[str] = []

    lines.append(
        f"Pet: {pet.name} "
        f"({pet.species or 'espécie não informada'}; "
        f"sexo: {pet.sex or 'não informado'}; "
        f"idade: {pet.age or 'não informada'} anos)."
    )
    lines.append(f"Total de consultas consideradas: {len(consultations)}.")
    lines.append("Histórico (da mais antiga para a mais recente):")

    ordered = sorted(
        consultations,
        key=lambda c: c.date or date.today(),
    )

    for c in ordered:
        d = c.date.strftime("%d/%m/%Y") if c.date else "data não informada"
        diag = (c.diagnosis or "sem diagnóstico registrado").strip()
        treatment = (c.treatment or "sem tratamento definido").strip()
        obs = (c.observations or "").strip()
        next_visit = (
            c.next_visit.strftime("%d/%m/%Y") if c.next_visit else None
        )

        line = f"- Consulta em {d}: diagnóstico = {diag}. Tratamento: {treatment}."
        if obs:
            line += f" Observações adicionais: {obs}."
        if next_visit:
            line += f" Próximo retorno sugerido em {next_visit}."

        lines.append(line)

    return "\n".join(lines)


def _get_consultation_signature(consultations: Sequence[Consultation]) -> List[int]:
    """Assinatura simples: lista ordenada de IDs de consulta."""
    return sorted(c.id for c in consultations if c.id is not None)


def generate_consultations_summary(pet: Pet, consultations: Sequence[Consultation]) -> str:
    """
    Gera (ou reutiliza) o resumo das consultas de um pet.

    Regras de cache:
      - TTL de 30 minutos (_CACHE_TTL)
      - Só reutiliza se a lista de consultas (ids) for a mesma
    """
    if not consultations:
        return "Não há consultas registradas para esse pet ainda."

    now = datetime.utcnow()
    sig = _get_consultation_signature(consultations)
    cache_key = pet.id

    # Tenta usar cache
    cached = _summary_cache.get(cache_key)
    if cached is not None:
        cached_at: datetime = cached["generated_at"]
        cached_sig: List[int] = cached["consultation_ids"]

        is_fresh = now - cached_at < _CACHE_TTL
        same_consultations = cached_sig == sig

        if is_fresh and same_consultations:
            # Reaproveita resumo
            return cached["summary"]

    # Se chegou aqui, precisa gerar um novo resumo
    context = _build_consultations_context(pet, consultations)

    prompt = (
        "Com base no histórico abaixo, gere um resumo em no máximo 2 a 3 parágrafos, "
        "em português do Brasil, ressaltando:\n"
        "- principais diagnósticos e problemas recorrentes;\n"
        "- tratamentos já realizados e resposta observada (se aparecer na descrição);\n"
        "- pontos de atenção para o próximo atendimento.\n\n"
        "HISTÓRICO DE CONSULTAS:\n"
        f"{context}"
    )

    summary_text = generate_summary_from_prompt(prompt)

    # Atualiza cache
    _summary_cache[cache_key] = {
        "summary": summary_text,
        "generated_at": now,
        "consultation_ids": sig,
    }

    return summary_text
