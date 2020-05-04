// 
import rootlogger from 'loglevel';
import $rdf from 'rdflib';		// Rdf graph manipulation library
import {solidPods} from '../config/config.mjs'; // Config settings
import {RDF, SOLID, SPACE, SCHEMA, LWM2M} from '../config/config.mjs'; //Namespaces

export { getGenIdExistingNode };

const log = rootlogger.getLogger('solidPodQuerier');

function getGenIdExistingNode(lwm2mResourceClass, solidPod) {
	const node = getExistingNode(lwm2mResourceClass, solidPod);
	// would perfectly fit ?. optional chaining operator :/
	return node && node.value.split('/').pop(); // get uuid
}

function getExistingNode(lwm2mResourceClass, solidPod) {
	const LwM2MresClass = solidPod.store.sym(lwm2mResourceClass);
	log.debug('LwM2M resource class:', LwM2MresClass);
	const resources = solidPod.store.match(null, RDF('type'), LWM2M('ResourceInstance'), solidPod.podData.iotDoc).map(quad => quad.subject);
	const neededResource = solidPod.store.any(null, RDF('type'), LwM2MresClass, solidPod.podData.iotDoc);
	log.debug('solidPod', solidPod.podData.iotDoc);
	log.debug('resources', resources);
	log.debug('neededResource', neededResource);
	// check neededResource is indeed a resource
	return resources.includes(neededResource) ? neededResource : undefined;
}
