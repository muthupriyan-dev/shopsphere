import { createContext, useCallback, useContext, useState } from 'react'
import { CheckCircle2, XCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

let idCounter = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((t) => t.filter((toast) => toast.id !== id))
  }, [])

  const push = useCallback((message, type = 'info') => {
    const id = ++idCounter
    setToasts((t) => [...t, { id, message, type }])
    setTimeout(() => remove(id), 3500)
  }, [remove])

  const toast = {
    success: (msg) => push(msg, 'success'),
    error: (msg) => push(msg, 'error'),
    info: (msg) => push(msg, 'info'),
  }

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className="flex items-start gap-2 rounded-xl2 border border-line bg-white px-4 py-3 shadow-soft animate-in"
          >
            {t.type === 'success' && <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-moss-500" />}
            {t.type === 'error' && <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />}
            {t.type === 'info' && <Info className="mt-0.5 h-5 w-5 shrink-0 text-clay" />}
            <p className="flex-1 text-sm text-ink">{t.message}</p>
            <button onClick={() => remove(t.id)} aria-label="Dismiss notification" className="text-ink/40 hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
