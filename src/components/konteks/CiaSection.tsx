import React from "react";
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
  onEdit,
  openAddModal,
  openEditRow,
  removeArrayItem,
}: {
  cia: any;
  onEdit: () => void;
  openAddModal: (path: string) => void;
  openEditRow: (path: string, idx: number) => void;
  removeArrayItem: (path: string, idx: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>CIA Objectives</CardTitle>
        <CardDescription>
          Confidentiality / Integrity / Availability dan prioritas layanan.
        </CardDescription>
        <CardAction>
          <Button variant="outline" onClick={onEdit}>
            Edit
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Label>Confidentiality</Label>
          <p className="mb-2 text-sm">{cia.confidentiality}</p>
        </div>
        <div className="mb-4">
          <Label>Integrity</Label>
          <p className="mb-2 text-sm">{cia.integrity}</p>
        </div>
        <div className="mb-4">
          <Label>Availability</Label>
          <p className="mb-2 text-sm">{cia.availability}</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Prioritas Layanan</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAddModal("cia.service_priorities")}
            >
              Tambah
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>No</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>C</TableHead>
                <TableHead>I</TableHead>
                <TableHead>A</TableHead>
                <TableHead>Aksi</TableHead>
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
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
