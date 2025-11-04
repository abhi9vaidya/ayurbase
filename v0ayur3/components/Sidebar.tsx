"use client"
import React from 'react'
import Link from 'next/link'

type LinkItem = { label: string; href: string; icon?: string }

export default function Sidebar({ links }: { links: LinkItem[] }) {
  return (
    <aside className="w-64 bg-white border-r p-4 hidden md:block">
      <nav className="space-y-2">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="flex items-center gap-3 p-2 rounded hover:bg-slate-50">
            <span className="text-lg">{l.icon || '•'}</span>
            <span className="text-sm font-medium">{l.label}</span>
          </Link>
        ))}
      </nav>
    </aside>
  )
}
