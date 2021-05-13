$(function() {

  var init_multiselect_listing = function() {
    var $table = $(this);


    $table.on("click", "tbody td:not(.table-record-actions)", function(event) {
      event.stopPropagation();
      event.preventDefault();

      var $row = $(this).closest("tr");
      $(".multiselect-column :input", $row).trigger("click");
    }).on("click", ".multiselect-column :input", function(event) {
      event.stopPropagation();

      var $this = $(this);
      var $row = $this.closest("tr");
      $row.toggleClass("selected");

      setTimeout(function() {
        if ($(".multiselect-column :input:checked", $table).length > 0) {
          $table.trigger("multiselectselected.aspace");
        } else {
          $table.trigger("multiselectempty.aspace");
        }
      });
    });

    $table.on("click", "#select_all", function(event) {
      var $checkbox = $(this);
      if ($checkbox.is(":checked")) {
        $("tbody :checkbox:not(:checked)", self.$table).trigger("click");
      } else {
        $("tbody :checkbox:checked", self.$table).trigger("click");
      }
    });

    $(".multiselect-enabled").each(function() {
      var $multiselectEffectedWidget = $(this);
      if ($table.is($multiselectEffectedWidget.data("multiselect"))) {
        $table.on("multiselectselected.aspace", function() {
          $multiselectEffectedWidget.removeAttr("disabled");
          var selected_records = $.makeArray($(".multiselect-column :input:checked", $table).map(function() {return $(this).val();}));
          $multiselectEffectedWidget.data("form-data", {
            record_uris: selected_records
          });
        }).on("multiselectempty.aspace", function() {
          $multiselectEffectedWidget.attr("disabled", "disabled");
            $multiselectEffectedWidget.data("form-data", {});
        });
      }
    });

    $(".multiselect-column :input:checked", $table).closest("tr").addClass("selected");

  };

  $(".table-search-results[data-multiselect]").each(init_multiselect_listing);
});
get_selection = function() {
  var results = [];

  $(document).find(".multiselect-column :input:checked").each(function(i, checkbox) {
    results.push({
      uri: checkbox.value,
      display_string: $(checkbox).data("display-string"),
      row: $(checkbox).closest("tr")
    });
  });

  return results;
};

function activateBtn(event) {
  var merge_btn = document.getElementsByClassName("merge-button")[0];
  if ($(":input:checked").length > 0) {
    merge_btn.removeAttribute("disabled");
  } else {
    merge_btn.attr("disabled", "disabled");
  };
};

$(document).on("click", "#batchMerge", function() {
  let modal_title = $(this).text() + " " + $("h2").text()
  let dialog_content = AS.renderTemplate("batch_merge_modal_template", {
    selection: get_selection()
  });
  AS.openCustomModal("batchMergeModal", modal_title, dialog_content,
    'full');
});


