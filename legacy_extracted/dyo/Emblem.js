import {Item} from './Item.js';
import {Lang, Translate, $} from '../Const.js';

const LANDSCAPE = 0;
const PORTRAIT = 1;
const SQUARE = 2;

const MASK_PORTRAIT_OVAL = 0;
const MASK_PORTRAIT_RECTANGLE = 1;
const MASK_LANDSCAPE_OVAL = 2;
const MASK_LANDSCAPE_RECTANGLE = 3;
const MASK_SQUARE = 4;

const COLOR_FULL = 0;
const COLOR_GREY = 1;
const COLOR_SEPIA = 2;

export class Emblem extends Item {
	constructor(data = {}) {

        super(data);

        this.type = 'Emblem';
        this.side = data.side;
        this.parent = data.parent;

        this.resizing = false;
        this.price = 0;
        this.id = data.id;
        this.uid = data.uid;
        this.name = data.name;
        this.mask = data.mask;
        this.color = data.color;
        this.ratio = data.ratio;
        this.x = data.x;
        this.y = data.y;
        this.flipx = data.flipx;
        this.flipy = data.flipy;
        this.rotation = data.rotation;
        this.draggable = data.draggable;
        this.selected = data.selected;
        this.src = data.src;
        this.item = data.item;
        this.bmp = data.bmp;
        this.original = data.bmp;
        this.emblem_size = data.size;
        this.shape_url = data.shape_url;
        this.data = data;
        this.productid = this.id;
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

        if (data.itemID && dyo.mode == "3d") {
            this.itemID = data.itemID;
        } else {
            this.itemID = dyo.monument.getItemID();
        }

        this.config();
        dyo.monument.addItem(this);

    }

    get id() {
        return this._id;
    }

    set id(id) {
        this._id = id;
    }

    getWidth() {
        return Math.round(this.emblemBounds.width * this.ratio) + " mm";
    }

    getHeight() {
        return Math.round(this.emblemBounds.height * this.ratio) + " mm";
    }

    getRotation() {
        return this.rotation;
    }

    getSize() {
        return this.emblem_size;
    }

    getQuoteSize() {

        let size = this.emblem_size.split(' x ');
        let width = size[0];
        let height = size[1].replace(' mm', '');
        let ratio = this.ratio;

        if (this.img_type == PORTRAIT) {
            size = Math.round((ratio * this.emblemBounds.width) / dyo.monument.getRatio()) + " mm" + " x " + (ratio * this.emblemBounds.height) / dyo.monument.getRatio() + " mm";
        }
        if (this.img_type == LANDSCAPE) {
            size = width + " x " + Math.round((ratio * this.emblemBounds.height) / dyo.monument.getRatio()) + " mm";
        }
        if (this.img_type == SQUARE) {
            size = width + " x " + Math.round((ratio * this.emblemBounds.height) / dyo.monument.getRatio()) + " mm";
        }

        return size;

    }

    config() {

		let nr = 0;
		let loop = 0;

		dyo.config._additions.Emblems.forEach(emblem => {
			if (emblem.id == this.id) {
				nr = loop;
			}
			loop ++;
		});

        let _config;
        
        if (dyo.monument._additions.Emblems[nr].types.length > 0) {
            _config = dyo.monument._additions.Emblems[nr].types[0];
        } else {
            _config = dyo.monument._additions.Emblems[nr];
        }

        this.min_width = Number(_config.min_width);
        this.max_width = Number(_config.max_width);
        this.init_width = Number(_config.init_width);

        this.min_height = Number(_config.min_height);
        this.max_height = Number(_config.max_height);
        this.init_height = Number(_config.init_height);

        if (this.min_width == this.max_width) {
            this.fixed = true;
        } else {
            this.fixed = false;
        }

    }

    get_min() {
        return this.min_height;
    }

    get_max() {
        return this.max_height;
    }

