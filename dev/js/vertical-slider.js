var verticalSlider = {

    // Variables defined by the user
    scrollThreshold: 1,
    sectionsContainer: null,
    sections: null,

    // Other variables
    delta: 0,
    animating: false,
    currentSection: null,
    animationsSettings: {
        visible: 'translateNone',
        top:     'translateUp.half',
        bottom:  'translateDown',
        easing:  'easeInCubic',
        duration: 800
    },

    init: function() {

        var _this = this;

        // Initialise variables
        this.sectionsContainer = $('.vs-slider');
        this.sections          = $('.vs-section');
        this.currentSection    = this.sections.filter('.active');

        // Change vh to px value on mobile
        if( Modernizr.mq('only screen and (max-width: 1200px)') ) {
            _this.sectionsContainer.height( $( window ).height() );
        }

        // Add a 100ms time out to avoid an issue where the first section swipe effect is lagging
        setTimeout(function() {

            // Current section
            _this.currentSection.velocity( _this.animationsSettings.visible, 0 );

            // Bottom section
            if( _this.currentSection.prevAll('.vs-section').index() > -1 ) {
                _this.currentSection.prevAll('.vs-section').css('opacity', 1).velocity( _this.animationsSettings.top, 0 );
            }

            // Top section
            if( _this.currentSection.nextAll('.vs-section').index() > -1 ) {
                _this.currentSection.nextAll('.vs-section').css('opacity', 1).velocity( _this.animationsSettings.bottom, 0 );
            }

            // Bind events
            _this.bindEvents();

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
                    _this.animating      = false;
                    // Update current section variable
                    _this.currentSection = nextSection;
                });

            } else {

                // At this stage the requested section is either after the last one or before the first one

                if( sectionIndex <= -1 ) { // Requested section is before the first one
                    _this.currentSection.velocity( 'bounceDown', _this.animationsSettings.easing, 400, function() {
                        _this.animating = false;
                    });
                } else if( sectionIndex >= _this.sections.length ) { // Requested section is after the last one
                    _this.currentSection.velocity( 'bounceUp', _this.animationsSettings.easing, 400, function() {
                        _this.animating = false;
                    });
                }

            }

        } else {
            // Requested section is the current one
            return false;
        }

    },

    bindEvents: function() {

        var _this = this;

        if( Modernizr.mq('only screen and (max-width: 1200px)') ) {
            // Resize sections on window resize, on mobile
            $( window ).on('resize', function() {
                _this.sectionsContainer.height( $( window ).height() );
            });
        }

        // Scroll with mousewheel actions
        $( window ).on('DOMMouseScroll mousewheel', function( event ) {

            // Check the scroll direction
            if ( event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0 ) {

                _this.delta--;

                if( Math.abs( _this.delta ) >= _this.scrollThreshold ) {
                    _this.prev();
                } else {
                    return false;
                }

            } else {

                _this.delta++;

                if( _this.delta >= _this.scrollThreshold ) {
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
        $( document ).on('keyup', function( event ) {

            if( event.which == '40' ) {
                _this.next();
            } else if( event.which == '38' ) {
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