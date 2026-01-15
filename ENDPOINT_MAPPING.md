# API Endpoint Mapping Documentation

**Dokumentasi lengkap mapping URL Frontend dan endpoint API yang digunakan di setiap halaman sistem.**

## 📊 Quick Stats
- **Total Halaman:** 22 halaman (termasuk auth & onboard)
- **Total Unique Endpoints:** 45 endpoint
- **HTTP Methods:** GET, POST, PATCH, DELETE
- **User Roles:** Public, New Users, RISK_OWNER, RISK_MANAGER, TOP_MANAGEMENT

---

## 📑 Table of Contents
1. [Authentication](#authentication)
2. [Onboarding](#onboarding)
3. [Asset Management](#1-aset-asset-management)
4. [Risk Management](#2-risiko-risk-management)
5. [Risk Treatment](#3-treatment-risk-treatment)
6. [Control Implementation](#4-kontrol-control-implementation)
7. [Monitoring & Review](#5-monitoring-monitoring--review)
8. [Organization Context](#6-organisasi-organization-context)
9. [User Management](#7-user-management)
10. [Unique Endpoints Summary](#mapping-endpoint-unik)

---

## AUTHENTICATION

**Modul untuk autentikasi pengguna (login, register).**

### /auth/login
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Login | POST | `/auth/login` | Autentikasi pengguna dengan email dan password |

### /auth/register
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Register | POST | `/auth/register` | Registrasi user baru ke sistem |
| 2 | Auto Login | POST | `/auth/login` | Login otomatis setelah registrasi berhasil |

---

## ONBOARDING

**Modul untuk onboarding pengguna baru (profil perusahaan).**

### /onboard/welcome
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Welcome | NONE | - | Halaman sambutan onboarding (tidak ada API call) |

### /onboard/company-profile
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Get Profile | GET | `/auth/me` | Mengambil data profil user yang sedang login |
| 2 | Create Organization | POST | `/organizations` | Membuat profil perusahaan/organisasi baru |

---

**Modul untuk mengelola aset perusahaan dan pengajuan persetujuan aset.**

### /dashboard/aset/daftar-aset
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Assets | GET | `/assets` | Mengambil daftar aset dengan pagination dan filter status |
| 2 | Load Types | GET | `/asset-types` | Mengambil daftar tipe aset |
| 3 | Load Classifications | GET | `/asset-classifications` | Mengambil daftar klasifikasi aset |
| 4 | Create Asset | POST | `/assets` | Membuat aset baru |
| 5 | Update Asset | PATCH | `/assets/{id}` | Memperbarui data aset (nama, lokasi, tipe, klasifikasi) |
| 6 | Submit to Approval | PATCH | `/assets/{id}` | Mengubah status menjadi MENUNGGU_PERSETUJUAN_RM |
| 7 | Revise Asset | PATCH | `/assets/{id}` | Merevisi aset yang ditolak |
| 8 | Revert to Draft | PATCH | `/assets/{id}` | Mengembalikan status ke DRAFT |
| 9 | Delete Asset | DELETE | `/assets/{id}` | Menghapus aset |

### /dashboard/aset/persetujuan-aset
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Approvals | GET | `/asset-approvals` | Mengambil daftar pengajuan persetujuan aset dengan pagination |
| 2 | Approve Approval | PATCH | `/asset-approvals/{id}` | Menyetujui pengajuan persetujuan aset |
| 3 | Reject Approval | PATCH | `/asset-approvals/{id}` | Menolak pengajuan persetujuan aset |

### /dashboard/aset/persetujuan-aset/buat-ajuan
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Approved Assets | GET | `/assets?status=DISETUJUI_RM` | Mengambil aset yang sudah disetujui Risk Manager |
| 2 | Create Approval Request | POST | `/asset-approvals` | Membuat pengajuan persetujuan final untuk aset |

### /dashboard/aset/persetujuan-aset/detail/[id]
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Detail | GET | `/asset-approvals/{id}` | Mengambil detail pengajuan persetujuan aset |
| 2 | Approve | PATCH | `/asset-approvals/{id}` | Menyetujui detail pengajuan aset (status: DISETUJUI) |
| 3 | Reject | PATCH | `/asset-approvals/{id}` | Menolak detail pengajuan aset (status: DITOLAK) |

---

## 2. RISIKO (Risk Management)

**Modul untuk identifikasi, penilaian, dan persetujuan risiko perusahaan.**

### /dashboard/risiko/daftar-risiko
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Risks | GET | `/risk-registers` | Mengambil daftar risiko dengan pagination |
| 2 | Load Categories | GET | `/risk-registers/category` | Mengambil kategori risiko |
| 3 | Load Sources | GET | `/risk-registers/source` | Mengambil sumber risiko |
| 4 | Load Assets | GET | `/assets` | Mengambil daftar aset untuk dropdown |
| 5 | Load Contexts | GET | `/contexts` | Mengambil konteks organisasi |
| 6 | Load Risk Criteria | GET | `/risk-criteria` | Mengambil kriteria penilaian risiko |
| 7 | Load Users | GET | `/user-management` | Mengambil daftar user untuk owner/PIC |
| 8 | Create Risk | POST | `/risk-registers` | Membuat risiko baru |
| 9 | Update Risk | PATCH | `/risk-registers/{id}` | Memperbarui data risiko |
| 10 | Submit to Approval | PATCH | `/risk-registers/{id}` | Mengubah status ke MENUNGGU_PERSETUJUAN |
| 11 | Approve Risk | PATCH | `/risk-registers/{id}` | Menyetujui risiko (RM) |
| 12 | Reject Risk | PATCH | `/risk-registers/{id}` | Menolak risiko (RM) |
| 13 | Delete Risk | DELETE | `/risk-registers/{id}` | Menghapus risiko |

### /dashboard/risiko/persetujuan-risiko
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Approvals | GET | `/risk-approvals` | Mengambil daftar pengajuan persetujuan risiko dengan pagination |
| 2 | Approve | PATCH | `/risk-approvals/{id}` | Menyetujui pengajuan persetujuan risiko |
| 3 | Reject | PATCH | `/risk-approvals/{id}` | Menolak pengajuan persetujuan risiko |

### /dashboard/risiko/persetujuan-risiko/buat-ajuan
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Risk Criteria | GET | `/risk-criteria` | Mengambil kriteria penilaian risiko |
| 2 | Load Approved Risks | GET | `/risk-registers` | Mengambil risiko yang sudah disetujui RM |
| 3 | Create Approval | POST | `/risk-approvals` | Membuat pengajuan persetujuan final risiko |

### /dashboard/risiko/persetujuan-risiko/detail/[id]
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Approval Detail | GET | `/risk-approvals/{id}` | Mengambil detail pengajuan persetujuan risiko |
| 2 | Load Risk Criteria | GET | `/risk-criteria` | Mengambil kriteria untuk display detail risiko |
| 3 | Approve | PATCH | `/risk-approvals/{id}` | Menyetujui pengajuan persetujuan risiko |
| 4 | Reject | PATCH | `/risk-approvals/{id}` | Menolak pengajuan persetujuan risiko |

### /dashboard/risiko/prioritas-risiko
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Risk Criteria | GET | `/risk-criteria` | Mengambil kriteria penilaian risiko |
| 2 | Load Risks | GET | `/risk-registers` | Mengambil daftar risiko untuk analisis prioritas |

---

## 3. TREATMENT (Risk Treatment)

**Modul untuk perencanaan dan implementasi treatment/mitigasi risiko.**

### /dashboard/treatment/daftar-treatment
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Treatments | GET | `/treatments` | Mengambil daftar treatment |
| 2 | Load Approvals | GET | `/treatment-approvals` | Mengambil pengajuan persetujuan treatment |
| 3 | Approve Treatment | PATCH | `/treatments/{id}` | Menyetujui treatment |
| 4 | Update Treatment | PATCH | `/treatments/{id}` | Memperbarui treatment |

### /dashboard/treatment/residu-risiko
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Risk Revisions | GET | `/risk-revisions` | Mengambil daftar revisi risiko residual |
| 2 | Load Risk Criteria | GET | `/risk-criteria` | Mengambil kriteria penilaian risiko |
| 3 | Create Risk Revision | POST | `/risk-revisions` | Membuat revisi risiko (setelah treatment) |
| 4 | Reload Revisions | GET | `/risk-revisions` | Memuat ulang data revisi |

---

## 4. KONTROL (Control Implementation)

**Modul untuk implementasi kontrol dan Statement of Applicability (SoA).**

### /dashboard/kontrol/daftar-kontrol
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Controls | GET | `/controls` | Mengambil daftar kontrol dari database |
| 2 | Load Users | GET | `/users` | Mengambil daftar user untuk assign ownership |
| 3 | Update Control SOA | PATCH | `/controls/{id}/soa` | Memperbarui status SOA dan relevance kontrol |
| 4 | Create Control | POST | `/controls` | Membuat kontrol baru |
| 5 | Delete Control | DELETE | `/controls/{id}` | Menghapus kontrol |

### /dashboard/kontrol/soa
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load SOA | GET | `/soa` | Mengambil Statement of Applicability |
| 2 | Update SOA | PATCH | `/soa/{id}` | Memperbarui status implementasi kontrol |

---

## 5. MONITORING (Monitoring & Review)

**Modul untuk monitoring dan review berkelanjutan status risiko, treatment, dan kontrol.**

### /dashboard/monitoring/daftar-tugas
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Tasks | GET | `/tasks` | Mengambil semua tugas monitoring dari semua module |

### /dashboard/monitoring/rangkuman-risiko
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Statistics | GET | `/statistics` | Mengambil ringkasan statistik risiko, treatment, dan kontrol |

---

## 6. ORGANISASI (Organization Context)

**Modul untuk konfigurasi konteks organisasi dan kriteria penilaian risiko.**

### /dashboard/organisasi/konteks-organisasi
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Technical Bounds | GET | `/contexts` | Mengambil daftar konteks/batasan teknis |
| 2 | Load Internal Stakeholders | GET | `/users` | Mengambil daftar user internal sebagai stakeholder |
| 3 | Load External Stakeholders | GET | `/external-stakeholders` | Mengambil daftar external stakeholders |
| 4 | Load CIA Objectives | GET | `/cia/objectives` | Mengambil CIA (Confidentiality, Integrity, Availability) objectives |
| 5 | Load Regulations | GET | `/regulations` | Mengambil daftar regulasi yang berlaku |
| 6 | Create Context | POST | `/contexts` | Membuat konteks/batasan teknis baru |
| 7 | Update Context | PATCH | `/contexts/{id}` | Memperbarui konteks teknis |
| 8 | Delete Context | DELETE | `/contexts/{id}` | Menghapus konteks teknis |
| 9 | Create Internal Stakeholder | POST | `/users` | Membuat internal stakeholder/user baru |
| 10 | Update Internal Stakeholder | PATCH | `/users/{id}` | Memperbarui data internal stakeholder |
| 11 | Delete Internal Stakeholder | DELETE | `/users/{id}` | Menghapus internal stakeholder |
| 12 | Create External Stakeholder | POST | `/external-stakeholders` | Membuat external stakeholder baru |
| 13 | Update External Stakeholder | PATCH | `/external-stakeholders/{id}` | Memperbarui external stakeholder |
| 14 | Delete External Stakeholder | DELETE | `/external-stakeholders/{id}` | Menghapus external stakeholder |
| 15 | Update CIA Objectives | PATCH | `/cia/objectives` | Memperbarui CIA objectives definition |
| 16 | Create Service Priority | POST | `/cia/service-priorities` | Membuat prioritas layanan untuk CIA |
| 17 | Update Service Priority | PATCH | `/cia/service-priorities/{id}` | Memperbarui prioritas layanan CIA |
| 18 | Delete Service Priority | DELETE | `/cia/service-priorities/{id}` | Menghapus prioritas layanan CIA |
| 19 | Create Regulation | POST | `/regulations` | Membuat regulasi baru |
| 20 | Update Regulation | PATCH | `/regulations/{id}` | Memperbarui data regulasi |
| 21 | Delete Regulation | DELETE | `/regulations/{id}` | Menghapus regulasi |

### /dashboard/organisasi/kriteria-risiko
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Risk Criteria | GET | `/risk-criteria` | Mengambil kriteria penilaian risiko yang sudah dikonfigurasi |
| 2 | Update FMEA Setting | PATCH | `/risk-criteria` | Memperbarui penggunaan FMEA method |
| 3 | Update Scale | PATCH | `/risk-criteria/scale` | Memperbarui skala penilaian (1-5) |
| 4 | Update Threshold | PATCH | `/risk-criteria/threshold` | Memperbarui threshold penerimaan risiko |

---

## 7. USER MANAGEMENT

**Modul untuk manajemen user dan departemen organisasi.**

### /dashboard/user/registry
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Users | GET | `/users` | Mengambil daftar user dengan pagination |
| 2 | Create User | POST | `/users` | Membuat user baru |
| 3 | Update User | PATCH | `/users/{id}` | Memperbarui data user (nama, email, role, etc) |
| 4 | Delete User | DELETE | `/users/{id}` | Menghapus user |

### /dashboard/user/access
| No | Fungsi | Method | Endpoint | Deskripsi |
|---|---|---|---|---|
| 1 | Load Departments | GET | `/departments` | Mengambil daftar departemen/divisi |
| 2 | Create Department | POST | `/departments` | Membuat departemen baru |
| 3 | Update Department | PATCH | `/departments/{id}` | Memperbarui data departemen |
| 4 | Delete Department | DELETE | `/departments/{id}` | Menghapus departemen |

---

## RINGKASAN STATISTIK

| Kategori | Halaman | Endpoint |
|:---|:---:|:---:|
| Authentication | 2 | 2 |
| Onboarding | 2 | 3 |
| Aset | 4 | 12 |
| Risiko | 4 | 22 |
| Treatment | 2 | 4 |
| Kontrol | 2 | 6 |
| Monitoring | 2 | 2 |
| Organisasi | 2 | 26 |
| User Management | 2 | 8 |
| **TOTAL** | **24** | **85** |

---

## MAPPING ENDPOINT UNIK

### Authentication Endpoints
- `POST /auth/login` - Login pengguna
- `POST /auth/register` - Register pengguna baru

### Onboarding Endpoints
- `GET /auth/me` - Ambil profil user
- `POST /organizations` - Buat profil perusahaan

### Asset Endpoints
- `GET /assets` - Mengambil aset
- `GET /asset-types` - Tipe aset
- `GET /asset-classifications` - Klasifikasi aset
- `POST /assets` - Buat aset
- `PATCH /assets/{id}` - Update aset
- `DELETE /assets/{id}` - Hapus aset
- `GET /asset-approvals` - Pengajuan persetujuan aset
- `POST /asset-approvals` - Buat pengajuan persetujuan
- `PATCH /asset-approvals/{id}` - Approve/Reject pengajuan

### Risk Endpoints
- `GET /risk-registers` - Daftar risiko
- `GET /risk-registers/category` - Kategori risiko
- `GET /risk-registers/source` - Sumber risiko
- `POST /risk-registers` - Buat risiko
- `PATCH /risk-registers/{id}` - Update risiko
- `DELETE /risk-registers/{id}` - Hapus risiko
- `GET /risk-approvals` - Pengajuan persetujuan risiko
- `POST /risk-approvals` - Buat pengajuan persetujuan
- `PATCH /risk-approvals/{id}` - Approve/Reject pengajuan
- `GET /risk-criteria` - Kriteria penilaian risiko
- `GET /risk-revisions` - Revisi risiko residual
- `POST /risk-revisions` - Buat revisi risiko

### Control Endpoints
- `GET /controls` - Daftar kontrol
- `POST /controls` - Buat kontrol
- `DELETE /controls/{id}` - Hapus kontrol
- `PATCH /controls/{id}/soa` - Update SOA
- `GET /soa` - Statement of Applicability
- `PATCH /soa/{id}` - Update implementasi kontrol

### Treatment Endpoints
- `GET /treatments` - Daftar treatment
- `PATCH /treatments/{id}` - Update treatment
- `GET /treatment-approvals` - Pengajuan persetujuan treatment

### Organization & User Endpoints
- `GET /contexts` - Daftar konteks/batasan teknis
- `POST /contexts` - Buat konteks
- `PATCH /contexts/{id}` - Update konteks
- `DELETE /contexts/{id}` - Hapus konteks
- `GET /external-stakeholders` - Daftar external stakeholders
- `POST /external-stakeholders` - Buat external stakeholder
- `PATCH /external-stakeholders/{id}` - Update external stakeholder
- `DELETE /external-stakeholders/{id}` - Hapus external stakeholder
- `GET /cia/objectives` - Ambil CIA objectives
- `PATCH /cia/objectives` - Update CIA objectives
- `POST /cia/service-priorities` - Buat prioritas layanan CIA
- `PATCH /cia/service-priorities/{id}` - Update prioritas layanan CIA
- `DELETE /cia/service-priorities/{id}` - Hapus prioritas layanan CIA
- `GET /regulations` - Daftar regulasi
- `POST /regulations` - Buat regulasi
- `PATCH /regulations/{id}` - Update regulasi
- `DELETE /regulations/{id}` - Hapus regulasi
- `GET /users` - Daftar user
- `POST /users` - Buat user
- `PATCH /users/{id}` - Update user
- `DELETE /users/{id}` - Hapus user
- `GET /departments` - Daftar departemen
- `POST /departments` - Buat departemen
- `PATCH /departments/{id}` - Update departemen
- `DELETE /departments/{id}` - Hapus departemen
- `GET /user-management` - Manajemen user
- `GET /statistics` - Statistik dashboard
- `GET /tasks` - Daftar tugas monitoring

---

## 📌 CATATAN PENTING

- Beberapa endpoint digunakan di multiple halaman (contoh: `/assets` digunakan di daftar-aset, buat-ajuan risiko, dll)
- Endpoint PATCH sering digunakan untuk multiple operasi (Create, Update, Approve, Reject, Delete, etc.)
- API mengikuti RESTful convention dengan HTTP methods: GET, POST, PATCH, DELETE
- Total **60+ unique endpoints** digunakan di seluruh sistem
- **2 halaman Authentication** (Public) untuk login dan register
- **2 halaman Onboarding** untuk pengguna baru (after registration)
- **Konteks Organisasi** merupakan halaman dengan endpoint paling banyak (21 endpoint) karena mengelola banyak entitas (contexts, stakeholders internal/external, CIA objectives, regulations, dan service priorities)

---

## 📄 Related Files

- **page_mapping.csv** - CSV format mapping semua halaman dengan user roles dan deskripsi
- **docs/** - Dokumentasi lengkap tentang ISO 27005 dan implementation phases
