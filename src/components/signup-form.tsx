import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

export function SignupForm({
  className,
  ...props
}: React.ComponentProps<"form">) {
  return (
    <form className={cn("flex flex-col gap-6", className)} {...props}>
      <FieldGroup>
        <div className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-2xl font-bold">Buat Akun Baru 🚀</h1>
          <p className="text-muted-foreground text-sm text-balance">
            Mulai perjalanan manajemen risiko Anda hari ini. 
          </p>
        </div>
        <Field>
          <FieldLabel htmlFor="name">Nama</FieldLabel>
          <Input id="name" type="text" placeholder="John Doe" required />
        </Field>
        <Field>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input id="email" type="email" placeholder="m@example.com" required />
          <FieldDescription>
            Kami akan menggunakan ini untuk menghubungi Anda. Kami tidak akan membagikan email Anda
            kepada siapa pun.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input id="password" type="password" required />
          <FieldDescription>
            Harus terdiri dari minimal 8 karakter.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="confirm-password">Konfirmasi Password</FieldLabel>
          <Input id="confirm-password" type="password" required />
          <FieldDescription>Silakan konfirmasi password Anda.</FieldDescription>
        </Field>
        <Field>
          <Button type="submit">Buat Akun</Button>
        </Field>
        <Field>
          <FieldDescription className="px-6 text-center">
            Sudah memiliki akun? <a href="#">Masuk</a>
          </FieldDescription>
        </Field>
      </FieldGroup>
    </form>
  )
}
