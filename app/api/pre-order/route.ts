import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "../../../lib/mongodb";
import { sanitizeString } from "../../../lib/sanitize";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key";

type PreOrder = {
  id: string;
  userId: string;
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
      productName: order.productName,
      productImage: order.productImage,
      quantity: order.quantity,
      price: order.price,
      totalPrice: order.totalPrice,
      status: order.status,
      orderDate: order.orderDate,
      estimatedDelivery: order.estimatedDelivery,
      notes: order.notes,
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
    const { productName, productImage, quantity, price, notes } = body;

    if (!productName || !quantity || !price) {
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
      productName: sanitizeString(productName),
      productImage: sanitizeString(
        productImage || "/images/default-product.jpg"
      ),
      quantity: parseInt(quantity),
      price: parseFloat(price),
      totalPrice: parseInt(quantity) * parseFloat(price),
      status: "pending",
      orderDate: new Date().toISOString().split("T")[0],
      estimatedDelivery: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split("T")[0],
      notes: notes ? sanitizeString(notes) : "",
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
    const result = await db.collection("preorders").findOneAndUpdate(
      {
        _id: new ObjectId(orderId),
        userId: user.userId,
      },
      {
        $set: {
          status: "cancelled",
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { success: false, message: "Pre-order not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Pre-order cancelled successfully",
      data: {
        id: result._id.toString(),
        ...result,
      },
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
