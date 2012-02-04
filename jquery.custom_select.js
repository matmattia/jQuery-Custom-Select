/**
 * jQuery Custom Select
 * @name jquery.custom_select.js
 * @author Mattia - http://www.matriz.it
 * @version 1.0
 * @date February 2, 2012
 * @category jQuery plugin
 * @copyright (c) 2012 Mattia at Matriz.it (info@matriz.it)
 * @license MIT - http://opensource.org/licenses/mit-license.php
 * @example Visit http://www.matriz.it/projects/jquery-custom-select/ for more informations about this jQuery plugin
 */
 
 (function($) {
	var methods = {
		'disable': function() {
			var el = $(this);
			el.addClass(getOption(el, 'container_disabled_class')).data('disabled', true);
			closeSelect(el);
			var l = el.length;
			for (var i = 0; i < l; i++) {
				$($(el[i]).data('select')).attr('disabled', 'disabled');
			}
		},
		'enable': function() {
			var el = $(this);
			el.removeClass(getOption(el, 'container_disabled_class')).data('disabled', false);
			var l = el.length;
			for (var i = 0; i < l; i++) {
				$($(el[i]).data('select')).attr('disabled', '');
			}
		}
	};
	
	var instances = [];
	
	var getContainerFromSelect = function(el) {
		var containers = [];
		el = $(el);
		var l = el.length;
		for (var i = 0; i < l; i++) {
			$.merge(containers, $(instances[$(el[i]).data('instance_i')]));
		}
		return containers;
	};
	
	var getOptions = function(container) {
		return $(container).data('options');
	};
	
	var getOption = function(container, option) {
		var opts = getOptions(container);
		return opts ? opts[option] : undefined;
	};
	
	var disableSelection = function(el) {
		$(el).attr('unselectable', 'on').css({
			'-ms-user-select': 'none',
			'-moz-user-select': 'none',
			'-webkit-user-select': 'none',
			'user-select': 'none',
			'cursor': 'default'
        }).each(function() {
        	this.onselectstart = function() {
        		return false;
        	};
        });
	};
	
	var getValuesContainer = function(container) {
		var values = $(container).children('div');
		return values.length > 0 ? $(values[0]) : false;
	};
	
	var getValues = function(container) {
		var values = $(container).find('div div');
		return values.length > 0 ? $(values) : false;
	};
	
	var getSelected = function(container) {
		var selected = $(container).find('span');
		return selected.length > 0 ? $(selected[0]) : false;
	};
	
	var openSelect = function(container) {
		container = $(container);
		if (!container.data('disabled')) {
			var values = getValuesContainer(container);
			if (values) {
				closeAll();
				values.show();
				var opts = getOptions(container);
				container.addClass(opts.container_open_class).css('z-index', opts.z_index + 1).data('open', true).data('over_pos', 0);
				container.parent().css('z-index', opts.z_index + 1); //Internet Explorer lte 7 z-index bug
				opened_containers[opened_containers.length] = container;
			}
		}
	};
	
	var closeSelect = function(container) {
		var values = getValuesContainer(container);
		if (values) {
			values.hide();
			var opts = getOptions(container);
			container.removeClass(opts.container_open_class).css('z-index', opts.z_index).data('open', false);
			container.parent().css('z-index', opts.z_index); //Internet Explorer lte 7 z-index bug
		}
	};
	
	var closeAll = function() {
		var l = opened_containers.length;
		for (var i = 0; i < l; i++) {
			closeSelect(opened_containers[i]);
		}
		opened_containers = [];
	};
	
	var toggleSelect = function(container) {
		if ($(container).data('open')) {
			closeSelect(container);
		} else {
			openSelect(container);
		}
	};
	
	var selectOption = function(container, v, l, first) {
		sel = $(container.data('select'));
		if (sel.length > 0) {
			sel.val(v);
		}
		var selected = getSelected(container);
		if (selected) {
			selected.text(l);
		}
		if (!first) {
			var onChange = getOption(container, 'onChange');
			if ($.isFunction(onChange)) {
				onChange.call(this, v, container);
			}
		}
	};
	
	var resetSelect = function(container) {
		selectOption(container, null, container.data('reset').label);
	};
	
	var overOption = function(container, opt) {
		var over_class = getOption(container, 'option_over_class');
		var values = getValues(container);
		if (values) {
			values.removeClass(over_class);
			var l = values.length;
			for (var i = 0; i < l; i++) {
				if (values[i] == opt) {
					$(container).data('over_pos', i);
					break;
				}
			}
		}
		$(opt).addClass(over_class);
	};
	
	var moveOver = function(container, pos) {
		var values = getValues(container);
		if (values[pos]) {
			overOption(container, values[pos]);
			var values_container = getValuesContainer(container);
			if (values_container) {
				var cs = values_container.scrollTop();
				var ch = values_container.innerHeight();
				var v = $(values[pos]);
				var y = v.offset().top - values_container.offset().top;
				var h = v.outerHeight();
				if (y < cs) {
					values_container.scrollTop(cs + y);
				} else if (y + h > cs + ch) {
					values_container.scrollTop(y - h + ch);
				}
			}
		}
	};
	
	var opened_containers = [];
	
	$.fn.custom_select = function(opts, spec_opts) {
		if (typeof opts == 'string') {
			if (methods[opts]) {
				var args = Array.prototype.slice.call(arguments, 1);
				methods[opts].apply(getContainerFromSelect(this), args);
				
			}
		} else {
			var options = {
				'append_to': 'body',
				'container_class': 'custom_select_container',
				'container_open_class': 'open',
				'container_disabled_class': 'disabled',
				'option_value_class': 'custom_select_value',
				'options_container_class': 'custom_select_options_container',
				'option_class': 'custom_select_option',
				'option_over_class': 'over',
				'z_index': 1000,
				'onChange': null
			};
			$.extend(options, opts);
			$(this).each(function(i, select) {
				select = $(select);
				if (select.is('select')) {
					var sel_options = options;
					if (spec_opts && spec_opts[i]) {
						$.extend(sel_options, spec_opts[i]);
					}
					var pos = select.offset();
					var parent = $(sel_options.append_to);
					if (parent.css('position') == 'relative') {
						var parent_pos = parent.offset();
						pos.top -= parent_pos.top;
						pos.left -= parent_pos.left;
					}
					var container = $('<div />').addClass(sel_options.container_class).css({
						'position': 'absolute',
						'top': parseInt(pos.top),
						'left': parseInt(pos.left),
						'z-index': sel_options.z_index
					}).data('options', sel_options).data('select', select);
					disableSelection(container);
					$('<span />').text(' ').addClass(sel_options.option_value_class).css('display', 'block').click(function(e) {
						e.stopPropagation();
						toggleSelect(container);
					}).prependTo(container);
					var values_container = $('<div />').addClass(sel_options.options_container_class);
					var values = select.find('option');
					var values_l = values.length;
					for (var j = 0; j < values_l; j++) {
						var v = $(values[j]);
						var val = v.prop('value');
						var classes = sel_options.option_class;
						if (v.prop('selected')) {
							var lab = v.text();
							selectOption(container, val, lab, true);
							container.data('reset', {
								'value': val,
								'label': lab
							});
							classes += ' '+sel_options.option_over_class;
						}
						$('<div />').text(v.text()).addClass(classes).data('value', val).hover(function() {
							overOption(container, this);
						}).click(function(e) {
							e.stopPropagation();
							var v = $(this);
							selectOption(container, v.data('value'), v.text());
							closeSelect(container);
						}).appendTo(values_container);
					}
					var ii = instances.length;
					select.css('visibility', 'hidden').data('instance_i', ii);
					instances[ii] = container;
					values_container.appendTo(container);
					closeSelect(container);
					container.appendTo(parent);
					var form = select.closest('form');
					if (form.length > 0) {
						form.bind('reset', function() {
							resetSelect(container);
							closeAll();
						});
					}
				}
			});
			$(document).click(function() {
				closeAll();
			});
			$(document).keydown(function(e) {
				if (opened_containers[0]) {
					switch (e.keyCode) {
						case 13: //Enter
							var values = getValues(opened_containers[0]);
							var pos = opened_containers[0].data('over_pos');
							if (values && values[pos]) {
								var v = $(values[pos]);
								selectOption(opened_containers[0], v.data('value'), v.text());
							}
							closeSelect(opened_containers[0]);
							return false;
							break;
						case 27: //Esc
						case 46: //Del
							closeSelect(opened_containers[0]);
							break;
						case 33: //Pag. Up 
						case 36: //Home
							moveOver(opened_containers[0], 0);
							break;
						case 34: //Pag. Down 
						case 35: //End
							var values = getValues(opened_containers[0]);
							if (values) {
								moveOver(opened_containers[0], values.length - 1);
							}
							break;
						case 38: //Up
							moveOver(opened_containers[0], opened_containers[0].data('over_pos') - 1);
							break;
						case 40: //Down
							moveOver(opened_containers[0], opened_containers[0].data('over_pos') + 1);
							break;
					}
				}
			});
		}
		return this;
	};
})(jQuery);