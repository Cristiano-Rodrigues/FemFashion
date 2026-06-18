'use client';

import {
  createContext, useContext, useState, useEffect, useCallback,
  ReactNode, FormEvent
} from 'react';
import { useRouter } from 'next/navigation';
import { CartItem, Usuario, VarianteProduto, ProdutoDetalhado } from '@/types';

interface StoreContextType {
  // Cart
  cartItems: CartItem[];
  isCartOpen: boolean;
  setIsCartOpen: (v: boolean) => void;
  handleAddToCart: (product: ProdutoDetalhado, variant: VarianteProduto, quantity: number) => void;
  handleUpdateCartQty: (variantId: string, value: number) => void;
  handleRemoveCartItem: (variantId: string) => void;
  handleClearCart: () => void;

  // Auth
  currentUser: Usuario | null;
  setCurrentUser: (user: Usuario | null) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (v: boolean) => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  authError: string | null;
  setAuthError: (e: string | null) => void;
  authName: string; setAuthName: (v: string) => void;
  authEmail: string; setAuthEmail: (v: string) => void;
  authPassword: string; setAuthPassword: (v: string) => void;
  authPhone: string; setAuthPhone: (v: string) => void;
  handleAuthSubmit: (e: FormEvent) => Promise<void>;
  handleLogout: () => Promise<void>;

  // Search & Filter
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedCategorySlug: string | null;
  setSelectedCategorySlug: (v: string | null) => void;

  // Utils
  formatKz: (value: number) => string;
  navigate: (path: string) => void;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  // Cart state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Auth state
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);

  // Load current user on mount
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const data = await res.json();
          if (data.user) setCurrentUser(data.user);
        }
      } catch { /* ignore */ }
    })();
  }, []);

  const navigate = useCallback((path: string) => {
    router.push(path);
  }, [router]);

  const handleAddToCart = useCallback((product: ProdutoDetalhado, variant: VarianteProduto, quantity: number) => {
    if (variant.quantidade_stock === 0) return;
    setCartItems(prev => {
      const idx = prev.findIndex(i => i.variante.id === variant.id);
      if (idx !== -1) {
        const updated = [...prev];
        updated[idx].quantidade = Math.min(updated[idx].quantidade + quantity, variant.quantidade_stock);
        return updated;
      }
      return [...prev, { produto: product, variante: variant, quantidade: quantity }];
    });
    setIsCartOpen(true);
  }, []);

  const handleUpdateCartQty = useCallback((variantId: string, value: number) => {
    if (value <= 0) {
      setCartItems(prev => prev.filter(i => i.variante.id !== variantId));
      return;
    }
    setCartItems(prev => prev.map(i =>
      i.variante.id === variantId
        ? { ...i, quantidade: Math.min(value, i.variante.quantidade_stock) }
        : i
    ));
  }, []);

  const handleRemoveCartItem = useCallback((variantId: string) => {
    setCartItems(prev => prev.filter(i => i.variante.id !== variantId));
  }, []);

  const handleClearCart = useCallback(() => setCartItems([]), []);

  const handleAuthSubmit = useCallback(async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === 'login') {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: authEmail, password: authPassword }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || 'Erro ao iniciar sessão.');
      } else {
        setCurrentUser(data.user);
        setIsAuthModalOpen(false);
        setAuthPassword('');
      }
    } else {
      if (!authName || !authPhone) {
        setAuthError('Por favor, preencha o nome de contacto e telemóvel.');
        return;
      }
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: authName, email: authEmail, password: authPassword, telefone: authPhone }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setAuthError(data.error || 'Erro ao criar conta.');
      } else {
        setCurrentUser(data.user);
        setIsAuthModalOpen(false);
        setAuthName(''); setAuthPassword(''); setAuthPhone('');
      }
    }
  }, [authMode, authEmail, authPassword, authName, authPhone]);

  const handleLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    router.push('/');
  }, [router]);

  const formatKz = useCallback((value: number) =>
    new Intl.NumberFormat('pt-AO', {
      style: 'currency', currency: 'AOA',
      minimumFractionDigits: 0, maximumFractionDigits: 0,
    }).format(value).replace('AOA', 'Kz'),
  []);

  return (
    <StoreContext.Provider value={{
      cartItems, isCartOpen, setIsCartOpen,
      handleAddToCart, handleUpdateCartQty, handleRemoveCartItem, handleClearCart,
      currentUser, setCurrentUser, isAuthModalOpen, setIsAuthModalOpen,
      authMode, setAuthMode, authError, setAuthError,
      authName, setAuthName, authEmail, setAuthEmail,
      authPassword, setAuthPassword, authPhone, setAuthPhone,
      handleAuthSubmit, handleLogout, formatKz, navigate,
      searchQuery, setSearchQuery, selectedCategorySlug, setSelectedCategorySlug,
    }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
