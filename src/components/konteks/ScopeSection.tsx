import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon } from "lucide-react";

type TechnicalBound = { name: string; description: string };

export default function ScopeSection({
  technical_bounds,
  openAddModal,
  openEditRow,
  removeArrayItem,
}: {
  technical_bounds: TechnicalBound[];
  openAddModal: (path: string) => void;
  openEditRow: (path: string, idx: number) => void;
  removeArrayItem: (path: string, idx: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Konteks & Ruang Lingkup</CardTitle>
        <CardDescription>
          Ruang lingkup teknis, unit terkait, dan catatan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Batasan Teknis</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAddModal("scope.technical_bounds")}
            >
              Tambah
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {technical_bounds.map((t, i) => (
                <TableRow key={i}>
                  <TableCell className="w-8">{i + 1}</TableCell>
                  <TableCell>{t.name}</TableCell>
                  <TableCell>
                    {t.description.length > 30
                      ? t.description.slice(0, 30).replace(/\s+$/, "") + "..."
                      : t.description}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditRow("scope.technical_bounds", i)}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          removeArrayItem("scope.technical_bounds", i)
                        }
                      >
                        <TrashIcon />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
