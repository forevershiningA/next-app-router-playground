import {Item} from './Item.js';
import {Lang, Translate, $} from '../Const.js';

export class Motif extends Item {
	constructor(data = {}) {
        super(data);

        this.type = 'Motif';
        this.dimmension_ratio = 1;

        if (data.productid) {
            this.productid = data.productid;
        } else {
            this.productid = dyo.monument._additions.Motifs[0].id;
        }
        
        this.side = data.side;
        this.parent = data.parent;
        this.part = data.part;

        this.price = 0;

        this.color = dyo.monument.getColor();
        if (data.color) {
            this.color = data.color;
        }
        if (data.color_texture) {
            this.color_texture = data.color_texture;
        }
        if (data.color_texture2) {
            this.color_texture2 = data.color_texture2;
        }
        
        this.ratio = data.ratio;
        this.x = data.x;
        this.y = data.y;
        this.flipx = data.flipx;
        this.flipy = data.flipy;
        this.rotation = data.rotation;
        this.width = data.width;
        this.height = data.height;
        this.draggable = data.draggable;
        this.selected = data.selected;
        this.src = data.src;
        this.item = data.item;
        this.bmp = data.bmp;
        this.url = data.url;
        this.data = data;
        if (data.data3d) {
            this.data3d = data.data3d;
        } else {
            this.data3d = {};
        }
        if (this.flipx == undefined) {
            this.flipx = 1;
        }
        if (this.flipy == undefined) {
            this.flipy = 1;
        }
        if (this.rotation == undefined) {
            this.rotation = 0;
        }
        if (data.colorName) {
            this.colorName = data.colorName;
        }
        if (data.colorName2) {
            this.colorName2 = data.colorName2;
        }

        if (data.itemID && dyo.mode == "3d") {
            this.itemID = data.itemID;
        } else {
            this.itemID = dyo.monument.getItemID();
        }

        this.outlinePx = 16;

        this.config();
        dyo.monument.addItem(this);

    }

    get_width() {
        return Math.round(this.bounds.width * this.ratio);
    }
    
    get_height() {
        return Math.round(this.bounds.height * this.ratio);
    }

    config() {
        let _config = dyo.monument._additions.Motifs[0].types[0];

        this.min_height = Number(_config.min_height);
        this.max_height = Number(_config.max_height);
        this.init_height = Number(_config.init_height)

        if (this.init_height < this.min_height) {
            this.init_height = this.min_height;
        }
        if (this.init_height > this.max_height) {
            this.init_height = this.max_height;
        }
    }

    get_min() {
        return this.min_height;
    }

    get_max() {
        return this.max_height;
    }

