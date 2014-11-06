var fs = require("fs"),
    wp = require("webpage"),
    system = require("system"),
    page = wp.create();

var config = JSON.parse(fs.read("config.json"));

//Choose a format
if ("format" in config) {

  config.format = config.format.toLowerCase();

  if (["gif","png","jpg","jpeg","pdf"].indexOf(config.format) === -1) {
    console.log("Invalid value for 'format', using 'png' instead.");
    config.format = "png";
  }

  if (config.format == "jpeg") {
    config.format = "jpg";
  }

} else {

  config.format = "png";

}

//Use empty prefix if none set
config.outputPrefix = config.outputPrefix || "";

//Page dimensions
page.clipRect = { top: 0, left: 0, width: config.width, height: config.height };
page.viewportSize = { width: config.width, height: config.height};

page.open(config.url, function (status) {

  var waited = 0,
      timeout = 10000,
      interval = 100,
      loop;

  //generate.html loads async data, need to check until it's ready
  loop = setInterval(function() {

    waited += interval;

    var isReady = page.evaluate(function(){

      return mapReady;

    });

    if (isReady) {
      ready();
      clearInterval(loop);
    } else if (waited > timeout) {
      console.log("Maximum timeout of "+Math.round(timeout/1000)+"s exceeded.  generate.html is having trouble loading.");
      console.log("Make sure it's accessible at the URL listed in config.json, and that you have a working internet connection.");
      clearInterval(loop);
      phantom.exit();
    }

  },interval);

  function ready() {

    //Get the number of districts
    var maps = page.evaluate(function(propName){

      var data = [],
          skip = [];

      //Use data() if propName has been configured,
      //otherwise use the feature's index
      foreground.data().forEach(function(d,i){

        if (propName) {
          data.push(d.properties[propName] || null);
          if (!(propName in d.properties)) {
            skip.push(i);
          }
        } else {
          data.push(i);
        }

      });

      return {
        "data": data,
        "skip": skip
      }

    },config.propName);

    //Generate a map for each
    maps.data.forEach(function(datum,i){

      if (maps.skip.indexOf(i) !== -1) {
        console.log("'"+config.propName+"' not found for feature "+i+". Skipping.");
      } else {
        page.evaluate(function(d){
          highlight(d);
        },datum);
        var filename = config.outputPrefix+datum+"."+config.format;
        page.render(filename,{format:config.format});
        console.log("Saved "+filename);
      }

    });

    phantom.exit();

  }

});