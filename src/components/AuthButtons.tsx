"use client"

import { signIn, signOut } from "next-auth/react"

export function SignInButton() {
  return (
    <button
      onClick={() => signIn("google")}
      className="auth-button sign-in"
    >
      Entrar con Google
    </button>
  )
}

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut()}
      className="auth-button sign-out"
    >
      Salir
    </button>
  )
}
