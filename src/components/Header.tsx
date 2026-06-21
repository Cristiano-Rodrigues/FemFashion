'use client';

import { ShoppingBag, Shield, LogIn, User, LogOut, Menu, X, Search, ChevronDown } from 'lucide-react';
import { Categoria, Usuario } from '@/types';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

interface HeaderProps {
  categorias: Categoria[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentUser: Usuario | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onNavigate: (path: string) => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
}

export default function Header({
  categorias,
  selectedCategorySlug,
  onSelectCategory,
  cartCount,
  onOpenCart,
  currentUser,
  onOpenAuthModal,
  onLogout,
  onNavigate,
  searchQuery,
  onSearchQueryChange
}: HeaderProps) {
  const currentPath = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-2 shrink-0">
            <button 
              onClick={() => {
                onSelectCategory(null);
                onSearchQueryChange('');
                onNavigate('/');
              }} 
              className="group text-left"
              id="header-brand-logo-btn"
            >
              <h1 className="text-xl sm:text-2xl font-serif font-black tracking-widest text-[#1D1B18] transition-colors focus:outline-none">
                fem<span className="text-amber-600 font-sans font-light italic">fashion</span>
              </h1>
              <p className="text-[8px] sm:text-[9px] font-mono tracking-widest text-stone-400 group-hover:text-amber-600 uppercase">
                LUANDA LUXURY BOUTIQUE
              </p>
            </button>
          </div>

          {/* New Desktop Categories Layout with Dropdown instead of long row (prevents UI breaking) */}
          <div className="hidden lg:flex space-x-4 items-center shrink-0">
            <button
              onClick={() => {
                onSelectCategory(null);
                onSearchQueryChange('');
                onNavigate('/');
              }}
              className={`text-xs uppercase font-medium tracking-widest pb-1 border-b-2 transition-all ${
                selectedCategorySlug === null && searchQuery === '' && currentPath === '/'
                  ? 'border-amber-600 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300'
              }`}
              id="nav-all-products-btn"
            >
              Ver tudo
            </button>

            {/* Elegant Dropdown for Categories */}
            <div className="relative">
              <button
                onClick={() => setCatDropdownOpen(!catDropdownOpen)}
                onMouseEnter={() => setCatDropdownOpen(true)}
                className={`flex items-center gap-1 text-xs uppercase font-medium tracking-widest pb-1 border-b-2 transition-all ${
                  selectedCategorySlug !== null && currentPath === '/'
                    ? 'border-amber-600 text-stone-900 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300'
                }`}
                id="nav-categories-dropdown-btn"
              >
                <span>Categorias</span>
                <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${catDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {catDropdownOpen && (
                <div 
                  className="absolute left-0 mt-2 w-64 bg-white border border-stone-100 rounded-xl shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-1 duration-150"
                  onMouseLeave={() => setCatDropdownOpen(false)}
                >
                  <div className="px-4 py-1.5 border-b border-stone-50 mb-1">
                    <p className="text-[10px] font-mono text-stone-400 uppercase tracking-wider">Filtrar por Departamento</p>
                  </div>
                  <button
                    onClick={() => {
                      onSelectCategory(null);
                      onNavigate('/');
                      setCatDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-sans font-medium hover:bg-stone-50 transition-colors ${
                      selectedCategorySlug === null ? 'text-amber-600 bg-amber-50/50' : 'text-stone-700'
                    }`}
                  >
                    Ver Todas as Categorias ({categorias.length})
                  </button>
                  {categorias.map(cat => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        onSelectCategory(cat.slug);
                        onNavigate('/');
                        setCatDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-xs font-sans transition-colors hover:bg-stone-50 ${
                        selectedCategorySlug === cat.slug ? 'text-amber-600 bg-amber-50/50 font-semibold' : 'text-stone-600'
                      }`}
                      id={`nav-cat-${cat.slug}-btn`}
                    >
                      {cat.nome}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* New Robust Menu Search Box - Centered in free space */}
          <div className="hidden md:block flex-grow max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Pesquisar por perucas, vestidos, sapatos de luxo..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchQueryChange(e.target.value);
                  if (currentPath !== '/') {
                    onNavigate('/');
                  }
                }}
                className="w-full bg-[#FAF9F6] border border-stone-200 rounded-full pl-10 pr-4 py-2 text-xs text-stone-900 placeholder-stone-400 hover:border-amber-500/50 focus:border-amber-600 focus:bg-white focus:outline-none transition duration-150 shadow-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => onSearchQueryChange('')}
                  className="absolute right-3 top-2 px-1 text-[10px] font-mono hover:text-amber-600 text-stone-400"
                >
                  Limpar
                </button>
              )}
            </div>
          </div>

