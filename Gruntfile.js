'use strict';

module.exports = function( grunt ) {

	var devConfig = {
		port: 35730,
		dev:  'dev',
		dist: 'www',
		folders: {
			js:     'js',
			css:    'css',
			less: 	'less',
			sass:   'scss',
			images: 'images'
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
            		'<%= config.dev %>/**/*.{php,html,htm,xml,txt,htaccess,js,ico,png,jpg,jpeg,gif,json}'
            	],
            },
            less: {
            	files: ['<%= config.dev %>/<%= config.folders.less %>/**/*.less'],
       			tasks: ['newer:less']
            },
            sass: {
            	files: ['<%= config.dev %>/<%= config.folders.sass %>/**/*.scss'],
       			tasks: ['newer:sass']
            }
        },

		// Check JS syntax to avoid errors
		jshint: {
			all: ['<%= config.dev %>/<%= config.folders.js %>/*.js']
		},

	    // Less (CSS pre-processor)
		less: {
			serve: {
				files: [{
					expand: true,
					cwd:  '<%= config.dev %>/<%= config.folders.less %>',
					src:  ['*.less'],
					dest: '<%= config.dev %>/<%= config.folders.css %>',
					ext:  '.css'
				}]
			}
		},

		// SASS (CSS pre-processor)
		sass: {
	        serve: {
	            files: [{
					expand: true,
					cwd:  '<%= config.dev %>/<%= config.folders.sass %>',
					src:  ['*.scss'],
					dest: '<%= config.dev %>/<%= config.folders.css %>',
					ext:  '.css'
				}]
	        }
	    },

		// Run some tasks in parallel to speed up the processes
	    concurrent: {
	    	serve: [
	    		'less'
	    	]
	    },

	});

	grunt.registerTask('serve', [
		'jshint',
		'concurrent:serve',
		'watch'
	]);

};