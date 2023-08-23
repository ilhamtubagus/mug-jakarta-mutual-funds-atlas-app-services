const findProductByCode = require('../../functions/findProductByCode');

describe('#findProductByCode', () => {
  const productCode = 'SCHPU';
  let toArray;

  beforeEach(() => {
    toArray = jest.fn().mockReturnValue([{}]);
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

  it('should invoke aggregation pipeline on products collection', async () => {
    const expectedPipeline = [
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

    await findProductByCode(productCode);

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('products');
    expect(context.services.get.db.collection.aggregate).toBeCalledWith(expectedPipeline);
    expect(context.services.get.db.collection.aggregate.toArray).toBeCalled();
  });

  it('should set db name with default database name if value in environment not set', async () => {
    delete global.context.environment.values.databaseName;

    await findProductByCode(productCode);

    expect(context.services.get.db).toBeCalledWith('mutual-funds');
  });

  it('should return empty object when aggregation result is empty array', async () => {
    toArray.mockResolvedValue([]);

    const result = await findProductByCode(productCode);

    expect(result).toStrictEqual({});
  });
});
