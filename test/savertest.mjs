import addResourceMeasurement from '../saver.mjs';
import jsonToRDF from "../rmlmapper.mjs";
import $rdf from "rdflib";

const leshanJSONdata = {"ep": "thijs-Galago-Pro","res": "/3303/0/5700","val": {"id": 5700,"value": -5.1}};
const leshanJSONdata2 = {"ep": "thijs-Galago-Pro","res": "/3303/0/5700","val": {"id": 5700,"value": -3}};
const store = new $rdf.graph()

/**
 * just test jsonToRdf & ouput in turtle
 */
async function testing0() {
	await delay(5000);
        jsonToRDF(leshanJSONdata).then(data => {
                $rdf.parse(data, store, 'http://ex.com', 'text/turtle');
                const n3_string = $rdf.serialize(null, store, 'http://exam.com', 'text/turtle');
		addResourceMeasurement(n3_string)
        });
}

const delay = ms => new Promise(res => setTimeout(res, ms));

testing0();
