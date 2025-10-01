// components/admin/ConfirmationModal.tsx
"use client";
import React from "react";
import { X, AlertTriangle, Download, CheckCircle } from "lucide-react";

type ModalType = "export" | "confirm" | "complete" | "cancel";

type ConfirmationModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  type: ModalType;
  productName?: string;
  orderId?: string;
  customerName?: string;
  isLoading?: boolean;
};

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  type,
  productName,
  orderId,
  customerName,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const getModalConfig = () => {
    switch (type) {
      case "export":
        return {
          icon: <Download className="w-5 h-5 text-green-600" />,
          iconBg: "bg-green-100",
          title: "Export ke Excel?",
          message: "Anda akan mengekspor semua data pre-order ke file Excel.",
          warningMessage: "File akan diunduh ke komputer Anda.",
          warningBg: "bg-blue-50 border-blue-200",
          warningIcon: "text-blue-600",
          buttonText: "Ya, Export",
          buttonColor: "bg-green-500 hover:bg-green-600",
          loadingText: "Mengekspor...",
        };
      case "confirm":
        return {
          icon: <CheckCircle className="w-5 h-5 text-blue-600" />,
          iconBg: "bg-blue-100",
          title: "Konfirmasi Pesanan?",
          message: `Anda yakin ingin mengkonfirmasi pesanan untuk ${productName}?`,
          warningMessage:
            "Pesanan yang sudah dikonfirmasi akan masuk ke tahap processing.",
          warningBg: "bg-blue-50 border-blue-200",
          warningIcon: "text-blue-600",
          buttonText: "Ya, Konfirmasi",
          buttonColor: "bg-blue-500 hover:bg-blue-600",
          loadingText: "Mengkonfirmasi...",
        };
      case "complete":
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-600" />,
          iconBg: "bg-green-100",
          title: "Selesaikan Pesanan?",
          message: `Anda yakin ingin menyelesaikan pesanan untuk ${productName}?`,
          warningMessage:
            "Pesanan yang sudah diselesaikan tidak dapat diubah lagi.",
          warningBg: "bg-green-50 border-green-200",
          warningIcon: "text-green-600",
          buttonText: "Ya, Selesaikan",
          buttonColor: "bg-green-500 hover:bg-green-600",
          loadingText: "Menyelesaikan...",
        };
      case "cancel":
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-600" />,
          iconBg: "bg-red-100",
          title: "Batalkan Pesanan?",
          message: `Anda yakin ingin membatalkan pesanan untuk ${productName}?`,
          warningMessage:
            "Tindakan ini tidak dapat dibatalkan. Pesanan yang sudah dibatalkan tidak dapat dikembalikan.",
          warningBg: "bg-yellow-50 border-yellow-200",
          warningIcon: "text-yellow-600",
          buttonText: "Ya, Batalkan",
          buttonColor: "bg-red-500 hover:bg-red-600",
          loadingText: "Membatalkan...",
        };
    }
  };

  const config = getModalConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      ></div>

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div
              className={`w-10 h-10 ${config.iconBg} rounded-full flex items-center justify-center`}
            >
              {config.icon}
            </div>
            <h3 className="text-xl font-semibold text-gray-900">
              {config.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-full"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="space-y-4">
            {type !== "export" && (
              <>
                {customerName && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Customer Name:</p>
                    <p className="font-semibold text-gray-800">
                      {customerName}
                    </p>
                  </div>
                )}

                {orderId && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-600">Order ID:</p>
                    <p className="font-semibold text-gray-800">#{orderId}</p>
                  </div>
                )}
              </>
            )}

            <div
              className={`${
                type === "cancel"
                  ? "bg-red-50 border-red-200"
                  : "bg-gray-50 border-gray-200"
              } border rounded-lg p-4`}
            >
              <p className="text-gray-700">{config.message}</p>
            </div>

            <div
              className={`text-sm text-gray-600 ${config.warningBg} border rounded-lg p-3`}
            >
              <p className="flex items-start space-x-2">
                <AlertTriangle
                  className={`w-4 h-4 ${config.warningIcon} mt-0.5 flex-shrink-0`}
                />
                <span>{config.warningMessage}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-6 py-2.5 text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-6 py-2.5 ${config.buttonColor} text-white font-medium rounded-lg transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{config.loadingText}</span>
              </>
            ) : (
              <span>{config.buttonText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
