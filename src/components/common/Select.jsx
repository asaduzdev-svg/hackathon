import { useState, forwardRef, useId, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Check, AlertCircle } from 'lucide-react'

const Select = forwardRef(function Select(
  { label, hint, error, options = [], placeholder, className = '', value, onChange, children, ...props },
  ref,
) {
  const reactId = useId()
  const id = props.id || `sel-${reactId}`
  const triggerRef = useRef(null)
  const [open, setOpen] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0 })
  const [highlighted, setHighlighted] = useState(0)

  // Parse children if provided (for <option> elements)
  const parsedOptions = (() => {
    if (options.length > 0) return options
    if (!children) return []
    const arr = []
    const walk = (nodes) => {
      nodes.forEach((node) => {
        if (!node) return
        if (Array.isArray(node)) walk(node)
        else if (node.type === 'option') arr.push({ value: node.props.value, label: node.props.children })
      })
    }
    walk(Array.isArray(children) ? children : [children])
    return arr
  })()

  const selected = parsedOptions.find((o) => String(o.value) === String(value))

  useEffect(() => {
    if (!open) return
    const update = () => {
      const r = triggerRef.current?.getBoundingClientRect()
      if (r) setPos({ top: r.bottom + 6, left: r.left, width: r.width })
    }
    update()
    window.addEventListener('scroll', update, true)
    window.addEventListener('resize', update)
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false)
        triggerRef.current?.focus()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setHighlighted((h) => Math.min(h + 1, parsedOptions.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setHighlighted((h) => Math.max(h - 1, 0))
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        const opt = parsedOptions[highlighted]
        if (opt) {
          onChange?.({ target: { value: opt.value } })
          setOpen(false)
        }
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', (e) => {
      if (triggerRef.current?.contains(e.target)) return
      if (e.target.closest(`[data-select-menu="${id}"]`)) return
      setOpen(false)
    })
    return () => {
      window.removeEventListener('scroll', update, true)
      window.removeEventListener('resize', update)
      document.removeEventListener('keydown', onKey)
    }
  }, [open, id, highlighted, parsedOptions, onChange])

  useEffect(() => {
    if (open) {
      const idx = parsedOptions.findIndex((o) => String(o.value) === String(value))
      setHighlighted(idx >= 0 ? idx : 0)
    }
  }, [open, value, parsedOptions])

  const handleSelect = (val) => {
    onChange?.({ target: { value: val } })
    setOpen(false)
    triggerRef.current?.focus()
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-foreground">
          {label}
        </label>
      )}
      <button
        type="button"
        id={id}
        ref={(el) => {
          triggerRef.current = el
          if (typeof ref === 'function') ref(el)
          else if (ref) ref.current = el
        }}
        onClick={() => !props.disabled && setOpen((v) => !v)}
        disabled={props.disabled}
        className={`group relative flex w-full cursor-pointer items-center rounded-lg border bg-surface px-3 py-2.5 pr-9 text-left text-sm text-foreground transition-all duration-150 ${
          error
            ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
            : open
              ? 'border-primary ring-2 ring-primary/20 shadow-sm'
              : 'border-border hover:border-border-strong hover:shadow-xs'
        } disabled:cursor-not-allowed disabled:opacity-60`}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected ? '' : 'text-muted-foreground'}>
          {selected ? selected.label : placeholder || '—'}
        </span>
        <ChevronDown
          size={16}
          className={`pointer-events-none absolute right-3 text-muted-foreground transition-transform duration-200 ${
            open ? 'rotate-180 text-primary' : ''
          }`}
        />
      </button>
      {open &&
        createPortal(
          <div
            data-select-menu={id}
            className="animate-scale-in fixed z-[300] max-h-60 overflow-y-auto rounded-lg border border-border bg-surface shadow-pop"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
            role="listbox"
          >
            <div className="p-1">
              {parsedOptions.length === 0 ? (
                <p className="px-3 py-2 text-sm text-muted-foreground">—</p>
              ) : (
                parsedOptions.map((o, idx) => {
                  const isSel = String(o.value) === String(value)
                  const isH = idx === highlighted
                  return (
                    <button
                      key={String(o.value)}
                      type="button"
                      role="option"
                      aria-selected={isSel}
                      onClick={() => handleSelect(o.value)}
                      onMouseEnter={() => setHighlighted(idx)}
                      className={`flex w-full cursor-pointer items-center justify-between gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors duration-100 ${
                        isSel
                          ? 'bg-primary/15 font-medium text-primary-strong'
                          : isH
                            ? 'bg-surface-hover text-foreground'
                            : 'text-foreground'
                      }`}
                    >
                      <span className="truncate">{o.label}</span>
                      {isSel && <Check size={14} className="shrink-0 text-primary" />}
                    </button>
                  )
                })
              )}
            </div>
          </div>,
          document.body,
        )}
      {error ? (
        <p className="mt-1 flex items-center gap-1 text-xs text-danger">
          <AlertCircle size={12} />
          {error}
        </p>
      ) : hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
})

export default Select
