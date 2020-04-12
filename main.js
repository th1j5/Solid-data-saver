/*
* TTL Solid Pod Datasaver
* Author: Flor Sanders
* Project: VOP 2020 - IoT & Solid
* Date: 2020/04/11
* Description: Small script which loads data from a static turtle file and saves it to a specified location on a solid pod.
*/
// Importing required libraries
const fs = require('fs');    // File system to read in the static file
const auth = require('solid-auth-cli');  // Solid authorization library for node/command line
const {once} = require('events');   // Events is needed to synchronize the loading of different datasets
const graphy = require('graphy');   // Library for manipulating rdf data
const ttl_read = graphy.content.ttl.read;   // Read function
const ttl_write = graphy.content.ttl.write; // Write function
const dataset = graphy.memory.dataset.fast; // Dataset object
const stream = graphy.core.iso.stream;  // Datastream

// Program parameters
const filename = "static.ttl";  // Turtle file with static sensor data
// Credentials (UNSAFE AS ALL HELL - Only other option is a json file with this info, which is just as bad.)
const idp = "https://inrupt.net";
const username = "iotsolidugent";
const password = "***REMOVED***";

// // Function which reads in the contents of the static turtle file and hands them over to the data saver
// fs.readFile(filename, (err, data) => {
//     if (err) throw err;
//     // Simply log the data for now while we develop the data saver functions
//     // console.log(data.toString());
// });

// // Persistent login function: Checks if session is open and opens one if this was not the case.
// async function login(credentials) {
//     console.log(`Login in...`);
//     var session = await auth.currentSession();
//     if (!session) session = await auth.login(credentials);
//     return session;
// }

// // Login test
// login({idp, username, password}).then(session => {
//     console.log(`Logged in as ${session.webId}`);
// })

// Trying to take the union of two static datasets and saving them to the output file
let data1 = dataset();
fs.createReadStream('static1.ttl')
    .pipe(ttl_read())
    .pipe(data1);
let data2 = dataset();
fs.createReadStream('static2.ttl')
    .pipe(ttl_read())
    .pipe(data2);
outfile = fs.createWriteStream('dataunion.ttl');

(async() => {
    await Promise.all([
        once(data1, 'finish'),
        once(data2, 'finish')
    ]);

    let dataunion= data1.union(data2);
    await(Promise.all([dataunion, 'finish']))
    console.log(data1.size + data2.size)
    console.log(dataunion.size)
    dataunion.pipe(ttl_write()).pipe(outfile);
})();