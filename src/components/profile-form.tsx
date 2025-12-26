import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { GalleryVerticalEnd } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { organizationsApi } from "@/lib/api"

type ProfileValues = {
  name: string
  address: string
  email: string
  phone: string
}

export function ProfileForm({
  className,
  initialValues,
  onSubmitProfile,
  submitLabel = "Simpan",
  showHeader = false,
}: React.ComponentProps<"div"> & {
  initialValues?: Partial<ProfileValues>
  onSubmitProfile?: (values: ProfileValues) => void
  submitLabel?: string
  showHeader?: boolean
}) {
  const router = useRouter()
  const [values, setValues] = React.useState<ProfileValues>({
    name: initialValues?.name || "",
    address: initialValues?.address || "",
    email: initialValues?.email || "",
    phone: initialValues?.phone || "",
  })
  const [isLoading, setIsLoading] = React.useState(false)

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({ ...prev, name: e.target.value }))
  }

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({ ...prev, address: e.target.value }))
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({ ...prev, email: e.target.value }))
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues(prev => ({ ...prev, phone: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    // If onSubmitProfile callback is provided, use it (for other use cases)
    if (onSubmitProfile) {
      onSubmitProfile(values)
      return
    }

    // Otherwise, submit to API (for onboarding flow)
    setIsLoading(true)

    try {
      const response = await organizationsApi.create({
        name: values.name,
        address: values.address,
        email: values.email,
        telp: values.phone,
      })

      if (response.status) {
        toast.success("Organisasi berhasil disimpan! Redirecting...")
        // Redirect to dashboard
        router.push("/dashboard")
      }
    } catch (err: any) {
      const errorMessage = err.message || "Gagal menyimpan organisasi. Silakan coba lagi."
      toast.error(errorMessage)
      console.error("Organization creation error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)}>
      <form onSubmit={handleSubmit}>
        <FieldGroup>
          {showHeader ? (
            <div className="flex flex-col items-center gap-2 text-center">
              <h1 className="text-xl font-bold">Lengkapi Profil Instansi Anda</h1>
              <FieldDescription>
                Profil ini bisa diperbarui kapan saja melalui dashboard
              </FieldDescription>
            </div>
          ) : null}
          <Field>
            <FieldLabel htmlFor="name">Nama Instansi/Organisasi</FieldLabel>
            <Input 
              id="name" 
              type="text" 
              placeholder="ManRisk Org." 
              required 
              value={values.name} 
              onChange={handleNameChange}
              disabled={isLoading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="address">Alamat Instansi</FieldLabel>
            <Input 
              id="address" 
              type="text" 
              placeholder="Jl. Contoh No. 123" 
              required 
              value={values.address} 
              onChange={handleAddressChange}
              disabled={isLoading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input 
              id="email" 
              type="email" 
              placeholder="m@example.com" 
              required 
              value={values.email} 
              onChange={handleEmailChange}
              disabled={isLoading}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Nomor Telepon</FieldLabel>
            <Input 
              id="phone" 
              type="tel" 
              placeholder="+62 888-8888-8888" 
              required 
              value={values.phone} 
              onChange={handlePhoneChange}
              disabled={isLoading}
            />
          </Field>
          <Field>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Sedang Menyimpan..." : submitLabel}
            </Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}

export type { ProfileValues }

