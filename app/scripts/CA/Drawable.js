define([
    "CA/Core",
    "canvas/canvasCtx"
  ], function(Core, canvasCtx){

  var isArray = function(u){
    return (typeof u === "object") && (typeof u.length === "number");
  };

  var CADrawable = Core.extend({
    "+options" : {
      size : 2000,
      font : null,
      filename: "output.png"
    },

    draw : function(cb){
      var size = this.size, ctx = canvasCtx(size, size, this.filename);

      ctx.font = this.font;
      ctx.beginPath();
      ctx.textAlign = 'center';
      ctx.lineTo(size/2, 0);
      ctx.lineTo(size/2, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.lineTo(0, size/2);
      ctx.lineTo(size, size/2);
      ctx.stroke();
      console.log("set Step");
      var step = size/2*0.8;

      this.getPoints(function(err, points){

        if(err){
          return cb(err);
        }

        for(var i =0; i < points.length; i++){
          var px = points[i].normCoords[0]*step+size/2, py = points[i].normCoords[1]*(-1)*step+size/2;
          ctx.fillStyle = points[i].color;
          ctx.fillText(points[i].label, px, py);
        }

        cb();

      });
    }
  });

  return CADrawable;


});
