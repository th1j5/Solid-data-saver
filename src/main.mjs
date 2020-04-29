import { registerEventListeners } from './leshanEventRetriever.mjs';
import { loadOntology } from './ontologySearcher.mjs';
import { solidLogIn } from './solidPodSaver.mjs';

startTranslationLayer()

async function startTranslationLayer() {
	try {
		// First log in in SOLID
		// Then load LwM2M ontology to use
		await Promise.all([solidLogIn(), loadOntology()]);
	}
	catch {
		console.err('For some reason we could not log in in Solid or download the Ontology');
	}
	registerEventListeners();	// Then register an EventListener to catch all outging Events from the Leshan server
}
