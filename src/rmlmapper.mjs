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
import { v4 as uuidv4 } from 'uuid'; // Random ID generator
import rootlogger from 'loglevel';
import { objectClassToIRI, resourceClassToIRI } from './ontologySearcher.mjs';
// Program parameters
import {lwm2mOnto as ontology, rmlmappingfile, rmloptions, skolemization} from '../config/config.mjs';

const log = rootlogger.getLogger('rmlmapper');

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
			rmlmapping = rmlmapping.replace(/\${LwM2Montology}/g, ontology);// replace some values
			log.trace('This is the used rmlmapping:', rmlmapping);
			return await rml.parseFileLive(rmlmapping, rml_data_in, rmloptions)
				.catch( (err) => {log.error(err);});
		});
}

/**
 * Preprocessing
 *   Enrich JSON object with extra data or for easier parsing.
 *   Notification format is assumed
 *   Ducktyping Coaplog format and rewriting it to Notification format
 *   (see fileend for examples)
 */
function preprocessJSON(leshanJSONdata, lserver) {
	const data = {};
	data.leshanServer = {};
	data.device = {};
	data.meas = [];
	// Server options
	data.leshanServer.protocol = lserver.protocol; // choose which protocol the measurement IRI's have
	data.leshanServer.domain = lserver.rdfBasename; // choose which basename the measurement IRI's have
	data.device.ep = leshanJSONdata.ep;
	// measurements
	for (const meas of leshanJSONdata.payload.e) {
		const wholeHierarchy = leshanJSONdata.payload.bn + ( meas.n ? meas.n : '' ); // '/3303/0/' + '5700'
		const objectHierarchy = wholeHierarchy.slice(1).split('/'); //remove leading slash & split into numerals
		const datameas = { 
			object : objectHierarchy[0],
			objectInstance : objectHierarchy[1],
			resource : objectHierarchy[2],
			value : meas.v, //TODO: sv, sb (string/boolean)
		};
		if (skolemization) {
			// Could dynamically import uuid, but this is not suggested
			datameas.skolemIRI = uuidv4();
		}
		data.meas.push(datameas); // new meas
	}
	log.debug(data);

	return { 'data.json': JSON.stringify(data)}; // RML data in
}

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
	    log.debug(data[1]);
	    return basenameLeshanserver + data[0] + objectInst[0]; },
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

/**
 * Run if main script file - Node.js only
 * https://stackoverflow.com/questions/34842738/if-name-main-equivalent-in-javascript-es6-modules
 * doesn't work since ES6 :(
 */

/**
 * JSON object formats
 *
 * NOTIFICATION format
 * {
 *  ep: 'thijs-Galago-Pro',
 *  res: '/3303/0/5700',
 *  val: { id: 5700, value: -38.8 }
 * }
 *
 * COAPLOG format
 * {
 *   timestamp: 1588281716952,
 *   incoming: true,
 *   type: 'NON',
 *   code: '2.05',
 *   mId: 16395,
 *   token: 'C7BD44603DE8DA1A',
 *   options: 'Content-Format: "application/vnd.oma.lwm2m+json" - Observe: 3691',
 *   payload: { bn: '/3303/0/5700', e: [ { v: -28.8 } ] },
 *   ep: 'thijs-Galago-Pro'
 * }
 *
 * OR payload: { bn: '/3303/0/', e: [{n: 5601, v: 19 }, {n:5700, v:30}]}
 * and v can be 'v' or 'bv'/'vb' (boolean value) or 'sv'/'vs' (string value)
 *
 */
