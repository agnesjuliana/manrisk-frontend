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
import { Edit, Trash } from "lucide-react";

type TechnicalBound = { name: string; description: string };

export default function ScopeSection({
  technical_bounds,
  openAddModal,
  openEditRow,
  removeArrayItem,
  isReadOnly = false,
}: {
  technical_bounds: TechnicalBound[];
  openAddModal: (path: string) => void;
  openEditRow: (path: string, idx: number) => void;
  removeArrayItem: (path: string, idx: number) => void;
  isReadOnly?: boolean;
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
            {!isReadOnly && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openAddModal("scope.technical_bounds")}
              >
                Tambah
              </Button>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Deskripsi</TableHead>
                {!isReadOnly && <TableHead>Aksi</TableHead>}
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
                  {!isReadOnly && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          onClick={() => openEditRow("scope.technical_bounds", i)}
                        >
                          <Edit size={18} className="text-gray-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          onClick={() =>
                            removeArrayItem("scope.technical_bounds", i)
                          }
                        >
                          <Trash size={18} className="text-gray-600" />
                        </button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
