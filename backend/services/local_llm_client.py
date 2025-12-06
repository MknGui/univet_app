# backend/services/local_llm_client.py

from __future__ import annotations

import ollama


def generate_summary_from_prompt(prompt: str, model: str = "llama3") -> str:
    """
    Chama o modelo local via lib ollama e retorna apenas o texto do resumo.
    """
    try:
        response = ollama.chat(
            model=model,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "Você é um(a) médico(a) veterinário(a) assistente. "
                        "Receberá o histórico de consultas de um pet e deve gerar um "
                        "resumo curto, em português do Brasil, para que o tutor e o "
                        "veterinário entendam rapidamente a evolução clínica."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            stream=False,
        )

        message = response.get("message") or {}
        content = (message.get("content") or "").strip()

        if not content:
            return "Não foi possível gerar o resumo automático."

        return content

    except Exception as e:
        print(f"[LLM LOCAL] Erro ao chamar o modelo: {e}")
        return (
            "Não foi possível gerar o resumo automático neste momento. "
            "Consulte o histórico de consultas acima."
        )
