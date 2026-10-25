"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"
import type { ReactNode } from "react"
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react"

type ToastType = "success" | "error" | "info"

type ToastMessage = {
  id: number
  message: string
  type: ToastType
}

type ConfirmOptions = {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
}

type PendingConfirmation = ConfirmOptions & {
  resolve: (confirmed: boolean) => void
}

type AlertContextValue = {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  notify: (message: string, type?: ToastType) => void
}

const AlertContext = createContext<AlertContextValue | null>(null)

export const useAlerts = () => {
  const context = useContext(AlertContext)

  if (!context) {
    throw new Error("useAlerts must be used inside AlertProvider")
  }

  return context
}

type AlertProviderProps = {
  children: ReactNode
}

export const AlertProvider = ({ children }: AlertProviderProps) => {
  const [confirmation, setConfirmation] = useState<PendingConfirmation | null>(
    null,
  )
  const [toasts, setToasts] = useState<ToastMessage[]>([])

  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)
  const nextToastId = useRef(0)

  const confirm = useCallback((options: ConfirmOptions) => {
    previousFocusRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null

    return new Promise<boolean>((resolve) => {
      setConfirmation({ ...options, resolve })
    })
  }, [])

  const notify = useCallback((message: string, type: ToastType = "success") => {
    const id = nextToastId.current++

    setToasts((current) => [...current, { id, message, type }])

    window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id))
    }, 3500)
  }, [])

  const closeConfirmation = useCallback((confirmed: boolean) => {
    setConfirmation((current) => {
      if (!current) return null

      current.resolve(confirmed)

      requestAnimationFrame(() => previousFocusRef.current?.focus())

      return null
    })
  }, [])

  useEffect(() => {
    if (!confirmation) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault()
        closeConfirmation(false)
      }

      if (event.key === "Tab") {
        event.preventDefault()

        if (document.activeElement === cancelButtonRef.current) {
          confirmButtonRef.current?.focus()
        } else {
          cancelButtonRef.current?.focus()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    requestAnimationFrame(() => cancelButtonRef.current?.focus())

    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [confirmation, closeConfirmation])

  return (
    <AlertContext.Provider value={{ confirm, notify }}>
      {children}

      <div
        aria-label='Notifications'
        aria-live='polite'
        aria-atomic='false'
        className='pointer-events-none fixed right-4 top-4 z-100 flex w-[calc(100%-2rem)] max-w-sm flex-col gap-3'
      >
        {toasts.map((toast) => {
          const Icon =
            toast.type === "success"
              ? CheckCircle2
              : toast.type === "error"
                ? AlertTriangle
                : Info

          const iconColor =
            toast.type === "success"
              ? "text-teal-700"
              : toast.type === "error"
                ? "text-red-600"
                : "text-blue-600"

          return (
            <div
              key={toast.id}
              role={toast.type === "error" ? "alert" : "status"}
              className='pointer-events-auto flex items-start gap-3 rounded-xl border border-border bg-paper p-4 shadow-lg'
            >
              <Icon
                size={20}
                className={`mt-0.5 shrink-0 ${iconColor}`}
                aria-hidden='true'
              />

              <p className='flex-1 text-sm leading-5 text-ink'>
                {toast.message}
              </p>

              <button
                type='button'
                aria-label='Dismiss notification'
                onClick={() =>
                  setToasts((current) =>
                    current.filter((item) => item.id !== toast.id),
                  )
                }
                className='rounded-md p-1 text-muted hover:bg-paper focus-visible:outline-2 focus-visible:outline-teal-700'
              >
                <X size={16} aria-hidden='true' />
              </button>
            </div>
          )
        })}
      </div>

      {confirmation && (
        <div
          className='fixed inset-0 z-110 flex items-center justify-center bg-black/40 p-4'
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeConfirmation(false)
            }
          }}
        >
          <section
            role='alertdialog'
            aria-modal='true'
            aria-labelledby='confirmation-title'
            aria-describedby='confirmation-message'
            className='w-full max-w-md rounded-2xl border border-border bg-white p-6 shadow-2xl'
          >
            <div className='flex items-start gap-4'>
              <div
                className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${
                  confirmation.destructive
                    ? "bg-red-50 text-red-600"
                    : "bg-teal-50 text-teal-700"
                }`}
              >
                <AlertTriangle size={22} aria-hidden='true' />
              </div>

              <div className='min-w-0 flex-1'>
                <h2
                  id='confirmation-title'
                  className='text-lg font-semibold tracking-tight'
                >
                  {confirmation.title}
                </h2>

                <p
                  id='confirmation-message'
                  className='mt-2 text-sm leading-6 text-muted'
                >
                  {confirmation.message}
                </p>
              </div>

              <button
                type='button'
                aria-label='Cancel confirmation'
                onClick={() => closeConfirmation(false)}
                className='rounded-md p-2 text-muted hover:bg-paper focus-visible:outline-2 focus-visible:outline-teal-700'
              >
                <X size={18} aria-hidden='true' />
              </button>
            </div>

            <div className='mt-7 flex justify-end gap-3'>
              <button
                ref={cancelButtonRef}
                type='button'
                onClick={() => closeConfirmation(false)}
                className='rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-paper focus-visible:outline-2 focus-visible:outline-teal-700'
              >
                {confirmation.cancelLabel ?? "Cancel"}
              </button>

              <button
                ref={confirmButtonRef}
                type='button'
                onClick={() => closeConfirmation(true)}
                className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  confirmation.destructive
                    ? "bg-red-600 hover:bg-red-700 focus-visible:outline-red-700"
                    : "bg-teal-700 hover:bg-teal-800 focus-visible:outline-teal-700"
                }`}
              >
                {confirmation.confirmLabel ?? "Continue"}
              </button>
            </div>
          </section>
        </div>
      )}
    </AlertContext.Provider>
  )
}
