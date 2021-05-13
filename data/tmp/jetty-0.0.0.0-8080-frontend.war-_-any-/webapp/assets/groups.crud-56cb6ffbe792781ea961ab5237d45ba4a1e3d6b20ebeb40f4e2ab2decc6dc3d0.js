$(function() {

  // Every 10 seconds:
  // Poll to check if the current version is still current
  // and if any users are editing the same record
  //
  // Ensure this value is less than the timeout to
  // remove the status from the update monitor.
  // See EXPIRE_SECONDS in backend/app/model/active_edit.rb
  var INTERVAL_PERIOD = 10000;
  var STATUS_STALE = "stale";
  var STATUS_OTHER_EDITORS = "opened_for_editing";
  var STATUS_REPO_CHANGED = "repository_changed";

  var setupUpdateMonitor = function($form) {

    if ($form.data("update-monitor") === "enabled") {
      return;
    }

    $form.data("update-monitor", "enabled");
    $form.data('update-monitor-paused', false);

    var poll_url = $form.data("update-monitor-url");
    var lock_version = $form.data("update-monitor-lock_version");
    var uri = $form.data("update-monitor-record-uri");
    var already_stale = $form.data("update-monitor-record-is-stale");

    $(document).trigger("clearupdatemonitorintervals.aspace");

    var insertErrorAndHighlightSidebar = function(status_data) {
      // insert the error
      $(".record-pane .update-monitor-error", $form).remove(); // remove any existing errors
      if (already_stale || status_data.status === STATUS_STALE) {
        var message = AS.renderTemplate(already_stale ?
                                        "update_monitor_save_failed_with_stale_record_template" :
                                        "update_monitor_stale_record_message_template");
        $("#form_messages", $form).prepend(message);
        $(".record-pane .form-actions", $form).prepend(message);
        $(".btn-primary, .btn-toolbar .btn", $form).attr("disabled", "disabled").addClass("disabled");
        clearInterval($(document).data("UPDATE_MONITOR_POLLING_INTERVAL"));
      } else if (status_data.status === STATUS_OTHER_EDITORS) {
        var user_ids = [];
        $.each(status_data.edited_by, function(user_id, timestamp) {
          user_ids.push(user_id);
        });
        var message = AS.renderTemplate("update_monitor_other_editors_message_template", {user_ids: user_ids.join(", ")});
        $("#form_messages", $form).prepend(message);
        $(".record-pane .form-actions", $form).prepend(message);
      } else if (status_data.status === STATUS_REPO_CHANGED) {
        var message = AS.renderTemplate("update_monitor_repository_changed_message_template");
        $("#form_messages", $form).prepend(message);
        $(".record-pane .form-actions", $form).prepend(message);
      }        

      // highlight in the sidebar
      if ($(".as-nav-list li.alert-error").length === 0) {
        $(".as-nav-list").prepend(AS.renderTemplate("as_nav_list_errors_item_template"));
      }
      var $errorNavListItem = $(".as-nav-list li.alert-error");

      if (!$errorNavListItem.hasClass("acknowledged") && $(document).data("UPDATE_MONITOR_HIGHLIGHT_INTERVAL") == null) {
        $(document).data("UPDATE_MONITOR_HIGHLIGHT_INTERVAL", setInterval(function() {
          $errorNavListItem.toggleClass("active");
        }, 3000));
        $errorNavListItem.hover(function() {
          clearInterval($(document).data("UPDATE_MONITOR_HIGHLIGHT_INTERVAL"));
          $errorNavListItem.removeClass("active").addClass("acknowledged");
        }, function() {});
      }
    };

    var clearAnyMonitorErrors = function() {
      $(".update-monitor-error", $form).remove();
    };

    var poll = function() {
      if (already_stale) {
        insertErrorAndHighlightSidebar();
        return;
      }

      if ( $form.data('update-monitor-paused') == true ) {
        return; 
      } 
      
      $.post(
        poll_url,
        {
          lock_version: lock_version,
          uri: uri
        },
        function(json, textStatus, jqXHR) {
          if (json.status === STATUS_STALE || json.status === STATUS_OTHER_EDITORS || json.status === STATUS_REPO_CHANGED) {
            insertErrorAndHighlightSidebar(json)
          } else {
            // nobody else editing and lock_version still current
            clearAnyMonitorErrors()
          }
        },
        "json").fail(function(jqXHR, textStatus, errorThrown) {
          if (jqXHR.status === 500 || jqXHR.status === 403 ) {
            window.location.replace(FRONTEND_URL);
          }
        });
    };

    poll();
    $(document).data("UPDATE_MONITOR_POLLING_INTERVAL", setInterval(poll, INTERVAL_PERIOD));
  };


  $(document).bind("setupupdatemonitor.aspace", function(event, $form) {
    setupUpdateMonitor($form);
  });

  $(document).bind("clearupdatemonitorintervals.aspace", function(event) {
    clearInterval($(document).data("UPDATE_MONITOR_HIGHLIGHT_INTERVAL"));
    clearInterval($(document).data("UPDATE_MONITOR_POLLING_INTERVAL"));
  });
});
AS.LoginHelper = {
  init: function(el) {
    $(el).each(function() {
      var $form = $(this);

      var handleSuccess = function(json) {
        $(".form-group", $form).removeClass("has-error");
        $(".alert-success", $form).show();

        $form.trigger("loginsuccess.aspace", [json]);
      };

      var handleError = function() {
        $(".form-group", $form).addClass("has-error");
        $(".alert-danger", $form).show();
        $("#login", $form).removeAttr("disabled");

        $form.trigger("loginerror.aspace");
      };

      $form.ajaxForm({
        dataType: "json",
        beforeSubmit: function() {
          $("#login", $form).attr("disabled","disabled");
        },
        success: function(json, status, xhr) {
          if (json.session) {
            handleSuccess(json);
          } else {
            handleError();
          }
        },
        error: function(obj, errorText, errorDesc) {
          handleError();
        }
      });
    });
  }
};



