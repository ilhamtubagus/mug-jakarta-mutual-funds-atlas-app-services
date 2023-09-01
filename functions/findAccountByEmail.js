const findAccountByEmail = async (email) => {
  const databaseName = context.environment.values.databaseName || 'mutual-funds';
  const mongodb = context.services.get('mongodb-atlas');
  const accountsCollection = mongodb.db(databaseName).collection('accounts');

  return accountsCollection.findOne({ email }, { _id: 0 });
};

exports = findAccountByEmail;

/* istanbul ignore next */
if (typeof module !== 'undefined') {
  module.exports = findAccountByEmail;
}
