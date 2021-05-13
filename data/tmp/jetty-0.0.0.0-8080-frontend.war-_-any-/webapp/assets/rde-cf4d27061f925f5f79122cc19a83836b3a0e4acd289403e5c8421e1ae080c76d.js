/*
jquery.event.drag.js ~ v1.4 ~ Copyright (c) 2008, Three Dub Media (http://threedubmedia.com)
Liscensed under the MIT License ~ http://threedubmedia.googlecode.com/files/MIT-LICENSE.txt
*/

(function(H){H.fn.drag=function(K,J,I){if(J){this.bind("dragstart",K)}if(I){this.bind("dragend",I)}return !K?this.trigger("drag"):this.bind("drag",J?J:K)};var D=H.event,B=D.special,F=B.drag={not:":input",distance:0,which:1,setup:function(I){I=H.extend({distance:F.distance,which:F.which,not:F.not},I||{});I.distance=G(I.distance);D.add(this,"mousedown",E,I)},teardown:function(){D.remove(this,"mousedown",E);if(this===F.dragging){F.dragging=F.proxy=null}C(this,true)}};function E(K){var J=this,I,L=K.data||{};if(L.elem){J=K.dragTarget=L.elem;K.dragProxy=F.proxy||J;K.cursorOffsetX=L.pageX-L.left;K.cursorOffsetY=L.pageY-L.top;K.offsetX=K.pageX-K.cursorOffsetX;K.offsetY=K.pageY-K.cursorOffsetY}else{if(F.dragging||(L.which>0&&K.which!=L.which)||H(K.target).is(L.not)){return }}switch(K.type){case"mousedown":H.extend(L,H(J).offset(),{elem:J,target:K.target,pageX:K.pageX,pageY:K.pageY});D.add(document,"mousemove mouseup",E,L);C(J,false);return false;case !F.dragging&&"mousemove":if(G(K.pageX-L.pageX)+G(K.pageY-L.pageY)<L.distance){break}K.target=L.target;I=A(K,"dragstart",J);if(I!==false){F.dragging=J;F.proxy=K.dragProxy=H(I||J)[0]}case"mousemove":if(F.dragging){I=A(K,"drag",J);if(B.drop){B.drop.allowed=(I!==false);B.drop.handler(K)}if(I!==false){break}K.type="mouseup"}case"mouseup":D.remove(document,"mousemove mouseup",E);if(F.dragging){if(B.drop){B.drop.handler(K)}A(K,"dragend",J)}C(J,true);F.dragging=F.proxy=L.elem=null;break}}function A(L,J,K){L.type=J;var I=D.dispatch.call(K,L);return I===false?false:I||L.result}function G(I){return Math.pow(I,2)}function C(J,I){if(!J){return }J.unselectable=I?"off":"on";J.onselectstart=function(){return I};if(document.selection&&document.selection.empty){document.selection.empty()}if(J.style){J.style.MozUserSelect=I?"":"none"}}})(jQuery);
/*
 * jQuery kiketable.colsizable plugin
 * Version 1.1 (20-MAR-2009)
 * @requires jQuery v1.3.2 or later (http://jquery.com)
 * @requires jquery.event.drag-1.4.js (http://blog.threedubmedia.com/2008/08/eventspecialdrag.html)
 *
 * Examples at: http://www.ita.es/jquery/jquery.kiketable.colsizable.htm
 * Copyright (c) 2007-2009 Enrique Melendez Estrada
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 *
 */

(function($){

  $.fn.kiketable_colsizable = function(o) {
    // default parameters, properties or settings
    o = $.extend({}, $.fn.kiketable_colsizable.defaults, o);
    o.dragProxy = (o.dragProxy === "line" ) ? false : true;

    this
      .filter("table:not(."+o.namespace+")") // only for "virgin" html table(s)
      .addClass(o.namespace)
      .each(function(index){
        o.renderTime = new Date().getTime();
        //
        // global variables
        //
        var oTable =	this,
          $Table =	$(this),
          _Cols =		oTable.getElementsByTagName("col");
        ;
        _Cols.length && $(o.dragCells,this)
          .each(function(index){
            if (!$(this).hasClass('kiketable-th'))
              $(this).addClass('kiketable-th').wrapInner('<div class="kiketable-th-text"></div>');
            $('<div class="'+o.classHandler+'" title="'+ o.title+'"></div>')
              .prependTo(this)
              .each(function(){
                //
                // global properties
                //
                this.td =	this.parentNode; // alias for TD / CELL of this, if jerarchy changes in future, only depends on this var
                this.$td =	$(this.td);
                this.col = _Cols[this.td.cellIndex];
              })
              .dblclick( function() {
                // if loading fast, only once...
                if (this.wtd == null){
                  this.wtd =		this.col.offsetWidth;
                  this.wtd0=		this.wtd;
                };

                // change column width
                var minimized = this.wtd == o.minWidth;
                this.wtd = (minimized) ? this.wtd0 : o.minWidth;
                this.col.style.width = this.wtd + "px";

                // change table width (if not fixed)
                if(!o.fixWidth){
                  var d = this.wtd0-o.minWidth;
                  oTable.style.width = $Table.width()+((minimized)?d:-d)+"px";
                };
                $(this).trigger('minimized');
              })
              //
              // bind a dragstart event, return the proxy element
              //
              .bind( 'dragstart', function(e){
                this.cell_width =	this.$td.width();
                this.table_width =	$Table.width();
                this.left0 =		e.offsetX;
                this.d1 = this.cell_width - this.left0; // precalc for drag event
                this.d2 = o.minWidth - this.d1; // precalc for drag event

                return $(this)
                  .clone()
                  .appendTo(this.td)
                  .css("opacity",o.dragOpacity)
                  .css((o.dragProxy)?{
                    top:	this.$td.offset().top,
                    left:	this.$td.offset().left,
                    width:	this.cell_width
                  }:{
                    top:	this.$td.offset().top,
                    left:	e.offsetX
                  })
                  .removeClass(o.classHandler)
                  .addClass(	(o.dragProxy)? o.classDragArea :	o.classDragLine)
                  .height($Table.height())
              })
              //
              // bind a drag event, update proxy position
              //
              .bind( 'drag', (o.dragMove || o.dragProxy)? function(e){
                var w = e.offsetX + this.d1;
                if(w - this.d2 - this.d1 >= 0){
                  e.dragProxy.style.width = w + "px"; //$(e.dragProxy).css({width: w}) ;
                  if (o.dragMove){
                    this.col.style.width = w +"px"; // cell width
                    if(!o.fixWidth){
                      oTable.style.width = (this.table_width - this.cell_width+ w) + "px";
                    };
                  };
                }
              }: function(e){
                var x = e.offsetX;
                if (x - this.d2 >= 0)
                  e.dragProxy.style.left = x+"px"; //$(e.dragProxy).css({left: e.offsetX});
              })
              //
              // bind a dragend event, remove proxy
              //
              .bind( 'dragend', function(e){
                if (!o.dragMove){
                  var delta = parseInt(e.dragProxy.style.left) - this.left0;
                  this.col.style.width = (o.dragProxy) ? e.dragProxy.style.width : (this.cell_width + delta)+"px"; // cell width
                  // change table width (if not fixed)
                  if(!o.fixWidth)
                    oTable.style.width = ((o.dragProxy) ? this.table_width - this.cell_width + parseInt(e.dragProxy.style.width) : this.table_width + delta)+"px";
                }
                $(e.dragProxy)[o.fxHide](o.fxSpeed, function(){$(this).remove()});
                $(this).trigger('minimized');
              })
              .bind('minimized', function(e){
                $(this.col)[(parseInt(this.col.style.width) <= o.minWidth) ? "addClass":"removeClass"](o.classMinimized)
              });
          });
        o.renderTime = new Date().getTime() - o.renderTime;
        o.onLoad();
      });
    return this;
  };
  $.fn.kiketable_colsizable.defaults = {
    dragCells :		"tr:first > *",// cells for allocating column sizing handlers (by default: all cells of first row)
    dragMove :		true,		// see column moving its width? (true/false)
    dragProxy :		"line",		// Shape of dragging ghost ("line"/"area")
    dragOpacity :	.3,			// Opacity for dragging ghost (0 - 1)
    minWidth :		8,			// width for minimized column (px)
    fixWidth :		false,		// table with fixed width? (true/false)
    fxHide :		"fadeOut",	// effect for hiding (fadeOut/hide/slideUp)
    fxSpeed:		200,		// speed for hiding (miliseconds)
    namespace :		"kiketable-colsizable",
    classHandler :	"kiketable-colsizable-handler",
    classDragLine :	"kiketable-colsizable-dragLine",
    classDragArea :	"kiketable-colsizable-dragArea",
    classMinimized: "kiketable-colsizable-minimized",
    title :			'Expand/Collapse this column',
    renderTime :	0,
    onLoad : function(){}
  };
}) (jQuery);
(function(B){var A={listTargetID:null,onClass:"",offClass:"",hideInList:[],colsHidden:[],saveState:false,onToggle:null,show:function(K){D(K)},hide:function(K){C(K)}};var J=0;var G="columnManagerC";var H=function(M){var N="",L=0,K=M.cMColsVisible;if(M.cMSaveState&&M.id&&K&&B.cookie){for(;L<K.length;L++){N+=(K[L]==false)?0:1}B.cookie(G+M.id,N,{expires:9999})}};var C=function(K){if(jQuery.browser.msie){(C=function(L){L.style.setAttribute("display","none")})(K)}else{(C=function(L){L.style.display="none"})(K)}};var D=function(K){if(jQuery.browser.msie){(D=function(L){L.style.setAttribute("display","block")})(K)}else{(D=function(L){L.style.display="table-cell"})(K)}};var F=function(K){if(jQuery.browser.msie){return(F=function(L){return L.style.getAttribute("display")!="none"})(K)}else{return(F=function(L){return L.style.display!="none"})(K)}};var I=function(N,L,K){for(var M=0;M<L.length;M++){if(L[M].realIndex===undefined){E(N)}if(L[M].realIndex==K){return L[M]}}return null};var E=function(X){var Z=X.rows;var R=Z.length;var W=[];for(var P=0;P<R;P++){var Y=Z[P].cells;var V=Y.length;for(var O=0;O<V;O++){var U=Y[O];var T=U.rowSpan||1;var Q=U.colSpan||1;var S=-1;if(!W[P]){W[P]=[]}var L=W[P];while(L[++S]){}U.realIndex=S;for(var N=P;N<P+T;N++){if(!W[N]){W[N]=[]}var K=W[N];for(var M=S;M<S+Q;M++){K[M]=1}}}}};B.fn.columnManager=function(N){var O=B.extend({},A,N);var M=function(X){if(!O.listTargetID){return }var P=B("#"+O.listTargetID);if(!P.length){return }var W=null;if(X.tHead&&X.tHead.length){W=X.tHead.rows[0]}else{if(X.rows.length){W=X.rows[0]}else{return }}var Y=W.cells;if(!Y.length){return }var R=null;if(P.get(0).nodeName.toUpperCase()=="UL"){R=P}else{R=B("<ul></ul>");P.append(R)}var T=X.cMColsVisible;for(var Q=0;Q<Y.length;Q++){if(B.inArray(Q+1,O.hideInList)>=0){continue}T[Q]=(T[Q]!==undefined)?T[Q]:true;var V=B(Y[Q]).text(),S;if(!V.length){V=B(Y[Q]).html();if(!V.length){V="undefined"}}if(T[Q]&&O.onClass){S=O.onClass}else{if(!T[Q]&&O.offClass){S=O.offClass}}var U=B("<li class=\""+S+"\">"+V+"</li>").click(L);U[0].cmData={id:X.id,col:Q};R.append(U)}X.cMColsVisible=T};var L=function(){var S=this.cmData;if(S&&S.id&&S.col>=0){var Q=S.col,R=B("#"+S.id);if(R.length){R.toggleColumns([Q+1],O);var P=R.get(0).cMColsVisible;if(O.onToggle){O.onToggle.apply(R.get(0),[Q+1,P[Q]])}}}};var K=function(R){var S=B.cookie(G+R);if(S){var P=S.split("");for(var Q=0;Q<P.length;Q++){P[Q]&=1}return P}return false};return this.each(function(){this.id=this.id||"jQcM0O"+J++;var S,R=[],Q=[];E(this);if(O.colsHidden.length){for(S=0;S<O.colsHidden.length;S++){Q[O.colsHidden[S]-1]=true;R[O.colsHidden[S]-1]=true}}if(O.saveState){var T=K(this.id);if(T&&T.length){for(S=0;S<T.length;S++){Q[S]=true;R[S]=!T[S]}}this.cMSaveState=true}this.cMColsVisible=Q;if(R.length){var P=[];for(S=0;S<R.length;S++){if(R[S]){P[P.length]=S+1}}if(P.length){B(this).toggleColumns(P)}}M(this)})};B.fn.toggleColumns=function(K,L){return this.each(function(){var P,Q,S,Y=this.rows,R=this.cMColsVisible;if(!K){return }if(K.constructor==Number){K=[K]}if(!R){R=this.cMColsVisible=[]}for(P=0;P<Y.length;P++){var X=Y[P].cells;for(var O=0;O<K.length;O++){var M=K[O]-1;if(M>=0){var U=I(this,X,M);if(!U){var N=M;while(N>0&&!(U=I(this,X,--N))){}if(!U){continue}}if(R[M]==undefined){R[M]=true}if(R[M]){Q=L&&L.hide?L.hide:C;S=-1}else{Q=L&&L.show?L.show:D;S=1}if(!U.chSpan){U.chSpan=0}if(U.colSpan>1||(S==1&&U.chSpan&&F(U))){if(U.realIndex+U.colSpan+U.chSpan-1<M){continue}U.colSpan+=S;U.chSpan+=S*-1}else{if(U.realIndex+U.chSpan<M){continue}else{Q(U)}}}}}for(P=0;P<K.length;P++){this.cMColsVisible[K[P]-1]=!R[K[P]-1];if(L&&L.listTargetID&&(L.onClass||L.offClass)){var W=L.onClass,V=L.offClass,T;if(R[K[P]-1]){W=V;V=L.onClass}T=B("#"+L.listTargetID+" li").filter(function(){return this.cmData&&this.cmData.col==K[P]-1});if(W){T.removeClass(W)}if(V){T.addClass(V)}}}H(this)})};B.fn.showColumns=function(K,L){return this.each(function(){var N,O=[],M=this.cMColsVisible;if(M){if(K&&K.constructor==Number){K=[K]}for(N=0;N<M.length;N++){if(!M[N]&&(!K||B.inArray(N+1,K)>-1)){O.push(N+1)}}B(this).toggleColumns(O,L)}})};B.fn.hideColumns=function(K,L){return this.each(function(){var N,O=K,M=this.cMColsVisible;if(M){if(K.constructor==Number){K=[K]}O=[];for(N=0;N<K.length;N++){if(M[K[N]-1]||M[K[N]-1]==undefined){O.push(K[N])}}}B(this).toggleColumns(O,L)})}})(jQuery);
/**
 * bootstrap-multiselect.js
 * https://github.com/davidstutz/bootstrap-multiselect
 *
 * Copyright 2012, 2013 David Stutz
 *
 * Dual licensed under the BSD-3-Clause and the Apache License, Version 2.0.
 */

