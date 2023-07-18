import { randomUUID } from 'crypto';
import { FastifyInstance } from 'fastify';
import { z } from 'zod';

import { knex } from '../../database';
import { checkSessionIdExists } from '../middlewares/checkSessionIdExists';

export async function transactionsRoutes(app: FastifyInstance) {
  app.get('/:id', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies;

    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = paramsSchema.parse(request.params);

    const transaction = await knex('transactions')
      .where({ id, session_id: sessionId })
      .first();

    return { transaction };
  });

  app.get('/summary', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies;

    const summary = await knex('transactions')
      .where({ session_id: sessionId })
      .sum('amount', { as: 'amount' })
      .first();

    return { summary };
  });

  app.get('/', { preHandler: [checkSessionIdExists] }, async (request) => {
    const { sessionId } = request.cookies;

    const transactions = await knex('transactions')
      .where({ session_id: sessionId })
      .select();

    return { transactions };
  });

  app.post('/', async (request, reply) => {
    const transactionsSchema = z.object({
      title: z.string(),
      amount: z.number(),
      type: z.enum(['credit', 'debit']),
    });

    const { title, amount, type } = transactionsSchema.parse(request.body);

    let sessionId = request.cookies.sessionId;

    if (!sessionId) {
      sessionId = randomUUID();

      reply.cookie('sessionId', sessionId, {
        path: '/',
        maxAge: 1000 * 60 * 60 * 24 * 7, //7 days
      });
    }

    await knex('transactions').insert({
      id: randomUUID(),
      title,
      amount: type === 'credit' ? amount : amount * -1,
      session_id: sessionId,
    });

    return reply.status(201).send();
  });
}
