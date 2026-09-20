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

    const [hasilPSI, penilaian, operator, users] = await Promise.all([
      prisma.HasilPSI.findMany({
        orderBy: {
          Ranking: "asc",
        },
      }),

      prisma.Penilaian.findMany(),

      prisma.Operator.findMany(),

      prisma.Users.findMany({
        select: {
          IdUser: true,
          NamaLengkap: true,
        },
      }),
    ]);

    // ==========================================
    // FILTER PENILAIAN BERDASARKAN PERIODE
    // ==========================================

    const filteredPenilaian = periode
      ? penilaian.filter((item) => item.Periode === periode)
      : penilaian;

    // ==========================================
    // MAP DATA
    // ==========================================

    const penilaianMap = new Map(
      filteredPenilaian.map((item) => [item.IdPenilaian, item]),
    );

    const operatorMap = new Map(
      operator.map((item) => [item.IdOperator, item]),
    );

    const supervisorMap = new Map(users.map((item) => [item.IdUser, item]));

    // ==========================================
    // FILTER REKOMENDASI
    // ==========================================

    const filteredHasil = keputusan
      ? hasilPSI.filter((item) => item.Rekomendasi === keputusan)
      : hasilPSI;

    // ==========================================
    // JOIN MANUAL
    // ==========================================

    const result = filteredHasil
      .filter((item) => penilaianMap.has(item.IdPenilaian))
      .map((item) => {
        const penilaianData = penilaianMap.get(item.IdPenilaian);

        const operatorData = operatorMap.get(penilaianData?.IdOperator);

        const supervisorData = supervisorMap.get(penilaianData?.IdSupervisor);

        return {
          IdHasilPSI: item.IdHasilPSI,

          IdPenilaian: item.IdPenilaian,

          NilaiPSI: Number(item.NilaiPSI),

          Ranking: item.Ranking,

          Rekomendasi: item.Rekomendasi,

          TanggalPerhitungan: item.TanggalPerhitungan,

          TanggalPenilaian: penilaianData?.TanggalPenilaian ?? null,

          Periode: penilaianData?.Periode ?? null,

          Operator: operatorData
            ? {
                IdOperator: operatorData.IdOperator,

                NIK: operatorData.NIK,

                NamaOperator: operatorData.NamaOperator,

                Bagian: operatorData.Bagian,

                StatusOperator: operatorData.StatusOperator,
              }
            : null,

          Supervisor: supervisorData
            ? {
                IdUser: supervisorData.IdUser,

                NamaLengkap: supervisorData.NamaLengkap,
              }
            : null,
        };
      });

    return NextResponse.json({
      success: true,

      message:
        result.length === 0
          ? "Belum terdapat rekomendasi keputusan."
          : "Data rekomendasi berhasil diambil.",

      total: result.length,

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
      {
        status: 500,
      },
    );
  }
}
