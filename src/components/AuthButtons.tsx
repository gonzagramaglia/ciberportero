"use client"

import { useLanguage } from "../context/LanguageContext"
import { translations } from "../lib/translations"
import { LogIn, LogOut, User as UserIcon } from "lucide-react"
import { signIn, signOut } from "next-auth/react"

export function SignInButton() {
  const { lang } = useLanguage()

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
        <button
          onClick={() => { const returnTo = window.location.href; signIn('google', { callbackUrl: returnTo }) }}
          className="google-sign-in"
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.8rem',
            background: '#fff',
            color: '#3c4043',
            padding: '0.6rem 1.4rem',
            borderRadius: '100px',
            border: '1px solid #dadce0',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '0.95rem',
            transition: 'all 0.2s',
            boxShadow: '0 1px 2px rgba(60,64,67,0.1)'
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18">
            <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z" fill="#4285f4"/>
            <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34a853"/>
            <path d="M3.964 10.712c-.18-.54-.282-1.117-.282-1.712s.102-1.173.282-1.712V4.956H.957a8.996 8.996 0 0 0 0 8.088l3.007-2.332z" fill="#fbbc05"/>
            <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.956l3.007 2.332C4.672 5.164 6.656 3.58 9 3.58z" fill="#ea4335"/>
          </svg>
          <span className="mobile-hide">
            {(translations[lang] as any).auth.signIn}
          </span>
          <span className="mobile-only">
            {(translations[lang] as any).auth.signInConcise}
          </span>
        </button>

        <style jsx>{`
          .google-sign-in:hover {
            background: #f8f9fa !important;
            box-shadow: 0 1px 3px rgba(60,64,67,0.3) !important;
          }
        `}</style>
    </div>
  )
}

export function SignOutButton() {
  const { lang } = useLanguage()

  const handleLogout = async () => {
    const returnTo = window.location.href
    localStorage.removeItem("ciberportero_guest")
    await signOut({ redirect: false })
    window.location.href = returnTo
  }

  return (
    <button
      onClick={handleLogout}
      className="sign-out-btn"
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.7rem',
        background: '#fff',
        color: '#3c4043',
        padding: '0.6rem 1.4rem',
        borderRadius: '100px',
        border: '1px solid #dadce0',
        fontWeight: '600',
        fontSize: '0.95rem',
        cursor: 'pointer',
        transition: 'all 0.2s',
        boxShadow: '0 1px 2px rgba(60,64,67,0.1)'
      }}
    >
      <LogIn size={18} strokeWidth={2.5} style={{ transform: 'rotate(180deg)' }} />
      <span>{(translations[lang] as any).auth.signOut}</span>
      
      <style jsx>{`
        .sign-out-btn:hover {
          background: #f8f9fa !important;
          box-shadow: 0 1px 3px rgba(60,64,67,0.3) !important;
        }
      `}</style>
    </button>
  )
}
