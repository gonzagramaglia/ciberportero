'use client';

export default function DashboardLoading() {
  return (
    <div className="container" style={{ paddingTop: '12vh' }}>
      <div className="space-y-12">
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ 
            height: '3.5rem', width: '300px', background: '#f1f5f9', 
            borderRadius: '12px', marginBottom: '1rem',
            animation: 'pulse 2.5s infinite'
          }} />
          <div style={{ 
            height: '1.2rem', width: '450px', background: '#f8fafc', 
            borderRadius: '8px',
            animation: 'pulse 2.5s infinite'
          }} />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '2.5rem' 
        }}>
          {[1, 2, 3].map((i) => (
            <div key={i} style={{ 
              height: '300px', background: 'white', borderRadius: '30px',
              border: '1px solid #f1f5f9', padding: '2.5rem',
              animation: 'pulse 2.5s infinite',
              animationDelay: `${i * 0.15}s`,
              boxShadow: '0 4px 20px rgba(0,0,0,0.01)'
            }}>
              <div style={{ height: '24px', width: '150px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '2rem' }} />
              <div style={{ display: 'grid', gap: '1.2rem' }}>
                <div style={{ height: '45px', width: '100%', background: '#f8fafc', borderRadius: '12px' }} />
                <div style={{ height: '45px', width: '100%', background: '#f8fafc', borderRadius: '12px' }} />
                <div style={{ height: '45px', width: '100%', background: '#f8fafc', borderRadius: '12px' }} />
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
