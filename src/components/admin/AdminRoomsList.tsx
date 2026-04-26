'use client';

import { useState } from 'react';
import { Trash2, Users, Layers, ExternalLink, Calendar } from 'lucide-react';
import { deleteRoom } from '@/lib/salasActions';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function AdminRoomsList({ initialRooms }: { initialRooms: any[] }) {
    const [rooms, setRooms] = useState(initialRooms);

    const handleDelete = async (roomId: string, name: string) => {
        if (!confirm(`¿Estás seguro de que deseas eliminar la sala "${name}"? Esta acción no se puede deshacer.`)) return;

        const res = await deleteRoom(roomId);
        if (res.success) {
            toast.success("Sala eliminada correctamente");
            setRooms(prev => prev.filter(r => r.id !== roomId));
        } else {
            toast.error(res.error || "Error al eliminar");
        }
    };

    return (
        <div className="admin-card table-container">
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Nombre / ID</th>
                        <th>Creador</th>
                        <th>Estadísticas</th>
                        <th style={{ textAlign: 'right' }}>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {rooms.map(room => (
                        <tr key={room.id}>
                            <td>
                                <div style={{ display: 'flex', flexDirection: 'column' }}>
                                    <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{room.name}</span>
                                    <code style={{ fontSize: '10px', opacity: 0.6 }}>{room.id}</code>
                                </div>
                            </td>
                            <td>
                                <span style={{ fontSize: '0.85rem' }}>{room.creator?.name || 'Desconocido'}</span>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                                    <span className="admin-flex-center" style={{ gap: '0.3rem' }}>
                                        <Users size={14} /> {room._count.members}
                                    </span>
                                    <span className="admin-flex-center" style={{ gap: '0.3rem' }}>
                                        <Layers size={14} /> {room._count.categories}
                                    </span>
                                </div>
                            </td>
                            <td>
                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    <Link 
                                        href={`/salas/${room.id}`} 
                                        target="_blank"
                                        className="admin-action-btn"
                                        style={{ color: 'var(--accent)' }}
                                    >
                                        <ExternalLink size={16} />
                                    </Link>
                                    <button 
                                        onClick={() => handleDelete(room.id, room.name)}
                                        className="admin-action-btn"
                                        style={{ color: '#ef4444' }}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                    {rooms.length === 0 && (
                        <tr>
                            <td colSpan={4} style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
                                No se encontraron salas.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
