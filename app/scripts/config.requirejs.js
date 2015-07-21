var requirejs = require("requirejs");
requirejs.config({
	paths: {
		numeric: "../../bower_components/numeric-1.2.6/index",
		requirejs: "../../bower_components/requirejs/require",
		"numeric-1.2.6": "../../bower_components/numeric-1.2.6/index"
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