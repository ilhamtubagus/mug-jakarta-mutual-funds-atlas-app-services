const findTransactions = require('../../functions/findTransactions');

describe('#findTransactions', () => {
  const cif = 'C6DTCTKBST';
  let payload;
  const expectedProjection = { _id: 0 };

  beforeEach(() => {
    const toArray = jest.fn();
    const limit = jest.fn().mockReturnValue({ toArray });
    const skip = jest.fn().mockReturnValue({ limit });
    const sort = jest.fn().mockReturnValue({ skip });
    const find = jest.fn().mockReturnValue({ sort });
    const collection = jest.fn().mockReturnValue({ find });
    const db = jest.fn().mockReturnValue({ collection });
    const get = jest.fn().mockReturnValue({ db });

    limit.toArray = toArray;
    skip.limit = limit;
    sort.skip = skip;
    find.sort = sort;
    collection.find = find;
    db.collection = collection;
    get.db = db;

    global.context = {
      environment: {
        values: {
          databaseName: 'mutual-funds',
          offset: 10,
        },
      },
      services: {
        get,
      },
    };
    payload = {
      cif,
    };
  });

  it('should invoke find in transactions collection when filter products by code', async () => {
    const productCode = 'SCHPU';
    const expectedQuery = {
      cif,
      'product.productCode': productCode,
    };

    await findTransactions(cif, { ...payload, productCode });

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('transactions');
    expect(context.services.get.db.collection.find).toBeCalledWith(expectedQuery, expectedProjection);
    expect(context.services.get.db.collection.find.sort).toBeCalledWith({});
    expect(context.services.get.db.collection.find.sort.skip).toBeCalledWith(0);
    expect(context.services.get.db.collection.find.sort.skip.limit).toBeCalledWith(context.environment.values.offset);
    expect(context.services.get.db.collection.find.sort.skip.limit.toArray).toBeCalled();
  });

  it('should invoke find in transactions collection when filter products by transaction type', async () => {
    const expectedQuery = {
      cif,
      type: 'BUY',
    };

    await findTransactions(cif, { ...payload, transactionType: 'BUY' });

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('transactions');
    expect(context.services.get.db.collection.find).toBeCalledWith(expectedQuery, expectedProjection);
    expect(context.services.get.db.collection.find.sort).toBeCalledWith({});
    expect(context.services.get.db.collection.find.sort.skip).toBeCalledWith(0);
    expect(context.services.get.db.collection.find.sort.skip.limit).toBeCalledWith(context.environment.values.offset);
    expect(context.services.get.db.collection.find.sort.skip.limit.toArray).toBeCalled();
  });

  it('should invoke find in transactions collection with sort by amount ascending', async () => {
    const expectedQuery = {
      cif,
    };

    const expectedSort = {
      amount: 1,
    };

    await findTransactions(cif, { ...payload, sortBy: 'amount', order: 'asc' });

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('transactions');
    expect(context.services.get.db.collection.find).toBeCalledWith(expectedQuery, expectedProjection);
    expect(context.services.get.db.collection.find.sort).toBeCalledWith(expectedSort);
    expect(context.services.get.db.collection.find.sort.skip).toBeCalledWith(0);
    expect(context.services.get.db.collection.find.sort.skip.limit).toBeCalledWith(context.environment.values.offset);
    expect(context.services.get.db.collection.find.sort.skip.limit.toArray).toBeCalled();
  });

  it('should invoke find in transactions collection with sort by created at descending', async () => {
    const expectedQuery = {
      cif,
    };

    const expectedSort = {
      createdAt: -1,
    };

    await findTransactions(cif, { ...payload, sortBy: 'createdAt', order: 'desc' });

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('transactions');
    expect(context.services.get.db.collection.find).toBeCalledWith(expectedQuery, expectedProjection);
    expect(context.services.get.db.collection.find.sort).toBeCalledWith(expectedSort);
    expect(context.services.get.db.collection.find.sort.skip).toBeCalledWith(0);
    expect(context.services.get.db.collection.find.sort.skip.limit).toBeCalledWith(context.environment.values.offset);
    expect(context.services.get.db.collection.find.sort.skip.limit.toArray).toBeCalled();
  });

  it('should set db name with default database name if value in environment not set', async () => {
    delete global.context.environment.values.databaseName;

    await findTransactions(cif, payload);

    expect(context.services.get.db).toBeCalledWith('mutual-funds');
  });

  it('should set offset with default offset if value in environment not set', async () => {
    delete global.context.environment.values.offset;

    await findTransactions(cif, payload);

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('transactions');
    expect(context.services.get.db.collection.find.sort.skip).toBeCalledWith(0);
    expect(context.services.get.db.collection.find.sort.skip.limit).toBeCalledWith(6);
    expect(context.services.get.db.collection.find.sort.skip.limit.toArray).toBeCalled();
  });
});
