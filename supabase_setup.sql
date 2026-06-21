-- SQL Schema and Seed Data for femfashion
-- Can be copied and pasted directly into the Supabase SQL Editor

-- 1. DROP TABLES (for clean reinstall if necessary)
DROP TABLE IF EXISTS heatmap_clicks CASCADE;
DROP TABLE IF EXISTS eventos CASCADE;
DROP TABLE IF EXISTS sessao CASCADE;
DROP TABLE IF EXISTS atribuicoes_ab CASCADE;
DROP TABLE IF EXISTS variantes_ab CASCADE;
DROP TABLE IF EXISTS testes_ab CASCADE;
DROP TABLE IF EXISTS itens_pedido CASCADE;
DROP TABLE IF EXISTS pedidos CASCADE;
DROP TABLE IF EXISTS enderecos CASCADE;
DROP TABLE IF EXISTS variantes_produto CASCADE;
DROP TABLE IF EXISTS imagens_produto CASCADE;
DROP TABLE IF EXISTS produtos CASCADE;
DROP TABLE IF EXISTS categorias CASCADE;
DROP TABLE IF EXISTS usuarios CASCADE;

-- 2. CREATE TABLES

-- Tabela: usuarios
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    telefone VARCHAR(50),
    role VARCHAR(50) DEFAULT 'cliente' CHECK (role IN ('cliente', 'admin')),
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: categorias
CREATE TABLE categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    descricao TEXT,
    imagem_url TEXT
);

-- Tabela: produtos
CREATE TABLE produtos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_categoria UUID REFERENCES categorias(id) ON DELETE SET NULL,
    nome VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    descricao TEXT,
    preco DECIMAL(12, 2) NOT NULL DEFAULT 0.00, -- Preço de vitrine
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: imagens_produto
CREATE TABLE imagens_produto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_produto UUID REFERENCES produtos(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    ranking INT DEFAULT 0
);

-- Tabela: variantes_produto
CREATE TABLE variantes_produto (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_produto UUID REFERENCES produtos(id) ON DELETE CASCADE,
    designativo VARCHAR(255), -- Ex: "HD Lace Frontal Wig", "Premium Silk"
    tamanho VARCHAR(50),      -- Ex: "30 polegadas", "M", "L", "Único"
    cor VARCHAR(100),         -- Ex: "Preto Natural #1B", "Loiras Mechas"
    preco DECIMAL(12, 2) NOT NULL DEFAULT 0.00, -- Preço real do item comprado
    quantidade_stock INT NOT NULL DEFAULT 0
);

-- Tabela: enderecos
CREATE TABLE enderecos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID REFERENCES usuarios(id) ON DELETE CASCADE,
    provincia VARCHAR(100) NOT NULL,
    municipio VARCHAR(100) NOT NULL,
    bairro VARCHAR(100) NOT NULL,
    rua TEXT NOT NULL,
    padrao BOOLEAN DEFAULT FALSE
);

-- Tabela: pedidos
CREATE TABLE pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    id_endereco UUID REFERENCES enderecos(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'processando', 'enviado', 'entregue', 'cancelado')),
    subtotal DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    taxa_entrega DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    total DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    metodo_pagamento VARCHAR(50) NOT NULL, -- Ex: 'MCX_EXPRESS', 'UNITEL_MONEY'
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: itens_pedido
CREATE TABLE itens_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_pedido UUID REFERENCES pedidos(id) ON DELETE CASCADE,
    id_variante UUID REFERENCES variantes_produto(id) ON DELETE SET NULL,
    nome_produto VARCHAR(255) NOT NULL,
    preco_unitario DECIMAL(12, 2) NOT NULL,
    quantidade INT NOT NULL CHECK (quantidade > 0)
);

-- Tabela: sessao (Analytics)
CREATE TABLE sessao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_usuario UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    id_visitante UUID NOT NULL,
    inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fim TIMESTAMP WITH TIME ZONE,
    tipo_dispositivo VARCHAR(50),
    pais VARCHAR(100) DEFAULT 'Angola',
    cidade VARCHAR(100)
);

-- Tabela: eventos (Analytics)
CREATE TABLE eventos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sessao UUID REFERENCES sessao(id) ON DELETE CASCADE,
    id_usuario UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    id_visitante UUID NOT NULL,
    tipo_evento VARCHAR(100) NOT NULL, -- Ex: 'visualizar_prod', 'adicionar_carrinho', 'checkout'
    pagina VARCHAR(255) NOT NULL,
    id_produto UUID REFERENCES produtos(id) ON DELETE SET NULL,
    metadados JSONB,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela: heatmap_clicks
