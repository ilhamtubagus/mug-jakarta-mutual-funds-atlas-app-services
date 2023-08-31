const findPortfolio = async (cif, portfolioCode) => {
  const databaseName = context.environment.values.databaseName || 'mutual-funds';
  const mongodb = context.services.get('mongodb-atlas');
  const portfoliosCollection = mongodb.db(databaseName).collection('portfolios');

  return portfoliosCollection.findOne({ cif, portfolioCode }, { _id: 0 });
};

exports = findPortfolio;

/* istanbul ignore next */
if (typeof module !== 'undefined') {
  module.exports = findPortfolio;
}
