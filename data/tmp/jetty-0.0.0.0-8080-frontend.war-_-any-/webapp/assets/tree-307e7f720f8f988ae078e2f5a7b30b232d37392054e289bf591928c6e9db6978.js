/*!
 * jQuery hashchange event - v1.3 - 7/21/2010
 * http://benalman.com/projects/jquery-hashchange-plugin/
 * 
 * Copyright (c) 2010 "Cowboy" Ben Alman
 * Dual licensed under the MIT and GPL licenses.
 * http://benalman.com/about/license/
 */

// Script: jQuery hashchange event
//
// *Version: 1.3, Last updated: 7/21/2010*
// 
// Project Home - http://benalman.com/projects/jquery-hashchange-plugin/
// GitHub       - http://github.com/cowboy/jquery-hashchange/
// Source       - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.js
// (Minified)   - http://github.com/cowboy/jquery-hashchange/raw/master/jquery.ba-hashchange.min.js (0.8kb gzipped)
// 
// About: License
// 
// Copyright (c) 2010 "Cowboy" Ben Alman,
// Dual licensed under the MIT and GPL licenses.
// http://benalman.com/about/license/
// 
// About: Examples
// 
// These working examples, complete with fully commented code, illustrate a few
// ways in which this plugin can be used.
// 
// hashchange event - http://benalman.com/code/projects/jquery-hashchange/examples/hashchange/
// document.domain - http://benalman.com/code/projects/jquery-hashchange/examples/document_domain/
// 
// About: Support and Testing
// 
// Information about what version or versions of jQuery this plugin has been
// tested with, what browsers it has been tested in, and where the unit tests
// reside (so you can test it yourself).
// 
// jQuery Versions - 1.2.6, 1.3.2, 1.4.1, 1.4.2
// Browsers Tested - Internet Explorer 6-8, Firefox 2-4, Chrome 5-6, Safari 3.2-5,
//                   Opera 9.6-10.60, iPhone 3.1, Android 1.6-2.2, BlackBerry 4.6-5.
// Unit Tests      - http://benalman.com/code/projects/jquery-hashchange/unit/
// 
// About: Known issues
// 
// While this jQuery hashchange event implementation is quite stable and
// robust, there are a few unfortunate browser bugs surrounding expected
// hashchange event-based behaviors, independent of any JavaScript
// window.onhashchange abstraction. See the following examples for more
// information:
// 
// Chrome: Back Button - http://benalman.com/code/projects/jquery-hashchange/examples/bug-chrome-back-button/
// Firefox: Remote XMLHttpRequest - http://benalman.com/code/projects/jquery-hashchange/examples/bug-firefox-remote-xhr/
// WebKit: Back Button in an Iframe - http://benalman.com/code/projects/jquery-hashchange/examples/bug-webkit-hash-iframe/
// Safari: Back Button from a different domain - http://benalman.com/code/projects/jquery-hashchange/examples/bug-safari-back-from-diff-domain/
// 
// Also note that should a browser natively support the window.onhashchange 
// event, but not report that it does, the fallback polling loop will be used.
// 
// About: Release History
// 
// 1.3   - (7/21/2010) Reorganized IE6/7 Iframe code to make it more
//         "removable" for mobile-only development. Added IE6/7 document.title
//         support. Attempted to make Iframe as hidden as possible by using
//         techniques from http://www.paciellogroup.com/blog/?p=604. Added 
//         support for the "shortcut" format $(window).hashchange( fn ) and
//         $(window).hashchange() like jQuery provides for built-in events.
//         Renamed jQuery.hashchangeDelay to <jQuery.fn.hashchange.delay> and
//         lowered its default value to 50. Added <jQuery.fn.hashchange.domain>
//         and <jQuery.fn.hashchange.src> properties plus document-domain.html
//         file to address access denied issues when setting document.domain in
//         IE6/7.
// 1.2   - (2/11/2010) Fixed a bug where coming back to a page using this plugin
//         from a page on another domain would cause an error in Safari 4. Also,
//         IE6/7 Iframe is now inserted after the body (this actually works),
//         which prevents the page from scrolling when the event is first bound.
//         Event can also now be bound before DOM ready, but it won't be usable
//         before then in IE6/7.
// 1.1   - (1/21/2010) Incorporated document.documentMode test to fix IE8 bug
//         where browser version is incorrectly reported as 8.0, despite
//         inclusion of the X-UA-Compatible IE=EmulateIE7 meta tag.
// 1.0   - (1/9/2010) Initial Release. Broke out the jQuery BBQ event.special
//         window.onhashchange functionality into a separate plugin for users
//         who want just the basic event & back button support, without all the
//         extra awesomeness that BBQ provides. This plugin will be included as
//         part of jQuery BBQ, but also be available separately.

