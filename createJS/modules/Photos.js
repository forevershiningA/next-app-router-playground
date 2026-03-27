import { Button, Drawer, List, ImageList, Title, Select, Slider } from '../material/MaterialDesign.js';
import { Photo } from '../dyo/Photo.js';
import { P,Lang, Translate, $ } from '../Const.js';
import { Component } from '../material/Component.js';

const LANDSCAPE = 0;
const PORTRAIT = 1;
const SQUARE = 2;

const MASK_PORTRAIT_OVAL = 0;
const MASK_PORTRAIT_RECTANGLE = 1;
const MASK_LANDSCAPE_OVAL = 2;
const MASK_LANDSCAPE_RECTANGLE = 3;
const MASK_SQUARE = 4;
const MASK_HEART = 5;
const MASK_TEARDROP = 6;
const MASK_TRIANGLE = 7;

const COLOR_FULL = 0;
const COLOR_GREY = 1;
const COLOR_SEPIA = 2;

export class Photos extends Component {

	constructor(dat = {}) {
        super(dat);
        
        this.type = "Crop";
        this.data = dat.data;

        this.container = $("div", "add", "container-photos", this.stage);

        this.container_photos = $("div", "add", "container-photos-internal");
        this.container_buttons = $("div", "add", "container-buttons");
        this.container_slider_size = $("div", "add", "slider-size-container");
        this.container_slider_rotation = $("div", "add", "slider-rotation-container");
        
        this.initEvents = false;
        this.scaleValue = 100;
        this.hide();
    }

    update() {
        $("#dyo_" + this.id + "_title", Translate(Lang.PHOTO));
    }

    render() {

        this.menu = new Drawer({
            stage: this.container,
            toolbar_type: 1,
            title: this.title,
            id: "dyo_photos"
        });
        this.menu.render();

        let container = $("#dyo_photos-mdc-list");

        this.image_mask_container = document.createElement("div");

        this.photo_mask_title = new Title({
            stage: this.image_mask_container,
            id: "dyo_photos_mask_title",
            type: 2,
            title: Translate(Lang.STEP) + " 1",
            description: Translate(Lang.SELECT_MASK)
        });
        this.photo_mask_title.render();
        this.image_mask_container.style.marginLeft = "15px";

        this.img_1 = new Image();
        this.img_1.src = dyo.xml_path + "data/svg/masks/oval_vertical.svg";
        this.img_1.name = "Oval (Portrait)";
        this.img_1.classList.add("img_mask");
        this.img_1.addEventListener("click", (e) => {
            dyo.engine.photos.crop_Mask(MASK_PORTRAIT_OVAL);
            if (dyo.engine.photos._uploadPhotoId == 21 || (dyo.engine.photos._uploadPhotoId == 137 && !dyo.engine.photos.useAsBackgroundImage)) {
                let ratio = this.original_bounds.height / this.original_bounds.width;
                dyo.engine.photos.crop_Size((100 * ratio) * 0.7, 100);
            } else {
                dyo.engine.photos.crop_Size(100);
            }
            dyo.engine.photos.removeActiveMask();
            dyo.engine.photos.img_1.classList.add("img_mask_active");
            dyo.selected = "mask";
        });

        this.img_1.classList.add("img_mask_active");
        this.image_mask_container.appendChild(this.img_1);

        this.img_2 = new Image();
        this.img_2.src = dyo.xml_path + "data/svg/masks/oval_horizontal.svg";
        this.img_2.name = "Oval (Landscape)";
        this.img_2.classList.add("img_mask");
        this.img_2.addEventListener("click", (e) => {
            dyo.engine.photos.crop_Mask(MASK_LANDSCAPE_OVAL);
            if (dyo.engine.photos._uploadPhotoId == 21 || (dyo.engine.photos._uploadPhotoId == 137 && !dyo.engine.photos.useAsBackgroundImage)) {
                let ratio;
                if (this.img_type == PORTRAIT || this.img_type == SQUARE) {
                    ratio = this.original_bounds.width / this.original_bounds.height;
                    dyo.engine.photos.crop_Size(100, (100 * ratio) * 0.7);
                } else {
                    ratio = this.original_bounds.height / this.original_bounds.width;
                    dyo.engine.photos.crop_Size(100, 100);
                }
            } else {
                dyo.engine.photos.crop_Size(100);
            }
            dyo.engine.photos.removeActiveMask();
            dyo.engine.photos.img_2.classList.add("img_mask_active");
            dyo.selected = "mask";
        });

        this.image_mask_container.appendChild(this.img_2);

        this.img_3 = new Image();
        this.img_3.src = dyo.xml_path + "data/svg/masks/rectangle_vertical.svg";
        this.img_3.name = "Rectangle (Portrait)";
        this.img_3.classList.add("img_mask");
        this.img_3.addEventListener("click", (e) => {
            dyo.engine.photos.crop_Mask(MASK_PORTRAIT_RECTANGLE);

            if (dyo.engine.photos._uploadPhotoId == 21 || (dyo.engine.photos._uploadPhotoId == 137 && !dyo.engine.photos.useAsBackgroundImage)) {
                let ratio = this.original_bounds.height / this.original_bounds.width;
                dyo.engine.photos.crop_Size((100 * ratio) * 0.7, 100);
            } else {
                dyo.engine.photos.crop_Size(100);
            }
            dyo.engine.photos.removeActiveMask();
            dyo.engine.photos.img_3.classList.add("img_mask_active");
            dyo.selected = "mask";
        });

        this.image_mask_container.appendChild(this.img_3);

        this.img_4 = new Image();
        this.img_4.src = dyo.xml_path + "data/svg/masks/rectangle_horizontal.svg";
        this.img_4.name = "Rectangle (Landscape)";
        this.img_4.classList.add("img_mask");
        this.img_4.addEventListener("click", (e) => {
            dyo.engine.photos.crop_Mask(MASK_LANDSCAPE_RECTANGLE);
            if (dyo.engine.photos._uploadPhotoId == 21 || (dyo.engine.photos._uploadPhotoId == 137 && !dyo.engine.photos.useAsBackgroundImage)) {
                let ratio;
                if (this.img_type == PORTRAIT || this.img_type == SQUARE) {
                    ratio = this.original_bounds.width / this.original_bounds.height;
                    dyo.engine.photos.crop_Size(100, (100 * ratio) * 0.7);
                } else {
                    ratio = this.original_bounds.height / this.original_bounds.width;
                    dyo.engine.photos.crop_Size(100, 100);
                }
            } else {
                dyo.engine.photos.crop_Size(100);
            }
            dyo.engine.photos.removeActiveMask();
            dyo.engine.photos.img_4.classList.add("img_mask_active");
            dyo.selected = "mask";
        });

        this.image_mask_container.appendChild(this.img_4);

        this.img_5 = new Image();
        this.img_5.src = dyo.xml_path + "data/svg/masks/heart.svg";
        this.img_5.name = "Heart";
        this.img_5.classList.add("img_mask");
        this.img_5.addEventListener("click", (e) => {
            dyo.engine.photos.crop_Mask(MASK_HEART);
            dyo.engine.photos.crop_Size(100);
            dyo.engine.photos.removeActiveMask();
            dyo.engine.photos.img_5.classList.add("img_mask_active");
            dyo.selected = "mask";
        });

        this.image_mask_container.appendChild(this.img_5);

        this.img_6 = new Image();
        this.img_6.src = dyo.xml_path + "data/svg/masks/teardrop.svg";
        this.img_6.name = "Teardrop";
        this.img_6.classList.add("img_mask");
        this.img_6.addEventListener("click", (e) => {
            dyo.engine.photos.crop_Mask(MASK_TEARDROP);
            dyo.engine.photos.crop_Size(100);
            dyo.engine.photos.removeActiveMask();
            dyo.engine.photos.img_6.classList.add("img_mask_active");
            dyo.selected = "mask";
        });

        this.image_mask_container.appendChild(this.img_6);

        this.img_7 = new Image();
        this.img_7.src = dyo.xml_path + "data/svg/masks/triangle.svg";
        this.img_7.name = "Triangle";
        this.img_7.classList.add("img_mask");
        this.img_7.addEventListener("click", (e) => {
            dyo.engine.photos.crop_Mask(MASK_TRIANGLE);
            dyo.engine.photos.crop_Size(100);
            dyo.engine.photos.removeActiveMask();
            dyo.engine.photos.img_7.classList.add("img_mask_active");
            dyo.selected = "mask";
        });

        this.image_mask_container.appendChild(this.img_7);
        this.image_mask_container.style.display = "none";

        container.appendChild(this.image_mask_container);
        container.appendChild(this.container_photos);
        container.appendChild(this.container_buttons);

        this.color_style_title = new Title({
            stage: this.container_photos,
            id: "dyo_photos_color_style_title",
            type: 1,
            title: Translate(Lang.STEP) + " 2",
            description: Translate(Lang.SELECT_COLOUR)
        });
        this.color_style_title.render();

        this.color_style = new Select({
            stage: this.container_photos,
            id: "dyo_select_photo_color",
            data: this.photos_color,
            type: 1,
            selected: 0,
            title: Lang.SELECT_COLOUR
        });

        this.color_style.render();

        this.container_photos.appendChild(this.container_slider_size);

        this.photo_name_title = new Title({
            stage: this.container_slider_size,
            id: "dyo_photos_name_title",
            type: 1,
            title: Translate(Lang.STEP) + " 3",
            description: Translate(Lang.SELECT_SIZE)
        });
        this.photo_name_title.render();
        this.photo_name_title.hide();

        this.slider_size_title = new Title({
            stage: this.container_slider_size,
            id: "dyo_photos_slider_size_title",
            type: 1,
            title: Translate(Lang.STEP) + " 3",
            description: Translate(Lang.SELECT_SIZE)
        });
        this.slider_size_title.render();

       this.slider_size = new Slider({
           stage: this.container_slider_size,
           id: "dyo_slider_photo_size",
           step: 1,
           title: Lang.SELECT_SIZE
       });
       this.slider_size.render();
       
       this.buttonSizeDecrease = new Button({
           stage: this.container_slider_size,
           id: "dyo_button_photo_slider_size_decrease",
           type: 6,
           icon: 'remove',
           title: Lang.DECREASE
       });       
       this.buttonSizeDecrease.render();

       this.buttonSizeIncrease = new Button({
           stage: this.container_slider_size,
           id: "dyo_button_photo_slider_size_increase",
           parentcss: "float: right",
           type: 6,
           icon: 'add',
           title: Lang.INCREASE
       });       
       this.buttonSizeIncrease.render();

       this.container_photos.appendChild(this.container_slider_rotation);

        this.slider_rotation = new Slider({
            stage: this.container_slider_rotation,
            id: "dyo_slider_photo_slider_rotation",
            step: 1,
            title: Lang.ROTATE
        });
        this.slider_rotation.render();
        
        this.buttonRotationDecrease = new Button({
            stage: this.container_slider_rotation,
            id: "dyo_button_photo_slider_rotation_decrease",
            type: 6,
            icon: 'remove',
            title: Lang.DECREASE
        });       
        this.buttonRotationDecrease.render();
        
        this.buttonRotationIncrease = new Button({
            stage: this.container_slider_rotation,
            id: "dyo_button_photo_slider_rotation_increase",
            parentcss: "float: right",
            type: 6,
            icon: 'add',
            title: Lang.INCREASE
        });       
        this.buttonRotationIncrease.render();

		this.buttonUpload = new Button({
            stage: this.container_buttons,
            id: "dyo_button_photo_upload",
			type: 4,
			icon: 'backup',
			title: Lang.UPLOAD
        });       
        this.buttonUpload.render();
		
 		this.buttonFlipX = new Button({
            stage: this.container_buttons,
            id: "dyo_button_photo_flipx",
            type: 3,
			icon: 'border_vertical',
			title: Lang.FLIP_X
        });       
        this.buttonFlipX.render();

        this.buttonFlipY = new Button({
            stage: this.container_buttons,
            id: "dyo_button_photo_flipy",
            css: "margin-right: 20px !important",
            type: 3,
			icon: 'border_horizontal',
			title: Lang.FLIP_Y
        });       
		this.buttonFlipY.render();
		
		this.buttonRotateLeft = new Button({
            stage: this.container_buttons,
            id: "dyo_button_photo_rotate_left",
			type: 3,
			icon: 'rotate_left',
			title: Lang.ROTATE_LEFT
        });       
        this.buttonRotateLeft.render();
        
		this.buttonRotateRight = new Button({
            stage: this.container_buttons,
            id: "dyo_button_photo_rotate_right",
            css: "margin-right: 20px !important",
			type: 3,
			icon: 'rotate_right',
			title: Lang.ROTATE_RIGHT
        });       
		this.buttonRotateRight.render();

        this.buttonDuplicate = new Button({
            stage: this.container_buttons,
            id: "dyo_button_photo_duplicate",
			type: 3,
			icon: 'add_to_photos',
			title: Lang.DUPLICATE
        });       
        this.buttonDuplicate.render();
        
        this.buttonDelete = new Button({
            stage: this.container_buttons,
            id: "dyo_button_photo_delete",
			type: 3,
			icon: 'delete',
			title: Lang.DELETE
        });       
        this.buttonDelete.render();

        this.buttonCrop = new Button({
            stage: this.container_slider_rotation,
            id: "dyo_button_photo_crop",
            type: 5,
			icon: 'crop_free',
            title: Lang.CROP_IMAGE
        });       
        this.buttonCrop.render();

        this.input = new List({
            stage: $("#dyo_photos-mdc-list"),
            parent: this,   
            id: "dyo_photos_list",
            type: 3,
            data: this.photos_types,
            title: Lang.SELECT_PHOTO
        });
        this.input.render();

        this.hide();
       
    }

