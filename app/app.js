var angular = require('angular');


var boxModule = angular.module('ui.box', []);

boxModule.directive('hbox', function() {
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		scope: {
			orientation: '@'
		},
		template: '<div class="splitbox"><div class="splitter ng-resize"><div> </div></div><div ng-transclude-replace/></div>',
		controller: function($scope) {
		},
		link: function(scope, element, attr) {
			var _isDragging = false;
			var splitter = element.children().eq(0);
			var one = element.children().eq(1);
			var two = element.children().eq(2);
			element.addClass('horizontal');
			one.addClass('pane');
			two.addClass('pane');
			element.bind('mousemove', function(event) {
				if(!_isDragging) {
					return;
				} else {
					var bounds = element[0].getBoundingClientRect();
            var height = bounds.bottom - bounds.top;
            pos = event.clientY - bounds.top;

/*            if (pos < pane1Min) return;
            if (height - pos < pane2Min) return;
*/
            splitter.css('top', pos + 'px');
            one.css('height', pos + 'px');
            two.css('top', pos + 'px');			
				}

			});
			splitter.bind('mousedown', function(event) {
				event.preventDefault();
				_isDragging = true;
			});
			angular.element(document).bind('mouseup', function(event) {
				_isDragging = false;
			});
		}

	}
});

boxModule.directive('ngTranscludeReplace', ['$log', function ($log) {
              return {
                  terminal: true,
                  restrict: 'EA',

                  link: function ($scope, $element, $attr, ctrl, transclude) {
                      if (!transclude) {
                          $log.error('orphan',
                                     'Illegal use of ngTranscludeReplace directive in the template! ' +
                                     'No parent directive that requires a transclusion found. ');
                          return;
                      }
                      transclude(function (clone) {
                          if (clone.length) {
                              $element.replaceWith(clone);
                          }
                          else {
                              $element.remove();
                          }
                      });
                  }
              };
          }]);


