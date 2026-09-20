import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET /api/operators
export async function GET() {
  try {
    const operators = await prisma.Operator.findMany({
      orderBy: {
        IdOperator: "desc",
      },
    });

    function calculateLamaBekerja(tanggalMasuk) {
      if (!tanggalMasuk) {
        return null;
      }

      const masuk = new Date(tanggalMasuk);
      const sekarang = new Date();

      let bulan =
        (sekarang.getFullYear() - masuk.getFullYear()) * 12 +
        (sekarang.getMonth() - masuk.getMonth());

      if (sekarang.getDate() < masuk.getDate()) {
        bulan--;
      }

      return Math.max(0, bulan);
    }

    const data = operators.map((operator) => ({
      ...operator,

      // dalam bulan
      MasaBekerja: calculateLamaBekerja(operator.TanggalMasuk),
    }));

    return NextResponse.json({
      success: true,
      data,
      message:
        data.length === 0
          ? "Belum terdapat data operator."
          : "Data operator berhasil diambil.",
    });
  } catch (error) {
    console.error("GET OPERATORS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        data: [],
        message: "Gagal mengambil data operator.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
      },
    );
  }
}

// POST /api/operators
export async function POST(request) {
  try {
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

    // Validasi
    if (!NIK?.trim() || !NamaOperator?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK dan nama operator wajib diisi.",
        },
        { status: 400 },
      );
    }

    // Cek NIK
    const existingOperator = await prisma.Operator.findUnique({
      where: {
        NIK: NIK.trim(),
      },
    });

    if (existingOperator) {
      return NextResponse.json(
        {
          success: false,
          message: "NIK sudah terdaftar.",
        },
        { status: 409 },
      );
    }

    // Hitung lama bekerja
    let lamaBekerja = null;

    if (TanggalMasuk) {
      const tanggalMasuk = new Date(TanggalMasuk);
      const sekarang = new Date();

      lamaBekerja = sekarang.getFullYear() - tanggalMasuk.getFullYear();

      const bulan = sekarang.getMonth() - tanggalMasuk.getMonth();

      if (
        bulan < 0 ||
        (bulan === 0 && sekarang.getDate() < tanggalMasuk.getDate())
      ) {
        lamaBekerja--;
      }

      if (lamaBekerja < 0) {
        lamaBekerja = 0;
      }
    }

    const operator = await prisma.Operator.create({
      data: {
        NIK: NIK.trim(),
        NamaOperator: NamaOperator.trim(),
        JenisKelamin: JenisKelamin || null,
        Bagian: Bagian?.trim() || null,
        TanggalMasuk: TanggalMasuk ? new Date(TanggalMasuk) : null,
        TanggalKontrakMulai: TanggalKontrakMulai
          ? new Date(TanggalKontrakMulai)
          : null,
        TanggalKontrakSelesai: TanggalKontrakSelesai
          ? new Date(TanggalKontrakSelesai)
          : null,
        StatusOperator: StatusOperator || "Kontrak",
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Data operator berhasil ditambahkan.",
        data: operator,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST OPERATORS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan data operator.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
