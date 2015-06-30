var verticalSlider = {

    // Variables defined by the user
    scrollThreshold: 4,
    sectionsContainer: null,
    sections: null,
    infoSelector: null, // Element on which informational classes will be put (current section index, last section...)

    // Other variables
    animating: false,
    currentSection: null,
    animationsSettings: {
        visible: 'translateNone',
        top:     'translateUp.half',
        bottom:  'translateDown',
        easing:  'easeInCubic',
        duration: 800,
        scrollDelay: 400 // This delays is here to avoid sections jumps when scrolling with a trackpad
    },

    init: function( callback ) {

        var _this = this;

        // Initialise variables
        this.sectionsContainer = $('.vs-slider');
        this.sections          = $('.vs-section');
        this.currentSection    = this.sections.filter('.active');
        this.infoSelector      = $('html');

        // Change vh to px value on mobile
        if( Modernizr.mq('only screen and (max-width: 1200px)') ) {
            _this.sectionsContainer.height( $( window ).height() );
        }

        // Add a 100ms time out to avoid an issue where the first section swipe effect is lagging
        setTimeout(function() {

            // Position current section
            _this.currentSection.velocity( _this.animationsSettings.visible, 0 );

            // Position bottom section
            if( _this.currentSection.prev('.vs-section').index() > -1 ) {
                _this.currentSection.prevAll('.vs-section').css('opacity', 1).velocity( _this.animationsSettings.top, 0 );
            }

            // Position top section
            if( _this.currentSection.next('.vs-section').index() > -1 ) {
                _this.currentSection.nextAll('.vs-section').css('opacity', 1).velocity( _this.animationsSettings.bottom, 0 );
            }

            // Add sections numbers
            _this.sections.each(function( i ) {
                $( this ).addClass( 'vs-section-' + i );
            });

            // Add informational classes
            _this.updateInfoClasses( _this.currentSection );

            // Bind events
            _this.bindEvents();

            // Callback
            if( typeof( callback ) !== 'undefined' ) {
                callback();
            }

        }, 100);

    },

    prev: function() {
        // All tests will be done in the moveTo function
        this.moveTo( this.currentSection.index() - 1 );
    },

    next: function() {
        // All tests will be done in the moveTo function
        this.moveTo( this.currentSection.index() + 1 );
    },

    moveTo: function( sectionIndex ) {

        var _this = this;
        var nextSection;
        var animation;

        // Test the slider is not already moving and the requested section is not the current one
        if( !this.animating && this.currentSection.index() !== sectionIndex ) {

            // Animations starting
            _this.animating = true;

            // Test if the requested section is not before the first or after the last one
            if( sectionIndex > -1 && sectionIndex < _this.sections.length ) {

                if( sectionIndex > _this.currentSection.index() ) { // Requested section is after the current one
                    nextSection = _this.currentSection.next('.vs-section');
                    animation   = _this.animationsSettings.top;
                } else { // Requested section is before the current one
                    nextSection = _this.currentSection.prev('.vs-section');
                    animation   = _this.animationsSettings.bottom;
                }

                // Actual animation
                _this.currentSection.removeClass('active').velocity( animation, _this.animationsSettings.easing, _this.animationsSettings.duration );

                nextSection.addClass('active').velocity(_this.animationsSettings.visible, _this.animationsSettings.easing, _this.animationsSettings.duration, function() {
                    // Animations stopped
                    setTimeout(function() {
                        _this.animating = false;
                    }, _this.animationsSettings.scrollDelay);
                    // Update informational classes
                    _this.updateInfoClasses( nextSection );
                    // Update current section variable
                    _this.currentSection = nextSection;
                });

            } else {

                // At this stage the requested section is either after the last one or before the first one

                if( sectionIndex <= -1 ) { // Requested section is before the first one
                    _this.currentSection.velocity('bounceDown', _this.animationsSettings.easing, 400, function() {
                        _this.animating = false;
                    });
                } else if( sectionIndex >= _this.sections.length ) { // Requested section is after the last one
                    _this.currentSection.velocity('bounceUp', _this.animationsSettings.easing, 400, function() {
                        _this.animating = false;
                    });
                }

            }

        } else {
            // Requested section is the current one
            return false;
        }

    },

    updateInfoClasses: function( section ) {

        var _this = this;

        // Remove all informational classes using the prefix "vs-section-"
        this.infoSelector.removeClass(function ( index, css ) {
            return ( css.match (/\bvs-section-\S+/g) || [] ).join(' ');
        });

        // Remove class indicating the current section is the first and/or the last one
        // And add a class indicating the current section number
        this.infoSelector.addClass( 'vs-section-' + section.index() );

        // Test if the section is the first one
        if( section.index() === 0 ) {
            this.infoSelector.addClass('vs-section-first');
        }

        // Test if the section is the last one
        if( section.index() === _this.sections.length - 1 ) {
            this.infoSelector.addClass('vs-section-last');
        }

    },

    bindEvents: function() {

        var _this = this;
        var delta = 0;

        // Resize sections on orientation change for tablets and mobiles
        if( Modernizr.mq('only screen and (max-width: 1200px)') ) {
            $( window ).on('orientationchange', function() {
                _this.sectionsContainer.height( $( window ).height() );
            });
        }

        // Scroll with mousewheel actions
        $( window ).on('DOMMouseScroll mousewheel', function( event ) {

            // Check the scroll direction
            if ( event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0 ) {

                delta--;

                if( Math.abs( delta ) >= _this.scrollThreshold ) {
                    _this.prev();
                } else {
                    return false;
                }

            } else {

                delta++;

                if( delta >= _this.scrollThreshold ) {
                    _this.next();
                } else {
                    return false;
                }

            }

            // Reset delta
            delta = 0;

            return false;

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
            var hammerVS = new Hammer( _this.sectionsContainer[0] );

            hammerVS.get('swipe').set({ direction: Hammer.DIRECTION_VERTICAL });

            hammerVS.on('swipeup', function() {   _this.next(); });
            hammerVS.on('swipedown', function() { _this.prev(); });

            // Navigation arrows
            var hammerVSprev = new Hammer( $('.vs-prev')[0] );
            var hammerVSnext = new Hammer( $('.vs-next')[0] );

            hammerVSprev.on('tap', function() { _this.prev(); });
            hammerVSnext.on('tap', function() { _this.next(); });

        } else {

            $('.vs-prev').on('click', function() { _this.prev(); });
            $('.vs-next').on('click', function() { _this.next(); });

        }

    }

};

// Register Velocity effects
$.Velocity.RegisterEffect('translateNone', {
    defaultDuration: 1,
    calls: [
        [ { translateZ: 0, translateY: '0%', opacity: 1 }, 1 ]
    ]
});

$.Velocity.RegisterEffect('translateDown', {
    defaultDuration: 1,
    calls: [
        [ { translateZ: 0, translateY: '100%' }, 1 ]
    ]
});

$.Velocity.RegisterEffect('translateUp.half', {
    defaultDuration: 1,
    calls: [
        [ { translateZ: 0, translateY: '-50%' }, 1 ]
    ]
});

$.Velocity.RegisterEffect('bounceDown', {
    defaultDuration: 1,
    calls: [
        [ { translateZ: 0, translateY: '10%' }, 1 ],
        [ { translateZ: 0, translateY: '0%' }, 1 ]
    ]
});

$.Velocity.RegisterEffect('bounceUp', {
    defaultDuration: 1,
    calls: [
        [ { translateZ: 0, translateY: '-10%' }, 1 ],
        [ { translateZ: 0, translateY: '0%' }, 1 ]
    ]
});