    render() {

		this.stage = this.parent.containers["Design_" + this.side]
		
        this.container = new createjs.Container();
        this.stage.addChild(this.container);

        if (this.bmp.width > this.bmp.height) {
            this.img_type = LANDSCAPE;

            let a = 1 - (this.bmp.height / this.bmp.width);
            if (a < 0.1) {
                this.img_type = SQUARE;
            }
        }

        if (this.bmp.height > this.bmp.width) {
            this.img_type = PORTRAIT;

            let a = 1 - (this.bmp.width / this.bmp.height);
            if (a < 0.1) {
                this.img_type = SQUARE;
            }
        }

        if (this.bmp.height == this.bmp.width) {
            this.img_type = SQUARE;
        }

        let bmp = new createjs.Bitmap(this.bmp);
        let scale = (dyo.h * .5) / this.bmp.height;

        bmp.cache(0, 0, this.bmp.width, this.bmp.height, scale);
        
        this.bitmap = new createjs.Bitmap(bmp.cacheCanvas);
        this.bitmap.regX = (this.bmp.width * scale) / 2;
        this.bitmap.regY = (this.bmp.height * scale) / 2;

        if (!this.ratio) {
            this.ratio = this.init_height / this.bmp.height;
        }

        this.wh_ratio = this.bmp.width / this.bmp.height;

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

        this.emblemBounds = this.bitmap.getBounds();

        this.bitmap.cache(this.emblemBounds.x, this.emblemBounds.y, this.emblemBounds.width * this.ratio, this.emblemBounds.height * this.ratio);

        this.bounds = this.bitmap.getBounds();

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

        this.setRotation(this.rotation);
        this.resize();

        if (this.selected) {
            this.select();
        } else {
            this.selectOutline.visible = false;
            this.selectOutlineHandlers.visible = false;
        }

        if (dyo.mode == "3d") {
            this.add3D();
        }

        dyo.engine.last_action = "render";
        dyo.monument.updateHeader("Emblem:398");

    }

