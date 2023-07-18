import { beforeAll, afterAll, describe, it, expect, beforeEach } from 'vitest';
import { execSync } from 'child_process';
import request from 'supertest';

import { app } from '../app';

describe('Transactions routes', () => {
  beforeAll(async () => {
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    execSync('npm run knex migrate:rollback --all');
    execSync('npm run knex migrate:latest');
  });

  it('should be able create a new transaction', async () => {
    await request(app.server)
      .post('/transactions')
      .send({
        title: `Teste Spec - ${new Date().getTime()}`,
        amount: 5000,
        type: "credit"
      })
      .expect(201);
  });

  it('should be able list all transactions', async () => {
    const createTransaction = await request(app.server).post('/transactions').send({
      title: 'New Transactions Test Spec',
      amount: 5000,
      type: "credit"
    });

    const cookies = createTransaction.get('Set-Cookie');

    const listTransactions = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200);

    expect(listTransactions.body.transactions).toEqual([
      expect.objectContaining({
        title: 'New Transactions Test Spec',
        amount: 5000,
      }),
    ]);
  });

  it('should be able list a specific transaction', async () => {
    const createTransaction = await request(app.server).post('/transactions').send({
      title: 'New Transactions Test Spec',
      amount: 5000,
      type: "credit"
    });

    const cookies = createTransaction.get('Set-Cookie');

    const listTransactions = await request(app.server)
      .get('/transactions')
      .set('Cookie', cookies)
      .expect(200);

    const transactionId = listTransactions.body.transactions[0].id;

    const listTransactionId = await request(app.server)
      .get(`/transactions/${transactionId}`)
      .set('Cookie', cookies)
      .expect(200);

    expect(listTransactionId.body.transaction).toEqual(
      expect.objectContaining({
        title: 'New Transactions Test Spec',
        amount: 5000,
      }),
    );
  });

  it('should be able list summary resume transactions', async () => {
    const createTransaction = await request(app.server).post('/transactions').send({
      title: 'New Transactions Test Spec Credit',
      amount: 5000,
      type: "credit"
    });

    const cookies = createTransaction.get('Set-Cookie');

    await request(app.server).post('/transactions')
      .set('Cookie', cookies)
      .send({
        title: 'New Transactions Test Spec Debit',
        amount: 2000,
        type: "debit"
      });

    const summaryResponse = await request(app.server)
      .get('/transactions/summary')
      .set('Cookie', cookies)
      .expect(200);

    expect(summaryResponse.body.summary).toEqual({
      amount: 3000,
    });
  });
});