(function($,window,undefined){
  '$:nomunge'; // Used by YUI compressor.
  
  // Reused string.
  var str_hashchange = 'hashchange',
    
    // Method / object references.
    doc = document,
    fake_onhashchange,
    special = $.event.special,
    
    // Does the browser support window.onhashchange? Note that IE8 running in
    // IE7 compatibility mode reports true for 'onhashchange' in window, even
    // though the event isn't supported, so also test document.documentMode.
    doc_mode = doc.documentMode,
    supports_onhashchange = 'on' + str_hashchange in window && ( doc_mode === undefined || doc_mode > 7 );
  
  // Get location.hash (or what you'd expect location.hash to be) sans any
  // leading #. Thanks for making this necessary, Firefox!
  function get_fragment( url ) {
    url = url || location.href;
    return '#' + url.replace( /^[^#]*#?(.*)$/, '$1' );
  };
  
  // Method: jQuery.fn.hashchange
  // 
  // Bind a handler to the window.onhashchange event or trigger all bound
  // window.onhashchange event handlers. This behavior is consistent with
  // jQuery's built-in event handlers.
  // 
  // Usage:
  // 
  // > jQuery(window).hashchange( [ handler ] );
  // 
  // Arguments:
  // 
  //  handler - (Function) Optional handler to be bound to the hashchange
  //    event. This is a "shortcut" for the more verbose form:
  //    jQuery(window).bind( 'hashchange', handler ). If handler is omitted,
  //    all bound window.onhashchange event handlers will be triggered. This
  //    is a shortcut for the more verbose
  //    jQuery(window).trigger( 'hashchange' ). These forms are described in
  //    the <hashchange event> section.
  // 
  // Returns:
  // 
  //  (jQuery) The initial jQuery collection of elements.
  
  // Allow the "shortcut" format $(elem).hashchange( fn ) for binding and
  // $(elem).hashchange() for triggering, like jQuery does for built-in events.
  $.fn[ str_hashchange ] = function( fn ) {
    return fn ? this.bind( str_hashchange, fn ) : this.trigger( str_hashchange );
  };
  
  // Property: jQuery.fn.hashchange.delay
  // 
  // The numeric interval (in milliseconds) at which the <hashchange event>
  // polling loop executes. Defaults to 50.
  
  // Property: jQuery.fn.hashchange.domain
  // 
  // If you're setting document.domain in your JavaScript, and you want hash
  // history to work in IE6/7, not only must this property be set, but you must
  // also set document.domain BEFORE jQuery is loaded into the page. This
  // property is only applicable if you are supporting IE6/7 (or IE8 operating
  // in "IE7 compatibility" mode).
  // 
  // In addition, the <jQuery.fn.hashchange.src> property must be set to the
  // path of the included "document-domain.html" file, which can be renamed or
  // modified if necessary (note that the document.domain specified must be the
  // same in both your main JavaScript as well as in this file).
  // 
  // Usage:
  // 
  // jQuery.fn.hashchange.domain = document.domain;
  
  // Property: jQuery.fn.hashchange.src
  // 
  // If, for some reason, you need to specify an Iframe src file (for example,
  // when setting document.domain as in <jQuery.fn.hashchange.domain>), you can
  // do so using this property. Note that when using this property, history
  // won't be recorded in IE6/7 until the Iframe src file loads. This property
  // is only applicable if you are supporting IE6/7 (or IE8 operating in "IE7
  // compatibility" mode).
  // 
  // Usage:
  // 
  // jQuery.fn.hashchange.src = 'path/to/file.html';
  
  $.fn[ str_hashchange ].delay = 50;
  /*
  $.fn[ str_hashchange ].domain = null;
  $.fn[ str_hashchange ].src = null;
  */
  
  // Event: hashchange event
  // 
  // Fired when location.hash changes. In browsers that support it, the native
  // HTML5 window.onhashchange event is used, otherwise a polling loop is
  // initialized, running every <jQuery.fn.hashchange.delay> milliseconds to
  // see if the hash has changed. In IE6/7 (and IE8 operating in "IE7
  // compatibility" mode), a hidden Iframe is created to allow the back button
  // and hash-based history to work.
  // 
  // Usage as described in <jQuery.fn.hashchange>:
  // 
  // > // Bind an event handler.
  // > jQuery(window).hashchange( function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // > 
  // > // Manually trigger the event handler.
  // > jQuery(window).hashchange();
  // 
  // A more verbose usage that allows for event namespacing:
  // 
  // > // Bind an event handler.
  // > jQuery(window).bind( 'hashchange', function(e) {
  // >   var hash = location.hash;
  // >   ...
  // > });
  // > 
  // > // Manually trigger the event handler.
  // > jQuery(window).trigger( 'hashchange' );
  // 
  // Additional Notes:
  // 
  // * The polling loop and Iframe are not created until at least one handler
  //   is actually bound to the 'hashchange' event.
  // * If you need the bound handler(s) to execute immediately, in cases where
  //   a location.hash exists on page load, via bookmark or page refresh for
  //   example, use jQuery(window).hashchange() or the more verbose 
  //   jQuery(window).trigger( 'hashchange' ).
  // * The event can be bound before DOM ready, but since it won't be usable
  //   before then in IE6/7 (due to the necessary Iframe), recommended usage is
  //   to bind it inside a DOM ready handler.
  
  // Override existing $.event.special.hashchange methods (allowing this plugin
  // to be defined after jQuery BBQ in BBQ's source code).
  special[ str_hashchange ] = $.extend( special[ str_hashchange ], {
    
    // Called only when the first 'hashchange' event is bound to window.
    setup: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to create our own. And we don't want to call this
      // until the user binds to the event, just in case they never do, since it
      // will create a polling loop and possibly even a hidden Iframe.
      $( fake_onhashchange.start );
    },
    
    // Called only when the last 'hashchange' event is unbound from window.
    teardown: function() {
      // If window.onhashchange is supported natively, there's nothing to do..
      if ( supports_onhashchange ) { return false; }
      
      // Otherwise, we need to stop ours (if possible).
      $( fake_onhashchange.stop );
    }
    
  });
  
  // fake_onhashchange does all the work of triggering the window.onhashchange
  // event for browsers that don't natively support it, including creating a
  // polling loop to watch for hash changes and in IE 6/7 creating a hidden
  // Iframe to enable back and forward.
  fake_onhashchange = (function(){
    var self = {},
      timeout_id,
      
      // Remember the initial hash so it doesn't get triggered immediately.
      last_hash = get_fragment(),
      
      fn_retval = function(val){ return val; },
      history_set = fn_retval,
      history_get = fn_retval;
    
    // Start the polling loop.
    self.start = function() {
      timeout_id || poll();
    };
    
    // Stop the polling loop.
    self.stop = function() {
      timeout_id && clearTimeout( timeout_id );
      timeout_id = undefined;
    };
    
    // This polling loop checks every $.fn.hashchange.delay milliseconds to see
    // if location.hash has changed, and triggers the 'hashchange' event on
    // window when necessary.
    function poll() {
      var hash = get_fragment(),
        history_hash = history_get( last_hash );
      
      if ( hash !== last_hash ) {
        history_set( last_hash = hash, history_hash );
        
        $(window).trigger( str_hashchange );
        
      } else if ( history_hash !== last_hash ) {
        location.href = location.href.replace( /#.*/, '' ) + history_hash;
      }
      
      timeout_id = setTimeout( poll, $.fn[ str_hashchange ].delay );
    };
    
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvv REMOVE IF NOT SUPPORTING IE6/7/8 vvvvvvvvvvvvvvvvvvv
    // vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv
    $.browser.msie && !supports_onhashchange && (function(){
      // Not only do IE6/7 need the "magical" Iframe treatment, but so does IE8
      // when running in "IE7 compatibility" mode.
      
      var iframe,
        iframe_src;
      
      // When the event is bound and polling starts in IE 6/7, create a hidden
      // Iframe for history handling.
      self.start = function(){
        if ( !iframe ) {
          iframe_src = $.fn[ str_hashchange ].src;
          iframe_src = iframe_src && iframe_src + get_fragment();
          
          // Create hidden Iframe. Attempt to make Iframe as hidden as possible
          // by using techniques from http://www.paciellogroup.com/blog/?p=604.
          iframe = $('<iframe tabindex="-1" title="empty"/>').hide()
            
            // When Iframe has completely loaded, initialize the history and
            // start polling.
            .one( 'load', function(){
              iframe_src || history_set( get_fragment() );
              poll();
            })
            
            // Load Iframe src if specified, otherwise nothing.
            .attr( 'src', iframe_src || 'javascript:0' )
            
            // Append Iframe after the end of the body to prevent unnecessary
            // initial page scrolling (yes, this works).
            .insertAfter( 'body' )[0].contentWindow;
          
          // Whenever `document.title` changes, update the Iframe's title to
          // prettify the back/next history menu entries. Since IE sometimes
          // errors with "Unspecified error" the very first time this is set
          // (yes, very useful) wrap this with a try/catch block.
          doc.onpropertychange = function(){
            try {
              if ( event.propertyName === 'title' ) {
                iframe.document.title = doc.title;
              }
            } catch(e) {}
          };
          
        }
      };
      
      // Override the "stop" method since an IE6/7 Iframe was created. Even
      // if there are no longer any bound event handlers, the polling loop
      // is still necessary for back/next to work at all!
      self.stop = fn_retval;
      
      // Get history by looking at the hidden Iframe's location.hash.
      history_get = function() {
        return get_fragment( iframe.location.href );
      };
      
      // Set a new history item by opening and then closing the Iframe
      // document, *then* setting its location.hash. If document.domain has
      // been set, update that as well.
      history_set = function( hash, history_hash ) {
        var iframe_doc = iframe.document,
          domain = $.fn[ str_hashchange ].domain;
        
        if ( hash !== history_hash ) {
          // Update Iframe with any initial `document.title` that might be set.
          iframe_doc.title = doc.title;
          
          // Opening the Iframe's document after it has been closed is what
          // actually adds a history entry.
          iframe_doc.open();
          
          // Set document.domain for the Iframe document as well, if necessary.
          domain && iframe_doc.write( '<script>document.domain="' + domain + '"</script>' );
          
          iframe_doc.close();
          
          // Update the Iframe's hash, for great justice.
          iframe.location.hash = hash;
        }
      };
      
    })();
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^ REMOVE IF NOT SUPPORTING IE6/7/8 ^^^^^^^^^^^^^^^^^^^
    // ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    
    return self;
  })();
  
})(jQuery,this);

var FORM_CHANGED_KEY = 'form_changed';
var FORM_SUBMITTED_EVENT = 'submitted';

function AjaxTree(tree, $pane) {
    var self = this;

    this.tree = tree;
    this.$pane = $pane;

    this._ignore_hash_change = false;

    // load initial pane!
    var tree_id = this.tree_id_from_hash();

    if (tree_id == null) {
        tree_id = tree.large_tree.root_tree_id;
        location.hash = 'tree::' + tree_id;
    }

    this.tree.large_tree.setCurrentNode(tree_id, function() {
        self.scroll_to_node(tree_id);
        if (tree.current().is(':not(.root-row)')) {
            tree.large_tree.expandNode(tree.current());
        }
    });

    tree.large_tree.elt.on('click', 'a.record-title', function (e) {
        var row = $(this).closest('tr');
        if (row.is('.current') && row.find('.expandme').css('visibility') !== 'hidden') {
            /* We've clicked on the title of the current row, which also has children. */
            if (row.find('.expandme .expanded').length > 0) {
                /* It was expanded, so we collapse it. */
                tree.large_tree.collapseNode(tree.current());
            } else {
                /* It was collapsed, so we expand it. */
                tree.large_tree.expandNode(tree.current());
            }
        }

        return true;
    });

    this.loadPaneForId(tree_id);
    this.setupHashChange();
}

AjaxTree.prototype.setupHashChange = function() {
    $(window).hashchange($.proxy(this.handleHashChange, this));
};

AjaxTree.prototype.tree_id_from_hash = function() {
    if (!location.hash) {
        return;
    }

    var tree_id = location.hash.replace(/^#(tree::)?/, "");

    if (TreeIds.parse_tree_id(tree_id)) {
        return tree_id;
    } else {
        return null;
    }
}

AjaxTree.prototype.handleHashChange = function(event) {
    var self = this;

    if (self._ignore_hash_change) {
        // ignored! and now stop ignoring..
        this._ignore_hash_change = false;
        return false;
    }

    var tree_id = self.tree_id_from_hash();

    if (tree_id == null) {
        return false;
    }

    self.check_for_form_changes(tree_id, function() {
        self.tree.large_tree.setCurrentNode(tree_id);

        if (tree.current().is(':not(.root-row)')) {
            tree.large_tree.expandNode(tree.current());
        }

        self.loadPaneForId(tree_id);
    });

    return false;
};

AjaxTree.prototype.loadPaneForId = function(tree_id) {
    var self = this;

    var params = {};
    params.inline = true;
    params[self.tree.large_tree.root_node_type + '_id'] = self.tree.large_tree.root_uri;

    var parsed = TreeIds.parse_tree_id(tree_id);
    var row_type = parsed.type;
    var row_id = parsed.id;

    var url = AS.app_prefix(row_type + 's' + '/' + row_id);

    if (!self.tree.large_tree.read_only) {
        url = url + "/edit";
    }

    self._ajax_the_pane(url, params, $.noop);
};

AjaxTree.prototype._ajax_the_pane = function(url, params, callback) {
    var self = this;

    var initial_location = window.location.hash;

    self.blockout_form();

    $.ajax({
        url: url,
        type: 'GET',
        data: params,
        success: function(html) {
            if (window.location.hash != initial_location) {
                return;
            }

            self.$pane.html(html);
            if (!self.tree.large_tree.read_only) {
                self.setup_ajax_form();
            }
            $(document).trigger("loadedrecordform.aspace", [self.$pane]);
            callback();
        },
        error: function(obj, errorText, errorDesc) {
            $("#object_container").html("<div class='alert alert-error'><p>An error occurred loading this form.</p><pre>"+errorDesc+"</pre></div>");
        }
    });
}


AjaxTree.prototype.setup_ajax_form = function() {
    var self = this;

    var $form = $("form", self.$pane);

    $form.ajaxForm({
        data: {
            inline: true
        },
        beforeSubmit: function(arr, $form) {
            $(".btn-primary", $form).attr("disabled","disabled");

            if ($form.data("createPlusOne")) {
                arr.push({
                    name: "plus_one",
                    value: "true",
                    required: false,
                    type: "text"
                });
            }
        },
        success: function(response, status, xhr) {
            var shouldPlusOne =  self.$pane.find('form').data('createPlusOne');

            self.$pane.html(response);

            var $form = self.setup_ajax_form();

            $(document).trigger("loadedrecordform.aspace", [self.$pane]);

            if ($form.find('.error').length > 0) {
                self.$pane.triggerHandler(FORM_SUBMITTED_EVENT, {success: false});
                self.on_form_changed();
                $(".btn-primary, .btn-cancel", $form).removeAttr("disabled");
            } else {
                self.$pane.triggerHandler(FORM_SUBMITTED_EVENT, {success: true});
                $form.data(FORM_CHANGED_KEY, false);

                var uri = $('#uri', $form).val();
                self.quietly_change_hash(TreeIds.link_url(uri));
                self.tree.large_tree.redisplayAndShow([uri], function() {
                    var tree_id = TreeIds.uri_to_tree_id(uri);
                    self.tree.large_tree.setCurrentNode(tree_id, function() {
                        self.scroll_to_node(tree_id);
                        self.tree.toolbar_renderer.notify_form_loaded($form);
                        if (shouldPlusOne) {
                            self.add_new_after(tree.current(), tree.current().data('level'));
                        }
                    });
                });
            }

            if ( $form.data("update-monitor-paused") ) {
                $form.data("update-monitor-paused", false);
            }

            // scroll back to the top
            $.scrollTo("header");
        },
        error: function(obj, errorText, errorDesc) {
            self.$pane.prepend("<div class='alert alert-error'><p>An error occurred loading this form.</p><pre>"+errorDesc+"</pre></div>");
            self.$pane.triggerHandler(FORM_SUBMITTED_EVENT, {success: false});
            $(".btn-primary", $form).removeAttr("disabled");
        }
    });

    $form.on('formchanged.aspace', function() {
        self.on_form_changed();
    });

    $form.on('click', '.revert-changes a', function() {
        var tree_id = tree.large_tree.current_tree_id;
        self.blockout_form();
        tree.toolbar_renderer.reset();
        self.scroll_to_node(tree_id);
        self.loadPaneForId(tree_id);
    });

    $form.data('createPlusOne', false);
    $form.on('click', '.btn-plus-one', function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();

        $form.data("createPlusOne", true);
        $form.triggerHandler("submit");
    });

    self.tree.toolbar_renderer.notify_form_loaded($form);

    return $form;
};

AjaxTree.prototype.title_for_new_node = function() {
    if (this.tree.root_record_type == 'resource') {
        return "New Archival Object";
    } else if (this.tree.root_record_type == 'classification') {
        return "New Classification Term";
    } else if (this.tree.root_record_type == 'digital_object') {
        return "New Digital Object Component";
    } else {
        throw 'title_for_new_node does not support: ' + this.tree.root_record_type;
    }
};

AjaxTree.prototype.add_new_after = function(node, level) {
    var self = this;

    // update the hash
    self.quietly_change_hash('new');

    // clear the toolbar
    $(self.tree.toolbar_renderer.container).empty();

    // create a new table row
    var $new_tr = $('<tr>');
    $new_tr.data('last_node', node);
    var colspan = 0;
    node.find('td').filter(':not(.title,.drag-handle,.no-drag-handle)').each(function(td) {
        colspan += $(td).attr('colspan') || 1;
    });
    var $drag = $('<td>').addClass('no-drag-handle');
    $drag.appendTo($new_tr);
    var $titleCell = $('<td>').addClass('title');
    var $indentor = $('<span>').addClass('indentor');
    $indentor.append($('<span>').addClass('glyphicon glyphicon-asterisk'));
    $indentor.appendTo($titleCell);
    $titleCell.append($('<span tabindex="0">')
              .addClass('record-title')
              .text(self.title_for_new_node()));
    $titleCell.appendTo($new_tr);
    $('<td>').attr('colspan', colspan).appendTo($new_tr);
    node.removeClass('current');
    $new_tr.addClass('current');
    $new_tr.attr('id', 'new');

    $new_tr.addClass('indent-level-'+level);

    var target_position = 0;
    var parent_id = null;
    var position = null;

    var root_node = $('#'+this.tree.large_tree.root_tree_id);
    var root_uri_parts = TreeIds.uri_to_parts(root_node.data('uri'));
    var node_uri_parts = TreeIds.uri_to_parts(node.data('uri'));

    // add the new row at the end of the target level
    if (level > node.data('level')) {
        /* We're adding a new child */
        parent_id = node_uri_parts.id;

        if (node.data('child_count') == 0) {
            /* Adding a child to a currently childless element */
            node.after($new_tr);
            $new_tr.find('.record-title')[0].focus();
        } else {
            /* Adding a child to something with existing children */
            var callback = function() {
                var endmarker = node.nextAll('.waypoint.indent-level-'+level+', .end-marker.indent-level-'+level).last();
                endmarker.after($new_tr);
                $new_tr.find('.record-title')[0].focus();
            };

            if (node.data('level') == 0) {
                /* Adding to a root node.  No need to expand. */
                callback();
            } else {
                self.tree.large_tree.expandNode(node, callback);
            }
        }
    } else {
        /* We're adding a new sibling after selected node */
        tree.large_tree.collapseNode(node);
        node.after($new_tr);
        $new_tr.find('.record-title')[0].focus();

        parent_id = node.data('parent_id');
        position = node.data('position') + 1;
    }

    var params = {
        inline: true
    };

    params[root_uri_parts.type + '_id'] = root_uri_parts.id;

    if (parent_id) {
        params[node_uri_parts.type + '_id'] = parent_id;
    }

    if (position) {
        params['position'] = position;
    }

    var url = AS.app_prefix(self._new_node_form_url_for(node.data('jsonmodel_type')));

    self._ajax_the_pane(url, params, function() {
        // set form_changed = true for this new form
        self.$pane.find('form').data(FORM_CHANGED_KEY, true);

        self.$pane.find('.btn-cancel').on('click', function(event) {
            event.preventDefault();
            var tree_id= node.attr('id');
            var uri = node.data('uri');
            self.tree.large_tree.redisplayAndShow([uri], function() {
                self.tree.large_tree.setCurrentNode(tree_id, function() {
                    self.scroll_to_node(tree_id);
                });
            });

            self.quietly_change_hash('tree::'+tree_id);
            self.loadPaneForId(tree_id);
        });
    });
};

AjaxTree.prototype.check_for_form_changes = function(target_tree_id, callback) {
    var self = this;
    var $form = $("form", self.$pane);

    if ($form.data(FORM_CHANGED_KEY)) {
        var p = self.confirmChanges(target_tree_id);
        p.done(function(proceed) {
            if (proceed) {
                callback();
            } else {
                var current_tree_id = self.tree.large_tree.current_tree_id;
                self.quietly_change_hash('tree::'+current_tree_id);
            }
        });
        p.fail(function(err) {
            throw err;
        });
    } else {
        callback();
    }
};

AjaxTree.prototype.confirmChanges = function(target_tree_id) {
    var self = this;
    var $form = $("form", self.$pane);
    var current_tree_id = self.tree.large_tree.current_tree_id;

    var d = $.Deferred();

    // open save your changes modal
    AS.openCustomModal("saveYourChangesModal", "Save Changes", AS.renderTemplate("save_changes_modal_template"));

    $("#saveChangesButton", "#saveYourChangesModal").on("click", function() {
        $('.btn', '#saveYourChangesModal').addClass('disabled');

        var onSubmitSuccess = function() {
            $form.data(FORM_CHANGED_KEY, false);
            $("#saveYourChangesModal").modal("hide");
            d.resolve(true);
        };

        var onSubmitError = function() {
            $("#saveYourChangesModal").modal("hide");
            d.resolve(false);
        };

        self.$pane.one(FORM_SUBMITTED_EVENT, function(event, data) {
            if (data.success) {
                onSubmitSuccess();
            } else {
                onSubmitError();
            }
        });

        $form.triggerHandler("submit");
    });

    $("#dismissChangesButton", "#saveYourChangesModal").on("click", function() {
        $form.data("form_changed", false);

        $("#saveYourChangesModal").modal("hide");
        var tree_id = self.tree_id_from_hash();
        var uri = $('#' + tree_id).data('uri');

        self.tree.large_tree.redisplayAndShow([uri], function() {
            self.tree.large_tree.setCurrentNode(tree_id, function() {
                self.scroll_to_node(tree_id);
            });
        });
        d.resolve(true);
    });

    $(".btn-cancel", "#saveYourChangesModal").on("click", function() {
        d.resolve(false);
    });

    return d.promise();
};

AjaxTree.prototype.quietly_change_hash = function(tree_id) {
    // only change the hash if we need to!
    if (location.hash != tree_id) {
        this._ignore_hash_change = true;
        location.hash = tree_id;
    }
};


AjaxTree.prototype.hide_form = function() {
    this.$pane.hide();
}

AjaxTree.prototype.show_form = function() {
    this.unblockout_form();
    this.$pane.show();
}

AjaxTree.prototype.blockout_form = function() {
    var self = this;
    if (self.$pane.has('.blockout').length > 0) {
        return;
    }
    var $blockout = $('<div>').addClass('blockout');
    $blockout.height(self.$pane.height());
    // add 30 to take into account for outer margin :/
    $blockout.width(self.$pane.width() + 30);
    $blockout.css('left', '-15px');
    self.$pane.prepend($blockout);
};

AjaxTree.prototype.unblockout_form = function() {
    this.$pane.find('.blockout').remove();
};

AjaxTree.prototype.on_form_changed = function() {
    var $form = this.$pane.find('form');
    if (!$form.data(FORM_CHANGED_KEY)) {
        $form.data(FORM_CHANGED_KEY, true);
        self.tree.toolbar_renderer.notify_form_changed($form);
    }
};

AjaxTree.prototype._new_node_form_url_for = function(jsonmodel_type) {
    if (jsonmodel_type == 'resource' || jsonmodel_type == 'archival_object') {
        return '/archival_objects/new';
    } else if (jsonmodel_type == 'digital_object' || jsonmodel_type == 'digital_object_component') {
        return '/digital_object_components/new';
    } else if (jsonmodel_type == 'classification' || jsonmodel_type == 'classification_term') {
        return '/classification_terms/new';
    } else {
        throw 'No new form available for: '+ jsonmodel_type;
    }
};

AjaxTree.prototype.scroll_to_node = function(tree_id) {
    var self = this;
    var midpoint = (self.tree.large_tree.elt.height() - $('#'+tree_id).height()) / 2;
    self.tree.large_tree.elt.scrollTo('#'+tree_id, 0, {offset: -midpoint});
}
;
function BaseRenderer() {
    this.endpointMarkerTemplate = $('<tr class="end-marker" />');

    this.rootTemplate = $('<tr> ' +
                          '  <td class="no-drag-handle"></td>' +
                          '  <td class="title"></td>' +
                          '</tr>');


    this.nodeTemplate = $('<tr> ' +
                          '  <td class="drag-handle"></td>' +
                          '  <td class="title"><span class="indentor"><button class="expandme"><i class="expandme-icon glyphicon glyphicon-chevron-right" /></button></span> </td>' +
                          '</tr>');
}

BaseRenderer.prototype.endpoint_marker = function () {
    return this.endpointMarkerTemplate.clone(true);
}

BaseRenderer.prototype.get_root_template = function () {
    return this.rootTemplate.clone(false);
}


BaseRenderer.prototype.get_node_template = function () {
    return this.nodeTemplate.clone(false);
};

BaseRenderer.prototype.i18n = function (enumeration, enumeration_value) {
    return EnumerationTranslations.t(enumeration, enumeration_value);
};


function ResourceRenderer() {
    BaseRenderer.call(this);
    this.rootTemplate = $('<tr> ' +
                          '  <td class="no-drag-handle"></td>' +
                          '  <td class="title"></td>' +
                          '  <td class="resource-level"></td>' +
                          '  <td class="resource-type"></td>' +
                          '  <td class="resource-container"></td>' +
                          '</tr>');

    this.nodeTemplate = $('<tr> ' +
                          '  <td class="drag-handle"></td>' +
                          '  <td class="title"><span class="indentor"><button class="expandme"><i class="expandme-icon glyphicon glyphicon-chevron-right" /></button></span> </td>' +
                          '  <td class="resource-level"></td>' +
                          '  <td class="resource-type"></td>' +
                          '  <td class="resource-container"></td>' +
                          '</tr>');
}

ResourceRenderer.prototype = Object.create(BaseRenderer.prototype);

ResourceRenderer.prototype.add_root_columns = function (row, rootNode) {
    var level = this.i18n('archival_record_level', rootNode.level);
    var type = this.build_type_summary(rootNode);
    var container_summary = this.build_container_summary(rootNode);

    if (rootNode.parsed_title) {
        row.find('.title .record-title').html(rootNode.parsed_title);
    }

    row.find('.resource-level').text(level).attr('title', level);
    row.find('.resource-type').text(type).attr('title', type);
    row.find('.resource-container').text(container_summary).attr('title', container_summary);
}


ResourceRenderer.prototype.add_node_columns = function (row, node) {
    var title = this.build_node_title(node);
    var level = this.i18n('archival_record_level', node.level);
    var type = this.build_type_summary(node);
    var container_summary = this.build_container_summary(node);

    row.find('.title .record-title').html(title).attr('title', title);
    row.find('.resource-level').text(level).attr('title', level);
    row.find('.resource-type').text(type).attr('title', type);
    row.find('.resource-container').text(container_summary).attr('title', container_summary);
};


ResourceRenderer.prototype.build_node_title = function(node) {
    var title_bits = [];
    if (node.parsed_title) {
      title_bits.push(node.parsed_title);
    } else if (node.title) {
      title_bits.push(node.title);
    }

    if (node.dates && node.dates.length > 0) {
      var first_date = node.dates[0];
      if (first_date.expression) {
          title_bits.push(first_date.expression);
      } else if (first_date.begin && first_date.end) {
          title_bits.push(first_date.begin + '-' + first_date.end);
      } else if (first_date.begin) {
          title_bits.push(first_date.begin);
      }
    }

    return title_bits.join(', ');
};


ResourceRenderer.prototype.build_type_summary = function(node) {
    var self = this;
    var type_summary = '';

    if (node['containers']) {
        var types = []

        $.each(node['containers'], function(_, container) {
            types.push(self.i18n('instance_instance_type', container['instance_type']));
        });

        type_summary = types.join(', ');
    } 

    return type_summary;
};


ResourceRenderer.prototype.build_container_summary = function(node) {
    var self = this;
    var container_summary = '';

    if (node['containers']) {
        var container_summaries = []

        $.each(node['containers'], function(_, container) {
            var summary_items = []
            if (container.top_container_indicator) {
                var top_container_summary = '';

                if (container.top_container_type) {
                    top_container_summary += self.i18n('container_type', container.top_container_type) + ': ';
                }

                top_container_summary += container.top_container_indicator;

                if (container.top_container_barcode) {
                    top_container_summary += ' [' + container.top_container_barcode + ']';
                }

                summary_items.push(top_container_summary);
            }
            if (container.type_2) {
                summary_items.push(self.i18n('container_type', container.type_2) + ': ' + container.indicator_2);
            }
            if (container.type_3) {
                summary_items.push(self.i18n('container_type', container.type_3) + ': ' + container.indicator_3);
            }
            if (summary_items.length > 0) {
                container_summaries.push(summary_items.join(', '));
            }
        });

        container_summary = container_summaries.join('; ');
    }

    return container_summary;
};


function DigitalObjectRenderer() {
    BaseRenderer.call(this);


    this.rootTemplate = $('<tr> ' +
                          '  <td class="no-drag-handle"></td>' +
                          '  <td class="title"></td>' +
                          '  <td class="digital-object-type"></td>' +
                          '  <td class="file-uri-summary"></td>' +
                          '</tr>');


    this.nodeTemplate = $('<tr> ' +
                          '  <td class="drag-handle"></td>' +
                          '  <td class="title"><span class="indentor"><button class="expandme"><i class="expandme-icon glyphicon glyphicon-chevron-right" /></button></span> </td>' +
                          '  <td class="digital-object-type"></td>' +
                          '  <td class="file-uri-summary"></td>' +
                          '</tr>');
}

DigitalObjectRenderer.prototype = new BaseRenderer();

DigitalObjectRenderer.prototype.add_root_columns = function (row, rootNode) {
    if (rootNode.digital_object_type) {
        var type = this.i18n('digital_object_digital_object_type', rootNode.digital_object_type);
        row.find('.digital-object-type').text(type).attr('title', type);
    }

    if (rootNode.file_uri_summary) {
        row.find('.file-uri-summary').text(rootNode.file_uri_summary).attr('title', rootNode.file_uri_summary);
    }

    if (rootNode.parsed_title) {
        row.find('.title .record-title').html(rootNode.parsed_title)
    }
}

DigitalObjectRenderer.prototype.add_node_columns = function (row, node) {
    var title = this.build_node_title(node);

    row.find('.title .record-title').html(title).attr('title', title);
    row.find('.file-uri-summary').text(node.file_uri_summary).attr('title', node.file_uri_summary);
};

DigitalObjectRenderer.prototype.build_node_title = function(node) {
    var title_bits = [];

    if (node.parsed_title) {
        title_bits.push(node.parsed_title);
    } else if (node.title) {
        title_bits.push(node.title);
    }

    if (node.label) {
        title_bits.push(node.label);
    }

    if (node.dates && node.dates.length > 0) {
        var first_date = node.dates[0];
        if (first_date.expression) {
            title_bits.push(first_date.expression);
        } else if (first_date.begin && first_date.end) {
            title_bits.push(first_date.begin + '-' + first_date.end);
        } else if (first_date.begin) {
            title_bits.push(first_date.begin);
        }
    }

    return title_bits.join(', ');
};

function ClassificationRenderer() {
    BaseRenderer.call(this);
};

ClassificationRenderer.prototype = new BaseRenderer();

ClassificationRenderer.prototype.add_root_columns = function (row, rootNode) {
    var title = this.build_title(rootNode);
    row.find('.title .record-title').text(title).attr('title', title);
};

ClassificationRenderer.prototype.add_node_columns = function (row, node) {
    var title = this.build_title(node);
    row.find('.title .record-title').text(title).attr('title', title);
};

ClassificationRenderer.prototype.build_title = function(node) {
    return [node.identifier, node.title].join('. ');
};
var SHARED_TOOLBAR_ACTIONS = [
    {
        label: 'Enable Reorder Mode',
        cssClasses: 'btn-default drag-toggle',
        onRender: function(btn, node, tree, toolbarRenderer) {
            if ($(tree.large_tree.elt).is('.drag-enabled')) {
                $(btn).addClass('active').addClass('btn-success');

                $(btn).text('Disable Reorder Mode');

                tree.ajax_tree.hide_form();
            }
        },
        onToolbarRendered: function(btn, toolbarRenderer) {
            if ($(tree.large_tree.elt).is('.drag-enabled')) {
                $('.btn:not(.drag-toggle,.finish-editing,.cut-selection,.paste-selection,.move-node)',toolbarRenderer.container).hide();
                $('.cut-selection',toolbarRenderer.container).removeClass('disabled');
                if ($('.cut', tree.large_tree.elt).length > 0) {
                    $('.paste-selection',toolbarRenderer.container).removeClass('disabled');
                }
            }
        },
        onClick: function(event, btn, node, tree, toolbarRenderer) {
            $(tree.large_tree.elt).toggleClass('drag-enabled');
            $(event.target).toggleClass('btn-success');

            if ($(tree.large_tree.elt).is('.drag-enabled')) {
                $(btn).text('Disable Reorder Mode');
                tree.ajax_tree.hide_form();
                $.scrollTo(0);
                tree.resizer.maximize(DRAGDROP_HOTSPOT_HEIGHT);
                $('.btn:not(.drag-toggle,.finish-editing)',toolbarRenderer.container).hide();
                $('.cut-selection,.paste-selection,.move-node', toolbarRenderer.container).show();
                $('.cut-selection,.move-node',toolbarRenderer.container).removeClass('disabled');
            } else {
                $(btn).text('Enable Reorder Mode');
                tree.ajax_tree.show_form();
                tree.resizer.reset();
                $('.btn',toolbarRenderer.container).show();
                $('.cut-selection,.paste-selection,.move-node', toolbarRenderer.container).hide();
                $(btn).blur();
            }
        },
        isEnabled: function(node, tree, toolbarRenderer) {
            return true;
        },
        isVisible: function(node, tree, toolbarRenderer) {
            return !tree.large_tree.read_only;
        },
        onFormChanged: function(btn, form, tree, toolbarRenderer) {
            $(btn).addClass('disabled');
        },
        onFormLoaded: function(btn, form, tree, toolbarRenderer) {
            if ($(tree.large_tree.elt).is('.drag-enabled')) {
                tree.ajax_tree.blockout_form();
            }
        },
    },
    [
        {
            label: 'Cut',
            cssClasses: 'btn-default cut-selection',
            onRender: function(btn, node, tree, toolbarRenderer) {
                if (!$(tree.large_tree.elt).is('.drag-enabled')) {
                    btn.hide();
                }
            },
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                event.preventDefault();
                // clear the previous cut set
                $('.cut', tree.large_tree.elt).removeClass('cut');

                var rowsToCut = [];
                if (tree.dragdrop.rowsToMove.length > 0) {
                    // if multiselected rows, cut them
                    rowsToCut = $.merge([], tree.dragdrop.rowsToMove);
                } else if (tree.current().is(':not(.root-row)')) {
                    // otherwise cut the current row
                    rowsToCut = [tree.current()];
                }

                if (rowsToCut.length > 0) {
                    $.each(rowsToCut, function(_, row) {
                        $(row).addClass('cut');
                    });

                    $('.paste-selection', toolbarRenderer.container).removeClass('disabled');
                }

                tree.dragdrop.resetState();
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only && tree.dragdrop;
            }
        },
        {
            label: 'Paste',
            cssClasses: 'btn-default paste-selection',
            onRender: function(btn, node, tree, toolbarRenderer) {
                if (!$(tree.large_tree.elt).is('.drag-enabled')) {
                    btn.hide();
                } else if ($('.cut', $(tree.large_tree.elt)).length == 0) {
                    btn.addClass('disabled');
                }
            },
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                event.preventDefault();
                var current = tree.current();
                var cut = $('.cut', tree.large_tree.elt);

                var rowsToPaste = [];
                cut.each(function(_,row) {
                    if ($(row).data('uri') != current.data('uri')) {
                        rowsToPaste.push(row);
                    }
                });

                tree.large_tree.reparentNodes(current, rowsToPaste, current.data('child_count')).done(function() {
                    $('.cut', tree.large_tree.elt).removeClass('cut');
                    toolbarRenderer.reset();
                });
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only && tree.dragdrop;
            }
        },
    ],
    {
        label: 'Move <span class="caret"></span>',
        cssClasses: 'btn-default dropdown-toggle move-node',
        groupCssClasses: 'dropdown',
        onRender: function(btn, node, tree, toolbarRenderer) {
            if (!$(tree.large_tree.elt).is('.drag-enabled')) {
                btn.hide();
            }
            var level = node.data('level');
            var position = node.data('position');

            var $options = $('<ul>').addClass('dropdown-menu ');
            // move up a level
            if (level > 1) {
                var $li = $('<li>');
                $li.append($('<a>').attr('href', 'javascript:void(0);').
                                    addClass('move-node move-node-up-level').
                                    text('Up a Level'));
                $options.append($li);
            }

            var $prevAtLevel = node.prevAll('.largetree-node.indent-level-'+level+':first');
            var $nextAtLevel = node.nextAll('.largetree-node.indent-level-'+level+':first');

            // move up on same level
            if ($prevAtLevel.length > 0) {
                var $li = $('<li>');
                $li.append($('<a>').attr('href', 'javascript:void(0);')
                                   .addClass('move-node move-node-up')
                                   .text('Up'));
                $options.append($li);
            }
            // move down on same level
            if ($nextAtLevel.length > 0) {
                var $li = $('<li>');
                $li.append($('<a>').attr('href', 'javascript:void(0);')
                                   .addClass('move-node move-node-down')
                                   .text('Down'));
                $options.append($li);
            }
            // move down into sibling
            if ($prevAtLevel.length > 0 || $nextAtLevel.length > 0) {
                var $li = $('<li>').addClass('dropdown-submenu');
                $li.append($('<a>').attr('href', 'javascript:void(0);')
                    .text('Down Into...'));
                $options.append($li);

                var $siblingsMenu = $('<ul>').addClass('dropdown-menu').addClass('move-node-into-menu');

                var $siblingsAbove = $.makeArray(node.prevAll('.largetree-node.indent-level-'+level));
                var $siblingsBelow = $.makeArray(node.nextAll('.largetree-node.indent-level-'+level));

                var NUMBER_OF_SIBLINGS_TO_LIST = 20;
                var HALF_THE_NUMBER_OF_SIBLINGS_TO_LIST = parseInt(NUMBER_OF_SIBLINGS_TO_LIST/2);
                var $siblingsToAddToMenu = [];
                if ($siblingsAbove.length > HALF_THE_NUMBER_OF_SIBLINGS_TO_LIST && $siblingsBelow.length > HALF_THE_NUMBER_OF_SIBLINGS_TO_LIST) {
                    $siblingsToAddToMenu = $.merge($siblingsAbove.slice(0, HALF_THE_NUMBER_OF_SIBLINGS_TO_LIST ).reverse(),
                                                   $siblingsBelow.slice(0, HALF_THE_NUMBER_OF_SIBLINGS_TO_LIST));
                } else if ($siblingsAbove.length > HALF_THE_NUMBER_OF_SIBLINGS_TO_LIST) {
                    $siblingsToAddToMenu = $.merge($siblingsAbove.slice(0, NUMBER_OF_SIBLINGS_TO_LIST - $siblingsBelow.length).reverse(),
                                                   $siblingsBelow);
                } else if ($siblingsBelow.length > HALF_THE_NUMBER_OF_SIBLINGS_TO_LIST) {
                    $siblingsToAddToMenu = $.merge($siblingsAbove.reverse(),
                                                   $siblingsBelow.slice(0, NUMBER_OF_SIBLINGS_TO_LIST - $siblingsAbove.length));
                } else {
                    $siblingsToAddToMenu = $.merge($siblingsAbove.reverse(), $siblingsBelow);
                }

                for (var i = 0; i < $siblingsToAddToMenu.length; i++) {
                    var $sibling = $($siblingsToAddToMenu[i]);
                    var $subli = $('<li>');
                    $subli.append($('<a>').attr('href', 'javascript:void(0);')
                        .addClass('move-node move-node-down-into')
                        .attr('data-uri', $sibling.data('uri'))
                        .attr('data-tree_id', $sibling.attr('id'))
                        .text($sibling.find('.record-title').text().trim()));
                    $siblingsMenu.append($subli);
                }

                $siblingsMenu.appendTo($li);
            }
            $options.appendTo(btn.closest('.btn-group'));

            if ($options.is(':empty')) {
                // node has no parent or siblings so has nowhere to move
                // remove the toolbar action if this is the case
                btn.remove();
            }

            $options.on('click', '.move-node-up-level', function(event) {
                // move node to last child of parent
                var $new_parent = node.prevAll('.indent-level-'+(level-2)+":first");
                tree.large_tree.reparentNodes($new_parent, node, $new_parent.data('child_count')).done(function() {
                    toolbarRenderer.reset();
                });
            }).on('click', '.move-node-up', function(event) {
                // move node above nearest sibling
                var $parent = node.prevAll('.indent-level-'+(level-1)+":first");
                var $prev = node.prevAll('.indent-level-'+(level)+":first");
                tree.large_tree.reparentNodes($parent, node, $prev.data('position')).done(function() {
                    toolbarRenderer.reset();
                });
            }).on('click', '.move-node-down', function(event) {
                // move node below nearest sibling
                var $parent = node.prevAll('.indent-level-'+(level-1)+":first");
                var $next = node.nextAll('.indent-level-'+(level)+":first");
                tree.large_tree.reparentNodes($parent, node, $next.data('position')+1).done(function() {
                    toolbarRenderer.reset();
                });
            }).on('click', '.move-node-down-into', function(event) {
                // move node to last child of sibling
                var $parent = $('#'+$(this).data('tree_id'));
                tree.large_tree.reparentNodes($parent, node, $parent.data('child_count')).done(function() {
                    toolbarRenderer.reset();
                });
            });

            btn.attr('data-toggle', 'dropdown');
        },
        isEnabled: function(node, tree, toolbarRenderer) {
            return true;
        },
        isVisible: function(node, tree, toolbarRenderer) {
            // not available to root nodes
            if (node.is('.root-row')) {
                return false;
            }

            return !tree.large_tree.read_only && tree.dragdrop;
        },
    },
    // RDE
    {
        label: 'Rapid Data Entry',
        cssClasses: 'btn-default add-children',
        onClick: function(event, btn, node, tree, toolbarRenderer) {
            $(document).triggerHandler("rdeshow.aspace", [node, btn]);
        },
        isEnabled: function(node, tree, toolbarRenderer) {
            return true;
        },
        isVisible: function(node, tree, toolbarRenderer) {
            return !tree.large_tree.read_only;
        },
        onFormLoaded: function(btn, form, tree, toolbarRenderer) {
            $(btn).removeClass('disabled');
        },
        onToolbarRendered: function(btn, toolbarRenderer) {
            $(btn).addClass('disabled');
        },
    },
    // go back to the read only page
    {
        label: 'Close Record',
        cssClasses: 'btn-success finish-editing',
        groupCssClasses: 'pull-right',
        onRender: function(btn, node, tree, toolbarRenderer) {
            var readonlyPath = location.pathname.replace(/\/edit$/, '');
            btn.attr('href', readonlyPath + location.hash);
        },
        isEnabled: function(node, tree, toolbarRenderer) {
            return true;
        },
        isVisible: function(node, tree, toolbarRenderer) {
            return !tree.large_tree.read_only;
        }
    },
];

