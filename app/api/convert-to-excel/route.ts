import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { sanitizeString } from "../../../lib/sanitize";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

// Helper function untuk mendapatkan user dari token
const getUserFromToken = (request: NextRequest) => {
  try {
    const token = request.cookies.get("auth-token")?.value;
    if (!token) return null;

    const sanitizedToken = sanitizeString(token);
    const decoded = jwt.verify(sanitizedToken, JWT_SECRET) as any;
    return decoded;
  } catch (error) {
    return null;
  }
};

// GET - Ambil semua pre-order untuk export to Excel
export async function GET(request: NextRequest) {
  let client;

  try {
    const user = getUserFromToken(request);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Pastikan hanya admin yang bisa export
    // Jika perlu, tambahkan pengecekan role di sini
    // if (user.role !== 'admin') {
    //   return NextResponse.json(
    //     { success: false, message: "Access denied. Admin only." },
    //     { status: 403 }
    //   );
    // }

    // Connect to database
    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;

    // Ambil SEMUA pre-orders (tanpa pagination) untuk export
    const rawOrders = await db
      .collection("preorders")
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    const formattedOrders = rawOrders.map((order) => ({
      id: order._id.toString(),
      userId: order.userId,
      contact: order.contact,
      productName: order.productName,
      customerName: order.customerName,
      quantity: order.quantity,
      price: order.price,
      totalPrice: order.totalPrice,
      notes: order.notes || "",
      status: order.status,
      createdAt: order.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      message: "Pre-orders retrieved for export",
    });
  } catch (error) {
    console.error("Export pre-orders error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
