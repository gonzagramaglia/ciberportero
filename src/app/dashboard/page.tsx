import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import Link from 'next/link';
import { SignOutButton } from "@/components/AuthButtons"
import { ExamProgress } from "@prisma/client"
import { ProgressList } from "./components/ProgressList"

export default async function DashboardPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/api/auth/signin")
  }

  const progress: ExamProgress[] = await db.examProgress.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: 'desc' }
  })

  const stats = {
    autoevaluaciones: progress.filter((p: ExamProgress) => p.type === 'autoevaluacion' && p.completed).length,
    parciales: progress.filter((p: ExamProgress) => p.type === 'parcial' && p.completed).length,
  }

  return (
    <div className="container fade-in">
      <header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Link href="/" className="back-link">← Back to Blog</Link>
          <SignOutButton />
        </div>
        <h1 style={{ marginTop: '1.5rem' }}>Student Portal</h1>
        <p style={{ color: 'var(--muted)', fontSize: '1.2rem' }}>Hello, {session.user.name}</p>
      </header>

      <main>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '1fr 1fr', 
          gap: '1.5rem', 
          marginBottom: '3rem',
          marginTop: '2rem'
        }}>
          <div style={{ 
            padding: '2rem', 
            borderRadius: '16px', 
            background: 'rgba(0, 112, 243, 0.05)', 
            border: '1px solid var(--accent)',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', display: 'block' }}>{stats.autoevaluaciones}</span>
            <span style={{ fontSize: '0.8rem', color: "var(--muted)", textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Self-Assessments</span>
          </div>
          <div style={{ 
            padding: '2rem', 
            borderRadius: '16px', 
            background: 'rgba(16, 185, 129, 0.05)', 
            border: '1px solid var(--success)',
            textAlign: 'center'
          }}>
            <span style={{ fontSize: '2.5rem', fontWeight: '800', display: 'block' }}>{stats.parciales}</span>
            <span style={{ fontSize: '0.8rem', color: "var(--muted)", textTransform: 'uppercase', fontWeight: '700', letterSpacing: '0.05em' }}>Midterm Exams</span>
          </div>
        </div>

        <section>
          <ProgressList initialProgress={progress} />
        </section>
      </main>
      
      <footer style={{ marginTop: '4rem', opacity: 0.6, fontSize: '0.8rem' }}>
        <p>Cyberdefense Student Portal – Secure Academic Data Management</p>
      </footer>
    </div>
  )
}
