# Solid IoT (LwM2M) Data saver (soliddatasaver)
## Description
This Node.js program allows us to save data from a Leshan server into a users Solid datapod (if their credentials are available), without having to interface with a GUI.

## source files
Found in src/
- main.mjs: Starts the program. First logs in to the Solid pod(s) and dowloads the ontology, then registers itself at the leshan server(s).
- leshanEventRetriever.mjs: Registers EventListener with a callback
- rmlmapper.mjs: Maps incoming JSON object to RDF(N3). Does some preprocessing and uses then RocketRML.
- solidPodSaver.mjs: Logs in into Solid pod(s) and accepts RDF measurements, which are send to the Solid pod.
- getPodData.mjs: Return the right IoTDocument to write our data to, if webID is given. Uses the private type index of solid.
- ontologySearcher.mjs: Downloads LwM2M ontology and uses this to query which Object/Resource Class is bound to which number.
Thus, this is used to map objectnumber <-> objectname (like: object3303 <-> lwm2m:LWM2MTemperatureObject).

In config/
- config.mjs: All configuration parameters can be adjusted here.
- mapping_uuid.ttl: RML file to denote how the transformation from JSON to RDF has to happen.
This file uses skolemization of blank nodes, which means that blank nodes get a random IRI.
- mapping_blank_nodes.ttl: Same as above, but using blank nodes instead of nodes with a random IRI.
This would be preferred, but 'rdflib.js' has some problems with blank nodes, thinking they are the same when they shouldn't be. (Thus squashing measurement into 1 node :/)

## Installation and usage

### Generator tool

1. Go into `scripts/generator.py` and edit the program parameters to your liking.
2. run `py generator.py` or `python3 generator.py` to generate the static data.

### Datasaver

1. After cloning repository, run `npm install` to install all needed dependencies into the `node_modules` folder.
2. !!! Important: Due to some ridiculous unpatched [issue](https://github.com/solid/solid-cli/issues/15), for this to work following patch needs to be applied manually:
    - Go to `node_modules/@solid/cli/source/SolidClient.js` at line [110](https://github.com/solid/solid-cli/blob/4cf28cb271aa5de23fcff6e4d11ce1be48e48d19/src/SolidClient.js#L110).
    - Add `scope: ['openid']` to the `authenticate` object just like [here](https://github.com/solid/oidc-rp/blob/master/src/RelyingParty.js#L68).
3. When fix is applied, use `npm start` to run the datasaver program.


## Bugs

seems like there can occur a race condition (in the start of the program), causing this:
```
genid:8a545544-6ee9-46aa-a3f1-2a48df36b9e5
    a om:MinMeasuredValue, om:ResourceInstance;
    om:hasTimeStamp
        "2020-04-30T15:33:12.313Z"^^XML:dateTime,
        "2020-04-30T15:33:12.569Z"^^XML:dateTime;
    om:hasValue "-544.6"^^XML:float;
    om:organizedInto n0:0.
```
