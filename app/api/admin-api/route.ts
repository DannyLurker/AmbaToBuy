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

    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 10;
    const skip = (page - 1) * limit;

    const rawOrders = await db
      .collection("preorders")
      .find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 1 })
      .toArray();

    const formattedOrders = rawOrders.map((order) => ({
      id: order._id.toString(),
      userId: order.userId,
      contact: order.contact,
      productName: order.productName,
      quantity: order.quantity,
      price: order.price,
      totalPrice: order.totalPrice,
      notes: order.notes || "",
      status: order.status,
      createdAt: order.createdAt,
    }));

    const totalCount = await db.collection("preorders").countDocuments();

    return NextResponse.json({
      success: true,
      data: formattedOrders,
      totalCount,
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

//PATCH
export async function PATCH(request: NextRequest) {
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
    const { status, userId } = body;

    // Connect to database
    const { client: dbClient, db } = await connectToDatabase();
    client = dbClient;

    const result = await db
      .collection("preorders")
      .updateOne({ userId }, { $set: { status } }, { upsert: false });

    const responseData = {
      matchedCount: result.matchedCount,
      modifiedCount: result.modifiedCount,
      upsertedId: result.upsertedId ? result.upsertedId.toString() : null,
    };

    return NextResponse.json({
      success: true,
      data: responseData,
      message: "Pre-order updated successfully",
    });
  } catch (error) {
    console.error("Update pre-order error:", error);
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
