import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ======================================================
// GET /api/kriteria
// ======================================================

export async function GET() {
  try {
    const [kriteria, details] = await Promise.all([
      prisma.Kriteria.findMany({
        orderBy: {
          IdKriteria: "asc",
        },
      }),

      prisma.KriteriaDetail.findMany({
        orderBy: [
          {
            IdKriteria: "asc",
          },
          {
            Nilai: "asc",
          },
        ],
      }),
    ]);

    const data = kriteria.map((item) => ({
      ...item,

      KriteriaDetail: details.filter(
        (detail) => detail.IdKriteria === item.IdKriteria,
      ),
    }));

    return NextResponse.json({
      success: true,

      message:
        data.length === 0
          ? "Data kriteria belum tersedia."
          : "Data kriteria berhasil diambil.",

      data,
    });
  } catch (error) {
    console.error("GET KRITERIA ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data kriteria.",
        data: [],

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
      },
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();

    const { KodeKriteria, NamaKriteria, Jenis, Deskripsi } = body;

    if (!KodeKriteria?.trim() || !NamaKriteria?.trim() || !Jenis) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode, nama kriteria, dan jenis kriteria wajib diisi.",
        },
        {
          status: 400,
        },
      );
    }

    const kode = KodeKriteria.trim().toUpperCase();

    const nama = NamaKriteria.trim();

    const existing = await prisma.Kriteria.findFirst({
      where: {
        KodeKriteria: kode,
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Kode kriteria ${kode} sudah digunakan.`,
        },
        {
          status: 409,
        },
      );
    }

    const kriteria = await prisma.Kriteria.create({
      data: {
        KodeKriteria: kode,

        NamaKriteria: nama,

        Jenis,

        Deskripsi: Deskripsi?.trim() || null,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Kriteria berhasil ditambahkan.",

        data: {
          ...kriteria,
          KriteriaDetail: [],
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST KRITERIA ERROR:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "Kode kriteria sudah digunakan.",
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan kriteria.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
