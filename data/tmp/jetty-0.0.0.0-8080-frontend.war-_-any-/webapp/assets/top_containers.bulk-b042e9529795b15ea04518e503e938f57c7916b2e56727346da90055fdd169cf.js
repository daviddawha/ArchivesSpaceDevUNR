
(function($){$.extend({tablesorter:new
function(){var parsers=[],widgets=[];this.defaults={cssHeader:"header",cssAsc:"headerSortUp",cssDesc:"headerSortDown",cssChildRow:"expand-child",sortInitialOrder:"asc",sortMultiSortKey:"shiftKey",sortForce:null,sortAppend:null,sortLocaleCompare:true,textExtraction:"simple",parsers:{},widgets:[],widgetZebra:{css:["even","odd"]},headers:{},widthFixed:false,cancelSelection:true,sortList:[],headerList:[],dateFormat:"us",decimal:'/\.|\,/g',onRenderHeader:null,selectorHeaders:'thead th',debug:false};function benchmark(s,d){log(s+","+(new Date().getTime()-d.getTime())+"ms");}this.benchmark=benchmark;function log(s){if(typeof console!="undefined"&&typeof console.debug!="undefined"){console.log(s);}else{alert(s);}}function buildParserCache(table,$headers){if(table.config.debug){var parsersDebug="";}if(table.tBodies.length==0)return;var rows=table.tBodies[0].rows;if(rows[0]){var list=[],cells=rows[0].cells,l=cells.length;for(var i=0;i<l;i++){var p=false;if($.metadata&&($($headers[i]).metadata()&&$($headers[i]).metadata().sorter)){p=getParserById($($headers[i]).metadata().sorter);}else if((table.config.headers[i]&&table.config.headers[i].sorter)){p=getParserById(table.config.headers[i].sorter);}if(!p){p=detectParserForColumn(table,rows,-1,i);}if(table.config.debug){parsersDebug+="column:"+i+" parser:"+p.id+"\n";}list.push(p);}}if(table.config.debug){log(parsersDebug);}return list;};function detectParserForColumn(table,rows,rowIndex,cellIndex){var l=parsers.length,node=false,nodeValue=false,keepLooking=true;while(nodeValue==''&&keepLooking){rowIndex++;if(rows[rowIndex]){node=getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex);nodeValue=trimAndGetNodeText(table.config,node);if(table.config.debug){log('Checking if value was empty on row:'+rowIndex);}}else{keepLooking=false;}}for(var i=1;i<l;i++){if(parsers[i].is(nodeValue,table,node)){return parsers[i];}}return parsers[0];}function getNodeFromRowAndCellIndex(rows,rowIndex,cellIndex){return rows[rowIndex].cells[cellIndex];}function trimAndGetNodeText(config,node){return $.trim(getElementText(config,node));}function getParserById(name){var l=parsers.length;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==name.toLowerCase()){return parsers[i];}}return false;}function buildCache(table){if(table.config.debug){var cacheTime=new Date();}var totalRows=(table.tBodies[0]&&table.tBodies[0].rows.length)||0,totalCells=(table.tBodies[0].rows[0]&&table.tBodies[0].rows[0].cells.length)||0,parsers=table.config.parsers,cache={row:[],normalized:[]};for(var i=0;i<totalRows;++i){var c=$(table.tBodies[0].rows[i]),cols=[];if(c.hasClass(table.config.cssChildRow)){cache.row[cache.row.length-1]=cache.row[cache.row.length-1].add(c);continue;}cache.row.push(c);for(var j=0;j<totalCells;++j){cols.push(parsers[j].format(getElementText(table.config,c[0].cells[j]),table,c[0].cells[j]));}cols.push(cache.normalized.length);cache.normalized.push(cols);cols=null;};if(table.config.debug){benchmark("Building cache for "+totalRows+" rows:",cacheTime);}return cache;};function getElementText(config,node){var text="";if(!node)return"";if(!config.supportsTextContent)config.supportsTextContent=node.textContent||false;if(config.textExtraction=="simple"){if(config.supportsTextContent){text=node.textContent;}else{if(node.childNodes[0]&&node.childNodes[0].hasChildNodes()){text=node.childNodes[0].innerHTML;}else{text=node.innerHTML;}}}else{if(typeof(config.textExtraction)=="function"){text=config.textExtraction(node);}else{text=$(node).text();}}return text;}function appendToTable(table,cache){if(table.config.debug){var appendTime=new Date()}var c=cache,r=c.row,n=c.normalized,totalRows=n.length,checkCell=(n[0].length-1),tableBody=$(table.tBodies[0]),rows=[];for(var i=0;i<totalRows;i++){var pos=n[i][checkCell];rows.push(r[pos]);if(!table.config.appender){var l=r[pos].length;for(var j=0;j<l;j++){tableBody[0].appendChild(r[pos][j]);}}}if(table.config.appender){table.config.appender(table,rows);}rows=null;if(table.config.debug){benchmark("Rebuilt table:",appendTime);}applyWidget(table);setTimeout(function(){$(table).trigger("sortEnd");},0);};function buildHeaders(table){if(table.config.debug){var time=new Date();}var meta=($.metadata)?true:false;var header_index=computeTableHeaderCellIndexes(table);$tableHeaders=$(table.config.selectorHeaders,table).each(function(index){this.column=header_index[this.parentNode.rowIndex+"-"+this.cellIndex];this.order=formatSortingOrder(table.config.sortInitialOrder);this.count=this.order;if(checkHeaderMetadata(this)||checkHeaderOptions(table,index))this.sortDisabled=true;if(checkHeaderOptionsSortingLocked(table,index))this.order=this.lockedOrder=checkHeaderOptionsSortingLocked(table,index);if(!this.sortDisabled){var $th=$(this).addClass(table.config.cssHeader);if(table.config.onRenderHeader)table.config.onRenderHeader.apply($th);}table.config.headerList[index]=this;});if(table.config.debug){benchmark("Built headers:",time);log($tableHeaders);}return $tableHeaders;};function computeTableHeaderCellIndexes(t){var matrix=[];var lookup={};var thead=t.getElementsByTagName('THEAD')[0];var trs=thead.getElementsByTagName('TR');for(var i=0;i<trs.length;i++){var cells=trs[i].cells;for(var j=0;j<cells.length;j++){var c=cells[j];var rowIndex=c.parentNode.rowIndex;var cellId=rowIndex+"-"+c.cellIndex;var rowSpan=c.rowSpan||1;var colSpan=c.colSpan||1
var firstAvailCol;if(typeof(matrix[rowIndex])=="undefined"){matrix[rowIndex]=[];}for(var k=0;k<matrix[rowIndex].length+1;k++){if(typeof(matrix[rowIndex][k])=="undefined"){firstAvailCol=k;break;}}lookup[cellId]=firstAvailCol;for(var k=rowIndex;k<rowIndex+rowSpan;k++){if(typeof(matrix[k])=="undefined"){matrix[k]=[];}var matrixrow=matrix[k];for(var l=firstAvailCol;l<firstAvailCol+colSpan;l++){matrixrow[l]="x";}}}}return lookup;}function checkCellColSpan(table,rows,row){var arr=[],r=table.tHead.rows,c=r[row].cells;for(var i=0;i<c.length;i++){var cell=c[i];if(cell.colSpan>1){arr=arr.concat(checkCellColSpan(table,headerArr,row++));}else{if(table.tHead.length==1||(cell.rowSpan>1||!r[row+1])){arr.push(cell);}}}return arr;};function checkHeaderMetadata(cell){if(($.metadata)&&($(cell).metadata().sorter===false)){return true;};return false;}function checkHeaderOptions(table,i){if((table.config.headers[i])&&(table.config.headers[i].sorter===false)){return true;};return false;}function checkHeaderOptionsSortingLocked(table,i){if((table.config.headers[i])&&(table.config.headers[i].lockedOrder))return table.config.headers[i].lockedOrder;return false;}function applyWidget(table){var c=table.config.widgets;var l=c.length;for(var i=0;i<l;i++){getWidgetById(c[i]).format(table);}}function getWidgetById(name){var l=widgets.length;for(var i=0;i<l;i++){if(widgets[i].id.toLowerCase()==name.toLowerCase()){return widgets[i];}}};function formatSortingOrder(v){if(typeof(v)!="Number"){return(v.toLowerCase()=="desc")?1:0;}else{return(v==1)?1:0;}}function isValueInArray(v,a){var l=a.length;for(var i=0;i<l;i++){if(a[i][0]==v){return true;}}return false;}function setHeadersCss(table,$headers,list,css){$headers.removeClass(css[0]).removeClass(css[1]);var h=[];$headers.each(function(offset){if(!this.sortDisabled){h[this.column]=$(this);}});var l=list.length;for(var i=0;i<l;i++){h[list[i][0]].addClass(css[list[i][1]]);}}function fixColumnWidth(table,$headers){var c=table.config;if(c.widthFixed){var colgroup=$('<colgroup>');$("tr:first td",table.tBodies[0]).each(function(){colgroup.append($('<col>').css('width',$(this).width()));});$(table).prepend(colgroup);};}function updateHeaderSortCount(table,sortList){var c=table.config,l=sortList.length;for(var i=0;i<l;i++){var s=sortList[i],o=c.headerList[s[0]];o.count=s[1];o.count++;}}function multisort(table,sortList,cache){if(table.config.debug){var sortTime=new Date();}var dynamicExp="var sortWrapper = function(a,b) {",l=sortList.length;for(var i=0;i<l;i++){var c=sortList[i][0];var order=sortList[i][1];var s=(table.config.parsers[c].type=="text")?((order==0)?makeSortFunction("text","asc",c):makeSortFunction("text","desc",c)):((order==0)?makeSortFunction("numeric","asc",c):makeSortFunction("numeric","desc",c));var e="e"+i;dynamicExp+="var "+e+" = "+s;dynamicExp+="if("+e+") { return "+e+"; } ";dynamicExp+="else { ";}var orgOrderCol=cache.normalized[0].length-1;dynamicExp+="return a["+orgOrderCol+"]-b["+orgOrderCol+"];";for(var i=0;i<l;i++){dynamicExp+="}; ";}dynamicExp+="return 0; ";dynamicExp+="}; ";if(table.config.debug){benchmark("Evaling expression:"+dynamicExp,new Date());}eval(dynamicExp);cache.normalized.sort(sortWrapper);if(table.config.debug){benchmark("Sorting on "+sortList.toString()+" and dir "+order+" time:",sortTime);}return cache;};function makeSortFunction(type,direction,index){var a="a["+index+"]",b="b["+index+"]";if(type=='text'&&direction=='asc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+a+" < "+b+") ? -1 : 1 )));";}else if(type=='text'&&direction=='desc'){return"("+a+" == "+b+" ? 0 : ("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : ("+b+" < "+a+") ? -1 : 1 )));";}else if(type=='numeric'&&direction=='asc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+a+" - "+b+"));";}else if(type=='numeric'&&direction=='desc'){return"("+a+" === null && "+b+" === null) ? 0 :("+a+" === null ? Number.POSITIVE_INFINITY : ("+b+" === null ? Number.NEGATIVE_INFINITY : "+b+" - "+a+"));";}};function makeSortText(i){return"((a["+i+"] < b["+i+"]) ? -1 : ((a["+i+"] > b["+i+"]) ? 1 : 0));";};function makeSortTextDesc(i){return"((b["+i+"] < a["+i+"]) ? -1 : ((b["+i+"] > a["+i+"]) ? 1 : 0));";};function makeSortNumeric(i){return"a["+i+"]-b["+i+"];";};function makeSortNumericDesc(i){return"b["+i+"]-a["+i+"];";};function sortText(a,b){if(table.config.sortLocaleCompare)return a.localeCompare(b);return((a<b)?-1:((a>b)?1:0));};function sortTextDesc(a,b){if(table.config.sortLocaleCompare)return b.localeCompare(a);return((b<a)?-1:((b>a)?1:0));};function sortNumeric(a,b){return a-b;};function sortNumericDesc(a,b){return b-a;};function getCachedSortType(parsers,i){return parsers[i].type;};this.construct=function(settings){return this.each(function(){if(!this.tHead||!this.tBodies)return;var $this,$document,$headers,cache,config,shiftDown=0,sortOrder;this.config={};config=$.extend(this.config,$.tablesorter.defaults,settings);$this=$(this);$.data(this,"tablesorter",config);$headers=buildHeaders(this);this.config.parsers=buildParserCache(this,$headers);cache=buildCache(this);var sortCSS=[config.cssDesc,config.cssAsc];fixColumnWidth(this);$headers.click(function(e){var totalRows=($this[0].tBodies[0]&&$this[0].tBodies[0].rows.length)||0;if(!this.sortDisabled&&totalRows>0){$this.trigger("sortStart");var $cell=$(this);var i=this.column;this.order=this.count++%2;if(this.lockedOrder)this.order=this.lockedOrder;if(!e[config.sortMultiSortKey]){config.sortList=[];if(config.sortForce!=null){var a=config.sortForce;for(var j=0;j<a.length;j++){if(a[j][0]!=i){config.sortList.push(a[j]);}}}config.sortList.push([i,this.order]);}else{if(isValueInArray(i,config.sortList)){for(var j=0;j<config.sortList.length;j++){var s=config.sortList[j],o=config.headerList[s[0]];if(s[0]==i){o.count=s[1];o.count++;s[1]=o.count%2;}}}else{config.sortList.push([i,this.order]);}};setTimeout(function(){setHeadersCss($this[0],$headers,config.sortList,sortCSS);appendToTable($this[0],multisort($this[0],config.sortList,cache));},1);return false;}}).mousedown(function(){if(config.cancelSelection){this.onselectstart=function(){return false};return false;}});$this.bind("update",function(){var me=this;setTimeout(function(){me.config.parsers=buildParserCache(me,$headers);cache=buildCache(me);},1);}).bind("updateCell",function(e,cell){var config=this.config;var pos=[(cell.parentNode.rowIndex-1),cell.cellIndex];cache.normalized[pos[0]][pos[1]]=config.parsers[pos[1]].format(getElementText(config,cell),cell);}).bind("sorton",function(e,list){$(this).trigger("sortStart");config.sortList=list;var sortList=config.sortList;updateHeaderSortCount(this,sortList);setHeadersCss(this,$headers,sortList,sortCSS);appendToTable(this,multisort(this,sortList,cache));}).bind("appendCache",function(){appendToTable(this,cache);}).bind("applyWidgetId",function(e,id){getWidgetById(id).format(this);}).bind("applyWidgets",function(){applyWidget(this);});if($.metadata&&($(this).metadata()&&$(this).metadata().sortlist)){config.sortList=$(this).metadata().sortlist;}if(config.sortList.length>0){$this.trigger("sorton",[config.sortList]);}applyWidget(this);});};this.addParser=function(parser){var l=parsers.length,a=true;for(var i=0;i<l;i++){if(parsers[i].id.toLowerCase()==parser.id.toLowerCase()){a=false;}}if(a){parsers.push(parser);};};this.addWidget=function(widget){widgets.push(widget);};this.formatFloat=function(s){var i=parseFloat(s);return(isNaN(i))?0:i;};this.formatInt=function(s){var i=parseInt(s);return(isNaN(i))?0:i;};this.isDigit=function(s,config){return/^[-+]?\d*$/.test($.trim(s.replace(/[,.']/g,'')));};this.clearTableBody=function(table){if($.browser.msie){function empty(){while(this.firstChild)this.removeChild(this.firstChild);}empty.apply(table.tBodies[0]);}else{table.tBodies[0].innerHTML="";}};}});$.fn.extend({tablesorter:$.tablesorter.construct});var ts=$.tablesorter;ts.addParser({id:"text",is:function(s){return true;},format:function(s){return $.trim(s.toLocaleLowerCase());},type:"text"});ts.addParser({id:"digit",is:function(s,table){var c=table.config;return $.tablesorter.isDigit(s,c);},format:function(s){return $.tablesorter.formatFloat(s);},type:"numeric"});ts.addParser({id:"currency",is:function(s){return/^[£$€?.]/.test(s);},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/[£$€]/g),""));},type:"numeric"});ts.addParser({id:"ipAddress",is:function(s){return/^\d{2,3}[\.]\d{2,3}[\.]\d{2,3}[\.]\d{2,3}$/.test(s);},format:function(s){var a=s.split("."),r="",l=a.length;for(var i=0;i<l;i++){var item=a[i];if(item.length==2){r+="0"+item;}else{r+=item;}}return $.tablesorter.formatFloat(r);},type:"numeric"});ts.addParser({id:"url",is:function(s){return/^(https?|ftp|file):\/\/$/.test(s);},format:function(s){return jQuery.trim(s.replace(new RegExp(/(https?|ftp|file):\/\//),''));},type:"text"});ts.addParser({id:"isoDate",is:function(s){return/^\d{4}[\/-]\d{1,2}[\/-]\d{1,2}$/.test(s);},format:function(s){return $.tablesorter.formatFloat((s!="")?new Date(s.replace(new RegExp(/-/g),"/")).getTime():"0");},type:"numeric"});ts.addParser({id:"percent",is:function(s){return/\%$/.test($.trim(s));},format:function(s){return $.tablesorter.formatFloat(s.replace(new RegExp(/%/g),""));},type:"numeric"});ts.addParser({id:"usLongDate",is:function(s){return s.match(new RegExp(/^[A-Za-z]{3,10}\.? [0-9]{1,2}, ([0-9]{4}|'?[0-9]{2}) (([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(AM|PM)))$/));},format:function(s){return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"shortDate",is:function(s){return/\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/.test(s);},format:function(s,table){var c=table.config;s=s.replace(/\-/g,"/");if(c.dateFormat=="us"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$1/$2");}else if (c.dateFormat == "pt") {s = s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/, "$3/$2/$1");} else if(c.dateFormat=="uk"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/,"$3/$2/$1");}else if(c.dateFormat=="dd/mm/yy"||c.dateFormat=="dd-mm-yy"){s=s.replace(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2})/,"$1/$2/$3");}return $.tablesorter.formatFloat(new Date(s).getTime());},type:"numeric"});ts.addParser({id:"time",is:function(s){return/^(([0-2]?[0-9]:[0-5][0-9])|([0-1]?[0-9]:[0-5][0-9]\s(am|pm)))$/.test(s);},format:function(s){return $.tablesorter.formatFloat(new Date("2000/01/01 "+s).getTime());},type:"numeric"});ts.addParser({id:"metadata",is:function(s){return false;},format:function(s,table,cell){var c=table.config,p=(!c.parserMetadataName)?'sortValue':c.parserMetadataName;return $(cell).metadata()[p];},type:"numeric"});ts.addWidget({id:"zebra",format:function(table){if(table.config.debug){var time=new Date();}var $tr,row=-1,odd;$("tr:visible",table.tBodies[0]).each(function(i){$tr=$(this);if(!$tr.hasClass(table.config.cssChildRow))row++;odd=(row%2==0);$tr.removeClass(table.config.widgetZebra.css[odd?0:1]).addClass(table.config.widgetZebra.css[odd?1:0])});if(table.config.debug){$.tablesorter.benchmark("Applying Zebra widget",time);}}});})(jQuery);


/***************************************************************************
 * BulkContainerSearch - provides all the behaviour to the ajax search
 * and selection of records.
 */

function BulkContainerSearch($search_form, $results_container, $toolbar) {
  this.$search_form = $search_form;
  this.$results_container = $results_container;
  this.$toolbar = $toolbar;

  this.setup_form();
  this.setup_results_list();
}

BulkContainerSearch.prototype.setup_form = function() {
  var self = this;

  $(document).trigger("loadedrecordsubforms.aspace", this.$search_form);

  this.$search_form.on("submit", function(event) {
    event.preventDefault();
    self.perform_search(self.$search_form.serializeArray());
  });
};

BulkContainerSearch.prototype.perform_search = function(data) {
  var self = this;

  self.$results_container.closest(".row").show();
  self.$results_container.html(AS.renderTemplate("template_bulk_operation_loading"));

  $.ajax({
    url: AS.app_prefix("top_containers/bulk_operations/search"),
    data: data,
    type: "post",
    success: function(html) {
      $.rails.enableFormElements(self.$search_form);
      self.$results_container.html(html);
      self.setup_table_sorter();
      self.update_button_state();
    },
    error: function(jqXHR, textStatus, errorThrown) {
      $.rails.enableFormElements(self.$search_form);
      var html = AS.renderTemplate("template_bulk_operation_error_message", {message: jqXHR.responseText})
      self.$results_container.html(html);
      self.update_button_state();
    }
  });
};

BulkContainerSearch.prototype.setup_results_list = function(docs) {
  var self = this;

  self.$results_container.on("click", "#select_all", function(event) {
    var $checkbox = $(this);
    if ($checkbox.is(":checked")) {
      $("tbody :checkbox:not(:checked)", self.$results_container).trigger("click");
    } else {
      $("tbody :checkbox:checked", self.$results_container).trigger("click");
    }
  });

  self.$results_container.on("click", ":checkbox", function(event) {
    event.stopPropagation();

    var $checkbox = $(this);
    var $row = $checkbox.closest("tr");
    $row.toggleClass("selected");
    var $first_row_state = $row[0].className

    if (event.altKey) {
	$row = $row.prev();
	while ($row[0] != null && $row[0].className != $first_row_state) {
	    $row.find(":checkbox").click();
	    $row = $row.prev();
	}
    }

    self.update_button_state();
  });

  self.$results_container.on("click", "td", function(event) {
    $(this).closest("tr").find(":checkbox").trigger("click");
  });
};

BulkContainerSearch.prototype.update_button_state = function() {
  var self = this;
  var checked_boxes = $("tbody :checkbox:checked", self.$results_container);
  var delete_btn = self.$toolbar.find(".btn");

  if (checked_boxes.length > 0) {
    var selected_records = $.makeArray(checked_boxes.map(function() {return $(this).val();}));
    delete_btn.data("form-data", {
      record_uris: selected_records
    });
    delete_btn.removeClass("disabled").removeAttr("disabled");
  } else {
    delete_btn.data("form-data", {});
    delete_btn.addClass("disabled").attr("disabled", "disabled");
  }
};

BulkContainerSearch.prototype.setup_table_sorter = function() {
  function padValue(value) {
    return (new Array(255).join("#") + value).slice(-255)
  };

  var tablesorter_opts = {
    // only sort on the second row of header columns
    selectorHeaders: "thead tr.sortable-columns th",
    // disable sort on the checkbox column
    headers: {
        0: { sorter: false}
    },
    // default sort: Collection, Series, Indicator
    sortList: [[1,0],[2,0],[4,0]],
    // customise text extraction to pull only the first collection/series
    textExtraction: function(node) {
      var $node = $(node);

      if ($node.hasClass("top-container-collection")) {
        return $node.find(".collection-identifier:first").text().trim();
      } else if ($node.hasClass("top-container-series")) {
        var level = $node.find(".series-level:first").text().trim();
        var identifier = $node.find(".series-identifier:first").text().trim();

        if ((level+identifier).length > 0) {
          return level + "-" + identifier;
        } else {
          return "";
        }
      } else if ($node.hasClass("top-container-indicator")) {
        var value = $node.text().trim();
        // check for non-decimal and take the first
        var first_number = value.split(/[^0-9]/)[0];

        // pad the indicator values so they sort correctly with digit and alpha values
        return padValue(first_number) + padValue(value);
      }

      return $node.text().trim();
    }
  };
  this.$results_container.find("table").tablesorter(tablesorter_opts);
};

BulkContainerSearch.prototype.get_selection = function() {
  var self = this;
  var results = [];

  self.$results_container.find("tbody :checkbox:checked").each(function(i, checkbox) {
    results.push({
      uri: checkbox.value,
      display_string: $(checkbox).data("display-string"),
      row: $(checkbox).closest("tr")
    });
  });

  return results;
};


/***************************************************************************
 * BulkActionIlsHoldingUpdate - ILS bulk action
 *
 */
function BulkActionIlsHoldingUpdate(bulkContainerSearch) {
  this.bulkContainerSearch = bulkContainerSearch;
  this.MENU_ID = "bulkActionUpdateIlsHolding";

  this.setup_menu_item();
};


BulkActionIlsHoldingUpdate.prototype.setup_update_form = function($modal) {
  var self = this;

  var $form = $modal.find("form");

  $form.on("submit", function(event) {
    event.preventDefault();
    self.perform_update($form, $modal);
  });
};


BulkActionIlsHoldingUpdate.prototype.perform_update = function($form, $modal) {
  var self = this;

  $.ajax({
    url:AS.app_prefix("top_containers/bulk_operations/update"),
    data: $form.serializeArray(),
    type: "post",
    success: function(html) {
      $form.replaceWith(html);
      $modal.trigger("resize.modal");
    },
    error: function(jqXHR, textStatus, errorThrown) {
      var error = AS.renderTemplate("template_bulk_operation_error_message", {message: jqXHR.responseText});
      $('#alertBucket').replaceWith(error);
    }
  });
};

BulkActionIlsHoldingUpdate.prototype.setup_menu_item = function() {
  var self = this;

  self.$menuItem = $("#" + self.MENU_ID, self.bulkContainerSearch.$toolbar);

  self.$menuItem.on("click", function(event) {
    self.show();
  });
};


BulkActionIlsHoldingUpdate.prototype.show = function() {
  var dialog_content = AS.renderTemplate("bulk_action_update_ils_holding", {
    selection: this.bulkContainerSearch.get_selection()
  });

  var $modal = AS.openCustomModal("bulkUpdateModal", this.$menuItem[0].text, dialog_content, 'full');

  this.setup_update_form($modal);
};


/***************************************************************************
 * BulkActionContainerProfileUpdate - Container Profile bulk action
 *
 */
function BulkActionContainerProfileUpdate(bulkContainerSearch) {
  this.bulkContainerSearch = bulkContainerSearch;
  this.MENU_ID = "bulkActionUpdateContainerProfile";

  this.setup_menu_item();
};


BulkActionContainerProfileUpdate.prototype.setup_update_form = function($modal) {
  var self = this;

  var $form = $modal.find("form");

  $(document).trigger("loadedrecordsubforms.aspace", [$form]);

  $form.on("submit", function(event) {
    event.preventDefault();
    self.perform_update($form, $modal);
  });
};


BulkActionContainerProfileUpdate.prototype.perform_update = function($form, $modal) {
  var self = this;

  $.ajax({
    url: AS.app_prefix("top_containers/bulk_operations/update"),
    data: $form.serializeArray(),
    type: "post",
    success: function(html) {
      $form.replaceWith(html);
      $modal.trigger("resize.modal");
    },
    error: function(jqXHR, textStatus, errorThrown) {
      var error = AS.renderTemplate("template_bulk_operation_error_message", {message: jqXHR.responseText});
      $('#alertBucket').replaceWith(error);
    }
  });
};

BulkActionContainerProfileUpdate.prototype.setup_menu_item = function() {
  var self = this;

  self.$menuItem = $("#" + self.MENU_ID, self.bulkContainerSearch.$toolbar);

  self.$menuItem.on("click", function(event) {
    self.show();
  });
};


BulkActionContainerProfileUpdate.prototype.show = function() {
  var dialog_content = AS.renderTemplate("bulk_action_update_container_profile", {
    selection: this.bulkContainerSearch.get_selection()
  });

  var $modal = AS.openCustomModal("bulkUpdateModal", this.$menuItem[0].text, dialog_content, 'full');

  this.setup_update_form($modal);
};


/***************************************************************************
 * BulkActionLocationUpdate - Location bulk action
 *
 */
function BulkActionLocationUpdate(bulkContainerSearch) {
  this.bulkContainerSearch = bulkContainerSearch;
  this.MENU_ID = "bulkActionUpdateLocation";

  this.setup_menu_item();
};


BulkActionLocationUpdate.prototype.setup_update_form = function($modal) {
  var self = this;

  var $form = $modal.find("form");

  $(document).trigger("loadedrecordsubforms.aspace", [$form]);

  $form.on("submit", function(event) {
    event.preventDefault();
    self.perform_update($form, $modal);
  });
};


BulkActionLocationUpdate.prototype.perform_update = function($form, $modal) {
  var self = this;

  $.ajax({
    url: AS.app_prefix("top_containers/bulk_operations/update"),
    data: $form.serializeArray(),
    type: "post",
    success: function(html) {
      $form.replaceWith(html);
      $modal.trigger("resize.modal");
    },
    error: function(jqXHR, textStatus, errorThrown) {
      var error = AS.renderTemplate("template_bulk_operation_error_message", {message: jqXHR.responseText});
      $('#alertBucket').replaceWith(error);
    }
  });
};

BulkActionLocationUpdate.prototype.setup_menu_item = function() {
  var self = this;

  self.$menuItem = $("#" + self.MENU_ID, self.bulkContainerSearch.$toolbar);

  self.$menuItem.on("click", function(event) {
    self.show();
  });
};


BulkActionLocationUpdate.prototype.show = function() {
  var dialog_content = AS.renderTemplate("bulk_action_update_location", {
    selection: this.bulkContainerSearch.get_selection()
  });

  var $modal = AS.openCustomModal("bulkUpdateModal", this.$menuItem[0].text, dialog_content, 'full');

  this.setup_update_form($modal);
};


/***************************************************************************
 * BulkActionMultipleLocationUpdate - Multiple Location bulk action
 *
 */
function BulkActionMultipleLocationUpdate(bulkContainerSearch) {
  this.bulkContainerSearch = bulkContainerSearch;
  this.MENU_ID = "bulkActionUpdateMultipleLocation";

  this.setup_menu_item();
};


BulkActionMultipleLocationUpdate.prototype.setup_update_form = function($modal) {
  var self = this;

  var $form = $modal.find("form");

  $(document).trigger("loadedrecordsubforms.aspace", [$form]);

  $form.ajaxForm({
    dataType: "html",
    type: "POST",
    beforeSubmit: function() {
      $form.find(":submit").addClass("disabled").attr("disabled","disabled");
      $form.find(".error").removeClass("error");
    },
    success: function(html) {
      $form.replaceWith(html);
      $modal.trigger("resize.modal");
    },
    error: function(jqXHR, textStatus, errorThrown) {
      var error = $("<div>").attr("id", "alertBucket").html(jqXHR.responseText);
      $('#alertBucket').replaceWith(error);
      var uri = $('.alert-danger:first', '#alertBucket').data("uri");
      if (uri) {
        $(":input[value='"+uri+"']", $form).closest("td").addClass("form-group").addClass("error");
      }
      $form.find(":submit").removeClass("disabled").removeAttr("disabled");
    }
  });
};


BulkActionMultipleLocationUpdate.prototype.setup_menu_item = function() {
  var self = this;

  self.$menuItem = $("#" + self.MENU_ID, self.bulkContainerSearch.$toolbar);

  self.$menuItem.on("click", function(event) {
    self.show();
  });
};


BulkActionMultipleLocationUpdate.prototype.show = function() {
  var dialog_content = AS.renderTemplate("bulk_action_update_location_multiple", {
    selection: this.bulkContainerSearch.get_selection()
  });

  var $modal = AS.openCustomModal("bulkUpdateModal", this.$menuItem[0].text, dialog_content, 'full');

  this.setup_update_form($modal);
};


/***************************************************************************
 * BulkActionBarcodeRapidEntry - bulk action for barcode rapid entry
 *
 */

function BulkActionBarcodeRapidEntry(bulkContainerSearch) {
  this.TEMPLATE_DIALOG_ID = "template_bulk_barcode_action_dialog";
  this.MENU_ID = "showBulkActionRapidBarcodeEntry";

  this.bulkContainerSearch = bulkContainerSearch;

  this.setup_menu_item();
}


BulkActionBarcodeRapidEntry.prototype.setup_menu_item = function() {
  var self = this;

  self.$menuItem = $("#" + self.MENU_ID, self.bulkContainerSearch.$toolbar);

  self.$menuItem.on("click", function(event) {
    self.show();
  });
};


BulkActionBarcodeRapidEntry.prototype.show = function() {
  var dialog_content = AS.renderTemplate(this.TEMPLATE_DIALOG_ID, {
    selection: this.bulkContainerSearch.get_selection()
  });
  var $modal = AS.openCustomModal("bulkActionBarcodeRapidEntryModal", this.$menuItem[0].text, dialog_content, "full");

  this.setup_keyboard_handling($modal);
  this.setup_form_submission($modal);
};


BulkActionBarcodeRapidEntry.prototype.setup_keyboard_handling = function($modal) {
  $modal.find("table :input:visible:first").focus().select();

  $(":input", $modal).
    on("focus",
    function() {
      $.scrollTo($(this), 0, {
        offset: {
          top: 400
        }
      });
    }).
    on("keypress",
    function(event) {
      if (event.keyCode == 13) {
        event.stopPropagation();
        event.preventDefault();

        $(":input", $(this).closest("tr").next()).focus().select();
        return false;
      }
    }
  );
};


BulkActionBarcodeRapidEntry.prototype.setup_form_submission = function($modal) {
  var self = this;
  var $form = $modal.find("form");

  $form.ajaxForm({
    dataType: "html",
    type: "POST",
    beforeSubmit: function() {
      $form.find(":submit").addClass("disabled").attr("disabled","disabled");
      $form.find(".error").removeClass("error");
    },
    success: function(html) {
      $form.replaceWith(html);
      $modal.trigger("resize.modal");
    },
    error: function(jqXHR, textStatus, errorThrown) {
      var error = $("<div>").attr("id", "alertBucket").html(jqXHR.responseText);
      $('#alertBucket').replaceWith(error);
      var uri = $('.alert-danger:first', '#alertBucket').data("uri");
      if (uri) {
        $(":input[value='"+uri+"']", $form).closest("td").addClass("form-group").addClass("error");
      }
      $form.find(":submit").removeClass("disabled").removeAttr("disabled");
    }
  });
};


/***************************************************************************
 * BulkActionDelete - bulk action for delete
 *
 */
function BulkActionDelete(bulkContainerSearch) {
  var self = this;

  self.bulkContainerSearch = bulkContainerSearch;

  var $link = $("#bulkActionDelete", self.bulkContainerSearch.$toolbar);

  $link.on("click", function() {
    AS.openCustomModal("bulkActionModal", "Delete Top Containers", AS.renderTemplate("bulk_action_delete", {
      selection: self.bulkContainerSearch.get_selection()
    }), 'full');
  });
}


/***************************************************************************
 * Initialise all special features on this page
 *
 */
$(function() {

  var bulkContainerSearch = new BulkContainerSearch(
                                                  $("#bulk_operation_form"),
                                                  $("#bulk_operation_results"),
                                                  $(".record-toolbar.bulk-operation-toolbar"));

  new BulkActionBarcodeRapidEntry(bulkContainerSearch);
  new BulkActionIlsHoldingUpdate(bulkContainerSearch);
  new BulkActionContainerProfileUpdate(bulkContainerSearch);
  new BulkActionLocationUpdate(bulkContainerSearch);
  new BulkActionMultipleLocationUpdate(bulkContainerSearch);
  new BulkActionDelete(bulkContainerSearch);
});
