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
const cli = require('solid-cli')

// Program parameters
const filename = "static.ttl";  // Turtle file with static sensor data
// Credentials
const idp = "https://inrupt.net";
const username = "iotsolidugent";
const password = "***REMOVED***";
const credentials = "credentials.json"; // File containing credentials needed for login (UNSAFE!!!)

// Function which reads in the contents of the static turtle file and hands them over to the data saver
fs.readFile(filename, (err, data) => {
    if (err) throw err;
    // Simply log the data for now while we develop the data saver functions
    // console.log(data.toString());
});

console.log("Loggin in...")
auth.login({idp, username, password}).then(session => {
    console.log(`logged in as ${session.webId}`);
}, err => console.log("Error logging in: " + err));