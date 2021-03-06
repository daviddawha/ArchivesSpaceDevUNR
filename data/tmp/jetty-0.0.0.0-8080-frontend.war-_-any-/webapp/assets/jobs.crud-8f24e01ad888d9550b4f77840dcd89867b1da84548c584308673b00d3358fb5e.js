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

var init = function() {

    var $form = $('#job_form');

    var initReportJobForm = function() {

        var locationReportSubFormChange = function() {
            var selected_report_type = $("#job_job_params_location_report_type_").val();

            var location_start_linker = $('#report_location_start');
            var location_end_linker = $('#report_location_end');

            if (selected_report_type === 'single_location') {
                location_end_linker.hide();
                location_start_linker.find('label').text(location_start_linker.data('singular-label'));
            } else if (selected_report_type === 'location_range') {
                location_start_linker.find('label').text(location_start_linker.data('range-label'));
                location_end_linker.find('label').text(location_end_linker.data('range-label'));
                location_end_linker.show();
            }

            $('.report_type').hide();
            $('.report_type.' + selected_report_type).show();
        };

        $(document).on('change', '#job_job_params_location_report_type_', locationReportSubFormChange);

        var formatChange = function() {

            if ($("#job_format_").val() == 'csv') {
                $('.csv_options').show();
            } else {
                $('.csv_options').hide();
            }
        };

        formatChange();
        $(document).on('change', "#job_format_", formatChange);

        var initListing = function(report) {
            $("#report-fields").html(AS.renderTemplate(
                "template_" + report,
                {id_path: "job_job_params", path: "job[job_params]"}));
            if (report == "location_holdings_report") {
                locationReportSubFormChange();
            }
            $(document).triggerHandler("subrecordcreated.aspace", [report, $("#report-fields")]);
        }

        $(".unselect-report").hide();
        $("#format").hide();
        $('.btn-primary:submit').addClass('disabled');

        $(".select-report, .report-title").click(function() {
            var code = $(this).attr("for");
            $("#job_report_type_").val(code);
            initListing(code);
            $(".select-report").hide();
            $(".unselect-report").show();
            $(".report-listing:not(#" + code + ")").hide();
            $("#format").show();
            $('.btn-primary:submit').removeClass('disabled');
            $('.report-title').addClass('disabled');
            $('.report-title').blur();
            $("#archivesSpaceSidebar li").toggle();
        });

        $(".unselect-report").click(function() {
            $("#job_report_type_").val(null);
            $("#report-fields").empty();
            $(".select-report").show();
            $(".unselect-report").hide();
            $(".report-listing").show();
            $("#format").hide();
            $('.btn-primary:submit').addClass('disabled');
            $('.report-title').removeClass('disabled');
            $("#archivesSpaceSidebar li").toggle();
        });

    };

    var initSourceJobForm = function() {
        $("#job_ref_").attr("name", "job[source]").attr("id", "job_source_");
    };

    var initFindAndReplaceJobForm = function() {
        $("#job_form_messages", $form)
            .html(AS.renderTemplate("template_find_and_replace_warning"));

        // init findAndReplaceForm
        var $selectRecordType = $("#job_record_type_");
        var $selectProperty = $("#job_property_");

        $selectRecordType.attr('disabled', 'disabled');
        $selectProperty.attr('disabled', 'disabled');

        $("#job_ref_").attr("name", "job[base_record_uri]");

        $("#job_ref_").change(function() {
            var resourceUri = $(this).val();
            if (resourceUri.length) {
                var id = /\d+$/.exec(resourceUri)[0]
                $.ajax({
                    url: AS.app_prefix("/resources/" + id + "/models_in_graph"),
                    success: function(typeList) {
                        var oldVal = $selectRecordType.val();
                        $selectRecordType.empty();
                        $selectRecordType.append($('<option>', {
                                selected: true,
                                disabled: true
                            })
                            .text(" -- select a record type --"));
                        $.each(typeList, function(index, valAndText) {
                            var opts = {
                                value: valAndText[0]
                            };
                            if (oldVal === valAndText[0])
                                opts.selected = true;

                            $selectRecordType.append($('<option>', opts)
                                .text(valAndText[1]));
                        });
                        $selectRecordType.removeAttr('disabled');
                        if (oldVal != $selectRecordType.val())
                            $selectRecordType.triggerHandler('change');
                    }
                });

            }
        });

        $selectRecordType.change(function() {
            var recordType = $(this).val();
            $.ajax({
                url: AS.app_prefix("/schema/" + recordType + "/properties?type=string&editable=true"),
                success: function(propertyList) {
                    $selectProperty.empty();

                    $.each(propertyList, function(index, valAndText) {
                        $selectProperty
                            .append($('<option>', {
                                    value: valAndText[0]
                                })
                                .text(valAndText[1]));
                    });

                    $selectProperty.removeAttr('disabled');
                }
            });
        });
    };

    var initImportJobForm = function() {

        var supportsHTML5MultipleFileInput = function() {
            var input = document.createElement("input");
            input.setAttribute("multiple", "true");
            return input.multiple === true;
        };

        var initFileUploadSection = function() {
            var $dropContainer = $("#files");

            var handleFileInputChange = function() {
                $(".hint", $dropContainer).remove();

                var $input = $(this);

                // if browser supports multiple files, then iterate through each
                // and add them to the list
                if (supportsHTML5MultipleFileInput()) {
                    $(this.files).each(function(idx, file) {
                        var filename = file.name.split("\\").reverse()[0]
                        var $file_html = $(AS.renderTemplate("template_import_file", {
                            filename: filename
                        }));

                        $file_html.data("file", file);
                        $file_html.addClass("file-attached");

                        $input.val("");

                        $dropContainer.append($file_html);
                    });

                    // Otherwise, there's only one file, so create an cloned input for it
                    // This is for older browsers (like IE8) that don't support the new
                    // HTML5 input#file mulitple feature
                } else {
                    var filename = $input.val().split("\\").reverse()[0]
                    var $file_html = $(AS.renderTemplate("template_import_file", {
                        filename: filename
                    }));

                    $file_html.append($input);
                    var $clone = $input.clone();
                    $clone.on("change", handleFileInputChange);
                    $(".fileinput-button", $form).append($clone);

                    $dropContainer.append($file_html);
                }
            };

            $(":file", $form).on("change", handleFileInputChange);

            $dropContainer.on("click", ".btn-remove-file", function() {
                $(this).closest(".import-file").remove();
            });

            $dropContainer.on('dragenter', function(e) {
                e.stopPropagation();
                e.preventDefault();
                $(this).addClass("active");
            }).on('dragover', function(e) {
                e.stopPropagation();
                e.preventDefault();
            }).on('dragleave', function(e) {
                e.stopPropagation();
                e.preventDefault();

                $(this).removeClass("active");
            }).on('drop', function(event) {
                $(this).removeClass("incoming").removeClass("active");

                $.each(event.originalEvent.dataTransfer.files, function(i, file) {
                    var $file_html = $(AS.renderTemplate("template_import_file", {
                        filename: file.name
                    }));
                    $file_html.data("file", file);
                    $file_html.addClass("file-attached");

                    $dropContainer.append($file_html);
                });
            });

            // Only allow drop into the #files container
            $(document).on('dragenter', function(e) {
                e.stopPropagation();
                e.preventDefault();

                $dropContainer.addClass("incoming");

            }).on('dragover', function(e) {
                e.stopPropagation();
                e.preventDefault();

                $dropContainer.addClass("incoming");
            }).on('dragleave', function(e) {
                e.stopPropagation();
                e.preventDefault();

                $dropContainer.removeClass("incoming");
            }).on('drop', function(e) {
                e.stopPropagation();
                e.preventDefault();

                $dropContainer.removeClass("incoming").removeClass("active");
            });
        };

        var onChange = function() {
            $("#job_filenames_", $form)
                .empty()
                .append(AS.renderTemplate("template_fileupload"))
                .slideDown();


            initFileUploadSection();
        }

        $("#job_import_type_", $form).change(onChange);

        onChange();

        var handleError = function(errorHTML) {
            $("body").html(errorHTML);
            $(init);
        };

        $form.submit(function() {


            $(".import-file.file-attached").each(function() {
                var dt = new DataTransfer();
                dt.items.add($(this).data("file"));

                const input = document.createElement("input");
                input.type = "file";
                input.name = "files[]";
                input.style.display = "none";
                input.files = dt.files;
                $form.append(input);
            });


            return true;
        });

        ua = navigator.userAgent;
        if (ua.indexOf("MSIE") > -1 || ua.indexOf("Trident") > -1 || ua.indexOf("Edge") > -1 || (ua.indexOf('Safari') != -1 && ua.indexOf('Chrome') == -1)) {
          if (ua.indexOf('Safari') != -1 && ua.indexOf('Chrome') == -1) {
             console.log("Using Safari");
             $form[0].setAttribute("onsubmit", "return false");
          } else {
             console.log("Using IE");
          }
            $(".btn:submit").click(function(event) {
                $form.ajaxSubmit({
                    type: "POST",
                    beforeSubmit: function(arr, $form, options) {

                        if (arr.length == 0) {
                            return false;
                        }

                        $("#job_form_messages", $form)
                            .html(AS.renderTemplate("template_uploading_message"));

                        console.log("ATTACH");
                        $(".import-file.file-attached").each(function() {
                            var $input = $(this);
                            console.log($input);
                            arr.push({
                                name: "files[]",
                                type: "file",
                                value: $input.data("file")
                            });
                        });

                        arr.push({name: "ajax", value: true});
                    },
                    success: function(json, status, xhr) {
                        var uri_to_resolve;

                        if (typeof json === "string") {
                          // In IE8 (older browsers), AjaxForm will use an iframe to deliver this POST.
                          // When using an iframe it cannot handle JSON as a response type... so let us
                          // grab the HTML string returned and parse it.
                          var $responseFromIFrame = $(json);

                          if ($responseFromIFrame.is("textarea")) {
                            if ($responseFromIFrame.data("type") === "html") {
                              // it must of errored
                              return handleError($responseFromIFrame.val());
                            } else if ($responseFromIFrame.data("type") === "json") {
                                uri_to_resolve = JSON.parse($responseFromIFrame.val()).uri;
                            } else {
                              throw "jobs.crud: textarea.data-type not currently support - " + $responseFromIFrame.data("type");
                            }
                          } else {
                            throw "jobs.crud: the response text should be wrapped in a textarea for the plugin AjaxForm support";
                          }
                        } else {
                          uri_to_resolve = json.uri;
                        }

                        $("#job_form_messages", $form)
                            .html(AS.renderTemplate("template_success_message"));

                        location.href = AS.app_prefix("resolve/readonly?uri=" + uri_to_resolve);
                        console.log("SUCCESS!");
                    },
                    error: function(xhr) {
                        console.log("ERROR!");
                        handleError(xhr.responseText);
                    }
                });

            });
        }

    };

    var type = $("#job_type").val();

    $(".linker:not(.initialised)").linker();

    // these were added because it was neccesary to get translation
    $(".translation-placeholder").remove();

    if (type == "report_job") {
        initReportJobForm();
    } else if (type == "container_labels_job") {
        initSourceJobForm();
    } else if (type == "print_to_pdf_job") {
        initSourceJobForm();
    } else if (type == "find_and_replace_job") {
        initFindAndReplaceJobForm();
    } else if (type == "import_job") {
        initImportJobForm();
    }
};

$(init);
