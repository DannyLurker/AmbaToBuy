// components/pre-order/PreOrderCard.tsx
"use client";
import React from "react";
import { Calendar, Package, Trash2 } from "lucide-react";

type PreOrder = {
  id: string;
  productName: string;
  contact: string;
  quantity: number;
  price: number;
  totalPrice: number;
  orderDate: string;
  notes?: string;
};

type PreOrderCardProps = {
  preOrder: PreOrder;
  onCancel: (id: string) => void;
};

const PreOrderCard: React.FC<PreOrderCardProps> = ({ preOrder, onCancel }) => {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-[#dda15e]/20">
      {/* Header with Status */}
      <div className="flex justify-between items-center p-4 bg-gradient-to-r from-[#fefae0] to-[#faedcd] border-b border-[#dda15e]/20">
        <div className="flex items-center space-x-2">
          <Package className="w-5 h-5 text-[#bc6c25]" />
          <h3 className="font-semibold text-[#bc6c25]">
            Pre-Order #{preOrder.id.slice(-6)}
          </h3>
        </div>
      </div>

      <div className="p-4">
        <div className="flex space-x-4">
          {/* Product Details */}
          <div className="flex-1 space-y-2">
            <h4 className="text-xl font-bold text-[#bc6c25]">
              {preOrder.productName}
            </h4>

            <div className="flex items-center justify-between text-sm text-[#606c38]">
              <span>Jumlah: {preOrder.quantity}x</span>
              <span className="font-semibold">
                {formatPrice(preOrder.price)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-[#bc6c25]">
                Total: {formatPrice(preOrder.totalPrice)}
              </span>
            </div>

            {preOrder.notes && (
              <div className="bg-[#fefae0] p-2 rounded-lg border border-[#dda15e]/30 mb-2">
                <p className="text-sm text-[#606c38]">
                  <span className="font-semibold">Catatan:</span>{" "}
                  {preOrder.notes}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4 text-sm text-[#606c38]">
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4" />
            <div>
              <p className="font-medium">Tanggal Pesan</p>
              <p>{formatDate(preOrder.orderDate)}</p>
            </div>
          </div>
          <div>
            <p className="font-medium">Contact</p>
            <p className="font-medium">
              {preOrder.contact || "Can't be displayed"}
            </p>
          </div>
        </div>

        {/* Action Button */}

        <div className="mt-4 pt-4 border-t border-[#dda15e]/20">
          <button
            onClick={() => onCancel(preOrder.id)}
            className="w-full flex items-center justify-center space-x-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
          >
            <Trash2 className="w-4 h-4" />
            <span>Batalkan Pesanan</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreOrderCard;
