import React, { useEffect, useState } from "react";
import {
  createAppointment,
  listAppointments,
  Appointment,
} from "../api/appointments";

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    pet_id: "",
    vet_id: "",
    scheduled_at: "",
    notes: "",
  });
  const [message, setMessage] = useState<string | null>(null);

  async function loadAppointments() {
    setLoading(true);
    setMessage(null);
    try {
      const data = await listAppointments();
      setAppointments(data);
    } catch (err: any) {
      console.error(err);
      setMessage(err.message ?? "Erro ao carregar agendamentos");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadAppointments();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await createAppointment({
        pet_id: Number(form.pet_id),
        vet_id: Number(form.vet_id),
        // backend espera ISO completo
        scheduled_at: new Date(form.scheduled_at).toISOString(),
        reason: form.notes || undefined, // mapeia notes -> reason
      });
      setMessage("Consulta agendada com sucesso!");
      setForm({ pet_id: "", vet_id: "", scheduled_at: "", notes: "" });
      await loadAppointments();
    } catch (err: any) {
      console.error(err);
      setMessage(err.message ?? "Erro ao agendar consulta");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <header className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">Agendamentos</h1>
          <button
            onClick={loadAppointments}
            className="text-sm px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-100"
          >
            Atualizar
          </button>
        </header>

        {/* Formulário de novo agendamento */}
        <section className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">
            Novo agendamento
          </h2>
          <form
            onSubmit={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm"
          >
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="ID do pet"
              value={form.pet_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, pet_id: e.target.value }))
              }
              required
            />
            <input
              className="border rounded-lg px-3 py-2"
              placeholder="ID do veterinário"
              value={form.vet_id}
              onChange={(e) =>
                setForm((f) => ({ ...f, vet_id: e.target.value }))
              }
              required
            />
            <input
              className="border rounded-lg px-3 py-2 md:col-span-2"
              type="datetime-local"
              value={form.scheduled_at}
              onChange={(e) =>
                setForm((f) => ({ ...f, scheduled_at: e.target.value }))
              }
              required
            />
            <textarea
              className="border rounded-lg px-3 py-2 md:col-span-2"
              placeholder="Observações / motivo da consulta"
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
              {loading ? "Salvando..." : "Agendar consulta"}
            </button>
          </form>
          {message && (
            <p className="text-xs text-slate-600 mt-1">{message}</p>
          )}
        </section>

        {/* Lista de agendamentos */}
        <section className="bg-white rounded-2xl shadow p-4 space-y-3">
          <h2 className="text-lg font-semibold text-slate-800">
            Próximos agendamentos
          </h2>

          {loading && appointments.length === 0 && (
            <p className="text-sm text-slate-500">Carregando...</p>
          )}

          {!loading && appointments.length === 0 && (
            <p className="text-sm text-slate-500">
              Nenhum agendamento encontrado.
            </p>
          )}

          <ul className="divide-y text-sm">
            {appointments.map((a) => (
              <li key={a.id} className="py-2">
                <div className="font-medium text-slate-800">
                  Pet #{a.pet_id} – Vet #{a.vet_id}
                </div>
                <div className="text-xs text-slate-500">
                  Data: {new Date(a.scheduled_at).toLocaleString()}
                </div>
                <div className="text-xs text-slate-500">
                  Status: {a.status}
                </div>
                {a.reason && (
                  <div className="text-xs text-slate-500">
                    Obs: {a.reason}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};

export default AppointmentsPage;