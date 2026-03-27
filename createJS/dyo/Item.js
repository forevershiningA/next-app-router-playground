import { Data } from './Data.js';

export class Item extends Data {
	constructor(data = {}) {
        super(data);

        this.side = data.side;
        this.parent = data.parent;

        this.outlineColor = "#018786";
        
    }

    drawOutline() {

        let ratio = dyo.monument.getRatio() * this.ratio;

        if (this.type == "Inscription" || this.type == "Photo" || this.type == "Crop") {
            ratio = 1;
        }

        let x = (ratio * this.bounds.width) / 2;
        let y = (ratio * this.bounds.height) / 2;
        let width = ratio * this.bounds.width;
        let height = ratio * this.bounds.height;

        if (this.type == "Inscription") {

            x = this.bounds.left;
            y = this.bounds.top;

        }

        this.selectOutline.graphics.clear();
        this.selectOutline.graphics.s(this.outlineColor).ss(5)
         .drawRect(-x, -y, width, height);

        this.hit = new createjs.Shape();

        this.point = {};

        switch (this.type) {
            default:
                this.point.x = this.bitmap.x;
                this.point.y = this.bitmap.y;
                this.hit.graphics.beginFill(this.outlineColor).drawRect(0, 0, this.bounds.width, this.bounds.height);
                this.bitmap.hitArea = this.hit;
                break;

            case "Photo":
                this.point.x = this.bitmap.x;
                this.point.y = this.bitmap.y;
                break;

            case "Emblem":
                this.point.x = this.bitmap.x;
                this.point.y = this.bitmap.y;
                break;

            case "Crop":
                this.point.x = this.crop_mask.x;
                this.point.y = this.crop_mask.y;
                this.hit.graphics.beginFill(this.outlineColor).drawRect(this.bounds.width / 2, this.bounds.height / 2, this.bounds.width, this.bounds.height);
                break;

            case "Inscription":
                this.point.x = this.text.x;
                this.point.y = this.text.y;
                this.hit.graphics.beginFill(this.outlineColor).drawRect(-x, -y, width, height);
                this.text.hitArea = this.hit;

                break;
        }

        this.selectOutline.x = this.point.x;
        this.selectOutline.y = this.point.y;

        if (this.type == "Inscription") {
            this.selectOutline.cache(-x, -y, width, height);
        } else {
            this.selectOutline.cache(- (ratio * this.bounds.width) / 2, - (ratio * this.bounds.height) / 2, ratio * this.bounds.width, ratio * this.bounds.height);
        }

    }

