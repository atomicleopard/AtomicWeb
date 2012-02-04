/*
 * Atomic Highlight
 * 
 * Version: 0.1
 * Download: 
 * Copyright 2012, Atomic Leopard - www.atomicleopard.com
 * License: GNU LESSER GENERAL PUBLIC LICENSE Version 3 - http://www.gnu.org/licenses/lgpl-3.0.html 
 * 
 * Highlights text in a text area using rules provided through a callback function.
 * 
 * The callback function is provided to the options named 'highlight'. It receives a single a single argument,
 * which is the content of the textarea to be highlighed. It returns an array of objects defining highlighting rules.
 * Each rule object has the format:
 * {
 * 	start: <index>,
 *  end: <index>,
 *  css: { <jQuery Css rules> }
 * }
 * The rules *must* be returned in order from start to end, and blocks cannot overlap. Strange things will happen otherwise.
 * Be warned that the css rules provided may result in the highlighter failing. In general, stick to background colourings.
 * 
 * How it works:
 * Your text area will be wrapped in a div, and at the same location a new div will be located. It duplicates the text and 
 * text-style of your area, then renders underneath the text area. For this to work it has to exactly line up and produce identically
 * spaced text. This means that changing the font, line spacing, width etc
 * in the css rules you provide will effectively break this plugin.
 */
(function($){
	var span  = $("<span></span").css({
		'color': 'rgba(0,0,0,0)',
	});
    $.fn.extend({
        highlight: function(options) {
        	var defaults = {
        		highlight: function(content){
        			return [{
        					start: 0,
        					end: content.length, 
        					css: { 'background-color': 'rgba(128, 128, 255, 1)'}
        			}];
        		}
        	};
        	if(typeof(options) =="function"){
        		options = {
        			highlight: options
        		}
        	}else{
        		options = $.extend({}, defaults, options);        		
        	}
        	$.each(this, function(index, el){
        		var el = $(el);
        		// create a container allowing the highlight to be absolutely positioned
        		var container = $("<div class='atomic-highlight-container'></div>")
        			.css({
	        			'position': 'relative',
	        			'margin': '0',
	        			'padding': '0',
	        			'overflow': 'hidden',
	        			'width': el.outerWidth(true), // for vertical scrollbars
	        			'height': el.outerHeight(true) - el.css('margin-bottom'),
	        			'display': 'inline-block'
	        		});
        		
        		var highlight = $("<div class='atomic-highlight'></div>")
	        		.css({
	        			'top': 0,
	        			'left': 0,
	        			'position': 'absolute',
	        			'width': el.width(),
	        			'margin': 0,
	        			'padding-left': el.css("padding-left"),
	        			'padding-right': el.css("padding-right"),
	        			'padding-top': el.css("padding-top"),
	        			'padding-bottom': el.css("padding-bottom"),
	                    'color': 'rgba(0, 0, 0, 0)',
	                    'background-color': "rgba(0,0,0,0)",
	                    'font':  el.css('font'),
	                    'font-size':  el.css('font-size'),
	                    'font-family': el.css('font-family'),
	                    'white-space': 'pre-wrap',
	                    'word-wrap': el.css('word-wrap'),
	                    'letter-spacing': el.css('letter-spacing'),
	                    'word-spacing': el.css('word-spacing'),
	                    'line-height': el.css('line-height'),
	                    'text-transform': el.css('text-transform'),
	                    'text-indent': el.css('text-indent'),
	                    'text-shadow': el.css('text-shadow'),
	                    'text-align': el.css('text-align'),
	                    'overflow': 'hidden',
	                    'cursor': 'text' 
	        		}).click(function(){
	        			el.focus();
	        		});
        		
        		var background = $("<div class='atomic-highlight-background'/>")
	    			.css({
	        			'left': 0,
	    				'top': 0,
	        			'width': el.width(),
	        			'height': el.height(),
	        			'position': 'absolute',
	        			'margin-top': el.css('margin-top'),
	        			'margin-left': el.css('margin-left'),
	        			'margin-bottom': el.css('margin-bottom'),
	        			'margin-right': el.css('margin-right'),
	                    'background-color': el.css('background-color'),
	                    'overflow': 'hidden',
	                    'z-index': el.css('z-index'),
	                    'border': '1px solid rgba(0,0,0,0)'
	        		})
	        		.html(highlight);
        		
        		el.bind('keyup', function() {
        				var content = el.val();
        				var highlightContent = options.highlight(content);
        				highlightContent.sort(function(a, b){ return a.start - b.start; });

        				for(var i = highlightContent.length - 1; i >= 0; i--){
        					var rule = highlightContent[i];
        					var start = Math.max(0, rule.start);
        					var end = Math.min(content.length, rule.end);
        					var len = end - start;
        					var wrappedContent = content.substr(start, len);
        					var newSpan = span.clone()
        						.css(rule.css)
        						.html(wrappedContent)
        						.wrap("<div>")
        						.parent()
        						.html();
        					content = content.substr(0, start) + newSpan + content.substr(end);
        				}
        				content = content.replace(/\n/g, "<br/>");
        				highlight.html(content);
	                })
	                .scroll(function(event){
	                	highlight.css({
	                		'left': -el.scrollLeft(),
	                		'top': -el.scrollTop()
	                	});
	                })
	                .resize(function(){
        				highlight.css('width', el.width());
        			})	                
	                .css({
	                	'background-color': 'rgba(0,0,0,0)',
	                	'z-index': el.css('zindex')+1,
	        			'position': 'relative'
	                })
	                .wrap(container)
	                .before(background)
	                .keyup();
        	});
        }
    });
})(jQuery);
