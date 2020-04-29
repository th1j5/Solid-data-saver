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
const fetcher = new $rdf.Fetcher(store);
const updater = new $rdf.UpdateManager(store);

// Discovering the storage location for our IoT Document
// inspiration: notepod (with plandoc)
export default async function getPodData(webId) {
	const profile = store.sym(webId);	// subj
	const profileDoc = profile.doc();	// doc

	await fetcher.load(profileDoc).catch((err) => {console.log("Error while fetching profileDoc: "+profileDoc + err)});
	console.log("Found profile document: " + profileDoc);
	const solidstorage = store.any(profile, SPACE('storage'), null, profileDoc);			// container
	const privateTypeIndex = store.any(profile, SOLID('privateTypeIndex'), null, profileDoc);	// doc

	await fetcher.load(privateTypeIndex).catch((err) => {console.log("Error while fetching privateTypeIndex: "+privateTypeIndex + err)});
	console.log("Found privateTypeIndex: " + privateTypeIndex);
	//find iotDoc
	const newBlankNode = new $rdf.BlankNode;
	const st1 = new $rdf.Statement(newBlankNode, RDF('type'), SOLID('TypeRegistration'), privateTypeIndex);
	const st2 = new $rdf.Statement(newBlankNode, SOLID('forClass'), SCHEMA('TextDigitalDocument'), privateTypeIndex); // subj
	//
	const matchingSubjects1 = store.match(null, st1.predicate, st1.object, st1.graph).map( quad => quad.subject); // list of subj
	const matchingSubjects2 = store.match(null, st2.predicate, st2.object, st2.graph).map( quad => quad.subject); // list of subj
	let iotTypeRegistration = matchingSubjects1.find( (subj) => { return matchingSubjects2.includes(subj);}); // compare 2 arrays and return first subject found in both

	if(!iotTypeRegistration) { //is empty --> create one
		console.log("Did not found an iotTypeRegistration, making one...");
		updater.update(null, [st1, st2])
		.then((ok) => {console.log('updated: ' + ok)}, (err) => {console.log('error while updating: ' + err)});
		iotTypeRegistration = newBlankNode; // should be?
	}
	solidstorage.value += "private/leshandata.ttl";
	const st3 = new $rdf.Statement(iotTypeRegistration, SOLID('instance'), solidstorage, privateTypeIndex);
	let iotDoc = store.any(st3.subject, st3.predicate, null, st3.graph); // doc
	if(!iotDoc) { // Create new iotDoc
		console.log("Creating new IoT document for Leshan measurement data on " + solidstorage.value);
		updater.update(null, [st3])
		.then(() => {console.log('updated privateTypeIndex')}, (err) => {console.log('error while updating privateTypeIndex: ' + err)});
		await updater.put(solidstorage, "", 'text/turtle', (uri, ok, err, resp) => { if(err) console.log('error occured during creation of doc ' + err);});
		iotDoc = solidstorage.value;
	}
	console.log("Found IoT Document on " + iotDoc);

	return {
		webId,
		profileDoc,
		privateTypeIndex,
		iotDoc
	}
}
