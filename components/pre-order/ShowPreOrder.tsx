// components/pre-order/ShowPreOrder.tsx
"use client";
import React, { useState, useEffect } from "react";
import { Package, ShoppingBag, AlertCircle, RefreshCw } from "lucide-react";
import PreOrderCard from "./PreOrderCard";
import CancelModal from "../modals/CancelPreOrderModal";

type PreOrder = {
  id: string;
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  totalPrice: number;
  status: "pending" | "confirmed" | "cancelled";
  orderDate: string;
  estimatedDelivery: string;
  notes?: string;
};

type CancelModalState = {
  isOpen: boolean;
  orderId: string | null;
  productName: string;
};

const ShowPreOrder: React.FC = () => {
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cancelModal, setCancelModal] = useState<CancelModalState>({
    isOpen: false,
    orderId: null,
    productName: "",
  });
  const [cancelLoading, setCancelLoading] = useState(false);

  // Fetch pre-orders
  const fetchPreOrders = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/pre-order", {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setPreOrders(data.data);
      } else {
        setError(data.message || "Failed to fetch pre-orders");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error("Fetch pre-orders error:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel pre-order
  const handleCancelPreOrder = async () => {
    if (!cancelModal.orderId) return;

    try {
      setCancelLoading(true);

      const response = await fetch(`/api/pre-order?id=${cancelModal.orderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        // Bisa pakai optimistic update
        setPreOrders((prev) =>
          prev.map((order) =>
            order.id === cancelModal.orderId
              ? { ...order, status: "cancelled" as const }
              : order
          )
        );

        // Atau lebih aman refetch ulang
        await fetchPreOrders();

        closeCancelModal();
      } else {
        setError(data.message || "Failed to cancel pre-order");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Cancel pre-order error:", err);
    } finally {
      setCancelLoading(false);
    }
  };

  // Open cancel modal
  const openCancelModal = (orderId: string) => {
    const order = preOrders.find((o) => o.id === orderId);
    if (order) {
      setCancelModal({
        isOpen: true,
        orderId,
        productName: order.productName,
      });
    }
  };

  // Close cancel modal
  const closeCancelModal = () => {
    setCancelModal({
      isOpen: false,
      orderId: null,
      productName: "",
    });
  };

  // Load data on component mount
  useEffect(() => {
    fetchPreOrders();
  }, []);

  // Filter orders by status
  const pendingOrders = preOrders.filter((order) => order.status === "pending");
  const confirmedOrders = preOrders.filter(
    (order) => order.status === "confirmed"
  );
  const cancelledOrders = preOrders.filter(
    (order) => order.status === "cancelled"
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#dda15e] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-[#606c38] font-medium">Memuat pesanan Anda...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center space-y-4 max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Terjadi Kesalahan
          </h2>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={fetchPreOrders}
            className="flex items-center space-x-2 bg-[#dda15e] hover:bg-[#bc6c25] text-white font-semibold py-2 px-4 rounded-lg transition-colors mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Coba Lagi</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mt-32">
        <div className="flex items-center justify-center space-x-3 mb-4">
          <Package className="w-8 h-8 text-[#bc6c25]" />
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#dda15e] to-[#bc6c25]">
            Pre-Order Saya
          </h1>
        </div>
        <p className="text-[#606c38] text-lg">
          Kelola dan pantau semua pesanan pra-pesan Anda
        </p>
      </div>

      {preOrders.length === 0 ? (
        // Empty State
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="w-12 h-12 text-gray-400" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Belum Ada Pre-Order
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Anda belum memiliki pesanan pra-pesan. Mulai jelajahi produk kami
            dan buat pesanan pertama Anda!
          </p>
          <a
            href="/"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#dda15e] to-[#bc6c25] hover:from-[#bc6c25] hover:to-[#dda15e] text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300"
          >
            <ShoppingBag className="w-5 h-5" />
            <span>Mulai Berbelanja</span>
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-yellow-800">
                {pendingOrders.length}
              </div>
              <div className="text-yellow-600 font-medium">
                Menunggu Konfirmasi
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-green-800">
                {confirmedOrders.length}
              </div>
              <div className="text-green-600 font-medium">Dikonfirmasi</div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-red-800">
                {cancelledOrders.length}
              </div>
              <div className="text-red-600 font-medium">Dibatalkan</div>
            </div>
          </div>

          {/* Pending Orders */}
          {pendingOrders.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-[#bc6c25] mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span>Menunggu Konfirmasi ({pendingOrders.length})</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {pendingOrders.map((order) => (
                  <PreOrderCard
                    key={order.id}
                    preOrder={order}
                    onCancel={openCancelModal}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Confirmed Orders */}
          {confirmedOrders.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-[#bc6c25] mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Dikonfirmasi ({confirmedOrders.length})</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {confirmedOrders.map((order) => (
                  <PreOrderCard
                    key={order.id}
                    preOrder={order}
                    onCancel={openCancelModal}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Cancelled Orders */}
          {cancelledOrders.length > 0 && (
            <section>
              <h2 className="text-2xl font-semibold text-[#bc6c25] mb-4 flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span>Dibatalkan ({cancelledOrders.length})</span>
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {cancelledOrders.map((order) => (
                  <PreOrderCard
                    key={order.id}
                    preOrder={order}
                    onCancel={openCancelModal}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Cancel Modal */}
      <CancelModal
        isOpen={cancelModal.isOpen}
        onClose={closeCancelModal}
        onConfirm={handleCancelPreOrder}
        isLoading={cancelLoading}
        productName={cancelModal.productName}
      />
    </div>
  );
};

export default ShowPreOrder;
