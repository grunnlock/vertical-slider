jQuery( document ).ready(function( $ ) {

	// General variables
	var	delta 		    = 0;
    var scrollThreshold = 1;
    var animating 		= false;

    // DOM elements
    var sectionsContainer = $('.vs-slider');
    var sections          = $('.vs-section');

	// Initialise styles
	var currentSection = sections.filter('.active');

    // Animations settings
	var	animationsSettings  = {
		visible: 'translateNone',
		top:     'translateUp.half',
		bottom:  'translateDown',
		easing:  'easeInCubic',
		duration: 800
	};

    // Initialise the vertical scroller
    function init() {

        // Initialise the style of the sections for the first animation
        currentSection.children('.vs-section-inside').velocity( animationsSettings.visible, 1 );

        // Current section
        currentSection.css('opacity', 1);

        // Bottom section
        currentSection.prevAll('.vs-section')
            .css('opacity', 1)
            .children('.vs-section-inside').velocity( animationsSettings.top, 0 );

        // Top section
        currentSection.nextAll('.vs-section')
            .css('opacity', 1)
            .children('.vs-section-inside').velocity( animationsSettings.bottom, 0 );

        // Bind events
        bindEvents();

    }

    function prev() {
        // All tests will be done in the moveTo function
        moveTo( currentSection.index() - 1 );
    }

    function next() {
        // All tests will be done in the moveTo function
        moveTo( currentSection.index() + 1 );
    }

    function moveTo( sectionIndex ) {

        var topSection;
        var bottomSeciton;
        var animation;

        // Test the slider is not already moving and the requested section is not the current one
        if( !animating && currentSection.index() !== sectionIndex ) {

            // Animations starting
            animating = true;

            // Test if the requested section is not before the first or after the last one
            if( sectionIndex > -1 && sectionIndex < sections.length ) {

                if( sectionIndex > currentSection.index() ) { // Requested section is after the current one
                    nextSection = currentSection.next('.vs-section');
                    animation   = animationsSettings.top;
                } else { // Requested section is before the current one
                    nextSection = currentSection.prev('.vs-section');
                    animation   = animationsSettings.bottom;
                }

                // Actual animation
                currentSection
                    .removeClass('active')
                    .children('.vs-section-inside').velocity( animation, animationsSettings.easing, animationsSettings.duration ).end()

                nextSection
                    .addClass('active')
                    .children('.vs-section-inside').velocity(animationsSettings.visible, animationsSettings.easing, animationsSettings.duration, function() {
                        // Animations stopped
                        animating      = false;
                        // Update current section variable
                        currentSection = sections.filter('.active');
                    });


            } else {

                // At this stage the requested section is either after the last one or before the first one

                if( sectionIndex <= -1 ) { // Requested section is before the first one

                    console.log('before');

                } else if( sectionIndex >= sections.length ) { // Requested section is after the last one

                    console.log('after');

                }

                // Animations stopped
                animating = false;

            }

        } else {

            // Requested section is the current one
            return false;

        }

    }

    function bindEvents() {

        // Scroll with mousewheel actions
        $( window ).on('DOMMouseScroll mousewheel', function( event ) {

            // Check the scroll direction
            if ( event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0 ) {

                delta--;

                if( Math.abs( delta ) >= scrollThreshold ) {
                    prev();
                } else {
                    return false;
                }

            } else {

                delta++;

                if( delta >= scrollThreshold ) {
                    next();
                } else {
                    return false;
                }

            }

            // Reset delta
            delta = 0;

            return false;

        });

        // Keyboard arrows actions
        $( document ).on('keyup', function( event ) {

            if( event.which == '40' ) {
                next();
            } else if( event.which == '38' ) {
                prev();
            }

        });

        // Events for devices which support touch events
        if( Modernizr.touch ) {

            // Hammer.js
            var hammerVS = new Hammer( sectionsContainer[0] );

            hammerVS.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });

            // Go to the next section on swipe up
            hammerVS.on('swipeup', function( e ) {
                next();
            });

            // Go to the previous section on swipe down
            hammerVS.on('swipedown', function( e ) {
                prev();
            });

        }

    }

    // Vertical scroller initialisation
    init();

});

// Register Velocity effects
// None
$.Velocity
    .RegisterEffect('translateUp', {
    	defaultDuration: 1,
        calls: [
            [ { translateY: '-100%' }, 1 ]
        ]
    });

$.Velocity
    .RegisterEffect('translateDown', {
    	defaultDuration: 1,
        calls: [
            [ { translateY: '100%' }, 1 ]
        ]
    });

$.Velocity
    .RegisterEffect('translateNone', {
    	defaultDuration: 1,
        calls: [
            [ { translateY: '0', opacity: '1', scale: '1', rotateX: '0', boxShadowBlur: '0' }, 1 ]
        ]
    });

// Parallax
$.Velocity
    .RegisterEffect('translateUp.half', {
    	defaultDuration: 1,
        calls: [
            [ { translateY: '-50%' }, 1 ]
        ]
    });
