import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const appointmentSchema = z.object({
  customerId: z.string().min(1),
  staffId: z.string().min(1),
  serviceIds: z.array(z.string()).default([]),
  startTime: z.string().min(1),
  endTime: z.string().min(1),
  notes: z.string().optional(),
  status: z.enum(["SCHEDULED", "CONFIRMED", "IN_PROGRESS", "COMPLETED", "CANCELLED", "NO_SHOW"]).default("SCHEDULED"),
});

export async function GET(req: Request) {
  try {
    const session = await auth();
    const salonId = (session?.user as any)?.salonId;

    if (!session || !salonId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const dateStr = searchParams.get("date");
    
    let dateFilter = {};
    if (dateStr) {
      const startOfDay = new Date(dateStr);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(dateStr);
      endOfDay.setHours(23, 59, 59, 999);
      
      dateFilter = {
        startTime: {
          gte: startOfDay,
          lte: endOfDay,
        }
      };
    }

    const appointments = await db.appointment.findMany({
      where: { 
        salonId,
        ...dateFilter
      },
      include: {
        customer: true,
        staff: true,
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    console.error("[APPOINTMENTS_GET]", error);
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
    const validatedData = appointmentSchema.parse(body);

    const startTime = new Date(validatedData.startTime);
    const endTime = new Date(validatedData.endTime);

    // Basic time conflict prevention for staff bookings
    const existingAppointments = await db.appointment.findMany({
      where: {
        salonId,
        staffId: validatedData.staffId,
        status: { notIn: ["CANCELLED"] },
        OR: [
          {
            startTime: { lt: endTime },
            endTime: { gt: startTime }
          }
        ]
      }
    });

    if (existingAppointments.length > 0) {
      return new NextResponse("Time conflict detected for the selected staff member", { status: 409 });
    }

    const appointment = await db.appointment.create({
      data: {
        ...validatedData,
        startTime,
        endTime,
        salonId,
      },
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
    console.error("[APPOINTMENTS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
