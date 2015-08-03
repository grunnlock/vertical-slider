;(function ( $, window, document, undefined ) {

    // Create the defaults once
    var pluginName     = 'verticalSlider',
        defaults       = {
            scrollThreshold: 20,

            // Element on which informational classes will be put (current section index, last section...)
            infoSelector: 'html',

            // Autoplay functionality
            autoplay: false,
            autoplayDuration: 10000,

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
            afterInit: function() { return false; },
            afterMove: function() { return false; }
        };

    // Plugin constructor
    function Plugin( sectionsContainer, options ) {

        // Define vertical slider container
        this.sectionsContainer = $( sectionsContainer );

        // Define options
        this.options   = $.extend( {}, defaults, options) ;
        this._defaults = defaults;
        this._name     = pluginName;

        // Global variables
        this.animating            = false;
        this.sections             = $('.vs-section');
        this.currentSection       = this.sections.filter('.active');
        this.currentSectionIndex  = $( this.currentSection ).index();
        this.options.infoSelector = $( this.options.infoSelector );

        // Initialise the plugin
        this.init();

    }

    // Constructor wrapper to prevent multiple instantiations
    $.fn[ pluginName ] = function ( options ) {
        return this.each(function () {
            if ( ! $.data( this, 'plugin_' + pluginName ) ) {
                $.data( this, 'plugin_' + pluginName, new Plugin( this, options ) );
            }
        });
    }

    // Initialise the plugin
    Plugin.prototype.init = function () {

        var _this = this;

        // Position sections (except the current section)
        this.sections.filter(function( i ) {
            return i !== _this.currentSectionIndex;
        }).velocity( _this.options.animations.bottom, 0 );

        // Add informational classes
        this.updateInfoClasses( _this.currentSection );

        // Add sections numbers
        this.sections.each(function( n ) {
            $( this ).addClass( 'vs-section-' + n );
        });

        // Bind events
        _this.bindEvents();

        // Add a 100ms time out to avoid an issue where the first section swipe effect is lagging
        setTimeout(function() {

            // Callback
            if( typeof( _this.options.afterInit ) !== 'undefined' ) {
                _this.options.afterInit( _this.currentSection );
            }

        }, 100);

    };

    Plugin.prototype.prev = function( loop ) {
        // All tests will be done in the moveTo function
        this.moveTo( this.currentSection.index()-1, loop );
    };

    Plugin.prototype.next = function( loop ) {
        // All tests will be done in the moveTo function
        this.moveTo( this.currentSection.index()+1, loop );
    };

    Plugin.prototype.moveTo = function( sectionIndex, loop ) {

        var _this = this;

        var nextSection;
        var animation;

        // Test the slider is not already moving and the requested section is not the current one
        if( !this.animating && this.currentSection.index() !== sectionIndex ) {

            // Test if the requested section is not before the first or after the last one
            if( sectionIndex > -1 && sectionIndex < _this.sections.length ) {

                // Lock vertical slider
                _this.animating = true;

                // Define next section
                nextSection = _this.sections.eq( sectionIndex );

                if( sectionIndex > _this.currentSectionIndex ) { // Requested section is after the current one

                    // Define animations
                    animation        = 'vs_translateUp.half';
                    animationEnd     = 'vs_translateUp';
                    animationReverse = 'vs_translateDown';

                } else { // Requested section is before the current one

                    // Define animations
                    animation        = 'vs_translateDown.half';
                    animationEnd     = 'vs_translateDown';
                    animationReverse = 'vs_translateUp';

                }

                // Update informational classes
                _this.updateInfoClasses( nextSection );

                // Position next section
                nextSection.addClass('active').velocity( animationReverse, {
                    duration: 0,
                    queue: false,
                    easing: _this.options.animations.easing,

                    complete: function() {

                        // Move out current section
                        _this.currentSection.removeClass('active').velocity(animation, {
                            duration: _this.options.animations.duration,
                            easing: _this.options.animations.easing,
                            queue: false,

                            complete: function() {
                                // Reset section
                                _this.currentSection.velocity(_this.options.animations.bottom, {
                                    duration: 0,
                                    queue: false
                                });
                            }
                        });

                        // Move in next section
                        nextSection.velocity('vs_translateNone', {
                            duration: _this.options.animations.duration,
                            easing: _this.options.animations.easing,
                            queue: false,

                            complete: function() {
                                // Unlock vertical slider
                                _this.animating = false;
                                // Update other variables
                                _this.currentSection      = nextSection;
                                _this.currentSectionIndex = nextSection.index();
                                // Reset autoplay timer
                                _this.autoplay();
                            }
                        });

                    }
                });

            } else {

                // At this stage the requested section is either after the last one or before the first one

                if( sectionIndex < 0 && _this.currentSectionIndex === 0 ) { // Requested section is before the first one and the current section is the first one

                    // Test if a loop has been requested
                    if( loop ) {
                        // Move to the last section
                        _this.moveTo( _this.sections.length - 1, '', true );
                    } else {
                        // Lock vertical slider
                        _this.animating = true;

                        // If not do the bouncing animation
                        _this.currentSection.velocity(_this.options.animations.bounceDown, {
                            duration: _this.options.animations.duration/2,
                            easing: _this.options.animations.easing,

                            complete: function() {
                                // Unlock vertical slider
                                _this.animating = false;
                            }
                        });
                    }

                } else if( sectionIndex >= _this.sections.length && _this.currentSectionIndex === _this.sections.length-1 ) { // Requested section is after the last one and the current section is the last one

                    // Test if a loop has been requested
                    if( loop ) {
                        // Move to the first section
                        _this.moveTo(0, '', true);
                    } else {
                        // Lock vertical slider
                        _this.animating = true;

                        // If not do the bouncing animation
                        _this.currentSection.velocity(_this.options.animations.bounceUp, {
                            duration: _this.options.animations.duration/2,
                            easing: _this.options.animations.easing,

                            complete: function() {
                                // Unlock vertical slider
                                _this.animating = false;
                            }
                        });
                    }

                }

            }

        }

    };

    Plugin.prototype.autoplay = function() {

        var _this = this;

        // Clear previous timer
        clearTimeout( this.autoplayTimer );

        // Set a new timer
        this.autoplayTimer = setTimeout(function() {
            _this.next(true);
        }, _this.options.autoplayDuration );

    };

    Plugin.prototype.updateInfoClasses = function( section ) {

        var _this = this;

        // Remove all informational classes using the prefix "vs-active-section-"
        this.options.infoSelector.removeClass(function ( index, css ) {
            return ( css.match (/\bvs-active-section-\S+/g) || [] ).join(' ');
        });

        // Remove class indicating the current section is the first and/or the last one
        // And add a class indicating the current section number
        this.options.infoSelector.addClass( 'vs-active-section-' + section.index() );

        // Test if the section is the first one
        if( section.index() === 0 ) {
            this.options.infoSelector.addClass('vs-active-section-first');
        }

        // Test if the section is the last one
        if( section.index() === _this.sections.length - 1 ) {
            this.options.infoSelector.addClass('vs-active-section-last');
        }

    };

    Plugin.prototype.bindEvents = function() {

        var _this = this;
        var delta = 0;

        // Resize sections on window resize
        $( window ).on('resize', function() {
            _this.sectionsContainer.height( $( window ).height() );
        });

        // Scroll with mousewheel actions
        $( window ).on('scroll mousewheel wheel', function( event ) {
            // Check the scroll direction and move in consequence
            if ( event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0 ) {
                if( Math.abs( event.deltaY ) >= _this.options.scrollThreshold ) {
                    _this.prev();
                }
            } else {
                if( Math.abs( event.deltaY ) >= _this.options.scrollThreshold ) {
                    _this.next();
                }
            }
        });

        // Keyboard arrows actions
        $( window ).on('keyup', function( event ) {
            if( event.which === 40 ) {
                _this.next();
            } else if( event.which === 38 ) {
                _this.prev();
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

            hammerVS.on('swipeup', function() {   _this.next(); });
            hammerVS.on('swipedown', function() { _this.prev(); });

        }

    };

})( jQuery, window, document );

// Register Velocity effects
$.Velocity.RegisterEffect('vs_translateNone', {
    defaultDuration: 1,
    calls: [
        [{ translateZ: 0, translateX: '0%', translateY: '0%' }, 1]
    ]
});

$.Velocity.RegisterEffect('vs_translateDown', {
    defaultDuration: 1,
    calls: [
        [{ translateZ: 0, translateY: '100%' }, 1]
    ]
});

$.Velocity.RegisterEffect('vs_translateDown.half', {
    defaultDuration: 1,
    calls: [
        [{ translateZ: 0, translateY: '50%' }, 1]
    ]
});

$.Velocity.RegisterEffect('vs_translateUp', {
    defaultDuration: 1,
    calls: [
        [{ translateZ: 0, translateY: '-100%' }, 1]
    ]
});

$.Velocity.RegisterEffect('vs_translateUp.half', {
    defaultDuration: 1,
    calls: [
        [{ translateZ: 0, translateY: '-50%' }, 1]
    ]
});

$.Velocity.RegisterEffect('vs_bounceDown', {
    defaultDuration: 1,
    calls: [
        [{ translateZ: 0, translateY: '10%' }, 1],
        [{ translateZ: 0, translateY: '0%' }, 1]
    ]
});

$.Velocity.RegisterEffect('vs_bounceUp', {
    defaultDuration: 1,
    calls: [
        [{ translateZ: 0, translateY: '-10%' }, 1],
        [{ translateZ: 0, translateY: '0%' }, 1]
    ]
});