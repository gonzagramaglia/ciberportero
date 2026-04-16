'use client';

interface Props {
  active: 'es' | 'en' | 'pt';
  onChange: (lang: 'es' | 'en' | 'pt') => void;
}

export default function LanguageTabs({ active, onChange }: Props) {
  const languages = [
    { id: 'es', label: 'Español', flag: '🇦🇷' },
    { id: 'en', label: 'English', flag: '🇺🇸' },
    { id: 'pt', label: 'Português', flag: '🇧🇷' },
  ];

  return (
    <div style={{ display: 'inline-flex', background: '#f1f5f9', padding: '0.4rem', borderRadius: '16px', gap: '0.4rem' }}>
      {languages.map((lang) => (
        <button
          key={lang.id}
          type="button"
          onClick={() => onChange(lang.id as any)}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.85rem',
            fontWeight: 800,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s',
            background: active === lang.id ? 'white' : 'transparent',
            color: active === lang.id ? 'var(--accent)' : '#64748b',
            boxShadow: active === lang.id ? '0 2px 8px rgba(0,0,0,0.05)' : 'none',
          }}
        >
          <span>{lang.flag}</span>
          {lang.label}
        </button>
      ))}
    </div>
  );
}
