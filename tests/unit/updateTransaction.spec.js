const mockDate = require('mockdate');
const { mockTransactions } = require('../fixtures');
const updateTransaction = require('../../functions/updateTransaction');

describe('#updateTransaction', () => {
  let findOneAndUpdate;
  const now = new Date();
  const transactionPayload = { ...mockTransactions[0], createdAt: now, modifiedAt: now };

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
    mockDate.set(now);
  });

  it('should invoke find one and update on transactions collection', async () => {
    const expectedQuery = {
      transactionID: transactionPayload.transactionID,
    };
    const expectedUpdate = {
      $set: {
        ...transactionPayload,
      },
    };
    const expectedOptions = {
      returnNewDocument: true,
    };

    await updateTransaction(transactionPayload);

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('transactions');
    expect(context.services.get.db.collection.findOneAndUpdate).toBeCalledWith(expectedQuery, expectedUpdate, expectedOptions);
  });

  it('should set db name with default database name if value in environment not set', async () => {
    delete global.context.environment.values.databaseName;

    await updateTransaction(transactionPayload);

    expect(context.services.get.db).toBeCalledWith('mutual-funds');
  });

  it('should invoke find one and update on transactions collection with additional field modified at', async () => {
    const expectedQuery = {
      transactionID: transactionPayload.transactionID,
    };
    const expectedUpdate = {
      $set: {
        ...transactionPayload,
        modifiedAt: now,
      },
    };
    const expectedOptions = {
      returnNewDocument: true,
    };

    await updateTransaction({
      ...transactionPayload,
      modifiedAt: now,
    });

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('transactions');
    expect(context.services.get.db.collection.findOneAndUpdate).toBeCalledWith(expectedQuery, expectedUpdate, expectedOptions);
  });
});
