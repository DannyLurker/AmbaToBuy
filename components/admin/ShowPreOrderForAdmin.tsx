"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";
import {
  Package,
  Search,
  Download,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  AlertTriangle,
  X,
} from "lucide-react";
import Navbar from "../helper/Navbar";
import ConfirmationModal from "../modals/ConfirmationModal";

// Types
type PreOrder = {
  id: string;
  userId: string;
  contact: string;
  productName: string;
  customerName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  notes?: string;
  status: "pending" | "confirmed" | "completed" | "cancelled";
  createdAt: string;
};

type User = {
  id: string;
  username: string;
  email: string;
  role: string;
  isVerified: boolean;
};

type FilterStatus = "all" | "pending" | "confirmed" | "completed" | "cancelled";

type ModalType = "export" | "updateStatus" | null;

const ShowPreOrderForAdmin = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<PreOrder[]>([]);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState("");
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<
    "export" | "confirm" | "complete" | "cancel"
  >("export");
  const [selectedOrder, setSelectedOrder] = useState<PreOrder | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [isModalLoading, setIsModalLoading] = useState(false);

  // Filter and Search States
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [selectedProduct, setSelectedProduct] = useState<string>("all");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
  });

  // Pagination
  const searchParams = useSearchParams();
  const initialPage = parseInt(searchParams.get("page") || "1");
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  // Authentication check
  useEffect(() => {
    const checkUserAuth = async () => {
      setAuthLoading(true);
      setAuthError("");

      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          headers: {
            "Cache-Control": "no-cache",
            Pragma: "no-cache",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP ${res.status}: ${res.statusText}`);
        }

        const data = await res.json();

        if (data?.success && data?.data?.user && data.data.user.id) {
          if (data.data.user.role !== "admin") {
            setAuthError(
              "Akses ditolak. Hanya admin yang dapat mengakses halaman ini."
            );
            setTimeout(() => router.push("/"), 2000);
            return;
          }

          setIsAuthenticated(true);
          setUser(data.data.user);
        } else {
          setIsAuthenticated(false);
          setAuthError("Session tidak valid. Silakan login kembali.");
          setTimeout(() => {
            router.push(
              "/auth/login?redirect=" +
                encodeURIComponent(window.location.pathname)
            );
          }, 2000);
        }
      } catch (error: any) {
        console.error("Auth check failed:", error);
        setIsAuthenticated(false);
        setAuthError("Gagal memverifikasi session. Silakan login.");
        setTimeout(() => {
          router.push(
            "/auth/login?redirect=" +
              encodeURIComponent(window.location.pathname)
          );
        }, 2000);
      } finally {
        setAuthLoading(false);
      }
    };

    checkUserAuth();
  }, [router]);

  // Fetch pre-orders
  const fetchPreOrders = async (page = 1) => {
    if (!isAuthenticated) return;

    setDataLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin-api?page=${page}`, {
        method: "GET",
        credentials: "include",
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(`Server error: ${response.status}`);
      }

      if (data.success) {
        setPreOrders(data.data);

        if (data.totalCount) {
          setTotalPages(Math.ceil(data.totalCount / limit));
        }

        calculateStats(data.data);
      } else {
        setError(data.message || "Failed to fetch pre-orders");
      }
    } catch (err) {
      setError("Network error. Please check your connection.");
      console.error("Fetch pre-orders error:", err);
    } finally {
      setDataLoading(false);
    }
  };

  // Calculate statistics
  const calculateStats = (orders: PreOrder[]) => {
    const stats = {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      confirmed: orders.filter((o) => o.status === "confirmed").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
    setStats(stats);
  };

  // Filter orders
  useEffect(() => {
    let filtered = preOrders;

    if (filterStatus !== "all") {
      filtered = filtered.filter((order) => order.status === filterStatus);
    }

    if (selectedProduct !== "all") {
      filtered = filtered.filter(
        (order) => order.productName === selectedProduct
      );
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (order) =>
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.contact.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter((order) => {
        const orderDate = new Date(order.createdAt);
        const startDate = new Date(dateRange.start);
        const endDate = new Date(dateRange.end);
        return orderDate >= startDate && orderDate <= endDate;
      });
    }

    setFilteredOrders(filtered);
  }, [preOrders, filterStatus, selectedProduct, searchTerm, dateRange]);

  // Open modal for status update
  const openStatusModal = (order: PreOrder, newStatus: string) => {
    setSelectedOrder(order);
    setSelectedStatus(newStatus);

    if (newStatus === "confirmed") {
      setModalType("confirm");
    } else if (newStatus === "completed") {
      setModalType("complete");
    } else if (newStatus === "cancelled") {
      setModalType("cancel");
    }

    setIsModalOpen(true);
  };

  // Update order status
  const updateOrderStatus = async () => {
    if (!selectedOrder) return;

    setIsModalLoading(true);

    try {
      const response = await fetch("/api/admin-api", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          orderId: selectedOrder.id,
          status: selectedStatus,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Order status updated to ${selectedStatus}`);
        setIsModalOpen(false);
        fetchPreOrders(currentPage);
        setTimeout(() => setSuccess(null), 3000);
      } else {
        setError(data.message || "Failed to update status");
      }
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Update status error:", err);
    } finally {
      setIsModalLoading(false);
    }
  };

  // Export to Excel with confirmation modal
  const openExportModal = () => {
    setModalType("export");
    setIsModalOpen(true);
  };

  const exportToExcel = async () => {
    setIsModalLoading(true);

    try {
      const response = await fetch("/api/convert-to-excel", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      const result = await response.json();
      const orders = result.data;

      const headers = [
        "ID",
        "User ID",
        "Customer Name",
        "Product",
        "Quantity",
        "Price",
        "Total",
        "Status",
        "Contact",
        "Order Date",
        "Notes",
      ];

      const worksheetData = [
        headers,
        ...orders.map((order: PreOrder) => [
          order.id,
          order.userId,
          order.customerName,
          order.productName,
          order.quantity,
          order.price,
          order.totalPrice,
          order.status,
          order.contact,
          new Date(order.createdAt).toLocaleString(),
          order.notes || "",
        ]),
      ];

      const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "PreOrders");

      XLSX.writeFile(
        workbook,
        `preorders_${new Date().toISOString().split("T")[0]}.xlsx`
      );

      setSuccess("Excel file exported successfully!");
      setIsModalOpen(false);
      setTimeout(() => setSuccess(null), 3000);
    } catch (error) {
      console.error(error);
      setError("Failed to export Excel file");
      setIsModalOpen(false);
    } finally {
      setIsModalLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        setSuccess("Logout successful");
        setTimeout(() => router.push("/auth/login"), 2000);
      }
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  // Format functions
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

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
    router.push(`?page=${newPage}`);
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchPreOrders(currentPage);
    }
  }, [isAuthenticated, currentPage]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fefae0] to-[#faedcd]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#dda15e] mb-4"></div>
          <p className="text-[#606c38] font-semibold">
            Memverifikasi session...
          </p>
          <p className="text-[#606c38] text-sm mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // Access denied state
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fefae0] to-[#faedcd]">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-md mx-4 text-center">
          <div className="text-red-500 mb-4">
            <AlertTriangle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-2xl font-bold text-[#606c38] mb-4">
            Akses Ditolak
          </h2>
          <p className="text-[#606c38] mb-6">{authError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br h-full from-[#fefae0] to-[#faedcd]">
      {/* Navbar */}
      <Navbar user={user} onLogout={logout} />

      {/* Success/Error Messages */}
      {(success || error) && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div
            className={`${
              success
                ? "bg-green-50 border-green-200 text-green-800"
                : "bg-red-50 border-red-200 text-red-800"
            } border px-6 py-4 rounded-xl shadow-lg`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 ${
                  success ? "bg-green-500" : "bg-red-500"
                } rounded-full animate-pulse`}
              ></div>
              <span className="font-medium">{success || error}</span>
              <button
                onClick={() => {
                  setSuccess(null);
                  setError(null);
                }}
                className="ml-auto hover:opacity-70 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={modalType === "export" ? exportToExcel : updateOrderStatus}
        type={modalType}
        productName={selectedOrder?.productName}
        orderId={selectedOrder?.id.slice(-6)}
        customerName={selectedOrder?.customerName}
        isLoading={isModalLoading}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#dda15e]/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-[#606c38]">
                  Total Orders
                </p>
                <p className="text-2xl font-bold text-[#bc6c25]">
                  {stats.total}
                </p>
              </div>
              <Package className="w-8 h-8 text-[#dda15e]" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-yellow-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-yellow-700">Pending</p>
                <p className="text-2xl font-bold text-yellow-800">
                  {stats.pending}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-blue-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Confirmed</p>
                <p className="text-2xl font-bold text-blue-800">
                  {stats.confirmed}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Completed</p>
                <p className="text-2xl font-bold text-green-800">
                  {stats.completed}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-red-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Cancelled</p>
                <p className="text-2xl font-bold text-red-800">
                  {stats.cancelled}
                </p>
              </div>
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-[#dda15e]/20">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 items-center">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dda15e] focus:border-transparent outline-none"
                />
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) =>
                  setFilterStatus(e.target.value as FilterStatus)
                }
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dda15e] focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>

              {/* Product Filter */}
              <select
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#dda15e] focus:border-transparent outline-none"
              >
                <option value="all">All Products</option>
                <option value="sushi">Sushi</option>
                <option value="jasuke">Jasuke</option>
                <option value="milo">Es Milo</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => fetchPreOrders(currentPage)}
                disabled={dataLoading}
                className="flex items-center space-x-2 bg-[#dda15e] hover:bg-[#bc6c25] text-white px-4 py-2 rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${dataLoading ? "animate-spin" : ""}`}
                />
                <span>Refresh</span>
              </button>

              <button
                onClick={openExportModal}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
              >
                <Download className="w-4 h-4" />
                <span>Export To Excel</span>
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-[#dda15e]/20">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-[#bc6c25]">
              Pre-Orders ({filteredOrders.length})
            </h2>
          </div>

          {dataLoading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#dda15e] mb-4"></div>
              <p className="text-[#606c38]">Loading orders...</p>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-8 text-center">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No orders found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Product
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          #{order.id.slice(-6)}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {order.userId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.customerName}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.productName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Qty: {order.quantity} x {formatPrice(order.price)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {order.contact}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatPrice(order.totalPrice)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {order.notes}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(
                            order.status
                          )}`}
                        >
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status}</span>
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          {order.status === "pending" && (
                            <>
                              <button
                                onClick={() =>
                                  openStatusModal(order, "confirmed")
                                }
                                className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded-md text-xs transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() =>
                                  openStatusModal(order, "cancelled")
                                }
                                className="bg-red-100 text-red-700 hover:bg-red-200 px-3 py-1 rounded-md text-xs transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {order.status === "confirmed" && (
                            <button
                              onClick={() =>
                                openStatusModal(order, "completed")
                              }
                              className="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1 rounded-md text-xs transition-colors"
                            >
                              Complete
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="flex justify-center items-center space-x-2 py-4">
          <button
            onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`px-3 py-1 rounded ${
                currentPage === i + 1
                  ? "bg-[#dda15e] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {i + 1}
            </button>
          ))}

          <button
            onClick={() =>
              handlePageChange(Math.min(currentPage + 1, totalPages))
            }
            disabled={currentPage === totalPages}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShowPreOrderForAdmin;
