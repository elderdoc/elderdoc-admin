'use client'

import { useState, useTransition } from 'react'
import { loginAction } from './actions'
import { Leaf, Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    startTransition(async () => {
      const result = await loginAction(email, password)
      if (result.error) setError(result.error)
    })
  }

  const inputCls = 'w-full rounded-[10px] border border-border bg-card px-3.5 py-2.5 text-[13.5px] placeholder:text-muted-foreground/50 focus:border-[var(--forest)] focus:outline-none focus:ring-2 focus:ring-[var(--forest-soft)] transition-shadow'
  const labelCls = 'block text-[12px] font-semibold text-muted-foreground mb-1.5'

  return (
    <div className="min-h-screen bg-[var(--cream)] flex items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        <div className="flex items-center gap-2.5 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
            <Leaf className="h-4.5 w-4.5 text-white" />
          </div>
          <div>
            <p className="text-[15px] font-semibold leading-none">Elderdoc</p>
            <p className="text-[11.5px] text-muted-foreground mt-0.5">Admin Console</p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-elevated)]">
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] mb-1">Sign in</h1>
          <p className="text-[13px] text-muted-foreground mb-6">Restricted to admin accounts.</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                placeholder="admin@elderdoc.com"
              />
            </div>
            <div>
              <label className={labelCls}>Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-10`}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-[12.5px] text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={isPending}
              className="w-full h-10 rounded-full bg-primary text-primary-foreground text-[13.5px] font-semibold disabled:opacity-50 hover:bg-[var(--forest-deep)] transition-colors mt-2"
            >
              {isPending ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
