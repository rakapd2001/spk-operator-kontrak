export const roles = ["HC/HRD", "Supervisor", "Manager Produksi", "Operator"];

export const menuByRole = {
  "HC/HRD": [
    { label: "Dashboard", href: "/dashboard", icon: "Dashboard" },
    { label: "Data User", href: "/data-user", icon: "People" },
    { label: "Data Operator", href: "/data-operator", icon: "Engineering" },
    { label: "Kriteria Penilaian", href: "/kriteria", icon: "Checklist" },
    { label: "Input Penilaian", href: "/input-penilaian", icon: "EditNote" },
    { label: "Hasil Penilaian", href: "/hasil-penilaian", icon: "Assessment" },
    { label: "Rekomendasi Keputusan", href: "/rekomendasi", icon: "ThumbUp" },
    { label: "Profil", href: "/profil", icon: "Person" },
  ],
  Supervisor: [
    { label: "Dashboard", href: "/dashboard", icon: "Dashboard" },
    { label: "Data Operator", href: "/data-operator", icon: "Engineering" },
    { label: "Input Penilaian", href: "/input-penilaian", icon: "EditNote" },
    { label: "Hasil Penilaian", href: "/hasil-penilaian", icon: "Assessment" },
    { label: "Rekomendasi Keputusan", href: "/rekomendasi", icon: "ThumbUp" },
    { label: "Profil", href: "/profil", icon: "Person" },
  ],
  "Manager Produksi": [
    { label: "Dashboard", href: "/dashboard", icon: "Dashboard" },
    { label: "Data Operator", href: "/data-operator", icon: "Engineering" },
    { label: "Hasil Penilaian", href: "/hasil-penilaian", icon: "Assessment" },
    { label: "Rekomendasi Keputusan", href: "/rekomendasi", icon: "ThumbUp" },
    { label: "Profil", href: "/profil", icon: "Person" },
  ],
  Operator: [
    { label: "Dashboard", href: "/dashboard", icon: "Dashboard" },
    {
      label: "Hasil Penilaian Saya",
      href: "/hasil-penilaian-saya",
      icon: "Assessment",
    },
    { label: "Profil", href: "/profil", icon: "Person" },
  ],
};

export const initialUsers = [
  {
    id: 1,
    fullName: "Rina Wijaya",
    username: "hrdadmin",
    role: "HC/HRD",
    status: "Aktif",
  },
  {
    id: 2,
    fullName: "Dimas Pratama",
    username: "supervisor1",
    role: "Supervisor",
    status: "Aktif",
  },
  {
    id: 3,
    fullName: "Sigit Haryanto",
    username: "manager1",
    role: "Manager Produksi",
    status: "Aktif",
  },
  {
    id: 4,
    fullName: "Beni Saputra",
    username: "operator",
    role: "Operator",
    status: "Aktif",
  },
];

export const initialOperators = [
  {
    id: 1,
    nik: "TRG-001",
    name: "Agus Santoso",
    gender: "Laki-laki",
    section: "Finishing",
    joinDate: "2022-04-10",
    tenure: "3 tahun",
    status: "Aktif",
  },
  {
    id: 2,
    nik: "TRG-002",
    name: "Nanda Putri",
    gender: "Perempuan",
    section: "Cutting",
    joinDate: "2021-08-14",
    tenure: "4 tahun",
    status: "Aktif",
  },
  {
    id: 3,
    nik: "TRG-003",
    name: "Hendra Kurnia",
    gender: "Laki-laki",
    section: "Sewing",
    joinDate: "2023-01-05",
    tenure: "2 tahun",
    status: "Aktif",
  },
  {
    id: 4,
    nik: "TRG-004",
    name: "Dewi Lestari",
    gender: "Perempuan",
    section: "Packing",
    joinDate: "2020-11-20",
    tenure: "5 tahun",
    status: "Aktif",
  },
  {
    id: 5,
    nik: "TRG-005",
    name: "Rizky Maulana",
    gender: "Laki-laki",
    section: "Sewing",
    joinDate: "2024-02-17",
    tenure: "1 tahun",
    status: "Evaluasi",
  },
];

