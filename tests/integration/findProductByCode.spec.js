const { MongoClient } = require('mongodb');
const Realm = require('realm-web');
/* eslint-disable camelcase */
const { app_id } = require('../../realm_config.json');
const { mockProducts, mockNavs, mockInvestmentManagers } = require('../fixtures');

describe('#findProductByCode', () => {
  let collection;
  let mongoClient;
  let app;
  let navCollection;
  const productWithoutNav = {
    name: 'Schroder Dana Pasar Campuran',
    productCode: 'SCHPC',
    investmentManager: 'SCH',
    imageUrl: '',
    productCategory: 'money market',
    sellFee: 0.1,
    buyFee: 0.2,
    tax: 0,
    createdAt: new Date(),
  };

  beforeAll(async () => {
    app = new Realm.App({ id: app_id });
    const credentials = Realm.Credentials.apiKey(process.env.REALM_API_KEY);
    app = await app.logIn(credentials);

    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_INSTANCES}/${process.env.DB_NAME}?${process.env.DB_OPTIONS}`;
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    collection = mongoClient.db().collection('products');
    navCollection = mongoClient.db().collection('navs');

    await collection.insertMany([...mockProducts, productWithoutNav]);
    await navCollection.insertMany(mockNavs);
  });

  afterAll(async () => {
    await collection.deleteMany({});
    await navCollection.deleteMany({});
    await mongoClient.close();
  });

  it('should return empty object', async () => {
    const expectedResult = {};

    const result = await app.functions.findProductByCode('');

    expect(result).toStrictEqual(expectedResult);
  });

  it('should return the product when product was found', async () => {
    const expectedProduct = { ...mockProducts[0] };
    expectedProduct.investmentManager = { ...mockInvestmentManagers[0] };
    const navsProduct = mockNavs.filter((n) => n.productCode === 'SCHPU');
    navsProduct.sort((a, b) => b.createdAt - a.createdAt);
    const [nav] = navsProduct;
    expectedProduct.nav = nav;
    delete expectedProduct._id;
    delete expectedProduct.investmentManager._id;
    delete expectedProduct.nav._id;
    delete expectedProduct.nav.productCode;
    delete expectedProduct.createdAt;
    delete expectedProduct.nav.createdAt;

    const result = await app.functions.findProductByCode('SCHPU');
    delete result.createdAt;
    delete result.nav.createdAt;

    expect(result).toStrictEqual(expectedProduct);
  });

  it('should return product without nav when nav for the selected product is not exists', async () => {
    const expectedProduct = productWithoutNav;
    delete expectedProduct._id;
    expectedProduct.investmentManager = { ...mockInvestmentManagers[0] };

    const result = await app.functions.findProductByCode(productWithoutNav.productCode);

    expect(result).toStrictEqual(expectedProduct);
  });
});
