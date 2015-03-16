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

windowController.$inject = ['$scope'];

function windowController($scope) {
	var ctrl = this;
	var panes = ctrl.panes = $scope.panes = [];
	ctrl.select = function(selectedPane) {
		console.log("select this");
		angular.forEach(panes, function(pane) {
			if(pane.active && pane !== selectedPane) {
				pane.active = false;
				pane.onDeselect();
			}
		});
		selectedPane.active = true;
		selectedPane.onSelect();
	}

	ctrl.addPane = function(pane) {
		console.log('add pane ');
		console.log(pane);
		panes.push(pane);
		ctrl.select(pane);
	}
	ctrl.removePane = function(pane) {
		var index = panes.indexOf(pane);
		if(pane.active && panes.length > 1) {
			 var newActiveIndex = index == panes.length - 1 ? index - 1 : index + 1;
			ctrl.select(panes[newActiveIndex]);
		}
		panes.splice(index, 1);
	}
}

boxModule.controller('WindowController', windowController);

boxModule.directive('window', function () {
      return {
		restrict: 'E',
		replace: true,
		transclude: true,
		require:'window',
		scope: {
			orientation: '@'
		},
		template: '<div class="window"><div class="window-header"><div ng-repeat="pane in vm.panes" draggable="true" ng-class="{active: pane.active}" ng-click="pane.select()">{{pane.caption}}</div></div><div class="window-content"><div ng-transclude></div></div></div>',
		controllerAs: 'vm',
		controller: 'WindowController',
		link:  function(scope, element, attr, windowController) {
			var splitArea = $('body').children('.splitdroparea');
			if(!splitArea.length) {
				splitArea = $('<div class="splitdroparea" style="display:none;"></div>');
				splitArea.appendTo($('body'));
				console.log("adding splitArea");
			}
			var container = element.children('.window-content');

			container.bind('drop', function(event) {
				console.log('drop');
				console.log(event);
				console.log(event.originalEvent.dataTransfer.types[0]);
				var area = getAreaFromEvent(event);
				var scp = angular.element(event.target).scope();
				console.log(scp);
				//windowController.addPane(scp);
				console.log(windowController);
				console.log('/drop');
				console.log(scope);
			});
			element.bind('dragend', function(event) {
				console.log('dragend');
				console.log(event);
				splitArea.hide();
				//successfully dropped?
				if(event.originalEvent.dataTransfer.dropEffect !== 'none') {
					console.log('dropped');
				}
			});
			container.bind('dragenter', function(event) {
				event.stopPropagation();
				splitArea.show();
			});

			container.bind('dragleave', function(event) {

			});

			container.bind('dragover', function(event) {
				event.preventDefault();
				event.stopPropagation();
				var target = event.currentTarget;
				var bounds = target.getBoundingClientRect();				
				var height = bounds.bottom - bounds.top;
				var width = bounds.right - bounds.left;

				var offset = container.offset();
				var area = getAreaFromEvent(event);
				switch(area) {
					case AREAS.TOP:
						splitArea.offset({top:offset.top, left:offset.left});
						splitArea.width(width);
						splitArea.height(height/2);
						break;	
					case AREAS.RIGHT:
						splitArea.offset({top:offset.top, left:offset.left+width/2});
						splitArea.width(width/2);
						splitArea.height(height);
						break;
					case AREAS.LEFT:
						splitArea.offset({top:offset.top, left:offset.left});
						splitArea.width(width/2);
						splitArea.height(height);
						break;
					case AREAS.BOTTOM:
						splitArea.offset({top:offset.top+height/2, left:offset.left});
						splitArea.width(width);
						splitArea.height(height/2);
						break;
				}
			});
		}
      };
  });

var AREAS = {
	TOP:'top', 
	LEFT:'left', 
	RIGHT:'right', 
	BOTTOM:'bottom'
}

function getAreaFromEvent(event) {
	var target = event.currentTarget;
	var bounds = target.getBoundingClientRect();				

    var posY = event.originalEvent.clientY - bounds.top;
    var posX = event.originalEvent.clientX - bounds.left;
    return getArea(bounds, posX, posY);
}


function getArea(bounds, posX, posY) {
	var height = bounds.bottom - bounds.top;
	var width = bounds.right - bounds.left;
	var pctY = posY/height;
	var pctX = posX/width;
	//calculate slopes
	var oAD = pctX/pctY>1;
	var oCB = pctX/(1-pctY)<=1;
	if(oAD) {
		if(oCB) {
			return AREAS.TOP;
		} else {
			return AREAS.RIGHT;
		}
	} else {
		if(oCB) {
			return AREAS.LEFT;
		} else {
			return AREAS.BOTTOM;
		}
	}
}

var paneId = 0;

boxModule.directive('pane', function () {
      return {
		restrict: 'E',
		require:'^window',
		replace: true,
		transclude: true,
		scope: {
			caption: '@',
			active: '=?',
			onSelect:'&select',
			onDeselect: '&deselect'
		},
		template: '<div id="{{id}}" class="pane" draggable="true" ng-show="active"><div ng-transclude></div></div>',
		controller: function($scope) {
		},
/*		compile: function(element, attr, transclusion) {
			return 
		},*/
		link:  function(scope, element, attr, windowCtrl) {
			scope.id = 'pane' + paneId++;
			windowCtrl.addPane(scope);
			scope.$watch('active', function(active) {
          		if (active) {
		            windowCtrl.select(scope);
    	    	}
       		});
       		scope.select = function() {
       			scope.active = true;
       		}
			scope.$on('$destroy', function() {
				windowCtrl.removePane(scope);
			});
			element.bind('dragstart', function() {
				console.log('dragstart');
				event.dataTransfer.setData('application/x-lx-pane', scope.id);
			});
		}
      };
  })	;

