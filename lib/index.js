var loljs = require('./loljs').loljs;
var streamline = require(('streamline/lib/callbacks/transform'));
var fs = require('fs');
var path = require('path');

require.extensions['.lol'] = function(module, filename, code) {
	if (!code) code = fs.readFileSync(filename, "utf8");
	var loled = loljs(code);
	//console.log(loled);
	var streamlined = streamline.transform(loled);
	module._compile(streamlined, filename);
}

exports.run = function() {
	console.log("running " + process.argv[2])
	require(path.resolve(process.cwd(), process.argv[2]));
}