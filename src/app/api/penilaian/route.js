import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ======================================================
// KONFIGURASI
// ======================================================

const MIN_NILAI_PSI = 0;
const MAX_NILAI_PSI = 1;

// ======================================================
// HELPER
// ======================================================

function roundDecimal(value, digits = 6) {
  const number = Number(value);

  if (!Number.isFinite(number)) {
    return 0;
  }

  const factor = Math.pow(10, digits);

  return Math.round(number * factor) / factor;
}

// ======================================================
// NORMALISASI PSI
//
// Range diambil dari KriteriaDetail.
// Tidak menggunakan /5 atau /4.
//
// Benefit:
// nilai semakin besar -> semakin baik
//
// Cost:
// nilai semakin kecil -> semakin baik
// ======================================================

function normalizePSI(nilai, jenis, minNilai, maxNilai) {
  const x = Number(nilai);
  const min = Number(minNilai);
  const max = Number(maxNilai);

  if (!Number.isFinite(x) || !Number.isFinite(min) || !Number.isFinite(max)) {
    return 0;
  }

  // Jika range hanya mempunyai satu nilai
  if (max === min) {
    return 1;
  }

  // Benefit
  if (jenis === "Benefit") {
    const hasil = (x - min) / (max - min);

    return Math.min(MAX_NILAI_PSI, Math.max(MIN_NILAI_PSI, hasil));
  }

  // Cost
  if (jenis === "Cost") {
    const hasil = (max - x) / (max - min);

    return Math.min(MAX_NILAI_PSI, Math.max(MIN_NILAI_PSI, hasil));
  }

  throw new Error(
    `Jenis kriteria "${jenis}" tidak valid. Gunakan Benefit atau Cost.`,
  );
}

// ======================================================
// REKOMENDASI
//
// Ini adalah aturan bisnis, bukan rumus PSI.
// Silakan ubah threshold sesuai kebijakan perusahaan.
// ======================================================

function getRekomendasi(nilaiPSI) {
  const nilai = Number(nilaiPSI);

  if (!Number.isFinite(nilai)) {
    return "Tidak Direkomendasikan";
  }

  if (nilai >= 0.8) {
    return "Sangat Direkomendasikan";
  }

  if (nilai >= 0.65) {
    return "Direkomendasikan";
  }

  if (nilai >= 0.5) {
    return "Dipertimbangkan";
  }

  return "Tidak Direkomendasikan";
}

// ======================================================
// GET RANGE NILAI DARI KRITERIA DETAIL
//
// Contoh:
//
// K01
// Detail: 1,2,3,4,5
//
// hasil:
// min = 1
// max = 5
//
// Tidak ada angka 5 yang ditulis manual.
// ======================================================

async function getKriteriaDenganRange(db) {
  const kriterias = await db.Kriteria.findMany({
    orderBy: {
      IdKriteria: "asc",
    },
  });

  if (kriterias.length === 0) {
    return [];
  }

  const detailKriteria = await db.KriteriaDetail.findMany({
    select: {
      IdKriteriaDetail: true,
      IdKriteria: true,
      Nilai: true,
      KodeDetail: true,
      NamaDetail: true,
      Keterangan: true,
    },
    orderBy: [
      {
        IdKriteria: "asc",
      },
      {
        Nilai: "asc",
      },
    ],
  });

  const detailMap = new Map();

  for (const detail of detailKriteria) {
    if (!detailMap.has(detail.IdKriteria)) {
      detailMap.set(detail.IdKriteria, []);
    }

    detailMap.get(detail.IdKriteria).push(Number(detail.Nilai));
  }

  return kriterias.map((kriteria) => {
    const values = detailMap.get(kriteria.IdKriteria) || [];

    const validValues = values.filter((value) => Number.isFinite(value));

    if (validValues.length === 0) {
      throw new Error(
        `Kriteria "${kriteria.NamaKriteria}" belum memiliki detail nilai.`,
      );
    }

    const minNilai = Math.min(...validValues);
    const maxNilai = Math.max(...validValues);

    return {
      ...kriteria,
      minNilai,
      maxNilai,
    };
  });
}

// ======================================================
// HITUNG ULANG SEMUA HASIL PSI
//
// Fungsi ini dipanggil setelah penilaian berhasil disimpan.
//
// Semua penilaian lengkap dijadikan alternatif.
// ======================================================

