'use client';

export default function CalendarLoading() {
  return (
    <div className="container" style={{ paddingTop: '12vh' }}>
      <div className="space-y-12">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ 
            height: '3.5rem', width: '350px', background: '#f1f5f9', 
            borderRadius: '12px', margin: '0 auto 1rem',
            animation: 'pulse 2.5s infinite'
          }} />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '2rem' 
        }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ 
              height: '180px', background: 'white', borderRadius: '24px',
              border: '1px solid #f1f5f9', padding: '1.5rem',
              animation: 'pulse 2.5s infinite',
              animationDelay: `${i * 0.1}s`
            }}>
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                <div style={{ width: '50px', height: '50px', borderRadius: '12px', background: '#f1f5f9', flexShrink: 0 }} />
                <div style={{ flex: 1, paddingTop: '0.25rem' }}>
                  <div style={{ height: '1.2rem', width: '80%', background: '#f1f5f9', borderRadius: '4px', marginBottom: '0.5rem' }} />
                  <div style={{ height: '0.8rem', width: '40%', background: '#f8fafc', borderRadius: '4px' }} />
                </div>
              </div>
              <div className="space-y-3">
                <div style={{ height: '12px', width: '100%', background: '#f8fafc', borderRadius: '4px' }} />
                <div style={{ height: '12px', width: '90%', background: '#f8fafc', borderRadius: '4px' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .6; }
        }
      `}</style>
    </div>
  );
}
