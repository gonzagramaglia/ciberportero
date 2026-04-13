'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

interface AdminNavLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
}

export default function AdminNavLink({ href, icon, label }: AdminNavLinkProps) {
  const pathname = usePathname();
  
  // Dashboard is active only on /admin
  // Other links are active if exact or nested
  const isActive = href === "/admin" 
    ? pathname === "/admin"
    : pathname === href || pathname.startsWith(href + "/");

  return (
    <div className="nav-item">
      <Link 
        href={href} 
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '0.75rem 1rem', 
          textDecoration: 'none', 
          color: isActive ? '#0f172a' : '#64748b', 
          background: isActive ? '#f1f5f9' : 'transparent',
          borderRadius: '12px', 
          fontWeight: isActive ? 800 : 600,
          transition: 'all 0.2s ease',
          boxShadow: isActive ? 'inset 0 0 0 1px rgba(0,0,0,0.05)' : 'none'
        }}
      >
        <span style={{ 
          display: 'flex', 
          alignItems: 'center', 
          color: isActive ? 'var(--accent)' : 'inherit' 
        }}>
          {icon}
        </span>
        <span>{label}</span>
      </Link>
    </div>
  );
}
