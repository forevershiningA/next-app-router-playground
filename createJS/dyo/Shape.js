import {Data} from './Data.js';
import {$, Lang, Translate, File} from '../Const.js';

export class Shape extends Data {

	constructor(data = {}) {

		super({ Type: "drawing" });

		this.outlineSize = 10;
		this.last = {};

		this._x = (dyo.dpr * dyo.w) / 2;
		this._y = (dyo.dpr * dyo.h) / 2;

		this.cacheMinX = -(dyo.dpr * dyo.w) / 2;
		this.cacheMinY = -(dyo.dpr * dyo.h) / 2;
		this.cacheMaxX = (dyo.dpr * dyo.w);
		this.cacheMaxY = (dyo.dpr * dyo.h);

		this.setType(data.Type);
		
		this.setWidth(data.Width);
		this.setHeight(data.Height);
		this.setLength(data.Length);

		this.setMinWidth(data.Width);
		this.setMinHeight(data.Height);
		this.setMinLength(data.Length);

		this.setMaxWidth(data.Width);
		this.setMaxHeight(data.Height);
		this.setMaxLength(data.Length);

		this.setName(data.Name);
		this.setShape(data.Shape);
		this.setBorderColor("#000000");
		this.setTexture(data.Texture);

		let fixed;

		this.scale_minX = 0;
		this.scale_maxX = 0;
		this.scale_minY = 0;
		this.scale_maxY = 0;

		if (fixed == undefined) {
			fixed = 0;
		} else {
			fixed = shape.fixed;
		}

		if (data.Fixed) {
			fixed = data.Fixed;
		}

		this.setFixed(fixed);

		if (data.Border) {
			this.setBorder(data.Border);
		}

		if (data.border_name) {
			this.border_name = data.border_name;
		}

		switch (dyo.monument.backgroundOption) {
			default:
				this.setColor(data.Color);
				this.setTexture(data.Texture);
		
				if (data.Color) {
					if (data.Color.indexOf("#") == -1) {
						this.setTexture(dyo.path.upload_directory + data.Color);
					}
				}
	
				break;

			case "color":
				this.setColor(data.Color);
				this.setTexture(data.Texture);
				break;
				
			case "photo":
				this.setColor(data.Color);
				this.setTexture(data.Texture);
		
				if (data.Color) {
					if (data.Color.indexOf("#") == -1) {
						this.setTexture(dyo.path.upload_directory + data.Color);
					}
				}
				break;
		}

		this.setStage(data.Stage);

		this._selected = data.Selected;

		this.init();

		if (this._selected) {
			this._select();
		} else {
			this.deselect();
		}

	}

	init() {

		this.addContainer("Backlay_Front", true);
		this.addContainer("Shape", true);
		this.addContainer("Shape_Outline", true);
		this.addContainer("Texture", true);

		this.addContainer("Overlay_Front", true);
		this.addContainer("Overlay_Front_Detail", true);
		this.addContainer("Overlay_Front_Detail_2", true);
		this.addContainer("Overlay_Front_Detail_3", true);
		this.addContainer("Overlay_Front_Detail_4", true);
		this.addContainer("Design_Front", true);
		this.addContainer("Photos_Front", true);
		this.addContainer("Motifs_Front", true);
		this.addContainer("Inscriptions_Front", true);

		this.containers["Texture"].addChild(new createjs.Shape());
		this.containers["Backlay_Front"].addChild(new createjs.Shape());
		this.containers["Overlay_Front"].addChild(new createjs.Shape());
		this.containers["Overlay_Front_Detail"].addChild(new createjs.Shape());
		this.containers["Overlay_Front_Detail_2"].addChild(new createjs.Shape());
		this.containers["Overlay_Front_Detail_3"].addChild(new createjs.Shape());
		this.containers["Overlay_Front_Detail_4"].addChild(new createjs.Shape());
		this.containers["Inscriptions_Front"].addChild(new createjs.Shape());

		if (dyo.config._config.border) {
			this.containers["Overlay_Front"].on("click", function() {
				document.location.href = "#select-border";
			});
		}

		this.showFront();

	}

	setRatio4() {
		if (dyo.monument.headstone) {
			this.shapes.forEach(item => {
				if (item.name == this.name) {
					dyo.monument.headstone.ratio4 = item.width / item.height;
				}
			});
		}
	}

	get ratio() {
		let ratio;
		this.shapes.forEach(item => {
			if (item.name == this.name) {
				ratio = item.ratio;
			}
		});
		return ratio;
	}

	get scale() {
		let scale = 1;
		this.shapes.forEach(item => {
			if (item.name == this.name) {
				scale = item.scale;
			}
		});
		return scale;
	}

	set type(value) {
		this.setType(value);
	}
	
	get type() {
		return this.getType();
	}
	
	setType(value) {
		this._type = value;
	}
	
	getType() {
		return this._type;
	}

	set width(value) {
		if (value > 1) {
			this.setWidth(value);
		}
	}
	
	get width() {
		return this.getWidth();
	}
	
	setWidth(value) {
		this._width = value;
	}
	
	getWidth() {
		return this._width;
	}

	set min_width(value) {
		this.setMinWidth(value);
	}
	
	get min_width() {
		return this.geMinWidth();
	}
	
	setMinWidth(value) {
		this._min_width = value;
	}
	
	getMinWidth() {
		let min_width = this._min_width;

		if (this.fixed == 4) {
			let currentDifference = this._height - this._width;
			if (currentDifference < 0) {
				min_width = Number(File('table').min_width) - currentDifference;
			} 
		} 

		return min_width;
	}

	set max_width(value) {
		this.setMaxWidth(value);
	}
	
	get max_width() {
		return this.getMaxWidth();
	}
	
	setMaxWidth(value) {
		this._max_width = value;
	}

	// fixed
	//
	// 0 - not fixed
	// 1 - fixed width & height
	// 2 - fixed width & height, height = width

	set fixed(value) {
		if (value == undefined) {
			value = 0;
		}
		this.setFixed(value);
	}
	
	get fixed() {
		return this.getFixed();
	}
	
	setFixed(value) {

		if (value == 0) {
			$("#dyo_select_size").style.display = "flex";
		}

		if (dyo.monument.getProductType() == "images") {
			$("#dyo_select_size").style.display = "flex";
		}

		switch (dyo.monument.getProductType()) {
			case "petplaques": case "mini-headstones": case "urns": 
				$("#dyo_select_size").style.display = "none";
				break;
		}

		this._fixed = value;
	}
	
	getFixed() {
		return this._fixed;
	}

	set note(value) {
		if (value == undefined) {
			value = 0;
		}
		this.setNote(value);
	}
	
	get note() {
		return this.getNote();
	}
	
	setNote(value) {
		this._note = value;
	}
	
	getNote() {
		return this._note;
	}

	getMaxWidth() {
		let max_width = this._max_width;

		if (dyo.monument.has_base) {
			if (this.type == "Base") {
				let diff = (Number(dyo.config._shapes[0].files.table.max_width) - dyo.monument.headstone.width);
				max_width = Number(dyo.config._shapes[0].files.table.max_width) + 100;
			}
		}

		if (this.fixed == 4) {
			let currentDifference = this._height - this._width;
			if (currentDifference > 0) {
				max_width = Number(File('table').max_width) - currentDifference;
			} else {
				max_width = Number(File('table').max_width);
			}
		} 

		return max_width;
	}
	
	set height(value) {
		if (value > 1) {
			this.setHeight(value);
		}
	}
	
	get height() {
		return this.getHeight();
	}
	
	setHeight(value) {
		this._height = value;
	}
	
	getHeight() {
		return this._height;
	}

	set min_height(value) {
		this.setMinHeight(value);
	}
	
