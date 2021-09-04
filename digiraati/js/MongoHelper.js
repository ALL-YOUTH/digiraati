// MongoDB configuration

const MongoClient = require('mongodb').MongoClient;
const assert = require('assert');

function RemoveDocument(coll, cond, callback)
{
    const url = 'mongodb://localhost:27017';

    const dbName = 'digiraati';
    const client = new MongoClient(url, {useUnifiedTopology: true});

    client.connect (function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");

        const db = client.db(dbName);

        const collection = db.collection(coll);

        collection.deleteOne({cond}).toArray(function(err, result){
            assert.equal(err, null);
            console.log("Removed document");
            console.log(result);
            callback(result);
        });

        client.close();
    });
}

function RetrieveFullCollection(coll, callback)
{
    const url = 'mongodb://localhost:27017';

    const dbName = 'digiraati';
    const client = new MongoClient(url, {useUnifiedTopology: true});

    client.connect (function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");

        const db = client.db(dbName);

        const collection = db.collection(coll);

        collection.find({}).toArray(function(err, docs){
            assert.equal(err, null);
            console.log("found the following records");
            console.log(docs);
            callback(docs);
        });

        client.close();
    });
}

function RetrieveDocuments(coll, cond, callback)
{

    const url = 'mongodb://localhost:27017';

    const dbName = 'digiraati';
    const client = new MongoClient(url, {useUnifiedTopology: true});

    client.connect (function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");

        const db = client.db(dbName);

        const collection = db.collection(coll);

        collection.find({cond}).toArray(function(err, docs){
            assert.equal(err, null);
            console.log("found the following records");
            console.log(docs);
            callback(docs);
        });

        client.close();
    });

}

function UpdateDocument(coll, cond, update, callback)
{
    const url = 'mongodb://localhost:27017';

    const dbName = 'digiraati';
    const client = new MongoClient(url, {useUnifiedTopology: true});

    client.connect (function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");

        const db = client.db(dbName);

        const collection = db.collection(coll);

        collection.updateOne({cond}, {$set: update}).toArray(function(err, result){
            assert.equal(err, null);
            assert.equal(1, result.matchedCount);
            assert.equal(1, result.modifiedCount);
            callback(result);
        });

        client.close();
    });
}

function InsertDocuments(coll, docs, callback)
{
    const url = 'mongodb://localhost:27017';

    const dbName = 'digiraati';
    const client = new MongoClient(url, {useUnifiedTopology: true});

    client.connect (function(err) {
        assert.equal(null, err);
        console.log("Connected successfully to server");

        const db = client.db(dbName);

        const collection = db.collection(coll);

        collection.insertMany(docs, function(err, result) {
            assert.equal(err, null);
            assert.equal(data.length, result.ops.length);
            console.log("inserted " + data.length + " documents into collection " + coll);
            callback(result);
        });

        client.close();
    });
}

exports.RemoveDocument = RemoveDocument;
exports.RetrieveDocuments = RetrieveDocuments;
exports.RetrieveFullCollection = RetrieveFullCollection;
exports.InsertDocuments = InsertDocuments;
exports.UpdateDocument = UpdateDocument;