    hide() {
        this.hideContainer(this.container);
    }

    show() {
        dyo.currentSection = "Photos";
        this.showContainer(this.container);
        this.hideAll();
        dyo.monument.updateHeader("Photos:225");
    }

    hideAll() {
        this.image_mask_container.style.display = "none";

        this.container_photos.style.visibility = "hidden";
        this.container_photos.style.height = "0px";
        this.container_photos.style.overflow = "hidden";

        this.container_buttons.style.display = "none";

        $("#dyo_photos_list").style.display = "block";
    }

    showPhotosContainersAndButtons() {
        this.container_photos.style.visibility = "visible";
        this.container_buttons.style.visibility = "visible";

        this.container_photos.style.height = "auto";
        this.container_buttons.style.display = "block";

        $("#dyo_photos_list").style.display = "none";
    }

	reset() {
        this.slider_size_title.hide();
        this.color_style_title.hide();

		this.hideButtons();
        this.buttonUpload.show();

        $('#dyo_photos_title', Translate(Lang.PHOTO) + " <i class='material-icons'>help_outline</i>");

	}

	hideButtons() {
        this.buttonUpload.hide();
		this.buttonSizeIncrease.hide();
        this.buttonSizeDecrease.hide();
        this.buttonRotateLeft.hide();
        this.buttonRotateRight.hide();
		this.buttonDuplicate.hide();
        this.buttonFlipX.hide();
        this.buttonFlipY.hide();
        this.buttonDelete.hide();
        this.buttonCrop.hide();
	}

	showButtons() {
        this.slider_size_title.hide();
        this.color_style_title.hide();
        this.color_style.hide();
        this.buttonUpload.hide();
		this.buttonSizeIncrease.show();
        this.buttonSizeDecrease.show();
		this.buttonDuplicate.show();
        this.buttonFlipX.show();
        this.buttonFlipY.show();
		this.buttonDelete.show();
    }
    