	get min_height() {
		return this.geMinHeight();
	}
	
	setMinHeight(value) {
		this._min_height = value;
	}
	
	getMinHeight() {

		let minHeight;
		
		let part = 'table';
		
		if (this.fixed == 4) {
			let currentDifference = this._height - this._width;

			if (currentDifference > 0) {
				minHeight = Number(File(part).min_height) + currentDifference;
			} else {
				minHeight = Number(File(part).min_height);
			}

		} else {
			minHeight = this._min_height;
		}

		return minHeight;
	}

	set max_height(value) {
		this.setMaxheight(value);
	}
	
	get max_height() {
		return this.getMaxHeight();
	}
	
	setMaxHeight(value) {
		this._max_height = value;
	}
	
	getMaxHeight() {
		
		let maxHeight;

		if (this.fixed == 4) {
			let currentDifference = this._height - this._width;
			if (currentDifference > 0) {
				maxHeight = Number(File('table').max_height);
			} else {
				maxHeight = Number(File('table').max_height) + currentDifference;
			}
		} else {
			maxHeight = this._max_height;
		}

		return maxHeight;

	}

	set length(value) {
		//this.setLength(value);
	}
	
	get length() {
		return this.getLength();
	}

	setLength(value) {
		this._length = value;
	}
	
	getLength() {
		return this._length;
	}
	
	set min_length(value) {
		this.setMinLength(value);
	}
	
	get min_length() {
		return this.geMinLength();
	}
	
	setMinLength(value) {
		this._min_length = value;
	}
	
	getMinLength() {
		return this._min_length;
	}

	set max_length(value) {
		this.setMaxLength(value);
	}
	
	get max_length() {
		return this.geMaxLength();
	}
	
	setMaxLength(value) {
		this._max_length = value;
	}
	
	getMaxLength() {
		return this._max_length;
	}

	set color(value) {
		this.setColor(value);
	}
	
	get color() {
		return this.getColor();
	}
	
	setColor(value) {
		this._color = value;
	}
	
	getColor() {
		return this._color;
	}

	set x(value) {
		this.setX(value);
	}

	get x() {
		return this.getX();
	}
	
	setX(x) {
		this._x = x;
	}
	
	getX() {
		return this._x;
	}
	
	set y(value) {
		this.setY(value);
	}
	
	get y() {
		return this._y;
	}
	
	setY(y) {
		this._y = y;
	}
	
	getY() {
		return this._y;
	}
	
	set stage(value) {
		this.setStage(value);
	}
	
	get stage() {
		return this.getStage();
	}
	
	setStage(value) {
		this._stage = value;
	}
	
	getStage() {
		return this._stage;
	}
	
	set name(value) {
		this.setName(value);
	}
	
	get name() {
		return this.getName();
	}
	
	setName(name) {
		dyo.engine.shapeName = name;
		this._name = name;
	}

	getName() {
		return this._name;
	}

	setShape(shape) {
		this._shapeDrawing = shape;
	}

	getShape() {
		return this._shapeDrawing;
	}

	setShapeId(id) {
		this._shapeId = id;
	}

	getShapeId() {
		return this._shapeId;
	}

	set border(value) {
		this.setBorder(value);
	}
	
	get border() {
		return this.getBorder();
	}
	
	setBorder(border) {
		this._border = border;
		this.borderName = border;
		this.border_name = dyo.design.getBorderName(border);
		if (border) {
			dyo.borders.selectBorder(border.toLowerCase().replace(" ", "_"));
		}
	}

	getBorder() {
		return this._border;
	}

	set config(value) {
		this.setConfig(value);
	}
	
	get config() {
		return this.getConfig();
	}
	
	setConfig(config) {
		//console.log(config);
		this._config = config;
	}

	getConfig() {
		return this._config;
	}

	set borderColor(value) {
		this.setBorderColor(value);
	}
	
	get borderColor() {
		return this.getBorderColor();
	}
	
	setBorderColor(color) {
		this._borderColor = color;
	}

	getBorderColor() {
		return this._borderColor;
	}

	showFront() {
		this.containers["Backlay_Front"].visible = true;
		this.containers["Overlay_Front"].visible = true;
		this.containers["Overlay_Front_Detail"].visible = true;
		this.containers["Overlay_Front_Detail_2"].visible = true;
		this.containers["Overlay_Front_Detail_3"].visible = true;
		this.containers["Overlay_Front_Detail_4"].visible = true;
		this.containers["Inscriptions_Front"].visible = true;
		this.containers["Motifs_Front"].visible = true;
	}

	showBack() {
		this.containers["Backlay_Front"].visible = false;
		this.containers["Overlay_Front"].visible = false;
		this.containers["Overlay_Front_Detail"].visible = false;
		this.containers["Overlay_Front_Detail_2"].visible = false;
		this.containers["Overlay_Front_Detail_3"].visible = false;
		this.containers["Overlay_Front_Detail_4"].visible = false;
		this.containers["Inscriptions_Front"].visible = false;
		this.containers["Motifs_Front"].visible = false;
	}

	set texture(value) {
		this.setTexture(value);		
	}
	
	get texture() {
		return this.getTexture();
	}
	
	setTexture(value) {

		if (value == null) {
			return;
		}

		if (value) {
			if (dyo.mode == "3d") {
				if (dyo.engine.engineStarted) {
					dyo.engine3d.loadTexture(dyo.engine3d.currentModel, value);
				}
			}
		 }

		if (value.indexOf(".") == -1) {
			this.granites.forEach(item => {
				if (item.name == value) {
					this._texture = item.img.replace('/s/', '/l/');
				}
			});
		} else {
			this._texture = value.replace('/s/', '/l/').replace('src','data/jpg');
		}

	}

	getTexture() {

		if (this._texture) {
			if (this._texture.indexOf("upload/../upload") > -1) {
				this._texture = this._texture.replace("upload/../upload", "upload");
			}

			//console.log(this._texture);

			let o = this._texture.split("/");

			if (o[5] == o[9]) {
				if (o[6] == o[10]) {
					o.splice(7, 4);
					this._texture = o.join("/");
				}
			}

			return dyo.xml_path + this._texture;
		}

	}

	addContainer(container, visible) {
		if (this._containers == undefined) {
			this._containers = [];
		}

		let _container = new createjs.Container();

		this._containers[container] = _container;
		this._containers[container].name = container;
		this._containers[container].x = this._x;
		this._containers[container].y = this._y;
		this._containers[container].visible = visible;

		this._stage.addChild(this._containers[container]);
	}
	
	get containers() {
		return this.getContainers();
	}
	
	getContainers() {
		return this._containers;
	}

	show() {
		this._stage.visible = true;
	}
	
	hide() {
		this._stage.visible = false;
	}
	
	remove() {
		if (this._stage.getChildAt(0)) {
			while (this._stage.getChildAt(0)) {
				this._stage.removeChildAt(0);
			}
		}
	}

	removeFrom(parent) {
		if (parent.getChildAt(0)) {
			while (parent.getChildAt(0)) {
				parent.removeChildAt(0);
			}
		}
	}

	removeShape() {

		this.containers["Texture"].visible = false;
		this.containers["Overlay_Front_Detail"].visible = false;
		this.containers["Overlay_Front_Detail_2"].visible = false;
		this.containers["Overlay_Front_Detail_3"].visible = false;
		this.containers["Overlay_Front_Detail_4"].visible = false;

		if (this.overlayFront) {
			if (dyo.currentSection == "Shapes") {
				this.overlayFront.uncache();
				this.overlayFront.graphics.clear();
			}
		}

		if (this.shape) {
			this.shape.uncache();
			this.removeFrom(this.containers["Shape"]);
		}

		this.containers["Shape"].removeAllChildren();

		this.shape = new createjs.Shape();
		this.containers["Shape"].addChild(this.shape);
		this.shape.cache(this.cacheMinX, this.cacheMinY, this.cacheMaxX, this.cacheMaxY);

		if (this.shape_outline) {
			this.shape_outline.uncache();
			this.removeFrom(this.containers["Shape_Outline"]);
		}

		this.containers["Shape_Outline"].removeAllChildren();

		this.shape_outline = new createjs.Shape();
		this.containers["Shape_Outline"].addChild(this.shape_outline);
		this.shape_outline.cache(this.cacheMinX, this.cacheMinY, this.cacheMaxX, this.cacheMaxY);

	}

