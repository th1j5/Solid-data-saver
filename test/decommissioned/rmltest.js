const parser = require('rocketrml');

const doMapping = async () => {
  const options = {
    toRDF: true,
    verbose: true,
    xmlPerformanceMode: false,
    replace: false,
    functions: {
        'http://users.ugent.be/~bjdmeest/function/grel.ttl#createDescription': function (data) {
            let result=data[0]+' is '+data[1]+ ' years old.';
            return result;
            }
    }
  };
  const result = await parser.parseFile('./mapping.ttl', './out.n3', options).catch((err) => { console.log(err); });
  console.log(result);
};

doMapping();
