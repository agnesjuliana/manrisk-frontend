"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, TrendingUp, CheckSquare, BarChart3, Lock, Users, FileText, AlertCircle, Target, LogOut, ArrowRight } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function Home() {
  const router = useRouter()
  const { user, logout } = useAuth()

  const handleLogout = async () => {
    await logout()
    router.push("/")
  }

  return (
    <main className="min-h-dvh bg-gradient-to-br from-white via-sky-400/50 to-white">
      {/* Navigation */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-6xl">
        <div className="bg-white/80 backdrop-blur-md border border-sky-100/40 rounded-full shadow-lg">
          <div className="flex justify-between items-center px-8 py-4 max-w-7xl">
            <Link href="/" className="flex items-center gap-2 cursor-pointer flex-shrink-0">
              <div className="p-2 bg-sky-100 rounded-lg">
                <ShieldAlert className="w-6 h-6 text-sky-700" />
              </div>
              <span className="text-xl font-bold text-gray-900">ManRisk</span>
            </Link>
            <div className="flex gap-2 items-center">
            {user ? (
              <>
                <Link href="/dashboard">
                  <Button variant="outline" className="border-sky-200 text-sky-700 hover:bg-sky-50">
                    Dashboard
                  </Button>
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src="" alt={user.name} />
                        <AvatarFallback className="bg-sky-100 text-sky-700 font-semibold">
                          {user.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm text-gray-900">{user.name}</p>
                        <p className="w-full text-xs text-gray-600 truncate">{user.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/user/profile" className="cursor-pointer">
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/user/settings" className="cursor-pointer">
                        Pengaturan
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="text-red-600 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" className="border-sky-200 text-sky-700 hover:bg-sky-50 hover:text-gray-900 rounded-full">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/register">
                  <Button className="bg-sky-600 hover:bg-sky-700 hover:text-gray-900 text-white rounded-full">
                    Register
                  </Button>
                </Link>
              </>
            )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-24 pt-32 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div className="inline-block px-4 py-2 bg-sky-100/80 rounded-full text-sm font-semibold text-sky-700 border border-sky-200/50">
                ✨ 10,000+ Risk Managers
              </div>
              <h1 className="text-6xl lg:text-7xl font-bold text-gray-900 leading-tight">
                Kelola Risiko Sesuai Standar ISO 27005
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                Platform manajemen risiko keamanan informasi yang dirancang mengikuti standar ISO 27005:2022. Identifikasi, analisis, dan kelola risiko dengan sistematis.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <Link href={user ? "/dashboard" : "/auth/register"} className="flex-1">
                <Button className="w-full bg-sky-600 hover:bg-sky-700 h-12 text-lg font-semibold text-white rounded-lg">
                  {user ? "Buka Dashboard" : "Mulai Sekarang"}
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              {!user && (
                <Link href="/auth/login" className="flex-1">
                  <Button variant="outline" className="w-full h-12 text-lg font-semibold border-2 border-sky-300 text-sky-700 hover:bg-sky-50 hover:text-gray-900 rounded-lg">
                    Masuk
                  </Button>
                </Link>
              )}
            </div>

            {/* Features List */}
            <div className="pt-8 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-5 h-5 text-sky-700" />
                </div>
                <span className="text-gray-700 font-medium">ISO 27005:2022 Compliant</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-5 h-5 text-sky-700" />
                </div>
                <span className="text-gray-700 font-medium">Risk Assessment & Analysis</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-sky-100 flex items-center justify-center flex-shrink-0">
                  <CheckSquare className="w-5 h-5 text-sky-700" />
                </div>
                <span className="text-gray-700 font-medium">Real-time Monitoring & Reporting</span>
              </div>
            </div>
          </div>

          {/* Right: Dashboard Preview */}
          <div className="relative">
            {/* Decorative circles */}
            <div className="absolute inset-0 -z-10">
              <div className="absolute top-20 right-20 w-72 h-72 bg-sky-200/20 rounded-full blur-3xl"></div>
              <div className="absolute bottom-0 left-0 w-96 h-96 bg-sky-100/20 rounded-full blur-3xl"></div>
            </div>

            {/* Dashboard Cards */}
            <div className="space-y-4">
              {/* Top Stats */}
              <div className="grid grid-cols-2 gap-4">
                <Card className="border border-sky-100/50 bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Total Risiko</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-gray-900">24</div>
                    <p className="text-sm text-sky-600 font-medium mt-2">↓ 15% dari bulan lalu</p>
                  </CardContent>
                </Card>
                <Card className="border border-sky-100/50 bg-white shadow-lg hover:shadow-xl transition-shadow">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-semibold text-gray-700">Treatment Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-4xl font-bold text-sky-600">75%</div>
                    <p className="text-sm text-gray-600 font-medium mt-2">18 dari 24 risiko</p>
                  </CardContent>
                </Card>
              </div>

              {/* Main Dashboard Card */}
              <Card className="border border-sky-100/50 bg-gradient-to-br from-white to-sky-50/30 shadow-2xl overflow-hidden">
                <div className="bg-gradient-to-br from-sky-600/85 via-sky-600/80 to-sky-700/85 backdrop-blur-sm text-white p-6 pb-4 shadow-lg border border-sky-400/20">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-white text-xl font-semibold">Risk Dashboard</h3>
                      <p className="text-sky-100 text-sm">Manajemen risiko real-time</p>
                    </div>
                    <div className="w-10 h-10 bg-sky-500/30 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                </div>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900 text-sm">High Risk</span>
                        <span className="font-bold text-sky-700 text-sm">3</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-red-500 h-3 rounded-full" style={{ width: "25%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900 text-sm">Medium Risk</span>
                        <span className="font-bold text-sky-700 text-sm">8</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-yellow-500 h-3 rounded-full" style={{ width: "67%" }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-gray-900 text-sm">Low Risk</span>
                        <span className="font-bold text-sky-700 text-sm">13</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div className="bg-sky-500 h-3 rounded-full" style={{ width: "100%" }}></div>
                      </div>
                    </div>
                  </div>

                  {/* Mini Stats */}
                  <div className="grid grid-cols-3 gap-3 mt-6 pt-6 border-t border-sky-100/50">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">89%</p>
                      <p className="text-xs text-gray-600 mt-1">Completion</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-sky-600">12</p>
                      <p className="text-xs text-gray-600 mt-1">Controls</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">45</p>
                      <p className="text-xs text-gray-600 mt-1">Assets</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-sky-50/50 px-6 py-20 border-y border-sky-100/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-gray-900 mb-4">Fitur Lengkap untuk</h2>
            <h2 className="text-5xl font-bold text-sky-600 mb-4">Manajemen Risiko Efektif</h2>
            <p className="text-lg text-gray-600">Semua yang Anda butuhkan dalam satu platform terintegrasi</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: AlertCircle, title: "Identifikasi Risiko", desc: "Identifikasi dan dokumentasikan risiko secara sistematis" },
              { icon: TrendingUp, title: "Analisis Risiko", desc: "Analisis risiko dengan matriks kemungkinan-dampak" },
              { icon: Target, title: "Mitigasi Risiko", desc: "Rencanakan dan kelola strategi mitigasi risiko" },
              { icon: Lock, title: "Manajemen Kontrol", desc: "Kelola SOA dan implementasi kontrol keamanan" },
              { icon: Users, title: "Manajemen Aset", desc: "Monitor aset informasi dan keterkaitan dengan risiko" },
              { icon: FileText, title: "Monitoring & Laporan", desc: "Dashboard dan laporan terperinci untuk manajemen" },
            ].map((feature, idx) => (
              <Card key={idx} className="border border-sky-100/50 bg-white hover:border-sky-200 hover:shadow-lg transition-all group cursor-pointer">
                <CardHeader>
                  <div className="p-3 bg-sky-100 rounded-lg w-fit mb-4 group-hover:bg-sky-200 transition-colors">
                    <feature.icon className="w-6 h-6 text-sky-700" />
                  </div>
                  <CardTitle className="text-lg text-gray-900">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-gray-600 text-sm">
                  {feature.desc}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ISO 27005 Compliance Section */}
      <section className="px-6 py-20 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-sky-50 to-sky-100/50 border border-sky-200 rounded-2xl p-8 md:p-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">ISO 27005:2022</h2>
              <p className="text-gray-700 mb-8 text-lg leading-relaxed">
                Platform kami dirancang mengikuti standar ISO/IEC 27005:2022 untuk Risk Management of Information and Communication Technology. Implementasi yang telah terbukti dan terukur.
              </p>
              <div className="space-y-4">
                {["Penetapan Konteks Risiko", "Penilaian & Analisis Risiko", "Perencanaan Mitigasi Risiko", "Monitoring & Review Risiko"].map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sky-600 flex items-center justify-center flex-shrink-0">
                      <CheckSquare className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-800 font-medium">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-white rounded-xl p-8 border border-sky-200/50 shadow-lg">
              <div className="space-y-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-sky-600 mb-2">ISO</div>
                  <div className="text-2xl font-bold text-gray-900">27005:2022</div>
                  <p className="text-sm text-gray-600 mt-3">Keamanan Informasi<br/>& Manajemen Risiko</p>
                </div>
                
                <div className="bg-sky-50 rounded-lg p-4 border border-sky-100">
                  <p className="text-xs font-semibold text-sky-700 mb-2">KEPATUHAN REGULASI</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    Platform ini mendukung organisasi memenuhi persyaratan peraturan pemerintah terkait pengelolaan risiko keamanan informasi, termasuk:
                  </p>
                  <ul className="mt-3 space-y-2 text-xs text-gray-700">
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 font-bold mt-0.5">•</span>
                      <span><strong>PP No. 71 Tahun 2019</strong> - Penyelenggaraan Sistem Informasi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 font-bold mt-0.5">•</span>
                      <span><strong>UU No. 27 Tahun 2022</strong> - Perlindungan Data Pribadi</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-sky-600 font-bold mt-0.5">•</span>
                      <span><strong>Standar ISO/IEC 27005:2022</strong> - International Best Practice</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-sky-600 to-sky-700 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-white mb-6">Siap untuk Manajemen Risiko yang Terstruktur?</h2>
          <p className="text-xl text-sky-100 mb-10">
            Mulai kelola risiko keamanan informasi dengan metodologi yang sesuai standar internasional. Dapatkan visibilitas penuh terhadap keamanan TI organisasi Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button className="bg-white text-sky-700 hover:bg-sky-50 h-12 px-10 text-lg font-semibold rounded-lg">
                Mulai Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-sky-100/50 px-6 py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-sky-600" />
                ManRisk
              </h4>
              <p className="text-sm text-gray-600">Platform manajemen risiko keamanan informasi sesuai ISO 27005:2022</p>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Platform</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-sky-600 transition">Fitur</a></li>
                <li><a href="#" className="hover:text-sky-600 transition">Pricing</a></li>
                <li><a href="#" className="hover:text-sky-600 transition">Keamanan</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Sumber Daya</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-sky-600 transition">Dokumentasi</a></li>
                <li><a href="#" className="hover:text-sky-600 transition">API</a></li>
                <li><a href="#" className="hover:text-sky-600 transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Hukum</h4>
              <ul className="space-y-2 text-gray-600 text-sm">
                <li><a href="#" className="hover:text-sky-600 transition">Privasi</a></li>
                <li><a href="#" className="hover:text-sky-600 transition">Syarat & Ketentuan</a></li>
                <li><a href="#" className="hover:text-sky-600 transition">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-300 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-600 text-sm">© 2026 ManRisk. Semua hak dilindungi.</p>
            <div className="text-gray-600 text-sm flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-sky-600 flex items-center justify-center">
                <CheckSquare className="w-3 h-3 text-white" />
              </div>
              <span>ISO 27005:2022 Compliant</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
