import { knex as setupKnex, Knex } from 'knex';
import { env } from '../src/env';

const connectionSqlite: Knex.StaticConnectionConfig | Knex.ConnectionConfigProvider = {
  filename: env.DATABASE_URL,
};

const config: Knex.Config = {
  client: env.DATABASE_CLIENT,
  connection: env.DATABASE_CLIENT === 'sqlite' ? connectionSqlite : env.DATABASE_URL,
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './database/migrations'
  }
};

const knex = setupKnex(config);

export { config, knex };
