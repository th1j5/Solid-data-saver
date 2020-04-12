# soliddatasaver
## Description
Some code which allows us to save static data in a users datapod (if their credentials are available) without interfacing through any GUI.
- main.js: Contains all code needed to upload the static data.
- static(1/2).ttl: Turtle file containing static data.
- backup.ttl: Turtle file which serves as local backup of the online graph (saved in main.js)
- generator.py: Python script used to generate static.ttl.
- test.js: Random test file to try out a few things here and there.

## Installation and usage

### Generator tool

1. Go into generator.py and edit the program parameters to your liking.
2. run `py generator.py` or `python3 generator.py` to generate the static data.

### Datasaver

1. After cloning repository, run `npm install` to install all needed dependencies into the `node_modules` folder.
2. !!! Important: Due to some ridiculous unpatched [issue](https://github.com/solid/solid-cli/issues/15), for this to work following patch needs to be applied manually:
    - Go to `node_modules/@solid/cli/source/SolidClient.js` at line [110](https://github.com/solid/solid-cli/blob/4cf28cb271aa5de23fcff6e4d11ce1be48e48d19/src/SolidClient.js#L110).
    - Add `scope: ['openid']` to the `authenticate` object just like [here](https://github.com/solid/oidc-rp/blob/master/src/RelyingParty.js#L68).
3. When fix is applied, use `node main.js` to run the datasaver program.