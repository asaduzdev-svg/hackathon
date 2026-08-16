export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      {Icon && (
        <span className="rounded-2xl bg-surface-muted p-4">
          <Icon size={28} className="text-muted" />
        </span>
      )}
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        {description && <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      </div>
      {action && <div className="mt-1">{action}</div>}
    </div>
  )
}
