import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { sanitizeString } from "../../../lib/sanitize";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

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

// GET - Ambil semua pre-order user
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

    // Connect to database
    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;

    // Find pre-orders by user ID
    const preOrders = await db
      .collection("preorders")
      .find({ userId: user.userId })
      .sort({ createdAt: -1 })
      .toArray();

    const formattedOrders = preOrders.map((order) => ({
      id: order._id.toString(),
      userId: order.userId,
      contact: order.contact,
      productName: order.productName,
      quantity: order.quantity,
      price: order.price,
      totalPrice: order.totalPrice,
      orderDate: order.orderDate,
      notes: order.notes,
      status: order.status,
      createdAt: order.createdAt,
    }));

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      message: "Pre-orders retrieved successfully",
    });
  } catch (error) {
    console.error("Get pre-orders error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}

// POST - Buat pre-order baru
export async function POST(request: NextRequest) {
  let client;

  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { productName, quantity, price, notes, contact } = body;

    const parseQuality = parseInt(quantity);

    if (!productName || !parseQuality || !price) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Connect to database
    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;

    const newPreOrder = {
      userId: user.userId,
      contact: contact,
      productName: sanitizeString(productName),
      quantity: parseQuality,
      price: parseFloat(price),
      totalPrice: parseQuality * parseFloat(price),
      orderDate: new Date().toISOString().split("T")[0],
      notes: notes ? sanitizeString(notes) : "",
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("preorders").insertOne(newPreOrder);

    const responseData = {
      id: result.insertedId.toString(),
      ...newPreOrder,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Pre-order created successfully",
    });
  } catch (error) {
    console.error("Create pre-order error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}

// DELETE - Cancel pre-order
export async function DELETE(request: NextRequest) {
  let client;

  try {
    const user = getUserFromToken(request);
    if (!user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json(
        { success: false, message: "Order ID is required" },
        { status: 400 }
      );
    }

    // Connect to database
    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;

    // Find and update the pre-order
    const result = await db.collection("preorders").deleteOne({
      _id: new ObjectId(orderId),
      userId: user.userId,
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { success: false, message: "Pre-order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pre-order cancelled (deleted) successfully",
    });
  } catch (error) {
    console.error("Cancel pre-order error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (client) await client.close();
  }
}
