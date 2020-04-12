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
const $rdf = require('rdflib');   // Rdf graph manipulation library

// Program parameters
const staticfile = "static1.ttl";  // Turtle file with static sensor data
const database = "https://iotsolidugent.inrupt.net/private/static.ttl"; // Static turtle file stored on solid pod

// Credentials (UNSAFE AS ALL HELL - Only other option is a json file with this info, which is just as bad.)
const idp = "https://inrupt.net";
const username = "iotsolidugent";
const password = "***REMOVED***";

// Creating rdf lib constructs to be used with solid-auth-cli
const store = $rdf.graph();
const fetcher = $rdf.fetcher(store);

// Loging in using solid-auth-cli
console.log(`Loggin in...`);
auth.login({idp, username, password}).then(session => {
    console.log(`Logged in as ${session.webId}`);
    // Using the fetcher to get our graph stored in the solid datapod
    
    fetcher.nowOrWhenFetched(database, (ok, body, xhr) => {
        // Check wether fetch returns 200 OK
        if(!ok){
            console.log(`Data in ${database} couldn't be fetched.`);    
        } else {
            console.log(`${database} fetched succesfully: ${body}`);
            console.log(`Parsing data...`);
            try{
                // Parsing the data
                $rdf.parse(xhr.responseText, store, database, 'text/turtle');
                console.log(`Parse succesful!`);
                // Now read data from static file and add it in as well --> This should be adapted to the dynamically incoming data (in some way!!!): TODO
                console.log(`Reading file...`);
                loadFileToString(staticfile).then(data => {
                    console.log(`File read succesful!`)
                    console.log(`Parsing file content...`);
                    try{
                        $rdf.parse(data, store, database, 'text/turtle');
                        console.log(`Parse succesful!`);
                        // TODO: Write the store back to the solid pod!
                        // console.log($rdf.serialize(null, store, database, 'text/turtle')); // You can use the serialized data to store a local backup! (Just use fs to write it to a local file)
                    } catch(err) {
                        console.log(`Parsing error: ${err}`)
                    }
                }).catch(err => console.log(`File read error: ${err}`));
            } catch(err) {
                console.log(`Parsing error: ${err}`);
            }
        }
    })
}).catch(err => console.log(`Login error: ${err}`));

// Function to save file contents into a string
function loadFileToString(filename){
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) =>{
            if(err){
                reject(err);
            } else {
                resolve(data.toString());
            }
        })
    })
}