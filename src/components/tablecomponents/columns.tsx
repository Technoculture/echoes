"use client";

import { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/badge";
import { Checkbox } from "@/components/ui/checkbox";

import { accesses, doctypes, labels2 } from "../../assets/data/data";
import { Task } from "../../assets/data/schema";
import { DataTableColumnHeader } from "./data-table-column-header";
import { DataTableRowActions } from "./data-table-row-actions";
import { timestampToDate } from "@/utils/helpers";

export const columns: ColumnDef<Task>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Id" />
    ),
    cell: ({ row }) => <div className="">{row.getValue("id")}</div>,
    enableSorting: false,
    enableHiding: true,
  },
  {
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const label = labels2.find((label) => label.value === row.original.label);

      return (
        <div className="flex space-x-2">
          {label && (
            <Badge variant={label.value === "internal" ? "outline" : "default"}>
              {label.label}
            </Badge>
          )}
          <span className="max-w-[500px] truncate font-medium">
            {row.getValue("title")}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "access",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Access" />
    ),
    cell: ({ row }) => {
      const access = accesses.find(
        (access) => access.value === row.getValue("access"),
      );

      if (!access) {
        return null;
      }

      return (
        <div className="flex items-center">
          {access.icon && (
            <access.icon className="mr-2 h-4 w-4 text-muted-foreground" />
          )}
          <span>{access.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "type",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Type" />
    ),
    cell: ({ row }) => {
      const doc = doctypes.find((doc) => doc.value === row.getValue("type"));

      if (!doc) {
        return null;
      }

      return (
        <div className="flex items-center">
          <span>{doc.label}</span>
        </div>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "addedBy",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Added-By" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex">
          <span>{row.getValue("addedBy")}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "addedOn",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Added-By" />
    ),
    cell: ({ row }) => {
      return (
        <div className="flex">
          <span>{timestampToDate(Number(row.getValue("addedOn")))}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => <DataTableRowActions row={row} />,
  },
];
