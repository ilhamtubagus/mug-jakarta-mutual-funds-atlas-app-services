const createPortfolio = require('../../functions/createPortfolio');
const { mockPortfolios } = require('../fixtures');

describe('#createPortfolio', () => {
  const portfolioPayload = {
    ...mockPortfolios[1],
  };
  let insertOne;

  beforeEach(() => {
    insertOne = jest.fn();
    const collection = jest.fn().mockReturnValue({ insertOne });
    const db = jest.fn().mockReturnValue({ collection });
    const get = jest.fn().mockReturnValue({ db });

    collection.insertOne = insertOne;
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

  it('should invoke insert one in portfolios collection', async () => {
    await createPortfolio(portfolioPayload);

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('portfolios');
    expect(context.services.get.db.collection.insertOne).toBeCalledWith(portfolioPayload);
  });

  it('should set db name with default database name if value in environment not set', async () => {
    delete global.context.environment.values.databaseName;

    await createPortfolio(portfolioPayload);

    expect(context.services.get.db).toBeCalledWith('mutual-funds');
  });

  it('should throw error when insertion failed', async () => {
    insertOne.mockImplementation(() => {
      throw new Error();
    });

    try {
      await createPortfolio(portfolioPayload);
    } catch (e) {
      expect(e).toStrictEqual(new Error());
    }
  });
});
