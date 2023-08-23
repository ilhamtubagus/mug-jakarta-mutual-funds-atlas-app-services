const findPortfolioByCIF = require('../../functions/findPortfoliosByCIF');

describe('#findPortfolioByCIF', () => {
  const CIF = '12345ABCDE';
  let toArray;

  beforeEach(() => {
    toArray = jest.fn();
    const aggregate = jest.fn().mockReturnValue({ toArray });
    const collection = jest.fn().mockReturnValue({ aggregate });
    const db = jest.fn().mockReturnValue({ collection });
    const get = jest.fn().mockReturnValue({ db });

    aggregate.toArray = toArray;
    collection.aggregate = aggregate;
    db.collection = collection;
    get.db = db;

    global.context = {
      environment: {
        values: {
          databaseName: 'mutual-funds',
        },
      },
      services: {
        get,
      },
    };
  });

  it('should invoke aggregation pipeline on portfolios collection', async () => {
    const expectedPipeline = [
      {
        $match: {
          cif: CIF,
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

    await findPortfolioByCIF(CIF);

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('portfolios');
    expect(context.services.get.db.collection.aggregate).toBeCalledWith(expectedPipeline);
  });

  it('should set db name with default database name if value in environment not set', async () => {
    delete global.context.environment.values.databaseName;

    await findPortfolioByCIF(CIF);

    expect(context.services.get.db).toBeCalledWith('mutual-funds');
  });

  it('should throw error when aggregation failed', async () => {
    toArray.mockImplementation(() => {
      throw new Error();
    });

    try {
      await findPortfolioByCIF(CIF);
    } catch (e) {
      expect(e).toStrictEqual(new Error());
    }
  });
});