async function hitungSemuaPSI(tx) {
  // ----------------------------------------------------
  // 1. Ambil kriteria + range dari KriteriaDetail
  // ----------------------------------------------------

  const kriterias = await getKriteriaDenganRange(tx);

  if (kriterias.length === 0) {
    return [];
  }

  const kriteriaIds = new Set(kriterias.map((kriteria) => kriteria.IdKriteria));

  // ----------------------------------------------------
  // 2. Ambil seluruh penilaian
  // ----------------------------------------------------

  const semuaPenilaian = await tx.Penilaian.findMany({
    orderBy: {
      IdPenilaian: "asc",
    },
    include: {
      Operator: {
        select: {
          IdOperator: true,
          NIK: true,
          NamaOperator: true,
          Bagian: true,
        },
      },

      Supervisor: {
        select: {
          IdUser: true,
          NamaLengkap: true,
          Username: true,
        },
      },

      PenilaianDetail: {
        select: {
          IdPenilaianDetail: true,
          IdPenilaian: true,
          IdKriteria: true,
          Nilai: true,
        },
      },
    },
  });

  // ----------------------------------------------------
  // 3. Hanya penilaian lengkap yang masuk perhitungan
  // ----------------------------------------------------

  const penilaianLengkap = semuaPenilaian.filter((penilaian) => {
    const detailIds = new Set(
      penilaian.PenilaianDetail.map((detail) =>
        Number(detail.IdKriteria),
      ).filter((id) => kriteriaIds.has(id)),
    );

    return detailIds.size === kriterias.length;
  });

  if (penilaianLengkap.length === 0) {
    return [];
  }

  // ----------------------------------------------------
  // 4. Buat matriks normalisasi
  // ----------------------------------------------------

  const matriksNormalisasi = penilaianLengkap.map((penilaian) => {
    const row = {
      IdPenilaian: penilaian.IdPenilaian,
      IdOperator: penilaian.IdOperator,
    };

    for (const kriteria of kriterias) {
      const detail = penilaian.PenilaianDetail.find(
        (item) => item.IdKriteria === kriteria.IdKriteria,
      );

      if (!detail) {
        row[kriteria.IdKriteria] = 0;
        continue;
      }

      row[kriteria.IdKriteria] = normalizePSI(
        detail.Nilai,
        kriteria.Jenis,
        kriteria.minNilai,
        kriteria.maxNilai,
      );
    }

    return row;
  });

  // ----------------------------------------------------
  // 5. Hitung mean setiap kriteria
  // ----------------------------------------------------

  const meanKriteria = {};

  for (const kriteria of kriterias) {
    const id = kriteria.IdKriteria;

    const values = matriksNormalisasi
      .map((row) => Number(row[id]))
      .filter((value) => Number.isFinite(value));

    if (values.length === 0) {
      meanKriteria[id] = 0;
      continue;
    }

    meanKriteria[id] =
      values.reduce((sum, value) => sum + value, 0) / values.length;
  }

  // ----------------------------------------------------
  // 6. Hitung Preference Variation
  //
  // PVj = Σ(Rij - Rj)^2 / n
  // ----------------------------------------------------

  const preferenceVariation = {};

  for (const kriteria of kriterias) {
    const id = kriteria.IdKriteria;

    const values = matriksNormalisasi
      .map((row) => Number(row[id]))
      .filter((value) => Number.isFinite(value));

    if (values.length === 0) {
      preferenceVariation[id] = 0;
      continue;
    }

    const mean = meanKriteria[id];

    const variance =
      values.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) /
      values.length;

    preferenceVariation[id] = variance;
  }

  // ----------------------------------------------------
  // 7. Hitung preference value
  //
  // PVj = 1 - variation
  // ----------------------------------------------------

  const preferenceValue = {};

  for (const kriteria of kriterias) {
    const id = kriteria.IdKriteria;

    preferenceValue[id] = 1 - preferenceVariation[id];

    // Hindari nilai negatif
    if (preferenceValue[id] < 0) {
      preferenceValue[id] = 0;
    }
  }

  // ----------------------------------------------------
  // 8. Hitung bobot PSI
  // ----------------------------------------------------

  const totalPreference = Object.values(preferenceValue).reduce(
    (sum, value) => sum + Number(value),
    0,
  );

  const bobotKriteria = {};

  for (const kriteria of kriterias) {
    const id = kriteria.IdKriteria;

    if (totalPreference === 0) {
      bobotKriteria[id] = 1 / kriterias.length;
    } else {
      bobotKriteria[id] = preferenceValue[id] / totalPreference;
    }
  }

  // ----------------------------------------------------
  // 9. Hitung nilai PSI setiap operator
  // ----------------------------------------------------

  const hasilPSI = matriksNormalisasi.map((row) => {
    let nilaiPSI = 0;

    for (const kriteria of kriterias) {
      const id = kriteria.IdKriteria;

      const nilai = Number(row[id]) || 0;

      const bobot = Number(bobotKriteria[id]) || 0;

      nilaiPSI += nilai * bobot;
    }

    return {
      IdPenilaian: row.IdPenilaian,
      IdOperator: row.IdOperator,
      NilaiPSI: roundDecimal(nilaiPSI, 6),
    };
  });

  // ----------------------------------------------------
  // 10. Ranking
  //
  // Nilai PSI terbesar = ranking terbaik
  // ----------------------------------------------------

  hasilPSI.sort((a, b) => {
    if (b.NilaiPSI !== a.NilaiPSI) {
      return b.NilaiPSI - a.NilaiPSI;
    }

    return a.IdPenilaian - b.IdPenilaian;
  });

  // ----------------------------------------------------
  // 11. Hasil akhir + rekomendasi
  // ----------------------------------------------------

  const hasilDenganRanking = hasilPSI.map((item, index) => {
    const ranking = index + 1;

    return {
      ...item,
      Ranking: ranking,
      Rekomendasi: getRekomendasi(item.NilaiPSI),
    };
  });

  // ----------------------------------------------------
  // 12. Hapus HasilPSI lama
  //
  // Kemudian dibuat ulang supaya ranking selalu
  // konsisten setelah ada operator baru.
  // ----------------------------------------------------

  await tx.HasilPSI.deleteMany({});

  if (hasilDenganRanking.length > 0) {
    await tx.HasilPSI.createMany({
      data: hasilDenganRanking.map((item) => ({
        IdPenilaian: item.IdPenilaian,

        NilaiPSI: item.NilaiPSI,

        Ranking: item.Ranking,

        Rekomendasi: item.Rekomendasi,

        TanggalPerhitungan: new Date(),
      })),
    });
  }

  return hasilDenganRanking;
}

