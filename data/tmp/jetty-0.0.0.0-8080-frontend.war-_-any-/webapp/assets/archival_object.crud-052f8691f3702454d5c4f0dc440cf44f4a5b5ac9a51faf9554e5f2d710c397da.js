// toggle slug field when auto-gen is on
var activate_slug_checkbox = function() {
  var textfield = $('div.js-slug_textfield > div > input');
  var checkbox  = $('div.js-slug_auto_checkbox > div > input');

  checkbox.click(function() {
     textfield.val(""); 
     textfield.attr('readonly', function(_, attr){ return !attr;});
  });
};
AS.initSubRecordCollapsible = function($form, func_generateSummary) {

  // only init this feature for top forms
  if ($form.parents(".subrecord-form-fields").length > 0) {
    return;
  }

  var updateSummary = function() {
    $summary.html(func_generateSummary());
  };

  // set up summary
  var $summary = $("<div>").addClass("subrecord-summary-view");
  var $container = $(".subrecord-form-container:first", $form);
  var $wrapper = $form.closest("li");

  // add button to header
  $(".subrecord-form-remove", $wrapper).after(AS.renderTemplate("template_subrecord_collapse_action"));
  $wrapper.on("click", ".collapse-subrecord-toggle", function(event) {
    event.preventDefault();
    event.stopPropagation();

    // replace the existing summary with a new one
    // to reflect any updated values
    if (!$wrapper.hasClass("collapsed")) {
      updateSummary();
      $container.hide();
      $summary.fadeIn();
    } else {
      
      $container.slideDown( "slow", function() {
       $(document).trigger("expandcontainer.aspace", $container) }
      );
      $summary.hide();
    }

    $wrapper.toggleClass("collapsed");
  }).on("click", ".subrecord-summary-view", function(event) {
    $(".collapse-subrecord-toggle", $wrapper).trigger("click");
  });

  if ($form.find(".error:first").length > 0 || $form.data("collapsed") === false) {
    $summary.hide();
  } else {
    $container.hide();
    $wrapper.addClass("collapsed")
  }

  updateSummary();
  $form.append($summary);
};

$(function() {

  var initLangMaterialForm = function($form) {
  };

  $(document).bind("subrecordcreaterequest.aspace", function(event, object_name, add_button_data, index_data, $target_subrecord_list, callback) {
    if (object_name === "lang_material") {
      var formEl;
      if (add_button_data.langmaterialType === "language_note") {
        formEl = $(AS.renderTemplate("template_language_notes", index_data));
      } else {
        formEl = $(AS.renderTemplate("template_language_fields", index_data));
        formEl.data("collapsed", false);
      }

      callback(formEl, $target_subrecord_list);
    }
    return true;
  });

  $(document).bind("subrecordcreated.aspace", function(event, object_name, subform) {
    if (object_name === "lang_material") {
      initLangMaterialForm($(subform));
    }
  });

});



$(function() {
  $.fn.init_archival_object_form = function() {
    $(this).each(function() {
      var $this = $(this);

      if ($this.hasClass("initialised")) {
        return;
      };

      var $levelSelect = $("#archival_object_level_", $this);
      var $otherLevel = $("#archival_object_other_level_", $this);

      var handleLevelChange = function(initialising) {
        if ($levelSelect.val() === "otherlevel") {
          $otherLevel.removeAttr("disabled");
          if (initialising === true) {
            $otherLevel.closest(".form-group").show();
          } else {
            $otherLevel.closest(".form-group").slideDown();
          }
        } else {
          $otherLevel.attr("disabled", "disabled");
          if (initialising === true) {
            $otherLevel.closest(".form-group").hide();
          } else {
            $otherLevel.closest(".form-group").slideUp();
          }
        }
      };

      handleLevelChange(true);
      $levelSelect.change(handleLevelChange);
    });
  };

  $(document).bind("loadedrecordform.aspace", function(event, $container) {
    $("#archival_object_form:not(.initialised)", $container).init_archival_object_form();
  });

  $("#archival_object_form:not(.initialised)").init_archival_object_form();

});
