import def from "./rmlmapper.mjs";

const leshanJSONdata = {"ep": "thijs-Galago-Pro","res": "/3303/0/5700","val": {"id": 5700,"value": -5.1}};

def(leshanJSONdata).then(data => {console.log(data)});
