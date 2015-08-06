;(function( $ ) {

    // here we go!
    $.verticalSlider = function( sectionsContainer, options ) {

        // this is private property and is  accessible only from inside the plugin
        var defaults = {
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
                easing:     [0.77, 0, 0.175, 1],
                duration:   800
            },

            // Callback functions
            afterInit: function( currentSection, sectionsNumber  ) { return false; },
            beforeMove: function( currentSection, sectionsNumber ) {},
            afterMove: function( currentSection, sectionsNumber ) { return false; }
        };

        // to avoid confusions, use "Plugin" to reference the
        // current instance of the object
        var Plugin = this;

        // this will hold the merged default, and user-provided options
        // plugin's properties will be available through this object like:
        // plugin.settings.propertyName from inside the plugin or
        // element.data('verticalSlider').settings.propertyName from outside the plugin,
        // where "element" is the element the plugin is attached to;
        Plugin.settings = {};

        // The "constructor" method that gets called when the object is created
        Plugin._construct = function() {

            // the plugin's final properties are the merged default and
            // user-provided options (if any)
            Plugin.settings = $.extend({}, defaults, options);

            // Define vertical slider container
            Plugin.sectionsContainer = $( sectionsContainer );

            // Define options
            Plugin.options   = $.extend( {}, defaults, options);
            Plugin._defaults = defaults;

            // Global variables
            Plugin.animating            = false;
            Plugin.sections             = $('.vs-section');
            Plugin.sectionsNumber       = Plugin.sections.length;
            Plugin.currentSection       = Plugin.sections.filter('.active');
            Plugin.currentSectionIndex  = $( Plugin.currentSection ).index();
            Plugin.options.infoSelector = $( Plugin.options.infoSelector );

            // Position sections (except the current section)
            Plugin.sections.filter(function( i ) {
                return i !== Plugin.currentSectionIndex;
            }).velocity( Plugin.options.animations.bottom, 0 );

            // Add informational classes
            Plugin.updateInfoClasses( Plugin.currentSection );

            // Add sections numbers
            Plugin.sections.each(function( n ) {
                $( this ).addClass( 'vs-section-' + n );
            });

            // Bind events
            bindEvents();

            // Launch the autoplay if requested
            if( Plugin.options.autoplay ) {
                Plugin.autoplay();
            }

            // Callback
            Plugin.options.afterInit( Plugin.currentSection, Plugin.sectionsNumber );

        }

        Plugin.prev = function( loop ) {
            // All tests will be done in the moveTo function
            Plugin.moveTo( Plugin.currentSectionIndex-1, loop );
        };

        Plugin.next = function( loop ) {
            // All tests will be done in the moveTo function
            Plugin.moveTo( Plugin.currentSectionIndex+1, loop );
        };

        Plugin.moveTo = function( sectionIndex, loop ) {
            var nextSection;
            var animation;

            // Test the slider is not already moving and the requested section is not the current one
            if( !Plugin.animating && Plugin.currentSection.index() !== sectionIndex ) {

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
                        animation        = 'vs_translateUp.half';
                        animationEnd     = 'vs_translateUp';
                        animationReverse = 'vs_translateDown';

                    }

                    // Actions if requested section is before the current one
                    else {

                        // Define animations
                        animation        = 'vs_translateDown.half';
                        animationEnd     = 'vs_translateDown';
                        animationReverse = 'vs_translateUp';

                    }

                    // Update informational classes
                    Plugin.updateInfoClasses( nextSection );

                    // Position next section
                    nextSection.addClass('active').velocity( animationReverse, {
                        duration: 0,
                        queue: false,
                        easing: Plugin.options.animations.easing,

                        complete: function() {

                            // Move out current section
                            Plugin.currentSection.removeClass('active').velocity(animation, {
                                duration: Plugin.options.animations.duration,
                                easing: Plugin.options.animations.easing,
                                queue: false,

                                complete: function() {
                                    // Reset section
                                    Plugin.currentSection.velocity(Plugin.options.animations.bottom, {
                                        duration: 0,
                                        queue: false
                                    });
                                }
                            });

                            // Move in next section
                            nextSection.velocity('vs_translateNone', {
                                duration: Plugin.options.animations.duration,
                                easing: Plugin.options.animations.easing,
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
                            Plugin.currentSection.velocity(Plugin.options.animations.bounceDown, {
                                duration: Plugin.options.animations.duration/2,
                                easing: Plugin.options.animations.easing,

                                complete: function() {
                                    // Unlock vertical slider
                                    Plugin.animating = false;

                                    // Callback
                                    Plugin.options.afterMove();
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
                            Plugin.currentSection.velocity(Plugin.options.animations.bounceUp, {
                                duration: Plugin.options.animations.duration/2,
                                easing: Plugin.options.animations.easing,

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
            // Clear previous timer
            clearTimeout( Plugin.autoplayTimer );

            // Set a new timer
            Plugin.autoplayTimer = setTimeout(function() {
                Plugin.next(true);
            }, Plugin.options.autoplayDuration );
        };

        Plugin.updateInfoClasses = function( section ) {
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
        var bindEvents = function() {
            var delta = 0;

            // Resize sections on window resize
            $( window ).on('resize', function() {
                Plugin.sectionsContainer.height( $( window ).height() );
            });

            // Scroll with mousewheel actions
            $( window ).on('mousewheel', function( event ) {
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

        // Register Velocity effects
        $.Velocity.RegisterEffect('vs_translateNone', {
            defaultDuration: 1,
            calls: [
                [{ translateZ: 0, translateX: '0%', translateY: '0%' }, 1, { easing: defaults.animations.easing }]
            ]
        });

        $.Velocity.RegisterEffect('vs_translateDown', {
            defaultDuration: 1,
            calls: [
                [{ translateZ: 0, translateY: '100%' }, 1, { easing: defaults.animations.easing }]
            ]
        });

        $.Velocity.RegisterEffect('vs_translateDown.half', {
            defaultDuration: 1,
            calls: [
                [{ translateZ: 0, translateY: '50%' }, 1, { easing: defaults.animations.easing }]
            ]
        });

        $.Velocity.RegisterEffect('vs_translateUp', {
            defaultDuration: 1,
            calls: [
                [{ translateZ: 0, translateY: '-100%' }, 1, { easing: defaults.animations.easing }]
            ]
        });

        $.Velocity.RegisterEffect('vs_translateUp.half', {
            defaultDuration: 1,
            calls: [
                [{ translateZ: 0, translateY: '-50%' }, 1, { easing: defaults.animations.easing }]
            ]
        });

        $.Velocity.RegisterEffect('vs_bounceDown', {
            defaultDuration: 1,
            calls: [
                [{ translateZ: 0, translateY: '10%' }, 1, { easing: defaults.animations.easing }],
                [{ translateZ: 0, translateY: '0%' }, 1, { easing: defaults.animations.easing }]
            ]
        });

        $.Velocity.RegisterEffect('vs_bounceUp', {
            defaultDuration: 1,
            calls: [
                [{ translateZ: 0, translateY: '-10%' }, 1, { easing: defaults.animations.easing }],
                [{ translateZ: 0, translateY: '0%' }, 1, { easing: defaults.animations.easing }]
            ]
        });

        // Call the "constructor" method
        Plugin._construct();
    }

    // add the plugin to the jQuery.fn object
    $.fn.verticalSlider = function(options) {
        // iterate through the DOM elements we are attaching the plugin to
        return this.each(function() {
            // if plugin has not already been attached to the element
            if (undefined == $(this).data('verticalSlider')) {
                // create a new instance of the plugin
                // pass the DOM element and the user-provided options as arguments
                var plugin = new $.verticalSlider(this, options);
                // Store a reference to the plugin object
                $(this).data('verticalSlider', plugin);
            }
        });
    }

})(jQuery);