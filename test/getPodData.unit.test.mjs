import getPodData from '../src/getPodData.mjs'
import auth from 'solid-auth-cli';	// Solid authorization library for node/command line
import $rdf from 'rdflib';		// Rdf graph manipulation library
import {solidPods} from '../config/config.mjs'// Namespaces

//const webId = 'https://iotsolidugent.inrupt.net/profile/card#me'

console.log(`Loggin in...`);
auth.login(solidPods[0]).then(session => {
	console.log(`Logged in as ${session.webId}`);
	// Using the fetcher to get our graph stored in the solid datapod
	//updater.addDownstreamChangeListener(doc, fancyFunction);
	//updater.reloadAndSync(doc);
	getPodData(session.webId);
}).catch(err => console.log(`Login error: ${err}`));