var TreeToolbarConfiguration = {
    resource: [].concat(SHARED_TOOLBAR_ACTIONS).concat([
        {
            label: 'Add Child',
            cssClasses: 'btn-default',
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                tree.ajax_tree.add_new_after(node, node.data('level') + 1);
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only;
            },
            onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                $(btn).removeClass('disabled');
            },
            onToolbarRendered: function(btn, toolbarRenderer) {
                $(btn).addClass('disabled');
            },
        }
    ]),

    archival_object: [].concat(SHARED_TOOLBAR_ACTIONS).concat([
        [
            {
                label: 'Add Child',
                cssClasses: 'btn-default',
                onClick: function(event, btn, node, tree, toolbarRenderer) {
                    tree.ajax_tree.add_new_after(node, node.data('level') + 1);
                },
                isEnabled: function(node, tree, toolbarRenderer) {
                    return true;
                },
                isVisible: function(node, tree, toolbarRenderer) {
                    return !tree.large_tree.read_only;
                },
                onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                    $(btn).removeClass('disabled');
                },
                onToolbarRendered: function(btn, toolbarRenderer) {
                    $(btn).addClass('disabled');
                },
            },
            {
                label: 'Add Sibling',
                cssClasses: 'btn-default',
                onClick: function(event, btn, node, tree, toolbarRenderer) {
                    tree.ajax_tree.add_new_after(node, node.data('level'));
                },
                isEnabled: function(node, tree, toolbarRenderer) {
                    return true;
                },
                isVisible: function(node, tree, toolbarRenderer) {
                    return !tree.large_tree.read_only;
                },
                onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                    $(btn).removeClass('disabled');
                },
                onToolbarRendered: function(btn, toolbarRenderer) {
                    $(btn).addClass('disabled');
                },
            }
        ],
        {
            label: 'Transfer',
            cssClasses: 'btn-default dropdown-toggle transfer-node',
            groupCssClasses: 'dropdown',
            onRender: function(btn, node, tree, toolbarRenderer) {
                var $li = btn.parent();
                btn.replaceWith(AS.renderTemplate('tree_toolbar_transfer_action', {
                                    node_id: TreeIds.uri_to_parts(node.data('uri')).id,
                                    root_object_id: TreeIds.uri_to_parts(tree.large_tree.root_uri).id,
                                }));
                $(".linker:not(.initialised)", $li).linker()

                var $form = $li.find('form');
                $form.on('submit', function(event) {
                    if ($(this).serializeObject()['transfer[ref]']) {
                        // continue with the POST
                        return;
                    } else {
                        event.stopPropagation();
                        event.preventDefault();
                        $(".missing-ref-message", $form).show();
                        return true;
                    }
                }).on('click', '.btn-cancel', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    $(this).closest('.btn-group.dropdown').toggleClass("open");
                }).on('click', ':input', function(event) {
                    event.stopPropagation();
                }).on("click", ".dropdown-toggle", function(event) {
                    event.stopPropagation();
                    $(this).parent().toggleClass("open");
                });
                $li.on('shown.bs.dropdown', function() {
                    $("#token-input-transfer_ref_", $form).focus();
                });
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only;
            },
        }
    ]),

    digital_object: [].concat(SHARED_TOOLBAR_ACTIONS).concat([
        {
            label: 'Add Child',
            cssClasses: 'btn-default',
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                tree.ajax_tree.add_new_after(node, node.data('level') + 1);
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only;
            },
            onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                $(btn).removeClass('disabled');
            },
            onToolbarRendered: function(btn, toolbarRenderer) {
                $(btn).addClass('disabled');
            },
        }
    ]),

    digital_object_component: [].concat(SHARED_TOOLBAR_ACTIONS).concat([
        [
            {
                label: 'Add Child',
                cssClasses: 'btn-default',
                onClick: function(event, btn, node, tree, toolbarRenderer) {
                    tree.ajax_tree.add_new_after(node, node.data('level') + 1);
                },
                isEnabled: function(node, tree, toolbarRenderer) {
                    return true;
                },
                isVisible: function(node, tree, toolbarRenderer) {
                    return !tree.large_tree.read_only;
                },
                onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                    $(btn).removeClass('disabled');
                },
                onToolbarRendered: function(btn, toolbarRenderer) {
                    $(btn).addClass('disabled');
                },
            },
            {
                label: 'Add Sibling',
                cssClasses: 'btn-default',
                onClick: function(event, btn, node, tree, toolbarRenderer) {
                    tree.ajax_tree.add_new_after(node, node.data('level'));
                },
                isEnabled: function(node, tree, toolbarRenderer) {
                    return true;
                },
                isVisible: function(node, tree, toolbarRenderer) {
                    return !tree.large_tree.read_only;
                },
                onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                    $(btn).removeClass('disabled');
                },
                onToolbarRendered: function(btn, toolbarRenderer) {
                    $(btn).addClass('disabled');
                },
            }
        ]
    ]),

    classification: [].concat(SHARED_TOOLBAR_ACTIONS).concat([
        {
            label: 'Add Child',
            cssClasses: 'btn-default',
            onClick: function(event, btn, node, tree, toolbarRenderer) {
                tree.ajax_tree.add_new_after(node, node.data('level') + 1);
            },
            isEnabled: function(node, tree, toolbarRenderer) {
                return true;
            },
            isVisible: function(node, tree, toolbarRenderer) {
                return !tree.large_tree.read_only;
            },
            onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                $(btn).removeClass('disabled');
            },
            onToolbarRendered: function(btn, toolbarRenderer) {
                $(btn).addClass('disabled');
            },
        }
    ]),

    classification_term: [].concat(SHARED_TOOLBAR_ACTIONS).concat([
        [
            {
                label: 'Add Child',
                cssClasses: 'btn-default',
                onClick: function(event, btn, node, tree, toolbarRenderer) {
                    tree.ajax_tree.add_new_after(node, node.data('level') + 1);
                },
                isEnabled: function(node, tree, toolbarRenderer) {
                    return true;
                },
                isVisible: function(node, tree, toolbarRenderer) {
                    return !tree.large_tree.read_only;
                },
                onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                    $(btn).removeClass('disabled');
                },
                onToolbarRendered: function(btn, toolbarRenderer) {
                    $(btn).addClass('disabled');
                },
            },
            {
                label: 'Add Sibling',
                cssClasses: 'btn-default',
                onClick: function(event, btn, node, tree, toolbarRenderer) {
                    tree.ajax_tree.add_new_after(node, node.data('level'));
                },
                isEnabled: function(node, tree, toolbarRenderer) {
                    return true;
                },
                isVisible: function(node, tree, toolbarRenderer) {
                    return !tree.large_tree.read_only;
                },
                onFormLoaded: function(btn, form, tree, toolbarRenderer) {
                    $(btn).removeClass('disabled');
                },
                onToolbarRendered: function(btn, toolbarRenderer) {
                    $(btn).addClass('disabled');
                },
            },
        ]
    ]),
};

