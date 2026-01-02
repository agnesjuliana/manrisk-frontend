import React, { useState } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Edit, Trash, Eye } from "lucide-react";

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
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedBound, setSelectedBound] = useState<TechnicalBound | null>(null);

  const openDetail = (bound: TechnicalBound) => {
    setSelectedBound(bound);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedBound(null);
  };
  return (
    <Card className="border border-sky-100 shadow-md bg-white">
      <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50/50 to-white pb-4">
        <CardTitle className="text-gray-900">Konteks & Ruang Lingkup</CardTitle>
        <CardDescription className="text-gray-600">
          Ruang lingkup teknis, unit terkait, dan catatan.
        </CardDescription>
      </CardHeader>
      <CardContent>
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
                          onClick={() => openDetail(t)}
                        >
                          <Eye size={18} className="text-sky-600" />
                        </button>
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

      {/* Detail Modal */}
      <Dialog open={detailOpen} onOpenChange={(open) => !open && closeDetail()}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader className="border-b border-sky-100 pb-4">
            <DialogTitle className="text-2xl text-gray-900">Detail Batasan Teknis</DialogTitle>
            <DialogDescription className="text-gray-600">
              Informasi lengkap mengenai batasan teknis sistem dan infrastruktur
            </DialogDescription>
          </DialogHeader>
          {selectedBound && (
            <div className="space-y-6">
              <div>
                <label className="text-xs font-semibold text-sky-900 uppercase tracking-widest block mb-2">Nama</label>
                <p className="text-lg font-semibold text-gray-900">
                  {selectedBound.name}
                </p>
              </div>
              <div>
                <label className="text-xs font-semibold text-sky-900 uppercase tracking-widest block mb-2">Deskripsi</label>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">
                  {selectedBound.description}
                </p>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 border-t border-sky-100 pt-4 mt-6">
            <Button variant="outline" onClick={closeDetail}>
              Tutup
            </Button>
            <Button 
              className="bg-sky-600 hover:bg-sky-700 text-white"
              onClick={() => {
                closeDetail();
                // Find the index of the selected bound and open edit
                const idx = technical_bounds.findIndex(t => t.name === selectedBound?.name);
                if (idx >= 0) {
                  openEditRow("scope.technical_bounds", idx);
                }
              }}
            >
              Edit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
