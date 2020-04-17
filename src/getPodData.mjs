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
import {RDF, SOLID, SPACE, SCHEMA} from '../config/config.mjs'; //Namespaces

// Creating rdf lib constructs to be used with solid-auth-cli
const store = $rdf.graph();
const updater = new $rdf.UpdateManager(store);

// Discovering the storage location for our IoT Document
// inspiration: notepod (with plandoc)
export default async function getPodData(webId) {
	const profile = store.sym(webId);	// subj
	const profileDoc = profile.doc();	// doc

	updater.reloadAndSync(profileDoc); // does this work?
	const delay = ms => new Promise(res => setTimeout(res, ms));
	await delay(3000);

	const solidstorage = store.any(profile, SPACE('storage'), null, profileDoc);			// container
	const privateTypeIndex = store.any(profile, SOLID('privateTypeIndex'), null, profileDoc);	// doc

	updater.reloadAndSync(privateTypeIndex); // does this work?
	await delay(3000);

	//find iotDoc
	const newBlankNode = new $rdf.BlankNode;
	let st1 = new $rdf.Statement(newBlankNode, RDF('type'), SOLID('TypeRegistration'), privateTypeIndex);
	let st2 = new $rdf.Statement(newBlankNode, SOLID('forClass'), SCHEMA('TextDigitalDocument'), privateTypeIndex); // subj
	//
	const matchingSubjects1 = store.match(null, st1.predicate, st1.object, st1.graph).map( quad => quad.subject); // list of subj
	const matchingSubjects2 = store.match(null, st2.predicate, st2.object, st2.graph).map( quad => quad.subject); // list of subj
	const iotTypeRegistration = matchingSubjects1.find( (subj) => { return matchingSubjects2.includes(subj);}); // compare 2 arrays and return first subject found in both	 

	if(!iotTypeRegistration) { //is empty --> create one
		updater.update(null, [st1, st2])
		.then((ok) => {console.log('updated: ' + ok)}, (err) => {console.log('error while updating: ' + err)});
		iotTypeRegistration = newBlankNode; // should be?
	}
	//console.log(iotTypeRegistration);
	//console.log($rdf.serialize(null, store, "exam.com/", 'text/turtle'));
	//const iotDoc =  // doc
	const iotDoc = store.any(iotTypeRegistration, SOLID('instance'), null, privateTypeIndex); // doc
	if(!iotDoc) { // Create new iotDoc
		solidstorage.value += "private/leshandata.ttl";
		console.log("Creating new IoT document for Leshan measurement data on " + solidstorage.value);
		await updater.put(solidstorage, "", 'text/turtle', (uri, ok, err, resp) => { if(err) console.log('error occured during creation of doc ' + err);});
	}
	console.log("Found IoT Document on " + iotDoc);
	return {
		webId,
		profileDoc,
		privateTypeIndex,
		iotDoc
	}
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
