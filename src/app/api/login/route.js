import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request) {
  try {
    const body = await request.json();

    const username = String(body.username || "").trim();
    const password = String(body.password || "");

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

    // ==========================
    // CARI USER
    // ==========================
    const user = await prisma.users.findFirst({
      where: {
        Username: username,
      },
    });

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

    // ==========================
    // STATUS AKTIF
    // ==========================
    if (!user.StatusAktif) {
      return NextResponse.json(
        {
          success: false,
          message: "Akun tidak aktif.",
          data: null,
        },
        { status: 403 },
      );
    }

    // ==========================
    // PASSWORD
    // ==========================
    if (user.Password !== password) {
      return NextResponse.json(
        {
          success: false,
          message: "Username atau password salah.",
          data: null,
        },
        { status: 401 },
      );
    }

    // ==========================
    // AMBIL ROLE
    // ==========================
    const role = await prisma.role.findUnique({
      where: {
        IdRole: user.IdRole,
      },
    });

    const sessionData = {
      IdUser: user.IdUser,
      IdRole: user.IdRole,
      NamaLengkap: user.NamaLengkap,
      Username: user.Username,
      Bagian: user.Bagian,
      Role: role?.NamaRole ?? null,
    };

    const session = Buffer.from(JSON.stringify(sessionData), "utf8").toString(
      "base64",
    );

    const response = NextResponse.json({
      success: true,
      message: "Login berhasil.",
      data: sessionData,
    });

    response.cookies.set("spk_session", session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 8,
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
