jQuery( document ).ready(function( $ ) {

    // Initialise the vertical slider
    $('#demo-slider').verticalSlider({
    	scrollThreshold: 20,

        // Element on which informational classes will be put (current section index, last section...)
        infoSelector: 'html',

        // Autoplay functionality
        autoplay: false,
        autoplayDuration: 6000,

        // Settings for the moveTo function animation
        animations: {
            visible:    'vs_translateNone',
            top:        'vs_translateUp.half',
            bottom:     'vs_translateDown',
            bounceDown: 'vs_bounceDown',
            bounceUp:   'vs_bounceUp',
            easing:     'easeInCubic',
            duration:   800
        },

        // Callback functions
        afterInit: function( currentSection, sectionsNumber ) {
			console.log( 'afterInit: ' + currentSection + ' ' + sectionsNumber );
        },

        beforeMove: function( currentSection, sectionsNumber ) {
            console.log( 'beforeMove: ' + currentSection + ' ' + sectionsNumber );
        },

        afterMove: function( currentSection, sectionsNumber ) {
        	console.log( 'afterMove: ' + currentSection + ' ' + sectionsNumber );
        }
    });

});