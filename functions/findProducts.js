const _isNonEmptyString = (text) => typeof text !== 'undefined' && typeof text === 'string' && text.length > 0;
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
    { $unwind: { path: '$investmentManager' } },
    {
      $lookup: {
        from: 'navs',
        let: {
          productCode: '$productCode',
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$productCode', '$$productCode'],
              },
            },
          },
          {
            $sort: {
              createdAt: -1,
            },
          },
          {
            $limit: 1,
          },
        ],
        as: 'nav',
      },
    },
    {
      $unwind: {
        path: '$nav',
      },
    },
    {
      $project: {
        _id: 0,
        'productCategory._id': 0,
        'investmentManager._id': 0,
        'nav._id': 0,
        'nav.productCode': 0,
      },
    },
  ];

  if (_isNonEmptyString(productCategory)) {
    pipeline.splice(0, 0, {
      $match: {
        productCategory: { $eq: productCategory },
      },
    });
  }
  if (_isNonEmptyString(investmentManager)) {
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
