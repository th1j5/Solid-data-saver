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
import {solidPods} from '../config/config.mjs'; // Config settings
import getPodData from './getPodData.mjs';

/**
 * Main program has to call solidLogIn() to log in to our pods
 */
export { solidLogIn };

// Logging in using solid-auth-cli
async function solidLogIn() {
	console.log(`Logging in...`);
	for (const solidPod of solidPods) {
		auth.login(solidPod).then(async session => { // TODO: sign in for each solid pod
			console.log(`Logged in as ${session.webId}`);

			// Creating rdf lib constructs to be used with solid-auth-cli
			const store = $rdf.graph();
			solidPod.store = store;
			const updater = new $rdf.UpdateManager(store);
			solidPod.updater = updater;

			// Getting the right document
			const podData = await getPodData(session.webId);
			// Remembering the data
			solidPod.podData = podData;
			//updater.addDownstreamChangeListener(podData.iotDoc, fancyFunction);
			//updater.reloadAndSync(podData.iotDoc);
		}).catch(err => console.log(`Login error: ${err}`));
	}
}

// graph is a string of n3
export default function addResourceMeasurement(graph, solidPod) {
	const tempStore = new $rdf.Formula;
	//const tempStore = $rdf.graph();
	$rdf.parse(graph, tempStore, solidPod.podData.iotDoc.value, 'text/n3');
	solidPod.updater.update(null, tempStore, callbackUpdate);
}
function callbackUpdate(uri, success, err) {
	if(success) {
		console.log("Successfully added Resource Measurement in: " + uri);
	}
	else {
		console.log("No succes for " +uri+ " so the err body is " +err);
	}
}
