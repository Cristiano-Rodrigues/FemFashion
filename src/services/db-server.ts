/**
 * Server-side database service for Next.js API Routes.
 * Uses Supabase directly (no localStorage — server environment).
 * Falls back to in-memory seed data when Supabase is unavailable.
 */

import { createClient } from '@supabase/supabase-js';
import {
  Usuario, Categoria, Produto, ImagemProduto, VarianteProduto,
  Endereco, Pedido, ItemPedido, ProdutoDetalhado, PedidoDetalhado, CartItem
} from '@/types';

// Server-side Supabase client (uses same keys — anon key is safe here)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
export const hasConfig = !!supabaseUrl && !!supabaseKey && !supabaseKey.startsWith('sb_publishable_PLACEHOLDER');
export const supabase = hasConfig ? createClient(supabaseUrl, supabaseKey) : null;

// ==========================================
// SEED DATA (server-side fallback)
// ==========================================
export const SEED_CATEGORIES: Categoria[] = [
  { id: 'c1', nome: 'Perucas & Extensões', slug: 'perucas-extensoes' },
  { id: 'c2', nome: 'Vestidos & Roupas', slug: 'vestidos-roupas' },
  { id: 'c3', nome: 'Sapatos de Luxo', slug: 'sapatos' },
  { id: 'c4', nome: 'Carteiras & Bolsas', slug: 'bolsas' },
  { id: 'c5', nome: 'Cosméticos & Maquilhagem', slug: 'cosmeticos' },
  { id: 'c6', nome: 'Jóias e Acessórios', slug: 'joias-acessorios' },
];

export const SEED_PRODUCTS: Produto[] = [
  { id: 'p1', id_categoria: 'c1', nome: 'Peruca Lace Front Cabelo Humano Premium', slug: 'peruca-lace-front-premium', descricao: 'Peruca de cabelo humano 100% virgem. Lace HD ultra fina 13x6 para aspeto natural.', preco: 120000, ativo: true },
  { id: 'p2', id_categoria: 'c1', nome: 'Peruca Bob Wig Lace Front Curta', slug: 'peruca-bob-wig-curta', descricao: 'Corte Bob clássico com cabelo humano premium liso sedoso 14 polegadas.', preco: 85000, ativo: true },
  { id: 'p3', id_categoria: 'c2', nome: 'Vestido de Gala Luanda Gold', slug: 'vestido-gala-luanda-gold', descricao: 'Vestido de festa com lantejoulas douradas, decote V profundo e fenda lateral.', preco: 75000, ativo: true },
  { id: 'p4', id_categoria: 'c2', nome: 'Vestido de Verão Estampado Kimbundu', slug: 'vestido-verao-kimbundu', descricao: 'Vestido leve de algodão premium com padrão étnico africano vibrante.', preco: 32000, ativo: true },
  { id: 'p5', id_categoria: 'c3', nome: 'Sandália Salto Alto Cravejada Diamond', slug: 'sandalia-salto-alto-diamond', descricao: 'Sandália salto fino agulha 10cm, tiras cravejadas de brilhantes.', preco: 68000, ativo: true },
  { id: 'p6', id_categoria: 'c3', nome: 'Scarpin Classic em Couro Nude', slug: 'scarpin-pele-norte-nude', descricao: 'Sapato scarpin de couro texturizado nude, bico fino clássico.', preco: 54000, ativo: true },
  { id: 'p7', id_categoria: 'c4', nome: 'Mala de Ombro Couro Elegance', slug: 'mala-ombro-couro-elegance', descricao: 'Mala de ombro estruturada couro legítimo croco com ferragens douradas.', preco: 95000, ativo: true },
  { id: 'p8', id_categoria: 'c5', nome: 'Batom Matte Hydra Satin Especial Melanin', slug: 'batom-matte-hydra-satin', descricao: 'Batom para subtons de pele retinta. Hidratação com óleo de jojoba.', preco: 15000, ativo: true },
  { id: 'p9', id_categoria: 'c6', nome: 'Brincos de Argolas Chappé 18k GP', slug: 'brincos-argolas-chappe-18k', descricao: 'Argolas banhadas a Ouro 18k. Hipoalergénicas, brilho intenso.', preco: 22000, ativo: true },
];