	render() {

		this.detail_top = undefined;
		this.detail_bottom = undefined;
		this.detail_left = undefined;
		this.detail_right = undefined;

		this.detailTopCached = false;
		this.detailBottomCached = false;
		this.detailLeftCached = false;
		this.detailRightCached = false;

		this.stackId = [];

		this.removeShape();

		let self = this;

		self.getDrawing(self.getShape(), "main", self.renderOverlay.bind(self));
		

	}

	renderOverlay() {

		if (this.backlayFront) {
			this.backlayFront.uncache();
		}
		if (this.overlayFront) {
			this.overlayFront.uncache();
		}

		this.removeFrom(this.containers["Backlay_Front"]);
		this.removeFrom(this.containers["Overlay_Front"]);

		this.containers["Backlay_Front"].removeAllChildren();
		this.containers["Overlay_Front"].removeAllChildren();

		this.backlayFront = new createjs.Shape();
		this.containers["Backlay_Front"].addChild(this.backlayFront);
		this.backlayFront.cache(this.cacheMinX, this.cacheMinY, this.cacheMaxX, this.cacheMaxY);

		this.overlayFront = new createjs.Shape();
		if (dyo.mode == "3d") {
			this.overlayFront.scaleX = this.overlayFront.scaleY = dyo.dpr;
		}
		this.containers["Overlay_Front"].addChild(this.overlayFront);
		this.overlayFront.cache(this.cacheMinX, this.cacheMinY, this.cacheMaxX, this.cacheMaxY);

		if (dyo.monument.has_border) {

			if (this.overlayFrontDetail) {
				this.overlayFrontDetail.uncache();
			}
			if (this.overlayFrontDetail_2) {
				this.overlayFrontDetail_2.uncache();
			}
			if (this.overlayFrontDetail_3) {
				this.overlayFrontDetail_3.uncache();
			}
			if (this.overlayFrontDetail_4) {
				this.overlayFrontDetail_4.uncache();
			}

			this.removeFrom(this.containers["Overlay_Front_Detail"]);
			this.removeFrom(this.containers["Overlay_Front_Detail_2"]);
			this.removeFrom(this.containers["Overlay_Front_Detail_3"]);
			this.removeFrom(this.containers["Overlay_Front_Detail_4"]);

			this.containers["Overlay_Front_Detail"].removeAllChildren();
			this.containers["Overlay_Front_Detail_2"].removeAllChildren();
			this.containers["Overlay_Front_Detail_3"].removeAllChildren();
			this.containers["Overlay_Front_Detail_4"].removeAllChildren();

			this.overlayFrontDetail = new createjs.Shape();
			this.containers["Overlay_Front_Detail"].addChild(this.overlayFrontDetail);
			this.overlayFrontDetail.cache(this.cacheMinX, this.cacheMinY, this.cacheMaxX, this.cacheMaxY);

			this.overlayFrontDetail_2 = new createjs.Shape();
			this.containers["Overlay_Front_Detail_2"].addChild(this.overlayFrontDetail_2);
			this.overlayFrontDetail_2.cache(this.cacheMinX, this.cacheMinY, this.cacheMaxX, this.cacheMaxY);

			this.overlayFrontDetail_3 = new createjs.Shape();
			this.containers["Overlay_Front_Detail_3"].addChild(this.overlayFrontDetail_3);
			this.overlayFrontDetail_3.cache(this.cacheMinX, this.cacheMinY, this.cacheMaxX, this.cacheMaxY);

			this.overlayFrontDetail_4 = new createjs.Shape();
			this.containers["Overlay_Front_Detail_4"].addChild(this.overlayFrontDetail_4);
			this.overlayFrontDetail_4.cache(this.cacheMinX, this.cacheMinY, this.cacheMaxX, this.cacheMaxY);

		}

		if (dyo.monument.has_border) {
			this.getDrawing(this.border, "border", this.updateApplyTexture.bind(this));
		} else {
			this.updateApplyTexture();
		}

	}

	updateApplyTexture() {
		if (dyo.monument.id == 31) {
			this.applyColorTexture();
		}
		this.applyTexture();
	}

	applyColorTexture(section) {

		let _src;

		if (this.color_texture == undefined) {
			_src = dyo.xml_path + "data/jpg/glass_backings/m/01defaultred.jpg";
		} else {
			_src = dyo.xml_path + this.color_texture;
		}

		let texture = new Image();
		texture.crossOrigin = "Anonymous";
		texture.src = _src;

		texture.onerror = () => {
			console.log("Error");
			dyo.engine.loader.force = false;
			dyo.engine.loader.hide("Shape:939");
		}

		texture.onload = () => {

			let th = (dyo.dpr * dyo.h) / texture.height;

			let m = new createjs.Matrix2D();
			m.scale(th, th);
			m.translate(-(texture.height) / 2, -(texture.height) / 2);

			let repeat = "repeat";

			this.updateBorder();

		}

	}

	applyTexture(bmp) {

		if (dyo.lid2 > 0) {
			clearInterval(dyo.lid2);

			if (dyo.mode == "2d") {
				dyo.timeValue = 79;
				
				dyo.lid2 = setInterval(() => {
					dyo.timeValue ++;
					if (dyo.timeValue > 99) {
						dyo.timeValue = 99;
					}
					dyo.engine.loader.update("0" + dyo.timeValue);
				}, dyo.timeInterval);
			}
		}

		let self = this;

		if (this._bmp) {
			bmp = this._bmp;
		}

		if (bmp) {

			let texture = bmp;
			
			let container = this.containers["Texture"].getChildAt(0);
			container.graphics.clear();

			let m = new createjs.Matrix2D();
			m.scale((dyo.h * dyo.dpr) / texture.height, (dyo.h * dyo.dpr) / texture.height);
			m.translate(-texture.width / 2, -texture.height / 2);

			container.graphics
			.beginBitmapFill(texture, "no-repeat", m)
			.drawRect(-(dyo.dpr * dyo.w) / 2, -(dyo.dpr * dyo.h) / 2, (dyo.dpr * dyo.w), (dyo.dpr * dyo.h));

			this.containers["Texture"].filters = [
				new createjs.AlphaMaskFilter(this.shape.cacheCanvas)
			];

			if (this.containers["Texture"]) {
				this.containers["Texture"].uncache();
			}

			this.containers["Texture"].cache(this.cacheMinX, this.cacheMinY, this.cacheMaxX, this.cacheMaxY);

			if (this.overlayFront) {
				this.overlayFront.updateCache();
			}

			this.containers["Texture"].visible = true;

			this.update("shape: 880");

		} else {

			if (this.getTexture()) {

				let texture = new Image();
				texture.crossOrigin = "Anonymous";

				if (this.getTexture().indexOf("/upload/") > -1) {

					let o = this.getTexture().split("/");
					let i = o[o.length-4] + "/" + o[o.length-3] + "/" + o[o.length-2] + "/" + o[o.length-1];

					fetch(dyo.path.read_file + "../" + i, {
						method: 'POST'
					})
					.then(response => response.blob())
					.then(data => {
						var objectURL = URL.createObjectURL(data);
						texture.src = objectURL;
					});

				} else {

					texture.src = this.getTexture();

				}

				if (!dyo.engine.loader.force) {
					if (this.getTexture() != this.last_texture) {
						if (dyo.mode == "2d") {
							dyo.engine.loader.show("Shape:962");
						}
					}
				}

				texture.onerror = (e) => {
					console.log("Error loading...");
					dyo.engine.loader.force = false;
					dyo.engine.loader.hide("Shape:939");
				}

				texture.onload = () => {

					let container = this.containers["Texture"].getChildAt(0);
					let repeat = "no-repeat";
					container.graphics.clear();

					//console.log(this.containers["Texture"].parent.y);

					let m = new createjs.Matrix2D();
					let d = 1;

					if (dyo.monument._config.formula == "Bronze" || dyo.monument._config.formula == "Steel" || dyo.monument._config.formula == "Enamel") {
						if (texture.width > texture.height) {
							d = texture.width;
						} else {
							d = texture.height;
						}
						m.scale((dyo.dpr * dyo.h) / d, (dyo.dpr * dyo.h) / d);
					} else {
						repeat = "repeat";
						m.scale(0.75, 0.75);
					}
					m.translate(-texture.width / 2, -texture.height / 2);

					container.graphics
					.beginBitmapFill(texture, repeat, m)
					.drawRect(this.cacheMinX, this.cacheMinY, this.cacheMaxX, this.cacheMaxY);

					if (this.shape) {
						this.containers["Texture"].filters = [
							new createjs.AlphaMaskFilter(this.shape.cacheCanvas)
						];
					}
					
					this.containers["Texture"].cache(this.cacheMinX, this.cacheMinY, this.cacheMaxX, this.cacheMaxY);

					this.updateTexture();

					if (this.overlayFront) {
						this.overlayFront.updateCache();
					}

					this.containers["Texture"].visible = true;

					this.last_texture = this.getTexture();

					this.update("shape: 936");

					dyo.engine.loader.hide("Shape:971");

				}

			}

		}

		this._bmp = bmp;

	}

