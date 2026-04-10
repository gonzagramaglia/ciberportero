'use client';

export default function PostLoading() {
  return (
    <div className="container" style={{ paddingTop: '12vh' }}>
      <div className="space-y-12" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ marginBottom: '4rem' }}>
          <div style={{ 
            height: '3.5rem', width: '100%', background: '#f1f5f9', 
            borderRadius: '12px', marginBottom: '1.5rem',
            animation: 'pulse 2.5s infinite'
          }} />
          <div style={{ 
            height: '1.2rem', width: '200px', background: '#f8fafc', 
            borderRadius: '8px',
            animation: 'pulse 2.5s infinite'
          }} />
        </div>

        <div style={{ display: 'grid', gap: '1.5rem' }}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} style={{ 
              height: '18px', 
              width: i % 3 === 0 ? '70%' : i % 2 === 0 ? '90%' : '100%', 
              background: '#f8fafc', 
              borderRadius: '4px',
              animation: 'pulse 2.5s infinite',
              animationDelay: `${i * 0.1}s`
            }} />
          ))}
        </div>

        <div style={{ 
          marginTop: '4rem', padding: '2.5rem', background: 'white', 
          borderRadius: '24px', border: '1px solid #f1f5f9',
          animation: 'pulse 2.5s infinite',
          animationDelay: '0.5s'
        }}>
          <div style={{ height: '24px', width: '150px', background: '#f1f5f9', borderRadius: '6px', marginBottom: '1.5rem' }} />
          <div style={{ height: '40px', width: '100%', background: '#f8fafc', borderRadius: '12px' }} />
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
