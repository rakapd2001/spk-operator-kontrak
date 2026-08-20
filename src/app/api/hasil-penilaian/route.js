import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ======================================================
// GET /api/hasil-penilaian
// Hanya menampilkan hasil nilai PSI dan ranking
// ======================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const periode = searchParams.get("periode");

    const data = await prisma.HasilPSI.findMany({
      where: periode
        ? {
            Penilaian: {
              Periode: periode,
            },
          }
        : undefined,

      orderBy: [
        {
          Ranking: "asc",
        },
      ],

      select: {
        IdHasilPSI: true,
        IdPenilaian: true,
        NilaiPSI: true,
        Ranking: true,
        TanggalPerhitungan: true,

        Penilaian: {
          select: {
            IdPenilaian: true,
            TanggalPenilaian: true,
            Periode: true,

            Operator: {
              select: {
                IdOperator: true,
                NIK: true,
                NamaOperator: true,
                Bagian: true,
                StatusOperator: true,
              },
            },

            Supervisor: {
              select: {
                IdUser: true,
                NamaLengkap: true,
              },
            },
          },
        },
      },
    });

    const result = data.map((item) => ({
      IdHasilPSI: item.IdHasilPSI,
      IdPenilaian: item.IdPenilaian,

      NilaiPSI: Number(item.NilaiPSI),
      Ranking: item.Ranking,

      TanggalPerhitungan: item.TanggalPerhitungan,

      TanggalPenilaian: item.Penilaian?.TanggalPenilaian,
      Periode: item.Penilaian?.Periode,

      Operator: item.Penilaian?.Operator || null,
      Supervisor: item.Penilaian?.Supervisor || null,
    }));

    return NextResponse.json({
      success: true,
      message:
        result.length === 0
          ? "Belum terdapat hasil penilaian."
          : "Hasil penilaian berhasil diambil.",
      data: result,
    });
  } catch (error) {
    console.error("GET HASIL PENILAIAN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil hasil penilaian.",
        data: [],
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
