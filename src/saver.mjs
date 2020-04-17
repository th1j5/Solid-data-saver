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

// Program parameters
const database = "https://iotsolidugent.inrupt.net/private/static.ttl"; // Static turtle file stored on solid pod
const doc = $rdf.sym(database);


// Loging in using solid-auth-cli
async function solidLogIn() {
	console.log(`Logging in...`);
	solidPods.forEach( solidPod => {
		auth.login(solidPod).then(async session => { // TODO: sign in for each solid pod
			console.log(`Logged in as ${session.webId}`);

			// Creating rdf lib constructs to be used with solid-auth-cli
			const store = $rdf.graph();
			solidPod.store = store;
			const fetcher = new $rdf.Fetcher(store);
			const updater = new $rdf.UpdateManager(store);

			// Getting the right document
			const podData = await getPodData(session.webId);
			console.log(podData);
			//updater.addDownstreamChangeListener(doc, fancyFunction);
			//updater.reloadAndSync(doc);
		}).catch(err => console.log(`Login error: ${err}`));
	});
}
solidLogIn();

// graph is a string of n3
export default function addResourceMeasurement(graph, solidPod) {
	const tempStore = new $rdf.Formula;
	//const tempStore = $rdf.graph(); // VERY STRANGE: IndexedFormula doesn't work, but graph() does... They SHOULD be synonym
	$rdf.parse(graph, tempStore, doc.uri, 'text/turtle');
	//console.log(tempStore)
	updater.update(null, tempStore, callbackUpdate);
}
function callbackUpdate(uri, success, err) {
	if(success) {
		console.log("Succes for " + uri + "and the err body is" + err);
	}
	else {
		console.log("No succes for" +uri+ "so the err body is " +err);
	}
}

async function fancyFunction() {
	console.log("addDownstreamChangeListener has callbacked");
	//console.log($rdf.serialize(doc, store, 'http://exam.com', 'text/turtle'));
}
