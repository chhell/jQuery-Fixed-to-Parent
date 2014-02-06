(function($) {

    function FixedToParent(elem) {

      var self = this;

      // nodes
      var $win = $(window);
      var $doc = $(document);
      var $panel = $(elem);
      var $container = $panel.parent();

      // viewport positions
      var winHeight = window.innerHeight || document.body.clientHeight;
      var viewportTop = $doc.scrollTop();
      var viewportBottom = viewportTop + winHeight;

      // container positions
      var containerHeight = $container.outerHeight();
      var containerTop = $container.offset().top;
      var containerBottom = containerHeight + containerTop;
      var containerLeft = $container.offset().left;

      // panel positions
      var panelHeight = $panel.outerHeight();
      var panelTop = containerTop;
      var panelBottom = panelTop + panelHeight;
      var panelLeft = $panel.offset().left;
      var panelTopParent = panelTop - containerTop;
      var panelLeftParent = panelLeft - containerLeft;

      // helper variables
      var scrollingDown = true;

      this.scroll = function() {
        var _scrollingDown = scrollingDown;
        scrollingDown = $doc.scrollTop() > viewportTop;
        var dirSwap = _scrollingDown !== scrollingDown;

        // reset variables that may have changed
        panelTop = $panel.offset().top;
        panelTopParent = panelTop - containerTop;
        panelBottom = panelTop + panelHeight;
        viewportTop = $doc.scrollTop();
        viewportBottom = viewportTop + winHeight;

        // when we switch scrolling directions we have to freeze the panel
        if(dirSwap && $panel.css('position') === 'fixed') {
          $panel.css({position: 'absolute', top: panelTopParent, bottom: 'auto', left: panelLeftParent});
          return true;
        }

        // What's the current state of the panel? Use a Data attr to share this
        // value between plugins
        var currFixedPos = $panel.data('fixedToParent');

        // scrolling down
        if(scrollingDown && currFixedPos !== 'bottom') {
          // fixed at bottom
          if(panelBottom >= containerBottom) {
            $panel.css({position: 'absolute', top: 'auto', bottom: 0, left: panelLeftParent})
                  .data('fixedToParent', 'bottom'); // quickly track state
            return true;
          }

          // small viewport - absolute at bottom of container
          if(winHeight < panelHeight && panelBottom < viewportBottom) {
            $panel.css({position: 'fixed', top: 'auto', bottom: 0, left: panelLeft})
                  .data('fixedToParent', false); // quickly track state
            return true;
          }

          // big viewport - fixed at top of viewport
          if(winHeight > panelHeight && containerTop < viewportTop) {
            $panel.css({position: 'fixed', top: 0, bottom: 'auto', left: panelLeft})
                  .data('fixedToParent', false); // quickly track state
            return true;
          }

        }

        // scrolling up
        if(!scrollingDown && currFixedPos !== 'top') {
          // default position
          if(panelTop <= containerTop && panelTop >= viewportTop) {
            $panel.css({position: 'static', top: 'auto', bottom: 'auto', left: 'auto'})
                  .data('fixedToParent', 'top'); // quickly track state
            return true;
          }

          // fixed at top of viewport
          if(panelTop > viewportTop) {
            $panel.css({position: 'fixed', top: 0, bottom: 'auto', left: panelLeft, right: 'auto'})
                  .data('fixedToParent', false);
            return true;
          }

        }
      };

      this.resize = function() {
        if($panel.css('position') === 'fixed')
          $panel.css({position: 'absolute', top: panelTopParent, bottom: 'auto', left: 'auto', right: 0});
        winHeight = window.innerHeight || document.body.clientHeight;
        panelLeft = $panel.offset().left;
      };

      this.init = function() {
        if(containerHeight > panelHeight) {
          $doc.on('scroll', self.scroll);
          $win.on('resize', self.resize);
        }
      };
    }

    $.fn.fixedToParent = function(action) {
      return this.each(function() {
        var instance = $(this).data('fixedToParent');

        if(instance && action === 'unbind') {
          $(document).unbind('scroll', instance.scroll);
          $(window).unbind('resize', instance.resize);
        }

        if(action === 'rebind') {
          $(document).unbind('scroll', instance.scroll);
          $(window).unbind('resize', instance.resize);
          action = undefined;
        }

        if(action === undefined) {
          instance = new FixedToParent(this);
          $(this).data('fixedToParent', instance);
          instance.init();
        }
      });
    };

  })(jQuery);