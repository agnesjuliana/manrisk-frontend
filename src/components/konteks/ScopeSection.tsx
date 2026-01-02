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
    <Card className="border border-sky-100 shadow-md bg-white">
      <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50/50 to-white pb-4">
        <CardTitle className="text-gray-900">Konteks & Ruang Lingkup</CardTitle>
        <CardDescription className="text-gray-600">
          Ruang lingkup teknis, unit terkait, dan catatan.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Batasan Teknis</h3>
            {!isReadOnly && (
              <Button
                size="sm"
                className="bg-sky-600 hover:bg-sky-700 text-white"
                onClick={() => openAddModal("scope.technical_bounds")}
              >
                Tambah
              </Button>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-sky-50 border-b border-sky-100">
                <TableHead className="text-gray-700 font-semibold">No</TableHead>
                <TableHead className="text-gray-700 font-semibold">Nama</TableHead>
                <TableHead className="text-gray-700 font-semibold">Deskripsi</TableHead>
                {!isReadOnly && <TableHead className="text-gray-700 font-semibold">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {technical_bounds.map((t, i) => (
                <TableRow key={i} className="border-b border-sky-50 hover:bg-sky-50/30 transition-colors">
                  <TableCell className="w-8 text-gray-600">{i + 1}</TableCell>
                  <TableCell className="text-gray-900">{t.name}</TableCell>
                  <TableCell className="text-gray-700">
                    {t.description.length > 30
                      ? t.description.slice(0, 30).replace(/\s+$/, "") + "..."
                      : t.description}
                  </TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 hover:bg-sky-100 rounded transition-colors"
                          onClick={() => openEditRow("scope.technical_bounds", i)}
                        >
                          <Edit size={18} className="text-sky-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-100 rounded transition-colors"
                          onClick={() =>
                            removeArrayItem("scope.technical_bounds", i)
                          }
                        >
                          <Trash size={18} className="text-red-600" />
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
