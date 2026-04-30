import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const customerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(10),
  gender: z.string().optional(),
  birthday: z.string().optional(),
  notes: z.string().optional(),
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
    const validatedData = customerSchema.parse(body);

    const customer = await db.customer.update({
      where: {
        id: params.id,
        salonId, // Ensure the customer belongs to this salon
      },
      data: {
        ...validatedData,
        email: validatedData.email || null,
        birthday: validatedData.birthday ? new Date(validatedData.birthday) : null,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[CUSTOMER_PUT]", error);
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

    const customer = await db.customer.delete({
      where: {
        id: params.id,
        salonId,
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("[CUSTOMER_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
