import $rdf from 'rdflib';              // Rdf graph manipulation library
// Namespaces
const LDP = new $rdf.Namespace('https://www.w3.org/ns/ldp#');
const SPACE = new $rdf.Namespace('http://www.w3.org/ns/pim/space#');
const SOLID = new $rdf.Namespace('http://www.w3.org/ns/solid/terms#');
const RDF = new $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const SCHEMA = new $rdf.Namespace('http://schema.org/');

// Credentials (UNSAFE AS ALL HELL - Only other option is a json file with this info, which is just as bad.)
const solidPod = {
	idp : "https://inrupt.net",
	username : "iotsolidugent",
	password : "***REMOVED***",
}
const solidPods = [solidPod]

// Leshan servers
const leshanServer = { protocol: 'http', basename: 'localhost:8080', rdfBasename:'basisLeshan.com', // will become {protocol}://{basename}/
	solidPodTargets: [0]}; // indices of solidPod which will recieve data from this server
const leshanServers = [leshanServer]; //support multiple servers

// RML parameters
const ontology = 'https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#';
//const rmlmappingfile = "assets/mapping_uuid.ttl" // RML file - TODO: input file specified in the rml-turtle file is relative to *this* file (won't fix)
const rmlmappingfile = "../config/mapping_blank_nodes.ttl" // RML file - TODO: input file specified in the rml-turtle file is relative to *this* file (won't fix)
const rmloptions = { 
    toRDF: true,
    verbose: false,
    xmlPerformanceMode: false,
    replace: false};

export {LDP, SPACE, SOLID, RDF, SCHEMA};
export { leshanServers, solidPods };
export { ontology as lwm2mOnto, rmlmappingfile, rmloptions};
