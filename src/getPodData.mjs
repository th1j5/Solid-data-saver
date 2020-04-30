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
import {RDF, SOLID, SPACE, SCHEMA} from '../config/config.mjs'; //Namespaces

// Creating rdf lib constructs to be used with solid-auth-cli
const store = $rdf.graph();
const fetcher = new $rdf.Fetcher(store);
const updater = new $rdf.UpdateManager(store);
const log = rootlogger.getLogger('getPodData');

// Discovering the storage location for our IoT Document
// inspiration: notepod (with plandoc)
export default async function getPodData(webId) {
	const profile = store.sym(webId);	// subj
	const profileDoc = profile.doc();	// doc

	// Load profile doc
	await fetcher.load(profileDoc).catch((err) => {log.error("Error while fetching profileDoc: "+profileDoc + err)});
	log.info("Found profile document: " + profileDoc);
	const solidstorage = store.any(profile, SPACE('storage'), null, profileDoc);			// container
	solidstorage.value += "private/leshandata.ttl"; // make default storage path
	const privateTypeIndex = store.any(profile, SOLID('privateTypeIndex'), null, profileDoc);	// doc

	// Load private type index
	await fetcher.load(privateTypeIndex).catch((err) => {log.error("Error while fetching privateTypeIndex: "+privateTypeIndex + err)});
	log.info("Found privateTypeIndex: " + privateTypeIndex);

	//find iotDoc
	// rule which an iotDoc should obey
	const newBlankNode = new $rdf.BlankNode;
	const st1 = new $rdf.Statement(newBlankNode, RDF('type'), SOLID('TypeRegistration'), privateTypeIndex);
	const st2 = new $rdf.Statement(newBlankNode, SOLID('forClass'), SCHEMA('TextDigitalDocument'), privateTypeIndex); // subj
	// subjects that obey these rules (for each rule a list of obeying subjects)
	const matchingSubjects1 = store.match(null, st1.predicate, st1.object, st1.graph).map( quad => quad.subject); // list of subj
	const matchingSubjects2 = store.match(null, st2.predicate, st2.object, st2.graph).map( quad => quad.subject); // list of subj
	// First subject that obeys the combination of all rules
	let iotTypeRegistration = matchingSubjects1.find( (subj) => { return matchingSubjects2.includes(subj);}); // compare 2 arrays and return first subject found in both

	// If no iotTypeRegistration, create one
	if(!iotTypeRegistration) {
		log.info("Did not found an iotTypeRegistration, making one...");
		await updater.update(null, [st1, st2])
			.then((ok) => {log.info('updated privateTypeIndex with an iotTypeRegistration')}, (err) => {log.erro('error while updating: ' + err)});
		iotTypeRegistration = newBlankNode; // should be?
	}

	// rule to find the storage
	const st3 = new $rdf.Statement(iotTypeRegistration, SOLID('instance'), solidstorage, privateTypeIndex);
	let iotDoc = store.any(st3.subject, st3.predicate, null, st3.graph); // doc
	log.debug('iotDoc found is: ' + iotDoc);

	// Create new iotDoc in privateTypeRegistration
	if(!iotDoc) {
		log.info("Creating new IoT document for Leshan measurement data on " + solidstorage.value);
		await updater.update(null, [st3])
			.then(() => {log.info('updated privateTypeIndex with a storage')}, (err) => {log.error('error while updating privateTypeIndex: ' + err)});
		// Create a new doc if it not exists
		// If it already existed, throw error and exit, because we DON'T want to overwrite/append an existing file (which is not the intended iotDoc)
		await fetcher.createIfNotExists(solidstorage, 'text/turtle', '')
			.then((resp) => {
				if (resp.status === 201) log.debug('Created new IoT document...');
				else if (resp.status === 200) throw new Error(solidstorage.value + ' is already in use by another application. Remove this file first...');
				else throw new Error('Unknown response status: ' + resp.status + ' but it didn\'t seem to matter (bug)');
			})
			// if err, log it and re-throw
			.catch((err) => {log.error('createIfNotExists failed:',err); process.exitCode = 1; throw err;});

		iotDoc = solidstorage;
	}
	else {
		// We have the iotDoc, if we created it or not. Now we still have to be sure that it's really there,
		// even if the Type Index says so. Thats why we createIfNotExists.
		await fetcher.createIfNotExists(iotDoc, 'text/turtle', '')
			.then( (resp) => {if (resp.status === 201) log.warn(iotDoc.value, 'did not yet exist, even while the Type Index said so. We fixed this for you...');})
			.catch((err) => {log.debug('createIfNotExists failed: + ', err); throw err;});
		//await updater.put(solidstorage, "", 'text/turtle', (uri, ok, err, resp) => { if(err) log.error('error occured during creation of doc ' + err);});
	}

	log.info("IoT Document is located on " + iotDoc.value);

	return {
		webId,
		profileDoc,
		privateTypeIndex,
		iotDoc
	}
}
