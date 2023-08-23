const createPortfolio = async (payload) => {
  const databaseName = context.environment.values.databaseName || 'mutual-funds';
  const mongodb = context.services.get('mongodb-atlas');
  const portfoliosCollection = mongodb.db(databaseName).collection('portfolios');

  return portfoliosCollection.insertOne(payload);
};

exports = createPortfolio;

/* istanbul ignore next */
if (typeof module !== 'undefined') {
  module.exports = createPortfolio;
}
