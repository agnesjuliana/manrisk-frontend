# Role-Based Access Control (RBAC) Mapping

**Dokumentasi lengkap mapping role akses ke setiap halaman dan flag akses sidebar (Readonly vs Full Access).**

---

## 📊 Quick Stats

- **Total Roles:** 6 roles (+ Admin)
- **Total Pages:** 24 halaman
- **Access Types:** Public, New Users, RISK_OWNER, RISK_MANAGER, TOP_MANAGEMENT, Admin

---

## 🔐 User Roles Definition

| Role | Deskripsi |
|:---|:---|
| **Public** | User yang belum login (hanya akses halaman auth) |
| **New Users** | User baru setelah registrasi (akses onboarding) |
| **RISK_OWNER** | Pemilik risiko, mengelola identifikasi dan data aset/risiko dasar |
| **RISK_MANAGER** | Manager risiko, melakukan penilaian, approval risiko, dan treatment |
| **TOP_MANAGEMENT** | Manajemen puncak, menyetujui risiko final dan mengambil keputusan strategis |
| **Admin** | Administrator sistem, akses penuh ke semua halaman dan fitur tanpa batasan |

---

## 📑 Table of Contents

1. [Authentication Pages](#authentication-pages)
2. [Onboarding Pages](#onboarding-pages)
3. [Asset Management Pages](#asset-management-pages)
4. [Risk Management Pages](#risk-management-pages)
5. [Risk Treatment Pages](#risk-treatment-pages)
6. [Control Implementation Pages](#control-implementation-pages)
7. [Monitoring & Review Pages](#monitoring--review-pages)
8. [Organization Context Pages](#organization-context-pages)
9. [User Management Pages](#user-management-pages)
10. [Access Matrix Summary](#-access-matrix-summary)

---

## AUTHENTICATION PAGES

### /auth/login
| Aspek | Detail |
|:---|:---|
| **Akses** | Public (Semua orang) |
| **Role yang Diizinkan** | - (Public, tidak perlu login) |
| **Sidebar Access** | ❌ Tidak ada sidebar |
| **Features** | • Login dengan email & password • Redirect ke dashboard jika sudah login |

### /auth/register
| Aspek | Detail |
|:---|:---|
| **Akses** | Public (Semua orang) |
| **Role yang Diizinkan** | - (Public, tidak perlu login) |
| **Sidebar Access** | ❌ Tidak ada sidebar |
| **Features** | • Register user baru • Auto login setelah registrasi • Redirect ke onboarding |

---

## ONBOARDING PAGES

### /onboard/welcome
| Aspek | Detail |
|:---|:---|
| **Akses** | New Users saja (setelah registrasi) |
| **Role yang Diizinkan** | - (User baru, belum assign role) |
| **Sidebar Access** | ❌ Tidak ada sidebar |
| **Features** | • Welcome screen • Sambutan dan penjelasan onboarding |

### /onboard/company-profile
| Aspek | Detail |
|:---|:---|
| **Akses** | New Users saja (setelah registrasi) |
| **Role yang Diizinkan** | - (User baru, belum assign role) |
| **Sidebar Access** | ❌ Tidak ada sidebar |
| **Features** | • Input profil perusahaan • Redirect ke dashboard setelah selesai |

---

## ASSET MANAGEMENT PAGES

### /dashboard/aset/daftar-aset
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_OWNER, RISK_MANAGER |
| **Sidebar Access** | 🟦 **FULL** - Bisa create, edit, delete, submit |
| **Fitur per Role** | **RISK_OWNER:** Create, edit, delete aset sendiri, submit ke approval<br>**RISK_MANAGER:** View semua, edit status, approve/reject submission |
| **Read-Only Fields** | ID aset, tanggal dibuat, audit trail |

### /dashboard/aset/persetujuan-aset
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_MANAGER, TOP_MANAGEMENT |
| **Sidebar Access** | 🟦 **FULL** - Bisa approve/reject pengajuan |
| **Fitur per Role** | **RISK_MANAGER:** View & filter pengajuan, approve/reject<br>**TOP_MANAGEMENT:** View & filter pengajuan, approve/reject |
| **Read-Only Fields** | Detail aset, tanggal pengajuan, informasi pemohon |

### /dashboard/aset/persetujuan-aset/buat-ajuan
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_MANAGER saja |
| **Sidebar Access** | 🟦 **FULL** - Bisa select aset dan buat pengajuan |
| **Fitur per Role** | **RISK_MANAGER:** Select aset yang sudah approved RM, buat pengajuan final ke TM |
| **Read-Only Fields** | Daftar aset (hanya yang approved RM) |

### /dashboard/aset/persetujuan-aset/detail/[id]
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_MANAGER, TOP_MANAGEMENT |
| **Sidebar Access** | 🟦 **FULL** - Bisa approve/reject detail pengajuan |
| **Fitur per Role** | **RISK_MANAGER:** View detail, approve/reject<br>**TOP_MANAGEMENT:** View detail, approve/reject |
| **Read-Only Fields** | Detail aset, informasi pemohon |

---

## RISK MANAGEMENT PAGES

### /dashboard/risiko/daftar-risiko
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_OWNER, RISK_MANAGER |
| **Sidebar Access** | 🟦 **FULL** - Bisa create, edit, delete, submit risiko |
| **Fitur per Role** | **RISK_OWNER:** Create, edit risiko sendiri, submit ke approval<br>**RISK_MANAGER:** View semua, edit status, approve/reject |
| **Read-Only Fields** | ID risiko, tanggal dibuat, tanda tangan approval |

### /dashboard/risiko/persetujuan-risiko
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_MANAGER, TOP_MANAGEMENT |
| **Sidebar Access** | 🟦 **FULL** - Bisa approve/reject pengajuan risiko |
| **Fitur per Role** | **RISK_MANAGER:** View & filter, approve/reject pengajuan<br>**TOP_MANAGEMENT:** View & filter, approve/reject pengajuan |
| **Read-Only Fields** | Detail risiko, informasi pemohon, tanggal pengajuan |

### /dashboard/risiko/persetujuan-risiko/buat-ajuan
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_MANAGER saja |
| **Sidebar Access** | 🟦 **FULL** - Bisa select risiko dan buat pengajuan |
| **Fitur per Role** | **RISK_MANAGER:** Select risiko approved RM, buat pengajuan final |
| **Read-Only Fields** | Daftar risiko (hanya yang approved RM) |

### /dashboard/risiko/persetujuan-risiko/detail/[id]
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_MANAGER, TOP_MANAGEMENT |
| **Sidebar Access** | 🟦 **FULL** - Bisa approve/reject detail pengajuan |
| **Fitur per Role** | **RISK_MANAGER:** View detail, approve/reject<br>**TOP_MANAGEMENT:** View detail, approve/reject |
| **Read-Only Fields** | Detail risiko lengkap, kriteria penilaian |

### /dashboard/risiko/prioritas-risiko
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_MANAGER, TOP_MANAGEMENT |
| **Sidebar Access** | 🟩 **READONLY** - Hanya bisa view dan analisis prioritas |
| **Fitur per Role** | **RISK_MANAGER:** View prioritas risiko, analisis ranking<br>**TOP_MANAGEMENT:** View prioritas risiko, strategic review |
| **Read-Only Fields** | Semua field read-only (analisis saja) |

---

## RISK TREATMENT PAGES

### /dashboard/treatment/daftar-treatment
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_MANAGER, TOP_MANAGEMENT |
| **Sidebar Access** | 🟦 **FULL** - Bisa create, edit, delete treatment |
| **Fitur per Role** | **RISK_MANAGER:** Create, edit, update status treatment<br>**TOP_MANAGEMENT:** View, approve treatment |
| **Read-Only Fields** | Risk ID, tanggal dibuat, approval status |

### /dashboard/treatment/residu-risiko
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_MANAGER, TOP_MANAGEMENT |
| **Sidebar Access** | 🟦 **FULL** - Bisa create revisi risiko residual |
| **Fitur per Role** | **RISK_MANAGER:** Create & edit risk revision<br>**TOP_MANAGEMENT:** View & review revisions |
| **Read-Only Fields** | Original risk details, treatment references |

---

## CONTROL IMPLEMENTATION PAGES

### /dashboard/kontrol (Hub Page)
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_MANAGER, TOP_MANAGEMENT |
| **Sidebar Access** | 🟩 **READONLY** - Hub page, buka submodule |
| **Fitur per Role** | **RISK_MANAGER:** View hub, navigate to submodules<br>**TOP_MANAGEMENT:** View hub, navigate to submodules |
| **Read-Only Fields** | Semua link/navigation saja |

### /dashboard/kontrol/daftar-kontrol
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_MANAGER, TOP_MANAGEMENT |
| **Sidebar Access** | 🟦 **FULL** - Bisa manage kontrol dan SOA status |
| **Fitur per Role** | **RISK_MANAGER:** Create, edit, delete kontrol, update SOA<br>**TOP_MANAGEMENT:** View & review kontrol, approve SOA |
| **Read-Only Fields** | Control ID, tanggal dibuat, related treatments |

### /dashboard/kontrol/soa
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_MANAGER, TOP_MANAGEMENT |
| **Sidebar Access** | 🟦 **FULL** - Bisa update SOA status implementasi |
| **Fitur per Role** | **RISK_MANAGER:** Update status implementasi, edit notes<br>**TOP_MANAGEMENT:** View & review, verify completion |
| **Read-Only Fields** | Control code & title, ISO 27001 references |

---

## MONITORING & REVIEW PAGES

### /dashboard/monitoring (Hub Page)
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ All authenticated users (RISK_OWNER, RISK_MANAGER, TOP_MANAGEMENT) |
| **Sidebar Access** | 🟩 **READONLY** - Hub page, view statistics |
| **Fitur per Role** | **Semua:** View dashboard overview dan navigate submodules |
| **Read-Only Fields** | Semua statistics read-only |

### /dashboard/monitoring/daftar-tugas
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ All authenticated users |
| **Sidebar Access** | 🟩 **READONLY** - View tugas monitoring |
| **Fitur per Role** | **Semua:** View tasks, filter by module, track status |
| **Read-Only Fields** | Semua fields read-only (monitoring view saja) |

### /dashboard/monitoring/rangkuman-risiko
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ All authenticated users |
| **Sidebar Access** | 🟩 **READONLY** - View ringkasan dan statistik |
| **Fitur per Role** | **Semua:** View summary, analytics, reports |
| **Read-Only Fields** | Semua fields read-only (dashboard analytics) |

---

## ORGANIZATION CONTEXT PAGES

### /dashboard/organisasi/konteks-organisasi
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_OWNER, TOP_MANAGEMENT |
| **Sidebar Access** | 🟦 **FULL** - Bisa manage konteks, stakeholders, CIA, regulations |
| **Fitur per Role** | **RISK_OWNER:** Create & edit konteks, stakeholder, CIA objectives<br>**TOP_MANAGEMENT:** View, review, approve konteks setup |
| **Read-Only Fields** | Organization basic info (dari profil), tanggal last updated |
| **Sub-sections** | • CIA Objectives • Internal Stakeholders • External Stakeholders • Technical Bounds • Regulations |

### /dashboard/organisasi/kriteria-risiko
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ RISK_OWNER, TOP_MANAGEMENT |
| **Sidebar Access** | 🟦 **FULL** - Bisa configure risk criteria & scales |
| **Fitur per Role** | **RISK_OWNER:** Configure criteria, define scales, set thresholds<br>**TOP_MANAGEMENT:** Review & approve criteria setup |
| **Read-Only Fields** | Kriteria defaults, ISO 27005 reference standards |
| **Settings** | • Scale size (1-5) • Likelihood/Impact/Detection labels • FMEA method • Risk threshold |

---

## USER MANAGEMENT PAGES

### /dashboard/user/registry
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ TOP_MANAGEMENT saja |
| **Sidebar Access** | 🟦 **FULL** - Bisa create, edit, delete user |
| **Fitur per Role** | **TOP_MANAGEMENT:** Create user, edit details, assign roles, delete user |
| **Read-Only Fields** | User ID, tanggal dibuat, last login |
| **Editable Fields** | Name, email, role, department, status |

### /dashboard/user/access
| Aspek | Detail |
|:---|:---|
| **Akses** | ✅ TOP_MANAGEMENT saja |
| **Sidebar Access** | 🟦 **FULL** - Bisa manage departemen |
| **Fitur per Role** | **TOP_MANAGEMENT:** Create departemen, edit, delete, manage access rules |
| **Read-Only Fields** | Department ID, tanggal dibuat |
| **Editable Fields** | Name, description, isActive status |

---

## 🔐 ACCESS MATRIX SUMMARY

### By Role

#### Public (Tidak Login)
| Halaman | Akses | Sidebar |
|:---|:---:|:---:|
| /auth/login | ✅ | ❌ |
| /auth/register | ✅ | ❌ |

#### New Users (Setelah Registrasi)
| Halaman | Akses | Sidebar |
|:---|:---:|:---:|
| /onboard/welcome | ✅ | ❌ |
| /onboard/company-profile | ✅ | ❌ |

#### RISK_OWNER
| Sidebar | Akses |
|:---|:---:|
| Organisasi > Konteks Organisasi | 🟩 READONLY |
| Organisasi > Kriteria Risiko | 🟩 READONLY |
| Aset > Daftar Aset | 🟦 FULL |
| Risiko > Daftar Risiko | 🟦 FULL |
| Risiko > Prioritas Risiko | 🟦 FULL |
| Treatment > Daftar Treatment | 🟩 READONLY |
| Treatment > Residu Risiko | 🟩 READONLY |
| Kontrol & SoA > Daftar Kontrol | 🟦 FULL |
| Kontrol & SoA > Implementasi Kontrol | 🟦 FULL |
| Monitoring > Rangkuman Risiko | 🟦 FULL |
| Monitoring > Daftar Tugas | 🟦 FULL |

#### RISK_MANAGER
| Sidebar | Akses |
|:---|:---:|
| Organisasi > Konteks Organisasi | 🟦 FULL |
| Organisasi > Kriteria Risiko | 🟦 FULL |
| Aset > Daftar Aset | 🟦 FULL |
| Aset > Persetujuan Aset | 🟦 FULL |
| Risiko > Daftar Risiko | 🟦 FULL |
| Risiko > Prioritas Risiko | 🟦 FULL |
| Risiko > Persetujuan Kajian | 🟦 FULL |
| Treatment > Daftar Treatment | 🟦 FULL |
| Treatment > Residu Risiko | 🟦 FULL |
| Kontrol & SoA > Daftar Kontrol | 🟦 FULL |
| Kontrol & SoA > Implementasi Kontrol | 🟦 FULL |
| Monitoring > Rangkuman Risiko | 🟦 FULL |
| Monitoring > Daftar Tugas | 🟦 FULL |

#### TOP_MANAGEMENT
| Sidebar | Akses |
|:---|:---:|
| Organisasi > Konteks Organisasi | 🟩 READONLY |
| Organisasi > Kriteria Risiko | 🟩 READONLY |
| Aset > Daftar Aset | 🟩 READONLY |
| Aset > Persetujuan Aset | 🟦 FULL |
| Risiko > Daftar Risiko | 🟩 READONLY |
| Risiko > Prioritas Risiko | 🟦 FULL |
| Risiko > Persetujuan Kajian | 🟦 FULL |
| Treatment > Daftar Treatment | 🟦 FULL |
| Treatment > Residu Risiko | 🟦 FULL |
| Kontrol & SoA > Daftar Kontrol | 🟦 FULL |
| Kontrol & SoA > Implementasi Kontrol | 🟦 FULL |
| Monitoring > Rangkuman Risiko | 🟦 FULL |
| Monitoring > Daftar Tugas | 🟦 FULL |

#### Admin
| Sidebar | Akses |
|:---|:---:|
| Manajemen User > Divisi & Hak Akses | 🟦 FULL |
| Manajemen User > Daftar Pengguna | 🟦 FULL |
| Organisasi > Konteks Organisasi | 🟦 FULL |
| Organisasi > Kriteria Risiko | 🟦 FULL |

---

## 📋 ACCESS FLAG LEGEND

### Sidebar Access Levels

| Flag | Nama | Deskripsi |
|:---:|:---:|:---|
| 🟦 FULL | Full Access | User bisa create, read, update, delete (CRUD) semua features di halaman |
| 🟩 READONLY | Read-Only Access | User hanya bisa view/read data, tidak bisa edit atau create |
| ❌ NONE | No Access | Halaman tidak punya sidebar (auth, onboarding pages) |

### Function-Level Access Control

#### RISK_OWNER
- ✅ **Create:** Aset, Risiko, CIA Objectives, Technical Bounds, Stakeholders, Regulations
- ✅ **Edit:** Data yang mereka buat sendiri
- ✅ **Submit:** Ke approval (RISK_MANAGER)
- ❌ **Approve:** Tidak bisa approve apapun
- ❌ **Delete:** Hanya aset/risiko yang belum submitted

#### RISK_MANAGER
- ✅ **Create:** Risiko, Treatment, Kontrol, Risk Revisions, Approval Requests
- ✅ **Edit:** Status risiko, treatment, kontrol
- ✅ **Approve:** Risiko dari RISK_OWNER, Asset approvals untuk TM
- ✅ **Reject:** Dengan alasan
- ✅ **View:** Semua aset, risiko, treatment, kontrol

#### TOP_MANAGEMENT
- ✅ **Approve:** Final approval untuk risiko dan aset (decision maker)
- ✅ **Reject:** Final rejection
- ✅ **Configure:** Kriteria risiko, organization setup, user management
- ✅ **View:** Strategic overview, analytics, reports
- ❌ **Create:** Tidak bisa create risiko/aset/treatment (hanya review)

#### Admin (Superuser)
- ✅ **Full Access:** User Management (Divisi & Daftar Pengguna)
- ✅ **Edit:** Organisasi Context & Kriteria Risiko (Full Access, tidak readonly)
- ✅ **Manage:** Departemen, User roles, organization setup
- ⚠️ **Limited:** Tidak punya akses ke Aset, Risiko, Treatment, Kontrol, Monitoring
- ✅ **Purpose:** System administration, user & organization management saja

---

## 🔒 Security Notes

1. **Role Separation:** Setiap role memiliki tanggung jawab spesifik (Separation of Duties)
2. **Approval Chain:** RISK_OWNER → RISK_MANAGER → TOP_MANAGEMENT (3-tier approval)
3. **Data Isolation:** User RISK_OWNER hanya bisa edit data mereka sendiri
4. **Audit Trail:** Semua perubahan data di-log untuk compliance
5. **Token-Based Auth:** Menggunakan JWT token untuk validasi role pada setiap request
6. **Read-Only Views:** Monitoring pages tidak bisa di-edit untuk data integrity

---

## 📌 CATATAN IMPLEMENTASI

- Validasi role dilakukan di **frontend** (UI/UX) dan **backend** (API authorization)
- Sidebar visibility dikontrol berdasarkan role di `nav-data.ts`
- Protected routes menggunakan `route-protector.tsx` di dashboard
- Onboarding flow protected dengan `onboard-protector.tsx`
- API endpoints memvalidasi role sebelum memproses request
- Read-only fields ditampilkan dengan styling khusus (disabled input, gray background)
- Button actions (Create, Edit, Delete, Approve) hidden untuk role yang tidak punya akses

---

## 📄 Related Files

- **ENDPOINT_MAPPING.md** - Mapping endpoint API untuk setiap halaman
- **page_mapping.csv** - CSV format mapping halaman dengan deskripsi
- **src/hooks/use-auth.ts** - Hook untuk get current user & role
- **src/lib/nav-data.ts** - Navigation data dengan role filtering
- **src/app/dashboard/route-protector.tsx** - Route protection untuk dashboard
- **src/app/onboard/onboard-protector.tsx** - Route protection untuk onboarding
