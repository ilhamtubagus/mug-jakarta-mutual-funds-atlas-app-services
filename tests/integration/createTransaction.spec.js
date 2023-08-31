const { MongoClient } = require('mongodb');
const Realm = require('realm-web');
/* eslint-disable camelcase */
const { app_id } = require('../../realm_config.json');
const { mockTransactions, mockPaymentRequests } = require('../fixtures');

describe('#createTransaction', () => {
  let transactionCollection;
  let paymentRequestCollection;
  let mongoClient;
  let app;
  const transactionPayload = { ...mockTransactions[0] };
  const paymentRequestPayload = { ...mockPaymentRequests[0] };

  beforeAll(async () => {
    app = new Realm.App({ id: app_id });
    const credentials = Realm.Credentials.apiKey(process.env.REALM_API_KEY);
    app = await app.logIn(credentials);

    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_INSTANCES}/${process.env.DB_NAME}?${process.env.DB_OPTIONS}`;
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    transactionCollection = mongoClient.db().collection('transactions');
    paymentRequestCollection = mongoClient.db().collection('paymentRequests');
  });

  afterAll(async () => {
    await mongoClient.close();
  });

  afterEach(async () => {
    await transactionCollection.deleteMany({});
    await paymentRequestCollection.deleteMany({});
  });

  it('should create transaction and payment request', async () => {
    await app.functions.createTransaction(transactionPayload, paymentRequestPayload);

    const createdTransaction = await transactionCollection.findOne({ cif: transactionPayload.cif }, { projection: { _id: 0 } });
    const createdPaymentRequest = await paymentRequestCollection.findOne({ paymentCode: paymentRequestPayload.paymentCode }, { projection: { _id: 0 } });
    expect(createdTransaction).not.toBeNull();
    expect(createdPaymentRequest).not.toBeNull();
    expect(createdTransaction).toStrictEqual(transactionPayload);
    expect(createdPaymentRequest).toStrictEqual(paymentRequestPayload);
  });

  it('should not create transaction when failed insert payment request', async () => {
    try {
      const { expiredAt, ...unCompletePaymentRequestPayload } = paymentRequestPayload;

      await app.functions.createTransaction(transactionPayload, unCompletePaymentRequestPayload);
    } catch (e) {
      const createdTransaction = await transactionCollection.findOne({ cif: transactionPayload.cif }, { projection: { _id: 0 } });
      const createdPaymentRequest = await paymentRequestCollection.findOne({ paymentCode: paymentRequestPayload.paymentCode }, { projection: { _id: 0 } });
      expect(createdTransaction).toBeNull();
      expect(createdPaymentRequest).toBeNull();
    }
  });

  it('should not create transaction when failed insert payment request', async () => {
    try {
      const { transactionID, ...unCompleteTransactionPayload } = transactionPayload;

      await app.functions.createTransaction(unCompleteTransactionPayload, paymentRequestPayload);
    } catch (e) {
      const createdTransaction = await transactionCollection.findOne({ cif: transactionPayload.cif }, { projection: { _id: 0 } });
      const createdPaymentRequest = await paymentRequestCollection.findOne({ paymentCode: paymentRequestPayload.paymentCode }, { projection: { _id: 0 } });
      expect(createdTransaction).toBeNull();
      expect(createdPaymentRequest).toBeNull();
    }
  });
});