    drawHandlers() {

        let ratio = dyo.monument.getRatio() * this.ratio;

        if (this.type == "Inscription" || this.type == "Crop") {
            ratio = 1;
        }

        if (this.type == "Photo" || this.type == "Emblem") {
            ratio = 1;
        }

        let handlerSize = 10 * ratio;
        let handlerColor = "#018786";
        let handlerBorderSize = 2 * dyo.dpr;
        let handlerBorderColor = "#ffffff";

        if (handlerSize > 24) {
            handlerSize = 24 * dyo.dpr;
        }

        if (handlerSize < 12) {
            handlerSize = 12 * dyo.dpr;
        }

        let x, y;

        this.selectOutlineHandlers.graphics.clear();

        let handlersDrawn = false;

		if (dyo.engine.mobileDevice) {
            handlersDrawn = true;
        }

        if (handlersDrawn) {

            // mobile

            switch (this.type) {

                case "Inscription":

                    handlerSize = 40;

                    // bottom-right
                    x = this.bounds.right;
                    y = this.bounds.bottom;
                    this.selectOutlineHandlers.graphics.s(handlerColor)
                    .beginFill("#ff0000")
                    .ss(handlerBorderSize)
                    .s(handlerBorderColor)
                    .drawCircle(x, y, handlerSize)
                    .beginFill("#ffffff")
                    .ss(3)
                    .moveTo(x - handlerSize / 2.5, y - handlerSize / 2.5)
                    .lineTo(x + handlerSize / 2.5, y + handlerSize / 2.5)
                    .ss(handlerBorderSize)
                    .drawPolyStar(x + handlerSize / 2.5, y + handlerSize / 2.5, 5, 3, 0, 45)
                    .drawPolyStar(x - handlerSize / 2.5, y - handlerSize / 2.5, 5, 3, 0, -15);

                    break;

                default:

                    // bottom-right
                    x = (ratio * this.bounds.width) / 2;
                    y = (ratio * this.bounds.height) / 2;
                    this.selectOutlineHandlers.graphics.s(handlerColor)
                    .beginFill("#ff0000")
                    .ss(handlerBorderSize)
                    .s(handlerBorderColor)
                    .drawCircle(x, y, handlerSize * 1.5)
                    .beginFill("#ffffff")
                    .ss(3)
                    .moveTo(x - handlerSize / 2.5, y - handlerSize / 2.5)
                    .lineTo(x + handlerSize / 2.5, y + handlerSize / 2.5)
                    .ss(handlerBorderSize)
                    .drawPolyStar(x + handlerSize / 2.5, y + handlerSize / 2.5, 5, 3, 0, 45)
                    .drawPolyStar(x - handlerSize / 2.5, y - handlerSize / 2.5, 5, 3, 0, -15);
                    break;

            }

        } else {

            // desktop

            switch (this.type) {

                case "Inscription":

                    // top-left
                    x = -this.bounds.left;
                    y = -this.bounds.top;
                    this.selectOutlineHandlers.graphics.s(handlerColor)
                    .beginFill(handlerColor)
                    .ss(handlerBorderSize)
                    .s(handlerBorderColor)
                    .drawCircle(x, y, handlerSize / 2);

                    // top-right
                    x = this.bounds.right;
                    y = -this.bounds.top;
                    this.selectOutlineHandlers.graphics.s(handlerColor)
                    .beginFill(handlerColor)
                    .ss(handlerBorderSize)
                    .s(handlerBorderColor)
                    .drawCircle(x, y, handlerSize / 2);

                    // bottom-left
                    x = -this.bounds.left;
                    y = this.bounds.bottom;
                    this.selectOutlineHandlers.graphics.s(handlerColor)
                    .beginFill(handlerColor)
                    .ss(handlerBorderSize)
                    .s(handlerBorderColor)
                    .drawCircle(x, y, handlerSize / 2);

                    // bottom-right
                    x = this.bounds.right;
                    y = this.bounds.bottom;
                    this.selectOutlineHandlers.graphics.s(handlerColor)
                    .beginFill(handlerColor)
                    .ss(handlerBorderSize)
                    .s(handlerBorderColor)
                    .drawCircle(x, y, handlerSize / 2);
                    break;

                default:

                    // top-left
                    x = -(ratio * this.bounds.width) / 2;
                    y = -(ratio * this.bounds.height) / 2;
                    this.selectOutlineHandlers.graphics.s(handlerColor)
                    .beginFill(handlerColor)
                    .ss(handlerBorderSize)
                    .s(handlerBorderColor)
                    .drawCircle(x, y, handlerSize / 2);

                    // top-right
                    x = (ratio * this.bounds.width) / 2;
                    y = -(ratio * this.bounds.height) / 2;
                    this.selectOutlineHandlers.graphics.s(handlerColor)
                    .beginFill(handlerColor)
                    .ss(handlerBorderSize)
                    .s(handlerBorderColor)
                    .drawCircle(x, y, handlerSize / 2);

                    // bottom-left
                    x = -(ratio * this.bounds.width) / 2;
                    y = (ratio * this.bounds.height) / 2;
                    this.selectOutlineHandlers.graphics.s(handlerColor)
                    .beginFill(handlerColor)
                    .ss(handlerBorderSize)
                    .s(handlerBorderColor)
                    .drawCircle(x, y, handlerSize / 2);

                    // bottom-right
                    x = (ratio * this.bounds.width) / 2;
                    y = (ratio * this.bounds.height) / 2;
                    this.selectOutlineHandlers.graphics.s(handlerColor)
                    .beginFill(handlerColor)
                    .ss(handlerBorderSize)
                    .s(handlerBorderColor)
                    .drawCircle(x, y, handlerSize / 2);
                    break;

            }

        }

        switch (this.type) {

            case "Inscription":
                this.selectOutlineHandlers.cache(-this.bounds.left - handlerSize, 
                                                 -this.bounds.top - handlerSize, 
                                                 (this.bounds.right * 2.5) + handlerSize * 2.5, 
                                                 (ratio * this.bounds.height) + handlerSize * 2.5);
                break;
            
            default:
                this.selectOutlineHandlers.cache((-(ratio * this.bounds.width) / 2) - handlerSize, 
                                                 (-(ratio * this.bounds.height) / 2) - handlerSize, 
                                                 (ratio * this.bounds.width) + handlerSize * 2.5, 
                                                 (ratio * this.bounds.height) + handlerSize * 2.5);
                break;

        }

        if (this.point) {
            this.selectOutlineHandlers.x = this.point.x;
            this.selectOutlineHandlers.y = this.point.y;
        } else {
            this.selectOutlineHandlers.x = 0;//this.selectOutline.x;//this.bounds.x;
            this.selectOutlineHandlers.y = this.selectOutline.y + this.selectOutline.cacheCanvas.height / 2;
        }

    }

