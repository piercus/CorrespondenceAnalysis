define(["canvas", "fs"], function(Canvas, fs){
	return function(sizeX,sizeY,outputFilename){
		var canvas = new Canvas(sizeX,sizeY),
		ctx = canvas.getContext('2d'),
		out = fs.createWriteStream(process.cwd() + '/'+outputFilename),
		stream = canvas.pngStream();
		ctx.strokeStyle = 'rgba(255,255,255,1)';
		//ctx.rect(0,0,sizeX,sizeY);
		ctx.fillRect();
		ctx.font = '50px Impact';
		stream.on('data', function(chunk){
			out.write(chunk);
		});


		stream.on('end', function(){
			//console.log("Png saved !");
		});
		return ctx;
	};

});
