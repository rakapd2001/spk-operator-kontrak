import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ============================================================
// POST /api/login
// ============================================================
export async function POST(request) {
  try {
    const body = await request.json();

    const username = String(body.username || "")
      .trim()
      .toLowerCase();

    const password = String(body.password || "");

    // ==========================================================
    // VALIDASI
    // ==========================================================
    if (!username || !password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username dan password wajib diisi.",
          data: null,
        },
        { status: 400 },
      );
    }

    // ==========================================================
    // CARI USER DARI DATABASE
    // ==========================================================
    const user = await prisma.Users.findFirst({
      where: {
        Username: {
          equals: username,
          // Jika database Anda case-sensitive,
          // lowercase di sini mungkin perlu disesuaikan.
        },
      },

      select: {
        IdUser: true,
        IdRole: true,
        NamaLengkap: true,
        Username: true,
        Password: true,
        StatusAktif: true,

        // Jika tabel Role memang tersedia di Prisma,
        // bagian ini bisa digunakan.
        Role: {
          select: {
            IdRole: true,
            NamaRole: true,
          },
        },
      },
    });

    // ==========================================================
    // USER TIDAK DITEMUKAN
    // ==========================================================
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Username atau password salah.",
          data: null,
        },
        { status: 401 },
      );
    }

    // ==========================================================
    // CEK STATUS AKTIF
    // ==========================================================
    if (Number(user.StatusAktif) !== 1) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun Anda tidak aktif. Silakan hubungi administrator.",
          data: null,
        },
        { status: 403 },
      );
    }

    // ==========================================================
    // CEK PASSWORD
    // TANPA BCRYPT
    // ==========================================================
    if (String(user.Password) !== password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username atau password salah.",
          data: null,
        },
        { status: 401 },
      );
    }

    // ==========================================================
    // TENTUKAN ROLE
    // ==========================================================
    const role = user.Role?.NamaRole || null;

    // ==========================================================
    // DATA SESSION
    // JANGAN MASUKKAN PASSWORD
    // ==========================================================
    const sessionData = {
      IdUser: user.IdUser,
      IdRole: user.IdRole,
      NamaLengkap: user.NamaLengkap,
      Username: user.Username,
      Role: role,
    };

    // ==========================================================
    // ENCODE SESSION SEMENTARA
    // ==========================================================
    const session = Buffer.from(JSON.stringify(sessionData), "utf8").toString(
      "base64",
    );

    // ==========================================================
    // RESPONSE
    // ==========================================================
    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      data: sessionData,
    });

    // ==========================================================
    // COOKIE SESSION
    // ==========================================================
    response.cookies.set("spk_session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8, // 8 jam
    });

    return response;
  } catch (error) {
    console.error("LOGIN ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Terjadi kesalahan saat login.",
        data: null,
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
