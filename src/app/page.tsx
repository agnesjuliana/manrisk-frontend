"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ShieldAlert, BarChart3, CheckCircle2, Lock } from "lucide-react"

export default function Home() {
  return (
    <main className="min-h-dvh bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-8 h-8 text-blue-500" />
          <span className="text-xl font-bold text-white">ISMS</span>
        </div>
        <div className="flex gap-3">
          <Link href="/auth/login">
            <Button variant="ghost" className="text-white hover:bg-slate-700">
              Login
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Register
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left: Content */}
          <div className="space-y-6">
            <div className="space-y-4">
              <h1 className="text-5xl lg:text-6xl font-bold text-white leading-tight">
                Information Security Management
              </h1>
              <p className="text-xl text-slate-300">
                Comprehensive ISO 27005:2022 Risk Management System. Identify, assess, and mitigate security risks with precision.
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/auth/register" className="flex-1">
                <Button className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg">
                  Get Started
                </Button>
              </Link>
              <Link href="/auth/login" className="flex-1">
                <Button variant="outline" className="w-full h-12 text-lg text-white border-slate-600 hover:bg-slate-700">
                  Sign In
                </Button>
              </Link>
            </div>

            {/* Features List */}
            <div className="pt-8 space-y-3">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-200">ISO 27005:2022 Compliant</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-200">Risk Assessment & Treatment</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                <span className="text-slate-200">Control Implementation & Monitoring</span>
              </div>
            </div>
          </div>

          {/* Right: Feature Cards */}
          <div className="grid grid-cols-1 gap-4">
            {/* Card 1 */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div className="flex items-start gap-4">
                <ShieldAlert className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Risk Identification</h3>
                  <p className="text-slate-400 text-sm">Systematically identify and document security risks across your organization.</p>
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div className="flex items-start gap-4">
                <BarChart3 className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Risk Analysis</h3>
                  <p className="text-slate-400 text-sm">Assess and prioritize risks using advanced severity-likelihood matrices.</p>
                </div>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-colors">
              <div className="flex items-start gap-4">
                <Lock className="w-8 h-8 text-blue-500 flex-shrink-0 mt-1" />
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">Control Management</h3>
                  <p className="text-slate-400 text-sm">Implement, track, and verify security controls with comprehensive SoA.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-700 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">API Docs</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Compliance</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-700 pt-8 flex justify-between items-center">
            <p className="text-slate-400 text-sm">© 2025 ISMS. All rights reserved.</p>
            <p className="text-slate-400 text-sm">ISO 27005:2022 Compliant</p>
          </div>
        </div>
      </footer>
    </main>
  )
}
