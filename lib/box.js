var angular = require('angular');
var boxModule = angular.module('ui.box');
require('./transclude-replace');


var _makeDirective = function(direction, $rootScope) {
  var _modeHorizontal = direction === 'horizontal';
  return {
    restrict: 'E',
    replace: true,
    transclude: true,
    template: ' \
    <div class="splitbox"> \
      <div class="splitter"> \
        <div class="splitter-mouse-trap"></div> \
      </div> \
      <div ui-transclude-replace/> \
    </div>',
    link: function(scope, element, attr) {
      $rootScope.$on('ui.box.redraw', function() {
        _init();
      });

      function persistSize(name, pct) {
        var layout = JSON.parse(localStorage.getItem('splitbox.layout')) || {}
        layout[name] = pct
        localStorage.setItem('splitbox.layout', JSON.stringify(layout))
      }

      var name = attr.name
      if (!name) throw new Error('name Attribute is mandatory for splitbox\'s hbox and vbox tags')

      var _isDragging = false;


      var splitter = element.children().eq(0);
      var one = element.children().eq(1);
      var two = element.children().eq(2);

      var oneMinSize = attr.oneMinSize || 0;
      var twoMinSize = attr.twoMinSize || 0;
      var layout = JSON.parse(localStorage.getItem('splitbox.layout')) || {}
      var lastPct = layout[name] || attr.oneSize || 50;
      persistSize(name, lastPct)


      element.addClass(_modeHorizontal ? 'horizontal' : 'vertical');
      splitter.addClass(_modeHorizontal ? 'horizontal' : 'vertical');

      element.bind('mousemove', function(event) {
        if (_isDragging) {
          if (_modeHorizontal) {
            _tick(event.clientY);
          } else {
            _tick(event.clientX);
          }
        }
      });

      splitter.bind('mousedown', function(event) {
        event.preventDefault();
        _isDragging = true;
      });

      angular.element(document).bind('mouseup', function() {
        if (_isDragging) {
          _isDragging = false;
          $rootScope.$broadcast('ui.box.resized', {});
          persistSize(name, lastPct)
        }
      });


      function _tick(mousePos) {
        one.addClass('splitboxbox');
        two.addClass('splitboxbox');
        var pos = null;
        var pct = 0;
        var bounds = element[0].getBoundingClientRect();
        if (_modeHorizontal) {
          var height = bounds.bottom - bounds.top;
          pos = mousePos - bounds.top;
          if (pos < oneMinSize) return;
          if (height - pos < twoMinSize) return;

          lastPct = pct = pos / height * 100;
          splitter.css('top', pct + '%');
          one.css('top', '');
          one.css('height', pct + '%');
          two.css('height', (100 - pct) + '%');
          two.css('top', pct + '%');
          element.children().css('width', '100%');
          element.children().css('left', '0%');
        } else {
          var width = bounds.right - bounds.left;
          pos = mousePos - bounds.left;
          if (pos < oneMinSize) {
            return;
          }
          if (width - pos < twoMinSize) {
            return;
          }
          lastPct = pct = pos / width * 100;
          splitter.css('left', pct + '%');
          one.css('left', '');
          one.css('width', pct + '%');
          two.css('width', (100 - pct) + '%');
          two.css('left', pct + '%');
          element.children().css('height', '100%');
          element.children().css('top', '0%');
        }
      }

      // var firstBounds = one.getBoundingClientRect();
      function _init() {
        var bounds = element[0].getBoundingClientRect();
        var pos;
        if (_modeHorizontal) {
          var height = (bounds.bottom - bounds.top);
          pos = height * lastPct / 100;
          if (height > 0) {
            _tick(pos + bounds.top);
          }
        } else {
          var width = (bounds.right - bounds.left);
          pos = width * lastPct / 100;
          if (width > 0) {
            _tick(pos + bounds.left);
          }
        }
      }
      _init();
    }

  }
}

boxModule.directive('hbox', function($rootScope) {
  return _makeDirective('horizontal', $rootScope);
});

boxModule.directive('vbox', function($rootScope) {
  return _makeDirective('vertical', $rootScope);
});
