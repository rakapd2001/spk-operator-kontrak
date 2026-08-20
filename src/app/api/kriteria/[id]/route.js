import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ======================================================
// GET /api/kriteria/:id
// ======================================================
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const IdKriteria = Number(id);

    if (!IdKriteria || Number.isNaN(IdKriteria)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID kriteria tidak valid.",
        },
        { status: 400 },
      );
    }

    const kriteria = await prisma.Kriteria.findUnique({
      where: {
        IdKriteria,
      },
      include: {
        KriteriaDetail: {
          orderBy: {
            Nilai: "asc",
          },
        },
      },
    });

    if (!kriteria) {
      return NextResponse.json(
        {
          success: false,
          message: "Kriteria tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: kriteria,
    });
  } catch (error) {
    console.error("GET KRITERIA DETAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil kriteria.",
      },
      { status: 500 },
    );
  }
}

// ======================================================
// PUT /api/kriteria/:id
// ======================================================
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const IdKriteria = Number(id);

    if (!IdKriteria || Number.isNaN(IdKriteria)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID kriteria tidak valid.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const { KodeKriteria, NamaKriteria, Jenis, Deskripsi } = body;

    if (!KodeKriteria?.trim() || !NamaKriteria?.trim() || !Jenis) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode, nama kriteria, dan jenis wajib diisi.",
        },
        { status: 400 },
      );
    }

    const existing = await prisma.Kriteria.findFirst({
      where: {
        KodeKriteria: KodeKriteria.trim().toUpperCase(),
        NOT: {
          IdKriteria,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode kriteria sudah digunakan.",
        },
        { status: 409 },
      );
    }

    const kriteria = await prisma.Kriteria.update({
      where: {
        IdKriteria,
      },
      data: {
        KodeKriteria: KodeKriteria.trim().toUpperCase(),
        NamaKriteria: NamaKriteria.trim(),
        Jenis,
        Deskripsi: Deskripsi?.trim() || null,
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
      message: "Kriteria berhasil diperbarui.",
      data: kriteria,
    });
  } catch (error) {
    console.error("PUT KRITERIA ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui kriteria.",
      },
      { status: 500 },
    );
  }
}

// ======================================================
// DELETE /api/kriteria/:id
// ======================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const IdKriteria = Number(id);

    if (!IdKriteria || Number.isNaN(IdKriteria)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID kriteria tidak valid.",
        },
        { status: 400 },
      );
    }

    const kriteria = await prisma.Kriteria.findUnique({
      where: {
        IdKriteria,
      },
      include: {
        KriteriaDetail: true,
      },
    });

    if (!kriteria) {
      return NextResponse.json(
        {
          success: false,
          message: "Kriteria tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    await prisma.Kriteria.delete({
      where: {
        IdKriteria,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Kriteria ${kriteria.KodeKriteria} berhasil dihapus.`,
    });
  } catch (error) {
    console.error("DELETE KRITERIA ERROR:", error);

    if (error?.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Kriteria tidak dapat dihapus karena sudah digunakan pada data penilaian.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus kriteria.",
      },
      { status: 500 },
    );
  }
}
