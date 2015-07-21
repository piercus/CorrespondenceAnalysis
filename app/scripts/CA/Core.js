define([
    "seed-js/Seed",
    "ggss/ggss", 
    "numeric", 
    "canvas/canvasCtx", 
    "Array/map", 
    "Array/sum", 
    "Array/remove",
    "Array/max", 
    "Array/min",
    "Array/mapMatrix",
    "Array/flatten"
  ], function(Seed, numericjs){

  var isArray = function(u){
    return (typeof u === "object") && (typeof u.length === "number"); 
  };

  var CACore = Seed.extend({
    "+options" : {
      dim : 2,
      _cache : {}
//      interval : [-1,1],
//      size : 2000,
//      callback : null,
//      remove : null,
//      initialized : false
    },
    "setMatrix" : function(A){
      this.__matrix = A;
      this.resetCache();
    },

    "resetCache" : function(){
      
      this._cache = {};

    },

    "setCache" : function(o){
      
      this._cache[o.fnName] = {
        result : o.result,
        err : o.err
      };

      return o.cb ? o.cb(o.err, o.result) : o.result;
    },

    "getCache" : function(o){
      return o.cb ? o.cb(this._cache[o.fnName].err, this._cache[o.fnName].result) : this._cache[o.fnName].result;
    },

    "getTotals" : function(cb){
      if(this._cache["getTotals"]){
        return this.getCache({
          fnName : "getTotals",
          cb: cb
        });
      }

      if(typeof(this.__matrix) === "undefined"){
        return this.setCache({
          fnName : "getTotals", 
          err : "No Matrix, call setMatrix() before", 
          callback : cb,
          result : null
        );
      }

      var sumR = this.__matrix.map(function(e){
            return e.sum();
          }),
          sumC  = numericjs.transpose(A).map(function(e){
            return e.sum();
          });

      return this.setCache({
        fnName : "getTotals", 
        err : null, 
        callback : cb,
        result : {
          sumR : sumR,
          sumC : sumC,
          totals : sumR.sum()
        }
      );

    },

    "getPij" : function(cb){
      if(this._cache["getPij"]){
        return this.getCache({
          fnName : "findEigenValues",
          cb: cb
        });
      }

      if(typeof(this.__matrix) === "undefined"){
        return this.setCache({
          fnName : "getPij", 
          err : "No Matrix, call setMatrix() before", 
          callback : cb,
          result : null
        );
      }

      var p_ij = this.__matrix.mapMatrix(function(cell, i ,j){ 
                  
        if(isNaN(cell/total)){
          if(cb){
            cb("Problem with cell "+i+","+j+" : cell is "+cell+" total is "+total)
          } else {
            throw("Problem with cell "+i+","+j+" : cell is "+cell+" total is "+total);
          }
        }

        return cell/total;
      });


      return this.setCache({
        fnName : "getPij", 
        err : null, 
        callback : cb,
        result : p_ij
      });

    }
    
    "findEigenValues" : function(cb){

      if(this._cache["findEigenValues"]){
        return this.getCache({
          fnName : "findEigenValues",
          cb: cb
        });
      }

      if(typeof(this.__matrix) === "undefined"){
        return this.setCache({
          fnName : "findEigenValues", 
          err : "No Matrix, call setMatrix() before", 
          callback : cb,
          result : null
        );
      }
      
      var a = this.__matrix,
          totals = this.getTotals(),
          total = totals.total,
          sumC = totals.sumC,
          sumR = totals.sumR,
          v_jj = [],
          p_ij = this.getPij();
      
      for(var j1 = 0; j1 < a[0].length; j1++){
        v_jj[j1] = [];
        for(var j2 = 0; j2 < a[0].length; j2++){
          var res = 0;
          for(var i = 0; i < a.length; i++){
            // see http://foad.refer.org/IMG/pdf/M05-3.pdf
            res+= p_ij[i][j1]*p_ij[i][j2]/(Math.sqrt(sumC[j1]*sumC[j2])*sumR[i]/(total*total)) - Math.sqrt(sumC[j1]*sumC[j2])/total;

            if(isNaN(res)){
              if(cb){
                cb("NaN value in eigen values function, computation stops")
              } else {
                throw("NaN value in eigen values function, computation stops");
              }
            }
          }

          v_jj[j1][j2] = res;

        }
      }
      
      
      var eig = numericjs.eig(v_jj);

      var inerties = this.eig.lambda.x.slice(1);
      var isum = inerties.sum();

      return this.setCache({
        fnName : "findEigenValues", 
        err : null, 
        callback : cb,
        result : eig
      });

    },
    
    getPoints : function(cb){

      if(this._cache["getPoints"]){
        return this.getCache({
          fnName : "getPoints",
          cb: cb
        });
      }

      var dim = this.dim,
          totals = this.getTotals(),
          total = totals.total,
          sumC = totals.sumC,
          sumR = totals.sumR,
          p_ij = this.getPij(),
          eig = this.findEigenValues(),
          inerties = eig.lambda.x.slice(1),
          u_pj = numeric.transpose(this.eig.E.x).slice(1,1+dim),
          a_pj = u.mapMatrix(function(cell, p, j){
            return Math.sqrt(inerties[p])*cell/Math.sqrt(sumC[j]);
          });,
          
      
      
      var f_pi = [],
          mins = [], 
          maxs = [], 
          points = [], 
          coords, 
          max,
          //iterators
          p,
          i,
          j,
          po;
      
      for(p = 0; p < dim ; p++){
        f_pi[p] = [];
        for(i=0; i< p_ij.length; i++){
          var tot = 0; 
          for(j = 1; j < p_ij[0].length; j++){
            tot += p_ij[i][j]/(sumR[i]/total)*a_pj[p][j];
          }
          f_pi[p][i] = 1/Math.sqrt(inerties[p])*tot;
        }
      }
      
      coords = numericjs.transpose(a_pj).concat(numericjs.transpose(f_pi));
      
      coords.getDim = function(p){
        return this.map(function(point){
          return point[p];
        });
      };

      for(p = 0; p < dim; p++){
        mins.push(coords.getDim(p).min());
        maxs.push(coords.getDim(p).max());      
      }
      
      max = mins.flatten().map(function(i){return Math.abs(i);}).concat(maxs.flatten()).max();
      
      for(j = 0; j < a_pj[0].length; j++){
        po = {baseCoords : [], normCoords : [], color : "blue", col : true, population : this.sumC[j]};
        for(p = 0; p < dim; p++){
          po.baseCoords.push(a_pj[p][j]);
          po.normCoords.push(a_pj[p][j]/max);
          po.label = this.cLegends[j];
        }
        points.push(po);
      }
      
      for(i = 0; i < f_pi[0].length; i++){
        po = {baseCoords : [], normCoords : [], color : "red", population : this.sumR[i]};
        for(p = 0; p < dim; p++){
          po.baseCoords.push(f_pi[p][i]);
          po.normCoords.push(f_pi[p][i]/max);
          po.label = this.rLegends[i];
        }
        points.push(po);        
      }      

      return this.setCache({
        fnName : "getPoints", 
        err : null, 
        callback : cb,
        result : points
      });
       
    }
    
    
  });

  return CACore;


});
