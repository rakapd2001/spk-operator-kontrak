import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

// =========================================================
// GET /api/users
// =========================================================

export async function GET() {
  try {
    const users = await prisma.Users.findMany({
      select: {
        IdUser: true,
        IdRole: true,
        NamaLengkap: true,
        Username: true,
        StatusAktif: true,

        Role: {
          select: {
            IdRole: true,
            NamaRole: true,
          },
        },
      },

      orderBy: {
        IdUser: "asc",
      },
    });

    return NextResponse.json({
      success: true,
      message:
        users.length === 0
          ? "Data user belum tersedia."
          : "Data user berhasil diambil.",
      data: users,
    });
  } catch (error) {
    // console.error("GET USERS ERROR:", error);

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

    // console.log("POST USER BODY:", body);

    const { IdRole, NamaLengkap, Username, Password, StatusAktif } = body;

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

    const role = await prisma.Role.findUnique({
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

    const existingUser = await prisma.Users.findUnique({
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
    // HASH PASSWORD
    // =====================================================

    const hashedPassword = await bcrypt.hash(Password.trim(), 10);

    // =====================================================
    // STATUS
    // =====================================================

    const status = typeof StatusAktif === "boolean" ? StatusAktif : true;

    // =====================================================
    // CREATE
    // =====================================================

    const user = await prisma.Users.create({
      data: {
        IdRole: roleId,
        NamaLengkap: NamaLengkap.trim(),
        Username: username,
        Password: hashedPassword,
        StatusAktif: status,
      },

      select: {
        IdUser: true,
        IdRole: true,
        NamaLengkap: true,
        Username: true,
        StatusAktif: true,

        Role: {
          select: {
            IdRole: true,
            NamaRole: true,
          },
        },
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "User berhasil ditambahkan.",
        data: user,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("POST USERS ERROR:", error);

    // Username duplicate
    if (error?.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message: "Username sudah digunakan.",
        },
        {
          status: 409,
        },
      );
    }

    // Foreign key
    if (error?.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          message: "Role yang dipilih tidak valid.",
        },
        {
          status: 400,
        },
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
