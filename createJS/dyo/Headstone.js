import {Shape} from './Shape.js';
import {EncodePath} from './EncodePath.js';

export class Headstone extends Shape {
	constructor(...args) {
        super(...args);
		this._data = [];

		this.itemID = dyo.monument.getItemID();
	}

    get type() {
        return this._type;
    }

    get data() {
        return this._data;
    }
	
    add(data = {}) {

        if (data.type == "Photo") {
            data.parent = this;
            data.render();
        }

		if (data.type == "Border") {
            data.parent = this;
            data.render();
		}

		if (data.type == "Stand") {
            data.parent = this;
            data.render();
		}

        if (data.type == "Inscription") {
            data.parent = this;
            data.render();
        }

        if (data.type == "Motif") {
            data.parent = this;
            data.render();
		}
		
		if (data.type == "Emblem") {
            data.parent = this;
            data.render();
        }

        this._data.push(data);
	}

	remove(type) {
		for (let nr = 0; nr < this._data.length; nr++) {
			if (this._data[nr]) {
				if (this._data[nr].type == type) {
					this._data.splice(nr, 1);
				}
			}
		}
	}
	
	addBorder(bitmap) {

		let self = this;

        // if 3d available
        if (dyo.mode == "3d") {

			if (dyo.engine.engineStarted) {

				this.inst3d = new Engine3D.Model3D("models/motif-container.m3d");
				dyo.engine3d.inst3d = this.inst3d;

				this.inst3d.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {
				
					dyo.engine3d.currentModel = dyo.engine3d.headstone3d;
					dyo.engine3d.currentModel.addChild(self.inst3d);
					self.inst3d.setInteractive(false);
					dyo.borderLoaded = true;

					var object = new Engine3D.values.DisplayObjectValue(bitmap);
					object.setEmbedType(Engine3D.enums.EmbedType.EMBEDDED);

					self.inst3d.extra = { id: self.itemID, border: dyo.monument.headstone.getBorder() }

					self.inst3d.changeProperty("display_object", object);
					self.inst3d.changeProperty("width", dyo.data.width);
					self.inst3d.changeProperty("height", dyo.data.height);

					Engine3D.Controller.getCurrentProject().setSelectedModel(dyo.engine3d.headstone3d);

					let Headstone = dyo.monument.getPartByType('Headstone');
					Headstone.renderOverlay();		

				});

			}

		}

	}

	removeBorder() {

		let self = this;
		if (dyo.engine.engineStarted) {
			if (this.inst3d) {
				dyo.borderLoaded = false;
				dyo.engine3d.currentModel.removeChild(self.inst3d);
			}
		}
		
	}

	removeGround() {
		let self = this;
		if (dyo.engine.engineStarted) {
			if (this.inst3d) {
				dyo.engine3d.currentModel.removeChild(self.inst3d);
			}
		}
	}

	copyPixels(bmp, x, y, w, h) {
		let b = new createjs.Bitmap(bmp);
		b.cache(x, y, w, h);

		return b.cacheCanvas;
	}

    serialize(json) {

        this.quantity = 1;

        const self = {};

        self.productid = dyo.monument.id;
        self.type = this.type;

        if (dyo.engine.promoCodeValue != '' && dyo.engine.promoCodeValue != undefined) {
            self.promo_code = dyo.engine.promoCodeValue;
        }

        if (this.border) {
			if (this.border != undefined) {
				self.border = this.border;
				self.shape_url = 'shapes/photos/' + this.border.replace(" ", "").toLowerCase() + ".svg";
			}
		}

        if (dyo.monument.has_base_flower_pot_holes) {
            if (this.flower_pot_holes != undefined) {
                self.flower_pot_holes = true;
            }
            if (this.base_flower_pots != undefined) {
                self.base_flower_pots = this.base_flower_pots;
            }
        }

        if (dyo.monument.installationMethod != null) {
            self.installationMethod = dyo.monument.installationMethod;
		}
		
		if (dyo.monument.fixingSystemType != null) {
            self.fixingSystem = dyo.monument.fixingSystemType;
        }

		if (dyo.monument.cornerType != null) {
            self.corner = dyo.monument.cornerType;
        }

		if (dyo.monument.holeType != null) {
            self.hole = dyo.monument.holeType;
        }

		if (dyo.monument.id == 4 || dyo.monument.id == 124) {
			self.shape = this.getShape();
		} else {
			if (dyo.monument.id == 31 || dyo.monument.id == 39) {
				self.shape = "Stainless Steel Plaque";
			} else {
				self.shape = this.name;
			}
		}

        self.color = this.color;
        self.fixed = this.fixed;

		self.texture = this.texture.replace('data/jpg/','src/');
		
		switch (dyo.monument.id) {
			default:
				self.name = dyo.monument._config.name;
				break;
			case 5: case 999:
				let fixing = "";

				switch (dyo.monument.fixingSystemType) {
					case 1:
						fixing = "Flat Back";
						break;

					case 2:
						fixing = "Lugs with Studs";
						break;

					case 3:
						fixing = "Screws (visible from front)";
						break;
				}

				let material = this.getMaterialByURL(this.texture);

				self.name = dyo.monument._config.name + " - " + material.name + " - " + fixing;
				self.color = material.color;
				break;
			case 31:
				let stand = "";

				switch (dyo.monument.standType) {
					case 1:
						stand = "No Stand";
						break;

					case 2:
						stand = "Separate";
						break;

					case 3:
						stand = "Inbuilt";
						break;
				}

				self.stand = stand;
				break;
			case 52:
				let corner = "";
				let hole = "";

				switch (dyo.monument.cornerType) {
					case 1:
						corner = "Rounded";
						break;
					default: case 2:
						corner = "Straight";
						break;
				}

				switch (dyo.monument.holeType) {
					case 1:
						hole = "Hole on each corners";
						break;
					case 2:
						hole = "Holes in the centre of the two sides";
						break;
					default: case 3:
						hole = "No drilled holes";
						break;	
				}

				self.name = dyo.monument._config.name + " - " + corner + " (" + hole + ")";
				break;
		}

		if (dyo.monument.id == 7) {
			self.materialImage = 1;
			if (dyo.monument.materialImage == 2) {
				self.materialImage = 2;
			}
		}

        self.price = this.price;
        self.quantity = this.quantity;
        self.width = this.width;
        self.height = this.height;
        self._length = this.length;
        self.init_width = dyo.w;
		self.init_height = dyo.h;

		var date = 0;
		if (dyo.monument.design_stampid) {
			date = new Date(Number(dyo.monument.design_stampid));
		} else {
			date = new Date(Number(dyo.uniqueid));
		}

		var month = ("0" + (date.getMonth() + 1)).slice(-2)
		var year = date.getFullYear();

		dyo.monument.headstone.backgroundPath = "../upload/" + year + "/" + month + "/";

        if (this.background) {
            self.color = dyo.monument.headstone.backgroundPath + dyo.monument.headstone.background;
        }

        if (dyo.monument.backgroundOption != undefined && dyo.monument.backgroundOption != "undefined") {
            self.backgroundOption = dyo.monument.backgroundOption;
        } 

		self.device = dyo.engine.deviceType;
		self.dpr = dyo.dpr;

		if (window.matchMedia("(orientation: landscape)").matches) {
			self.orientation = "landscape";
		} else {
			self.orientation = "portrait";
		}

		self.version = dyo.build_version;
		self.version_date = dyo.build_date;
		self.mode = dyo.mode;
		self.navigator = dyo.navigator;

        if (json) {
            return JSON.stringify(self);
        } else {
            return self;
        }
		
	}

	calcShape(id) {

		this.shapeId = id;

		//console.log(this.width, this.height);

		if (this.stack) {

			if (id == 0) {
				this.minX = 0;
				this.maxX = 0;
				this.minY = 0;
				this.maxY = 0;
				this.scale_minX = 0;
				this.scale_maxX = 0;
				this.scale_minY = 0;
				this.scale_maxY = 0;
			}

			this.stack = this.stackId[id];

			this.encodePath = new EncodePath()

			let x, y, cpx, cpy, proc, width, height, scale, use;
			let _ratio = 1;
			let w = (dyo.w * dyo.dpr);
			let h = (dyo.h * dyo.dpr);
			
			_ratio = .975;

			if (w < h) {
				use = w * _ratio;
			} else {
				use = h * _ratio;
			}

			let totalHeight;
			let baseHeight;

			if (dyo.monument.base == undefined) {
				baseHeight = Number(dyo.config._shapes[0].files.stand.init_height);
			} else {
				baseHeight = Number(dyo.monument.base.height);
			}

			if (dyo.monument.has_base) {
				totalHeight = Number(dyo.monument.headstone.height) + Number(baseHeight);
			} else {
				totalHeight = Number(dyo.monument.headstone.height);
			}

			this.headstoneHeightPx = Number((use) * (Number(dyo.monument.headstone.height) / Number(totalHeight)));

			if (dyo.monument.has_base) {

				if (this._width > this._height) {
					width = Number(this.headstoneHeightPx);
					height = Number(this.headstoneHeightPx) * (Number(this._height) / Number(this._width));

					this.baseHeightPx = Number((use) * (Number(baseHeight) / Number(this._width)));

				} else {
					width = Number(Number(this.headstoneHeightPx) * (Number(this._width) / Number(this._height)));
					height = Number(this.headstoneHeightPx);

					this.baseHeightPx = Number((Number(use)) * (Number(baseHeight) / Number(totalHeight)));
				}

			} else {

				if (this._width > this._height) {
					width = use;
					height = use * (this._height / this._width);
				} else {
					width = use * (this._width / this._height);
					height = use;
				}

			}

            this.pixels = {
                width: Number(width),
                height: Number(height)
			}

			dyo.pixels = {
                width: Number(width),
                height: Number(height)
			}

			//console.log(this.pixels);

			if (dyo.monument.has_base) {

				this.y = ((dyo.dpr * dyo.h) / 2) - (this.baseHeightPx / 2);
				dyo.monument.base.y = ((dyo.dpr * dyo.h) / 2) + (height / 2);

				if (dyo.target) {
					if (dyo.target.type == "Headstone" && dyo.edit == false) {
						if (this.width != this.old_width) {
							if (dyo.monument.id == 8) {
								dyo.monument.base.width = dyo.monument.headstone.width;
							} else {
								if (dyo.monument.has_linked_base) {
									dyo.monument.base.width = dyo.monument.headstone.width + 100;
								}
							}
						}
					}
				}

				if (!dyo.monument.has_linked_base) {
					if (dyo.monument.base.width > dyo.monument.base.max_width) {
						dyo.monument.base.width = dyo.monument.base.max_width;
					}
				}

				if (dyo.monument.base.width < dyo.monument.headstone.width) {
					dyo.monument.base.width = dyo.monument.headstone.width;
				}

			} else {

				this.y = ((dyo.dpr * dyo.h) / 2);

			}
			
			for (let key in this.containers) {
				this.containers[key].x = this.x;
				this.containers[key].y = this.y;
			}

			this.bottom = 0;
			
			let detail = 20;

			if (this.stack) {

				for (let nr = 0; nr < this.stack.length; nr++) {

					proc = ((this.stack[nr].x + this.p.right) / (this.p.right - this.p.left)) * 100;
					x = ((width) * proc / 100) - (width / 2);

					proc = ((this.stack[nr].y + this.p.bottom) / (this.p.bottom - this.p.top)) * 100;
					y = (use * proc / 100) - height / 2;

					if (this.stack[nr].y >= this.p.top) {
						proc = ((this.stack[nr].y + this.p.bottom) / (this.p.bottom - this.p.top)) * 100;
						y = (width * proc / 100) - height / 2;
					}

					if (this.stack[nr].y > this.p.bottom - detail) {
						proc = ((this.stack[nr].y - this.p.bottom) / (this.p.bottom - this.p.top)) * 100;
						y = (width * proc / 100) + height / 2;
					} 

					if (this.minY > y) {
						this.minY = y;
					}

					if (this.minX > x) {
						this.minX = x;
					}

					if (this.maxY < y) {
						this.maxY = y;
					}

					if (this.maxX < x) {
						this.maxX = x;
					}

					if (this.stack[nr].cpx) {
						proc = ((this.stack[nr].cpx + this.p.right) / (this.p.right - this.p.left)) * 100;
						cpx = ((width) * proc / 100) - (width / 2);
					}

					if (this.stack[nr].cpy) {
						proc = ((this.stack[nr].cpy + this.p.bottom) / (this.p.bottom - this.p.top)) * 100;
						cpy = ((height) * proc / 100) - (height / 2);

						if (this.stack[nr].cpy >= this.p.top) {
							proc = ((this.stack[nr].cpy + this.p.bottom) / (this.p.bottom - this.p.top)) * 100;
							cpy = (width * proc / 100) - height / 2;
						}
					}

					if (this.stack[nr].cpy > this.p.bottom - detail) {
						proc = ((this.stack[nr].cpy - this.p.bottom) / (this.p.bottom - this.p.top)) * 100;
						cpy = (width * proc / 100) + height / 2;
					}

					// scales dyo's shapes to max width & height view port 
					// (align width & height sliders)
					// for example Ceramic Photos, Urns etc.

					if (this.fixed == 2) {

						let scale;
						let shapeHeight = 400;
						
						if (dyo.monument.getProductType() == "headstones") {
							shapeHeight = 470;

							switch (this.name) {
								case "Headstone 32":
									shapeHeight = 400;
									break;
							}
	
						}

						scale = use / shapeHeight;
						
						x = this.stack[nr].x * scale;
						y = this.stack[nr].y * scale;
						cpx = this.stack[nr].cpx * scale;
						cpy = this.stack[nr].cpy * scale;

						switch (this.name) {
							case "Bone":
								this.maxY = 190;
								break;
						}
					}

					// scales dyo's shapes to max height view port 
					// and keeps width same (align width & height sliders)

					if (this.fixed == 3) {
						let scale;
						
						if (dyo.w > dyo.h) {
							scale = h / 400;
						} else {
							scale = w / 400;
						}
						
						x = this.stack[nr].x;
						//y = this.stack[nr].y;
						cpx = this.stack[nr].cpx;
						//cpy = this.stack[nr].cpy;
					}

					// scales dyo's shapes to max width & height view port 
					// and keeps width same (align width & height sliders)
					// new shapes for example New Headstones Shapes
					
					if (this.fixed == 4) {

						let shapeHeight; 
						let scale;

						shapeHeight = 400;
						
						if (dyo.w > dyo.h) {
							scale = height / shapeHeight;
						} else {
							scale = height / shapeHeight;
						}
						
						x = this.stack[nr].x * scale;
						y = this.stack[nr].y * scale;
						cpx = this.stack[nr].cpx * scale;
						cpy = this.stack[nr].cpy * scale;

						if (this.scale_minY > y) {
							this.scale_minY = y;
						}

						if (this.scale_minX > x) {
							this.scale_minX = x;
						}

						if (this.scale_maxY < y) {
							this.scale_maxY = y;
						}

						if (this.scale_maxX < x) {
							this.scale_maxX = x;
						}
						
					}

					switch (this.stack[nr].c) {
						default:
							this.encodePath[this.stack[nr].c](x, y);
							break;

						case "quadraticCurveTo":
							this.encodePath[this.stack[nr].c](cpx, cpy, x, y);
							break;

						case "bezierCurveTo":
							this.encodePath[this.stack[nr].c](this.stack[nr].cp1x, this.stack[nr].cp1y, this.stack[nr].cp2x, this.stack[nr].cp2y, this.stack[nr].x, this.stack[nr].y);
							break;

					}

				}

			}

			this.old_width = this.width;

			return this.encodePath;

		}

	}

}