    render() {

        /*
        this.ratio here is init height divided by Image height
        */
        
		this.stage = this.parent.containers["Design_" + this.side]
		
        this.container = new createjs.Container();
        this.stage.addChild(this.container);

        this.bitmap = new createjs.Bitmap(this.bmp);
        this.bitmap.regX = this.bmp.width / 2;
        this.bitmap.regY = this.bmp.height / 2;

        if (!this.ratio) {
            this.ratio = this.init_height / this.bmp.height;
        }

        this.bitmap.scaleX = this.bitmap.scaleY = this.ratio;

        if (!dyo.engine.mobileDevice) {
            if (this.x > (dyo.w / 2.25)) {
                this.x = -(dyo.w / 2.25);
            }
        }
        
        this.container.x = this.x;
        this.container.y = this.y;
        this.container.scaleX = this.flipx;
        this.container.scaleY = this.flipy;

        this.container.addChild(this.bitmap);

        this.bounds = this.bitmap.getBounds();

        this.bitmap.cache(this.bounds.x, this.bounds.y, this.bounds.width * this.ratio, this.bounds.height * this.ratio);
        
        if (dyo.monument.id == 31 || dyo.monument.id == 39) {
            // outline texture
            this.outlineTexture = new createjs.Container();
            this.overlayOutlineTexture = new createjs.Shape();
            this.outlineTexture.addChild(this.overlayOutlineTexture);
            this.overlayOutlineTexture.cache(-dyo.w / 2, -dyo.h / 2, dyo.w, dyo.h);
            this.container.addChild(this.outlineTexture);

            // raised texture
            this.raisedTexture = new createjs.Container();
            this.overlayRaisedTexture = new createjs.Shape();
            this.raisedTexture.addChild(this.overlayRaisedTexture);
            this.overlayRaisedTexture.cache(-dyo.w / 2, -dyo.h / 2, dyo.w, dyo.h);
            this.container.addChild(this.raisedTexture);

            // color texture
            this.colorTexture = new createjs.Container();
            this.overlayColorTexture = new createjs.Shape();
            this.colorTexture.addChild(this.overlayColorTexture);
            this.overlayColorTexture.cache(-dyo.w / 2, -dyo.h / 2, dyo.w, dyo.h);
            this.container.addChild(this.colorTexture);

            this.colorTextureTarget = 1;

            this.overlayColorTexture.addEventListener("click", function(e) {
                this.colorTextureTarget = 1;
                if ($('#radio-top_part')) {
                    $('#radio-top_part').checked = 'checked';
                }
            }.bind(this), false)

            if (this.productid == 17 || this.productid == 18) {

                // color texture
                this.colorTexture2 = new createjs.Container();
                this.overlayColorTexture2 = new createjs.Shape();
                this.colorTexture2.addChild(this.overlayColorTexture2);
                this.overlayColorTexture2.cache(-dyo.w / 2, -dyo.h / 2, dyo.w, dyo.h);
                this.container.addChild(this.colorTexture2);

                this.overlayColorTexture2.addEventListener("click", function(e) {
                    this.colorTextureTarget = 2;
                    if ($('#radio-bottom_part')) {
                        $('#radio-bottom_part').checked = 'checked';
                    }
                }.bind(this), false)
                //this.mask_2 = new createjs.Container();
                //this.container.addChild(this.mask_2);
                
                // 2 color masks
                
                this.col_1_bmp = new createjs.Bitmap(dyo.engine.extractShapesByColor(this.bmp, [255, 0, 0, 255]));
                this.col_2_bmp = new createjs.Bitmap(dyo.engine.extractShapesByColor(this.bmp, [0, 255, 0, 255]));
                //this.mask_2.addChild(this.col_2_bmp);

                //this.mask_2.getChildAt(0).regX = this.bmp.width / 2;
                //this.mask_2.getChildAt(0).regY = this.bmp.height / 2;
                    
            }

        }

        if (this.draggable) {
            this.bitmap.cursor = "pointer";
            this.drag();
        
            this.selectOutline = new createjs.Shape();
            this.container.addChild(this.selectOutline);
            this.drawOutline();

            this.selectOutlineHandlers = new createjs.Shape();
            this.selectOutlineHandlers.name = "handler";
            this.container.addChild(this.selectOutlineHandlers);
            this.drawHandlers();
        }

        if (this.selected) {
            this.select();
        } else {
            this.selectOutline.visible = false;
            this.selectOutlineHandlers.visible = false;
        }

        this.applyColor(this.color);
        this.setRotation(this.rotation);
        this.resize();
        
        if (dyo.mode == "3d") {
            this.add3D();
        }

        dyo.engine.last_action = "render";
        dyo.monument.updateHeader("Motif:218");

        //console.log(this.itemID, this.src);

    }

	applyRaisedTexture() {

        let self = this;

		let _src = "data/jpg/metals/forever/l/07.jpg";//dyo.monument.headstone.texture;

        //_src = "data/jpg/glass_backings/m/1808A.jpg";
        
        if (this.last_raised_texture != undefined) {
            if (_src == this.last_raised_texture) {
                this.applyRaisedMask();
                return;
            }
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

            this.last_raised_texture = _src;

			let m = new createjs.Matrix2D();
            let v;
            if (this.bounds.height > this.bounds.width) {
                v = (dyo.dpr * this.bounds.height) / texture.height;
			    m.scale(v, v);
            } else {
                v = (dyo.dpr * this.bounds.width) / texture.height;
                m.scale(v, v);
            }
            
			let repeat = "no-repeat";

            let container = this.raisedTexture.getChildAt(0);
            container.graphics.clear();

            container.graphics
            .beginBitmapFill(texture, repeat, m)
            .drawRect(this.outlineBounds.x, this.outlineBounds.y, this.outlineBounds.width, this.outlineBounds.height);

            this.applyRaisedMask();
    
		}

	}

