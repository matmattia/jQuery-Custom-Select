/**
* jQuery Custom Select
* @name jquery.custom_select.js
* @author Mattia - http://www.matriz.it
* @version 1.1.0
* @date February 13, 2012
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
		var ii = $(container).data('instance_i');
		if (ii || ii === 0) {
			var values = $('div[rel=custom_select_values_container_'+ii+']');
			return values.length > 0 ? $(values[0]) : false;
		}
		return false;
	};
	
	var getValues = function(container) {
		var values_container = getValuesContainer(container);
		if (values_container) {
			var values = values_container.children('div');
			return values.length > 0 ? $(values) : false;
		}
		return false;
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
				var parent = container.parent();
				if (parent.length > 0) {
					var pos = parent.css('position');
					if (pos && pos != '' && pos != 'static') {
						parent.css('z-index', opts.z_index + 1); //Internet Explorer lte 7 z-index bug
					}
				}
				opened_containers[opened_containers.length] = container;
			}
		}
	};
	
	var closeSelect = function(container) {
		container = $(container);
		var values = getValuesContainer(container);
		if (values) {
			values.hide();
			var opts = getOptions(container);
			container.removeClass(opts.container_open_class).css('z-index', opts.z_index).data('open', false);
			var parent = container.parent();
			if (parent.length > 0) {
				var pos = parent.css('position');
				if (pos && pos != '' && pos != 'static') {
					parent.css('z-index', opts.z_index); //Internet Explorer lte 7 z-index bug
				}
			}
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
		var sel = $(container.data('select'));
		if (sel.length > 0) {
			sel.val(v);
		}
		var selected = getSelected(container);
		if (selected) {
			if (l == '') {
				selected.html('&nbsp;');
			} else {
				selected.text(l);
			}
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
			$(opt).addClass(over_class);
		}

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
	
	var createOption = function(option, container, is_child) {
		option = $(option);
		var val = option.prop('value');
		var lab = option.text();
		var options = getOptions(container);
		var classes = options.option_class;
		if (is_child) {
			classes += ' '+options.option_child_class;
		}
		if (option.prop('selected')) {
			selectOption(container, val, lab, true);
			$(container).data('reset', {
				'value': val,
				'label': lab
			});
			classes += ' '+options.option_over_class;
		}
		var d = $('<div />').addClass(classes).data('value', val).hover(function() {
			overOption(container, this);
		}).click(function(e) {
			e.stopPropagation();
			var v = $(this);
			selectOption(container, v.data('value'), v.text());
			closeSelect(container);
		});
		if (lab == '') {
			d.html('&nbsp;');
		} else {
			d.text(lab);
		}
		return d;
	};
	
	var createOptGroup = function(optgroup, container) {
		optgroup = $(optgroup);
		var title = $('<p />').addClass(getOption(container, 'option_group_class')).text(optgroup.attr('label'));
		var values = [];
		var options = optgroup.find('option');
		var l = options.length;
		for (var i = 0; i < l; i++) {
			values[i] = createOption(options[i], container, true).get(0);
		}
		return $($.merge(title, values));
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
				'option_group_class': 'custom_select_option_group',
				'option_class': 'custom_select_option',
				'option_over_class': 'over',
				'option_child_class': 'child',
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
					$('<span />').html('&nbsp;').addClass(sel_options.option_value_class).css('display', 'block').click(function(e) {
						e.stopPropagation();
						toggleSelect(container);
					}).prependTo(container);
					container.appendTo(parent);
					var container_pos = container.offset();
					var values_container = $('<div />').addClass(sel_options.options_container_class).css({

						'position': 'absolute',
						'top': container_pos.top + container.outerHeight(),
						'left': container_pos.left,
						'z-index': sel_options.z_index,
						'width': container.width()
					});
					disableSelection(values_container);
					var groups = [];
					var children = select.children();
					var children_l = children.length;
					for (var j = 0; j < children_l; j++) {











						children[j] = $(children[j]);
						var el = false;
						if (children[j].is('option')) {
							var el = createOption(children[j], container, false);
						} else if (children[j].is('optgroup')) {
							var el = createOptGroup(children[j], container);
						}







						if (el) {
							el.appendTo(values_container);
						}
					}
					var ii = instances.length;
					select.css('visibility', 'hidden').data('instance_i', ii);
					container.data('instance_i', ii);
					instances[ii] = container;
					values_container.attr('rel', 'custom_select_values_container_'+ii);
					values_container.appendTo('body');
					closeSelect(container);

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