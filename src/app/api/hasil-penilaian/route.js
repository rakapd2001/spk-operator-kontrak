import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const periode = searchParams.get("periode");

    const [hasilPSI, penilaian, operator, users] = await Promise.all([
      prisma.HasilPSI.findMany({
        orderBy: {
          Ranking: "asc",
        },
      }),

      prisma.Penilaian.findMany(),

      prisma.Operator.findMany(),

      prisma.Users.findMany(),
    ]);

    // ==========================================
    // FILTER PERIODE
    // ==========================================

    const filteredPenilaian = periode
      ? penilaian.filter((item) => item.Periode === periode)
      : penilaian;

    // ==========================================
    // MAP
    // ==========================================

    const penilaianMap = new Map(
      filteredPenilaian.map((item) => [item.IdPenilaian, item]),
    );

    const operatorMap = new Map(
      operator.map((item) => [item.IdOperator, item]),
    );

    const supervisorMap = new Map(users.map((item) => [item.IdUser, item]));

    // ==========================================
    // JOIN MANUAL
    // ==========================================

    const result = hasilPSI
      .filter((item) => penilaianMap.has(item.IdPenilaian))
      .map((item) => {
        const dataPenilaian = penilaianMap.get(item.IdPenilaian);

        const dataOperator = operatorMap.get(dataPenilaian?.IdOperator);

        const dataSupervisor = supervisorMap.get(dataPenilaian?.IdSupervisor);

        return {
          IdHasilPSI: item.IdHasilPSI,

          IdPenilaian: item.IdPenilaian,

          NilaiPSI: Number(item.NilaiPSI),

          Ranking: item.Ranking,

          Rekomendasi: item.Rekomendasi,

          TanggalPerhitungan: item.TanggalPerhitungan,

          TanggalPenilaian: dataPenilaian?.TanggalPenilaian ?? null,

          Periode: dataPenilaian?.Periode ?? null,

          Operator: dataOperator
            ? {
                IdOperator: dataOperator.IdOperator,

                NIK: dataOperator.NIK,

                NamaOperator: dataOperator.NamaOperator,

                Bagian: dataOperator.Bagian,

                StatusOperator: dataOperator.StatusOperator,
              }
            : null,

          Supervisor: dataSupervisor
            ? {
                IdUser: dataSupervisor.IdUser,

                NamaLengkap: dataSupervisor.NamaLengkap,
              }
            : null,
        };
      });

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
      {
        status: 500,
      },
    );
  }
}
