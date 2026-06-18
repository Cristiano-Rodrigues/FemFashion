/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { supabase, hasSupabaseConfig } from '@/lib/supabase';
import { 
  Usuario, Categoria, Produto, ImagemProduto, 
  VarianteProduto, Endereco, Pedido, ItemPedido,
  ProdutoDetalhado, PedidoDetalhado, CartItem,
  Sessao, Evento
} from '@/types';

// ==========================================
// SEED DATA FOR SIMULATED LOCALSTORAGE DB
// ==========================================

const SEED_CATEGORIES: Categoria[] = [
  { id: 'c1', nome: 'Perucas & Extensões', slug: 'perucas-extensoes', descricao: 'Sistemas de cabelo humano premium, front lace, e tecimentos de luxo.' },
  { id: 'c2', nome: 'Vestidos & Roupas', slug: 'vestidos-roupas', descricao: 'Vestidos de festa, vestidos casuais, conjuntos modernos e alta costura feminina.' },
  { id: 'c3', nome: 'Sapatos de Luxo', slug: 'sapatos', descricao: 'Saltos altos elegantes, sandálias, botas e calçados exclusivos.' },
  { id: 'c4', nome: 'Carteiras & Bolsas', slug: 'bolsas', descricao: 'Bolsas de couro, clutches de festa e malas práticas para o dia-a-dia.' },
  { id: 'c5', nome: 'Cosméticos & Maquilhagem', slug: 'cosmeticos', descricao: 'Batom, bases premium, cuidados de pele específicos e kits de beleza para pele negra.' },
  { id: 'c6', nome: 'Jóias e Acessórios', slug: 'joias-acessorios', descricao: 'Brincos de ouro 18k, colares finos, pulseiras cravejadas e anéis de luxo.' }
];

const SEED_USERS: Usuario[] = [
  {
    id: 'u1',
    nome: 'Helena Patrício',
    email: 'helena@gmail.com',
    password_hash: 'cliente123',
    telefone: '+244 931 999 888',
    role: 'cliente'
  },
  {
    id: 'u2',
    nome: 'Aisha Santos (Admin)',
    email: 'admin@femfashion.ao',
    password_hash: 'admin123',
    telefone: '+244 923 000 001',
    role: 'admin'
  }
];

const SEED_THE_PRODUCTS: Produto[] = [
  {
    id: 'p1',
    id_categoria: 'c1',
    nome: 'Peruca Lace Front Cabelo Humano Premium',
    slug: 'peruca-lace-front-premium',
    descricao: 'Peruca de cabelo humano 100% virgem de qualidade superior. Lace HD ultra fina de 13x6 que se funde perfeitamente com a pele para um aspeto incrivelmente natural. Pode ser pintada, alisada e ondulada.',
    preco: 120000.00,
    ativo: true
  },
  {
    id: 'p2',
    id_categoria: 'c1',
    nome: 'Peruca Bob Wig Lace Front Curta',
    slug: 'peruca-bob-wig-curta',
    descricao: 'Corte Bob clássico e sofisticado com cabelo humano premium liso sedoso. Comprimento de 14 polegadas com densidade de 180%. Fácil e rápida de instalar, ideal para o visual moderno do dia-a-dia.',
    preco: 85000.00,
    ativo: true
  },
  {
    id: 'p3',
    id_categoria: 'c2',
    nome: 'Vestido de Gala Luanda Gold',
    slug: 'vestido-gala-luanda-gold',
    descricao: 'Um deslumbrante vestido de festa com lantejoulas douradas bordadas, decote em V profundo e fenda lateral dramática. Idealizado para casamentos, gala e noites especiais com máxima sofisticação.',
    preco: 75000.00,
    ativo: true
  },
  {
    id: 'p4',
    id_categoria: 'c2',
    nome: 'Vestido de Verão Estampado Kimbundu',
    slug: 'vestido-verao-kimbundu',
    descricao: 'Vestido leve de algodão premium com padrão étnico africano vibrante em tons de laranja, azul royal e amarelo. Corte ombro a ombro elegante, perfeito para dias ensolarados e eventos culturais.',
    preco: 32000.00,
    ativo: true
  },
  {
    id: 'p5',
    id_categoria: 'c3',
    nome: 'Sandália Salto Alto Cravejada Diamond',
    slug: 'sandalia-salto-alto-diamond',
    descricao: 'Sandália de salto fino agulha de 10cm, com tiras frontas cravejadas de brilhantes de alta reflexão. Perfeito para festas elegantes e noites de glamour.',
    preco: 68000.00,
    ativo: true
  },
  {
    id: 'p6',
    id_categoria: 'c3',
    nome: 'Scarpin Classic em Couro Nude',
    slug: 'scarpin-pele-norte-nude',
    descricao: 'Sapato scarpin luxuoso de couro texturizado nobre na cor nude, bico fino clássico e palmilha anatómica macia. O calçado essencial da mulher executiva de elite.',
    preco: 54000.00,
    ativo: true
  },
  {
    id: 'p7',
    id_categoria: 'c4',
    nome: 'Mala de Ombro Couro Elegance',
    slug: 'mala-ombro-couro-elegance',
    descricao: 'Mala de ombro estruturada em couro legítimo texturizado croco, com ferragens robustas banhadas a ouro e compartimento duplo para ótima organização diária.',
    preco: 95000.00,
    ativo: true
  },
  {
    id: 'p8',
    id_categoria: 'c5',
    nome: 'Batom Matte Hydra Satin Especial Melanin',
    slug: 'batom-matte-hydra-satin',
    descricao: 'Batom rico em pigmentos desenvolvido carinhosamente para ressaltar a beleza de subtons de pele retinta e morena. Hidratação duradoura com óleo de jojoba e acabamento acetinado de longa duração.',
    preco: 15000.00,
    ativo: true
  },
  {
    id: 'p9',
    id_categoria: 'c6',
    nome: 'Brincos de Argolas Chappé 18k GP',
    slug: 'brincos-argolas-chappe-18k',
    descricao: 'Brincos clássicos estilo argolas planas de textura torcida banhadas a Ouro 18k de alta resistência. Joia hipoalergénica de brilho intenso e elegância atemporal.',
    preco: 22000.00,
    ativo: true
  }
];

