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

export default function StakeholdersSection({
  users,
  external,
  openAddModal,
  openEditRow,
  removeArrayItem,
}: {
  users: any[];
  external?: { name: string; interest?: string }[];
  openAddModal: (path: string) => void;
  openEditRow: (path: string, idx: number) => void;
  removeArrayItem: (path: string, idx: number) => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stakeholders</CardTitle>
        <CardDescription>
          Daftar pemangku kepentingan internal dan eksternal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">Internal</h3>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Divisi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u, i) => (
                <TableRow key={u.id ?? i}>
                  <TableCell className="w-8">{i + 1}</TableCell>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.role}</TableCell>
                  <TableCell>{u.division}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium">External</h3>
            <Button
              size="sm"
              variant="outline"
              onClick={() => openAddModal("stakeholders.external")}
            >
              Tambah
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead>No</TableHead>
                <TableHead>Nama</TableHead>
                <TableHead>Interest</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(external ?? []).map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="w-8">{i + 1}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.interest}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        onClick={() => openEditRow("stakeholders.external", i)}
                      >
                        <Edit size={18} className="text-gray-600" />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        onClick={() =>
                          removeArrayItem("stakeholders.external", i)
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
