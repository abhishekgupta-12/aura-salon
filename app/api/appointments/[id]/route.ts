import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const appointmentSchema = z.object({
  customerId: z.string().min(1).optional(),
  staffId: z.string().min(1).optional(),
  serviceIds: z.array(z.string()).optional(),
  startTime: z.string().min(1).optional(),
  endTime: z.string().min(1).optional(),
  notes: z.string().optional(),
  status: z.enum(["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]).optional(),
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
    const validatedData = appointmentSchema.parse(body);

    const updateData: any = { ...validatedData };
    
    if (validatedData.startTime) {
      updateData.startTime = new Date(validatedData.startTime);
    }
    
    if (validatedData.endTime) {
      updateData.endTime = new Date(validatedData.endTime);
    }

    if (validatedData.startTime && validatedData.endTime && validatedData.staffId) {
      // Check time conflicts if time or staff changed
       const existingAppointments = await db.appointment.findMany({
        where: {
          salonId,
          staffId: validatedData.staffId,
          id: { not: params.id },
          status: { notIn: ["CANCELLED"] },
          OR: [
            {
              startTime: { lt: updateData.endTime },
              endTime: { gt: updateData.startTime }
            }
          ]
        }
      });

      if (existingAppointments.length > 0) {
        return new NextResponse("Time conflict detected for the selected staff member", { status: 409 });
      }
    }

    const appointment = await db.appointment.update({
      where: {
        id: params.id,
        salonId,
      },
      data: updateData,
      include: {
        customer: true,
        staff: true,
      }
    });

    return NextResponse.json(appointment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[APPOINTMENT_PUT]", error);
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

    const appointment = await db.appointment.delete({
      where: {
        id: params.id,
        salonId,
      },
    });

    return NextResponse.json(appointment);
  } catch (error) {
    console.error("[APPOINTMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
