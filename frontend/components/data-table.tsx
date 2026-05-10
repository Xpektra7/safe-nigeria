import * as React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type SortingState,
} from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useIsMobile } from "@/hooks/use-mobile";

export type FloodIncident = {
  id: number;
  timestamp: string;
  station: string;
  waterLevelCm: number;
  rainfallMm: number;
  alertLevel: "GREEN" | "YELLOW" | "RED";
  prob1h: number;
  prob3h: number;
  prob6h: number;
};

const columns: ColumnDef<FloodIncident>[] = [
  {
    accessorKey: "timestamp",
    header: "Timestamp",
    cell: ({ row }) => new Date(row.original.timestamp).toLocaleString(),
  },
  {
    accessorKey: "station",
    header: "Station",
    cell: ({ row }) => row.original.station,
  },
  {
    accessorKey: "waterLevelCm",
    header: () => <div className="text-right">Water (cm)</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">{row.original.waterLevelCm}</div>
    ),
  },
  {
    accessorKey: "rainfallMm",
    header: () => <div className="text-right">Rainfall (mm)</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {row.original.rainfallMm.toFixed(1)}
      </div>
    ),
  },
  {
    accessorKey: "alertLevel",
    header: "Alert",
    cell: ({ row }) => {
      const tone =
        row.original.alertLevel === "RED"
          ? "destructive"
          : row.original.alertLevel === "YELLOW"
            ? "warning"
            : "outline";

      return <Badge variant={tone}>{row.original.alertLevel}</Badge>;
    },
  },
  {
    accessorKey: "prob1h",
    header: () => <div className="text-right">1h</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {Math.round(row.original.prob1h * 100)}%
      </div>
    ),
  },
  {
    accessorKey: "prob3h",
    header: () => <div className="text-right">3h</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {Math.round(row.original.prob3h * 100)}%
      </div>
    ),
  },
  {
    accessorKey: "prob6h",
    header: () => <div className="text-right">6h</div>,
    cell: ({ row }) => (
      <div className="text-right tabular-nums">
        {Math.round(row.original.prob6h * 100)}%
      </div>
    ),
  },
];

export function DataTable({ data }: { data: FloodIncident[] }) {
  const isMobile = useIsMobile();
  const [sorting, setSorting] = React.useState<SortingState>([
    { id: "timestamp", desc: true },
  ]);
  const [globalFilter, setGlobalFilter] = React.useState("");

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: (row, columnId, filterValue) => {
      const raw = String(row.getValue(columnId)).toLowerCase();
      return raw.includes(String(filterValue).toLowerCase());
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <section className="px-4 lg:px-6">
      <div className="rounded-3xl border border-border bg-card p-5 shadow-[0_30px_80px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">
              Incident log
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">
              Recent flood readings
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <Input
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder="Filter station or alert"
              className="w-sm border-border bg-background text-foreground placeholder:text-muted-foreground"
            />
            <Button variant="outline" size="sm">
              {isMobile
                ? "Rows"
                : `${table.getFilteredRowModel().rows.length} rows`}
            </Button>
          </div>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-background">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      className="text-foreground"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} className="border-border">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="text-foreground">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No flood readings found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}
