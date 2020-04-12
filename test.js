// Just a file in which tests can be run whether something works, currently checks if parsing 2 turtle files into 1 store indeeds results in the union of both graphs, which is the case. So all is fine!
// Importing required libraries
const fs = require('fs');    // File system to read in the static file
const auth = require('solid-auth-cli');  // Solid authorization library for node/command line
const {once} = require('events');   // Events is needed to synchronize the loading of different datasets
const $rdf = require('rdflib');   // Rdf graph manipulation library

// Static datafiles
file1 = 'static1.ttl';
file2 = 'static2.ttl';

// Creating rdf lib constructs to be used with solid-auth-cli
const store = $rdf.graph();

// Loading both files to string
loadFileToString(file1).then(data1 => {
    loadFileToString(file2).then(data2 => {
        // Parse both files into the store (let's hope this results in a single merged graph!)
        $rdf.parse(data1, store, 'https://www.example.com/' + file1, 'text/turtle');
        $rdf.parse(data2, store, 'https://www.example.com/' + file1, 'text/turtle');
        
        console.log($rdf.serialize(null, store, 'https://www.example.com/' + file1, 'text/turtle'));
    }).catch(err => console.log(err));
}).catch(err => console.log(err))


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


// /* Pretty much independent piece of code to try out graphy functionality */
// const graphy = require('graphy');   // Library for manipulating rdf data
// const ttl_read = graphy.content.ttl.read;   // Read function
// const ttl_write = graphy.content.ttl.write; // Write function
// const dataset = graphy.memory.dataset.fast; // Dataset object

// // Trying to take the union of two static datasets and saving them to the output file
// let data1 = dataset();
// fs.createReadStream('static1.ttl')
//     .pipe(ttl_read())
//     .pipe(data1);
// let data2 = dataset();
// fs.createReadStream('static2.ttl')
//     .pipe(ttl_read())
//     .pipe(data2);
// outfile = fs.createWriteStream('dataunion.ttl');

// // Loads the dataunion and writes it to an outputfile
// (async() => {
//     let dataunion = await mergedata(data1, data2);
//     dataunion.pipe(ttl_write()).pipe(outfile);
// })();

// // Computes the union of two datasets, which might still be loading, and returns it
// async function mergedata(dataset1, dataset2){
//     await Promise.all([
//         once(dataset1, 'finish'),
//         once(dataset2, 'finish')
//     ]);
//     return dataset1.union(dataset2);
// }

// Introducing our namespaces (Actually shouldn't be strictly needed, since we won't be querying the data unless we're testing.)
var LWM2M = $rdf.Namespace("https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#");    // Self-published omalwm2m ontology
var RDF = $rdf.Namespace("http://www.w3.org/1999/02/22-rdf-syntax-ns#");                         // Used mainly for RDF('type')
var XSD = $rdf.Namespace("http://www.w3.org/2001/XMLSchema#");                                   // Used for its units

// var device = store.match(null, RDF('type'), LWM2M('Device'), null).object;
// //console.log(device)
// var objects = store.match(device, LWM2M('contains'), null, null);
// for(var i =0; i < objects.length; i++){
//     console.log(objects[i].subject);
// }