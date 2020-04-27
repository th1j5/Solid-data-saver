import $rdf from 'rdflib';

const ont = 'https://florsanders.inrupt.net/public/ontologies/omalwm2m.ttl';
const store = $rdf.graph();
const fetcher = new $rdf.Fetcher(store);
/**
 * It does look like it's not possible in rdflib.js to do a good SPARQL query
 *
 * This query should work, but '3303' doesn't match with what it should match
 */
const sparqlQuery = `
        PREFIX lwm2m: <${ont}#>
        PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
        PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
        PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
        PREFIX owl: <http://www.w3.org/2002/07/owl#>
        SELECT ?objectName
        WHERE
                {
                        ?objectName rdfs:subClassOf ?blank .
                        ?blank owl:onProperty lwm2m:hasObjectID ;
				owl:hasValue '3303'^^xsd:integer .
                }
        `;

async function testOntology() {
	await fetcher.load(ont).catch((err) => {});
	//console.log($rdf.serialize(, store, 'http://exam.com', 'text/turtle'))
	const q = $rdf.SPARQLToQuery(sparqlQuery, false, store);
	//console.log(q)
	const res = store.querySync(q);
	console.log(res);
}

testOntology()
