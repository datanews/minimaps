var wp = require('webpage'),
  system = require('system');

/*var numDistricts = {
  "assembly": 150,
  "senate": 63,
  "house-ny": 27,
  "house-nj": 12
};*/

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
  var w = 120,
      h = (map.state == "NJ" ? 137 : 96);

  var page = wp.create();

  page.clipRect = { top: 0, left: 0, width: w, height: h };
  page.viewportSize = { width: w, height: h};

  var url = "http://localhost/election2014/minimaps/generate.html?type="+map.type+"&state="+map.state;

  page.open(url, function (status) {

    window.setTimeout(function() {

      //Get the number of districts
      var districts = page.evaluate(function(){

        return groups.data().map(function(d){
          //Return null if it doesn't exist, for statewide
          return d.properties.di || null;
        });

      });

      districts.forEach(function(districtNumber){

        page.evaluate(function(dist){
          highlight(dist);
        },districtNumber);

        var filename = map.type == "statewide" ? [map.state,map.type].join("-") : [map.state,map.type,districtNumber].join("-");

        page.render("png/"+filename+".png");

      });

      completed.push(map);

      console.log("Finished "+map.state+" "+map.type);

      if (completed.length === mapTypes.length) {
        phantom.exit();
      }

    },2000);
  });

}