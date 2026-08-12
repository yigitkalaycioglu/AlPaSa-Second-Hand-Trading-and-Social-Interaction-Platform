import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import { AlertCircle } from 'lucide-react'
import { cn } from '@/lib/cn'

const CONTROL_BASE =
  'w-full rounded-xl border bg-white px-4 text-sm text-slate-800 transition-colors ' +
  'placeholder:text-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none ' +
  'disabled:cursor-not-allowed disabled:bg-slate-100 ' +
  'dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:disabled:bg-slate-800'

function borderClass(hasError: boolean): string {
  return hasError
    ? 'border-red-400 dark:border-red-500/70'
    : 'border-slate-300 dark:border-slate-700'
}

interface LabelWrapperProps {
  id: string
  label?: string
  error?: string
  hint?: string
  required?: boolean
  children: ReactNode
}

function LabelWrapper({ id, label, error, hint, required, children }: LabelWrapperProps) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {error}
        </p>
      ) : (
        hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>
      )}
    </div>
  )
}

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
  icon?: ReactNode
}

export function Input({ label, error, hint, icon, className, id, ...props }: InputProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <LabelWrapper id={fieldId} label={label} error={error} hint={hint} required={props.required}>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-slate-400">
            {icon}
          </span>
        )}
        <input
          id={fieldId}
          aria-invalid={Boolean(error)}
          className={cn(CONTROL_BASE, borderClass(Boolean(error)), 'h-11', icon && 'pl-10', className)}
          {...props}
        />
      </div>
    </LabelWrapper>
  )
}

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  hint?: string
}

export function Textarea({ label, error, hint, className, id, ...props }: TextareaProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <LabelWrapper id={fieldId} label={label} error={error} hint={hint} required={props.required}>
      <textarea
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={cn(CONTROL_BASE, borderClass(Boolean(error)), 'resize-y py-3', className)}
        {...props}
      />
    </LabelWrapper>
  )
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  hint?: string
  children: ReactNode
}

export function Select({ label, error, hint, className, id, children, ...props }: SelectProps) {
  const generatedId = useId()
  const fieldId = id ?? generatedId

  return (
    <LabelWrapper id={fieldId} label={label} error={error} hint={hint} required={props.required}>
      <select
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={cn(CONTROL_BASE, borderClass(Boolean(error)), 'h-11 cursor-pointer pr-9', className)}
        {...props}
      >
        {children}
      </select>
    </LabelWrapper>
  )
}
