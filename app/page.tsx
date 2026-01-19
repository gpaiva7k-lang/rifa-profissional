"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import QRCode from "qrcode";

const CHAVE_PIX = "43872033824";
const VALOR = "10,00";
const CONTATO = "(11) 90000-0000";

export default function Home() {
  const [comprados, setComprados] = useState<number[]>([]);
  const [numero, setNumero] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [sucesso, setSucesso] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    const carregar = async () => {
      const { data } = await supabase.from("rifas").select("numero");
      if (data) setComprados(data.map((n) => n.numero));
    };
    carregar();
  }, []);

  const comprar = async () => {
    if (!numero || !nome || !telefone) {
      alert("Preencha todos os campos");
      return;
    }

    const { error } = await supabase.from("rifas").insert([
      { numero, nome, telefone },
    ]);

    if (error) {
      alert("Número indisponível");
      return;
    }

    setSucesso(true);
    setComprados([...comprados, numero]);

    // 🔥 GERA O QR CODE PIX
    const qr = await QRCode.toDataURL(CHAVE_PIX);
    setQrCode(qr);
  };

  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg p-6 space-y-6">

        <div className="text-center">
          <h1 className="text-3xl font-bold">🎟️ Rifa Premiada</h1>
          <p className="text-gray-500">Escolha seu número da sorte</p>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Array.from({ length: 100 }, (_, i) => i + 1).map((n) => {
            const vendido = comprados.includes(n);
            const selecionado = numero === n;

            return (
              <button
                key={n}
                disabled={vendido}
                onClick={() => setNumero(n)}
                className={`py-2 rounded-lg text-sm font-semibold
                  ${vendido && "bg-gray-300 text-gray-500"}
                  ${!vendido && !selecionado && "bg-gray-100 hover:bg-gray-200"}
                  ${selecionado && "bg-green-500 text-white"}
                `}
              >
                {n}
              </button>
            );
          })}
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <input
            className="border rounded-lg p-2"
            placeholder="Nome"
            onChange={(e) => setNome(e.target.value)}
          />
          <input
            className="border rounded-lg p-2"
            placeholder="Telefone"
            onChange={(e) => setTelefone(e.target.value)}
          />
          <button
            onClick={comprar}
            className="bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          >
            Confirmar Número {numero && `#${numero}`}
          </button>
        </div>

        {sucesso && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-4 text-center">
            <h2 className="font-bold text-green-700">
              ✅ Número reservado com sucesso!
            </h2>

            <p><strong>Número:</strong> {numero}</p>
            <p><strong>Valor:</strong> R$ {VALOR}</p>

            {qrCode && (
              <div className="flex justify-center">
                <img
                  src={qrCode}
                  alt="QR Code PIX"
                  className="w-48 h-48 border rounded-xl"
                />
              </div>
            )}

            <p className="text-sm text-gray-600">
              PIX: <strong>{CHAVE_PIX}</strong>
            </p>

            <p className="text-sm text-red-600">
              ⚠️ O número será confirmado após o pagamento.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
