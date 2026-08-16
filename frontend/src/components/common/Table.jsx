import EmptyState from './EmptyState.jsx'

// Data table. Two APIs:
//   1. <Table columns rows onRowClick mobileRender empty />  (pages)
//   2. semantic children: <Table><THead>...</THead><TBody>...</TBody></Table>
export default function Table({
  columns = [],
  rows = [],
  onRowClick,
  mobileRender,
  empty,
  className = '',
  children,
}) {
  const hasRows = rows.length > 0

  if (columns.length > 0 && !hasRows) {
    return (
      <div className={className}>
        {empty ? (
          <EmptyState
            icon={empty.icon}
            title={empty.title}
            description={empty.description}
            action={empty.action}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface px-5 py-12 text-center text-sm text-muted-foreground">
            —
          </div>
        )}
      </div>
    )
  }

  if (columns.length > 0) {
    const body = (
      <tbody>
        {rows.map((row, idx) => (
          <tr
            key={row?.id || idx}
            onClick={onRowClick ? () => onRowClick(row) : undefined}
            className={`${onRowClick ? 'group cursor-pointer transition-colors hover:bg-surface-muted' : ''}`}
          >
            {columns.map((col) => {
              const alignCls =
                col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
              return (
                <td
                  key={col.key}
                  className={`border-b border-border px-3 py-3 align-middle text-sm ${alignCls} ${col.className || ''}`}
                >
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              )
            })}
          </tr>
        ))}
      </tbody>
    )

    return (
      <div className={className}>
        <div className={`overflow-x-auto ${mobileRender ? 'hidden md:block' : ''}`}>
          <table className="w-full border-separate border-spacing-0 text-sm">
            <thead>
              <tr>
                {columns.map((col) => {
                  const alignCls =
                    col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'
                  return (
                    <th
                      key={col.key}
                      className={`border-b border-border bg-surface px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${alignCls}`}
                    >
                      {col.header}
                    </th>
                  )
                })}
              </tr>
            </thead>
            {body}
          </table>
        </div>
        {mobileRender && (
          <div className="flex flex-col gap-3 md:hidden">
            {rows.map((row, idx) => (
              <div key={row?.id || idx}>{mobileRender(row)}</div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Semantic children API
  return <div className={`overflow-x-auto ${className}`}>{children}</div>
}

export function THead({ children }) {
  return (
    <thead>
      <tr>{children}</tr>
    </thead>
  )
}

export function TH({ children, align = 'left', className = '' }) {
  const alignCls = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <th
      className={`border-b border-border bg-surface px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground ${alignCls} ${className}`}
    >
      {children}
    </th>
  )
}

export function TBody({ children }) {
  return <tbody>{children}</tbody>
}

export function TR({ children, onClick, className = '' }) {
  return (
    <tr
      onClick={onClick}
      className={`group ${onClick ? 'cursor-pointer transition-colors hover:bg-surface-muted' : ''} ${className}`}
    >
      {children}
    </tr>
  )
}

export function TD({ children, align = 'left', className = '' }) {
  const alignCls = align === 'right' ? 'text-right' : align === 'center' ? 'text-center' : 'text-left'
  return (
    <td className={`border-b border-border px-3 py-3 align-middle text-sm ${alignCls} ${className}`}>
      {children}
    </td>
  )
}
