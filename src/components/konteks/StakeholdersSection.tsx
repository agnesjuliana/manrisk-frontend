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

const formatRole = (role: string) => {
  return role
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
};

export default function StakeholdersSection({
  users,
  external,
  openAddModal,
  openEditRow,
  removeArrayItem,
  isReadOnly = false,
}: {
  users: any[];
  external?: { name: string; interest?: string }[];
  openAddModal: (path: string) => void;
  openEditRow: (path: string, idx: number) => void;
  removeArrayItem: (path: string, idx: number) => void;
  isReadOnly?: boolean;
}) {
  return (
    <Card className="border border-sky-100 shadow-md bg-white">
      <CardHeader className="border-b border-sky-100 bg-gradient-to-r from-sky-50/50 to-white pb-4">
        <CardTitle className="text-gray-900">Stakeholders</CardTitle>
        <CardDescription className="text-gray-600">
          Daftar pemangku kepentingan internal dan eksternal.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">Internal</h3>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="bg-sky-50 border-b border-sky-100">
                <TableHead className="text-gray-700 font-semibold">No</TableHead>
                <TableHead className="text-gray-700 font-semibold">Nama</TableHead>
                <TableHead className="text-gray-700 font-semibold">Role</TableHead>
                {/* <TableHead className="text-gray-700 font-semibold">Divisi</TableHead> */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u, i) => (
                <TableRow key={u.id ?? i} className="border-b border-sky-50 hover:bg-sky-50/30 transition-colors">
                  <TableCell className="w-8 text-gray-600">{i + 1}</TableCell>
                  <TableCell className="text-gray-900">{u.name}</TableCell>
                  <TableCell className="text-gray-700">{formatRole(u.role)}</TableCell>
                  {/* <TableCell className="text-gray-700">{u.division}</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-900">External</h3>
            {!isReadOnly && (
              <Button
                size="sm"
                className="bg-sky-600 hover:bg-sky-700 text-white"
                onClick={() => openAddModal("stakeholders.external")}
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
                <TableHead className="text-gray-700 font-semibold">Interest</TableHead>
                {!isReadOnly && <TableHead className="text-gray-700 font-semibold">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {(external ?? []).map((s, i) => (
                <TableRow key={i}>
                  <TableCell className="w-8">{i + 1}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>
                    <span title={s.interest}>
                      {s.interest && s.interest.length > 100
                        ? `${s.interest.substring(0, 100)}...`
                        : s.interest}
                    </span>
                  </TableCell>
                  {!isReadOnly && (
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
