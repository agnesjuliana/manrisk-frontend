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
import { PencilIcon, TrashIcon } from "lucide-react";

export default function RegulationsSection({
  selected,
  openAddModal,
  openEditRow,
  removeArrayItem,
}: {
  selected: string[];
  openAddModal: (path: string) => void;
  openEditRow: (path: string, idx: number) => void;
  removeArrayItem: (path: string, idx: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Regulasi</CardTitle>
        <CardDescription>
          Daftar regulasi yang relevan dan catatan.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Regulasi Terpilih</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAddModal("regulations.selected")}
            >
              Tambah
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No</TableHead>
                <TableHead>Regulasi</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {selected.map((r, i) => (
                <TableRow key={i}>
                  <TableCell className="w-8">{i + 1}</TableCell>
                  <TableCell>{r}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEditRow("regulations.selected", i)}
                      >
                        <PencilIcon />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() =>
                          removeArrayItem("regulations.selected", i)
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
        <div>
          <Label>Catatan</Label>
          <p className="text-sm mb-2">(lihat dialog edit untuk catatan)</p>
        </div>
      </CardContent>
    </Card>
  );
}