    photoSizes() {
        if (this.uploadPhotoId == 2300) {
            switch (this.mask) {
                default:
                    return this.photos_sizes(this.uploadPhotoId, "photos:467");
                    break;
                case 1: case 3: case 4:
                    let sizes = this.photos_sizes(this.uploadPhotoId, "photos:470");
                    let removedSize = sizes.splice(-1);
                    dyo.engine.sizes.slider_size.setMax(this.photos_sizes(this.uploadPhotoId).length - 2, "photos:472");
                    return sizes;
                    break;
            }
        } else {
            return this.photos_sizes(this.uploadPhotoId, "photos:477");
        }
    }

    get uploadPhotoId() {
        return this._uploadPhotoId;
    }

    set uploadPhotoId(id) {
        this._uploadPhotoId = id;
        this.color_style.render();
    }

    removeActiveMask() {
        this.img_1.classList.remove("img_mask_active");
        this.img_2.classList.remove("img_mask_active");
        this.img_3.classList.remove("img_mask_active");
        this.img_4.classList.remove("img_mask_active");
        this.img_5.classList.remove("img_mask_active");
        this.img_6.classList.remove("img_mask_active");
        this.img_7.classList.remove("img_mask_active");
    }

    applyColor(color) {

        this.color = color;

        switch (color) {
            default: case COLOR_FULL:
                this.colorFilter = new createjs.ColorFilter(1, 1, 1, 1, 0, 0, 0, 0);
                break;

            case COLOR_GREY:
                this.colorFilter = new createjs.ColorMatrixFilter([
                    0.30, 0.30, 0.30, 0, 0, 
                    0.30, 0.30, 0.30, 0, 0, 
                    0.30, 0.30, 0.30, 0, 0, 
                    0, 0, 0, 1, 0 
                ]);
                break;

            case COLOR_SEPIA:
                this.colorFilter = new createjs.ColorMatrixFilter([
                    0.39, 0.77, 0.19, 0, 0,
                    0.35, 0.68, 0.17, 0, 0,
                    0.27, 0.53, 0.13, 0, 0,
                    0, 0, 0, 1, 0
                ]);
                break;
        }

        this.crop_bitmap.filters = [
            this.colorFilter
        ];

        this.crop_bitmap.updateCache();

    }

    getPhotoHeight() {
        return this.bounds.height;
    }

    setSize(value, value2) {
        dyo.controller_Size.setValue(value);
        if (value2) {
            dyo.engine.photos.crop_Size(value, value2);
        } else {
           dyo.engine.photos.crop_Size(value);
        }
    }

    cropSection(data) {

        if (!dyo.engine.mobileDevice) {
            dyo.engine.canvas.hideContainer(dyo.engine.canvas.crop_container);
        } else {
            console.log("@show container");
            dyo.engine.canvas.showContainer(dyo.engine.canvas.crop_container);
            //dyo.engine.canvas.buttonCropImage.show();
        }

        dyo.engine.materials.hide();
        dyo.engine.photos.photo_name_title.hide();

        document.querySelector(".container-photos-internal .slider-size-container").style.marginTop = "40px";

        if (dyo.mode == "3d") {
            dyo.engine.hide();
			$("#openfl").style.visibility = "hidden";
            $("#canvas").style.visibility = "visible";

        } else {
            dyo.engine.hide();
        }

        if (dyo.engine.deviceType == "mobile") {
            if ($("#quick-enquiry")) {
                $("#quick-enquiry").style.visibility = "hidden";
            }
        }

        this.ratio = 1;

        document.location.href = "#crop-photo";
        dyo.engine.photos.show();

        dyo.currentSection = "Crop";
        this.color = 0;

        dyo.engine.loader.force = false;
        dyo.engine.loader.hide("Photos:541");

        this.showPhotosContainersAndButtons();
        this.hideButtons();
        this.buttonCrop.show();

        let item = dyo.engine.getItemByID("images", this.uploadPhotoId);

        if (item.color == 0) {
			dyo.monument.has_background_image = false;
        }

		this.buttonSizeIncrease.show();
        this.buttonSizeDecrease.show();
        
        this.image_mask_container.style.display = "block";
        this.slider_size_title.show();
        this.color_style_title.show();
        this.color_style.show();

        dyo.monument.container.visible = false;

        dyo.engine.photos.slider_size.slider.max = 100;
        dyo.engine.photos.slider_size.slider.min = 10;
        dyo.engine.photos.slider_size.slider.value = 100;

        dyo.engine.photos.slider_rotation.slider.max = 180;
        dyo.engine.photos.slider_rotation.slider.min = -180;
        dyo.engine.photos.slider_rotation.slider.value = 0;

        $('#dyo_slider_photo_size_value', Translate(Lang.POSITION_PHOTO_AND_SIZE));
        $('#dyo_slider_photo_slider_rotation_value', Translate(Lang.SELECT_ROTATION) + ": 0&deg;");
        $('#dyo_photos_title', Translate(Lang.CROP_SECTION) + " <i class='material-icons'>help_outline</i>");

        let stage = dyo.engine.canvas.getStage();
        let main_stage = dyo.engine.canvas.getMainStage();

        this.stage = stage;
        stage.visible = true;
        main_stage.alpha = 1;

        let bmp = new createjs.Bitmap(data.bmp);
        let scale;

        let use_h = dyo.h;
        
        if (data.bmp.width > data.bmp.height) {
            scale = ((dyo.dpr * dyo.h) * .9) / data.bmp.width;
            this.img_type = LANDSCAPE
        } else if (data.bmp.width < data.bmp.height) {
            scale = ((dyo.dpr * dyo.h) * .8) / data.bmp.height;
            this.img_type = PORTRAIT;
        } else {
            scale = ((dyo.dpr * use_h) * .8) / data.bmp.height;
            this.img_type = SQUARE;
        }

        bmp.cache(0, 0, data.bmp.width, data.bmp.height, scale);
        let bitmap = new createjs.Bitmap(bmp.cacheCanvas);
        
        let bounds = bitmap.getBounds();
        this.original_bounds = bounds;

        bitmap.regX = bounds.width / 2;
        bitmap.regY = bounds.height / 2;
        bitmap.cache(0, 0, bounds.width, bounds.height);

        this.cont = new createjs.Container();
        this.cont.addChild(bitmap);
        stage.addChild(this.cont);

        this.crop_bitmap = bitmap;

        let mask = new createjs.Shape();
        mask.alpha = .5;
        mask.graphics.clear();
        mask.graphics.beginFill("#00ff00")
        .drawEllipse((dyo.w / 2) - (bounds.width / 2), (use_h / 2) - (bounds.height / 2), bounds.width, bounds.height);
        
        mask.cache(-bounds.width / 2, -bounds.height / 2, bitmap.x + bounds.width, bitmap.y + bounds.height);
        
        let mask_container = new createjs.Container();
        mask_container.x = 0;
        mask_container.y = 0;
        mask_container.addChild(mask);

        stage.addChild(mask_container);

        this.mask_container = mask_container;
        this.crop_mask = mask;
        this.crop_data = data;

        this.crop_Mask(MASK_PORTRAIT_OVAL);
        dyo.engine.photos.removeActiveMask();
        dyo.engine.photos.img_1.classList.add("img_mask_active");

        switch (this.color_style.select.value.trim()) {
            case Translate(Lang.GREYSCALE):
                this.applyColor(COLOR_GREY);
                break;
        }

       this.drag();

       this.cont.addEventListener("mousedown", (e) => {
           dyo.selected = null;
       }, false);

       this.img_1.style.display = "none";
       this.img_2.style.display = "none";
       this.img_3.style.display = "none";
       this.img_4.style.display = "none";
       this.img_5.style.display = "none";
       this.img_6.style.display = "none";
       this.img_7.style.display = "none";

       let product_name = dyo.monument.headstone.name;

        if (dyo.engine.photos.useAsBackgroundImage) {
            if (dyo.monument.id == 32) {
                if (product_name == "Full-colour Plaque" ||
                    product_name == "Landscape") {
                    this.img_4.style.display = "inline-block";
                    this.crop_Mask(MASK_LANDSCAPE_RECTANGLE);    
                }
                if (product_name == "Portrait") {
                    this.img_3.style.display = "inline-block";
                    this.crop_Mask(MASK_PORTRAIT_RECTANGLE);    
                }
            }
            if (dyo.monument.getProductType() == "images" || dyo.monument.getProductType() == "urns") {

                if (product_name == "Oval") {
                    product_name = "Oval (Portrait)";
                }

                if (product_name == "Rectangle") {
                    product_name = "Rectangle (Portrait)";
                }

                if (product_name == "Urn Heart") {
                    product_name = "Heart";
                }

                if (product_name == this.img_1.name) {
                    this.img_1.style.display = "inline-block";
                    this.crop_Mask(MASK_PORTRAIT_OVAL);
                }
                if (product_name == this.img_2.name) {
                    this.img_2.style.display = "inline-block";
                    this.crop_Mask(MASK_LANDSCAPE_OVAL);
                }
                if (product_name == this.img_3.name) {
                    this.img_3.style.display = "inline-block";
                    this.crop_Mask(MASK_PORTRAIT_RECTANGLE);
                }
                if (product_name == this.img_4.name) {
                    this.img_4.style.display = "inline-block";
                    this.crop_Mask(MASK_LANDSCAPE_RECTANGLE);
                }
                if (product_name == this.img_5.name) {
                    this.img_5.style.display = "inline-block";
                    this.crop_Mask(MASK_HEART);
                }
                if (product_name == this.img_6.name) {
                    this.img_6.style.display = "inline-block";
                    this.crop_Mask(MASK_TEARDROP);
                }
                if (product_name == this.img_7.name) {
                    this.img_7.style.display = "inline-block";
                    this.crop_Mask(MASK_TRIANGLE);
                }

            }
        } else {
            this.img_1.style.display = "inline-block";
            this.img_2.style.display = "inline-block";
            this.img_3.style.display = "inline-block";
            this.img_4.style.display = "inline-block";
            this.crop_Mask(0);
        }

        this.selectOutline = new createjs.Shape();
        this.mask_container.addChild(this.selectOutline);

        this.selectOutlineHandlers = new createjs.Shape();
        this.selectOutlineHandlers.name = "handler";
        this.mask_container.addChild(this.selectOutlineHandlers);
        
        if (dyo.engine.photos._uploadPhotoId == 21 || (dyo.engine.photos._uploadPhotoId == 137 && !dyo.engine.photos.useAsBackgroundImage)) {

            if (dyo.engine.photos._uploadPhotoId == 21 || (dyo.engine.photos._uploadPhotoId == 137 && !dyo.engine.photos.useAsBackgroundImage)) {
                let ratio = this.original_bounds.height / this.original_bounds.width;
                dyo.engine.photos.crop_Size((100 * ratio) * 0.7, 100);
            } else {
                dyo.engine.photos.crop_Size(100);
            }

        } else {
            dyo.engine.photos.crop_Size(100);
        }

    }

