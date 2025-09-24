"use client";
import { X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function KentangModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center z-50">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="bg-white rounded-xl p-6 max-w-md w-full relative z-10">
        <button
          className="absolute top-3 right-3 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          <X className="w-6 h-6" />
        </button>
        <div className="flex justify-center">
          <img
            src="./kentang-spiral.jpg"
            alt="kentang"
            className="rounded-lg mb-4 w-40 h-40 object-fill"
          />
        </div>

        <h2 className="text-2xl font-bold text-[#bc6c25]">Kentang Spiral</h2>
        <p className="text-[#606c38] mt-2">
          Kentang goreng spiral dengan rasa gurih renyah, cocok untuk semua
          kalangan 🍟
        </p>
        <p className="mt-3 font-bold text-lg">Rp 12.000</p>
      </div>
    </div>
  );
}