function TreeToolbarRenderer(tree, container) {
    this.tree = tree;
    this.container = container;
}

TreeToolbarRenderer.prototype.reset = function() {
    if (this.current_node) {
        this.render(this.current_node);
    }
};

TreeToolbarRenderer.prototype.reset_callbacks = function() {
    this.on_form_changed_callbacks = [];
    this.on_form_loaded_callbacks = [];
    this.on_toolbar_rendered_callbacks = [];
};

TreeToolbarRenderer.prototype.render = function(node) {
    var self = this;

    if (self.current_node) {
        self.reset_callbacks();
    }

    self.current_node = node;

    var actions = TreeToolbarConfiguration[node.data('jsonmodel_type')];
    self.container.empty();

    if (actions == null) {
        return
    }

    self.reset_callbacks();

    actions.map(function(action_or_group) {
        if (!$.isArray(action_or_group)) {
            action_group = [action_or_group];
        } else {
            action_group = action_or_group;
        }
        var $group = $('<div>').addClass('btn-group');
        self.container.append($group);

        action_group.map(function(action) {
            if (action.isVisible == undefined || $.proxy(action.isVisible, tree)(node, tree, self)) {
                var $btn = $('<a>').addClass('btn btn-xs');
                $btn.html(action.label).addClass(action.cssClasses).attr('href', 'javascript:void(0)');

                if (action.isEnabled == undefined || $.proxy(action.isEnabled, tree)(node, tree, self)) {
                    if (action.onClick) {
                        $btn.on('click', function (event) {
                            return $.proxy(action.onClick, tree)(event, $btn, node, tree, self);
                        });
                    }
                } else {
                    $btn.addClass('disabled');
                }

                if (action.groupCssClasses) {
                    $group.addClass(action.groupCssClasses);
                }

                if (action.onFormChanged) {
                    self.on_form_changed_callbacks.push(function(form) {
                        $.proxy(action.onFormChanged, tree)($btn, form, tree, self);
                    });
                }

                if (action.onFormLoaded) {
                    self.on_form_loaded_callbacks.push(function(form) {
                        $.proxy(action.onFormLoaded, tree)($btn, form, tree, self);
                    });
                }

                if (action.onToolbarRendered) {
                    self.on_toolbar_rendered_callbacks.push(function() {
                        $.proxy(action.onToolbarRendered, tree)($btn, self);
                    });
                }

                $group.append($btn);

                if (action.onRender) {
                    $.proxy(action.onRender, tree)($btn, node, tree, self);
                }
            }
        });

        if ($group.length == 0) {
            $group.remove();
        }
    });

    $.each(self.on_toolbar_rendered_callbacks, function(i, callback) {
        callback();
    });
};

