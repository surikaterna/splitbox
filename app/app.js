var angular = require('angular');


var boxModule = angular.module('ui.box', []);

var _makeDirective = function(direction) {
	var _modeHorizontal = direction==='horizontal';
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
		link:  function(scope, element, attr) {

	var _isDragging = false;

	var splitter = element.children().eq(0);
	var one = element.children().eq(1);
	var two = element.children().eq(2);
	element.addClass(_modeHorizontal ? 'horizontal' : 'vertical');
	splitter.addClass(_modeHorizontal ? 'horizontal' : 'vertical');
	one.addClass('splitboxbox');
	two.addClass('splitboxbox');
	
	element.bind('mousemove', function(event) {
		if(!_isDragging) {
			return;
		} else {
			var bounds = element[0].getBoundingClientRect();

/*            if (pos < pane1Min) return;
    if (height - pos < pane2Min) return;
*/	
			console.log(_modeHorizontal);
			var pct = 0;
			if(_modeHorizontal){
			    var height = bounds.bottom - bounds.top;
			    var pos = event.clientY - bounds.top;
				pct = pos/height*100;
		    	splitter.css('top',pct + '%');
		    	one.css('height', pct + '%');
			    two.css('top', pct + '%');			
			} else {
			    var width = bounds.right - bounds.left;
			    var pos = event.clientX - bounds.left;
				pct = pos/width*100;
				   splitter.css('left',pct + '%');
			    one.css('width', pct + '%');
		    	two.css('left', pct + '%');			

			}
			console.log(pct + "%");
		}
	});
	splitter.bind('mousedown', function(event) {
		event.preventDefault();
		_isDragging = true;
	});
	angular.element(document).bind('mouseup', function(event) {
		_isDragging = false;
	});

//			var firstBounds = one.getBoundingClientRect();
//			console.log(one);
	var _init = function() {
		if(_modeHorizontal) {
			one.css('height', '50%')
			splitter.css('top', 50 + '%');
			two.css('top', 50 + '%');
		} else{
			splitter.css('left', 50 + '%');
			two.css('left', 50 + '%');
			one.css('width', '50%')
		}
	}
	_init();
}

	}
}


boxModule.directive('hbox', function() {
	return _makeDirective('horizontal');
});

boxModule.directive('vbox', function() {
	return _makeDirective('vertical');
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

boxModule.directive('window', function () {
      return {
		restrict: 'E',
		replace: true,
		transclude: true,
		scope: {
			orientation: '@'
		},
		template: '<div class="window"><div ng-transclude></div></div>',
		controller: function($scope) {
		},
		link:  function(scope, element, attr) {
			var splitArea = $('body').children('.splitdroparea');
			if(!splitArea.length) {
				splitArea = $('<div class="splitdroparea" style="display:none;"></div>');
				splitArea.appendTo($('body'));
				console.log("adding splitArea");
			}


			element.bind('drop', function(event) {
				console.log(event);
				console.log(event.dataTransfer);
				console.log(event.originalEvent.dataTransfer.types);
				console.log('drop');
			});
			element.bind('dragend', function(event) {
				console.log(event);
				console.log('dragend');
				splitArea.hide();
			});
			element.bind('dragenter', function(event) {
				event.stopPropagation();
				splitArea.show();
			});

			element.bind('dragleave', function(event) {
			});

			element.bind('dragover', function(event) {
				event.preventDefault();
				event.stopPropagation();
				var target = event.currentTarget;
				var bounds = target.getBoundingClientRect();				
//				console.log(bounds);
//				console.log(event.clientY);
				var height = bounds.bottom - bounds.top;
				var width = bounds.right - bounds.left;
			    var posY = event.originalEvent.clientY - bounds.top;
			    var posX = event.originalEvent.clientX - bounds.left;
				var pctY = posY/height;
				var pctX = posX/width;
//				console.log(pctX/pctY);
				//calculate slopes
				var oAD = pctX/pctY>1;
				var oCB = pctX/(1-pctY)<=1;

				var offset = element.offset();
				if(oAD) {
					if(oCB) {
							splitArea.offset({top:offset.top, left:offset.left});
							splitArea.width(width);
							splitArea.height(height/2);
					} else {
							splitArea.offset({top:offset.top, left:offset.left+width/2});
							splitArea.width(width/2);
							splitArea.height(height);
					}
				} else {
					if(oCB) {
							splitArea.offset({top:offset.top, left:offset.left});
							splitArea.width(width/2);
							splitArea.height(height);
					} else {
							splitArea.offset({top:offset.top+height/2, left:offset.left});
							splitArea.width(width);
							splitArea.height(height/2);
					}
				}
			});
		}
      };
  })	;

boxModule.directive('pane', function () {
      return {
		restrict: 'E',
		replace: true,
		transclude: true,
		scope: {
			orientation: '@'
		},
		template: '<div class="window" draggable="true"><div ng-transclude></div></div>',
		controller: function($scope) {
		},
		link:  function(scope, element, attr) {
			element.bind('dragstart', function() {
				console.log('dragstart');
				event.dataTransfer.setData('text/plain', 'Hello World!');
			});
		}
      };
  })	;

