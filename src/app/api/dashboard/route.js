import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function serializeDate(value) {
  return value instanceof Date ? value.toISOString() : value;
}

function formatActivityTime(value) {
  if (!value) {
    return "-";
  }

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(value);
}

export async function GET() {
  try {
    const [operators, penilaians, hasil] = await Promise.all([
      prisma.Operator.findMany({
        select: {
          IdOperator: true,
          NIK: true,
          NamaOperator: true,
          Bagian: true,
        },
      }),
      prisma.Penilaian.findMany({
        orderBy: { TanggalPenilaian: "desc" },
        select: {
          IdPenilaian: true,
          IdOperator: true,
          TanggalPenilaian: true,
          Periode: true,
          Operator: {
            select: {
              NIK: true,
              NamaOperator: true,
              Bagian: true,
            },
          },
          Supervisor: {
            select: {
              NamaLengkap: true,
            },
          },
        },
      }),
      prisma.HasilPSI.findMany({
        orderBy: { Ranking: "asc" },
        select: {
          IdHasilPSI: true,
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
                  NIK: true,
                  NamaOperator: true,
                  Bagian: true,
                },
              },
            },
          },
        },
      }),
    ]);

    const evaluatedOperatorIds = new Set(
      penilaians.map((penilaian) => penilaian.IdOperator),
    );
    const recommendationCounts = hasil.reduce((counts, item) => {
      const recommendation = item.Rekomendasi || "Belum ada rekomendasi";
      counts[recommendation] = (counts[recommendation] || 0) + 1;
      return counts;
    }, {});
    const psiValues = hasil.map((item) => Number(item.NilaiPSI));
    const averagePsi = psiValues.length
      ? psiValues.reduce((total, value) => total + value, 0) / psiValues.length
      : 0;
    const latestEvaluation = penilaians[0];
    const latestResult = hasil
      .slice()
      .sort(
        (first, second) =>
          new Date(second.TanggalPerhitungan) -
          new Date(first.TanggalPerhitungan),
      )[0];

    const activities = [
      ...penilaians.slice(0, 3).map((item) => ({
        title: "Penilaian baru disimpan",
        detail: `${item.Supervisor?.NamaLengkap || "Supervisor"} menilai ${item.Operator?.NamaOperator || "operator"}`,
        time: formatActivityTime(item.TanggalPenilaian),
        date: serializeDate(item.TanggalPenilaian),
      })),
      ...hasil.slice(0, 3).map((item) => ({
        title: "Rekomendasi diperbarui",
        detail: `Hasil PSI ${item.Penilaian?.Operator?.NamaOperator || "operator"} telah dihitung`,
        time: formatActivityTime(item.TanggalPerhitungan),
        date: serializeDate(item.TanggalPerhitungan),
      })),
    ]
      .sort((first, second) => new Date(second.date) - new Date(first.date))
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
          ([label, value]) => ({ label, value }),
        ),
        psi: {
          average: Number(averagePsi.toFixed(2)),
          highest: psiValues.length ? Math.max(...psiValues) : 0,
          lowest: psiValues.length ? Math.min(...psiValues) : 0,
          bestRanking: hasil.length
            ? Math.min(...hasil.map((item) => item.Ranking))
            : null,
          progress: operators.length
            ? Math.round((evaluatedOperatorIds.size / operators.length) * 100)
            : 0,
          period:
            latestEvaluation?.Periode ||
            latestResult?.Penilaian?.Periode ||
            null,
        },
        operators: hasil.slice(0, 5).map((item) => ({
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
      { status: 500 },
    );
  }
}