    getContainer() {
        let container;
        switch (this.type) {
            default:
                container = this.container;
                break;
            case "Crop":
                container = this.mask_container;
                break;
        }
        return container;
    }

    checkGround() {
        let self = this;

        if (dyo.monument.installationMethod == 3) {
            let modelHeight = self.inst3d.getProperty("height");
            let region = self.inst3d.getParentRegion();
            let modelPosition = region.getModelRegionPosition(self.inst3d);

            if (modelPosition.get_y() > 25) {
                modelPosition.set_y(25 -(modelHeight / 2));
            }
        }
    }

    hide() {
        let container = this.getContainer();
        container.visible = false;
    }

    show() {
        let container = this.getContainer();
        container.visible = true;
    }

    drag() {
        let container = this.getContainer();

        container.addEventListener("mouseover", (e) => { 
            document.body.style.cursor = 'pointer';
        });
        container.addEventListener("mouseout", (e) => {
            document.body.style.cursor = 'default';
        });
        container.addEventListener("mousedown", this.click.bind(this), false);
        container.addEventListener("pressmove", this.move.bind(this), true);
    }

    click(e) {

        createjs.Ticker.timingMode = createjs.Ticker.RAF;

        let container = this.getContainer();
        this.select();
        let global;
        
        switch (this.type) {
            default:
                global = container.localToGlobal(this.bitmap.x, this.bitmap.y);
                break;
            case "Motif":
                global = container.localToGlobal(this.bitmap.x, this.bitmap.y);
                break;
            case "Crop":
                global = container.localToGlobal(this.crop_mask.x, this.crop_mask.y);
                break;
            case "Inscription":
                global = container.localToGlobal(this.text.x, this.text.y);
                break;
        }
        this.offset = {'x': global.x - e.stageX, 'y': global.y - e.stageY};
        this.startPoint = {}

        //console.log(e.currentTarget);
        //let col1 = this.col_1_bmp.hitTest(this.offset.x, this.offset.y);
        //console.log(col1);
        //console.log(this.offset);

    }

