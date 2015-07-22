module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
      jshint: {
        beforeconcat: ['app/scripts/**/*.js'],
        afterconcat: ['dist/CA.merged.js'],
        other: ['Gruntfile.js', 'test/**/*.js']
      },
      'requirejs': {
          compile:{
            options : {
              baseUrl : "app/scripts",
              mainConfigFile: "app/scripts/config.requirejs.js",
              out: 'dist/CA.merged.js',  
              name: "CA/CorrespondenceAnalysis",
              optimize: "none"           
            }
          }
      },
      bowerRequirejs: {
        target: {
          rjsConfig: 'app/scripts/config.requirejs.js'
        }
      }
  });




  // Load the plugin that provides jshit and requirejs
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-bower-requirejs');

  // Default task(s).
  grunt.registerTask('default', [
    'jshint:beforeconcat', 
    'jshint:other',
    'requirejs:compile'
    //'jshint:afterconcat',
    ]);

};