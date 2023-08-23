const createAccount = require('../../functions/createAccount');

describe('#createAccount', () => {
  let insertOne;
  const accountPayload = {
    fullName: 'Fian',
    email: 'ilhamta27@gmail.com',
    password: 'U2FsdGVkX180W7K5HQmDy7oIn5n6DpvHGysGofwI2H8=',
    nik: '3302210402990001',
    dateOfBirth: '02-01-1999',
    cif: '1ADSA1ADSA',
    riskProfile: 'aggressive',
    createdAt: new Date(),
    modifiedAt: new Date(),
  };

  beforeEach(() => {
    insertOne = jest.fn();
    const collection = jest.fn().mockReturnValue({ insertOne });
    const db = jest.fn().mockReturnValue({ collection });
    const get = jest.fn().mockReturnValue({ db });

    collection.insertOne = insertOne;
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

  it('should invoke insert one in portfolios collection', async () => {
    await createAccount(accountPayload);

    expect(context.services.get.db).toBeCalledWith(context.environment.values.databaseName);
    expect(context.services.get.db.collection).toBeCalledWith('accounts');
    expect(context.services.get.db.collection.insertOne).toBeCalledWith(accountPayload);
  });

  it('should set db name with default database name if value in environment not set', async () => {
    delete global.context.environment.values.databaseName;

    await createAccount(accountPayload);

    expect(context.services.get.db).toBeCalledWith('mutual-funds');
  });
});
