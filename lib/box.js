var angular = require('angular');
var boxModule = angular.module('ui.box');
require('./transclude-replace');

var _makeDirective = function(direction) {
	var _modeHorizontal = direction==='horizontal';
	return {
		restrict: 'E',
		replace: true,
		transclude: true,
		template: '<div class="splitbox"><div class="splitter"><div> </div></div><div ui-transclude-replace/></div>',
		link:  function(scope, element, attr) {
	var _isDragging = false;

	var splitter = element.children().eq(0);
	var splitterSize = attr.splitterSize || 1;
	var oneMinSize = attr.oneMinSize || 1;
	var twoMinSize = attr.twoMinSize || 1;

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
	});

	function _tick(mousePos) {
		var pct = 0;
		var bounds = element[0].getBoundingClientRect();

		if(_modeHorizontal){
		    var height = bounds.bottom - bounds.top;
		    var pos = mousePos - bounds.top;
            if (pos < oneMinSize) return;
		    if (height - pos < twoMinSize) return;

			pct = pos/height*100;
	    	splitter.css('top',pct + '%');
	    	one.css('height', pct + '%');
		    two.css('top', pct + '%');			
		} else {
		    var width = bounds.right - bounds.left;
		    var pos = mousePos - bounds.left;
            if (pos < oneMinSize) return;
		    if (width - pos < twoMinSize) return;

			pct = pos/width*100;
		   splitter.css('left',pct + '%');
		    one.css('width', pct + '%');
	    	two.css('left', pct + '%');			

		}
	}

//			var firstBounds = one.getBoundingClientRect();
	var _init = function() {
		var bounds = element[0].getBoundingClientRect();		
		if(_modeHorizontal) {
			_tick((bounds.bottom - bounds.top)/2);
		} else{
			_tick((bounds.right - bounds.top)/2);
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