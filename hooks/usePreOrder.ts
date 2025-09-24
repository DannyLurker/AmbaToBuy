// hooks/usePreOrder.ts
import { useState, useCallback } from "react";

export type PreOrderData = {
  productName: string;
  productImage: string;
  quantity: number;
  price: number;
  notes?: string;
};

export const usePreOrder = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPreOrder = useCallback(async (orderData: PreOrderData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/pre-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(orderData),
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, data: data.data, message: data.message };
      } else {
        setError(data.message || "Failed to create pre-order");
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errorMessage = "Network error. Please check your connection.";
      setError(errorMessage);
      console.error("Create pre-order error:", err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const getPreOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/pre-order", {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, data: data.data };
      } else {
        setError(data.message || "Failed to fetch pre-orders");
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errorMessage = "Network error. Please check your connection.";
      setError(errorMessage);
      console.error("Fetch pre-orders error:", err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const cancelPreOrder = useCallback(async (orderId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/pre-order?id=${orderId}`, {
        method: "DELETE",
        credentials: "include",
      });

      const data = await response.json();

      if (data.success) {
        return { success: true, data: data.data, message: data.message };
      } else {
        setError(data.message || "Failed to cancel pre-order");
        return { success: false, message: data.message };
      }
    } catch (err) {
      const errorMessage = "Network error. Please try again.";
      setError(errorMessage);
      console.error("Cancel pre-order error:", err);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createPreOrder,
    getPreOrders,
    cancelPreOrder,
    clearError: () => setError(null),
  };
};
