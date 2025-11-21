import React, { useEffect, useState } from "react";
import {
  listEducationalContent,
  EducationalContent,
} from "../api/content";

const ContentPage: React.FC = () => {
  const [items, setItems] = useState<EducationalContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setMessage(null);
    try {
      const data = await listEducationalContent();
      setItems(data);
    } catch (err: any) {
      setMessage(err.message ?? "Erro ao carregar conteúdos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">
              Conteúdo educacional
            </h1>
            <p className="text-sm text-slate-500">
              Materiais cadastrados no Univet para orientar tutores.
            </p>
          </div>
          <button
            onClick={load}
            className="text-sm px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-100"
          >
            Atualizar
          </button>
        </header>

        <section className="bg-white rounded-2xl shadow divide-y">
          {loading && items.length === 0 && (
            <p className="p-4 text-sm text-slate-500">Carregando...</p>
          )}
          {!loading && items.length === 0 && (
            <p className="p-4 text-sm text-slate-500">
              Nenhum conteúdo cadastrado.
            </p>
          )}
          {items.map((c) => (
            <article key={c.id} className="p-4 space-y-1 text-sm">
              <h2 className="font-semibold text-slate-800">{c.title}</h2>
              {c.target_species && (
                <p className="text-xs text-slate-500">
                  Espécie alvo: {c.target_species}
                </p>
              )}
              {c.summary && (
                <p className="text-sm text-slate-600">{c.summary}</p>
              )}
            </article>
          ))}
        </section>

        {message && (
          <p className="text-xs text-slate-600 text-center">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ContentPage;