!function($) {

  "use strict";// jshint ;_;

  if (typeof ko !== 'undefined' && ko.bindingHandlers && !ko.bindingHandlers.multiselect) {
    ko.bindingHandlers.multiselect = {
      init: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {},
      update: function(element, valueAccessor, allBindingsAccessor, viewModel, bindingContext) {

        var config = ko.utils.unwrapObservable(valueAccessor());
        var selectOptions = allBindingsAccessor().options();
        var ms = $(element).data('multiselect');

        if (!ms) {
          $(element).multiselect(config);
        }
        else {
          ms.updateOriginalOptions();
          if (selectOptions && selectOptions.length !== ms.originalOptions.length) {
            $(element).multiselect('rebuild');
          }
        }
      }
    };
  }

  function Multiselect(select, options) {

    this.options = this.mergeOptions(options);
    this.$select = $(select);

    // Initialization.
    // We have to clone to create a new reference.
    this.originalOptions = this.$select.clone()[0].options;
    this.query = '';
    this.searchTimeout = null;

    this.options.multiple = this.$select.attr('multiple') === "multiple";
    this.options.onChange = $.proxy(this.options.onChange, this);
    this.options.onDropdownShow = $.proxy(this.options.onDropdownShow, this);
    this.options.onDropdownHide = $.proxy(this.options.onDropdownHide, this);

    // Build select all if enabled.
    this.buildContainer();
    this.buildButton();
    this.buildSelectAll();
    this.buildDropdown();
    this.buildDropdownOptions();
    this.buildFilter();
    this.updateButtonText();

    this.$select.hide().after(this.$container);
  };

  Multiselect.prototype = {

    // Default options.
    defaults: {
      // Default text function will either print 'None selected' in case no
      // option is selected, or a list of the selected options up to a length of 3 selected options by default.
      // If more than 3 options are selected, the number of selected options is printed.
      buttonText: function(options, select) {
        if (options.length === 0) {
          return this.nonSelectedText + ' <b class="caret"></b>';
        }
        else {
          if (options.length > this.numberDisplayed) {
            return options.length + ' ' + this.nSelectedText + ' <b class="caret"></b>';
          }
          else {
            var selected = '';
            options.each(function() {
              var label = ($(this).attr('label') !== undefined) ? $(this).attr('label') : $(this).html();

              selected += label + ', ';
            });
            return selected.substr(0, selected.length - 2) + ' <b class="caret"></b>';
          }
        }
      },
      // Like the buttonText option to update the title of the button.
      buttonTitle: function(options, select) {
        if (options.length === 0) {
          return this.nonSelectedText;
        }
        else {
          var selected = '';
          options.each(function () {
            selected += $(this).text() + ', ';
          });
          return selected.substr(0, selected.length - 2);
        }
      },
      // Create label
      label: function( element ){
        return $(element).attr('label') || $(element).html();
      },
      // Is triggered on change of the selected options.
      onChange : function(option, checked) {

      },
      // Triggered immediately when dropdown shown
      onDropdownShow: function(event) {

      },
      // Triggered immediately when dropdown hidden
      onDropdownHide: function(event) {

      },
      buttonClass: 'btn btn-default',
      dropRight: false,
      selectedClass: 'active',
      buttonWidth: 'auto',
      buttonContainer: '<div class="btn-group" />',
      // Maximum height of the dropdown menu.
      // If maximum height is exceeded a scrollbar will be displayed.
      maxHeight: false,
      includeSelectAllOption: false,
      selectAllText: ' Select all',
      selectAllValue: 'multiselect-all',
      enableFiltering: false,
      enableCaseInsensitiveFiltering: false,
      filterPlaceholder: 'Search',
      // possible options: 'text', 'value', 'both'
      filterBehavior: 'text',
      preventInputChangeEvent: false,
      nonSelectedText: 'None selected',
      nSelectedText: 'selected',
      numberDisplayed: 3
    },

    // Templates.
    templates: {
      button: '<button type="button" class="multiselect dropdown-toggle" data-toggle="dropdown"></button>',
      ul: '<ul class="multiselect-container dropdown-menu"></ul>',
      filter: '<div class="input-group"><span class="input-group-addon"><i class="glyphicon glyphicon-search"></i></span><input class="form-control multiselect-search" type="text"></div>',
      li: '<li><a href="javascript:void(0);"><label></label></a></li>',
      liGroup: '<li><label class="multiselect-group"></label></li>'
    },

    constructor: Multiselect,

    buildContainer: function() {
      this.$container = $(this.options.buttonContainer);
      this.$container.on('show.bs.dropdown', this.options.onDropdownShow);
      this.$container.on('hide.bs.dropdown', this.options.onDropdownHide);
    },

    buildButton: function() {
      // Build button.
      this.$button = $(this.templates.button).addClass(this.options.buttonClass);

      // Adopt active state.
      if (this.$select.prop('disabled')) {
        this.disable();
      }
      else {
        this.enable();
      }

      // Manually add button width if set.
      if (this.options.buttonWidth) {
        this.$button.css({
          'width' : this.options.buttonWidth
        });
      }

      // Keep the tab index from the select.
      var tabindex = this.$select.attr('tabindex');
      if (tabindex) {
        this.$button.attr('tabindex', tabindex);
      }

      this.$container.prepend(this.$button);
    },

    // Build dropdown container ul.
    buildDropdown: function() {

      // Build ul.
      this.$ul = $(this.templates.ul);

      if (this.options.dropRight) {
        this.$ul.addClass('pull-right');
      }

      // Set max height of dropdown menu to activate auto scrollbar.
      if (this.options.maxHeight) {
        // TODO: Add a class for this option to move the css declarations.
        this.$ul.css({
          'max-height': this.options.maxHeight + 'px',
          'overflow-y': 'auto',
          'overflow-x': 'hidden'
        });
      }

      this.$container.append(this.$ul);
    },

    // Build the dropdown and bind event handling.
    buildDropdownOptions: function() {

      this.$select.children().each($.proxy(function(index, element) {
        // Support optgroups and options without a group simultaneously.
        var tag = $(element).prop('tagName')
          .toLowerCase();

        if (tag === 'optgroup') {
          this.createOptgroup(element);
        }
        else if (tag === 'option') {
          this.createOptionValue(element);
        }
        // Other illegal tags will be ignored.
      }, this));

      // Bind the change event on the dropdown elements.
      $('li input', this.$ul).on('change', $.proxy(function(event) {
        var checked = $(event.target).prop('checked') || false;
        var isSelectAllOption = $(event.target).val() === this.options.selectAllValue;

        // Apply or unapply the configured selected class.
        if (this.options.selectedClass) {
          if (checked) {
            $(event.target).parents('li')
              .addClass(this.options.selectedClass);
          }
          else {
            $(event.target).parents('li')
              .removeClass(this.options.selectedClass);
          }
        }

        // Get the corresponding option.
        var value = $(event.target).val();
        var $option = this.getOptionByValue(value);

        var $optionsNotThis = $('option', this.$select).not($option);
        var $checkboxesNotThis = $('input', this.$container).not($(event.target));

        if (isSelectAllOption) {
          if (this.$select[0][0].value === this.options.selectAllValue) {
            var values = [];
            var options = $('option[value!="' + this.options.selectAllValue + '"]', this.$select);
            for (var i = 0; i < options.length; i++) {
              // Additionally check whether the option is visible within the dropcown.
              if (options[i].value !== this.options.selectAllValue && this.getInputByValue(options[i].value).is(':visible')) {
                values.push(options[i].value);
              }
            }

            if (checked) {
              this.select(values);
            }
            else {
              this.deselect(values);
            }
          }
        }

        if (checked) {
          $option.prop('selected', true);

          if (this.options.multiple) {
            // Simply select additional option.
            $option.prop('selected', true);
          }
          else {
            // Unselect all other options and corresponding checkboxes.
            if (this.options.selectedClass) {
              $($checkboxesNotThis).parents('li').removeClass(this.options.selectedClass);
            }

            $($checkboxesNotThis).prop('checked', false);
            $optionsNotThis.prop('selected', false);

            // It's a single selection, so close.
            this.$button.click();
          }

          if (this.options.selectedClass === "active") {
            $optionsNotThis.parents("a").css("outline", "");
          }
        }
        else {
          // Unselect option.
          $option.prop('selected', false);
        }

        this.$select.change();
        this.options.onChange($option, checked);
        this.updateButtonText();

        if(this.options.preventInputChangeEvent) {
          return false;
        }
      }, this));

      $('li a', this.$ul).on('touchstart click', function(event) {
        event.stopPropagation();

        if (event.shiftKey) {
          var checked = $(event.target).prop('checked') || false;

          if (checked) {
            var prev = $(event.target).parents('li:last')
              .siblings('li[class="active"]:first');

            var currentIdx = $(event.target).parents('li')
              .index();
            var prevIdx = prev.index();

            if (currentIdx > prevIdx) {
              $(event.target).parents("li:last").prevUntil(prev).each(
                function() {
                  $(this).find("input:first").prop("checked", true)
                    .trigger("change");
                }
              );
            }
            else {
              $(event.target).parents("li:last").nextUntil(prev).each(
                function() {
                  $(this).find("input:first").prop("checked", true)
                    .trigger("change");
                }
              );
            }
          }
        }

        $(event.target).blur();
      });

      // Keyboard support.
      this.$container.on('keydown', $.proxy(function(event) {
        if ($('input[type="text"]', this.$container).is(':focus')) {
          return;
        }
        if ((event.keyCode === 9 || event.keyCode === 27) && this.$container.hasClass('open')) {
          // Close on tab or escape.
          this.$button.click();
        }
        else {
          var $items = $(this.$container).find("li:not(.divider):visible a");

          if (!$items.length) {
            return;
          }

          var index = $items.index($items.filter(':focus'));

          // Navigation up.
          if (event.keyCode === 38 && index > 0) {
            index--;
          }
          // Navigate down.
          else if (event.keyCode === 40 && index < $items.length - 1) {
            index++;
          }
          else if (!~index) {
            index = 0;
          }

          var $current = $items.eq(index);
          $current.focus();

          if (event.keyCode === 32 || event.keyCode === 13) {
            var $checkbox = $current.find('input');

            $checkbox.prop("checked", !$checkbox.prop("checked"));
            $checkbox.change();
          }

          event.stopPropagation();
          event.preventDefault();
        }
      }, this));
    },

    // Will build an dropdown element for the given option.
    createOptionValue: function(element) {
      if ($(element).is(':selected')) {
        $(element).prop('selected', true);
      }

      // Support the label attribute on options.
      var label = this.options.label(element);
      var value = $(element).val();
      var inputType = this.options.multiple ? "checkbox" : "radio";

      var $li = $(this.templates.li);
      $('label', $li).addClass(inputType);
      $('label', $li).append('<input type="' + inputType + '" />');

      var selected = $(element).prop('selected') || false;
      var $checkbox = $('input', $li);
      $checkbox.val(value);

      if (value === this.options.selectAllValue) {
        $checkbox.parent().parent()
          .addClass('multiselect-all');
      }

      $('label', $li).append(" " + label);

      this.$ul.append($li);

      if ($(element).is(':disabled')) {
        $checkbox.attr('disabled', 'disabled')
          .prop('disabled', true)
          .parents('li')
          .addClass('disabled');
      }

      $checkbox.prop('checked', selected);

      if (selected && this.options.selectedClass) {
        $checkbox.parents('li')
          .addClass(this.options.selectedClass);
      }
    },

    // Create optgroup.
    createOptgroup: function(group) {
      var groupName = $(group).prop('label');

      // Add a header for the group.
      var $li = $(this.templates.liGroup);
      $('label', $li).text(groupName);

      this.$ul.append($li);

      // Add the options of the group.
      $('option', group).each($.proxy(function(index, element) {
        this.createOptionValue(element);
      }, this));
    },

    // Add the select all option to the select.
    buildSelectAll: function() {
      var alreadyHasSelectAll = this.$select[0][0] ? this.$select[0][0].value === this.options.selectAllValue : false;

      // If options.includeSelectAllOption === true, add the include all checkbox.
      if (this.options.includeSelectAllOption && this.options.multiple && !alreadyHasSelectAll) {
        this.$select.prepend('<option value="' + this.options.selectAllValue + '">' + this.options.selectAllText + '</option>');
      }
    },

    // Build and bind filter.
    buildFilter: function() {

      // Build filter if filtering OR case insensitive filtering is enabled and the number of options exceeds (or equals) enableFilterLength.
      if (this.options.enableFiltering || this.options.enableCaseInsensitiveFiltering) {
        var enableFilterLength = Math.max(this.options.enableFiltering, this.options.enableCaseInsensitiveFiltering);

        if (this.$select.find('option').length >= enableFilterLength) {

          this.$filter = $(this.templates.filter);
          $('input', this.$filter).attr('placeholder', this.options.filterPlaceholder);
          this.$ul.prepend(this.$filter);

          this.$filter.val(this.query).on('click', function(event) {
            event.stopPropagation();
          }).on('keydown', $.proxy(function(event) {
              // This is useful to catch "keydown" events after the browser has updated the control.
              clearTimeout(this.searchTimeout);

              this.searchTimeout = this.asyncFunction($.proxy(function() {

                if (this.query !== event.target.value) {
                  this.query = event.target.value;

                  $.each($('li', this.$ul), $.proxy(function(index, element) {
                    var value = $('input', element).val();
                    var text = $('label', element).text();

                    if (value !== this.options.selectAllValue && text) {
                      // by default lets assume that element is not
                      // interesting for this search
                      var showElement = false;

                      var filterCandidate = '';
                      if ((this.options.filterBehavior === 'text' || this.options.filterBehavior === 'both')) {
                        filterCandidate = text;
                      }
                      if ((this.options.filterBehavior === 'value' || this.options.filterBehavior === 'both')) {
                        filterCandidate = value;
                      }

                      if (this.options.enableCaseInsensitiveFiltering && filterCandidate.toLowerCase().indexOf(this.query.toLowerCase()) > -1) {
                        showElement = true;
                      }
                      else if (filterCandidate.indexOf(this.query) > -1) {
                        showElement = true;
                      }

                      if (showElement) {
                        $(element).show();
                      }
                      else {
                        $(element).hide();
                      }
                    }
                  }, this));
                }

                // TODO: check whether select all option needs to be updated.
              }, this), 300, this);
            }, this));
        }
      }
    },

    // Destroy - unbind - the plugin.
    destroy: function() {
      this.$container.remove();
      this.$select.show();
    },

    // Refreshs the checked options based on the current state of the select.
    refresh: function() {
      $('option', this.$select).each($.proxy(function(index, element) {
        var $input = $('li input', this.$ul).filter(function() {
          return $(this).val() === $(element).val();
        });

        if ($(element).is(':selected')) {
          $input.prop('checked', true);

          if (this.options.selectedClass) {
            $input.parents('li')
              .addClass(this.options.selectedClass);
          }
        }
        else {
          $input.prop('checked', false);

          if (this.options.selectedClass) {
            $input.parents('li')
              .removeClass(this.options.selectedClass);
          }
        }

        if ($(element).is(":disabled")) {
          $input.attr('disabled', 'disabled')
            .prop('disabled', true)
            .parents('li')
            .addClass('disabled');
        }
        else {
          $input.prop('disabled', false)
            .parents('li')
            .removeClass('disabled');
        }
      }, this));

      this.updateButtonText();
    },

    // Select an option by its value or multiple options using an array of values.
    select: function(selectValues) {
      if(selectValues && !$.isArray(selectValues)) {
        selectValues = [selectValues];
      }

      for (var i = 0; i < selectValues.length; i++) {
        var value = selectValues[i];

        var $option = this.getOptionByValue(value);
        var $checkbox = this.getInputByValue(value);

        if (this.options.selectedClass) {
          $checkbox.parents('li')
            .addClass(this.options.selectedClass);
        }

        $checkbox.prop('checked', true);
        $option.prop('selected', true);
        this.options.onChange($option, true);
      }

      this.updateButtonText();
    },

    // Deselect an option by its value or using an array of values.
    deselect: function(deselectValues) {
      if(deselectValues && !$.isArray(deselectValues)) {
        deselectValues = [deselectValues];
      }

      for (var i = 0; i < deselectValues.length; i++) {

        var value = deselectValues[i];

        var $option = this.getOptionByValue(value);
        var $checkbox = this.getInputByValue(value);

        if (this.options.selectedClass) {
          $checkbox.parents('li')
            .removeClass(this.options.selectedClass);
        }

        $checkbox.prop('checked', false);
        $option.prop('selected', false);
        this.options.onChange($option, false);
      }

      this.updateButtonText();
    },

    // Rebuild the whole dropdown menu.
    rebuild: function() {
      this.$ul.html('');

      // Remove select all option in select.
      $('option[value="' + this.options.selectAllValue + '"]', this.$select).remove();

      // Important to distinguish between radios and checkboxes.
      this.options.multiple = this.$select.attr('multiple') === "multiple";

      this.buildSelectAll();
      this.buildDropdownOptions();
      this.updateButtonText();
      this.buildFilter();
    },

    // Build select using the given data as options.
    dataprovider: function(dataprovider) {
      var optionDOM = "";
      dataprovider.forEach(function (option) {
        optionDOM += '<option value="' + option.value + '">' + option.label + '</option>';
      });

      this.$select.html(optionDOM);
      this.rebuild();
    },

    // Enable button.
    enable: function() {
      this.$select.prop('disabled', false);
      this.$button.prop('disabled', false)
        .removeClass('disabled');
    },

    // Disable button.
    disable: function() {
      this.$select.prop('disabled', true);
      this.$button.prop('disabled', true)
        .addClass('disabled');
    },

    // Set options.
    setOptions: function(options) {
      this.options = this.mergeOptions(options);
    },

    // Get options by merging defaults and given options.
    mergeOptions: function(options) {
      return $.extend({}, this.defaults, options);
    },

    // Update button text and button title.
    updateButtonText: function() {
      var options = this.getSelected();

      // First update the displayed button text.
      $('button', this.$container).html(this.options.buttonText(options, this.$select));

      // Now update the title attribute of the button.
      $('button', this.$container).attr('title', this.options.buttonTitle(options, this.$select));

    },

    // Get all selected options.
    getSelected: function() {
      return $('option[value!="' + this.options.selectAllValue + '"]:selected', this.$select).filter(function() {
        return $(this).prop('selected');
      });
    },

    // Get the corresponding option by ts value.
    getOptionByValue: function(value) {
      return $('option', this.$select).filter(function() {
        return $(this).val() === value;
      });
    },

    // Get an input in the dropdown by its value.
    getInputByValue: function(value) {
      return $('li input', this.$ul).filter(function() {
        return $(this).val() === value;
      });
    },

    updateOriginalOptions: function() {
      this.originalOptions = this.$select.clone()[0].options;
    },

    asyncFunction: function(callback, timeout, self) {
      var args = Array.prototype.slice.call(arguments, 3);
      return setTimeout(function() {
        callback.apply(self || window, args);
      }, timeout);
    }
  };

  $.fn.multiselect = function(option, parameter) {
    return this.each(function() {
      var data = $(this).data('multiselect');
      var options = typeof option === 'object' && option;

      // Initialize the multiselect.
      if (!data) {
        $(this).data('multiselect', ( data = new Multiselect(this, options)));
      }

      // Call multiselect method.
      if (typeof option === 'string') {
        data[option](parameter);
      }
    });
  };

  $.fn.multiselect.Constructor = Multiselect;

  // Automatically init selects by their data-role.
  $(function() {
    $("select[data-role=multiselect]").multiselect();
  });

}(window.jQuery);
/*
 * jQuery Plugin: Tokenizing Autocomplete Text Entry
 * Version 1.6.0
 *
 * Copyright (c) 2009 James Smith (http://loopj.com)
 * Licensed jointly under the GPL and MIT licenses,
 * choose which one suits your project best!
 *
 */


