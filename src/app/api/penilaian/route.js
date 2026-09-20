import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const periode = searchParams.get("periode");
    const check = searchParams.get("check");
    const IdOperator = Number(searchParams.get("IdOperator"));

    if (check === "true") {
      if (!IdOperator || Number.isNaN(IdOperator)) {
        return NextResponse.json(
          {
            success: false,
            exists: false,
            message: "IdOperator tidak valid.",
          },
          {
            status: 400,
          },
        );
      }

      const operator = await prisma.Operator.findUnique({
        where: {
          IdOperator,
        },
        select: {
          IdOperator: true,
          NIK: true,
          NamaOperator: true,
          TanggalKontrakSelesai: true,
        },
      });

      if (!operator) {
        return NextResponse.json(
          {
            success: false,
            exists: false,
            message: "Operator tidak ditemukan.",
          },
          {
            status: 404,
          },
        );
      }

      const existingPenilaian = await prisma.Penilaian.findFirst({
        where: {
          IdOperator,
        },
        orderBy: {
          IdPenilaian: "desc",
        },
      });

      const today = new Date();

      const contractEnd = operator.TanggalKontrakSelesai
        ? new Date(operator.TanggalKontrakSelesai)
        : null;

      let evaluationStart = null;
      let canEvaluate = false;

      if (contractEnd) {
        evaluationStart = new Date(contractEnd);

        evaluationStart.setDate(evaluationStart.getDate() - 14);

        canEvaluate = today >= evaluationStart && today <= contractEnd;
      }

      return NextResponse.json({
        success: true,

        exists: !!existingPenilaian,

        canEvaluate,

        data: existingPenilaian,

        operator: {
          IdOperator: operator.IdOperator,

          NIK: operator.NIK,

          NamaOperator: operator.NamaOperator,

          TanggalKontrakSelesai: operator.TanggalKontrakSelesai,
        },

        evaluationStart,

        contractEnd,

        message: existingPenilaian
          ? "Operator sudah memiliki data penilaian."
          : "Operator belum memiliki data penilaian.",
      });
    }
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

    const penilaianFiltered = periode
      ? penilaian.filter((item) => item.Periode === periode)
      : penilaian;

    // ==========================================
    // MAP DATA
    // ==========================================

    const penilaianMap = new Map(
      penilaianFiltered.map((item) => [item.IdPenilaian, item]),
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

          Operator: operatorData || null,

          Supervisor: supervisorData || null,
        };
      });

    return NextResponse.json({
      success: true,
      message:
        result.length === 0
          ? "Belum terdapat hasil penilaian."
          : "Hasil penilaian berhasil diambil.",

      total: result.length,
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

export async function POST(request) {
  try {
    const body = await request.json();

    const { IdOperator, IdSupervisor, TanggalPenilaian, Periode, Detail } =
      body;

    const idOperator = Number(IdOperator);
    const idSupervisor = Number(IdSupervisor);

    if (!idOperator || !idSupervisor) {
      return NextResponse.json(
        {
          success: false,
          message: "Operator dan supervisor wajib dipilih.",
        },
        { status: 400 },
      );
    }

    if (!TanggalPenilaian) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal penilaian wajib diisi.",
        },
        { status: 400 },
      );
    }

    const periodeValue = String(Periode || "").trim();

    if (!periodeValue) {
      return NextResponse.json(
        {
          success: false,
          message: "Periode penilaian wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (!Array.isArray(Detail) || Detail.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Detail penilaian wajib diisi.",
        },
        { status: 400 },
      );
    }

    const operator = await prisma.Operator.findUnique({
      where: {
        IdOperator: idOperator,
      },
    });

    if (!operator) {
      return NextResponse.json(
        {
          success: false,
          message: "Operator tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

    const today = new Date();

    const contractEnd = new Date(operator.TanggalKontrakSelesai);

    const evaluationStart = new Date(contractEnd);

    evaluationStart.setDate(evaluationStart.getDate() - 14);

    if (today < evaluationStart || today > contractEnd) {
      return NextResponse.json(
        {
          success: false,

          message:
            "Penilaian hanya dapat dilakukan H-14 sebelum kontrak berakhir.",
        },
        {
          status: 400,
        },
      );
    }

    const existingPenilaian = await prisma.Penilaian.findFirst({
      where: {
        IdOperator: idOperator,
      },
      orderBy: {
        IdPenilaian: "desc",
      },
    });

    if (existingPenilaian) {
      return NextResponse.json(
        {
          success: false,
          message: "Operator ini sudah pernah dinilai.",
        },
        {
          status: 409,
        },
      );
    }

    const detailData = Detail.map((item) => {
      const idKriteria = Number(item?.IdKriteria);
      const nilai = Number(item?.Nilai);

      if (!idKriteria || Number.isNaN(nilai) || nilai < 1 || nilai > 5) {
        throw new Error("Nilai kriteria harus berupa angka 1 sampai 5.");
      }

      return {
        IdKriteria: idKriteria,
        Nilai: nilai,
      };
    });

    const penilaian = await prisma.$transaction(async (tx) => {
      const createdPenilaian = await tx.Penilaian.create({
        data: {
          IdOperator: idOperator,
          IdSupervisor: idSupervisor,
          TanggalPenilaian: new Date(TanggalPenilaian),
          Periode: periodeValue,
          StatusPenilaian: "SUBMITTED",
        },
      });

      await tx.PenilaianDetail.createMany({
        data: detailData.map((item) => ({
          IdPenilaian: createdPenilaian.IdPenilaian,
          IdKriteria: item.IdKriteria,
          Nilai: item.Nilai,
        })),
      });

      return createdPenilaian;
    });

    return NextResponse.json(
      {
        success: true,
        message: "Penilaian berhasil disimpan.",
        data: penilaian,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("POST PENILAIAN ERROR:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Penilaian untuk kombinasi operator, supervisor, dan periode sudah ada.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: error.message || "Gagal menyimpan penilaian.",
      },
      { status: 500 },
    );
  }
}