	// update texture
	updateTexture() {

		if (this.containers["Texture"].cacheCanvas) {
			this.containers["Texture"].updateCache();
		}

	}

	update(from) {

		if (this.shape) {
			let s = this.calcShape(0);
			if (s) {
				if (dyo.mode == "3d" && dyo.monument.id != 5 ||
					dyo.mode == "2d") {
					this.shape.graphics.clear();
					this.shape.graphics.f(this._color).s().p(s.code);
					this.shape.updateCache();
				}

				if (dyo.mode == "2d") {
					this.shape_outline.graphics.clear();
					this.shape_outline.graphics.s("#018786").ss(this.outlineSize).p(s.code).closePath();
					this.shape_outline.updateCache();
				}
			}

		}

		if (this.overlayFront) {
			this.overlayFront.graphics.clear();

			if (this.type == 'Headstone') {

				if (this.border != 'No Border' && dyo.monument.has_border) {

					let s = this.calcShape(1);

					if (s) {

						switch (dyo.monument._config.formula) {
							case "Steel":

								switch (dyo.monument.id) {
									case 31:
										if (this.border == "Raised - No Pattern") {
											let borderSize = 18 * dyo.monument.getRatio();

											this.overlayFront.graphics
											.setStrokeStyle(borderSize)
											.beginStroke("#cccccc")
											.drawRect(this.minX + borderSize / 2, this.minY + borderSize / 2, (this.maxX * 2) - borderSize, (this.maxY * 2) - borderSize);

											let scaleX = (dyo.monument.headstone.pixels.width - (borderSize / 2)) / dyo.monument.headstone.pixels.width;
											let scaleY = (dyo.monument.headstone.pixels.height - (borderSize / 2)) / dyo.monument.headstone.pixels.height;

											this.containers["Texture"].scaleX = scaleX;
											this.containers["Texture"].scaleY = scaleY;
										} 
										break;
									default:
										if (dyo.borderId != "plaques_no_border") {
											this.overlayFront.graphics
											.rf(["#eeeeee","#bbbbbb"],[0,1],-150,-150,0,0,0,750)
											.s("#000000").ss(1)
											.p(s.code).closePath();
										}
								}

								if (dyo.monument.id == 31) {

									if (!dyo.borderNoDetail) {
										this.detail_top = undefined;
										this.detail_bottom = undefined;
										this.detail_left = undefined;
										this.detail_right = undefined;
								
										this.detailTopCached = false;
										this.detailBottomCached = false;
										this.detailLeftCached = false;
										this.detailRightCached = false;
									}

									switch (dyo.borderId) {
										case "plaques_raised_-_no_pattern":
											this.overlayFrontDetail.visible = false;
											this.overlayFrontDetail_2.visible = false;
											this.overlayFrontDetail_3.visible = false;
											this.overlayFrontDetail_4.visible = false;
											break;
										case "plaques_flush":
											this.overlayFrontDetail.visible = true;
											this.overlayFrontDetail_2.visible = true;
											this.overlayFrontDetail_3.visible = true;
											this.overlayFrontDetail_4.visible = true;
											s.code = "";
											break;
										case "plaques_raised":
											this.overlayFrontDetail.visible = true;
											this.overlayFrontDetail_2.visible = true;
											this.overlayFrontDetail_3.visible = true;
											this.overlayFrontDetail_4.visible = true;
											break;	
									}
								}

								break;
							case "Bronze":
								this.overlayFront.graphics.rf(["#ffd55a","#ffb35a"],[0,1],0,0,0,0,0,500).s().p(s.code);
								break;
							case "Engraved":
								if (this.border != 0) {
									this.overlayFront.graphics.rf(["#ffd55a","#ffb35a"],[0,1],0,0,0,0,0,500).s().p(s.code);
								}
								break;
							case "Laser":
								if (this.border != 0) {
									this.overlayFront.graphics.rf(["#cccccc","#aaaaaa"],[0,1],0,0,0,0,0,10).s().p(s.code);
								}
								break;
							case "Enamel":
								switch (dyo.monument.getProductType()) {
									default:
										switch (dyo.monument.id) {
											case 32:
												if (this.border == "Border 4") {
													let borderSize = 15 * dyo.monument.getRatio();

													this.overlayFront.graphics
													.setStrokeStyle(borderSize)
													.beginStroke("#cccccc")
													.drawRect(this.minX + borderSize / 2, this.minY + borderSize / 2, (this.maxX * 2) - borderSize, (this.maxY * 2) - borderSize);

													let scaleX = (dyo.monument.headstone.pixels.width - (borderSize / 2)) / dyo.monument.headstone.pixels.width;
													let scaleY = (dyo.monument.headstone.pixels.height - (borderSize / 2)) / dyo.monument.headstone.pixels.height;

													this.containers["Texture"].scaleX = scaleX;
													this.containers["Texture"].scaleY = scaleY;
												} 
												break;
											default:
												this.overlayFront.graphics
												.rf(["#ffffff","#cccccc"],[0,1],0,0,0,0,0,500).s().p(s.code);
												break;
										}
										break;
									case "urns":
										this.backlayFront.graphics.clear();

										if (this.name == "Urn Heart") {
											s.code = "EgAWBCgQgWAAgWgWIgsgWIAAAAQhthBiDiCIAAAAIjEiuIAAAAQn2nmpjo0QwBvQpjvQQsRy/htyTIAAAAQhBtOEbqgQFHsjMRkEIAAAAQNSkzM9HKQJ4FFIhK2QIhq2J4lFQM9nKNoEzQL7EEFdMjIAAAAQEGKghBNOQhtSTr7S/Qp4PQwBPQQohIJo3IRIAAAAIjECuIAAAAQiDCChtBBIAAAAIgsAWQgWAWgWAAEgAWA/HIAWAAIAAAAIAAAAIAAAAIAAAAEgAAA/HIAAAAIAAAAIAAAAEgAAA/HIAAAAIAAAAIAAAAIAAAAIAAAAIAAAAIAAAAIAAAAEgAAA+xQBXgrBthsIAAAAIDEjMIAAAAQI3nzIhoJQQBu6JNu6QL7yTBXxSIAAAAQBBsjkGp1IAAAAQkbrMq6jvQr7kDrlGbQp4FFo3L3QgWAWgWAAQAWAWhXgWQgsAAgWgrQohrip4lFQr7mbr7EDIAAAAQq6DvkbLMQkGJ1BBMjIAAAAQBtRSLlSTQJjO6PrO6QJjI0H2HIIAAAAIDEDMIAAAAQBtBsBXAr";
										}

										switch (this.name) {
											default:
												// **************************
												// Commands for drawing stand
												// **************************
												let _x, _y, _w, _h, use;

												if (dyo.w > dyo.h) {
													use = dyo.h;
												} else {
													use = dyo.w;
												}

												_x = -use / 3;
												if (dyo.w < dyo.h) {
													_y = dyo.h / 2 - dyo.h / 4;
												} else {
													_y = dyo.h / 2 - dyo.h / 8;
												}
												_w = use / 1.5;
												_h = dyo.h / 8;

												this.backlayFront.graphics
												.rf(["#ffffff","#cccccc"],[0,1],0,300,0,0,0,500)
												.drawEllipse(_x, _y, _w, _h)
												.rf(["#999999","#eeeeee"],[0,1],0,300,0,0,0,500)
												.drawEllipse(_x + 5, _y - 15, _w - 10, _h)

												if (dyo.w > dyo.h) {
													this.backlayFront.graphics
													.s("#dddddd").ss(3)
													.moveTo(_x + 4, _y + 40)
													.lineTo(_x + 4, _y + 55)
													.moveTo(_x + _w - 4, _y + 40)
													.lineTo(_x + _w - 4, _y + 55)
												}
												this.backlayFront.graphics
												.rf(["#eeeeee","#999999"],[0,1],0,0,0,0,0,500).s().p(s.code);
												break;	
											case "Rectangle": case "Triangle":
												this.backlayFront.graphics
												.rf(["#ffffff","#cccccc"],[0,1],0,0,0,0,0,500).s().p(s.code);	
												break;
										}
										
									break;
								}		

						}

					}

				} else {

					if (dyo.monument.id == 31 || dyo.monument.id == 32) {
						this.containers["Texture"].scaleX = 1;
						this.containers["Texture"].scaleY = 1;
					}

					if (dyo.monument.installationMethod == 3) {
	
						switch (dyo.monument._config.formula) {
							case "Laser":
								let height = ((dyo.monument.headstone.maxY * 2) / 3);
		
								this.overlayFront.graphics
								.f("#666666")
								.drawRect(this.minX, this.maxY - height, this.maxX * 2, height);
		
								break;
						}
	
					}

					if (this.type == "Base") {

						switch (dyo.monument._config.formula) {
							case "Laser":
								let height = ((dyo.monument.base.maxY * 2) / 2);

								this.overlayFront.graphics
								.f("#666666")
								.drawRect(this.minX, -this.maxY, this.maxX * 2, -this.maxY + height);
		
								break;
						}

					}
	
				}

			}

			this.overlayFront.updateCache();

			switch (dyo.monument._config.formula) {
				case "Enamel":
					switch (dyo.monument.getProductType()) {
						case "urns":
							this.backlayFront.updateCache();
							break
					}
				break;
			}

		}

		switch (dyo.mode) {
			case "2d":
				this.updateTexture();
				break;
		}

		this.updateBorder();

	}

