import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const roles = await prisma.Role.findMany({
      select: {
        IdRole: true,
        NamaRole: true,
      },
      orderBy: {
        IdRole: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("GET ROLES ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data role.",
      },
      { status: 500 },
    );
  }
}
