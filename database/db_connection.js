const mongoClient = require("mongodb").MongoClient;
require("dotenv").config();
const hostedDBPath = process.env.DB_PATH;    //production
const localDBPath = "mongodb://localhost:27017";    //development

function connectHosted(callback) {
    const url = hostedDBPath;
    mongoClient.connect(url, {useUnifiedTopology: true}, callback);
}

function connectLocal(callback) {
    const url = localDBPath;
    mongoClient.connect(url, {useUnifiedTopology: true}, callback);
}

module.exports = {
    connectHosted, 
    connectLocal
};

