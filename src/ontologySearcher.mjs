/**
 * Solid Pod Datasaver
 * Author: Thijs Paelman
 * Project: VOP 2020 - IoT & Solid
 * Date: 2020/04/27
 * Description: Module to search in ontology
 */

// Importing required libraries
import rdfstore from 'rdfstore'; // Different lib from rdflib.js to do SPARQL queries - used for objectClassToIRI and such
// Program parameters
import {lwm2mOnto as ontology} from '../config/config.mjs';

// Export required functions
export { objectClassToIRI_hardcoded as objectClassToIRI, resourceClassToIRI_hardcoded as resourceClassToIRI };

let ontStore; // contains ontology store
let ontStoreLoaded; // boolean to indicate it is loaded

/**
 * Side effect
 */
loadOntology()

/**
 * OWL Ontology loading
 *
 * Really bad loading structure, we can't do something async to wait for our store to load
 */
function loadOntology() {
	rdfstore.create( (err, store) => { // create store
		if(err) console.log("Error creating store for ontology");
		store.load('remote', ontology, (err, ans) => { // load ontology
			if(err) console.log("Error loading ontology");
			console.log(ans);
			console.log("LOADED STORE")
			ontStoreLoaded = true;
		});
		ontStore = store; // remember store
	});
}
/**
 * Helper function to wait for store to be loaded
 */
function waitForOntology() {
	// NOT POSSIBLE: (because it cannot be an async function)
	// https://stackoverflow.com/a/56216283
	// or could use util.promisify - https://nodejs.org/api/timers.html#timers_settimeout_callback_delay_args
	//while(!ontStoreLoaded) {
	//	await new Promise(resolve => setTimeout(resolve, 1000));
	//}
	//if(!ontStoreLoaded) { setTimeout(waitForOntology, 500) };
	//else console.log("LOADED");
}

/**
 * Function to map objectNumber --> objectClass
 * Hard coded for now (TODO)
 * options: owl:sameAs is no option (then we adjust the ontology)
 *  - download some XML document from LwM2M registry, search in there
 *  - search in Ontology: class hasObjectID 3303 (but ontology graph != rdf-graph)
 */
function objectClassToIRI_hardcoded(data) {
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
// Cannot be a async function, because RMLRocket doesn't support this
function objectClassToIRI_exp(data) {
	console.log("Warning: using an 'in development' function");
	const obj = data[0];
	let iri = ontology;
	const test = waitForOntology();
	console.log(`Test is: ${test}`);
	return iri += 'LWM2MTemperatureObject';
}
/**
 * Function to map resourceNumber --> resourceClass
 * Hard coded for now (TODO)
 * options: owl:sameAs is no option (then we adjust the ontology)
 *  - download some XML document from LwM2M registry, search in there
 *  - search in Ontology: class hasResourceID 5700 (but ontology graph != rdf-graph)
 */
function resourceClassToIRI_hardcoded(data) {
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