	launchDesign() {

		this.setRatio4();

		clearInterval(dyo.lid2);
		dyo.lid2 = 0;

		if (dyo.mode == "2d") {
			dyo.engine.loader.hidePercent();
		} else {
            dyo.lid2 = setInterval(() => {
                dyo.timeValue ++;
                if (dyo.timeValue > 99) {
                    dyo.timeValue = 99;
                }
                dyo.engine.loader.update("0" + dyo.timeValue);
            }, dyo.timeInterval * 2);
		}

		if (this.getTexture() != this.last_texture) {

			if (dyo.edit == false) {
				
				if (dyo.mode == "2d") {
					if (dyo.currentSection != "Account") {
						dyo.engine.loader.force = false;
					}
				}

				if (dyo.currentSection != "Account") {
					if (dyo.monument_design_stampid == undefined) {
						dyo.engine.canvas.show();
					}
				}

				if (dyo.monument_design_stampid != undefined) {
					dyo.monument.design_stampid = dyo.monument_design_stampid;
					dyo.monument_design_stampid = undefined;

					dyo.engine.canvas.hide();

					dyo.design.cache.DesignList = [
						{ 
							design_stampid: dyo.monument.design_stampid
						}
					]

					dyo.design.cacheDesigns(true);

				} 

			} else {

				setTimeout(() => {
					dyo.design.getElements();
				}, 1500);

				if (dyo.monument.has_border) {
					dyo.monument.showBorder();
				}

			}
			
			if (dyo.mode != "3d") {
				dyo.engine.loader.hide("Shape:971");
			}

		}

		dyo.engine.canvas.resize(true);

	}

	copyPixels(bmp, x, y, w, h) {
		let b = new createjs.Bitmap(bmp);
		b.cache(x, y, w, h);

		return b.cacheCanvas;
	}

	drawBitmap(command, color, w, h) {

		let shape = new createjs.Shape();

		shape.graphics
		.f(color)
		.p(command);

		shape.cache(-w / 2, -h / 2, w, h * 1.15);

		return shape.cacheCanvas;
	}

