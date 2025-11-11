import {Product} from '../Product.js';
import {$, Lang, Translate, File} from '../Const.js';

export class Monument extends Product {

	constructor(data = {}) {
		super(data);

		if (data.stage) {
			this.setStage(data.stage);
		}

        this._type = 'Monument';
        this._data = [];
        this._init = false;
		this._height = 0;
		this._time = [];
		this.refresh = 0;

		dyo.side = "Front";
	}
	
	setStage(stage) {

		this._stage = stage;

		this.container = new createjs.Container();

		this.container.regX = dyo.w / 2;
		this.container.regY = dyo.h / 2;
		this.container.x = dyo.w / 2;
		this.container.y = dyo.h / 2;

		this._stage.addChild(this.container);

	}

	scaleStage(scale) {
		this.container.scaleX = this.container.scaleY = scale;
	}

	getContainer() {
		return this.container;
	}

	getData() {
		return this.data;
	}

	render() {

		if (dyo.accountMode) {
			return;
		}

		if (this.rendered == true) {

			if (dyo.monument.getItems().length == 0) {
				dyo.monument.removeAllItems("Monument:57");
			}

			this.data.forEach(part => {
				if (part._type) {
					part.containers["Shape"].removeEventListener("click");
				}
			});

			while (this.container.getChildAt(0)) {
				this.container.removeChildAt(0);
			}

			this._data = [];

			delete this.headstone;
			delete this.base;

		} 

		this.rendered = true;

		if (dyo.config.hasHeadstone()) {

			this.container_headstone = new createjs.Container();
			this.container.addChild(this.container_headstone);

			this.headstone = dyo.design.getHeadstone();

			switch (dyo.monument.id) {
				case 7: case 32: case 2350:
					dyo.engine.sizes.showSizes();
					
					if (dyo.monument.id == 32) {
						if (dyo.edit) {

							let sizes = this.plaque_sizes(201);
							let nr = 0;

							sizes.forEach(item => {

								if (dyo.edit_width == Number(item.init_height)) {
									if (dyo.edit_height == Number(item.init_width)) {
										nr = item.id;
									}
								}

							});
				
							dyo.controller_Size.setValue(nr);
						}
					}
					
					break;
				default:
					// Fixed size Headstones or the non-Fixed ?
					if ((this.headstone.fixed == 2 && dyo.monument.id == 5) || 
						(this.headstone.fixed == 2 && dyo.monument.id == 999)) {
						dyo.oneTimeSizeSetup = true;
						dyo.engine.sizes.showSizes();
						dyo.borders.showOnlyFirstBorders();

						if (dyo.monument.id == 5) {
							if (dyo.edit) {
	
								if (this.headstone.name.indexOf("Oval") > -1) {

									let sizes = dyo.engine.sizes.emblemSizes();
									let nr = 0;
		
									sizes.forEach(item => {
										//console.log(item);
										//console.log(dyo.edit_height, item.init_height)
										if (this.headstone.name.indexOf("Landscape") > -1) {
											if (dyo.edit_width == Number(item.init_width)) {
												nr = Number(item.id);
											}
										} else {
											if (dyo.edit_height == Number(item.init_height)) {
												nr = Number(item.id);
											}
										}	

									});
						
									//console.log("setSize: " + nr);
									this.headstone.setConfig({
										border: "Border Oval Landscape", 
										class: "plaques", 
										drawing: "Oval Landscape",
										fixed: 2,
										height: 400,
										img: "data/svg/masks/oval_horizontal.svg",
										m3d: false,
										name: "Oval (Landscape)",
										ratio: 0.25,
										scale: 1,
										width: 400
									})

									dyo.controller_Size.setValue(nr);

								}

								if (this.headstone.name.indexOf("Circle") > -1) {

									let sizes = dyo.engine.sizes.emblemSizes();
									let nr = 0;
		
									sizes.forEach(item => {
										//console.log(dyo.edit_width, item.init_width)
										if (dyo.edit_width == Number(item.init_width)) {
											nr = Number(item.id);
										}
		
									});

									this.headstone.setConfig({
										border: "Border Circle", 
										class: "plaques", 
										drawing: "Circle",
										fixed: 2,
										height: 400,
										img: "data/svg/masks/circle.svg",
										m3d: false,
										name: "Circle",
										ratio: 0.25,
										scale: 1,
										width: 400
									})
						
									//console.log(nr);

									dyo.controller_Size.setValue(nr);

								}
	
							}
						}	

					} else if (this.headstone.fixed == 2 && dyo.monument.id == 32) {
						dyo.oneTimeSizeSetup = true;
						dyo.engine.sizes.showSizes();
					} else {
						dyo.engine.sizes.showWidthAndHeight();
						if ((this.headstone.fixed == 0 && dyo.monument.id == 5) ||
							(this.headstone.fixed == 0 && dyo.monument.id == 999)) {
							dyo.borders.showAllBorders();
						}
					}

					let nr = 0;
					if (dyo.shape_id) {
						this.shapes.forEach(shape => {
							if (shape.class == "headstones") {
								if (dyo.shape_id == nr) {
									this.headstone.setFixed(shape.fixed);
								}
								nr ++;
							}
						});                
					}
					break;
			}

			this.add(this.headstone);
			this.headstone_height = this._height;

			this.headstone.setMinWidth(Number(File('table').min_width));
			this.headstone.setMaxWidth(Number(File('table').max_width));

			this.headstone.setMinHeight(Number(File('table').min_height));
			this.headstone.setMaxHeight(Number(File('table').max_height));

			this.headstone.setMinLength(Number(File('table').min_depth));
			this.headstone.setMaxLength(Number(File('table').max_depth));	

		}

		if (dyo.config.hasBase()) {

			this.container_base = new createjs.Container();
			this.container.addChild(this.container_base);

			this.base = dyo.design.getBase();
			this.add(this.base);
			this.headstone_base_height = this._height;	

			if (this.base) {
				if (File('stand')) {
					this.base.setMinWidth(Number(File('stand').min_width));
					this.base.setMaxWidth(Number(File('stand').max_width));

					this.base.setMinHeight(Number(File('stand').min_height));
					this.base.setMaxHeight(Number(File('stand').max_height));

					this.base.setMinLength(Number(File('stand').min_depth));
					this.base.setMaxLength(Number(File('stand').max_depth));
				}
			}

			this.showBase();

			if (dyo.monument.full_monument) {

				this.ledger = dyo.design.getLedger();
				this.add(this.ledger);

				this.kerbset = dyo.design.getKerbset();
				this.add(this.kerbset);

			}

		}

		// set headstone to higher index than base to be able to move items to base from headstone
		this.container.setChildIndex(this.container_headstone, this.container.numChildren - 1);

		switch (dyo.monument.id) {
			default:
				$('#base-switch').checked = 'checked';
				if (dyo.mode == "3d") {
					if ($('#full_monument-switch')) {
						$('#full_monument-switch').checked = 'checked';
					}
				}
				break;
			case 5: case 10: case 30: case 34: case 35: case 50: case 999:
				$('#base-switch').checked = '';
				if (dyo.mode == "3d") {
					if ($('#full_monument-switch')) {
						$('#full_monument-switch').checked = '';
					}
				}
				this.has_base = false;
				break;
		}

		let self = this;

		this.data.forEach(part => {

			if (dyo.monument._config.code == 'Headstone' && part.type == 'Base' ||
				dyo.monument._config.code == 'Headstone' && part.type == 'Headstone' ||
				dyo.monument._config.code == 'Mini Headstone' && part.type == 'Base' ||
				dyo.monument._config.code == 'Mini Headstone' && part.type == 'Headstone' ||
				dyo.monument._config.code == 'Plaque' && part.type == 'Headstone' || 
				dyo.monument._config.code == 'Urn' && part.type == 'Headstone' || 
				dyo.monument._config.code == 'Image' && part.type == 'Headstone' ||
				dyo.monument._config.code == 'Full Monument' && part.type == 'Headstone') {

				part.render();

				part.containers["Shape"].addEventListener("click", function() {

					self.data.forEach(_part => {
						_part.deselect();
					});
					
					if (dyo.selected == null) {
						part._select();
					}
				});

			}

		});

	}

