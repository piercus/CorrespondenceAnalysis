define(["canvas", "fs"], function(Canvas, fs){
	return function(){
		var canvas = new Canvas(2000,2000), 
		ctx = canvas.getContext('2d'),
		out = fs.createWriteStream(process.cwd() + '/text.png'), 
		stream = canvas.pngStream();
					
		stream.on('data', function(chunk){
			out.write(chunk);
		});

		stream.on('end', function(){
			//console.log("Png saved !");
		}); 
		return ctx;
	};

});
