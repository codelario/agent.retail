import { Pool } from 'pg';
import type { Client, IClientRepository } from '../usecases/types/IClientRepository';

// Pool de conexiones — se crea una vez y se reutiliza en warm starts
const pool = new Pool({
  connectionString: process.env['DATABASE_URL'],
  ssl: { rejectUnauthorized: false }, // requerido por Supabase
});

export class SupabaseClientRepository implements IClientRepository {
  async findAll(): Promise<Client[]> {
    const result = await pool.query<Client>(
      'SELECT id, name, email, status FROM clients ORDER BY name'
    );
    return result.rows;
  }

  async findByStatus(status: string): Promise<Client[]> {
    const result = await pool.query<Client>(
      'SELECT id, name, email, status FROM clients WHERE status = $1 ORDER BY name',
      [status]
    );
    return result.rows;
  }

  async save(client: Omit<Client, 'id'>): Promise<void> {
    await pool.query(
      'INSERT INTO clients (name, email, status) VALUES ($1, $2, $3)',
      [client.name, client.email, client.status]
    );
  }
}
