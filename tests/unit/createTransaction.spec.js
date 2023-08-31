const mockDate = require('mockdate');
const { mockTransactions, mockPaymentRequests } = require('../fixtures');
const createTransaction = require('../../functions/createTransaction');

describe('#createPaymentRequest', () => {
  let insertOne;
  const now = new Date();
  const transactionPayload = { ...mockTransactions[0], createdAt: now, modifiedAt: now };
  const paymentRequestPayload = { ...mockPaymentRequests[0] };
  let startSession;

  beforeEach(() => {
    insertOne = jest.fn();
    const collection = jest.fn().mockReturnValue({ insertOne });
    const db = jest.fn().mockReturnValue({ collection });
    const endSession = jest.fn().mockImplementation(() => endSession);
    const abortTransaction = jest.fn().mockImplementation(() => abortTransaction);
    const withTransaction = jest.fn().mockImplementation((fn) => fn());
    startSession = jest.fn().mockReturnValue({ endSession, abortTransaction, withTransaction });
    const get = jest.fn().mockReturnValue({ db, startSession });

    get.db = db;
    db.collection = collection;
    collection.insertOne = insertOne;
    get.startSession = startSession;
    startSession.endSession = endSession;
    startSession.abortTransaction = abortTransaction;
    startSession.withTransaction = withTransaction;

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

  it('should invoke insertOne on transactions and payment requests', async () => {
    await createTransaction(transactionPayload, paymentRequestPayload);

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledTimes(2);
    expect(context.services.get.startSession.withTransaction).toBeCalled();
    expect(context.services.get.db.collection.insertOne.mock.calls[0][0])
      .toStrictEqual(transactionPayload);
    expect(context.services.get.db.collection.insertOne.mock.calls[0][1])
      .toStrictEqual({ session: startSession() });
    expect(context.services.get.db.collection.insertOne.mock.calls[1][0])
      .toBe(paymentRequestPayload);
    expect(context.services.get.db.collection.insertOne.mock.calls[1][1])
      .toStrictEqual({ session: startSession() });
    expect(context.services.get.startSession.endSession).toBeCalled();
  });

  it('should invoke abort transaction when insert one fails', async () => {
    try {
      context.services.get.db.collection.insertOne.mockRejectedValueOnce(new Error(''));

      await createTransaction(transactionPayload, paymentRequestPayload);
    } catch (e) {
      expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
      expect(context.services.get.startSession.withTransaction).toBeCalled();
      expect(context.services.get.db.collection).toBeCalledTimes(2);
      expect(context.services.get.db.collection.insertOne.mock.calls[0][0])
        .toStrictEqual(transactionPayload);
      expect(context.services.get.db.collection.insertOne.mock.calls[0][1])
        .toStrictEqual({ session: startSession() });
      expect(context.services.get.db.collection.insertOne.mock.calls[1])
        .toBe(undefined);
      expect(context.services.get.startSession.abortTransaction).toBeCalled();
      expect(context.services.get.startSession.endSession).toBeCalled();
    }
  });

  it('should set db name with default database name if value in environment not set', async () => {
    delete global.context.environment.values.databaseName;

    await createTransaction(transactionPayload, paymentRequestPayload);

    expect(context.services.get.db).toBeCalledWith('mutual-funds');
  });
});
