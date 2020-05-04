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
		//eventsource.addEventListener('NOTIFICATION', eventNotificationCallback, false);
		eventsource.addEventListener('COAPLOG', eventNotificationCallback, false);
	});
}

/**
 * Function that processes all events
 * COAPLOG or NOTIFICATION
 */
function eventNotificationCallback(msg) {
	const leshanServer = leshanServers.find( ({origin: o}) => o === msg.origin); // retrieve origin server from list of servers (using destructuring assignement)
	let content = JSON.parse(msg.data);

	if (msg.type === 'COAPLOG') {
		if (!filterCoapMesgIsMeas(content)) return;
		content.payload = JSON.parse(content.payload); // change string payload into JSON object
	}
	else throw new Error('Non-supported event');

	log.info( `Recieved ${msg.type} from leshanServer: ${leshanServer.rdfBasename}`);
	log.debug(`${msg.type} content is:`, content);

	// for each solidPod connected to this particular leshanServer
	for (const podN of leshanServer.solidPodTargets) {
		// previous incorrect comment: json from this particular leshanServer will always have the same RDF, even for differen solidPod targets
		// Because there is feedback coming from the solidPod, the RDF CAN be different
		jsonToRDF(content, leshanServer, solidPods[podN]) 
			.then(ntriples => {
				log.trace('These are the ntriples in notificationCallback: ' + ntriples);
				addResourceMeasurement(ntriples, solidPods[podN]);
			});
	}
};

/**
 * Filter COAPLOG messages
 *   true: useful message
 *   false: discard
 * Criteria:
 *  - is incoming message (only then it can have useful data)
 *  - has a payload
 *  - Content-Format: "application/vnd.oma.lwm2m+json"
 *     else Warning that we don't understand this format
 *  Furthermore, data.type and data.code are NOT used
 */

function filterCoapMesgIsMeas(data) {
	const reg = /Content-Format: ".*"/;
	if (data.incoming && data.payload) {
		if(data.options.match(reg)[0].endsWith('"application/vnd.oma.lwm2m+json"')) {
			return true;
		}
		else {
			log.warn('This CoAP message has the wrong Content-Format... Options: ', data.options);
			return false;
		}
	}
	else return false;
}

// https://github.com/mcollina/coap-packet
// to easily parse CoAP protocol? No, not needed anymore (it's not straight CoAP, but already processed)
// https://github.com/sywide/senml-js
// to easily parse SenML protocol? No, overkill and not needed
