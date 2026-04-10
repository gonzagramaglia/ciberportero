'use client';

export default function LinksLoading() {
  return (
    <div className="container" style={{ paddingTop: '12vh' }}>
      <div className="space-y-12">
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <div style={{ 
            height: '4rem', width: '300px', background: '#f1f5f9', 
            borderRadius: '12px', margin: '0 auto 1.5rem',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }} />
          <div style={{ 
            height: '1.5rem', width: '450px', background: '#f8fafc', 
            borderRadius: '8px', margin: '0 auto',
            animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
          }} />
        </div>

        <div className="links-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} style={{ 
              height: '80px', background: 'white', borderRadius: '16px',
              border: '1px solid #f1f5f9', display: 'flex', alignItems: 'center',
              padding: '0 1.5rem', gap: '1rem',
              animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              animationDelay: `${i * 0.1}s`
            }}>
              <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#f1f5f9' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: '1.2rem', width: '60%', background: '#f8fafc', borderRadius: '4px' }} />
              </div>
              <div style={{ width: '20px', height: '20px', borderRadius: '4px', background: '#f1f5f9' }} />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
      `}</style>
    </div>
  );
}
