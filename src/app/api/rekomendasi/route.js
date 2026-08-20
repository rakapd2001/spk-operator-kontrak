import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ======================================================
// GET /api/rekomendasi
// ======================================================
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const periode = searchParams.get("periode");
    const keputusan = searchParams.get("keputusan");

    const data = await prisma.HasilPSI.findMany({
      where: {
        ...(periode
          ? {
              Penilaian: {
                Periode: periode,
              },
            }
          : {}),

        ...(keputusan
          ? {
              Rekomendasi: keputusan,
            }
          : {}),
      },

      orderBy: {
        Ranking: "asc",
      },

      select: {
        IdHasilPSI: true,
        IdPenilaian: true,
        NilaiPSI: true,
        Ranking: true,
        Rekomendasi: true,
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

      // KHUSUS rekomendasi
      Rekomendasi: item.Rekomendasi,

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
          ? "Belum terdapat rekomendasi keputusan."
          : "Data rekomendasi berhasil diambil.",
      data: result,
    });
  } catch (error) {
    console.error("GET REKOMENDASI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data rekomendasi.",
        data: [],
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
