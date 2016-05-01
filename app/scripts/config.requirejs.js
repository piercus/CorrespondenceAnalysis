var requirejs = require("requirejs");
requirejs.config({
	paths: {
		numeric: "../../bower_components/numeric-1.2.6/index",
		requirejs: "../../bower_components/requirejs/require",
		"numeric": "../../bower_components/numeric-1.2.6/index",
		"seed-js" : "../../node_modules/seed-js/src",
    	"Array" : "../../node_modules/Array",
    	"String" : "../../node_modules/String",
			"canvas/canvasCtx" : "canvas/canvasCtx.node"
	},
	baseUrl: __dirname,
	packages: [

	],
	shim : {
			numeric: {
				exports: 'numeric'
			}
	}
});
