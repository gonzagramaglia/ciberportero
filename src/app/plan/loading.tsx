'use client';

export default function PlanLoading() {
  return (
    <div className="container" style={{ paddingTop: '12vh' }}>
      <div className="space-y-12">
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ 
            height: '3.5rem', width: '250px', background: '#f1f5f9', 
            borderRadius: '12px', marginBottom: '1rem',
            animation: 'pulse 2.5s infinite'
          }} />
          <div style={{ 
            height: '1.2rem', width: '400px', background: '#f8fafc', 
            borderRadius: '8px',
            animation: 'pulse 2.5s infinite'
          }} />
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
          gap: '2rem' 
        }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ 
              height: '250px', background: 'white', borderRadius: '24px',
              border: '1px solid #f1f5f9', padding: '2rem',
              animation: 'pulse 2.5s infinite',
              animationDelay: `${i * 0.15}s`
            }}>
              <div style={{ height: '32px', width: '120px', background: '#f1f5f9', borderRadius: '8px', marginBottom: '1.5rem' }} />
              <div className="space-y-4">
                <div style={{ height: '14px', width: '90%', background: '#f8fafc', borderRadius: '4px' }} />
                <div style={{ height: '14px', width: '85%', background: '#f8fafc', borderRadius: '4px' }} />
                <div style={{ height: '14px', width: '70%', background: '#f8fafc', borderRadius: '4px' }} />
              </div>
              <div style={{ marginTop: '2.5rem', height: '40px', width: '100%', background: '#f1f5f9', borderRadius: '12px' }} />
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
