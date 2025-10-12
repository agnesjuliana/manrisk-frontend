import Link from "next/link"

export default function Page() {
  return (
    <div className="flex flex-1 items-center justify-center p-8">
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-muted-foreground">Select a section from the sidebar or open a sub-route.</p>
        <div className="space-x-2">
          <Link href="/dashboard/user/access" className="text-primary underline">
            Go to User Access
          </Link>
        </div>
      </div>
    </div>
  )
}
