import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Menghitung lama bekerja dalam bulan.
 */
function calculateLamaBekerja(tanggalMasuk) {
  if (!tanggalMasuk) {
    return null;
  }

  const masuk = new Date(tanggalMasuk);
  const sekarang = new Date();

  if (Number.isNaN(masuk.getTime())) {
    return null;
  }

  let bulan =
    (sekarang.getFullYear() - masuk.getFullYear()) * 12 +
    (sekarang.getMonth() - masuk.getMonth());

  if (sekarang.getDate() < masuk.getDate()) {
    bulan--;
  }

  return Math.max(0, bulan);
}

function isValidDate(value) {
  if (!value) {
    return false;
  }

  const date = new Date(value);

  return !Number.isNaN(date.getTime());
}

/**
 * GET /api/operators/[id]
 */
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const IdOperator = Number(id);

    if (!Number.isInteger(IdOperator)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID operator tidak valid.",
        },
        { status: 400 },
      );
    }

    const operator = await prisma.Operator.findUnique({
      where: {
        IdOperator,
      },
    });

    if (!operator) {
      return NextResponse.json(
        {
          success: false,
          message: "Data operator tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        ...operator,
        LamaBekerja: calculateLamaBekerja(operator.TanggalMasuk),
      },
    });
  } catch (error) {
    console.error("GET OPERATOR DETAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data operator.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * PUT /api/operators/[id]
 */
export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    const IdOperator = Number(id);

    if (!Number.isInteger(IdOperator)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID operator tidak valid.",
        },
        { status: 400 },
      );
    }

    const body = await request.json();

    const {
      NIK,
      NamaOperator,
      JenisKelamin,
      Bagian,
      TanggalMasuk,
      TanggalKontrakMulai,
      TanggalKontrakSelesai,
      StatusOperator,
    } = body;

    // ==========================================
    // VALIDASI
    // ==========================================

    if (!NIK?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (!NamaOperator?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama operator wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (TanggalMasuk && !isValidDate(TanggalMasuk)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format tanggal masuk tidak valid.",
        },
        { status: 400 },
      );
    }

    if (TanggalKontrakMulai && !isValidDate(TanggalKontrakMulai)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format tanggal kontrak mulai tidak valid.",
        },
        { status: 400 },
      );
    }

    if (TanggalKontrakSelesai && !isValidDate(TanggalKontrakSelesai)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format tanggal kontrak selesai tidak valid.",
        },
        { status: 400 },
      );
    }

    // ==========================================
    // VALIDASI PERIODE KONTRAK
    // ==========================================

    if (TanggalKontrakMulai && TanggalKontrakSelesai) {
      const mulai = new Date(TanggalKontrakMulai);

      const selesai = new Date(TanggalKontrakSelesai);

      if (selesai < mulai) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Tanggal kontrak selesai tidak boleh lebih awal dari tanggal kontrak mulai.",
          },
          { status: 400 },
        );
      }
    }

    // ==========================================
    // VALIDASI TANGGAL MASUK
    // ==========================================

    if (TanggalMasuk && TanggalKontrakMulai) {
      const masuk = new Date(TanggalMasuk);

      const mulai = new Date(TanggalKontrakMulai);

      if (mulai < masuk) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Tanggal kontrak mulai tidak boleh lebih awal dari tanggal masuk.",
          },
          { status: 400 },
        );
      }
    }

    // ==========================================
    // CEK OPERATOR
    // ==========================================

    const existingOperator = await prisma.Operator.findUnique({
      where: {
        IdOperator,
      },
    });

    if (!existingOperator) {
      return NextResponse.json(
        {
          success: false,
          message: "Data operator tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    // ==========================================
    // CEK NIK MILIK OPERATOR LAIN
    // ==========================================

    const existingNIK = await prisma.Operator.findFirst({
      where: {
        NIK: NIK.trim(),
        NOT: {
          IdOperator,
        },
      },
    });

    if (existingNIK) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK sudah digunakan oleh operator lain.",
        },
        { status: 409 },
      );
    }

    // ==========================================
    // HITUNG LAMA BEKERJA
    // ==========================================

    const lamaBekerja = calculateLamaBekerja(TanggalMasuk);

    // ==========================================
    // UPDATE
    // ==========================================

    const operator = await prisma.Operator.update({
      where: {
        IdOperator,
      },

      data: {
        NIK: NIK.trim(),

        NamaOperator: NamaOperator.trim(),

        JenisKelamin: JenisKelamin?.trim() || null,

        Bagian: Bagian?.trim() || null,

        TanggalMasuk: TanggalMasuk ? new Date(TanggalMasuk) : null,

        TanggalKontrakMulai: TanggalKontrakMulai
          ? new Date(TanggalKontrakMulai)
          : null,

        TanggalKontrakSelesai: TanggalKontrakSelesai
          ? new Date(TanggalKontrakSelesai)
          : null,

        LamaBekerja: lamaBekerja,

        StatusOperator: StatusOperator?.trim() || "Kontrak",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data operator berhasil diperbarui.",
      data: operator,
    });
  } catch (error) {
    console.error("PUT OPERATOR ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal memperbarui data operator.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/operators/[id]
 */
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const IdOperator = Number(id);

    if (!Number.isInteger(IdOperator)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID operator tidak valid.",
        },
        { status: 400 },
      );
    }

    const operator = await prisma.Operator.findUnique({
      where: {
        IdOperator,
      },
    });

    if (!operator) {
      return NextResponse.json(
        {
          success: false,
          message: "Data operator tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    // Cek apakah sudah memiliki penilaian
    const jumlahPenilaian = await prisma.Penilaian.count({
      where: {
        IdOperator,
      },
    });

    if (jumlahPenilaian > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Operator tidak dapat dihapus karena sudah memiliki data penilaian.",
        },
        { status: 409 },
      );
    }

    await prisma.Operator.delete({
      where: {
        IdOperator,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data operator berhasil dihapus.",
    });
  } catch (error) {
    console.error("DELETE OPERATOR ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus data operator.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
