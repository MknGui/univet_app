def evaluate_triage(symptoms: str) -> dict:
    '''
    Aplica regras simples de triagem simulando uma IA.
    Ajuste as regras conforme a necessidade do projeto.
    '''
    text = symptoms.lower()

    if "convuls" in text or "não responde" in text or "nao responde" in text:
        risk = "ALTO"
        rec = "Procure atendimento veterinário de emergência imediatamente."
    elif "não come" in text or "nao come" in text or "vômito" in text or "vomito" in text or "diarre" in text:
        risk = "MÉDIO"
        rec = "Agende uma consulta nas próximas 24 horas e mantenha o animal hidratado."
    else:
        risk = "BAIXO"
        rec = "Monitore o quadro e, se persistir, agende uma consulta de rotina."

    return {
        "risk_level": risk,
        "recommendations": rec,
        "ai_summary": f"Nível de risco: {risk}. Recomendação: {rec}",
    }
