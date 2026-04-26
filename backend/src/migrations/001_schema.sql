-- 001_schema.sql

-- Ativa extensão necessária
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash TEXT NOT NULL,
    perfil VARCHAR(50) NOT NULL CHECK (perfil IN ('voluntario', 'coordenador')),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de abrigos
CREATE TABLE IF NOT EXISTS abrigos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    endereco TEXT NOT NULL,
    latitude NUMERIC(10, 7) NOT NULL,
    longitude NUMERIC(10, 7) NOT NULL,
    capacidade_total INTEGER NOT NULL CHECK (capacidade_total > 0),
    vagas_disponiveis INTEGER NOT NULL CHECK (vagas_disponiveis >= 0),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
    codigo_checkin VARCHAR(7) NOT NULL,
    criado_por_usuario_id UUID REFERENCES usuarios(id),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de pessoas
CREATE TABLE IF NOT EXISTS pessoas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nome VARCHAR(255) NOT NULL,
    descricao TEXT,
    foto_url TEXT,
    status VARCHAR(50) NOT NULL DEFAULT 'desaparecida' CHECK (status IN ('desaparecida', 'em_abrigo', 'encontrada')),
    contato_buscador VARCHAR(255),
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Tabela de checkins
CREATE TABLE IF NOT EXISTS checkins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pessoa_id UUID NOT NULL REFERENCES pessoas(id) ON DELETE CASCADE,
    abrigo_id UUID NOT NULL REFERENCES abrigos(id),
    usuario_id UUID REFERENCES usuarios(id),
    data_entrada TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    data_saida TIMESTAMPTZ,
    criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_abrigos_ativo ON abrigos (ativo);
CREATE INDEX IF NOT EXISTS idx_pessoas_nome ON pessoas (nome);
CREATE INDEX IF NOT EXISTS idx_pessoas_status ON pessoas (status);
CREATE INDEX IF NOT EXISTS idx_checkins_pessoa ON checkins (pessoa_id);
CREATE INDEX IF NOT EXISTS idx_checkins_abrigo ON checkins (abrigo_id);
CREATE INDEX IF NOT EXISTS idx_checkins_ativo_por_pessoa ON checkins (pessoa_id) WHERE data_saida IS NULL;

-- Popula código de checkin nos abrigos existentes
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'abrigos_codigo_checkin_key') THEN
        ALTER TABLE abrigos ADD CONSTRAINT abrigos_codigo_checkin_key UNIQUE (codigo_checkin);
    END IF;

    UPDATE abrigos
    SET codigo_checkin = UPPER(
        SUBSTRING(REPLACE(id::text, '-', ''), 1, 3) || '-' || SUBSTRING(REPLACE(id::text, '-', ''), 4, 3)
    )
    WHERE codigo_checkin IS NULL;
END $$;
