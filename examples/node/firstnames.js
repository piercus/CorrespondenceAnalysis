var CA = require("../../app/scripts/main.js");

var ca = new CA();

ca.rLegends = fs.read["Ain", "Aisne", "Allier", "Alpes de Hautes Provence", "Hautes Alpes"];
ca.cLegends = ["Jean", "Philippe", "Michel","Alain","Patrick"];

var data =

ca.setMatrix([
  [55,73,90,13,16],
  [12,41,16,0,0],
  [0,18,12,0,0],
  [3,9,0,0,0],
  [484,103,564,186,220]
]);

ca.draw(function(e){
  if(e){
    console.log("error ",e);
    return
  }
  console.log("Ending");
});
