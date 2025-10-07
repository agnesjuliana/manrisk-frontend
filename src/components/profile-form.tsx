import { GalleryVerticalEnd } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";

export function ProfileForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">Lengkapi Profil Instansi Anda</h1>
            <FieldDescription>
              Profil ini bisa diperbarui kapan saja melalui dashboard
            </FieldDescription>
          </div>
          <Field>
            <FieldLabel htmlFor="name">Nama Instansi/Organisasi</FieldLabel>
            <Input id="name" type="text" placeholder="ManRisk Org." required />
          </Field>
          <Field>
            <FieldLabel htmlFor="address">Alamat Instansi</FieldLabel>
            <Input
              id="address"
              type="text"
              placeholder="Jl. Contoh No. 123"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="phone">Nomor Telepon</FieldLabel>
            <Input
              id="phone"
              type="tel"
              placeholder="+62 888-8888-8888"
              required
            />
          </Field>
          <Field>
            <Button type="submit">Simpan</Button>
          </Field>
        </FieldGroup>
      </form>
    </div>
  );
}
