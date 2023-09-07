const radixDecimal = 10;

const findTransactions = async (cif, payload) => {
  const databaseName = context.environment.values.databaseName || 'mutual-funds';
  const offset = parseInt(context.environment.values.offset || '6', radixDecimal);
  const mongodb = context.services.get('mongodb-atlas');
  const transactionCollection = mongodb.db(databaseName).collection('transactions');

  const {
    transactionType, productCode, sortBy, page = '1', order,
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
  const projection = {
    _id: 0,
  };

  const skip = offset * (parseInt(page, radixDecimal) - 1);

  return transactionCollection
    .find(query, projection)
    .sort(sort)
    .skip(skip)
    .limit(offset)
    .toArray();
};

exports = findTransactions;

/* istanbul ignore next */
if (typeof module !== 'undefined') {
  module.exports = findTransactions;
}
