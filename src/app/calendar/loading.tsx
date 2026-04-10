'use client';

export default function CalendarLoading() {
  return (
    <div className="container" style={{ paddingTop: '12vh' }}>
      <div className="space-y-12">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ 
            height: '4rem', width: '350px', background: '#f1f5f9', 
            borderRadius: '12px', margin: '0 auto 1.5rem',
            animation: 'pulse 2s infinite'
          }} />
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }} className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{ 
              background: 'white', borderRadius: '20px', padding: '1.5rem',
              border: '1px solid #f1f5f9', display: 'flex', gap: '2rem',
              animation: 'pulse 2s infinite',
              animationDelay: `${i * 0.1}s`
            }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '16px', background: '#f1f5f9', flexShrink: 0 }} />
              <div style={{ flex: 1, paddingTop: '0.5rem' }}>
                <div style={{ height: '1.5rem', width: '40%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '1rem' }} />
                <div style={{ height: '1rem', width: '80%', background: '#f8fafc', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: .5; transform: scale(0.995); }
        }
      `}</style>
    </div>
  );
}
