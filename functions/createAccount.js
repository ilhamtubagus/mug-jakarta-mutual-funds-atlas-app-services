const createAccount = async(payload) => {
    const databaseName = context.environment.values.databaseName || "mutual-funds"
    const mongodb = context.services.get("mongodb-atlas");
    const accountsCollection =  mongodb.db(databaseName).collection("accounts");

    try {
        const account = await accountsCollection.insertOne(payload)
        return account;
    }catch (e) {
        throw e;
    }
}

exports = createAccount;

/* istanbul ignore next */
if (typeof module !== "undefined") {
    module.exports = createAccount;
}

