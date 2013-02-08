sand.define("CorrespondenceAnalysis/canvasCtx", ["canvas->Canvas", "fs"], function(r){
  return function(){
    var canvas = new r.Canvas(2000,2000), 
    ctx = canvas.getContext('2d'),
    fs = r.fs, 
    out = fs.createWriteStream(process.cwd() + '/text.png'), 
    stream = canvas.pngStream();
          
    stream.on('data', function(chunk){
      out.write(chunk);
    });

    stream.on('end', function(){
      //console.log("Png saved !");
    }); 
    return ctx;
  }

});
