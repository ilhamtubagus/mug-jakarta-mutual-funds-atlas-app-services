const pipeline = (cif) => [
  {
    $match: {
      cif,
    },
  },
  {
    $lookup: {
      from: 'products',
      localField: 'products.productCode',
      foreignField: 'productCode',
      as: 'fetchedProducts',
      pipeline: [
        {
          $lookup: {
            from: 'navs',
            localField: 'productCode',
            foreignField: 'productCode',
            pipeline: [
              {
                $sort: {
                  createdAt: -1,
                },
              },
              {
                $limit: 1,
              },
            ],
            as: 'currentNav',
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
          $addFields: {
            currentNav: {
              $first: '$currentNav.currentValue',
            },
            navDate: {
              $first: '$currentNav.createdAt',
            },
            investmentManager: {
              $first: '$investmentManager',
            },
          },
        },
      ],
    },
  },
  {
    $unset: [
      '_id',
      'fetchedProducts._id',
      'fetchedProducts.createdAt',
      'fetchedProducts.investmentManager._id',
    ],
  },
  {
    $project: {
      cif: 1,
      portfolioCode: 1,
      name: 1,
      createdAt: 1,
      modifiedAt: 1,
      investmentManager: 1,
      products: {
        $map: {
          input: '$products',
          in: {
            $mergeObjects: [
              {
                $arrayElemAt: [
                  '$$ROOT.products',
                  {
                    $indexOfArray: [
                      '$fetchedProducts.productCode',
                      '$$this.productCode',
                    ],
                  },
                ],
              },
              {
                $arrayElemAt: [
                  '$fetchedProducts',
                  {
                    $indexOfArray: [
                      '$fetchedProducts.productCode',
                      '$$this.productCode',
                    ],
                  },
                ],
              },
            ],
          },
        },
      },
    },
  },
];

const findPortfoliosByCIF = async (cif) => {
  const databaseName = context.environment.values.databaseName || 'mutual-funds';
  const mongodb = context.services.get('mongodb-atlas');
  const portfoliosCollection = mongodb.db(databaseName).collection('portfolios');

  return portfoliosCollection.aggregate(pipeline(cif)).toArray();
};

exports = findPortfoliosByCIF;

/* istanbul ignore next */
if (typeof module !== 'undefined') {
  module.exports = findPortfoliosByCIF;
}
