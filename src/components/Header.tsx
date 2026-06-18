/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ShoppingBag, Shield, LogIn, User, LogOut, Menu, X } from 'lucide-react';
import { Categoria, Usuario } from '../types';
import { useState } from 'react';

interface HeaderProps {
  categorias: Categoria[];
  selectedCategorySlug: string | null;
  onSelectCategory: (slug: string | null) => void;
  cartCount: number;
  onOpenCart: () => void;
  currentUser: Usuario | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  currentPath: string;
  onNavigate: (path: string) => void;
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
  currentPath,
  onNavigate
}: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-100 shadow-sm transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-2">
            <button 
              onClick={() => {
                onSelectCategory(null);
                onNavigate('/');
              }} 
              className="group text-left"
              id="header-brand-logo-btn"
            >
              <h1 className="text-2xl font-serif font-black tracking-widest text-[#1D1B18] transition-colors focus:outline-none">
                fem<span className="text-amber-600 font-sans font-light italic">fashion</span>
              </h1>
              <p className="text-[9px] font-mono tracking-widest text-stone-400 group-hover:text-amber-600 uppercase">
                LUANDA LUXURY BOUTIQUE
              </p>
            </button>
          </div>

          {/* Desktop Categories Filter Shortcuts */}
          <div className="hidden lg:flex space-x-6 items-center">
            <button
              onClick={() => {
                onSelectCategory(null);
                onNavigate('/');
              }}
              className={`text-xs uppercase font-medium tracking-widest pb-1 border-b-2 transition-all ${
                selectedCategorySlug === null && currentPath === '/'
                  ? 'border-amber-600 text-stone-900 font-semibold'
                  : 'border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300'
              }`}
              id="nav-all-products-btn"
            >
              Coleções
            </button>
            {categorias.map(cat => (
              <button
                key={cat.id}
                onClick={() => {
                  onSelectCategory(cat.slug);
                  onNavigate('/');
                }}
                className={`text-xs uppercase font-medium tracking-widest pb-1 border-b-2 transition-all ${
                  selectedCategorySlug === cat.slug && currentPath === '/'
                    ? 'border-amber-600 text-stone-900 font-semibold'
                    : 'border-transparent text-stone-500 hover:text-stone-900 hover:border-stone-300'
                }`}
                id={`nav-cat-${cat.slug}-btn`}
              >
                {cat.nome.split(' & ')[0]}
              </button>
            ))}
          </div>

          {/* User Interaction Controls */}
          <div className="flex items-center space-x-3">
            {/* Admin Toggle button (Visible only if current user is Admin OR if we want to preview easily) */}
            {currentUser?.role === 'admin' && (
              <button
                onClick={() => onNavigate(currentPath.startsWith('/admin') ? '/' : '/admin')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono tracking-wider uppercase transition-all ${
                  currentPath.startsWith('/admin')
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                }`}
                title="Ir para o Backoffice"
                id="backoffice-quick-toggle-btn"
              >
                <Shield className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                <span>BACKOFFICE</span>
              </button>
            )}

            {/* Quick Demo Assist - Let's allow users to see admin options if they login */}
            {!currentUser && (
              <span className="hidden md:inline text-[10px] font-mono text-neutral-400 bg-stone-50 border border-neutral-100 px-2 py-1 rounded">
                Admin Demo: admin@femfashion.ao (password: admin123)
              </span>
            )}

            {/* Account Icon Control */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                <div className="hidden sm:block text-right">
                  <p className="text-[11px] font-mono font-medium text-stone-950">{currentUser.nome}</p>
                  <p className="text-[9px] font-mono text-amber-600 uppercase">{currentUser.role}</p>
                </div>
                <div className="relative group">
                  <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#FAF9F6] border border-stone-200 hover:border-amber-600 hover:text-amber-600 text-stone-700 transition" id="user-profile-menu-btn">
                    <User className="w-4 h-4" />
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-stone-100 rounded-lg shadow-xl py-1 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-100">
                    <div className="px-4 py-2 border-b border-stone-50">
                      <p className="text-xs text-stone-400">Conta Ativa</p>
                      <p className="text-xs font-medium text-stone-900 font-mono truncate">{currentUser.email}</p>
                    </div>
                    {currentUser.role === 'admin' && (
                      <button
                        onClick={() => onNavigate('/admin')}
                        className="w-full text-left px-4 py-2 text-xs text-stone-700 hover:bg-amber-50 hover:text-amber-700 flex items-center gap-2"
                        id="menu-backoffice-btn"
                      >
                        <Shield className="w-3.5 h-3.5 text-amber-600" />
                        Backoffice Geral
                      </button>
                    )}
                    <button
                      onClick={onLogout}
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
                className="flex items-center gap-1.5 px-3 py-1.5 border border-stone-200 hover:border-amber-600 hover:text-amber-700 rounded-full text-xs font-medium text-stone-700 transition"
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
          <div className="px-2 pt-2 pb-3 space-y-1">
            <button
              onClick={() => {
                onSelectCategory(null);
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
                  selectedCategorySlug === cat.slug ? 'bg-amber-50 text-amber-800' : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                {cat.nome}
              </button>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
