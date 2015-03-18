var angular = require('angular');


var boxModule = angular.module('ui.box', []);

var _makeDirective = function(direction) {
	var _modeHorizontal = direction==='horizontal';
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		scope: {},
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
		panes.push(pane);
		if(panes.length === 1) {
			ctrl.select(pane);
		}
	}
	ctrl.removePane = function(pane) {
		console.log('REMOVE PANE');
		console.log(pane);
		var index = panes.indexOf(pane);
		if(pane.active && panes.length > 1) {
			 var newActiveIndex = index == panes.length - 1 ? index - 1 : index + 1;
			ctrl.select(panes[newActiveIndex]);
		}
		panes.splice(index, 1);
	}
}

boxModule.controller('WindowController', windowController);

boxModule.directive('window', function ($compile) {
      return {
		restrict: 'E',
		replace: true,
		transclude: true,
		require:'window',
		scope: {
			
		},
		template: '<div class="window"><div class="window-header"><div ng-repeat="pane in vm.panes" ng-class="{active: pane.active}" ng-click="pane.select()">{{pane.caption}}</div></div><div class="window-content" ng-transclude></div></div>',
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
				var paneId = event.originalEvent.dataTransfer.getData('application/x-lx-window-pane');
				console.log('*** Dropped Pane: ' + paneId);
				/*for(var i=0;i<event.originalEvent.dataTransfer.types.length;i++) {
					var type = event.originalEvent.dataTransfer.types[i];
					console.log(type + '=');
					console.log(event.originalEvent.dataTransfer.getData(type));
				}*/
				var area = getAreaFromEvent(event);
				var sourcePane = $('#'+ paneId);
				console.log('source pane length ' + sourcePane.length);
				var scp = angular.element(sourcePane).scope();
				console.log(scp);
				scp = scp.$$childHead
				console.log(scp);
				console.log(scope);
				var newPane = $('<pane caption="' + scp.caption + '"></pane>');
				$compile(newPane)(scope, undefined, {window: windowController});
				
				console.log("new:")
				console.log(newPane);
				console.log("source:")
				console.log(sourcePane);
				//newPane.empty();
				//sourcePane.children().appendTo(newPane);
				//newPane.appendTo(this);
				sourcePane.appendTo(this);
				scp.remove();

//				scope.$apply(function() {
//					scp.remove();
					console.log(sourcePane);
//					sourcePane.remove();
					console.log('!!!REMOVED');
//					windowController.addPane(scp);
//				});
				console.log(scp);
				console.log(area);
				console.log(windowController);
				console.log('/drop');
				console.log(scope);
				event.stopPropagation();
				event.preventDefault();
				splitArea.hide();
			});
			element.bind('dragend', function(event) {
				console.log('dragend');
				console.log(event);
				splitArea.hide();
				//successfully dropped?
				if(event.originalEvent.dataTransfer.dropEffect !== 'none') {
					console.log('dropped successfully');
				}
			});
			container.bind('dragenter', function(event) {
				for(var i=0;i<event.originalEvent.dataTransfer.types.length;i++) {
					var type = event.originalEvent.dataTransfer.types[i];
					if(type==='application/x-lx-window-pane') {
						event.stopPropagation();
						splitArea.show();
						return;
					} 
				}
			});

			container.bind('dragleave', function(event) {

			});

			container.bind('dragover', function(event) {
				var found = false;
				for(var i=0;i<event.originalEvent.dataTransfer.types.length;i++) {
					var type = event.originalEvent.dataTransfer.types[i];
					if(type==='application/x-lx-window-pane') {
						found = true;
						break;
					} 		
				}
				if(!found) {
					return;
				}
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
			var ctrl = windowCtrl;
			scope.id = 'wnd-pane' + paneId++;
			console.log('creating pane: ' + scope.id);
			windowCtrl.addPane(scope);
			scope.$watch('active', function(active) {
          		if (active) {
		            ctrl.select(scope);
    	    	}
       		});
       		scope.select = function() {
       			scope.active = true;
       		}
       		scope.remove = function() {
				ctrl.removePane(scope);
       		}

       		scope.moveTo = function(newController) {
       			scope.remove();
       			ctrl = newController;
       			newController.addPane(scope);
       		}

			scope.$on('$destroy', function() {
				console.log('destroying: ' + scope.id);
				scope.remove();
			});
			element.bind('dragstart', function() {
				console.log('dragstart');
				//event.dataTransfer.setData('application/x-lx-window-pane', JSON.stringify({pane: scope.id, browserWindow:'master'}));
				event.dataTransfer.setData('application/x-lx-window-pane', scope.id);
			});
		}
      };
  })	;

