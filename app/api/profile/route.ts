import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { auth } from "@/auth";
import { ObjectId } from "mongodb";

export async function PATCH(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();

    // Only allow safe fields to be updated
    const allowed = [
      "fullName",
      "username",
      "phone",
      "dateOfBirth",
      "country",
    ];

    const updates: Record<string, string> = {};

    for (const key of allowed) {
      if (body[key] !== undefined && body[key] !== "") {
        updates[key] = body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();

    // ✅ FIXED ObjectId usage
    await db.collection("users").updateOne(
      { _id: new ObjectId(userId) },
      {
        $set: {
          ...updates,
          updatedAt: new Date(),
        },
      }
    );

    const user = await db.collection("users").findOne(
      { _id: new ObjectId(userId) },
      { projection: { password: 0 } }
    );

    return NextResponse.json({
      success: true,
      user,
    });
  } catch (err) {
    console.error("profile update error:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}