    applyRaisedMask() {
        this.overlayRaisedTexture.filters = [
            new createjs.AlphaMaskFilter(this.overlayOutlineTexture.cacheCanvas)
        ];

        this.overlayRaisedTexture.cache(this.outlineBounds.x, this.outlineBounds.y, this.outlineBounds.width, this.outlineBounds.height);

        this.raisedTexture.x = -(((this.outlineBounds.width - (this.outlineBounds.width - this.bounds.width) / 2) * this.bitmap.scaleX) / 2);
        this.raisedTexture.y = -(((this.outlineBounds.height - (this.outlineBounds.height - this.bounds.height) / 2) * this.bitmap.scaleY) / 2);
        this.raisedTexture.scaleX = this.bitmap.scaleX;
        this.raisedTexture.scaleY = this.bitmap.scaleY;
    }

	applyColorTexture(src, col) {

		let _src;

        switch (this.productid) {
            default:
                dyo.engine.motifs.colors_list.show();
                if (src == undefined) {
                    _src = "data/jpg/glass_backings/m/01defaultred.jpg";
                } else {
                    _src = src;
                }
                break;

            case 76:
                dyo.engine.motifs.colors_list.hide();

                _src = dyo.monument.headstone.texture;
                break;
        }

        //this.color_texture = _src;

        //if (this.last_color_texture != undefined) {
        //    if (this.color_texture == this.last_color_texture) {
        //        this.applyColorMask();
        //        return;
        //    }
        //}

		let texture = new Image();
		texture.crossOrigin = "Anonymous";
		texture.src = _src;

        if (dyo.engine.cached_texture[_src] != true) {
            dyo.engine.loader.show("Motif:290");
        }

		texture.onerror = () => {
			console.log("Error");
			dyo.engine.loader.force = false;
			dyo.engine.loader.hide("Shape:939");
		}

		texture.onload = () => {

            dyo.engine.cached_texture[_src] = true;

            this.last_color_texture = _src;

			let m = new createjs.Matrix2D();
            let v;
            if (this.bounds.height > this.bounds.width) {
                v = (dyo.dpr * this.bounds.height) / texture.height;
			    m.scale(v, v);
            } else {
                v = (dyo.dpr * this.bounds.width) / texture.height;
                m.scale(v, v);
            }

			let repeat = "no-repeat";

            let container;

            if (this.colorTextureTarget == 1 || col == 1) {
                container = this.colorTexture.getChildAt(0);
                this.color_texture = _src;
                if ($('#radio-top_part')) {
                    $('#radio-top_part').checked = 'checked';
                }
            }
            if (this.productid == 17 || this.productid == 18) {
                if (this.colorTextureTarget == 2 || col == 2) {
                    container = this.colorTexture2.getChildAt(0);
                    this.color_texture2 = _src;
                }
            }
            
            container.graphics.clear();
            container.graphics
            .beginBitmapFill(texture, repeat, m)
            .drawRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

            if (this.productid == 17 || this.productid == 18) {
                if (this.firstPaint != true) {
                    this.firstPaint = true;

                    let container2 = this.colorTexture2.getChildAt(0);
                    container2.graphics.clear();
        
                    container2.graphics
                    .beginBitmapFill(texture, repeat, m)
                    .drawRect(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);    
                }
            }

            this.applyColorMask();

            dyo.engine.loader.hide("Motif:290");
    
		}

	}

