'use client';

import { toggleNotification } from "@/lib/actions";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { useState } from "react";

export function NotificationToggle({ id, initialActive }: { id: string, initialActive: boolean }) {
  const [active, setActive] = useState(initialActive);
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await toggleNotification(id, !active);
      setActive(!active);
    } catch (error) {
      alert('Error al cambiar estado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handleToggle} 
      disabled={loading}
      style={{ background: 'none', border: 'none', cursor: loading ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', opacity: loading ? 0.5 : 1 }}
    >
      {active ? <ToggleRight size={32} style={{ color: '#22c55e' }} /> : <ToggleLeft size={32} style={{ color: '#94a3b8' }} />}
    </button>
  );
}
