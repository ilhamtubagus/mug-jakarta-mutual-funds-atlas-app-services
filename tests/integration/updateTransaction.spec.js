const { MongoClient } = require('mongodb');
const Realm = require('realm-web');
/* eslint-disable camelcase */
const { app_id } = require('../../realm_config.json');
const { mockTransactions } = require('../fixtures');

describe('#updateTransaction', () => {
  const now = new Date();
  let transactionCollection;
  let mongoClient;
  let app;
  const transactionPayload = { ...mockTransactions[0], modifiedAt: now, createdAt: now };
  const updateTransactionPayload = { ...transactionPayload, status: 'SETTLED' };

  beforeAll(async () => {
    app = new Realm.App({ id: app_id });
    const credentials = Realm.Credentials.apiKey(process.env.REALM_API_KEY);
    app = await app.logIn(credentials);

    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_INSTANCES}/${process.env.DB_NAME}?${process.env.DB_OPTIONS}`;
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    transactionCollection = mongoClient.db().collection('transactions');
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  afterEach(async () => {
    await transactionCollection.deleteMany({});
  });

  beforeEach(async () => {
    await transactionCollection.insertOne(transactionPayload);
  });

  it('should update transaction when modified supplied', async () => {
    await app.functions.updateTransaction(updateTransactionPayload);

    const updatedTransaction = await transactionCollection.findOne({ cif: updateTransactionPayload.cif }, { projection: { _id: 0 } });
    expect(updatedTransaction).toStrictEqual(updateTransactionPayload);
  });

  it('should update transaction when modified at not supplied', async () => {
    const { modifiedAt, ...updateTransactionPayloadWithoutModifiedAt } = updateTransactionPayload;
    await app.functions.updateTransaction(updateTransactionPayloadWithoutModifiedAt);

    const updatedTransaction = await transactionCollection.findOne({ cif: updateTransactionPayload.cif }, { projection: { _id: 0 } });
    expect(updatedTransaction.modifiedAt).not.toEqual(now);
  });
});
