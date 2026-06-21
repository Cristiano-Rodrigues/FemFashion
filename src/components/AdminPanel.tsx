'use client';

import { useState, useEffect, FormEvent } from 'react';
import { 
  BarChart, Layers, Tag, Box, DollarSign, 
  Plus, Edit, Trash2, CheckCircle, XCircle, 
  Users, RefreshCw, ShoppingCart, TrendingUp,
  AlertOctagon, Check, ToggleLeft, ToggleRight
} from 'lucide-react';
import { Categoria, ProdutoDetalhado, PedidoDetalhado, Usuario, VarianteProduto } from '@/types';
import { DatabaseService } from '@/services/db';

interface AdminPanelProps {
  currentUser: Usuario | null;
  onNavigateHome: () => void;
}

export default function AdminPanel({ currentUser, onNavigateHome }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'categories' | 'stock' | 'orders' | 'users'>('dashboard');

  // Unified application state loaded from DatabaseService
  const [products, setProducts] = useState<ProdutoDetalhado[]>([]);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [orders, setOrders] = useState<PedidoDetalhado[]>([]);
  const [users, setUsers] = useState<Usuario[]>([]);

  // Loading States
  const [isLoading, setIsLoading] = useState(true);

  // Forms states
  const [editingCategory, setEditingCategory] = useState<Categoria | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catImg, setCatImg] = useState('');
  
  const [editingProduct, setEditingProduct] = useState<ProdutoDetalhado | null>(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [prodName, setProdName] = useState('');
  const [prodCat, setProdCat] = useState('');
  const [prodDesc, setProdDesc] = useState('');
  const [prodBasePrice, setProdBasePrice] = useState(0);
  const [prodImgUrls, setProdImgUrls] = useState<string[]>(['']);
  const [prodVariants, setProdVariants] = useState<{ designativo: string; tamanho: string; cor: string; preco: number; quantidade_stock: number }[]>([
    { designativo: '', tamanho: '', cor: '', preco: 0, quantidade_stock: 0 }
  ]);

  useEffect(() => {
    loadAllData();
  }, [activeTab]);

  const loadAllData = async () => {
    setIsLoading(true);
    try {
      const [allProds, allCats, allOrders, allUsers] = await Promise.all([
        DatabaseService.getProductsDetalhados(),
        DatabaseService.getCategories(),
        DatabaseService.getOrders(),
        DatabaseService.getUsers()
      ]);
      setProducts(allProds);
      setCategories(allCats);
      setOrders(allOrders);
      setUsers(allUsers);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const formatKz = (value: number) => {
    return new Intl.NumberFormat('pt-AO', {
      style: 'currency',
      currency: 'AOA',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value).replace('AOA', 'Kz');
  };

  // CHECK ACCESS PROTECTION
  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[80vh] font-sans bg-stone-50">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertOctagon className="w-8 h-8 text-red-600 animate-bounce" />
        </div>
        <h2 className="text-xl font-serif font-black text-stone-900 tracking-wide uppercase">Acesso Restrito / Proibido</h2>
        <p className="text-sm text-stone-500 max-w-md mt-2 leading-relaxed">
          O seu nível de acesso não permite gerir o Backoffice femfashion. Por favor, inicie sessão como administrador para gerir recursos.
        </p>
        <button 
          onClick={onNavigateHome}
          className="mt-6 px-6 py-2.5 bg-[#171512] text-white rounded-full text-xs font-mono tracking-widest uppercase transition"
        >
          Ir para a Vitrine Pública
        </button>
      </div>
    );
  }

  // ==========================================
  // 1. DASHBOARD SUB-PAGE VIEW
  // ==========================================

  const renderDashboard = () => {
    // Analytics calculations
    const approvedOrders = orders.filter(o => o.status === 'pago' || o.status === 'processando' || o.status === 'enviado' || o.status === 'entregue');
    const totalFaturado = approvedOrders.reduce((sum, o) => sum + o.total, 0);
    const totalPedidos = orders.length;

    // Grab low-stock variants across all products
    const lowStockVariants: { prodName: string; vName: string; stock: number; vId: string }[] = [];
    products.forEach(p => {
      p.variantes.forEach(v => {
        if (v.quantidade_stock <= 3) {
          lowStockVariants.push({
            prodName: p.nome,
            vName: v.designativo || `${v.tamanho || 'único'} - ${v.cor || 'único'}`,
            stock: v.quantidade_stock,
            vId: v.id
          });
        }
      });
    });

    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Faturado */}
          <div className="bg-white border border-stone-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-amber-700 font-bold" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-stone-400 tracking-wider">Total Faturado</p>
              <h4 className="text-xl font-serif font-black text-stone-900 leading-none mt-1 font-mono">{formatKz(totalFaturado)}</h4>
            </div>
          </div>

          {/* Pedidos */}
          <div className="bg-white border border-stone-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-blue-700" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-stone-400 tracking-wider">Encomendas Totais</p>
              <h4 className="text-xl font-serif font-black text-stone-900 leading-none mt-1 font-mono">{totalPedidos}</h4>
            </div>
          </div>

          {/* Low stock alerts */}
          <div className="bg-white border border-stone-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertOctagon className="w-6 h-6 text-red-700" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-stone-400 tracking-wider">Alertas Curtas</p>
              <h4 className="text-xl font-serif font-black text-stone-900 leading-none mt-1 font-mono">{lowStockVariants.length} var.</h4>
            </div>
          </div>

          {/* Clientes */}
          <div className="bg-white border border-stone-100 p-5 rounded-2xl flex items-center gap-4 shadow-sm">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-700" />
            </div>
            <div>
              <p className="text-[10px] font-mono uppercase text-stone-400 tracking-wider">Clientes Registados</p>
              <h4 className="text-xl font-serif font-black text-stone-900 leading-none mt-1 font-mono">{users.length} utiliz.</h4>
            </div>
          </div>
        </div>

        {/* Low Stock Warning Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-stone-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-widest">Resumo de Atividade & Métodos</h3>
              </div>
            </div>

            <div className="space-y-4 py-2">
              <p className="text-xs text-stone-500 leading-relaxed font-light">
                As vendas estimadas por pagamento em Angola dividem-se nos seguintes canais:
              </p>

              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-stone-50 border border-stone-100 rounded-xl">
                  <span className="text-[10px] uppercase tracking-wider font-mono text-blue-700 font-bold block">Multicaixa Express</span>
                  <span className="text-lg font-serif font-black text-stone-900 leading-none block mt-1">
                    {orders.filter(o => o.metodo_pagamento === 'MCX_EXPRESS').length} Encomendas
                  </span>
                  <span className="text-xs text-stone-400 font-mono">
                    {formatKz(orders.filter(o => o.metodo_pagamento === 'MCX_EXPRESS').reduce((sum, o) => sum + o.total, 0))} faturado
                  </span>
                </div>
              </div>

              {/* Progress bars indicator */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[10px] font-mono text-stone-500 uppercase">
                  <span>Taxa de Conversão Conversões Mobile</span>
                  <span>94%</span>
                </div>
                <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[94%]" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-stone-100 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-1.5 border-b border-stone-100 pb-3">
              <AlertOctagon className="w-5 h-5 text-red-500" />
              <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-widest">Alertas de Stock Baixo</h3>
            </div>

            <div className="overflow-y-auto max-h-[300px] divide-y divide-stone-100 pr-1">
              {lowStockVariants.length === 0 ? (
                <p className="text-xs text-stone-400 py-6 text-center">Nenhum produto em rutura de stock no momento. Ótimo trabalho!</p>
              ) : (
                lowStockVariants.map((item, idx) => (
                  <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-serif font-bold text-stone-900 max-w-[170px] truncate">{item.prodName}</p>
                      <p className="text-[10px] font-mono text-stone-400">{item.vName}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                      item.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {item.stock === 0 ? 'Esgotado' : `${item.stock} uni`}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // 2. CATEGORIES MANAGEMENT SUB-PAGE
  // ==========================================

  const handleSaveCategory = async (e: FormEvent) => {
    e.preventDefault();
    if (!catName) return;

    const slug = catName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    if (editingCategory) {
      await DatabaseService.updateCategory(editingCategory.id, catName, slug, catDesc, catImg);
    } else {
      await DatabaseService.createCategory(catName, slug, catDesc, catImg);
    }

    setEditingCategory(null);
    setCatName('');
    setCatDesc('');
    setCatImg('');
    loadAllData();
  };

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Tem a certeza que deseja eliminar esta categoria?')) {
      await DatabaseService.deleteCategory(id);
      loadAllData();
    }
  };

  const renderCategories = () => {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
        {/* Form Creation Sidebar */}
        <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-widest border-b border-stone-50 pb-2">
            {editingCategory ? 'Editar Categoria' : 'Criar Categoria'}
          </h3>
          <form onSubmit={handleSaveCategory} className="space-y-4">
            <div>
              <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Nome da Categoria</label>
              <input
                type="text"
                value={catName}
                onChange={(e) => setCatName(e.target.value)}
                placeholder="Ex: Extensões Lisas, Sapatos"
                className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Descrição</label>
              <textarea
                value={catDesc}
                onChange={(e) => setCatDesc(e.target.value)}
                placeholder="Introduza uma descrição concisa do catálogo..."
                rows={3}
                className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600"
              />
            </div>
            <div>
              <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">URL da Imagem</label>
              <input
                type="text"
                value={catImg}
                onChange={(e) => setCatImg(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600 font-mono"
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-grow py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-mono uppercase font-bold text-center transition"
              >
                {editingCategory ? 'Salvar Edição' : 'Adicionar Categoria'}
              </button>
              {editingCategory && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingCategory(null);
                    setCatName('');
                    setCatDesc('');
                    setCatImg('');
                  }}
                  className="px-3 py-2 border border-stone-200 text-stone-600 hover:bg-stone-50 rounded-lg text-xs font-mono uppercase"
                >
                  Cancelar
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List of active categories */}
        <div className="lg:col-span-2 bg-white border border-stone-100 rounded-2xl p-5 shadow-sm space-y-4">
          <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-widest border-b border-stone-50 pb-2">
            Categorias em Operação
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-stone-600 divide-y divide-stone-100">
              <thead>
                <tr className="text-[10px] font-mono uppercase text-stone-400">
                  <th className="py-2.5 px-3">Nome</th>
                  <th className="py-2.5 px-3">Imagem</th>
                  <th className="py-2.5 px-3">Slug</th>
                  <th className="py-2.5 px-3">Descrição</th>
                  <th className="py-2.5 px-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50 font-serif">
                {categories.map(cat => (
                  <tr key={cat.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-3 font-bold text-stone-900">{cat.nome}</td>
                    <td className="py-3 px-3">
                      {cat.imagem_url ? (
                        <img src={cat.imagem_url} alt={cat.nome} className="w-8 h-8 object-cover rounded" />
                      ) : (
                        <span className="text-stone-300">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-500">{cat.slug}</td>
                    <td className="py-3 px-3 italic truncate max-w-[200px] text-stone-400 font-light">{cat.descricao || '-'}</td>
                    <td className="py-3 px-3 text-right flex justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setEditingCategory(cat);
                          setCatName(cat.nome);
                          setCatDesc(cat.descricao || '');
                          setCatImg(cat.imagem_url || '');
                        }}
                        className="p-1 px-2 border border-stone-100 text-stone-600 hover:bg-stone-200 rounded"
                        title="Editar"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-1 px-2 border border-stone-100 text-red-600 hover:bg-red-50 rounded"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  // ==========================================
  // 3. PRODUCTS AND VARIANTS GESTION SUB-PAGE
  // ==========================================

  const handleOpenProductCreate = () => {
    setEditingProduct(null);
    setProdName('');
    setProdCat(categories[0]?.id || '');
    setProdDesc('');
    setProdBasePrice(0);
    setProdImgUrls(['']);
    setProdVariants([{ designativo: '', tamanho: '', cor: '', preco: 0, quantidade_stock: 0 }]);
    setIsProductModalOpen(true);
  };

  const handleOpenProductEdit = (p: ProdutoDetalhado) => {
    setEditingProduct(p);
    setProdName(p.nome);
    setProdCat(p.id_categoria);
    setProdDesc(p.descricao);
    setProdBasePrice(p.preco);
    setProdImgUrls(p.imagens.length > 0 ? p.imagens.map(img => img.url) : ['']);
    setProdVariants(p.variantes.map(v => ({
      designativo: v.designativo || '',
      tamanho: v.tamanho || '',
      cor: v.cor || '',
      preco: v.preco,
      quantidade_stock: v.quantidade_stock
    })));
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    if (!prodName || !prodCat) return;

    const formattedImgs = prodImgUrls.filter(url => !!url).map((url, i) => ({ url, ranking: i + 1 }));
    const formattedVars = prodVariants.map(v => ({
      ...v,
      preco: Number(v.preco) || Number(prodBasePrice),
      quantidade_stock: Number(v.quantidade_stock) || 0
    }));

    if (editingProduct) {
      await DatabaseService.updateProduct(
        editingProduct.id,
        prodCat,
        prodName,
        prodDesc,
        prodBasePrice,
        editingProduct.ativo,
        formattedImgs,
        formattedVars
      );
    } else {
      await DatabaseService.createProduct(
        prodCat,
        prodName,
        prodDesc,
        prodBasePrice,
        formattedImgs,
        formattedVars
      );
    }

    setIsProductModalOpen(false);
    loadAllData();
  };

  const handleToggleProductStatus = async (p: ProdutoDetalhado) => {
    const isNowActive = !p.ativo;
    await DatabaseService.updateProduct(
      p.id,
      p.id_categoria,
      p.nome,
      p.descricao,
      p.preco,
      isNowActive,
      p.imagens.map(img => ({ url: img.url, ranking: img.ranking })),
      p.variantes.map(v => ({
        designativo: v.designativo || '',
        tamanho: v.tamanho || '',
        cor: v.cor || '',
        preco: v.preco,
        quantidade_stock: v.quantidade_stock
      }))
    );
    loadAllData();
  };

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Deseja eliminar este produto definitivamente com todas as variantes vinculadas?')) {
      await DatabaseService.deleteProduct(id);
      loadAllData();
    }
  };

  const renderProducts = () => {
    return (
      <div className="space-y-4 animate-in fade-in duration-200">
        <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-stone-100 shadow-sm">
          <p className="text-xs text-stone-500 font-serif">Gestão de {products.length} itens expostos na plataforma feminina.</p>
          <button
            onClick={handleOpenProductCreate}
            className="px-4 py-2 bg-stone-950 hover:bg-amber-600 text-white rounded-lg text-xs font-mono uppercase font-bold flex items-center gap-1.5 transition"
            id="admin-add-product-btn"
          >
            <Plus className="w-3.5 h-3.5" />
            Adicionar Novo Produto
          </button>
        </div>

        {/* Product Table */}
        <div className="bg-white border border-stone-100 rounded-2xl shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600 divide-y divide-stone-100">
            <thead>
              <tr className="text-[10px] font-mono uppercase text-stone-400">
                <th className="py-2.5 px-3">Vitrine</th>
                <th className="py-2.5 px-3">Nome do Produto</th>
                <th className="py-2.5 px-3">Categoria</th>
                <th className="py-2.5 px-3">Preço Base</th>
                <th className="py-2.5 px-3">Variantes</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 font-serif">
              {products.map(p => {
                const img = p.imagens[0]?.url || 'https://images.unsplash.com/photo-1620331713537-bca9da369e80?auto=format&fit=crop&q=80&w=60';
                return (
                  <tr key={p.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-3">
                      <img src={img} alt={p.nome} className="w-10 h-10 object-cover rounded-lg border border-stone-100 bg-stone-50" referrerPolicy="no-referrer" />
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-stone-900 group-hover:text-amber-700">{p.nome}</p>
                      <p className="text-[10px] font-mono text-stone-400 max-w-xs truncate">{p.slug}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="bg-stone-100 text-stone-700 font-mono text-[10px] px-2 py-0.5 rounded-full uppercase">
                        {p.categoria?.nome.split(' & ')[0] || 'Geral'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-stone-900 font-mono">{formatKz(p.preco)}</td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-[10px] font-semibold text-stone-500">
                        {p.variantes.length} ops
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <button 
                        onClick={() => handleToggleProductStatus(p)}
                        className="focus:outline-none"
                        title={p.ativo ? "Ver ativo na vitrina" : "Item desativado"}
                      >
                        {p.ativo ? (
                          <span className="flex items-center gap-1 text-emerald-700 font-semibold text-[10px] bg-emerald-50 px-2 py-0.5 rounded-full uppercase font-mono">
                            <CheckCircle className="w-3 h-3 text-emerald-600 fill-white" />
                            Ativo
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-stone-600 text-[10px] bg-stone-100 px-2 py-0.5 rounded-full uppercase font-mono">
                            <XCircle className="w-3 h-3 text-stone-400" />
                            Pausa
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenProductEdit(p)}
                          className="p-1 px-2 border border-stone-100 text-stone-600 hover:bg-stone-200 rounded"
                          title="Editar"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-1 px-2 border border-stone-100 text-red-600 hover:bg-red-50 rounded"
                          title="Eliminar"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* MODAL / BOTTOM DRAWER FOR PRODUCT EDIT/CREATE */}
        {isProductModalOpen && (
          <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150">
              
              <div className="px-6 py-4 bg-stone-50 border-b border-stone-100 flex justify-between items-center">
                <h4 className="font-serif font-black text-stone-950 uppercase tracking-widest text-sm">
                  {editingProduct ? `Editar Produto: ${editingProduct.nome}` : 'Adicionar Produto'}
                </h4>
                <button onClick={() => setIsProductModalOpen(false)} className="text-stone-400 hover:text-stone-900 p-1">
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="flex-grow overflow-y-auto px-6 py-5 space-y-5">
                
                {/* Basic data row */}
                <div className="grid grid-cols-2 gap-3 font-serif">
                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Nome</label>
                    <input
                      type="text"
                      value={prodName}
                      onChange={(e) => setProdName(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Categoria</label>
                    <select
                      value={prodCat}
                      onChange={(e) => setProdCat(e.target.value)}
                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600 font-mono"
                      required
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.nome}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Preço Base de Vitrine (Kz)</label>
                    <input
                      type="number"
                      value={prodBasePrice}
                      onChange={(e) => setProdBasePrice(Number(e.target.value))}
                      className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600 font-mono"
                      required
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[10px] font-mono text-stone-400 uppercase tracking-wider mb-1">Descrição Detalhada</label>
                  <textarea
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600"
                    required
                  />
                </div>

                {/* Images Array */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase font-bold">Imagens do Produto (URLs)</span>
                    <button
                      type="button"
                      onClick={() => setProdImgUrls([...prodImgUrls, ''])}
                      className="text-amber-700 text-[10px] font-mono uppercase bg-amber-50 px-2 py-0.5 rounded cursor-pointer"
                    >
                      + URL Imagem
                    </button>
                  </div>
                  <div className="space-y-1.5 max-h-[140px] overflow-y-auto">
                    {prodImgUrls.map((url, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="https://images.unsplash.com/..."
                          value={url}
                          onChange={(e) => {
                            const newUrls = [...prodImgUrls];
                            newUrls[i] = e.target.value;
                            setProdImgUrls(newUrls);
                          }}
                          className="flex-grow bg-white border border-stone-200 rounded-lg p-2 text-xs focus:outline-none focus:border-amber-600 font-mono"
                        />
                        {prodImgUrls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setProdImgUrls(prodImgUrls.filter((_, idx) => idx !== i))}
                            className="p-1 px-2 bg-red-50 text-red-650 hover:bg-red-150 rounded text-xs shrink-0"
                          >
                            Remover
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Variants Granular Config */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center border-b border-stone-100 pb-1">
                    <span className="text-[10px] font-mono text-stone-500 uppercase font-bold">Configuração das Variantes</span>
                    <button
                      type="button"
                      onClick={() => setProdVariants([...prodVariants, { designativo: '', tamanho: '', cor: '', preco: Number(prodBasePrice), quantidade_stock: 5 }])}
                      className="text-[#151210] text-[10px] font-mono uppercase bg-stone-100 px-2 py-0.5 rounded cursor-pointer"
                    >
                      + Nova Variante
                    </button>
                  </div>

                  <div className="space-y-3 max-h-[220px] overflow-y-auto">
                    {prodVariants.map((v, i) => (
                      <div key={i} className="grid grid-cols-5 gap-2 items-end p-2.5 bg-stone-50 border border-stone-100 rounded-xl relative group">
                        <div className="col-span-2">
                          <label className="block text-[8px] font-mono text-stone-400 uppercase mb-0.5">Designação / Nome</label>
                          <input
                            type="text"
                            placeholder="HD Lace 28 polegadas, Corte S"
                            value={v.designativo}
                            onChange={(e) => {
                              const newV = [...prodVariants];
                              newV[i].designativo = e.target.value;
                              setProdVariants(newV);
                            }}
                            className="w-full bg-white border border-stone-200 rounded-lg p-1.5 text-[10px] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-mono text-stone-400 uppercase mb-0.5">Tamanho / Desc</label>
                          <input
                            type="text"
                            placeholder="M, L, 30 polegadas, 5cm"
                            value={v.tamanho}
                            onChange={(e) => {
                              const newV = [...prodVariants];
                              newV[i].tamanho = e.target.value;
                              setProdVariants(newV);
                            }}
                            className="w-full bg-white border border-stone-200 rounded-lg p-1.5 text-[10px] focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-mono text-stone-400 uppercase mb-0.5">Preço (Kz)</label>
                          <input
                            type="number"
                            value={v.preco}
                            onChange={(e) => {
                              const newV = [...prodVariants];
                              newV[i].preco = Number(e.target.value);
                              setProdVariants(newV);
                            }}
                            className="w-full bg-white border border-stone-200 rounded-lg p-1.5 text-[10px] focus:outline-none font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[8px] font-mono text-stone-400 uppercase mb-0.5">Qtd. Stock</label>
                          <input
                            type="number"
                            value={v.quantidade_stock}
                            onChange={(e) => {
                              const newV = [...prodVariants];
                              newV[i].quantidade_stock = Number(e.target.value);
                              setProdVariants(newV);
                            }}
                            className="w-full bg-white border border-stone-200 rounded-lg p-1.5 text-[10px] focus:outline-none font-mono"
                          />
                        </div>

                        {prodVariants.length > 1 && (
                          <button
                            type="button"
                            onClick={() => setProdVariants(prodVariants.filter((_, idx) => idx !== i))}
                            className="absolute -top-1.5 -right-1.5 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                            title="Excluir variante"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-stone-100 pt-4 flex gap-3">
                  <button
                    type="submit"
                    className="flex-grow py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-mono uppercase font-bold transition shadow-sm cursor-pointer"
                  >
                    Salvar Registo Completo
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsProductModalOpen(false)}
                    className="px-5 py-2.5 border border-stone-300 text-stone-600 hover:bg-stone-50 rounded-lg text-xs font-mono uppercase"
                  >
                    Cancelar
                  </button>
                </div>

              </form>

            </div>
          </div>
        )}

      </div>
    );
  };

  // ==========================================
  // 4. STOCK LEVELS DIRECT GESTION SUB-PAGE
  // ==========================================

  const handleUpdateStockQuick = async (variantId: string, value: number) => {
    if (value < 0) return;
    const ok = await DatabaseService.updateVariantStockDirect(variantId, value);
    if (ok) {
      // Just visually update rather than reloading all
      setProducts(prev => {
        return prev.map(p => {
          const vIdx = p.variantes.findIndex(v => v.id === variantId);
          if (vIdx !== -1) {
            const updatedVariants = [...p.variantes];
            updatedVariants[vIdx] = { ...updatedVariants[vIdx], quantidade_stock: value };
            return { ...p, variantes: updatedVariants };
          }
          return p;
        });
      });
    }
  };

  const renderStock = () => {
    return (
      <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
        <div className="flex justify-between items-center border-b border-stone-50 pb-2">
          <div>
            <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-widest">Controlo Granular do Inventário</h3>
            <p className="text-[11px] text-stone-400 mt-0.5 font-light">Edite diretamente a quantidade de stock das variantes sem precisar de abrir o produto.</p>
          </div>
          <button 
            onClick={loadAllData} 
            className="p-1.5 border border-stone-200 hover:border-amber-600 hover:text-amber-600 rounded-lg text-xs flex items-center gap-1 font-mono uppercase shrink-0 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sincronizar
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600 divide-y divide-stone-100">
            <thead>
              <tr className="text-[10px] font-mono uppercase text-stone-400">
                <th className="py-2.5 px-3">Nome do Produto</th>
                <th className="py-2.5 px-3">Variante / Designativo</th>
                <th className="py-2.5 px-3">Tamanho</th>
                <th className="py-2.5 px-3">Preço Unitário</th>
                <th className="py-2.5 px-3 text-center">Quantidade Stock Ativo</th>
                <th className="py-2.5 px-3 text-right">Alterar Rápido</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 font-serif">
              {products.flatMap(p => 
                p.variantes.map(v => (
                  <tr key={v.id} className="hover:bg-amber-500/5 hover:bg-stone-50/50">
                    <td className="py-3 px-3 font-semibold text-stone-800">{p.nome}</td>
                    <td className="py-3 px-3">
                      <span className="bg-amber-100/75 text-amber-900 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-mono">
                        {v.designativo || 'Única'}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-500 text-[11px]">{v.tamanho || 'único'}</td>
                    <td className="py-3 px-3 font-mono text-stone-800 font-bold">{formatKz(v.preco)}</td>
                    <td className="py-3 px-3 text-center">
                      <span className={`px-2.5 py-1 rounded font-mono font-bold text-xs ${
                        v.quantidade_stock === 0 
                          ? 'bg-red-100 text-red-700 animate-pulse' 
                          : v.quantidade_stock <= 3 
                            ? 'bg-amber-100 text-amber-700 font-semibold' 
                            : 'bg-emerald-50 text-emerald-800'
                      }`}>
                        {v.quantidade_stock === 0 ? 'SEM STOCK' : `${v.quantidade_stock} unidades`}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right flex justify-end gap-1 font-mono">
                      <button
                        onClick={() => handleUpdateStockQuick(v.id, v.quantidade_stock - 1)}
                        className="w-7 h-7 bg-stone-100 hover:bg-stone-200 rounded text-stone-700 font-bold text-xs"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleUpdateStockQuick(v.id, v.quantidade_stock + 1)}
                        className="w-7 h-7 bg-[#171512] hover:bg-amber-600 hover:text-white text-white rounded font-bold text-xs"
                      >
                        +
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ==========================================
  // 5. ORDERS TRACKING AND STATUS TRANSITION
  // ==========================================

  const handleUpdateOrderStatus = async (orderId: string, status: any) => {
    const ok = await DatabaseService.updateOrderStatus(orderId, status);
    if (ok) {
      setOrders(prev => {
        return prev.map(o => {
          if (o.id === orderId) {
            return { ...o, status };
          }
          return o;
        });
      });
    }
  };

  const renderOrders = () => {
    return (
      <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
        <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-widest border-b border-stone-50 pb-2">
          Tracking Geral de Encomendas
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600 divide-y divide-stone-100">
            <thead>
              <tr className="text-[10px] font-mono uppercase text-stone-400">
                <th className="py-2.5 px-3">Pedido ID</th>
                <th className="py-2.5 px-3">Cliente</th>
                <th className="py-2.5 px-3">Data Registo</th>
                <th className="py-2.5 px-3">Itens Comprados</th>
                <th className="py-2.5 px-3">Total Cobrado</th>
                <th className="py-2.5 px-3">Canal Pagamento</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Alterar Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 font-serif">
              {orders.map(o => {
                const date = new Date(o.criado_em).toLocaleDateString('pt-AO', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric'
                });
                return (
                  <tr key={o.id} className="hover:bg-stone-50/50">
                    <td className="py-3 px-3 font-mono font-bold text-amber-700">#{o.id.substring(0, 8)}</td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-stone-900">{o.usuario?.nome || 'Helena P.'}</p>
                      <p className="text-[10px] font-mono text-stone-400 text-[10px]">{o.usuario?.email || 'cliente@mail.ao'}</p>
                    </td>
                    <td className="py-3 px-3 font-mono text-[11px] text-stone-500">{date}</td>
                    <td className="py-3 px-3">
                      <div className="text-[11px] text-stone-700 space-y-0.5">
                        {o.itens?.map((it, idx) => (
                          <p key={idx} className="truncate max-w-[190px]">
                            • {it.nome_produto} <span className="font-mono text-stone-400">x{it.quantidade}</span>
                          </p>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-900 font-bold">{formatKz(o.total)}</td>
                    <td className="py-3 px-3 font-mono text-[10px] text-stone-400 font-bold uppercase">
                      {o.metodo_pagamento === 'MCX_EXPRESS' ? 'Multicaixa Express' : 'Unitel Money'}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        o.status === 'pendente' ? 'bg-amber-100 text-amber-800' :
                        o.status === 'pago' ? 'bg-blue-100 text-blue-800' :
                        o.status === 'processando' ? 'bg-indigo-100 text-indigo-800' :
                        o.status === 'enviado' ? 'bg-purple-100 text-purple-800' :
                        o.status === 'entregue' ? 'bg-emerald-150 bg-emerald-100 text-emerald-800' :
                        'bg-stone-100 text-stone-600'
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <select
                        value={o.status}
                        onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                        className="bg-white border border-stone-200 rounded p-1 text-[11px] font-mono focus:outline-none"
                      >
                        <option value="pendente">Pendente</option>
                        <option value="pago">Pago</option>
                        <option value="processando">Processando</option>
                        <option value="enviado">Enviado</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ==========================================
  // 6. USERS PROMOTIONS MANAGER SUB-PAGE
  // ==========================================

  const handleToggleUserRole = async (u: Usuario) => {
    const targetRole = u.role === 'admin' ? 'cliente' : 'admin';
    const ok = await DatabaseService.updateUserRole(u.id, targetRole);
    if (ok) {
      setUsers(prev => {
        return prev.map(usr => {
          if (usr.id === u.id) {
            return { ...usr, role: targetRole };
          }
          return usr;
        });
      });
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Tem a certeza que deseja eliminar este utilizador?')) {
      const ok = await DatabaseService.deleteUser(userId);
      if (ok) {
        setUsers(prev => prev.filter(u => u.id !== userId));
      }
    }
  };

  const renderUsers = () => {
    return (
      <div className="bg-white border border-stone-100 rounded-2xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
        <h3 className="text-xs font-serif font-bold text-stone-900 uppercase tracking-widest border-b border-stone-50 pb-2">
          Gestão de Utilizadores & Permissões
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-600 divide-y divide-stone-100">
            <thead>
              <tr className="text-[10px] font-mono uppercase text-stone-400">
                <th className="py-2.5 px-3">Nome</th>
                <th className="py-1 px-3">E-mail</th>
                <th className="py-1 px-3">Telefone</th>
                <th className="py-1 px-3">Role / Autorização</th>
                <th className="py-1 px-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50 font-serif">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-stone-50/50">
                  <td className="py-3 px-3 font-bold text-stone-900">{u.nome}</td>
                  <td className="py-3 px-3 font-mono text-stone-500">{u.email}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-stone-400">{u.telefone || '-'}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-mono font-bold ${
                      u.role === 'admin' 
                        ? 'bg-amber-100 text-amber-800 border border-amber-200' 
                        : 'bg-stone-100 text-stone-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right flex justify-end gap-2">
                    <button
                      onClick={() => handleToggleUserRole(u)}
                      className={`flex items-center gap-1.5 px-3 py-1 border rounded-full text-[10px] font-mono uppercase cursor-pointer transition ${
                        u.role === 'admin'
                          ? 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100'
                          : 'border-amber-200 text-amber-800 bg-amber-50 hover:bg-amber-100'
                      }`}
                      id={`toggle-role-${u.id}-btn`}
                    >
                      {u.role === 'admin' ? 'Despromover' : 'Promover a Admin'}
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.id)}
                      className="p-1 px-2 border border-stone-100 text-red-600 hover:bg-red-50 rounded"
                      title="Eliminar Utilizador"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };


  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-serif" id="admin-backoffice-main-stage">
      <div className="flex flex-col md:flex-row gap-6">
        
        {/* Navigation Admin Controls Sidebar */}
        <div className="w-full md:w-64 bg-white border border-stone-100 rounded-2xl p-4 shrink-0 shadow-sm space-y-5 h-fit">
          <div>
            <h2 className="text-lg font-black text-[#1D1B18] tracking-wide uppercase">BACKOFFICE</h2>
            <p className="text-[10px] font-mono text-stone-400 uppercase tracking-widest leading-none mt-1">femfashion CONTROLO</p>
          </div>

          <div className="flex flex-col gap-1 text-xs">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono uppercase tracking-wider text-left transition ${
                activeTab === 'dashboard' ? 'bg-[#1D1B18] text-white font-bold' : 'text-stone-600 hover:bg-stone-50'
              }`}
              id="tab-dashboard-btn"
            >
              <BarChart className="w-4 h-4 text-amber-500" />
              Estatísticas
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono uppercase tracking-wider text-left transition ${
                activeTab === 'products' ? 'bg-[#1D1B18] text-white font-bold' : 'text-stone-600 hover:bg-stone-50'
              }`}
              id="tab-products-btn"
            >
              <Box className="w-4 h-4 text-amber-500" />
              Produtos
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono uppercase tracking-wider text-left transition ${
                activeTab === 'categories' ? 'bg-[#1D1B18] text-white font-bold' : 'text-stone-600 hover:bg-stone-50'
              }`}
              id="tab-categories-btn"
            >
              <Layers className="w-4 h-4 text-amber-500" />
              Categorias
            </button>
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono uppercase tracking-wider text-left transition ${
                activeTab === 'stock' ? 'bg-[#1D1B18] text-white font-bold' : 'text-stone-600 hover:bg-stone-50'
              }`}
              id="tab-stock-btn"
            >
              <Tag className="w-4 h-4 text-amber-500" />
              Inventário
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono uppercase tracking-wider text-left transition ${
                activeTab === 'orders' ? 'bg-[#1D1B18] text-white font-bold' : 'text-stone-600 hover:bg-stone-50'
              }`}
              id="tab-orders-btn"
            >
              <ShoppingCart className="w-4 h-4 text-amber-500" />
              Encomendas
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-mono uppercase tracking-wider text-left transition ${
                activeTab === 'users' ? 'bg-[#1D1B18] text-white font-bold' : 'text-stone-600 hover:bg-stone-50'
              }`}
              id="tab-users-btn"
            >
              <Users className="w-4 h-4 text-amber-500" />
              Utilizadores
            </button>
          </div>

          <div className="border-t border-stone-100 pt-3">
            <button
              onClick={onNavigateHome}
              className="w-full py-2 border border-stone-200 text-stone-700 text-xs font-mono uppercase rounded-lg text-center bg-stone-50 hover:bg-white transition"
              id="quit-admin-btn"
            >
              Sair Backoffice
            </button>
          </div>
        </div>

        {/* Content Panel Stage */}
        <div className="flex-grow min-w-0">
          {isLoading ? (
            <div className="bg-white border border-stone-100 rounded-2xl p-12 flex flex-col items-center justify-center text-center h-[50vh]">
              <div className="w-8 h-8 rounded-full border-2 border-stone-200 border-t-amber-600 anim-spin animate-spin mb-3" />
              <p className="text-xs text-stone-400 font-mono uppercase tracking-widest">Sincronizando base de dados...</p>
            </div>
          ) : (
            <>
              {activeTab === 'dashboard' && renderDashboard()}
              {activeTab === 'categories' && renderCategories()}
              {activeTab === 'products' && renderProducts()}
              {activeTab === 'stock' && renderStock()}
              {activeTab === 'orders' && renderOrders()}
              {activeTab === 'users' && renderUsers()}
            </>
          )}
        </div>

      </div>
    </div>
  );
}
