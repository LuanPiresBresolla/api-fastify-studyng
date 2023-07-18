import { knex as setupKnex, Knex } from 'knex';
import { env } from '../src/env';

const config: Knex.Config = {
  client: 'sqlite',
  connection: {
    filename: env.DATABASE_URL,
  },
  useNullAsDefault: true,
  migrations: {
    extension: 'ts',
    directory: './src/database/migrations'
  }
};

const knex = setupKnex(config);

export { config, knex };
