const findTransactions = async (cif, payload) => {
  const databaseName = context.environment.values.databaseName || 'mutual-funds';
  const offset = context.environment.values.offset || 6;
  const mongodb = context.services.get('mongodb-atlas');
  const transactionCollection = mongodb.db(databaseName).collection('transactions');

  const {
    transactionType, productCode, sortBy, page, order,
  } = payload;

  const filter = {
    cif,
    ...(transactionType && { type: transactionType }),
    ...(productCode && { 'product.productCode': productCode }),
  };

  const sort = {
    ...(sortBy && { [sortBy]: order === 'asc' ? 1 : -1 }),
  };

  const query = {
    cif,
    ...filter,
  };

  const skip = offset * (parseInt(page, 10) - 1);
  const limit = skip + offset;

  return transactionCollection
    .find(query)
    .sort(sort)
    .skip(skip)
    .limit(limit)
    .toArray();
};

exports = findTransactions;

/* istanbul ignore next */
if (typeof module !== 'undefined') {
  module.exports = findTransactions;
}