    select() {
        this.selectOutline.visible = true;
        this.selectOutlineHandlers.visible = true;
    }

    checkMaskPosition() {

        //if (dyo.engine.photos._uploadPhotoId != 21 && dyo.engine.photos._uploadPhotoId != 137) {
            if (this.box) {

                let scale = this.mask_container.scaleX;
                let scale2 = this.mask_container.scaleY;

                let sw = (this.original_bounds.width - (this.box.width * scale)) / 2;
                let sh = (this.original_bounds.height - (this.box.height * scale)) / 2;

                if (dyo.engine.photos._uploadPhotoId != 21 && dyo.engine.photos._uploadPhotoId != 137) {
                    sh = (this.original_bounds.height - (this.box.height * scale2)) / 2;
                }

                switch (this.photo_mask) {

                    default:    

                        if (this.crop_bitmap.rotation == 0) {
                            if (this.mask_container.x < (this.crop_bitmap.x - sw)) { 
                                this.mask_container.x = this.crop_bitmap.x - sw;
                            }

                            if (this.mask_container.x > (this.crop_bitmap.x + sw)) { 
                                this.mask_container.x = this.crop_bitmap.x + sw;
                            }

                            if (this.mask_container.y < (this.crop_bitmap.y - sh)) { 
                                this.mask_container.y = this.crop_bitmap.y - sh;
                            }

                            if (this.mask_container.y > (this.crop_bitmap.y + sh)) { 
                                this.mask_container.y = this.crop_bitmap.y + sh;
                            }
                        }
                        
                        break;

                    case MASK_HEART: case MASK_TRIANGLE: case MASK_TEARDROP:
                        break;

                }

            }

        //}

    }

    crop_Mask(value) {

        this.mask = value;

        let c, b, m, scaleValue;

        this.photo_mask = value;
        this.crop_mask.graphics.clear();

        let _width = this.original_bounds.width;
        let _height = this.original_bounds.height;

        let _mask_width = 70;
        let _mask_height = 50;

        switch (value) {
            default:
                _mask_width = 90;
                _mask_height = 70;

                if (dyo.monument.id == 32) {
                    if (dyo.data.width < dyo.data.height) {
                        _mask_height = 55;
                    }
                }

                break;
            case MASK_HEART:
                _mask_width = 70;
                _mask_height = 50;
                break;
            case MASK_TRIANGLE:
                _mask_width = 70;
                _mask_height = 70;
                break;
        }

        let _ratio = (_mask_height / _mask_width);
        let _ratio2 = (_mask_width / _mask_height);
        let _scale;

        if (this.img_type == LANDSCAPE) {

            _scale = _height / _mask_height;
            _width = _mask_width * _scale;
            _height = _mask_height * _scale;

        }

        if (this.img_type == PORTRAIT) {

            _scale = _height / _mask_width;
            _width = _mask_height * _scale;
            _height = _mask_width * _scale;

        }

        if (this.img_type == SQUARE) {

            _scale = _height / _mask_height;
            _width = _mask_width * _scale;
            _height = _mask_height * _scale;

        }

        let commands = [];
        commands[MASK_TRIANGLE] = 'A85XcMAcIgu3MAdrAu3g';
        commands[MASK_TEARDROP] = 'Am2ccQjAhZifieQiuishijbQhuj2gDkTQgJsSJusSQGloVKEnNIALAAIgTBkQgPBfAABwQAABpADAnIACAAQAAA7ADAnIADAAQApDkATBXQAeCKAsB1QBODTEfIOQBxDPAsEBQAbCgAADBQAAIRlmE2QlZErowAAQilAAi5hWg';
        commands[MASK_HEART] = 'AgFWyIgNgGQgigXgpgnIhIhDQiwiijWjLQlllVjWlRQkNmlgimTQgZkkBdjhQBwkOEAhYQEdhgEXCUQDlB5DIEPQDKkPDkh5QEXiUEdBgQEABYBwEOQBdDhgZEkQghGTkNGlQjXFRlkFVQjBC4jGC1IhIBDQgpAmgjAYIgMAGg';

        switch (value) {
            case MASK_TRIANGLE:
            
                _width = this.original_bounds.width;
                _height = this.original_bounds.height;

                if (this.img_type == LANDSCAPE) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _width,
                        height: _height
                    }
                }

