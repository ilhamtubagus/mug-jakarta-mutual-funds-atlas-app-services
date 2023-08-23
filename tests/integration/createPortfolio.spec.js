const { MongoClient } = require('mongodb');
const Realm = require('realm-web');
/* eslint-disable camelcase */
const { app_id } = require('../../realm_config.json');
const { mockPortfolios } = require('../fixtures');

describe('#createPortfolio', () => {
  let collection;
  let mongoClient;
  let app;
  const portfolioPayload = {
    ...mockPortfolios[1],
  };

  beforeAll(async () => {
    app = new Realm.App({ id: app_id });
    const credentials = Realm.Credentials.apiKey(process.env.REALM_API_KEY);
    app = await app.logIn(credentials);

    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_INSTANCES}/${process.env.DB_NAME}?${process.env.DB_OPTIONS}`;
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    collection = mongoClient.db().collection('portfolios');
  });

  afterAll(async () => {
    await collection.deleteMany({});
    await mongoClient.close();
  });

  it('should create portfolio', async () => {
    await app.functions.createPortfolio(portfolioPayload);

    const createdPortfolio = await collection.findOne({ cif: portfolioPayload.cif });
    expect(createdPortfolio).not.toBeNull();
  });
});
