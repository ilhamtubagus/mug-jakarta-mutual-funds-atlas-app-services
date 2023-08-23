const findAccountByEmail = async(email) => {
    const databaseName = context.environment.values.databaseName || "mutual-funds"
    const mongodb = context.services.get("mongodb-atlas");
    const accountsCollection =  mongodb.db(databaseName).collection("accounts");

    try {
        const account = await accountsCollection.findOne({email})
        return account;
    }catch (e) {
        throw e;
    }
}

exports = findAccountByEmail;

/* istanbul ignore next */
if (typeof module !== "undefined") {
    module.exports = findAccountByEmail;
}

