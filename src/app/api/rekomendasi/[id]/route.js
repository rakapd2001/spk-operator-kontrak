import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ======================================================
// GET /api/rekomendasi/:id
// Detail rekomendasi + nilai setiap kriteria
// ======================================================
export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const IdHasilPSI = Number(id);

    if (!IdHasilPSI || Number.isNaN(IdHasilPSI)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID rekomendasi tidak valid.",
        },
        { status: 400 },
      );
    }

    const hasil = await prisma.HasilPSI.findUnique({
      where: {
        IdHasilPSI,
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

            Detail: {
              orderBy: {
                IdKriteria: "asc",
              },

              select: {
                IdPenilaianDetail: true,
                IdKriteria: true,
                Nilai: true,

                Kriteria: {
                  select: {
                    IdKriteria: true,
                    KodeKriteria: true,
                    NamaKriteria: true,
                    Jenis: true,
                    Deskripsi: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!hasil) {
      return NextResponse.json(
        {
          success: false,
          message: "Data rekomendasi tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    const detail = hasil.Penilaian.Detail.map((item) => ({
      IdPenilaianDetail: item.IdPenilaianDetail,
      IdKriteria: item.IdKriteria,

      KodeKriteria: item.Kriteria?.KodeKriteria,
      NamaKriteria: item.Kriteria?.NamaKriteria,
      Jenis: item.Kriteria?.Jenis,
      Deskripsi: item.Kriteria?.Deskripsi,

      Nilai: item.Nilai,
    }));

    return NextResponse.json({
      success: true,
      message: "Detail rekomendasi berhasil diambil.",

      data: {
        IdHasilPSI: hasil.IdHasilPSI,
        IdPenilaian: hasil.IdPenilaian,

        NilaiPSI: Number(hasil.NilaiPSI),
        Ranking: hasil.Ranking,

        Rekomendasi: hasil.Rekomendasi,

        TanggalPerhitungan: hasil.TanggalPerhitungan,

        TanggalPenilaian: hasil.Penilaian.TanggalPenilaian,
        Periode: hasil.Penilaian.Periode,

        Operator: hasil.Penilaian.Operator,
        Supervisor: hasil.Penilaian.Supervisor,

        Detail: detail,
      },
    });
  } catch (error) {
    console.error("GET DETAIL REKOMENDASI ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil detail rekomendasi.",
        data: null,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
