define([
    "CA/Base",
    "numeric", 
    "Array/map", 
    "Array/sum", 
    "Array/remove",
    "Array/max", 
    "Array/min",
    "Array/mapMatrix",
    "Array/flatten"
  ], function(Base, numericjs){

  var isArray = function(u){
    return (typeof u === "object") && (typeof u.length === "number"); 
  };

  var CACore = Base.extend({
    "+options" : {
      dim : 2,
      _cache : {},
//      interval : [-1,1],
//      size : 2000,
      callback : null
//      remove : null,
//      initialized : false
    },

    "setMatrix" : function(A){
      this.__matrix = A;
      this.resetCache();
    },

    "hasMatrix" : function(A){
      return !!this.__matrix;
    },

    /*"resetCache" : function(){
      
      this._cache = {};

    },

    "setCache" : function(o){
      
      this._cache[o.fnName] = {
        result : o.result,
        err : o.err
      };

      if(o.cb){
        return o.cb(o.err, o.result);
      } else {
        if(o.err){
          throw(o.err);
        }
        return o.result;
      }

    },

    "getCache" : function(o){
      return o.cb ? o.cb(this._cache[o.fnName].err, this._cache[o.fnName].result) : this._cache[o.fnName].result;
    },*/

    "getTotals:cached" : function(cb){

      if(typeof(this.__matrix) === "undefined"){
        return this.setCache({
          fnName : "getTotals", 
          err : "No Matrix, call setMatrix() before", 
          callback : cb,
          result : null
        });
      }

      var sumR = this.__matrix.map(function(e){
            return e.sum();
          }),
          sumC  = numericjs.transpose(this.__matrix).map(function(e){
            return e.sum();
          }),
          res = {
            sumR : sumR,
            sumC : sumC,
            total : sumR.sum()
          };

      return cb(null, res);

    },

    "getPij:cached" : function(cb){

      if(typeof(this.__matrix) === "undefined"){
        return cb("No Matrix, call setMatrix() before");
      }

      var total = this.getTotals().total,
          p_ij = this.__matrix.mapMatrix(function(cell, i ,j){ 
                  
        if(isNaN(cell/total)){
          if(cb){
            cb("Problem with cell "+i+","+j+" : cell is "+cell+" total is "+total)
          } else {
            throw("Problem with cell "+i+","+j+" : cell is "+cell+" total is "+total);
          }
        }

        return cell/total;
      });

      return cb(null, p_ij);

    },
    
    "findEigenValues:cached" : function(cb){

      if(typeof(this.__matrix) === "undefined"){
        return cb("No Matrix, call setMatrix() before");
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

      var inerties = eig.lambda.x.slice(1);
      var isum = inerties.sum();

      return cb(null, eig);

    },

    "getFpi:cached" : function(cb){
      var p,
          dim = this.dim,
          tot, 
          f_pi = [],
          p_ij = this.getPij(),
          totals = this.getTotals(),
          total = totals.total,
          a_pj = this.getApj(),
          sumC = totals.sumC,
          eig = this.findEigenValues(),
          inerties = eig.lambda.x.slice(1),
          sumR = totals.sumR;

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

      return cb(null, f_pi);
    },

    "getUpj:cached" : function(cb){
      return cb(null, numeric.transpose(this.findEigenValues().E.x).slice(1,1+this.dim));
    },

    "getApj:cached" : function(cb){
      var eig = this.findEigenValues(),
          inerties = eig.lambda.x.slice(1),
          sumC = this.getTotals().sumC;

      return cb(null, this.getUpj().mapMatrix(function(cell, p, j){
            return Math.sqrt(inerties[p])*cell/Math.sqrt(sumC[j]);
          }));
    },
    
    "getPoints:cached" : function(cb){

      if(typeof(this.__matrix) === "undefined"){
        return cb("No Matrix, call setMatrix() before");
      }

      var dim = this.dim,
          totals = this.getTotals(),
          total = totals.total,
          sumC = totals.sumC,
          sumR = totals.sumR,
          p_ij = this.getPij(),
          eig = this.findEigenValues(),
          inerties = eig.lambda.x.slice(1),
          u_pj = this.getUpj(),
          a_pj = this.getApj();
          
      var f_pi = this.getFpi(),
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
        po = {baseCoords : [], normCoords : [], color : "blue", col : true, population : sumC[j]};
        for(p = 0; p < dim; p++){
          po.baseCoords.push(a_pj[p][j]);
          po.normCoords.push(a_pj[p][j]/max);
          po.label = this.cLegends[j];
        }
        points.push(po);
      }
      
      for(i = 0; i < f_pi[0].length; i++){
        po = {baseCoords : [], normCoords : [], color : "red", population : sumR[i]};
        for(p = 0; p < dim; p++){
          po.baseCoords.push(f_pi[p][i]);
          po.normCoords.push(f_pi[p][i]/max);
          po.label = this.rLegends[i];
        }
        points.push(po);        
      }      

      return cb(null, points);
       
    }
    
    
  });

  return CACore;


});