CREATE TABLE heatmap_clicks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_sessao UUID REFERENCES sessao(id) ON DELETE CASCADE,
    pagina VARCHAR(255) NOT NULL,
    componente_raw TEXT,
    x INT NOT NULL,
    y INT NOT NULL,
    altura_tela INT NOT NULL,
    largura_tela INT NOT NULL,
    criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabelas: testes_ab, variantes_ab, atribuicoes_ab
CREATE TABLE testes_ab (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    hipotese TEXT,
    inicio TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fim TIMESTAMP WITH TIME ZONE,
    estado VARCHAR(50) DEFAULT 'ativo' CHECK (estado IN ('ativo', 'finalizado')),
    percentual_teste INT DEFAULT 50
);

CREATE TABLE variantes_ab (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_teste UUID REFERENCES testes_ab(id) ON DELETE CASCADE,
    nome VARCHAR(255) NOT NULL,
    detalhes_configuracao JSONB
);

CREATE TABLE atribuicoes_ab (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    id_teste UUID REFERENCES testes_ab(id) ON DELETE CASCADE,
    id_variante UUID REFERENCES variantes_ab(id) ON DELETE CASCADE,
    id_usuario UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    id_visitante UUID NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. INTERMEDIATE SEED DATA

-- Categorias
INSERT INTO categorias (id, nome, slug, descricao) VALUES
('a1000000-0000-0000-0000-000000000001', 'Perucas & Extensões', 'perucas-extensoes', 'Sistemas de cabelo humano premium, front lace, e tecimentos de luxo.'),
('a2000000-0000-0000-0000-000000000002', 'Vestidos & Roupas', 'vestidos-roupas', 'Vestidos de festa, vestidos casuais, conjuntos modernos e alta costura feminina.'),
('a3000000-0000-0000-0000-000000000003', 'Sapatos de Luxo', 'sapatos', 'Saltos altos elegantes, sandálias, botas e calçados exclusivos.'),
('a4000000-0000-0000-0000-000000000004', 'Carteiras & Bolsas', 'bolsas', 'Bolsas de couro, clutches de festa e malas práticas para o dia-a-dia.'),
('a5000000-0000-0000-0000-000000000005', 'Cosméticos & Maquilhagem', 'cosmeticos', 'Batom, bases premium, cuidados de pele específicos e kits de beleza.'),
('a6000000-0000-0000-0000-000000000006', 'Jóias e Acessórios', 'joias-acessorios', 'Brincos de ouro, colares finos, pulseiras cravejadas e anéis de noivado.');

-- Usuários (Admin Pré-configurado para desenvolvimento e teste)
-- Password hash usa SHA-256 (admin123 e cliente123)
INSERT INTO usuarios (id, nome, email, password_hash, telefone, role) VALUES
('f1000000-0000-0000-0000-000000000001', 'Administrador FemFashion', 'admin@femfashion.ao', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', '+244923000001', 'admin'),
('f2000000-0000-0000-0000-000000000002', 'Helena Patrício', 'helena@gmail.com', '09a31a7001e261ab1e056182a71d3cf57f582ca9a29cff5eb83be0f0549730a9', '+244931999888', 'cliente');

-- Endereços iniciais para o utilizador de teste Helena
INSERT INTO enderecos (id, id_usuario, provincia, municipio, bairro, rua, padrao) VALUES
('c1000000-0000-0000-0000-000000000001', 'f2000000-0000-0000-0000-000000000002', 'Luanda', 'Belas', 'Talatona', 'Rua da Samba, Via AL12, Condomínio Girassol', true);

-- Produtos

-- Categoria 1: Perucas
INSERT INTO produtos (id, id_categoria, nome, slug, descricao, preco, ativo) VALUES
('d1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Peruca Lace Front Cabelo Humano Premium', 'peruca-lace-front-premium', 'Peruca de cabelo humano 100% virgem de qualidade superior. Lace HD ultra fina que se funde perfeitamente com a pele para um aspeto incrivelmente natural. Pode ser pintada, alisada e ondulada.', 120000.00, true),
('d1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Peruca Bob Wig Curta Lace Front', 'peruca-bob-wig-curta', 'Corte Bob clássico e sofisticado com cabelo humano liso sedoso. Comprimento de 12 a 16 polegadas. Fácil e rápida de instalar, ideal para o uso diário.', 85000.00, true);

-- Categoria 2: Vestidos
INSERT INTO produtos (id, id_categoria, nome, slug, descricao, preco, ativo) VALUES
('d2000000-0000-0000-0000-000000000001', 'a2000000-0000-0000-0000-000000000002', 'Vestido de Gala Luanda Gold', 'vestido-gala-luanda-gold', 'Um deslumbrante vestido de festa com lantejoulas douradas bordadas à mão, decote em V profundo e fenda lateral dramática. Perfeito para celebrações luxuosas.', 75000.00, true),
('d2000000-0000-0000-0000-000000000002', 'a2000000-0000-0000-0000-000000000002', 'Vestido de Verão Estampado Kimbundu', 'vestido-verao-kimbundu', 'Vestido leve de algodão premium com padrão étnico africano vibrante em tons de laranja, azul e amarelo. Cortes modernos perfeitos para dias ensolarados em Luanda.', 32000.00, true);

-- Categoria 3: Sapatos
INSERT INTO produtos (id, id_categoria, nome, slug, descricao, preco, ativo) VALUES
('d3000000-0000-0000-0000-000000000001', 'a3000000-0000-0000-0000-000000000003', 'Sandália Salto Alto Cravejada Diamond', 'sandalia-salto-alto-diamond', 'Sandália de salto alto fino agulha de 10cm, com tiras frontas cravejadas de cristais brilhantes. Design luxuoso e salto extremamente confortável.', 68000.00, true),
('d3000000-0000-0000-0000-000000000002', 'a3000000-0000-0000-0000-000000000003', 'Scarpin em Pele de Nobreza Nude', 'scarpin-pele-norte-nude', 'Sapato scarpin clássico em couro legítimo texturizado na cor nude. O complemento universal e chique perfeito para o escritório ou jantares VIP.', 54000.00, true);

-- Categoria 4: Bolsas
INSERT INTO produtos (id, id_categoria, nome, slug, descricao, preco, ativo) VALUES
('d4000000-0000-0000-0000-000000000001', 'a4000000-0000-0000-0000-000000000004', 'Mala de Ombro Couro Elegance', 'mala-ombro-couro-elegance', 'Mala de ombro estruturada em couro legítimo com fecho banhado a ouro e assinatura exclusiva de metal. Prática, requintada e com amplo espaço interno.', 95000.00, true);

-- Categoria 5: Cosméticos
INSERT INTO produtos (id, id_categoria, nome, slug, descricao, preco, ativo) VALUES
('d5000000-0000-0000-0000-000000000001', 'a5000000-0000-0000-0000-000000000005', 'Batom Matte Hydra Satin Especial Melanin', 'batom-matte-hydra-satin', 'Gama de batons de luxo desenvolvidos especialmente para complementar o tom de pele de mulheres negras. Fórmula super hidratante de longa duração com acabamento acetinado mate.', 15000.00, true);

-- Categoria 6: Jóias
INSERT INTO produtos (id, id_categoria, nome, slug, descricao, preco, ativo) VALUES
('d6000000-0000-0000-0000-000000000001', 'a6000000-0000-0000-0000-000000000006', 'Brincos de Argolas Chappé 18k GP', 'brincos-argolas-chappe-18k', 'Argolas clássicas elegantes banhadas a ouro 18 quilates com design em espiral brilhante. Leves e dermatologicamente seguras para peles sensíveis.', 22000.00, true);


-- Imagens dos Produtos (Fotos com modelos predominantemente negras, de alta classe em CDNs conhecidos)
INSERT INTO imagens_produto (id_produto, url, ranking) VALUES
-- Peruca Lace Front Premium
('d1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1620331713537-bca9da369e80?auto=format&fit=crop&q=80&w=800', 1),
('d1000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1595959183075-c1d945133630?auto=format&fit=crop&q=80&w=800', 2),

-- Peruca Bob Wig Curta
('d1000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1605497746444-ac9dbd324ce4?auto=format&fit=crop&q=80&w=800', 1),

-- Vestido Gala Luanda Gold
('d2000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&q=80&w=800', 1),
('d2000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800', 2),

-- Vestido de Verão Kimbundu
('d2000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?auto=format&fit=crop&q=80&w=800', 1),

-- Sandália Diamond
('d3000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1535043934128-cf0b28d52f95?auto=format&fit=crop&q=80&w=800', 1),

-- Scarpin Nude
('d3000000-0000-0000-0000-000000000002', 'https://images.unsplash.com/photo-1539185441755-769473a23570?auto=format&fit=crop&q=80&w=800', 1),

-- Mala Ombro Couro Elegance
('d4000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=800', 1),

-- Batom Especial Melanin
('d5000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&q=80&w=800', 1),

-- Argolas Chappé 18k
('d6000000-0000-0000-0000-000000000001', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&q=80&w=800', 1);


-- Variantes do Produto (variantes_produto)

-- Peruca Lace Front Premium Variantes
INSERT INTO variantes_produto (id, id_produto, designativo, tamanho, cor, preco, quantidade_stock) VALUES
('e1000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'HD Lace Frontal 28"', '28 polegadas', 'Preto Natural #1B', 120000.00, 15),
('e1000000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000001', 'HD Lace Frontal 32"', '32 polegadas', 'Preto Natural #1B', 145000.00, 8),
('e1000000-0000-0000-0000-000000000003', 'd1000000-0000-0000-0000-000000000001', 'HD Lace Frontal Blonde 30"', '30 polegadas', 'Loiro Dourado Mechas #27', 155000.00, 4);

-- Peruca Bob Wig Curta Variantes
INSERT INTO variantes_produto (id, id_produto, designativo, tamanho, cor, preco, quantidade_stock) VALUES
('e1000000-0000-0000-0000-000000000004', 'd1000000-0000-0000-0000-000000000002', 'Silk Top Bob 12"', '12 polegadas', 'Preto Natural #1B', 85000.00, 12),
('e1000000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000002', 'Silk Top Bob 16"', '16 polegadas', 'Chocolate Escuro #4', 98000.00, 2); -- Limite baixo para teste de alertas!

-- Vestido Gala Luanda Gold Variantes
INSERT INTO variantes_produto (id, id_produto, designativo, tamanho, cor, preco, quantidade_stock) VALUES
('e2000000-0000-0000-0000-000000000001', 'd2000000-0000-0000-0000-000000000001', 'Corte Real S', 'S', 'Dourado Real', 75000.00, 6),
('e2000000-0000-0000-0000-000000000002', 'd2000000-0000-0000-0000-000000000001', 'Corte Real M', 'M', 'Dourado Real', 75000.00, 10),
('e2000000-0000-0000-0000-000000000003', 'd2000000-0000-0000-0000-000000000001', 'Corte Real L', 'L', 'Dourado Real', 78000.00, 0); -- Sem stock para teste!

-- Vestido de Verão Kimbundu Variantes
INSERT INTO variantes_produto (id, id_produto, designativo, tamanho, cor, preco, quantidade_stock) VALUES
('e2000000-0000-0000-0000-000000000004', 'd2000000-0000-0000-0000-000000000002', 'Padrão Laranja S', 'S', 'Estampa Laranja/Azul', 32000.00, 18),
('e2000000-0000-0000-0000-000000000005', 'd2000000-0000-0000-0000-000000000002', 'Padrão Laranja M', 'M', 'Estampa Laranja/Azul', 32000.00, 24),
('e2000000-0000-0000-0000-000000000006', 'd2000000-0000-0000-0000-000000000002', 'Padrão Laranja L', 'L', 'Estampa Laranja/Azul', 32000.00, 15);

-- Sandália Diamond Variantes
INSERT INTO variantes_produto (id, id_produto, designativo, tamanho, cor, preco, quantidade_stock) VALUES
('e3000000-0000-0000-0000-000000000001', 'd3000000-0000-0000-0000-000000000001', 'Prateada Diamond 37', '37', 'Prata Cristais', 68000.00, 5),
('e3000000-0000-0000-0000-000000000002', 'd3000000-0000-0000-0000-000000000001', 'Prateada Diamond 38', '38', 'Prata Cristais', 68000.00, 8),
('e3000000-0000-0000-0000-000000000003', 'd3000000-0000-0000-0000-000000000001', 'Prateada Diamond 39', '39', 'Prata Cristais', 68000.00, 6);

-- Scarpin Nude Variantes
INSERT INTO variantes_produto (id, id_produto, designativo, tamanho, cor, preco, quantidade_stock) VALUES
('e3000000-0000-0000-0000-000000000004', 'd3000000-0000-0000-0000-000000000002', 'Scarpin Classic 36', '36', 'Couro Nude', 54000.00, 4),
('e3000000-0000-0000-0000-000000000005', 'd3000000-0000-0000-0000-000000000002', 'Scarpin Classic 37', '37', 'Couro Nude', 54000.00, 9),
('e3000000-0000-0000-0000-000000000006', 'd3000000-0000-0000-0000-000000000002', 'Scarpin Classic 38', '38', 'Couro Nude', 54000.00, 11);

-- Mala Ombro Couro Elegance Variantes
INSERT INTO variantes_produto (id, id_produto, designativo, tamanho, cor, preco, quantidade_stock) VALUES
('e4000000-0000-0000-0000-000000000001', 'd4000000-0000-0000-0000-000000000001', 'Black Gold', 'Média', 'Preto Onyx Gold', 95000.00, 7),
('e4000000-0000-0000-0000-000000000002', 'd4000000-0000-0000-0000-000000000001', 'Emerald Gold', 'Média', 'Verde Esmeralda Gold', 95000.00, 3);

-- Batom Satin Variantes
INSERT INTO variantes_produto (id, id_produto, designativo, tamanho, cor, preco, quantidade_stock) VALUES
('e5000000-0000-0000-0000-000000000001', 'd5000000-0000-0000-0000-000000000001', 'Melanin Rich 01', 'Padrão', 'Tom Mel 01', 15000.00, 40),
('e5000000-0000-0000-0000-000000000002', 'd5000000-0000-0000-0000-000000000001', 'Cocoa Butter 03', 'Padrão', 'Tom Chocolate 03', 15000.00, 35);

-- Brincos Argolas Variantes
INSERT INTO variantes_produto (id, id_produto, designativo, tamanho, cor, preco, quantidade_stock) VALUES
('e6000000-0000-0000-0000-000000000001', 'd6000000-0000-0000-0000-000000000001', 'Espiral Padrão 5cm', '5cm diâmetro', 'Ouro Amarelo 18k', 22000.00, 20),
('e6000000-0000-0000-0000-000000000002', 'd6000000-0000-0000-0000-000000000001', 'Espiral Max 7cm', '7cm diâmetro', 'Ouro Amarelo 18k', 26000.00, 10);


-- Pedidos Iniciais de Exemplo (para o dashboard já ter dados e gráficos reais!)
INSERT INTO pedidos (id, id_usuario, id_endereco, status, subtotal, taxa_entrega, total, metodo_pagamento, criado_em) VALUES
('f1000000-0000-0000-0000-000000000001', 'f2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'pago', 152000.00, 3500.00, 155500.00, 'MCX_EXPRESS', CURRENT_TIMESTAMP - INTERVAL '3 days'),
('f1000000-0000-0000-0000-000000000002', 'f2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'processando', 95000.00, 3500.00, 98500.00, 'UNITEL_MONEY', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('f1000000-0000-0000-0000-000000000003', 'f2000000-0000-0000-0000-000000000002', 'c1000000-0000-0000-0000-000000000001', 'pendente', 120000.00, 3500.00, 123500.00, 'MCX_EXPRESS', CURRENT_TIMESTAMP);

-- Itens do pedidos iniciais
INSERT INTO itens_pedido (id_pedido, id_variante, nome_produto, preco_unitario, quantidade) VALUES
('f1000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000002', 'Vestido de Gala Luanda Gold (Corte Real M)', 75000.00, 1),
('f1000000-0000-0000-0000-000000000001', 'e2000000-0000-0000-0000-000000000005', 'Vestido de Verão Kimbundu (Padrão Laranja M)', 32000.00, 1),
('f1000000-0000-0000-0000-000000000001', 'e5000000-0000-0000-0000-000000000001', 'Batom Matte Hydra Satin Especial Melanin (Melanin Rich 01)', 15000.00, 3),

('f1000000-0000-0000-0000-000000000002', 'e4000000-0000-0000-0000-000000000001', 'Mala de Ombro Couro Elegance (Black Gold)', 95000.00, 1),

('f1000000-0000-0000-0000-000000000003', 'e1000000-0000-0000-0000-000000000001', 'Peruca Lace Front Cabelo Humano Premium (HD Lace Frontal 28")', 120000.00, 1);
