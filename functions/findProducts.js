const constructPipeline = (investmentManager, productCategory) => {
  const pipeline = [
    {
      $lookup: {
        from: 'investmentManagers',
        localField: 'investmentManager',
        foreignField: 'investmentManagerCode',
        as: 'investmentManager',
      },
    },
    {
      $unwind: {
        path: '$investmentManager',
      },
    },
    {
      $project: {
        _id: 0,
        'productCategory._id': 0,
        'investmentManager._id': 0,
      },
    },
  ];
  if (productCategory !== undefined) {
    pipeline.splice(0, 0, {
      $match: {
        productCategory: { $eq: productCategory },
      },
    });
  }
  if (investmentManager !== undefined) {
    pipeline.splice(pipeline.length, 0, {
      $match: {
        'investmentManager.investmentManagerCode': { $eq: investmentManager },
      },
    });
  }
  return pipeline;
};
const findProducts = async (investmentManager, productCategory) => {
  const databaseName = context.environment.values.databaseName || 'mutual-funds';
  const mongodb = context.services.get('mongodb-atlas');
  const productsCollection = mongodb.db(databaseName).collection('products');

  return productsCollection
    .aggregate(constructPipeline(investmentManager, productCategory)).toArray();
};

exports = findProducts;

/* istanbul ignore next */
if (typeof module !== 'undefined') {
  module.exports = findProducts;
}
