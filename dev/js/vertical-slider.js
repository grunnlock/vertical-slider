;(function( $ ) {

    // here we go!
    $.verticalSlider = function( sectionsContainer, options ) {

        // Default options
        var defaults = {
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
            animDown: 'vs_translateDown',
            animDownHalf: 'vs_translateDown.half',
            animBounceUp: 'vs_bounceUp',
            animBounceDown: 'vs_bounceDown',
            animEasing: [0.77, 0, 0.175, 1],
            animDuration: 800,

            // Callback functions
            afterInit: function( currentSection, sectionsNumber  ) { return false; },
            beforeMove: function( currentSection, sectionsNumber ) {},
            afterMove: function( currentSection, sectionsNumber ) { return false; }
        };

        // Create an object usable to target the plugin's object
        var Plugin = this;

        // Define options
        Plugin.settings = {};

        // The "constructor" method that gets called when the object is created
        var _construct = function() {

            // Define options
            Plugin.options   = $.extend( {}, defaults, options );
            Plugin._defaults = defaults;

            // Transform the infoSelector to a jQuery object
            Plugin.options.infoSelector = $( Plugin.options.infoSelector );

            // Global variables
            Plugin.animating           = false;
            Plugin.sectionsContainer   = $( sectionsContainer );
            Plugin.sections            = Plugin.sectionsContainer.children('.vs-section');
            Plugin.sectionsNumber      = Plugin.sections.length;
            Plugin.currentSection      = Plugin.sections.filter('.active');
            Plugin.currentSectionIndex = Plugin.currentSection.index();

            // Register Velocity effects

            if( Plugin.options.animVisible === 'vs_translateNone' ) {
                $.Velocity.RegisterEffect(Plugin.options.animVisible, {
                    defaultDuration: 1,
                    calls: [
                        [{ translateZ: 0, translateX: '0%', translateY: '0%' }, 1, { easing: Plugin.options.animEasing }]
                    ]
                });
            }

            if( Plugin.options.animUp === 'vs_translateUp' ) {
                $.Velocity.RegisterEffect(Plugin.options.animUp, {
                    defaultDuration: 1,
                    calls: [
                        [{ translateZ: 0, translateY: '-100%' }, 1, { easing: Plugin.options.animEasing }]
                    ]
                });
            }

            if( Plugin.options.animUpHalf === 'vs_translateUp.half' ) {
                $.Velocity.RegisterEffect(Plugin.options.animUpHalf, {
                    defaultDuration: 1,
                    calls: [
                        [{ translateZ: 0, translateY: '-50%' }, 1, { easing: Plugin.options.animEasing }]
                    ]
                });
            }

            if( Plugin.options.animDown === 'vs_translateDown' ) {
                $.Velocity.RegisterEffect(Plugin.options.animDown, {
                    defaultDuration: 1,
                    calls: [
                        [{ translateZ: 0, translateY: '100%' }, 1, { easing: Plugin.options.animEasing }]
                    ]
                });
            }

            if( Plugin.options.animDownHalf === 'vs_translateDown.half' ) {
                $.Velocity.RegisterEffect(Plugin.options.animDownHalf, {
                    defaultDuration: 1,
                    calls: [
                        [{ translateZ: 0, translateY: '50%' }, 1, { easing: Plugin.options.animEasing }]
                    ]
                });
            }

            if( Plugin.options.animBounceUp === 'vs_bounceUp' ) {
                $.Velocity.RegisterEffect(Plugin.options.animBounceUp, {
                    defaultDuration: 1,
                    calls: [
                        [{ translateZ: 0, translateY: '-10%' }, 1, { easing: Plugin.options.animEasing }],
                        [{ translateZ: 0, translateY: '0%' }, 1, { easing: Plugin.options.animEasing }]
                    ]
                });
            }

            if( Plugin.options.animBounceDown === 'vs_bounceDown' ) {
                $.Velocity.RegisterEffect(Plugin.options.animBounceDown, {
                    defaultDuration: 1,
                    calls: [
                        [{ translateZ: 0, translateY: '10%' }, 1, { easing: Plugin.options.animEasing }],
                        [{ translateZ: 0, translateY: '0%' }, 1, { easing: Plugin.options.animEasing }]
                    ]
                });
            }

            if( Modernizr.mq('only screen and (max-width: 1200px)') ) {
                // Change vh to px value on mobile and tablets
                Plugin.sectionsContainer.height( $( window ).height() );
            }

            // Position sections (except the current section)
            Plugin.sections.filter(function( i ) {
                return i !== Plugin.currentSectionIndex;
            }).velocity( Plugin.options.animDown, 0 );

            // Add informational classes
            _updateInfoClasses( Plugin.currentSection );

            // Add sections numbers
            Plugin.sections.each(function( n ) {
                $( this ).addClass( 'vs-section-' + n );
            });

            // Bind events
            _bindEvents();

            // Launch the autoplay if requested
            if( Plugin.options.autoplay ) {
                Plugin.autoplay();
            }

            // Callback
            Plugin.options.afterInit( Plugin.currentSection, Plugin.sectionsNumber );

        };

        // Go to previous section
        Plugin.prev = function( loop ) {
            // All tests will be done in the moveTo function
            Plugin.moveTo( Plugin.currentSectionIndex-1, loop );
        };

        // Go to next section
        Plugin.next = function( loop ) {
            // All tests will be done in the moveTo function
            Plugin.moveTo( Plugin.currentSectionIndex+1, loop );
        };

        Plugin.moveTo = function( sectionIndex, loop ) {
            var nextSection;
            var animation;
            var animationReverse;

            // Test if the slider is not already moving and the requested section is not the current one
            if( ! Plugin.animating && Plugin.currentSection.index() !== sectionIndex ) {

                // Before move actions
                Plugin.options.beforeMove( Plugin.currentSection, Plugin.sectionsNumber );

                // Test if the requested section is not before the first or after the last one
                if( sectionIndex > -1 && sectionIndex < Plugin.sectionsNumber ) {

                    // Lock vertical slider
                    Plugin.animating = true;

                    // Define next section
                    nextSection = Plugin.sections.eq( sectionIndex );

                    // Actions if requested section is after the current one
                    if( sectionIndex > Plugin.currentSectionIndex ) {

                        // Define animations
                        animation        = Plugin.options.animUpHalf;
                        animationReverse = Plugin.options.animDown;

                    }

                    // Actions if requested section is before the current one
                    else {

                        // Define animations
                        animation        = Plugin.options.animDownHalf;
                        animationReverse = Plugin.options.animUp;

                    }

                    // Update informational classes
                    _updateInfoClasses( nextSection );

                    // Position next section
                    nextSection.addClass('active').velocity(animationReverse, {
                        duration: 0,
                        queue: false,
                        easing: Plugin.options.animEasing,

                        complete: function() {

                            // Move out current section
                            Plugin.currentSection.removeClass('active').velocity(animation, {
                                duration: Plugin.options.animDuration,
                                easing: Plugin.options.animEasing,
                                queue: false,

                                complete: function() {
                                    // Reset section
                                    Plugin.currentSection.velocity(Plugin.options.animDown, {
                                        duration: 0,
                                        queue: false
                                    });
                                }
                            });

                            // Move in next section
                            nextSection.velocity(Plugin.options.animVisible, {
                                duration: Plugin.options.animDuration,
                                easing: Plugin.options.animEasing,
                                queue: false,

                                complete: function() {
                                    // Unlock vertical slider
                                    Plugin.animating = false;

                                    // Update other variables
                                    Plugin.currentSection      = nextSection;
                                    Plugin.currentSectionIndex = nextSection.index();

                                    // Reset autoplay timer if requested
                                    if( Plugin.options.autoplay ) {
                                        Plugin.autoplay();
                                    }

                                    // Callback
                                    Plugin.options.afterMove( Plugin.currentSection, Plugin.sectionsNumber );
                                }
                            });

                        }
                    });

                } else {

                    // At this stage the requested section is either after the last one or before the first one

                    // Actions if requested section is before the first one and the current section is the first one
                    if( sectionIndex < 0 && Plugin.currentSectionIndex === 0 ) {

                        // Test if a loop has been requested
                        if( loop ) {
                            // Move to the last section
                            Plugin.moveTo( Plugin.sectionsNumber-1, '', true );
                        } else {
                            // Lock vertical slider
                            Plugin.animating = true;

                            // If not do the bouncing animation
                            Plugin.currentSection.velocity(Plugin.options.animBounceDown, {
                                duration: Plugin.options.animDuration/2,
                                easing: Plugin.options.animEasing,

                                complete: function() {
                                    // Unlock vertical slider
                                    Plugin.animating = false;

                                    // Callback
                                    Plugin.options.afterMove( Plugin.currentSection, Plugin.sectionsNumber );
                                }
                            });
                        }

                    }

                    // Actions if requested section is after the last one and the current section is the last one
                    else if( sectionIndex >= Plugin.sectionsNumber && Plugin.currentSectionIndex === Plugin.sectionsNumber-1 ) {

                        // Test if a loop has been requested
                        if( loop ) {
                            // Move to the first section
                            Plugin.moveTo(0, '', true);
                        } else {
                            // Lock vertical slider
                            Plugin.animating = true;

                            // If not do the bouncing animation
                            Plugin.currentSection.velocity(Plugin.options.animBounceUp, {
                                duration: Plugin.options.animDuration/2,
                                easing: Plugin.options.animEasing,

                                complete: function() {
                                    // Unlock vertical slider
                                    Plugin.animating = false;

                                    // Callback
                                    Plugin.options.afterMove( Plugin.currentSection, Plugin.sectionsNumber );
                                }
                            });
                        }

                    }

                }

            }

        };

        Plugin.autoplay = function() {
            // Update autoplay to true
            Plugin.options.autoplay = true;

            // Clear previous timer
            clearTimeout( Plugin.autoplayTimer );

            // Set a new timer
            Plugin.autoplayTimer = setTimeout(function() {
                Plugin.next(true);
            }, Plugin.options.autoplayDuration );
        };

        var _updateInfoClasses = function( section ) {
            // Remove all informational classes using the prefix "vs-active-section-"
            Plugin.options.infoSelector.removeClass(function ( index, css ) {
                return ( css.match (/\bvs-active-section-\S+/g) || [] ).join(' ');
            });

            // Remove class indicating the current section is the first and/or the last one
            // And add a class indicating the current section number
            Plugin.options.infoSelector.addClass( 'vs-active-section-' + section.index() );

            // Test if the section is the first one
            if( section.index() === 0 ) {
                Plugin.options.infoSelector.addClass('vs-active-section-first');
            }

            // Test if the section is the last one
            if( section.index() === Plugin.sectionsNumber - 1 ) {
                Plugin.options.infoSelector.addClass('vs-active-section-last');
            }
        };

        // a private method. for demonstration purposes only - remove it!
        var _bindEvents = function() {
            var delta = 0;

            // Resize sections on window resize
            $( window ).on('resize', function() {
                Plugin.sectionsContainer.height( $( window ).height() );
            });

            // Scroll with mousewheel actions
            Plugin.sectionsContainer.on('mousewheel', function( event ) {
                // Check the scroll direction and move in consequence
                if ( event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0 ) {
                    if( Math.abs( event.deltaY ) >= Plugin.options.scrollThreshold ) {
                        Plugin.prev();
                    }
                } else {
                    if( Math.abs( event.deltaY ) >= Plugin.options.scrollThreshold ) {
                        Plugin.next();
                    }
                }
            });

            // Keyboard arrows actions
            $( window ).on('keyup', function( event ) {
                if( event.which === 40 ) {
                    Plugin.next();
                } else if( event.which === 38 ) {
                    Plugin.prev();
                }
            });

            // Events for devices which support touch events
            if( Modernizr.touch ) {

                // Hammer.js

                // Swipe gesture
                var hammerVS = new Hammer($('html')[0], {
                    threshold: 1
                });

                hammerVS.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });

                hammerVS.on('swipeup', function() { Plugin.next(); });
                hammerVS.on('swipedown', function() { Plugin.prev(); });

            }

        };

        // Call the "constructor" method
        _construct();
    };

    // Add the plugin to jQuery.fn object
    $.fn.verticalSlider = function( options ) {
        // Iterate through the DOM elements we are attaching the plugin to
        return this.each(function() {
            // If plugin has not already been attached to the element
            if ( undefined === $( this ).data('verticalSlider') ) {
                // Create a new instance of the plugin
                var plugin = new $.verticalSlider( this, options );
                // Store a reference to the plugin object
                $( this ).data( 'verticalSlider', plugin );
            }
        });
    };

})( jQuery );