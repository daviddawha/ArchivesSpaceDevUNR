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
$(function() {

  // this gets the location information from the solr backend.
  // borrowed from the embedded_search js
  var init_locationHoldingsSearch = function() {
    var $this = $(this);
    if ($(this).data("initialised")) return;

    $this.data("initialised", true);
   
    var resultsFormatter = function(json) {
     console.log(json); 
      return ;
    }
   
    $.getJSON($this.data('url'), function(json) {
      var output; 
      itemCount = json["search_data"]["total_hits"];
      if ( itemCount == 1 ) { 
          output = "1 top container."; 
       } else if (itemCount > 0 ) {
        output = itemCount + " top containers.";  
      } else {
        output = "No holdings for this repository.";  
      } 
      $this.html("<span>" + output + "</span>"); 
    });
              
  };

  $(".location-holdings").each(init_locationHoldingsSearch);
  $(document).bind("loadedrecordform.aspace", function(event, $container) {
    $(".location-holdings", $container).each(init_locationHoldingsSearch);
  });

});