          {/* User Interaction Controls */}
          <div className="flex items-center space-x-2 shrink-0">

            {/* Account Icon Control */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-[11px] font-mono font-medium text-stone-950 truncate max-w-[100px]">{currentUser.nome}</p>
                  <p className="text-[8px] font-mono text-amber-600 uppercase">{currentUser.role}</p>
                </div>
                <div className="relative">
                  <button 
                    onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                    className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FAF9F6] border border-stone-200 hover:border-amber-600 hover:text-amber-600 text-stone-700 transition" 
                    id="user-profile-menu-btn"
                  >
                    <User className="w-4 h-4" />
                  </button>

                  {/* Backdrop to close menu when clicking outside */}
                  {profileMenuOpen && (
                    <div 
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                  )}

                  <div className={`absolute right-0 top-full mt-2 w-48 bg-white border border-stone-100 rounded-lg shadow-xl py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-100 ${profileMenuOpen ? 'block' : 'hidden'}`}>
                    <div className="px-4 py-2 border-b border-stone-50">
                      <p className="text-xs text-stone-400">Conta Ativa</p>
                      <p className="text-xs font-medium text-stone-900 font-mono truncate">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => { setProfileMenuOpen(false); onNavigate('/perfil'); }}
                      className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-stone-50 flex items-center gap-2"
                    >
                      <User className="w-3.5 h-3.5" />
                      A Minha Conta
                    </button>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => {
                          setProfileMenuOpen(false);
                          onNavigate('/admin');
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2"
                        id="menu-backoffice-btn"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-600" />
                        Backoffice Geral
                      </button>
                    )}
                    <button
                      onClick={() => { setProfileMenuOpen(false); onLogout(); }}
                      className="w-full text-left px-4 py-2 text-xs text-red-600 hover:bg-red-50 flex items-center gap-2"
                      id="menu-logout-btn"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Terminar Sessão
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="flex items-center gap-1 px-2.5 py-1.5 border border-stone-200 hover:border-amber-600 hover:text-amber-700 rounded-full text-xs font-medium text-stone-700 transition"
                id="main-login-btn"
              >
                <LogIn className="w-3.5 h-3.5 text-stone-500" />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}

            {/* Shopping Bag Button with Badge */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center justify-center p-2 rounded-full border border-stone-100 hover:border-amber-600 bg-stone-50 text-stone-800 hover:text-amber-600 transition duration-150 cursor-pointer"
              title="Ver Carrinho"
              id="main-cart-btn"
            >
              <ShoppingBag className="w-5 h-5 stroke-[1.75]" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-600 text-white rounded-full text-[9px] font-mono font-bold w-4 h-4 flex items-center justify-center animate-bounce shadow-sm">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-50"
              id="mobile-menu-btn"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-100 animate-in slide-in-from-top-4 duration-150" id="mobile-menu-dropdown">
          <div className="px-4 pt-2 pb-4 space-y-3">
            
            {/* Mobile Search - Robust field positioned inside the mobile menu */}
            <div className="relative mt-1 md:hidden">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-stone-400" />
              <input
                type="text"
                placeholder="Pesquisar por perucas, vestidos, bolsas..."
                value={searchQuery}
                onChange={(e) => {
                  onSearchQueryChange(e.target.value);
                  if (currentPath !== '/') {
                    onNavigate('/');
                  }
                }}
                className="w-full bg-[#FAF9F6] border border-stone-200 rounded-full pl-10 pr-4 py-2 text-xs text-stone-900 placeholder-stone-400 focus:border-amber-600 focus:outline-none focus:bg-white"
              />
            </div>

            <div className="h-px bg-stone-100 my-2 md:hidden"></div>

            <div className="space-y-1">
              <p className="px-3 text-[10px] font-mono text-stone-400 uppercase tracking-widest mb-1.5">Coleções & Filtros</p>
              <button
                onClick={() => {
                  onSelectCategory(null);
                  onSearchQueryChange('');
                  onNavigate('/');
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  selectedCategorySlug === null ? 'bg-amber-50 text-amber-800' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                Todas as Coleções
              </button>
              {categorias.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => {
                    onSelectCategory(cat.slug);
                    onNavigate('/');
                    setMobileMenuOpen(false);
                  }}
                  className={`block w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    selectedCategorySlug === cat.slug ? 'bg-amber-50 text-amber-800 font-semibold' : 'text-stone-600 hover:bg-stone-50'
                  }`}
                >
                  {cat.nome}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