	updateBorder() {

		let bmp, m, detail, scale;
		let w, h;
		let color = dyo.config._config["default-color"];

		if (this.border) {
			switch (this.border) {
				case "Border 8":

					w = 25;
					h = 25;

					scale = this.width / this.height;

					if (dyo.engine.mobileDevice) {

						if (this.width > this.height) {
							switch (dyo.engine.deviceType) {
								default:

									if (window.matchMedia("(orientation: portrait)").matches) {
										scale = (window.screen.width / window.screen.height) * dyo.dpr;
									} else {
										if (dyo.dpr < 3) {
											scale = (window.screen.width / window.screen.height) / (dyo.dpr);
										} else {
											scale = (window.screen.width / window.screen.height) / (dyo.dpr / 2);
										}
									}

									break;
								case "tablet":

									if (window.matchMedia("(orientation: portrait)").matches) {

										if ((window.screen.width * dyo.dpr) > 2000) {
											scale = (window.screen.width / window.screen.height) * (dyo.dpr * 2);
										} else {
											scale = (window.screen.width / window.screen.height) * (dyo.dpr);
										}

									} else {

										if ((window.screen.height * dyo.dpr) > 2000) {
											scale = (window.screen.width / window.screen.height) * (dyo.dpr);
										} else {
											scale = (window.screen.width / window.screen.height);
										}

									}

									break;
							}
						} else {
							switch (dyo.engine.deviceType) {
								default:
									scale = (this.width  / this.height) * (dyo.dpr / 2);
									break;
								case "tablet":
									scale = (this.width  / this.height) * (dyo.dpr);
									break;
							}
						}
	
					} else {

						let canvas = $('#canvas');

						if (this.width > this.height) {
							scale = dyo.dpr;

							if (canvas.height > canvas.width) {

								if ((window.screen.width * dyo.dpr) > 2000) {
									scale = (canvas.width / canvas.height) * (dyo.dpr * 2) * (canvas.width / canvas.height);
								} else {
									scale = (canvas.width / canvas.height) * (dyo.dpr) * (canvas.width / canvas.height);
								}

							} else {

								if ((window.screen.height * dyo.dpr) > 2000) {
									scale = (canvas.width / canvas.height) * (dyo.dpr) * (canvas.height / canvas.width);
								} else {
									scale = (canvas.width / canvas.height) * (dyo.dpr) * (canvas.height / canvas.width);
								}

							}

						} else {
							scale = dyo.dpr;

							if (canvas.height > canvas.width) {

								if ((window.screen.width * dyo.dpr) > 2000) {
									scale = (this.width / this.height) * (dyo.dpr * 2) * (canvas.width / canvas.height);
								} else {
									scale = (this.width / this.height) * (dyo.dpr) * (canvas.width / canvas.height);
								}

							} else {

								if ((window.screen.height * dyo.dpr) > 2000) {
									scale = (this.width / this.height) * (dyo.dpr * 2);
								} else {
									scale = (this.width / this.height) * (dyo.dpr);
								}

							}

						}

					}
					
					this.detail_top = this.cache["detail_top"];

					if (this.detail_top) {

						this.overlayFrontDetail.x = 0;
						this.overlayFrontDetail.y = -this.maxY;
						this.overlayFrontDetail.scaleX = scale;
						this.overlayFrontDetail.scaleY = scale;

						let m = new createjs.Matrix2D();
						m.translate(13, 0);

						this.overlayFrontDetail.graphics.clear()
						.beginBitmapFill(this.drawBitmap(this.detail_top, color, w, h), "repeat", m)
						.drawRect(-this.maxX / scale, 0, (this.maxX * 2) / scale, h);

						this.overlayFrontDetail.cache(-this.maxX / scale, 0, (this.maxX * 2) / scale, h);

					}

					this.detail_bottom = this.cache["detail_bottom"];

					if (this.detail_bottom) {

						this.overlayFrontDetail_2.x = 0;
						this.overlayFrontDetail_2.y = this.maxY - h * scale;
						this.overlayFrontDetail_2.scaleX = scale;
						this.overlayFrontDetail_2.scaleY = scale;

						let m = new createjs.Matrix2D();
						m.translate(13, 0);

						this.overlayFrontDetail_2.graphics.clear()
						.beginBitmapFill(this.drawBitmap(this.detail_bottom, color, w, h), "repeat", m)
						.drawRect(-this.maxX / scale, 0, (this.maxX * 2) / scale, h);

						this.overlayFrontDetail_2.cache(-this.maxX / scale, 0, (this.maxX * 2) / scale, h);

					}

					this.detail_left = this.cache["detail_left"];

					if (this.detail_left) {

						this.overlayFrontDetail_3.x = -this.maxX;
						this.overlayFrontDetail_3.y = 0;
						this.overlayFrontDetail_3.scaleX = scale;
						this.overlayFrontDetail_3.scaleY = scale;

						this.overlayFrontDetail_3.graphics.clear()
						.beginBitmapFill(this.drawBitmap(this.detail_left, color, w, h), "repeat")
						.drawRect(0, -this.maxY / scale + h, w, (this.maxY * 2) / scale - h * 2);

						this.overlayFrontDetail_3.cache(0, -this.maxY / scale + h, w, (this.maxY * 2) / scale - h * 2);

					}

					this.detail_right = this.cache["detail_right"]

					if (this.detail_right) {

						this.overlayFrontDetail_4.x = this.maxX - w * scale;
						this.overlayFrontDetail_4.y = 0;
						this.overlayFrontDetail_4.scaleX = scale;
						this.overlayFrontDetail_4.scaleY = scale;

						this.overlayFrontDetail_4.graphics.clear()
						.beginBitmapFill(this.drawBitmap(this.detail_right, color, w, h), "repeat")
						.drawRect(0, -this.maxY / scale + h, w, (this.maxY * 2) / scale - h * 2);

						this.overlayFrontDetail_4.cache(0, -this.maxY / scale + h, w, (this.maxY * 2) / scale - h * 2);

					}

					break;

				case "Border 9":

					w = 75;
					h = 30;

					scale = this.width / this.height;

					if (dyo.engine.mobileDevice) {
						
						if (this.width > this.height) {

							switch (dyo.engine.deviceType) {
								case "mobile":

									if (window.matchMedia("(orientation: portrait)").matches) {
										scale = (window.screen.width / window.screen.height) * dyo.dpr;
									} else {
										if (dyo.dpr < 3) {
											scale = (window.screen.width / window.screen.height) / (dyo.dpr);
										} else {
											scale = 0.25 + (window.screen.width / window.screen.height) / (dyo.dpr / 2);
										}
									}

									break;
								case "tablet":

									if (window.matchMedia("(orientation: portrait)").matches) {

										if ((window.screen.width * dyo.dpr) > 2000) {
											scale = (window.screen.width / window.screen.height) * (dyo.dpr * 2);
										} else {
											scale = 0.25 + (window.screen.width / window.screen.height) * (dyo.dpr);
										}

									} else {

										if ((window.screen.height * dyo.dpr) > 2000) {
											scale = (window.screen.width / window.screen.height) * (dyo.dpr);
										} else {
											scale = 0.25 + (window.screen.height / window.screen.width) * dyo.dpr
										}

									}

									break;
							}

						} else {

							switch (dyo.engine.deviceType) {

								default:
									scale = (this.width  / this.height) * (dyo.dpr / 2);
									break;

								case "mobile":

									if (window.matchMedia("(orientation: portrait)").matches) {
										scale = 0.25 + (window.screen.width / window.screen.height) * (dyo.dpr / 2);
									} else {
										if (dyo.dpr < 3) {
											scale = (window.screen.width / window.screen.height) / (dyo.dpr);
										} else {
											scale = 0.25 + (window.screen.width / window.screen.height) / (dyo.dpr / 2);
										}
									}

									break;

								case "tablet":

									if (window.matchMedia("(orientation: portrait)").matches) {

										if ((window.screen.width * dyo.dpr) > 2000) {
											scale = (window.screen.width / window.screen.height) * (dyo.dpr * 2);
										} else {
											scale = 0.25 + (window.screen.width / window.screen.height) * (dyo.dpr);
										}

									} else {

										if ((window.screen.height * dyo.dpr) > 2000) {
											scale = (window.screen.width / window.screen.height) * (dyo.dpr);
										} else {
											scale = (window.screen.height / window.screen.width) * (dyo.dpr) / (this.height / this.width);
										}

									}

									break;

							}

						}
	
					} else {

						let canvas = $('#canvas');

						if (this.width > this.height) {
							scale = dyo.dpr;

							if (canvas.height > canvas.width) {

								if ((window.screen.width * dyo.dpr) > 2000) {
									scale = (canvas.width / canvas.height) * (dyo.dpr) * (canvas.width / canvas.height);
								} else {
									scale = (canvas.width / canvas.height) * (dyo.dpr) * (canvas.width / canvas.height);
									if (canvas.width < 800) {
										scale = canvas.width / 800;
									}
								}

							} else {

								if ((window.screen.height * dyo.dpr) > 2000) {
									scale = (canvas.width / canvas.height) * (dyo.dpr) * (canvas.height / canvas.width);

									scale = dyo.dpr;
									

								} else {
									scale = (canvas.width / canvas.height) * (dyo.dpr) * (canvas.height / canvas.width);
									if (canvas.height < 800) {
										scale = canvas.height / 800;
									}

								}

							}

						} else {

							scale = dyo.dpr;

							if (canvas.height > canvas.width) {

								if ((window.screen.width * dyo.dpr) > 2000) {
									scale = (this.width / this.height) * (dyo.dpr * 2) * (canvas.width / canvas.height);
								} else {
									//scale = (canvas.height / canvas.width) * (dyo.dpr) * (canvas.width / canvas.height);
									scale = (this.width / this.height) / 2;
								}

							} else {

								if ((window.screen.height * dyo.dpr) > 2000) {
									scale = (this.width / this.height) * (dyo.dpr);
									//scale = (canvas.height / canvas.width) * (dyo.dpr);// * (canvas.width / canvas.height);

								} else {
									//scale = (this.width / this.height) * dyo.dpr;
									scale = (this.height / this.width) / 2;
									scale = (canvas.width / canvas.height) * (dyo.dpr) * (canvas.height / canvas.width);

									scale = (this.width / this.height) * 0.8;
									console.log(scale)

									//if (canvas.height < 800) {
									//	scale = canvas.height / 900;
									//}
								}

							}

						}

					}

					this.detail_top = this.cache["detail_top"];

					if (this.detail_top) {

						this.overlayFrontDetail.x = 0;
						this.overlayFrontDetail.y = -this.maxY;
						this.overlayFrontDetail.scaleX = scale;
						this.overlayFrontDetail.scaleY = scale;

						let m = new createjs.Matrix2D();
						m.translate(13, 0);

						this.overlayFrontDetail.graphics.clear()
						.beginBitmapFill(this.drawBitmap(this.detail_top, color, w, h), "repeat", m)
						.drawRect(-this.maxX / scale, 0, (this.maxX * 2) / scale, h);

						this.overlayFrontDetail.cache(-this.maxX / scale, 0, (this.maxX * 2) / scale, h);

					}

					this.detail_bottom = this.cache["detail_bottom"];

					if (this.detail_bottom) {

						this.overlayFrontDetail_2.x = 0;
						this.overlayFrontDetail_2.y = this.maxY - h * scale;
						this.overlayFrontDetail_2.scaleX = scale;
						this.overlayFrontDetail_2.scaleY = scale;

						let m = new createjs.Matrix2D();
						m.translate(13, 0);

						this.overlayFrontDetail_2.graphics.clear()
						.beginBitmapFill(this.drawBitmap(this.detail_bottom, color, w, h), "repeat", m)
						.drawRect(-this.maxX / scale, 0, (this.maxX * 2) / scale, h);

						this.overlayFrontDetail_2.cache(-this.maxX / scale, 0, (this.maxX * 2) / scale, h);

					}

					w = 18;
					h = 68;

					this.detail_left = this.cache["detail_left"];

					if (this.detail_left) {

						this.overlayFrontDetail_3.x = -this.maxX + w / 2.5 * scale;
						this.overlayFrontDetail_3.y = 0;
						this.overlayFrontDetail_3.scaleX = scale;
						this.overlayFrontDetail_3.scaleY = scale;

						this.overlayFrontDetail_3.graphics.clear()
						.beginBitmapFill(this.drawBitmap(this.detail_left, color, w, h), "repeat")
						.drawRect(0, -this.maxY / scale + (this.maxY / 10), w, (this.maxY * 2) / scale - (this.maxY / 10) * 2);

						this.overlayFrontDetail_3.cache(0, -this.maxY / scale + (this.maxY / 10), w, (this.maxY * 2) / scale - (this.maxY / 10) * 2);

					}

					this.detail_right = this.cache["detail_right"];

					if (this.detail_right) {

						this.overlayFrontDetail_4.x = this.maxX - (w + w / 2.75) * scale;
						this.overlayFrontDetail_4.y = 0;
						this.overlayFrontDetail_4.scaleX = scale;
						this.overlayFrontDetail_4.scaleY = scale;

						this.overlayFrontDetail_4.graphics.clear()
						.beginBitmapFill(this.drawBitmap(this.detail_right, color, w, h), "repeat")
						.drawRect(0, -this.maxY / scale + (this.maxY / 10), w, (this.maxY * 2) / scale - (this.maxY / 10) * 2);

						this.overlayFrontDetail_4.cache(0, -this.maxY / scale + (this.maxY / 10), w, (this.maxY * 2) / scale - (this.maxY / 10) * 2);

					}

					break;

				case "Border 11": case "Border 12": case "Border 13": case "Flush": case "Raised":

					color = this._borderColor;
					w = 40.5;
					h = 39.2;

					scale = this.width / this.height;

					if (dyo.engine.mobileDevice) {

						if (this.width > this.height) {
							scale = 1;
						} else {
							scale = this.width / this.height;
						}
	
						if (dyo.h > dyo.w) {
							scale = (scale / (this.width / dyo.w * dyo.dpr));
							scale = (scale / 1 * (870 / dyo.h * dyo.dpr));
						} else {
							scale = (scale / (this.height / dyo.h * dyo.dpr));
							scale = (scale / 1 * (870 / dyo.h * dyo.dpr)) / 2;
						}

					} else {

						if (this.width > this.height) {
							scale = 1;
						} else {
							scale = (this.width / this.height);
						}

						scale = scale / dyo.dpr;

					}

					if (this.detail_top == undefined) {
						this.detail_top = this.cache["detail_top"];
					}

					if (this.detail_top) {

						this.overlayFrontDetail.x = 0;
						this.overlayFrontDetail.y = -this.maxY;
						this.overlayFrontDetail.scaleX = scale;
						this.overlayFrontDetail.scaleY = scale;

						let m = new createjs.Matrix2D();
						m.translate(-13, 0);

						this.overlayFrontDetail.graphics.clear()
						.beginBitmapFill(this.drawBitmap(this.detail_top, color, w, h), "repeat", m)
						.drawRect(-this.maxX / scale + 10, 0, -w / 2 + (this.maxX * 2) / scale, h);

						this.overlayFrontDetail.cache(-this.maxX / scale, 0, (this.maxX * 2) / scale, h);

					}

					if (this.detail_bottom == undefined) {
						this.detail_bottom = this.cache["detail_bottom"];
					}

					if (this.detail_bottom) {

						this.overlayFrontDetail_2.x = 0;
						this.overlayFrontDetail_2.y = this.maxY - (h / 1.1) * scale;
						this.overlayFrontDetail_2.scaleX = scale;
						this.overlayFrontDetail_2.scaleY = scale;

						let m = new createjs.Matrix2D();
						m.translate(-10, 0);

						this.overlayFrontDetail_2.graphics.clear()
						.beginBitmapFill(this.drawBitmap(this.detail_bottom, color, w, h), "repeat", m)
						.drawRect(-this.maxX / scale + 10, 0, -w / 2 + (this.maxX * 2) / scale, h);

						this.overlayFrontDetail_2.cache(-this.maxX / scale, 0, -w / 2 + (this.maxX * 2) / scale, h);

					}

					if (this.detail_left == undefined) {
						this.detail_left = this.cache["detail_left"];
					}

					if (this.detail_left) {

						this.overlayFrontDetail_3.x = -this.maxX;
						this.overlayFrontDetail_3.y = 0;
						this.overlayFrontDetail_3.scaleX = scale;
						this.overlayFrontDetail_3.scaleY = scale;

						let m = new createjs.Matrix2D();
						m.translate(2, -5);

						this.overlayFrontDetail_3.graphics.clear()
						.beginBitmapFill(this.drawBitmap(this.detail_left, color, w, h), "repeat", m)
						.drawRect(10, -this.maxY / scale + h * 1.5, w, (this.maxY * 2) / scale - h * 2.5);

						this.overlayFrontDetail_3.cache(0, -this.maxY / scale + h, w, (this.maxY * 2) / scale - h * 2);

					}

					if (this.detail_right == undefined) {
						this.detail_right = this.cache["detail_right"]
					}

					if (this.detail_right) {

						this.overlayFrontDetail_4.x = this.maxX - w * scale;
						this.overlayFrontDetail_4.y = 0;
						this.overlayFrontDetail_4.scaleX = scale;
						this.overlayFrontDetail_4.scaleY = scale;

						let m = new createjs.Matrix2D();
						m.translate(-2, -5);

						this.overlayFrontDetail_4.graphics.clear()
						.beginBitmapFill(this.drawBitmap(this.detail_right, color, w, h), "repeat", m)
						.drawRect(0, -this.maxY / scale + h * 1.5, w, (this.maxY * 2) / scale - h * 2.5);

						this.overlayFrontDetail_4.cache(0, -this.maxY / scale + h, w, (this.maxY * 2) / scale - h * 2);

					}
				break;

			}

			if (dyo.mode == "3d") {
				dyo.controller_Width.setValue(dyo.controller_Width.getValue());
			}

		}

		this.containers["Overlay_Front_Detail"].visible = true;
		this.containers["Overlay_Front_Detail_2"].visible = true;
		this.containers["Overlay_Front_Detail_3"].visible = true;
		this.containers["Overlay_Front_Detail_4"].visible = true;

	}

