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
    rooms: GuestRoom[];
}

const DEFAULT_DATA: GuestData = {
    rooms: [
        {
            id: 'test-room',
            name: 'Sala de Prueba 🛡️',
            secretCode: 'PRUEBA123',
            creatorId: 'admin', // Not 'guest' so guests can't edit it
            categories: [
                {
                    id: 'cat-1',
                    name: 'Análisis Matemático I',
                    subcategories: [
                        { 
                            id: 'sub-1', 
                            name: 'Práctico 1 - Funciones', 
                            messages: [
                                {
                                    id: 'm1',
                                    content: '¡Bienvenidos! Acá les dejo la resolución del primer punto del práctico.',
                                    images: ['/wallpaper.png'],
                                    user: { name: 'Admin de la Room', image: null },
                                    createdAt: new Date(Date.now() - 3600000).toISOString(),
                                    replies: [
                                        {
                                            id: 'r1',
                                            content: '¡Gracias Admin! Me sirve mucho.',
                                            user: { name: 'Estudiante 1', image: null },
                                            createdAt: new Date(Date.now() - 1800000).toISOString(),
                                        }
                                    ]
                                }
                            ] 
                        },
                        { id: 'sub-2', name: 'Práctico 2 - Límites', messages: [] }
                    ]
                }
            ],
            members: [
                { id: 'm1', user: { name: 'Admin de la Room', image: null }, createdAt: new Date(Date.now() - 86400000).toISOString() },
                { id: 'm2', user: { name: 'Estudiante 1', image: null }, createdAt: new Date(Date.now() - 43200000).toISOString() },
                { id: 'guest-me', user: { name: 'Invitado (Tú)', image: null }, createdAt: new Date().toISOString() }
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
            localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(parsed));
        } else if (parsed.rooms[testRoomIndex].creatorId !== 'admin') {
            parsed.rooms[testRoomIndex] = DEFAULT_DATA.rooms[0];
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
            categories: [],
            members: [{ id: 'gm1', user: { name: 'Invitado', image: null }, createdAt: new Date().toISOString() }]
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
                        user: { name: 'Invitado', image: null },
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

    getSubcategory(subId: string) {
        for (const room of this.getData().rooms) {
            for (const cat of room.categories) {
                const sub = cat.subcategories.find(s => s.id === subId);
                if (sub) return sub;
            }
        }
        return null;
    }
};