(function ($) {
// Default settings
var DEFAULT_SETTINGS = {
    // Search settings
    method: "GET",
    queryParam: "q",
    searchDelay: 300,
    minChars: 1,
    propertyToSearch: "name",
    jsonContainer: null,
    contentType: "json",

    // Prepopulation settings
    prePopulate: null,
    processPrePopulate: false,

    // Display settings
    hintText: "Type in a search term",
    noResultsText: "No results",
    searchingText: "Searching...",
    deleteText: "&times;",
    animateDropdown: true,
    theme: null,
    zindex: 999,
    resultsLimit: null,

    enableHTML: true,

    resultsFormatter: function(item) {
      var string = item[this.propertyToSearch];
      return "<li>" + (this.enableHTML ? string : _escapeHTML(string)) + "</li>";
    },

    tokenFormatter: function(item) {
      var string = item[this.propertyToSearch];
      return "<li><p>" + (this.enableHTML ? string : _escapeHTML(string)) + "</p></li>";
    },

    // Tokenization settings
    tokenLimit: null,
    tokenDelimiter: ",",
    preventDuplicates: false,
    tokenValue: "id",

    // Behavioral settings
    allowFreeTagging: false,

    // Callbacks
    onResult: null,
    onCachedResult: null,
    onAdd: null,
    onFreeTaggingAdd: null,
    onDelete: null,
    onReady: null,

    // Other settings
    idPrefix: "token-input-",

    // Keep track if the input is currently in disabled mode
    disabled: false,

    formatQueryParam: function(q, ajax_params) {
      return q;
    },
    caching: true
};

// Default classes to use when theming
var DEFAULT_CLASSES = {
    tokenList: "token-input-list",
    token: "token-input-token",
    tokenReadOnly: "token-input-token-readonly",
    tokenDelete: "token-input-delete-token",
    selectedToken: "token-input-selected-token",
    highlightedToken: "token-input-highlighted-token",
    dropdown: "token-input-dropdown",
    dropdownItem: "token-input-dropdown-item",
    dropdownItem2: "token-input-dropdown-item2",
    selectedDropdownItem: "token-input-selected-dropdown-item",
    inputToken: "token-input-input-token",
    focused: "token-input-focused",
    disabled: "token-input-disabled"
};

// Input box position "enum"
var POSITION = {
    BEFORE: 0,
    AFTER: 1,
    END: 2
};

// Keys "enum"
var KEY = {
    BACKSPACE: 8,
    TAB: 9,
    ENTER: 13,
    ESCAPE: 27,
    SPACE: 32,
    PAGE_UP: 33,
    PAGE_DOWN: 34,
    END: 35,
    HOME: 36,
    LEFT: 37,
    UP: 38,
    RIGHT: 39,
    DOWN: 40,
    NUMPAD_ENTER: 108,
    COMMA: null // 188
};

var HTML_ESCAPES = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;'
};

var HTML_ESCAPE_CHARS = /[&<>"'\/]/g;

function coerceToString(val) {
  return String((val === null || val === undefined) ? '' : val);
}

function _escapeHTML(text) {
  return coerceToString(text).replace(HTML_ESCAPE_CHARS, function(match) {
    return HTML_ESCAPES[match];
  });
}

// Additional public (exposed) methods
var methods = {
    init: function(url_or_data_or_function, options) {
        var settings = $.extend({}, DEFAULT_SETTINGS, options || {});

        return this.each(function () {
            $(this).data("settings", settings);
            $(this).data("tokenInputObject", new $.TokenList(this, url_or_data_or_function, settings));
        });
    },
    clear: function() {
        this.data("tokenInputObject").clear();
        return this;
    },
    add: function(item) {
        this.data("tokenInputObject").add(item);
        return this;
    },
    remove: function(item) {
        this.data("tokenInputObject").remove(item);
        return this;
    },
    get: function() {
        return this.data("tokenInputObject").getTokens();
    },
    toggleDisabled: function(disable) {
        this.data("tokenInputObject").toggleDisabled(disable);
        return this;
    },
    setOptions: function(options){
        $(this).data("settings", $.extend({}, $(this).data("settings"), options || {}));
        return this;
    }
};

// Expose the .tokenInput function to jQuery as a plugin
$.fn.tokenInput = function (method) {
    // Method calling and initialization logic
    if(methods[method]) {
        return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    } else {
        return methods.init.apply(this, arguments);
    }
};

// TokenList class for each input
$.TokenList = function (input, url_or_data, settings) {
    //
    // Initialization
    //

    // Configure the data source
    if($.type(url_or_data) === "string" || $.type(url_or_data) === "function") {
        // Set the url to query against
        $(input).data("settings").url = url_or_data;

        // If the URL is a function, evaluate it here to do our initalization work
        var url = computeURL();

        // Make a smart guess about cross-domain if it wasn't explicitly specified
        if($(input).data("settings").crossDomain === undefined && typeof url === "string") {
            if(url.indexOf("://") === -1) {
                $(input).data("settings").crossDomain = false;
            } else {
                $(input).data("settings").crossDomain = (location.href.split(/\/+/g)[1] !== url.split(/\/+/g)[1]);
            }
        }
    } else if(typeof(url_or_data) === "object") {
        // Set the local data to search through
        $(input).data("settings").local_data = url_or_data;
    }

    // Build class names
    if($(input).data("settings").classes) {
        // Use custom class names
        $(input).data("settings").classes = $.extend({}, DEFAULT_CLASSES, $(input).data("settings").classes);
    } else if($(input).data("settings").theme) {
        // Use theme-suffixed default class names
        $(input).data("settings").classes = {};
        $.each(DEFAULT_CLASSES, function(key, value) {
            $(input).data("settings").classes[key] = value + "-" + $(input).data("settings").theme;
        });
    } else {
        $(input).data("settings").classes = DEFAULT_CLASSES;
    }


    // Save the tokens
    var saved_tokens = [];

    // Keep track of the number of tokens in the list
    var token_count = 0;

    // Basic cache to save on db hits
    var cache = new $.TokenList.Cache();

    // Keep track of the timeout, old vals
    var timeout;
    var input_val;

    // Create a new text input an attach keyup events
    var input_box = $("<input type=\"text\"  autocomplete=\"off\">")
        .css({
            outline: "none"
        })
        .attr("id", $(input).data("settings").idPrefix + input.id)
        .focus(function () {
            if ($(input).data("settings").disabled) {
                return false;
            } else
            if ($(input).data("settings").tokenLimit === null || $(input).data("settings").tokenLimit !== token_count) {
                show_dropdown_hint();
            }
            token_list.addClass($(input).data("settings").classes.focused);
        })
        .blur(function () {
            hide_dropdown();
            $(this).val("");
            token_list.removeClass($(input).data("settings").classes.focused);

            if ($(input).data("settings").allowFreeTagging) {
              add_freetagging_tokens();
            } else {
              $(this).val("");
            }
            token_list.removeClass($(input).data("settings").classes.focused);
        })
        .bind("keyup keydown blur update", resize_input)
        .keydown(function (event) {
            var previous_token;
            var next_token;

            switch(event.keyCode) {
                case KEY.LEFT:
                  return true;
                case KEY.RIGHT:
                  return true;
                case KEY.UP:
                case KEY.DOWN:
                    if(!$(this).val()) {
                        previous_token = input_token.prev();
                        next_token = input_token.next();

                        if((previous_token.length && previous_token.get(0) === selected_token) || (next_token.length && next_token.get(0) === selected_token)) {
                            // Check if there is a previous/next token and it is selected
                            if(event.keyCode === KEY.LEFT || event.keyCode === KEY.UP) {
                                deselect_token($(selected_token), POSITION.BEFORE);
                            } else {
                                deselect_token($(selected_token), POSITION.AFTER);
                            }
                        } else if((event.keyCode === KEY.LEFT || event.keyCode === KEY.UP) && previous_token.length) {
                            // We are moving left, select the previous token if it exists
                            select_token($(previous_token.get(0)));
                        } else if((event.keyCode === KEY.RIGHT || event.keyCode === KEY.DOWN) && next_token.length) {
                            // We are moving right, select the next token if it exists
                            select_token($(next_token.get(0)));
                        }
                    } else {
                        var dropdown_item = null;

                        if(event.keyCode === KEY.DOWN || event.keyCode === KEY.RIGHT) {
                            dropdown_item = $(selected_dropdown_item).next();
                        } else {
                            dropdown_item = $(selected_dropdown_item).prev();
                        }

                        if(dropdown_item.length) {
                            select_dropdown_item(dropdown_item);
                        }
                    }
                    return false;

                case KEY.BACKSPACE:
                    previous_token = input_token.prev();

                    if(!$(this).val().length) {
                        if(selected_token) {
                            delete_token($(selected_token));
                            hidden_input.change();
                        } else if(previous_token.length) {
                            select_token($(previous_token.get(0)));
                        }

                        return false;
                    } else if($(this).val().length === 1) {
                        hide_dropdown();
                    } else {
                        // set a timeout just long enough to let this function finish.
                        setTimeout(function(){do_search();}, 5);
                    }
                    break;

                case KEY.TAB:
                  return true;
                case KEY.ENTER:
                  if(selected_dropdown_item) {
                     add_token($(selected_dropdown_item).data("tokeninput"));
                     hidden_input.change();
                  } else {
                     $(input).trigger("tokeninput.enter");
                  }
                  event.stopPropagation();
                  event.preventDefault();
                  break;
                case KEY.NUMPAD_ENTER:
                case KEY.COMMA:
                  if(selected_dropdown_item) {
                    add_token($(selected_dropdown_item).data("tokeninput"));
                    hidden_input.change();
                  } else {
                    if ($(input).data("settings").allowFreeTagging) {
                       add_freetagging_tokens();
                    }
                    event.stopPropagation();
                    event.preventDefault();
                  }
                  return false;

                case KEY.ESCAPE:
                  hide_dropdown();
                  return true;

                default:
                    if(String.fromCharCode(event.which)) {
                        // set a timeout just long enough to let this function finish.
                        setTimeout(function(){do_search();}, 5);
                    }
                    break;
            }
        });

    // Keep a reference to the original input box
    var hidden_input = $(input)
                           .hide()
                           .val("")
                           .focus(function () {
                               focus_with_timeout(input_box);
                           })
                           .blur(function () {
                               input_box.blur();
                           });

    // Keep a reference to the selected token and dropdown item
    var selected_token = null;
    var selected_token_index = 0;
    var selected_dropdown_item = null;

    // The list to store the token items in
    var token_list = $("<ul />")
        .addClass($(input).data("settings").classes.tokenList)
        .click(function (event) {
            var li = $(event.target).closest("li");
            if(li && li.get(0) && $.data(li.get(0), "tokeninput")) {
                toggle_select_token(li);
            } else {
                // Deselect selected token
                if(selected_token) {
                    deselect_token($(selected_token), POSITION.END);
                }

                // Focus input box
                focus_with_timeout(input_box);
            }
        })
        .mouseover(function (event) {
            var li = $(event.target).closest("li");
            if(li && selected_token !== this) {
                li.addClass($(input).data("settings").classes.highlightedToken);
            }
        })
        .mouseout(function (event) {
            var li = $(event.target).closest("li");
            if(li && selected_token !== this) {
                li.removeClass($(input).data("settings").classes.highlightedToken);
            }
        })
        .insertBefore(hidden_input);

    // The token holding the input box
    var input_token = $("<li />")
        .addClass($(input).data("settings").classes.inputToken)
        .appendTo(token_list)
        .append(input_box);

    // The list to store the dropdown items in
    var dropdown = $("<div>")
        .addClass($(input).data("settings").classes.dropdown)
        .appendTo("body")
        .hide();

    // Magic element to help us resize the text input
    var input_resizer = $("<tester/>")
        .insertAfter(input_box)
        .css({
            position: "absolute",
            top: -9999,
            left: -9999,
            width: "auto",
            fontSize: input_box.css("fontSize"),
            fontFamily: input_box.css("fontFamily"),
            fontWeight: input_box.css("fontWeight"),
            letterSpacing: input_box.css("letterSpacing"),
            whiteSpace: "nowrap"
        });

    // Pre-populate list if items exist
    hidden_input.val("");
    var li_data = $(input).data("settings").prePopulate || hidden_input.data("pre");
    if($(input).data("settings").processPrePopulate && $.isFunction($(input).data("settings").onResult)) {
        li_data = $(input).data("settings").onResult.call(hidden_input, li_data);
    }
    if(li_data && li_data.length) {
        $.each(li_data, function (index, value) {
            insert_token(value);
            checkTokenLimit();
        });
    }

    // Check if widget should initialize as disabled
    if ($(input).data("settings").disabled) {
        toggleDisabled(true);
    }

    // Initialization is done
    if($.isFunction($(input).data("settings").onReady)) {
        $(input).data("settings").onReady.call();
    }

    //
    // Public functions
    //

    this.clear = function() {
        token_list.children("li").each(function() {
            if ($(this).children("input").length === 0) {
                delete_token($(this));
            }
        });
    };

    this.add = function(item) {
        add_token(item);
    };

    this.remove = function(item) {
        token_list.children("li").each(function() {
            if ($(this).children("input").length === 0) {
                var currToken = $(this).data("tokeninput");
                var match = true;
                for (var prop in item) {
                    if (item[prop] !== currToken[prop]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    delete_token($(this));
                }
            }
        });
    };

    this.getTokens = function() {
        return saved_tokens;
    };

    this.toggleDisabled = function(disable) {
        toggleDisabled(disable);
    };

    //
    // Private functions
    //

    function escapeHTML(text) {
      return $(input).data("settings").enableHTML ? text : _escapeHTML(text);
    }

    // Toggles the widget between enabled and disabled state, or according
    // to the [disable] parameter.
    function toggleDisabled(disable) {
        if (typeof disable === 'boolean') {
            $(input).data("settings").disabled = disable;
        } else {
            $(input).data("settings").disabled = !$(input).data("settings").disabled;
        }
        input_box.attr('disabled', $(input).data("settings").disabled);
        token_list.toggleClass($(input).data("settings").classes.disabled, $(input).data("settings").disabled);
        // if there is any token selected we deselect it
        if(selected_token) {
            deselect_token($(selected_token), POSITION.END);
        }
        hidden_input.attr('disabled', $(input).data("settings").disabled);
    }

    function checkTokenLimit() {
        if($(input).data("settings").tokenLimit !== null && token_count >= $(input).data("settings").tokenLimit) {
            input_box.hide();
            hide_dropdown();
            return;
        }
    }

    function resize_input() {
        if(input_val === (input_val = input_box.val())) {return;}

        // Enter new content into resizer and resize input accordingly
        input_resizer.html(_escapeHTML(input_val));
        input_box.width(input_resizer.width() + 30);
    }

    function is_printable_character(keycode) {
        return ((keycode >= 48 && keycode <= 90) ||     // 0-1a-z
                (keycode >= 96 && keycode <= 111) ||    // numpad 0-9 + - / * .
                (keycode >= 186 && keycode <= 192) ||   // ; = , - . / ^
                (keycode >= 219 && keycode <= 222));    // ( \ ) '
    }

    function add_freetagging_tokens() {
        var value = $.trim(input_box.val());
        var tokens = value.split($(input).data("settings").tokenDelimiter);
        $.each(tokens, function(i, token) {
          if (!token) {
            return;
          }

          if ($.isFunction($(input).data("settings").onFreeTaggingAdd)) {
            token = $(input).data("settings").onFreeTaggingAdd.call(hidden_input, token);
          }
          var object = {};
          object[$(input).data("settings").tokenValue] = object[$(input).data("settings").propertyToSearch] = token;
          add_token(object);
        });
    }

    // Inner function to a token to the list
    function insert_token(item) {
        var $this_token = $($(input).data("settings").tokenFormatter(item));
        var readonly = item.readonly === true ? true : false;

        if(readonly) $this_token.addClass($(input).data("settings").classes.tokenReadOnly);

        $this_token.addClass($(input).data("settings").classes.token).insertBefore(input_token);

        // The 'delete token' button
        if(!readonly) {
          $("<span>" + $(input).data("settings").deleteText + "</span>")
              .addClass($(input).data("settings").classes.tokenDelete)
              .appendTo($this_token)
              .click(function () {
                  if (!$(input).data("settings").disabled) {
                      delete_token($(this).parent());
                      hidden_input.change();
                      return false;
                  }
              });
        }

        // Store data on the token
        var token_data = item;
        $.data($this_token.get(0), "tokeninput", item);

        // Save this token for duplicate checking
        saved_tokens = saved_tokens.slice(0,selected_token_index).concat([token_data]).concat(saved_tokens.slice(selected_token_index));
        selected_token_index++;

        // Update the hidden input
        update_hidden_input(saved_tokens, hidden_input);

        token_count += 1;

        // Check the token limit
        if($(input).data("settings").tokenLimit !== null && token_count >= $(input).data("settings").tokenLimit) {
            input_box.hide();
            hide_dropdown();
        }

        return $this_token;
    }

    // Add a token to the token list based on user input
    function add_token (item) {
        var callback = $(input).data("settings").onAdd;

        // See if the token already exists and select it if we don't want duplicates
        if(token_count > 0 && $(input).data("settings").preventDuplicates) {
            var found_existing_token = null;
            token_list.children().each(function () {
                var existing_token = $(this);
                var existing_data = $.data(existing_token.get(0), "tokeninput");
                if(existing_data && existing_data.id === item.id) {
                    found_existing_token = existing_token;
                    return false;
                }
            });

            if(found_existing_token) {
                select_token(found_existing_token);
                input_token.insertAfter(found_existing_token);
                focus_with_timeout(input_box);
                return;
            }
        }

        // Insert the new tokens
        if($(input).data("settings").tokenLimit === null || token_count < $(input).data("settings").tokenLimit) {
            insert_token(item);
            checkTokenLimit();
        }

        // Clear input box
        input_box.val("");

        // Don't show the help dropdown, they've got the idea
        hide_dropdown();

        // Execute the onAdd callback if defined
        if($.isFunction(callback)) {
            callback.call(hidden_input,item);
        }
    }

    // Select a token in the token list
    function select_token (token) {
        if (!$(input).data("settings").disabled) {
            token.addClass($(input).data("settings").classes.selectedToken);
            selected_token = token.get(0);

            // Hide input box
            input_box.val("");

            // Hide dropdown if it is visible (eg if we clicked to select token)
            hide_dropdown();
        }
    }

    // Deselect a token in the token list
    function deselect_token (token, position) {
        token.removeClass($(input).data("settings").classes.selectedToken);
        selected_token = null;

        if(position === POSITION.BEFORE) {
            input_token.insertBefore(token);
            selected_token_index--;
        } else if(position === POSITION.AFTER) {
            input_token.insertAfter(token);
            selected_token_index++;
        } else {
            input_token.appendTo(token_list);
            selected_token_index = token_count;
        }

        // Show the input box and give it focus again
        focus_with_timeout(input_box);
    }

    // Toggle selection of a token in the token list
    function toggle_select_token(token) {
        var previous_selected_token = selected_token;

        if(selected_token) {
            deselect_token($(selected_token), POSITION.END);
        }

        if(previous_selected_token === token.get(0)) {
            deselect_token(token, POSITION.END);
        } else {
            select_token(token);
        }
    }

    // Delete a token from the token list
    function delete_token (token) {
        // Remove the id from the saved list
        var token_data = $.data(token.get(0), "tokeninput");
        var callback = $(input).data("settings").onDelete;

        var index = token.prevAll().length;
        if(index > selected_token_index) index--;

        // Delete the token
        token.remove();
        selected_token = null;

        // Show the input box and give it focus again
        focus_with_timeout(input_box);

        // Remove this token from the saved list
        saved_tokens = saved_tokens.slice(0,index).concat(saved_tokens.slice(index+1));
        if(index < selected_token_index) selected_token_index--;

        // Update the hidden input
        update_hidden_input(saved_tokens, hidden_input);

        token_count -= 1;

        if($(input).data("settings").tokenLimit !== null) {
            input_box
                .show()
                .val("");
            focus_with_timeout(input_box);
        }

        // Execute the onDelete callback if defined
        if($.isFunction(callback)) {
            callback.call(hidden_input,token_data);
        }
    }

    // Update the hidden input box value
    function update_hidden_input(saved_tokens, hidden_input) {
        var token_values = $.map(saved_tokens, function (el) {
            if(typeof $(input).data("settings").tokenValue == 'function')
              return $(input).data("settings").tokenValue.call(this, el);

            return el[$(input).data("settings").tokenValue];
        });
        hidden_input.val(token_values.join($(input).data("settings").tokenDelimiter));

    }

    // Hide and clear the results dropdown
    function hide_dropdown () {
        dropdown.hide().empty();
        selected_dropdown_item = null;
    }

    function show_dropdown() {
        dropdown
            .css({
                position: "absolute",
                top: $(token_list).offset().top + $(token_list).outerHeight(),
                left: $(token_list).offset().left,
                width: $(token_list).outerWidth(),
                'z-index': $(input).data("settings").zindex
            })
            .show();
    }

    function show_dropdown_searching () {
        if($(input).data("settings").searchingText) {
            dropdown.html("<p>" + escapeHTML($(input).data("settings").searchingText) + "</p>");
            show_dropdown();
        }
    }

    function show_dropdown_hint () {
        if($(input).data("settings").hintText) {
            dropdown.html("<p>" + escapeHTML($(input).data("settings").hintText) + "</p>");
            show_dropdown();
        }
    }

    var regexp_special_chars = new RegExp('[.\\\\+*?\\[\\^\\]$(){}=!<>|:\\-]', 'g');
    function regexp_escape(term) {
        return term.replace(regexp_special_chars, '\\$&');
    }

    // Highlight the query part of the search term
    function highlight_term(value, term) {
        return value.replace(
          new RegExp(
            "(?![^&;]+;)(?!<[^<>]*)(" + regexp_escape(term) + ")(?![^<>]*>)(?![^&;]+;)",
            "gi"
          ), function(match, p1) {
            return "<b>" + escapeHTML(p1) + "</b>";
          }
        );
    }

    function find_value_and_highlight_term(template, value, term) {
        return template.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + regexp_escape(value) + ")(?![^<>]*>)(?![^&;]+;)", "g"), highlight_term(value, term));
    }

    // Populate the results dropdown with some results
    function populate_dropdown (query, results) {
        if(results && results.length) {
            dropdown.empty();
            var dropdown_ul = $("<ul>")
                .appendTo(dropdown)
                .mouseover(function (event) {
                    select_dropdown_item($(event.target).closest("li"));
                })
                .mousedown(function (event) {
                    add_token($(event.target).closest("li").data("tokeninput"));
                    hidden_input.change();
                    return false;
                })
                .hide();

            if ($(input).data("settings").resultsLimit && results.length > $(input).data("settings").resultsLimit) {
                results = results.slice(0, $(input).data("settings").resultsLimit);
            }

            $.each(results, function(index, value) {
                var this_li = $(input).data("settings").resultsFormatter(value);

                this_li = find_value_and_highlight_term(this_li ,value[$(input).data("settings").propertyToSearch], query);

                this_li = $(this_li).appendTo(dropdown_ul);

                if(index % 2) {
                    this_li.addClass($(input).data("settings").classes.dropdownItem);
                } else {
                    this_li.addClass($(input).data("settings").classes.dropdownItem2);
                }

                if(index === 0) {
                    select_dropdown_item(this_li);
                }

                $.data(this_li.get(0), "tokeninput", value);
            });

            show_dropdown();

            if($(input).data("settings").animateDropdown) {
                dropdown_ul.slideDown("fast");
            } else {
                dropdown_ul.show();
            }
        } else {
            if($(input).data("settings").noResultsText) {
                dropdown.html("<p>" + escapeHTML($(input).data("settings").noResultsText) + "</p>");
                show_dropdown();
            }
        }
    }

    // Highlight an item in the results dropdown
    function select_dropdown_item (item) {
        if(item) {
            if(selected_dropdown_item) {
                deselect_dropdown_item($(selected_dropdown_item));
            }

            item.addClass($(input).data("settings").classes.selectedDropdownItem);
            selected_dropdown_item = item.get(0);
        }
    }

    // Remove highlighting from an item in the results dropdown
    function deselect_dropdown_item (item) {
        item.removeClass($(input).data("settings").classes.selectedDropdownItem);
        selected_dropdown_item = null;
    }

    // Do a search and show the "searching" dropdown if the input is longer
    // than $(input).data("settings").minChars
    function do_search() {
        var query = input_box.val();

        if(query && query.length) {
            if(selected_token) {
                deselect_token($(selected_token), POSITION.AFTER);
            }

            if(query.length >= $(input).data("settings").minChars) {
                show_dropdown_searching();
                clearTimeout(timeout);

                timeout = setTimeout(function(){
                    run_search(query);
                }, $(input).data("settings").searchDelay);
            } else {
                hide_dropdown();
            }
        }
    }

    // Do the actual search
    function run_search(query) {
        var cache_key = query + computeURL();
        var cached_results = cache.get(cache_key);
        if(cached_results) {
            if ($.isFunction($(input).data("settings").onCachedResult)) {
              cached_results = $(input).data("settings").onCachedResult.call(hidden_input, cached_results);
            }
            populate_dropdown(query, cached_results);
        } else {
            // Are we doing an ajax search or local data search?
            if($(input).data("settings").url) {
                var url = computeURL();
                // Extract exisiting get params
                var ajax_params = {};
                ajax_params.data = {};
                if(url.indexOf("?") > -1) {
                    var parts = url.split("?");
                    ajax_params.url = parts[0];

                    var param_array = parts[1].split("&");
                    $.each(param_array, function (index, value) {
                        var kv = value.split("=");
                        ajax_params.data[kv[0]] = kv[1];
                    });
                } else {
                    ajax_params.url = url;
                }

                // Prepare the request
                ajax_params.data[$(input).data("settings").queryParam] = $(input).data("settings").formatQueryParam(query, ajax_params);
                ajax_params.type = $(input).data("settings").method;
                ajax_params.dataType = $(input).data("settings").contentType;
                if($(input).data("settings").crossDomain) {
                    ajax_params.dataType = "jsonp";
                }

                // Attach the success callback
                ajax_params.success = function(results) {
                  if ($(input).data("settings").caching) {
                    cache.add(cache_key, $(input).data("settings").jsonContainer ? results[$(input).data("settings").jsonContainer] : results);
                  }
                  if($.isFunction($(input).data("settings").onResult)) {
                      results = $(input).data("settings").onResult.call(hidden_input, results);
                  }

                  // only populate the dropdown if the results are associated with the active search query
                  if(input_box.val() === query) {
                      populate_dropdown(query, $(input).data("settings").jsonContainer ? results[$(input).data("settings").jsonContainer] : results);
                  }
                };

                // Make the request
                $.ajax(ajax_params);
            } else if($(input).data("settings").local_data) {
                // Do the search through local data
                var results = $.grep($(input).data("settings").local_data, function (row) {
                    return row[$(input).data("settings").propertyToSearch].toLowerCase().indexOf(query.toLowerCase()) > -1;
                });

                cache.add(cache_key, results);
                if($.isFunction($(input).data("settings").onResult)) {
                    results = $(input).data("settings").onResult.call(hidden_input, results);
                }
                populate_dropdown(query, results);
            }
        }
    }

    // compute the dynamic URL
    function computeURL() {
        var url = $(input).data("settings").url;
        if(typeof $(input).data("settings").url == 'function') {
            url = $(input).data("settings").url.call($(input).data("settings"));
        }
        return url;
    }

    // Bring browser focus to the specified object.
    // Use of setTimeout is to get around an IE bug.
    // (See, e.g., http://stackoverflow.com/questions/2600186/focus-doesnt-work-in-ie)
    //
    // obj: a jQuery object to focus()
    function focus_with_timeout(obj) {
        setTimeout(function() { obj.focus(); }, 50);
    }

};

// Really basic cache for the results
$.TokenList.Cache = function (options) {
    var settings = $.extend({
        max_size: 500
    }, options);

    var data = {};
    var size = 0;

    var flush = function () {
        data = {};
        size = 0;
    };

    this.add = function (query, results) {
        if(size > settings.max_size) {
            flush();
        }

        if(!data[query]) {
            size += 1;
        }

        data[query] = results;
    };

    this.get = function (query) {
        return data[query];
    };
};
}(jQuery));

