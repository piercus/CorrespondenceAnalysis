var AC;

requirejs.config({
  paths : {
    "seed-js" : "../../node_modules/seed-js/src",
    "Array" : "../../node_modules/Array",
    "String" : "../../node_modules/String",
    numeric: "../../bower_components/numeric-1.2.6/index",
    requirejs: "../../bower_components/requirejs/require",
    "canvas/canvasCtx" : "canvas/canvasCtx.browser"
  },
  shim : {
    "numeric" : {exports:"numeric"}
  }
});
var AC, onSheetLoaded, chartsReady = false, changeMatrix, nonChecked = [];
requirejs(["CA/CorrespondenceAnalysis"], function(CorrespondenceAnalysis){

  onSheetLoaded = function(){
    console.log("sheet loaded");
    AC = new CorrespondenceAnalysis({
      key : document.getElementById("spreadsheet-key").value,
      callback : drawChartAndTable,
      remove : nonChecked
    });
  };

  var onChartReady = function(){
        console.log("chartsReady");

    chartsReady = true;
    //drawChartAndTable();
  };
  
  changeMatrix = function(){
    var f = document.getElementById("details-form");
    nonChecked = [];
    Array.prototype.slice.call(f.elements).each(function(e){  !e.checked && (nonChecked.push(e.name)) });
    onSheetLoaded();
  };
  
  onSheetLoaded();
  
  google.load("visualization", "1", {packages:["corechart"], callback : onChartReady});

  function drawChartAndTable() {
    if(!AC || !chartsReady) return;
    document.getElementById('tabs').className = 'tabs chart';
    var data = google.visualization.arrayToDataTable([
      ['Lambda1', 'Lambda2']
    ].concat());
    var dataTable = new google.visualization.DataTable();
    dataTable.addColumn('string', 'ID');
    dataTable.addColumn('number', 'Lambda1');
    dataTable.addColumn('number', 'Lambda2');
    dataTable.addColumn('string', 'Data Type');

    var points = AC.getPoints().map(function(p){
      return [p.label, p.normCoords[0], p.normCoords[1], !p.col ?"Rows" : "Columns", p.population];
    });
    
    // A column for custom tooltip content
    dataTable.addColumn('number','Population');
    var inerties = AC.eig.lambda.x.slice(1),
        isum = inerties.sum(),
        format = function(n){
          return parseFloat(Math.round(n * 1000) / 1000).toFixed(3);
        },
        getLegend = function(m, lgds, axisName){
          var table = [];
          console.log(nonChecked);
          m.mapMatrix(function(cell, p, j){ 
              table[j] || (table[j] = [], table[j].push("<input type='checkbox' checked='"+(nonChecked.indexOf(lgds[j]) === -1 ? "checked" : "")+"' name='"+lgds[j]+"'>"+lgds[j]));
              table[j][p+1] = format(cell);
          });
          return "<tr><th rowspan="+table.length+">"+axisName+"</th>"+table.map(function(t){return "<td>"+t.map(function(c){ return c.toString();}).join("</td><td>")+"</td>"; }).join("</tr><tr>")+"</tr>";
      
    };
//console.log(inerties.map(function(i){  return [Math.sqrt(i),i,i/isum]}));
    var legends = "<form id='details-form'><table class='details-table'><tr><td colspan='2'><a href='#' onclick='changeMatrix()'>Reload</a></td><th class='details-th'>Lamdba1</th><th class='details-th'>Lambda2</th></tr>"
      + "<tr><th rowspan='4'>Inertia</th><td>Singular Value</td><td>"+format(Math.sqrt(inerties[0]))+"</td><td>"+format(Math.sqrt(inerties[1]))+"</td></tr>"
      + "<tr><td>Inertia</td><td>"+format(inerties[0])+"</td><td>"+format(inerties[1])+"</td></tr>"
      + "<tr><td>Proportion Explained</td><td>"+format(inerties[0]/isum*100)+"%</td><td>"+format(inerties[1]/isum*100)+"%</td></tr>"      
      + "<tr><td>Cumulative Proportion</td><td>"+format(inerties[0]/isum*100)+"%</td><td>"+format((inerties[0]+inerties[1])/isum*100)+"%</td></tr>"                          
      + getLegend(AC.u_pj, AC.cLegends, "Studies")
      + getLegend(AC.f_pi.mapMatrix(function(cell,p,i){return cell*Math.sqrt(AC.sumR[i]);}), AC.rLegends, "Town")+"</table></form>";
    document.getElementById("details").innerHTML = legends;
    var options = {
      title: 'Correspondence Analysis',
      bubble: {textStyle: {fontSize: 11}},
      theme : 'maximized'
    };
    
    dataTable.addRows(points);
    
    var chart = new google.visualization.BubbleChart(document.getElementById('chart_div'));
    chart.draw(dataTable, options);
  }


});