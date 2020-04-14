/*
* TTL Solid Pod Datasaver
* Author: Thijs Paelman
* Project: VOP 2020 - IoT & Solid
* Date: 2020/04/14
* Description: Script to fetch JSON, preprocess JSON & map this to RDF with RMLmapper
*/

// Importing required libraries
const fs = require('fs');    // File system to read in the static file
const $rdf = require('rdflib');   // Rdf graph manipulation library
const EventSource = require('eventsource'); //EventSource for Node.js

// Program parameters
const rmlmappingfile = "assets/mapping.ttl" // RML file - TODO: input file specified in the rml-turtle file is relative to *this* file (won't fix)
const protocolLeshanserver = 'http'
const basenameLeshanserver = 'basisLeshan.com'  // will become {protocol}://{basenameLeshanserver}/

const eventsource = new EventSource('http://localhost:8080/event');
eventsource.addEventListener('NOTIFICATION', notificationCallback, false);

function notificationCallback(msg) {
	console.log(msg);
	let content = JSON.parse(msg.data);
	console.log(content);
};
