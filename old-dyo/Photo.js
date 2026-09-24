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

export class Photo extends Item {
	constructor(data = {}) {

        super(data);

        this.type = 'Photo';
        this.side = data.side;
        this.parent = data.parent;
        this.part = data.part;

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
        this.photo_size = data.size;
        this.shape_url = data.shape_url;
        this.path = data.path;
        this.data = data;

        if (data.data3d) {
            this.data3d = data.data3d;
        } else {
            this.data3d = {};
        }

        this.productid = this.id;

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

        // select 
        dyo.selected = this;

        this.config();
        dyo.engine.photos.setupPhotoSection();
        dyo.monument.addItem(this);

    }

    get id() {
        return this._id;
    }

    set id(id) {
        this._id = id;
    }

    getWidth() {
        return Math.round(this.photoBounds.width * this.ratio) + " mm";
    }

    getHeight() {
        return Math.round(this.photoBounds.height * this.ratio) + " mm";
    }

    getRotation() {
        return this.rotation;
    }

    getSize() {
        return this.photo_size;
    }

    config() {

		let nr = 0;
		let loop = 0;

		dyo.config._additions.Images.forEach(image => {
			if (image.id == this.id) {
				nr = loop;
			}
			loop ++;
		});

        let _config;
        
        if (dyo.monument._additions.Images[nr].types.length > 0) {
            _config = dyo.monument._additions.Images[nr].types[0];
        } else {
            _config = dyo.monument._additions.Images[nr];
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

        dyo.engine.photos.uploadPhotoId = this.id;

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

        this.photoBounds = this.bitmap.getBounds();
        this.bounds = this.bitmap.getBounds();

        this.bitmap.cache(this.photoBounds.x, this.photoBounds.y, this.photoBounds.width * this.ratio, this.photoBounds.height * this.ratio);

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

        this.applyColor(this.color);
        this.applyMask(this.mask);
        this.setRotation(this.rotation);
        this.resize();

        if (this.selected) {
            this.select();
        } else {
            this.selectOutline.visible = false;
            this.selectOutlineHandlers.visible = false;
        }

        //if (!dyo.edit) {
            this.createImage();
        //}

        if (dyo.mode == "3d") {
            this.add3D();
        }

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
                self.inst3d.extra = { id: Number(self.itemID) }

                var object = new Engine3D.values.DisplayObjectValue(self.bitmap.cacheCanvas);
                object.setEmbedType(Engine3D.enums.EmbedType.EMBEDDED);

                self.inst3d.changeProperty("display_object", object);

                if (self.data3d["height"]) {
                    self.doFlip();
                } else {
                    if (self.fixed) {
                        self.inst3d.fixed = true;
                        if (self.img_type == PORTRAIT) {
                            self.inst3d.changeProperty("height", 70);
                            self.setSize("50 x 70 mm");
                        } else {
                            self.inst3d.changeProperty("width", 50);
                            self.setSize("70 x 50 mm");
                        }
                    } else {
                        self.inst3d.fixed = false;
                        if (self.img_type == PORTRAIT) {
                            self.inst3d.changeProperty("height", 70);
                            self.setSize(70);
                        } else {
                            self.inst3d.changeProperty("width", 50);
                            self.setSize(50);
                        }

                    }
                }
                self.inst3d.changeProperty("layer", 1 + Number(self.itemID));

                if (self.inst3d.getSelectionObject().getType() == "surface") {
                    self.inst3d.getSelectionObject().setRotatable(false);
                }
                
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

        var n = 0;

        self.inst3d.addEventListener(Engine3D.Model3DPropertyEvent.CHANGE, function (e) {
            
            if (self.isFixed()) {
                if (e.getPropertyId() != "display_object") {
                    self.data3d[e.getPropertyId()] = e.getPropertyValue();

                    if (self.img_type == PORTRAIT) {
                        if (e.getPropertyId() == "height") {

                            if (dyo.engine3d.lockUpdate != true) {

                                let size = self.photosHeight;
                                let h;
                                
                                h = e.getPropertyValue();

                                for (let nr = size.length; nr > 0; nr --) {
                                    if (h > size[nr - 1] && h < size[nr]) {
                                        n = nr - 1;
                                    }
                                }

                                self.inst3d.changeProperty("height", Number(size[n]));
                                
                                let photo_sizes = self.photos_sizes(self.productid);

                                try {
                                    if (photo_sizes[n] == undefined) {
                                        self.photo_size = photo_sizes[n-1].name;
                                        self.setSize(photo_sizes[n-1].name);
                                    } else {
                                        self.photo_size = photo_sizes[n].name;
                                        self.setSize(photo_sizes[n].name);
                                    }
                                    dyo.engine.photos.slider_size.slider.value = (n + 1);
                                }
                                catch(e) {
                                    console.log(e);
                                }

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

                                let size = self.photosHeight;
                                let h;
                                
                                h = e.getPropertyValue();

                                for (let nr = size.length; nr > 0; nr --) {
                                    if (h > size[nr - 1] && h < size[nr]) {
                                        n = nr - 1;
                                    }
                                }

                                self.inst3d.changeProperty("width", Number(size[n]));
                                self.useHeight = Math.round(size[n] / self.wh_ratio);

                            let photo_sizes = self.photos_sizes(self.productid);

                                try {
                                    if (photo_sizes[n] == undefined) {
                                        self.photo_size = photo_sizes[n-1].name;
                                        self.setSize(photo_sizes[n-1].name);
                                    } else {
                                        self.photo_size = photo_sizes[n].name;
                                        self.setSize(photo_sizes[n].name);
                                    }
                                    dyo.engine.photos.slider_size.slider.value = (n + 1);
                                }
                                catch(e) {
                                    console.log(e);
                                }

                            } else {
                                //dyo.engine3d.lockUpdate = false;
                            }

                        }

                    }

                }

            } else {

                if (e.getPropertyId() != "display_object") {
                    self.data3d[e.getPropertyId()] = e.getPropertyValue();
                    if (self.isFixed() == false) {
                        self.setSize(self.data3d["height"]);
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

        this.events3D = true;
        dyo.monument.updateHeader("Photo:458");

    }

    setInst3d(model) {
        this.inst3d = model;
        this.ready3d = true;
    }

    getPrice() {
        return this.price;
    }

    resize() {
        if (!this.deleted) {
            this.setSize(this.photo_size);
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
            //this.update();
        }

    }

    updateSize() {

        if (this.fixed) {

            let size = this.photo_size.split(' x ');
            let width = size[0];
            let height = size[1].replace(' mm', '');

            if (dyo.controller_Size) { 

                if (dyo.metric == "inches") {

                    if (this.img_type == PORTRAIT) {
                        $('#dyo_slider_photo_size_value', Translate(Lang.SIZE) + ": " + dyo.engine.metrics.toInch(width) + " x " + dyo.engine.metrics.toInch(height));
                    }
                    if (this.img_type == LANDSCAPE) {
                        $('#dyo_slider_photo_size_value', Translate(Lang.SIZE) + ": " + dyo.engine.metrics.toInch(height) + " x " + dyo.engine.metrics.toInch(width));
                    }

                } else {

                    if (this.img_type == PORTRAIT) {
                        $('#dyo_slider_photo_size_value', Translate(Lang.SIZE) + ": " + this.photo_size);
                    }
                    if (this.img_type == LANDSCAPE) {
                        $('#dyo_slider_photo_size_value', Translate(Lang.SIZE) + ": " + height + " x " + width + " mm");
                    }

                }

            }

        } else {

            if (dyo.controller_Size) { 

                dyo.controller_Size.setValue(this.photo_size);

                if (dyo.metric == "inches") {
                    $('#dyo_slider_photo_size_value', Translate(Lang.SIZE) + ": " + dyo.engine.metrics.toInch(this.photo_size) + " mm");
                } else {
                    $('#dyo_slider_photo_size_value', Translate(Lang.SIZE) + ": " + Math.round(this.photo_size) + " mm");
                }

            }

        }

    }

    photoSizes() {
        if (this.id == 2300) {
            switch (this.mask) {
                default:
                    return this.photos_sizes(this.id, "photo:580");
                    break;
                case 1: case 3: case 4:
                    let sizes = this.photos_sizes(this.id, "photo:583");
                    let removedSize = sizes.splice(-1);
                    dyo.engine.sizes.slider_size.setMax(this.photos_sizes(this.id, "photo:585").length - 2);
                    return sizes;
                    break;
            }
        } else {
            return this.photos_sizes(this.id, "photo:590");
        }

    }

    delete() {
        dyo.monument.removeItem(this);
		dyo.engine.motifs.reset();
		
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
        dyo.currentSection = "Design Menu";
        dyo.monument.updateHeader("Motif:218");

        dyo.engine.designSaved = false;
    }

    setValue(value) {
        dyo.data.height = this.height;
    }

    getPhotoSizeId() {

        let photo_size_id;
        let photo_sizes = this.photoSizes();
        let id = 1;

        photo_sizes.forEach(size => {

            if (this.photo_size == size.name) {
                photo_size_id = id;
            }

            id ++;

        });

        return photo_size_id;

    }

    select() {

        dyo.currentSection = "Photos";

        dyo.last_url = "add-your-photo";

        if (dyo.mode == "3d") {
            if (this.inst3d) {
                this.inst3d.changeProperty("layer", 1 + Number(dyo.monument.getItemID()));
                dyo.engine3d.inst3d = this.inst3d;
            }
        }

        this.setupSlider();

        document.location.href = "#photo-" + this.itemID;

        dyo.engine.hide();
        dyo.engine.photos.show();
        dyo.engine.photos.showButtons();
        dyo.engine.photos.uploadPhotoId = this.id;
        
        $('#dyo_photos_title', Translate(Lang.IMAGES) + " <i class='material-icons'>help_outline</i>");
        
		// Photo name
        $('#dyo_photos_name_title').innerHTML = this.name;
        dyo.engine.photos.photo_name_title.show();        
        
        document.querySelector(".container-photos-internal .slider-size-container").style.marginTop = "0px";

        this.updateSize();

        // select 
        dyo.monument.deselectAll();
        dyo.selected = this;
        
        this.selectOutline.visible = true;
        this.selectOutlineHandlers.visible = true;

        // set slider size
        dyo.engine.photos.slider_size.setValue(this.getPhotoSizeId());

        // set rotation
        dyo.engine.photos.slider_rotation.slider.value = this.rotation;

        this.setRotation(this.rotation);

        if (!dyo.selected) {
            dyo.engine.photos.hideAll();
        } else {
            dyo.engine.photos.showPhotosContainersAndButtons();
        }

        if (dyo.engine.deviceType != "mobile") {
            if (dyo.engine.drawer.drawer.open == false) {
                dyo.engine.drawer.drawer.open = true;
            } 
        }

        this.stage.setChildIndex(this.container, this.stage.numChildren - 1);

        dyo.engine.canvas.showButtons();
        
    }

    update() {

        if (!this.resizing) {

            this.bitmap.uncache();

            this.lastBounds = this.photoBounds;
            this.photoBounds = this.bitmap.getBounds();

            if (this.photoBounds == null) {
                this.photoBounds = { x: this.lastBounds.x, y: this.lastBounds.y, width: this.lastBounds.width, height: this.lastBounds.height }
            }

            this.bitmap.cache(this.photoBounds.x, this.photoBounds.y, this.photoBounds.width, this.photoBounds.height);

        }

        if (dyo.mode == "2d") {
            this.drawOutline();
            this.drawHandlers();
        }

        //this.selectOutline.visible = true;
    }

    applyColor(color) {

        //if (dyo.selected) {

            this.color = color;

            switch (color) {
                default: case COLOR_FULL:
                    this.colorFilter = new createjs.ColorFilter(1, 1, 1, 1, 0, 0, 0, 0);

                    this.bitmap.filters = [
                        this.colorFilter,
                        this.AlphaMaskFilter
                    ];
                    break;

                case COLOR_GREY:
                    this.colorFilter = new createjs.ColorMatrixFilter([
                        0.30, 0.30, 0.30, 0, 0, 
                        0.30, 0.30, 0.30, 0, 0, 
                        0.30, 0.30, 0.30, 0, 0, 
                        0, 0, 0, 1, 0 
                    ]);
                    this.bitmap.filters = [
                        this.colorFilter,
                        this.AlphaMaskFilter,
                    ];
                    break;

                case COLOR_SEPIA:
                    this.colorFilter = new createjs.ColorMatrixFilter([
                        0.39, 0.77, 0.19, 0, 0,
                        0.35, 0.68, 0.17, 0, 0,
                        0.27, 0.53, 0.13, 0, 0,
                        0, 0, 0, 1, 0
                    ]);
                    this.bitmap.filters = [
                        this.colorFilter,
                        this.AlphaMaskFilter,
                    ];
                    break;
            }

            this.update();
       // }

    }

    isFixed() {
        return this.fixed;
    }

    getWidthMm() {
        if (this.fixed) {
            return Number(this.photo_size.split(' x ')[0]);
        } else {
            let r = this.photoBounds.width / this.photoBounds.height;
            return Math.round(this.photo_size * r);
        }
    }

    getHeightMm() {
        if (this.fixed) {
            return Number(this.photo_size.split(' x ')[1].replace(' mm', ''));
        } else {
            return Math.round(this.photoBounds.height * this.ratio) * dyo.monument.getRatio();
        }
    }

    setupSlider() {

        let sizes = this.photoSizes();

        if (sizes.length > 1) {
            dyo.engine.photos.slider_size.slider.min = 1;
            dyo.engine.photos.slider_size.slider.max = sizes.length;
            dyo.engine.photos.slider_size.slider.value = this.photo_size;
        } else {
            dyo.engine.photos.slider_size.slider.max = Number(sizes[0].max_height);
            dyo.engine.photos.slider_size.slider.min = Number(sizes[0].min_height);
            dyo.engine.photos.slider_size.slider.value = this.photo_size;
        }

    }

    setSize(size) {

        this.setupSlider();
        
        let sizes = this.photoSizes();
        let nr = 1;

        if (isNaN(size)) {
            // has text
            this.photo_size = size;
        } else {
            // is number
            if (this.fixed) {
                sizes.forEach(_size => {

                    if (size > _size.min_width) {
                        this.photo_size = _size.name;
                        dyo.engine.photos.slider_size.setValue(nr);
                    }
                    nr++;

                });
            } else {
                this.photo_size = size;
            }
        }

        let ratio = dyo.monument.getRatio();

        if (this.fixed) {

            let width = this.getWidthMm();
            let height = this.getHeightMm();

            let defaultRatio = 50 / 70;
            let currentRatio = this.getWidthMm() / this.getHeightMm();
            this.useRatio = ((defaultRatio * 100) / currentRatio) / 100;

            if (this.photoBounds.width > this.photoBounds.height) {
                this.bitmap.scaleX = this.bitmap.scaleY = ((width * ratio) / this.photoBounds.height);
            } else {
                this.bitmap.scaleX = this.bitmap.scaleY = ((height * ratio) / this.photoBounds.height);  // * this.useRatio);
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

            this.photo_size = size;

            this.ratio = size / this.photoBounds.height;
            this.bitmap.scaleX = this.bitmap.scaleY = ratio * this.ratio;

        }

        this.ratio = this.bitmap.scaleX;

        if (dyo.mode == "2d") {
            this.applyMask(this.mask);
        }
        this.update();
        this.updateSize();

    }

    applyMask(mask) {

        /*
        const MASK_PORTRAIT_OVAL = 0;
        const MASK_PORTRAIT_RECTANGLE = 1;
        const MASK_LANDSCAPE_OVAL = 2;
        const MASK_LANDSCAPE_RECTANGLE = 3;
        const MASK_SQUARE = 4;
        */

        let t;

        switch (mask) {
            case 0: case 2:
                t = "oval";
                break;
            case 1: case 3:
                t = "rectangle";
                break;
        }

        if (t == "oval") {
            if (this.photoBounds.width > this.photoBounds.height) {
                mask = 2;
            } else {
                mask = 0;
            }
        }

        if (t == "rectangle") {
            if (this.photoBounds.width > this.photoBounds.height) {
                mask = 3;
            } else {
                mask = 1;
            }
        }

        this.mask = mask;
        let graphic = new createjs.Shape();

        let defaultRatio = 70 / 90;
        let currentRatio = this.getWidthMm() / this.getHeightMm();

        if (!this.fixed) {
            currentRatio = defaultRatio;
        }

        this.useRatio = (((defaultRatio * 100) / currentRatio) / 100);

        //this.useRatio = 0.95;

        this.useRatio = 1;

        if (this.photoBounds.width > this.photoBounds.height) {

            this.box = {
                x: (this.photoBounds.width) / 2 - (this.photoBounds.width * this.useRatio) / 2,
                y: this.photoBounds.y,
                width: this.photoBounds.width * this.useRatio,
                height: this.photoBounds.height
            }

        } else {

            this.box = {
                x: (this.photoBounds.width) / 2 - (this.photoBounds.width * this.useRatio) / 2,
                y: this.photoBounds.y,
                width: this.photoBounds.width,
                height: this.photoBounds.height * this.useRatio
            }

        }

        switch (this.mask) {
            case MASK_PORTRAIT_OVAL: case MASK_LANDSCAPE_OVAL:
                graphic.graphics.beginFill("#00ff00").drawEllipse(this.box.x, this.box.y, this.box.width, this.box.height);
                graphic.cache(this.box.x, this.box.y, this.box.width, this.box.height);
                break;
            case MASK_PORTRAIT_RECTANGLE: case MASK_LANDSCAPE_RECTANGLE:
                graphic.graphics.beginFill("#00ff00").drawRect(this.box.x, this.box.y, this.box.width, this.box.height);

                if (this.isFixed()) {
                    graphic.cache(0, 0, this.photoBounds.width, this.photoBounds.height);
                }
                break;
        }

        this.AlphaMaskFilter = new createjs.AlphaMaskFilter(graphic.cacheCanvas);

        this.bitmap.filters = [
            this.colorFilter,
            this.AlphaMaskFilter
        ];

    }

    drawOutline() {

        let ratio = this.ratio;

        switch (this.mask) {
            default: case MASK_PORTRAIT_OVAL:

                if (this.img_type == LANDSCAPE) {
                    this.outline = {
                        x: ((ratio * this.photoBounds.width) - (ratio * this.photoBounds.width * this.useRatio)) / 2,
                        y: 0,
                        width: ratio * this.photoBounds.width,
                        height: ratio * this.photoBounds.height * this.useRatio
                    }
                }

                if (this.img_type == PORTRAIT) {
                    this.outline = {
                        x: 0,
                        y: 0,
                        width: ratio * this.photoBounds.width,
                        height: ratio * this.photoBounds.height * this.useRatio
                    }
                }

                if (this.img_type == SQUARE) {
                    this.outline = {
                        x: 0,
                        y: 0,
                        width: ratio * this.photoBounds.width,
                        height: ratio * this.photoBounds.height
                    }
                }

                this.selectOutline.graphics.clear();
                this.selectOutline.graphics.s(this.outlineColor).ss(5)
                .drawRect(this.outline.x, this.outline.y, this.outline.width, this.outline.height);
                this.selectOutline.cache(this.outline.x, this.outline.y, this.outline.width, this.outline.height);
                break;

            case MASK_PORTRAIT_RECTANGLE:
        
                if (this.img_type == LANDSCAPE) {
                    this.outline = {
                        x: ((ratio * this.photoBounds.width) - (ratio * this.photoBounds.width * this.useRatio)) / 2,
                        y: 0,
                        width: ratio * this.photoBounds.width,
                        height: ratio * this.photoBounds.height * this.useRatio
                    }
                }

                if (this.img_type == PORTRAIT) {
                    this.outline = {
                        x: ((ratio * this.photoBounds.width) - (ratio * this.photoBounds.width * this.useRatio)) / 2,
                        y: 0,
                        width: (ratio * this.photoBounds.width) - ((ratio * this.photoBounds.width) - (ratio * this.photoBounds.width * this.useRatio)) / 2,
                        height: ratio * this.photoBounds.height * this.useRatio
                    }
                }

                if (this.img_type == SQUARE) {
                    this.outline = {
                        x: 0,
                        y: 0,
                        width: ratio * this.photoBounds.width,
                        height: ratio * this.photoBounds.height
                    }
                }

                this.selectOutline.graphics.clear();
                this.selectOutline.graphics.s(this.outlineColor).ss(5)
                .drawRect(this.outline.x, this.outline.y, this.outline.width, this.outline.height);
                this.selectOutline.cache(this.outline.x, this.outline.y, this.outline.width, this.outline.height);
                break;

            case MASK_LANDSCAPE_OVAL:

                if (this.img_type == LANDSCAPE) {
                    this.outline = {
                        x: 0,
                        y: 0,
                        width: ratio * this.photoBounds.width * this.useRatio,
                        height: ratio * this.photoBounds.height
                    }
                }

                if (this.img_type == PORTRAIT) {
                    this.outline = {
                        x: 0,
                        y: (ratio * this.photoBounds.height / 2) - (ratio * this.photoBounds.width) / 2,
                        width: ratio * this.photoBounds.width,
                        height: ratio * this.photoBounds.height
                    }
                }

                if (this.img_type == SQUARE) {
                    this.outline = {
                        x: 0,
                        y: 0,
                        width: ratio * this.photoBounds.width,
                        height: ratio * this.photoBounds.height
                    }
                }

                this.selectOutline.graphics.clear();
                this.selectOutline.graphics.s(this.outlineColor).ss(5)
                .drawRect(this.outline.x, this.outline.y, this.outline.width, this.outline.height);
                this.selectOutline.cache(this.outline.x, this.outline.y, this.outline.width, this.outline.height);
                break;

            case MASK_LANDSCAPE_RECTANGLE:

                if (this.img_type == LANDSCAPE) {
                    this.outline = {
                        x: ((ratio * this.photoBounds.width) - (ratio * this.photoBounds.width * this.useRatio)) / 2,
                        y: 0,
                        width: ratio * this.photoBounds.width * this.useRatio,
                        height: ratio * this.photoBounds.height
                    }
                }

                if (this.img_type == PORTRAIT) {
                    this.outline = {
                        x: 0,
                        y: (ratio * this.photoBounds.height / 2) - (ratio * this.photoBounds.width) / 2,
                        width: ratio * this.photoBounds.width,
                        height: ratio * this.photoBounds.height
                    }
                }

                if (this.img_type == SQUARE) {
                    this.outline = {
                        x: 0,
                        y: 0,
                        width: ratio * this.photoBounds.width,
                        height: ratio * this.photoBounds.height
                    }
                }

                this.selectOutline.graphics.clear();
                this.selectOutline.graphics.s(this.outlineColor).ss(5)
                .drawRect(this.outline.x, this.outline.y, this.outline.width, this.outline.height);
                this.selectOutline.cache(this.outline.x, this.outline.y, this.outline.width, this.outline.height);
                break;

            case MASK_SQUARE:
                this.outline = {
                    x: (ratio * this.photoBounds.width / 2) - (this.photoBounds.height) / 2,
                    y: 0,
                    width: ratio * this.photoBounds.height,
                    height: ratio * this.photoBounds.height
                }

                this.selectOutline.graphics.clear();
                this.selectOutline.graphics.s(this.outlineColor).ss(5)
                .drawRect(this.outline.x, this.outline.y, this.outline.width, this.outline.height);
                this.selectOutline.cache(this.outline.x, this.outline.y, this.outline.width, this.outline.height);
                break;

        }


        this.bounds = this.outline;

        this.selectOutline.x = -(ratio * this.photoBounds.width / 2);
        this.selectOutline.y = -(ratio * this.photoBounds.height / 2);

    }

    deselect() {
        dyo.selected = null;
        this.selectOutline.visible = false;
        this.selectOutlineHandlers.visible = false;
    }

    duplicate() {
        this.deselect();
		
		let offset_x = this.outline.width;
		
		if (this.rotation == 90 || this.rotation == 180) {
			offset_x = this.outline.height;
        }
        
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
                this.inst3d.setSelected(true);
            }
            
        } else {
			_x = this.container.x + offset_x;
            _y = this.container.y;
        }
        
		let motif = new Photo({ 
            data3d: this.data3d,
            id: this.id, 
            uid: this.uid,
            productid: this.id, 
            name: this.name,
			side: this.side, 
            bmp: this.bmp,
            src: this.src,
            src_original: this.src_original,
            item: this.item,
            color: this.color,
            size: this.photo_size,
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
		
		this.parent.add(motif);
		dyo.monument.updateHeader("Photo:1201");

        dyo.engine.designSaved = false;
    }

    createImage() {

        let target = this.bitmap;
        let self = this;

        this.bitmap.cache(this.photoBounds.x, this.photoBounds.y, this.photoBounds.width, this.photoBounds.height);

        //this.photoBounds.x, this.photoBounds.y, this.photoBounds.width, this.photoBounds.height

        let canvas = document.createElement('canvas');
        canvas.width = target.cacheCanvas.width;
        canvas.height = target.cacheCanvas.height;
        //canvas.width = this.photoBounds.width;
        //canvas.height = this.photoBounds.height;

        let context = canvas.getContext('2d', { willReadFrequently: true });
        context.drawImage(target.cacheCanvas, 0, 0);

        let imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        let data = imgData.data;
        for (var i=0; i<data.length; i+=4){
            if (data[i+3] < 255) {
                data[i] = 255;
                data[i+1] = 255;
                data[i+2] = 255;
                data[i+3] = 255;
            }
        }
        context.putImageData(imgData, 0, 0);

        canvas.toBlob(function(blob) {

            let reader = new FileReader();
            reader.readAsDataURL(blob); 
            reader.onloadend = function() {

                var fileNameCropped;

                if (self.item) {
                    fileNameCropped = self.item.toLowerCase();
                } else {
                    fileNameCropped = self.uid + "_" + self.itemID;
                }

                self.fileNameCropped = fileNameCropped;

                var formData = new FormData();
                formData.append('uniqueid', self.uid);
                formData.append('filename', fileNameCropped);
                //formData.append("upload", new File([blob], self.uid));

                var _blob = new Blob([blob], {type: 'image/png'});
                _blob.lastModifiedDate = new Date();

                formData.append("upload", _blob, fileNameCropped);

                fetch(dyo.path.upload_masked, {
                    method: 'POST',
                    body: formData
                })
                .then(response => response)
                .catch(error => { dyo.engine.loader.hide(); console.error('Error:', error) })
                .then(response => { 
                    response.text().then((data) => {
                        let result = JSON.parse(data);
                    });
                });
            }

        }, "image/png");

    }

    serialize(json) {

        this.updateSize()

        this.quantity = 1;

        const self = {};

        self.productid = this.id;
        self.id = this.id;
        self.uid = this.uid;
        self.path = this.path;
        self.name = this.name;
        self.type = this.type;
        self.item = this.item;//.replace(".jpg", "_masked.jpg");
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

            let size = this.photo_size.split(' x ');
            let width = size[0].replace(' mm', '');
            let height = size[1].replace(' mm', '');

            if (dyo.controller_Size) { 
                if (this.img_type == PORTRAIT) {
                    self.size = this.photo_size;
                }
                if (this.img_type == LANDSCAPE) {
                    self.size = height + " x " + width + " mm";
                }

                self.size = this.photo_size;
                
            } else {
                self.size = this.getSize();
            }

        } else {
            self.size = this.getSize();
            self.width = this.getWidth().replace(' mm', '');
            self.height = this.getHeight().replace(' mm', '');
        }

        self.itemID = this.itemID;

        if (json) {
            return JSON.stringify(self);
        } else {
            return self;
        }
    }
    
}