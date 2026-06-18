'use client';

import { FormEvent } from 'react';
import { X } from 'lucide-react';
import { useStore } from '@/contexts/StoreContext';

export default function AuthModal() {
  const {
    isAuthModalOpen, setIsAuthModalOpen,
    authMode, setAuthMode,
    authError, setAuthError,
    authName, setAuthName,
    authEmail, setAuthEmail,
    authPassword, setAuthPassword,
    authPhone, setAuthPhone,
    handleAuthSubmit,
  } = useStore();

  if (!isAuthModalOpen) return null;

  const onSubmit = (e: FormEvent) => {
    handleAuthSubmit(e);
  };

  return (
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

        <form onSubmit={onSubmit} className="space-y-4">
          {authMode === 'register' && (
            <div>
              <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Nome Completo</label>
              <input type="text" required placeholder="Ex: Helena Patrício" value={authName}
                onChange={e => setAuthName(e.target.value)}
                className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600" />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">E-mail</label>
            <input type="email" required placeholder="Ex: cliente@mail.ao" value={authEmail}
              onChange={e => setAuthEmail(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600 font-mono" />
          </div>

          {authMode === 'register' && (
            <div>
              <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Telemóvel (+244)</label>
              <input type="text" required placeholder="9XXXXXXXX" value={authPhone}
                onChange={e => setAuthPhone(e.target.value)}
                className="w-full bg-white border border-[#DDD] rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600 font-mono" />
            </div>
          )}

          <div>
            <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Palavra-Passe</label>
            <input type="password" required placeholder="Introduza a sua password..." value={authPassword}
              onChange={e => setAuthPassword(e.target.value)}
              className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600 font-mono" />
          </div>

          <button type="submit"
            className="w-full py-2.5 bg-[#171512] hover:bg-amber-600 text-white rounded-lg text-xs font-mono uppercase font-bold transition shadow-sm cursor-pointer"
            id="auth-submit-btn">
            {authMode === 'login' ? 'Iniciar Sessão' : 'Criar Conta Premium'}
          </button>

          <div className="pt-2 text-center border-t border-stone-100">
            {authMode === 'login' ? (
              <button type="button" id="switch-to-register-btn"
                onClick={() => { setAuthMode('register'); setAuthError(null); }}
                className="text-[10px] font-mono uppercase text-amber-700 font-bold hover:underline">
                Não tem conta? Registe-se agora
              </button>
            ) : (
              <button type="button" id="switch-to-login-btn"
                onClick={() => { setAuthMode('login'); setAuthError(null); }}
                className="text-[10px] font-mono uppercase text-stone-500 hover:underline">
                Já tem conta? Faça Login
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
