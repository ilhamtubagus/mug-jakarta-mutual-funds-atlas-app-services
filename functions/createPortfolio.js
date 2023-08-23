const createPortfolio = async(payload) => {
    const databaseName = context.environment.values.databaseName || "mutual-funds"
    const mongodb = context.services.get("mongodb-atlas");
    const portfoliosCollection =  mongodb.db(databaseName).collection("portfolios");

    try {
        const portfolio = await portfoliosCollection.insertOne(payload)
        return portfolio;
    }catch (e) {
        throw e;
    }
}

exports = createPortfolio;

/* istanbul ignore next */
if (typeof module !== "undefined") {
    module.exports = createPortfolio;
}

