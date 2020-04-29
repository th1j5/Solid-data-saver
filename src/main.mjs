import { registerEventListeners } from './leshanEventRetriever.mjs';
import { loadOntology } from './ontologySearcher.mjs';
import { solidLogIn } from './solidPodSaver.mjs';

solidLogIn();			// First log in in SOLID
loadOntology();			// Then load LwM2M ontology to use
registerEventListeners();	// Then register an EventListener to catch all outging Events from the Leshan server
