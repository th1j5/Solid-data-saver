/*
* TTL Solid Pod Datasaver
* Author: Thijs Paelman
* Project: VOP 2020 - IoT & Solid
* Date: 2020/04/13
* Description: Script to fetch JSON, preprocess JSON & map this to RDF with RMLmapper
*/

// Importing required libraries
import fs from 'fs';    	// File system to read in the static file
import rml from 'rocketrml'; 	// RML mapper to map JSON --> RDF
import uuid from 'uuid'; // Random ID generator
// Program parameters
import {lwm2mOnto as ontology, rmlmappingfile, rmloptions, skolemization} from '../config/config.mjs';

/**
 * Main function:
 *   input: JSON-object
 *          leshanserver-object
 *   ouput: text/n3 (String)
 */
export default async function jsonObjectToRDF(leshanJSONdata, lserver={ protocol: 'http', basename: 'localhost:8080', rdfBasename:'defaultLeshan.com'}) {
	const rml_data_in = preprocessJSON(leshanJSONdata, lserver); //prepare rml_data_in
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
function preprocessJSON(leshanJSONdata, lserver) {
	leshanJSONdata.protocol = lserver.protocol; // choose which protocol the measurement IRI's have
	leshanJSONdata.domain = lserver.rdfBasename; // choose which basename the measurement IRI's have
	const objectHierarchy = leshanJSONdata.res.slice(1).split('/'); //remove leading slash & split into numerals
	leshanJSONdata.object = objectHierarchy[0];
	leshanJSONdata.objectInstance = objectHierarchy[1];
	leshanJSONdata.resource = objectHierarchy[2];
	if (skolemization) {
		// Could dynamically import uuid, but this is not suggested
		leshanJSONdata.skolemIRI = uuid.v4();
	}

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
 * RML functions
 */
rmloptions.functions = {
    'http://functions.com/func#timestamp': () => { return new Date().toISOString(); },
	// not used function:
    'http://functions.com/func#objectClassIRI': objectClassToIRI,
    'http://functions.com/func#resourceClassIRI': resourceClassToIRI,
    'http://functions.com/func#objectInstance': data => { 
	    const objectInst = data[1].match(/\/\d{1,}\/\d{1,}/); // regexp to match /3303/0 of string /3303/0/5700
	    console.log(data[1]);
	    return basenameLeshanserver + data[0] + objectInst[0]; },
};
/**
 * Function to map objectNumber --> objectClass
 * Hard coded for now (TODO)
 * options: owl:sameAs is no option (then we adjust the ontology)
 *  - download some XML document from LwM2M registry, search in there
 *  - search in Ontology: class hasObjectID 3303 (but ontology graph != rdf-graph)
 */
function objectClassToIRI(data) {
	const obj = data[0];
	//obj is string of 3303
	let iri = ontology;
	switch(obj) {
		case '3303':
			iri += "LWM2MTemperatureObject";
			break;
		case '3304':
			iri += "LWM2MHumidityObject";
			break;
		default:
			iri += "Object";
			break;
	}
	return iri;
}
/**
 * Function to map resourceNumber --> resourceClass
 * Hard coded for now (TODO)
 * options: owl:sameAs is no option (then we adjust the ontology)
 *  - download some XML document from LwM2M registry, search in there
 *  - search in Ontology: class hasResourceID 5700 (but ontology graph != rdf-graph)
 */
function resourceClassToIRI(data) {
	const obj = data[0];
	const res = data[1];
	const resn = Number(res);
	//obj is string of 3303
	//res is string of 5700
	let iri = ontology;
	if(2048 <= resn && resn <= 10240) { // if in 'Reusable Resources' range
		switch(res) {
			case '5700':
				iri += "SensorValue";
				break;
			default:
				iri += "Resource";
				break;
		}
	}
	else if (res < 2048) {
		switch(obj) {
			case '':
				switch(res) {
					default:
						iri += "Resource";
						break;
				}
				break;
			default:
				iri += "Resource";
				break;
		}
	}
	return iri;
}

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

/**
 * Run if main script file - Node.js only
 * https://stackoverflow.com/questions/34842738/if-name-main-equivalent-in-javascript-es6-modules
 * doesn't work since ES6 :(
 */
