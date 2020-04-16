/*
* TTL Solid Pod Datasaver
* Author: Thijs Paelman
* Project: VOP 2020 - IoT & Solid
* Date: 2020/04/13
* Description: Script to fetch JSON, preprocess JSON & map this to RDF with RMLmapper
*/

// Importing required libraries
import fs from 'fs';    	// File system to read in the static file
import $rdf from 'rdflib';   	// Rdf graph manipulation library
import rml from 'rocketrml'; 	// RML mapper to map JSON --> RDF

// Program parameters
const rmlmappingfile = "assets/mapping.ttl" // RML file - TODO: input file specified in the rml-turtle file is relative to *this* file (won't fix)
const protocolLeshanserver = 'http'
const basenameLeshanserver = 'basisLeshan.com'  // will become {protocol}://{basenameLeshanserver}/
const rmloptions = {
    toRDF: true,
    verbose: false,
    xmlPerformanceMode: false,
    replace: false};

// RML functions
rmloptions.functions = {
    'http://functions.com/func#timestamp': () => { return new Date().toISOString(); },
	// not used function:
    'http://functions.com/func#objectInstance': data => { 
	    const objectInst = data[1].match(/\/\d{1,}\/\d{1,}/); // regexp to match /3303/0 of string /3303/0/5700
	    console.log(data[1]);
	    return basenameLeshanserver + data[0] + objectInst[0]; },
};

/**
 * Main function:
 *   input: JSON-object
 *   ouput: text/n3 (String)
 */
export default async function jsonObjectToRDF(leshanJSONdata) {
	const rml_data_in = preprocessJSON(leshanJSONdata); //prepare rml_data_in
	return loadFileToString(rmlmappingfile)
		.then( async (rmlmapping) => { 
			return await rml.parseFileLive(rmlmapping, rml_data_in, rmloptions)
				.catch( (err) => {console.log(err);});
		});
}

/**
 * Preprocessing
 *   Enrich JSON object with extra data or for easier parsing.
 */
function preprocessJSON(leshanJSONdata) {
	leshanJSONdata.protocol = protocolLeshanserver; // choose which protocol the measurement IRI's have
	leshanJSONdata.domain = basenameLeshanserver; // choose which basename the measurement IRI's have
	const objectHierarchy = leshanJSONdata.res.slice(1).split('/'); //remove leading slash & split into numerals
	leshanJSONdata.object = objectHierarchy[0];
	leshanJSONdata.objectInstance = objectHierarchy[1];
	leshanJSONdata.resource = objectHierarchy[2];

	return { 'data.json': JSON.stringify(leshanJSONdata)}; // RML data in
}

/**
 * testing RML rocket
 *
 */
const jsonToRDF_test = async () => {
	const result = await rml.parseFile(rmlmappingfile, rmloutput, rmloptions)
		.catch((err) => { console.log(err); });
	console.log(result);
	loadFileToString(rmlmappingfile).then(async rmlmapping => {
		const result2 = await rml.parseFileLive(rmlmapping, rml_data_in,rmloptions).catch((err) => {console.log(err); });
		console.log(result2);
	});
};

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
