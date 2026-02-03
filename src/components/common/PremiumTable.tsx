import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface PremiumTableProps {
  headers: string[]
  rows: (string | React.ReactNode)[][]
  loading?: boolean
  loadingRows?: number
}

export function PremiumTable({ headers, rows, loading, loadingRows = 5 }: PremiumTableProps) {
  return (
    <Table className="border border-border rounded-lg overflow-hidden">
      <TableHeader>
        <TableRow className="bg-primary hover:bg-primary border-none">
          {headers.map((header, i) => (
            <TableHead
              key={i}
              className="text-primary-foreground font-bold uppercase tracking-wider"
            >
              {header}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {loading
          ? Array.from({ length: loadingRows }).map((_, i) => (
              <TableRow key={i}>
                {headers.map((_, j) => (
                  <TableCell key={j}>
                    <Skeleton className="h-8 w-full skeleton-red" />
                  </TableCell>
                ))}
              </TableRow>
            ))
          : rows.map((row, i) => (
              <TableRow key={i} className="hover:bg-muted/50 border-border">
                {row.map((cell, j) => (
                  <TableCell key={j}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
      </TableBody>
    </Table>
  )
}
