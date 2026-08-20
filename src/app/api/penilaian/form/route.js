import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const [operators, supervisors, kriterias] = await Promise.all([
      prisma.Operator.findMany({
        where: {
          StatusOperator: {
            not: "Tidak Aktif",
          },
        },
        select: {
          IdOperator: true,
          NIK: true,
          NamaOperator: true,
          Bagian: true,
        },
        orderBy: {
          NamaOperator: "asc",
        },
      }),

      prisma.Users.findMany({
        where: {
          StatusAktif: true,
        },
        select: {
          IdUser: true,
          NamaLengkap: true,
          Username: true,
        },
        orderBy: {
          NamaLengkap: "asc",
        },
      }),

      prisma.Kriteria.findMany({
        select: {
          IdKriteria: true,
          KodeKriteria: true,
          NamaKriteria: true,
          Jenis: true,
          Deskripsi: true,
          KriteriaDetail: {
            select: {
              IdKriteriaDetail: true,
              Nilai: true,
              NamaDetail: true,
              Keterangan: true,
            },
            orderBy: {
              Nilai: "asc",
            },
          },
        },
        orderBy: {
          IdKriteria: "asc",
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        operators,
        supervisors,
        kriterias,
      },
    });
  } catch (error) {
    console.error("GET FORM PENILAIAN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data form penilaian.",
        data: {
          operators: [],
          supervisors: [],
          kriterias: [],
        },
      },
      { status: 500 },
    );
  }
}
