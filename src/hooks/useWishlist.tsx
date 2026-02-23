import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

interface WishlistContextType {
    items: string[];
    toggle: (id: string) => void;
    has: (id: string) => boolean;
    clear: () => void;
    count: number;
}

const WishlistContext = createContext<WishlistContextType>({
    items: [],
    toggle: () => { },
    has: () => false,
    clear: () => { },
    count: 0,
});

const STORAGE_KEY = 'ps-wishlist';

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<string[]>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }, [items]);

    const toggle = useCallback((id: string) => {
        setItems(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    }, []);

    const has = useCallback((id: string) => items.includes(id), [items]);

    const clear = useCallback(() => setItems([]), []);

    return (
        <WishlistContext.Provider value={{ items, toggle, has, clear, count: items.length }}>
            {children}
        </WishlistContext.Provider>
    );
}

export const useWishlist = () => useContext(WishlistContext);