TreeToolbarRenderer.prototype.notify_form_changed = function(form) {
    $.each(this.on_form_changed_callbacks, function(i, callback) {
        callback(form);
    });
};

TreeToolbarRenderer.prototype.notify_form_loaded = function(form) {
    $.each(this.on_form_loaded_callbacks, function(i, callback) {
        callback(form);
    });
};
/*jshint eqnull:true */
/*!
 * jQuery Cookie Plugin v1.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2011, Klaus Hartl
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/GPL-2.0
 */

(function($, document) {

	var pluses = /\+/g;
	function raw(s) {
		return s;
	}
	function decoded(s) {
		return decodeURIComponent(s.replace(pluses, ' '));
	}

	$.cookie = function(key, value, options) {

		// key and at least value given, set cookie...
		if (arguments.length > 1 && (!/Object/.test(Object.prototype.toString.call(value)) || value == null)) {
			options = $.extend({}, $.cookie.defaults, options);

			if (value == null) {
				options.expires = -1;
			}

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setDate(t.getDate() + days);
			}

			value = String(value);

			return (document.cookie = [
				encodeURIComponent(key), '=', options.raw ? value : encodeURIComponent(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// key and possibly options given, get cookie...
		options = value || $.cookie.defaults || {};
		var decode = options.raw ? raw : decoded;
		var cookies = document.cookie.split('; ');
		for (var i = 0, parts; (parts = cookies[i] && cookies[i].split('=')); i++) {
			if (decode(parts.shift()) === key) {
				return decode(parts.join('='));
			}
		}
		return null;
	};

	$.cookie.defaults = {};

})(jQuery, document);

var DEFAULT_TREE_PANE_HEIGHT = 100;
var DEFAULT_TREE_MIN_HEIGHT = 60;

function TreeResizer(tree, container) {
    this.tree = tree;
    this.container = container;

    this.setup();
};

TreeResizer.prototype.setup = function() {
    var self = this;

    self.resize_handle = $('<div class="ui-resizable-handle ui-resizable-s" />');
    self.container.after(self.resize_handle);

    self.container.resizable({
        handles: {
            s: self.resize_handle,
        },
        minHeight: DEFAULT_TREE_MIN_HEIGHT,
        resize: function(event, ui) {
            self.resize_handle.removeClass("maximized");
            self.set_height(ui.size.height);
        }
    });

    self.$toggle = $('<a>').addClass('tree-resize-toggle');
    self.resize_handle.append(self.$toggle);

    self.$toggle.on('click', function() {
        self.toggle_height();
    });

    self.reset();
}

TreeResizer.prototype.get_height = function() {
    if (AS.prefixed_cookie("archives-tree-container::height")) {
        return AS.prefixed_cookie("archives-tree-container::height");
    } else {
        return DEFAULT_TREE_PANE_HEIGHT;
    }
};

TreeResizer.prototype.set_height = function(height) {
    AS.prefixed_cookie("archives-tree-container::height", height);
};

TreeResizer.prototype.maximize = function(margin) {
    if (margin === undefined) {
        margin = 50;
    }

    this.resize_handle.addClass("maximized");
    this.container.height($(window).height() - margin - this.container.offset().top);
};

TreeResizer.prototype.reset = function() {
    this.container.height(this.get_height());
};

TreeResizer.prototype.minimize = function() {
    this.resize_handle.removeClass("maximized");
    this.container.height(DEFAULT_TREE_MIN_HEIGHT);
    document.body.scrollTop = this.tree.toolbar_renderer.container.offset().top - 5;
};

TreeResizer.prototype.maximized = function() {
    return this.resize_handle.is('.maximized');
}

TreeResizer.prototype.toggle_height = function() {
    var self = this;

    if (self.maximized()) {
        self.minimize();
    } else {
        self.maximize();
    }
};

(function (exports) {
    "use strict";

    /************************************************************************/
    /* Tree ID helpers  */
    /************************************************************************/
    var TreeIds = {}

    TreeIds.uri_to_tree_id = function (uri) {
        var parts = TreeIds.uri_to_parts(uri);
        return parts.type + '_' + parts.id;
    }

    TreeIds.uri_to_parts = function (uri) {
        var last_part = uri.replace(/\/repositories\/[0-9]+\//,"");
        var bits = last_part.match(/([a-z_]+)\/([0-9]+)/);
        var type_plural = bits[1].replace(/\//g,'_');
        var id = bits[2];
        var type = type_plural.replace(/s$/, '');

        return {
            type: type,
            id: id
        };
    }

    TreeIds.backend_uri_to_frontend_uri = function (uri) {
        return AS.app_prefix(uri.replace(/\/repositories\/[0-9]+\//, ""))
    }

    TreeIds.parse_tree_id = function (tree_id) {
        var regex_match = tree_id.match(/([a-z_]+)([0-9]+)/);
        if (regex_match == null || regex_match.length != 3) {
            return;
        }

        var row_type = regex_match[1].replace(/_$/, "");
        var row_id = regex_match[2];

        return {type: row_type, id: row_id}
    }

    TreeIds.link_url = function(uri) {
        // convert the uri into tree-speak
        return "#tree::" + TreeIds.uri_to_tree_id(uri);
    };

    exports.TreeIds = TreeIds
    /************************************************************************/


    var SCROLL_DELAY_MS = 100;
    var THRESHOLD_EMS = 300;

    function LargeTree(datasource, container, root_uri, read_only, renderer, tree_loaded_callback, node_selected_callback) {
        this.source = datasource;
        this.elt = container;
        this.scrollTimer = undefined;
        this.renderer = renderer;

        this.progressIndicator = $('<progress class="largetree-progress-indicator" />');
        this.elt.before(this.progressIndicator);

        this.elt.css('will-change', 'transform');

        this.root_uri = root_uri;
        this.root_tree_id = TreeIds.uri_to_tree_id(root_uri);

        // default to the root_id
        this.current_tree_id = this.root_tree_id;

        this.read_only = read_only;

        this.waypoints = {};

        this.node_selected_callback = node_selected_callback;
        this.populateWaypointHooks = [];
        this.collapseNodeHooks = [];

        this.errorHandler = $.noop;

        this.initEventHandlers();
        this.renderRoot(function () {
            tree_loaded_callback();
        });
    }

    LargeTree.prototype.setGeneralErrorHandler = function (callback) {
        this.errorHandler = callback;
    };

    LargeTree.prototype.currentlyLoading = function () {
        this.progressIndicator.css('visibility', 'visible');
    }

    LargeTree.prototype.doneLoading = function () {
        var self = this;
        setTimeout(function () {
            self.progressIndicator.css('visibility', 'hidden');
        }, 0);
    }


    LargeTree.prototype.addPlugin = function (plugin) {
        plugin.initialize(this);

        return plugin;
    };

    LargeTree.prototype.addPopulateWaypointHook = function (callback) {
        this.populateWaypointHooks.push(callback);
    };

    LargeTree.prototype.addCollapseNodeHook = function (callback) {
        this.collapseNodeHooks.push(callback);
    };

    LargeTree.prototype.displayNode = function (tree_id, done_callback) {
        var self = this;

        var node_id = TreeIds.parse_tree_id(tree_id).id;

        var displaySelectedNode = function () {
            var node = $('#' + tree_id);

            if (done_callback) {
                done_callback(node);
            }
        };

        if (tree_id === self.root_tree_id) {
            /* We don't need to do any fetching for the root node. */
            displaySelectedNode();
        } else {
            self.source.fetchPathFromRoot(node_id).done(function (paths) {
                self.recursivelyPopulateWaypoints(paths[node_id], displaySelectedNode);
            });
        }
    };

    LargeTree.prototype.reparentNodes = function (new_parent, nodes, position) {
        var self = this;

        if (!self.isReparentAllowed(nodes, new_parent)) {
            // This move is not allowed!
            // alert user
            AS.openQuickModal("Unable to perform move",
                              "The move has been disallowed as a parent cannot become its own child.")

            return {
                'done' : $.noop
            };
        }

        var scrollPosition = self.elt.scrollTop();
        var loadingMask = self.displayLoadingMask(scrollPosition)

        var parent_uri = new_parent.data('uri');

        if (!parent_uri) {
            parent_uri = this.root_uri;
        }

        if (position) {
            /* If any of the nodes we're moving were originally siblings that
            fall before the drop target, we need to adjust the position for the
            fact that everything will "shift up" when they're moved */
            var positionAdjustment = 0;

            $(nodes).each(function (idx, elt) {
                var level = $(elt).data('level');
                var node_parent_uri = $(elt).prevAll('.indent-level-' + (level - 1) + ':first').data('uri');

                if (!node_parent_uri) {
                    node_parent_uri = self.root_uri;
                }

                if (node_parent_uri == parent_uri && $(elt).data('position') < position) {
                    positionAdjustment += 1;
                }
            });

            position -= positionAdjustment;
        } else {
            position = 0;
        }

        /* Record some information about the current state of the tree so we can
           revert things to more-or-less how they were once we reload. */
        var uris_to_reopen = [];


        /* Refresh the drop target */
        if (new_parent.data('uri') && !new_parent.is('.root-row')) {
            uris_to_reopen.push(new_parent.data('uri'));
        }

        /* Reopen the parent of any nodes we dragged from */
        $(nodes).each(function (idx, elt) {
            var level = $(elt).data('level');
            var parent_uri = $(elt).prevAll('.indent-level-' + (level - 1) + ':first').data('uri');

            if (parent_uri) {
                uris_to_reopen.push(parent_uri);
            } else {
                /* parent was root node */
            }
        });

        /* Reopen any other nodes that were open */
        self.elt.find('.expandme .expanded').closest('tr').each(function (idx, elt) {
            uris_to_reopen.push($(elt).data('uri'));
        });

        var uris_to_move = [];
        $(nodes).each(function (_, elt) {
            uris_to_move.push($(elt).data('uri'));
        });

        return this.source.reparentNodes(parent_uri,
                                         uris_to_move,
                                         position)
            .done(function () {
                self.redisplayAndShow(uris_to_reopen, function () {
                    self.considerPopulatingWaypoint(function () {
                        self.elt.animate({
                            scrollTop: scrollPosition
                        }, function(){
                            loadingMask.remove();
                        });

                        $(nodes).each(function (i, node) {
                            var id = $(node).attr('id');
                            self.elt.find('#' + id).addClass('reparented-highlight');

                            setTimeout(function () {
                                self.elt.find('#' + id).removeClass('reparented-highlight').addClass('reparented');
                            }, 500);
                        });
                    });
                });
            });
    };

    LargeTree.prototype.displayLoadingMask = function (scrollPosition) {
        var self = this;

        var loadingMask = self.elt.clone(false);

        loadingMask.on('click', function (e) { e.preventDefault(); return false; });

        loadingMask.find('*').removeAttr('id');
        loadingMask.attr('id', 'tree-container-loading');
        loadingMask.css('z-index', 2000)
                   .css('position', 'absolute')
                   .css('left', self.elt.offset().left)
                   .css('top', self.elt.offset().top);

        loadingMask.width(self.elt.width());

        var spinner = $('<div class="spinner" />');
        spinner.css('font-size', '50px')
               .css('display', 'inline')
               .css('z-index', 2500)
               .css('position', 'fixed')
               .css('margin', 0)
               .css('left', '50%')
               .css('top', '50%');


        $('body').prepend(loadingMask);
        $('body').prepend(spinner);

        loadingMask.scrollTop(scrollPosition);

        return {
            remove: function () {
                loadingMask.remove();
                spinner.remove();
            }
        };
    };

    LargeTree.prototype.redisplayAndShow = function(uris, done_callback) {
        var self = this;

        uris = $.unique(uris);

        if (!done_callback) {
            done_callback = $.noop;
        }

        self.renderRoot(function () {
            var uris_to_reopen = uris.slice(0)
            var displayedNodes = [];

            var handle_next_uri = function (node) {
                if (node) {
                    displayedNodes.push(node);
                }

                if (uris_to_reopen.length == 0) {
                    /* Finally, expand any nodes that haven't been expanded along the way */
                    var expand_next = function (done_callback) {
                        if (displayedNodes.length > 0) {
                            var node = displayedNodes.shift();
                            if (node.is('.root-row')) {
                                done_callback();
                            } else {
                                self.expandNode(node, function () {
                                    expand_next(done_callback);
                                });
                            }
                        } else {
                            done_callback();
                        }
                    };

                    return expand_next(function () {
                        return done_callback();
                    });
                }

                var uri = uris_to_reopen.shift();
                var tree_id = TreeIds.uri_to_tree_id(uri);

                self.displayNode(tree_id, handle_next_uri);
            };

            handle_next_uri();
        });
    };

    LargeTree.prototype.recursivelyPopulateWaypoints = function (path, done_callback) {
        var self = this;

        /*
           Here, `path` is a list of objects like:

             node: /some/uri; offset: NN

           which means "expand subtree /some/uri then populate waypoint NN".

           The top-level is special because we automatically show it as expanded, so we skip expanding the root node.
         */

        if (!path || path.length === 0) {
            done_callback();
            return;
        }

        var waypoint_description = path.shift();

        var next_fn = function () {
            if (!self.waypoints[waypoint_description.node]) {
                /* An error occurred while expanding. */
                debugger;
                return;
            }

            var waypoint = self.waypoints[waypoint_description.node][waypoint_description.offset];

            if (!waypoint) {
                /* An error occurred while expanding. */
                debugger;
                return;
            }

            self.populateWaypoint(waypoint, function () {
                self.recursivelyPopulateWaypoints(path, done_callback);
            });
        };

        if (waypoint_description.node) {
            var tree_id = TreeIds.uri_to_tree_id(waypoint_description.node);

            if ($('#' + tree_id).find('.expandme').find('.expanded').length > 0) {
                next_fn();
            } else {
                self.toggleNode($('#' + tree_id).find('.expandme'), next_fn);
            }
        } else {
            /* this is the root node (subtree already expanded) */
            next_fn();
        }
    };

    LargeTree.prototype.deleteWaypoints = function (parent) {
        var waypoint = parent.next();

        if (!waypoint.hasClass('waypoint')) {
            /* Nothing left to burn */
            return false;
        }

        if (!waypoint.hasClass('populated')) {
            waypoint.remove();

            return true;
        }

        var waypointLevel = waypoint.data('level');

        if (!waypointLevel) {
            return false;
        }

        /* Delete all elements up to and including the end waypoint marker */
        while (true) {
            var elt = waypoint.next();

            if (elt.length === 0) {
                break;
            }

            if (elt.hasClass('end-marker') && waypointLevel == elt.data('level')) {
                elt.remove();
                break;
            } else {
                elt.remove();
            }
        }

        waypoint.remove();

        return true;
    };

    LargeTree.prototype.toggleNode = function (button, done_callback) {
        var self = this;
        var parent = button.closest('tr');

        if (button.data('expanded')) {
            self.collapseNode(parent, done_callback);
        } else {
            self.expandNode(parent, done_callback);
        }
    };

    LargeTree.prototype.expandNode = function (row, done_callback) {
        var self = this;
        var button = row.find('.expandme');

        if (button.data('expanded')) {
            if (done_callback) {
                done_callback();
            }
            return;
        }

        button.find('.expandme-icon').addClass('expanded');
        $(button).data('expanded', true);

        if (!row.data('uri')) {
            debugger;
        }

        self.source.fetchNode(row.data('uri'))
            .done(function (node) {
                self.appendWaypoints(row, row.data('uri'), node.waypoints, node.waypoint_size, row.data('level') + 1);

                if (done_callback) {
                    done_callback();
                }
            })
            .fail(function () {
                self.errorHandler.apply(self, ['fetch_node_failed'].concat([].slice.call(arguments)));
            });
    };

    LargeTree.prototype.collapseNode = function (row, done_callback) {
        var self = this;

        while (self.deleteWaypoints(row)) {
            /* Remove the elements from one or more waypoints */
        }

        var button = row.find('.expandme');

        $(button).data('expanded', false);
        button.find('.expandme-icon').removeClass('expanded');

        /* Removing elements might have scrolled something else into view */
        setTimeout(function () {
            self.considerPopulatingWaypoint();
        }, 0);

        $(self.collapseNodeHooks).each(function (idx, hook) {
            hook();
        });

        if (done_callback) {
            done_callback();
        }
    };

    LargeTree.prototype.initEventHandlers = function () {
        var self = this;
        var currentlyExpanding = false;

        /* Content loading */
        this.elt.on('scroll', function (event) {
            if (self.scrollTimer) {
                clearTimeout(self.scrollTimer);
            }

            var handleScroll = function () {
                if (!currentlyExpanding) {
                    currentlyExpanding = true;

                    self.considerPopulatingWaypoint(function () {
                        currentlyExpanding = false;
                    });
                }
            };

            self.scrollTimer = setTimeout(handleScroll, SCROLL_DELAY_MS);
        });

        /* Expand/collapse nodes */
        $(this.elt).on('click', '.expandme', function (e) {
            e.preventDefault();
            self.toggleNode($(this));
        });
    };

    LargeTree.prototype.makeWaypoint = function (uri, offset, indentLevel) {
        var result = $('<tr class="waypoint" />');
        result.addClass('indent-level-' + indentLevel);

        result.data('level', indentLevel);
        result.data('uri', uri);
        result.data('offset', offset);

        if (!this.waypoints[uri]) {
            this.waypoints[uri] = {};
        }

        /* Keep a lookup table of waypoints so we can find and populate them programmatically */
        this.waypoints[uri][offset] = result;

        return result;
    };

    LargeTree.prototype.appendWaypoints = function (elt, parentURI, waypointCount, waypointSize, indentLevel) {
        var child_count = elt.data('child_count');
        for (var i = waypointCount - 1; i >= 0; i--) {
            var waypoint = this.makeWaypoint(parentURI, i, indentLevel);

            waypoint.data('child_count_at_this_level', child_count);

            /* We force the line height to a constant 2em so we can predictably
               guess how tall to make waypoints.  See largetree.less for where we
               set this on table.td elements. */
            waypoint.css('height', (waypointSize * 2) + 'em');
            elt.after(waypoint);
        }

        var self = this;
        setTimeout(function () {self.considerPopulatingWaypoint(); }, 0);
    };

    LargeTree.prototype.renderRoot = function (done_callback) {
        var self = this;
        self.waypoints = {};

        var rootList = $('<table class="root" />');

        this.source.fetchRootNode().done(function (rootNode) {
            var row = self.renderer.get_root_template();

            row.data('uri', rootNode.uri);
            row.attr('id', TreeIds.uri_to_tree_id(rootNode.uri));
            row.addClass('root-row');
            row.data('level', 0);
            row.data('child_count', rootNode.child_count);
            row.data('jsonmodel_type', rootNode.jsonmodel_type);
            row.find('.title').append($('<a>').attr('href', TreeIds.link_url(rootNode.uri))
                                              .addClass('record-title')
                                              .text(rootNode.title));

            rootList.append(row);
            self.appendWaypoints(row, null, rootNode.waypoints, rootNode.waypoint_size, 1);

            /* Remove any existing table */
            self.elt.find('table.root').remove();

            self.elt.prepend(rootList);
            self.renderer.add_root_columns(row, rootNode);
            if (done_callback) {
                done_callback();
            }
        });
    };

    LargeTree.prototype.considerPopulatingWaypoint = function (done_callback) {
        var self = this;

        if (!done_callback) {
            done_callback = $.noop;
        }

        var emHeight = parseFloat($("body").css("font-size"));
        var threshold_px = emHeight * THRESHOLD_EMS;
        var containerTop = this.elt.offset().top;
        var containerHeight = this.elt.outerHeight();

        /* Pick a reasonable guess at which waypoint we might want to populate
           (based on our scroll position) */
        var allWaypoints = self.elt.find('.waypoint');

        if (allWaypoints.length == 0) {
            done_callback();
            return;
        }

        var scrollPercent = self.elt.scrollTop() / self.elt.find('table.root').height();
        var startIdx = Math.floor(scrollPercent * allWaypoints.length);

        var waypointToPopulate;
        var evaluateWaypointFn = function (elt) {
            /* The element's top is measured from the top of the page, but we
               want it relative to the top of the container.  Adjust as
               appropriate. */
            var eltTop = elt.offset().top - containerTop;
            var eltBottom = eltTop + elt.height();

            var waypointVisible = (Math.abs(eltTop) <= (containerHeight + threshold_px)) ||
                                  (Math.abs(eltBottom) <= (containerHeight + threshold_px)) ||
                                  (eltTop < 0 && eltBottom > 0);

            if (waypointVisible) {
                var candidate = {
                    elt: elt,
                    top: eltTop,
                    level: elt.data('level'),
                };

                if (!waypointToPopulate) {
                    waypointToPopulate = candidate;
                } else {
                    if (waypointToPopulate.level > candidate.level || waypointToPopulate.top > candidate.top) {
                        waypointToPopulate = candidate;
                    }
                }

                return true;
            } else {
                return false;
            }
        };

        /* Search for a waypoint by scanning backwards */
        for (var i = startIdx; i >= 0; i--) {
            var waypoint = $(allWaypoints[i]);

            if (waypoint.hasClass('populated')) {
                /* nothing to do for this one */
                continue;
            }

            var waypointWasVisible = evaluateWaypointFn(waypoint);

            if (!waypointWasVisible && i < startIdx) {
                /* No point considering waypoints even further up in the DOM */
                break;
            }
        }

        /* Now scan forwards */
        for (var i = startIdx + 1; i < allWaypoints.length; i++) {
            var waypoint = $(allWaypoints[i]);

            if (waypoint.hasClass('populated')) {
                /* nothing to do for this one */
                continue;
            }

            var waypointWasVisible = evaluateWaypointFn(waypoint);

            if (!waypointWasVisible) {
                /* No point considering waypoints even further up in the DOM */
                break;
            }
        }

        if (waypointToPopulate) {
            self.currentlyLoading();
            self.populateWaypoint(waypointToPopulate.elt, function () {
                setTimeout(function () {
                    self.considerPopulatingWaypoint(done_callback);
                }, 0);
            });
        } else {
            self.doneLoading();
            done_callback();
        }
    };

    var activeWaypointPopulates = {};

    LargeTree.prototype.populateWaypoint = function (elt, done_callback) {
        if (elt.hasClass('populated')) {
            done_callback();
            return;
        }

        var self = this;
        var uri = elt.data('uri');
        var offset = elt.data('offset');
        var level = elt.data('level');

        var key = uri + "_" + offset;
        if (activeWaypointPopulates[key]) {
            return;
        }

        activeWaypointPopulates[key] = true;

        this.source.fetchWaypoint(uri, offset).done(function (nodes) {
            var endMarker = self.renderer.endpoint_marker();
            endMarker.data('level', level);
            endMarker.data('child_count_at_this_level', elt.data('child_count_at_this_level'));
            endMarker.addClass('indent-level-' + level);

            elt.after(endMarker);

            var newRows = [];
            var current = undefined;

            $(nodes).each(function (idx, node) {
                var row = self.renderer.get_node_template();

                row.addClass('largetree-node indent-level-' + level);
                row.data('level', level);
                row.data('child_count', node.child_count);

                var title = row.find('.title');
                var strippedTitle = $("<div>").html(node.title).text();
                title.append($('<a class="record-title" />').prop('href', TreeIds.link_url(node.uri)).text(node.title));
                title.attr('title', strippedTitle);

                var ex = row.find('.expandme');
                ex.attr('aria-label', 'expand element');
                if (node.child_count === 0) {
                    ex.css('visibility', 'hidden');
                    ex.attr('aria-hidden', 'true');
                }

                self.renderer.add_node_columns(row, node);

                var tree_id = TreeIds.uri_to_tree_id(node.uri);

                row.data('uri', node.uri);
                row.data('jsonmodel_type', node.jsonmodel_type);
                row.data('position', node.position);
                row.data('parent_id', node.parent_id);
                row.attr('id', tree_id);

                if (self.current_tree_id == tree_id) {
                    row.addClass('current');
                    current = row;
                } else {
                    row.removeClass('current');
                }

                newRows.push(row);
            });

            elt.after.apply(elt, newRows);

            elt.addClass('populated');

            activeWaypointPopulates[key] = false;

            $(self.populateWaypointHooks).each(function (idx, hook) {
                hook();
            });

            if (current) {
                $.proxy(self.node_selected_callback, self)(current, self);
            }

            done_callback();
        });
    };

    /*********************************************************************************/
    /* Data source */
    /*********************************************************************************/
    function TreeDataSource(baseURL) {
        this.url = baseURL.replace(/\/+$/, "");
    }


    TreeDataSource.prototype.urlFor = function (action) {
        return this.url + "/" + action;
    };

    TreeDataSource.prototype.fetchRootNode = function () {
        var self = this;

        return $.ajax(this.urlFor("root"),
                      {
                          method: "GET",
                          dataType: 'json',
                      })
                .done(function (rootNode) {
                    self.cachePrecomputedWaypoints(rootNode);
                });
    };

    TreeDataSource.prototype.fetchNode = function (uri) {
        var self = this;

        if (!uri) {
            throw "Node can't be empty!";
        }

        return $.ajax(this.urlFor("node"),
                      {
                          method: "GET",
                          dataType: 'json',
                          data: {
                              /* THINKME: Should rename node to node_uri?  S */
                              node: uri,
                          }
                      })
                .done(function (node) {
                    self.cachePrecomputedWaypoints(node);
                });
    };

    TreeDataSource.prototype.fetchPathFromRoot = function (node_id) {
        var self = this;

        return $.ajax(this.urlFor("node_from_root"),
                      {
                          method: "GET",
                          dataType: 'json',
                          data: {
                              node_ids: [node_id],
                          }
                      });
    };

    TreeDataSource.prototype.fetchWaypoint = function (uri, offset) {
        var cached = this.getPrecomputedWaypoint(uri, offset);

        if (cached) {
            return {
                done: function (callback) {
                    callback(cached);
                }
            };
        } else {
            return $.ajax(this.urlFor("waypoint"),
                          {
                              method: "GET",
                              dataType: 'json',
                              data: {
                                  node: uri,
                                  offset: offset,
                              }
                          });
        }
    };

    TreeDataSource.prototype.reparentNodes = function (new_parent_uri, node_uris, position) {
        var target = TreeIds.backend_uri_to_frontend_uri(new_parent_uri);

        return $.ajax(target + "/accept_children",
               {
                   method: 'POST',
                   data: {
                       children: node_uris,
                       index: position,
                   }
               });
    };

    var precomputedWaypoints = {};

    TreeDataSource.prototype.getPrecomputedWaypoint = function (uri, offset) {
        var result;

        if (uri === null) {
            uri = "";
        }

        if (precomputedWaypoints[uri] && precomputedWaypoints[uri][offset]) {
            result = precomputedWaypoints[uri][offset];
            precomputedWaypoints[uri] = {};
        }

        return result;
    };

    TreeDataSource.prototype.cachePrecomputedWaypoints = function (node) {
        $(Object.keys(node.precomputed_waypoints)).each(function (idx, uri) {
            precomputedWaypoints[uri] = node.precomputed_waypoints[uri];
        });
    };

    LargeTree.prototype.setCurrentNode = function(tree_id, callback) {
        $('#'+this.current_tree_id, this.elt).removeClass('current');
        this.current_tree_id = tree_id;

        if ($('#'+this.current_tree_id, this.elt).length == 1) {
            var current = $('#'+this.current_tree_id, this.elt);
            current.addClass('current');
            $.proxy(this.node_selected_callback, self)(current, this);
            if (callback) {
                callback();
            }
        } else {
            this.displayNode(this.current_tree_id, callback);
        }
    };

    LargeTree.prototype.isReparentAllowed = function(nodes_to_move, target_node) {
        var self = this;

        if (target_node.is('.root-row')) {
            // always able to drop onto root node
            return true;
        }

        var uris_to_check = [];
        uris_to_check.push(target_node.data('uri'));
        var level = target_node.data('level') - 1;
        var row = target_node;
        while (level > 0) {
            row = row.prevAll('.largetree-node.indent-level-' + level + ':first');
            uris_to_check.push(row.data('uri'));
            level -= 1;
        }

        var isAllowed = true;

        $(nodes_to_move).each(function (idx, selectedRow) {
            var uri = $(selectedRow).data('uri');
            if ($.inArray(uri, uris_to_check) >= 0) {
                isAllowed = false;
                return;
            }
        });

        return isAllowed;

    };


    exports.LargeTree = LargeTree;
    exports.TreeDataSource = TreeDataSource;

}(window));
(function (exports) {
    var DRAG_DELAY = 100;
    var MOUSE_OFFSET = 20;
    var EXPAND_DELAY = 200;
    var HOTSPOT_HEIGHT = 200;
    var AUTO_SCROLL_SPEED = 200;

    function LargeTreeDragDrop(large_tree) {
        this.dragActive = false;
        this.dragIndicator = $('<div class="tree-drag-indicator" />');
        this.rowsToMove = [];

        this.scrollUpHotspot = $('<div class="tree-scroll-hotspot tree-scroll-up-hotspot" />');
        this.scrollDownHotspot = $('<div class="tree-scroll-hotspot tree-scroll-down-hotspot" />');

        this.dragDelayTimer = undefined;
        this.expandTimer = undefined;
        this.autoScrollTimer = undefined;

        this.lastCursorPosition = undefined;

        this.large_tree = large_tree;

        var self = this;
        large_tree.addCollapseNodeHook(function () {
            self.handleCollapseNode();
        });

    }

    LargeTreeDragDrop.prototype.handleCollapseNode = function() {
        var self = this;

        /* If any of our rowsToMove selections are no longer visible, deselect them. */
        var selectionToKeep = [];

        $(self.rowsToMove).each(function (idx, selectedRow) {
            if ($(selectedRow).is(':visible')) {
                selectionToKeep.push(selectedRow);
            }
        });

        self.rowsToMove = selectionToKeep;

        /* Renumber any remaining selections */
        self.refreshAnnotations();
    };

    LargeTreeDragDrop.prototype.isDropAllowed = function(target_node) {
        return this.large_tree.isReparentAllowed(this.rowsToMove, target_node);
    };

    LargeTreeDragDrop.prototype.setDragHandleState = function () {
        var self = this;

        $('.drag-handle.drag-disabled', self.largetree.elt).removeClass('drag-disabled');
        $('.multiselected-row', self.largetree.elt).removeClass('multiselected-row');

        /* Mark the children of each selected row as unselectable */
        $(self.rowsToMove).each(function (idx, selectedRow) {
            var waypoint = $(selectedRow).next();

            while (waypoint.hasClass('waypoint')) {
                if (waypoint.hasClass('populated')) {
                    var startLevel = waypoint.data('level');

                    var elt = waypoint.next();
                    while (!elt.hasClass('end-marker') && elt.data('level') >= startLevel) {
                        elt.find('.drag-handle').addClass('drag-disabled');
                        elt = elt.next();
                    }

                    waypoint = elt.next();
                } else {
                    waypoint = waypoint.next();
                }
            }
        });

        /* Mark the ancestors of each selected row as unselectable */
        $(self.rowsToMove).each(function (idx, selectedRow) {
            var next = $(selectedRow);
            var level = next.data('level') - 1;

            while (level > 0) {
                next = next.prevAll('.largetree-node.indent-level-' + level + ':first');
                next.find('.drag-handle').addClass('drag-disabled');
                level -= 1;
            }
        });

        /* Highlight selected rows */
        $('.multiselected', self.largetree.elt).closest('tr').addClass('multiselected-row');

        self.refreshAnnotations();
    };

    LargeTreeDragDrop.prototype.refreshAnnotations = function() {
        var self = this;

        self.large_tree.elt.find('.drag-annotation').remove();
        self.rowsToMove.map(function (elt, idx) {
            var $annotation = $('<div>').addClass('drag-annotation');

            if (self.rowsToMove.length > 1) {
                /* Only show selection number if there's more than one selection. */
                $annotation.text(idx + 1);
            }

            $annotation.appendTo($(elt).find('td:first'));
        });
    };

    LargeTreeDragDrop.prototype.handleMultiSelect = function (selection) {
        var self = this;
        var row = selection.closest('tr');

        if (selection.hasClass('multiselected')) {
            /* deselect a selected item */
            self.rowsToMove = self.rowsToMove.filter(function (elt) {
                return (elt != row[0]);
            });

            selection.removeClass('multiselected');
        } else {
            /* Add this item to the selection */
            selection.addClass('multiselected');
            self.rowsToMove.push(row[0]);
        }

        self.setDragHandleState();

        return false;
    };

    LargeTreeDragDrop.prototype.handleShiftSelect = function (selection) {
        var self = this;

        var row = selection.closest('tr');
        var lastSelection = self.rowsToMove[self.rowsToMove.length - 1];

        if (lastSelection) {
            var start = $(lastSelection);
            var end = row;

            if (start.index() > end.index()) {
                /* Oops.  Swap them. */
                var tmp = end;
                end = start;
                start = tmp;
            }

            var rowsInRange = start.nextUntil(end).andSelf().add(end);
            var targetLevel = $(lastSelection).data('level');

            rowsInRange.each(function (i, row) {
                if ($(row).is('.largetree-node')) {
                    if (!$(row).is('.multiselected') && $(row).data('level') === targetLevel) {
                        $(row).find('.drag-handle').addClass('multiselected');
                        self.rowsToMove.push(row);
                    }
                }
            });

            self.rowsToMove = $.unique(self.rowsToMove);

            self.setDragHandleState();
        }

        return false;
    };

    LargeTreeDragDrop.prototype.initialize = function (largetree) {
        var self = this;

        self.largetree = largetree;

        largetree.addPopulateWaypointHook(function () {
            /* Make sure none of the descendants of any multi-selected node can
               be selected */
            self.setDragHandleState();
        });

        $(largetree.elt).on('mousedown', '.drag-handle', function (event) {
            var selection = $(this);

            if (self.isMultiSelectKeyHeld(event)) {
                return self.handleMultiSelect(selection);
            } else if (event.shiftKey) {
                return self.handleShiftSelect(selection);
            }

            self.dragDelayTimer = setTimeout(function () {
                self.dragDelayTimer = undefined;

                /* Start a drag of one or more items */
                var row = selection.closest('tr');

                if ($('.multiselected', largetree.elt).length > 0) {
                    if (!row.find('.drag-handle').hasClass('multiselected')) {
                        /* If the item we started dragging from wasn't part of
                           the multiselection, add it in. */
                        row.find('.drag-handle').addClass('multiselected');
                        self.rowsToMove.push(row[0]);
                    }
                } else {
                    /* We're just tragging a single row */
                    self.rowsToMove = [row[0]];
                    row.addClass('multiselected');
                }

                self.setDragHandleState();

                self.dragActive = true;

                self.scrollUpHotspot.width(largetree.elt.width()).height(HOTSPOT_HEIGHT);
                self.scrollDownHotspot.width(largetree.elt.width()).height(HOTSPOT_HEIGHT);

                self.scrollUpHotspot.css('top', largetree.elt.offset().top - HOTSPOT_HEIGHT)
                               .css('left', largetree.elt.offset().left);
                self.scrollDownHotspot.css('top', largetree.elt.offset().top + largetree.elt.height())
                                 .css('left', largetree.elt.offset().left);

                self.dragIndicator.empty().hide();
                self.dragIndicator.append($('<ol />').append(self.rowsToMove.map(function (elt, idx) {
                    return $('<li />').text($(elt).find('.title').text());
                })));


                $(largetree.elt).focus();

                $('body').prepend(self.dragIndicator);
                $('body').prepend(self.scrollUpHotspot);
                $('body').prepend(self.scrollDownHotspot);
            }, DRAG_DELAY);

            return false;
        });

        $(document).on('mousedown', function (event) {
            if (!self.isMultiSelectKeyHeld(event) &&

                /* Not clicking on a drag handle */
                !$(event.target).hasClass('drag-handle') &&

                /* Not operating the dropdown menu */
                $(event.target).closest('.largetree-dropdown-menu').length === 0 &&

                /* Not attempting to expand something */
                $(event.target).closest('.expandme').length === 0 &&

                /* Not attempting to click a toolbar action */
                $(event.target).closest('#tree-toolbar').length === 0 &&

                /* Not using the resize handle */
                $(event.target).closest('.ui-resizable-handle').length === 0) {

                $(largetree.elt).find('.multiselected').removeClass('multiselected');
                self.rowsToMove = [];

                self.setDragHandleState();
            }
        });

        $(document).on('mousemove', function (event) {
            if (self.dragActive) {
                self.lastCursorPosition = {x: event.clientX, y: event.clientY};

                self.dragIndicator[0].style.left = (event.clientX + MOUSE_OFFSET) + 'px';
                self.dragIndicator[0].style.top = (event.clientY + MOUSE_OFFSET) + 'px';
                self.dragIndicator[0].style.display = 'inline-block';
            }
        });

        $(largetree.elt).on('mouseout', '.expandme', function (event) {
            if (self.expandTimer) {
                clearTimeout(self.expandTimer);
                self.expandTimer = undefined;
            }
        });

        $(largetree.elt).on('mouseover', '.expandme', function (event) {
            var button = $(this);

            if (self.dragActive && button.find('.expanded').length === 0) {
                self.expandTimer = setTimeout(function () {
                    largetree.toggleNode(button);
                }, EXPAND_DELAY);
            }
        });

        $(largetree.elt).on('mouseenter', 'tr.root-row, tr.largetree-node', function (event) {
            if (self.dragActive) {
                if (self.isDropAllowed($(this))) {
                    $(this).addClass('drag-drop-over');
                } else {
                    $(this).addClass('drag-drop-over-disallowed');
                }
            }
        });

        $(largetree.elt).on('mouseleave', 'tr.root-row, tr.largetree-node', function (event) {
            if (self.dragActive) {
                $(this).removeClass('drag-drop-over').
                        removeClass('drag-drop-over-disallowed');
            }
        });

        $(document).on('mouseenter', '.tree-scroll-hotspot', function (event) {
            var hotspot = event.target;

            var direction = 1;

            if ($(hotspot).hasClass('tree-scroll-up-hotspot')) {
                direction = -1;
            }

            var hotspotBounds = hotspot.getBoundingClientRect();
            self.autoScrollTimer = setInterval(function () {
                if (self.lastCursorPosition) {
                    var scrollAcceleration = (self.lastCursorPosition.y - hotspotBounds.top) / hotspotBounds.height;

                    if (direction == -1) {
                        scrollAcceleration = (1 - scrollAcceleration);
                    }

                    /* Go faster/slower at the two extremes */
                    if (scrollAcceleration > 0.8) {
                        scrollAcceleration += 0.1;
                    }

                    if (scrollAcceleration < 0.2) {
                        scrollAcceleration = 0.05;
                    }

                    var position = $(largetree.elt).scrollTop();

                    $(largetree.elt).scrollTop(position + (direction * AUTO_SCROLL_SPEED * scrollAcceleration));
                }
            }, 50);
        });

        $(document).on('mouseout', '.tree-scroll-hotspot', function (event) {
            if (self.autoScrollTimer) {
                clearTimeout(self.autoScrollTimer);
            }
            self.autoScrollTimer = undefined;
        });


        $(document).on('mouseup', function (event) {
            if (self.dragActive) {
                self.dragActive = false;
                self.dragIndicator.remove();
                $(largetree.elt).find('.drag-drop-over').removeClass('drag-drop-over');
                $(largetree.elt).find('.drag-drop-over-disallowed').removeClass('drag-drop-over-disallowed');
                $(largetree.elt).find('.multiselected').removeClass('multiselected');

                if (self.autoScrollTimer) {
                    clearTimeout(self.autoScrollTimer);
                    self.autoScrollTimer = undefined;
                }

                $(document).find('.tree-scroll-hotspot').remove();

                var dropTarget = $(event.target).closest('tr.largetree-node,tr.root-row');

                /* If they didn't drop on a row, that's a cancel. */
                if (dropTarget.length > 0 && self.isDropAllowed(dropTarget)) {
                    self.handleDrop(dropTarget);
                } else {
                    self.rowsToMove = [];
                }

                self.setDragHandleState();

                event.preventDefault();
                return false;
            }

            if (self.dragDelayTimer) {
                /* The mouse click finished prior to our drag starting (so we've
                   received a click, not a drag) */

                clearTimeout(self.dragDelayTimer);
                self.dragDelayTimer = undefined;

                /* Deselect everything */
                self.resetState();

                self.handleMultiSelect($(event.target));
            }

            return true;
        });
    };


    LargeTreeDragDrop.prototype.isMultiSelectKeyHeld = function (mouseEvent) {
        return (mouseEvent.ctrlKey || mouseEvent.metaKey);
    };


    LargeTreeDragDrop.prototype.resetState = function () {
        var self = this;

        $(self.largetree.elt).find('.multiselected').removeClass('multiselected');

        self.rowsToMove = [];

        if (self.blockout) {
            self.blockout.remove();
            self.blockout = undefined;
        }

        if (self.menu) {
            self.menu.remove();
            self.menu = undefined;
        }
        self.setDragHandleState();
    };

    LargeTreeDragDrop.prototype.handleDrop = function (dropTarget) {
        var self = this;

        // blockout the page
        self.blockout = $('<div>').addClass('largetree-blockout');
        $(document.body).append(self.blockout);

        // insert a menu!
        self.menu = $('<ul>').addClass('dropdown-menu largetree-dropdown-menu');
        if (!dropTarget.is('.root-row')) {
            self.menu.append($('<li><a href="javascript:void(0)" class="add-items-before">Add Items Before</a></li>'));
        }

        self.menu.append($('<li><a href="javascript:void(0)" class="add-items-as-children">Add Items as Children</a></li>'));

        if (!dropTarget.is('.root-row')) {
            self.menu.append($('<li><a href="javascript:void(0)" class="add-items-after">Add Items After</a></li>'));
        }

        $(document.body).append(self.menu);
        self.menu.css('position','absolute');
        self.menu.css('top',dropTarget.offset().top + dropTarget.height());
        self.menu.css('left',dropTarget.offset().left);
        self.menu.css('z-index', 1000);
        self.menu.show();
        self.menu.find('a:first').focus();
        self.menu.on('keydown', function(event) {
            if (event.keyCode == 27) { //escape
                self.resetState();
                return false;
            } else if (event.keyCode == 38) { //up arrow
                if ($(event.target).closest('li').prev().length > 0) {
                    $(event.target).closest('li').prev().find('a').focus();
                }
                return false;
            } else if (event.keyCode == 40) { //down arrow
                if ($(event.target).closest('li').next().length > 0) {
                    $(event.target).closest('li').next().find('a').focus();
                }
                return false;
            }

            return true;
        });

        self.blockout.on('click', function() {
            self.resetState();
        });

        function getParent(node) {
            return node.prevAll('.indent-level-'+(node.data('level') - 1) + ':first');
        }

        self.menu.on('click', '.add-items-before', function() {
            self.largetree.reparentNodes(getParent(dropTarget), self.rowsToMove, dropTarget.data('position')).done(function() {
                self.resetState();
            });
        }).on('click', '.add-items-as-children', function() {
            self.largetree.reparentNodes(dropTarget, self.rowsToMove, dropTarget.data('child_count')).done(function() {
                self.resetState();
            });
        }).on('click', '.add-items-after', function() {
            self.largetree.reparentNodes(getParent(dropTarget), self.rowsToMove, dropTarget.data('position') + 1).done(function() {
                self.resetState();
            });
        });
    };

    LargeTreeDragDrop.prototype.simulate_drag_and_drop = function(source_tree_id, target_tree_id) {
        var source = $('#' + source_tree_id);
        var target = $('#' + target_tree_id);

        this.rowsToMove = [source];
        this.handleDrop(target);
    };

    exports.LargeTreeDragDrop = LargeTreeDragDrop;
    exports.DRAGDROP_HOTSPOT_HEIGHT = HOTSPOT_HEIGHT;

}(window));








(function (exports) {
    "use strict";

    var renderers = {
        resource: new ResourceRenderer(),
        digital_object: new DigitalObjectRenderer(),
        classification: new ClassificationRenderer(),
    };

    function Tree(datasource_url, tree_container, form_container, toolbar_container, root_uri, read_only, root_record_type) {
        var self = this;

        self.datasource = new TreeDataSource(datasource_url);

        var tree_renderer = renderers[root_record_type];

        self.toolbar_renderer = new TreeToolbarRenderer(self, toolbar_container);

        self.root_record_type = root_record_type;

        self.large_tree = new LargeTree(self.datasource, 
                                        tree_container,
                                        root_uri,
                                        read_only,
                                        tree_renderer, 
                                        function() {
                                            self.ajax_tree = new AjaxTree(self, form_container);
                                            self.resizer = new TreeResizer(self, tree_container);
                                        },
                                        function(node, tree) {
                                            self.toolbar_renderer.render(node);
                                        });


        if (!read_only) {
            self.dragdrop = self.large_tree.addPlugin(new LargeTreeDragDrop(self.large_tree));
        }

        self.large_tree.setGeneralErrorHandler(function (failure_type) {
            if (failure_type === 'fetch_node_failed') {
                /* This can happen when the user was logged out behind the scenes. */
                $('#tree-unexpected-failure').slideDown();
            }
        });
    };


    Tree.prototype.current = function() {
        return $('.current', this.large_tree.elt);
    };


    exports.Tree = Tree;
}(window));
