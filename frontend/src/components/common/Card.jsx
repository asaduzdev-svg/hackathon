export default function Card({ children, className = '', as: Tag = 'div', ...props }) {
  return (
    <Tag
      className={`rounded-xl border border-border bg-surface shadow-card ${className}`}
      {...props}
    >
      {children}
    </Tag>
  )
}
