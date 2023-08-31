const findPortfolio = require('../../functions/findPortfolio');

describe('#findPortfolio', () => {
  let findOne;
  const cif = '12334SA';
  const portfolioCode = '7KTLMBEAZ9CYIVX';

  beforeEach(() => {
    findOne = jest.fn();
    const collection = jest.fn().mockReturnValue({ findOne });
    const db = jest.fn().mockReturnValue({ collection });
    const get = jest.fn().mockReturnValue({ db });

    collection.findOne = findOne;
    db.collection = collection;
    get.db = db;

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

  it('should invoke find one in portfolios collection', async () => {
    const expectedQuery = {
      cif,
      portfolioCode,
    };
    const expectedOptions = { _id: 0 };

    await findPortfolio(cif, portfolioCode);

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('portfolios');
    expect(context.services.get.db.collection.findOne).toBeCalledWith(expectedQuery, expectedOptions);
  });

  it('should set db name with default database name if value in environment not set', async () => {
    delete global.context.environment.values.databaseName;

    await findPortfolio(cif, portfolioCode);

    expect(context.services.get.db).toBeCalledWith('mutual-funds');
  });
});
