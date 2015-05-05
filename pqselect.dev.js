/*!
 * ParamQuery Select v1.2.0
 *
 * Copyright (c) 2015 Paramvir Dhindsa (http://paramquery.com)
 * Released under GNU General Public License v3
 * http://paramquery.com/license
 *
 */
(function($) {
    "use strict";
    $.support.touch = 'ontouchend' in document;
    var fn = {};
    fn.options = function() {
        var KC = $.ui.keyCode;
        return {
            radio: false,
            singlePlaceholder: 'Select an option',
            checkbox: false,
            displayText: '{0} of {1} selected',
            maxDisplay: 4,
            maxSelect: 0,
            multiplePlaceholder: 'Select options',
            selectallText: 'Select All',
            position: {
                my: 'left top',
                at: 'left bottom',
                collision: 'flipfit'
            },
            kcOpen: [KC.DOWN, KC.ENTER, KC.UP],
            deselect: true,
            hoverCls: 'pq-state-hover',
            search: true,
            searchRule: 'contain',
            selectCls: 'ui-state-highlight pq-state-select',
            width: null,
            maxSelectReach: null,
            maxSelectExceed: null
        };
    }();
    fn._setButtonWidth = function() {
        var $select = this.element;
        $select.show();
        var o = this.options,
            width = o.width ? o.width : $select[0].offsetWidth;
        $select.hide();
        this.$button.width(width);
    };
    fn._create = function() {
        var that = this,
                o = this.options,
                $select = this.element,
                name = $select.attr('name'),
                multiple = $select.attr('multiple'),
                $button = $(
                ["<div class='pq-select-button pq-no-capture ui-widget ui-state-default ui-corner-all btn btn-default' ",
                    " data-name='",name,"' tabindex='0'>",
                (multiple ? "" : "<span class='ui-icon ui-icon-triangle-1-s'></span>"),
                "<div class='pq-select-text'></div>",
                "</div>"].join(""));
        this.$button = $button;
        this.multiple = multiple ? true : false;
        this.selector = 'label.pq-select-option-label.ui-state-enable:visible';
        this._setButtonWidth();
        $select.after($button);
        $button.attr("name", name);
        $button.addClass($select.attr("class"));
        $select.addClass("pq-select");
        this._extractData();
        this._createPopup();
        this._createMenu();
        $button.on({
            click: function(evt) {
                if(o.disabled) return;
                var $parent = $(this).parent('.pq-select-item'),
                        indx = parseInt($parent.attr("data-id"));
                that.select(indx, false);
                that.setText();
                that.focus();
                that.triggerChange();
                return false;
            }
        }, '.ui-icon-close');
        $button.on({
            click: function(evt) {
                if(o.disabled) return;
                that.toggle();
                return false;
            },
            focus: function(evt) {
                if(o.disabled) return;
                $(this).addClass('ui-state-hover');
            },
            blur: function(evt) {
                $(this).removeClass('ui-state-hover');
            },
            mousedown: function(evt) {
                if(o.disabled) return;
                $(this).addClass('ui-state-active');
            },
            mouseup: function(evt) {
                if(o.disabled) return;
                $(this).removeClass('ui-state-active');
            },
            keydown: function(evt) {
                if(o.disabled) return;
                var keyCode = evt.keyCode,
                        kcOpen = o.kcOpen,
                        KC = $.ui.keyCode;
                if ($.inArray(keyCode, kcOpen) !== -1) {
                    that.open();
                }
                else if (keyCode === KC.ESCAPE) {
                    that.close();
                }
                else if (keyCode === KC.SPACE) {
                    that.toggle();
                }
            }
        });
        this.setText();
        var EN = this.eventNamespace;
        $(window).on("resize"+EN+" scroll"+EN, function(evt){
            that.onWindowResize(evt);
        });
    };
    fn.onWindowResize = function(){
        this.close();
    };
    fn.focus = function() {
        var that = this;
        if (!$.support.touch) {
            that.$search.focus();
        }
    };
    $.paramquery = $.paramquery || {};
    $.paramquery.scrollView = function($ele) {
        var ele = $ele[0],
                top = ele.offsetTop,
                ht = ele.offsetHeight,
                parent = ele.offsetParent,
                scrollTop = parent.scrollTop,
                htParent = parent.clientHeight;
        if (ht + top > htParent + scrollTop) {
            $(parent).scrollTop(ht + top - htParent);
        }
        else if (top < scrollTop) {
            $(parent).scrollTop(top);
        }
    };
    $.paramquery.pageMove = function($ele, selector, next) {
        var $nextele,
                ht = $ele[0].offsetHeight,
                parent = $ele[0].offsetParent,
                htParent = parent.clientHeight;
        do {
            $nextele = $ele[next ? 'nextAll' : 'prevAll'](selector);
            if ($nextele.length) {
                $nextele = $($nextele[0]);
                ht += $nextele[0].offsetHeight;
                $ele = $nextele;
            }
            else
                break;
        } while (ht < htParent)
        $.paramquery.scrollView($ele);
        return $ele;
    };
    fn._move = function(next) {
        var $label = this.$lastlabelHighlight;
        if ($label && $label.length) {
            var $next = $label[next ? 'nextAll' : 'prevAll'](this.selector);
            if ($next.length) {
                $next = $($next[0]);
                this._highlight($next);
            }
        }
        else {
            this._hightlight();
        }
    };
    fn._onkeydown = function(evt) {
        var keyCode = evt.keyCode,
                KC = $.ui.keyCode;
        if (keyCode === KC.DOWN || keyCode === KC.UP) {
            this._move(keyCode === KC.DOWN);
            return false;
        }
        else if (keyCode === KC.PAGE_DOWN || keyCode === KC.PAGE_UP) {
            var $label = $.paramquery.pageMove(
                    this.$lastlabelHighlight,
                    this.selector,
                    (keyCode === KC.PAGE_DOWN)
                    );
            this._highlight($label);
            return false;
        }
        if (keyCode === KC.TAB) {
            this.close();
            return false;
        }
        else if (keyCode === KC.ESCAPE) {
            this.close();
        }
        else if (keyCode === KC.ENTER) {
            if (this.$lastlabelHighlight) {
                this.$lastlabelHighlight.trigger('label_changed');
                return false;
            }
        }
    };
    fn.search = function(val) {
        var data = this.data,
                searchRule = this.options.searchRule,
                contain = searchRule === 'contain';
        for (var i = 0, len = data.length; i < len; i++) {
            var rowData = data[i],
                    text = rowData.text.toUpperCase(),
                    indx = text.indexOf(val);
            rowData.searchIndx = null;
            if (indx === -1) {
                rowData.hidden = true;
            }
            else if (contain === false && indx > 0) {
                rowData.hidden = true;
            }
            else {
                rowData.hidden = false;
                rowData.searchIndx = indx;
            }
        }
    };
    fn._onkeyupsearch = function(evt) {
        var $input = $(evt.target),
                val = $.trim($input.val()).toUpperCase(),
                data = this.data,
                keyCode = evt.keyCode,
                KC = $.ui.keyCode,
                arr = [KC.DOWN, KC.UP, KC.ENTER, KC.PAGE_DOWN, KC.PAGE_UP];
        if ($.inArray(keyCode, arr) === -1) {
            this.search(val);
            this._createMenu();
            this.positionPopup();
        }
    };
    fn._onChange = function(indx, checked) {
        var that = this,
                o = that.options,
                multiple = this.multiple,
                maxSelect = o.maxSelect,
                selIndx = that.selectIndx;
        if (multiple) {
            if (checked) {
                if (maxSelect && selIndx.length >= maxSelect) {
                    that._trigger('maxSelectExceed', null, {
                        option: that.$options[indx]
                    });
                    that.focus();
                    return false;
                }
            }
        }
        else if (selIndx.length) {
            var prevIndx = selIndx[0];
            if (indx === prevIndx) {
                return false;
            }
            if (checked) {
                this.select(prevIndx, false);
            }
        }
        this.select(indx, checked);
        that.setText();
        that.setSelectAllState();
        if (multiple) {
            if (maxSelect && selIndx.length >= maxSelect) {
                if (that._trigger('maxSelectReach', null, {
                    option: that.$options[indx]
                }) !== false) {
                    that.close();
                }
            }
            else {
                that.focus();
            }
        }
        else {
            that.close();
        }
        this.triggerChange();
    };
    fn.setSelectAllState = function() {
        var $chk = this.$popup.find(".pq-select-all input");
        if ($chk.length) {
            var data = this.data,
                    enabled = 0,
                    selectAll = 0;
            for (var i = 0, len = data.length; i < len; i++) {
                var rowData = data[i],
                        selected = rowData.selected,
                        disabled = rowData.disabled;
                if (disabled) {
                    continue;
                }
                enabled++;
                if (selected) {
                    selectAll++;
                }
            }
            if (enabled === selectAll) {
                $chk.prop('checked', true);
            }
            else {
                $chk.prop('checked', false);
            }
        }
    };
    fn.getInstance = function() {
        return {select: this};
    };
    fn.select = function(indx, add) {
        var that = this,
                selIndx = that.selectIndx,
                o = this.options,
                rowData = this.data[indx],
                $option = $(that.$options[indx]),
                $label = that.$popup.find("#pq-option-" + this.uuid + "-" + indx),
                $input = $label.find("input");
        $label[add ? 'addClass' : 'removeClass'](o.selectCls);
        $input.prop('checked', add);
        rowData.selected = add;
        if (that.multiple) {
            if (add) {
                selIndx.push(indx);
            }
            else {
                var indx2 = $.inArray(indx, selIndx);
                selIndx.splice(indx2, 1);
            }
            $option.prop('selected', add);
        }
        else {
            if (add) {
                if(selIndx.length){
                    this.data[selIndx[0]].selected=false;
                }
                selIndx[0] = indx;
                $option.prop('selected', add);
            }
            else {
                that.selectIndx = [0];
                this.data[0].selected = true;
                $(that.$options[0]).prop('selected', true);
            }
        }
    };
    fn.triggerChange = function() {
        this.element.trigger('change');
    };
    fn._extractData = function() {
        var data = this.data = [],
                $select = this.element,
                $options = $select.find('option,optgroup'),
                grouping = false,
                disabled_group = false,
                optgroup;
        this.$options = $select.find('option');
        for (var i = 0, len = $options.length; i < len; i++) {
            var option = $options[i],
                    $option = $(option);
            if (option.nodeName.toLowerCase() == 'optgroup') {
                optgroup = $option.attr('label');
                grouping = true;
                disabled_group = $option.prop('disabled');
                continue;
            }
            var selected = $option.prop('selected');
            var disabled = $option.prop('disabled');
            if(!disabled && grouping){
                disabled = disabled_group;
            }
            var text = $option.text();
            data.push({selected: selected, disabled: disabled, text: text, optgroup: optgroup });
        }
        this.grouping = grouping;
    };
    fn.refresh = function() {
        this.search("");
        this._setButtonWidth();
        this._createPopup();
        this._createMenu();
        this.setText();
    };
    fn.refreshData = function() {
        this._extractData();
        this.refresh();
    };
    fn._createPopup = function() {
        var that = this,
                data = this.data,
                o = this.options,
                multiple = that.multiple,
                searchHTML = "",
                headerHTML = "";
        if (multiple && o.selectallText && !o.maxSelect) {
            headerHTML = ["<label class='pq-select-all ui-widget-header ui-corner-all'>",
                "<span class='ui-icon ui-icon-close'></span>",
                "<input type='checkbox' >",
                o.selectallText,
                "</label>"].join('');
        }
        if (o.search) {
            searchHTML = ["<div class='pq-select-search-div ui-corner-all'>",
                "<span class='ui-icon ui-icon-search' />",
                "<div class='pq-select-search-div1'>",
                "<input type='text' class='pq-select-search-input' autocomplete='off' />",
                "</div>",
                "</div>"].join("");
        }
        var $popupCont = $(["<div class='pq-select-popup-cont'>",
            "<div class='pq-select-popup ui-widget-content ui-corner-all'>",
            headerHTML,
            searchHTML,
            "</div><div class='pq-select-shadow-fix'></div></div>"].join(''));
        $popupCont.css({"font-family": this.$button.css("font-family"),
            "font-size": this.$button.css("font-size")});
        var $popup = $popupCont.children("div.pq-select-popup");
        $popup.on({
            keydown: function(evt) {
                return that._onkeydown(evt);
            }
        });
        $popup.find('.ui-icon-close').on({
            click: function(evt) {
                that.close();
                return false;
            }
        });
        $popup.on({
            change: function(evt) {
                var $select = that.element,
                        $input = $(this),
                        checked = $input.prop('checked') ? true : false,
                        data = that.data,
                        $options = that.$options;
                for (var i = 0; i < data.length; i++) {
                    var rowData = data[i];
                    if (!rowData.disabled && rowData.selected !== checked) {
                        rowData.selected = checked;
                        $($options[i]).prop('selected', checked);
                    }
                }
                that._createMenu();
                that.setText();
                that.focus();
                that.triggerChange();
            }
        }, 'label.pq-select-all input');
        $popup.on({
            mouseenter: function(evt) {
                that._highlight($(this));
            },
            label_changed: function(evt) {
                var $label = $(this),
                        id = $label.attr("id");
                if (id) {
                    var checked = $label.hasClass(o.selectCls) ? false : true,
                            indx = parseInt(id.split("-")[3]);
                    return that._onChange(indx, checked);
                }
            }
        }, 'label.pq-select-option-label.ui-state-enable');
        if((multiple && o.checkbox) || (!multiple && o.radio)){
            $popup.on({
                click: function(){
                    var $label = $(this).closest('label');
                    $label.trigger('label_changed');
                }
            },'label.pq-select-option-label.ui-state-enable input');
        }
        else{
            $popup.on({
                click: function(evt) {
                    $(this).trigger('label_changed');
                }
            }, 'label.pq-select-option-label.ui-state-enable');
        }
        if (this.$popupCont) {
            this.$popupCont.remove();
        }
        this.$popupCont = $popupCont;
        this.$popup = $popup;
        this.$search = $popup.find(".pq-select-search-input").on({
            keyup: function(evt) {
                return that._onkeyupsearch(evt);
            }
        });
        $(document.body).append($popupCont);
        this.setSelectAllState();
    };
    fn._createMenu = function() {
        var that = this,
            data = this.data,
            uuid = this.uuid,
            o = this.options,
            searchIndx,
            searchLen = o.search ? $.trim(this.$search.val()).length : 0,
            selectCls = ' ' + o.selectCls + ' ',
            multiple = that.multiple,
            type = multiple ? (o.checkbox ? 'type="checkbox"' : "") : (o.radio ? 'type="radio"' : ""),
            textCls = type ? "pq-left-input" : (this.grouping ? "pq-left-group" : ""),
            disabled, disabledCls,
            selectIndx = that.selectIndx = [],
            li = [],
            poptgroup;
        for (var i = 0; i < data.length; i++) {
            var rowData = data[i],
                disabled = rowData.disabled,
                selected = rowData.selected,
                text = rowData.text,
                optgroup = rowData.optgroup;
            if (selected) {
                selectIndx.push(i);
            }
            if (rowData.hidden) {
                continue;
            }
            if (poptgroup !== optgroup) {
                li.push("<div class='pq-select-optgroup'>", optgroup, "</div>");
                poptgroup = optgroup;
            }
            var
                    checkedAttr = selected ? ' checked="checked" ' : "",
                    checkedCls = selected ? selectCls : "",
                    disabledAttr = disabled ? ' disabled="disabled" ' : "",
                    disabledCls = disabled ? "ui-state-disabled" : "ui-state-enable",
                    style = "";
            if (i === 0 && text === "") {
                continue;
            }
            if (searchLen) {
                searchIndx = rowData.searchIndx;
                text = text.substr(0, searchIndx) +
                        "<span class='pq-select-search-highlight'>" +
                        text.substr(searchIndx, searchLen) + "</span>" +
                        text.substr(searchIndx + searchLen, text.length);
            }
            li.push(
                    "<label class='pq-select-option-label ", checkedCls, disabledCls, "'",
                    style, " id='pq-option-", uuid, "-", i, "'>",
                    type ? ("<input " + type + " " + checkedAttr + disabledAttr + " >") : "",
                    "<span class='", textCls, "'>", text, "</span>",
                    "</label>"
                    );
        }
        var $menu = $(["<div class='pq-select-menu' >",
            li.join(''),
            "</div>"].join(""));
        if (this.$menu) {
            this.$menu.remove();
        }
        this.$popup.append($menu);
        delete this.$lastlabelHighlight;
        this.$menu = $menu;
        this._highlight();
    };
    fn._highlight = function($label) {
        var hoverCls = this.options.hoverCls;
        if (!$label || !$label.length) {
            $label = this.$menu.find("label.pq-select-option-label.ui-state-enable:visible:first");
        }
        if ($label.length) {
            if (this.$lastlabelHighlight) {
                this.$lastlabelHighlight.removeClass(hoverCls);
            }
            $label.addClass(hoverCls);
            this.$lastlabelHighlight = $label;
            $.paramquery.scrollView($label);
        }
    };
    fn._setPopupWidth = function() {
        var width = this.$button[0].offsetWidth;
        this.$popupCont.width(width);
    };
    fn.positionPopup = function() {
        var o = this.options,
            $button = this.$button,
            position = $.extend({ of: $button }, o.position),
            $popupCont = this.$popupCont;
        this._setPopupWidth();
        $popupCont.position(position);
    };
    fn.isOpen = function() {
        if (this.$popupCont && this.$popupCont.css("display")=="block") {
            return true;
        }
        return false;
    };
    fn.open = function() {
        var that = this,
                $popupCont = this.$popupCont,
                $menu = this.$menu,
                selectIndx = this.selectIndx;
        if (this.isOpen()) {
            return false;
        }
        $popupCont.show();
        this.positionPopup();
        this._highlight();
        $(document).on('mousedown' + that.eventNamespace, function(evt) {
            var $target = $(evt.target);
            if ($target.closest(that.$popup).length || $target.closest(that.$button).length) {
            }
            else {
                that.close();
            }
        });
        if (this.options.search) {
            that.focus();
        }
        else {
            $popupCont.attr("tabindex", "-1").focus();
        }
    };
    fn.setText = function() {
        var $button = this.$button,
                $selectText = $button.find('.pq-select-text'),
                $select = this.element,
                o = this.options,
                deselect = o.deselect,
                data = this.data,
                clsItem = 'pq-select-item ui-corner-all ui-state-default',
                tmpl = function(indx) {
                    if (deselect) {
                        return ["<span class='", clsItem, "' data-id = '", indx, "'>",
                            "<span class='ui-icon ui-icon-close'></span>",
                            "<span class='pq-select-item-text'>", data[indx].text, "</span>",
                            "</span>"].join("");
                    }
                    else {
                        return data[indx].text;
                    }
                },
                selectIndx = this.selectIndx,
                text;
        if (this.multiple) {
            $button.addClass('pq-select-multiple');
            var selLen = selectIndx.length,
                    maxDisplay = o.maxDisplay,
                    total = data.length;
            if (selLen > 0) {
                if (selLen <= maxDisplay) {
                    var arr = [];
                    for (var i = 0; i < selLen; i++) {
                        var indx = selectIndx[i];
                        arr.push(tmpl(indx));
                    }
                    if (deselect) {
                        text = arr.join("");
                    }
                    else {
                        text = arr.join(", ");
                    }
                }
                else {
                    text = o.displayText;
                    text = text.replace("{0}", selectIndx.length);
                    text = text.replace("{1}", total);
                }
            }
            else {
                text = $select.attr('data-placeholder');
                if (!text) {
                    text = o.multiplePlaceholder;
                }
            }
        }
        else {
            $button.addClass('pq-select-single');
            $selectText.css("maxWidth", $button.width() - 16);
            var indx = selectIndx[0],
                    text = data[indx].text;
            if (text != null && text !== "") {
                text = tmpl(indx);
                if (deselect) {
                }
            }
            else {
                text = $select.attr('data-placeholder');
                if (!text) {
                    text = o.singlePlaceholder;
                }
            }
        }
        $selectText.html(text);
        if (!this.multiple) {
            $selectText.find(".pq-select-item-text")
                    .css({"maxWidth": $button.width() - 35});
        }
        this.positionPopup();
    };
    fn.close = function(obj) {
        if (this.isOpen()) {
            obj = obj || {};
            if (obj.focus !== false) {
                this.$button.focus();
            }
            this.$popupCont.hide();
        }
        $(document).off(this.eventNamespace);
    };
    fn.toggle = function() {
        if (this.isOpen()) {
            this.close();
        }
        else {
            this.open();
        }
    };
    fn.disable = function() {
        this.option({disabled: true});
    };
    fn.enable = function() {
        this.option({disabled: false});
    };
    fn._destroy = function() {
        this.$popupCont.remove();
        this.$button.remove();
        this.element.removeClass("pq-select").show();
        var EN = this.eventNamespace;
        $(document).off(EN);
        $(window).off(EN);
    };
    fn.destroy = function() {
        this._super();
        for (var key in this) {
            delete this[key];
        }
    };
    fn._setOption = function(key, value) {
        if(key=="disabled"){
            if(value===true){
                this.close();
                this.$button.addClass('ui-state-disabled');
            }
            else if(value===false){
                this.$button.removeClass('ui-state-disabled');
            }
        }
        this._super( key, value);
    };
    $.widget('paramquery.pqSelect', fn);
})(jQuery);
