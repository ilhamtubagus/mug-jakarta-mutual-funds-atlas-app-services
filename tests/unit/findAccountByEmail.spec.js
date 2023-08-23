const findAccountByEmail = require('../../functions/findAccountByEmail');

describe('#findAccountByEmail', () => {
  let findOne;
  const email = 'fian@gmail.com';

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
      email,
    };

    await findAccountByEmail(email);

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('accounts');
    expect(context.services.get.db.collection.findOne).toBeCalledWith(expectedQuery);
  });

  it('should set db name with default database name if value in environment not set', async () => {
    delete global.context.environment.values.databaseName;

    await findAccountByEmail(email);

    expect(context.services.get.db).toBeCalledWith('mutual-funds');
  });

  it('should throw error when insertion failed', async () => {
    findOne.mockImplementation(() => {
      throw new Error();
    });

    try {
      await findAccountByEmail(email);
    } catch (e) {
      expect(e).toStrictEqual(new Error());
    }
  });
});
