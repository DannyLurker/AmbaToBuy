import React from "react";
import { Footer } from "../helper/Footer";

const ShowPreOrder = () => {
  return (
    <div className="mb-20">
      {/* Pre Order Section */}

      <div className="container mx-auto px-4 sm:px-8 mt-15 pt-8">
        <h1
          className="text-center text-3xl sm:text-6xl font-extrabold 
  text-transparent bg-clip-text bg-gradient-to-r from-[#dda15e] to-[#bc6c25] 
  drop-shadow-md tracking-wide relative mb-8"
        >
          Form Pre-Order
        </h1>

        <form className="bg-white shadow-lg rounded-xl p-6 max-w-xl mx-auto space-y-6">
          {/* Nama */}
          <div>
            <label className="block text-[#606c38] font-semibold mb-2">
              Nama Lengkap
            </label>
            <input
              type="text"
              placeholder="Masukkan nama Anda"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#dda15e] outline-none"
              required
            />
          </div>

          {/* Pilih Produk */}
          <div>
            <label className="block text-[#606c38] font-semibold mb-2">
              Pilih Produk
            </label>
            <select
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#dda15e] outline-none"
              required
            >
              <option value="">-- Pilih Produk --</option>
              <option value="kentang">Kentang Spiral</option>
              <option value="sushi">Sushi</option>
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
              placeholder="Masukkan jumlah"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#dda15e] outline-none"
              required
            />
          </div>

          {/* Media Sosial */}
          <div>
            <label className="block text-[#606c38] font-semibold mb-2">
              Media Sosial / Kontak
            </label>
            <input
              type="text"
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
              placeholder="Tulis request khusus (opsional)"
              className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#dda15e] outline-none"
            ></textarea>
          </div>

          {/* Submit */}
          <div className="text-center">
            <button
              type="submit"
              className="bg-gradient-to-br from-[#dda15e] to-[#bc6c25] text-[#fefae0] font-bold py-3 px-8 rounded-full hover:opacity-90 hover:scale-105 transition-all duration-300"
            >
              Kirim Pre-Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ShowPreOrder;
