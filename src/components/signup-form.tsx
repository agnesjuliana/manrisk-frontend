"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { authApi } from "@/lib/api"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      toast.error("Semua field harus diisi")
      return
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Password tidak cocok")
      return
    }

    if (formData.password.length < 8) {
      toast.error("Password harus minimal 8 karakter")
      return
    }

    setIsLoading(true)

    try {
      const response = await authApi.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      })

      if (response.status) {
        // Auto-login to get the token
        const loginResponse = await authApi.login({
          email: formData.email,
          password: formData.password,
        })

        if (loginResponse.status) {
          toast.success("Akun berhasil dibuat! Redirecting ke welcome...")
          // Redirect to welcome page
          router.push("/onboard/welcome")
        }
      }
    } catch (err: any) {
      const errorMessage = err.message || "Pendaftaran gagal. Silakan coba lagi."
      toast.error(errorMessage)
      console.error("Registration error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Buat Akun Baru 🚀</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Mulai perjalanan manajemen risiko Anda hari ini. 
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Nama</FieldLabel>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            type="email"
            placeholder="m@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <FieldDescription>
            Kami akan menggunakan ini untuk menghubungi Anda. Kami tidak akan membagikan email Anda
            kepada siapa pun.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <FieldDescription>
            Harus terdiri dari minimal 8 karakter.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirmPassword">Konfirmasi Password</FieldLabel>
          <Input
            id="confirmPassword"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
          <FieldDescription>Silakan konfirmasi password Anda.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Membuat Akun..." : "Buat Akun"}
          </Button>
        </Field>
        <Field>
          <FieldDescription className="px-6 text-center">
            Sudah memiliki akun? <a href="/auth/login">Masuk</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
