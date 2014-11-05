var wp = require('webpage'),
  system = require('system');

//CHANGE THIS to whichever state+district type combinations you want
var mapTypes = [
      {
        "state": "NY",
        "type": "state-assembly"
      },
      {
        "state": "NY",
        "type": "state-senate"
      },
      {
        "state": "NY",
        "type": "house"
      },
      {
        "state": "NJ",
        "type": "house"
      },
      {
        "state": "NY",
        "type": "statewide"
      },
      {
        "state": "NJ",
        "type": "statewide"
      }
    ],
    completed = [];

mapTypes.forEach(function(t){
  renderType(t);
});

function renderType(map) {

  //NY maps are 120/96, NJ maps are 120x137
  //CHANGE THIS to be the dimensions you want for your PNGs
  var w = 120,
      h = (map.state == "NJ" ? 137 : 96);

  var page = wp.create();

  page.clipRect = { top: 0, left: 0, width: w, height: h };
  page.viewportSize = { width: w, height: h};

  //CHANGE THIS to be a URL that generate.html can be loaded at
  var url = "http://localhost/minimaps/generate.html?type="+map.type+"&state="+map.state;

  page.open(url, function (status) {

    window.setTimeout(function() {

      //Get the number of districts
      var districts = page.evaluate(function(){

        return groups.data().map(function(d){
          //Return null if it doesn't exist, for statewide
          //CHANGE THIS if the district number property is called something other than "di"
          return d.properties.di || null;
        });

      });

      districts.forEach(function(districtNumber){

        page.evaluate(function(dist){
          highlight(dist);
        },districtNumber);

        //CHANGE THIS if you want a different file naming pattern
        //This will produce CA-house-1.png, etc for districts, and CA-statewide.png for a statewide filled-in map
        var filename = map.type == "statewide" ? [map.state,map.type].join("-") : [map.state,map.type,districtNumber].join("-");

        page.render("png/"+filename+".png");

      });

      completed.push(map);

      console.log("Finished "+map.state+" "+map.type);

      //We're done, exit
      if (completed.length === mapTypes.length) {
        phantom.exit();
      }
    //Two-second delay to make sure the page is rendered
    },2000);
  });

}