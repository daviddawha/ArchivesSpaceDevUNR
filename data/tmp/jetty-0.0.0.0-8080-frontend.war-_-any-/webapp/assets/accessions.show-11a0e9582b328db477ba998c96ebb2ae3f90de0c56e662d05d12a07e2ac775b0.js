$(function () {

  var init = function () {
    $('.transfer-form .btn-cancel').on('click', function () {
      $('.transfer-action').trigger("click");
    });

    // Override the default bootstrap dropdown behaviour here to
    // ensure that this modal stays open even when another modal is
    // opened within it.
    $(".transfer-action").on("click", function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if ($(this).attr('disabled')) {
        return;
      }

      if ($(".transfer-form")[0].style.display === "block") {
        // Hide it
        $(".transfer-form").css("display", "");
      } else {
        // Show it
        $(".transfer-form").css("display", "block");
      }
    });

    // Stop the modal from being hidden by clicks within the form
    $(".transfer-form").on("click", function(event) {
      event.stopPropagation();
    });


    $(".transfer-form .linker-wrapper .dropdown-toggle").on("click", function(event) {
      event.stopPropagation();
      $(this).parent().toggleClass("open");
    });


    $(".transfer-form .transfer-button").on("click", function(event) {
      var formvals = $(".transfer-form").serializeObject();
      if (!formvals["transfer[ref]"]) {
        $(".missing-ref-message", ".transfer-form").show();
        event.preventDefault();
        event.stopImmediatePropagation();
        return false;
      } else {
        $(".missing-ref-message", ".transfer-form").hide();
        $(this).data("form-data", {"ref": formvals["transfer[ref]"]});
      }
    });
  };


  if ($('.transfer-form').length > 0) {
    init();
  } else {
    $(document).bind("loadedrecordform.aspace", init);
  }

});
$(function () {

  var init = function () {
    $('.add-event-form .btn-close').on('click', function (event) {
      event.stopImmediatePropagation();
      event.preventDefault();
      $('.add-event-action').trigger("click");
    });

    // Override the default bootstrap dropdown behaviour here to
    // ensure that this modal stays open even when another modal is
    // opened within it.
    $(".add-event-action").on("click", function(event) {
      event.preventDefault();
      event.stopImmediatePropagation();

      if ($(this).attr('disabled')) {
        return;
      }

      if ($(".add-event-form")[0].style.display === "block") {
        // Hide it
        $(".add-event-form").css("display", "");
      } else {
        // Show it
        $(".add-event-form").css("display", "block");
      }
    });

    // Stop the modal from being hidden by clicks within the form
    $(".add-event-form").on("click", function(event) {
      event.stopPropagation();
    });


    $(".add-event-form .add-event-button").on("click", function(event) {
      event.stopPropagation();
      event.preventDefault();

      var url = AS.quickTemplate(decodeURIComponent($("#add-event-dropdown").data("add-event-url")), {event_type: $("#add_event_event_type").val()});
      location.href = url;
    });
  };


  if ($('.add-event-form').length > 0) {
    init();
  } else {
    $(document).bind("loadedrecordform.aspace", init);
  }

});
$(function () {

  function ExtentCalculatorForm() {}

  ExtentCalculatorForm.prototype.init_form = function() {
    $('.create-extent-btn').on('click', function (event) {
      $('[id$=_extents_] .subrecord-form-heading .btn').click();

      var extent_form = $('[id$=_extents_]').find(".subrecord-form-fields").last();

      extent_form.find("[id$=__portion_]").val($('#extent_portion_').val());
      extent_form.find("[id$=__number_]").val($('#extent_number_').val());
      var extent_form_type_select = extent_form.find("[id$=__extent_type_]");
      if (extent_form_type_select.data("combobox")) {
        extent_form_type_select.data("combobox").$element.val($('#extent_extent_type_').val());
        extent_form_type_select.data("combobox").$target.val($('#extent_extent_type_').val());
      } else {
        extent_form_type_select.val($('#extent_extent_type_').val());
      }
      extent_form.find("[id$=__container_summary_]").val($('#extent_container_summary_').val());
      extent_form.find("[id$=__physical_details_]").val($('#extent_physical_details_').val());
      extent_form.find("[id$=__dimensions_]").val($('#extent_dimensions_').val());

      $modal.modal("hide");
    });
  }

  var init = function () {
    $('.extent-calculator-btn').on('click', function (event) {
      var dialog_content = AS.renderTemplate("extent_calculator_show_calculation_template");

      $modal = AS.openCustomModal("extentCalculationModal", "Extent Calculation", dialog_content, 'large');

      $.ajax({
        url: AS.app_prefix("/extent_calculator"),
        data: {record_uri: $("#extent_calculator_show_calculation_template").attr("record_uri"),
	       referrer: document.location.href},
        type: "get",
        success: function(html) {
          $("#show_calculation_results").html(html);
          var extentCalculatorForm = new ExtentCalculatorForm();
          extentCalculatorForm.init_form();
        },
        error: function(jqXHR, textStatus, errorThrown) {
	  var html = AS.renderTemplate("template_extent_calculator_error_message", {message: jqXHR.responseText})
          $("#show_calculation_results").html(html);
        }
      });
    });

  }

  
  $(document).bind("loadedrecordform.aspace", function(event, $container) {
    init();
  });

});
$(function() {

  var init_embeddedSearch = function() {
    var $this = $(this);
    if ($(this).data("initialised")) return;

    $this.data("initialised", true);

    $this.on("click", "a", function(event) {
      if ($(this).closest(".table-record-actions").length > 0) {
        return;
      }

      event.preventDefault();

      loadSearchResults(event.target.href);
    });

    var loadSearchResults = function(url) {
      $this.load(url, function(html) {
        $this.html(html);
      });
    };

    loadSearchResults($this.data("url"));
  };

  $(".embedded-search").each(init_embeddedSearch);
  $(document).bind("loadedrecordform.aspace", function(event, $container) {
    $(".embedded-search", $container).each(init_embeddedSearch);
  });

});





$(function () {
  $(document).triggerHandler("loadedrecordform.aspace", [$("#form_accession")]);
});
