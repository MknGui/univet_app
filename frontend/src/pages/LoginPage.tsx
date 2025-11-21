import React, { useState } from "react";
import { login, register, getCurrentUser, logout } from "../api/auth";

const LoginPage: React.FC = () => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const user = getCurrentUser();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const data = await login(email, password);
      setMessage(`Logado como ${data.user.role} (id=${data.user.id})`);
    } catch (err: any) {
      setMessage(err.message ?? "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await register({
        full_name: name,
        email,
        password,
        role: "TUTOR",
      });
      setMessage("Cadastro realizado! Agora faça login.");
      setMode("login");
    } catch (err: any) {
      setMessage(err.message ?? "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  }

  function handleLogout() {
    logout();
    setMessage("Sessão encerrada");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="w-full max-w-md bg-white shadow-md rounded-2xl p-6 space-y-4">
        <h1 className="text-2xl font-bold text-center text-slate-800">
          Univet – Autenticação
        </h1>

        {user && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-lg p-3 flex justify-between items-center">
            <span>
              Logado como <strong>{user.role}</strong> (id {user.id})
            </span>
            <button
              onClick={handleLogout}
              className="text-xs underline hover:no-underline"
            >
              Sair
            </button>
          </div>
        )}

        <div className="flex gap-2 text-sm">
          <button
            type="button"
            onClick={() => setMode("login")}
            className={`flex-1 border rounded-lg py-2 ${
              mode === "login"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700"
            }`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => setMode("register")}
            className={`flex-1 border rounded-lg py-2 ${
              mode === "register"
                ? "bg-slate-900 text-white"
                : "bg-white text-slate-700"
            }`}
          >
            Cadastro
          </button>
        </div>

        <form
          onSubmit={mode === "login" ? handleLogin : handleRegister}
          className="space-y-3"
        >
          {mode === "register" && (
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">
                Nome completo
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          )}

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              E-mail
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">
              Senha
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700 disabled:opacity-60"
          >
            {loading
              ? "Processando..."
              : mode === "login"
              ? "Entrar"
              : "Cadastrar"}
          </button>
        </form>

        {message && (
          <p className="text-xs text-center text-slate-600">{message}</p>
        )}

        <p className="text-[11px] text-center text-slate-400">
          Dica: o backend Flask precisa estar rodando em
          <code className="mx-1 px-1 py-0.5 rounded bg-slate-100">
            http://localhost:5000/api
          </code>
          ou ajuste a variável <code>VITE_API_BASE_URL</code>.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
