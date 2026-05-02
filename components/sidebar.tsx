'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import {
  LayoutDashboard, Users, UserCheck, User, Baby,
  ClipboardList, Briefcase, Clock, CreditCard, AlertCircle,
  Calendar, Activity, Leaf, LogOut,
} from 'lucide-react'

const NAV = [
  { label: 'Overview', href: '/', icon: LayoutDashboard, group: null },
  { label: 'Users', href: '/users', icon: Users, group: 'People' },
  { label: 'Caregivers', href: '/caregivers', icon: UserCheck, group: 'People' },
  { label: 'Clients', href: '/clients', icon: User, group: 'People' },
  { label: 'Care Recipients', href: '/recipients', icon: Baby, group: 'People' },
  { label: 'Care Requests', href: '/care-requests', icon: ClipboardList, group: 'Operations' },
  { label: 'Jobs', href: '/jobs', icon: Briefcase, group: 'Operations' },
  { label: 'Shifts', href: '/shifts', icon: Clock, group: 'Operations' },
  { label: 'Payments', href: '/payments', icon: CreditCard, group: 'Finance' },
  { label: 'Disputes', href: '/disputes', icon: AlertCircle, group: 'Finance' },
  { label: 'Calendar', href: '/calendar', icon: Calendar, group: 'Platform' },
  { label: 'Activity', href: '/activity', icon: Activity, group: 'Platform' },
] as const

interface Props {
  adminName: string
  adminEmail: string
}

export function Sidebar({ adminName, adminEmail }: Props) {
  const pathname = usePathname()
  const groups = ['People', 'Operations', 'Finance', 'Platform'] as const

  function isActive(href: string) {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  return (
    <div className="fixed left-0 top-0 h-full w-[240px] border-r border-border bg-card flex flex-col overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-border">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shrink-0">
          <Leaf className="h-4 w-4 text-white" />
        </div>
        <div>
          <p className="text-[13.5px] font-semibold leading-none">Elderdoc</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Admin</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-5">
        {/* Overview (no group) */}
        <div>
          {NAV.filter(n => n.group === null).map(item => (
            <NavItem key={item.href} item={item} active={isActive(item.href)} />
          ))}
        </div>
        {groups.map(group => (
          <div key={group}>
            <p className="px-2 mb-1.5 text-[10.5px] font-semibold text-muted-foreground/60 uppercase tracking-wider">
              {group}
            </p>
            {NAV.filter(n => n.group === group).map(item => (
              <NavItem key={item.href} item={item} active={isActive(item.href)} />
            ))}
          </div>
        ))}
      </nav>

      {/* Bottom user chip */}
      <div className="border-t border-border px-4 py-4">
        <div className="mb-3">
          <p className="text-[13px] font-semibold truncate">{adminName}</p>
          <p className="text-[11.5px] text-muted-foreground truncate">{adminEmail}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="flex items-center gap-2 text-[12.5px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </div>
  )
}

type NavItemType = typeof NAV[number]

function NavItem({ item, active }: { item: NavItemType; active: boolean }) {
  return (
    <Link
      href={item.href}
      className={[
        'flex items-center gap-2.5 rounded-[8px] px-2.5 py-2 text-[13px] font-medium transition-all mb-0.5',
        active
          ? 'border-l-2 border-l-[var(--forest)] bg-[var(--forest-soft)] text-[var(--forest-deep)] rounded-l-none'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
      ].join(' ')}
    >
      <item.icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  )
}
