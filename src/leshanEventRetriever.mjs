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
import rootlogger from 'loglevel';
import jsonToRDF from './rmlmapper.mjs';// mapping JSON to RDF
import addResourceMeasurement from './solidPodSaver.mjs';
// Program parameters
import {leshanServers, solidPods} from '../config/config.mjs'; // support multiple servers

const log = rootlogger.getLogger('leshanEventRetriever');

/**
 * Register for every leshanServer an eventListener
 * Should be called at startup
 */
export function registerEventListeners() {
	leshanServers.forEach( leshanServer => {
		leshanServer.origin = leshanServer.protocol + '://' + leshanServer.basename;
		const eventsource = new EventSource(leshanServer.origin + '/event');
		eventsource.addEventListener('NOTIFICATION', notificationCallback, false);
	});
}

/**
 * Function that processes all NOTIFICATIONs
 */
function notificationCallback(msg) {
	const leshanServer = leshanServers.find( ({origin: o}) => o === msg.origin); // retrieve origin server from list of servers (using destructuring assignement)
	log.info("Recieved NOTIFICATION from leshanServer: " + leshanServer.rdfBasename);
	let content = JSON.parse(msg.data);
	jsonToRDF(content, leshanServer).then(ntriples => { // json from this particular leshanServer will always have the same RDF, even for differen solidPod targets
		// for each solidPod connected to this particular leshanServer
		leshanServer.solidPodTargets.forEach((podN) => {
			addResourceMeasurement(ntriples, solidPods[podN]);
		});
	});
};
