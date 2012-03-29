/*
 * Atomic Highlight - part of the Atomic Web collection
 * 
 * Version: 0.5
 * Download latest: https://raw.github.com/atomicleopard/AtomicWeb/master/javascript/ 
 * Copyright 2012, Atomic Leopard - www.atomicleopard.com
 * License: GNU LESSER GENERAL PUBLIC LICENSE Version 3 - http://www.gnu.org/licenses/lgpl-3.0.html 
 * 
 * Highlights text in a text area using rules provided through a callback function.
 * 
 * The callback function is provided to the options named 'highlight'. It receives a single a single argument,
 * which is the content of the textarea to be highlighed. It returns an array of objects defining highlighting rules.
 * Each rule object has the format:
 * {
 *  start: <index>,
 *  end: <index>,
 *  css: { <jQuery Css rules> },
 *  class: <class names>
 * }
 * 
 * 'css' and 'class' are both optional, the classes provided will be applied to the highlighting elements, and the css properties will
 * be directly applied to the highlight elements afterwards.
 *  
 * Blocks defined by start-end cannot overlap. Strange things will happen if they do.
 * Be warned that although the css argument will receive the full set of css arguments 
 * which jQuery can apply, the css rules provided may result in the highlighter failing. 
 * In general, stick to the background css values, background, background-color and background-image.
 * See below for more detail
 * 
 * How it works:
 * Your text area will be wrapped in a div, and at the same location a new div will be located. It duplicates the text and 
 * text-style of your area, then renders underneath the text area. For this to work it has to exactly line up and produce identically
 * spaced text. This means that changing the font, line spacing, width etc
 * in the css rules you provide will effectively break this plugin.
 * 
 * Known issues:
 * Does not work with horizontal scrolling. 
 * Chrome: Whitespace on your textarea and the underlying highlight is set to 'pre'. Don't worry, this affects the layout but not the 
 * visual appearance, see: http://www.w3schools.com/cssref/pr_text_white-space.asp
 * Firefox: Dashes (the minus symbol) have odd line breaking rules do do with whether they're part of a word or not. To overcome 
 * differences in how this is applied in a textarea vs spans, hyphens are replaced with spans of the same size. This *appears* to give
 * the correct behaviour in the FF versions I tested.
 * 
 * Options:
 * debug - set to true if you're having issues getting the output to look correct. This will highlight the normally hidden text 
 * 			that shows the highlighting
 * nudgeRight - this value moves the highlighting region this far right. Useful if you're having alignment woes, negative numbers allowed
 * nudgeDown - this value moves the highlighting region this far down. Useful if you're having alignment woes, negative numbers allowed
 */
