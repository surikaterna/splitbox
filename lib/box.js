var angular = require('angular');
var boxModule = angular.module('ui.box');
require('./transclude-replace');


var _makeDirective = function(direction, $rootScope) {
	var _modeHorizontal = direction==='horizontal';
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		template: '<div class="splitbox"><div class="splitter"><div> </div></div><div ui-transclude-replace/></div>',
		link:  function(scope, element, attr) {

	$rootScope.$on('ui.box.redraw', function() {
		_init();
	});


	var _isDragging = false;

	var splitter = element.children().eq(0);
	var splitterSize = attr.splitterSize || 1;
	var oneMinSize = attr.oneMinSize || 0;
	var twoMinSize = attr.twoMinSize || 0;
	var lastPct = 50;

	var one = element.children().eq(1);
	var two = element.children().eq(2);
	element.addClass(_modeHorizontal ? 'horizontal' : 'vertical');
	splitter.addClass(_modeHorizontal ? 'horizontal' : 'vertical');

	element.bind('mousemove', function(event) {
		if(!_isDragging) {
			return;
		} else {
			var bounds = element[0].getBoundingClientRect();


			if(_modeHorizontal) {
				_tick(event.clientY);
			}
			else {
				_tick(event.clientX);
			}
		}
	});

	splitter.bind('mousedown', function(event) {
		event.preventDefault();
		_isDragging = true;
	});
	angular.element(document).bind('mouseup', function(event) {
		_isDragging = false;
		$rootScope.$broadcast('ui.box.resized', {});
	});


	function _tick(mousePos) {
		element.children().eq(1).addClass('splitboxbox');
		element.children().eq(2).addClass('splitboxbox');

		var pct = 0;
		var bounds = element[0].getBoundingClientRect();
		if(_modeHorizontal){
		    var height = bounds.bottom - bounds.top;
		    var pos = mousePos - bounds.top;
            if (pos < oneMinSize) return;
		    if (height - pos < twoMinSize) return;

			lastPct = pct = pos/height*100;
	    	splitter.css('top',pct + '%');
	    	element.children().eq(1).css('top', '');
	    	element.children().eq(1).css('height', pct + '%');
	    	element.children().eq(2).css('height', '');
		    element.children().eq(2).css('top', pct + '%');
		    element.children().css('width','100%');
		    element.children().css('left','0%');
		} else {
		    var width = bounds.right - bounds.left;
		    var pos = mousePos - bounds.left;
            if (pos < oneMinSize) {
            	return;
            }
		    if (width - pos < twoMinSize) {
		    	return;
		    }
			lastPct = pct = pos/width*100;
		   	splitter.css('left',pct + '%');
		    element.children().eq(1).css('left', '');
		    element.children().eq(1).css('width', pct + '%');
		    element.children().eq(2).css('width', '');
	    	element.children().eq(2).css('left', pct + '%');
		    element.children().css('height','100%');
		    element.children().css('top','0%');
		}
	}

//			var firstBounds = one.getBoundingClientRect();
	function _init() {
		var bounds = element[0].getBoundingClientRect();
		if(_modeHorizontal) {
			var height = (bounds.bottom - bounds.top);
			var pos = height*lastPct/100;
			if(height > 0 ) {
				_tick(pos + bounds.top);
			}
		} else{
			var width = (bounds.right - bounds.left);
			var pos = width*lastPct/100;
			if(width > 0) {
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
