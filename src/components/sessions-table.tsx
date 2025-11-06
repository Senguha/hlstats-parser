"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { GameSession } from "@/types/types"

interface SessionsTableProps {
  sessions: GameSession[]
}

export function SessionsTable({ sessions }: SessionsTableProps) {
  return (
    <div className="rounded-md border overflow-x-auto w-1/2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Time Played</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium whitespace-nowrap">{session.date.toLocaleDateString()}</TableCell>
              <TableCell className="whitespace-nowrap">{session.time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
