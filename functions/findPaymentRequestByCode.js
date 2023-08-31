const findAccountByEmail = async (paymentCode) => {
  const databaseName = context.environment.values.databaseName || 'mutual-funds';
  const mongodb = context.services.get('mongodb-atlas');
  const paymentRequestCollection = mongodb.db(databaseName).collection('paymentRequests');

  return paymentRequestCollection.findOne({ paymentCode });
};

exports = findAccountByEmail;

/* istanbul ignore next */
if (typeof module !== 'undefined') {
  module.exports = findAccountByEmail;
}
