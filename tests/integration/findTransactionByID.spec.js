const { MongoClient } = require('mongodb');
const Realm = require('realm-web');
/* eslint-disable camelcase */
const { app_id } = require('../../realm_config.json');
const { mockTransactions } = require('../fixtures');

describe('#findTransactionByID', () => {
  let collection;
  let mongoClient;
  let app;

  beforeAll(async () => {
    app = new Realm.App({ id: app_id });
    const credentials = Realm.Credentials.apiKey(process.env.REALM_API_KEY);
    app = await app.logIn(credentials);

    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_INSTANCES}/${process.env.DB_NAME}?${process.env.DB_OPTIONS}`;
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    collection = mongoClient.db().collection('transactions');

    await collection.insertMany(mockTransactions);
  });

  afterAll(async () => {
    await collection.deleteMany({});
    await mongoClient.close();
  });

  it('should return transaction for transaction id', async () => {
    let expectedTransactions = mockTransactions[0];
    const { transactionID } = expectedTransactions;

    const portfolio = await app.functions.findTransactionByID(transactionID);

    expectedTransactions = await collection.findOne({ transactionID }, { projection: { _id: 0 } });

    expect(portfolio).not.toBeNull();
    expect(portfolio).toStrictEqual(expectedTransactions);
  });
});
