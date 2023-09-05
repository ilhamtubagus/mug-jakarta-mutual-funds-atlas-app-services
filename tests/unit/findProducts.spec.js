const findProducts = require('../../functions/findProducts');

describe('#findProducts', () => {
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

  it('should invoke aggregation with correct pipeline on products collection when investment manager and product category are undefined', async () => {
    const expectedPipeline = [
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

    await findProducts(undefined, undefined);

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('products');
    expect(context.services.get.db.collection.aggregate).toBeCalledWith(expectedPipeline);
    expect(context.services.get.db.collection.aggregate.toArray).toBeCalled();
  });

  it('should invoke aggregation with correct pipeline on products collection when investment manager is undefined', async () => {
    const productCategory = 'money market';
    const expectedPipeline = [
      {
        $match: {
          productCategory: { $eq: productCategory },
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
        $unwind: {
          path: '$investmentManager',
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

    await findProducts(undefined, productCategory);

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('products');
    expect(context.services.get.db.collection.aggregate).toBeCalledWith(expectedPipeline);
    expect(context.services.get.db.collection.aggregate.toArray).toBeCalled();
  });

  it('should invoke aggregation with correct pipeline on products collection when product category is undefined', async () => {
    const investmentManager = 'SCH';
    const expectedPipeline = [
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
      {
        $match: {
          'investmentManager.investmentManagerCode': { $eq: investmentManager },
        },
      },
    ];

    await findProducts(investmentManager, undefined);

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('products');
    expect(context.services.get.db.collection.aggregate).toBeCalledWith(expectedPipeline);
    expect(context.services.get.db.collection.aggregate.toArray).toBeCalled();
  });

  it('should set db name with default database name if value in environment not set', async () => {
    delete global.context.environment.values.databaseName;

    await findProducts(productCode);

    expect(context.services.get.db).toBeCalledWith('mutual-funds');
  });
});
