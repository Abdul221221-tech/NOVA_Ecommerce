import { createClient } from '@/lib/supabase/server'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'

export default async function AdminActivityLogsPage() {
  const supabase = await createClient()

  // Ensure table exists in query, graceful fallback if user hasn't run SQL patch
  const { data: logs, error } = await supabase
    .from('admin_activity_log')
    .select(`
      *,
      profiles:admin_id ( name, email )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="font-heading text-3xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground">Audit trail of all critical platform-level actions.</p>
      </div>

      {error ? (
        <div className="p-4 border border-status-warning bg-status-warning/10 text-status-warning rounded-md">
          <strong>Database Sync Required:</strong> The Activity Logs table is missing. Please run the provided SQL Patch (ADMIN-DB-PATCH.sql) in your Supabase SQL Editor.
        </div>
      ) : (
        <div className="rounded-md border bg-card mt-4 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date & Time</TableHead>
                <TableHead>Admin User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Target Resource</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {!logs || logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center h-32 text-muted-foreground">
                    No activity logs recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell className="text-xs whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </TableCell>
                    <TableCell className="font-medium">
                      {log.profiles?.email || 'Unknown Admin'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-mono text-xs uppercase bg-slate-900">
                        {log.action}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-slate-400">
                      <span className="font-semibold text-slate-300">{log.target_type}</span>: {log.target_id.split('-')[0]}...
                    </TableCell>
                    <TableCell className="text-sm">
                      {log.details}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
