import { registerEventListeners } from './leshanEventRetriever.mjs';
import { loadOntology } from './ontologySearcher.mjs';
import { solidLogIn } from './solidPodSaver.mjs';
import { loadRMLmappingFile } from './rmlmapper.mjs';
import rootlogger from 'loglevel'; // logging

const log = rootlogger;

startTranslationLayer()

async function startTranslationLayer() {
	try {
		// First log in in SOLID
		// Then load LwM2M ontology to use
		// Also load RML mapping
		await Promise.all([solidLogIn(), loadOntology(), loadRMLmappingFile()]);
	}
	catch (err) {
		log.error('For some reason we could not log in in Solid or download the Ontology');
		throw err;
	}
	registerEventListeners();	// Then register an EventListener to catch all outging Events from the Leshan server
}
