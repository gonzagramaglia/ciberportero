"use client"

import { useLanguage } from "../context/LanguageContext"
import { translations } from "../lib/translations"
import { LogIn, LogOut } from "lucide-react"

export function SignInButton() {
  const { lang } = useLanguage()
  const t = translations[lang]

  const handleGuestLogin = () => {
    localStorage.setItem("ciberportero_guest", "true")
    window.location.href = "/dashboard"
  }

  return (
    <button
      onClick={handleGuestLogin}
      className="auth-button sign-in"
      style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}
    >
      <LogIn size={18} />
      <span>{t.studentPortal?.loginCta}</span>
    </button>
  )
}

export function SignOutButton() {
  const { lang } = useLanguage()

  const handleLogout = () => {
    localStorage.removeItem("ciberportero_guest")
    window.location.href = "/"
  }

  return (
    <button
      onClick={handleLogout}
      className="auth-button sign-out"
      style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
    >
      <LogOut size={16} />
      {lang === 'es' ? 'Cerrar Sesión' : lang === 'pt' ? 'Sair' : 'Sign Out'}
    </button>
  )
}
