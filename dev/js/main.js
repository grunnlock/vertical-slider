jQuery( document ).ready(function( $ ) {

	// General variables
	var	delta 		    = 0;
    var scrollThreshold = 1;
    var actual 			= 1;
    var animating 		= false;

    // DOM elements
    var sectionsContainer = $('.vs-slider');
    var sections          = $('.vs-section');
    var sectionsAvailable = sections.toArray();
    var sectionsCount     = sectionsAvailable.length;

	// Initialise styles
	var currentSection = sections.filter('.active');
	var	topSection 	   = currentSection.prevAll('.vs-section');
	var	bottomSection  = currentSection.nextAll('.vs-section');

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
		currentSection.children('.vs-section-inside').velocity(animationsSettings.visible, 1, function() {
			currentSection.css('opacity', 1);
	    	topSection.css('opacity', 1);
	    	bottomSection.css('opacity', 1);
		});

        topSection.children('.vs-section-inside').velocity( animationsSettings.top, 0 );
        bottomSection.children('.vs-section-inside').velocity( animationsSettings.bottom, 0 );

        // Bind events

        // Scroll with mousewheel actions
		$( window ).on( 'DOMMouseScroll mousewheel', function( event ) {

            // on mouse scroll - check if animate section
            if ( event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0 ) {
                delta--;

                if( Math.abs( delta ) >= scrollThreshold ) {
                    prevSection();
                } else {
                    return false;
                }
            } else {
                delta++;

                if( delta >= scrollThreshold ) {
                    nextSection();
                } else {
                    return false;
                }
            }

            return false;

        });

		// Keyboard arrows actions
		$( document ).on('keyup', function( event ) {
			if( event.which === '40' && !nextArrow.hasClass('active') ) {
				nextSection();
			} else if( event.which === '38' && ( !prevArrow.hasClass('active') || ( prevArrow.hasClass('active') && $( window ).scrollTop() !== sectionsAvailable.eq(0).offset().top ) ) ) {
				prevSection();
			}
		});

		// Events for devices which support touch events
		if( Modernizr.touch ) {

			// Hammer.js
		    var hammerVS = new Hammer( sectionsContainer[0] );

		    hammerVS.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });

            // Go to the next section on swipe up
		    hammerVS.on('swipeup', function( e ) {
		    	nextSection();
		    });

            // Go to the previous section on swipe down
		    hammerVS.on('swipedown', function( e ) {
		    	prevSection();
		    });

		}

    }

    function prevSection( event ) {

    	if( typeof event !== 'undefined' ) {
            event.preventDefault();
        }

    	var currentSection = sections.filter('.active');

        if( !animating && !currentSection.is(":first-child") ) {

        	animating = true;

            currentSection.removeClass('active').children('div').velocity(animationsSettings.bottom, animationsSettings.easing, animationsSettings.duration)
                .end().prev('.vs-section').addClass('active').children('div').velocity(animationsSettings.visible, animationsSettings.easing, animationsSettings.duration, function(){
                	animating = false;
                });

            actual = actual - 1;

        }
    }

    function nextSection( event ) {

    	if( typeof event !== 'undefined' ) {
            event.preventDefault();
        }

        var currentSection = sections.filter('.active');

        if(!animating && !currentSection.is(':last-of-type') ) {

            animating = true;
            currentSection.removeClass('active').children('div').velocity(animationsSettings.top, animationsSettings.easing, animationsSettings.duration )
            .end().next('.vs-section').addClass('active').children('div').velocity(animationsSettings.visible, animationsSettings.easing, animationsSettings.duration, function() {
            	animating = false;
            });

            actual = actual + 1;
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

// //scale down
// $.Velocity
//     .RegisterEffect("scaleDown", {
//     	defaultDuration: 1,
//         calls: [
//             [{ opacity: '0', scale: '0.7', boxShadowBlur: '40px' }, 1]
//         ]
//     });
// //rotation
// $.Velocity
//     .RegisterEffect("rotation", {
//     	defaultDuration: 1,
//         calls: [
//             [ { opacity: '0', rotateX: '90', translateY: '-100%'}, 1]
//         ]
//     });
// $.Velocity
//     .RegisterEffect("rotation.scroll", {
//     	defaultDuration: 1,
//         calls: [
//             [ { opacity: '0', rotateX: '90', translateY: '0'}, 1]
//         ]
//     });
// //gallery
// $.Velocity
//     .RegisterEffect("scaleDown.moveUp", {
//     	defaultDuration: 1,
//         calls: [
//         	[ { translateY: '-10%', scale: '0.9', boxShadowBlur: '40px'}, 0.20 ],
//         	[ { translateY: '-100%' }, 0.60 ],
//         	[ { translateY: '-100%', scale: '1', boxShadowBlur: '0' }, 0.20 ]
//         ]
//     });
// $.Velocity
//     .RegisterEffect("scaleDown.moveUp.scroll", {
//     	defaultDuration: 1,
//         calls: [
//         	[ { translateY: '-100%', scale: '0.9', boxShadowBlur: '40px' }, 0.60 ],
//         	[ { translateY: '-100%', scale: '1', boxShadowBlur: '0' }, 0.40 ]
//         ]
//     });
// $.Velocity
//     .RegisterEffect("scaleUp.moveUp", {
//     	defaultDuration: 1,
//         calls: [
//         	[ { translateY: '90%', scale: '0.9', boxShadowBlur: '40px' }, 0.20 ],
//         	[ { translateY: '0%' }, 0.60 ],
//         	[ { translateY: '0%', scale: '1', boxShadowBlur: '0'}, 0.20 ]
//         ]
//     });
// $.Velocity
//     .RegisterEffect("scaleUp.moveUp.scroll", {
//     	defaultDuration: 1,
//         calls: [
//         	[ { translateY: '0%', scale: '0.9' , boxShadowBlur: '40px' }, 0.60 ],
//         	[ { translateY: '0%', scale: '1', boxShadowBlur: '0'}, 0.40 ]
//         ]
//     });
// $.Velocity
//     .RegisterEffect("scaleDown.moveDown", {
//     	defaultDuration: 1,
//         calls: [
//         	[ { translateY: '10%', scale: '0.9', boxShadowBlur: '40px'}, 0.20 ],
//         	[ { translateY: '100%' }, 0.60 ],
//         	[ { translateY: '100%', scale: '1', boxShadowBlur: '0'}, 0.20 ]
//         ]
//     });
// $.Velocity
//     .RegisterEffect("scaleDown.moveDown.scroll", {
//     	defaultDuration: 1,
//         calls: [
//         	[ { translateY: '100%', scale: '0.9', boxShadowBlur: '40px' }, 0.60 ],
//         	[ { translateY: '100%', scale: '1', boxShadowBlur: '0' }, 0.40 ]
//         ]
//     });
// $.Velocity
//     .RegisterEffect("scaleUp.moveDown", {
//     	defaultDuration: 1,
//         calls: [
//         	[ { translateY: '-90%', scale: '0.9', boxShadowBlur: '40px' }, 0.20 ],
//         	[ { translateY: '0%' }, 0.60 ],
//         	[ { translateY: '0%', scale: '1', boxShadowBlur: '0'}, 0.20 ]
//         ]
//     });
// //catch up
// $.Velocity
//     .RegisterEffect("translateUp.delay", {
//     	defaultDuration: 1,
//         calls: [
//             [ { translateY: '0%'}, 0.8, { delay: 100 }],
//         ]
//     });
// //opacity
// $.Velocity
//     .RegisterEffect("hide.scaleUp", {
//     	defaultDuration: 1,
//         calls: [
//             [ { opacity: '0', scale: '1.2'}, 1 ]
//         ]
//     });
// $.Velocity
//     .RegisterEffect("hide.scaleDown", {
//     	defaultDuration: 1,
//         calls: [
//             [ { opacity: '0', scale: '0.8'}, 1 ]
//         ]
//     });