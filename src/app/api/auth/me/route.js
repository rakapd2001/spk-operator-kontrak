import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();

    const session = cookieStore.get("spk_session")?.value;

    if (!session) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "Belum login.",
          data: null,
        },
        { status: 401 },
      );
    }

    let user;

    try {
      user = JSON.parse(Buffer.from(session, "base64").toString("utf8"));
    } catch (error) {
      console.error("SESSION PARSE ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "Session tidak valid.",
          data: null,
        },
        { status: 401 },
      );
    }

    // Validasi minimal session
    if (!user?.IdUser || !user?.Username || !user?.IdRole) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          message: "Session tidak valid.",
          data: null,
        },
        { status: 401 },
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      data: user,
    });
  } catch (error) {
    console.error("AUTH ME ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        authenticated: false,
        message: "Gagal memeriksa session.",
        data: null,
      },
      { status: 500 },
    );
  }
}
