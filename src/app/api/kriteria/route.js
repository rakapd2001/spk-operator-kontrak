import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ======================================================
// GET /api/kriteria
// ======================================================
export async function GET() {
  try {
    const kriteria = await prisma.Kriteria.findMany({
      orderBy: {
        IdKriteria: "asc",
      },
      include: {
        KriteriaDetail: {
          orderBy: {
            Nilai: "asc",
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message:
        kriteria.length === 0
          ? "Data kriteria belum tersedia."
          : "Data kriteria berhasil diambil.",
      data: kriteria,
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
      { status: 500 },
    );
  }
}

// ======================================================
// POST /api/kriteria
// ======================================================
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
        { status: 400 },
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
        { status: 409 },
      );
    }

    const kriteria = await prisma.Kriteria.create({
      data: {
        KodeKriteria: kode,
        NamaKriteria: nama,
        Jenis,
        Deskripsi: Deskripsi?.trim() || null,
      },
      include: {
        KriteriaDetail: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Kriteria berhasil ditambahkan.",
        data: kriteria,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST KRITERIA ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan kriteria.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