	setMinMax() {

	}
	
	_select() {
		
		dyo.target = this;
		this.selected = true;

		if (dyo.mode == "2d") {
			dyo.engine.sizes.slider_width.slider.min = 1;
			dyo.engine.sizes.slider_width.slider.max = 2;
			dyo.engine.sizes.slider_height.slider.min = 1;
			dyo.engine.sizes.slider_height.slider.max = 2;
			dyo.engine.sizes.slider_length.slider.min = 1;
			dyo.engine.sizes.slider_length.slider.max = 2;

			if (this.type == "Headstone") {
				if (this.getMinWidth() > this.getMaxWidth()) {
					if (this.fixed == 4) {
						console.log(this.fixed);
						//dyo.engine.sizes.slider_width.slider.min = this.getMaxWidth();
						//dyo.engine.sizes.slider_width.slider.max = this.getMinWidth();
					}
				} else {
					dyo.engine.sizes.slider_width.slider.max = this.getMaxWidth();
					dyo.engine.sizes.slider_width.slider.min = this.getMinWidth();
				}
			}
			
			if (this.getMinHeight() > 0) {
				dyo.engine.sizes.slider_height.slider.max = this.getMaxHeight();
				dyo.engine.sizes.slider_height.slider.min = this.getMinHeight();
			}
			
			if (this.getMinLength() != 0) {
				dyo.engine.sizes.slider_length.slider.max = this.getMaxLength();
				dyo.engine.sizes.slider_length.slider.min = this.getMinLength();
			}

			if (dyo.controller_Width) {
				dyo.controller_Width.setValue(this.getWidth());
				dyo.controller_Height.setValue(this.getHeight());
			}

			if (this.shape_outline) {
				this.shape_outline.visible = true;
				dyo.engine.sizes.show();
			}

		}

		if (dyo.mode == "2d") {
			dyo.monument.updateHeader("Shape: 1686");
		}

	}

