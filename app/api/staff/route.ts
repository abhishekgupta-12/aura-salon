import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const staffSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10),
  specialization: z.string().optional(),
  image: z.string().optional(),
  role: z.string().default("STAFF"),
  serviceIds: z.array(z.string()).default([]),
  workingDays: z.array(z.string()).default([]),
  availableSlots: z.array(z.string()).default([]),
  isActive: z.boolean().default(true),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    const salonId = (session?.user as any)?.salonId;

    if (!session || !salonId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const staff = await db.staff.findMany({
      where: { salonId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[STAFF_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();
    const salonId = (session?.user as any)?.salonId;

    if (!session || !salonId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = staffSchema.parse(body);

    const staff = await db.staff.create({
      data: {
        ...validatedData,
        email: validatedData.email || null,
        salonId,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[STAFF_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