(function($){
	var span  = $("<span/>");
	
	var makeSpan = function(content, cssClass, styles){
		return span
			.clone()
			.html(content)
			.addClass(cssClass)
			.css(styles);
	};
	var escapeHtml = function(content){
		content = content.replace(/"/g, "&quot;");
		content = content.replace(/</g, "&lt;");
		content = content.replace(/>/g, "&gt;");
		return content;
	};
	var calculateScrollBarWidth = function(){ // how wide are your scrollbars in pixels?
		var div = $('<div style="width:50px;height:50px;overflow:scroll;position:absolute;"><div style="height:100px;"></div>'); 
	    $('body').append(div); 
	    var w1 = div.innerWidth();
	    var w2 = $('div', div).innerWidth();
	    $(div).remove();
	    return w1 - w2;
	};
	var hasScrollBar = function(el){
		return el.get(0).scrollWidth < el.width();
	};
	
    $.fn.extend({
        highlight: function(options) {
        	var defaults = {
        		highlight: function(content){
        			return [{
        					start: 0,
        					end: content.length, 
        					css: { 'background-color': 'rgba(128, 128, 255, 1)'}
        			}];
        		},
        		debug: false,
        		nudgeRight: 0,
        		nudgeDown: 0
        	};

        	options = $.extend({}, defaults, typeof(options) =="function" ? { highlight: options } : options);
		    var scrollbarWidth = calculateScrollBarWidth();
		    var normalSpanCss = options.debug ? {'background-color': '#EEF', 'color':'rgb(255,0,0)'} : {};
    		var spanStringStart = makeSpan("", "", normalSpanCss).appendTo($("<div/>")).html().replace(/<\/span>/, "");
    		    
        	$.each(this, function(index, el){
        		var el = $(el);
        		// In webkit, we use pre white-space for correct wrapping 
        		var whiteSpace = $.browser.webkit ? 'pre' : el.css('white-space');
        		// In firefox we get weird clearing behaviour with dashes - measure the width of a dash so we can work around this
        		var dashSpan = $("<span>-</span>").css($.extend({}, el.css, {'position': 'fixed', 'top': -100})).appendTo($("body"));
        		var dashWidth = dashSpan.innerWidth();
        		dashSpan.remove();        		
 	        	var position = el.css('position');	
 	        	var marginLeft = el.css('margin-left').replace(/px/, "");
 	        	var marginTop = el.css('margin-top').replace(/px/, "");
 	        	
        		var highlight = $("<div class='atomic-highlight'></div>")
	        		.css({
						'position': 'relative',
						'margin': 0,
						'padding': 0,
						'display': 'inline-block',
						'color': 'rgba(0, 0, 0, 0)',
						'background-color': "rgba(0,0,0,0)",
						'box-sizing': el.css('box-sizing'),
						'font':  el.css('font'),
						'font-size':  el.css('font-size'),
						'font-family': el.css('font-family'),
						'white-space': whiteSpace,
						'word-wrap': el.css('word-wrap'),
						'letter-spacing': el.css('letter-spacing'),
						'word-spacing': el.css('word-spacing'),
						'line-height': el.css('line-height'),
						'text-transform': el.css('text-transform'),
						'text-indent': el.css('text-indent'),
						'text-shadow': el.css('text-shadow'),
						'text-align': el.css('text-align'),
						'z-index': el.css('z-index'),
						'cursor': 'text'
	        		}).click(function(){
	        			el.focus();
	        		});
        		
        		        		
        		var background = $("<div class='atomic-highlight-background'/>")
	    			.css({
						'left': el.offset().left - marginLeft + options.nudgeRight,
						'top': el.offset().top - marginTop + options.nudgeDown,
						'position': 'absolute',
						'margin-top': el.css('margin-top'),
						'margin-left': el.css('margin-left'),
						'margin-bottom': el.css('margin-bottom'),
						'margin-right': el.css('margin-right'),
						'padding-left': el.css("padding-left"),
						'padding-right': el.css("padding-right"),
						'padding-top': el.css("padding-top"),
						'padding-bottom': el.css("padding-bottom"),
						'background-color': el.css('background-color'),
						'border': el.css('border'),
						'overflow': 'hidden',
						'border-bottom-style': el.css('border-bottom-style'),
						'border-bottom-width': el.css('border-bottom-width'),
						'border-left-style': el.css('border-left-style'),
						'border-left-width': el.css('border-left-width'),
						'border-right-style': el.css('border-right-style'),
						'border-right-width': el.css('border-right-width'),
						'border-top-style': el.css('border-top-style'),
						'border-top-width': el.css('border-top-width'),
						'border-bottom-color': 'transparent',
						'border-left-color': 'transparent',
						'border-right-color': 'transparent',
						'border-top-color': 'transparent',
						'box-shadow': el.css('box-shadow'),
						'z-index': el.css('z-index')
	        		})
	        		.html(highlight);
        		
        		el.bind('keyup change', function() {
        				var content = el.get(0).value;
        				var highlightContent = options.highlight(content);
        				highlightContent.sort(function(a, b){ return a.start - b.start; });
        				
        				var spans = [];
        				var last = content.length;
        				for(var i = highlightContent.length - 1; i >= 0; i--){
        					var rule = highlightContent[i];
        					var start = Math.max(0, rule.start);
        					var end = Math.min(content.length, rule.end);
        					var len = end - start;
        					var normalContent = escapeHtml(content.substr(end, last - end));
        					if(normalContent.length > 0){
        						spans.push(makeSpan(normalContent, "", normalSpanCss));        						
        					}
        					if(len > 0){
        						var highlightedContent = escapeHtml(content.substr(start, len));
        						spans.push(makeSpan(highlightedContent, rule.class, rule.css));        						
        					}
        					last = start;
        				}
        				if(last > 0){
        					var normalSpan = escapeHtml(content.substr(0, last));
        					spans.push(makeSpan(normalSpan, "", normalSpanCss));
        				}
        				highlight.html("");
        				for(var spanIndex = spans.length - 1; spanIndex >= 0; spanIndex--){
        					var appendSpan = spans[spanIndex];
        					var spanHtml = appendSpan.html(); 
        					if(spanHtml.indexOf("-") > -1){ // post process dashes out to resolve inconsistent line breaking behaviour
        						appendSpan.html(spanHtml.replace(/-/g, "<span style='margin-left:" + dashWidth +"px'></span>"));
        						spanHtml = appendSpan.html(); 
        					}
        					if(spanHtml.indexOf("\n") > -1){ // post process newlines
        						appendSpan.html(spanHtml.replace(/\n/g, "</span><br/>"+spanStringStart));
        					}
        					highlight.append(appendSpan);
        				}
	                })
	                .scroll(function(event){
	                	highlight.css({
	                		'left': -el.scrollLeft(),
	                		'top': -el.scrollTop()
	                	});
        				highlight.width(el.width() - (hasScrollBar(el) ? scrollbarWidth : 0));
        				highlight.height(el.height());
	                })
	                .resize(function(){
        				highlight.width(el.width() - (hasScrollBar(el) ? scrollbarWidth : 0));
        				highlight.height(el.height());
        				background.width(el.width());
        				background.height(el.height());
        			})	                
	                .css({
	                	'white-space': whiteSpace,
	                	'background-color': 'rgba(0,0,0,0)',
	                	'z-index': el.css('zindex')+1,
	                	'position': position == 'static' ? 'relative' : position
	                })
	                .keyup()
	                .resize();
        		
        		if(options.debug){
        			el.css({'color': 'rgba(0,0,0,0.3)'});
        		}
        		
        		$("body").append(background);
        	});
        }
    });
})(jQuery);