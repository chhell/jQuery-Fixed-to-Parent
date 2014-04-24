(function($, win, doc) {

  'use strict';

  // cache these for use everywhere
  var $win = $(win);
  var $doc = $(doc);

  function FixedToParent(elem) {

    var self = this;

    // nodes
    var $body = $('body');
    var $panel = $(elem);
    var $container = $panel.parent();

    // viewport positions
    var winHeight = win.innerHeight || doc.body.clientHeight;
    var viewportTop = $doc.scrollTop();
    var viewportBottom = viewportTop + winHeight;

    // container positions
    var containerHeight = $container.outerHeight();
    var containerTop = $container.offset().top;
    var containerBottom = containerHeight + containerTop;
    var containerLeft;

    // panel positions
    var panelHeight = $panel.outerHeight();
    var panelTop = containerTop;
    var panelBottom = panelTop + panelHeight;
    var panelTopParent = panelTop - containerTop;
    var combinedBorderLeftWidth = 0;
    var panelLeft;
    var panelLeftParent;

    // helper variables
    var scrollingDown = true;

    function attachEventListeners() {
      $doc.on('scroll', self.scroll);
      $doc.on('keyup', self.keypress);
      $win.on('resize', self.resize);
    }

    // Refresh scroll state variables for use in setting fixed panel positions
    function _refreshScrollStateVars() {
      // container positions
      containerHeight = $container.outerHeight();
      containerTop = $container.offset().top;
      containerBottom = containerHeight + containerTop;

      // reset variables that may have changed
      panelHeight = $panel.outerHeight();
      panelTop = $panel.offset().top;
      panelTopParent = panelTop - containerTop;
      panelBottom = panelTop + panelHeight;

      viewportTop = $doc.scrollTop();
      viewportBottom = viewportTop + winHeight;
    }

    function _refreshLeftPos() {
      containerLeft = $container.offset().left;
      panelLeft = $panel.offset().left;
      combinedBorderLeftWidth = +$panel.css('border-left-width').replace('px','') + $container.css('border-left-width').replace('px','');
      console.log(combinedBorderLeftWidth);
      panelLeftParent = panelLeft - containerLeft - combinedBorderLeftWidth;
    }

    // Fix/unfix the panel to the bottom of the parent container
    function _setBottomPosition() {
      // stick to bottom of container
      if(panelBottom >= containerBottom) {
        $panel.css({position: 'absolute', top: 'auto', bottom: 0, left: panelLeftParent})
              .data('fixedTo', 'bottom'); // quickly track state
        return true;
      }

      // small viewport - fixed at bottom of container
      if(winHeight < panelHeight && panelBottom < viewportBottom) {
        $panel.css({position: 'fixed', top: 'auto', bottom: 0, left: panelLeft})
              .data('fixedTo', null); // quickly track state
        return true;
      }

      // big viewport - fixed at top of viewport
      if(winHeight > panelHeight && containerTop < viewportTop) {
        $panel.css({position: 'fixed', top: 0, bottom: 'auto', left: panelLeft})
              .data('fixedTo', null); // quickly track state
        return true;
      }
    }

    // Fix/unfix the panel to the top of the parent container
    function _setTopPosition() {
      // default position at top of container
      if(panelTop <= containerTop && panelTop >= viewportTop) {
        $panel.css({position: 'static', top: 'auto', bottom: 'auto', left: 'auto'})
              .data('fixedTo', 'top'); // quickly track state
        return true;
      }

      // fixed at top of viewport
      if(panelTop >= viewportTop) {
        $panel.css({position: 'fixed', top: 0, bottom: 'auto', left: panelLeft, right: 'auto'})
              .data('fixedTo', null);
        return true;
      }
    }

    // capture this for resets
    this.defaultCss = {
      position: $panel.css('position') || 'static',
      top: $panel.css('top') || 'auto',
      right: $panel.css('right') || 'auto',
      bottom: $panel.css('bottom') || 'auto',
      left: $panel.css('left') || 'auto'
    };

    this.keypress = function(e) {
      self.placeInViewport();
    };

    this.scroll = function() {
      var _scrollingDown = scrollingDown;
      scrollingDown = $doc.scrollTop() > viewportTop;
      var dirSwap = _scrollingDown !== scrollingDown;

      // reset variables that may have changed
      _refreshScrollStateVars();

      // when we switch scrolling directions we have to freeze the panel
      if(dirSwap && $panel.css('position') === 'fixed') {
        $panel.css({position: 'absolute', top: panelTopParent, bottom: 'auto', left: panelLeftParent});
        return true;
      }

      // What's the current state of the panel? Use a Data attr to share this
      // value between plugins
      var currFixedPos = $panel.data('fixedTo');

      // Perform bottom-fixing if it's not already fixed and we're scrolling down
      if(scrollingDown && currFixedPos !== 'bottom') {
        _setBottomPosition();
      }

      // Perform top-fixing if it's not already fixed and we're scrolling up
      if(!scrollingDown && currFixedPos !== 'top') {
        _setTopPosition();
      }

      return true;
    };

    this.resize = function() {
      _refreshLeftPos();
      if($panel.css('position') === 'fixed')
        $panel.css({position: 'absolute', top: panelTopParent, bottom: 'auto', left: 'auto', right: 0});
      winHeight = win.innerHeight || doc.body.clientHeight;
    };

    // Revert the panel back to static positioning (default styling)
    this.unfix = function() {
      $panel.css('position', 'static').data('fixedTo', null);
    };

    // Force place the DOM element into a correct position given the current
    // viewport (useful for on-init)
    this.placeInViewport = function() {
      _refreshScrollStateVars();

      var scrollTop = $win.scrollTop();

      // default positioning (do nothing)
      if(scrollTop < containerTop) {
        return;
      }

      // absolute bottom
      if(scrollTop + panelHeight > containerBottom) {
        $panel.css({position: 'absolute', top: 'auto', bottom: 0, left: panelLeftParent})
              .data('fixedTo', 'bottom'); // quickly track state
        return;
      }

      // fixed top
      $panel.css({position: 'fixed', top: 0, bottom: 'auto', left: panelLeft, right: 'auto'})
                .data('fixedTo', null);
    };

    this.init = function() {
      this.resize(); // trigger initial pos math
      if(containerHeight > panelHeight) {
        attachEventListeners();
      }
    };
  }

  $.fn.fixedToParent = function(action) {
    return this.each(function() {
      var instance = $(this).data('fixedToParent');

      if(instance) {
        switch(action) {
          case 'unbind':
            $doc.unbind('scroll', instance.scroll);
            $win.unbind('resize', instance.resize);
            $(this).css(instance.defaultCss);
            break;
          case 'rebind':
            $doc.unbind('scroll', instance.scroll);
            $win.unbind('resize', instance.resize);
            action = null;
            break;
          case 'unfix':
            instance.unfix();
            break;
          case 'placeInViewport':
            instance.placeInViewport();
            break;
        }
      }

      if(!action) {
        instance = new FixedToParent(this);
        $(this).data('fixedToParent', instance);
        instance.init();
      }
    });
  };

})(jQuery, window, document);
