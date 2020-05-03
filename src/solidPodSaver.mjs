/*
* TTL Solid Pod Datasaver
* Author: Thijs Paelman, Flor Sanders
* Project: VOP 2020 - IoT & Solid
* Date: 2020/04/11
* Description: Small script which loads data from a static turtle file and saves it to a specified location on a solid pod.
*/

// Importing required libraries
import auth from 'solid-auth-cli';	// Solid authorization library for node/command line
import $rdf from 'rdflib';		// Rdf graph manipulation library
import rootlogger from 'loglevel';
import {solidPods} from '../config/config.mjs'; // Config settings
import getPodData from './getPodData.mjs';

/**
 * Main program has to call solidLogIn() to log in to our pods
 */
export { solidLogIn };

const log = rootlogger.getLogger('solidPodSaver');

// Logging in using solid-auth-cli
async function solidLogIn() {
	log.info(`Logging in...`);
	for (const solidPod of solidPods) {
		await auth.login(solidPod).then(async session => { // TODO: sign in for each solid pod
			log.info(`Logged in as ${session.webId}`);

			// Creating rdf lib constructs to be used with solid-auth-cli
			const store = $rdf.graph();
			const updater = new $rdf.UpdateManager(store);
			// Getting the right document
			const podData = await getPodData(session.webId);

			// Remembering the data
			solidPod.podData = podData;
			solidPod.store = store;
			solidPod.updater = updater;
		}).catch(err => { log.error(`Login error: ${err}`); throw err});
	}
	return;
}

// graph is a string of n3
export default function addResourceMeasurement(graph, solidPod) {
	const tempStore = new $rdf.Formula;
	//const tempStore = $rdf.graph();
	log.debug('N3 graph of our measurement: ' + graph);
	log.debug('Our solidPod iotDoc is: ' + solidPod.podData.iotDoc.value);
	$rdf.parse(graph, tempStore, solidPod.podData.iotDoc.value, 'text/n3');
	//log.debug($rdf.serialize(null, tempStore, solidPod.podData.iotDoc.value, 'text/turtle'));
	log.debug($rdf.serialize(null, tempStore, 'http://example.com', 'text/turtle'));
	solidPod.updater.update(null, tempStore, callbackUpdate);
}
function callbackUpdate(uri, success, err) {
	if(success) {
		log.info("Successfully added Resource Measurement in: " + uri);
	}
	else {
		log.error("No succes for " +uri+ " so the err body is " +err);
	}
}
