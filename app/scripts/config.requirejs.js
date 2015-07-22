var requirejs = require("requirejs");
requirejs.config({
	paths: {
		numeric: "../../bower_components/numeric-1.2.6/index",
		requirejs: "../../bower_components/requirejs/require",
		"numeric-1.2.6": "../../bower_components/numeric-1.2.6/index",
		"seed-js" : "../../node_modules/seed-js/src",
    	"Array" : "../../node_modules/Array",
    	"String" : "../../node_modules/String"
	},
	baseUrl: "app/scripts",
	packages: [

	]
});

requirejs.onError = function (err) {
    console.log(err.requireType);
    if (err.requireType === 'timeout') {
        console.log('modules: ' + err.requireModules);
    }

    throw err;
};