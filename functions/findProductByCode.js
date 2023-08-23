const pipeline = (productCode) => [
  {
    $match: {
      productCode: {
        $eq: productCode,
      },
    },
  },
  {
    $lookup: {
      from: 'investmentManagers',
      localField: 'investmentManager',
      foreignField: 'investmentManagerCode',
      as: 'investmentManager',
    },
  },
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
              $eq: [
                '$productCode',
                '$$productCode',
              ],
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
    $addFields: {
      nav: {
        $first: '$nav',
      },
      investmentManager: {
        $first: '$investmentManager',
      },
    },
  },
  {
    $project: {
      _id: 0,
      'investmentManager._id': 0,
      'nav._id': 0,
      'nav.productCode': 0,
    },
  },
];
const findProductByCode = async (productCode) => {
  const databaseName = context.environment.values.databaseName || 'mutual-funds';
  const mongodb = context.services.get('mongodb-atlas');
  const productsCollection = mongodb.db(databaseName).collection('products');

  const aggregationResult = await productsCollection.aggregate(pipeline(productCode));
  if (aggregationResult.length === 0) {
    return {};
  }
  const [product] = aggregationResult;
  return product;
};

exports = findProductByCode;

/* istanbul ignore next */
if (typeof module !== 'undefined') {
  module.exports = findProductByCode;
}
