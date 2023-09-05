const { MongoClient } = require('mongodb');
const Realm = require('realm-web');
/* eslint-disable camelcase */
const _ = require('lodash');
const { app_id } = require('../../realm_config.json');
const { mockTransactions } = require('../fixtures');

describe('#findTransactions', () => {
  let collection;
  let mongoClient;
  let app;
  const cif = 'C6DTCTKBST';

  beforeAll(async () => {
    app = new Realm.App({ id: app_id });
    const credentials = Realm.Credentials.apiKey(process.env.REALM_API_KEY);
    app = await app.logIn(credentials);

    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_INSTANCES}/${process.env.DB_NAME}?${process.env.DB_OPTIONS}`;
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    collection = mongoClient.db().collection('transactions');

    const transactions = _.cloneDeep(mockTransactions);

    await collection.insertMany(transactions);
  });

  afterAll(async () => {
    await collection.deleteMany({});
    await mongoClient.close();
  });

  it('should return the found transaction with cif filter', async () => {
    const expectedTransactions = mockTransactions.filter((trx) => trx.cif === cif).slice(0, 6);

    const transactions = await app.functions.findTransactions(cif, { });

    expect(transactions).not.toBe([]);
    expect(transactions).toStrictEqual(expectedTransactions);
  });

  it('should return the found transaction with transactionType filter', async () => {
    const expectedTransactions = mockTransactions.filter((trx) => trx.type === 'BUY' && trx.cif === cif);

    const portfolio = await app.functions.findTransactions(cif, { transactionType: 'BUY' });

    expect(portfolio).not.toBeNull();
    expect(portfolio).toStrictEqual(expectedTransactions);
  });

  it('should return the found transaction with productCode filter', async () => {
    const expectedTransactions = mockTransactions.filter((trx) => trx.product.productCode === 'SCHE' && trx.cif === cif);

    const transactions = await app.functions.findTransactions(cif, { productCode: 'SCHE' });

    expect(transactions).not.toBe([]);
    expect(transactions).toStrictEqual(expectedTransactions);
  });

  it('should return the found transaction sorted by amount ordered ascending', async () => {
    const expectedTransactions = [mockTransactions[6], mockTransactions[7]];
    const transactions = await app.functions.findTransactions(cif, { sortBy: 'amount', order: 'asc', productCode: 'SCHO' });

    expect(transactions).not.toBe([]);
    expect(transactions).toStrictEqual(expectedTransactions);
  });

  it('should return the found transaction sorted by amount ordered descending', async () => {
    const expectedTransactions = [mockTransactions[7], mockTransactions[6]];
    const transactions = await app.functions.findTransactions(cif, { sortBy: 'amount', order: 'desc', productCode: 'SCHO' });

    expect(transactions).not.toBe([]);
    expect(transactions).toStrictEqual(expectedTransactions);
  });

  it('should return the found transaction sorted by created at ordered ascending', async () => {
    const expectedTransactions = [mockTransactions[6], mockTransactions[7]];
    const transactions = await app.functions.findTransactions(cif, { sortBy: 'createdAt', order: 'asc', productCode: 'SCHO' });

    expect(transactions).not.toBe([]);
    expect(transactions).toStrictEqual(expectedTransactions);
  });

  it('should return the found transaction sorted by created at ordered descdengin', async () => {
    const expectedTransactions = [mockTransactions[7], mockTransactions[6]];
    const transactions = await app.functions.findTransactions(cif, { sortBy: 'createdAt', order: 'desc', productCode: 'SCHO' });

    expect(transactions).not.toBe([]);
    expect(transactions).toStrictEqual(expectedTransactions);
  });
});
