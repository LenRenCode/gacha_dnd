# Gacha DnD

Generator dan character tracker ringan untuk membuat karakter D&D 5e (aturan 2014) tanpa perlu mengisi character sheet satu per satu. Klik tombol gacha untuk membuat petualang level 1 lengkap, lalu ubah hasilnya kapan saja.

## Mulai

1. Unduh atau clone repository ini.
2. Buka `index.html` dengan browser modern.
3. Klik **Gacha karakter otomatis** untuk langsung membuat karakter acak.

Aplikasi berjalan sepenuhnya di browser dan tidak memerlukan instalasi package atau server backend. Data karakter tersimpan di `localStorage` browser yang sedang digunakan. Menghapus data browser dapat menghapus karakter; gunakan **Export character** untuk menyimpan backup JSON.

## Fitur

- **Gacha karakter sekali klik**: membuat nama, class, ras, background, alignment, ability score, fitur, proficiency, perlengkapan awal, dan gold.
- **Semua 12 class D&D 5e 2014** serta ras dan background pilihan di generator.
- **Roll ability score 4d6, drop lowest**, lalu menempatkan hasil terbaik pada ability utama class dan menerapkan bonus ras.
- **Level dan XP** dengan ambang level D&D 5e.
- **Ability Score Improvement (ASI)**: pilihan +2 ke satu ability atau +1 ke dua ability saat class mencapai milestone ASI. Batas ability standar 20. Fighter dan Rogue memiliki milestone tambahan sesuai aturan 2014.
- **Statistik turunan otomatis**: modifier, HP maksimum, AC dari armor/equipment, attack bonus dan damage, saving throw, skill, spell attack/DC, initiative, passive Perception, dan kapasitas angkut.
- **Character overview, character sheet, dan inventory**: edit karakter, catat HP saat ini, tandai equipment, kelola barang dan gold.
- **Export/import karakter JSON** dan cetak character sheet aplikasi menjadi PDF.
- Tautan referensi ke [5e.tools class list](https://5e.tools/classes.html) dan [official fillable character sheet PDF](https://media.wizards.com/2016/dnd/downloads/5E_CharacterSheet_Fillable.pdf).

## Cara menggunakan

### Membuat karakter

Klik **Gacha karakter otomatis**. Karakter baru langsung aktif dan muncul di daftar karakter. Klik tombol gacha lagi untuk membuat karakter acak lainnya. Untuk mengatur karakter manual, buka **Character sheet** dan isi form yang diperlukan.

### Naik level dan memakai ASI

Masukkan XP pada **Level progression** dan pilih **Update XP**, atau ubah level di character sheet. Saat mencapai milestone ASI untuk class, buka bagian **Ability score improvements** di overview:

1. Pilih **+2 to one stat** atau **+1 to two stats**.
2. Klik ability yang ingin dinaikkan sampai kedua poin dialokasikan.
3. Statistik turunan akan langsung diperbarui. Alokasi yang belum lengkap dapat dibatalkan.

Milestone standar: level 4, 8, 12, 16, dan 19; Fighter juga mendapatkannya di level 6 dan 14, sementara Rogue mendapatkannya di level 10.

### Mengelola karakter

Gunakan navigasi untuk membuka overview, character sheet, dan inventory. Perubahan disimpan otomatis di browser. Tombol **Export character** mengunduh karakter aktif sebagai JSON; **Import JSON** dapat memuat file tersebut kembali sebagai karakter baru.

## Batasan dan catatan aturan

- Aplikasi ini **tidak terhubung atau tersinkronisasi dengan 5e.tools**. Tautan 5e.tools digunakan sebagai referensi saja.
- Tombol **Print / Save PDF** mencetak character sheet di aplikasi. Tombol **Official fillable sheet** membuka PDF resmi terpisah; aplikasi tidak mengisi PDF resmi itu secara otomatis.
- Generator memakai asumsi default untuk membentuk karakter cepat. Pilihan starting gear, skill, subclass, spell, fitur, dan detail aturan tertentu dapat berbeda menurut campaign, sumber aturan, atau pilihan pemain; periksa dan sesuaikan dengan DM.
- HP maksimum memakai rata-rata hit die setelah level pertama. AC dihitung dari equipment yang ditandai equipped, Dexterity, serta fitur pertahanan Barbarian/Monk. Beberapa aturan khusus, feat, magic item, dan situasi game mungkin memerlukan koreksi manual.
- Bonus ability score adalah **modifier angka**, bukan persentase. Contoh: score 16 menghasilkan modifier +3.
- Data tersimpan per browser/perangkat dan tidak memiliki sinkronisasi cloud atau akun pengguna.

## Teknologi

HTML, CSS, dan JavaScript murni; tanpa framework maupun dependency build.
