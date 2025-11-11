"use client";

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function PersetujuanTreatmentPage() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <h1 className="text-2xl font-semibold">Persetujuan Treatment</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Risk Manager View</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Lihat dan setujui treatment yang telah dibuat, lalu ajukan ke Top Management untuk persetujuan akhir.
          </p>
          <Button onClick={() => router.push("/dashboard/treatment/persetujuan-treatment/rm-view")} className="w-full">
            Buka RM View
          </Button>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <h2 className="mb-2 text-lg font-semibold">Top Management View</h2>
          <p className="mb-4 text-sm text-muted-foreground">
            Lihat treatment yang telah diajukan oleh Risk Manager dan berikan persetujuan akhir.
          </p>
          <Button onClick={() => router.push("/dashboard/treatment/persetujuan-treatment/top-view")} className="w-full">
            Buka Top Management View
          </Button>
        </div>
      </div>
    </div>
  );
}
