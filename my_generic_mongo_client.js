//myGenericMongoClient module (with MongoDB/MongoClient)
var MongoClient = require('mongodb').MongoClient;
var ObjectID = require('mongodb').ObjectID;
var assert = require('assert');
require('dotenv').config()

//environment variables for mongoDb Atlas
const dbName = process.env.DB_NAME_MONGO || DB_NAME_MONGO
const mongoDbUrl = process.env.URL_MONGO || URL_MONGO

var currentDb = null; //current MongoDB connection

var setMongoDbUrl = function (dbUrl) {
	mongoDbUrl = dbUrl;
}

var setMongoDbName = function (mongoDbName) {
	dbName = mongoDbName;
}

var closeCurrentMongoDBConnection = function () {
	currentDb.close();
	currentDb = null;
}

var executeInMongoDbConnection = function (callback_with_db) {
	if (currentDb == null) {
		MongoClient.connect(mongoDbUrl, { useUnifiedTopology: true }, function (err, db) {
			if (err != null) {
				console.log("mongoDb connection error = " + err + " for dbUrl=" + mongoDbUrl);
			}
			assert.equal(null, err);
			console.log("Connected correctly to mongodb database");
			//currentDb = db; //with mongodb client v2.x
			currentDb = db.db(dbName);//with mongodb client >= v3.x
			callback_with_db(currentDb);
		});
	} else {
		callback_with_db(currentDb);
	}
}

var genericUpdateOne = function (collectionName, id, changes, arrayFilters, callback_with_err_and_results) {
	executeInMongoDbConnection(function (db) {
		db.collection(collectionName).updateOne({ '_id': id }, { $set: changes }, {arrayFilters},
			function (err, results) {
				if (err != null) {
					console.log("genericUpdateOne error = " + err);
				}
				callback_with_err_and_results(err, results);
			});
	});
};

var genericUpsertOne = function (collectionName, id, changes, callback_with_err_and_results) {
	executeInMongoDbConnection(function (db) {
		db.collection(collectionName).updateOne({ '_id': id }, { $set: changes }, {upsert: true},
			function (err, results) {
				if (err != null) {
					console.log("genericUpsertOne error = " + err);
				}
				callback_with_err_and_results(err, results);
			});
	});
};

var genericInsertOne = function (collectionName, newOne) {
	executeInMongoDbConnection(function (db) {
		db.collection(collectionName).insertOne(newOne, function (err, result) {
		})
	});
};

var genericFindList = function (collectionName, query, callback_with_err_and_array) {
	executeInMongoDbConnection(function (db) {
		var cursor = db.collection(collectionName).find(query);
		cursor.toArray(function (err, arr) {
			callback_with_err_and_array(err, arr);
		});
	});
};

var genericRemove = function (collectionName, query, callback_with_err_and_result) {
	executeInMongoDbConnection(function (db) {
		db.collection(collectionName).remove(query, function (err, obj) {
			if (err != null) {
				console.log("genericRemove error = " + err);
			}
			console.log(obj.result.n + " document(s) deleted");
			callback_with_err_and_result(err, obj.result);
		});
	});
};

var genericDeleteOneById = function (collectionName, mongoIdAsString, callback_with_err_and_booleanResult) {
	executeInMongoDbConnection(function (db) {
		db.collection(collectionName).deleteOne({ '_id': new ObjectID(mongoIdAsString) }, function (err, obj) {
			if (err != null) {
				console.log("genericDeleteOneById error = " + err);
				callback_with_err_and_booleanResult(err, false);
			}
			else
				console.log(" 1 document deleted");
			callback_with_err_and_booleanResult(err, true);
		});
	});
};

var genericFindOne = function (collectionName, query, callback_with_err_and_item) {
	executeInMongoDbConnection(function (db) {
		db.collection(collectionName).findOne(query, function (err, item) {
			if (err != null) {
				console.log("genericFindById error = " + err);
			}
			assert.equal(null, err);
			callback_with_err_and_item(err, item);
		});
	});
};

exports.genericUpdateOne = genericUpdateOne;
exports.genericUpsertOne = genericUpsertOne;
exports.genericInsertOne = genericInsertOne;
exports.genericFindList = genericFindList;
exports.genericFindOne = genericFindOne;
exports.genericRemove = genericRemove;
exports.genericDeleteOneById = genericDeleteOneById;
exports.setMongoDbUrl = setMongoDbUrl;
exports.setMongoDbName = setMongoDbName;
exports.executeInMongoDbConnection = executeInMongoDbConnection;
exports.closeCurrentMongoDBConnection = closeCurrentMongoDBConnection;