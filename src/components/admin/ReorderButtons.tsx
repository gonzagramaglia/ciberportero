'use client';

import { useTransition } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { reorderLink } from '@/lib/actions';

interface Props {
  id: string;
}

export function ReorderButtons({ id }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleReorder = (direction: 'up' | 'down') => {
    startTransition(async () => {
      await reorderLink(id, direction);
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', opacity: isPending ? 0.5 : 1 }}>
      <button 
        onClick={() => handleReorder('up')}
        disabled={isPending}
        style={{ 
          background: 'none', 
          border: 'none', 
          padding: '2px', 
          cursor: isPending ? 'wait' : 'pointer',
          color: '#94a3b8'
        }}
        className="hover:text-blue-500"
      >
        <ChevronUp size={16} />
      </button>
      <button 
        onClick={() => handleReorder('down')}
        disabled={isPending}
        style={{ 
          background: 'none', 
          border: 'none', 
          padding: '2px', 
          cursor: isPending ? 'wait' : 'pointer',
          color: '#94a3b8'
        }}
        className="hover:text-blue-500"
      >
        <ChevronDown size={16} />
      </button>
    </div>
  );
}
