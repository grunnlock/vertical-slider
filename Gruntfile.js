'use strict';

module.exports = function( grunt ) {

	var devConfig = {
		port: 35730,
		dev:  'dev',
		dist: 'www',
		folders: {
			js:     'js',
			css:    'css'
		}
	};

	// Load grunt tasks automatically
	require('load-grunt-tasks')( grunt );

	// Time how long tasks take
	require('time-grunt')( grunt );

	grunt.initConfig({

		config: devConfig,

		// Watch files and do specific actions if they're edited
		watch: {
			options: {
            	livereload: { port: '<%= config.port %>' }
            },
            all: {
            	files: [
            		'<%= config.dev %>/**/*'
            	],
            }
        },

		// Check JS syntax to avoid errors
		jshint: {
			all: ['<%= config.dev %>/<%= config.folders.js %>/*.js']
		},

	});

	grunt.registerTask('serve', [
		'jshint',
		'watch'
	]);

};