const { MongoClient } = require('mongodb');
const Realm = require('realm-web');
/* eslint-disable camelcase */
const { app_id } = require('../../realm_config.json');
const { mockPortfolios } = require('../fixtures');

describe('#findPortfolioByCIF', () => {
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

  it('should return empty array', async () => {
    const expectedResult = [];

    const result = await app.functions.findPortfoliosByCIF('');

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return portfolios for given cif', async () => {
    const expectedResult = [
      {
        cif: 'HRSTBDHICE',
        portfolioCode: '001',
        name: 'Coba 1',
        createdAt: new Date('2023-08-10'),
        modifiedAt: new Date('2023-08-19'),
        products: [
          {
            productCode: 'SCHE',
            units: 100,
            currentNav: 1900,
            name: 'Schroder Dana Equity',
            productCategory: 'equity',
            imageUrl: '',
            investmentManager: {
              custodianBank: 'Bank BTPN',
              investmentManagerCode: 'SCH',
              name: 'Schroder',
            },
            sellFee: 0.2,
            buyFee: 0.2,
            capitalInvestment: 10000,
            tax: 0,
            navDate: new Date('2023-08-23'),
          },
        ],
      },
    ];

    const result = await app.functions.findPortfoliosByCIF(mockPortfolios[0].cif);

    expect(result).toStrictEqual(expectedResult);
  });
});
