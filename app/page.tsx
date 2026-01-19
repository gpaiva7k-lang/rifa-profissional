"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { QRCodeCanvas } from "qrcode.react";

/* ===== CONFIGURAÇÕES ===== */
const CHAVE_PIX = "43872033824";
const VALOR = "10.00"; // use ponto, não vírgula
const CONTATO = "(11) 90000-0000";

/* ===== GERA PIX COPIA E COLA (SIMPLES) ===== */
const PIX_PAYLOAD = `PIX|${CHAVE_PIX}|${VALOR}`;

type Rifa = {
  numero: number;
  status: string;
};

export default function Home() {
  const [rifas, setRifas] = useState<Rifa[]>([]);
  const [numero, setNumero] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const carregar = async () => {
    const { data } = await supabase.from("rifas").select("numero,status");
    if (data) setRifas(data);
  };

  useEffect(() => {
    carregar();
  }, []);

  const comprar = async () => {
    if (!numero || !nome || !telefone) return;

    const { error } = await supabase.from("rifas").insert([
      { numero, nome, telefone, status: "reservado" },
    ]);

    if (!error) {
      setSucesso(true);
      carregar();
    }
  };

  const statusNumero = (n: number) => {
    const r = rifas.find((x) => x.numero === n);
    return r?.status || "livre";
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-950 text-white flex justify-center p-6">
      <div className="max-w-5xl w-full bg-gray-900 rounded-3xl shadow-2xl p-6 space-y-8">

        {/* Cabeçalho */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold text-purple-400">
            🎟️ Rifa Premiada
          </h1>
          <p className="text-gray-400">
            Escolha seu número da sorte
          </p>
        </div>

        {/* Números */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
            const status = statusNumero(n);

            return (
              <button
                key={n}
                disabled={status !== "livre"}
                onClick={() => setNumero(n)}
                className={`
                  py-2 rounded-xl text-sm font-bold transition
                  ${status === "pago" && "bg-green-600 cursor-not-allowed"}
                  ${status === "reservado" && "bg-yellow-500 text-black cursor-not-allowed"}
                  ${status === "livre" && "bg-gray-700 hover:bg-purple-600"}
                  ${numero === n && "ring-2 ring-purple-400"}
                `}
              >
                {n}
              </button>
            );
          })}
        </div>

        {/* Form */}
        <div className="grid sm:grid-cols-3 gap-4">
          <input
            className="bg-gray-800 rounded-xl p-3 outline-none"
            placeholder="Seu nome"
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            className="bg-gray-800 rounded-xl p-3 outline-none"
            placeholder="WhatsApp"
            onChange={(e) => setTelefone(e.target.value)}
          />
          <button
            onClick={comprar}
            className="bg-purple-600 rounded-xl font-bold hover:bg-purple-700 transition"
          >
            Confirmar {numero && `#${numero}`}
          </button>
        </div>

        {/* Pagamento */}
        {sucesso && (
          <div className="bg-black/60 border border-purple-500 rounded-2xl p-6 space-y-4 text-center">
            <h2 className="text-green-400 font-bold text-xl">
              ✅ Número reservado!
            </h2>

            <p><strong>Número:</strong> #{numero}</p>
            <p><strong>Valor:</strong> R$ {VALOR}</p>

            {/* QR CODE */}
            <div className="flex justify-center">
              <div className="bg-white p-4 rounded-xl">
                <QRCodeCanvas value={PIX_PAYLOAD} size={220} />
              </div>
            </div>

            <div className="bg-gray-900 rounded-xl p-3">
              <p className="text-sm text-gray-400">Chave PIX:</p>
              <p className="font-mono break-all text-purple-400">
                {CHAVE_PIX}
              </p>
            </div>

            <p className="text-sm text-gray-400">
              Envie o comprovante para:
              <br />
              <strong className="text-white">{CONTATO}</strong>
            </p>

            <p className="text-red-400 text-sm">
              ⚠️ Número confirmado somente após pagamento.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
