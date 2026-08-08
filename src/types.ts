export type PilihanStudiLanjutType = 'AKADEMI' | 'Bekerja' | 'Kuliah';

export type JenisPrestasi = 'Akademik' | 'Non-Akademik';

export type TingkatPrestasi = 'Kota/Kabupaten' | 'Provinsi' | 'Nasional' | 'Internasional';

export interface PrestasiItem {
  id: string;
  namaPrestasi: string;
  jenis: JenisPrestasi;
  tingkat: TingkatPrestasi;
  lembaga: string;
}

export interface Student {
  id: string;
  namaSiswa: string;
  nis: string;
  nisn: string;
  kelas: string;
  jenisKelamin: 'L' | 'P';
  mapelTka1: string;
  mapelTka2: string;
  pilihanStudiLanjut: PilihanStudiLanjutType;
  prodiPilihan1: string;
  prodiPilihan2: string;
  ptn1?: string;
  ptn2?: string;
  mengajukanKipKuliah?: 'Ya' | 'Tidak';
  kategoriDesil?: 'Desil 1' | 'Desil 2' | 'Desil 3' | 'Desil 4' | 'Desil 5' | '';
  noHp?: string;
  fotoSiswa?: string;
  prestasiList?: PrestasiItem[];
  catatan?: string;
  updatedAt: string;
}

export type NavigationTab = 'dashboard' | 'students' | 'form' | 'analysis' | 'appscript' | 'laptop' | 'settings' | 'banpt' | 'mapelPilihan';

export type StatusKelayakanLaptop = 'LAYAK' | 'TIDAK LAYAK';

export interface LaptopData {
  id: string;
  studentId?: string;
  namaSiswa: string;
  kelas: string;
  gelombang: string;
  merkLaptop: string;
  kelengkapan: {
    charger: boolean;
    mouse: boolean;
    keyboard: boolean;
  };
  kodeRuang: string;
  noUrutLaptop: string;
  namaTeknisi: string;
  statusKelayakan: StatusKelayakanLaptop;
  catatanKondisi?: string;
  namaOrangTua?: string;
  updatedAt: string;
}

export interface ProktorTeknisi {
  id: string;
  kodeRuang: string; // Nomor Ruang / Lab
  noUrutLaptop: string; // Nomor Urut atau Range No Urut (misal: "01" atau "01 - 20")
  namaTeknisi: string;
  nipTeknisi?: string;
  namaProktor: string;
  nipProktor?: string;
  keterangan?: string;
}

export interface DocumentSettings {
  namaSekolah: string;
  subHeader: string;
  alamatSekolah: string;
  kotaTanggal: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string;
  nomorSuratPrefix: string;
  judulSuratOrtu: string;
  keteranganSuratOrtu: string;
  judulFormTeknisi: string;
  keteranganFormTeknisi: string;
}

export interface StudentFilter {
  searchQuery: string;
  kelas: string;
  mapelTka: string;
  ptnProdi: string;
}

export interface MapelTkaCount {
  name: string;
  count1: number;
  count2: number;
  total: number;
}

export interface ProdiCount {
  name: string;
  count1: number;
  count2: number;
  total: number;
}
