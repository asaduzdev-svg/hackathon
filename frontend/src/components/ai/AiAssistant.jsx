import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Bot, Send, Sparkles, X } from 'lucide-react'
import { useI18n } from '../../i18n/index.jsx'
import { aiApi } from '../../services/modules/aiApi.js'
import { useClickOutside } from '../../hooks/useClickOutside.js'

export default function AiAssistant() {
  const { t } = useI18n()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [thinking, setThinking] = useState(false)
  const bodyRef = useRef(null)
  const panelRef = useClickOutside(() => setOpen(false))

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ role: 'assistant', text: t('ai.greeting') }])
    }
  }, [open, messages.length, t])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [messages, thinking])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape' && open) setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const send = async (text) => {
    const msg = String(text || '').trim()
    if (!msg || thinking) return
    const history = messages.filter((m) => m.role !== 'assistant' || m !== messages[0]).map((m) => ({
      role: m.role,
      content: m.text,
    }))
    setMessages((prev) => [...prev, { role: 'user', text: msg }])
    setInput('')
    setThinking(true)
    try {
      const res = await aiApi.chat(msg, history)
      setMessages((prev) => [...prev, { role: 'assistant', text: res.answer }])
    } catch {
      setMessages((prev) => [...prev, { role: 'assistant', text: t('ai.error') }])
    } finally {
      setThinking(false)
    }
  }

  const quick = (key) => () => send(t(`ai.quick.${key}`))

  return (
    <>
      <button
        type="button"
        aria-label={t('ai.title')}
        onClick={() => setOpen((v) => !v)}
        className="press fixed bottom-5 right-4 z-[60] flex h-13 w-13 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-400 text-white shadow-pop sm:bottom-6 sm:right-6"
      >
        {open ? <X size={22} /> : <Bot size={24} />}
        {!open && <span className="animate-pulse-soft absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />}
      </button>

      {open &&
        createPortal(
          <div ref={panelRef} className="fixed bottom-20 right-4 z-[70] flex h-[min(560px,70dvh)] w-[calc(100vw-2rem)] max-w-md animate-scale-in flex-col overflow-hidden rounded-2xl border border-border bg-surface shadow-pop sm:bottom-24 sm:right-6">
            <div className="gradient-brand flex items-center gap-3 px-4 py-3.5 text-white">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                <Sparkles size={18} />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{t('ai.title')}</p>
                <p className="truncate text-[11px] text-white/80">{t('ai.subtitle')}</p>
              </div>
              <button
                type="button"
                aria-label={t('common.close')}
                onClick={() => setOpen(false)}
                className="ml-auto rounded-lg p-1.5 text-white/80 hover:bg-white/15 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div ref={bodyRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.role === 'user'
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-bl-sm bg-surface-muted text-foreground'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {thinking && (
                <div className="flex justify-start">
                  <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm bg-surface-muted px-3.5 py-2.5 text-sm text-muted-foreground">
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:0ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:120ms]" />
                    <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current [animation-delay:240ms]" />
                  </div>
                </div>
              )}
            </div>

            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 px-4 pb-2">
                {['parts', 'diagnose', 'tip'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={quick(k)}
                    className="rounded-full border border-border-strong bg-surface px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/10 hover:text-primary-strong"
                  >
                    {t(`ai.quick.${k}`)}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault()
                send(input)
              }}
              className="flex items-center gap-2 border-t border-border px-3 py-2.5"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t('ai.placeholder')}
                className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/15"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                aria-label={t('ai.send')}
                className="press flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground disabled:opacity-40"
              >
                <Send size={17} />
              </button>
            </form>
          </div>,
          document.body,
        )}
    </>
  )
}