const SEED_IMAGES: ImagemProduto[] = [
  // Wigs
  { id: 'img1', id_produto: 'p1', url: 'https://images.unsplash.com/photo-1620331713537-bca9da369e80?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  { id: 'img1b', id_produto: 'p1', url: 'https://images.unsplash.com/photo-1595959183075-c1d945133630?auto=format&fit=crop&q=80&w=800', ranking: 2 },
  { id: 'img2', id_produto: 'p2', url: 'https://images.unsplash.com/photo-1605497746444-ac9dbd324ce4?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  // Dresses
  { id: 'img3', id_produto: 'p3', url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  { id: 'img3b', id_produto: 'p3', url: 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800', ranking: 2 },
  { id: 'img4', id_produto: 'p4', url: 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  // Shoes
  { id: 'img5', id_produto: 'p5', url: 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  { id: 'img6', id_produto: 'p6', url: 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  // Bag
  { id: 'img7', id_produto: 'p7', url: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  // Lipstick
  { id: 'img8', id_produto: 'p8', url: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800', ranking: 1 },
  // Jewelry
  { id: 'img9', id_produto: 'p9', url: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800', ranking: 1 }
];

const SEED_VARIANTS: VarianteProduto[] = [
  // Premium Wig variants
  { id: 'v1', id_produto: 'p1', designativo: 'HD Lace Frontal 28"', tamanho: '28 polegadas', cor: 'Preto Natural #1B', preco: 120000.00, quantidade_stock: 15 },
  { id: 'v2', id_produto: 'p1', designativo: 'HD Lace Frontal 32"', tamanho: '32 polegadas', cor: 'Preto Natural #1B', preco: 145000.00, quantidade_stock: 8 },
  { id: 'v3', id_produto: 'p1', designativo: 'HD Lace Blonde 30"', tamanho: '30 polegadas', cor: 'Loiro Dourado Mechas #27', preco: 155000.00, quantidade_stock: 4 },
  
  // Bob wig variants
  { id: 'v4', id_produto: 'p2', designativo: 'Silk Bob Classic 14"', tamanho: '14 polegadas', cor: 'Preto Natural #1B', preco: 85000.00, quantidade_stock: 12 },
  { id: 'v5', id_produto: 'p2', designativo: 'Silk Bob Blonde 14"', tamanho: '14 polegadas', cor: 'Chocolate Caramelizado #4', preco: 98000.00, quantidade_stock: 2 }, // Alerta de stock baixo (<=3)
  
  // Dress Gold variants
  { id: 'v6', id_produto: 'p3', designativo: 'Gala Fit S', tamanho: 'S', cor: 'Dourado Real', preco: 75000.00, quantidade_stock: 6 },
  { id: 'v7', id_produto: 'p3', designativo: 'Gala Fit M', tamanho: 'M', cor: 'Dourado Real', preco: 75000.00, quantidade_stock: 10 },
  { id: 'v8', id_produto: 'p3', designativo: 'Gala Fit L', tamanho: 'L', cor: 'Dourado Real', preco: 78000.00, quantidade_stock: 0 }, // Out of stock
  
  // Dress Summer variants
  { id: 'v9', id_produto: 'p4', designativo: 'Summer Kimbundu S', tamanho: 'S', cor: 'Laranja/Azul Multicor', preco: 32000.00, quantidade_stock: 18 },
  { id: 'v10', id_produto: 'p4', designativo: 'Summer Kimbundu M', tamanho: 'M', cor: 'Laranja/Azul Multicor', preco: 32000.00, quantidade_stock: 24 },
  { id: 'v11', id_produto: 'p4', designativo: 'Summer Kimbundu L', tamanho: 'L', cor: 'Laranja/Azul Multicor', preco: 32000.00, quantidade_stock: 15 },
  
  // Sandals variants
  { id: 'v12', id_produto: 'p5', designativo: 'Diamond 37', tamanho: '37', cor: 'Prata Brilhante', preco: 68000.00, quantidade_stock: 5 },
  { id: 'v13', id_produto: 'p5', designativo: 'Diamond 38', tamanho: '38', cor: 'Prata Brilhante', preco: 68000.00, quantidade_stock: 8 },
  { id: 'v14', id_produto: 'p5', designativo: 'Diamond 39', tamanho: '39', cor: 'Prata Brilhante', preco: 68000.00, quantidade_stock: 6 },
  
  // Scarpin variants
  { id: 'v15', id_produto: 'p6', designativo: 'Scarpin 36', tamanho: '36', cor: 'Nude', preco: 54000.00, quantidade_stock: 4 },
  { id: 'v16', id_produto: 'p6', designativo: 'Scarpin 37', tamanho: '37', cor: 'Nude', preco: 54000.00, quantidade_stock: 9 },
  { id: 'v17', id_produto: 'p6', designativo: 'Scarpin 38', tamanho: '38', cor: 'Nude', preco: 54000.00, quantidade_stock: 11 },
  
  // Bag variants
  { id: 'v18', id_produto: 'p7', designativo: 'Elegance Onyx', tamanho: 'Único', cor: 'Preto Onyx Gold', preco: 95000.00, quantidade_stock: 7 },
  { id: 'v19', id_produto: 'p7', designativo: 'Elegance Emerald', tamanho: 'Único', cor: 'Verde Esmeralda', preco: 95000.00, quantidade_stock: 3 },
  
  // Lipstick variants
  { id: 'v20', id_produto: 'p8', designativo: 'Melanin Rich Gloss 01', tamanho: 'Único', cor: 'Tom Mel 01', preco: 15000.00, quantidade_stock: 40 },
  { id: 'v21', id_produto: 'p8', designativo: 'Cocoa Butter Gloss 03', tamanho: 'Único', cor: 'Tom Chocolate Cocoa 03', preco: 15000.00, quantidade_stock: 35 },
  
  // Jewelry variants
  { id: 'v22', id_produto: 'p9', designativo: 'Argolas Chappé 5cm', tamanho: '5cm diâmetro', cor: 'Ouro Amarelo 18k', preco: 22000.00, quantidade_stock: 20 },
  { id: 'v23', id_produto: 'p9', designativo: 'Argolas Chappé 7cm', tamanho: '7cm diâmetro', cor: 'Ouro Amarelo 18k', preco: 26000.00, quantidade_stock: 10 }
];

const SEED_ENDERECOS: Endereco[] = [
  {
    id: 'e1',
    id_usuario: 'u1',
    provincia: 'Luanda',
    municipio: 'Belas',
    bairro: 'Talatona',
    rua: 'Rua da Samba, Via AL12, Condomínio Girassol',
    padrao: true
  }
];

const SEED_PEDIDOS: Pedido[] = [
  {
    id: 'o1',
    id_usuario: 'u1',
    id_endereco: 'e1',
    status: 'pago',
    subtotal: 107000.00,
    taxa_entrega: 3500.00,
    total: 110500.00,
    metodo_pagamento: 'MCX_EXPRESS',
    criado_em: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days ago
  },
  {
    id: 'o2',
    id_usuario: 'u1',
    id_endereco: 'e1',
    status: 'processando',
    subtotal: 95000.00,
    taxa_entrega: 3500.00,
    total: 98500.00,
    metodo_pagamento: 'UNITEL_MONEY',
    criado_em: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1 day ago
  }
];

const SEED_ITENS_PEDIDO: ItemPedido[] = [
  { id: 'oi1', id_pedido: 'o1', id_variante: 'v6', nome_produto: 'Vestido de Gala Luanda Gold (Gala Fit S)', preco_unitario: 75000.00, quantidade: 1 },
  { id: 'oi2', id_pedido: 'o1', id_variante: 'v9', nome_produto: 'Vestido de Verão Estampado Kimbundu (Summer Kimbundu S)', preco_unitario: 32000.00, quantidade: 1 },
  { id: 'oi3', id_pedido: 'o2', id_variante: 'v18', nome_produto: 'Mala de Ombro Couro Elegance (Elegance Onyx)', preco_unitario: 95000.00, quantidade: 1 }
];


// ==========================================
// DB SERVICE WRAPPER WITH CRITICAL FALLBACK
// ==========================================

export class DatabaseService {
  private static isInitialized = false;

  private static initLocalStorageSchema() {
    if (this.isInitialized) return;
    
    const checkOrWrite = (key: string, data: any) => {
      const existing = localStorage.getItem(`femfashion_${key}`);
      if (!existing) {
        localStorage.setItem(`femfashion_${key}`, JSON.stringify(data));
      }
    };

    checkOrWrite('categorias', SEED_CATEGORIES);
    checkOrWrite('usuarios', SEED_USERS);
    checkOrWrite('produtos', SEED_THE_PRODUCTS);
    checkOrWrite('imagens_produto', SEED_IMAGES);
    checkOrWrite('variantes_produto', SEED_VARIANTS);
    checkOrWrite('enderecos', SEED_ENDERECOS);
    checkOrWrite('pedidos', SEED_PEDIDOS);
    checkOrWrite('itens_pedido', SEED_ITENS_PEDIDO);
    checkOrWrite('sessoes', []);
    checkOrWrite('eventos', []);
    
    // Auto-create active visitor ID if not present
    let visitorId = localStorage.getItem('femfashion_visitor_id');
    if (!visitorId) {
      visitorId = crypto.randomUUID ? crypto.randomUUID() : 'visitor-' + Math.random().toString(36).substring(2, 11);
      localStorage.setItem('femfashion_visitor_id', visitorId);
    }

    this.isInitialized = true;
  }

  static getVisitorId(): string {
    this.initLocalStorageSchema();
    return localStorage.getItem('femfashion_visitor_id') || 'visitor';
  }

  // Generic localStorage reader
  private static getLocal<T>(table: string): T[] {
    this.initLocalStorageSchema();
    const data = localStorage.getItem(`femfashion_${table}`);
    return data ? JSON.parse(data) : [];
  }

  // Generic localStorage writer
  private static saveLocal(table: string, data: any[]) {
    localStorage.setItem(`femfashion_${table}`, JSON.stringify(data));
  }

  // ==========================================
  // AUTHENTICATION SERVICES
  // ==========================================

  static async getCurrentUser(): Promise<Usuario | null> {
    const activeUserId = localStorage.getItem('femfashion_active_user_id');
    if (!activeUserId) return null;

    if (hasSupabaseConfig) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // fetch from usuarios table
          const { data, error } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', user.id)
            .single();
          if (data && !error) return data as Usuario;
        }
      } catch (e) {
        console.warn('Supabase Auth error, using localStorage authentication fallback:', e);
      }
    }

    // LocalStorage Fallback
    const users = this.getLocal<Usuario>('usuarios');
    return users.find(u => u.id === activeUserId) || null;
  }

  static async login(email: string, password_hash: string): Promise<{ user: Usuario | null; error: string | null }> {
    if (hasSupabaseConfig) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: password_hash
        });
        if (!error && data.user) {
          const { data: profile, error: dbErr } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', data.user.id)
            .single();
          if (profile && !dbErr) {
            localStorage.setItem('femfashion_active_user_id', profile.id);
            return { user: profile as Usuario, error: null };
          }
        }
      } catch (e) {
        console.warn('Supabase login failed, trying localStorage:', e);
      }
    }

    // Local fallback
    const users = this.getLocal<Usuario>('usuarios');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password_hash === password_hash);
    if (user) {
      localStorage.setItem('femfashion_active_user_id', user.id);
      return { user, error: null };
    }
    return { user: null, error: 'Email ou palavra-passe incorretos!' };
  }

  static async register(nome: string, email: string, password_hash: string, telefone?: string): Promise<{ user: Usuario | null; error: string | null }> {
    if (hasSupabaseConfig) {
      try {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: password_hash,
          options: { data: { nome, telefone } }
        });
        if (!error && data.user) {
          const newUserProfile: Usuario = {
            id: data.user.id,
            nome,
            email,
            password_hash,
            telefone,
            role: 'cliente'
          };
          const { error: insertErr } = await supabase
            .from('usuarios')
            .insert([newUserProfile]);
          
          if (!insertErr) {
            localStorage.setItem('femfashion_active_user_id', data.user.id);
            return { user: newUserProfile, error: null };
          }
        }
      } catch (e) {
        console.warn('Supabase sign up failed, registering locally:', e);
      }
    }

    // Local Registration
    const users = this.getLocal<Usuario>('usuarios');
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { user: null, error: 'Este e-mail já se encontra registado num cliente.' };
    }

    const newUser: Usuario = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'usr-' + Math.random().toString(36).substring(2, 9),
      nome,
      email,
      password_hash,
      telefone,
      role: 'cliente',
      criado_em: new Date().toISOString()
    };

    users.push(newUser);
    this.saveLocal('usuarios', users);
    localStorage.setItem('femfashion_active_user_id', newUser.id);

    return { user: newUser, error: null };
  }

  static async logout(): Promise<void> {
    if (hasSupabaseConfig) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    localStorage.removeItem('femfashion_active_user_id');
  }

  // ==========================================
  // CATEGORIES SERVICES
  // ==========================================

  static async getCategories(): Promise<Categoria[]> {
    if (hasSupabaseConfig) {
      try {
        const { data, error } = await supabase
          .from('categorias')
          .select('*')
          .order('nome', { ascending: true });
        if (data && !error) return data as Categoria[];
      } catch (e) {
        console.warn('Supabase fetch failed, fallback to local storage:', e);
      }
    }
    return this.getLocal<Categoria>('categorias');
  }

  static async createCategory(nome: string, slug: string, descricao?: string): Promise<Categoria> {
    const newCat: Categoria = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'cat-' + Math.random().toString(36).substring(2, 9),
      nome,
      slug,
      descricao
    };

    if (hasSupabaseConfig) {
      try {
        const { data, error } = await supabase
          .from('categorias')
          .insert([newCat])
          .select()
          .single();
        if (data && !error) return data as Categoria;
      } catch (e) {
        console.error(e);
      }
    }

    const cats = this.getLocal<Categoria>('categorias');
    cats.push(newCat);
    this.saveLocal('categorias', cats);
    return newCat;
  }

  static async updateCategory(id: string, nome: string, slug: string, descricao?: string): Promise<Categoria | null> {
    if (hasSupabaseConfig) {
      try {
        const { data, error } = await supabase
          .from('categorias')
          .update({ nome, slug, descricao })
          .eq('id', id)
          .select()
          .single();
        if (data && !error) return data as Categoria;
      } catch (e) {
        console.error(e);
      }
    }

    const cats = this.getLocal<Categoria>('categorias');
    const idx = cats.findIndex(c => c.id === id);
    if (idx !== -1) {
      cats[idx] = { ...cats[idx], nome, slug, descricao };
      this.saveLocal('categorias', cats);
      return cats[idx];
    }
    return null;
  }

  static async deleteCategory(id: string): Promise<boolean> {
    if (hasSupabaseConfig) {
      try {
        const { error } = await supabase
          .from('categorias')
          .delete()
          .eq('id', id);
        if (!error) return true;
      } catch (e) {
        console.error(e);
      }
    }

    const cats = this.getLocal<Categoria>('categorias');
    const filtered = cats.filter(c => c.id !== id);
    if (filtered.length !== cats.length) {
      this.saveLocal('categorias', filtered);
      return true;
    }
    return false;
  }

  // ==========================================
  // PRODUCTS AND VARIANTS SERVICES
  // ==========================================

  static async getProductsDetalhados(): Promise<ProdutoDetalhado[]> {
    if (hasSupabaseConfig) {
      try {
        const { data, error } = await supabase
          .from('produtos')
          .select(`
            *,
            categorias(*),
            imagens_produto(*),
            variantes_produto(*)
          `)
          .order('criado_em', { ascending: false });

        if (data && !error) {
          // Map to correct UI structure
          return data.map((p: any) => ({
            ...p,
            categoria: p.categorias,
            imagens: p.imagens_produto || [],
            variantes: p.variantes_produto || []
          })) as ProdutoDetalhado[];
        }
      } catch (e) {
        console.warn('Supabase fetch products details failed, fallback to local storage:', e);
      }
    }

    // Local Storage Join Implementation
    const produtos = this.getLocal<Produto>('produtos');
    const categorias = this.getLocal<Categoria>('categorias');
    const imagens = this.getLocal<ImagemProduto>('imagens_produto');
    const variantes = this.getLocal<VarianteProduto>('variantes_produto');

    return produtos.map(p => {
      const cat = categorias.find(c => c.id === p.id_categoria);
      const prodImgs = imagens.filter(img => img.id_produto === p.id).sort((a,b) => a.ranking - b.ranking);
      const prodVar = variantes.filter(v => v.id_produto === p.id);
      return {
        ...p,
        categoria: cat,
        imagens: prodImgs,
        variantes: prodVar
      };
    });
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
    const newProductId = crypto.randomUUID ? crypto.randomUUID() : 'prod-' + Math.random().toString(36).substring(2, 9);
    const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const newProd: Produto = {
      id: newProductId,
      id_categoria,
      nome,
      slug,
      descricao,
      preco,
      ativo: true,
      criado_em: new Date().toISOString()
    };

    const newImgs: ImagemProduto[] = imagens.map((img, index) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : `img-${newProductId}-${index}`,
      id_produto: newProductId,
      url: img.url,
      ranking: img.ranking || index
    }));

    const newVars: VarianteProduto[] = variantes.map((v, index) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : `var-${newProductId}-${index}`,
      id_produto: newProductId,
      designativo: v.designativo,
      tamanho: v.tamanho,
      cor: v.cor,
      preco: Number(v.preco),
      quantidade_stock: Number(v.quantidade_stock)
    }));

    if (hasSupabaseConfig) {
      try {
        const { error: prodErr } = await supabase.from('produtos').insert([newProd]);
        if (!prodErr) {
          if (newImgs.length > 0) await supabase.from('imagens_produto').insert(newImgs);
          if (newVars.length > 0) await supabase.from('variantes_produto').insert(newVars);
          
          const details = await this.getProductsDetalhados();
          const saved = details.find(d => d.id === newProductId);
          if (saved) return saved;
        }
      } catch (e) {
        console.error('Supabase create product failed:', e);
      }
    }

    // Local Storage fallback
    const prods = this.getLocal<Produto>('produtos');
    const localImgs = this.getLocal<ImagemProduto>('imagens_produto');
    const localVars = this.getLocal<VarianteProduto>('variantes_produto');

    prods.push(newProd);
    localImgs.push(...newImgs);
    localVars.push(...newVars);

    this.saveLocal('produtos', prods);
    this.saveLocal('imagens_produto', localImgs);
    this.saveLocal('variantes_produto', localVars);

    const categories = this.getLocal<Categoria>('categorias');

    return {
      ...newProd,
      categoria: categories.find(c => c.id === id_categoria),
      imagens: newImgs,
      variantes: newVars
    };
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
    const slug = nome.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const updatedProdArgs = { id_categoria, nome, slug, descricao, preco, ativo };

    if (hasSupabaseConfig) {
      try {
        const { error: prodErr } = await supabase.from('produtos').update(updatedProdArgs).eq('id', id);
        if (!prodErr) {
          // Simplistic sync for edit: wipe prior and insert new structures
          await supabase.from('imagens_produto').delete().eq('id_produto', id);
          await supabase.from('variantes_produto').delete().eq('id_produto', id);

          const newImgs: ImagemProduto[] = imagens.map((img, i) => ({
            id: crypto.randomUUID ? crypto.randomUUID() : `img-${id}-${i}`,
            id_produto: id,
            url: img.url,
            ranking: img.ranking || i
          }));

          const newVars: VarianteProduto[] = variantes.map((v, i) => ({
            id: crypto.randomUUID ? crypto.randomUUID() : `var-${id}-${i}`,
            id_produto: id,
            designativo: v.designativo,
            tamanho: v.tamanho,
            cor: v.cor,
            preco: Number(v.preco),
            quantidade_stock: Number(v.quantidade_stock)
          }));

          if (newImgs.length > 0) await supabase.from('imagens_produto').insert(newImgs);
          if (newVars.length > 0) await supabase.from('variantes_produto').insert(newVars);

          const details = await this.getProductsDetalhados();
          return details.find(d => d.id === id) || null;
        }
      } catch (e) {
        console.error(e);
      }
    }

    // Local Storage update
    const prods = this.getLocal<Produto>('produtos');
    const localImgs = this.getLocal<ImagemProduto>('imagens_produto');
    const localVars = this.getLocal<VarianteProduto>('variantes_produto');

    const pIdx = prods.findIndex(p => p.id === id);
    if (pIdx === -1) return null;

    prods[pIdx] = { ...prods[pIdx], ...updatedProdArgs };
    this.saveLocal('produtos', prods);

    // Filter out old references
    const filteredImgs = localImgs.filter(img => img.id_produto !== id);
    const filteredVars = localVars.filter(v => v.id_produto !== id);

    const newImgs = imagens.map((img, i) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : `img-${id}-${i}-${Math.random().toString(36).substring(2,5)}`,
      id_produto: id,
      url: img.url,
      ranking: img.ranking || i
    }));

    const newVars = variantes.map((v, i) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : `var-${id}-${i}-${Math.random().toString(36).substring(2,5)}`,
      id_produto: id,
      designativo: v.designativo,
      tamanho: v.tamanho,
      cor: v.cor,
      preco: Number(v.preco),
      quantidade_stock: Number(v.quantidade_stock)
    }));

    filteredImgs.push(...newImgs);
    filteredVars.push(...newVars);

    this.saveLocal('imagens_produto', filteredImgs);
    this.saveLocal('variantes_produto', filteredVars);

    const categories = this.getLocal<Categoria>('categorias');

    return {
      ...prods[pIdx],
      categoria: categories.find(c => c.id === id_categoria),
      imagens: newImgs,
      variantes: newVars
    };
  }

  static async deleteProduct(id: string): Promise<boolean> {
    if (hasSupabaseConfig) {
      try {
        const { error } = await supabase.from('produtos').delete().eq('id', id);
        if (!error) return true;
      } catch (e) {
        console.error(e);
      }
    }

    const prods = this.getLocal<Produto>('produtos');
    const filtered = prods.filter(p => p.id !== id);
    if (filtered.length !== prods.length) {
      this.saveLocal('produtos', filtered);
      
      const imgs = this.getLocal<ImagemProduto>('imagens_produto').filter(im => im.id_produto !== id);
      const vars = this.getLocal<VarianteProduto>('variantes_produto').filter(v => v.id_produto !== id);
      this.saveLocal('imagens_produto', imgs);
      this.saveLocal('variantes_produto', vars);
      return true;
    }
    return false;
  }

  static async updateVariantStockDirect(variantId: string, novoStock: number): Promise<boolean> {
    if (hasSupabaseConfig) {
      try {
        const { error } = await supabase
          .from('variantes_produto')
          .update({ quantidade_stock: novoStock })
          .eq('id', variantId);
        if (!error) return true;
      } catch (e) {
        console.error(e);
      }
    }

    const vars = this.getLocal<VarianteProduto>('variantes_produto');
    const idx = vars.findIndex(v => v.id === variantId);
    if (idx !== -1) {
      vars[idx].quantidade_stock = novoStock;
      this.saveLocal('variantes_produto', vars);
      return true;
    }
    return false;
  }

  // ==========================================
  // ADDRESS AND ORDERS SERVICES
  // ==========================================

  static async getAddressesForUser(userId: string): Promise<Endereco[]> {
    if (hasSupabaseConfig) {
      try {
        const { data, error } = await supabase
          .from('enderecos')
          .select('*')
          .eq('id_usuario', userId);
        if (data && !error) return data as Endereco[];
      } catch (e) {
        console.error(e);
      }
    }
    return this.getLocal<Endereco>('enderecos').filter(e => e.id_usuario === userId);
  }

  static async createAddress(userId: string, provincia: string, municipio: string, bairro: string, rua: string, padrao: boolean = false): Promise<Endereco> {
    const newAddr: Endereco = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'addr-' + Math.random().toString(36).substring(2, 9),
      id_usuario: userId,
      provincia,
      municipio,
      bairro,
      rua,
      padrao
    };

    const addrs = this.getLocal<Endereco>('enderecos');
    if (padrao) {
      // Set others to non-default
      addrs.forEach(a => { if (a.id_usuario === userId) a.padrao = false; });
    }

    addrs.push(newAddr);
    this.saveLocal('enderecos', addrs);

    if (hasSupabaseConfig) {
      try {
        // Simple insert
        if (padrao) {
          await supabase.from('enderecos').update({ padrao: false }).eq('id_usuario', userId);
        }
        await supabase.from('enderecos').insert([newAddr]);
      } catch (e) {
        console.error(e);
      }
    }

    return newAddr;
  }

  static async getOrders(): Promise<PedidoDetalhado[]> {
    if (hasSupabaseConfig) {
      try {
        const { data, error } = await supabase
          .from('pedidos')
          .select(`
            *,
            usuarios(*),
            enderecos(*),
            itens_pedido(*)
          `)
          .order('criado_em', { ascending: false });

        if (data && !error) {
          return data.map((o: any) => ({
            ...o,
            usuario: o.usuarios,
            endereco: o.enderecos,
            itens: o.itens_pedido || []
          })) as PedidoDetalhado[];
        }
      } catch (e) {
        console.warn('Supabase fetch orders detailed failed, local storage fallback:', e);
      }
    }

    // Local Storage Join
    const pedidos = this.getLocal<Pedido>('pedidos');
    const users = this.getLocal<Usuario>('usuarios');
    const addresses = this.getLocal<Endereco>('enderecos');
    const orderItems = this.getLocal<ItemPedido>('itens_pedido');
    const variants = this.getLocal<VarianteProduto>('variantes_produto');

    return pedidos.map(o => {
      const u = users.find(usr => usr.id === o.id_usuario);
      const e = addresses.find(adr => adr.id === o.id_endereco);
      const items = orderItems.filter(item => item.id_pedido === o.id).map(it => {
        const v = variants.find(vr => vr.id === it.id_variante);
        return {
          ...it,
          variante: v
        };
      });

      return {
        ...o,
        usuario: u,
        endereco: e,
        itens: items
      };
    }).sort((a,b) => new Date(b.criado_em).getTime() - new Date(a.criado_em).getTime());
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
    // 1. OBRIGATÓRIO: Validar stock de todas as variantes antes de proceder!
    const variants = this.getLocal<VarianteProduto>('variantes_produto');
    
    for (const item of cartItems) {
      const vExist = variants.find(vr => vr.id === item.variante.id);
      if (!vExist) {
        return { order: null, error: `Variante do produto ${item.produto.nome} não encontrada!` };
      }
      if (vExist.quantidade_stock < item.quantidade) {
        return { order: null, error: `Stock insuficiente para ${item.produto.nome} (${item.variante.tamanho || ''} - ${item.variante.cor || ''}). Disponível: ${vExist.quantidade_stock} unidades.` };
      }
    }

    // 2. Criar pedido
    const newOrderId = crypto.randomUUID ? crypto.randomUUID() : 'ped-' + Math.random().toString(36).substring(2, 9);
    const newOrder: Pedido = {
      id: newOrderId,
      id_usuario,
      id_endereco,
      status: 'pago', // Simulated payment auto-approves
      subtotal,
      taxa_entrega,
      total,
      metodo_pagamento,
      criado_em: new Date().toISOString()
    };

    // 3. Criar itens do pedido e reduzir o stock
    const newItems: ItemPedido[] = cartItems.map((item, index) => ({
      id: crypto.randomUUID ? crypto.randomUUID() : `item-${newOrderId}-${index}`,
      id_pedido: newOrderId,
      id_variante: item.variante.id,
      nome_produto: `${item.produto.nome} (${item.variante.designativo || item.variante.tamanho || item.variante.cor})`,
      preco_unitario: item.variante.preco,
      quantidade: item.quantidade
    }));

    // Deduzir stock localmente
    variants.forEach(v => {
      const cItem = cartItems.find(ci => ci.variante.id === v.id);
      if (cItem) {
        v.quantidade_stock -= cItem.quantidade;
      }
    });

    // Salvar localmente
    const orders = this.getLocal<Pedido>('pedidos');
    const allOrderItems = this.getLocal<ItemPedido>('itens_pedido');

    orders.push(newOrder);
    allOrderItems.push(...newItems);

    this.saveLocal('pedidos', orders);
    this.saveLocal('itens_pedido', allOrderItems);
    this.saveLocal('variantes_produto', variants);

    // Enviar para o Supabase se disponível
    if (hasSupabaseConfig) {
      try {
        const { error: orderErr } = await supabase.from('pedidos').insert([newOrder]);
        if (!orderErr) {
          await supabase.from('itens_pedido').insert(newItems);
          
          // Deduzir stock no Supabase para cada item comprado
          for (const item of cartItems) {
            const currentStock = item.variante.quantidade_stock - item.quantidade;
            await supabase.from('variantes_produto').update({ quantidade_stock: currentStock }).eq('id', item.variante.id);
          }
        }
      } catch (e) {
        console.error('Supabase write order failed, kept in local state:', e);
      }
    }

    return { order: newOrder, error: null };
  }

  static async updateOrderStatus(orderId: string, status: Pedido['status']): Promise<boolean> {
    if (hasSupabaseConfig) {
      try {
        const { error } = await supabase
          .from('pedidos')
          .update({ status })
          .eq('id', orderId);
        if (!error) return true;
      } catch (e) {
        console.error(e);
      }
    }

    const orders = this.getLocal<Pedido>('pedidos');
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx !== -1) {
      orders[idx].status = status;
      this.saveLocal('pedidos', orders);
      return true;
    }
    return false;
  }

  // ==========================================
  // USERS LISTING SERVICES
  // ==========================================

  static async getUsers(): Promise<Usuario[]> {
    if (hasSupabaseConfig) {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('*')
          .order('nome', { ascending: true });
        if (data && !error) return data as Usuario[];
      } catch (e) {
        console.error(e);
      }
    }
    return this.getLocal<Usuario>('usuarios');
  }

  static async updateUserRole(userId: string, role: Usuario['role']): Promise<boolean> {
    if (hasSupabaseConfig) {
      try {
        const { error } = await supabase
          .from('usuarios')
          .update({ role })
          .eq('id', userId);
        if (!error) return true;
      } catch (e) {
        console.error(e);
      }
    }

    const users = this.getLocal<Usuario>('usuarios');
    const idx = users.findIndex(u => u.id === userId);
    if (idx !== -1) {
      users[idx].role = role;
      this.saveLocal('usuarios', users);
      return true;
    }
    return false;
  }

  // ==========================================
  // ANALYTICS & EVENTS LOGGER (Built-in)
  // ==========================================

  static async logEvent(
    tipo_evento: string,
    pagina: string,
    id_produto?: string | null,
    metadados?: Record<string, any>
  ): Promise<void> {
    this.initLocalStorageSchema();
    const visitorId = this.getVisitorId();
    const activeUser = await this.getCurrentUser();
    
    const eventObj: Evento = {
      id: crypto.randomUUID ? crypto.randomUUID() : 'ev-' + Math.random().toString(36).substring(2, 9),
      id_sessao: 'sessao-temp-' + visitorId.substring(0, 5),
      id_usuario: activeUser ? activeUser.id : null,
      id_visitante: visitorId,
      tipo_evento,
      pagina,
      id_produto: id_produto || null,
      metadados,
      criado_em: new Date().toISOString()
    };

    const events = this.getLocal<Evento>('eventos');
    events.push(eventObj);
    this.saveLocal('eventos', events);

    if (hasSupabaseConfig) {
      try {
        // Enviar silenciosamente em background
        supabase.from('eventos').insert([{
          id_sessao: 's1000000-0000-0000-0000-000000000001', // Conexão a sessão global de teste se não logada
          id_usuario: activeUser?.id || null,
          id_visitante: visitorId,
          tipo_evento,
          pagina,
          id_produto,
          metadados
        }]).then();
      } catch (e) {
        // Fail silently
      }
    }
  }

  static async getEvents(): Promise<Evento[]> {
    return this.getLocal<Evento>('eventos');
  }
}
