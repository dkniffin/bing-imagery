// Create a MySQL connection pool with
// a max of 10 connections, a min of 2, and a 30 second max idle time
var poolModule = require('generic-pool');
var Connection = require('tedious').Connection;
var config = require('./db-config');

var pool = poolModule.Pool({
    name     : 'mssql',
    create   : function(callback) {
        console.log('creating connection')
        var connection = new Connection(config);

        connection.on('connect', function(err) {
            callback(err,connection)
        });
    },
    destroy  : function(client) { client.close(); },
    max      : 10,
    // optional. if you set this, make sure to drain() (see step 3)
    min      : 2,
    // specifies how long a resource can stay idle in pool before being removed
    idleTimeoutMillis : 300000,
     // if true, logs via console.log - can also be a function
    log : true
});

module.exports = pool