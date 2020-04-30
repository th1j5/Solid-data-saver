/**
 * Solid Pod Datasaver
 * Author: Thijs Paelman
 * Project: VOP 2020 - IoT & Solid
 * Date: 2020/04/27
 * Description: Module to search in ontology
 */

// Importing required libraries
import util from 'util';
import rdfstore from 'rdfstore'; // Different lib from rdflib.js to do SPARQL queries - used for objectClassToIRI and such
import rootlogger from 'loglevel';
// Program parameters
import {lwm2mOnto as ontology} from '../config/config.mjs';

// Export required functions
export { loadOntology_promise as loadOntology, objectClassToIRI_SPARQL_query_on_ontology as objectClassToIRI, resourceClassToIRI_SPARQL_query_on_ontology as resourceClassToIRI };

// Promisify (turning a function with a callback into a function returning a promise)
const createStore = util.promisify(rdfstore.create);
const log = rootlogger.getLogger('ontologySearcher');
let ontStore; // contains ontology store
const sparqlPrefixes = `
        PREFIX lwm2m: <${ontology}>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
`
// Using an arrow function to return a template literal (notice the absence of {})
// objNum is a string
const queryObjectClass = (objNum) => sparqlPrefixes + `
        SELECT ?objectName
        WHERE
                {
                        ?objectName rdfs:subClassOf lwm2m:Object, ?blank .
                        ?blank owl:onProperty lwm2m:hasObjectID ;
                                owl:hasValue "${objNum}"^^xsd:integer .
                }
        `;
// TODO (explanation)
const queryResourceClass = (objNum, resNum) => sparqlPrefixes + ` 
        SELECT ?objectName
                ?resourceName
                ?x
        WHERE
                {
                        ?objectName rdfs:subClassOf lwm2m:Object, ?blankObjectID , ?blankConsistsOf .
                        ?blankObjectID owl:onProperty lwm2m:hasObjectID ;
                                owl:hasValue "${objNum}"^^xsd:integer .

                        ?blankConsistsOf rdf:type owl:Restriction ;
                                owl:onProperty lwm2m:consistsOf ;
                                ?x ?resourceName .    

                        ?resourceName rdfs:subClassOf lwm2m:Resource , ?blankResourceID .
                        ?blankResourceID owl:onProperty lwm2m:hasResourceID ;
                                owl:hasValue "${resNum}"^^xsd:integer .
                }
        `;

/**
 * The main program has to call loadOntology() to make the ontology load
 */

/**
 * OWL Ontology loading
 *
 * Loading structure better than before, returning a Promise while loading
 */
async function loadOntology_promise() {
	ontStore = await createStore();		// First create store and wait for it
	log.debug('ontology store created')
	return new Promise( (resolve, reject) => {	// Then load ontology into it, returning a promise. Resolve(ans) is a number of how many elements are loaded.
		ontStore.load('remote', ontology, (err, ans) => {
			if(err) reject(err);
			else log.info('Ontology loaded to search in'); resolve(ans);
		});
	});
}

/**
 * Future work
 * Function to map objectNumber --> objectClass
 * This shouldn't use queries biased on the representation of the Ontology,
 * but instead use some reasoning or something like that to be more robust.
 * HyLAR-Reasoner could be a useful Javascript lib in this process.
 */
async function objectClassToIRI_reasoning(data) {
	return;
}

/**
 * Function to map objectNumber --> objectClass
 * This uses a SPARQL query on the RDF/Turtle-representation of the ontology
 */
// Can be an async function, because RMLRocket supports this since v1.7.0
async function objectClassToIRI_SPARQL_query_on_ontology(data) {
	log.warn("Warning: using an 'in development' function");
	const obj = data[0];
	log.debug(queryObjectClass(obj));
	const iri = await new Promise( (resolve, reject) => {
		ontStore.execute(queryObjectClass(obj), (err, resp) => {
			if(err) reject(err);
			else {
				const iri = resp[0].objectName.value;
				log.debug('IRI found as class for ' + obj + ' is ' + iri);
				resolve(iri);
			}
		});
	});
	return iri;
}

/**
 * Future work
 * Function to map resourceNumber --> resourceClass
 * This shouldn't use queries biased on the representation of the Ontology,
 * but instead use some reasoning or something like that to be more robust.
 * HyLAR-Reasoner could be a useful Javascript lib in this process.
 */
async function resourceClassToIRI_reasoning(data) {
	return;
}

/**
 * Function to map resourceNumber --> resourceClass
 * This uses a SPARQL query on the RDF/Turtle-representation of the ontology
 */
// Can be an async function, because RMLRocket supports this since v1.7.0
async function resourceClassToIRI_SPARQL_query_on_ontology(data) {
	log.warn("Warning: using an 'in development' function");
	const obj = data[0];
	const res = data[1];
	const resn = Number(res);

	log.debug(queryResourceClass(obj, res));
	const iri = await new Promise( (resolve, reject) => {
		ontStore.execute(queryResourceClass(obj, res), (err, resp) => {
			if(err) reject(err);
			else {
				const iri = resp[0].resourceName.value;
				log.debug('IRI found as class for ' + res + ' is ' + iri);
				resolve(iri);
			}
		});
	});
	return iri;
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
