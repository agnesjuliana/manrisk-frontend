import React from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { Edit, Trash } from "lucide-react";

export default function RegulationsSection({
  selected,
  openAddModal,
  openEditRow,
  removeArrayItem,
  isReadOnly = false,
}: {
  selected: { id?: string; name: string }[];
  openAddModal: (path: string) => void;
  openEditRow: (path: string, idx: number) => void;
  removeArrayItem: (path: string, idx: number) => void;
  isReadOnly?: boolean;
}) {
  return (
    <Card className="border border-sky-100 shadow-md bg-white">
      <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50/50 to-white pb-4">
        <CardTitle className="text-gray-900">Regulasi</CardTitle>
        <CardDescription className="text-gray-600">
          Daftar regulasi yang relevan dan catatan.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Regulasi Terpilih</h3>
            {!isReadOnly && (
              <Button
                size="sm"
                className="bg-sky-600 hover:bg-sky-700 text-white"
                onClick={() => openAddModal("regulations.selected")}
              >
                Tambah
              </Button>
            )}
          </div>
          <Table>
            <TableHeader>
              <TableRow className="bg-sky-50 border-b border-sky-100">
                <TableHead className="text-gray-700 font-semibold">No</TableHead>
                <TableHead className="text-gray-700 font-semibold">Regulasi</TableHead>
                {!isReadOnly && <TableHead className="text-gray-700 font-semibold">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {selected.map((r, i) => (
                <TableRow key={i} className="border-b border-sky-50 hover:bg-sky-50/30 transition-colors">
                  <TableCell className="w-8 text-gray-600">{i + 1}</TableCell>
                  <TableCell className="text-gray-900">{r.name}</TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 hover:bg-sky-100 rounded transition-colors"
                          onClick={() => openEditRow("regulations.selected", i)}
                        >
                          <Edit size={18} className="text-sky-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-100 rounded transition-colors"
                          onClick={() =>
                            removeArrayItem("regulations.selected", i)
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
