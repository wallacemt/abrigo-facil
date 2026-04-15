import { DB } from "@/config/database";
import { env } from "@/config/env";

export class StatusService {
  async getStatus() {
    const database: {
      status: string;
      latencia: string;
      conexoes?: JSON;
      versao?: JSON;
      erro?: string;
    } = {
      status: "",
      latencia: "",
    };
    const server: {
      status: string;
      ambiente: string;
      timezone: string;
      versao_node: string;
      plataforma: string;
      regiao: string;
    } = {
      status: "healthy",
      ambiente: env.NODE_ENV || "development",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      versao_node: process.version,
      plataforma: process.platform,
      regiao: "oregon-us-west",
    };

    try {
      const start = Date.now();
      await DB.query(`SELECT 1 as ping`);
      const latency = Date.now() - start;

      const stats = await DB.query(`SELECT version(), sum(numbackends) as connections FROM pg_stat_database`);
      database.status = "healthy";
      database.latencia = `${latency}ms`;
      database.conexoes = stats.rows[0];
      database.versao = stats.rows[1];
    } catch (err: unknown) {
      database.status = "unhealthy";
      database.erro = (err as Error).message;
    }

    return {
      updatedAt: new Date().toISOString(),
      database,
      server,
    };
  }
}
