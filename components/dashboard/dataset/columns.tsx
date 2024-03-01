"use client"
import React from 'react'
import { ColumnDef } from "@tanstack/react-table"

import { Checkbox } from "@/components/ui/checkbox"

import { statuses } from "./config"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableRowActions } from "./data-table-row-actions"
import { Document } from "@/types/document";
import { Job } from "@/types/job";
import dayjs from 'dayjs'

export const columns: ColumnDef<Document>[] = [
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
            <DataTableColumnHeader column={column} title="Task" />
        ),
        cell: ({ row }) => <div className="w-[300px]">{row.getValue("id")}</div>,
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: "show_name",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Title" />
        ),
        cell: ({ row }) => <div>{row.getValue('show_name')}</div>,
    },
    {
        accessorKey: "task",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="Status" />
        ),
        cell: ({ row }) => {
            const task = row.getValue("task") as Job
            const taskStatus = task.task_status;
            const status = statuses.find(
                (status) => status.value === taskStatus
            )

            if (!status) {
                return null
            }

            return (
                <div className="flex w-[100px] items-center">
                    {status.icon && (
                        <status.icon className="mr-2 h-4 w-4 text-muted-foreground" />
                    )}
                    <span>{status.label}</span>
                </div>
            )
        },
        filterFn: (row, id, value) => {
            return value.includes(row.getValue(id))
        },
    },
    {
        accessorKey: "updated_at",
        header: ({ column }) => (
            <DataTableColumnHeader column={column} title="create time" />
        ),
        cell: ({ row }) => dayjs(row.getValue("created_at")).format('YYYY-MM-DD HH:mm:ss'),
    },
    {
        id: "actions",
        cell: ({ row }) => <DataTableRowActions row={row} />,
    },
]
