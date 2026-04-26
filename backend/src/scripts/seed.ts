import 'dotenv/config';
import argon2 from 'argon2';
import { v4 as uuid } from 'uuid';
import { db, closeDatabasePool } from '@/config/database';

type SeedUser = {
  nome: string;
  email: string;
  perfil: 'voluntario' | 'coordenador';
  senha: string;
};

type SeedAbrigo = {
  nome: string;
  endereco: string;
  latitude: number;
  longitude: number;
  capacidade_total: number;
  vagas_disponiveis: number;
  ativo: boolean;
  criado_por_usuario_email: string;
};

const seedUsers: SeedUser[] = [
  { nome: 'Coordenadora Maria', email: 'coordenadora@abrigofacil.local', perfil: 'coordenador', senha: 'Abc@123456' },
  { nome: 'Voluntario Joao', email: 'voluntario@abrigofacil.local', perfil: 'voluntario', senha: 'Abc@123456' },
];

const seedAbrigos: SeedAbrigo[] = [
  {
    nome: "Colégio Estadual Kleber Pacheco",
    endereco: "R. Numa Pompílio Bitencourt, S/N - Pernambués, Salvador - BA, 41100-170",
    latitude: -12.971704,
    longitude: -38.471609,
    capacidade_total: 100,
    vagas_disponiveis: 100,
    ativo: true,
    criado_por_usuario_email: "coordenadora@abrigofacil.local"
  },
  {
    nome: "Ginásio Municipal de Salvador",
    endereco: "Av. Oceânica, 500 - Stella Maris, Salvador - BA",
    latitude: -12.9253,
    longitude: -38.4631,
    capacidade_total: 150,
    vagas_disponiveis: 150,
    ativo: true,
    criado_por_usuario_email: "coordenadora@abrigofacil.local"
  },
];

const insertUsuarios = async () => {
  for (const user of seedUsers) {
    const senhaHash = await argon2.hash(user.senha);
    await db.query(
      `
      INSERT INTO usuarios (id, nome, email, senha_hash, perfil)
      VALUES ($1, $2, $3, $4, $5)
    `,
      [uuid(), user.nome, user.email, senhaHash, user.perfil]
    );
  }
};

const insertAbrigos = async () => {
  for (const abrigo of seedAbrigos) {
    const user = await db.query(`SELECT id FROM usuarios WHERE email = $1`, [abrigo.criado_por_usuario_email]);
    const criadoPorId = user.rows[0]?.id;

    await db.query(
      `
      INSERT INTO abrigos (
        id, nome, endereco, latitude, longitude,
        capacidade_total, vagas_disponiveis, ativo,
        codigo_checkin, criado_por_usuario_id
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    `,
      [
        uuid(),
        abrigo.nome,
        abrigo.endereco,
        abrigo.latitude,
        abrigo.longitude,
        abrigo.capacidade_total,
        abrigo.vagas_disponiveis,
        abrigo.ativo,
        abrigo.nome.slice(0, 3).toUpperCase() + '-' + Math.floor(Math.random() * 900 + 100),
        criadoPorId,
      ]
    );
  }
};

const runSeed = async () => {
  await db.withTransaction(async () => {
    await insertUsuarios();
    await insertAbrigos();
  });
};

(async () => {
  try {
    await runSeed();
    console.log('Seed aplicada com sucesso!');
  } catch (error) {
    console.error('Erro ao aplicar seed:', error);
  } finally {
    await closeDatabasePool();
  }
})();
