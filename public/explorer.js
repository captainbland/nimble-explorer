/**This javascript file controls the dynamic content of the home page of nimble-explorer
  It uses JSONP to retrieve Nimble's JSON directory and uses Fuse.js to perform
  a fuzzy search. It's a bit quick and dirty but the results are good on a
  "time spent" basis.
*/
var RETURN_KEY = 13;

function populateList(e, fuse) {
  var search_results = fuse.search($("#search").val());
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
      var tag = $("<span style='margin:4px; margin-left:0' class=\"label label-primary\"></span>");
      tag.text(result.tags[tagidx]);
      newElem.find(".tags").append(tag);
    }
    $("#output").append(newElem);
  }
}

function compatibility() {
  $("#compatibility").css("display", "block");
}
var jsonp_fail_timeout = setTimeout(compatibility, 2000);
$(function() {
  $.getJSON(
  "http://raw.githubusercontent.com/nim-lang/packages/master/packages.json",


  // Work with the response
  function( response ) {
      clearTimeout(jsonp_fail_timeout);
      $("#gosearch").attr("disabled", false);
      nimble_data = response;
      var options = {
        keys: ["name", "tags", "description", "license"],
        threshold: 0.1,
        distance:5000

      };
      var fuse = new Fuse(nimble_data, options);
      $("#gosearch").click(function(e) {
        e.preventDefault();
        e.stopPropagation();
        populateList(e, fuse);
      });
      $("#search").keydown(function(e) {
        if(e.keyCode == RETURN_KEY) {
          populateList(e, fuse);
        }
      });


    });
});
