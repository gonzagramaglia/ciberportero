'use client';

export default function PostLoading() {
  return (
    <div className="container" style={{ paddingTop: '12vh', maxWidth: '800px' }}>
      <div className="space-y-8">
        {/* Back button skeleton */}
        <div style={{ 
          height: '24px', width: '120px', background: '#f1f5f9', 
          borderRadius: '6px', animation: 'pulse 2.5s infinite' 
        }} />

        <div className="admin-card" style={{ padding: '3rem', border: '1px solid #f1f5f9' }}>
          {/* Title skeleton */}
          <div style={{ 
            height: '3.5rem', width: '90%', background: '#f1f5f9', 
            borderRadius: '12px', marginBottom: '1.5rem',
            animation: 'pulse 2.5s infinite'
          }} />

          {/* Metadata skeleton */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem' }}>
            <div style={{ height: '1.2rem', width: '100px', background: '#f8fafc', borderRadius: '4px' }} />
            <div style={{ height: '1.2rem', width: '150px', background: '#f8fafc', borderRadius: '4px' }} />
          </div>

          {/* Content paragraphs skeleton */}
          <div className="space-y-6">
            <div className="space-y-3">
              <div style={{ height: '16px', width: '100%', background: '#f8fafc', borderRadius: '4px' }} />
              <div style={{ height: '16px', width: '100%', background: '#f8fafc', borderRadius: '4px' }} />
              <div style={{ height: '16px', width: '95%', background: '#f8fafc', borderRadius: '4px' }} />
              <div style={{ height: '16px', width: '98%', background: '#f8fafc', borderRadius: '4px' }} />
              <div style={{ height: '16px', width: '40%', background: '#f8fafc', borderRadius: '4px' }} />
            </div>

            <div style={{ height: '300px', width: '100%', background: '#f1f5f9', borderRadius: '20px', margin: '2rem 0' }} />

            <div className="space-y-3">
              <div style={{ height: '16px', width: '100%', background: '#f8fafc', borderRadius: '4px' }} />
              <div style={{ height: '16px', width: '100%', background: '#f8fafc', borderRadius: '4px' }} />
              <div style={{ height: '16px', width: '60%', background: '#f8fafc', borderRadius: '4px' }} />
            </div>
          </div>
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