    move(e) {
        let container = this.getContainer();
        switch (e.target.name) {
            default:
                if (dyo.engine.canvas.doubleClick != true) {
                    let local = this.stage.globalToLocal(e.stageX, e.stageY);

                    container.x = local.x + this.offset.x;
                    container.y = local.y + this.offset.y;
                    
                    if (this.container.x < (-(dyo.w * dyo.dpr)/2)) {
                        this.container.x = 0;
                    }

                    if (this.container.x > ((dyo.w * dyo.dpr)/2)) {
                        this.container.x = 0;
                    }

                    if (this.container.y < (-(dyo.dpr * dyo.h) / 2)) {
                        this.container.y = 0;
                    }

                    switch (dyo.monument.id) {
                        default:
                            let d = 2;
                            if (dyo.monument.id == 4 || dyo.monument.id == 124) {
                                d = 1.8;
                            }
                            if (this.container.y > ((dyo.dpr * dyo.h) / d)) {
                                this.container.y = 0;
                            }
                            break;
                        case 8:
                            switch (dyo.monument.installationMethod) {
                                default:
                                    if (this.container.y > ((dyo.dpr * dyo.h) / 2)) {
                                        this.container.y = 0;
                                    }
                                    break;
                                case 1:
                                    if (this.container.y > ((dyo.dpr * (dyo.h - (dyo.monument.base.height * dyo.monument.getRatio())) / 2))) {
                                        this.container.y = 0;
                                    }
                                    break;
                                case 3:
                                    if (this.container.y > ((dyo.dpr * (dyo.h * 0.33)) / 2)) {
                                        this.container.y = 0;
                                    }
                                    break;
    
                            }
                            break;
                    }

                    if (this.data != undefined) {
                        this.data.x = container.x;
                        this.data.y = container.y;
                    } else if (this.dat != undefined) {
                        this.dat.x = container.x;
                        this.dat.y = container.y;
                    }

                    if (this.type == "Crop") {
                        this.checkMaskPosition();
                    } else {
                        if (dyo.mode == "2d") {
                            let headstoneTest = dyo.monument.headstone.shape.hitTest(this.container.x, this.container.y);

                            if (headstoneTest) {
                                this.part = "Headstone";
                            } else {
                                this.part = "Base";
                            }
                        }

                    }
                }
                break;
            case "handler":

                let local = container.globalToLocal(e.stageX, e.stageY);
                let value, valueX, valueY;

                // Landscape
                if (this.bounds.width > this.bounds.height) {
                    // top-left
                    if (local.x < 0 && local.y < 0) {
                        if (Math.abs(local.x) < Math.abs(local.y)) {
                            value = (-local.x * 2) / dyo.monument.getRatio();
                        } else {
                            value = (-local.y * 2) / dyo.monument.getRatio();
                        }
                        valueX = (-local.x * 2) / dyo.monument.getRatio();
                        valueY = (-local.y * 2) / dyo.monument.getRatio();
                    }

                    // top-right
                    if (local.x > 0 && local.y < 0) {
                        if (Math.abs(local.x) < Math.abs(local.y)) {
                            value = (local.x * 2) / dyo.monument.getRatio();
                        } else {
                            value = (-local.y * 2) / dyo.monument.getRatio();
                        }
                        valueX = (local.x * 2) / dyo.monument.getRatio();
                        valueY = (-local.y * 2) / dyo.monument.getRatio();
                    }

                    // bottom-left
                    if (local.x < 0 && local.y > 0) {
                        if (Math.abs(local.x) < Math.abs(local.y)) {
                            value = (-local.x * 2) / dyo.monument.getRatio();
                        } else {
                            value = (local.y * 2) / dyo.monument.getRatio();
                        }
                        valueX = (-local.x * 2) / dyo.monument.getRatio();
                        valueY = (local.y * 2) / dyo.monument.getRatio();
                    }

                    // bottom-right
                    if (local.x > 0 && local.y > 0) {
                        if (Math.abs(local.x) < Math.abs(local.y)) {
                            value = (local.x * 2) / dyo.monument.getRatio();
                        } else {
                            value = (local.y * 2) / dyo.monument.getRatio();
                        }
                        valueX = (local.x * 2) / dyo.monument.getRatio();
                        valueY = (local.y * 2) / dyo.monument.getRatio();
                    }

                }

                // Portrait

                if (this.bounds.width <= this.bounds.height) {
                    // top-left
                    if (local.x < 0 && local.y < 0) {
                        if (Math.abs(local.x) > Math.abs(local.y)) {
                            value = (-local.x * 2) / dyo.monument.getRatio();
                        } else {
                            value = (-local.y * 2) / dyo.monument.getRatio();
                        }
                        valueX = (-local.x * 2) / dyo.monument.getRatio();
                        valueY = (-local.y * 2) / dyo.monument.getRatio();
                    }

                    // top-right
                    if (local.x > 0 && local.y < 0) {
                        if (Math.abs(local.x) > Math.abs(local.y)) {
                            value = (local.x * 2) / dyo.monument.getRatio();
                        } else {
                            value = (-local.y * 2) / dyo.monument.getRatio();
                        }
                        valueX = (local.x * 2) / dyo.monument.getRatio();
                        valueY = (-local.y * 2) / dyo.monument.getRatio();
                    }

                    // bottom-left
                    if (local.x < 0 && local.y > 0) {
                        if (Math.abs(local.x) > Math.abs(local.y)) {
                            value = (-local.x * 2) / dyo.monument.getRatio();
                        } else {
                            value = (local.y * 2) / dyo.monument.getRatio();
                        }
                        valueX = (-local.x * 2) / dyo.monument.getRatio();
                        valueY = (local.y * 2) / dyo.monument.getRatio();
                    }

                    // bottom-right
                    if (local.x > 0 && local.y > 0) {
                        if (Math.abs(local.x) > Math.abs(local.y)) {
                            value = (local.x * 2) / dyo.monument.getRatio();
                        } else {
                            value = (local.y * 2) / dyo.monument.getRatio();
                        }
                        valueX = (local.x * 2) / dyo.monument.getRatio();
                        valueY = (local.y * 2) / dyo.monument.getRatio();
                    }

                }
                
                switch (this.type) {
                    default:
                        if (!isNaN(Math.round(value))) {
                            if (this.type == "Emblem") {
                                if (this.img_type == 0) {
                                    value = value * dyo.monument.getRatio() / 1.5;
                                } else {
                                    value = value * dyo.monument.getRatio() / 2;
                                }
                            }
                            
                            dyo.selected.setSize(Math.round(value));
                        }
                        break;
                    case "Crop":
                        let scale, scale2;

                        if (dyo.engine.photos._uploadPhotoId == 21 || (dyo.engine.photos._uploadPhotoId == 137 && !dyo.engine.photos.useAsBackgroundImage)) {
                            
                            switch (this.img_type) {
                                default:
                                    scale = (valueX * dyo.monument.getRatio() / this.original_bounds.width) * 100;
                                    scale2 = (valueY * dyo.monument.getRatio() / this.original_bounds.height) * 100;
                                    break;
                                case 1:
                                    if (this.box.width > this.box.height) {
                                        scale = (valueX * dyo.monument.getRatio() / this.original_bounds.width) * 100;
                                        scale2 = (valueY * dyo.monument.getRatio() / this.original_bounds.height) * 100;
                                    } else {
                                        scale = (valueX * dyo.monument.getRatio() / this.original_bounds.width) * 100;
                                        scale2 = (valueY * dyo.monument.getRatio() / this.original_bounds.height) * 100;
                                    }
                                    break;
                                case 2:
                                    if (this.box.width > this.box.height) {

                                        if (this.original_bounds.width == this.original_bounds.width) {
                                            scale = (valueX * dyo.monument.getRatio() / this.original_bounds.width) * 100;
                                            scale2 = (valueY * dyo.monument.getRatio() / this.original_bounds.height) * 100;
                                        } else {
                                            scale = (valueX * dyo.monument.getRatio() / this.original_bounds.width) * 100;
                                            scale2 = (valueY * dyo.monument.getRatio() / this.original_bounds.height) * 100;
                                        }
                                    } else {
                                        scale = (valueX * dyo.monument.getRatio() / this.original_bounds.width) * 100;
                                        scale2 = (valueY * dyo.monument.getRatio() / this.original_bounds.height) * 100;
                                    } 
                                    break;

                                    scale = (valueX * dyo.monument.getRatio() / this.original_bounds.width) * 100;
                                    scale2 = (valueY * dyo.monument.getRatio() / this.original_bounds.height) * 100;
                                    
                            }

                           // scale2 = 100;

                        } else {

                            switch (this.img_type) {
                                default:
                                    scale = (value * dyo.monument.getRatio() / this.original_bounds.height) * 100;
                                    break;
                                case 1:
                                    if (this.box.width > this.box.height) {
                                        scale = (value * dyo.monument.getRatio() / (this.original_bounds.height / 2)) * 100;
                                    } else {
                                        scale = (value * dyo.monument.getRatio() / this.original_bounds.height) * 100;
                                    }
                                    break;
                                case 2:
                                    if (this.box.width > this.box.height) {
                                        let a = 1.4;                                    

                                        if (this.original_bounds.width == this.original_bounds.height) {
                                            scale = (value * dyo.monument.getRatio() / (this.original_bounds.height / a)) * 100;
                                        } else {
                                            scale = (value * dyo.monument.getRatio() / this.original_bounds.height) * 100;
                                        }
                                    } else {
                                        scale = (value * dyo.monument.getRatio() / this.original_bounds.height) * 100;
                                    } 
                                    break;
                            }

                        }

                        if (scale2) {

                            if (scale < 10) {
                                scale = 10;
                            }
    
                            if (scale > 100) {
                              scale = 100;
                            }

                            if (scale2 < 10) {
                                scale2 = 10;
                            }
    
                            if (scale2 > 100) {
                               scale2 = 100;
                            }
                            
                            dyo.engine.photos.setSize(scale, scale2);
                        } else {

                            if (scale < 10) {
                                scale = 10;
                            }
    
                            if (scale > 100) {
                                scale = 100;
                            }

                            dyo.engine.photos.setSize(scale);
                        }
                        

                        break;
                }

                break;
    
        }

        dyo.monument.updateHeader();
    }

