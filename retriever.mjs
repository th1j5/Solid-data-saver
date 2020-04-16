/*
* TTL Solid Pod Datasaver
* Author: Thijs Paelman
* Project: VOP 2020 - IoT & Solid
* Date: 2020/04/14
* Description: Script to fetch JSON, preprocess JSON & map this to RDF with RMLmapper
*/

// Importing required libraries
import fs from 'fs';			// File system to read in the static file
import $rdf from 'rdflib';      	// Rdf graph manipulation library
import EventSource from 'eventsource';	// EventSource for Node.js
import jsonToRDF from './rmlmapper.mjs';// mapping JSON to RDF

// Program parameters
const leshanServer = { protocol: 'http', basename: 'localhost:8080', rdfBasename:'basisLeshan.com'}; // will become {protocol}://{basename}/
const leshanServers = [leshanServer]; //support multiple servers

leshanServers.forEach( leshanServer => {
	leshanServer.origin = leshanServer.protocol + '://' + leshanServer.basename;
	const eventsource = new EventSource(leshanServer.origin + '/event');
	eventsource.addEventListener('NOTIFICATION', notificationCallback, false);
});

/**
 * Function that processes all NOTIFICATIONs
 */
function notificationCallback(msg) {
	const leshanServer = leshanServers.find( ({origin: o}) => o === msg.origin); // retrieve origin server from list of servers (using destructuring assignement)
	let content = JSON.parse(msg.data);
	jsonToRDF(content).then(data => {console.log(data)});
};
