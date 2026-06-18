// TypeScript Type Definitions matching the femfashion Supabase Database Schema

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  password_hash: string;
  telefone?: string;
  role: 'cliente' | 'admin';
  criado_em?: string;
}

export interface Categoria {
  id: string;
  nome: string;
  slug: string;
  descricao?: string;
}

export interface Produto {
  id: string;
  id_categoria: string;
  nome: string;
  slug: string;
  descricao: string;
  preco: number; // Preço de vitrina/mostra
  ativo: boolean;
  criado_em?: string;
}

export interface ImagemProduto {
  id: string;
  id_produto: string;
  url: string;
  ranking: number;
}

export interface VarianteProduto {
  id: string;
  id_produto: string;
  designativo?: string;
  tamanho?: string;
  cor?: string;
  preco: number; // Preço transacional real
  quantidade_stock: number;
}

export interface Endereco {
  id: string;
  id_usuario: string;
  provincia: string;
  municipio: string;
  bairro: string;
  rua: string;
  padrao: boolean;
}

export interface Pedido {
  id: string;
  id_usuario?: string;
  id_endereco?: string;
  status: 'pendente' | 'pago' | 'processando' | 'enviado' | 'entregue' | 'cancelado';
  subtotal: number;
  taxa_entrega: number;
  total: number;
  metodo_pagamento: string; // 'MCX_EXPRESS' | 'UNITEL_MONEY'
  criado_em: string;
}

export interface ItemPedido {
  id: string;
  id_pedido: string;
  id_variante?: string;
  nome_produto: string;
  preco_unitario: number;
  quantidade: number;
}

// Analytics and A/B Testing types
export interface Sessao {
  id: string;
  id_usuario?: string | null;
  id_visitante: string;
  inicio: string;
  fim?: string | null;
  tipo_dispositivo: string;
  pais: string;
  cidade?: string;
}

export interface Evento {
  id: string;
  id_sessao: string;
  id_usuario?: string | null;
  id_visitante: string;
  tipo_evento: string; // Ex: 'visualizar_prod', 'adicionar_carrinho', 'checkout'
  pagina: string;
  id_produto?: string | null;
  metadados?: Record<string, any> | null;
  criado_em: string;
}

export interface HeatmapClick {
  id: string;
  id_sessao: string;
  pagina: string;
  componente_raw?: string;
  x: number;
  y: number;
  altura_tela: number;
  largura_tela: number;
  criado_em: string;
}

export interface TesteAB {
  id: string;
  nome: string;
  hipotese?: string;
  inicio: string;
  fim?: string | null;
  estado: 'ativo' | 'finalizado';
  percentual_teste: number;
}

export interface VarianteAB {
  id: string;
  id_teste: string;
  nome: string;
  detalhes_configuracao?: Record<string, any> | null;
}

export interface AtribuicaoAB {
  id: string;
  id_teste: string;
  id_variante: string;
  id_usuario?: string | null;
  id_visitante: string;
  timestamp: string;
}

// Extension type helpers for frontend convenience
export interface ProdutoDetalhado extends Produto {
  categoria?: Categoria;
  imagens: ImagemProduto[];
  variantes: VarianteProduto[];
}

export interface PedidoDetalhado extends Pedido {
  usuario?: Usuario;
  endereco?: Endereco;
  itens: (ItemPedido & { variante?: VarianteProduto })[];
}

export interface CartItem {
  produto: ProdutoDetalhado;
  variante: VarianteProduto;
  quantidade: number;
}
