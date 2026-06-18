'use client';

import { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';
import Header from '@/components/Header';
import Cart from '@/components/Cart';
import AuthModal from '@/components/AuthModal';
import { Categoria } from '@/types';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const {
    currentUser, handleLogout, navigate,
    isCartOpen, setIsCartOpen,
    cartItems, handleUpdateCartQty, handleRemoveCartItem, handleClearCart,
    setIsAuthModalOpen, setAuthMode, setAuthError,
    searchQuery, setSearchQuery,
    selectedCategorySlug, setSelectedCategorySlug,
  } = useStore();

  const [categories, setCategories] = useState<Categoria[]>([]);

  useEffect(() => {
    fetch('/api/categories')
      .then(r => r.json())
      .then(data => setCategories(data.categories || []));
  }, []);

  const cartCount = cartItems.reduce((acc, c) => acc + c.quantidade, 0);

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-stone-900 selection:bg-amber-100 flex flex-col font-serif antialiased">
      {/* Top Banner */}
      <div className="bg-[#1D1B18] text-white py-2 text-center text-[10px] font-mono tracking-widest uppercase flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span>Envio Expresso em Luanda e Províncias • Moda Feminina angolana</span>
      </div>

      <Header
        categorias={categories}
        selectedCategorySlug={selectedCategorySlug}
        onSelectCategory={setSelectedCategorySlug}
        cartCount={cartCount}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => {
          setAuthMode('login');
          setAuthError(null);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onNavigate={navigate}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
      />

      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-[#1D1B18] text-stone-400 py-10 border-t border-stone-900 mt-20 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-white font-serif font-black tracking-widest text-lg uppercase leading-none">
              fem<span className="text-amber-500 font-sans font-light italic">fashion</span>
            </h4>
            <p className="text-stone-400 font-sans text-xs leading-relaxed max-w-sm">
              Concebida para a mulher angolana elegante, cosmopolita e empoderada de Luanda.
            </p>
            <p className="text-[10px] text-stone-500">© 2026 femfashion Lda. Todos os direitos reservados.</p>
          </div>
          <div className="space-y-2 text-stone-300">
            <p className="text-amber-500 uppercase font-bold text-[10px] tracking-widest">Suporte &amp; Levantamento express</p>
            <p>Atendimento Cliente: +244 923 000 001</p>
            <p>Sede Física: Edifício Talatona Plaza, Via AL12, Luanda, Angola</p>
            <p>E-mail: help@femfashion.ao</p>
          </div>
        </div>
      </footer>

      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        currentUser={currentUser}
        onOpenAuth={() => {
          setIsCartOpen(false);
          setAuthMode('login');
          setAuthError(null);
          setIsAuthModalOpen(true);
        }}
      />

      <AuthModal />
    </div>
  );
}
