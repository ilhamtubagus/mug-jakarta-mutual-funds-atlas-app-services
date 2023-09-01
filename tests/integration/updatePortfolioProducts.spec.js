const { MongoClient } = require('mongodb');
const Realm = require('realm-web');
/* eslint-disable camelcase */
const { app_id } = require('../../realm_config.json');
const { mockPortfolios } = require('../fixtures');

describe('#updatePortfolioProducts', () => {
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

    await collection.insertOne(mockPortfolios[0]);
  });

  afterAll(async () => {
    await collection.deleteMany({});
    await mongoClient.close();
  });

  it('should update portfolio products with given payload', async () => {
    const { cif, portfolioCode } = mockPortfolios[0];
    const updatedProducts = [];

    const portfolio = await app.functions
      .updatePortfolioProducts(cif, portfolioCode, updatedProducts);

    const expectedPortfolio = await collection
      .findOne({ cif, portfolioCode }, { projection: { _id: 0 } });
    expect(portfolio).not.toBeNull();
    expect(expectedPortfolio.products).toEqual(updatedProducts);
  });
});
