const { MongoClient } = require('mongodb');
const Realm = require('realm-web');
/* eslint-disable camelcase */
const { app_id } = require('../../realm_config.json');
const { mockPortfolios } = require('../fixtures');

describe('#findPorfolio', () => {
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
    collection = mongoClient.db().collection('portfolios');

    await collection.insertMany(mockPortfolios);
  });

  afterAll(async () => {
    await collection.deleteMany({});
    await mongoClient.close();
  });

  it('should return portfolio for given cif and portfolio code', async () => {
    let expectedPortfolio = mockPortfolios[1];
    const { cif, portfolioCode } = expectedPortfolio;

    const portfolio = await app.functions.findPortfolio(cif, portfolioCode);

    expectedPortfolio = await collection.findOne({ cif, portfolioCode }, { projection: { _id: 0 } });

    expect(portfolio).not.toBeNull();
    expect(portfolio).toStrictEqual(expectedPortfolio);
  });
});
