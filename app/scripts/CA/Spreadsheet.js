define([
    "CA/Core",
    "ggss/ggss",
    "numeric"
  ], function(Core, ggss, numericjs){

  function prettyPrintNumber( number ) {
        var numberString;
        var scale = '';
        if( isNaN( number ) || !isFinite( number ) ) {
            numberString = 'N/A';
        } else {
            var absVal = Math.abs( number );

            if( absVal < 1000 ) {
                scale = '';
            } else if( absVal < 1000000 ) {
                scale = 'K';
                absVal = absVal/1000;

            } else if( absVal < 1000000000 ) {
                scale = 'M';
                absVal = absVal/1000000;

            } else if( absVal < 1000000000000 ) {
                scale = 'B';
                absVal = absVal/1000000000;

            } else if( absVal < 1000000000000000 ) {
                scale = 'T';
                absVal = absVal/1000000000000;
            }

            var maxDecimals = 0;
            if( absVal < 10 && scale != '' ) {
                maxDecimals = 1;
            }
            numberString = absVal.toFixed( maxDecimals );
            numberString += scale
        }
        return numberString;
    };

  var cloneArray = function(o) { // clones an object (only lvl 1, see hardClone)
        var res = [];
        for (var i = 0; i < o.length;i++){
          res.push(o[i]);
        }
        return res;
      };

  var AC = Core.extend({
    "+options" : {
      /*
       *  GGSS options object
       */
      key : "0Aq0j0yzReyQcdDl2cEVYWWRXQ3IzOU1Sa3NkallLakE",
      rLegends : null,
      cLegends : null,
      remove : null
    },
    
    "+init" : function(){
      ggss(this.key, this.onSpreadSheet.bind(this));
    },
    
    "onSpreadSheet" : function(err, cells){

      if(err){
        throw(err);
      }
      this.cells = cells;
      this.createCellTable(cells, "debug");
      this.formatSheet(cells);    
      this.findEigenValues();  
      this.fire("ready");
    },

    "updateRemove" : function(removeList){
      this.remove = removeList;
      this.formatSheet(this.cells);
    },

    "createCellTable" : function(cells, identifier){
      
      for (var i in cells) if(cells.hasOwnProperty(i)){//stylesheets
        var table = "<h2>"+i+"</h2><table>";
        for (var j in cells[i]) if(cells[i].hasOwnProperty(j)){//rows
          table+="<tr><td>"+j+"</td>";
          for (var k in cells[i][j]) if(cells[i][j].hasOwnProperty(k)){//columns
            table+="<td>"+(typeof(cells[i][j][k].inputValue)==="number" ? prettyPrintNumber(cells[i][j][k].inputValue) : cells[i][j][k].inputValue)+"</td>";
          }
          table+="</tr>";
        }
        table+="</table>";
        document.getElementById(identifier).innerHTML = table;
      }

    },

    "getUpjByLegends" : function(){
      var res = {};

      this.getUpj().mapMatrix(function(v, p, j){
        if(!res[this.cLegends[j]]){
          res[this.cLegends[j]] = {};
        } 
        res[this.cLegends[j]][p] = v;
      }.bind(this));

      return res;
    },

    "getFpiByLegends" : function(){
      var res = {};

      this.getFpi().mapMatrix(function(v, p, i){
        if(!res[this.rLegends[i]]){
          res[this.rLegends[i]] = {};
        } 
        res[this.rLegends[i]][p] = v;
      }.bind(this));

      return res;
    },

    "formatSheet" : function(cells){

       var A =[], rLegends = [], cLegends = [], removeRIndexes=[], removeCIndexes = [];

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
              //console.log(cells[i][j][k]);
              throw("problem with a cell "+rIndex+","+cIndex+" : "+cells[i][j][k].inputValue);
            }     
            
          }
            
        }
      }

      this.allCLegends = cloneArray(cLegends);
      this.allRLegends = cloneArray(rLegends);
      
      if(this.remove && this.remove.length > 0){
         var index, removeCs = [], removeRs = [],diffR = 0, diffC = 0, newA = A;
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

        removeRs = removeRs.sort();
        removeCs = removeRs.sort();

        for(i = removeRs.length-1; i >= 0; i--){
          newA.splice(removeRs[i], 1);
        }

        for(i = removeCs.length-1; i >= 0; i--){
          newA.map(function(v, index){
              v.splice(removeCs[i], 1);
          });
        }

        A = newA;

        /*A.mapMatrix(function(v,r,c){
          if(removeCs.indexOf(c) !== -1 || removeRs.indexOf(r) !== -1) {
            if(removeCs.indexOf(c) !== -1) { 
              diffC++; 
            }
            if(removeRs.indexOf(c) !== -1) { diffR++; }          
            return;
          }
          if(!newA[r-diffR]){ newA[r-diffR] = []; }
          newA[r-diffR][c-diffC] = v;
          if(isNaN(v) || typeof(v) === "undefined"){
            throw("Error v is NaN");
          }
        });*/
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
