// CL.01 - Check List Tahap Persiapan Inspeksi

export const PERLENGKAPAN_PERALATAN = [
  { no: 1, nama: 'Handy Talky' },
  { no: 2, nama: 'Bendera Lapangan' },
  { no: 3, nama: 'Rambu Barikade/Traffic Cone' },
  { no: 4, nama: 'Tali' },
  { no: 5, nama: 'Sapu Lidi & Pengki' },
  { no: 6, nama: 'Meteran' },
  { no: 7, nama: 'Sosotan Karet / Wiper' },
  { no: 8, nama: 'Emergency Light' },
  { no: 9, nama: 'Cat Semprot Manual' },
  { no: 10, nama: 'Kamera Digital' },
  { no: 11, nama: 'Linggis' },
  { no: 12, nama: 'Cangkul' },
];

export const KENDARAAN = [
  { no: 1, nama: 'Radio Mobil' },
  { no: 2, nama: 'Ban Kendaraan' },
  { no: 3, nama: 'Mesin Kendaraan' },
  { no: 4, nama: 'Wiper Kaca' },
  { no: 5, nama: 'Lampu Sign' },
  { no: 6, nama: 'Rotari Light' },
  { no: 7, nama: 'Lampu Besar/Sorot' },
  { no: 8, nama: 'Ketersediaan BBM' },
  { no: 9, nama: 'Tool Kit' },
];

export const ALAT_PELINDUNG_DIRI = [
  { no: 1, nama: 'Topi/Tudung Kepala' },
  { no: 2, nama: 'Kacamata Anti UV' },
  { no: 3, nama: 'Rompi Scotchlight' },
  { no: 4, nama: 'Safety Shoes' },
  { no: 5, nama: 'Sarung Tangan' },
  { no: 6, nama: 'Jas Hujan' },
];

// FORM.01 - Formulir Kegiatan Inspeksi

export interface FormInspectionItem {
  id: string;
  label: string;
  parent?: string;
  level: number; // 0 = category, 1 = subcategory, 2 = item
}

export const KONDISI_PERMUKAAN: FormInspectionItem[] = [
  { id: 'kp', label: 'KONDISI PERMUKAAN', level: 0 },
  { id: 'kp_runway', label: 'Runway', parent: 'kp', level: 1 },
  { id: 'kp_runway_a', label: 'Air di permukaan', parent: 'kp_runway', level: 2 },
  { id: 'kp_runway_b', label: 'Retak atau pecah', parent: 'kp_runway', level: 2 },
  { id: 'kp_runway_c', label: 'Rubber deposit', parent: 'kp_runway', level: 2 },
  { id: 'kp_runway_d', label: 'Ketidakteraturan permukaan', parent: 'kp_runway', level: 2 },
  { id: 'kp_runway_e', label: 'Tumpahan cairan korosif', parent: 'kp_runway', level: 2 },
  { id: 'kp_runway_f', label: 'Gundukan rayap', parent: 'kp_runway', level: 2 },
  { id: 'kp_runway_g', label: 'Ketinggian rumput', parent: 'kp_runway', level: 2 },
  { id: 'kp_taxiway', label: 'Taxiway', parent: 'kp', level: 1 },
  { id: 'kp_taxiway_a', label: 'Air di permukaan', parent: 'kp_taxiway', level: 2 },
  { id: 'kp_taxiway_b', label: 'Retak atau pecah', parent: 'kp_taxiway', level: 2 },
  { id: 'kp_taxiway_c', label: 'Rubber deposit', parent: 'kp_taxiway', level: 2 },
  { id: 'kp_taxiway_d', label: 'Ketidakteraturan permukaan', parent: 'kp_taxiway', level: 2 },
  { id: 'kp_taxiway_e', label: 'Tumpahan cairan korosif', parent: 'kp_taxiway', level: 2 },
  { id: 'kp_taxiway_f', label: 'Gundukan rayap', parent: 'kp_taxiway', level: 2 },
  { id: 'kp_taxiway_g', label: 'Ketinggian rumput', parent: 'kp_taxiway', level: 2 },
  { id: 'kp_apron', label: 'Apron', parent: 'kp', level: 1 },
  { id: 'kp_apron_a', label: 'Air di permukaan', parent: 'kp_apron', level: 2 },
  { id: 'kp_apron_b', label: 'Retak atau pecah', parent: 'kp_apron', level: 2 },
  { id: 'kp_apron_c', label: 'Rubber deposit', parent: 'kp_apron', level: 2 },
  { id: 'kp_apron_d', label: 'Ketidakteraturan permukaan', parent: 'kp_apron', level: 2 },
  { id: 'kp_apron_e', label: 'Tumpahan cairan korosif', parent: 'kp_apron', level: 2 },
  { id: 'kp_apron_f', label: 'Gundukan rayap', parent: 'kp_apron', level: 2 },
  { id: 'kp_apron_g', label: 'Ketinggian rumput', parent: 'kp_apron', level: 2 },
];

