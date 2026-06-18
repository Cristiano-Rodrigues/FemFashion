/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, FormEvent } from 'react';
import { 
  AnimatePresence, motion 
} from 'motion/react';
import { 
  Search, ShieldAlert, ShoppingBag, X, Heart, 
  ArrowLeft, Check, Sparkles, BookOpen, Clock, 
  HelpCircle, Eye, ChevronRight
} from 'lucide-react';

import { 
  Categoria, ProdutoDetalhado, VarianteProduto, 
  CartItem, Usuario 
} from './types';
import { DatabaseService } from './services/db';

// Modular Components Imports
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import ProductZoom from './components/ProductZoom';
import Cart from './components/Cart';
import AdminPanel from './components/AdminPanel';

export default function App() {
  // Navigation Router state: '/' (home), '/admin', or '/product/:slug'
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedProductSlug, setSelectedProductSlug] = useState<string | null>(null);

  // Core Data models
  const [products, setProducts] = useState<ProdutoDetalhado[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Cart and user auth
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<Usuario | null>(null);
  
  // Auth Modal states
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Product view variant configuration
  const [selectedVariant, setSelectedVariant] = useState<VarianteProduto | null>(null);
  const [productQuantity, setProductQuantity] = useState(1);
  const [productDetails, setProductDetails] = useState<ProdutoDetalhado | null>(null);

  // Initial Sync load
  useEffect(() => {
    loadAllStoreData();
    // Setup visitor session
    DatabaseService.logEvent('visita_site', '/', null, { screenWidth: window.innerWidth }).then();
  }, [currentPath]);

  const loadAllStoreData = async () => {
    try {
      const allProds = await DatabaseService.getProductsDetalhados();
      const allCats = await DatabaseService.getCategories();
      const user = await DatabaseService.getCurrentUser();
      
      setProducts(allProds);
      setCategories(allCats);
      setCurrentUser(user);

      // If we are looking for a product, find it
      if (selectedProductSlug) {
        const p = allProds.find(item => item.slug === selectedProductSlug);
        if (p) {
          setProductDetails(p);
          // Auto select first variant
          if (p.variantes.length > 0) {
            ReactSelectVariant(p.variantes[0]);
          }
        }
      }
    } catch (e) {
      console.error(e);
    }
  };

  const ReactSelectVariant = (v: VarianteProduto) => {
    setSelectedVariant(v);
    setProductQuantity(1);
  };

  const navigateTo = (path: string) => {
    setSearchQuery('');
    
    if (path.startsWith('/product/')) {
      const slug = path.replace('/product/', '');
      setSelectedProductSlug(slug);
      setCurrentPath('/product');
      
      // Auto find product details
      const found = products.find(p => p.slug === slug);
      if (found) {
        setProductDetails(found);
        if (found.variantes.length > 0) {
          setSelectedVariant(found.variantes[0]);
        }
        DatabaseService.logEvent('visualizar_produto', `/product/${slug}`, found.id).then();
      }
    } else {
      setSelectedProductSlug(null);
      setProductDetails(null);
      setSelectedVariant(null);
      setCurrentPath(path);
      
      if (path === '/') {
        DatabaseService.logEvent('visualizar_vitrina', '/').then();
      } else if (path === '/admin') {
        DatabaseService.logEvent('visualizar_admin', '/admin').then();
      }
    }
    // Scroll window smoothly to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ==========================================
  // CART ACTIONS & MUTATIONS
  // ==========================================

  const handleAddToCart = (product: ProdutoDetalhado, variant: VarianteProduto, quantity: number) => {
    if (variant.quantidade_stock === 0) return;

    setCartItems(prev => {
      const existingIdx = prev.findIndex(item => item.variante.id === variant.id);
      if (existingIdx !== -1) {
        const updated = [...prev];
        const newQty = updated[existingIdx].quantidade + quantity;
        // Block exceeding available stock
        updated[existingIdx].quantidade = Math.min(newQty, variant.quantidade_stock);
        return updated;
      }
      return [...prev, { produto: product, variante: variant, quantidade: quantity }];
    });

    setIsCartOpen(true);
    DatabaseService.logEvent('adicionar_carrinho', currentPath, product.id, {
      variantId: variant.id,
      quantity,
      price: variant.preco
    }).then();
  };

  const handleUpdateCartQty = (variantId: string, value: number) => {
    if (value <= 0) {
      handleRemoveCartItem(variantId);
      return;
    }

    setCartItems(prev => {
      return prev.map(item => {
        if (item.variante.id === variantId) {
          return {
            ...item,
            quantidade: Math.min(value, item.variante.quantidade_stock)
          };
        }
        return item;
      });
    });
  };

  const handleRemoveCartItem = (variantId: string) => {
    setCartItems(prev => prev.filter(it => it.variante.id !== variantId));
  };

  // ==========================================
  // AUTH ACTIONS
  // ==========================================

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (authMode === 'login') {
      const { user, error } = await DatabaseService.login(authEmail, authPassword);
      if (error) {
        setAuthError(error);
      } else {
        setCurrentUser(user);
        setIsAuthModalOpen(false);
        setAuthPassword('');
        loadAllStoreData();
      }
    } else {
      if (!authName || !authPhone) {
        setAuthError('Por favor, preencha o nome de contacto e telemóvel.');
        return;
      }
      const { user, error } = await DatabaseService.register(authName, authEmail, authPassword, authPhone);
      if (error) {
        setAuthError(error);
      } else {
        setCurrentUser(user);
        setIsAuthModalOpen(false);
        setAuthName('');
        setAuthPassword('');
        setAuthPhone('');
        loadAllStoreData();
      }
    }
  };

  const handleLogout = async () => {
    await DatabaseService.logout();
    setCurrentUser(null);
    navigateTo('/');
  };

  // Price formatting tool
  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('AOA', 'Kz');
  };

  // Filtering products list
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategorySlug 
      ? p.categoria?.slug === selectedCategorySlug 
      : true;
    const matchesSearch = p.nome.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.descricao.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch && p.ativo;
  });

  return (
    <div className="min-h-screen bg-[#FCFAF7] text-stone-900 selection:bg-amber-100 flex flex-col font-serif antialiased">
      
      {/* Top Banner Alert Promo */}
      <div className="bg-[#1D1B18] text-white py-2 text-center text-[10px] font-mono tracking-widest uppercase flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
        <span>Envio Expresso em Luanda e Províncias • Moda Feminina Premium Angola</span>
      </div>

      {/* Global standard Navigation */}
      <Header
        categorias={categories}
        selectedCategorySlug={selectedCategorySlug}
        onSelectCategory={setSelectedCategorySlug}
        cartCount={cartItems.reduce((acc, c) => acc + c.quantidade, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => {
          setAuthMode('login');
          setAuthError(null);
          setIsAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        currentPath={currentPath}
        onNavigate={navigateTo}
      />

      {/* RENDER STORES PATHS */}
      <main className="flex-grow">
        
        {/* VIEW A: HOME / CATEGORIES VIRTINE */}
        {currentPath === '/' && (
          <div className="space-y-12 animate-in fade-in duration-300">
            
            {/* HERO BANNER SECTION */}
            <header className="relative bg-stone-950 overflow-hidden py-16 md:py-28 text-white px-4">
              {/* Geometric pattern backgrounds */}
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-30 mix-blend-overlay" />
              <div className="absolute inset-0 bg-gradient-to-r from-stone-950 via-stone-900/90 to-transparent" />
              
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
                <span className="text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full font-mono uppercase tracking-widest">
                  Coleção de Luxo 2026/2027
                </span>
                
                <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-none text-white max-w-2xl font-serif">
                  Destaque a sua <span className="text-amber-500 italic font-sans font-light">Beleza</span> Natural
                </h2>
                
                <p className="text-stone-300 max-w-md text-xs md:text-sm font-sans leading-relaxed font-light">
                  Explore o luxo em perucas front lace HD realistas, alta-costura sofisticada de Luanda, sandálias cravejadas de brilhantes e acessórios exclusivos concebidos para realçar a sua sofisticação.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row gap-4 max-w-md">
                  {/* Search box input widget */}
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Pesquisar por perucas, vestidos, batons..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/10 backdrop-blur-md rounded-full border border-white/20 pl-10 pr-4 py-2.5 text-xs text-white placeholder-stone-400 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </header>

            {/* CATEGORIES SECTIONS SHORTCUTS SCREEN */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col md:flex-row justify-between items-baseline mb-6 border-b border-stone-100 pb-3">
                <div>
                  <h3 className="text-lg font-bold tracking-wide uppercase text-stone-900">
                    {selectedCategorySlug 
                      ? categories.find(c => c.slug === selectedCategorySlug)?.nome 
                      : 'Nossas Categorias'}
                  </h3>
                  <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest mt-0.5">
                    {selectedCategorySlug ? 'Filtro por departamento' : 'Exclusividade em cada detalhe'}
                  </p>
                </div>
                {selectedCategorySlug && (
                  <button 
                    onClick={() => setSelectedCategorySlug(null)} 
                    className="text-xs uppercase font-mono text-amber-700 font-semibold"
                  >
                    Ver Tudo ×
                  </button>
                )}
              </div>

              {/* Grid of circle category items */}
              {!selectedCategorySlug && (
                <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-10">
                  {categories.map((cat, idx) => {
                    const fallbackImages = [
                      'https://images.unsplash.com/photo-1620331713537-bca9da369e80?auto=format&fit=crop&q=80&w=200', // wigs
                      'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=200', // garments
                      'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=200', // shoes
                      'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=200', // bag
                      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=200', // lipstick
                      'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=200'  // jewelry
                    ];
                    return (
                      <div
                        key={cat.id}
                        onClick={() => setSelectedCategorySlug(cat.slug)}
                        className="group flex flex-col items-center p-4 bg-white border border-stone-100 rounded-2xl hover:border-amber-200 transition cursor-pointer text-center"
                      >
                        <div className="w-16 h-16 rounded-full overflow-hidden mb-2.5 border border-stone-200/50">
                          <img src={fallbackImages[idx] || fallbackImages[0]} alt={cat.nome} className="w-full h-full object-cover group-hover:scale-105 transition" />
                        </div>
                        <h5 className="font-serif font-black text-xs text-stone-900 tracking-wide leading-none">{cat.nome.split(' & ')[0]}</h5>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PRODUCTS LIST GRID */}
              {filteredProducts.length === 0 ? (
                <div className="py-20 text-center bg-stone-50 rounded-3xl border border-stone-100">
                  <p className="font-bold text-stone-800">Nenhum produto em vitrine encontrado</p>
                  <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto leading-relaxed">
                    Não existem correspondências ativas para a sua consulta de pesquisa ou seleção de categoria neste momento.
                  </p>
                  <button 
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedCategorySlug(null);
                    }}
                    className="mt-4 px-4 py-2 bg-[#171512] text-white text-xs font-mono rounded"
                  >
                    Redefinir Filtros
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {filteredProducts.map(p => (
                    <ProductCard
                      key={p.id}
                      product={p}
                      onViewProduct={(slug) => navigateTo(`/product/${slug}`)}
                    />
                  ))}
                </div>
              )}
            </section>

            {/* HIGH FASHION ADVOCACY STATEMENT BANNER */}
            <section className="bg-stone-100/50 py-16 border-y border-stone-150">
              <div className="max-w-4xl mx-auto text-center px-4 space-y-4">
                <blockquote className="text-lg md:text-2xl font-serif italic text-stone-850 leading-relaxed font-semibold">
                  "A elegância não consiste em sobressair, mas em ser lembrada."
                </blockquote>
                <cite className="block text-[10px] font-mono uppercase tracking-widest text-stone-400 font-bold">
                  — Atelier femfashion Luanda
                </cite>
              </div>
            </section>
          </div>
        )}

        {/* VIEW B: INDIVIDUAL DETAILED PRODUCT PAGE */}
        {currentPath === '/product' && productDetails && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-350">
            
            {/* Navigation back and path trail */}
            <button
              onClick={() => navigateTo('/')}
              className="mb-6 flex items-center gap-1.5 text-stone-500 hover:text-amber-800 text-xs font-mono uppercase tracking-widest"
              id="back-to-catalog-btn"
            >
              <ArrowLeft className="w-4 h-4" />
              Voltar ao Catálogo
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              
              {/* Product Gallery Left Block with Custom Zoom */}
              <div className="space-y-3">
                <ProductZoom 
                  src={selectedVariant ? productDetails.imagens[0]?.url || 'https://images.unsplash.com/photo-1620331713537-bca9da369e80?auto=format&fit=crop&q=80&w=800' : 'https://images.unsplash.com/photo-1620331713537-bca9da369e80?auto=format&fit=crop&q=80&w=800'} 
                  alt={productDetails.nome} 
                />
                
                {/* Extra thumbnails list */}
                {productDetails.imagens.length > 1 && (
                  <div className="flex gap-2 justify-start overflow-x-auto py-1">
                    {productDetails.imagens.map((img, index) => (
                      <div 
                        key={index} 
                        className="w-16 h-16 border border-stone-200 hover:border-amber-600 rounded-lg overflow-hidden shrink-0 cursor-pointer"
                      >
                        <img src={img.url} alt={`Minia-${index}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Product Configurations Panel Right Block */}
              <div className="flex flex-col justify-between py-2 space-y-6">
                <div className="space-y-4">
                  
                  {/* Category breadcrumb */}
                  <span className="text-[10px] font-mono tracking-widest text-amber-700 uppercase font-bold bg-amber-500/10 px-2.5 py-1 rounded">
                    {productDetails.categoria?.nome || 'Coleção de Destaque'}
                  </span>

                  <h1 className="text-3xl md:text-4xl font-serif font-black text-stone-900 tracking-wide mt-2">
                    {productDetails.nome}
                  </h1>

                  {/* Real-time variant specific rate */}
                  <div className="flex items-baseline gap-3 my-4">
                    <span className="text-4xl font-serif font-black text-amber-600 tracking-tight font-mono">
                      {formatKz(selectedVariant ? selectedVariant.preco : productDetails.preco)}
                    </span>
                    <span className="text-xs text-stone-400 font-mono uppercase tracking-wider">
                      (Preço Final {selectedVariant?.designativo ? `opcao: ${selectedVariant.designativo}` : 'base'})
                    </span>
                  </div>

                  <p className="text-sm text-stone-500 font-light leading-relaxed max-w-lg border-t border-stone-100 pt-4">
                    {productDetails.descricao}
                  </p>

                  {/* Dynamic Selectable Variants Box */}
                  <div className="space-y-3 pt-4">
                    <span className="text-[10px] text-stone-400 font-mono uppercase tracking-wider block">Escolha as Opções Disponíveis:</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-md">
                      {productDetails.variantes.map((v) => (
                        <button
                          key={v.id}
                          onClick={() => ReactSelectVariant(v)}
                          disabled={v.quantidade_stock === 0}
                          className={`p-3 text-left border rounded-xl flex flex-col transition font-mono ${
                            selectedVariant?.id === v.id
                              ? 'border-amber-600 bg-amber-50/20 text-[#151210] font-bold shadow-sm'
                              : v.quantidade_stock === 0
                                ? 'border-stone-150 bg-stone-100 text-stone-400 opacity-50 cursor-not-allowed'
                                : 'border-stone-200 bg-white hover:bg-stone-50 text-stone-700'
                          }`}
                          id={`variant-btn-${v.id}`}
                        >
                          <span className="text-[11px] uppercase tracking-wide truncate block">{v.designativo || 'Especificações'}</span>
                          <span className="text-[10px] text-stone-500 mt-1 block">Tamanho: {v.tamanho || 'Único'} - Cor: {v.cor || 'Único'}</span>
                          
                          <div className="flex justify-between items-center w-full mt-2 font-serif">
                            <span className="text-xs text-amber-700 font-black font-mono">{formatKz(v.preco)}</span>
                            <span className={`text-[9px] font-mono px-1.5 rounded ${
                              v.quantidade_stock <= 3 
                                ? 'bg-red-50 text-red-650 font-bold' 
                                : v.quantidade_stock === 0 
                                  ? 'bg-neutral-100 text-neutral-400'
                                  : 'bg-emerald-50 text-emerald-800'
                            }`}>
                              {v.quantidade_stock === 0 ? 'Esgotado' : `${v.quantidade_stock} disp.`}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                </div>

                {/* Shopping core actions */}
                <div className="border-t border-stone-100 pt-6 space-y-4 max-w-md font-serif">
                  <div className="flex items-center gap-4">
                    
                    {/* Add - Select counter */}
                    <div className="flex items-center border border-stone-200 rounded-full py-2 px-4 bg-white shadow-sm font-mono text-xs">
                      <button 
                        onClick={() => setProductQuantity(prev => Math.max(1, prev - 1))}
                        className="text-stone-500 hover:text-stone-900"
                        id="qty-dec-btn"
                      >
                        -
                      </button>
                      <span className="px-5 font-bold text-stone-950 min-w-[24px] text-center">
                        {productQuantity}
                      </span>
                      <button 
                        onClick={() => {
                          const max = selectedVariant ? selectedVariant.quantidade_stock : 1;
                          setProductQuantity(prev => Math.min(max, prev + 1));
                        }}
                        className="text-stone-500 hover:text-stone-900"
                        id="qty-inc-btn"
                      >
                        +
                      </button>
                    </div>

                    {/* Submit Button */}
                    <button
                      onClick={() => selectedVariant && handleAddToCart(productDetails, selectedVariant, productQuantity)}
                      disabled={!selectedVariant || selectedVariant.quantidade_stock === 0}
                      className="flex-grow py-3 px-6 bg-stone-950 hover:bg-amber-600 text-white rounded-full text-xs font-mono uppercase tracking-widest font-bold flex justify-center items-center gap-2 shadow-md transition disabled:opacity-50 cursor-pointer"
                      id="add-to-cart-action-btn"
                    >
                      <ShoppingBag className="w-4 h-4 text-white" />
                      {!selectedVariant || selectedVariant.quantidade_stock === 0 ? 'Esgotado na Plataforma' : 'Adicionar ao Carrinho'}
                    </button>
                  </div>

                  <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest text-center mt-2">
                    ✓ Levantamentos expressos e devoluções gratuitas até 7 dias em Luanda.
                  </p>
                </div>

              </div>

            </div>
          </div>
        )}

        {/* VIEW C: ADMIN BACKOFFICE ROUTE */}
        {currentPath === '/admin' && (
          <AdminPanel
            currentUser={currentUser}
            onNavigateHome={() => navigateTo('/')}
          />
        )}

      </main>

      {/* FOOTER GENERAL AREA */}
      <footer className="bg-[#1D1B18] text-stone-400 py-10 border-t border-stone-900 mt-20 font-mono text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-white font-serif font-black tracking-widest text-lg uppercase leading-none">
              fem<span className="text-amber-500 font-sans font-light italic">fashion</span>
            </h4>
            <p className="text-stone-400 font-sans text-xs leading-relaxed max-w-sm">
              Concebida para a mulher angolana elegante, cosmopolita e empoderada de Luanda. Luxo acessível, curadoria requintada e alta costura à distância de um clique.
            </p>
            <p className="text-[10px] text-stone-500">
              © 2026 femfashion Lda. Todos os direitos reservados.
            </p>
          </div>
          
          <div className="space-y-2 text-stone-300">
            <p className="text-amber-500 uppercase font-bold text-[10px] tracking-widest">Suporte & Levantamento express</p>
            <p>Atendimento Cliente: +244 923 000 001</p>
            <p>Sede Física: Edifício Talatona Plaza, Via AL12, Luanda, Angola</p>
            <p>E-mail: help@femfashion.ao</p>
          </div>
        </div>
      </footer>

      {/* SLIDER SHOPPING CART PANELS WIDGET */}
      <Cart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={() => setCartItems([])}
        currentUser={currentUser}
        onOpenAuth={() => {
          setIsCartOpen(false);
          setAuthMode('login');
          setAuthError(null);
          setIsAuthModalOpen(true);
        }}
      />

      {/* MULTI_STEP AUTH/SIGN_IN MODALS */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl border border-stone-100 animate-in zoom-in-95 duration-150">
            
            <div className="flex justify-between items-center border-b border-stone-100 pb-3 mb-4">
              <h4 className="font-serif font-black text-stone-900 uppercase tracking-widest text-xs">
                {authMode === 'login' ? 'Iniciar Sessão Cliente' : 'Registo de Nova Conta'}
              </h4>
              <button 
                onClick={() => setIsAuthModalOpen(false)} 
                className="text-stone-400 hover:text-stone-900"
                id="close-auth-modal-btn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {authError && (
              <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs leading-relaxed font-semibold mb-4 border border-red-100">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              
              {authMode === 'register' && (
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Nome Completo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Helena Patrício"
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  placeholder="Ex: cliente@mail.ao"
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600 font-mono"
                />
              </div>

              {authMode === 'register' && (
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Telemóvel (+244)</label>
                  <input
                    type="text"
                    required
                    placeholder="9XXXXXXXX"
                    value={authPhone}
                    onChange={(e) => setAuthPhone(e.target.value)}
                    className="w-full bg-white border border-[#DDD] rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600 font-mono"
                  />
                </div>
              )}

              <div>
                <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Palavra-Passe</label>
                <input
                  type="password"
                  required
                  placeholder="Introduza a sua password..."
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600 font-mono"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#171512] hover:bg-amber-600 text-white rounded-lg text-xs font-mono uppercase font-bold transition shadow-sm cursor-pointer"
                id="auth-submit-btn"
              >
                {authMode === 'login' ? 'Iniciar Sessão' : 'Criar Conta Premium'}
              </button>

              <div className="pt-2 text-center border-t border-stone-100">
                {authMode === 'login' ? (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('register');
                      setAuthError(null);
                    }}
                    className="text-[10px] font-mono uppercase text-amber-700 font-bold hover:underline"
                    id="switch-to-register-btn"
                  >
                    Não tem conta? Registe-se agora
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode('login');
                      setAuthError(null);
                    }}
                    className="text-[10px] font-mono uppercase text-stone-500 hover:underline"
                    id="switch-to-login-btn"
                  >
                    Já tem conta? Faça Login
                  </button>
                )}
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
