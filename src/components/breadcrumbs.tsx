"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import navData from "@/lib/nav-data"

export function Breadcrumbs() {
  const pathname = usePathname() || "/"

  // Try to find the group and subitem that match the current pathname
  let matchedGroup: any = null
  let matchedSub: any = null

  for (const group of navData.navMain) {
    if (group.url === pathname) {
      matchedGroup = group
      break
    }
    const sub = group.items?.find((i: any) => i.url === pathname)
    if (sub) {
      matchedGroup = group
      matchedSub = sub
      break
    }
  }

  // If we found a group + subitem, render: Group (non-clickable) -> Sub (clickable/active)
  if (matchedGroup) {
    return (
      <nav aria-label="Breadcrumb" className="px-4">
        <ol className="flex items-center gap-2 text-sm text-muted-foreground">
          <li className="text-sm text-muted-foreground">{matchedGroup.title}</li>
          {matchedSub ? (
            <>
              <li>
                <span className="mx-2">/</span>
              </li>
              <li>
                <Link href={matchedSub.url} className="font-semibold">
                  {matchedSub.title}
                </Link>
              </li>
            </>
          ) : null}
        </ol>
      </nav>
    )
  }

  // Fallback: simple path-based crumb starting after /dashboard
  const parts = pathname.split("/").filter(Boolean)
  const crumbs = parts.map((_, idx) => ({ path: "/" + parts.slice(0, idx + 1).join("/") }))

  const mapPathToTitle = (path: string) => {
    const match = navData.navMain.find((group: any) => group.url === path)
    if (match) return match.title
    for (const group of navData.navMain) {
      const sub = group.items?.find((i: any) => i.url === path)
      if (sub) return sub.title
    }
    return path.split("/").pop() || path
  }

  return (
    <nav aria-label="Breadcrumb" className="px-4">
      <ol className="flex items-center gap-2 text-sm text-muted-foreground">
        {crumbs.map((c, i) => (
          <li key={c.path} className="flex items-center">
            {i > 0 && <span className="mx-2">/</span>}
            <Link href={c.path} className={i === crumbs.length - 1 ? "font-semibold" : "underline"}>
              {mapPathToTitle(c.path)}
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  )
}

export default Breadcrumbs
