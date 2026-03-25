/**
 * Example control script of Engine3D library
 * @author Przemysław Kapusta
 */

//(function () {
	
//	Engine3DLoader.load("Engine3D.bin", function(loadError) {
		
//		if (loadError) {
//			console.log(loadError);
//			return;
//		}
	
		//embed Engine3D to openfl-content element
		lime.embed ("Engine3D", "openfl-content", 0, 0, { parameters: {} });
		
		//globals
		Engine3D.Globals.set(Globals.VIEW_DEFAULT_SHOW_REFLECTIONS, true);
		
		var isBase = false;
		var baseModels = null;
		
		var scenery = null;
		var parentM3D = null;
		var currentModel = null;
		
		var selectedModel = null;
		
		loadScenery();
		assignListeners();
		assignBtnListeners();
		
		function loadScenery() {
			scenery = Engine3D.Controller.getCurrentProject().loadRootModel("models/scenery1.m3d");
			scenery.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {
				console.log("Scenery loaded");
				parentM3D = scenery;
			});
		}
		
		function assignListeners() {
			Engine3D.Controller.addEventListener(Engine3D.Engine3DModelEvent.MODEL_SELECT, function(e) {
				selectedModel = e.getModel();
			});
		}
		
		function assignBtnListeners() {
			var elements = document.getElementById("headstones").getElementsByTagName("li");
			for (var i = 0; i < elements.length; ++i) {
				var element = elements[i];
				element.onclick = function() {
					loadModel("models/forevershining/headstones/" + this.textContent);
				};
			}
			elements = document.getElementById("urns").getElementsByTagName("li");
			for (var i = 0; i < elements.length; ++i) {
				var element = elements[i];
				element.onclick = function() {
					loadModel("models/forevershining/urns/" + this.textContent);
				};
			}
			elements = document.getElementById("size-btns").getElementsByTagName("li");
			for (var i = 0; i < elements.length; ++i) {
				var element = elements[i];
				element.onclick = function() {
					changeSize(this.className);
				};
			}
			elements = document.getElementById("textures").getElementsByTagName("img");
			for (var i = 0; i < elements.length; ++i) {
				var element = elements[i];
				element.onclick = function(e) {
					if (!e.ctrlKey) {
						loadTexture(this.getAttribute("src"), "color");
					} else {
						loadTexture(this.getAttribute("src"), "color2");
					}
				};
				element.oncontextmenu = function(e) {
					e.preventDefault();
					loadTexture(this.getAttribute("src"), "color2");
				};
			}
			elements = document.getElementById("specials").getElementsByTagName("li");
			elements[0].onclick = loadBaseModels;
			elements[1].onclick = addMotifWithImage;
			elements[2].onclick = addMotifWithCanvas;
		}
		
		function loadModel(url) {
			
			//if scenery not loaded leave function
			if (scenery == null || !scenery.isReady()) return;
			
			//if model is in loading state leave function
			if (currentModel != null && !currentModel.isReady()) return;
			
			let lastModel = currentModel;
			
			currentModel = new Engine3D.Model3D(url);
			currentModel.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {
				
				//remove last model from scenery
				if (lastModel != null) {
					lastModel.removeFromParent();
					
					//REMEMBER! - always dispose not used models to prevent memory leaks
					lastModel.dispose();
				}
				
				//add loaded model to scenery
				parentM3D.addChild(currentModel);
				
				console.log("Model ("+url+") loaded");
				
			});
			
		}
		
		function changeSize(elClass) {
			console.log(elClass);
			if (selectedModel == null) return;
			switch (elClass) {
				case "w-plus": selectedModel.changeProperty("width", selectedModel.getProperty("width")+10); break;
				case "w-minus": selectedModel.changeProperty("width", selectedModel.getProperty("width")-10); break;
				case "h-plus": selectedModel.changeProperty("height", selectedModel.getProperty("height")+10); break;
				case "h-minus": selectedModel.changeProperty("height", selectedModel.getProperty("height")-10); break;
			}
		}
		
		var textureLoading = false;
		
		function loadTexture(url, colorName) {
			
			//if texture loading is in progress return
			if (textureLoading) return;
			
			textureLoading = true;
			
			if (!colorName) colorName = "color";
			
			new Engine3D.utils.BitmapLoader(url, function(error, bitmap) {
				
				//if error exit
				if (error) {
					console.log(error);
					textureLoading = false;
					return;
				}
				
				//build texture value
				var texture = new Engine3D.values.BitmapTextureValue(bitmap, 15);
				//texture.setEmbedType(Engine3D.enums.EmbedType.EMBEDDED);
				Engine3D.project.triggers.BaseUrlLoadTrigger.storeResourceUrl(texture, url);
				
				if (selectedModel != null) {
					//set texture to object
					selectedModel.changeProperty(colorName, texture);
				}
				
				console.log("Texture ("+url+") loaded");
				
				textureLoading = false;
				
			}).load();
			
		}
		
		function addMotifWithImage() {
			
			//if model is in loading state leave function
			if (currentModel == null || (currentModel != null && !currentModel.isReady())) return;
			
			var motif = new Engine3D.Model3D("models/motif-container.m3d");
			motif.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {
				
				currentModel.addChild(motif);
				
				new Engine3D.utils.DisplayObjectLoader("assets/motif-test.png", function(error, displayObject) {
				
					//if error exit
					if (error) {
						console.log(error);
						return;
					}
					
					//build object value
					var object = new Engine3D.values.DisplayObjectValue(displayObject);
					Engine3D.project.triggers.BaseUrlLoadTrigger.storeResourceUrl(object, "assets/motif-test.png");
					object.setEmbedType(Engine3D.enums.EmbedType.EMBEDDED);
					
					//set object
					motif.changeProperty("display_object", object);
					
					console.log("DisplayObject (assets/motif-test.png) loaded");
					
				}).load();
				
			});
			
		}
		
		function addMotifWithCanvas() {
			
			//if model is in loading state leave function
			if (currentModel == null || (currentModel != null && !currentModel.isReady())) return;
			
			var motif = new Engine3D.Model3D("models/motif-container.m3d");
			motif.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {
				
				currentModel.addChild(motif);
				
				//build object value from HTMLCanvasElement
				var object = new Engine3D.values.DisplayObjectValue(buildTestCanvasElement());
				object.setEmbedType(Engine3D.enums.EmbedType.EMBEDDED);
				
				//set object
				motif.changeProperty("display_object", object);
				
			});
			
		}
		
		function buildTestCanvasElement() {
			var canvas = document.createElement('canvas');
			canvas.width = 150;
			canvas.height = 150;
			var ctx = canvas.getContext("2d");
			ctx.lineWidth = 3;
			ctx.strokeStyle = 'red';
			ctx.beginPath();
			ctx.arc(75,75,50,0,Math.PI*2,true); // Outer circle
			ctx.moveTo(110,75);
			ctx.arc(75,75,35,0,Math.PI,false);  // Mouth (clockwise)
			ctx.moveTo(65,65);
			ctx.arc(60,65,5,0,Math.PI*2,true);  // Left eye
			ctx.moveTo(95,65);
			ctx.arc(90,65,5,0,Math.PI*2,true);  // Right eye
			ctx.stroke();
			return canvas;
		}
		
		
		function loadBaseModels() {
			
			var baseModelUrls = [
				"models/tempus/tombstones/tomb_042/base.m3d",
				"models/tempus/tombstones/tomb_042/kerb.m3d",
				"models/tempus/tombstones/tomb_042/lid.m3d",
				//"models/tempus/tombstones/tomb_042/stand.m3d",
				"models/tempus/tombstones/tomb_042/table.m3d"
			];
			
			var modelsReady = 0;
			
			var models = [];
			for (var i = 0; i < baseModelUrls.length; i++) {
				var model = new Engine3D.Model3D(baseModelUrls[i]);
				model.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {
					modelsReady++;
					if (modelsReady == baseModelUrls.length) modelsComplete();
				});
				models.push(model);
			}
			
			function modelsComplete() {
				if (currentModel != null) currentModel.removeFromParent();
				var parentModel = scenery;
				for (var i = 0; i < models.length; i++) {
					var m = models[i];
					parentModel.addChild(m);
					parentModel = m;
				}
				if (parentModel.getGeneralType() == "table") {
					currentModel = parentModel;
					parentM3D = parentModel.getParent();
				} else {
					baseModels = models;
					if (currentModel != null) parentModel.addChild(currentModel);
					parentM3D = parentModel;
				}
			}
			
		}
		
		function testRenderToImage() {
			
			var config = {
				x: 0,
				y: 300,
				z: 850,
				look_at_x: 0,
				look_at_y: 200,
				look_at_z: 0,
				width: 640,
				height: 480
			}
			
			var renderCamera = new Engine3D.core.cameras.Camera3D(new Engine3D.core.cameras.lenses.PerspectiveLens(50));
			renderCamera.set_position(new Engine3D.core.geom.Vector3D(config.x, config.y, config.z));
			renderCamera.lookAt(new Engine3D.core.geom.Vector3D(config.look_at_x, config.look_at_y, config.look_at_z));

			var renderParams = new Engine3D.utils.RenderToImageParams(renderCamera, config.width, config.height);
			
			var jpeg_base64 = Engine3D.View.renderToImage(new Engine3D.utils.JPEGEncoderOptions(70), renderParams, "Base64String");
			var jpeg_bytes = Engine3D.View.renderToImage(new Engine3D.utils.JPEGEncoderOptions(70), renderParams, "Uint8Array");
			var png_base64 = Engine3D.View.renderToImage(new Engine3D.utils.PNGEncoderOptions(), renderParams, "Base64String");
			var png_bytes = Engine3D.View.renderToImage(new Engine3D.utils.PNGEncoderOptions(), renderParams, "Uint8Array");
			
			return {
				jpeg_base64: jpeg_base64,
				jpeg_bytes: jpeg_bytes,
				png_base64: png_base64,
				png_bytes: png_bytes,
			}
			
		}
		
		function loadProject(url) {
			
			var context = new Engine3D.project.ProjectContext();
			context.registerResourceLoadTrigger(Engine3D.project.triggers.BaseUrlLoadTrigger);
			Engine3D.Controller.addEventListener(Engine3D.Engine3DProjectEvent.PROJECT_LOADED, function listener(e) {
				Engine3D.Controller.removeEventListener(Engine3D.Engine3DProjectEvent.PROJECT_LOADED, listener);
				let project = e.getProject();
				console.log("project loaded: " + project);
			});
			console.log(Engine3D.Controller.getCurrentProject().getRootModel().getRegionList()[0].getChildList());
			Engine3D.Controller.loadProject(url, context, function() {
				console.log("onComplete");
				console.log(Engine3D.Controller.getCurrentProject().getRootModel().getRegionList()[0].getChildList());
			});
			
		}
	
//	});

//})();