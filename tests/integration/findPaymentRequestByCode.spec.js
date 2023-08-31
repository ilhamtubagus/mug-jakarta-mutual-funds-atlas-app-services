const { MongoClient } = require('mongodb');
const Realm = require('realm-web');
/* eslint-disable camelcase */
// eslint-disable-next-line import/no-extraneous-dependencies
const moment = require('moment');
const { app_id } = require('../../realm_config.json');

describe('#findPaymentRequestByCode', () => {
  let collection;
  let mongoClient;
  let app;
  const paymentRequestPayload = {
    transactionID: '7KTLMBEAZ9CYIVX',
    paymentCode: '7NMOUNHONJSAHFL',
    expiredAt: moment().add(5, 'minutes').toDate(),
  };

  beforeAll(async () => {
    app = new Realm.App({ id: app_id });
    const credentials = Realm.Credentials.apiKey(process.env.REALM_API_KEY);
    app = await app.logIn(credentials);

    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_INSTANCES}/${process.env.DB_NAME}?${process.env.DB_OPTIONS}`;
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    collection = mongoClient.db().collection('paymentRequests');

    await collection.insertOne(paymentRequestPayload);
  });

  afterAll(async () => {
    // await collection.deleteMany({});
    await mongoClient.close();
  });

  it('should return payment request for given code', async () => {
    const { paymentCode } = paymentRequestPayload;

    const paymentRequest = await app.functions.findPaymentRequestByCode(paymentCode);

    const expectedAccount = await collection.findOne({ paymentCode });
    expect(paymentRequest).not.toBeNull();
    expect(paymentRequest).toStrictEqual(expectedAccount);
  });
});
