"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

type Rifa = {
  id: string;
  numero: number;
  nome: string;
  telefone: string;
  status: string;
};

export default function Admin() {
  const [senha, setSenha] = useState("");
  const [autorizado, setAutorizado] = useState(false);
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const [loading, setLoading] = useState(false);

  const verificarSenha = () => {
    if (senha === process.env.NEXT_PUBLIC_ADMIN_PASSWORD) {
      setAutorizado(true);
    } else {
      alert("Senha incorreta");
    }
  };

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("rifas")
      .select("*")
      .order("numero");

    if (data) setRifas(data);
    setLoading(false);
  };

  useEffect(() => {
    if (autorizado) carregar();
  }, [autorizado]);

  const confirmarPagamento = async (id: string) => {
    await supabase.from("rifas").update({ status: "pago" }).eq("id", id);
    carregar();
  };

  /* ================= LOGIN ================= */
  if (!autorizado) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="bg-gray-900 p-6 rounded-2xl shadow-xl w-full max-w-sm space-y-4">
          <h1 className="text-2xl font-bold text-center text-purple-400">
            🔒 Painel Admin
          </h1>

          <input
            type="password"
            placeholder="Senha do admin"
            className="w-full p-3 rounded-xl bg-gray-800 outline-none"
            onChange={(e) => setSenha(e.target.value)}
          />

          <button
            onClick={verificarSenha}
            className="w-full bg-purple-600 p-3 rounded-xl font-bold hover:bg-purple-700"
          >
            Entrar
          </button>
        </div>
      </main>
    );
  }

  /* ================= LOADING ================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Carregando...
      </div>
    );
  }

  /* ================= PAINEL ================= */
  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow p-6">

        {/* TOPO COM BOTÃO SAIR */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold">📋 Painel Admin</h1>

          <button
            onClick={() => {
              setAutorizado(false);
              setSenha("");
            }}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Sair
          </button>
        </div>

        {/* TABELA */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-200 text-left">
                <th className="p-2">Número</th>
                <th className="p-2">Nome</th>
                <th className="p-2">Telefone</th>
                <th className="p-2">Status</th>
                <th className="p-2">Ação</th>
              </tr>
            </thead>

            <tbody>
              {rifas.map((r) => (
                <tr key={r.id} className="border-b">
                  <td className="p-2 font-bold">#{r.numero}</td>
                  <td className="p-2">{r.nome}</td>
                  <td className="p-2">{r.telefone}</td>
                  <td className="p-2">
                    {r.status === "pago" ? (
                      <span className="text-green-600 font-semibold">
                        ✅ Pago
                      </span>
                    ) : (
                      <span className="text-yellow-600 font-semibold">
                        ⏳ Reservado
                      </span>
                    )}
                  </td>
                  <td className="p-2">
                    {r.status !== "pago" && (
                      <button
                        onClick={() => confirmarPagamento(r.id)}
                        className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
                      >
                        Confirmar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {rifas.length === 0 && (
            <p className="text-center text-gray-500 mt-4">
              Nenhuma rifa cadastrada.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
