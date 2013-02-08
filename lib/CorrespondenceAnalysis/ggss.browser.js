sand.define("CorrespondanceAnalysis/ggss", function(r){
      
  return function(key, cb){
    var jsonpHandlerId = "jsonpHandler"+Math.float(Math.random()*1000);
    var URL = "https://spreadsheets.google.com/tq?tqx=responseHandler:"+jsonpHandlerId+"&tq=select%20*&key="+key;
    window[jsonpHandlerId] = function(data){
      console.log(data);
    }
    var scp = document.createElement('script');
    scp.setAttribute("type","text/javascript");
    scp.setAttribute("src", URL);   
    document.getElementsByTagName("head")[0].appendChild(scp);  
  }

});
