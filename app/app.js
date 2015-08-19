var angular = require('angular');


var boxModule = angular.module('ui.box', []);

var _makeDirective = function(direction) {
	var _modeHorizontal = direction==='horizontal';
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		scope: {},
		template: '<div class="splitbox"><div class="splitter ng-resize"><div> </div></div><div lx-transclude-replace/></div>',
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


boxModule.directive('lxTranscludeReplace', ['$log', function ($log) {
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
              transclude($element.scope(), function (clone) {
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

boxModule.directive('lxTransclude', ['$log', function ($log) {
    "use strict";
    return {
        "restrict": "A",
        "link": function (scope, element, attrs, nullCtrl, transcludeFn) {
            var elScope = element.scope();

            transcludeFn(elScope, function (clone) {
                element.append(clone);
            });
        }
    };
}]);

windowController.$inject = ['$scope'];

function windowController($scope) {
	var ctrl = this;
	var panes = ctrl.panes = $scope.panes = [];
	ctrl.select = function(selectedPane) {
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
		var index = panes.indexOf(pane);
		panes.splice(index, 1);
		if(panes.length > 0) {
			ctrl.select(panes[0]);
		}
	}
	ctrl.createPane = function(caption, content) {
		
	}
}

boxModule.controller('WindowController', windowController);

//

boxModule.directive('window', function ($compile) {
      return {
		restrict: 'E',
		replace: true,
		transclude: true,
		require:'window',
		scope: {
			
		},
		template: '<div class="window"><div class="window-header" lx-transclude></div><div class="window-content"><div ng-repeat="pane in panes" ng-show="pane.active" pane-content-transclude="pane" id="{{id}}-content"></div></div>',
		controllerAs: 'vm',
		controller: 'WindowController',
		link:  function(scope, element, attr, windowController) {
			var self = this;
			function createPane(caption) {
					var newPane = $('<pane caption="'+caption+'"></pane>');
					var childScope = scope.$new(true);
					$compile(newPane)(childScope, undefined, {window: windowC});					
					return newPane;
			}

			var splitArea = $('body').children('.splitdroparea');
			if(!splitArea.length) {
				splitArea = $('<div class="splitdroparea" style="display:none;"></div>');
				splitArea.appendTo($('body'));
			}
			var headerContainer = element.children('.window-header');
			var container = element.children('.window-content');

			container.bind('drop', function(event) {
				var paneId = event.originalEvent.dataTransfer.getData('application/x-lx-window-pane');
				var area = getAreaFromEvent(event);
				var sourcePane = $('#'+ paneId);
				var sourceContentPane = $('#'+ paneId+"-content");

				var scp = angular.element(sourceContentPane).scope().pane;
				var newPane = angular.element('<pane caption="' + scp.caption + '"></pane>');
				
				newPane.append(sourceContentPane.contents());
				newPane.appendTo(headerContainer);
				$compile(newPane)(scope.$new(true), undefined, {window:windowController});
				scp.$destroy();
				sourcePane.remove();
				event.stopPropagation();
				event.preventDefault();
				splitArea.hide();
			});
			element.bind('dragend', function(event) {
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
			onSelect: '&select',
			onDeselect: '&deselect'
		},
		template: '<div id="{{id}}" ng-class="{active: active}"><a href draggable="true" ng-click="select()" pane-caption-transclude>{{caption}}</a></div>',
		controller: function($scope) {
		},
		compile: function(element, attrs, transclude) {

			return function postLink(scope, element, attr, windowCtrl) {
				scope.id = 'wnd-pane' + paneId++;
				scope.active = false;
				windowCtrl.addPane(scope);
				scope.$watch('active', function(active) {
	          		if (active) {
			            windowCtrl.select(scope);
	    	    	}
	       		});
	       		scope.select = function() {
	       			scope.active = true;
	//       			windowCtrl.select(scope);
	       		}
	       		scope.remove = function() {
					windowCtrl.removePane(scope);
	       		}

				element.on('$destroy', function() {
					scope.remove();
					scope.$destroy();
				});
				element.bind('dragstart', function(event) {
					event.originalEvent.dataTransfer.setData('application/x-lx-window-pane', scope.id);
  					event.originalEvent.dataTransfer.setData('Text', 'gosu');
  				});
				scope.$transcludeFn = transclude;			
			}
		}
      };
  });

boxModule.directive('paneCaptionTransclude', function() {
  return {
    restrict: 'A',
    require: '^pane',
    link: function(scope, elm, attrs, tabCtrl) {
      scope.$watch('captionElement', function updateHeadingElement(caption) {
        if (caption) {
          elm.html('');
          elm.append(caption);
        }
      });
    }
  };
});

boxModule.directive('paneContentTransclude', function() {
  return {
    restrict: 'A',
    require: '^window',
    link: function(scope, elm, attrs) {
      var pane = scope.$eval(attrs.paneContentTransclude);
      scope.id = pane.id;

      //Now our tab is ready to be transcluded: both the tab heading area
      //and the tab content area are loaded.  Transclude 'em both.
      pane.$transcludeFn(pane.$parent, function(contents) {
        angular.forEach(contents, function(node) {
          if (isPaneCaption(node)) {
            //Let tabHeadingTransclude know.
            pane.captionElement = node;
          } else {
            elm.append(node);
          }
        });
      });
    }
  };
  function isPaneCaption(node) {
    return node.tagName &&  (
      node.hasAttribute('pane-caption') ||
      node.hasAttribute('data-pane-caption') ||
      node.tagName.toLowerCase() === 'pane-caption' ||
      node.tagName.toLowerCase() === 'data-pane-caption'
    );
  }
});
