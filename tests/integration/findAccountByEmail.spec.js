const { MongoClient } = require('mongodb');
const Realm = require('realm-web');
/* eslint-disable camelcase */
const { app_id } = require('../../realm_config.json');

describe('#findAccountByEmail', () => {
  let collection;
  let mongoClient;
  let app;
  const accountPayload = {
    fullName: 'Fian',
    email: 'ilhamta27@gmail.com',
    password: 'U2FsdGVkX180W7K5HQmDy7oIn5n6DpvHGysGofwI2H8=',
    nik: '3302210402990001',
    dateOfBirth: '02-01-1999',
    cif: '1ADSA1ADSA',
    riskProfile: 'aggressive',
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  beforeAll(async () => {
    app = new Realm.App({ id: app_id });
    const credentials = Realm.Credentials.apiKey(process.env.REALM_API_KEY);
    app = await app.logIn(credentials);

    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_INSTANCES}/${process.env.DB_NAME}?${process.env.DB_OPTIONS}`;
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    collection = mongoClient.db().collection('accounts');

    await collection.insertOne(accountPayload);
  });

  afterAll(async () => {
    await collection.deleteMany({});
    await mongoClient.close();
  });

  it('should return account for given cif', async () => {
    const account = await app.functions.findAccountByEmail(accountPayload.email);

    const expectedAccount = await collection.findOne({ email: accountPayload.email }, { projection: { _id: 0, password: 0 } });

    expect(account).not.toBeNull();
    expect(account).toStrictEqual(expectedAccount);
  });
});
