jQuery( document ).ready(function( $ ) {

    // Initialise the vertical slider
    $('#demo-slider').verticalSlider({
    	scrollThreshold: 20,

        // Element on which informational classes will be put (current section index, last section...)
        infoSelector: 'html',

        // Autoplay functionality
        autoplay: false,
        autoplayDuration: 6000,

        // Animations settings
        animVisible: 'vs_translateNone',
        animUp: 'vs_translateUp',
        animUpHalf: 'vs_translateUp.half',
        animBottom: 'vs_translateDown',
        animBottomHalf: 'vs_translateDown.half',
        animBounceUp: 'vs_bounceUp',
        animBounceDown: 'vs_bounceDown',
        animEasing: [0.77, 0, 0.175, 1],
        animDuration: 800,

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

    // Store the instance in a variable
    var demoSlider = $('#demo-slider').data('verticalSlider');

    // All the next functions are now usable using the demoSlider instance
    // demoSlider.next();
    // demoSlider.prev();
    // demoSlider.moveTo(3);

});