import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    const salonId = (session?.user as any)?.salonId;

    if (!session || !salonId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = categorySchema.parse(body);

    const category = await db.category.create({
      data: {
        name,
        salonId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[CATEGORY_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
