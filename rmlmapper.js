/*
* TTL Solid Pod Datasaver
* Author: Thijs Paelman
* Project: VOP 2020 - IoT & Solid
* Date: 2020/04/13
* Description: Script to fetch JSON, preprocess JSON & map this to RDF with RMLmapper
*/

// Importing required libraries
const fs = require('fs');    // File system to read in the static file
const $rdf = require('rdflib');   // Rdf graph manipulation library
const rml = require('rocketrml'); // RML mapper to map JSON --> RDF

// Program parameters
const rmlmappingfile = "assets/mapping.ttl" // RML file - TODO: input file specified in the rml-turtle file is relative to *this* file (won't fix)
//const rmloutput = 'output/out.n3'
const protocolLeshanserver = 'http'
const basenameLeshanserver = 'basisLeshan.com'  // will become {protocol}://{basenameLeshanserver}/
const rmloptions = {
    toRDF: true,
    verbose: false,
    xmlPerformanceMode: false,
    replace: false};

rmloptions.functions = {
    'http://functions.com/func#timestamp': () => { return new Date().toISOString(); },
	// not used function:
    'http://functions.com/func#objectInstance': data => { 
	    const objectInst = data[1].match(/\/\d{1,}\/\d{1,}/); // regexp to match /3303/0 of string /3303/0/5700
	    console.log(data[1]);
	    return basenameLeshanserver + data[0] + objectInst[0]; },
};
// data in (now static)
leshanJSONdata = {"ep": "thijs-Galago-Pro","res": "/3303/0/5700","val": {"id": 5700,"value": -2.5}};

/**
 * Preprocessing
 *   Enrich JSON object with extra data or for easier parsing.
 */
leshanJSONdata.protocol = protocolLeshanserver; // choose which protocol the measurement IRI's have
leshanJSONdata.domain = basenameLeshanserver; // choose which basename the measurement IRI's have
const objectHierarchy = leshanJSONdata.res.slice(1).split('/'); //remove leading slash & split into numerals
leshanJSONdata.object = objectHierarchy[0];
leshanJSONdata.objectInstance = objectHierarchy[1];
leshanJSONdata.resource = objectHierarchy[2];

rml_data_in = { 'data.json' : JSON.stringify(leshanJSONdata) };

/**
 * testing RML rocket
 *
 */
const jsonToRDF = async () => {
  //const result = await rml.parseFile(rmlmappingfile, rmloutput, rmloptions)
//		.catch((err) => { console.log(err); });
  loadFileToString(rmlmappingfile).then(async rmlmapping => {
	  const result3 = await rml.parseFileLive(rmlmapping, rml_data_in,rmloptions).catch((err) => {console.log(err); });
	  console.log(result3);
});
};
jsonToRDF();

/**
 * Function to save file contents into a string (from Flor)
 */
function loadFileToString(filename){
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if(err){
                reject(err);
            } else {
                resolve(data.toString());
            }
        })
    })
}
