import * as React from "react"
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
  const [values, setValues] = React.useState<ProfileValues>({
    name: initialValues?.name || "",
    address: initialValues?.address || "",
    email: initialValues?.email || "",
    phone: initialValues?.phone || "",
  })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onSubmitProfile?.(values)
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
            <Input id="name" type="text" placeholder="ManRisk Org." required value={values.name} onChange={e => setValues(prev => ({ ...prev, name: e.currentTarget.value }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="address">Alamat Instansi</FieldLabel>
            <Input id="address" type="text" placeholder="Jl. Contoh No. 123" required value={values.address} onChange={e => setValues(prev => ({ ...prev, address: e.currentTarget.value }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input id="email" type="email" placeholder="m@example.com" required value={values.email} onChange={e => setValues(prev => ({ ...prev, email: e.currentTarget.value }))} />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Nomor Telepon</FieldLabel>
            <Input id="phone" type="tel" placeholder="+62 888-8888-8888" required value={values.phone} onChange={e => setValues(prev => ({ ...prev, phone: e.currentTarget.value }))} />
          </Field>
          <Field>
            <Button type="submit">{submitLabel}</Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  )
}

export type { ProfileValues }

