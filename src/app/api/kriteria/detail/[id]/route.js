import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ======================================================
// PUT
// ======================================================
export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const IdKriteriaDetail = Number(id);

    if (!IdKriteriaDetail || Number.isNaN(IdKriteriaDetail)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID detail tidak valid.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const { Nilai, NamaDetail, Keterangan } = body;

    const nilai = Number(Nilai);

    if (!Number.isInteger(nilai) || nilai < 1 || nilai > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Nilai harus berupa angka 1 sampai 5.",
        },
        { status: 400 },
      );
    }

    if (!NamaDetail?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama detail wajib diisi.",
        },
        { status: 400 },
      );
    }

    const detail = await prisma.KriteriaDetail.findUnique({
      where: {
        IdKriteriaDetail,
      },
    });

    if (!detail) {
      return NextResponse.json(
        {
          success: false,
          message: "Detail kriteria tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const existing = await prisma.KriteriaDetail.findFirst({
      where: {
        IdKriteria: detail.IdKriteria,
        Nilai: nilai,
        NOT: {
          IdKriteriaDetail,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        {
          success: false,
          message: `Nilai ${nilai} sudah digunakan.`,
        },
        { status: 409 },
      );
    }

    const updated = await prisma.KriteriaDetail.update({
      where: {
        IdKriteriaDetail,
      },
      data: {
        Nilai: nilai,
        NamaDetail: NamaDetail.trim(),
        Keterangan: Keterangan?.trim() || null,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Detail kriteria berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("PUT DETAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui detail kriteria.",
      },
      { status: 500 },
    );
  }
}

// ======================================================
// DELETE
// ======================================================
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const IdKriteriaDetail = Number(id);

    if (!IdKriteriaDetail || Number.isNaN(IdKriteriaDetail)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID detail tidak valid.",
        },
        { status: 400 },
      );
    }

    const detail = await prisma.KriteriaDetail.findUnique({
      where: {
        IdKriteriaDetail,
      },
    });

    if (!detail) {
      return NextResponse.json(
        {
          success: false,
          message: "Detail kriteria tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    await prisma.KriteriaDetail.delete({
      where: {
        IdKriteriaDetail,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Detail kriteria berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE DETAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus detail kriteria.",
      },
      { status: 500 },
    );
  }
}
