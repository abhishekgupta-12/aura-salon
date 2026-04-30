import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const serviceSchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().min(0),
  duration: z.number().min(1),
  image: z.string().optional(),
  categoryId: z.string().min(1),
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
    const validatedData = serviceSchema.parse(body);

    const service = await db.service.update({
      where: {
        id: params.id,
        salonId,
      },
      data: validatedData,
      include: { category: true }
    });

    return NextResponse.json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[SERVICE_PUT]", error);
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

    const service = await db.service.delete({
      where: {
        id: params.id,
        salonId,
      },
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("[SERVICE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