    setInst3d(model) {
        this.inst3d = model;
        this.ready3d = true;
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
                        case "ledger":
                            break;
                    }
                } else {
                    dyo.engine3d.currentModel = dyo.engine3d.headstone3d;
                }

                dyo.engine3d.currentModel.addChild(self.inst3d);
                
                var object = new Engine3D.values.DisplayObjectValue(self.bitmap.cacheCanvas);
                object.setEmbedType(Engine3D.enums.EmbedType.EMBEDDED);

                self.inst3d.changeProperty("display_object", object);
                self.inst3d.extra = { id: Number(self.itemID) }

                if (self.data3d["height"]) {
                    self.doFlip();
                } else {
                    if (self.img_type == PORTRAIT) {
                        self.inst3d.changeProperty("height", 50);
                        self.setSize("50 x 50 mm");
                    } else {
                        self.inst3d.changeProperty("width", 50);
                        self.setSize("50 x 50 mm");
                    }
                }
                
                self.inst3d.changeProperty("layer", 6000 + Number(self.itemID));

                if (self.inst3d.getSelectionObject().getType() == "surface") {
                    self.inst3d.getSelectionObject().setRotatable(false);
                }

                self.inst3d.setSelected(true);

                self.select();

                if (self.data.x) {
                    let region = self.inst3d.getParentRegion();
                    let modelPosition = region.getModelRegionPosition(self.inst3d);

                    modelPosition.set_x(self.data.x);
                    modelPosition.set_y(self.data.y);
                    modelPosition.set_rotation(self.data.rotation);
                }

                dyo.engine.loader.hide("Motif:290");

                var n = 0;

                self.inst3d.addEventListener(Engine3D.Model3DPropertyEvent.CHANGE, function (e) {
                    
                    if (e.getPropertyId() != "display_object") {
                        self.data3d[e.getPropertyId()] = e.getPropertyValue();

                        if (self.img_type == PORTRAIT) {
                            if (e.getPropertyId() == "height") {

                                if (dyo.engine3d.lockUpdate != true) {

                                    let size = self.emblemsHeight;
                                    let h;
                                    
                                    h = e.getPropertyValue();

                                    for (let nr = size.length; nr > 0; nr --) {
                                        if (h > size[nr - 1] && h < size[nr]) {
                                            n = nr - 1;
                                        }
                                    }

                                    self.inst3d.changeProperty("height", Number(size[n]));
                                    
                                    let emblem_sizes = self.emblem_sizes();
                                    self.emblem_size = emblem_sizes[n].name;
                                    self.setSize(emblem_sizes[n].name);
                                    dyo.engine.emblems.slider_size.slider.value = (n + 1);

                                } else {
                                    dyo.engine3d.lockUpdate = false;
                                }

                            }

                        } else {

                            if (e.getPropertyId() == "height") {
                                if (dyo.engine3d.lockUpdate != true) {
                                    if (Math.round(self.inst3d.getProperty("height")) != self.useHeight) {
                                        self.inst3d.changeProperty("height", Number(self.useHeight));
                                    }
                                }
                            }

                            if (e.getPropertyId() == "width") {

                                if (dyo.engine3d.lockUpdate != true) {

                                    let size = self.emblemsHeight;
                                    let h;
                                    
                                    h = e.getPropertyValue();

                                    for (let nr = size.length; nr > 0; nr --) {
                                        if (h > size[nr - 1] && h < size[nr]) {
                                            n = nr - 1;
                                        }
                                    }
                                    self.inst3d.changeProperty("width", Number(size[n]));
                                    self.useHeight = Math.round(size[n] / self.wh_ratio);

                                    let emblem_sizes = self.emblem_sizes();
                                    self.emblem_size = emblem_sizes[n].name;
                                    self.setSize(emblem_sizes[n].name);
                                    dyo.engine.emblems.slider_size.slider.value = (n + 1);

                                } else {
                                    //dyo.engine3d.lockUpdate = false;
                                }

                            }

                        }

                    }
                    
                });

                self.inst3d.addEventListener(Engine3D.Model3D.EVENT_INTERNAL_MODEL_SELECTED, function(e) {
                    dyo.engine3d.lockUpdate = false;
                    self.data3d["width"] = self.inst3d.getProperty("width");
                    self.data3d["height"] = self.inst3d.getProperty("height");
                    self.select();
                });

                self.inst3d.addEventListener(Engine3D.Model3D.EVENT_INTERNAL_MOUSE_OVER, function(e) {
                    dyo.engine3d.lockUpdate = false;
                });

            });

        }

    }

    getPrice() {
        return this.price;
    }

    resize() {
        if (!this.deleted) {
            this.setSize(this.emblem_size);
        }
    }

    set size(size) {
        this.setSize(size);
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

    updateSize() {

        if (this.fixed) {

            let size = this.emblem_size.split(' x ');
            let width = size[0];
            let height = size[1].replace(' mm', '');

            let ratio = this.ratio;

            if (dyo.controller_Size) { 
                if (this.img_type == PORTRAIT) {

                    if (dyo.metric == "inches") {
                        $('#dyo_slider_emblem_size_value', Translate(Lang.SIZE) + ": " + dyo.engine.metrics.toInch(Math.round((ratio * this.emblemBounds.width) / dyo.monument.getRatio())) + " x " + dyo.engine.metrics.toInch((ratio * this.emblemBounds.height) / dyo.monument.getRatio()));
                    } else {
                        $('#dyo_slider_emblem_size_value', Translate(Lang.SIZE) + ": " + Math.round((ratio * this.emblemBounds.width) / dyo.monument.getRatio()) + " mm" + " x " + Math.round((ratio * this.emblemBounds.height) / dyo.monument.getRatio()) + " mm");
                    }
                    
                }
                if (this.img_type == LANDSCAPE) {

                    if (dyo.metric == "inches") {
                        $('#dyo_slider_emblem_size_value', Translate(Lang.SIZE) + ": " + dyo.engine.metrics.toInch(width) + " x " + dyo.engine.metrics.toInch(Math.round((ratio * this.emblemBounds.height) / dyo.monument.getRatio())));
                    } else {
                        $('#dyo_slider_emblem_size_value', Translate(Lang.SIZE) + ": " + width + " x " + Math.round((ratio * this.emblemBounds.height) / dyo.monument.getRatio()) + " mm");
                    }
                    
                }
                if (this.img_type == SQUARE) {

                    if (dyo.metric == "inches") {
                        $('#dyo_slider_emblem_size_value', Translate(Lang.SIZE) + ": " + dyo.engine.metrics.toInch(width) + " x " + dyo.engine.metrics.toInch(Math.round((ratio * this.emblemBounds.height) / dyo.monument.getRatio())) + " mm");
                    } else {
                        $('#dyo_slider_emblem_size_value', Translate(Lang.SIZE) + ": " + width + " x " + Math.round((ratio * this.emblemBounds.height) / dyo.monument.getRatio()) + " mm");
                    }

                }
            }

        }

    }

    emblemSizes() {
        return this.emblem_sizes(this.id);
    }

    delete() {
        dyo.monument.removeItem(this);
        dyo.engine.emblems.reset();
        
        this.container.removeEventListener("mouseover");
        this.container.removeEventListener("mouseout");
        this.container.removeEventListener("mousedown");
        this.container.removeEventListener("pressmove");

        this.container.removeChildAt(2);
        this.container.removeChildAt(1);
		this.container.removeChildAt(0);
		
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

    getEmblemSizeId() {

        let emblem_size_id;
        let emblem_sizes = this.emblemSizes();
        let id = 1;

        emblem_sizes.forEach(size => {

            if (this.emblem_size == size.name) {
                emblem_size_id = id;
            }

            id ++;

        });

        return emblem_size_id;

    }

    select() {

        dyo.currentSection = "Emblems";

        dyo.last_url = "add-your-emblem";

        if (dyo.mode == "3d") {
            if (this.inst3d) {
                this.inst3d.changeProperty("layer", 6000 + Number(dyo.monument.getItemID()));
                dyo.engine3d.inst3d = this.inst3d;
            }
        }

        const nonFlippable = this.emblems_nonflippable();

        let flippable = true;

        nonFlippable.forEach(emblem => {
            if (this.src.indexOf(emblem) > -1) {
                flippable = false;
            }
        });

        this.setupSlider();

        document.location.href = "#emblem-" + this.itemID;

        dyo.engine.hide();
        dyo.engine.emblems.show();
        dyo.engine.emblems.emblems_list.hide();
        dyo.engine.emblems.showButtons();


        if (!flippable) {
            dyo.engine.emblems.buttonFlipX.hide();
            dyo.engine.emblems.buttonFlipY.hide();
        } else {
            dyo.engine.emblems.buttonFlipX.show();
            dyo.engine.emblems.buttonFlipY.show();
        }

        $('#dyo_emblems_title', Translate(Lang.EMBLEMS) + " <i class='material-icons'>help_outline</i>");
        
        this.updateSize();

        dyo.monument.deselectAll();
        dyo.selected = this;

        this.selectOutline.visible = true;
        this.selectOutlineHandlers.visible = true;

        dyo.engine.emblems.slider_size.setValue(this.getEmblemSizeId());

        dyo.engine.emblems.slider_rotation.slider.value = this.rotation;

        this.setRotation(this.rotation);

        if (dyo.engine.deviceType != "mobile") {
            if (dyo.engine.drawer.drawer.open == false) {
                dyo.engine.drawer.drawer.open = true;
            } 
        }

        this.stage.setChildIndex(this.container, this.stage.numChildren - 1);

        dyo.engine.canvas.showButtons();
        
        if (dyo.mode == "3d") {
            dyo.engine3d.inst3d = this.inst3d;
        }
        
    }

    update() {

        if (!this.resizing) {

            this.bitmap.uncache();

            this.lastBounds = this.emblemBounds;
            this.emblemBounds = this.bitmap.getBounds();

            if (this.emblemBounds == null) {
                this.emblemBounds = { x: this.lastBounds.x, y: this.lastBounds.y, width: this.lastBounds.width, height: this.lastBounds.height }
            }

            this.bitmap.cache(this.emblemBounds.x, this.emblemBounds.y, this.emblemBounds.width, this.emblemBounds.height);

        }
        
        this.drawOutline();
        this.drawHandlers();

    }

    isFixed() {
        return this.fixed;
    }

    getWidthMm() {
        if (this.fixed) {
            return Number(this.emblem_size.split(' x ')[0]);
        } else {
            return Math.round(this.emblemBounds.width * this.ratio) * dyo.monument.getRatio();
        }
    }

    getHeightMm() {
        if (this.fixed) {
            return Number(this.emblem_size.split(' x ')[1].replace(' mm', ''));
        } else {
            return Math.round(this.emblemBounds.height * this.ratio) * dyo.monument.getRatio();
        }
    }

    setupSlider() {

        let sizes = this.emblemSizes();

        if (sizes.length > 1) {
            dyo.engine.emblems.slider_size.slider.min = 1;
            dyo.engine.emblems.slider_size.slider.max = sizes.length;
            dyo.engine.emblems.slider_size.slider.value = this.emblem_size;
        } else {
            dyo.engine.emblems.slider_size.slider.max = Number(sizes[0].max_height);
            dyo.engine.emblems.slider_size.slider.min = Number(sizes[0].min_height);
            dyo.engine.emblems.slider_size.slider.value = this.emblem_size;
        }

    }

    setSize(size) {

        this.setupSlider();
        
        let sizes = this.emblemSizes();
        let nr = 0;

        if (isNaN(size)) {
            // has text
            this.emblem_size = size;
        } else {
            // is number
            if (this.fixed) {
                sizes.forEach(_size => {

                    if (size > _size.min_width) {
                        this.emblem_size = _size.name;
                        dyo.engine.emblems.slider_size.setValue(nr);
                    }
                    nr++;

                });
            } else {
                this.emblem_size = size;
            }
        }

        let ratio = dyo.monument.getRatio();

        if (this.fixed) {

            let width = this.getWidthMm();
            let height = this.getHeightMm();

            if (this.emblemBounds.width > this.emblemBounds.height) {
                this.bitmap.scaleX = this.bitmap.scaleY = (height * ratio) / this.emblemBounds.width;
            } else {
                this.bitmap.scaleX = this.bitmap.scaleY = (width * ratio) / this.emblemBounds.height;
            }

        } else {

            if (isNaN(size)) {
                size = 100;
            }

            if (size < this.get_min()) {
                size = this.get_min();
            }

            if (size > this.get_max()) {
                size = this.get_max();
            }

            this.emblem_size = size;

            this.ratio = size / this.emblemBounds.height;
            this.bitmap.scaleX = this.bitmap.scaleY = ratio * this.ratio;

        }

        this.ratio = this.bitmap.scaleX;

        this.update();
        this.updateSize();

    }

    
    drawOutline() {

        let ratio = this.ratio;

        this.outline = {
            x: 0,
            y: 0,
            width: ratio * this.emblemBounds.width,
            height: ratio * this.emblemBounds.height
        }

        this.selectOutline.graphics.clear();
        this.selectOutline.graphics.s(this.outlineColor).ss(5)
        .drawRect(this.outline.x, this.outline.y, this.outline.width, this.outline.height);
        this.selectOutline.cache(this.outline.x, this.outline.y, this.outline.width, this.outline.height);

        this.bounds = this.outline;

        this.selectOutline.x = -(ratio * this.emblemBounds.width) / 2;
        this.selectOutline.y = -ratio * (this.emblemBounds.height / 2);

    }

    deselect() {
        dyo.selected = null;
        this.selectOutline.visible = false;
        this.selectOutlineHandlers.visible = false;
    }

    duplicate() {
        this.deselect();

        let _x, _y;

        if (dyo.mode == "3d") {
            let region = this.inst3d.getParentRegion();
            let modelPosition = region.getModelRegionPosition(this.inst3d);

            _x = modelPosition.get_x() - this.inst3d.getProperty("width");
            _y = modelPosition.get_y();
        } else {
			_x =  this.container.x + this.bounds.width;
            _y = this.container.y;
        }

		let emblem = new Emblem({ 
            id: this.id, 
            uid: this.uid,
            productid: this.id, 
            data3d: this.data3d,
            name: this.name,
            side: this.side, 
            size: 1,
            bmp: this.bmp,
            src: this.src,
            src_original: this.src_original,
            item: this.item,
            color: this.color,
            size: this.emblem_size,
            mask: this.mask,
			x: _x,
            y: _y,
            flipx: this.flipx,
            flipy: this.flipy,
            rotation: this.rotation,
            ratio: this.ratio,
            shape_url: this.shape_url,
			draggable: true,
			selected: true
		});
		
		this.parent.add(emblem);
		
        dyo.engine.designSaved = false;
    }

    serialize(json) {

        this.updateSize()

        this.quantity = 1;

        const self = {};

        self.productid = this.id;
        self.id = this.id;
        self.uid = this.uid;
        self.name = dyo.monument._additions.Emblems[0].name,
        self.type = this.type;
        self.item = this.item;
        self.color = this.color;
        self.mask = this.mask;
        self.x = this.container.x;
        self.y = this.container.y;
        self.flipx = this.flipx;
        self.flipy = this.flipy;
        self.rotation = this.rotation;
        self.ratio = this.ratio;
        self.shape_url = this.shape_url;

        self.part = this.parent.type;
        self.side = this.side;
        self.src = this.src;
        self.price = this.price;
        self.quantity = this.quantity;

        if (this.fixed) {

            let size = this.emblem_size.split(' x ');
            let width = size[0];
            let height = size[1].replace(' mm', '');

            if (dyo.controller_Size) { 
                if (this.img_type == PORTRAIT) {
                    self.size = this.emblem_size;
                }
                if (this.img_type == LANDSCAPE) {
                    self.size = height + " x " + width + " mm";
                }

                self.size = this.emblem_size;
                
            } else {
                self.size = this.getSize();
            }

        } else {
            self.size = this.getSize();
            self.width = this.getWidth();
            self.height = this.getHeight();
        }

        self.itemID = this.itemID;

        if (json) {
            return JSON.stringify(self);
        } else {
            return self;
        }
    }
    
}