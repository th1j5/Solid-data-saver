import Hylar from 'hylar';
import https from 'https';
import rdfstore from 'rdfstore';

const h = new Hylar();
const ont = 'https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl';

// hashtag NIET VERGETEN na ont!!!
// om number te vinden in SPARQL:
//  - 3303
//  - "3303"^^xsd:integer
const queryClass = `
	PREFIX lwm2m: <${ont}#>
	PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
	PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
	PREFIX owl: <http://www.w3.org/2002/07/owl#>
	SELECT ?objectName
		?resourceName
		?x
	WHERE
		{
			?objectName rdfs:subClassOf lwm2m:Object, ?blankObjectID , ?blankConsistsOf .
			?blankObjectID owl:onProperty lwm2m:hasObjectID ;
				owl:hasValue "3303"^^xsd:integer .

			?blankConsistsOf rdf:type owl:Restriction ;
				owl:onProperty lwm2m:consistsOf ;
				?x ?resourceName .	

			?resourceName rdfs:subClassOf lwm2m:Resource , ?blankResourceID .
			?blankResourceID owl:onProperty lwm2m:hasResourceID ;
				owl:hasValue "5700"^^xsd:integer .
		}
	`;

rdfstore.create(loadOntology)
//getOntology()

/**
 * rdfstore
 */
function usingRDFStore(err, store) {
	store.execute(queryClass, (err, res) => {
		if(!err) {
			console.log(res);
	  		//console.log(res[0].objectName.value);
		}
	});
}
function loadOntology(err, store) {
	//const loadOnt = 'LOAD <' + ont + '> INTO GRAPH <ont>';
	store.load('remote', ont, (err, ans) => {
		if(!err) {
			console.log(ans);
			usingRDFStore(false, store);
		}
	});
}

/**
 * Hylar
 */
function getOntology() {
	https.get(ont, (resp) => {
		let data = '';
		resp.on('data', (chunk) => {
			data += chunk;
		});
		resp.on('end', () => {
			doingOntology(data);
		});
	}).on('error', (e) => {
		console.log(e);
	});
}

async function doingOntology(rawOntology) {
	await h.load(rawOntology, 'text/turtle');
	//h.parseAndAddRule('() ^ ()');
	q = `
	PREFIX m2m: <${ont}>
	PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
	PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
	PREFIX owl: <http://www.w3.org/2002/07/owl#>
	SELECT ?x
	WHERE
		{
			?x m2m:hasObjectID '3303' .
		}
	`;
	console.log(q);
	let res = await h.query(q);
	console.log(res);
}
