import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// =========================================================
// GET /api/users
// =========================================================

export async function GET() {
  try {
    const [users, roles] = await Promise.all([
      prisma.users.findMany({
        orderBy: {
          IdUser: "asc",
        },
      }),

      prisma.role.findMany(),
    ]);

    const roleMap = new Map(roles.map((role) => [role.IdRole, role]));

    const result = users.map((user) => ({
      ...user,

      Role: roleMap.get(user.IdRole) || null,
    }));

    return NextResponse.json({
      success: true,
      message:
        result.length === 0
          ? "Data user belum tersedia."
          : "Data user berhasil diambil.",
      data: result,
    });
  } catch (error) {
    console.error("GET USERS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data user.",
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

// =========================================================
// POST /api/users
// =========================================================

export async function POST(request) {
  try {
    const body = await request.json();

    const { IdRole, NamaLengkap, Username, Password, StatusAktif, Bagian } =
      body;

    // =====================================================
    // VALIDASI
    // =====================================================

    if (!NamaLengkap?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama lengkap wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (!Username?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Username wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (!Password?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Password wajib diisi.",
        },
        { status: 400 },
      );
    }

    if (Password.trim().length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password minimal 6 karakter.",
        },
        { status: 400 },
      );
    }

    const roleId = Number(IdRole);

    if (!roleId || Number.isNaN(roleId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Role wajib dipilih.",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // CEK ROLE
    // =====================================================

    const role = await prisma.role.findUnique({
      where: {
        IdRole: roleId,
      },
    });

    if (!role) {
      return NextResponse.json(
        {
          success: false,
          message: "Role yang dipilih tidak ditemukan.",
        },
        { status: 400 },
      );
    }

    // =====================================================
    // CEK USERNAME
    // =====================================================

    const username = Username.trim();

    const existingUser = await prisma.users.findUnique({
      where: {
        Username: username,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: `Username "${username}" sudah digunakan.`,
        },
        { status: 409 },
      );
    }

    // =====================================================
    // STATUS AKTIF
    // =====================================================

    const status = typeof StatusAktif === "boolean" ? StatusAktif : true;

    // =====================================================
    // CREATE USER
    // =====================================================

    const user = await prisma.users.create({
      data: {
        IdRole: roleId,

        NamaLengkap: NamaLengkap.trim(),

        Username: username,

        // sementara plaintext
        Password: Password.trim(),

        StatusAktif: status,

        Bagian: Bagian?.trim() || null,
      },
    });

    // =====================================================
    // RESPONSE
    // =====================================================

    return NextResponse.json(
      {
        success: true,
        message: "User berhasil ditambahkan.",

        data: {
          IdUser: user.IdUser,

          IdRole: user.IdRole,

          NamaLengkap: user.NamaLengkap,

          Username: user.Username,

          StatusAktif: user.StatusAktif,

          Bagian: user.Bagian,

          Role: {
            IdRole: role.IdRole,
            NamaRole: role.NamaRole,
          },
        },
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST USERS ERROR:", error);

    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "Username sudah digunakan.",
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menambahkan user.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
