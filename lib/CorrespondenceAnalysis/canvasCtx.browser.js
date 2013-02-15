sand.define("CorrespondenceAnalysis/canvasCtx", function(r){
  return function(width, height){
    var c = document.getElementById('myCanvas'),
        ctx = c.getContext("2d");
    c.width = width;
    c.height = height;  
    //document.body.appendChild(c);
  
    return ctx;  
  }
});
