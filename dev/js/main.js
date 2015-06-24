jQuery( document ).ready(function( $ ) {
	//variables
	var hijacking 	    = 'on',
		animationType   = 'parallax',
		delta 		    = 0,
        scrollThreshold = 5,
        actual 			= 1,
        animating 		= false;

    //DOM elements
    var sectionsAvailable = $('.cd-section'),
    	verticalNav 	  = $('.cd-vertical-nav'),
    	prevArrow 		  = verticalNav.find('a.cd-prev'),
    	nextArrow 		  = verticalNav.find('a.cd-next');

	// Initialize section style - scrollhijacking
	var visibleSection   = sectionsAvailable.filter('.visible'),
		topSection 		 = visibleSection.prevAll('.cd-section'),
		bottomSection 	 = visibleSection.nextAll('.cd-section'),
		animationParams  = {
			visible: 'translateNone',
			top: 'translateUp.half',
			bottom: 'translateDown',
			easing: 'easeInCubic',
			duration: 800
		};

		console.log( animationParams );

	// Init events
	bindEvents();

	$( window ).on('resize', function() {
		bindEvents();
	});

    function bindEvents() {

		visibleSection.children('div').velocity(animationParams.visible, 1, function() {
			visibleSection.css('opacity', 1);
	    	topSection.css('opacity', 1);
	    	bottomSection.css('opacity', 1);
		});

        topSection.children('div').velocity( animationParams.top, 0 );
        bottomSection.children('div').velocity( animationParams.bottom, 0 );

        // Bind events

        // Scroll with mousewheel actions
		$( window ).on( 'DOMMouseScroll mousewheel', scrollHijacking );

		// Click actions on navigation
		prevArrow.on( 'click', prevSection );
		nextArrow.on( 'click', nextSection );

		// Keyboard arrows actions
		$( document ).on('keyup', function( event ) {
			if( event.which === '40' && !nextArrow.hasClass('inactive') ) {
				nextSection();
			} else if( event.which === '38' && ( !prevArrow.hasClass('inactive') || ( prevArrow.hasClass('inactive') && $( window ).scrollTop() !== sectionsAvailable.eq(0).offset().top ) ) ) {
				prevSection();
			}
		});

		// Events for devices which support touch events
		if( Modernizr.touch ) {

			// Hammer.js
		    var sections 		 = document.getElementById('cd-sections');
		    var verticalScroller = new Hammer( sections );

		    verticalScroller.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });

		    verticalScroller.on('swipeup', function( e ) {
		    	nextSection();
		    });

		    verticalScroller.on('swipedown', function( e ) {
		    	prevSection();
		    });

		}

    }

	function scrollHijacking( event ) {
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
    }

    function prevSection( event ) {
    	//go to previous section
    	typeof event !== 'undefined' && event.preventDefault();

    	var visibleSection = sectionsAvailable.filter('.visible'),
    		middleScroll   = false;
    	// visibleSection = middleScroll ? visibleSection.next('.cd-section') : visibleSection;

        if( !animating && !visibleSection.is(":first-child") ) {
        	animating = true;
            visibleSection.removeClass('visible').children('div').velocity(animationParams.bottom, animationParams.easing, animationParams.duration)
            .end().prev('.cd-section').addClass('visible').children('div').velocity(animationParams.visible , animationParams.easing, animationParams.duration, function(){
            	animating = false;
            });

            actual = actual - 1;
        }
        // resetScroll();

		animationParams  = {
			visible: 'translateNone',
			top: 'translateUp.half',
			bottom: 'translateDown',
			easing: 'easeInCubic',
			duration: 800
		};
    }

    function nextSection( event ) {
    	//go to next section
    	typeof event !== 'undefined' && event.preventDefault();

        var visibleSection = sectionsAvailable.filter('.visible'),
    		middleScroll = ( hijacking == 'off' && $(window).scrollTop() != visibleSection.offset().top) ? true : false;

        if(!animating && !visibleSection.is(':last-of-type') ) {
            animating = true;
            visibleSection.removeClass('visible').children('div').velocity(animationParams.top, animationParams.easing, animationParams.duration )
            .end().next('.cd-section').addClass('visible').children('div').velocity(animationParams.visible, animationParams.easing, animationParams.duration, function() {
            	animating = false;
            });

            actual = actual +1;
        }
        // resetScroll();
    }

    // function resetScroll() {
    //     delta = 0;
    // }

	function selectAnimation( animationName, middleScroll, direction ) {
		var animationVisible = 'translateNone',
			animationTop 	 = 'translateUp.half',
			animationBottom  = 'translateDown',
			easing 			 = 'easeInCubic',
			animDuration 	 = 800;

		return [animationVisible, animationTop, animationBottom, animDuration, easing];
	}

    // Parallax.js

    $('#scene1, #scene2').parallax();

});

// Register Velocity effects
// None
$.Velocity
    .RegisterEffect('translateUp', {
    	defaultDuration: 1,
        calls: [
            [{ translateY: '-100%'}, 1]
        ]
    });

$.Velocity
    .RegisterEffect('translateDown', {
    	defaultDuration: 1,
        calls: [
            [{ translateY: '100%'}, 1]
        ]
    });

$.Velocity
    .RegisterEffect('translateNone', {
    	defaultDuration: 1,
        calls: [
            [{ translateY: '0', opacity: '1', scale: '1', rotateX: '0', boxShadowBlur: '0'}, 1]
        ]
    });

// Parallax
$.Velocity
    .RegisterEffect('translateUp.half', {
    	defaultDuration: 1,
        calls: [
            [{ translateY: '-50%'}, 1]
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