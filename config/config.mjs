import $rdf from 'rdflib';              // Rdf graph manipulation library
import rootlogger from 'loglevel';

// Set default loglevel
rootlogger.setDefaultLevel(rootlogger.levels.INFO);
// Set loglevel per Logger
//rootlogger.getLogger('rmlmapper').setLevel(rootlogger.levels.DEBUG);
//rootlogger.getLogger('solidPodSaver').setLevel(rootlogger.levels.DEBUG);
//rootlogger.getLogger('solidPodQuerier').setLevel(rootlogger.levels.DEBUG);
//rootlogger.getLogger('getPodData').setLevel(rootlogger.levels.DEBUG);
//rootlogger.getLogger('leshanEventRetriever').setLevel(rootlogger.levels.DEBUG);

// Credentials (UNSAFE AS ALL HELL - Only other option is a json file with this info, which is just as bad.)
const solidPod = {
	idp : "https://inrupt.net",
	username : "iotsolidugent",
	password : "***REMOVED***",
}
const solidPodFlor = {
	idp : "https://inrupt.net",
	username : "FlorSanders",
	password : "***REMOVED***",
}
const solidPods = [solidPod]

// Leshan servers
const leshanServer = { protocol: 'http', basename: 'localhost:8080', rdfBasename:'basisLeshan.com', // will become {protocol}://{basename}/
	solidPodTargets: [0]}; // indices of solidPod which will recieve data from this server
const leshanServers = [leshanServer]; //support multiple servers

// RML parameters
const ontology = 'https://iotsolidugent.inrupt.net/public/ontologies/omalwm2m.owl.ttl#';
const skolemization = true; // https://www.w3.org/TR/rdf11-concepts/#section-skolemization
const rmlmappingfile = "config/mapping_uuid.ttl"; // RML file - TODO: input file specified in the rml-turtle file is relative to *this* file (won't fix)
//const rmlmappingfile = "config/mapping_blank_nodes.ttl" // RML file - TODO: input file specified in the rml-turtle file is relative to *this* file (won't fix)
const rmloptions = { 
    toRDF: true,
    verbose: false,
    xmlPerformanceMode: false,
    replace: false};

// Namespaces
const LDP = new $rdf.Namespace('https://www.w3.org/ns/ldp#');
const SPACE = new $rdf.Namespace('http://www.w3.org/ns/pim/space#');
const SOLID = new $rdf.Namespace('http://www.w3.org/ns/solid/terms#');
const RDF = new $rdf.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');
const SCHEMA = new $rdf.Namespace('http://schema.org/');
const LWM2M = new $rdf.Namespace(ontology);


export {LDP, SPACE, SOLID, RDF, SCHEMA, LWM2M};
export { leshanServers, solidPods };
export { ontology as lwm2mOnto, rmlmappingfile, rmloptions, skolemization};
