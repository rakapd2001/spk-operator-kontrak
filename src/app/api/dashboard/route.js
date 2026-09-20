import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : value;
}

function formatActivityTime(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(new Date(value));
}

export async function GET() {
  try {
    const [operators, penilaians, hasil, users] = await Promise.all([
      prisma.operator.findMany(),

      prisma.penilaian.findMany({
        orderBy: {
          TanggalPenilaian: "desc",
        },
      }),

      prisma.hasilPSI.findMany({
        orderBy: {
          Ranking: "asc",
        },
      }),

      prisma.users.findMany(),
    ]);

    // =====================================================
    // MAPPING OPERATOR
    // =====================================================

    const operatorMap = new Map(
      operators.map((operator) => [operator.IdOperator, operator]),
    );

    // =====================================================
    // MAPPING SUPERVISOR
    // =====================================================

    const supervisorMap = new Map(users.map((user) => [user.IdUser, user]));

    // =====================================================
    // PENILAIAN + OPERATOR + SUPERVISOR
    // =====================================================

    const penilaianWithRelations = penilaians.map((item) => ({
      ...item,

      Operator: operatorMap.get(item.IdOperator) || null,

      Supervisor: supervisorMap.get(item.IdSupervisor) || null,
    }));

    // =====================================================
    // HASIL PSI + PENILAIAN + OPERATOR
    // =====================================================

    const hasilWithRelations = hasil.map((item) => {
      const penilaian =
        penilaianWithRelations.find(
          (p) => p.IdPenilaian === item.IdPenilaian,
        ) || null;

      return {
        ...item,
        Penilaian: penilaian,
      };
    });

    // =====================================================
    // SUMMARY
    // =====================================================

    const evaluatedOperatorIds = new Set(
      penilaianWithRelations.map((item) => item.IdOperator),
    );

    const recommendationCounts = hasilWithRelations.reduce((counts, item) => {
      const recommendation = item.Rekomendasi || "Belum ada rekomendasi";

      counts[recommendation] = (counts[recommendation] || 0) + 1;

      return counts;
    }, {});

    const psiValues = hasilWithRelations.map((item) => Number(item.NilaiPSI));

    const averagePsi = psiValues.length
      ? psiValues.reduce((sum, value) => sum + value, 0) / psiValues.length
      : 0;

    const latestEvaluation = penilaianWithRelations[0];

    const latestResult = hasilWithRelations
      .slice()
      .sort(
        (a, b) =>
          new Date(b.TanggalPerhitungan) - new Date(a.TanggalPerhitungan),
      )[0];

    // =====================================================
    // ACTIVITIES
    // =====================================================

    const activities = [
      ...penilaianWithRelations.slice(0, 3).map((item) => ({
        title: "Penilaian baru disimpan",

        detail: `${item.Supervisor?.NamaLengkap || "Supervisor"} menilai ${
          item.Operator?.NamaOperator || "Operator"
        }`,

        time: formatActivityTime(item.TanggalPenilaian),

        date: serializeDate(item.TanggalPenilaian),
      })),

      ...hasilWithRelations.slice(0, 3).map((item) => ({
        title: "Rekomendasi diperbarui",

        detail: `Hasil PSI ${
          item.Penilaian?.Operator?.NamaOperator || "Operator"
        } telah dihitung`,

        time: formatActivityTime(item.TanggalPerhitungan),

        date: serializeDate(item.TanggalPerhitungan),
      })),
    ]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);

    return NextResponse.json({
      success: true,

      data: {
        summary: {
          totalOperators: operators.length,

          totalEvaluated: evaluatedOperatorIds.size,

          recommendedPermanent: recommendationCounts["Karyawan Tetap"] || 0,

          contractExtension: recommendationCounts["Perpanjang Kontrak"] || 0,

          notContinued: recommendationCounts["Tidak Dilanjutkan"] || 0,
        },

        distribution: Object.entries(recommendationCounts).map(
          ([label, value]) => ({
            label,
            value,
          }),
        ),

        psi: {
          average: Number(averagePsi.toFixed(2)),

          highest: psiValues.length ? Math.max(...psiValues) : 0,

          lowest: psiValues.length ? Math.min(...psiValues) : 0,

          bestRanking: hasilWithRelations.length
            ? Math.min(...hasilWithRelations.map((item) => item.Ranking))
            : null,

          progress: operators.length
            ? Math.round((evaluatedOperatorIds.size / operators.length) * 100)
            : 0,

          period:
            latestEvaluation?.Periode ||
            latestResult?.Penilaian?.Periode ||
            null,
        },

        operators: hasilWithRelations.slice(0, 5).map((item) => ({
          nik: item.Penilaian?.Operator?.NIK || "-",

          nama: item.Penilaian?.Operator?.NamaOperator || "-",

          bagian: item.Penilaian?.Operator?.Bagian || "-",

          psi: Number(item.NilaiPSI),

          ranking: item.Ranking,

          status: item.Rekomendasi || "Belum ada rekomendasi",
        })),

        activities,
      },
    });
  } catch (error) {
    console.error("GET DASHBOARD ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data dashboard.",
        data: null,

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
