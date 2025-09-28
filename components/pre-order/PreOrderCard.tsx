// components/pre-order/PreOrderCard.tsx
"use client";
import React from "react";
import {
  Calendar,
  Package,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

type PreOrder = {
  id: string;
  productName: string;
  contact: string;
  quantity: number;
  price: number;
  totalPrice: number;
  orderDate: string;
  notes?: string;
  status: string;
  createdAt: string;
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
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "confirmed":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="w-4 h-4" />;
      case "confirmed":
        return <CheckCircle className="w-4 h-4" />;
      case "completed":
        return <CheckCircle className="w-4 h-4" />;
      case "cancelled":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
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
        <div
          className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-semibold capitalize border ${getStatusColor(
            preOrder.status
          )}`}
        >
          {getStatusIcon(preOrder.status)}
          <span>
            {preOrder.status === "pending"
              ? "Menunggu Konfirmasi"
              : preOrder.status === "confirmed"
              ? "Dikonfirmasi"
              : preOrder.status === "completed"
              ? "Selesai"
              : preOrder.status === "cancelled"
              ? "Dibatalkan"
              : preOrder.status}
          </span>
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
              <p>{formatDate(preOrder.createdAt)}</p>
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
