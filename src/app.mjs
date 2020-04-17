import 'retriever.mjs';

import url from 'url';
import path from 'path';
const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
fs.readFile(path.join(__dirname, 'assets', 'senml', 'temp_sens.json'), 'utf8',
	(err, data) => {
	if err throw err; console.log(JSON.parse(data))});

store.sym('ex.com/card#me').doc(); // strip #me
new $rdf.Namespace('http://www.w3.org/2006/vcard/ns#');

// let session = auth.currentSession()
// if (session) { return session.webId }
