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

export async function GET(req: Request) {
  try {
    const session = await auth();
    const salonId = (session?.user as any)?.salonId;

    if (!session || !salonId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const services = await db.service.findMany({
      where: { salonId },
      include: { category: true },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(services);
  } catch (error) {
    console.error("[SERVICES_GET]", error);
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
    const validatedData = serviceSchema.parse(body);

    const service = await db.service.create({
      data: {
        ...validatedData,
        salonId,
      },
      include: { category: true }
    });

    return NextResponse.json(service);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[SERVICES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
