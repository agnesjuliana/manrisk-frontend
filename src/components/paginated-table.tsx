import * as React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";

export interface ColumnDef<T> {
  header: string;
  key: keyof T | ((row: T) => React.ReactNode);
  render?: (value: unknown, row: T) => React.ReactNode;
  searchable?: boolean;
}

interface PaginatedTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  pageSize?: number;
  emptyMessage?: string;
  showStatusFilter?: boolean;
}

export function PaginatedTable<T extends { id: string; status?: string }>({
  data,
  columns,
  pageSize = 10,
  emptyMessage = "Tidak ada data",
  showStatusFilter = false,
}: PaginatedTableProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const [currentPageSize, setCurrentPageSize] = React.useState(pageSize);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string | null>(null);

  // Extract unique statuses from data
  const uniqueStatuses = React.useMemo(() => {
    const statuses = new Set<string>();
    data.forEach((item) => {
      if (item.status) statuses.add(item.status);
    });
    return Array.from(statuses).sort();
  }, [data]);

  // Filter data based on search and status
  const filteredData = React.useMemo(() => {
    let result = data;

    // Apply status filter
    if (statusFilter && showStatusFilter) {
      result = result.filter((item) => item.status === statusFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter((item) => {
        return columns.some((col) => {
          if (col.searchable === false) return false;
          const value = typeof col.key === "function" ? col.key(item) : item[col.key as keyof T];
          return String(value ?? "").toLowerCase().includes(query);
        });
      });
    }

    return result;
  }, [data, searchQuery, statusFilter, columns, showStatusFilter]);

  const totalPages = Math.ceil(filteredData.length / currentPageSize);
  const startIndex = (currentPage - 1) * currentPageSize;
  const endIndex = startIndex + currentPageSize;
  const paginatedData = filteredData.slice(startIndex, endIndex);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [filteredData.length, currentPageSize]);

  const getCellValue = (row: T, column: ColumnDef<T>) => {
    if (typeof column.key === "function") {
      return column.key(row);
    }
    return row[column.key as keyof T];
  };

  const generatePaginationItems = () => {
    const items: React.ReactNode[] = [];
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    if (endPage - startPage < maxPagesToShow - 1) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }

    if (startPage > 1) {
      items.push(
        <PaginationItem key="first">
          <PaginationLink onClick={(e) => { e.preventDefault(); setCurrentPage(1); }}>
            1
          </PaginationLink>
        </PaginationItem>
      );
      if (startPage > 2) {
        items.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={(e) => { e.preventDefault(); setCurrentPage(i); }}
            isActive={i === currentPage}
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        items.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>
        );
      }
      items.push(
        <PaginationItem key="last">
          <PaginationLink onClick={(e) => { e.preventDefault(); setCurrentPage(totalPages); }}>
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  if (data.length === 0) {
    return (
      <div className="rounded-lg border p-8 text-center">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 w-full min-w-0">
      {/* Search and Filter Bar */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sky-400" size={18} />
          <Input
            placeholder="Telusuri disini"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-8 bg-white border-sky-200 focus:border-sky-400 focus:ring-sky-100"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sky-400 hover:text-sky-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <button className="p-2 hover:bg-sky-50 rounded-lg border border-sky-200 flex-shrink-0 text-sky-600">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
        </button>
      </div>

      {/* Table */}
      <div className="border border-sky-100 rounded-lg overflow-hidden bg-white w-full min-w-0">
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-sky-100 border-b border-sky-200 hover:bg-sky-100">
                {columns.map((column, idx) => (
                  <TableHead key={idx} className="px-6 py-4 text-left text-sm font-semibold text-sky-900 bg-sky-100 whitespace-nowrap">
                    {column.header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.map((row) => (
                <TableRow key={row.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                  {columns.map((column, idx) => {
                    const value = getCellValue(row, column);
                    const rendered = column.render
                      ? column.render(value, row)
                      : String(value ?? "");
                    return (
                      <TableCell key={idx} className="px-6 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {rendered}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {paginatedData.length === 0 && (
            <div className="px-6 py-8 text-center">
              <p className="text-gray-500">{emptyMessage}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
