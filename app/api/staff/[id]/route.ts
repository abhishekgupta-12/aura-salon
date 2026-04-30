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

export async function PUT(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    const salonId = (session?.user as any)?.salonId;

    if (!session || !salonId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = staffSchema.parse(body);

    const staff = await db.staff.update({
      where: {
        id: params.id,
        salonId,
      },
      data: {
        ...validatedData,
        email: validatedData.email || null,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[STAFF_PUT]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params;
    const session = await auth();
    const salonId = (session?.user as any)?.salonId;

    if (!session || !salonId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const staff = await db.staff.delete({
      where: {
        id: params.id,
        salonId,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[STAFF_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
