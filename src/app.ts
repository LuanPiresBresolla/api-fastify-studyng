import fastify from 'fastify'
import { transactionsRoutes } from './routes/transactions';
import cookies from '@fastify/cookie';

const app = fastify()

app.register(cookies);
app.register(transactionsRoutes, { prefix: 'transactions' });

export { app };
