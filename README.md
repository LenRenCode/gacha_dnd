# Gacha DnD

Generator dan character tracker ringan untuk membuat karakter D&D 5e (aturan 2014) tanpa perlu mengisi character sheet satu per satu. Klik tombol gacha untuk membuat petualang level 1 lengkap, lalu ubah hasilnya kapan saja.

## Mulai cepat: DM dan pemain satu hotspot

1. Install Node.js 20 atau lebih baru di komputer DM.
2. Buka terminal di folder project dan jalankan `npm start` (di PowerShell gunakan `npm.cmd start` bila execution policy memblokir `npm.ps1`).
3. Terminal menampilkan **DM page** dan **Player invite** untuk alamat IP lokal. Buka DM page di komputer DM; bagikan hanya Player invite kepada pemain yang terhubung ke hotspot/Wi-Fi yang sama.
4. Pemain memasukkan nama, lalu dapat membuat karakter dengan tombol gacha, mengeditnya, dan mengunduh backup.

Server hanya menggunakan modul bawaan Node.js; tidak perlu memasang package tambahan. Data campaign disimpan lokal di `.gacha-dnd/`, bukan di GitHub. Untuk mengganti port, jalankan dengan `PORT=8081 npm start` (PowerShell: `$env:PORT=8081; npm.cmd start`).

Pemain hanya menerima karakter milik identitas pemainnya sendiri. **Export character** mengunduh seluruh karakter milik pemain beserta identitas portabelnya. Pemain dapat mengunggah file tersebut saat masuk ke invite link DM lain; DM juga dapat mengimpor backup melalui panel campaign.

### Keamanan jaringan

- DM URL adalah kunci rahasia tanpa password: siapa pun yang memilikinya dapat mengelola seluruh campaign. Jangan bagikan URL DM; gunakan hanya pada hotspot pribadi/tepercaya.
- File backup pemain berisi kunci identitas pemilik; simpan seperti kredensial dan jangan bagikan kepada orang lain.
- Server menggunakan HTTP dan tidak menyediakan akun, enkripsi, atau perlindungan untuk jaringan publik. Jangan meneruskan port ke internet. Izinkan Node.js di firewall hanya untuk jaringan privat campaign.
- Data server hanya tersimpan di komputer DM. Buat backup pemain berkala untuk memindahkan karakter atau sebagai cadangan.

Untuk mode lokal tanpa server, buka `index.html` langsung di browser. Dalam mode ini, data tersimpan di `localStorage` browser dan tidak dibagikan ke pemain lain.

## Fitur

- **Gacha karakter sekali klik**: membuat nama, class, ras, background, alignment, ability score, fitur, proficiency, perlengkapan awal, dan gold.
- **Semua 12 class D&D 5e 2014** serta ras dan background pilihan di generator.
- **Roll ability score 4d6, drop lowest**, lalu menempatkan hasil terbaik pada ability utama class dan menerapkan bonus ras.
- **Level dan XP** dengan ambang level D&D 5e.
- **Ability Score Improvement (ASI)**: pilihan +2 ke satu ability atau +1 ke dua ability saat class mencapai milestone ASI. Batas ability standar 20. Fighter dan Rogue memiliki milestone tambahan sesuai aturan 2014.
- **Statistik turunan otomatis**: modifier, HP maksimum, AC dari armor/equipment, attack bonus dan damage, saving throw, skill, spell attack/DC, initiative, passive Perception, dan kapasitas angkut.
- **Character overview, character sheet, dan inventory**: edit karakter, catat HP saat ini, tandai equipment, kelola barang dan gold.
- **Pemilihan skill class** sesuai jumlah pilihan class D&D 5e 2014; skill background ditambahkan otomatis.
- **Export/import karakter JSON** dan cetak character sheet aplikasi menjadi PDF.
- **Mode LAN DM/pemain** dengan campaign lokal, roster karakter, dan backup karakter portabel.
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

Gunakan navigasi untuk membuka overview, character sheet, dan inventory. Perubahan disimpan otomatis di browser dan, saat memakai server, ke campaign lokal DM. Backup pemain mencakup semua karakter milik identitas tersebut agar mudah dipindahkan ke campaign DM lain.

## Batasan dan catatan aturan

- Aplikasi ini **tidak terhubung atau tersinkronisasi dengan 5e.tools**. Tautan 5e.tools digunakan sebagai referensi saja.
- Tombol **Print / Save PDF** mencetak character sheet di aplikasi. Tombol **Official fillable sheet** membuka PDF resmi terpisah; aplikasi tidak mengisi PDF resmi itu secara otomatis.
- Generator memakai asumsi default untuk membentuk karakter cepat. Pilihan starting gear, skill, subclass, spell, fitur, dan detail aturan tertentu dapat berbeda menurut campaign, sumber aturan, atau pilihan pemain; periksa dan sesuaikan dengan DM.
- HP maksimum memakai rata-rata hit die setelah level pertama. AC dihitung dari equipment yang ditandai equipped, Dexterity, serta fitur pertahanan Barbarian/Monk. Beberapa aturan khusus, feat, magic item, dan situasi game mungkin memerlukan koreksi manual.
- Bonus ability score adalah **modifier angka**, bukan persentase. Contoh: score 16 menghasilkan modifier +3.
- Mode LAN tidak menggunakan akun atau sinkronisasi cloud. Pemain dikenali melalui kunci identitas yang tersimpan di browser dan disertakan dalam backup portabel.

## Teknologi

HTML, CSS, dan JavaScript murni; tanpa framework maupun dependency build.
