const { MongoClient } = require('mongodb');
const Realm = require('realm-web');
/* eslint-disable camelcase */
const _ = require('lodash');
const { app_id } = require('../../realm_config.json');
const {
  mockProducts, mockInvestmentManagers, mockNavs, mockPaymentRequests,
} = require('../fixtures');

describe('#findProducts', () => {
  let mongoClient;
  let app;
  let productCollection;
  let navCollection;
  let navs;
  const sortByName = (prev, curr) => prev.name.localeCompare(curr.name);

  beforeAll(async () => {
    app = new Realm.App({ id: app_id });
    const credentials = Realm.Credentials.apiKey(process.env.REALM_API_KEY);
    app = await app.logIn(credentials);

    const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@${process.env.DB_INSTANCES}/${process.env.DB_NAME}?${process.env.DB_OPTIONS}`;
    mongoClient = new MongoClient(uri);
    await mongoClient.connect();
    productCollection = mongoClient.db().collection('products');
    navCollection = mongoClient.db().collection('navs');
    await productCollection.insertMany(_.cloneDeep(mockProducts));
    await navCollection.insertMany(_.cloneDeep(mockNavs));
  });

  afterAll(async () => {
    await productCollection.deleteMany({});
    await navCollection.deleteMany({});
    await mongoClient.close();
  });

  beforeEach(() => {
    navs = _.cloneDeep(mockNavs);
  });

  it('should return all products when filter is empty', async () => {
    const expectedProducts = [...mockProducts].map((p) => {
      const {
        _id, createdAt, investmentManager: investmentManagerCode, productCode, ...product
      } = p;
      const investmentManager = mockInvestmentManagers
        .find((i) => i.investmentManagerCode === investmentManagerCode);
      delete investmentManager._id;
      const nav = navs.filter((i) => i.productCode === productCode);
      nav.sort((a, b) => b.createdAt - a.createdAt);
      const latestNav = nav[0];
      delete latestNav.productCode;
      delete latestNav._id;
      return {
        ...product,
        productCode,
        investmentManager,
        nav: latestNav,
      };
    }).sort(sortByName);

    let result = await
    app.functions.findProducts();
    result = result.map((p) => {
      const { createdAt, ...product } = p;
      return {
        ...product,
      };
    }).sort(sortByName);

    expect(result).toStrictEqual(expectedProducts);
  });

  it('should return product with selected product category', async () => {
    const expectedProducts = [...mockProducts].filter((p) => p.productCategory === 'money market').map((p) => {
      const {
        _id, createdAt, investmentManager: investmentManagerCode, productCode, ...product
      } = p;
      const investmentManager = mockInvestmentManagers
        .find((i) => i.investmentManagerCode === investmentManagerCode);
      delete investmentManager._id;
      const nav = navs.filter((n) => n.productCode === productCode);
      nav.sort((a, b) => a.createdAt - b.createdAt);
      const latestNav = nav[nav.length - 1];
      delete latestNav.productCode;
      delete latestNav._id;
      return {
        ...product,
        productCode,
        investmentManager,
        nav: latestNav,
      };
    }).sort(sortByName);

    let result = await
    app.functions.findProducts(undefined, 'money market');
    result = result.map((p) => {
      const { createdAt, ...product } = p;
      return {
        ...product,
      };
    }).sort(sortByName);

    expect(result).toStrictEqual(expectedProducts);
  });

  it('should return product with selected investment manager', async () => {
    const expectedProducts = _.cloneDeep(mockProducts).filter((p) => p.investmentManager === 'SCH').map((p) => {
      const {
        _id, investmentManager: investmentManagerCode, productCode, createdAt, ...product
      } = p;
      const investmentManager = mockInvestmentManagers
        .find((i) => i.investmentManagerCode === investmentManagerCode);
      delete investmentManager._id;
      const nav = navs.filter((n) => n.productCode === productCode);
      nav.sort((a, b) => a.createdAt - b.createdAt);
      const latestNav = nav[nav.length - 1];
      delete latestNav.productCode;
      delete latestNav._id;
      return {
        ...product,
        productCode,
        investmentManager,
        nav: latestNav,
      };
    }).sort(sortByName);

    let result = await
    app.functions.findProducts('SCH');
    result = result.map((p) => {
      const { createdAt, ...product } = p;
      return {
        ...product,
      };
    }).sort(sortByName);

    expect(result).toStrictEqual(expectedProducts);
  });

  it('should return product with selected investment manager and product category', async () => {
    const expectedProducts = _.cloneDeep(mockProducts).filter((p) => p.investmentManager === 'SCH' && p.productCategory === 'money market').map((p) => {
      const {
        _id, investmentManager: investmentManagerCode, productCode, createdAt, ...product
      } = p;
      const investmentManager = mockInvestmentManagers
        .find((i) => i.investmentManagerCode === investmentManagerCode);
      delete investmentManager._id;
      const nav = navs.filter((n) => n.productCode === productCode);
      nav.sort((a, b) => a.createdAt - b.createdAt);
      const latestNav = nav[nav.length - 1];
      delete latestNav.productCode;
      delete latestNav._id;
      return {
        ...product,
        productCode,
        investmentManager,
        nav: latestNav,
      };
    });
    let result = await
    app.functions.findProducts('SCH', 'money market');
    result = result.map((p) => {
      const { createdAt, ...product } = p;
      return {
        ...product,
      };
    });
    expect(result).toStrictEqual(expectedProducts);
  });

  it('should return empty when product with selected investment manager and product category is not exist', async () => {
    const result = await
    app.functions.findProducts('SCZ', 'bonds');

    expect(result).toStrictEqual([]);
  });
});
