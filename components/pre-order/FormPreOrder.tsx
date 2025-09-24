"use client";
import React, { useState } from "react";

const productPrices: Record<string, number> = {
  kentang: 12000,
  sushi: 10000,
  milo: 5000,
  jasuke: 5000,
};

const PreOrderForm = () => {
  const [nama, setNama] = useState("");
  const [produk, setProduk] = useState("");
  const [jumlah, setJumlah] = useState("");
  const [kontak, setKontak] = useState("");
  const [catatan, setCatatan] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/pre-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productName: produk,
          quantity: jumlah,
          price: productPrices[produk],
          notes: catatan,
          contact: kontak,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setMessage("Pre-order berhasil dikirim ✅");
        setNama("");
        setProduk("");
        setJumlah("");
        setKontak("");
        setCatatan("");
      } else {
        setMessage(`Gagal: ${data.message}`);
      }
    } catch (error) {
      setMessage("Terjadi error. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-20">
      <div className="container mx-auto px-4 sm:px-8 mt-15 pt-8">
        <h1
          className="text-center text-3xl sm:text-6xl font-extrabold 
          text-transparent bg-clip-text bg-gradient-to-r from-[#dda15e] to-[#bc6c25] 
          drop-shadow-md tracking-wide relative mb-8"
        >
          Form Pre-Order
        </h1>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-6 max-w-xl mx-auto space-y-6"
        >
          {/* Nama */}
          <div>
            <label className="block text-[#606c38] font-semibold mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#dda15e] outline-none"
              required
            />
          </div>

          {/* Produk */}
          <div>
            <label className="block text-[#606c38] font-semibold mb-2">
              Pilih Produk
            </label>
            <select
              value={produk}
              onChange={(e) => setProduk(e.target.value)}
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#dda15e] outline-none"
              required
            >
              <option value="">-- Pilih Produk --</option>
              <option value="kentang">Kentang Spiral</option>
              <option value="sushi">Sushi 1 Kotak isi 5</option>
              <option value="jasuke">Jasuke</option>
              <option value="milo">Es Milo</option>
            </select>
          </div>

          {/* Jumlah */}
          <div>
            <label className="block text-[#606c38] font-semibold mb-2">
              Jumlah
            </label>
            <input
              type="number"
              min="1"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="Masukkan jumlah"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#dda15e] outline-none"
              required
            />
          </div>

          {/* Kontak */}
          <div>
            <label className="block text-[#606c38] font-semibold mb-2">
              Media Sosial / Kontak (Untuk konfirmasi ulang)
            </label>
            <input
              type="text"
              value={kontak}
              onChange={(e) => setKontak(e.target.value)}
              placeholder="Contoh: WhatsApp 0812xxxx, IG: @username"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#dda15e] outline-none"
              required
            />
          </div>

          {/* Catatan */}
          <div>
            <label className="block text-[#606c38] font-semibold mb-2">
              Catatan Tambahan
            </label>
            <textarea
              rows={3}
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              placeholder="Tulis catatan tambahan.."
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#dda15e] outline-none"
            ></textarea>
          </div>

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-br from-[#dda15e] to-[#bc6c25] text-[#fefae0] font-bold py-3 px-8 rounded-full hover:opacity-90 hover:scale-105 transition-all duration-300"
            >
              {loading ? "Mengirim..." : "Kirim Pre-Order"}
            </button>
          </div>

          {message && (
            <p className="text-center mt-4 text-[#606c38] font-semibold">
              {message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
};

export default PreOrderForm;
