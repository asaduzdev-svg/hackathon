import { Skeleton } from './Skeleton.jsx'
import EmptyState from './EmptyState.jsx'

export default function Table({
  columns = [],
  rows = [],
  keyField = 'id',
  onRowClick,
  mobileRender,
  loading = false,
  empty = null,
  className = '',
}) {
  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-surface shadow-card">
        <Skeleton className="h-10 rounded-none border-b border-border" />
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 border-b border-border px-4 py-3.5 last:border-0">
            {columns.map((c) => (
              <Skeleton key={c.key} className="h-3.5 flex-1" />
            ))}
          </div>
        ))}
      </div>
    )
  }

  if (rows.length === 0) {
    if (empty) {
      return (
        <div className="rounded-xl border border-border bg-surface shadow-card">
          <EmptyState icon={empty.icon} title={empty.title} description={empty.description} action={empty.action} />
        </div>
      )
    }
    return null
  }

  return (
    <>
      <div className={`hidden overflow-x-auto rounded-xl border border-border bg-surface shadow-card md:block ${className}`}>
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-muted/60">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`whitespace-nowrap px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground ${
                    col.align === 'right' ? 'text-right' : ''
                  }`}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr
                key={row[keyField]}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={`border-b border-border transition-colors last:border-0 ${
                  onRowClick ? 'cursor-pointer hover:bg-surface-hover' : ''
                }`}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-4 py-3 align-middle text-foreground ${
                      col.align === 'right' ? 'text-right' : ''
                    }`}
                  >
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {mobileRender && (
        <div className="flex flex-col gap-3 md:hidden">{rows.map((row) => mobileRender(row))}</div>
      )}
    </>
  )
}
