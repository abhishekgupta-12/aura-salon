import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, password, salonName } = body;

    if (!name || !email || !password || !salonName) {
      return NextResponse.json(
        { message: "All fields are required" },
        { status: 400 }
      );
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    // Create salon first
    const slug = salonName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const salon = await db.salon.create({
      data: {
        name: salonName,
        slug: `${slug}-${Date.now().toString(36)}`,
        email,
        phone,
      },
    });

    // Create owner user
    const user = await db.user.create({
      data: {
        name,
        email,
        phone,
        hashedPassword,
        role: "OWNER",
        salonId: salon.id,
      },
    });

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
