const createTransaction = async (transaction, paymentRequest) => {
  const databaseName = context.environment.values.databaseName || 'mutual-funds';
  const mongodb = context.services.get('mongodb-atlas');
  const paymentRequestCollection = mongodb.db(databaseName).collection('paymentRequests');
  const transactionCollection = mongodb.db(databaseName).collection('transactions');

  const session = mongodb.startSession();

  const transactionPayload = {
    ...transaction,
    modifiedAt: new Date(),
    createdAt: new Date(),
  };

  try {
    await session.withTransaction(async () => {
      await Promise.all([
        await transactionCollection.insertOne(transactionPayload, { session }),
        await paymentRequestCollection.insertOne(paymentRequest, { session }),
      ]);
    }, {});
  } catch (e) {
    await session.abortTransaction();
    throw e;
  } finally {
    await session.endSession();
  }
};

exports = createTransaction;

/* istanbul ignore next */
if (typeof module !== 'undefined') {
  module.exports = createTransaction;
}
