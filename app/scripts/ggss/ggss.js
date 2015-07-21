define(["Array/each", "Array/map"], function(){
      
  return function(key, cb){
    var jsonpHandlerId = "jsonpHandler"+Math.floor(Math.random()*1000);
    var URL = "https://spreadsheets.google.com/tq?tqx=responseHandler:"+jsonpHandlerId+"&tq=select%20*&key="+key;
    window[jsonpHandlerId] = function(data){
      var rowIndex = 0, colIndex = 0, key = "1";
      var cells = {"1" : {}};
      data.table.cols.each(function(e){
          cells[key][(colIndex+1).toString()] = {inputValue : e.label, row : rowIndex, col : colIndex };
          colIndex++; 
      });
      data.table.rows.each(function(e){
            rowIndex++;
            colIndex = 0;
            key = (rowIndex+1).toString();
            cells[key] = {};
            e.c.each(function(h,i){      
                if(typeof(h) === "undefined"){
                  console.log("Warning, no value on row "+rowIndex+" and column "+colIndex);
                  //throw("cell content is undefined");
                }        
                cells[key][(colIndex+1).toString()] = {inputValue : (h && h.v) || "", row : rowIndex, col : colIndex };
                colIndex++;              
            });
      });
      
      console.log(cells);
      cb(null, {"sheet1" : cells});
    };

    var scp = document.createElement('script');
    scp.setAttribute("type","text/javascript");
    scp.setAttribute("src", URL);   
    document.getElementsByTagName("head")[0].appendChild(scp);  
  };

});
