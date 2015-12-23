/**This javascript file controls the dynamic content of the home page of nimble-explorer
  It uses JSONP to retrieve Nimble's JSON directory and uses Fuse.js to perform
  a fuzzy search. It's a bit quick and dirty but the results are good on a
  "time spent" basis.
*/
var RETURN_KEY = 13;

function populateList(search_string) {

  var options = {
    keys: ["name", "tags", "description", "license"],
    threshold: 0.1,
    distance:5000
  };

  var search_list = search_string.split(" ");
  var search_results = nimble_data;
  /**Searching finds succesive subsets of results as split by space
  so space is like saying a AND b AND c, etc. You can also search with a colon
  operator in order to pick out particular fields in the JSON object*/
  for(var i in search_list) {
    var key_split = search_list[i].split(":");
    if(key_split.length == 2 && options.keys.indexOf(key_split[0]) >= 0) {
      var t_options =
      {
        threshold: options.threshold,
        distance: options.distance,
        keys: [key_split[0]]
      };
      fuse = new Fuse(search_results, t_options);
      search_results = fuse.search(key_split[1]);
    } else {
      fuse = new Fuse(search_results, options);
      search_results = fuse.search(search_list[i]);
      console.log(search_results);
    }
  }
  $("#output").html("");
  for(var residx in search_results) {
    var result = search_results[residx];
    var newElem = $($("#itemTemplate").html());

    newElem.find(".name").text(result.name);
    if(result.web === undefined) {
      newElem.find(".name").unwrap();
    } else {
      newElem.find(".url").attr('href',result.web);
    }
    newElem.find(".giturl").text(result.url);
    newElem.find(".license").text(result.license);
    newElem.find(".description").text(result.description);
    for(var tagidx in result.tags) {
      var tag = $("<a href='#' style='margin:4px; margin-left:0' class=\"label label-primary\"></a>");
      tag.text(result.tags[tagidx]);
      newElem.find(".tags").append(tag);
    }
    $("#output").append(newElem);
  }

  if(search_results.length === 0) {
    $("#output").text("No results were returned");
  } else {
    $(".label.label-primary").click(function(e) {
      var to_search = "tags:" + $(e.target).text();
      $("#search").val(to_search);
      populateList(to_search);
    });
    $("#output").prepend("Results returned: <b>" + search_results.length + "</b><br/>");
  }
}

function onGetJsonResponse(response) {
  $("#gosearch").attr("disabled", false);
  nimble_data = response;

  $("#gosearch").click(function(e) {
    e.preventDefault();
    e.stopPropagation();
    populateList($("#search").val());
  });
  $("#search").keydown(function(e) {
    if(e.keyCode == RETURN_KEY) {
      populateList($("#search").val());
    }
  });
}

/**If we can't get the data through JSONP, resort to getting it through the server's cache*/
function loadDataFromServerCache() {
  $.getJSON("/jsonCache", function(data) {
      onGetJsonResponse(data);
  });
}


var jsonp_fail_timeout = setTimeout(loadDataFromServerCache, 2000);
$(function() {
  /*$.getJSON(
    "http://raw.githubusercontent.com/nim-lang/packages/master/packages.json",

    // Work with the response
    function( response ) {
        clearTimeout(jsonp_fail_timeout);

        onGetJsonResponse(response);
    });*/

});
