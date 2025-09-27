"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

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
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authError, setAuthError] = useState("");
  const router = useRouter();

  // Enhanced user authentication check
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
        console.log("Auth check response:", data); // Debug log

        if (data?.success && data?.data?.user && data.data.user.id) {
          setIsAuthenticated(true);
          setUser(data.data.user);
          // Auto-fill nama jika tersedia dari user data
          if (data.data.user.username && !nama) {
            setNama(data.data.user.username);
          }
        } else {
          console.log("Auth failed:", data); // Debug log
          setIsAuthenticated(false);
          setAuthError("Session tidak valid. Silakan login kembali.");
          // Delay redirect untuk memberi waktu user membaca pesan
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

        // Handle different error scenarios
        if (error.message.includes("401") || error.message.includes("403")) {
          setTimeout(() => {
            router.push(
              "/auth/login?redirect=" +
                encodeURIComponent(window.location.pathname)
            );
          }, 2000);
        } else {
          // Network atau server error
          setTimeout(() => {
            router.push(
              "/auth/login?error=connection&redirect=" +
                encodeURIComponent(window.location.pathname)
            );
          }, 3000);
        }
      } finally {
        setAuthLoading(false);
      }
    };

    checkUserAuth();

    // Set up periodic auth check (setiap 2 menit untuk lebih responsif)
    const authInterval = setInterval(checkUserAuth, 2 * 60 * 1000);

    return () => clearInterval(authInterval);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Double check authentication before submitting
    if (!isAuthenticated) {
      setMessage("Session expired. Redirecting to login...");
      setTimeout(() => {
        router.push(
          "/auth/login?redirect=" + encodeURIComponent(window.location.pathname)
        );
      }, 1500);
      return;
    }

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
          quantity: parseInt(jumlah),
          price: productPrices[produk],
          notes: catatan,
          contact: kontak,
          customerName: nama,
        }),
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          throw new Error("UNAUTHORIZED");
        }
        throw new Error(`Server error: ${res.status}`);
      }

      const data = await res.json();

      if (data.success) {
        setMessage("Pre-order berhasil dikirim ✅");
        // Reset form except nama (keep user's name)
        setProduk("");
        setJumlah("");
        setKontak("");
        setCatatan("");

        // Auto scroll to success message
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 100);
      } else {
        setMessage(`Gagal: ${data.message || "Unknown error"}`);
      }
    } catch (error: any) {
      console.error("Submit error:", error);

      if (error.message === "UNAUTHORIZED") {
        setMessage("Session expired. Redirecting to login...");
        setIsAuthenticated(false);
        setTimeout(() => {
          router.push(
            "/auth/login?redirect=" +
              encodeURIComponent(window.location.pathname)
          );
        }, 1500);
      } else {
        setMessage("Terjadi error saat mengirim pre-order. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Loading state saat check authentication
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

  // check status
  if (
    process.env.NEXT_PUBLIC_PRE_ORDER_FORM_STATUS === "private" &&
    !(user.role === "admin")
  ) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fefae0] to-[#faedcd]">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-md mx-4 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-7a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#606c38] mb-4">
            Akses Ditolak
          </h2>
          <p className="text-[#606c38] mb-6">Anda tidak memiliki aksesnya</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fefae0] to-[#faedcd]">
        <div className="bg-white shadow-lg rounded-xl p-8 max-w-md mx-4 text-center">
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m0 0v2m0-2h2m-2 0H10m9-7a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#606c38] mb-4">
            Akses Ditolak
          </h2>
          <p className="text-[#606c38] mb-6">
            {authError || "Anda harus login untuk mengakses halaman ini."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() =>
                router.push(
                  "/auth/login?redirect=" +
                    encodeURIComponent(window.location.pathname)
                )
              }
              className="w-full bg-gradient-to-br from-[#dda15e] to-[#bc6c25] text-[#fefae0] font-bold py-3 px-6 rounded-full hover:opacity-90 transition-all duration-300"
            >
              Login Sekarang
            </button>
            <button
              onClick={() => router.push("/")}
              className="w-full bg-gray-500 text-white font-bold py-2 px-6 rounded-full hover:bg-gray-600 transition-all duration-300"
            >
              Kembali ke Beranda
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-20 min-h-screen bg-gradient-to-br from-[#fefae0] to-[#faedcd]">
      <div className="container mx-auto px-4 sm:px-8 pt-8">
        {/* Header with user info */}
        <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
          <div className="flex-1">
            <h1 className="text-3xl sm:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#dda15e] to-[#bc6c25] drop-shadow-md tracking-wide mt-20">
              Form Pre-Order
            </h1>
            {user && (
              <p className="text-[#606c38] mt-2">
                Welcome back,{" "}
                <span className="font-semibold">
                  {user.username || user.email}
                </span>
                !
                {user.isVerified ? (
                  <span className="ml-2 text-green-600 text-sm">
                    ✅ Verified
                  </span>
                ) : (
                  <span className="ml-2 text-orange-600 text-sm">
                    ⚠️ Unverified
                  </span>
                )}
              </p>
            )}
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push("/pre-order/pre-order-cart")}
              className="bg-gradient-to-br from-[#dda15e] to-[#bc6c25] text-[#fefae0] font-bold py-3 px-8 rounded-md hover:opacity-90 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              Lihat Pre-Order
            </button>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-xl p-6 max-w-xl mx-auto space-y-6"
        >
          {message && (
            <div
              className={`text-center p-3 rounded-lg ${
                message.includes("✅")
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : message.includes("Gagal") || message.includes("error")
                  ? "bg-red-100 text-red-700 border border-red-200"
                  : "bg-blue-100 text-blue-700 border border-blue-200"
              }`}
            >
              <p className="font-semibold">{message}</p>
            </div>
          )}

          {/* Nama */}
          <div>
            <label className="block text-[#606c38] font-semibold mb-2">
              Nama Lengkap *
            </label>
            <input
              type="text"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              placeholder="Masukkan nama Anda"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#dda15e] focus:border-transparent outline-none transition-all duration-200"
              required
              disabled={loading}
            />
          </div>

          {/* Produk */}
          <div>
            <label className="block text-[#606c38] font-semibold mb-2">
              Pilih Produk *
            </label>
            <select
              value={produk}
              onChange={(e) => setProduk(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#dda15e] focus:border-transparent outline-none transition-all duration-200"
              required
              disabled={loading}
            >
              <option value="">-- Pilih Produk --</option>
              <option value="sushi">
                Sushi 1 Kotak isi 5 (Rp{" "}
                {productPrices.sushi.toLocaleString("id-ID")})
              </option>
              <option value="jasuke">
                Jasuke (Rp {productPrices.jasuke.toLocaleString("id-ID")})
              </option>
              <option value="milo">
                Es Milo (Rp {productPrices.milo.toLocaleString("id-ID")})
              </option>
            </select>
          </div>

          {/* Jumlah */}
          <div>
            <label className="block text-[#606c38] font-semibold mb-2">
              Jumlah *
            </label>
            <input
              type="number"
              min="1"
              max="100"
              value={jumlah}
              onChange={(e) => setJumlah(e.target.value)}
              placeholder="Masukkan jumlah"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#dda15e] focus:border-transparent outline-none transition-all duration-200"
              required
              disabled={loading}
            />
            {produk && jumlah && (
              <p className="text-sm text-[#606c38] mt-1">
                Total: Rp{" "}
                {(
                  productPrices[produk] * parseInt(jumlah || "0")
                ).toLocaleString("id-ID")}
              </p>
            )}
          </div>

          {/* Kontak */}
          <div>
            <label className="block text-[#606c38] font-semibold mb-2">
              Media Sosial / Kontak *
              <span className="text-sm font-normal text-gray-600">
                {" "}
                (Untuk konfirmasi ulang)
              </span>
            </label>
            <input
              type="text"
              value={kontak}
              onChange={(e) => setKontak(e.target.value)}
              placeholder="Contoh: WhatsApp 0812xxxx, IG: @username"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#dda15e] focus:border-transparent outline-none transition-all duration-200"
              required
              disabled={loading}
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
              placeholder="Tulis catatan tambahan jika ada..."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-[#dda15e] focus:border-transparent outline-none transition-all duration-200 resize-none"
              disabled={loading}
            ></textarea>
          </div>

          {/* Submit */}
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={loading || !isAuthenticated}
              className="bg-gradient-to-br from-[#dda15e] to-[#bc6c25] text-[#fefae0] font-bold py-3 px-8 rounded-full hover:opacity-90 hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Mengirim...
                </span>
              ) : (
                "Kirim Pre-Order"
              )}
            </button>
          </div>
        </form>

        {/* Footer info */}
        <div className="text-center mt-8 text-sm text-[#606c38] space-y-1 pb-20">
          <p>
            Session aktif sebagai:{" "}
            <span className="font-semibold">{user?.email}</span>
          </p>
          {user?.isVerified ? (
            <p className="text-green-600">✅ Email sudah terverifikasi</p>
          ) : (
            <p className="text-orange-600">
              ⚠️ Email belum terverifikasi -{" "}
              <a href="/auth/verify-email" className="underline">
                Verifikasi sekarang
              </a>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PreOrderForm;