                if (this.img_type == PORTRAIT) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _width,
                        height: _height
                    }
                }

                if (this.img_type == SQUARE) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _width,
                        height: _height
                    }
                }

                if (this.img_type == PORTRAIT) {
                    scaleValue = (this.original_bounds.width / 383);
                }

                if (this.img_type == LANDSCAPE) {
                    scaleValue = (this.original_bounds.height / 300);
                }

                c = commands[value];
                b = dyo.monument.headstone.drawBitmap(c, '#00ff00', this.box.width, this.box.height);
                m = new createjs.Matrix2D();
                m.translate(this.box.x * scaleValue, this.box.y * scaleValue);
                m.scale(scaleValue, scaleValue);

                this.crop_mask.graphics.clear()
                this.crop_mask.graphics.beginBitmapFill(b, "no-repeat", m)
                .drawRect(this.box.x, this.box.y, this.box.width, this.box.height);

                if (this.img_type == PORTRAIT || this.img_type == SQUARE) {
                    this.box = {
                        x: 0,
                        y: 0,
                        width: _width,
                        height: 330 * scaleValue
                    }
                }

                if (this.img_type == LANDSCAPE) {
                    this.box = {
                        x: 0,
                        y: 0,
                        width: 383 * scaleValue,
                        height: _height
                    }
                }

                break;
            case MASK_TEARDROP:

                _width = this.original_bounds.width;
                _height = this.original_bounds.height;

                if (this.img_type == LANDSCAPE) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _width,
                        height: _height
                    }
                }

                if (this.img_type == PORTRAIT) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _width,
                        height: _height
                    }
                }

                if (this.img_type == SQUARE) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _width,
                        height: _height
                    }
                }

                if (this.img_type == PORTRAIT || this.img_type == SQUARE) {
                    scaleValue = (this.original_bounds.width / 285);
                }

                if (this.img_type == LANDSCAPE) {
                    scaleValue = (this.original_bounds.height / 380);
                }

                c = commands[value];
                b = dyo.monument.headstone.drawBitmap(c, '#00ff00', this.box.width, this.box.height);
                m = new createjs.Matrix2D();
                m.translate(this.box.x * scaleValue, this.box.y * scaleValue);
                m.scale(scaleValue, scaleValue);

                this.crop_mask.graphics.clear()
                this.crop_mask.graphics.beginBitmapFill(b, "no-repeat", m)
                .drawRect(this.box.x, this.box.y, this.box.width, this.box.height);

                if (this.img_type == PORTRAIT || this.img_type == SQUARE) {
                    this.box = {
                        x: 0,
                        y: 0,
                        width: _width,
                        height: 380 * scaleValue
                    }
                }

                if (this.img_type == LANDSCAPE) {
                    this.box = {
                        x: 0,
                        y: 0,
                        width: 236 * scaleValue,
                        height: _height
                    }
                }

                break;
            case MASK_HEART:

                _width = this.original_bounds.width;
                _height = this.original_bounds.height;

                if (this.img_type == LANDSCAPE) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _width,
                        height: _height
                    }
                }

                if (this.img_type == PORTRAIT) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _width,
                        height: _height
                    }
                }

                if (this.img_type == SQUARE) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _width,
                        height: _height
                    }
                }

                if (this.img_type == PORTRAIT || this.img_type == SQUARE) {
                    scaleValue = (this.original_bounds.width / 285);
                }

                if (this.img_type == LANDSCAPE) {
                    scaleValue = (this.original_bounds.height / 290);
                }

                c = commands[value];
                b = dyo.monument.headstone.drawBitmap(c, '#00ff00', this.box.width, this.box.height);
                m = new createjs.Matrix2D();
                m.translate(this.box.x * scaleValue, this.box.y * scaleValue);
                m.scale(scaleValue, scaleValue);

                this.crop_mask.graphics.clear()
                this.crop_mask.graphics.beginBitmapFill(b, "no-repeat", m)
                .drawRect(this.box.x, this.box.y, this.box.width, this.box.height);

                if (this.img_type == SQUARE) {
                    _width = this.original_bounds.width;
                    _height = this.original_bounds.height;
                    this.box = {
                        x: 0,
                        y: 0,
                        width: _width,
                        height: _height
                    }
                }

                if (this.img_type == PORTRAIT) {
                    this.box = {
                        x: 0,
                        y: 0,
                        width: _width,
                        height: 380 * scaleValue
                    }
                }

                if (this.img_type == LANDSCAPE) {
                    this.box = {
                        x: 0,
                        y: 0,
                        width: 375 * scaleValue,
                        height: _height
                    }
                }
                
                break;
            case MASK_PORTRAIT_OVAL:

                _width = this.original_bounds.width;
                _height = this.original_bounds.height;

                if (this.img_type == LANDSCAPE) {
                    this.box = {
                        x: this.crop_bitmap.x - ((_height * _ratio) / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _height * _ratio,
                        height: _height
                    }
                }

                if (this.img_type == PORTRAIT) {
                    this.box = {
                        x: this.crop_bitmap.x - ((_height * _ratio) / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _height * _ratio,
                        height: _height
                    }
                }

                if (this.img_type == SQUARE) {
                    this.box = {
                        x: this.crop_bitmap.x - ((_height * _ratio) / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _height * _ratio,
                        height: _height
                    }
                }

                if (dyo.engine.photos._uploadPhotoId == 21 || (dyo.engine.photos._uploadPhotoId == 137 && !dyo.engine.photos.useAsBackgroundImage)) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _width,
                        height: _height
                    }
                }

                this.crop_mask.graphics.clear();
                this.crop_mask.graphics.beginFill("#00ff00").drawEllipse(this.box.x, this.box.y, this.box.width, this.box.height);

                break;
            case MASK_LANDSCAPE_OVAL:

                _width = this.original_bounds.width;
                _height = this.original_bounds.height;

                if (this.img_type == LANDSCAPE) {
                    
                    if (_width * _ratio < _height) {
                        this.box = {
                            x: this.crop_bitmap.x - (_width / 2),
                            y: this.crop_bitmap.y - ((_width * _ratio) / 2),
                            width: _width,
                            height: _width * _ratio
                        }
                    } else {
                        this.box = {
                            x: this.crop_bitmap.x - (_height *_ratio2 / 2),
                            y: this.crop_bitmap.y - (_height / 2),
                            width: _height * _ratio2,
                            height: _height
                        }
                    }

                }

                if (this.img_type == PORTRAIT) {

                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - ((_width * _ratio) / 2),
                        width: _width,
                        height: _width * _ratio
                    }

                }

                if (this.img_type == SQUARE) {

                    this.box = {
                        x: this.crop_bitmap.x - (_height / 2),
                        y: this.crop_bitmap.y - ((_height * _ratio) / 2),
                        width: _height,
                        height: _height * _ratio
                    }

                }

                if (dyo.engine.photos._uploadPhotoId == 21 || (dyo.engine.photos._uploadPhotoId == 137 && !dyo.engine.photos.useAsBackgroundImage)) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _width,
                        height: _height
                    }
                }

                this.crop_mask.graphics.clear();
                this.crop_mask.graphics.beginFill("#00ff00").drawEllipse(this.box.x, this.box.y, this.box.width, this.box.height);

                break;
            case MASK_PORTRAIT_RECTANGLE:

                _width = this.original_bounds.width;
                _height = this.original_bounds.height;

                if (this.img_type == PORTRAIT) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _width,
                        height: _height
                    }
                }

                if (this.img_type == LANDSCAPE) {
                    this.box = {
                        x: this.crop_bitmap.x - ((_height * _ratio) / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _height * _ratio,
                        height: _height
                    }
                }

                if (this.img_type == SQUARE) {
                    this.box = {
                        x: this.crop_bitmap.x - ((_height * _ratio) / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _height * _ratio,
                        height: _height
                    }
                }

                if (dyo.engine.photos._uploadPhotoId == 21 || (dyo.engine.photos._uploadPhotoId == 137 && !dyo.engine.photos.useAsBackgroundImage)) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _width,
                        height: _height
                    }
                }

                this.crop_mask.graphics.clear();
                this.crop_mask.graphics.beginFill("#00ff00").drawRect(this.box.x, this.box.y, this.box.width, this.box.height);

                break;
            case MASK_LANDSCAPE_RECTANGLE:

                _width = this.original_bounds.width;
                _height = this.original_bounds.height;

                if (this.img_type == LANDSCAPE) {
                    
                    if (_width * _ratio < _height) {
                        this.box = {
                            x: this.crop_bitmap.x - (_width / 2),
                            y: this.crop_bitmap.y - ((_width * _ratio) / 2),
                            width: _width,
                            height: _width * _ratio
                        }
                    } else {
                        this.box = {
                            x: this.crop_bitmap.x - (_height *_ratio2 / 2),
                            y: this.crop_bitmap.y - (_height / 2),
                            width: _height * _ratio2,
                            height: _height
                        }
                    }

                }

                if (this.img_type == PORTRAIT) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - ((_width * _ratio) / 2),
                        width: _width,
                        height: _width * _ratio
                    }
                }

                if (this.img_type == SQUARE) {
                    this.box = {
                        x: this.crop_bitmap.x - (_height / 2),
                        y: this.crop_bitmap.y - ((_height * _ratio) / 2),
                        width: _height,
                        height: _height * _ratio
                    }
                }

                if (dyo.engine.photos._uploadPhotoId == 21 || (dyo.engine.photos._uploadPhotoId == 137 && !dyo.engine.photos.useAsBackgroundImage)) {
                    this.box = {
                        x: this.crop_bitmap.x - (_width / 2),
                        y: this.crop_bitmap.y - (_height / 2),
                        width: _width,
                        height: _height
                    }
                }

                this.crop_mask.graphics.clear();
                this.crop_mask.graphics.beginFill("#00ff00").drawRect(this.box.x, this.box.y, this.box.width, this.box.height);
                
                break;
        }

        this.crop_mask.cache(-this.box.width / 2, -this.box.height / 2, this.crop_bitmap.x + this.box.width, this.crop_bitmap.y + this.box.height);
        
        this.checkMaskPosition();

        this.boxCopy = {
            width: this.box.width,
            height: this.box.height
        }

        this.bounds = this.box;

        this.crop_Size(this.scaleValue);
    }

    crop_Rotation(value) {
        this.crop_bitmap.rotation = value;
    }

    crop_Size(value, value2) {

        if (isNaN(value)) {
            value = 10;
        }

        this.scaleValue = value;

        let scale = value / 100;
        let scale2;

        if (value2) {
            scale2 = value2 / 100;
        } 

        let ms = 50 / 70;

        if (ms > (this.original_bounds.width / this.original_bounds.height)) {
            scale = scale - (ms - (this.original_bounds.width / this.original_bounds.height) + ms / 10);
                
            if (value2) {
                scale2 = scale2 - (ms - (this.original_bounds.width / this.original_bounds.height) + ms / 10);
            }
            
        }

        this.scale = scale;

        if (dyo.engine.photos._uploadPhotoId == 21 || (dyo.engine.photos._uploadPhotoId == 137 && !dyo.engine.photos.useAsBackgroundImage)) {
            this.crop_mask.scaleX = scale;
            if (scale2) {
                this.crop_mask.scaleY = scale2;
            }
        } else {
            this.crop_mask.scaleX = this.crop_mask.scaleY = scale;
        }

        this.bounds.width = this.boxCopy.width * this.crop_mask.scaleX;
        this.bounds.height = this.boxCopy.height * this.crop_mask.scaleY;

        if (this.selectOutline) {
            this.drawOutline();
            this.drawHandlers();
        }

        this.checkMaskPosition();

    }

    setupPhotoSection() {

        let self = this;

        self.showPhotosContainersAndButtons();
        self.hideButtons();
        self.buttonCrop.hide();

        self.buttonSizeIncrease.show();
        self.buttonSizeDecrease.show();

        let sizes = self.photoSizes();
        let size;
        let color =  dyo.config._additions.Images[0].color;

        if (sizes.length > 1) {
            dyo.engine.photos.slider_size.slider.min = 1;
            dyo.engine.photos.slider_size.slider.max = sizes.length;
            dyo.engine.photos.slider_size.slider.value = 1;
            size = sizes[0].name;
        } else {
            dyo.engine.photos.slider_size.slider.max = Number(sizes[0].max_height);
            dyo.engine.photos.slider_size.slider.min = Number(sizes[0].min_height);
            dyo.engine.photos.slider_size.slider.value = Number(sizes[0].init_height);
            size = Number(sizes[0].init_height);
        }

        dyo.engine.photos.slider_rotation.slider.min = -180;
        dyo.engine.photos.slider_rotation.slider.max = 180;
        dyo.engine.photos.slider_rotation.slider.value = 0;

    }

    photoSection() {

        if (dyo.mode == "3d") {
			$("#openfl").style.visibility = "visible";
            $("#canvas").style.visibility = "hidden";
        }
        
        if (dyo.engine.deviceType == "mobile") {
            $("#quick-enquiry").style.visibility = "visible";
        }

        let self = dyo.engine.photos;

        dyo.currentSection = "Photos";
        
        $('#dyo_photos_title', Translate(Lang.IMAGES) + " <i class='material-icons'>help_outline</i>");
        
        self.slider_size_title.hide();
        self.color_style_title.hide();

        self.image_mask_container.style.display = "none";

        let bounds = self.crop_mask.getBounds();

        let scale = self.scale;

        let target = self.cont;
        let p = {
            x: self.mask_container.x,
            y: self.mask_container.y
        }

        let x = p.x - (self.bounds.width / 2);
        let y = p.y - (self.bounds.height / 2);
        let w = self.bounds.width;
        let h = self.bounds.height;

        target.cache(x, y, w, h);

        let img = new Image();
        img.src = target.cacheCanvas.toDataURL();
        img.onload = function() {

            self.crop_data.bmp = img;

            dyo.monument.container.visible = true;
            let stage = dyo.engine.canvas.getStage();
            stage.visible = false;

            self.setupPhotoSection();

            dyo.fileNameCropped = self.tmpFileName;

            if (dyo.filename == undefined) {
                dyo.filename = dyo.fileNameCropped;
            }

            if (Number(dyo.now) == undefined) {
                dyo.now = Date.now();
            }

            dyo.engine.loader.show("Account:1379"); 

            target.cacheCanvas.toBlob(function(blob) {
                let reader = new FileReader();
                reader.readAsDataURL(blob); 
                reader.onloadend = function() {

                    var formData = new FormData();
                    formData.append('uniqueid', dyo.now);
                    formData.append('filename', dyo.filename + "_cropped");
                    
                    var _blob = new Blob([blob], {type: 'image/jpeg'});
                    _blob.lastModifiedDate = new Date();
                    formData.append('upload', _blob);
                    
                    fetch(dyo.path.upload, {
                      method: 'POST',
                      body: formData
                    })
                    .then(response => response)
                    .then(response => { 
                        response.text().then((data) => {
                            let result = JSON.parse(data);

                            dyo.filename = undefined;
                            dyo.fileNameCropped = result.img;
                            dyo.fileNameCroppedPath = result.path;

                            if (dyo.engine.photos.useAsBackgroundImage) {
                                dyo.engine.photos.backgroundImage();
                                dyo.engine.photos.useAsBackgroundImage = false;
                            } else {
                                self.addPhoto();
                            }

                            dyo.engine.loader.hide("Photos:1420");

                        });
                    })
                    .catch(error => { 
                        dyo.engine.loader.hide("Photos:1425");
                        console.error('Error:', error) 

                        if (FileReader) {
                            var file_reader = new FileReader();
                            file_reader.onload = function () {
                                sessionStorage.setItem(fileNameCropped, file_reader.result);

                                self.addPhoto();
                                dyo.engine.loader.hide("Photos:1434");
                                
                            }
                            file_reader.readAsDataURL(_blob);
                        }

                    });
                }
    
            }, "image/jpeg", 0.85);

        }
        
    }

    addPhoto() {

        let self = dyo.engine.photos;

        let sizes = self.photoSizes();
        let size;
        let shape_url;

        if (dyo.engine.photos.uploadPhotoId == 2400) {
            switch (self.photo_mask) {
                case 1: case 3:
                    sizes.splice(0, 2);
                    break;
            }
		}

        if (sizes.length > 1) {
            size = sizes[0].name;
        } else {
            size = Number(sizes[0].init_height);
        }

        /*
        const MASK_PORTRAIT_OVAL = 0;
        const MASK_PORTRAIT_RECTANGLE = 1;
        const MASK_LANDSCAPE_OVAL = 2;
        const MASK_LANDSCAPE_RECTANGLE = 3;
        const MASK_SQUARE = 4;
        */

        switch (self.photo_mask) {
            case 0:
                shape_url = "shapes/photos/oval_vertical.svg";
                break;
            case 1:
                shape_url = "shapes/photos/rectangle_vertical.svg";
                break;
            case 2:
                shape_url = "shapes/photos/oval_horizontal.svg";
                break;
            case 3:
                shape_url = "shapes/photos/rectangle_horizontal.svg";
                break;
        }

        let containerWidth = 0;

        let photoObject = {
            type: "Photo",
            id: dyo.engine.photos.uploadPhotoId,
            uid: dyo.now,
            name: dyo.engine.photos.uploadPhotoName,
            path: dyo.engine.photos.path,
            item: dyo.fileNameCropped,
            size: size,
            color: self.color,
            mask: self.photo_mask,
            shape_url: shape_url,
            bmp: self.crop_data.bmp,
            src: self.crop_data.filename,
            side: dyo.side, 
            x: containerWidth,
            y: 0,
            draggable: true,
            selected: true,
            scale: 1
        };

        let photo = new Photo(photoObject);
        
        dyo.engine.photos.hide();
        dyo.engine.loader.hide("Photos:1516");

        if (dyo.target == null) {
            dyo.target = dyo.monument.getPartByType('Headstone');
        }

        dyo.target.add(photo);

        dyo.engine.canvas.hideContainer(dyo.engine.canvas.crop_container);

        let e = document.getElementsByClassName("quick-enquiry-top");
        for (let n = 0; n < e.length; n++) {
            e[n].style.display = "block";
        }

    }

    backgroundImage() {

        let self = dyo.engine.photos;
        let bounds = self.crop_mask.getBounds();

        let target = self.cont;
        let p = {
           x: self.mask_container.x,
           y: self.mask_container.y
        }

        let x = p.x - (self.bounds.width / 2);
        let y = p.y - (self.bounds.height / 2);
        let w = self.bounds.width;
        let h = self.bounds.height;

        target.cache(x, y, w, h);

        let img = new Image();
        img.src = target.cacheCanvas.toDataURL();
        img.onload = function() {

            let part = dyo.monument.headstone;
            part._select();
            part._bmp = undefined;
            part.applyTexture(img);

            dyo.monument.backgroundOption = "photo";
            dyo.monument.headstone.background = dyo.fileNameCropped;
            dyo.monument.headstone.backgroundPath = dyo.fileNameCroppedPath;

            dyo.engine.show();
            dyo.engine.photos.hide();
            dyo.engine.inscriptions.reset();
            dyo.engine.inscriptions.hide();
            dyo.engine.motifs.hide();
            dyo.engine.loader.hide("Photos:1575");

            dyo.engine.canvas.hideContainer(dyo.engine.canvas.crop_container);

            dyo.engine.designMenu();
    
        }

    }

    hitUpload() {
        dyo.now = Date.now();
        $("#dyo_button_photo_upload_file").click();
    }

	events() {

        let self = this;

        if (!this.initEvents) {

            let crop = $("#dyo_button_photo_crop");
            crop.removeEventListener("click", self.photoSection);
            crop.addEventListener("click", self.photoSection);

            $("#dyo_button_photo_slider_size_increase").addEventListener("click", () => {
                self.slider_size.increase();
                $("#dyo_button_photo_slider_size_increase").blur();
            });

            $("#dyo_button_photo_slider_size_decrease").addEventListener("click", () => {
                self.slider_size.decrease();
                $("#dyo_button_photo_slider_size_decrease").blur();
            });

            $("#dyo_button_photo_slider_rotation_increase").addEventListener("click", () => {
                self.slider_rotation.increase();
                $("#dyo_button_photo_slider_rotation_increase").blur();
            });

            $("#dyo_button_photo_slider_rotation_decrease").addEventListener("click", () => {
                self.slider_rotation.decrease();
                $("#dyo_button_photo_slider_rotation_decrease").blur();
            });

        }

        let type = dyo.config.getProductType();

        this.photos_types.forEach(photo => {

            dyo.config._additions.Images.forEach(addition => {

                if (Number(photo.id) == Number(addition.id)) {

                    if (dyo.engine.deviceType == "desktop") {

                        try {
                            $('#' + photo.class + "_" + this.makeSafeName(photo.selector)).addEventListener('click', () => { 
                                
                                this.uploadPhotoId = photo.id;
                                this.uploadPhotoName = photo.name;

                                dyo.engine.tutorial.upload();

                            });
                        }
                        catch(e) {
                            console.log(e);
                        }

                    }

                }
        
            });

        });

        this.photos_types.forEach(photo => {

            let nr = 0;

            dyo.config._additions.Images.forEach(addition => {

                if (Number(photo.id) == Number(addition.id)) {

                    if (dyo.engine.deviceType == "desktop") {

                        if ($('#' + photo.class + "_" + this.makeSafeName(photo.selector))) {

                            $('#' + photo.class + "_" + this.makeSafeName(photo.selector)).addEventListener('mouseover', (e) => { 

                                $("#tutorial-header", photo.title);

                                let photo_description = photo.description;

                                if (dyo.monument.id == 9 || dyo.monument.id == 8 || dyo.monument.id == 135) {
                                    if (addition.id == 21) {
                                        photo_description = photo.description.replace("Up to two", "One");
                                        photo_description = photo_description.replace("than two image", "images");
                                        photo_description = photo_description.replace("attract", "attract an");
                                        photo_description = photo_description.replace("charges", "charge");
                                    }
                                }

                                $("#tutorial-description", photo_description);

                                dyo.engine.tutorial.show(photo.nr);

                            });

                        }

                    } 
                      
                    if (dyo.engine.mobileDevice) {

                        $('#' + photo.class + "_" + this.makeSafeName(photo.selector)).addEventListener('click', (e) => { 
                            dyo.engine.popupActive = true;
            
                            this.uploadPhotoId = photo.id;
                            this.uploadPhotoName = photo.name;

                            dyo.engine.dialog_resp.title = photo.title;
                            dyo.engine.dialog_resp.body = photo.description;
                            dyo.engine.dialog_resp.accept = Translate(Lang.UPLOAD);
                            dyo.engine.dialog_resp.decline = Translate(Lang.CLOSE);
                            dyo.engine.dialog_resp.action = dyo.engine.tutorial.upload;
                            dyo.engine.dialog_resp.render();
                            dyo.engine.dialog_resp.show();

                            if (dyo.template == 2) {
                                let c = 'skinAU_efece0';
                                $("#resp-header").classList.add(c);
                                $("#resp-footer").classList.add(c);
                            }

                        });

                    }

                }

            });

        });

        this.photos_types.forEach(photo => {

            dyo.config._additions.Images.forEach(addition => {

                if (Number(photo.id) == Number(addition.id)) {

                    if (dyo.engine.deviceType == "desktop") {

                        if ($('#' + photo.class + "_" + this.makeSafeName(photo.selector))) {

                            $('#' + photo.class + "_" + this.makeSafeName(photo.selector)).addEventListener('mouseout', () => { 
                                if (!dyo.engine.tutorial.uploadStarted) {
                                    dyo.engine.tutorial.hide();
                                }
                            });

                        }

                    }

                }

            });
            
        });

		$("#dyo_button_photo_upload").addEventListener("click", (e) => {
            $("#dyo_button_photo_upload_file").click();
        });
        
        $("#dyo_button_photo_upload_file").addEventListener("change", (e) => {
            dyo.engine.loader.unblock();

            let fullPath = $("#dyo_button_photo_upload_file").value;

            if (fullPath) {
                let startIndex = (fullPath.indexOf('\\') >= 0 ? fullPath.lastIndexOf('\\') : fullPath.lastIndexOf('/'));
                var filename = fullPath.substring(startIndex);
                if (filename.indexOf('\\') === 0 || filename.indexOf('/') === 0) {
                    filename = filename.substring(1);
                }
                dyo.filename = filename;
            }
    
            if (window.FileReader) {
                dyo.engine.loader.show("Account:1741"); 

                let reader = new FileReader();
    
                reader.onload = function (e) {

                    var formData = new FormData();
                    var fileField = $("#dyo_button_photo_upload_file");
                    
                    formData.append('uniqueid', dyo.now);
                    formData.append('filename', filename);
                    formData.append('upload', fileField.files[0]);
                    
                    fetch(dyo.path.upload, {
                      method: 'POST',
                      body: formData
                    })
                    .then(response => response)
                    .then(response => {
                        response.text().then((data) => {
                            let result = JSON.parse(data);

                            $("#dyo_button_photo_upload_file").value = "";

                            let img = new Image();
                            img.src = e.target.result;
                            img.onload = () => {
        
                                let data = {
                                    bmp: img,
                                    path: result.path,
                                    filename: filename,
                                    src: result.img
                                }

                                dyo.engine.photos.fileName = result["img"];
                                dyo.engine.photos.path = result["path"];

                                self.tmpFileName = data.src;

                                self.cropSection(data);

                            }

                        });

                    })
                    .catch(error => {
                        console.error('Error:', error);

                        if (FileReader) {
                            var file_reader = new FileReader();
                            file_reader.onload = function () {
                                sessionStorage.setItem(filename, file_reader.result);

                                let img = new Image();
                                img.src = sessionStorage.getItem(filename);
                                img.onload = () => {
            
                                    let data = {
                                        bmp: img,
                                        filename: filename,
                                        src: filename
                                    }
    
                                    self.cropSection(data);
    
                                }


                            }
                            file_reader.readAsDataURL(fileField.files[0]);
                        }

                    });

                }
                reader.readAsDataURL(e.target.files[0]);

            }
    
        });

        if (!this.initEvents) {
            
            $("#dyo_button_photo_rotate_left").addEventListener("click", () => {
                if (dyo.selected) {
                    dyo.selected.rotate(-90, 1);
                    $("#dyo_button_photo_rotate_left").blur();
                }
            });

            $("#dyo_button_photo_rotate_right").addEventListener("click", () => {
                if (dyo.selected) {
                    dyo.selected.rotate(90, 1);
                    $("#dyo_button_photo_rotate_right").blur();
                }
            });

            $("#dyo_button_photo_flipx").addEventListener("click", () => {
                if (dyo.selected) {
                    dyo.selected.flipX();
                    $("#dyo_button_photo_flipx").blur();
                }
            });

            $("#dyo_button_photo_flipy").addEventListener("click", () => {
                if (dyo.selected) {
                    dyo.selected.flipY();
                    $("#dyo_button_photo_flipy").blur();
                }
            });

            $("#dyo_button_photo_duplicate").addEventListener("click", () => {
                if (dyo.selected) {
                    dyo.selected.duplicate();
                    $("#dyo_button_photo_duplicate").blur();
                }
            });

            $("#dyo_button_photo_delete").addEventListener("click", () => {
                if (dyo.selected) {
                    dyo.selected.delete();
                    dyo.selected = null;

                    dyo.engine.show();

                    if (dyo.target == null) {
                        dyo.target = dyo.monument.getPartByType('Headstone');
                    }
                    
                    if (dyo.mode != "3d") {
                        let part = dyo.target;
                        part._select();
                    }
                    
                    $("#dyo_button_photo_delete").blur();
                }
            });

            if (dyo.engine.mobileDevice) {

                $('#dyo_photos_title').addEventListener('click', (e) => { 
                    dyo.engine.popupActive = true;

                    let o;
                    let dialog = dyo.engine.dialog_resp;

                    if (dyo.currentSection != "Crop") {
                        o = dyo.engine.photos.getTutorialData();
                    } else { 
                        o = dyo.engine.photos.getTutorialDataCrop();
                    }
    
                    dialog.title = o.title;
                    dialog.body = o.description;
                    dialog.accept = "";
                    dialog.decline = Translate(Lang.CLOSE);
                    dialog.render();
                    dialog.show();

                    if (dyo.template == 2) {
                        let c = 'skinAU_efece0';
                        $("#resp-header").classList.add(c);
                        $("#resp-footer").classList.add(c);
                    }

                });
    
            } else {
                    
                $('#dyo_photos_title').addEventListener('mouseover', (e) => { 

                    if (dyo.currentSection != "Crop") {
                        let o = dyo.engine.photos.getTutorialData();

                        $("#tutorial-header", o.title);
                        $("#tutorial-description", o.description);
                        dyo.engine.tutorial.show(1);
                    } else {
                        let c = dyo.engine.photos.getTutorialDataCrop();

                        $("#tutorial-header", c.title);
                        $("#tutorial-description", c.description);
                        dyo.engine.tutorial.show(1);                        
                    }

                });

                $('#dyo_photos_title').addEventListener('mouseout', (e) => { 
                    dyo.engine.tutorial.hide();
                });

            }
            
        }

        this.initEvents = true;

	}

    getTutorialData() {

        let title, description, instructions;

        switch (dyo.monument.id) {
            case P.BRONZE_PLAQUE: case P.TRADITIONAL_ENGRAVED_PLAQUE: case P.LASER_ETCHED_BLACK_GRANITE_PLAQUE: case P.TRADITIONAL_ENGRAVED_HEADSTONE: case P.LASER_ETCHED_BLACK_GRANITE_HEADSTONE: case P.LASER_ETCHED_BLACK_GRANITE_MINI_HEADSTONE: case P.LASER_ETCHED_PET_MINI_HEADSTONE: case P.LASER_ETCHED_PET_PLAQUE: case P.LASER_ETCHED_PET_ROCK:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_IMAGES) + "</p>";
                instructions += "</div>";
                break;
        }

        switch (dyo.monument.id) {
            default:
                title = Translate(Lang.PHOTO);
                description = "<p>" + Translate(Lang.PHOTO_INFO_LASER) + "</p>";
                break;
            case 7:
                title = Translate(Lang.PHOTO);
                description = "<p>" + Translate(Lang.PHOTO_INFO_CERAMIC) + "</p>";
                break;
            case 32:
                title = Translate(Lang.PHOTO);
                description = "<p>" + Translate(Lang.PHOTO_INFO_FULL_COLOUR) + "</p>";
                break;
            case 5: case 34: case 124: case 101: case 2350: case 102:
                title = Translate(Lang.PHOTO);
                description = "<p>" + Translate(Lang.PHOTO_INFO_TRADITIONAL) + "</p>";
                break;
        }

        if (instructions) {           
            description += instructions;
        }

        let o = {};
        o.title = title;
        o.description = description;

        return o;

    }


    getTutorialDataCrop() {

        let title, description, instructions;

        title = Translate(Lang.CROP_SECTION);
        description = "<p>" + Translate(Lang.CROP_SECTION_DESCRIPTION) + "</p>";

        let o = {};
        o.title = title;
        o.description = description;

        return o;

    }
	
}