/*
* TTL Solid Pod Datasaver
* Author: Thijs Paelman
* Project: VOP 2020 - IoT & Solid
* Date: 2020/04/13
* Description: Script to fetch JSON, preprocess JSON & map this to RDF with RMLmapper
*/

// Importing required libraries
const fs = require('fs');    // File system to read in the static file
const $rdf = require('rdflib');   // Rdf graph manipulation library
const rml = require('rocketrml'); // RML mapper to map JSON --> RDF

// Program parameters
const rmlmappingfile = "assets/mapping.ttl" // RML file - TODO: input file specified in the rml-turtle file is relative to *this* file (won't fix)
const rmloutput = 'output/out.n3'
const rmloptions = {
    toRDF: true,
    verbose: true,
    xmlPerformanceMode: false,
    replace: false};
rmloptions.functions = {
    'http://functions.com/': data => data
};

// testing RML rocket
const doMapping = async () => {
  const result = await rml.parseFile(rmlmappingfile, rmloutput, rmloptions)
		.catch((err) => { console.log(err); });
  console.log(result);
};
doMapping();
