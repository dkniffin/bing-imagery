Map = require('./map.js');
BI = require('./backend-interface.js');

var map = new Map(document.getElementById("myMap"), new Microsoft.Maps.Location(40, -105.27), 15);

document.getElementById("start").onclick = function() {
  //send stuff to the backend
  BI(map.getNSEW());
}