"use client"

import { useSession } from "next-auth/react"
import { useLanguage } from "@/context/LanguageContext"

export default function SyncedBadge() {
  const { data: session, status } = useSession()
  const { lang } = useLanguage()

  if (status !== 'authenticated' || !session?.user) return null

  const label = lang === 'es' ? 'Sincronizado' : lang === 'pt' ? 'Sincronizado' : 'Synced'

  return (
    <div 
      className="synced-badge fade-in"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.4rem',
        background: 'rgba(16, 185, 129, 0.08)',
        color: '#10b981',
        padding: '0.4rem 0.8rem',
        borderRadius: '100px',
        fontSize: '0.85rem',
        fontWeight: '700',
        border: '1px solid rgba(16, 185, 129, 0.2)',
        marginLeft: '1rem',
        cursor: 'default',
        userSelect: 'none',
        verticalAlign: 'middle'
      }}
    >
      <div style={{
        width: '6px',
        height: '6px',
        borderRadius: '50%',
        background: '#10b981',
        boxShadow: '0 0 6px rgba(16, 185, 129, 0.5)'
      }} />
      {label}
    </div>
  )
}