$(function() {
  $.fn.linker = function() {
    $(this).each(function() {
      var $this = $(this);
      var $linkerWrapper = $this.parents(".linker-wrapper:first");

      if ($this.hasClass("initialised")) {
        return;
      }

      $this.addClass("initialised");
      
      // this is a bit hacky, but we need to have some input fields present in
      // the form so we don't have to rely on the linker to make sure data
      // presists. we can remove those after the linker does its thing.
      $(".prelinker", $linkerWrapper).remove();

      var config = {
        url: decodeURIComponent($this.data("url")),
        browse_url: decodeURIComponent($this.data("browse-url")),
        span_class: $this.data("span-class"),
        format_template: $this.data("format_template"),
        format_template_id: $this.data("format_template_id"),
        format_property: $this.data("format_property"),
        path: $this.data("path"),
        name: $this.data("name"),
        multiplicity: $this.data("multiplicity") || "many",
        label: $this.data("label"),
        label_plural: $this.data("label_plural"),
        modal_id: $this.data("modal_id") || ($this.attr("id") + "_modal"),
        sortable: $this.data("sortable") === true,
        types: $this.data("types"),
        exclude_ids: $this.data("exclude") || []
      };

      config.allow_multiple = config.multiplicity === "many";

      if (config.format_template && config.format_template.substring(0,2) != "${") {
        config.format_template = "${" + config.format_template + "}";
      }

      var renderCreateFormForObject = function(form_uri) {
        var $modal = $("#"+config.modal_id);

        var initCreateForm = function(formEl) {
          $(".linker-container", $modal).html(formEl);
          $("#createAndLinkButton", $modal).removeAttr("disabled");
          $("form", $modal).ajaxForm({
            data: {
              inline: true
            },
            beforeSubmit: function() {
              $("#createAndLinkButton", $modal).attr("disabled","disabled");
            },
            success: function(response, status, xhr) {
              if ($(response).is("form")) {
                initCreateForm(response);
              } else {
                if (config.multiplicity === "one") {
                  clearTokens();
                }

                $this.tokenInput("add", {
                  id: response.uri,
                  name: response.display_string || response.title,
                  json: response
                });
                $this.triggerHandler("change");
                $modal.modal("hide");
              }
            },
            error: function(obj, errorText, errorDesc) {
              $("#createAndLinkButton", $modal).removeAttr("disabled");
            }
          });
          
          $modal.scrollTo(".alert");

          $modal.trigger("resize");
          $(document).triggerHandler("loadedrecordform.aspace", [$modal]);
        };

        $.ajax({
          url: form_uri,
          success: initCreateForm
        });
        $("#createAndLinkButton", $modal).click(function() {
          $("form", $modal).triggerHandler("submit");
        });
      };


      var showLinkerCreateModal = function() {
        AS.openCustomModal(config.modal_id, "Create "+ config.label, AS.renderTemplate("linker_createmodal_template", config), 'large', {}, this);
        if ($(this).hasClass("linker-create-btn")) {
          renderCreateFormForObject($(this).data("target"));
        } else {
          renderCreateFormForObject($(".linker-create-btn:first", $linkerWrapper).data("target"));
        }
        return false; // IE8 patch
      };


      var initAndShowLinkerBrowseModal = function() {
        var currentlySelected = {};

        var renderItemsInModal = function(page) {
          $.each($this.tokenInput("get"), function() {
            currentlySelected[this.id] = this.json;
          });

          $.ajax({
            url: config.browse_url,
            data: {
              page: 1,
              type: config.types,
              linker: true,
              exclude: config.exclude_ids,
              multiplicity: config.multiplicity
            },
            type: "GET",
            dataType: "html",
            success: function(html) {
              var $modal = $("#"+config.modal_id);

              var $linkerBrowseContainer = $(".linker-container", $modal);

              var initBrowseFormInputs = function() {
                // add some click handlers to allow clicking of the row
                $(":input[name=linker-item]", $linkerBrowseContainer).each(function() {
                  var $input = $(this);
                  $input.click(function(event) {
                    event.stopPropagation();

                    // If one-to-one, currentlySelected should only ever
                    // contain one record
                    if (!config.allow_multiple) {
                      currentlySelected = {};
                      $("tr.selected", $input.closest("table")).removeClass("selected");
                    }

                    if (currentlySelected.hasOwnProperty($input.val())) {
                      // remove from the list
                      delete currentlySelected[$input.val()];
                      $input.closest("tr").removeClass("selected");
                    } else {
                      // add to the selected list
                      currentlySelected[$input.val()] = $input.data("object");
                      $input.closest("tr").addClass("selected");
                    }
                  });

                  $("td", $input.closest("tr")).click(function(event) {
                    event.preventDefault();

                    $input.trigger("click");
                  });
                });

                // select a result if it's currently a selected record
                $.each(currentlySelected, function(uri) {
                  $(":input[value='"+uri+"']", $linkerBrowseContainer)
                    .attr("checked","checked")
                    .closest("tr").addClass("selected");
                });

                $modal.trigger("resize");
              };

              $linkerBrowseContainer.html(html);
              $($linkerBrowseContainer).on("click", "a", function(event) {
                event.preventDefault();

                $linkerBrowseContainer.load(event.target.href, initBrowseFormInputs);
              });

              $($linkerBrowseContainer).on("submit", "form", function(event) {
                event.preventDefault();

                var $form = $(event.target);
                var method = ($form.attr("method") || "get").toUpperCase();


                if (method == "POST") {
                  jQuery.post($form.attr("action") + ".js",
                              $form.serializeArray(),
                              function(html) {
                                $linkerBrowseContainer.html(html);
                                initBrowseFormInputs();
                              });
                } else {
                  $linkerBrowseContainer.load($form.attr("action") + ".js?" + $form.serialize(), initBrowseFormInputs);
                }
              });

              initBrowseFormInputs();
            }
          });
        };


        var addSelected = function() {
          selectedItems  = [];
          $(".token-input-delete-token", $linkerWrapper).each(function() {
            $(this).triggerHandler("click");
          });
          $.each(currentlySelected, function(uri, object) {
            $this.tokenInput("add", {
              id: uri,
              name: object.display_string || object.title,
              json: object
            });
          });
          $("#"+config.modal_id).modal('hide');
          $this.triggerHandler("change");
        };

        AS.openCustomModal(config.modal_id, "Browse "+ config.label_plural, AS.renderTemplate("linker_browsemodal_template",config), 'large', {}, this);
        renderItemsInModal();
        $("#"+config.modal_id).on("click","#addSelectedButton", addSelected);
        $("#"+config.modal_id).on("click", ".linker-list .pagination .navigation a", function() {
          renderItemsInModal($(this).attr("rel"));
        });
        return false; // IE patch
      };

      var formatResults = function(searchData) {
        var formattedResults = [];

        var currentlySelectedIds = [];
        $.each($this.tokenInput("get"), function(obj) {currentlySelectedIds.push(obj.id);});

        $.each(searchData.search_data.results, function(index, obj) {
          // only allow selection of unselected items

          if ($.inArray(obj.uri, currentlySelectedIds) === -1) {
            formattedResults.push({
              name: obj.display_string || obj.title,
              id: obj.id,
              json: obj
            });
          }
        });
        return formattedResults;
      };


      var addEventBindings = function() {
        $(".linker-browse-btn", $linkerWrapper).on("click", initAndShowLinkerBrowseModal);
        $(".linker-create-btn", $linkerWrapper).on("click", showLinkerCreateModal);

        // Initialise popover on demand to improve performance
        $linkerWrapper.one("mouseenter focus", ".has-popover", function() {
          $(document).triggerHandler("init.popovers", [$this.parent()]);
        });
      };


      var clearTokens = function() {
        // as tokenInput plugin won't clear a token
        // if it has an input.. remove all inputs first!
        var $tokenList = $(".token-input-list", $this.parent());
        for (var i=0; i<$this.tokenInput("get").length; i++) {
          var id_to_remove = $this.tokenInput("get")[i].id.replace(/\//g,"_");
          $("#"+id_to_remove + " :input", $tokenList).remove();
        }
        $this.tokenInput("clear");
      };


      var enableSorting = function() {
        if ($(".token-input-list", $linkerWrapper).data("sortable")) {
          $(".token-input-list", $linkerWrapper).sortable("destroy");
        }
        $(".token-input-list", $linkerWrapper).sortable({
          items: 'li.token-input-token'
        });
        $(".token-input-list", $linkerWrapper).off("sortupdate").on("sortupdate", function() {
          $this.parents("form:first").triggerHandler("formchanged.aspace");
        });
      };

      var tokensForPrepopulation = function() {
        if ($this.data("multiplicity") === "one") {
          if ($.isEmptyObject($this.data("selected"))) {
            return [];
          }
          return [{
              id: $this.data("selected").uri,
              name: $this.data("selected").display_string || $this.data("selected").title,
              json: $this.data("selected")
          }];
        } else {
          if (!$this.data("selected") || $this.data("selected").length === 0) {
            return [];
          }

          return $this.data("selected").map(function(item) {
            if (typeof item == 'string') {
              item = JSON.parse(item);
            }
            return {
              id: item.uri,
              name: item.display_string || item.title,
              json: item
            };
          });
        }
      };

      // ANW-521: For subjects, we want to have specialized icons based on the subjects' term type.
      var tag_subjects_by_term_type = function(obj) {
        if(obj.json.jsonmodel_type == "subject") {
          switch(obj.json.first_term_type) {
            case "cultural_context":
              return "subject_type_cultural_context";
            case "function":
              return "subject_type_function";
            case "genre_form":
              return "subject_type_genre_form";
            case "geographic":
              return "subject_type_geographic";
            case "occupation":
              return "subject_type_occupation";
            case "style_period":
              return "subject_type_style_period";
            case "technique":
              return "subject_type_technique";
            case "temporal":
              return "subject_type_temporal";
            case "topical":
              return "subject_type_topical";
            case "uniform_title":
              return "subject_type_uniform_title";
            default: 
              return "";
          }
        }
        else {
          return "";
        }
      };

      var init = function() {
        var tokenInputConfig = $.extend({}, AS.linker_locales, {
          animateDropdown: false,
          preventDuplicates: true,
          allowFreeTagging: false,
          tokenLimit: (config.multiplicity==="one"? 1 :null),
          caching: false,
          onCachedResult: formatResults,
          onResult: formatResults,
          zindex: 1100,
          tokenFormatter: function(item) {
            var tokenEl = $(AS.renderTemplate("linker_selectedtoken_template", {item: item, config: config}));
            tokenEl.children("div").children(".icon-token").addClass(config.span_class); 
            $("input[name*=resolved]", tokenEl).val(JSON.stringify(item.json));
            return tokenEl;
          },
          resultsFormatter: function(item) {
            var string = item.name;
            var $resultSpan = $("<span class='"+ item.json.jsonmodel_type + "'>");
            var extra_class = tag_subjects_by_term_type(item);
            $resultSpan.text(string);
            $resultSpan.prepend("<span class='icon-token " + extra_class + "'></span>");
            var $resultLi = $("<li>");
            $resultLi.append($resultSpan);
            return $resultLi[0].outerHTML;
          },
          prePopulate: tokensForPrepopulation(),
          onDelete: function() {
            $this.triggerHandler("change");
          },
          onAdd:  function(item) {
            // ANW-521: After adding a subject, find the added node and apply the special class for that node.
            var extra_class = tag_subjects_by_term_type(item);
            var added_node_id = "#" + item.id.replace(/\//g, "_");

            added_node = $(added_node_id);
            added_node.children("div").children(".icon-token").addClass(extra_class); 

            if (config.sortable && config.allow_multiple) {
              enableSorting();
            }

//            $this.triggerHandler("change");
            $(document).triggerHandler("init.popovers", [$this.parent()]);
          },
          formatQueryParam: function(q, ajax_params) {
            if ($this.tokenInput("get").length > 0 || config.exclude_ids.length > 0) {
              var currentlySelectedIds = $.merge([], config.exclude_ids);
              $.each($this.tokenInput("get"), function(i, obj) {currentlySelectedIds.push(obj.id);});

              ajax_params.data["exclude[]"] = currentlySelectedIds;
            }
            if (config.types && config.types.length > 0) {
              ajax_params.data["type"] = config.types;
            }

            return (q+"*").toLowerCase();
          }
        });


        setTimeout(function() {
          $this.tokenInput(config.url, tokenInputConfig);

          $("> :input[type=text]", $(".token-input-input-token", $this.parent())).attr("placeholder", AS.linker_locales.hintText).attr("aria-label", config.label);
          $("> :input[type=text]", $(".token-input-input-token", $this.parent())).addClass('form-control');

          $this.parent().addClass("multiplicity-"+config.multiplicity);

          if (config.sortable && config.allow_multiple) {
            enableSorting();
            $linkerWrapper.addClass("sortable");
          }
        });

        addEventBindings();
      };

      init();
    });
  };
});

$(document).ready(function() {
  $(document).bind("loadedrecordsubforms.aspace", function(event, $container) {
    $(".linker-wrapper:visible > .linker:not(.initialised)", $container).linker();
    // we can go ahead and init dropdowns ( such as those in the toolbars ) 
    $("#archives_tree_toolbar .linker:not(.initialised)").linker();
  });


  $(document).bind("subrecordcreated.aspace", function(event, object_name, subform) {
    $(".linker:not(.initialised)", subform).linker();
  });
});






$(function() {

  $.fn.init_rapid_data_entry_form = function($modal, uri) {
    $(this).each(function() {
      var $rde_form = $(this);
      var $table = $("table#rdeTable", $rde_form);

      if ($rde_form.hasClass("initialised")) {
        return;
      }

      $(".linker:not(.initialised)").linker();

      // Cookie Names
      var COOKIE_NAME_VISIBLE_COLUMN = "rde."+$rde_form.data("cookie-prefix")+".visible";
      var COOKIE_NAME_STICKY_COLUMN = "rde."+$rde_form.data("cookie-prefix")+".sticky";
      var COOKIE_NAME_COLUMN_WIDTHS = "rde."+$rde_form.data("cookie-prefix")+".widths";
      var COOKIE_NAME_COLUMN_ORDER = "rde."+$rde_form.data("cookie-prefix")+".order";

      // Config from Cookies
      var VISIBLE_COLUMN_IDS =  AS.prefixed_cookie(COOKIE_NAME_VISIBLE_COLUMN) ? JSON.parse(AS.prefixed_cookie(COOKIE_NAME_VISIBLE_COLUMN)) : null;
      var STICKY_COLUMN_IDS =  AS.prefixed_cookie(COOKIE_NAME_STICKY_COLUMN) ? JSON.parse(AS.prefixed_cookie(COOKIE_NAME_STICKY_COLUMN)) : null;
      var COLUMN_WIDTHS =  AS.prefixed_cookie(COOKIE_NAME_COLUMN_WIDTHS) ? JSON.parse(AS.prefixed_cookie(COOKIE_NAME_COLUMN_WIDTHS)) : null;
      var COLUMN_ORDER =  AS.prefixed_cookie(COOKIE_NAME_COLUMN_ORDER) ? JSON.parse(AS.prefixed_cookie(COOKIE_NAME_COLUMN_ORDER)) : null;
      var DEFAULT_VALUES = {};

      // store section data
      var SECTION_DATA = {};
      $(".sections th", $table).each(function() {
        SECTION_DATA[$(this).data("id")] = $(this).text();
      });

      var validateSubmissionOnly = false;

      $modal.off("click").on("click", ".remove-row", function(event) {
        event.preventDefault();
        event.stopPropagation();

        var $btn = $(event.target).closest("button");

        if ($btn.hasClass("btn-danger")) {
          $btn.closest("tr").remove();
        } else {
          $btn.addClass("btn-danger");
          $("span", $btn).addClass("icon-white");
          setTimeout(function() {
            $btn.removeClass("btn-danger");
            $("span", $btn).removeClass("icon-white");
          }, 10000);
        }
      });

      $modal.on("click", "#rde_reset", function(event) {
        event.preventDefault();
        event.stopPropagation();

        $(":input, .btn", $rde_form).attr("disabled", "disabled");

        // reset cookies
        AS.prefixed_cookie(COOKIE_NAME_VISIBLE_COLUMN, null);
        AS.prefixed_cookie(COOKIE_NAME_COLUMN_WIDTHS, null);
        AS.prefixed_cookie(COOKIE_NAME_STICKY_COLUMN, null);
        AS.prefixed_cookie(COOKIE_NAME_COLUMN_ORDER, null);
        VISIBLE_COLUMN_IDS = null;
        STICKY_COLUMN_IDS = null;
        COLUMN_WIDTHS = null;
        COLUMN_ORDER = null;

        // reload the form
        $(document).triggerHandler("rdeload.aspace", [uri, $modal]);
      });

      $modal.on("click", ".add-row", function(event) {
        event.preventDefault();
        event.stopPropagation();

        var $row = addRow(event);

        $(":input:visible:first", $row).focus();

        $(".linker:not(.initialised)").linker();

        validateRows($row);
      });


      var setRowIndex = function() {
        current_row_index = Math.max($("tbody tr", $table).length-1, 0);
        $("tbody tr", $table).each(function(i, row) {
          $(row).data("index", i);
        });
      };
      var current_row_index = 0;
      setRowIndex();


      var addRow = function(event) {

        var $currentRow = $(event.target).closest("tr");
        if ($currentRow.length === 0) {
          $currentRow = $("table tbody tr:last", $rde_form);
        }

        current_row_index = current_row_index+1;

        var $row = $(AS.renderTemplate("template_rde_"+$rde_form.data("child-type")+"_row", {
          path: $rde_form.data("jsonmodel-type") + "[children]["+current_row_index+"]",
          id_path: $rde_form.data("jsonmodel-type") + "_children__"+current_row_index+"_",
          index: current_row_index
        }));

        $row.data("index", current_row_index);

        $(".fieldset-labels th", $rde_form).each(function(i, th) {
          var $th = $(th);

          // Apply any sticky columns
          if ($currentRow.length > 0) {
            if ($th.hasClass("fieldset-label") && $th.hasClass("sticky")) {
              // populate the input from the current or bottom row
              var $source = $(":input:first", $("td", $currentRow).get(i));
              var $target = $(":input:first", $("td", $row).get(i));

              if ($source.is(":checkbox")) {
                if ($source.is(":checked")) {
                  $target.attr("checked", "checked");
                } else {
                  $target.removeAttr("checked");
                }
              } else if ($source.is(":hidden") && $source.parents().closest("div").hasClass("linker-wrapper")) {
                // a linker!
                $target.attr("data-selected", $source.val());
              } else if ($source.is('.linker:text')) {
                // $source is a yet to be initialized linker (when adding multiple rows)
                $target.attr("data-selected", $source.attr("data-selected"));
              } else {
                $target.val($source.val());
              }
            } else if (DEFAULT_VALUES[$th.attr('id')]) {
              var $target = $(":input:first", $("td", $row).get(i));
              $target.val(DEFAULT_VALUES[$th.attr('id')]);
            }
          }

          // Apply hidden columns
          if ($th.hasClass("fieldset-label") && !isVisible($th.attr("id"))) {
            $($("td", $row).get(i)).hide();
          }

          // Apply column order
          if (COLUMN_ORDER != null) {
            $.each(COLUMN_ORDER, function(targetIndex, colId) {
              var $td = $("td[data-col='"+colId+"']", $row);
              var currentIndex = $td.index();

              if (targetIndex !== currentIndex) {
                $td.insertBefore($("td", $row).get(targetIndex));
              }
            });
          }
        });

        $currentRow.after($row);
        initOtherLevelHandler(current_row_index);
        return $row;
      };

      $modal.off("keydown").on("keydown", function(event) {
        if (event.keyCode === 27) { //esc
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      });

      // TODO - use hotkeys for this?
      $modal.on("keydown", ":input, input[type='text']", function(event) {
        var $row = $(event.target).closest("tr");
        var $cell = $(event.target).closest("td");

        if (event.keyCode === 13) { // return
          event.preventDefault();

          if (event.shiftKey) {
              $(".add-row", $row).trigger("click");
              $(":input:visible:first", $("td", $row.next())[$cell.index()]).focus();
          }
        } else if (event.keyCode === 27) { //esc
          event.preventDefault();
          event.stopImmediatePropagation();
          return true;
        } else if (event.keyCode === 37) { // left
          if (event.shiftKey) {
           event.preventDefault();
            $(":input:visible:first", prevActiveCell($cell)).focus();
          }
        } else if (event.keyCode === 40) { // down
          if (event.shiftKey) {
            event.preventDefault();
            if ($row.index() < $row.siblings().length) {
              $(":input:visible:first", $("td", $row.next())[$cell.index()]).focus();
            }
          }
        } else if (event.keyCode === 38) { // up
          if (event.shiftKey) {
            event.preventDefault();
            if ($row.index() > 0) {
              $(":input:visible:first", $("td", $row.prev())[$cell.index()]).focus();
            }
          }
        } else if (event.keyCode === 39) { // right
          if (event.shiftKey) {
            event.preventDefault();
            $(":input:visible:first", nextActiveCell($cell)).focus();
          }
        } else {
          // we're cool.
        }
      });

      $modal.on("click", "th.fieldset-label", function(event) {
        $(this).toggleClass("sticky");
        var sticky = [];
        $("table th.sticky", $rde_form).each(function() {
          sticky.push($(this).attr("id"));
        });
        STICKY_COLUMN_IDS = sticky;
        AS.prefixed_cookie(COOKIE_NAME_STICKY_COLUMN, JSON.stringify(STICKY_COLUMN_IDS));
      });

      $modal.on("click", "[data-dismiss]", function(event) {
        $modal.modal("hide");
      });

      var renderInlineErrors = function($rows, exception_data) {
        $(".linker:not(.initialised)").linker();
        $rows.each(function(i, row) {
          var $row = $(row);
          var row_result = exception_data[i];
          var $errorSummary = $(".error-summary", $row);
          var $errorSummaryList = $(".error-summary-list", $errorSummary)

          $errorSummaryList.empty();

          if (row_result.hasOwnProperty("errors") && !$.isEmptyObject(row_result.errors)) {
            $row.removeClass("valid").addClass("invalid");

            $.each(row_result.errors, function(name, error) {
              var $input = $("[id='"+$rde_form.data("jsonmodel-type")+"_children__"+$row.data("index")+"__"+name.replace(/\//g, "__")+"_']", $row);
              var $header = $($(".fieldset-labels th", $table).get($input.first().closest("td").index()));

              $input.closest(".form-group").addClass("has-error");

              var $error = $("<div class='error'>");

              if ($input.length > 1 || $input.hasClass("defer-to-section")) {
                $error.text(SECTION_DATA[$header.data("section")]);
              } else {
                $error.text($($(".fieldset-labels th", $table).get($input.closest("td").index())).text());
              }
              $error.append(" - ").append(error);
              $error.append("<span class='glyphicon glyphicon-chevron-right'>");
              $errorSummaryList.append($error);

              $error.data("target", $input.first().attr("id"));
            });

            // force a reposition of the error summary
            $(".modal-body", $modal).trigger("scroll");
          } else {
            $row.removeClass("invalid").addClass("valid");
          }
        });
      };

      var initAjaxForm = function() {
        $rde_form.ajaxForm({
          target: $(".rde-wrapper", $modal),
          success: function() {
            $(window).trigger("resize");
            $rde_form = $("form", "#rapidDataEntryModal");
            $table = $("table", $rde_form);

            setRowIndex();

            if ($rde_form.length) {
              renderInlineErrors($("tbody tr", $rde_form), $rde_form.data("exceptions"));

              initAjaxForm();
            } else {
              // we're good to go!
              setTimeout(function() {
                location.reload(true);
              }, 1000);
            }
          }
        });

        // add ability to resize columns
        $table.kiketable_colsizable({
          dragCells: "tr.fieldset-labels th.fieldset-label",
          dragMove: true
        });
        $("th.fieldset-label .kiketable-colsizable-handler", $table).on("dragend", persistColumnWidths);

        // add show/hide
        $table.columnManager();

        // give the columns an id
        $("table thead .fieldset-labels th").each(function(i, col) {
          if (!$(col).attr("id")) {
            $(col).attr("id", "rdecol"+i);
          }
          $($("table colgroup col").get(i)).data("id", $(col).attr("id"));
        });

        initAutoValidateFeature();
        applyColumnOrder();
        initColumnReorderFeature();
        initRdeTemplates();
        applyPersistentStickyColumns();
        initColumnShowHideWidget();
        initFillFeature();
        initShowInlineErrors();
        initOtherLevelHandler();
      };


      var initShowInlineErrors = function() {
        if ($("button.toggle-inline-errors").hasClass("active")) {
          $table.addClass("show-inline-errors");
        } else {
          $table.removeClass("show-inline-errors");
        }
      };


      var initOtherLevelHandler = function(index) {
        var index = index || 0;
        var $select = $("td[data-col='colLevel']:eq("+index+") select");

        if($select.val() === 'otherlevel') {
          enableCell("colOtherLevel", index);
        } else {
          disableCell("colOtherLevel", index);
        }

        $select.change(function() {
          if ($(this).val() === 'otherlevel') {
            enableCell("colOtherLevel", index);
          } else {
            disableCell("colOtherLevel", index);
          }
        });
      }


      var initAutoValidateFeature = function() {
        // Validate row upon input change
        $table.on("change", ":input:visible", function() {
          var $row = $(this).closest("tr");
          validateRows($row);
        });
        $(".modal-body", $modal).on("scroll", function(event) {
          $(".error-summary", $table).css("left", $(this)[0].scrollLeft + 5);
        });
        $table.on("focusin click", ":input", function() {
          $(this).closest("tr").addClass("last-focused").siblings().removeClass("last-focused");
        });
        $table.on("click", ".error-summary .error", function() {
          var $target = $("#"+$(this).data("target"));

          // if column is hidden, then show the column first
          if (!$target.is("visible")) {
            var colId = COLUMN_ORDER[$target.closest("td").index()];
            $("#rde_hidden_columns").multiselect("select", colId);
          }

          $target.closest("td").ScrollTo({
            axis: 'x',
            callback: function() {
              $target.focus();
            }
          });
        });
        $table.on("click", "td.status", function(event) {
          event.preventDefault();
          event.stopPropagation();

          if ($(event.target).closest(".error-summary").length > 0) {
            // don't propagate to the status cell
            // if clicking on an error
            return;
          }

          if ($(this).closest("tr").hasClass("last-focused")) {
            $("button.toggle-inline-errors").trigger("click");
          } else {
            $(this).closest("tr").addClass("last-focused").siblings().removeClass("last-focused");
          }
        });
        $table.on("click", ".hide-error-summary, .show-error-summary", function(event) {
          event.preventDefault();
          event.stopPropagation();

          $("button.toggle-inline-errors").trigger("click");
        });
      };

      var initFillFeature = function() {
        var $fillFormsContainer = $(".fill-column-form", $modal);
        var $btnFillFormToggle = $("button.fill-column", $modal);

        var $sourceRow = $("table tbody tr:first", $rde_form);

        // Setup global events
        $btnFillFormToggle.click(function(event) {
          event.preventDefault();
          event.stopPropagation();

          // toggle other panel if it is active
          if (!$(this).hasClass("active")) {
            $(".active", $(this).closest(".btn-group")).trigger("click");
          }

          $btnFillFormToggle.toggleClass("active");
          $fillFormsContainer.slideToggle();
        });

        // Setup Basic Fill form
        var setupBasicFillForm = function() {
          var $form = $("#fill_basic", $fillFormsContainer);
          var $inputTargetColumn = $("#basicFillTargetColumn", $form);
          var $btnFill = $("button", $form);

          // populate the column selectors
          populateColumnSelector($inputTargetColumn);

          $inputTargetColumn.change(function() {
            $(".empty", this).remove();

            var colIndex = parseInt($("#"+$(this).val()).index());

            var $input = $(":input:first", $("td", $sourceRow).get(colIndex)).clone();
            $input.attr("name", "").attr("id", "basicFillValue");
            $(".fill-value-container", $form).html($input);
            $btnFill.removeAttr("disabled").removeClass("disabled");
          });

          $btnFill.click(function(event) {
            event.preventDefault();
            event.stopPropagation();

            var colIndex = parseInt($("#"+$inputTargetColumn.val()).index())+1;

            var $targetCells = $("table tbody tr td:nth-child("+colIndex+")", $rde_form);

            if ($("#basicFillValue",$form).is(":checkbox")) {
              var fillValue = $("#basicFillValue",$form).is(":checked");
              if (fillValue) {
                $(":input:first", $targetCells).attr("checked", "checked");
              } else {
                $(":input:first", $targetCells).removeAttr("checked");
              }
            } else {
              var fillValue = $("#basicFillValue",$form).val();
              $(":input:first", $targetCells).val(fillValue);
            }

            $btnFillFormToggle.toggleClass("active");
            $fillFormsContainer.slideToggle();
            validateAllRows();
          });
        };

        // Setup Sequence Fill form
        var setupSequenceFillForm = function() {
          var $form = $("#fill_sequence", $fillFormsContainer);
          var $inputTargetColumn = $("#sequenceFillTargetColumn", $form);
          var $btnFill = $("button.btn-primary", $form);
          var $sequencePreview = $(".sequence-preview", $form);

          // populate the column selectors
          populateColumnSelector($inputTargetColumn, null, function($colHeader) {
            var $td = $("td", $sourceRow).get($colHeader.index());
            return $(":input:first", $td).is(":text");
          });

          $inputTargetColumn.change(function() {
            $(".empty", this).remove();
            $btnFill.removeAttr("disabled").removeClass("disabled");
          });

          $("button.preview-sequence", $form).click(function(event) {
            event.preventDefault();
            event.stopPropagation();

            $.getJSON($form.data("sequence-generator-url"),
                      {
                        prefix: $("#sequenceFillPrefix", $form).val(),
                        from: $("#sequenceFillFrom", $form).val(),
                        to: $("#sequenceFillTo", $form).val(),
                        suffix: $("#sequenceFillSuffix", $form).val(),
                        limit: $("tbody tr", $table).length
                      },
                      function(json) {
                        $sequencePreview.html("");
                        if (json.errors) {
                          $.each(json.errors, function(i, error) {
                            var $error = $("<div>").html(error).addClass("text-error");
                            $sequencePreview.append($error);
                          });
                        } else {
                          $sequencePreview.html($("<p class='values'>").html(json.values.join(", ")));
                          $sequencePreview.prepend($("<p class='summary'>").html(json.summary));
                        }
                      }
            );
          });

          var applySequenceFill = function(force) {
            $("#sequenceTooSmallMsg", $form).hide();

            $.getJSON($form.data("sequence-generator-url"),
                {
                  prefix: $("#sequenceFillPrefix", $form).val(),
                  from: $("#sequenceFillFrom", $form).val(),
                  to: $("#sequenceFillTo", $form).val(),
                  suffix: $("#sequenceFillSuffix", $form).val(),
                  limit: $("tbody tr", $table).length
                },
                function(json) {
                  $sequencePreview.html("");
                  if (json.errors) {
                    $.each(json.errors, function(i, error) {
                      var $error = $("<div>").html(error).addClass("text-error");
                      $sequencePreview.append($error);
                    });
                    return;
                  }

                  // check if less items in sequence than rows
                  if (!force && json.values.length < $("tbody tr", $modal).length) {
                    $("#sequenceTooSmallMsg", $form).show();
                    return;
                  }

                  // Good to go. Apply values.
                  var targetIndex = $("#"+$inputTargetColumn.val()).index();
                  var $targetCells = $("table tbody tr td:nth-child("+(targetIndex+1)+")", $rde_form);
                  $.each(json.values, function(i, val) {
                    if (i > $targetCells.length) {
                      return;
                    }
                    $(":input:first", $targetCells[i]).val(val);
                  });

                  $btnFillFormToggle.toggleClass("active");
                  $fillFormsContainer.slideToggle();
                  validateAllRows();
                }
            );
          }

          $btnFill.click(function(event) {
            event.preventDefault();
            event.stopPropagation();

            applySequenceFill(false);
          });

          $(".btn-continue-sequence-fill", $form).click(function(event) {
            event.preventDefault();
            event.stopPropagation();

            applySequenceFill(true);
          });
        };

        setupBasicFillForm();
        setupSequenceFillForm();
      };

      var persistColumnOrder = function() {
        var column_ids = [];
        $("table .fieldset-labels th", $rde_form).each(function() {
          column_ids.push($(this).attr("id"));
        });
        COLUMN_ORDER = column_ids;
        AS.prefixed_cookie(COOKIE_NAME_COLUMN_ORDER, JSON.stringify(COLUMN_ORDER));
      };

      var applyColumnOrder = function() {
        if (COLUMN_ORDER === null) {
          persistColumnOrder();
        } else {
          // apply order from cookie
          var $row = $("tr.fieldset-labels", $table);
          var $sectionRow = $("tr.sections", $table);
          var $colgroup = $("colgroup", $table);

          $sectionRow.html("");

          $.each(COLUMN_ORDER, function(targetIndex, colId) {
            var $th = $("#" + colId, $row);
            var currentIndex = $th.index();
            var $col = $($("col", $colgroup).get(currentIndex));

            // show hidden stuff so we get the section headers right
            // we'll reapply visibility at the end
            if (!isVisible(colId) && targetIndex > 0) {
              showColumn(currentIndex);
            }

            if (targetIndex !== currentIndex) {
                $th.insertBefore($("th", $row).get(targetIndex));
                $col.insertBefore($("col", $colgroup).get(targetIndex));
                $("tbody tr", $table).each(function(i, $tr) {
                  $($("td", $tr).get(currentIndex)).insertBefore($("td", $tr).get(targetIndex));
                });
            }

            // build the section row cells
            if (targetIndex === 0) {
              $sectionRow.append($("<th>").data("id", "empty").attr("colspan", "1"));
            } else if ($("th", $sectionRow).last().data("id") === $th.data("section")) {
              var $lastTh = $("th", $sectionRow).last();
              $lastTh.attr("colspan", parseInt($lastTh.attr("colspan"))+1);
            } else {
              $sectionRow.append($("<th>").data("id", $th.data("section")).addClass("section-"+$th.data("section")).attr("colspan", "1").text(SECTION_DATA[$th.data("section")]));
            }
          });

          applyPersistentVisibleColumns()
        }
      };


      var templateList = null;
      var initRdeTemplates = function() {
        initSaveTemplateFeature();
        loadRdeTemplateList(function() {
          initManageTemplatesFeature();
          initSelectTemplateFeature();
        });
      };

      var loadRdeTemplateList = function(cb) {
        var recordType = $rde_form.data("child-type");

        $.ajax({
          url: $rde_form.data("list-templates-uri"),
          type: 'GET',
          dataType: 'json',
          success: function(_templateList_) {
            templateList = _.filter(_templateList_, function(t) {
              return t.record_type === recordType;
            });
            cb();
          },
          error: function(xhr, status, err) {
            console.log(err);
          }
        });
      };


      var initSaveTemplateFeature = function() {
        var $saveContainer = $("#saveTemplateForm", $modal);
        var $containerToggle = $("button.save-template", $modal);
        var $input = $("#templateName", $saveContainer);
        var $btnSave = $(".btn-primary", $saveContainer);

        // Setup global events
        $containerToggle.off("click").on("click", function(event) {
          event.preventDefault();
          event.stopPropagation();

          // toggle other panel if it is active
          if (!$(this).hasClass("active")) {
            $(".active", $(this).closest(".btn-group")).trigger("click");
          }

          $containerToggle.toggleClass("active");
          $saveContainer.slideToggle();
        });

        $input.on('change keyup paste', function() {
          if ($(this).val().length > 0) {
            $btnSave.removeAttr("disabled").removeClass("disabled");
          } else {
            $btnSave.prop('disabled', true);
          }
        });

        $btnSave.click(function(event) {
          event.preventDefault();
          event.stopPropagation();

          var template = {
            record_type: $rde_form.data("child-type"),
            name: $input.val(),
            order: [],
            visible: [],
            defaults: {},
          }

          var $firstRow = $("table tbody tr:first", $rde_form);

         $("table .fieldset-labels th", $rde_form).each(function() {
            var colId = $(this).attr("id");

            template.order.push(colId);
            if ($(this).is(":visible")) {
              template.visible.push(colId);
            }

            var $cellOne =  $("td[data-col='"+colId+"']", $firstRow);

           if ($("input", $cellOne).length) {
             template.defaults[colId] = $("input", $cellOne).val();
           } else if ($("select", $cellOne).length) {
             template.defaults[colId] = $("select", $cellOne).val();
           }


          });

          template.defaults = _.pick(template.defaults, function(n) {
            return n.length > 0;
          });

          $.ajax({
            url: $rde_form.data("save-template-uri"),
            type: "POST",
            data: {template: template},
            dataType: "json",
            success: function(data) {
              loadRdeTemplateList(function() {
                initManageTemplatesFeature();
                initSelectTemplateFeature();
              });
              $containerToggle.toggleClass("active");
              $saveContainer.slideToggle();
            },
            error: function(xhr, status, err) {
              console.log(err);
            }
          });

        });
      };


      var initManageTemplatesFeature = function() {
        var $manageContainer = $("#manageTemplatesForm", $modal);
        var $containerToggle = $("button.manage-templates", $modal);

        var $templatesTable = $('table tbody', $manageContainer);

        $containerToggle.off("click").on("click", function(event) {
          event.preventDefault();
          event.stopPropagation();

          // toggle other panel if it is active
          if (!$(this).hasClass("active")) {
            $(".active", $(this).closest(".btn-group")).trigger("click");
          }

          $templatesTable.empty();
          renderTable();
          $containerToggle.toggleClass("active");
          $manageContainer.slideToggle();
        });


        $("button.btn-cancel", $manageContainer).off("click").on("click", function(e) {
          e.preventDefault();
          e.stopPropagation();
          $containerToggle.toggleClass("active");
          $manageContainer.slideToggle();
        });


        $("button.btn-primary", $manageContainer).off("click").on("click", function(e) {
          e.preventDefault();
          e.stopPropagation();

          var templatesToDelete = [];
          $manageContainer.find(":checkbox:checked").each(function(){
            templatesToDelete.push($(this).val());
          });

          $.ajax({
            url: $rde_form.data("list-templates-uri") + "/batch_delete",
            type: 'POST',
            dataType: 'json',
            data: {ids: templatesToDelete},
            success: function(updatedTemplateList) {
              templateList = updatedTemplateList;
              initSelectTemplateFeature();
            },
            error: function(xhr, status, err) {
              console.log(err);
            }
          });

          $containerToggle.toggleClass("active");
          $manageContainer.slideToggle();
        });


        var renderTable = function() {
          if (templateList.length == 0) {
            $(".no-templates-message", $manageContainer).show();
            $(".btn-primary", $manageContainer).hide();
            return;
          } else {
            $(".no-templates-message", $manageContainer).hide();
            $(".btn-primary", $manageContainer).show();
          }

          _.each(templateList, function(item) {
            $templatesTable.append(AS.renderTemplate("rde_template_table_row", {item: item}));
          });
        };


        $.ajax({
          url: $rde_form.data("list-templates-uri"),
          type: 'GET',
          dataType: 'json',
          success: function(_templateList_) {
            templateList = _templateList_;
          }
        });
      };


      var applyTemplate = function(template) {
        COLUMN_ORDER = template.order;
        VISIBLE_COLUMN_IDS = template.visible;
        DEFAULT_VALUES = template.defaults;

        applyColumnOrder();

        var $firstRow = $("tbody tr:first", $rde_form);

        _.each($("td", $firstRow), function(td) {
          var $td = $( td );
          var colId = $td.data('col');
          var $$input = $(":input:first", $td)
          if (DEFAULT_VALUES[colId] && ($$input.data('value-from-template') || $$input.val().length < 1)) {
            $$input.val(DEFAULT_VALUES[colId]);
            $$input.data('value-from-template', true);
          }
        });
      };


      var initSelectTemplateFeature = function() {

        var $select = $("#rde_select_template");

        $select.change(function() {
          var id = $("option:selected", $select).val();
          $.ajax({
            url: $rde_form.data("template-base-uri") + "/" + id,
            type: 'GET',
            dataType: 'json',
            success: function(template) {
              applyTemplate(template);
              $select.attr('data-style', 'btn-success');
              $select.selectpicker('refresh');
            }
          });


        });

        var renderOptions = function() {
          $select.empty();

          $select.append($("<option>", {disabled : "disabled" , selected: 'selected'})
                         .text($select.data('prompt-text')));

          _.each(templateList, function(item) {

            $select.append($("<option>", {value : item.id })
                           .text(item.name));

          });

          $select.selectpicker('refresh');
        };

        renderOptions();
      };


      var initColumnReorderFeature = function() {
        var $reorderContainer = $("#columnReorderForm", $modal);
        var $btnReorderToggle = $("button.reorder-columns", $modal);
        var $select = $("#columnOrder", $reorderContainer);
        var $btnApplyOrder = $(".btn-primary", $reorderContainer);


        // Setup global events
        $btnReorderToggle.off("click").on("click", function(event) {
          event.preventDefault();
          event.stopPropagation();

          // toggle other panel if it is active
          if (!$(this).hasClass("active")) {
            $(".active", $(this).closest(".btn-group")).trigger("click");
          }

          $btnReorderToggle.toggleClass("active");
          $reorderContainer.slideToggle();
        });

        populateColumnSelector($select);
        $select.attr("size", $("option", $select).length / 2);

        var handleMove = function(direction) {
          var $options = $("option:selected", $select);
          if ($options.length) {
            if (direction === "up") {
              $options.first().prev().before($options);
            } else {
              $options.last().next().after($options);
            }
          }
          $btnApplyOrder.removeAttr("disabled").removeClass("disabled");
        };

        var resetForm = function() {
          $btnReorderToggle.toggleClass("active");
          $reorderContainer.slideToggle(function() {
            $btnApplyOrder.addClass("disabled").attr("disabled", "disabled");
            // reset the select
            $select.html("");
            populateColumnSelector($select);
          });
        }

        $('#columnOrderUp', $reorderContainer).bind('click', function() {
          handleMove("up");
        });
        $('#columnOrderDown', $reorderContainer).bind('click', function() {
          handleMove("down");
        });
        $(".btn-cancel", $reorderContainer).click(function(event) {
          event.preventDefault();
          event.stopPropagation();

          resetForm();
        });
        $btnApplyOrder.click(function(event) {
          event.preventDefault();
          event.stopPropagation();

          COLUMN_ORDER = ["colStatus"];
          $("option", $select).each(function() {
            COLUMN_ORDER.push($(this).val());
          });
          COLUMN_ORDER.push("colActions");

          applyColumnOrder();
          resetForm();
          persistColumnOrder();
        });
      };

      var populateColumnSelector = function($select, select_func, filter_func) {
        filter_func = filter_func || function() {return true;};
        select_func = select_func || function() {return false;};
        $(".fieldset-labels th", $rde_form).each(function() {
          var $colHeader = $(this);
          if ($colHeader.hasClass("fieldset-label") && filter_func($colHeader)) {
            var $option = $("<option>");
            var option_text = "";
            option_text += $(".section-"+$colHeader.data("section")+":first").text();
            option_text += " - ";
            option_text += $colHeader.text();

            $option.val($colHeader.attr("id")).text(option_text);
            if ($(this).hasClass('required')) {
              $option.attr("disabled", true);
              var colId = $(this).attr("id");
              if (VISIBLE_COLUMN_IDS != null && $.inArray(colId, VISIBLE_COLUMN_IDS) < 0) {
                VISIBLE_COLUMN_IDS.push(colId);
              }
              showColumn($(this).attr("columnIndex"));
            }
            if (select_func($colHeader)) {
              $option.attr("selected", "selected");
            }
            $select.append($option);
          }
        });
      };

      var initColumnShowHideWidget = function() {
        var $select = $("#rde_hidden_columns");
        populateColumnSelector($select, function($colHeader) {
          return isVisible($colHeader.attr("id"));
        });
        $select.multiselect({
          buttonClass: 'btn btn-small btn-default',
          buttonWidth: 'auto',
          maxHeight: 300,
          buttonContainer: '<div class="btn-group" />',
          buttonText: function(options) {
            if (options.length == 0) {
              return $select.data("i18n-none") + ' <b class="caret"></b>';
            }
            else if (options.length > 5) {
              return $select.data("i18n-prefix") + ' ' + options.length + ' ' + $select.data("i18n-suffix") + ' <b class="caret"></b>';
            }
            else {
              var selected = $select.data("i18n-prefix") + " ";
              options.each(function() {
                selected += $(this).text() + ', ';
              });
              return selected.substr(0, selected.length -2) + ' <b class="caret"></b>';
            }
          },
          onChange: function($option, checked) {
            var widths = persistColumnWidths();
            var colId = $option.val();
            var index = $("#" + colId).index();

            if (checked) {
              $table.showColumns(index+1);
              var $col = $($("table colgroup col").get(index));
              $col.show();
              $table.width($table.width() + widths[index]);
            } else {
              hideColumn(index);
            }

            VISIBLE_COLUMN_IDS = $select.val();
            AS.prefixed_cookie(COOKIE_NAME_VISIBLE_COLUMN, JSON.stringify(VISIBLE_COLUMN_IDS));
          }
        });

        applyPersistentVisibleColumns();
      };

      var persistColumnWidths = function() {
        var widths = {};
        $("table colgroup col", $rde_form).each(function(i, col) {
          if ($(col).prop("width") === null || $(col).prop("width") === "") {
            $(col).prop("width", $(col).data("default-width"));
          } else if ($(col).css("width")) {
            var newWidth = parseInt($(col).css("width"));
            $(col).prop("width", newWidth);
          }
          widths[$(col).data("id")] = parseInt($(col).prop("width"));
        });

        COLUMN_WIDTHS = widths;
        AS.prefixed_cookie(COOKIE_NAME_COLUMN_WIDTHS, JSON.stringify(COLUMN_WIDTHS));

        return COLUMN_WIDTHS;
      };

      var setColumnWidth = function(colId) {
        var width = getColumnWidth(colId);
        var index = $("#"+colId).index();

        // set width of corresponding col element
        $($("table colgroup col", $rde_form).get(index)).width(width);

        return width;
      };

      var getColumnWidth = function(colId) {
        if ( COLUMN_WIDTHS ) {
          return COLUMN_WIDTHS[colId];
        } else {
          persistColumnWidths();
          return getColumnWidth(colId);
        }
      };

      var applyPersistentColumnWidths = function() {
        var total_width = 0;

        // force table layout to auto
        $table.css("tableLayout", "auto");

        $("colgroup col", $table).each(function(i, el) {
          var colW = getColumnWidth($(el).data("id"));
          $(el).prop("width", colW);
          total_width += colW;
        });

        $table.width(total_width);

        // and then change table layout to fixed to force a redraw to
        // ensure all colgroup widths are obeyed
        $table.css("tableLayout", "fixed");
      };

      var applyPersistentStickyColumns = function() {
        if ( STICKY_COLUMN_IDS ) {
          $("th.sticky", $rde_form).removeClass("sticky");
          $.each(STICKY_COLUMN_IDS, function() {
            $("#" + this).addClass("sticky");
          });
        }
      };

      var isVisible = function(colId) {
        if ( VISIBLE_COLUMN_IDS ) {
          return  $.inArray(colId, VISIBLE_COLUMN_IDS) >= 0
        } else {
          return true;
        }
      };

      var applyPersistentVisibleColumns = function() {
        if ( VISIBLE_COLUMN_IDS ) {
          var total_width = 0;

          $.each($(".fieldset-labels th", $rde_form), function() {
            var colId = $(this).attr("id");
            var index = $(this).index();

            if ($(this).hasClass("fieldset-label")) {
              if (isVisible(colId)) {
                total_width += setColumnWidth(colId);
              } else {
                hideColumn(index);
              }
            } else {
              total_width += setColumnWidth(colId);
            }
          });
          $table.width(total_width);
        } else {
          applyPersistentColumnWidths();
        }
      };

      var hideColumn = function(index) {
        $table.hideColumns(index+1);
        var $col = $($("table colgroup col").get(index));
        $table.width($table.width() - $col.width());
        $col.hide();
      };


      var showColumn = function(index) {
        $table.showColumns(index+1);
        var $col = $($("table colgroup col").get(index));
        $table.width($table.width() + $col.width());
        $col.show();
      }

      var enableCell = function(colId, rowIndex) {
        var row = $("tbody tr")[rowIndex];
        var cell = $("td[data-col='"+colId+"']", row);

        cell.removeClass("disabled");
        $('input', cell).removeAttr("disabled");
      }

      var disableCell = function(colId, rowIndex) {
        var row = $("tbody tr")[rowIndex];
        var cell = $("td[data-col='"+colId+"']", row);

        cell.addClass("disabled");
        $('input', cell).attr("disabled", "disabled");
      };

      var prevActiveCell = function($cell) {
        var prev = $cell.prev();
        if (prev.hasClass('disabled')) {
          return prevActiveCell(prev);
        } else {
          return prev;
        }
      };


      var nextActiveCell = function($cell) {
        var next = $cell.next();
        if (next.hasClass('disabled')) {
          return nextActiveCell(next);
        } else {
          return next;
        }
      };


      var validateAllRows = function() {
        validateRows($("tbody tr", $table));
      };

      var validateRows = function($rows) {
        var row_data = $rows.serializeObject();

        row_data["validate_only"] = "true";

        $(".error", $rows).removeClass("error");

        $.ajax({
          url: $rde_form.data("validate-row-uri"),
          type: "POST",
          data: row_data,
          dataType: "json",
          success: function(data) {
            renderInlineErrors($rows, data);
          }
        });
      };

      // Connect up the $modal form submit button
      $($modal).on("click", ".modal-footer .btn-primary", function() {
        $(this).attr("disabled","disabled");
        $rde_form.submit();
      });

      // Connect up the $modal form validate button
      $($modal).on("click", "#validateButton", function(event) {
        event.preventDefault();
        event.stopPropagation();

        validateSubmissionOnly = true;
        $(this).attr("disabled","disabled");
        $rde_form.append("<input type='hidden' name='validate_only' value='true'>");
        $rde_form.submit();
      });

      // enable form within the add row dropdown menu
      $(".add-rows-form input", $modal).click(function(event) {
        event.preventDefault();
        event.stopPropagation();
      });
      $(".add-rows-form button", $modal).click(function(event) {
        var rows = [];
        try {
          var numberOfRows = parseInt($("input", $(this).closest('.add-rows-form')).val(), 10);
          for (var i=1; i<=numberOfRows; i++) {
            rows.push(addRow(event));
          }
        } catch(e) {
          // if the field cannot parse the form value to an integer.. just quietly judge the user
        }
        validateRows($(rows));
      });

      // Connect the Inline Errors toggle
      $modal.on("click", "button.toggle-inline-errors", function(event) {
        event.preventDefault();
        event.stopPropagation();

        $(this).toggleClass("active");
        $table.toggleClass("show-inline-errors");
      });

      $modal.on("keyup", "button", function(event) {
        // pass on Return key hits as a click
        if (event.keyCode === 13) {
          $(this).trigger("click");
        }
      });

      $(document).triggerHandler("loadedrecordform.aspace", [$rde_form]);

      initAjaxForm();

      $(window).trigger("resize");

      // auto-validate the first row
      setTimeout(function() {
        validateAllRows();
      });
    });

    $("select.selectpicker", $modal).selectpicker();
  };

  $(document).bind("rdeload.aspace", function(event, uri, $modal) {
    var path = uri.replace(/^\/repositories\/[0-9]+\//, '');

    $.ajax({
      url: AS.app_prefix(path+"/rde"),
      success: function(data) {
        $(".rde-wrapper", $modal).replaceWith("<div class='modal-body'></div>");
        $(".modal-body", $modal).replaceWith(data);
        $("form", "#rapidDataEntryModal").init_rapid_data_entry_form($modal, uri);
      }
    });
  });

  $(document).bind("rdeshow.aspace", function(event, $node, $button) {
    var $modal = AS.openCustomModal("rapidDataEntryModal", $button.text(), AS.renderTemplate("modal_content_loading_template"), 'full', {backdrop: 'static', keyboard: false}, $button);

    $(document).triggerHandler("rdeload.aspace", [$node.data('uri'), $modal]);
  });

});
