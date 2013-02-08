sand.define("CorrespondenceAnalysis/canvasCtx", ["canvas"], function(r){
  var c = document.createElement("myCanvas"),
      ctx = c.getContext("2d");
      
  document.body.appendChild(c);
  
  return ctx;
});
