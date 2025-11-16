import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { GameSession } from "@/types/types"

interface SessionsTableProps {
  sessions: GameSession[]
}


export function SessionsTable({ sessions }: SessionsTableProps) {
  return (
    <div className="rounded-md border grow container min-w-fit">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="font-bold">Date</TableHead>
            <TableHead className="font-bold">Time Played</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sessions.map((session, index) => (
            <TableRow key={index}>
              <TableCell>{new Date(session.date).toLocaleDateString("en-GB")}</TableCell>
              <TableCell>{session.time}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
