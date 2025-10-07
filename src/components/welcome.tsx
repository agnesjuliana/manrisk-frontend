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

export function Welcome({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <form>
        <FieldGroup>
          <div className="flex flex-col items-center gap-2 text-center">
            <h1 className="text-xl font-bold">Selamat datang di ManRisk 🎉</h1>
            <FieldDescription>
              Akun organisasi Anda berhasil dibuat. Sebelum mulai menggunakan
              ManRisk, mari lengkapi profil instansi.
            </FieldDescription>
          </div>
          <Field>
            <Button type="submit">Mulai Sekarang</Button>
          </Field>
        </FieldGroup>
      </form>
      <FieldDescription className="px-6 text-center">
        Profil instansi dapat diperbarui kapan saja melalui dashboard.
      </FieldDescription>
    </div>
  );
}
