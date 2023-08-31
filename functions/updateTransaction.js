const updateTransaction = async (transaction) => {
  const databaseName = context.environment.values.databaseName || 'mutual-funds';
  const mongodb = context.services.get('mongodb-atlas');
  const transactionCollection = mongodb.db(databaseName).collection('transactions');

  const query = { transactionID: transaction.transactionID };
  const update = {
    $set: { ...transaction },
    ...(!transaction.modifiedAt && { $currentDate: { modifiedAt: true } }),
  };
  const options = { returnNewDocument: true };

  return transactionCollection.findOneAndUpdate(query, update, options);
};

exports = updateTransaction;

/* istanbul ignore next */
if (typeof module !== 'undefined') {
  module.exports = updateTransaction;
}
