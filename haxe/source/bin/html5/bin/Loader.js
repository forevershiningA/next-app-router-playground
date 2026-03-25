/**
 * Engine3D loader
 * @author Przemysław Kapusta
 */

(function() {
	
	var load = function(file, callback) {
	
		var req = new XMLHttpRequest();
		req.open("GET", file, true);
		req.overrideMimeType("text/plain; charset=binary-data");
		req.responseType = "arraybuffer";
		req.onload = function (oEvent) {
			var arrayBuffer = req.response;
			if (arrayBuffer) {
				var byteArray = new Uint8Array(arrayBuffer);
				LZMA.decompress(byteArray, function(result, error) {
					if (error) {
						callback(error);
					} else {
						var F = new Function(result);
						(F());
						callback(null);
					}
				}, function(percent) {});
			}
		};
		req.send(null);
	
	}
	
	window.Engine3DLoader = {
		load: load
	}
	
})();