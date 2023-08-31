const findTransactionByID = async (transactionID) => {
  const databaseName = context.environment.values.databaseName || 'mutual-funds';
  const mongodb = context.services.get('mongodb-atlas');
  const transactionsCollection = mongodb.db(databaseName).collection('transactions');

  return transactionsCollection.findOne({ transactionID }, { _id: 0 });
};

exports = findTransactionByID;

/* istanbul ignore next */
if (typeof module !== 'undefined') {
  module.exports = findTransactionByID;
}