// Add session active check upon form submission
$(function() {
  var initSessionCheck = function() {
    $(this).each(function() {
      var $form = $(this);

      var checkForSession = function(event) {
        $.ajax({
          url: AS.app_prefix("has_session"),
          async: false,
          data_type: "json",
          success: function(json) {
            if (json.has_session) {
              return true;
            } else {
              event.preventDefault();
              event.stopImmediatePropagation();

              $(":input[type='submit']", $form).removeAttr("disabled");

              // we might have gotten logged out while trying to save some data in a modal,
              // e.g., a linker
              var $existingModal = $('.modal.initialised');

              if($existingModal.length) {
                $existingModal.hide();
              };

              var $modal = AS.openAjaxModal(AS.app_prefix("login"));
              $modal.removeClass("inline-login-modal");
              var $loginForm = $("form", $modal);
              AS.LoginHelper.init($loginForm);
              $loginForm.on("loginsuccess.aspace", function(event, data) {
                // update all CSRF input fields on the page
                $(":input[name=authenticity_token]").val(data.csrf_token);

                // unbind the session check and resubmit the form
                if($existingModal.length === 0) {
                  $form.unbind("submit", checkForSession);
                  $form.submit();
                } else {
                  $modal.hide();
                  $modal.remove();
                  $existingModal.show();
                }

                // remove the modal, the job is done.
                $modal.on("hidden", function() {
                  $modal.remove();
                });
                setTimeout(function() {
                  $modal.modal("hide");
                }, 1000);

                return false;
              });

              return false;
            }
          },
          error: function() {
            $(":input[type='submit']", $form).removeAttr("disabled");
            return true;
          }
        });
      };

      $form.on("submit", checkForSession);
    });
  };

  $(document).bind("loadedrecordform.aspace", function(event, $container) {
    $.proxy(initSessionCheck, $container.find("form.aspace-record-form:not(.public-form)").andSelf().filter("form.aspace-record-form:not(.public-form)"))();
  });

  $.proxy(initSessionCheck, $("form.aspace-record-form:not(.public-form)"))();
});


