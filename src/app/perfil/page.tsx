'use client';

import { useState, useEffect } from 'react';
import { useStore } from '@/contexts/StoreContext';
import { DatabaseService } from '@/services/db';
import { PedidoDetalhado, Endereco } from '@/types';
import { User, Package, MapPin, Save, Plus, Edit2, Trash2 } from 'lucide-react';
import crypto from 'crypto';

export default function PerfilPage() {
  const { currentUser, navigate, fetchCurrentUser } = useStore();
  const [activeTab, setActiveTab] = useState<'perfil' | 'encomendas' | 'enderecos'>('perfil');

  // Perfil state
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Encomendas state
  const [orders, setOrders] = useState<PedidoDetalhado[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Endereços state
  const [addresses, setAddresses] = useState<Endereco[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [editingAddress, setEditingAddress] = useState<Endereco | null>(null);
  const [showAddressForm, setShowAddressForm] = useState(false);
  
  // Endereco Form
  const [provincia, setProvincia] = useState('Luanda');
  const [municipio, setMunicipio] = useState('');
  const [bairro, setBairro] = useState('');
  const [rua, setRua] = useState('');
  const [padrao, setPadrao] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/');
      return;
    }
    setNome(currentUser.nome);
    setEmail(currentUser.email);
    setTelefone(currentUser.telefone || '');
    
    // Load Orders
    DatabaseService.getOrdersForUser(currentUser.id)
      .then(data => {
        setOrders(data);
        setLoadingOrders(false);
      })
      .catch(console.error);
      
    // Load Addresses
    loadAddresses();
  }, [currentUser, navigate]);

  const loadAddresses = async () => {
    if (!currentUser) return;
    setLoadingAddresses(true);
    try {
      const data = await DatabaseService.getAddressesForUser(currentUser.id);
      setAddresses(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const updates: any = { nome, telefone, email };
      if (password) {
        updates.password_hash = crypto.createHash('sha256').update(password).digest('hex');
      }
      
      await DatabaseService.updateUserProfile(currentUser.id, updates);
      await fetchCurrentUser(); // Refresh context
      
      setMessage({ text: 'Perfil atualizado com sucesso!', type: 'success' });
      setPassword(''); // Clear password field
    } catch (error: any) {
      setMessage({ text: error.message || 'Erro ao atualizar o perfil.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setLoading(true);
    
    try {
      if (editingAddress) {
        await DatabaseService.updateAddress(editingAddress.id, {
          provincia, municipio, bairro, rua, padrao
        });
      } else {
        await DatabaseService.createAddress(currentUser.id, provincia, municipio, bairro, rua, padrao);
      }
      await loadAddresses();
      setShowAddressForm(false);
      setEditingAddress(null);
      
      // Clear form
      setMunicipio(''); setBairro(''); setRua(''); setPadrao(false);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (id: string) => {
    if (confirm('Deseja eliminar este endereço?')) {
      try {
        await DatabaseService.deleteAddress(id);
        await loadAddresses();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const openEditAddress = (addr: Endereco) => {
    setEditingAddress(addr);
    setProvincia(addr.provincia);
    setMunicipio(addr.municipio);
    setBairro(addr.bairro);
    setRua(addr.rua);
    setPadrao(addr.padrao);
    setShowAddressForm(true);
  };

  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('AOA', 'Kz');
  };

  if (!currentUser) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8 animate-in fade-in duration-300 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-serif font-black text-stone-900 tracking-wide">A Minha Conta</h1>
        <p className="text-stone-500 font-mono text-xs uppercase tracking-widest mt-2">
          Bem-vinda de volta, {currentUser.nome.split(' ')[0]}
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full md:w-64 flex-shrink-0 space-y-2">
          <button
            onClick={() => setActiveTab('perfil')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'perfil' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-100'
            }`}
          >
            <User className="w-4 h-4" />
            Detalhes do Perfil
          </button>
          <button
            onClick={() => setActiveTab('encomendas')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'encomendas' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-100'
            }`}
          >
            <Package className="w-4 h-4" />
            Minhas Encomendas
          </button>
          <button
            onClick={() => setActiveTab('enderecos')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono uppercase tracking-wider transition-all ${
              activeTab === 'enderecos' 
                ? 'bg-amber-600 text-white shadow-md' 
                : 'bg-white text-stone-600 hover:bg-stone-50 border border-stone-100'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Livro de Endereços
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-grow bg-white border border-stone-100 rounded-3xl p-6 md:p-8 shadow-sm">
          
          {/* TAB: PERFIL */}
          {activeTab === 'perfil' && (
            <div className="max-w-lg space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-serif font-bold text-stone-900 border-b border-stone-100 pb-3">
                Informações Pessoais
              </h2>
              
              {message.text && (
                <div className={`p-3 text-xs rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
                  {message.text}
                </div>
              )}

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-600 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-600 transition"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-600 transition font-mono"
                  />
                </div>
                <div className="pt-4 border-t border-stone-100">
                  <h3 className="text-sm font-serif font-bold text-stone-900 mb-3">Segurança</h3>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Nova Palavra-passe (Opcional)</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Deixe em branco para manter a atual"
                    className="w-full bg-stone-50 border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-600 transition"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-[#1D1B18] hover:bg-amber-600 text-white px-6 py-3 rounded-full text-xs font-mono uppercase tracking-widest font-bold transition disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {loading ? 'A Guardar...' : 'Guardar Alterações'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB: ENCOMENDAS */}
          {activeTab === 'encomendas' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <h2 className="text-xl font-serif font-bold text-stone-900 border-b border-stone-100 pb-3">
                Histórico de Encomendas
              </h2>

              {loadingOrders ? (
                <div className="text-center py-10 text-stone-400 text-xs font-mono">A carregar encomendas...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-16 bg-stone-50 rounded-2xl border border-dashed border-stone-200">
                  <Package className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                  <p className="text-stone-500 font-serif">Ainda não efetuou nenhuma encomenda.</p>
                  <button onClick={() => navigate('/')} className="mt-4 text-xs font-mono uppercase text-amber-600 hover:text-amber-700 font-bold tracking-widest border-b border-amber-600">
                    Começar a Comprar
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map(order => (
                    <div key={order.id} className="border border-stone-100 rounded-xl p-5 hover:border-amber-200 transition">
                      <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                        <div>
                          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Nº da Encomenda</span>
                          <span className="font-mono font-bold text-stone-900 text-sm">#{order.id.split('-')[0]}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Data</span>
                          <span className="font-sans text-stone-700 text-sm">{new Date(order.criado_em!).toLocaleDateString('pt-AO')}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Total</span>
                          <span className="font-mono font-bold text-amber-600 text-sm">{formatKz(order.total)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] font-mono text-stone-400 uppercase tracking-widest block">Estado</span>
                          <span className={`inline-block mt-0.5 px-2 py-1 rounded text-[10px] font-mono uppercase font-bold ${
                            order.status === 'pendente' ? 'bg-amber-100 text-amber-800' :
                            order.status === 'pago' ? 'bg-emerald-100 text-emerald-800' :
                            order.status === 'enviado' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'entregue' ? 'bg-stone-800 text-white' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {order.status}
                          </span>
                        </div>
                      </div>
                      <div className="bg-stone-50 rounded-lg p-3 text-xs space-y-1">
                        <p className="font-mono text-[10px] text-stone-400 uppercase tracking-wider mb-1">Itens Adquiridos:</p>
                        {order.itens.map(item => (
                          <div key={item.id} className="flex justify-between font-serif text-stone-600">
                            <span>{item.quantidade}x Produto Variante ID: {item.id_variante?.split('-')[0] || item.id}</span>
                            <span className="font-mono">{formatKz(item.preco_unitario * item.quantidade)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: ENDEREÇOS */}
          {activeTab === 'enderecos' && (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
              <div className="flex justify-between items-center border-b border-stone-100 pb-3">
                <h2 className="text-xl font-serif font-bold text-stone-900">
                  Os Meus Endereços
                </h2>
                {!showAddressForm && (
                  <button 
                    onClick={() => {
                      setEditingAddress(null);
                      setProvincia('Luanda'); setMunicipio(''); setBairro(''); setRua(''); setPadrao(false);
                      setShowAddressForm(true);
                    }}
                    className="flex items-center gap-1 text-[10px] font-mono uppercase tracking-widest text-amber-600 hover:text-amber-700 font-bold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar
                  </button>
                )}
              </div>

              {showAddressForm ? (
                <form onSubmit={handleSaveAddress} className="bg-stone-50 p-5 rounded-xl border border-stone-100 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Província</label>
                      <select
                        value={provincia}
                        onChange={e => setProvincia(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-600"
                      >
                        {['Luanda', 'Benguela', 'Huíla', 'Cabinda', 'Cuanza Sul'].map(p => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Município</label>
                      <input
                        type="text"
                        value={municipio}
                        onChange={e => setMunicipio(e.target.value)}
                        className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-600"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Bairro / Zona</label>
                    <input
                      type="text"
                      value={bairro}
                      onChange={e => setBairro(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Rua, Edifício, Detalhes</label>
                    <textarea
                      value={rua}
                      onChange={e => setRua(e.target.value)}
                      rows={2}
                      className="w-full bg-white border border-stone-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-amber-600"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-2">
                    <input
                      type="checkbox"
                      id="padrao"
                      checked={padrao}
                      onChange={e => setPadrao(e.target.checked)}
                      className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded border-stone-300"
                    />
                    <label htmlFor="padrao" className="text-xs text-stone-600">Definir como endereço principal</label>
                  </div>
                  <div className="flex gap-3 pt-3">
                    <button type="submit" disabled={loading} className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-mono uppercase tracking-widest font-bold transition">
                      {loading ? 'A Guardar...' : 'Guardar'}
                    </button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-5 py-2.5 bg-white border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-lg text-xs font-mono uppercase tracking-widest transition">
                      Cancelar
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {loadingAddresses ? (
                    <div className="col-span-2 text-center py-8 text-stone-400 text-xs font-mono">A carregar endereços...</div>
                  ) : addresses.length === 0 ? (
                    <div className="col-span-2 text-center py-8 text-stone-400 text-xs font-mono">Nenhum endereço guardado.</div>
                  ) : (
                    addresses.map(addr => (
                      <div key={addr.id} className={`p-4 border rounded-xl relative ${addr.padrao ? 'border-amber-300 bg-amber-50/20' : 'border-stone-200 bg-white'}`}>
                        {addr.padrao && <span className="absolute top-4 right-4 text-[9px] font-mono bg-amber-100 text-amber-800 px-2 py-0.5 rounded uppercase font-bold">Principal</span>}
                        <div className="text-sm font-serif text-stone-800 space-y-1 mb-4 pr-16">
                          <p><span className="font-bold">{addr.rua}</span></p>
                          <p>{addr.bairro}</p>
                          <p>{addr.municipio}, {addr.provincia}</p>
                        </div>
                        <div className="flex gap-2 border-t border-stone-100 pt-3">
                          <button onClick={() => openEditAddress(addr)} className="text-[10px] font-mono uppercase text-stone-500 hover:text-amber-600 flex items-center gap-1">
                            <Edit2 className="w-3 h-3" /> Editar
                          </button>
                          <button onClick={() => handleDeleteAddress(addr.id)} className="text-[10px] font-mono uppercase text-stone-500 hover:text-red-600 flex items-center gap-1">
                            <Trash2 className="w-3 h-3" /> Eliminar
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
