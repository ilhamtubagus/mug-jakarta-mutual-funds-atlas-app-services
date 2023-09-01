const updatePortfolioProducts = async (cif, portfolioCode, updateProducts) => {
  const databaseName = context.environment.values.databaseName || 'mutual-funds';
  const mongodb = context.services.get('mongodb-atlas');
  const portfolioCollection = mongodb.db(databaseName).collection('portfolios');

  const query = { cif, portfolioCode };
  const update = {
    $set: { products: updateProducts },
    $currentDate: { modifiedAt: true },
  };
  const options = {
    returnNewDocument: true,
    projection: {
      _id: 0,
    },
  };

  return portfolioCollection.findOneAndUpdate(query, update, options);
};

exports = updatePortfolioProducts;

/* istanbul ignore next */
if (typeof module !== 'undefined') {
  module.exports = updatePortfolioProducts;
}
