var verticalSlider = {

    // Variables defined by the user
    scrollThreshold: 20,
    sectionsContainer: null,
    sections: null,
    infoSelector: null, // Element on which informational clas ses will be put (current section index, last section...)

    // Other variables
    animating: false,
    currentSection: null,
    animationsSettings: {
        visible: 'translateNone',
        top:     'translateUp.half',
        bottom:  'translateDown',
        easing:  'easeInCubic',
        duration: 800
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

        // Add sections numbers
        _this.sections.each(function( i ) {
            $( this ).addClass( 'vs-section-' + i );
        });

        // Add informational classes
        _this.updateInfoClasses( _this.currentSection );

        // Add a 100ms time out to avoid an issue where the first section swipe effect is lagging
        setTimeout(function() {

            // Position current section
            _this.currentSection.velocity( _this.animationsSettings.visible, 0 );

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
        this.moveTo( this.currentSection.index()-1 );
    },

    next: function() {
        // All tests will be done in the moveTo function
        this.moveTo( this.currentSection.index()+1 );
    },

    moveTo: function( sectionIndex ) {

        var _this = this;
        var nextSection;
        var animation;

        // Test the slider is not already moving and the requested section is not the current one
        if( !this.animating && this.currentSection.index() !== sectionIndex ) {

            // Test if the requested section is not before the first or after the last one
            if( sectionIndex > -1 && sectionIndex < _this.sections.length ) {

                // Lock vertical slider
                _this.animating = true;

                nextSection = _this.sections.eq( sectionIndex );

                if( sectionIndex > _this.currentSection.index() ) { // Requested section is after the current one

                    // Reset sections positions
                    _this.currentSection.nextAll().css('opacity', 0);

                    // Define animations
                    animation        = _this.animationsSettings.top;
                    animationReverse = _this.animationsSettings.bottom;

                } else { // Requested section is before the current one

                    // Reset sections positions
                    _this.currentSection.prevAll().css('opacity', 0);

                    // Define animations
                    animation        = _this.animationsSettings.bottom;
                    animationReverse = _this.animationsSettings.top;
                }

                // Actual animation
                _this.currentSection.removeClass('active').velocity( animation, _this.animationsSettings.easing, _this.animationsSettings.duration );

                // Position next section
                nextSection.css('opacity', 1).velocity( animationReverse, 0, function() {
                    // Do the animation
                    $( this ).addClass('active').velocity(_this.animationsSettings.visible, _this.animationsSettings.easing, _this.animationsSettings.duration, function() {
                        // Unlock vertical slider
                        _this.animating = false;
                        // Update informational classes
                        _this.updateInfoClasses( nextSection );
                        // Update current section variable
                        _this.currentSection = nextSection;
                    });
                });


            } else {

                // At this stage the requested section is either after the last one or before the first one

                if( sectionIndex < 0 && _this.currentSection.index() === 0 ) { // Requested section is before the first one and the current section is the first one

                    // Lock vertical slider
                    _this.animating = true;

                    // Animation
                    _this.currentSection.velocity('bounceDown', _this.animationsSettings.easing, 400, function() {
                        // Unlock vertical slider
                        _this.animating = false;
                    });

                } else if( sectionIndex >= _this.sections.length && _this.currentSection.index() === _this.sections.length-1 ) { // Requested section is after the last one and the current section is the last one

                    // Lock vertical slider
                    _this.animating = true;

                    // Animation
                    _this.currentSection.velocity('bounceUp', _this.animationsSettings.easing, 400, function() {
                        // Unlock vertical slider
                        _this.animating = false;
                    });

                }

            }

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
        $( window ).on('mousewheel', function( event ) {

            // Check the scroll direction
            if ( event.originalEvent.detail < 0 || event.originalEvent.wheelDelta > 0 ) {

                if( Math.abs( event.deltaY ) >= _this.scrollThreshold ) {
                    _this.prev();
                }

            } else {

                if( Math.abs( event.deltaY ) >= _this.scrollThreshold ) {
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