export const criteria = [
  {
    code: "C1",
    name: "Pengetahuan Kerja",
    type: "Benefit",
    indicator:
      "Memahami SOP kerja, memahami proses produksi, memahami fungsi alat atau mesin",
    description:
      "Mengukur pemahaman operator terhadap standar kerja dan proses produksi.",
  },
  {
    code: "C2",
    name: "Keterampilan Kerja",
    type: "Benefit",
    indicator:
      "Kemampuan mengoperasikan mesin, ketepatan bekerja, kecepatan menyelesaikan pekerjaan",
    description:
      "Menilai kecakapan operator dalam menyelesaikan pekerjaan sesuai standar.",
  },
  {
    code: "C3",
    name: "Kualitas Hasil Kerja",
    type: "Benefit",
    indicator:
      "Ketelitian, kerapihan, tingkat defect rendah, sesuai standar kualitas",
    description:
      "Menilai konsistensi kualitas output yang dihasilkan oleh operator.",
  },
  {
    code: "C4",
    name: "Produktivitas Kerja",
    type: "Benefit",
    indicator:
      "Mencapai target produksi, efisiensi waktu, konsistensi produksi",
    description:
      "Menilai kemampuan operator mencapai target produksi dengan baik.",
  },
  {
    code: "C5",
    name: "Kehadiran",
    type: "Benefit",
    indicator:
      "Tingkat kehadiran, ketepatan waktu, tidak sering izin atau terlambat",
    description:
      "Menilai kedisiplinan kehadiran operator selama periode evaluasi.",
  },
  {
    code: "C6",
    name: "Disiplin",
    type: "Benefit",
    indicator:
      "Mematuhi peraturan, menggunakan APD, menjalankan instruksi atasan",
    description:
      "Mengukur sikap disiplin operator dalam menjalankan aturan kerja.",
  },
  {
    code: "C7",
    name: "Sikap Kerja",
    type: "Benefit",
    indicator: "Tanggung jawab, kejujuran, inisiatif, etika kerja",
    description: "Mengukur karakter kerja dan tanggung jawab operator.",
  },
  {
    code: "C8",
    name: "Kerja Sama",
    type: "Benefit",
    indicator:
      "Komunikasi, koordinasi tim, saling membantu, menghargai pendapat",
    description: "Menilai kemampuan operator berkolaborasi dalam tim produksi.",
  },
  {
    code: "C9",
    name: "Pengalaman Kerja",
    type: "Benefit",
    indicator:
      "Lama bekerja di perusahaan, pengalaman pada bagian produksi terkait",
    description:
      "Mengukur kontribusi pengalaman yang dimiliki operator terhadap pekerjaan.",
  },
];

export const initialEvaluations = [
  {
    id: 1,
    operatorId: 1,
    nik: "TRG-001",
    name: "Agus Santoso",
    section: "Finishing",
    period: "2026-01",
    scores: { C1: 4, C2: 4, C3: 5, C4: 4, C5: 5, C6: 4, C7: 5, C8: 4, C9: 4 },
    psi: 4.42,
    recommendation: "Karyawan Tetap",
    status: "Karyawan Tetap",
    ranking: 2,
  },
  {
    id: 2,
    operatorId: 2,
    nik: "TRG-002",
    name: "Nanda Putri",
    section: "Cutting",
    period: "2026-01",
    scores: { C1: 5, C2: 5, C3: 4, C4: 5, C5: 4, C6: 5, C7: 4, C8: 5, C9: 5 },
    psi: 4.74,
    recommendation: "Karyawan Tetap",
    status: "Karyawan Tetap",
    ranking: 1,
  },
  {
    id: 3,
    operatorId: 3,
    nik: "TRG-003",
    name: "Hendra Kurnia",
    section: "Sewing",
    period: "2026-01",
    scores: { C1: 3, C2: 3, C3: 4, C4: 3, C5: 4, C6: 3, C7: 4, C8: 3, C9: 4 },
    psi: 3.42,
    recommendation: "Perpanjang Kontrak",
    status: "Perpanjang Kontrak",
    ranking: 3,
  },
  {
    id: 4,
    operatorId: 4,
    nik: "TRG-004",
    name: "Dewi Lestari",
    section: "Packing",
    period: "2026-01",
    scores: { C1: 2, C2: 2, C3: 3, C4: 2, C5: 3, C6: 2, C7: 3, C8: 2, C9: 3 },
    psi: 2.37,
    recommendation: "Tidak Dilanjutkan",
    status: "Tidak Dilanjutkan",
    ranking: 4,
  },
  {
    id: 5,
    operatorId: 5,
    nik: "TRG-005",
    name: "Rizky Maulana",
    section: "Sewing",
    period: "2026-02",
    scores: { C1: 3, C2: 4, C3: 3, C4: 4, C5: 3, C6: 4, C7: 3, C8: 4, C9: 3 },
    psi: 3.51,
    recommendation: "Perpanjang Kontrak",
    status: "Perpanjang Kontrak",
    ranking: 5,
  },
];

export const activities = [
  {
    title: "Penilaian baru disimpan",
    detail: "Supervisor menambahkan evaluasi untuk Agus Santoso",
    time: "10 menit lalu",
  },
  {
    title: "Rekomendasi diperbarui",
    detail: "Hasil PSI periode Januari siap dibagikan ke manager",
    time: "1 jam lalu",
  },
  {
    title: "Data operator ditambahkan",
    detail: "Operator Rizky Maulana masuk ke sistem",
    time: "2 jam lalu",
  },
];

export const reportSummary = {
  totalOperators: 25,
  totalEvaluated: 18,
  recommendedPermanent: 7,
  contractExtension: 9,
  notContinued: 2,
};
