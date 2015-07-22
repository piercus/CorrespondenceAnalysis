define([
    "CA/Core",
    "ggss/ggss",
    "numeric"
  ], function(Core, ggss, numericjs){

  var AC = Core.extend({
    "+options" : {
      /*
       *  GGSS options object
       */
      key : "0Aq0j0yzReyQcdDl2cEVYWWRXQ3IzOU1Sa3NkallLakE",
      rLegends : null,
      cLegends : null
    },
    
    "+init" : function(){
      ggss(this.key, this.onSpreadSheet.bind(this));
    },
    
    "onSpreadSheet" : function(err, cells){

      if(err){
        throw(err);
      }
      this.formatSheet(err, cells);    
      this.findEigenValues();  
      this.fire("ready");
    },
    
    "formatSheet" : function(err, cells){
    
       var A =[], rLegends = [], cLegends = [];

       for (var i in cells) if(cells.hasOwnProperty(i)){//stylesheets

        for (var j in cells[i]) if(cells[i].hasOwnProperty(j)){//rows

          for (var k in cells[i][j]) if(cells[i][j].hasOwnProperty(k)){//columns

            var rIndex = parseInt(cells[i][j][k].row) - 1,
                cIndex = parseInt(cells[i][j][k].col) - 1,
                v = cells[i][j][k].inputValue === "" ? 0 : parseInt(cells[i][j][k].inputValue);
                
            if(rIndex === -1 && cIndex !== -1) {
              cLegends.push(cells[i][j][k].inputValue);
            } else if(cIndex === -1 && rIndex !== -1) {
              rLegends.push(cells[i][j][k].inputValue);
            } else if(!isNaN(v)) {
              if(!A[rIndex]){ A[rIndex] = []; }
              A[rIndex][cIndex] = v;
            } else if(rIndex !== -1 || cIndex !== -1){
              console.log(cells[i][j][k]);
              throw("problem with a cell "+rIndex+","+cIndex+" : "+cells[i][j][k].inputValue);
            }
          }
            
        }
      }
      
      if(this.remove && this.remove.length > 0){
         var index, removeCs = [], removeRs = [],diffR = 0, diffC = 0, newA = [];
         for(i = 0; i < this.remove.length; i++){
           if((index = rLegends.indexOf(this.remove[i])) !== -1){
             removeRs.push(index);
             rLegends.remove(this.remove[i]);
           }
           if((index = cLegends.indexOf(this.remove[i])) !== -1){
             removeCs.push(index);
             cLegends.remove(this.remove[i]);
           }          
         }
         A.mapMatrix(function(v,r,c){
           if(removeCs.indexOf(c) !== -1 || removeRs.indexOf(r) !== -1) {
             if(removeCs.indexOf(c) !== -1) { diffC++; }
             if(removeRs.indexOf(c) !== -1) { diffR++; }          
             return;
           }
           if(!newA[r-diffR]){ newA[r-diffR] = []; }
           newA[r-diffR][c-diffC] = v;
         });
         A = newA;
       }      
      if(A.length < A[0].length){
         A = numericjs.transpose(A);
         var tmp = rLegends;
         rLegends = cLegends;
         cLegends = tmp;
      }

      this.rLegends = rLegends;
      this.cLegends = cLegends;
      this.setMatrix(A);
    
    }
  });

  return AC;


});
