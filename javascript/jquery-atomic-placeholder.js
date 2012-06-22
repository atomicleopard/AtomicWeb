/*
 * Atomic Placeholder - part of the Atomic Web collection
 * 
 * Version: 1.0
 * Download latest: https://raw.github.com/atomicleopard/AtomicWeb/master/javascript/ 
 * Copyright 2012, Atomic Leopard - www.atomicleopard.com
 * License: GNU LESSER GENERAL PUBLIC LICENSE Version 3 - http://www.gnu.org/licenses/lgpl-3.0.html
 * 
 * Acts as a polyfill/shim for the HTML5 'placeholder' feature.
 * 
 * Shows 'placeholder' text in the selected input elements when they have no content. Does nothing if native browser support exists.
 *
 * This plugin defines the $.placeholder namespace.
 *  
 * The given set of elements will have their placeholder text set to the content of the attribute specified in options.attr. When the placeholder text
 * is present, the element will have the css class defined by options.css.
 * 
 * For Example, using the default options
 * $("#myInput).placeholder();
 * <input id="myInput" placeholder="Place Holder text"/>
 * 
 * Will appear users as the following when no text is in the input:
 * <input id="myInput" class="placeholder" placeholder="Place Holder text">Place Holder text</input>
 */
(function($) {
	$.placeholder = {
		defaults : {
			css: 'placeholder',
			attr: 'placeholder'
		},
		supportedNatively: 'placeholder' in $('<input/>').get(0)
	}
	$.fn.placeholder = function(method) {
		if(!$.placeholder.supportedNatively){
			 // Method calling logic
		    if ( publicMethods[method] ) {
		      return publicMethods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
		    } else if ( typeof method === 'object' || ! method ) {
		      return publicMethods.init.apply( this, arguments );
		    } else {
		      $.error( 'Method ' +  method + ' does not exist on jQuery.placeholder' );
		    }
		}
	};
	var publicMethods = {
		init: function(options){
			options = $.extend({}, $.placeholder.defaults, options);
			
			$(this).each(function(index, el){
				var el = $(el);
				var text = el.attr(options.attr);
				if(text && text.length > 0){
					el
						.data("$.placeholder.text", text)
						.data("$.placeholder.class", options.css)
						.blur(publicMethods.apply)						
						.focus(publicMethods.clear)
						.parents("form").submit(function(){
							publicMethods.clear.apply(el, Array.prototype.slice.call(arguments, 1));
						});
					el.blur(); //initial state
				}
			});
			return this;
		},
		apply:  function(){
			$(this).each(function(index, el){
				var el= $(el);
				var text = el.data("$.placeholder.text");
				var cssClass = el.data("$.placeholder.class");
				if(el.val() == ""){
					el.addClass(cssClass);
					el.val(text);
				}
			});
			return this;
		},
		clear: function(){
			$(this).each(function(index, el){
				var el= $(el);
				var text = el.data("$.placeholder.text");
				var cssClass = el.data("$.placeholder.class");
				if(el.val() == text && el.hasClass(cssClass)){
					el.val("");
					el.removeClass(cssClass);
				}
			})
			return this;
		},
		destroy: function(){
			return this.each(function(index, el){
				var el = $(el);
				el.placeholder("clear");
				el.removeData("$.placeholder.text", null);
				el.removeData("$.placeholder.class", null);
			});
			return this;
		}
	};		
})(jQuery);