    applyColorMask() {

        var self = this;
        this.outlineMulti = 2;
        this.thicknessScale = 10;

        if (this.productid == 14 || this.productid == 18 || this.productid == 76) {
            this.outlineMulti = 0;
            this.thicknessScale = 1;
        }

        var canvas = document.createElement('canvas');
        canvas.width = this.bounds.width + (this.outlinePx * this.outlineMulti);
        canvas.height = this.bounds.height + (this.outlinePx * this.outlineMulti);

        let ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(this.bitmap.cacheCanvas, 0, 0);

        var dArr = [-1, -1, 0, -1, 1, -1, -1, 0, 1, 0, -1, 1, 0, 1, 1, 1], // offset array
            s = this.thicknessScale,  // thickness scale
            i = 0,  // iterator
            x = this.thicknessScale / 1.5,  // final position
            y = this.thicknessScale / 1.5;
        
        // draw images at offsets from the array scaled by s
        for (let i = 0; i < dArr.length; i += 2) {
            ctx.drawImage(this.bitmap.cacheCanvas, x + dArr[i]*s, y + dArr[i+1]*s);
        }

        // fill with color
        ctx.globalCompositeOperation = "source-in";
        ctx.fillStyle = "green";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // draw original image in normal mode
        ctx.globalCompositeOperation = "source-over";
        ctx.drawImage(this.bitmap.cacheCanvas, x, y);

        var bmp = new createjs.Bitmap(canvas);

        this.outlineBounds = bmp.getBounds();

        this.overlayOutlineTexture.graphics.clear()
        .beginBitmapFill(canvas, "no-repeat")
        .drawRect(0, 0, this.outlineBounds.width, this.outlineBounds.height);

        this.outlineTexture.visible = false;
        this.overlayOutlineTexture.cache(this.outlineBounds.x, this.outlineBounds.y, 
                                        this.outlineBounds.width, this.outlineBounds.height);
        
        if (this.productid != 76 && this.productid != 17 && this.productid != 18) {
            //Mask color texture
            this.overlayColorTexture.filters = [
                new createjs.AlphaMaskFilter(this.bitmap.cacheCanvas)
            ];

            this.overlayColorTexture.cache(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
        }

        if (this.productid == 17 || this.productid == 18) {

            //this.mask_2.cache(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
            
            this.col_1_bmp.cache(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
            this.col_2_bmp.cache(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
            //this.col_2_bmp.cache(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
            //new createjs.AlphaMaskFilter(this.col_2_bmp.cacheCanvas)

            this.overlayColorTexture.filters = [
                new createjs.AlphaMaskFilter(this.col_1_bmp.cacheCanvas)
            ];
            this.overlayColorTexture.cache(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

            this.overlayColorTexture2.filters = [
                new createjs.AlphaMaskFilter(this.col_2_bmp.cacheCanvas)
            ];
            this.overlayColorTexture2.cache(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

        }

        this.colorTexture.x = -((this.bounds.width * this.bitmap.scaleX) / 2);
        this.colorTexture.y = -((this.bounds.height * this.bitmap.scaleY) / 2);
        this.colorTexture.scaleX = this.bitmap.scaleX;
        this.colorTexture.scaleY = this.bitmap.scaleY;

        if (this.productid == 17 || this.productid == 18) {
            this.colorTexture2.x = -((this.bounds.width * this.bitmap.scaleX) / 2);
            this.colorTexture2.y = -((this.bounds.height * this.bitmap.scaleY) / 2);
            this.colorTexture2.scaleX = this.bitmap.scaleX;
            this.colorTexture2.scaleY = this.bitmap.scaleY;
        }

        //if (this.productid == 76 || this.productid == 15) {
            this.applyRaisedTexture();
        //}

    }

    add3D() {

        if (dyo.edit == false) {

            let self = this;
            this.inst3d = new Engine3D.Model3D("models/motif-container.m3d");
            dyo.engine3d.inst3d = this.inst3d;

            dyo.engine.loader.show("Motif:290");

            this.inst3d.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {
                
                if (dyo.engine3d.currentModel.generalType) {
                    switch (dyo.engine3d.currentModel.generalType.toLowerCase()) {
                        default:
                            dyo.engine3d.currentModel = dyo.engine3d.headstone3d;
                            break;
                        case "scenery":
                            if (dyo.engine3d.currentModel.lastGeneralType == "Ledger") {
                                dyo.engine3d.currentModel = dyo.engine3d.ledger3d;    
                            }
                            break;
                        case "ledger":
                            dyo.engine3d.currentModel = dyo.engine3d.ledger3d;
                            break;
                    }
                } else {
                    dyo.engine3d.currentModel = dyo.engine3d.headstone3d;
                }
                dyo.engine3d.currentModel.addChild(self.inst3d);
                self.inst3d.extra = { id: Number(self.itemID), src: self.url }
                
                var object = new Engine3D.values.DisplayObjectValue(self.bitmap.cacheCanvas);
                object.setEmbedType(Engine3D.enums.EmbedType.EMBEDDED);
                
                self.inst3d.changeProperty("display_object", object);

                if (self.data3d["height"]) {
                    self.doFlip();
                } else {
                    self.inst3d.changeProperty("height", Number(self.getHeight()));
                }
                
                self.inst3d.changeProperty("layer", 7000 + Number(self.itemID));

                if (self.inst3d.getSelectionObject().getType() == "surface") {
                    self.inst3d.getSelectionObject().setRotatable(false);
                }

                let color = parseInt(self.color.replace("#",""), 16);
                self.inst3d.changeProperty("color", color);

                //self.inst3d.setSelected(true);
                if (dyo.engine.deviceType != "desktop") {
                    self.inst3d.setSelected(false);
                    Engine3D.Controller.getCurrentProject().setSelectedModel(null);
                } else {
                    self.inst3d.setSelected(true);
                }

                if (self.data.x) {
                    let region = self.inst3d.getParentRegion();
                    let modelPosition = region.getModelRegionPosition(self.inst3d);

                    modelPosition.set_x(self.data.x);
                    modelPosition.set_y(self.data.y);
                    modelPosition.set_rotation(self.data.rotation);
                }

                self.addEvents3D();
                self.select();
                dyo.engine.loader.hide("Motif:290");
        
            });

            document.location.href = "#" + dyo.last_url;

        }

    }

    addEvents3D() {

        if (this.events3D) {
            return;
        }

        let self = this;

        self.inst3d.addEventListener(Engine3D.Model3DPropertyEvent.CHANGE, function (e) {

            if (e.getPropertyId() != "display_object") {
                if (e.getPropertyId() == "height") {
                    self.data3d[e.getPropertyId()] = e.getPropertyValue();
                    
                    let size = Math.round(self.data3d[e.getPropertyId()]);

                    if (size > self.max_height) {
                        size = self.max_height;
                    }
            
                    if (size < self.min_height) {
                        size = self.min_height;
                    }                        

                    self.inst3d.changeProperty("height", Number(size));

                    self.setSize(size);
                }
            }
        });

        self.inst3d.addEventListener(Engine3D.Model3D.EVENT_INTERNAL_MODEL_SELECTED, function(e) {
            self.data3d["height"] = self.inst3d.getProperty("height");
            self.select();
        });

        this.events3D = true;

    }

    setInst3d(model) {
        this.inst3d = model;
        this.ready3d = true;
    }

    resize() {
        if (!this.deleted) {
            this.setSize(this.getHeight());
        }
    }

    setRotation(rotate) {
        this.rotation = rotate;

		if (dyo.controller_Rotate) { 
            dyo.controller_Rotate.setValue(this.getRotation());
        }

        this.container.rotation = this.rotation;

        if (dyo.mode == "3d") {
            if (this.inst3d) {
                let region = this.inst3d.getParentRegion();
                let modelPosition = region.getModelRegionPosition(this.inst3d);
                modelPosition.set_rotation(rotate);
            }
        } else {
            this.update();
        }
    }

    getPrice() {
        return this.price;
    }

    setColor(color) {
        this.color = color;
        this.applyColor(this.color);
    }

    set colorName(name) {
        this._colorName = name;
    }

    get colorName() {
        return this._colorName;
    }

    get size() {
        return this.bounds.height * this.ratio;
    }

    set size(size) {
        this.setSize(size);
    }

    setSize(size) {

        this.colorTextureTarget = 0;

        if (dyo.monument.id == 31) {
            this.bitmap.visible = false;
        }

        if (isNaN(size)) {
            return;
        }

        if (size > this.max_height) {
            return;
        }

        if (size < this.min_height) {
            return;
        }

        if (this.bounds) {
            this.ratio = size / this.bmp.height;

            let ratio = dyo.monument.getRatio() * this.ratio;

            this.bitmap.scaleX = this.bitmap.scaleY = ratio;

            if (dyo.monument.id == 31) {
                if (this.productid == 17 || this.productid == 18) {
                    //this.mask_2.getChildAt(0).scaleX = this.mask_2.getChildAt(0).scaleY = ratio;
                }
            }

            this.update();
            this.updateSize();
        }

        if (dyo.monument.id == 31) {
            this.applyColorTexture(this.color_texture, 1);
            if (this.productid == 17 || this.productid == 18) {
                this.applyColorTexture(this.color_texture2, 2);
            }
        }

        dyo.monument.updateHeader();

    }

    getHeight() {
        return Math.round(this.bounds.height * this.ratio);
    }

    getRotation() {
        return this.rotation;
    }

    updateSize() {
        //console.log("@updateSize");
        if (dyo.controller_Size) { 
            //if (this.old_height != this.getHeight()) {
                dyo.controller_Size.setValue(this.getHeight());
                this.old_height = this.getHeight();
            //}
        }
    }

    increase(step) {

        let size;

        if (step == undefined) {
            step = 1;
        }

        if (dyo.usa) {
            step = 2;
        } else {
            size = 1;
        }

		if (dyo.selected) {
            let size = this.bounds.height * this.ratio;

            if (dyo.mode == "3d") {
                if (dyo.engine3d.inst3d) {
                    if (size + step > this.max_height) {
                        dyo.engine3d.inst3d.changeProperty("height", Math.round(this.max_height));
                    } else {
                        dyo.engine3d.inst3d.changeProperty("height", Math.round(size + step));
                    }
                }
            } else {
                if (size + step > this.max_height) {
                    this.setSize(Math.round(this.max_height));
                } else {
                    this.setSize(Math.round(size + step));
                }        
            }
        }
        
    }

    decrease(step) {

        let size;
        
        if (step == undefined) {
            step = 1;
        }

        if (dyo.usa) {
            step = 2;
        } else {
            size = 1;
        }

		if (dyo.selected) {
            let size = this.bounds.height * this.ratio;

            if (dyo.mode == "3d") {
                if (dyo.engine3d.inst3d) {
                    if (size - step < this.min_height) {
                        dyo.engine3d.inst3d.changeProperty("height", Math.round(this.min_height));
                    } else {
                        dyo.engine3d.inst3d.changeProperty("height", Math.round(size - step));
                    }
                }
            } else {
                if (size - step < this.min_height) {
                    this.setSize(Math.round(this.min_height));
                } else {
                    this.setSize(Math.round(size - step));
                }            
            }

        }
        
    }


    delete() {
        dyo.monument.removeItem(this);
		dyo.engine.motifs.reset();
		
        this.container.removeEventListener("mouseover");
        this.container.removeEventListener("mouseout");
        this.container.removeEventListener("mousedown");
        this.container.removeEventListener("pressmove");

        this.container.removeAllChildren();
		
        dyo.engine.canvas.stage.update();
        
        if (dyo.mode == "3d") {
            if (this.inst3d) {
                this.inst3d.removeFromParent();
            }
        }
		
        this.deleted = true;

        dyo.engine.last_action = "delete";
        dyo.currentSection = "Design Menu";
        dyo.monument.updateHeader("Motif:218");

        dyo.engine.designSaved = false;
    }

    setValue(value) {
        dyo.data.height = this.height;

    }

    select() {

        dyo.currentSection = "Motifs";
        dyo.last_url = "add-your-motif";

        document.location.href = "#motif-" + this.itemID;

        if (dyo.mode == "3d") {
            if (this.inst3d) {
                this.inst3d.changeProperty("layer", 7000 + Number(dyo.monument.getItemID()));
                dyo.engine3d.inst3d = this.inst3d;
            }
        }

        dyo.engine.motifs.hide();
        dyo.engine.motifs.motifs_list.hide();
        dyo.engine.motifs.category.hide();
        dyo.engine.motifs.input.hide();
        dyo.engine.motifs.input_motifs_types.hide();

        let r = 0;

        if (dyo.mode == "3d") {
            if (this.inst3d) {
                let region = this.inst3d.getParentRegion();
                let modelPosition = region.getModelRegionPosition(this.inst3d);
                this.rotation = Math.round(modelPosition.get_rotation());
                this.setRotation(this.rotation);
            }
        }

        dyo.engine.hide();
        dyo.engine.motifs.show();
        dyo.engine.motifs.motifs_list.hide();
        dyo.engine.motifs.category.hide();
        dyo.engine.motifs.showButtons();

        dyo.monument.deselectAll();
        dyo.selected = this;
        this.selectOutline.visible = true;
        this.selectOutlineHandlers.visible = true;

        if (dyo.monument.id == 31) {
            switch (this.productid) {
                default:
                    dyo.engine.motifs.radio_button.hide();
                    break;
                case 17: case 18:
                    dyo.engine.motifs.radio_button.show();
                    break;
                }
        }

        if (dyo.monument.id == 52) {
            // max dimmensions
            let _config = dyo.monument._additions.Motifs[0].types[0];
            let min_height = Number(_config.min_height);
            let max_height = Number(_config.max_height);
            this.dimmension_ratio = 1;

            if (this.bounds.width > this.bounds.height) {
                this.dimmension_ratio = this.bounds.height / this.bounds.width;
                min_height = min_height * this.dimmension_ratio;
                max_height = max_height * this.dimmension_ratio;
            } 

            this.min_height = Number(min_height);
            this.max_height = Number(max_height);
            dyo.engine.motifs.slider_size.slider.min = this.min_height;
            dyo.engine.motifs.slider_size.slider.max = this.max_height;
        } else {
            dyo.engine.motifs.slider_size.slider.min = Number(dyo.config._additions.Motifs[0].types[0].min_height);
            dyo.engine.motifs.slider_size.slider.max = Number(dyo.config._additions.Motifs[0].types[0].max_height);
        }

        dyo.engine.motifs.slider_rotation.slider.value = this.rotation;
        $('#dyo_slider_motif_slider_rotation_value', Translate(Lang.ROTATION) + ": " + this.rotation + "&deg;");

        this.updateSize();

        this.stage.setChildIndex(this.container, this.stage.numChildren - 1);

        dyo.engine.canvas.showButtons();

        if (dyo.monument.id == 31) {
            switch (this.productid) {
                default:
                    dyo.engine.motifs.colors_list.show();
                    break;
                case 76:
                    dyo.engine.motifs.colors_list.hide();
                    break;
            }
        }

    }

    update() {

        let self = this;

        if (!this.resizing) {

            if (dyo.mode == "2d") {
                this.cached = true;

                this.lastBounds = this.bounds;

                if (this.bounds == null) {
                    this.bounds = { x: this.lastBounds.x, y: this.lastBounds.y, width: this.lastBounds.width, height: this.lastBounds.height }
                }

            }

            if (dyo.mode == "3d") {
                if (this.bitmapRendered != true) {
                    this.bitmapRendered = true;
                    this.cached = true;
                    this.bitmap.uncache();

                    this.lastBounds = this.bounds;
                    this.bounds = this.bitmap.getBounds();

                    if (this.bounds == null) {
                        this.bounds = { x: this.lastBounds.x, y: this.lastBounds.y, width: this.lastBounds.width, height: this.lastBounds.height }
                    }

                    this.bitmap.cache(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);
                }
            }

        }

        if (dyo.mode == "2d") {
            this.drawOutline();
            this.drawHandlers();
        }

    }

    applyColor(hex) {

        if (hex == undefined) {
            hex = '#000000';
        }

        let self = this;

        this.color = hex;

        var bigint = parseInt(this.color.replace("#", ""), 16);
        var r = (bigint >> 16) & 255;
        var g = (bigint >> 8) & 255;
        var b = bigint & 255;

        if (dyo.mode == "2d") {
            this.bitmap.filters = [
                new createjs.ColorFilter(0, 0, 0, 1, r, g, b),
            ];

            this.bitmap.cache(this.bounds.x, this.bounds.y, this.bounds.width, this.bounds.height);

            this.update();
        }

        if (dyo.mode == "3d") {
            if (dyo.edit == false) {
                if (this.inst3d) {
                    var object = new Engine3D.values.DisplayObjectValue(self.bitmap.cacheCanvas);
                    object.setEmbedType(Engine3D.enums.EmbedType.EMBEDDED);

                    let old_height = self.inst3d.getProperty("height");
                    self.inst3d.changeProperty("display_object", object);
                    self.inst3d.changeProperty("height", Number(old_height));

                    if (self.data3d["height"]) {
                        self.doFlip();
                    }

                    let color = parseInt(hex.replace("#",""), 16);
                    self.inst3d.changeProperty("color", color);

                }
            }
        }

    }

    deselect() {
        dyo.selected = null;
        this.selectOutline.visible = false;
        this.selectOutlineHandlers.visible = false;
    }

    duplicate() {

        this.deselect();
        
        let ratio = dyo.monument.getRatio() * this.ratio;

        let _x, _y;

        if (dyo.mode == "3d") {

            let parent = this.inst3d.getParent();
            let region = this.inst3d.getParentRegion();
            let modelPosition = region.getModelRegionPosition(this.inst3d);

            switch (parent.getGeneralType()) {
                default:
                    dyo.engine3d.currentModel = dyo.engine3d.headstone3d;
                    break;
                case "Scenery":
                    dyo.engine3d.currentModel = dyo.engine3d.currentModel.lastGeneralType;
                    break;
                case "lid":
                    dyo.engine3d.currentModel = dyo.engine3d.ledger3d;
                    break;
            }
            
            _x = modelPosition.get_x() - this.inst3d.getProperty("width");
            _y = modelPosition.get_y();

            if (dyo.engine.deviceType != "desktop") {
                this.inst3d.setSelected(false);
            }

        } else {
			_x =  this.container.x + (this.bounds.width * ratio);
            _y = this.container.y;
        }

        let motif_obj = { 
            data3d: this.data3d,
            productid: this.productid,
			side: this.side, 
			bmp: this.bmp,
            src: this.src,
            item: this.item,
            color: this.color,
            color_texture: this.color_texture,
            color_texture2: this.color_texture2,
            colorName: this.colorName,
            colorName2: this.colorName2,
			x: _x,
            y: _y,
            flipx: this.flipx,
            flipy: this.flipy,
            rotation: this.rotation,
            ratio: this.ratio,
			draggable: true,
			selected: true,
			scale: 1
        }

        if (dyo.monument.id == 31) {
            motif_obj.color_texture = this.color_texture;
            motif_obj.color_texture2 = this.color_texture2;
            this.firstPaint = false;
        }

		let motif = new Motif(motif_obj);
		this.parent.add(motif);

        dyo.engine.designSaved = false;
		
    }

    setPosition(point) {
        this.container.x = point.x;
        this.container.y = point.y;
    }

    getPosition() {
        let point = {
            x: this.data.x,
            y: this.data.y
        }
        return point;
    }

    serialize(json) {

        this.quantity = 1;

        let self = {};

        self.productid = this.productid;
        self.name = dyo.monument._additions.Motifs[0].name;
        self.type = this.type;
        self.part = this.parent.type;
        self.side = this.side;
        self.src = this.src;
        self.item = this.item;
        self.price = this.price;
        self.quantity = this.quantity;
        self.color = this.color;
        self.colorName = this.colorName;
        self.colorName2 = this.colorName2;
        self.x = this.container.x;
        self.y = this.container.y;
        self.flipx = this.flipx;
        self.flipy = this.flipy;
        self.rotation = this.rotation;
        self.height = this.getHeight();
        self.ratio = this.ratio;
        self.itemID = this.itemID;

        if (dyo.monument.id == 31) {

            if (this.productid == 17 || this.productid == 18) {
                self.color_texture = this.color_texture;
                self.color_texture2 = this.color_texture2;
            } else {
                self.color_texture = this.color_texture;
            }

        }

        if (json) {
            return JSON.stringify(self);
        } else {
            return self;
        }
    }
    
}