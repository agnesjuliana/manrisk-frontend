import React from "react";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardAction,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Edit, Trash } from "lucide-react";

export default function CiaSection({
  cia,
  ciaLoadError,
  onEdit,
  openAddModal,
  openEditRow,
  removeArrayItem,
  isReadOnly = false,
}: {
  cia: any;
  ciaLoadError: boolean;
  onEdit: () => void;
  openAddModal: (path: string) => void;
  openEditRow: (path: string, idx: number) => void;
  removeArrayItem: (path: string, idx: number) => void;
  isReadOnly?: boolean;
}) {
  const handleAddServicePriority = () => {
    if (ciaLoadError) {
      toast.error("Silakan edit CIA Objectives terlebih dahulu");
      return;
    }
    openAddModal("cia.service_priorities");
  };
  return (
    <Card className="border border-sky-100 shadow-md bg-white">
      <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50/50 to-white pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-gray-900">CIA Objectives</CardTitle>
            <CardDescription className="text-gray-600">
              Confidentiality / Integrity / Availability dan prioritas layanan.
            </CardDescription>
          </div>
          {!isReadOnly && (
            <Button className="bg-sky-600 hover:bg-sky-700 text-white" onClick={onEdit}>
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-4 p-3 bg-sky-50 rounded-lg border border-sky-100">
          <Label className="text-sky-900 font-semibold">Confidentiality<i>(Kerahasiaan)</i></Label>
          <p className="mb-2 text-sm text-gray-700">{cia.confidentiality}</p>
        </div>
        <div className="mb-4 p-3 bg-sky-50 rounded-lg border border-sky-100">
          <Label className="text-sky-900 font-semibold">Integrity<i>(Integritas)</i></Label>
          <p className="mb-2 text-sm text-gray-700">{cia.integrity}</p>
        </div>
        <div className="mb-4 p-3 bg-sky-50 rounded-lg border border-sky-100">
          <Label className="text-sky-900 font-semibold">Availability<i>(Ketersediaan)</i></Label>
          <p className="mb-2 text-sm text-gray-700">{cia.availability}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Prioritas Layanan</h3>
            {!isReadOnly && (
              <Button
                size="sm"
                className="bg-sky-600 hover:bg-sky-700 text-white"
                onClick={handleAddServicePriority}
              >
                Tambah
              </Button>
            )}
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-sky-50 border-b border-sky-100">
                <TableHead className="text-gray-700 font-semibold">No</TableHead>
                <TableHead className="text-gray-700 font-semibold">Service</TableHead>
                <TableHead className="text-gray-700 font-semibold">C</TableHead>
                <TableHead className="text-gray-700 font-semibold">I</TableHead>
                <TableHead className="text-gray-700 font-semibold">A</TableHead>
                {!isReadOnly && <TableHead className="text-gray-700 font-semibold">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {cia.service_priorities?.map((s: any, i: number) => (
                <TableRow key={i}>
                  <TableCell className="w-8">{i + 1}</TableCell>
                  <TableCell>{s.service}</TableCell>
                  <TableCell>{s.C}</TableCell>
                  <TableCell>{s.I}</TableCell>
                  <TableCell>{s.A}</TableCell>
                  {!isReadOnly && (
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <button
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          onClick={() => openEditRow("cia.service_priorities", i)}
                        >
                          <Edit size={18} className="text-gray-600" />
                        </button>
                        <button
                          className="p-2 hover:bg-gray-100 rounded transition-colors"
                          onClick={() =>
                            removeArrayItem("cia.service_priorities", i)
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
