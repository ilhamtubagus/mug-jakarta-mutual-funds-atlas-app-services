const findPaymentRequestByCode = require('../../functions/findPaymentRequestByCode');

describe('#findPaymentRequestByCode', () => {
  let findOne;
  const paymentCode = '7NMOUNHONJSAHFL';

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

  it('should invoke find one in payment requests collection', async () => {
    const expectedQuery = {
      paymentCode,
    };
    const expectedOptions = { _id: 0 };

    await findPaymentRequestByCode(paymentCode);

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('paymentRequests');
    expect(context.services.get.db.collection.findOne).toBeCalledWith(expectedQuery, expectedOptions);
  });

  it('should set db name with default database name if value in environment not set', async () => {
    delete global.context.environment.values.databaseName;

    await findPaymentRequestByCode(paymentCode);

    expect(context.services.get.db).toBeCalledWith('mutual-funds');
  });
});