export const MARKA_DAN_RAMBU: FormInspectionItem[] = [
  { id: 'mr', label: 'MARKA DAN RAMBU', level: 0 },
  { id: 'mr_runway', label: 'Runway', parent: 'mr', level: 1 },
  { id: 'mr_runway_a', label: 'Visibilitas marka', parent: 'mr_runway', level: 2 },
  { id: 'mr_runway_b', label: 'Visibilitas rambu', parent: 'mr_runway', level: 2 },
  { id: 'mr_taxiway', label: 'Taxiway', parent: 'mr', level: 1 },
  { id: 'mr_taxiway_a', label: 'Visibilitas marka', parent: 'mr_taxiway', level: 2 },
  { id: 'mr_taxiway_b', label: 'Visibilitas rambu', parent: 'mr_taxiway', level: 2 },
  { id: 'mr_apron', label: 'Apron', parent: 'mr', level: 1 },
  { id: 'mr_apron_a', label: 'Visibilitas marka', parent: 'mr_apron', level: 2 },
  { id: 'mr_apron_b', label: 'Visibilitas rambu', parent: 'mr_apron', level: 2 },
];

export const KEBERSIHAN_AREA: FormInspectionItem[] = [
  { id: 'ka', label: 'KEBERSIHAN AREA PERGERAKAN', level: 0 },
  { id: 'ka_runway', label: 'Runway', parent: 'ka', level: 1 },
  { id: 'ka_runway_a', label: 'Benda asing (foreign object)', parent: 'ka_runway', level: 2 },
  { id: 'ka_taxiway', label: 'Taxiway', parent: 'ka', level: 1 },
  { id: 'ka_taxiway_a', label: 'Benda asing (foreign object)', parent: 'ka_taxiway', level: 2 },
  { id: 'ka_apron', label: 'Apron', parent: 'ka', level: 1 },
  { id: 'ka_apron_a', label: 'Benda asing (foreign object)', parent: 'ka_apron', level: 2 },
];

export const OBSTACLE: FormInspectionItem[] = [
  { id: 'ob', label: 'OBSTACLE', level: 0 },
  { id: 'ob_a', label: 'Area Take-off', parent: 'ob', level: 2 },
  { id: 'ob_b', label: 'Area Approach', parent: 'ob', level: 2 },
  { id: 'ob_c', label: 'Area Transisi', parent: 'ob', level: 2 },
];

export const BURUNG_BINATANG: FormInspectionItem[] = [
  { id: 'bb', label: 'BURUNG ATAU BINATANG LAIN', level: 0 },
  { id: 'bb_a', label: 'Area Runway', parent: 'bb', level: 2 },
  { id: 'bb_b', label: 'Area Taxiway', parent: 'bb', level: 2 },
  { id: 'bb_c', label: 'Area Apron', parent: 'bb', level: 2 },
];

export const PAGAR_SISI_UDARA: FormInspectionItem[] = [
  { id: 'psu', label: 'PAGAR SISI UDARA', level: 0 },
  { id: 'psu_a', label: 'Kondisi Pagar', parent: 'psu', level: 2 },
];

export const MASA_BERLAKU_NOTAM: FormInspectionItem[] = [
  { id: 'mbn', label: 'MASA BERLAKU NOTAM', level: 0 },
  { id: 'mbn_a', label: 'Isi NOTAM', parent: 'mbn', level: 2 },
  { id: 'mbn_b', label: 'Masa berlaku', parent: 'mbn', level: 2 },
];

export const DRAINASE: FormInspectionItem[] = [
  { id: 'dr', label: 'DRAINASE', level: 0 },
  { id: 'dr_a', label: 'Saluran Terbuka', parent: 'dr', level: 2 },
  { id: 'dr_b', label: 'Saluran Tertutup', parent: 'dr', level: 2 },
];

export const ALL_FORM_SECTIONS = [
  { key: 'kondisi_permukaan', no: 1, items: KONDISI_PERMUKAAN },
  { key: 'marka_dan_rambu', no: 2, items: MARKA_DAN_RAMBU },
  { key: 'kebersihan_area', no: 3, items: KEBERSIHAN_AREA },
  { key: 'obstacle', no: 4, items: OBSTACLE },
  { key: 'burung_binatang', no: 5, items: BURUNG_BINATANG },
  { key: 'pagar_sisi_udara', no: 6, items: PAGAR_SISI_UDARA },
  { key: 'masa_berlaku_notam', no: 7, items: MASA_BERLAKU_NOTAM },
  { key: 'drainase', no: 8, items: DRAINASE },
];
