// src/app/api/users/[id]/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET(request, { params }) {
  try {
    const { id } = params;

    const IdUser = Number(id);

    if (!IdUser || Number.isNaN(IdUser)) {
      return NextResponse.json(
        {
          success: false,
          message: "ID user tidak valid.",
        },
        { status: 400 },
      );
    }

    const user = await prisma.Users.findUnique({
      where: {
        IdUser,
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

    const role = await prisma.Role.findUnique({
      where: {
        IdRole: user.IdRole,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Data user berhasil ditemukan.",
      data: {
        ...user,
        Role: role
          ? {
              IdRole: role.IdRole,
              NamaRole: role.NamaRole,
            }
          : null,
      },
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
    const { id } = params;

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

    const { IdRole, NamaLengkap, Username, Password, StatusAktif, Bagian } =
      body;

    // =======================================
    // CEK USER
    // =======================================

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

    // =======================================
    // VALIDASI
    // =======================================

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

    // =======================================
    // CEK ROLE
    // =======================================

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

    // =======================================
    // CEK USERNAME DUPLIKAT
    // =======================================

    const username = Username.trim();

    const duplicateUser = await prisma.Users.findFirst({
      where: {
        Username: username,

        NOT: {
          IdUser,
        },
      },
    });

    if (duplicateUser) {
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

    // =======================================
    // DATA UPDATE
    // =======================================

    const updateData = {
      IdRole: roleId,

      NamaLengkap: NamaLengkap.trim(),

      Username: username,

      StatusAktif:
        typeof StatusAktif === "boolean"
          ? StatusAktif
          : existingUser.StatusAktif,

      Bagian: Bagian?.trim() || null,
    };

    // =======================================
    // PASSWORD
    // (plaintext sesuai login sekarang)
    // =======================================

    if (Password?.trim()) {
      if (Password.trim().length < 6) {
        return NextResponse.json(
          {
            success: false,
            message: "Password minimal 6 karakter.",
          },
          {
            status: 400,
          },
        );
      }

      updateData.Password = Password.trim();
    }

    // =======================================
    // UPDATE
    // =======================================

    const user = await prisma.Users.update({
      where: {
        IdUser,
      },

      data: updateData,
    });

    return NextResponse.json({
      success: true,

      message: "Data user berhasil diperbarui.",

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
    });
  } catch (error) {
    console.error("PUT USER ERROR:", error);

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
    const { id } = params;

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

    // ==========================================
    // CEK USER
    // ==========================================

    const user = await prisma.users.findUnique({
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
        {
          status: 404,
        },
      );
    }

    // ==========================================
    // CEK DIPAKAI DI PENILAIAN
    // ==========================================

    const totalPenilaian = await prisma.penilaian.count({
      where: {
        IdSupervisor: IdUser,
      },
    });

    if (totalPenilaian > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `User "${user.NamaLengkap}" tidak dapat dihapus karena digunakan pada ${totalPenilaian} data penilaian.`,

          canDeactivate: true,
        },
        {
          status: 409,
        },
      );
    }

    // ==========================================
    // HAPUS USER
    // ==========================================

    await prisma.users.delete({
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

    if (error?.code === "P2003") {
      return NextResponse.json(
        {
          success: false,
          message:
            "User tidak dapat dihapus karena masih digunakan oleh data lain.",

          canDeactivate: true,
        },
        {
          status: 409,
        },
      );
    }

    return NextResponse.json(
      {
        success: false,
        message: "Gagal menghapus data user.",

        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      {
        status: 500,
      },
    );
  }
}