	set height(value) {
		this.setHeight(value);
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

    add(data = {}) {

		if (data.type == "Headstone") {
            this.headstone = data;
            this.has_headstone = true;
            this._height += this.headstone.height;
		}

		if (data.type == "Base") {
            this.base = data;
            this.has_base = false;
            this._height += this.base.height;
		}

		if (data.type == "Ledger") {
            this.ledger = data;
		}

		if (data.type == "Kerbset") {
            this.kerbset = data;
		}

        this._data.push(data);
	}
	
	remove(type) {

		this._data.forEach(part => {
			if (part.type == type) {
				part.remove();

				if (type == 'Base') {
					this.has_base = false;
					this._height -= this.base.height;
					delete this.base;
					this.update();
				}

			}
		})

	}

	getColor(color) {
		switch (dyo.monument._config.formula) {
			default: case "Laser":
				color = '#ffffff';
				break;
			case "Engraved": case "Enamel": case "Steel":
				if (color == undefined) {
					color = dyo.monument._config["default-color"];
				}
				if (dyo.monument.id == 34) {
					color = "#ffffff";
				}
				break;
			case "Bronze":
				color = '#ffb35a';
				break;
		}
		return color;
	}

	getColorName(colorHex) {
		let colorName;

		this.colors.forEach(color => {
			if (colorHex == color.hex) {
				colorName = color.name;
			}
		});

		return colorName;
	}

    get type() {
        return this._type;
    }
    
    get data() {
        return this._data;
	}

	set data(value) {
		this._data = value;
	}

	setHeader(text) {
		$('.catalog-title',  text);
	}

	updateHeader(from) {

		if (from) {
			//console.log(from);
		}

		if (dyo.target) {
			dyo._target = dyo.target;
		} else {
			dyo._target = dyo.monument.getPartByType('Headstone');
		}

		if (dyo._target) {

			let part = dyo._target;
			let name;

			switch (dyo._target._type) {
				default:
					name = Translate(Lang[dyo.monument._config.translate]);
					break;
				case "Base":
					name = Translate(Lang.HEADSTONE_BASE);
					break;
			}

			if (dyo.monument.id == 7) {

				let productImage = Translate(Lang.CERAMIC_IMAGE).split(" ")[0];

				if (dyo.monument.materialImage == 2) {
					productImage = Translate(Lang.VITREOUS_ENAMEL).split(" ")[0];
				}

				if (dyo.monument.materialImage == 3) {
					productImage = Translate(Lang.PREMIUM_PLANA).split(" ")[1];
				}

				name += " (" + productImage + ")";

			}

			let price = dyo.monument.checkPrice(false);
			let symbol = this.getCurrencySymbol(dyo.currency);
			let side = this.getCurrencySide(dyo.currency);

			if (price) {

				if (Number(price.price) == 0) {
					return;
				}

				let priceValue = '';

				if (side == 0) {
					priceValue = " (" + symbol + price.price + ")";
				}
	
				if (side == 1) {
					priceValue = " (" + price.price + " " + symbol + ")";
				}

				if (priceValue.indexOf("NaN") > -1) {
					priceValue = "";
				}
	
				let menu = '';

				if (dyo.currentSection == undefined) {
					dyo.currentSection = "Design Menu";
				}

				switch (dyo.currentSection) {
					case "Design Menu":
						menu = '';
						break;
					default:
						menu = Translate(Lang.MENU).toUpperCase() + ' - ';
						break;
				}

				if (dyo.country == "au" || dyo.country == "pg") {
					if (dyo.mode == "3d" && dyo.config._config.type == "full-monument") {
						priceValue = "";// + Translate(Lang.CONTACT_US);
					}
				}

				let mdc = document.getElementsByClassName("mdc-toolbar__title");

				switch (dyo.mode) {
					case "2d":
						switch (dyo.metric) {
							default:
								for (let nr = 0; nr < mdc.length; nr ++) {

									switch (dyo.monument.id) {
										default:
											mdc[nr].innerHTML = menu + name + ' - ' + part.width + ' x ' + part.height + " mm" + priceValue
											break;
										case 7:
											if (dyo.monument.headstone.name.indexOf("Portrait") > -1) {
												mdc[nr].innerHTML = menu + name + ' - ' + part.width + ' x ' + part.height + " mm" + priceValue
											}
											if (dyo.monument.headstone.name.indexOf("Landscape") > -1) {
												mdc[nr].innerHTML = menu + name + ' - ' + part.height + ' x ' + part.width + " mm" + priceValue
											}
											break;
									}
								}
								break;
							case "inches":
								for (let nr = 0; nr < mdc.length; nr ++) {
									mdc[nr].innerHTML = menu + name + ' - ' + dyo.engine.metrics.toInch(part.width, true) + ' x ' + dyo.engine.metrics.toInch(part.height, true) + priceValue;
								}
								break;
						}
						break;

					case "3d":
						if (dyo.engine3d.currentModel) {
							part = {};
							part.width = dyo.engine3d.currentModel.getProperty("width");
							part.height = dyo.engine3d.currentModel.getProperty("height");
							part.length = dyo.engine3d.currentModel.getProperty("depth");
						}

						if (part.width == 0.1) {
							return
						}

						switch (dyo.config._config.type) {
							case "full-monument": case "headstone":

								if (dyo.sub_mode == "traditional") {
									priceValue = "";
								}

								switch (dyo.metric) {
									default:
										for (let nr = 0; nr < mdc.length; nr ++) {
											mdc[nr].innerHTML = menu + name + ' - ' + part.width + ' x ' + part.height + ' x ' + part.length + " mm " + priceValue;
										}
										break;
									case "inches":
										for (let nr = 0; nr < mdc.length; nr ++) {
											mdc[nr].innerHTML = menu + name + ' - ' + dyo.engine.metrics.toInch(part.width, true) + ' x ' + dyo.engine.metrics.toInch(part.height, true) + ' x ' + dyo.engine.metrics.toInch(part.length, true) + " " + priceValue;
										}
										break;
								}
							default:
								switch (dyo.metric) {
									default:
										for (let nr = 0; nr < mdc.length; nr ++) {
											mdc[nr].innerHTML = menu + name + ' - ' + part.width + ' x ' + part.height + " mm " + priceValue;
										}
										break;
									case "inches":
										for (let nr = 0; nr < mdc.length; nr ++) {
											mdc[nr].innerHTML = menu + name + ' - ' + dyo.engine.metrics.toInch(part.width, true) + ' x ' + dyo.engine.metrics.toInch(part.height, true) + " " + priceValue;
										}
										break;
								}
					
					}

				}

			}

			if (dyo._target) {
				switch (dyo._target.type) {
					case "Headstone":
						if ($("#dyo_select_shape").style.display != "flex") {
							$("#dyo_select_shape").style.display = "flex";
						}
						break;
					case "Base": 
						if ($("#dyo_select_shape").style.display != "none") {
							$("#dyo_select_shape").style.display = "none";
						}
						break;
				}
			}
			
		}

	}

    updateMonument(from) {

		let now = Number(window.performance.now());
		let diff;

		if (this.lastUpdated) {
			diff = now - this.lastUpdated;
			if (diff < 20) {
				return;
			}
		}

		if (dyo.target) {
						
			let part = dyo.target;

			if (dyo.data != undefined) {
				if (dyo.data.width != part.width || 
					dyo.data.width == dyo.data.height || 
					dyo.data.length == dyo.data.length) {
					part.width = dyo.data.width;
					part.height = dyo.data.height;
					if (dyo.data.length > 1) {
						part.length = dyo.data.length;
					}
				}
			}

			if (dyo.data != undefined) {
				if (dyo.data.height != part.height) {
					part.height = dyo.data.height;
				}
			}
			
			if (this.has_base) {

				this.headstone.update("monument: 387");
				this.base.update();

			} else {

				this.headstone.y = dyo.h / 2;
				this.headstone.update("monument: 393");

			}

			let scale;
			let use;

			scale = 1;

			if (dyo.w > dyo.h) {
				scale = dyo.h / dyo.design_init_height;
			} 

			if (dyo.w < dyo.h) {
				scale = dyo.w / dyo.h;
			}

			if (dyo.design_init_width == dyo.w && dyo.design_init_height == dyo.h) {
				scale = 1;
			} 

			let type = dyo.config.getProductType();

			// update item ratios
			this.data.forEach(part => {
				if (part._type) {
					part.data.forEach(item => {
						if (item.type) {
							item.resizing = true;
							//item.deselect();
							item.resize();
							item.resizing = false;
							if (item.data) {
								if (dyo.engine.mobileDevice) {
									scale = 1;
								}
								item.container.x = item.data.x * scale;
							}
							if (item.data) {
								let _scale = 1;
								if (dyo.engine.resizing == "width") {
									if (dyo.data.init_width) {
										if (dyo.data.init_width < dyo.data.width) {
											_scale = (dyo.data.init_width / dyo.data.width);
										} else {
											_scale = 1;
										}
									} else {
										dyo.data.init_width = dyo.data.width;
									}
								}
								if (dyo.engine.resizing == "height") {
									if (dyo.data.init_height) {
										if (dyo.data.height > dyo.data.width) {
											_scale = (dyo.data.width / dyo.data.height);
										} else {
											_scale = (dyo.h / dyo.design_init_height);
										}
									} else {
										dyo.data.init_height = dyo.data.height;
									}
								}
								item.container.y = item.data.y * _scale;

							}
						}
					});
				}
			});

		}

		this.lastUpdated = Number(window.performance.now());

    }
	
	select(type) {		
		this.data.forEach(part => {
			if (part.type == type.type) {
				part._select();
			}
		});	
	}
	
	deselectAll(from) {
		this.data.forEach(part => {
			if (part._type) {
				part.deselect("monument:479");
				part.data.forEach(item => {
					if (item.type) {
						item.deselect();
					}
				});
			}
		});
	}

	deselectItems() {
		this.data.forEach(part => {
			part.data.forEach(item => {
				if (item.type) {
					item.deselect();
				}
			});
		});
	}

	getRatio() {

		let width = Number(dyo.monument.headstone.width);
		let height = Number(dyo.monument.headstone.height);

		let px;
		let mm;

		if (dyo.engine.mobileDevice) {

			if (dyo.h > dyo.w) {
				px = this.headstone.pixels.height;
				mm = height;
			} else {
				px = this.headstone.pixels.width;
				mm = height;
			}

			px = this.headstone.pixels.height;

		} else {

			if (dyo.config._config.type == "full-monument") {

				px = this.headstone.pixels.height;
				mm = height;

			} else {

				if (dyo.monument.has_base) {
					if (!isNaN(dyo.monument.headstone.baseHeightPx)) {
						px = this.headstone.pixels.height + Number(dyo.monument.headstone.baseHeightPx);
					} else {
						px = this.headstone.pixels.height;
					}
					
					mm = height + Number(dyo.monument.base.height);

				} else {

					//console.log(this.headstone.pixels);

					if (this.headstone.pixels) {
						px = this.headstone.pixels.height;
					} else {
						px = dyo.pixels.height;
					}
					mm = height;
				}

			}

		}

		let ratio = Number(px / mm);
		return ratio;

	}

	_getItems() {
		return this.getItems();
	}

	getInscriptionsLines() {

		let count = 0;
		let items = this.getItems();

		items.forEach(item => {
			if (item.type == "Inscription") {
				if (item.font_size < 1) {
					item.delete();
				} else {
					count ++;
				}
			}
		});

		return count;

	}

	removeAllItems(from) {
		
		this.data.forEach(part => {
			if (part._type) {
				part.data.forEach(item => {
					if (item.type) {
						item.delete();
					}
				});
			}
		});
	}

	getPartByType(type) {
		let p = {};
		this.data.forEach(part => {
			if (part.type == type) {
				p = part;
			}
		});
		return p;
	}

	showFront() {
		dyo.side = "Front";
		this.data.forEach(part => {
			part.showFront();
			part.data.forEach(item => {
				if (item.type) {
					item.deselect();
				}
			});
		});		
	}

	showBack() {
		dyo.side = "Back";
		this.data.forEach(part => {
			part.showBack();
			part.data.forEach(item => {
				if (item.type) {
					item.deselect();
				}
			});
		});		
	}

	showBorder() {

		switch (dyo.monument.id) {
			case 3: case 4: case 8: case 22:
				if (this.has_border) {
					this.headstone.border = "Border " + this.headstone.name;
				} else {
					this.headstone.border = 0;
				}
				break;
			case 5: case 999:
				this.headstone.border = this.headstone.getBorder();
				break;
			case 10: case 30: case 34: case 35:
				this.headstone.border = this.headstone.getBorder();
				break;
			case 50:
				this.headstone.border = this.headstone.getBorder();
				break;
		}

	}

	showBackgroundImage() {
		$('#background-switch').checked = 'checked';
	}

	switchFullMonument() {

		if (dyo.monument.switch_full_monument) {
			if ($('#full_monument-switch')) {
				$('#full_monument-switch').checked = 'checked';
			}
			if ($("#dyo_add_headstone_base")) {
				$("#dyo_add_headstone_base").style.display = "none";
			}
			if ($("#dyo_full_monument")) {
				$("#dyo_full_monument").style.display = "flex";
			}
			if (dyo.monument.id == 4) {
				dyo.monument.id = 100;
            	dyo.product_id = 100;
			}
			if (dyo.monument.id == 102) {
				dyo.monument.id = 101;
            	dyo.product_id = 101;
			}
			dyo.config._config.type = "full-monument";
            dyo.monument.Product();
		} else {
			if ($('#full_monument-switch')) {
				$('#full_monument-switch').checked = '';
			}
			if ($("#dyo_add_headstone_base")) {
				$("#dyo_add_headstone_base").style.display = "flex";
			}
			if ($("#dyo_full_monument")) {
				$("#dyo_full_monument").style.display = "flex";
			}
			if (dyo.monument.id == 100) {
				dyo.monument.id = 4;
            	dyo.product_id = 4;
			}
			if (dyo.monument.id == 101) {
				dyo.monument.id = 102;
            	dyo.product_id = 102;
			}
			dyo.config._config.type = "headstone";
            dyo.monument.Product();
		}

	}

	showBase() {

		if (dyo.monument.has_base) {

			if (dyo.monument.base) {
				dyo.monument.base.min_width = dyo.monument.headstone.width;

				if (dyo.monument.base.width < dyo.monument.headstone.width) {
					dyo.monument.base.width = dyo.monument.headstone.width;
				}
				
				if (!dyo.edit) {
					if (dyo.monument.id == 8) {
						dyo.monument.base.width = dyo.monument.headstone.width;
					} else {
						dyo.monument.base.width = dyo.monument.headstone.width + 100;
					}
					if (dyo.monument.base.width > Number(File('stand').max_width)) {
						dyo.monument.base.width = Number(File('stand').max_width);
					}
					dyo.monument.base.length = dyo.monument.headstone.length;
					if (dyo.monument.base.length > Number(File('stand').max_depth)) {
						dyo.monument.base.length = Number(File('stand').max_depth);
					}
				}

				dyo.monument.base.min_width = dyo.monument.headstone.width;
				dyo.monument.has_base = true;
				dyo.monument.base.show();
				$('#base-switch').checked = 'checked';
				$('#base-link-switch').checked = '';
				
				switch (dyo.monument.id) {
					default:
						$('#dyo_add_headstone_base_flower_pot_holes').style.display = "flex";
						$('#dyo_link_headstone_base').style.display = "flex";
						
						if (dyo.monument.has_base_flower_pot_holes) {
							$('#base_flower_pots').style.display = "block";
						}
						
						let base_thickness = 130;
						let widthChange = 600;
						let headstoneWidth = dyo.monument.headstone.width;
						let headstoneHeight = dyo.monument.headstone.height;

						if (dyo.usa) {
							widthChange = dyo.engine.metrics.convertToInches(widthChange);
							headstoneWidth = dyo.engine.metrics.convertToInches(headstoneWidth);
							headstoneHeight = dyo.engine.metrics.convertToInches(headstoneHeight);
						}

						if (Number(headstoneWidth) > widthChange || Number(headstoneHeight) > widthChange) {
							base_thickness = 250;
						} 
		
						dyo.monument.base.setLength(base_thickness);

						break;
					case 8: case 22:
						$('#dyo_add_headstone_base_flower_pot_holes').style.display = "none";
						$('#dyo_add_headstone_base').style.display = "none";
						$('#base_flower_pots').style.display = "none";
						$('#dyo_link_headstone_base').style.display = "none";
						break;
				}

				if (dyo.mode == "3d") {

					if (dyo.engine3d_ready) {

						switch (dyo.monument.installationMethod) {
							default:
								if (dyo.engine3d.currentModel) {

									let base_thickness = 130;
									let widthChange = 600;
									let headstoneWidth = dyo.monument.headstone.width;
									let headstoneHeight = dyo.monument.headstone.height;
			
									if (dyo.usa) {
										widthChange = dyo.engine.metrics.convertToInches(widthChange);
										headstoneWidth = dyo.engine.metrics.convertToInches(headstoneWidth);
										headstoneHeight = dyo.engine.metrics.convertToInches(headstoneHeight);
									}
			
									//console.log(headstoneWidth, headstoneHeight, widthChange);
			
									if (Number(headstoneWidth) > widthChange || Number(headstoneHeight) > widthChange) {
										base_thickness = 250;
									} 

									if (dyo.usa) {
										dyo.engine3d.stand3d.changeProperty("width", Number(File('stand').init_width) * 1.35);
										dyo.engine3d.stand3d.changeProperty("height", Number(File('stand').init_height) * 1.5);
									} else {
										dyo.engine3d.stand3d.changeProperty("width", Number(File('stand').init_width));
										dyo.engine3d.stand3d.changeProperty("height", Number(File('stand').init_height));
									}
									
									switch (dyo.monument.id) {
										default:
											dyo.engine3d.stand3d.changeProperty("depth", dyo.engine3d.headstone3d.getProperty("depth") + 130);
											break;
										case 8: case 22:
											dyo.engine3d.stand3d.changeProperty("depth", Number(File('stand').init_depth));
											break;
									}
									dyo.engine3d.loadTexture(dyo.engine3d.stand3d, dyo.engine3d.currentModelTextureURL);
								}
								if (dyo.config._config.type == "headstone") {
									if (dyo.engine3d.headstone3d.getProperty("width") > Number(dyo.engine3d.stand3d.getProperty("width"))) {
										dyo.engine3d.stand3d.changeProperty("width", Number(dyo.engine3d.headstone3d.getProperty("width")) + 100);
									}
									if (dyo.engine3d.headstone3d.getProperty("depth") > Number(dyo.engine3d.stand3d.getProperty("depth"))) {
										dyo.engine3d.stand3d.changeProperty("depth", Number(dyo.engine3d.headstone3d.getProperty("depth")));
									}
								}
								break;
						}

					}

				}

				$('#dyo_link_headstone_base').style.display = "none";

			}

		} else {

			dyo.monument.deselectAll();

			dyo.target = dyo.monument.headstone;

			if (dyo.target) {
				dyo.target._select();
			}

			dyo.monument.has_base = false;
			dyo.monument.has_base_flower_pot_holes = false;
			dyo.monument.has_base_flower_pots = 3;

			if (dyo.monument.base) {
				dyo.monument.base.hide();
			}

			$('#base-switch').checked = '';
			$('#dyo_link_headstone_base').style.display = "none";
			$('#dyo_add_headstone_base_flower_pot_holes').style.display = "none";
			$('#base-flower-pot-holes-switch').checked = '';
			$('#base_flower_pots').style.display = "none";
			$('#radio-3').checked = 'checked';

			if (dyo.mode == "3d") {
				if (dyo.config._config.type != "full-monument") {
					if (dyo.engine3d.currentModel) {

						dyo.engine3d.currentModel = dyo.engine3d.headstone3d;

						if (dyo.engine3d.stand3d) {
							dyo.engine3d.stand3d.changeProperty("width", 1);
							dyo.engine3d.stand3d.changeProperty("height", 1);
							dyo.engine3d.stand3d.changeProperty("depth", 1);
						}
					}
				}
			}

		}

		dyo.monument.updateHeader();

	}

	showBaseFlowerPotHoles() {

		let part = "stand";

		if (dyo.monument.has_base_flower_pot_holes) {
			dyo.monument.has_base_flower_pot_holes = true;
			$('#base-flower-pot-holes-switch').checked = 'checked';
			$('#base_flower_pots').style.display = "block";

			if (dyo.mode == "3d") {
				if (dyo.usa) {
					dyo.engine.sizes.slider_length.slider.max = Number(File(part).max_depth) * 2;
				} else {
					dyo.engine.sizes.slider_length.slider.max = Number(File(part).max_depth);
				}
				dyo.engine.sizes.slider_length.slider.min = Number((File(part).min_depth) * 2) - 10;

				if (File(part)) {
					if (dyo.engine3d.stand3d) {
						if (dyo.usa) {
							dyo.engine3d.stand3d.changeProperty("depth", dyo.engine3d.headstone3d.getProperty("depth") + 250);
						} else {
							dyo.engine3d.stand3d.changeProperty("depth", Number((File(part).min_depth) * 2) - 10);
						}
						
					}
				
				}
			} else {
				dyo.monument.base.setLength("250");
			}

		} else {
			dyo.monument.has_base_flower_pots = 3;
			dyo.monument.has_base_flower_pot_holes = false;
			$('#base-flower-pot-holes-switch').checked = '';
			$('#base_flower_pots').style.display = "none";
			$('#radio-3').checked = 'checked';

			if (dyo.mode == "3d") {
				if (File(part)) {
					dyo.engine.sizes.slider_length.slider.max = Number(File(part).max_depth);
					dyo.engine.sizes.slider_length.slider.min = Number(File(part).min_depth);
					if (dyo.engine3d.stand3d) {
						dyo.engine3d.stand3d.changeProperty("depth", dyo.engine3d.headstone3d.getProperty("depth") + 130);
					}
				}
			} else {

				let base_thickness = 130;

				if (Number(dyo.monument.headstone.width) > 600 || Number(dyo.monument.headstone.height) > 600) {
					base_thickness = 250;
				} 

				dyo.monument.base.setLength(base_thickness);

			}
			
		}

		this.updateHeader("Monument: 837");

	}

	checkBackgroundImage() {

		if (!dyo.monument.has_background_image) {
			dyo.monument.has_background_image = true;
			$('#background-switch').checked = 'checked';
		} else {
			dyo.monument.has_background_image = false;
			$('#background-switch').checked = '';
		}

	}
	
	serialize() {
		let output = [];
		let part_data;

		this.data.forEach(part => {

			part_data = undefined;

			switch (part.type) {
				default:
					part_data = part.serialize();
					break;
				case "Base":
					if (dyo.monument.has_base) {
						part_data = part.serialize();
					}
					break;
			}

			if (part_data) {
				if (Number(part_data.width) > 0) {
					output.push(part.serialize());
				}
			}

		});	

		return output;
	}

}