	fadeIn() {
		this._stage.visible = true;
		createjs.Tween.get(this._stage)
		.wait(100)
		.to({alpha:1, visible:true}, 1000)
		.call(this.handleComplete);
	}

	fadeOut() {
		createjs.Tween.get(this._stage)
		.wait(100)
		.to({alpha:0, visible:false}, 1000)
		.call(this.handleComplete);
	}

	handleComplete() {
		console.log("complete");
	}
	
	deselect(from) {
		this.selected = false;
		
		if (this.shape_outline) {
			this.shape_outline.visible = false;
		}
	}
	
	moveTo(x, y) {
		this.last.x = x;
		this.last.y = y;
		this.posX.push(x);
		this.posY.push(y);
		this.stack.push({c: 'moveTo', x: x, y: y});
	}

	lineTo(x, y) {
		this.last.x = x;
		this.last.y = y;
		this.posX.push(x);
		this.posY.push(y);			
		this.stack.push({c: 'lineTo', x: x, y: y});
	}

	quadraticCurveTo(cpx, cpy, x, y) {
		this.last.x = x;
		this.last.y = y;
		this.posX.push(x);
		this.posY.push(y);
		this.stack.push({c: 'quadraticCurveTo', x: x, y: y, cpx: cpx, cpy: cpy});
	}

	bezierCurveTo(cp1x, cp1y, cp2x, cp2y, x, y) {
		this.last.x = x;
		this.last.y = y;
		this.posX.push(x);
		this.posY.push(y);
		this.stack.push({c: 'bezierCurveTo', x: x, y: y, cp1x: cp1x, cp1y: cp1y, cp2x: cp2x, cp2y: cp2y });
	}

	closePath() {}

	decodePath(path, type) {

		if (path) {

			this.stack = [];
			
			this.p = {};
			this.posX = [];
			this.posY = [];

			let str = path;
			let instructions = [this.moveTo, this.lineTo, this.quadraticCurveTo, this.bezierCurveTo, this.closePath];
			let instructionsNames = ["moveTo", "lineTo", "quadraticCurveTo", "bezierCurveTo", "closePath"];
			let paramCount = [2, 2, 4, 6, 0];
			let i=0, l=str.length;
			let params = [];
			let x=0, y=0;
			let base64 = {"A":0,"B":1,"C":2,"D":3,"E":4,"F":5,"G":6,"H":7,"I":8,"J":9,"K":10,"L":11,"M":12,"N":13,"O":14,"P":15,"Q":16,"R":17,"S":18,"T":19,"U":20,"V":21,"W":22,"X":23,"Y":24,"Z":25,"a":26,"b":27,"c":28,"d":29,"e":30,"f":31,"g":32,"h":33,"i":34,"j":35,"k":36,"l":37,"m":38,"n":39,"o":40,"p":41,"q":42,"r":43,"s":44,"t":45,"u":46,"v":47,"w":48,"x":49,"y":50,"z":51,"0":52,"1":53,"2":54,"3":55,"4":56,"5":57,"6":58,"7":59,"8":60,"9":61,"+":62,"/":63};

			while (i<l) {
				let c = str.charAt(i);
				let n = base64[c];
				let fi = n>>3; // highest order bits 1-3 code for operation.
				let f = instructions[fi];

				// check that we have a valid instruction & that the unused bits are empty:
				if (!f || (n&3)) { throw("bad path data (@"+i+"): "+c); }
				let pl = paramCount[fi];
				if (!fi) { x=y=0; } // move operations reset the position.
				params.length = 0;
				i++;
				let charCount = (n>>2&1)+2;  // 4th header bit indicates number size for this operation.
				for (let p=0; p<pl; p++) {
					let num = base64[str.charAt(i)];
					let sign = (num>>5) ? -1 : 1;
					num = ((num&31)<<6)|(base64[str.charAt(i+1)]);
					if (charCount == 3) { num = (num<<6)|(base64[str.charAt(i+2)]); }
					num = sign*num/10;
					if (p%2) { x = (num += x); }
					else { y = (num += y); }
					params[p] = num;
					i += charCount;
				}

				for (let nr = 0; nr < params.length; nr++) {
					params[nr] = Math.round(params[nr]);
				}

				f.apply(this, params);

			}

			this.p.left = Math.min.apply(null, this.posX);
			this.p.top = Math.min.apply(null, this.posY);
			this.p.right = Math.max.apply(null, this.posX);
			this.p.bottom = Math.max.apply(null, this.posY);

			if (type == "main") {
				this.stackId[0] = this.stack;
			}

			if (type == "border") {
				this.stackId[1] = this.stack;
			}

			return this.stack;

		}
		
	}
	
}