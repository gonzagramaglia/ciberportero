'use client';

const GUEST_DATA_KEY = 'ciberportero_guest_data';

export interface GuestMessage {
    id: string;
    content: string;
    images: string[];
    user: { name: string, image: string | null };
    userId?: string;
    createdAt: string;
    replies: any[];
}

export interface GuestSubcategory {
    id: string;
    name: string;
    messages: GuestMessage[];
}

export interface GuestCategory {
    id: string;
    name: string;
    subcategories: GuestSubcategory[];
}

export interface GuestMember {
    id: string;
    user: { name: string, image: string | null };
    createdAt: string;
    role: 'admin' | 'member';
}

export interface GuestRoom {
    id: string;
    name: string;
    description?: string;
    secretCode: string;
    creatorId: string;
    categories: GuestCategory[];
    members: GuestMember[];
    generalMessages: GuestMessage[];
}

interface GuestData {
    version: number;
    rooms: GuestRoom[];
}

const DEFAULT_DATA: GuestData = {
    version: 26, // Incremented version to force update
    rooms: [
        {
            id: 'test-room',
            name: 'Grupo de Estudio Ciberdefensa 🛡️',
            description: 'Espacio colaborativo para estudiantes de Ciberdefensa. Compartimos material, resolvemos dudas de laboratorios y nos preparamos para los parciales juntos.',
            secretCode: 'CIBERDEFENSA2026',
            creatorId: 'm1',
            categories: [
                {
                    id: 'cat-info',
                    name: 'Info General',
                    subcategories: [
                        { 
                            id: 'sub-exams', 
                            name: 'Fechas de Exámenes', 
                            messages: [
                                {
                                    id: 'm-admin-exams',
                                    content: '¡Atención! Ya están las fechas confirmadas para el primer parcial de Ciberdefensa. Será el Lunes 15 de Mayo a las 18:00 hs. Estén atentos al aula virtual por si hay cambios.',
                                    images: [],
                                    user: { name: 'Admin del Grupo', image: null },
                                    userId: 'm1',
                                    createdAt: new Date(Date.now() - 172800000).toISOString(),
                                    replies: [
                                        {
                                            id: 'r-sofi-exams',
                                            content: '¡Gracias por avisar! ¿Saben si entra hasta la unidad 4 o incluyen la 5 también?',
                                            user: { name: 'Sofi R.', image: null },
                                            userId: 'm3',
                                            createdAt: new Date(Date.now() - 129600000).toISOString()
                                        }
                                    ]
                                }
                            ] 
                        },
                        { 
                            id: 'sub-links', 
                            name: 'Links Útiles', 
                            messages: [
                                {
                                    id: 'm-admin-links',
                                    content: 'Les dejo el link al repositorio oficial con los scripts de automatización que vamos a usar en la segunda parte de la materia.',
                                    images: [],
                                    user: { name: 'Admin del Grupo', image: null },
                                    userId: 'm1',
                                    createdAt: new Date(Date.now() - 259200000).toISOString(),
                                    replies: [
                                        {
                                            id: 'r-nico-links',
                                            content: '¡Buenísimo! Ya lo estuve chusmeando y los scripts de Python están muy bien comentados.',
                                            user: { name: 'Nico B.', image: null },
                                            userId: 'm2',
                                            createdAt: new Date(Date.now() - 216000000).toISOString()
                                        }
                                    ]
                                }
                            ] 
                        }
                    ]
                },
                {
                    id: 'cat-1',
                    name: 'Laboratorios Prácticos',
                    subcategories: [
                        {
                            id: 'sub-1',
                            name: 'Lab 1 - Análisis de Tráfico',
                            messages: [
                                {
                                    id: 'm-initial-1',
                                    content: '¿Alguien pudo filtrar los paquetes ICMP en Wireshark? No me queda claro cómo identificar el escaneo de puertos.',
                                    images: [],
                                    user: { name: 'Lucas G.', image: null },
                                    userId: 'guest-me',
                                    createdAt: new Date(Date.now() - 7200000).toISOString(),
                                    replies: [
                                        {
                                            id: 'r-initial-1',
                                            content: 'Fijate usando el filtro "icmp and ip.addr == [la_ip]". En el PDF de la clase 3 hay un ejemplo parecido.',
                                            user: { name: 'Nico B.', image: null },
                                            userId: 'm2',
                                            createdAt: new Date(Date.now() - 3600000).toISOString(),
                                        }
                                    ]
                                },
                                {
                                    id: 'm-sofi-1',
                                    content: 'Chicos, ¿vieron que subieron el Lab 2? Dice que tenemos que capturar tráfico HTTPS pero no entiendo bien cómo descifrarlo si no tenemos la llave privada.',
                                    images: [],
                                    user: { name: 'Sofi R.', image: null },
                                    userId: 'm3',
                                    createdAt: new Date(Date.now() - 14400000).toISOString(),
                                    replies: [
                                        {
                                            id: 'r-sofi-1',
                                            content: 'Sofi! Creo que el profe dijo que usáramos una variable de entorno en el navegador para que guarde las llaves de sesión en un archivo de texto, y después cargás ese archivo en Wireshark.',
                                            user: { name: 'Lucas G.', image: null },
                                            userId: 'guest-me',
                                            createdAt: new Date(Date.now() - 10800000).toISOString(),
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
            ],
            members: [
                { id: 'm1', user: { name: 'Admin del Grupo', image: null }, createdAt: new Date(Date.now() - 86400000).toISOString(), role: 'admin' },
                { id: 'guest-me', user: { name: 'Lucas G.', image: null }, createdAt: new Date().toISOString(), role: 'member' },
                { id: 'm2', user: { name: 'Nico B.', image: null }, createdAt: new Date().toISOString(), role: 'member' },
                { id: 'm3', user: { name: 'Sofi R.', image: null }, createdAt: new Date().toISOString(), role: 'member' }
            ],
            generalMessages: []
        }
    ]
};

function slugify(text: string) {
    return text.toString().toLowerCase().trim()
        .replace(/\s+/g, '-')
        .replace(/[^\w-]+/g, '')
        .replace(/--+/g, '-');
}

export const guestStore = {
    getData(): GuestData {
        if (typeof window === 'undefined') return DEFAULT_DATA;
        const saved = localStorage.getItem(GUEST_DATA_KEY);
        if (!saved) {
            localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(DEFAULT_DATA));
            return DEFAULT_DATA;
        }
        let parsed = JSON.parse(saved);
        
        // Version check to force sync with improved mock data
        if (parsed.version < DEFAULT_DATA.version) {
            const currentRooms = parsed.rooms.filter((r: any) => r.id !== 'test-room');
            parsed.rooms = [DEFAULT_DATA.rooms[0], ...currentRooms];
            parsed.version = DEFAULT_DATA.version;
            localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(parsed));
        }

        parsed.rooms.forEach((r: any) => {
            if (!r.generalMessages) r.generalMessages = [];
            if (!r.members) r.members = [];
            r.members.forEach((m: any) => {
                if (!m.role) m.role = (m.id === 'guest-me' || m.id === 'm1') ? 'admin' : 'member';
                // Migrate legacy Invitado name to Lucas G.
                if (m.id === 'guest-me' && m.user.name === 'Invitado') {
                    m.user.name = 'Lucas G.';
                }
            });
        });

        return parsed;
    },

    saveData(data: GuestData) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
    },

    getRooms() {
        return this.getData().rooms;
    },

    createRoom(name: string, code: string, slug: string) {
        const data = this.getData();
        if (data.rooms.some(r => r.id === slug)) {
            return { error: "Ya existe una sala con ese identificador (slug) en tu sesión local." };
        }
        const newRoom: GuestRoom = {
            id: slug,
            name,
            description: '',
            secretCode: code,
            creatorId: 'guest',
            categories: [
                {
                    id: 'cat-general',
                    name: 'General',
                    subcategories: [{ id: 'sub-chat', name: 'Chat', messages: [] }]
                }
            ],
            members: [{ id: 'guest-me', user: { name: 'Lucas G.', image: null }, createdAt: new Date().toISOString(), role: 'admin' }],
            generalMessages: []
        };
        data.rooms.push(newRoom);
        this.saveData(data);
        return newRoom;
    },

    getRoom(id: string) {
        return this.getData().rooms.find(r => r.id === id);
    },

    addMessage(containerId: string, content: string, images: string[], parentId?: string) {
        const data = this.getData();
        for (const room of data.rooms) {
            let container: any = null;
            if (containerId === 'general') {
                container = room;
            } else {
                for (const cat of room.categories) {
                    const sub = cat.subcategories.find(s => s.id === containerId);
                    if (sub) {
                        container = sub;
                        break;
                    }
                }
            }

            if (container) {
                if (parentId) {
                    const parent = container.messages?.find((m: any) => m.id === parentId);
                    if (parent) {
                        if (!parent.replies) parent.replies = [];
                        const newReply = {
                            id: `reply-${Date.now()}`,
                            content,
                            user: { name: 'Lucas G.', image: null },
                            userId: 'guest-me',
                            createdAt: new Date().toISOString()
                        };
                        parent.replies.push(newReply);
                        this.saveData(data);
                        return newReply;
                    }
                } else {
                    const newMessage: GuestMessage = {
                        id: `msg-${Date.now()}`,
                        content,
                        images,
                        user: { name: 'Lucas G.', image: null },
                        userId: 'guest-me',
                        createdAt: new Date().toISOString(),
                        replies: []
                    };
                    if (containerId === 'general') room.generalMessages.push(newMessage);
                    else container.messages.push(newMessage);
                    this.saveData(data);
                    return newMessage;
                }
            }
        }
        return null;
    },

    deleteMessage(containerId: string, msgId: string, isReply = false, parentId?: string) {
        const data = this.getData();
        for (const room of data.rooms) {
            let container: any = null;
            if (containerId === 'general') container = room;
            else {
                for (const cat of room.categories) {
                    const sub = cat.subcategories.find(s => s.id === containerId);
                    if (sub) { container = sub; break; }
                }
            }

            if (container) {
                const messages = containerId === 'general' ? room.generalMessages : container.messages;
                if (isReply && parentId) {
                    const parent = messages.find((m: any) => m.id === parentId);
                    if (parent) {
                        parent.replies = parent.replies.filter((r: any) => r.id !== msgId);
                        this.saveData(data);
                        return;
                    }
                } else {
                    if (containerId === 'general') room.generalMessages = room.generalMessages.filter((m: any) => m.id !== msgId);
                    else container.messages = container.messages.filter((m: any) => m.id !== msgId);
                    this.saveData(data);
                    return;
                }
            }
        }
    },

    createCategory(roomId: string, name: string) {
        const data = this.getData();
        const room = data.rooms.find(r => r.id === roomId);
        if (room) {
            const newCat: GuestCategory = {
                id: `cat-${slugify(name)}-${Date.now()}`,
                name,
                subcategories: []
            };
            room.categories.push(newCat);
            this.saveData(data);
            return newCat;
        }
        return null;
    },

    createSubcategory(catId: string, name: string) {
        const data = this.getData();
        for (const room of data.rooms) {
            const cat = room.categories.find(c => c.id === catId);
            if (cat) {
                let finalId = slugify(name);
                const allSubs = room.categories.flatMap(c => c.subcategories);
                if (allSubs.some(s => s.id === finalId)) {
                    throw new Error('DUPLICATE_NAME');
                }

                const newSub: GuestSubcategory = { id: finalId, name, messages: [] };
                cat.subcategories.push(newSub);
                this.saveData(data);
                return newSub;
            }
        }
        return null;
    },

    updateRoom(id: string, name: string, newSlug?: string, secretCode?: string, description?: string) {
        const data = this.getData();
        const room = data.rooms.find(r => r.id === id);
        if (room) {
            room.name = name;
            if (secretCode) room.secretCode = secretCode;
            if (description !== undefined) room.description = description;
            if (newSlug) {
                const slug = slugify(newSlug);
                if (slug !== room.id && !data.rooms.some(r => r.id === slug)) {
                    room.id = slug;
                }
            }
            this.saveData(data);
            return room;
        }
        return null;
    },

    deleteRoom(id: string) {
        const data = this.getData();
        data.rooms = data.rooms.filter(r => r.id !== id);
        this.saveData(data);
    },

    updateCategory(roomId: string, catId: string, name: string) {
        const data = this.getData();
        const room = data.rooms.find(r => r.id === roomId);
        const cat = room?.categories.find(c => c.id === catId);
        if (cat) { cat.name = name; this.saveData(data); }
    },

    deleteCategory(roomId: string, catId: string) {
        const data = this.getData();
        const room = data.rooms.find(r => r.id === roomId);
        if (room) { room.categories = room.categories.filter(c => c.id !== catId); this.saveData(data); }
    },

    updateSubcategory(roomId: string, subId: string, name: string) {
        const data = this.getData();
        const room = data.rooms.find(r => r.id === roomId);
        if (!room) return;

        let targetSub: GuestSubcategory | null = null;
        for (const cat of room.categories) {
            const sub = cat.subcategories.find(s => s.id === subId);
            if (sub) {
                targetSub = sub;
                break;
            }
        }

        if (targetSub) {
            const newId = slugify(name);
            const allOtherSubs = room.categories.flatMap(c => c.subcategories).filter(s => s.id !== subId);
            if (allOtherSubs.some(s => s.id === newId)) {
                throw new Error('DUPLICATE_NAME');
            }

            targetSub.name = name;
            targetSub.id = newId;
            this.saveData(data);
            return targetSub;
        }
    },

    deleteSubcategory(subId: string) {
        const data = this.getData();
        for (const room of data.rooms) {
            for (const cat of room.categories) {
                const initialLen = cat.subcategories.length;
                cat.subcategories = cat.subcategories.filter(s => s.id !== subId);
                if (cat.subcategories.length !== initialLen) { this.saveData(data); return; }
            }
        }
    },

    getSubcategory(subId: string): GuestSubcategory | null {
        const data = this.getData();
        for (const room of data.rooms) {
            for (const cat of room.categories) {
                const sub = cat.subcategories.find(s => s.id === subId);
                if (sub) return sub;
            }
        }
        return null;
    },

    getCategoryBySubId(subId: string): GuestCategory | null {
        const data = this.getData();
        for (const room of data.rooms) {
            for (const cat of room.categories) {
                if (cat.subcategories.some(s => s.id === subId)) return cat;
            }
        }
        return null;
    },

    reorderCategories(roomId: string, newCategories: GuestCategory[]) {
        const data = this.getData();
        const room = data.rooms.find(r => r.id === roomId);
        if (room) {
            room.categories = newCategories;
            this.saveData(data);
        }
    },

    moveSubcategory(sourceCatId: string, destCatId: string, subId: string, newIndex: number) {
        const data = this.getData();
        let subToMove: GuestSubcategory | null = null;
        for (const room of data.rooms) {
            const sourceCat = room.categories.find(c => c.id === sourceCatId);
            if (sourceCat) {
                const idx = sourceCat.subcategories.findIndex(s => s.id === subId);
                if (idx !== -1) {
                    [subToMove] = sourceCat.subcategories.splice(idx, 1);
                    break;
                }
            }
        }
        if (!subToMove) return;
        for (const room of data.rooms) {
            const destCat = room.categories.find(c => c.id === destCatId);
            if (destCat) {
                destCat.subcategories.splice(newIndex, 0, subToMove);
                this.saveData(data);
                return;
            }
        }
    },

    toggleAdmin(roomId: string, memberId: string) {
        const data = this.getData();
        const room = data.rooms.find(r => r.id === roomId);
        if (room) {
            const member = room.members.find(m => m.id === memberId);
            if (member && member.id !== 'guest-me') {
                member.role = member.role === 'admin' ? 'member' : 'admin';
                this.saveData(data);
                return member;
            }
        }
        return null;
    },

    kickMember(roomId: string, memberId: string) {
        const data = this.getData();
        const room = data.rooms.find(r => r.id === roomId);
        if (room) {
            if (memberId === 'guest-me') return false;
            room.members = room.members.filter(m => m.id !== memberId);
            this.saveData(data);
            return true;
        }
        return false;
    }
};