export const SEED_IMAGES: ImagemProduto[] = [
  { id: 'img1', id_produto: 'p1', url: 'https://images.unsplash.com/photo-1620331713537-bca9da369e80?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  { id: 'img2', id_produto: 'p2', url: 'https://images.unsplash.com/photo-1605497746444-ac9dbd324ce4?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  { id: 'img3', id_produto: 'p3', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  { id: 'img4', id_produto: 'p4', url: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  { id: 'img5', id_produto: 'p5', url: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  { id: 'img6', id_produto: 'p6', url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  { id: 'img7', id_produto: 'p7', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  { id: 'img8', id_produto: 'p8', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  { id: 'img9', id_produto: 'p9', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800', ranking: 1 },
];

export const SEED_VARIANTS: VarianteProduto[] = [
  { id: 'v1', id_produto: 'p1', designativo: 'HD Lace Frontal 28"', tamanho: '28 polegadas', cor: 'Preto Natural', preco: 120000, quantidade_stock: 15 },
  { id: 'v2', id_produto: 'p1', designativo: 'HD Lace Frontal 32"', tamanho: '32 polegadas', cor: 'Preto Natural', preco: 145000, quantidade_stock: 8 },
  { id: 'v3', id_produto: 'p1', designativo: 'HD Lace Blonde 30"', tamanho: '30 polegadas', cor: 'Loiro Dourado', preco: 155000, quantidade_stock: 4 },
  { id: 'v4', id_produto: 'p2', designativo: 'Silk Bob Classic 14"', tamanho: '14 polegadas', cor: 'Preto Natural', preco: 85000, quantidade_stock: 12 },
  { id: 'v5', id_produto: 'p2', designativo: 'Silk Bob Blonde 14"', tamanho: '14 polegadas', cor: 'Chocolate Caramelizado', preco: 98000, quantidade_stock: 2 },
  { id: 'v6', id_produto: 'p3', designativo: 'Gala Fit S', tamanho: 'S', cor: 'Dourado Real', preco: 75000, quantidade_stock: 6 },
  { id: 'v7', id_produto: 'p3', designativo: 'Gala Fit M', tamanho: 'M', cor: 'Dourado Real', preco: 75000, quantidade_stock: 10 },
  { id: 'v8', id_produto: 'p3', designativo: 'Gala Fit L', tamanho: 'L', cor: 'Dourado Real', preco: 78000, quantidade_stock: 0 },
  { id: 'v9', id_produto: 'p4', designativo: 'Summer Kimbundu S', tamanho: 'S', cor: 'Multicor', preco: 32000, quantidade_stock: 18 },
  { id: 'v10', id_produto: 'p4', designativo: 'Summer Kimbundu M', tamanho: 'M', cor: 'Multicor', preco: 32000, quantidade_stock: 24 },
  { id: 'v12', id_produto: 'p5', designativo: 'Diamond 37', tamanho: '37', cor: 'Prata Brilhante', preco: 68000, quantidade_stock: 5 },
  { id: 'v13', id_produto: 'p5', designativo: 'Diamond 38', tamanho: '38', cor: 'Prata Brilhante', preco: 68000, quantidade_stock: 8 },
  { id: 'v15', id_produto: 'p6', designativo: 'Scarpin 36', tamanho: '36', cor: 'Nude', preco: 54000, quantidade_stock: 4 },
  { id: 'v16', id_produto: 'p6', designativo: 'Scarpin 37', tamanho: '37', cor: 'Nude', preco: 54000, quantidade_stock: 9 },
  { id: 'v18', id_produto: 'p7', designativo: 'Elegance Onyx', tamanho: 'Único', cor: 'Preto Gold', preco: 95000, quantidade_stock: 7 },
  { id: 'v20', id_produto: 'p8', designativo: 'Melanin Rich Gloss 01', tamanho: 'Único', cor: 'Tom Mel 01', preco: 15000, quantidade_stock: 40 },
  { id: 'v22', id_produto: 'p9', designativo: 'Argolas Chappé 5cm', tamanho: '5cm', cor: 'Ouro Amarelo 18k', preco: 22000, quantidade_stock: 20 },
];

export const SEED_USERS: Usuario[] = [
  { id: 'u1', nome: 'Helena Patrício', email: 'helena@gmail.com', password_hash: 'cliente123', telefone: '+244 931 999 888', role: 'cliente' },
  { id: 'u2', nome: 'Aisha Santos (Admin)', email: 'admin@femfashion.ao', password_hash: 'admin123', telefone: '+244 923 000 001', role: 'admin' },
];

// ==========================================
// SERVER DB HELPERS
// ==========================================

export async function serverGetCategories(): Promise<Categoria[]> {
  if (supabase) {
    const { data, error } = await supabase.from('categorias').select('*').order('nome');
    if (data && !error) return data;
  }
  return SEED_CATEGORIES;
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
  // Seed fallback
  return SEED_PRODUCTS.map(p => ({
    ...p,
    categoria: SEED_CATEGORIES.find(c => c.id === p.id_categoria),
    imagens: SEED_IMAGES.filter(img => img.id_produto === p.id).sort((a, b) => a.ranking - b.ranking),
    variantes: SEED_VARIANTS.filter(v => v.id_produto === p.id),
  }));
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
  return SEED_USERS;
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
