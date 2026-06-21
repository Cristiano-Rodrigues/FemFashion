import { supabase, hasSupabaseConfig } from '@/lib/supabase';
import { 
  Usuario, Categoria, Produto, ImagemProduto, 
  VarianteProduto, Endereco, Pedido, ItemPedido,
  ProdutoDetalhado, PedidoDetalhado, CartItem,
  Sessao, Evento
} from '@/types';

class NotConfigureSupabase extends Error { 
  constructor() { super("Supabase não está configurado na aplicação."); }
}

export class DatabaseService {
  static getVisitorId(): string {
    let visitorId = typeof window !== 'undefined' ? localStorage.getItem('femfashion_visitor_id') : null;
    if (!visitorId) {
      visitorId = crypto.randomUUID ? crypto.randomUUID() : 'visitor-' + Math.random().toString(36).substring(2, 11);
      if (typeof window !== 'undefined') localStorage.setItem('femfashion_visitor_id', visitorId);
    }
    return visitorId;
  }

  static async getCurrentUser(): Promise<Usuario | null> {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        return data.user || null;
      }
    } catch {}
    return null;
  }

  static async login(email: string, password_hash: string): Promise<{ user: Usuario | null; error: string | null }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password: password_hash })
      });
      const data = await res.json();
      if (!res.ok || data.error) return { user: null, error: data.error };
      return { user: data.user, error: null };
    } catch (e) {
      return { user: null, error: 'Erro de conexão.' };
    }
  }

  static async register(nome: string, email: string, password_hash: string, telefone?: string): Promise<{ user: Usuario | null; error: string | null }> {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, email, password: password_hash, telefone })
      });
      const data = await res.json();
      if (!res.ok || data.error) return { user: null, error: data.error };
      return { user: data.user, error: null };
    } catch (e) {
      return { user: null, error: 'Erro de conexão.' };
    }
  }

  static async logout(): Promise<void> {
    await fetch('/api/auth/logout', { method: 'POST' });
  }

  static async getCategories(): Promise<Categoria[]> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const { data, error } = await supabase
      .from('categorias')
      .select('*')
      .order('nome', { ascending: true });
      
    if (error) throw new Error(error.message);
    return data as Categoria[];
  }

  static async createCategory(nome: string, slug: string, descricao?: string, imagem_url?: string): Promise<Categoria> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const newCat: Partial<Categoria> = { nome, slug, descricao, imagem_url };
    
    const { data, error } = await supabase
      .from('categorias')
      .insert([newCat])
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data as Categoria;
  }

  static async updateCategory(id: string, nome: string, slug: string, descricao?: string, imagem_url?: string): Promise<Categoria | null> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const { data, error } = await supabase
      .from('categorias')
      .update({ nome, slug, descricao, imagem_url })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw new Error(error.message);
    return data as Categoria;
  }

  static async deleteCategory(id: string): Promise<boolean> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const { error } = await supabase
      .from('categorias')
      .delete()
      .eq('id', id);
      
    if (error) throw new Error(error.message);
    return true;
  }

  static async getProductsDetalhados(): Promise<ProdutoDetalhado[]> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const { data, error } = await supabase
      .from('produtos')
      .select(`
        *,
        categorias(*),
        imagens_produto(*),
        variantes_produto(*)
      `)
      .order('criado_em', { ascending: false });

    if (error) throw new NotConfigureSupabase();
    
    return (data || []).map((p: any) => ({
      ...p,
      categoria: p.categorias,
      imagens: p.imagens_produto || [],
      variantes: p.variantes_produto || []
    })) as ProdutoDetalhado[];
  }

  static async getProductDetalhadoBySlug(slug: string): Promise<ProdutoDetalhado | null> {
    const products = await this.getProductsDetalhados();
    return products.find(p => p.slug === slug && p.ativo) || null;
  }

  static async createProduct(
    id_categoria: string,
    nome: string,
    descricao: string,
    preco: number,
    imagens: { url: string; ranking: number }[],
    variantes: { designativo: string; tamanho: string; cor: string; preco: number; quantidade_stock: number }[]
  ): Promise<ProdutoDetalhado> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const newProd: Partial<Produto> = { id_categoria, nome, slug, descricao, preco, ativo: true };

    const { data: prodData, error: prodErr } = await supabase.from('produtos').insert([newProd]).select().single();
    if (prodErr || !prodData) throw new Error(prodErr?.message || "Erro ao criar produto");
    
    const newProductId = prodData.id;

    const newImgs: Partial<ImagemProduto>[] = imagens.map((img, index) => ({
      id_produto: newProductId,
      url: img.url,
      ranking: img.ranking || index
    }));

    const newVars: Partial<VarianteProduto>[] = variantes.map((v) => ({
      id_produto: newProductId,
      designativo: v.designativo,
      tamanho: v.tamanho,
      cor: v.cor,
      preco: Number(v.preco),
      quantidade_stock: Number(v.quantidade_stock)
    }));

    if (newImgs.length > 0) {
      const { error: imgErr } = await supabase.from('imagens_produto').insert(newImgs);
      if (imgErr) throw new Error(imgErr.message);
    }
    
    if (newVars.length > 0) {
      const { error: varErr } = await supabase.from('variantes_produto').insert(newVars);
      if (varErr) throw new Error(varErr.message);
    }

    const details = await this.getProductsDetalhados();
    const saved = details.find(d => d.id === newProductId);
    if (!saved) throw new Error("Erro a carregar produto criado.");
    return saved;
  }

  static async updateProduct(
    id: string,
    id_categoria: string,
    nome: string,
    descricao: string,
    preco: number,
    ativo: boolean,
    imagens: { url: string; ranking: number }[],
    variantes: { designativo: string; tamanho: string; cor: string; preco: number; quantidade_stock: number }[]
  ): Promise<ProdutoDetalhado | null> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const updatedProdArgs = { id_categoria, nome, slug, descricao, preco, ativo };

    const { error: prodErr } = await supabase.from('produtos').update(updatedProdArgs).eq('id', id);
    if (prodErr) throw new Error(prodErr.message);

    const { error: imgDelErr } = await supabase.from('imagens_produto').delete().eq('id_produto', id);
    if (imgDelErr) throw new Error(imgDelErr.message);
    
    const { error: varDelErr } = await supabase.from('variantes_produto').delete().eq('id_produto', id);
    if (varDelErr) throw new Error(varDelErr.message);

    const newImgs: Partial<ImagemProduto>[] = imagens.map((img, i) => ({
      id_produto: id,
      url: img.url,
      ranking: img.ranking || i
    }));

    const newVars: Partial<VarianteProduto>[] = variantes.map((v) => ({
      id_produto: id,
      designativo: v.designativo,
      tamanho: v.tamanho,
      cor: v.cor,
      preco: Number(v.preco),
      quantidade_stock: Number(v.quantidade_stock)
    }));

    if (newImgs.length > 0) {
      const { error: imgErr } = await supabase.from('imagens_produto').insert(newImgs);
      if (imgErr) throw new Error(imgErr.message);
    }
    
    if (newVars.length > 0) {
      const { error: varErr } = await supabase.from('variantes_produto').insert(newVars);
      if (varErr) throw new Error(varErr.message);
    }

    const details = await this.getProductsDetalhados();
    return details.find(d => d.id === id) || null;
  }

  static async deleteProduct(id: string): Promise<boolean> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const { error } = await supabase.from('produtos').delete().eq('id', id);
    if (error) throw new Error(error.message);
    return true;
  }

  static async updateVariantStockDirect(variantId: string, novoStock: number): Promise<boolean> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const { error } = await supabase
      .from('variantes_produto')
      .update({ quantidade_stock: novoStock })
      .eq('id', variantId);
      
    if (error) throw new Error(error.message);
    return true;
  }

  static async getAddressesForUser(userId: string): Promise<Endereco[]> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const { data, error } = await supabase
      .from('enderecos')
      .select('*')
      .eq('id_usuario', userId);
      
    if (error) throw new Error(error.message);
    return data as Endereco[];
  }

  static async createAddress(userId: string, provincia: string, municipio: string, bairro: string, rua: string, padrao: boolean = false): Promise<Endereco> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    if (padrao) {
      await supabase.from('enderecos').update({ padrao: false }).eq('id_usuario', userId);
    }
    
    const newAddr: Partial<Endereco> = { id_usuario: userId, provincia, municipio, bairro, rua, padrao };
    
    const { data, error } = await supabase.from('enderecos').insert([newAddr]).select().single();
    if (error) throw new Error(error.message);
    return data as Endereco;
  }

  static async getOrders(): Promise<PedidoDetalhado[]> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const { data, error } = await supabase
      .from('pedidos')
      .select(`
        *,
        usuarios(*),
        enderecos(*),
        itens_pedido(*)
      `)
      .order('criado_em', { ascending: false });

    if (error) throw new Error(error.message);
    
    return (data || []).map((o: any) => ({
      ...o,
      usuario: o.usuarios,
      endereco: o.enderecos,
      itens: o.itens_pedido || []
    })) as PedidoDetalhado[];
  }

  static async createOrder(
    id_usuario: string,
    id_endereco: string,
    cartItems: CartItem[],
    subtotal: number,
    taxa_entrega: number,
    total: number,
    metodo_pagamento: string
  ): Promise<{ order: Pedido | null; error: string | null }> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();

    for (const item of cartItems) {
      const { data: vExist, error: vErr } = await supabase.from('variantes_produto').select('*').eq('id', item.variante.id).single();
      if (vErr || !vExist) return { order: null, error: `Variante do produto ${item.produto.nome} não encontrada!` };
      
      if (vExist.quantidade_stock < item.quantidade) {
        return { order: null, error: `Stock insuficiente para ${item.produto.nome} (${item.variante.tamanho || ''} - ${item.variante.cor || ''}). Disponível: ${vExist.quantidade_stock} unidades.` };
      }
    }

    const newOrder: Partial<Pedido> = {
      id_usuario,
      id_endereco,
      status: 'pago',
      subtotal,
      taxa_entrega,
      total,
      metodo_pagamento
    };

    const { data: orderData, error: orderErr } = await supabase.from('pedidos').insert([newOrder]).select().single();
    if (orderErr || !orderData) return { order: null, error: orderErr?.message || "Erro ao criar pedido" };

    const newOrderId = orderData.id;

    const newItems: Partial<ItemPedido>[] = cartItems.map((item) => ({
      id_pedido: newOrderId,
      id_variante: item.variante.id,
      nome_produto: `${item.produto.nome} (${item.variante.designativo || item.variante.tamanho || item.variante.cor})`,
      preco_unitario: item.variante.preco,
      quantidade: item.quantidade
    }));

    const { error: itemsErr } = await supabase.from('itens_pedido').insert(newItems);
    if (itemsErr) throw new Error(itemsErr.message);

    for (const item of cartItems) {
      const currentStock = item.variante.quantidade_stock - item.quantidade;
      await supabase.from('variantes_produto').update({ quantidade_stock: currentStock }).eq('id', item.variante.id);
    }

    return { order: orderData as Pedido, error: null };
  }

  static async updateOrderStatus(orderId: string, status: Pedido['status']): Promise<boolean> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const { error } = await supabase
      .from('pedidos')
      .update({ status })
      .eq('id', orderId);
      
    if (error) throw new Error(error.message);
    return true;
  }

  static async getUsers(): Promise<Usuario[]> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('nome', { ascending: true });
      
    if (error) throw new Error(error.message);
    return data as Usuario[];
  }

  static async updateUserRole(userId: string, role: Usuario['role']): Promise<boolean> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const { error } = await supabase
      .from('usuarios')
      .update({ role })
      .eq('id', userId);
      
    if (error) throw new Error(error.message);
    return true;
  }

  static async logEvent(
    tipo_evento: string,
    pagina: string,
    id_produto?: string | null,
    metadados?: Record<string, any>
  ): Promise<void> {
    if (!hasSupabaseConfig || !supabase) return;
    
    const visitorId = this.getVisitorId();
    const activeUser = await this.getCurrentUser();
    
    try {
      await supabase.from('eventos').insert([{
        id_sessao: 's1000000-0000-0000-0000-000000000001',
        id_usuario: activeUser?.id || null,
        id_visitante: visitorId,
        tipo_evento,
        pagina,
        id_produto,
        metadados
      }]);
    } catch (e) {}
  }

  static async getEvents(): Promise<Evento[]> {
    if (!hasSupabaseConfig || !supabase) throw new NotConfigureSupabase();
    
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('criado_em', { ascending: false });
      
    if (error) throw new Error(error.message);
    return data as Evento[];
  }
}