    overlapTest(obj) {
    }

    increaseRotation() {
        this.setRotation(this.rotation + 1);
    }

    decreaseRotation() {
        this.setRotation(this.rotation - 1);
    }

    rotate(degrees, type) {
		
		if (type == 0) {
        	this.rotation = degrees;
		}
		
		if (type == 1) {
        	this.rotation += degrees;
		}
		
		if (this.rotation > 359) {
			this.rotation = 0;
		}
		
		if (this.rotation < 0) {
			this.rotation = 270;
		}
		
		let rotation = this.rotation + "&deg;";
        
		if (dyo.controller_Rotate) { 
            dyo.controller_Rotate.setValue(this.getRotation());
        }

        this.container.rotation = this.rotation;
        this.update();
    }

    flipX() {
		if (dyo.selected) {
            this.flipx = -this.flipx;
            this.container.scaleX = this.flipx;
        }
        if (dyo.mode == "3d") {
            this.doFlip();
        }
    }

    flipY() {
		if (dyo.selected) {
            this.flipy = -this.flipy;
            this.container.scaleY = this.flipy;
        }
        if (dyo.mode == "3d") {
            this.doFlip();
        }
    }

    doFlip() {
        if (dyo.mode == "3d") {
            let i = this.bitmap.cacheCanvas;
            let w = i.width;
            let h = i.height;
            
            let b = new createjs.Bitmap(i);
            b.cache(0, 0, w, h);
            
            let ctx = b.cacheCanvas.getContext("2d", { willReadFrequently: true });
            ctx.clearRect(0, 0, w, h);
            ctx.scale(this.flipx, this.flipy);
            ctx.drawImage(i, 0, 0, w * this.flipx, h * this.flipy);

            let object = new Engine3D.values.DisplayObjectValue(b.cacheCanvas);
            object.setEmbedType(Engine3D.enums.EmbedType.EMBEDDED);
            if (this.data3d["height"] == undefined) {
                dyo.engine3d.lockUpdate = true;
                this.data3d["height"] = this.inst3d.getProperty("height");
            }
            let height = this.data3d["height"];

            dyo.engine3d.lockUpdate = true;
            this.inst3d.changeProperty("display_object", object);
            dyo.engine3d.lockUpdate = true;
            this.inst3d.changeProperty("height", Number(height));
        }
    }

}