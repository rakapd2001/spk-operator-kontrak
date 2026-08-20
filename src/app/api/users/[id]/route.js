// src/app/api/users/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request, { params }) {
  try {
    const { id } = await params;

    const IdUser = Number(id);

    if (!IdUser || Number.isNaN(IdUser)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID user tidak valid.",
        },
        {
          status: 400,
        },
      );
    }

    const user = await prisma.Users.findUnique({
      where: {
        IdUser,
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

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Data user tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Data user berhasil ditemukan.",
      data: user,
    });
  } catch (error) {
    console.error("GET USER DETAIL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Gagal mengambil data user.",
      },
      {
        status: 500,
      },
    );
  }
}

// =========================================================
// PUT /api/users/:id
// =========================================================

export async function PUT(request, { params }) {
  try {
    const { id } = await params;

    const IdUser = Number(id);

    if (!IdUser || Number.isNaN(IdUser)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID user tidak valid.",
        },
        {
          status: 400,
        },
      );
    }

    const body = await request.json();

    // console.log("PUT USER BODY:", body);

    const { IdRole, NamaLengkap, Username, Password, StatusAktif } = body;

    // =====================================================
    // CEK USER
    // =====================================================

    const existingUser = await prisma.Users.findUnique({
      where: {
        IdUser,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Data user tidak ditemukan.",
        },
        {
          status: 404,
        },
      );
    }

    // =====================================================
    // VALIDASI
    // =====================================================

    if (!NamaLengkap?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Nama lengkap wajib diisi.",
        },
        {
          status: 400,
        },
      );
    }

    if (!Username?.trim()) {
      return NextResponse.json(
        {
          success: false,
          message: "Username wajib diisi.",
        },
        {
          status: 400,
        },
      );
    }

    const roleId = Number(IdRole);

    if (!roleId || Number.isNaN(roleId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Role wajib dipilih.",
        },
        {
          status: 400,
        },
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
        {
          status: 400,
        },
      );
    }

    // =====================================================
    // CEK USERNAME
    // Jangan cek username milik dirinya sendiri
    // =====================================================

    const username = Username.trim();

    const duplicateUsername = await prisma.Users.findFirst({
      where: {
        Username: username,
        NOT: {
          IdUser,
        },
      },
    });

    if (duplicateUsername) {
      return NextResponse.json(
        {
          success: false,
          message: `Username "${username}" sudah digunakan oleh user lain.`,
        },
        {
          status: 409,
        },
      );
    }

    // =====================================================
    // DATA UPDATE
    // =====================================================

    const updateData = {
      IdRole: roleId,
      NamaLengkap: NamaLengkap.trim(),
      Username: username,
      StatusAktif:
        typeof StatusAktif === "boolean"
          ? StatusAktif
          : existingUser.StatusAktif,
    };

    // =====================================================
    // PASSWORD
    //
    // Kalau Password kosong:
    // password lama tetap digunakan.
    //
    // Kalau Password diisi:
    // password baru di-hash.
    // =====================================================

    if (Password?.trim()) {
      if (Password.trim().length < 6) {
        return NextResponse.json(
          {
            success: false,
            message: "Password baru minimal 6 karakter.",
          },
          {
            status: 400,
          },
        );
      }

      updateData.Password = await bcrypt.hash(Password.trim(), 10);
    }

    // =====================================================
    // UPDATE USER
    // =====================================================

    const user = await prisma.Users.update({
      where: {
        IdUser,
      },

      data: updateData,

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

    return NextResponse.json({
      success: true,
      message: "Data user berhasil diperbarui.",
      data: user,
    });
  } catch (error) {
    // console.error("PUT USER ERROR:", error);

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
        message: "Gagal memperbarui data user.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
// DELETE /api/users/:id
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;

    const IdUser = Number(id);

    if (!id || Number.isNaN(IdUser)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID user tidak valid.",
        },
        { status: 400 },
      );
    }

    // Cari user
    const user = await prisma.Users.findUnique({
      where: {
        IdUser,
      },
      select: {
        IdUser: true,
        NamaLengkap: true,
        Username: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Data user tidak ditemukan.",
        },
        { status: 404 },
      );
    }

    // Cek apakah user sudah digunakan sebagai supervisor
    const jumlahPenilaian = await prisma.Penilaian.count({
      where: {
        IdSupervisor: IdUser,
      },
    });

    if (jumlahPenilaian > 0) {
      return NextResponse.json(
        {
          success: false,
          message:
            `User "${user.NamaLengkap}" tidak dapat dihapus karena ` +
            `sudah digunakan pada ${jumlahPenilaian} data penilaian.`,
          canDeactivate: true,
        },
        { status: 409 },
      );
    }

    // Hapus user
    await prisma.Users.delete({
      where: {
        IdUser,
      },
    });

    return NextResponse.json({
      success: true,
      message: `User "${user.NamaLengkap}" berhasil dihapus.`,
    });
  } catch (error) {
    console.error("DELETE USER ERROR:", error);

    // Foreign key constraint
    if (error?.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          message:
            "User tidak dapat dihapus karena masih digunakan oleh data lain.",
          canDeactivate: true,
        },
        { status: 409 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus data user.",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    );
  }
}
