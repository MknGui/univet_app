import React, { useState } from "react";
import { createTriage, TriageResult } from "../api/triage";

const TriagePage: React.FC = () => {
  const [petId, setPetId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TriageResult | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setResult(null);
    try {
      const data = await createTriage({
        pet_id: Number(petId),
        symptoms,
      });
      setResult(data);
    } catch (err: any) {
      setMessage(err.message ?? "Erro ao enviar triagem");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <header>
          <h1 className="text-2xl font-bold text-slate-800">
            Triagem automatizada (simulada)
          </h1>
          <p className="text-sm text-slate-500">
            Envie os sintomas do paciente e veja o nível de risco estimado
            de acordo com as regras configuradas no backend.
          </p>
        </header>

        <section className="bg-white rounded-2xl shadow p-4 space-y-3">
          <form onSubmit={handleSubmit} className="space-y-3 text-sm">
            <input
              className="border rounded-lg px-3 py-2 w-full"
              placeholder="ID do pet"
              value={petId}
              onChange={(e) => setPetId(e.target.value)}
              required
            />
            <textarea
              className="border rounded-lg px-3 py-2 w-full min-h-[120px]"
              placeholder="Descreva os sintomas, duração, comportamento, etc."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              required
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-600 text-white rounded-lg py-2 px-4 font-medium hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Analisando..." : "Enviar triagem"}
            </button>
          </form>

          {message && (
            <p className="text-xs text-slate-600 mt-1">{message}</p>
          )}
        </section>

        {result && (
          <section className="bg-white rounded-2xl shadow p-4 space-y-2">
            <h2 className="text-lg font-semibold text-slate-800">
              Resultado da triagem
            </h2>
            <p className="text-sm">
              <span className="font-medium">Nível de risco:</span>{" "}
              <span className="uppercase">{result.risk_level}</span>
            </p>
            <p className="text-sm">
              <span className="font-medium">Resumo:</span>{" "}
              {result.ai_summary}
            </p>
            <p className="text-sm">
              <span className="font-medium">Recomendações:</span>{" "}
              {result.recommendations}
            </p>
          </section>
        )}
      </div>
    </div>
  );
};

export default TriagePage;
