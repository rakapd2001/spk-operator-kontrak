import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ======================================================
// GET DETAIL KRITERIA
// GET /api/kriteria/detail
// GET /api/kriteria/detail?IdKriteria=1
// ======================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const idParam = searchParams.get("IdKriteria");

    const where = {};

    if (idParam) {
      const IdKriteria = Number(idParam);

      if (!Number.isInteger(IdKriteria) || IdKriteria <= 0) {
        return NextResponse.json(
          {
            success: false,
            message: "IdKriteria tidak valid.",
            data: [],
          },
          { status: 400 },
        );
      }

      where.IdKriteria = IdKriteria;
    }

    const details = await prisma.KriteriaDetail.findMany({
      where,
      orderBy: [
        {
          IdKriteria: "asc",
        },
        {
          Nilai: "asc",
        },
      ],
      select: {
        IdKriteriaDetail: true,
        IdKriteria: true,
        Nilai: true,
        KodeDetail: true,
        NamaDetail: true,
        Keterangan: true,
      },
    });

    return NextResponse.json({
      success: true,
      message:
        details.length > 0
          ? "Data detail kriteria berhasil diambil."
          : "Belum terdapat detail untuk kriteria ini.",
      data: details,
    });
  } catch (error) {
    console.error("GET KRITERIA DETAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data detail kriteria.",
        data: [],
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// ======================================================
// POST DETAIL KRITERIA
// ======================================================
export async function POST(request) {
  try {
    const body = await request.json();

    const { IdKriteria, Nilai, KodeDetail, NamaDetail, Keterangan } = body;

    const kriteriaId = Number(IdKriteria);
    const nilai = Number(Nilai);

    // -------------------------
    // Validasi Kriteria
    // -------------------------
    if (!Number.isInteger(kriteriaId) || kriteriaId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Kriteria wajib dipilih.",
        },
        { status: 400 },
      );
    }

    // -------------------------
    // Validasi nilai
    // -------------------------
    if (!Number.isInteger(nilai) || nilai < 1 || nilai > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Nilai harus berupa angka 1 sampai 5.",
        },
        { status: 400 },
      );
    }

    // -------------------------
    // Validasi kode
    // -------------------------
    if (!KodeDetail?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode detail wajib diisi.",
        },
        { status: 400 },
      );
    }

    // -------------------------
    // Validasi nama
    // -------------------------
    if (!NamaDetail?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama detail wajib diisi.",
        },
        { status: 400 },
      );
    }

    // -------------------------
    // Cek kriteria
    // -------------------------
    const kriteria = await prisma.Kriteria.findUnique({
      where: {
        IdKriteria: kriteriaId,
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

    // -------------------------
    // Cek nilai duplikat
    // -------------------------
    const existingNilai = await prisma.KriteriaDetail.findFirst({
      where: {
        IdKriteria: kriteriaId,
        Nilai: nilai,
      },
    });

    if (existingNilai) {
      return NextResponse.json(
        {
          success: false,
          message: `Nilai ${nilai} sudah tersedia pada kriteria ini.`,
        },
        { status: 409 },
      );
    }

    // -------------------------
    // Cek kode duplikat
    // -------------------------
    const existingKode = await prisma.KriteriaDetail.findFirst({
      where: {
        KodeDetail: KodeDetail.trim(),
      },
    });

    if (existingKode) {
      return NextResponse.json(
        {
          success: false,
          message: `Kode detail "${KodeDetail}" sudah digunakan.`,
        },
        { status: 409 },
      );
    }

    // -------------------------
    // CREATE
    // -------------------------
    const detail = await prisma.KriteriaDetail.create({
      data: {
        IdKriteria: kriteriaId,
        Nilai: nilai,
        KodeDetail: KodeDetail.trim(),
        NamaDetail: NamaDetail.trim(),
        Keterangan: Keterangan?.trim() || null,
      },
      select: {
        IdKriteriaDetail: true,
        IdKriteria: true,
        Nilai: true,
        KodeDetail: true,
        NamaDetail: true,
        Keterangan: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Detail kriteria berhasil ditambahkan.",
        data: detail,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST KRITERIA DETAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan detail kriteria.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// ======================================================
// PUT DETAIL KRITERIA
// PUT /api/kriteria/detail?id=1
// ======================================================
export async function PUT(request) {
  try {
    const { searchParams } = new URL(request.url);

    const idParam = searchParams.get("id");
    const IdKriteriaDetail = Number(idParam);

    if (!Number.isInteger(IdKriteriaDetail) || IdKriteriaDetail <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID detail kriteria tidak valid.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const { IdKriteria, Nilai, KodeDetail, NamaDetail, Keterangan } = body;

    const kriteriaId = Number(IdKriteria);
    const nilai = Number(Nilai);

    if (!Number.isInteger(kriteriaId) || kriteriaId <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Kriteria wajib dipilih.",
        },
        { status: 400 },
      );
    }

    if (!Number.isInteger(nilai) || nilai < 1 || nilai > 5) {
      return NextResponse.json(
        {
          success: false,
          message: "Nilai harus berupa angka 1 sampai 5.",
        },
        { status: 400 },
      );
    }

    if (!KodeDetail?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Kode detail wajib diisi.",
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

    // -------------------------
    // Cek data lama
    // -------------------------
    const existingDetail = await prisma.KriteriaDetail.findUnique({
      where: {
        IdKriteriaDetail,
      },
    });

    if (!existingDetail) {
      return NextResponse.json(
        {
          success: false,
          message: "Detail kriteria tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    // -------------------------
    // Cek kriteria
    // -------------------------
    const kriteria = await prisma.Kriteria.findUnique({
      where: {
        IdKriteria: kriteriaId,
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

    // -------------------------
    // Cek nilai duplikat
    // -------------------------
    const duplicateNilai = await prisma.KriteriaDetail.findFirst({
      where: {
        IdKriteria: kriteriaId,
        Nilai: nilai,
        NOT: {
          IdKriteriaDetail,
        },
      },
    });

    if (duplicateNilai) {
      return NextResponse.json(
        {
          success: false,
          message: `Nilai ${nilai} sudah digunakan pada kriteria ini.`,
        },
        { status: 409 },
      );
    }

    // -------------------------
    // Cek kode duplikat
    // -------------------------
    const duplicateKode = await prisma.KriteriaDetail.findFirst({
      where: {
        KodeDetail: KodeDetail.trim(),
        NOT: {
          IdKriteriaDetail,
        },
      },
    });

    if (duplicateKode) {
      return NextResponse.json(
        {
          success: false,
          message: `Kode detail "${KodeDetail}" sudah digunakan.`,
        },
        { status: 409 },
      );
    }

    // -------------------------
    // UPDATE
    // -------------------------
    const detail = await prisma.KriteriaDetail.update({
      where: {
        IdKriteriaDetail,
      },
      data: {
        IdKriteria: kriteriaId,
        Nilai: nilai,
        KodeDetail: KodeDetail.trim(),
        NamaDetail: NamaDetail.trim(),
        Keterangan: Keterangan?.trim() || null,
      },
      select: {
        IdKriteriaDetail: true,
        IdKriteria: true,
        Nilai: true,
        KodeDetail: true,
        NamaDetail: true,
        Keterangan: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Detail kriteria berhasil diperbarui.",
      data: detail,
    });
  } catch (error) {
    console.error("PUT KRITERIA DETAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui detail kriteria.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

// ======================================================
// DELETE DETAIL KRITERIA
// DELETE /api/kriteria/detail?id=1
// ======================================================
export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);

    const idParam = searchParams.get("id");
    const IdKriteriaDetail = Number(idParam);

    if (!Number.isInteger(IdKriteriaDetail) || IdKriteriaDetail <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: "ID detail kriteria tidak valid.",
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
    console.error("DELETE KRITERIA DETAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus detail kriteria.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
