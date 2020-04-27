import jsonToRDF from "../src/rmlmapper.mjs";
import $rdf from "rdflib";

const leshanJSONdata = {"ep": "thijs-Galago-Pro","res": "/3303/0/5700","val": {"id": 5700,"value": -5.1}};
const leshanJSONdata2 = {"ep": "thijs-Galago-Pro","res": "/3303/0/5700","val": {"id": 5700,"value": -3}};
const store = new $rdf.graph()

/**
 * just test jsonToRdf & ouput in turtle
 */
function testing0() {
	jsonToRDF(leshanJSONdata).then(data => {
		$rdf.parse(data, store, 'http://ex.com', 'text/turtle');
		console.log($rdf.serialize(null, store, 'http://exam.com', 'text/turtle'))
	});
}

async function testing1() {
	const r1 = await jsonToRDF(leshanJSONdata)
	let r2 = await jsonToRDF(leshanJSONdata2)
	// very hacky
	r2 = r2.replace(/_:b0/g,'_:b1');
	$rdf.parse(r1, store, 'http://ex.com', 'text/turtle');
	$rdf.parse(r2, store, 'http://ex.com', 'text/turtle');
	//console.log($rdf.serialize(null, store, 'http://exam.com', 'text/turtle'))
	console.log($rdf.serialize(null, store, 'http://exam.com', 'application/n-triples'))
}

function testing2() {
	// Template literals --> multiline
	const r1 = `
<http://basisLeshan.com/thijs-Galago-Pro/3303/0> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#3303> .
<http://basisLeshan.com/thijs-Galago-Pro/3303/0> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#ObjectInstance> .
<http://basisLeshan.com/thijs-Galago-Pro/3303/0> <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#consistsOf> _:b0 .
<http://basisLeshan.com/thijs-Galago-Pro/3303/0> <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#consistsOf> _:b1 .
<http://basisLeshan.com/thijs-Galago-Pro/3303/0> <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#containedBy> <http://basisLeshan.com/thijs-Galago-Pro> .
<http://basisLeshan.com/thijs-Galago-Pro> <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#Device> .
<http://basisLeshan.com/thijs-Galago-Pro> <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#contains> <http://basisLeshan.com/thijs-Galago-Pro/3303/0> .
<http://basisLeshan.com/thijs-Galago-Pro> <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#hasDeviceID> "thijs-Galago-Pro" .
_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#5700> .
_:b0 <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#ResourceInstance> .
_:b0 <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#hasTimeStamp> "2020-04-16T16:44:19.957Z"^^<http://www.w3.org/2001/XMLSchema#dateTime> .
_:b0 <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#hasValue> "-5.1"^^<http://www.w3.org/2001/XMLSchema#float> .
_:b0 <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#organizedInto> <http://basisLeshan.com/thijs-Galago-Pro/3303/0> .
	`
	const r2 = `
	@prefix : <#>.
@prefix b: <http://basisLeshan.com/>.
@prefix om: <https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl#>.
@prefix n0: <http://basisLeshan.com/thijs-Galago-Pro/3303/>.
@prefix XML: <http://www.w3.org/2001/XMLSchema#>.

b:thijs-Galago-Pro
a om:Device; om:contains n0:0; om:hasDeviceID "thijs-Galago-Pro".
n0:0
    a om:3303, om:ObjectInstance;
    om:consistsOf
            [
                a om:5700, om:ResourceInstance;
                om:hasTimeStamp "2020-04-16T16:37:24.034Z"^^XML:dateTime;
                om:hasValue "-6"^^XML:float;
                om:organizedInto n0:0
            ],
            [
                a om:5700, om:ResourceInstance;
                om:hasTimeStamp "2020-04-16T16:35:24.013Z"^^XML:dateTime;
                om:hasValue "-5.1"^^XML:float;
                om:organizedInto n0:0
            ];
    om:containedBy b:thijs-Galago-Pro.
	`
	// very hacky
	//r2 = r2.replace(/_:b0/g,'_:b1');
	$rdf.parse(r1, store, 'http://ex.com', 'text/turtle');
	$rdf.parse(r2, store, 'http://ex.com', 'text/turtle');
	console.log($rdf.serialize(null, store, 'http://exam.com', 'text/turtle'))
	//console.log($rdf.serialize(null, store, 'http://exam.com', 'application/n-triples'))
}

function test_object_mapping() {
	jsonToRDF(leshanJSONdata).then(data => {
		$rdf.parse(data, store, 'http://ex.com', 'text/turtle');
		console.log($rdf.serialize(null, store, 'http://exam.com', 'text/turtle'))
	});
}

//testing1()
//testing0()
test_object_mapping()
