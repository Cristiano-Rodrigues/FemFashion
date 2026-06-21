import { createClient } from '@supabase/supabase-js';
import {
  Usuario, Categoria, Produto, ImagemProduto, VarianteProduto,
  Endereco, Pedido, ItemPedido, ProdutoDetalhado, PedidoDetalhado, CartItem
} from '@/types';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
export const hasConfig = !!supabaseUrl && !!supabaseKey && !supabaseKey.startsWith('sb_publishable_PLACEHOLDER');
export const supabase = hasConfig ? createClient(supabaseUrl, supabaseKey) : null;

export async function serverGetCategories(): Promise<Categoria[]> {
  if (supabase) {
    const { data, error } = await supabase.from('categorias').select('*').order('nome');
    if (data && !error) return data;
  }
  return [];
}

export async function serverGetProducts(): Promise<ProdutoDetalhado[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('produtos')
      .select('*, categorias(*), imagens_produto(*), variantes_produto(*)')
      .order('criado_em', { ascending: false });
    if (data && !error) {
      return data.map((p: any) => ({
        ...p, categoria: p.categorias,
        imagens: p.imagens_produto || [], variantes: p.variantes_produto || [],
      }));
    }
  }
  return [];
}

export async function serverGetProductBySlug(slug: string): Promise<ProdutoDetalhado | null> {
  const all = await serverGetProducts();
  return all.find(p => p.slug === slug && p.ativo) || null;
}

export async function serverGetUsers(): Promise<Usuario[]> {
  if (supabase) {
    const { data, error } = await supabase.from('usuarios').select('*').order('nome');
    if (data && !error) return data;
  }
  return [];
}

export async function serverGetOrders(): Promise<PedidoDetalhado[]> {
  if (supabase) {
    const { data, error } = await supabase
      .from('pedidos')
      .select('*, usuarios(*), enderecos(*), itens_pedido(*)')
      .order('criado_em', { ascending: false });
    if (data && !error) {
      return data.map((o: any) => ({ ...o, usuario: o.usuarios, endereco: o.enderecos, itens: o.itens_pedido || [] }));
    }
  }
  return [];
}

export async function serverGetAddresses(userId: string): Promise<Endereco[]> {
  if (supabase) {
    const { data, error } = await supabase.from('enderecos').select('*').eq('id_usuario', userId);
    if (data && !error) return data;
  }
  return [];
}