function jsonError(message, status = 500, error = null) {
  return NextResponse.json(
    {
      success: false,
      message,
      data: null,
      error:
        process.env.NODE_ENV === "development"
          ? error?.message || error
          : undefined,
    },
    { status },
  );
}

function jsonSuccess(message, data = null, status = 200) {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    { status },
  );
}

// ============================================================
// GET /api/penilaian
//
// Hanya mengambil DATA PENILAIAN.
// Tidak digunakan untuk menampilkan keputusan/rekomendasi.
// ============================================================

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    const periode = searchParams.get("periode");

    const where = periode
      ? {
          Periode: periode.trim(),
        }
      : undefined;

    const data = await prisma.Penilaian.findMany({
      where,

      orderBy: {
        IdPenilaian: "desc",
      },

      include: {
        // ====================================================
        // OPERATOR
        // ====================================================

        Operator: {
          select: {
            IdOperator: true,
            NIK: true,
            NamaOperator: true,
            JenisKelamin: true,
            Bagian: true,
            StatusOperator: true,
          },
        },

        // ====================================================
        // SUPERVISOR
        // ====================================================

        Supervisor: {
          select: {
            IdUser: true,
            NamaLengkap: true,
            Username: true,
          },
        },

        // ====================================================
        // DETAIL PENILAIAN
        // ====================================================

        PenilaianDetail: {
          orderBy: {
            IdKriteria: "asc",
          },

          include: {
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
    });

    // ========================================================
    // FORMAT RESPONSE
    // ========================================================

    const result = data.map((item) => ({
      IdPenilaian: item.IdPenilaian,

      IdOperator: item.IdOperator,
      IdSupervisor: item.IdSupervisor,

      TanggalPenilaian: item.TanggalPenilaian,
      Periode: item.Periode,

      Operator: item.Operator,
      Supervisor: item.Supervisor,

      // Detail nilai per kriteria
      PenilaianDetail: item.PenilaianDetail.map((detail) => ({
        IdPenilaianDetail: detail.IdPenilaianDetail,
        IdPenilaian: detail.IdPenilaian,

        IdKriteria: detail.IdKriteria,
        Nilai: Number(detail.Nilai),

        Kriteria: detail.Kriteria
          ? {
              IdKriteria: detail.Kriteria.IdKriteria,
              KodeKriteria: detail.Kriteria.KodeKriteria,
              NamaKriteria: detail.Kriteria.NamaKriteria,
              Jenis: detail.Kriteria.Jenis,
              Deskripsi: detail.Kriteria.Deskripsi,
            }
          : null,
      })),

      // ======================================================
      // INFORMASI KELENGKAPAN
      // ======================================================

      JumlahKriteria: item.PenilaianDetail.length,
    }));

    return jsonSuccess(
      result.length === 0
        ? "Belum terdapat data penilaian."
        : "Data penilaian berhasil diambil.",
      result,
    );
  } catch (error) {
    console.error("GET PENILAIAN ERROR:", error);

    return jsonError("Gagal mengambil data penilaian.", 500, error);
  }
}

// ============================================================
// POST /api/penilaian
//
// Simp

// ======================================================
// POST /api/penilaian
// ======================================================

export async function POST(request) {
  try {
    const body = await request.json();

    const { IdOperator, IdSupervisor, TanggalPenilaian, Periode, Detail } =
      body;

    const operatorId = Number(IdOperator);

    const supervisorId = Number(IdSupervisor);

    // ==================================================
    // VALIDASI OPERATOR
    // ==================================================

    if (!operatorId || Number.isNaN(operatorId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Operator wajib dipilih.",
        },
        {
          status: 400,
        },
      );
    }

    // ==================================================
    // VALIDASI SUPERVISOR
    // ==================================================

    if (!supervisorId || Number.isNaN(supervisorId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Supervisor wajib dipilih.",
        },
        {
          status: 400,
        },
      );
    }

    // ==================================================
    // VALIDASI TANGGAL
    // ==================================================

    if (!TanggalPenilaian) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal penilaian wajib diisi.",
        },
        {
          status: 400,
        },
      );
    }

    const tanggalPenilaian = new Date(TanggalPenilaian);

    if (Number.isNaN(tanggalPenilaian.getTime())) {
      return NextResponse.json(
        {
          success: false,
          message: "Tanggal penilaian tidak valid.",
        },
        {
          status: 400,
        },
      );
    }

    // ==================================================
    // VALIDASI PERIODE
    // ==================================================

    if (!Periode?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Periode penilaian wajib diisi.",
        },
        {
          status: 400,
        },
      );
    }

    // ==================================================
    // VALIDASI DETAIL
    // ==================================================

    if (!Array.isArray(Detail) || Detail.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Minimal satu kriteria harus dinilai.",
        },
        {
          status: 400,
        },
      );
    }

    // ==================================================
    // CEK OPERATOR
    // ==================================================

    const operator = await prisma.Operator.findUnique({
      where: {
        IdOperator: operatorId,
      },
    });

    if (!operator) {
      return NextResponse.json(
        {
          success: false,
          message: "Data operator tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

    // ==================================================
    // CEK SUPERVISOR
    // ==================================================

    const supervisor = await prisma.Users.findUnique({
      where: {
        IdUser: supervisorId,
      },
    });

    if (!supervisor) {
      return NextResponse.json(
        {
          success: false,
          message: "Data supervisor tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

    // ==================================================
    // CEK DUPLIKAT
    // ==================================================

    const existingPenilaian = await prisma.Penilaian.findFirst({
      where: {
        IdOperator: operatorId,
        Periode: Periode.trim(),
      },
    });

    if (existingPenilaian) {
      return NextResponse.json(
        {
          success: false,
          message:
            `Operator ${operator.NamaOperator} ` +
            `sudah memiliki penilaian untuk ` +
            `periode ${Periode.trim()}.`,
        },
        {
          status: 409,
        },
      );
    }

    // ==================================================
    // AMBIL KRITERIA
    // ==================================================

    const kriterias = await getKriteriaDenganRange(prisma);

    if (kriterias.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Belum terdapat kriteria penilaian.",
        },
        {
          status: 400,
        },
      );
    }

    // ==================================================
    // BUAT MAP NILAI
    // ==================================================

    const detailMap = new Map();

    for (const item of Detail) {
      const idKriteria = Number(item.IdKriteria);

      const nilai = Number(item.Nilai);

      // ----------------------------------------------
      // ID KRITERIA
      // ----------------------------------------------

      if (!idKriteria || Number.isNaN(idKriteria)) {
        return NextResponse.json(
          {
            success: false,
            message: "ID kriteria tidak valid.",
          },
          {
            status: 400,
          },
        );
      }

      // ----------------------------------------------
      // CEK KRITERIA ADA
      // ----------------------------------------------

      const kriteria = kriterias.find((item) => item.IdKriteria === idKriteria);

      if (!kriteria) {
        return NextResponse.json(
          {
            success: false,
            message: `Kriteria dengan ID ${idKriteria} ` + `tidak ditemukan.`,
          },
          {
            status: 400,
          },
        );
      }

      // ----------------------------------------------
      // NILAI
      //
      // Tidak lagi dipatok 1-5 di sini.
      // Mengikuti min/max KriteriaDetail.
      // ----------------------------------------------

      if (!Number.isInteger(nilai)) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Nilai pada kriteria "${kriteria.NamaKriteria}" ` +
              `harus berupa angka.`,
          },
          {
            status: 400,
          },
        );
      }

      if (nilai < kriteria.minNilai || nilai > kriteria.maxNilai) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Nilai untuk "${kriteria.NamaKriteria}" ` +
              `harus berada antara ` +
              `${kriteria.minNilai} sampai ` +
              `${kriteria.maxNilai}.`,
          },
          {
            status: 400,
          },
        );
      }

      // ----------------------------------------------
      // DUPLIKAT KRITERIA
      // ----------------------------------------------

      if (detailMap.has(idKriteria)) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Kriteria "${kriteria.NamaKriteria}" ` +
              `tidak boleh dinilai dua kali.`,
          },
          {
            status: 400,
          },
        );
      }

      detailMap.set(idKriteria, nilai);
    }

    // ==================================================
    // PASTIKAN SEMUA KRITERIA DINILAI
    // ==================================================

    for (const kriteria of kriterias) {
      if (!detailMap.has(kriteria.IdKriteria)) {
        return NextResponse.json(
          {
            success: false,
            message:
              `Kriteria "${kriteria.NamaKriteria}" ` + `belum diberikan nilai.`,
          },
          {
            status: 400,
          },
        );
      }
    }

    // ==================================================
    // TRANSACTION
    // ==================================================

    const result = await prisma.$transaction(async (tx) => {
      // ------------------------------------------
      // CREATE HEADER
      // ------------------------------------------

      const header = await tx.Penilaian.create({
        data: {
          IdOperator: operatorId,

          IdSupervisor: supervisorId,

          TanggalPenilaian: tanggalPenilaian,

          Periode: Periode.trim(),
        },
      });

      // ------------------------------------------
      // CREATE DETAIL
      // ------------------------------------------

      await tx.PenilaianDetail.createMany({
        data: kriterias.map((kriteria) => ({
          IdPenilaian: header.IdPenilaian,

          IdKriteria: kriteria.IdKriteria,

          Nilai: detailMap.get(kriteria.IdKriteria),
        })),
      });

      // ------------------------------------------
      // HITUNG ULANG PSI
      // ------------------------------------------

      const hasil = await hitungSemuaPSI(tx);

      // ------------------------------------------
      // AMBIL HASIL PENILAIAN INI
      // ------------------------------------------

      const hasilPenilaian = hasil.find(
        (item) => item.IdPenilaian === header.IdPenilaian,
      );

      // ------------------------------------------
      // AMBIL DATA LENGKAP
      // ------------------------------------------

      const dataPenilaian = await tx.Penilaian.findUnique({
        where: {
          IdPenilaian: header.IdPenilaian,
        },

        include: {
          Operator: true,

          Supervisor: {
            select: {
              IdUser: true,
              NamaLengkap: true,
              Username: true,
            },
          },

          PenilaianDetail: {
            include: {
              Kriteria: true,
            },

            orderBy: {
              IdKriteria: "asc",
            },
          },

          HasilPSI: true,
        },
      });

      return {
        penilaian: dataPenilaian,

        hasilPSI: hasilPenilaian || null,

        jumlahAlternatif: hasil.length,
      };
    });

    return NextResponse.json(
      {
        success: true,

        message: "Penilaian berhasil disimpan dan hasil PSI berhasil dihitung.",

        data: result.penilaian,

        hasilPSI: result.hasilPSI,

        jumlahAlternatif: result.jumlahAlternatif,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST PENILAIAN ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        message: error?.message || "Gagal menyimpan penilaian.",

        error:
          process.env.NODE_ENV === "development"
            ? {
                message: error?.message,
                code: error?.code,
                meta: error?.meta,
              }
            : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
