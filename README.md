CorrespondenceAnalysis
======================

Correspondence analysis implementation in javascript, works on server-side and client-side.

See a [demo](http://piercus.github.com/CorrespondenceAnalysis)

What is Correspondance Analysis
======================

See http://en.wikipedia.org/wiki/Correspondence_analysis.

Or for a more step by step tutorial, see http://www.micheloud.com/FXM/COR/E/index.htm

Installation
=====

On nodejs/npm

```shell
npm install  --save CorrespondenceAnalysis
```

Example
=====

Using nodejs

```javascript
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
```

Dependencies
=====

sandjs, seedjs, sandcli, numericjs are used on both server-side and client-side.

For client-side, the demo run with google-visualization.

For server-side, it runs with "canvas" npm module, so you need to install specific tools, to do that, follow the [Node-canvas Wiki](https://github.com/LearnBoost/node-canvas/wiki/_pages)


    sudo apt-get install libgif-dev


Build
====
To build sources run

   sand server

in the folder.
And get http://localhost:8899/require?query=CorrespondenceAnalysis/CorrespondenceAnalysis
