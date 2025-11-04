"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

interface SidebarLink {
  label: string
  href: string
  icon: string
}

interface SidebarProps {
  links: SidebarLink[]
}

export default function Sidebar({ links }: SidebarProps) {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <aside
      className={`${isCollapsed ? "w-20" : "w-64"} bg-slate-50 border-r border-slate-200 transition-all duration-300 min-h-screen flex flex-col`}
    >
      <div className="p-4 border-b border-slate-200">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-2 hover:bg-slate-200 rounded-lg transition-all duration-300 w-full flex items-center justify-center text-slate-600"
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      <nav className="space-y-1 px-3 py-4 flex-1">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`
              flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all duration-300
              ${
                pathname === link.href
                  ? "bg-blue-100 text-blue-700 font-medium shadow-sm"
                  : "text-slate-700 hover:bg-slate-200 hover:shadow-sm"
              }
            `}
          >
            <span className="text-lg">{link.icon}</span>
            {!isCollapsed && <span className="text-sm">{link.label}</span>}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