// add form change detection
$(function() {

  var lockForm = function() {
    $(this).each(function() {
      $(".form-overlay", $(this) ).height('100%').fadeIn();
      $(this).addClass('locked');
    });
  }

  var showUnlockForm = function() {
    $(this).each(function() {

      var $unlock = $(AS.renderTemplate("form_overlay_unlock_template"));
      $unlock.on("click", function(event) {
        event.preventDefault();
        event.stopImmediatePropagation();
        $(window).trigger('hashchange');
      });
      $("#archives_form_overlay", $(this) ).append($unlock);
      $(".alert", $unlock).fadeIn();
    });
  }

  var ignoredKeycodes = [37,39,9];

  var initFormChangeDetection = function() {
    $(this).each(function() {
      var $this = $(this);

      if ($this.data("changedDetectionEnabled")) {
        return;
      }

      $this.data("form_changed", $this.data("form_changed") || false);
      $this.data("changedDetectionEnabled", true);

      // this is the overlay we can use to lock the form.
      $("> .form-context > .row > .col-md-9", $this).prepend('<div id="archives_form_overlay"><div class="modal-backdrop in form-overlay"></div></div>');
      $("> .form-context > .row > .col-md-3 .form-actions", $this).prepend('<div id="archives_form_actions_overlay" class="modal-backdrop in form-overlay"></div>');


      var onFormElementChange = function(event) {
        if ($(event.target).parents("*[data-no-change-tracking='true']").length === 0) {
          $this.trigger("formchanged.aspace");
          $this.trigger("readonlytree.aspace");
        }
      };
      $this.on("change keyup", ":input", function(event) {
        if ($(this).data("original_value") && ($(this).data("original_value") !== $(this).val())) {
          onFormElementChange(event);
        } else if ($.inArray(event.keyCode, ignoredKeycodes) === -1) {
          onFormElementChange(event);
        }
      });

      var submitParentForm = function(e) {
        e.preventDefault();
        var input = $("<input>").attr("type", "hidden").attr("name", "ignorewarnings").val("true");
        $("form.aspace-record-form").append($(input));
        $("form.aspace-record-form").submit();
        return false;
      };

      $this.on("click", ":radio, :checkbox", onFormElementChange);

      $this.on("formchanged.aspace", function(event) {
        if ($this.data("form_changed") === true) {
          event.stopPropagation();
        } else {
          $(document).bind('keydown', 'ctrl+s', submitParentForm);
          $(":input", event.target).bind('keydown', 'ctrl+s', submitParentForm);
        }
        $this.data("form_changed", true);
        $(".record-toolbar", $this).addClass("formchanged");
        $(".record-toolbar .btn-toolbar .btn", $this).addClass("disabled").attr("disabled","disabled");
      });

      $(".createPlusOneBtn", $this).on("click", function() {
        $this.data("createPlusOne", "true");
      });

      $this.bind("submit", function(event) {
        $this.data("form_changed", false);
        $this.data("update-monitor-paused", true);
        $this.off("change keyup formchanged.aspace");
        $(document).unbind("keydown", submitParentForm);
        $(":input[type='submit'], :input.btn-primary", $this).attr("disabled","disabled");
        if ($(this).data("createPlusOne")) {
          var $input = $("<input>").attr("type", "hidden").attr("name", "plus_one").val("true");
          $($this).append($input);
        }

        return true;
      });

      $(".record-toolbar .revert-changes .btn", $this).click(function() {
        $this.data("form_changed", false);
        return true;
      });

      $(".form-actions .btn-cancel", $this).click(function() {
        $this.data("form_changed", false);
        return true;
      });


      $(window).bind("beforeunload", function(event) {
        if ($this.data("form_changed") === true) {
          return 'Please note you have some unsaved changes.';
        }
      });

      if ($this.data("update-monitor")) {
        $(document).trigger("setupupdatemonitor.aspace", [$this]);
      } else if ($this.closest(".modal").length === 0) {
        // if form isn't opened via a modal, then clear the timeouts
        // and they will be reinitialised for that form (e.g. tree forms)
        $(document).trigger("clearupdatemonitorintervals.aspace", [$this]);
      }

    });
  };

  $(document).bind("loadedrecordform.aspace", function(event, $container) {
    $.proxy(initFormChangeDetection, $("form.aspace-record-form", $container))();
  });

  // we need to lock the form because somethingis happening
  $(document).bind("lockform.aspace", function(event, $container) {
    $.proxy(lockForm, [$container] )();
  });
  // and now the thing is done, so we can now allow the user to unlock it.
  $(document).bind("unlockform.aspace", function(event, $container) {
    $.proxy(showUnlockForm, [$container] )();
  });

  $.proxy(initFormChangeDetection, $("form.aspace-record-form"))();

});

$(function() {
  "use strict";

  var usernameAlreadyAdded = function(username) {
    var userFound = false;

    $("option.group-member").each(function(idx, option) {
      if ($(option).val().toLowerCase() === username.toLowerCase()) {
        userFound = true;
        return false;
      }
    });

    return userFound;
  };


  var addNewMember = function(e) {
    // Only interested in events on the input box if they've hit enter.
    // If the typeahead is visible, then select that item rather than
    // add what is typed.  User can 'esc' to close the typeahead, and then
    // hit return/tab to the button to add the custom userid.
    if ($(e.target).attr("id") == "new-member") {
      if (((e.keyCode || e.which) != 13) || $(".typeahead.dropdown-menu:visible", ".member-toolbar").length > 0) {
        return;
      }
    }

    e.stopPropagation();
    e.preventDefault();
    var input = $("#new-member");
    var username = input.val();

    if (!username || usernameAlreadyAdded(username)) {
      return;
    }

    var option = $("<option class=\"group-member\" />").attr("value", username).text(username);

    $("#group_member_usernames_").append(option);
    input.val('');
  };


  var removeSelectedMembers = function(e) {
    e.preventDefault();

    $(':selected', "#group_member_usernames_").remove();
    $("#remove-member").attr("disabled","disabled");
  };



  $("form#new_group").submit(function (e) {
    var form = $(e.target);

    $("#hidden_member_fields", form).remove();

    var fields = $('<div style="display: none" id="hidden_member_fields" />');

    $("#group_member_usernames_ option").each(function(idx, option) {
      var input = $('<input type="hidden" name="group[member_usernames][]" />');
      input.val($(option).val());

      fields.append(input);
    });

    form.append(fields);

    return true;
  });


  $("#add-new-member").click(addNewMember);
  $("#new-member").keydown(addNewMember);

  $("#remove-member").click(removeSelectedMembers);

  $("#group_member_usernames_").change(function (e) {
    if ($(':selected', e.target).length > 0) {
      $("#remove-member").removeAttr("disabled");
    } else {
      $("#remove-member").attr("disabled","disabled");
    }
  });


  // Don't fire a request for *every* keystroke.  Wait until they stop
  // typing for a moment.
  var username_typeahead = AS.delayedTypeAhead(function (query, callback) {
    $.ajax({
          url: AS.app_prefix("users/complete"),
          data: {query: query},
          type: "GET",
          success: function(usernames) {
            callback(usernames);
          },
          error: function() {
            callback([]);
          }
        });
  });

  $("#new-member").typeahead({
          source: username_typeahead.handle
        });

});
