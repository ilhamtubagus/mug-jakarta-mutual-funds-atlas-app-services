const updatePortfolioProducts = require('../../functions/updatePortfolioProducts');

describe('#updatePortfolioProducts', () => {
  let findOneAndUpdate;
  const cif = '123123ADD';
  const portfolioCode = '001';
  const updatedProducts = [{
    productCode: 'SCHE',
    units: 100.9,
    capitalInvestment: 100000,
  }];

  beforeEach(() => {
    findOneAndUpdate = jest.fn();
    const collection = jest.fn().mockReturnValue({ findOneAndUpdate });
    const db = jest.fn().mockReturnValue({ collection });
    const get = jest.fn().mockReturnValue({ db });

    get.db = db;
    db.collection = collection;
    collection.findOneAndUpdate = findOneAndUpdate;

    global.context = {
      environment: {
        values: {
          databaseName: 'mutual-funds',
        },
      },
      services: {
        get,
      },
    };
  });

  it('should invoke find one and update on portfolios collection', async () => {
    const expectedQuery = {
      cif,
      portfolioCode,
    };
    const expectedUpdate = {
      $set: {
        products: updatedProducts,
      },
      $currentDate: { modifiedAt: true },
    };
    const expectedOptions = {
      returnNewDocument: true,
    };

    await updatePortfolioProducts(cif, portfolioCode, updatedProducts);

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('portfolios');
    expect(context.services.get.db.collection.findOneAndUpdate).toBeCalledWith(expectedQuery, expectedUpdate, expectedOptions);
  });

  it('should set db name with default database name if value in environment not set', async () => {
    delete global.context.environment.values.databaseName;

    await updatePortfolioProducts(cif, portfolioCode, updatedProducts);

    expect(context.services.get.db).toBeCalledWith('mutual-funds');
  });
});
