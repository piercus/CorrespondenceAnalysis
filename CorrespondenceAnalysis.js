sand.define("CorrespondenceAnalysis/CorrespondenceAnalysis", [
    "google-spreadsheets->ggss", 
    "numeric->numericjs", 
    "CorrespondenceAnalysis/canvasCtx", 
    "googleclientlogin",
    "Array/map", 
    "Seed/Seed",  
    "Array/sum", 
    "Array/max", 
    "Array/min",
    "Array/mapMatrix"
  ], function(r){
var isArray = function(u){return (typeof u === "object") && (typeof u.length === "number") };

Array.prototype.flatten = function(){
  var res = [];
  for(var i = 0; i < this.length; i++) isArray(this[i]) ? res.push(this[i].flatten) : res.push(this[i]);
  return res;
};

var ggss = r.ggss,
    numericjs = r.numericjs,
    Canvas = r.canvas,
    GoogleClientLogin = r.googleclientlogin.GoogleClientLogin;


  var AC = r.Seed.extend({
    "+options" : {
      /*
       *  GGSS options object
       */
      spreadSheetOptions : {
        key : "0Aq0j0yzReyQcdDl2cEVYWWRXQ3IzOU1Sa3NkallLakE"
      },
      googleLogin : {},
      dim : 2,
      interval : [-1,1]
    },
    
    "+init" : function(){
      var googleAuth = new GoogleClientLogin(this.googleLogin);
      googleAuth.on(GoogleClientLogin.events.login, function(){
        this.spreadSheetOptions.auth = googleAuth.getAuthId();
        ggss(this.spreadSheetOptions, this.onSpreadSheet.bind(this));
      }.bind(this));
      googleAuth.login();
    },
    
    "findEigenValues" : function(a, cb){
      var a = this.matrix,
          total = this.total,
          sumC = this.sumC,
          sumR = this.sumR,
          v_jj = [],
          p_ij = (this.p_ij = a.mapMatrix(function(cell, i ,j){ return cell/total;}));
      
      for(var j1 = 0; j1 < a[0].length; j1++){
        v_jj[j1] = [];
        for(var j2 = 0; j2 < a[0].length; j2++){
          var res = 0;
          for(var i = 0; i < a.length; i++){
            // see http://foad.refer.org/IMG/pdf/M05-3.pdf
            res+= p_ij[i][j1]*p_ij[i][j2]/(Math.sqrt(sumC[j1]*sumC[j2])*sumR[i]/(total*total)) - Math.sqrt(sumC[j1]*sumC[j2])/total;
          }
          v_jj[j1][j2] = res;
        }
      }
      
      
      this.eig = numeric.eig(v_jj);
      var inerties = this.eig.lambda.x.slice(1);
      var isum = inerties.sum();
      //console.log(inerties.map(function(i){  return [Math.sqrt(i),i,i/isum]}));

      
    },
    
    getPoints : function(){
      var dim = this.dim,
          interval = this.interval,
          sumC = this.sumC,
          p_ij = this.p_ij,
          sumR = this.sumR,
          total = this.total,
          inerties = this.eig.lambda.x.slice(1),
          u = numeric.transpose(this.eig.E.x).slice(1,1+dim),
          a_pj = u.mapMatrix(function(cell, p, j){return Math.sqrt(inerties[p])*cell/Math.sqrt(sumC[j])}),
          f_pi = [],
          mins = [], maxs = [], points = [], coords, max;
          
      for(var p = 0; p < dim ; p++){
        f_pi[p] = [];
        for(var i=0; i< p_ij.length; i++){
          var tot = 0; 
          for(var j = 1; j < p_ij[0].length; j++){
            tot += p_ij[i][j]/(sumR[i]/total)*a_pj[p][j];
          }
          f_pi[p][i] = 1/Math.sqrt(inerties[p])*tot;
        }
      }
      
      coords = numericjs.transpose(a_pj).concat(numericjs.transpose(f_pi));
      for(var p = 0; p < dim; p++){
        mins.push(coords.map(function(point){return point[p]}).min());
        maxs.push(coords.map(function(point){return point[p]}).max());      
      }
      
      max = mins.flatten().map(function(i){return Math.abs(i);}).concat(maxs.flatten()).max();
      
      for(var j = 0; j < a_pj[0].length; j++){
        var po = {baseCoords : [], normCoords : []};
        for(var p = 0; p < dim; p++){
          po.baseCoords.push(a_pj[p][j]);
          po.normCoords.push(a_pj[p][j]/max);
          po.label = this.cLegends[j];
        }
        points.push(po);
      }
      
      for(var i = 0; i < f_pi[0].length; i++){
        var po = {baseCoords : [], normCoords : []};
        for(var p = 0; p < dim; p++){
          po.baseCoords.push(f_pi[p][i]);
          po.normCoords.push(f_pi[p][i]/max);
          po.label = this.rLegends[i];
        }
        points.push(po);        
      }      

      return points;
     
       
    },
    
    
    onEnd : function(){
      //console.log("end");
    },
    
    "onSpreadSheet" : function(err, spreadsheet){

      if(err){
        console.log(err);
      }
      spreadsheet.worksheets[0].cells({},function(err,cells){
        this.formatSheet(err, cells);    
        this.findEigenValues();  
        this.draw(this.getPoints(), this.onEnd.bind(this));  
      }.bind(this));
    },
    
    "formatSheet" : function(err, cells){
    
       var A =[], rLegends = [], cLegends = [];
       for (var i in cells) if(cells.hasOwnProperty(i)){//stylesheets
        for (var j in cells[i]) if(cells[i].hasOwnProperty(j)){//rows
          for (var k in cells[i][j]) if(cells[i][j].hasOwnProperty(k)){//columns
            var rIndex = parseInt(cells[i][j][k].row) - 2,
                cIndex = parseInt(cells[i][j][k].col) - 2,
                v = parseInt(cells[i][j][k].inputValue);
                
            
            if(!isNaN(v)) {
              A[rIndex] || (A[rIndex] = []);
              A[rIndex][cIndex] = v;
            } else if(rIndex === -1 && cIndex !== -1) {
              cLegends.push(cells[i][j][k].inputValue);
            } else if(cIndex === -1 && rIndex !== -1) {
              rLegends.push(cells[i][j][k].inputValue);
            }
          }
            
        }
      }
      
      if(A.length < A[0].length){
         A = numericjs.transpose(A);
         var tmp = rLegends;
         rLegends = cLegends;
         cLegends = tmp;
      }
      
      var sumR = A.map(function(e){return e.sum()}),
          sumC  = numericjs.transpose(A).map(function(e){return e.sum()});
      
      this.matrix = A;
      this.rLegends = rLegends;
      this.cLegends = cLegends;
      this.sumC = sumC;
      this.sumR = sumR;
      this.total = sumR.sum();            
    
    },
    
    draw : function(points, cb){
      var ctx = r.canvasCtx(); 
                            
      ctx.font = '30px Impact';
      ctx.beginPath();
      ctx.lineTo(1000, 0);
      ctx.lineTo(1000, 2000);
      ctx.stroke();
      ctx.beginPath();
      ctx.lineTo(0, 1000);
      ctx.lineTo(2000, 1000);
      ctx.stroke();
      //console.log("set Step");
      var step = 1000;
      for(var i =0; i < points.length; i++){
        var px = points[i].normCoords[0]*step+1000, py = points[i].normCoords[1]*(-1)*step+1000;
        ctx.fillText(points[i].label, px, py);
      }
    }
  });
  new AC({});
  return AC;


});
