import React, { useEffect, useState } from "react";
import { createPet, listPets, Pet } from "../api/pets";

const PetsPage: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    sex: "",
    notes: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  async function loadPets() {
    setLoading(true);
    setMessage(null);
    try {
      const data = await listPets();
      setPets(data);
    } catch (err: any) {
      setMessage(err.message ?? "Erro ao carregar pets");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPets();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await createPet({
        name: form.name,
        species: form.species,
        breed: form.breed || undefined,
        sex: form.sex || undefined,
        notes: form.notes || undefined,
      });
      setMessage("Pet cadastrado com sucesso!");
      setForm({ name: "", species: "", breed: "", sex: "", notes: "" });
      await loadPets();
    } catch (err: any) {
      setMessage(err.message ?? "Erro ao cadastrar pet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">
            Pacientes (Pets)
          </h1>
          <button
            onClick={loadPets}
            className="text-sm px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-100"
          >
            Atualizar
          </button>
        </header>

        <section className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">
            Novo pet
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"
          >
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Nome"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Espécie (ex: cão, gato)"
              value={form.species}
              onChange={(e) =>
                setForm((f) => ({ ...f, species: e.target.value }))
              }
              required
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Raça"
              value={form.breed}
              onChange={(e) =>
                setForm((f) => ({ ...f, breed: e.target.value }))
              }
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="Sexo"
              value={form.sex}
              onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value }))}
            />
            <textarea
              className="border rounded-lg px-3 py-2 md:col-span-2"
              placeholder="Observações"
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
            />
            <button
              type="submit"
              disabled={loading}
              className="md:col-span-2 bg-emerald-600 text-white rounded-lg py-2 font-medium hover:bg-emerald-700 disabled:opacity-60"
            >
              {loading ? "Salvando..." : "Cadastrar pet"}
            </button>
          </form>
          {message && (
            <p className="text-xs text-slate-600 mt-1">{message}</p>
          )}
        </section>

        <section className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">
            Meus pacientes
          </h2>
          {loading && pets.length === 0 && (
            <p className="text-sm text-slate-500">Carregando...</p>
          )}
          {!loading && pets.length === 0 && (
            <p className="text-sm text-slate-500">
              Nenhum pet cadastrado ainda.
            </p>
          )}
          <ul className="divide-y text-sm">
            {pets.map((p) => (
              <li key={p.id} className="py-2 flex flex-col">
                <span className="font-medium text-slate-800">
                  {p.name}{" "}
                  <span className="text-xs text-slate-500">
                    ({p.species})
                  </span>
                </span>
                {p.breed && (
                  <span className="text-xs text-slate-500">
                    Raça: {p.breed}
                  </span>
                )}
                {p.sex && (
                  <span className="text-xs text-slate-500">
                    Sexo: {p.sex}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default PetsPage;
