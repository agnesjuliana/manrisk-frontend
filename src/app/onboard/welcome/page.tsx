import { Welcome } from "@/components/welcome"

export default function WelcomePage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Welcome />
      </div>
    </div>
  )
}
