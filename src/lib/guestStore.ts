'use client';

const GUEST_DATA_KEY = 'ciberportero_guest_data';

export interface GuestMessage {
    id: string;
    content: string;
    images: string[];
    user: { name: string, image: string | null };
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

export interface GuestRoom {
    id: string;
    name: string;
    secretCode: string;
    creatorId: string;
    categories: GuestCategory[];
    members: any[];
}

interface GuestData {
    version: number;
    rooms: GuestRoom[];
}

const DEFAULT_DATA: GuestData = {
    version: 16,
    rooms: [
        {
            id: 'test-room',
            name: 'Grupo de Estudio Ciberdefensa 🛡️',
            secretCode: 'CIBERDEFENSA2026',
            creatorId: 'admin',
            categories: [
                {
                    id: 'cat-1',
                    name: 'Laboratorios Prácticos',
                    subcategories: [
                        {
                            id: 'sub-1',
                            name: 'Lab 1 - Análisis de Tráfico',
                            messages: [
                                {
                                    id: 'm1',
                                    content: '¿Alguien pudo filtrar los paquetes ICMP en Wireshark? No me queda claro cómo identificar el escaneo de puertos.',
                                    images: [],
                                    user: { name: 'Lucas G.', image: null },
                                    createdAt: new Date(Date.now() - 7200000).toISOString(),
                                    replies: [
                                        {
                                            id: 'r1',
                                            content: 'Fijate usando el filtro "icmp and ip.addr == [la_ip]". En el PDF de la clase 3 hay un ejemplo parecido.',
                                            user: { name: 'Nico B.', image: null },
                                            createdAt: new Date(Date.now() - 3600000).toISOString(),
                                        }
                                    ]
                                },
                                {
                                    id: 'm2',
                                    content: 'Gente, les paso el resumen de los comandos de Nmap que vimos hoy, por si a alguno le sirve para el TP.',
                                    images: ['/wallpaper.png'],
                                    user: { name: 'Admin del Grupo', image: null },
                                    createdAt: new Date(Date.now() - 1800000).toISOString(),
                                    replies: []
                                }
                            ]
                        },
                        {
                            id: 'sub-2',
                            name: 'Lab 2 - Hardening Linux',
                            messages: [
                                {
                                    id: 'm3',
                                    content: '¿Alguien sabe si para el lab de hardening hay que entregar el script o solo las capturas?',
                                    images: [],
                                    user: { name: 'Sofia V.', image: null },
                                    createdAt: new Date(Date.now() - 172800000).toISOString(),
                                    replies: [
                                        {
                                            id: 'r2',
                                            content: 'Dijo el profe que ambas cosas. El script tiene que estar bien comentado.',
                                            user: { name: 'Juan P.', image: null },
                                            createdAt: new Date(Date.now() - 86400000).toISOString(),
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    id: 'cat-2',
                    name: 'Exámenes y Material',
                    subcategories: [
                        {
                            id: 'sub-info',
                            name: 'Fechas y Parciales',
                            messages: [
                                {
                                    id: 'm4',
                                    content: 'Recuerden que el primer parcial es el lunes que viene por la plataforma virtual. ¡A estudiar!',
                                    images: [],
                                    user: { name: 'Admin del Grupo', image: null },
                                    createdAt: new Date(Date.now() - 43200000).toISOString(),
                                    replies: []
                                }
                            ]
                        }
                    ]
                }
            ],
            members: [
                { id: 'm1', user: { name: 'Admin del Grupo', image: null }, createdAt: new Date(Date.now() - 86400000).toISOString() },
                { id: 'm3', user: { name: 'Lucas G.', image: null }, createdAt: new Date(Date.now() - 21600000).toISOString() },
                { id: 'm4', user: { name: 'Sofia V.', image: null }, createdAt: new Date(Date.now() - 10800000).toISOString() },
                { id: 'm5', user: { name: 'Nico B.', image: null }, createdAt: new Date(Date.now() - 5400000).toISOString() },
                { id: 'guest-me', user: { name: 'Invitado (tú)', image: null }, createdAt: new Date().toISOString() }
            ]
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
        // Ensure test-room exists and is the current version
        const testRoomIndex = parsed.rooms.findIndex((r: any) => r.id === 'test-room');
        if (testRoomIndex === -1) {
            parsed.rooms.unshift(DEFAULT_DATA.rooms[0]);
            parsed.version = DEFAULT_DATA.version;
            localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(parsed));
        } else if (parsed.version !== DEFAULT_DATA.version) {
            // Force update test room data if version is old
            parsed.rooms[testRoomIndex] = DEFAULT_DATA.rooms[0];
            parsed.version = DEFAULT_DATA.version;
            localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(parsed));
        }
        return parsed;
    },

    saveData(data: GuestData) {
        if (typeof window === 'undefined') return;
        localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(data));
    },

    getRooms() {
        return this.getData().rooms;
    },

    createRoom(name: string, code: string, slug?: string) {
        const data = this.getData();
        let finalId = slug || slugify(name);

        // Avoid collisions
        let counter = 1;
        const originalId = finalId;
        while (data.rooms.some(r => r.id === finalId)) {
            finalId = `${originalId}-${counter}`;
            counter++;
        }

        const newRoom: GuestRoom = {
            id: finalId,
            name,
            secretCode: code,
            creatorId: 'guest',
            categories: [
                {
                    id: 'cat-general',
                    name: 'General',
                    subcategories: [
                        {
                            id: 'sub-chat',
                            name: 'Chat',
                            messages: []
                        }
                    ]
                }
            ],
            members: [{ id: 'gm1', user: { name: 'Invitado (tú)', image: null }, createdAt: new Date().toISOString() }]
        };
        data.rooms.push(newRoom);
        this.saveData(data);
        return newRoom;
    },

    getRoom(id: string) {
        return this.getData().rooms.find(r => r.id === id);
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

                // Avoid collisions within the same room
                let counter = 1;
                const originalId = finalId;
                const allSubs = room.categories.flatMap(c => c.subcategories);
                while (allSubs.some(s => s.id === finalId)) {
                    finalId = `${originalId}-${counter}`;
                    counter++;
                }

                const newSub: GuestSubcategory = {
                    id: finalId,
                    name,
                    messages: []
                };
                cat.subcategories.push(newSub);
                this.saveData(data);
                return newSub;
            }
        }
        return null;
    },

    addMessage(subId: string, content: string, images: string[], replyToId?: string) {
        const data = this.getData();
        for (const room of data.rooms) {
            for (const cat of room.categories) {
                const sub = cat.subcategories.find(s => s.id === subId);
                if (sub) {
                    const newMessage: GuestMessage = {
                        id: `guest-msg-${Date.now()}`,
                        content,
                        images,
                        user: { name: 'Invitado (tú)', image: null },
                        createdAt: new Date().toISOString(),
                        replies: []
                    };
                    if (replyToId) {
                        const parent = sub.messages.find(m => m.id === replyToId);
                        if (parent) {
                            parent.replies.push(newMessage);
                        } else {
                            sub.messages.push(newMessage);
                        }
                    } else {
                        sub.messages.push(newMessage);
                    }
                    this.saveData(data);
                    return newMessage;
                }
            }
        }
        return null;
    },

    updateRoom(id: string, name: string, newSlug?: string) {
        const data = this.getData();
        const room = data.rooms.find(r => r.id === id);
        if (room) {
            room.name = name;
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
        if (cat) {
            cat.name = name;
            this.saveData(data);
        }
    },

    deleteCategory(roomId: string, catId: string) {
        const data = this.getData();
        const room = data.rooms.find(r => r.id === roomId);
        if (room) {
            room.categories = room.categories.filter(c => c.id !== catId);
            this.saveData(data);
        }
    },

    updateSubcategory(subId: string, name: string) {
        const data = this.getData();
        for (const room of data.rooms) {
            for (const cat of room.categories) {
                const sub = cat.subcategories.find(s => s.id === subId);
                if (sub) {
                    sub.name = name;
                    this.saveData(data);
                    return;
                }
            }
        }
    },

    deleteSubcategory(subId: string) {
        const data = this.getData();
        for (const room of data.rooms) {
            for (const cat of room.categories) {
                const initialLen = cat.subcategories.length;
                cat.subcategories = cat.subcategories.filter(s => s.id !== subId);
                if (cat.subcategories.length !== initialLen) {
                    this.saveData(data);
                    return;
                }
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

    deleteMessage(subId: string, messageId: string, isReply = false, parentId?: string) {
        const data = this.getData();
        for (const room of data.rooms) {
            const cat = room.categories.find(c => c.subcategories.some(s => s.id === subId));
            if (!cat) continue;
            const sub = cat.subcategories.find(s => s.id === subId);
            if (!sub) continue;

            if (isReply && parentId) {
                const parent = sub.messages.find(m => m.id === parentId);
                if (parent && parent.replies) {
                    parent.replies = parent.replies.filter(r => r.id !== messageId);
                }
            } else {
                sub.messages = sub.messages.filter(m => m.id !== messageId);
            }
        }
        this.saveData(data);
    }
};
