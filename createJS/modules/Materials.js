import { Drawer, Dialog, ImageList, TextField, Select, Slider, List } from '../material/MaterialDesign.js';
import { P, $, Lang, Translate, File } from '../Const.js';
import { Component } from '../material/Component.js';

export class Materials extends Component {

	constructor(dat = {}) {
		super(dat);
        this.data = dat.data;
        this.data_image = dat.data_image;

        this.container = $("div", "add", "container", this.stage);
        this.container_image = $("div", "add", "container_image", this.stage);
        
        this.hide();
    }

    render() {

        this.menu = new Drawer({
            stage: this.container,
            drawer_type: 0,
            toolbar_type: 1,
            title: this.title,
            id: "dyo_materials"
        });
        this.menu.render();

		this.colors_list = new ImageList({
            stage: $("#dyo_materials-mdc-list"),
            parent: this,
            id: "dyo_materials_colors_list",
            css: "margin-left: 15px",
            type: 1,
            data: this.colors,
            title: Lang.SELECT_COLOUR
        });

        this.input = new List({
            stage: $("#dyo_materials-mdc-list"),
            parent: this,
            id: "dyo_materials_list",
            events: true,
            type: 1,
            data: this.data,
            title: Lang.SELECT_MATERIAL
        });
        this.input.render();

        this.menu_image = new Drawer({
            stage: this.container_image,
            drawer_type: 0,
            toolbar_type: 1,
            title: this.title,
            id: "dyo_materials_image"
        });
        this.menu_image.render();

        this.input_image = new List({
            stage: $("#dyo_materials_image-mdc-list"),
            parent: this,
            id: "dyo_materials_image_list",
            events: true,
            type: 9,
            data: this.data_image,
            title: Lang.SELECT_MATERIAL
        });
        this.input_image.render();

    }

    showImage() {
        dyo.currentSection = "Materials";
        dyo.last_url = "select-material";
        this.container.style.display = "none";
        this.container_image.style.display = "block";

        dyo.monument.updateHeader("Materials:22");
    }
    
    show() {
        dyo.currentSection = "Materials";
        dyo.last_url = "select-material";
        this.container.style.display = "block";

        try {
            if (dyo.mode == "3d") {
                clearInterval(dyo.showNr);
                dyo.showNr = setInterval(() => {
                    if (Engine3D.Controller) {
                        if (Engine3D.Controller.getCurrentProject()) {
                            if (dyo.engine3d_ready) {
                                if (Engine3D.Controller.getCurrentProject().getSelectedModel() == null) {
                                    Engine3D.Controller.getCurrentProject().setSelectedModel(dyo.engine3d.headstone3d);
                                    clearInterval(dyo.showNr);
                                } else {
                                    clearInterval(dyo.showNr);
                                }
                            }
                        }
                    }
            
                }, 100);
    
            }    
        }
        catch(e) {
            console.log(e);
        }

        dyo.monument.updateHeader("Materials:22");
    }

    updateSettings() {
        $("#back_to_menu_" + this.title, Translate(Lang.BACK_TO_DESIGN_MENU));
    }

    update(data) {

        if (dyo.monument.id == P.BRONZE_PLAQUE || 
            dyo.monument.id == P.FULL_COLOUR_PLAQUE || 
            dyo.monument.id == P.STAINLESS_STEEL_URN || 
            dyo.monument.id == P.CERAMIC_IMAGE || 
            dyo.monument.id == P.TRADITIONAL_ENGRAVED_PLAQUE || 
            dyo.monument.id == P.TRADITIONAL_ENGRAVED_HEADSTONE || 
            dyo.monument.id == P.TRADITIONAL_ENGRAVED_HEADSTONE_3D || 
            dyo.monument.id == 999) {
            data.title += " " + '<i class="material-icons">help_outline</i>';
            $("#dyo_materials_title").style.cursor = "pointer";
        } else {
            $("#dyo_materials_title").style.cursor = "text";
        }

        this.data = data.data;
        this.input.data = data.data;
        this.input.title = data.title;
        this.input.render();

        let menu_data = {
            title: data.title
        }
        this.menu.update(menu_data);

        if (dyo.monument.getProductType() == "images" || 
            dyo.monument.getProductType() == "fullcolourplaque" || 
            dyo.monument.getProductType() == "urns") {
            this.colors_list.render();
            this.colors_list.show();
        } else {
            this.colors_list.hide();
        }
    }

    selectMaterial(id, material) {

        //console.log("@selectMaterial: " + id, material);
        dyo.engine.material_id = id;
        dyo.engine.material_material = material;

        let _id;
        let _material;

        if (id == undefined) {
            _id = dyo.engine.material_id;
            _material = dyo.engine.material_material;
        } else {
            _id = id;
            _material = material;
        }

        dyo.monument.switch_full_monument = false;
        dyo.monument.switch_headstone = false;

        if (window.location.href.indexOf("select-material-image") == -1) {
            // default material
            dyo.engine.materials.data.forEach(material => {

                let id2 = material.class + "_" + this.makeSafeName(material.name);
                if ($('#' + id2)) {
                    $('#' + id2).classList.remove("mdc-list-selected");
                }

            });
        } else {
            // material image
            dyo.engine.materials.data_image.forEach(material_image => {

                let id3 = material_image.class + "_" + this.makeSafeName(material_image.name);
                if ($('#' + id3)) {
                    $('#' + id3).classList.remove("mdc-list-selected");
                }

            });

            dyo.monument.last_materialImage = dyo.monument.materialImage;

            switch (_material.name) {
                case "Ceramic Image":
                    dyo.monument.materialImage = 1;
                    dyo.engine.sizes.setupSlider("materials:197");
                    break;
                case "Vitreous Enamel Image Overlay":
                    dyo.monument.materialImage = 2;
                    dyo.engine.sizes.setupSlider("materials:201");
                    break;    
                case "Premium Plana":
                    dyo.monument.materialImage = 3;
                    dyo.engine.sizes.setupSlider("materials:208");
                    break;        
            }
    
        }

        if (_id) {
            $('#' + _id).classList.add("mdc-list-selected");
        }

    }

    events() {

        let title, description, instructions;

        instructions = "<div class='instructions'>";
        instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
        instructions += "<p>" + Translate(Lang.MATERIALS_IMAGE_INSTRUCTIONS) + "</p>";
        instructions += "</div>";

        $("#dyo_materials_title").style.cursor = "pointer";
        title = Translate(Lang.MATERIALS);
        description = "<p>" + Translate(Lang.MATERIALS_IMAGE_DESCRIPTION) + "</p>";

        if (dyo.engine.deviceType == "desktop") {
                
            $('#dyo_materials_title').addEventListener('mouseover', () => { 
                if (dyo.monument.id == P.BRONZE_PLAQUE || 
                    dyo.monument.id == P.FULL_COLOUR_PLAQUE ||
                    dyo.monument.id == P.STAINLESS_STEEL_URN ||
                    dyo.monument.id == P.CERAMIC_IMAGE ||
                    dyo.monument.id == P.TRADITIONAL_ENGRAVED_PLAQUE ||
                    dyo.monument.id == P.TRADITIONAL_ENGRAVED_HEADSTONE ||
                    dyo.monument.id == P.TRADITIONAL_ENGRAVED_HEADSTONE_3D ||
                    dyo.monument.id == 102 ||
                    dyo.monument.id == 999) {
                    let o = dyo.engine.materials.getTutorialData();
                    $("#tutorial-header", o.title);
                    $("#tutorial-description", o.description);
                    dyo.engine.tutorial.show(1);
                }
            });

            $('#dyo_materials_title').addEventListener('mouseout', () => { 
                dyo.engine.tutorial.hide();
            });

            if ($('#dyo_materials_image_title')) {

                $('#dyo_materials_image_title').addEventListener('mouseover', () => { 
                    $("#tutorial-header", title);
                    $("#tutorial-description", description + instructions);
                    dyo.engine.tutorial.show(1);
                });

                $('#dyo_materials_image_title').addEventListener('mouseout', () => { 
                    dyo.engine.tutorial.hide();
                });

            } 

        } else {

            if ($('#dyo_materials_image_title')) {

                $('#dyo_materials_image_title').addEventListener('click', (e) => { 

                    if (dyo.engine.deviceType == "mobile") {

                        dyo.engine.popupActive = true;

                        let dialog = dyo.engine.dialog_resp;
                        
                        dialog.title = title;
                        dialog.body = description + instructions;
                        dialog.accept = "";
                        dialog.decline = Translate(Lang.CLOSE);
                        dialog.action = this.selectMaterial;
                        dialog.render();
                        dialog.show();

                        if (dyo.template == 2) {
                            let c = 'skinAU_c199999';
                            $("#resp-header").classList.add(c);
                            $("#resp-footer").classList.add(c);
                        }

                    }
        
                });

            }

        }

        $('#dyo_materials_title').addEventListener('click', (e) => { 

            if (dyo.monument.id == P.BRONZE_PLAQUE || 
                dyo.monument.id == P.FULL_COLOUR_PLAQUE ||
                dyo.monument.id == P.TRADITIONAL_ENGRAVED_PLAQUE ||
                dyo.monument.id == P.STAINLESS_STEEL_URN ||
                dyo.monument.id == P.CERAMIC_IMAGE ||
                dyo.monument.id == 999) {
                if (dyo.engine.deviceType != "desktop") {
                    let o = dyo.engine.materials.getTutorialData();
                    let dialog = dyo.engine.dialog_resp;

                    dyo.engine.popupActive = true;
                    
                    dialog.title = o.title;
                    dialog.body = o.description;
                    dialog.accept = "";
                    dialog.decline = Translate(Lang.CLOSE);
                    dialog.action = this.selectFixing;
                    dialog.render();
                    dialog.show();

                    if (dyo.template == 2) {
                        let c = 'skinAU_9899c2';
                        $("#resp-header").classList.add(c);
                        $("#resp-footer").classList.add(c);
                    }

                }
            }

        });

        let nr = 0;
        let nr_image = 0;

        if (this.data_image.length > 0) {

            this.data_image.forEach(material => {

                nr_image ++;

                let id = material.class + "_" + this.makeSafeName(material.name);

                if ($('#' + id)) {

                    if (nr_image == 1) {
                        $('#' + id).classList.add("mdc-list-selected");
                    }

                    let img;
                    let p = dyo.path.forever + dyo.path.design5 + "data/jpg/photos/m/";

                    switch (material.name) {
                        case Translate(Lang.CERAMIC_IMAGE):
                            img = p + "product-ceramic-image.jpg";
                            break;
                        case Translate(Lang.VITREOUS_ENAMEL_IMAGE_OVERLAY):
                            img = p + "product-vitreous-enamel-image.jpg";
                            break;    
                        case Translate(Lang.PREMIUM_PLANA):
                            img = p + "plana.jpg";
                            break;    
                        }

                    if (dyo.engine.deviceType == "desktop") {

                        $('#' + id).addEventListener('mouseover', () => { 
                            $("#tutorial-header", material.name);
                            $("#tutorial-description", "<p style='text-align:center'><img src='" + img + "' style='max-width:100%;' /></p>");
                            dyo.engine.tutorial.show(1);
                        });

                        $('#' + id).addEventListener('mouseout', () => { 
                            dyo.engine.tutorial.hide();
                        });

                            $('#' + id).addEventListener('click', () => { 
                                this.selectMaterial(id, material);
                            });

                    } else {

                        $('#' + id).addEventListener('click', () => { 

                            dyo.engine.popupActive = true;

                            dyo.engine.material_id = id;
                            dyo.engine.material_material = material;

                            dyo.engine.dialog_resp.title = material.name;
                            dyo.engine.dialog_resp.body = "<p style='text-align:center'><img src='" + img + "' style='max-width:100%;' /></p>";
                            dyo.engine.dialog_resp.accept = Translate(Lang.SELECT);
                            dyo.engine.dialog_resp.decline = Translate(Lang.CLOSE);
                            dyo.engine.dialog_resp.action = this.selectMaterial;
                            dyo.engine.dialog_resp.render();
                            dyo.engine.dialog_resp.show();

                            if (dyo.template == 2) {
                                let c = 'skinAU_aea097';
                                $("#resp-header").classList.add(c);
                                $("#resp-footer").classList.add(c);
                            }

                        });

                    }

                }

            });

        }

        this.data.forEach(material => {

            let materials = this;

            let id = material.class + "_" + this.makeSafeName(material.name);

            nr ++;

            switch (dyo.monument.id) {
                default:
                    if (nr == 2) {
                        $('#' + id).classList.add("mdc-list-selected");
                    }
                    break;
                case 5:
                    if (nr == 4) {
                        $('#' + id).classList.add("mdc-list-selected");
                    }        
                    break;
                case 31: case 34: case 52: case 124: case 101: case 102:
                    if (nr == 1) {
                        $('#' + id).classList.add("mdc-list-selected");
                    }
                    break;
            }

            if (dyo.monument.id == 31 || dyo.monument.id == 52) {
                
                let img;

                switch (material.name) {
                    case Translate(Lang.BRUSHED_FINISH):
                        img = "data/jpg/products2/yag-lasered-brushed-plaque.jpg";
                        break;
                    case Translate(Lang.HIGHLY_POLISHED_FINISH):
                        img = "data/jpg/products2/yag-lasered-high-polished-plaque.jpg";
                        break;    
                }

                if (dyo.engine.deviceType == "desktop") {
                
                    $('#' + id).addEventListener('mouseover', () => { 
                        $("#tutorial-header", material.name);
                        $("#tutorial-description", "<p style='text-align:center'><img src='" + img + "' style='max-width:100%;' /></p>");
                        dyo.engine.tutorial.show(1);
                    });

                    $('#' + id).addEventListener('mouseout', () => { 
                        dyo.engine.tutorial.hide();
                    });

                } else {

                    $('#' + id).addEventListener('click', () => { 

                        dyo.engine.popupActive = true;

                        dyo.engine.dialog_resp.title = material.name;
                        dyo.engine.dialog_resp.body = "<p style='text-align:center'><img src='" + img + "' style='max-width:100%;' /></p>";
                        dyo.engine.dialog_resp.accept = Translate(Lang.SELECT);
                        dyo.engine.dialog_resp.decline = Translate(Lang.CLOSE);
                        dyo.engine.dialog_resp.action = this.selectMaterial;
                        dyo.engine.dialog_resp.render();
                        dyo.engine.dialog_resp.show();

                        if (dyo.template == 2) {
                            let c = 'skinAU_aea097';
                            $("#resp-header").classList.add(c);
                            $("#resp-footer").classList.add(c);
                        }

                    });

                }

            }

            $('#' + id).addEventListener('click', () => { 

                if (dyo.monument.id == 7 || dyo.monument.id == 32 || dyo.monument.id == 2350) {
                    switch (id) {
                        case "texture_no_background": case "texture_upload_image":
                            break;
                        default:
                            dyo.engine.loader.force = true;
                            break;
                    }
                }
                
                dyo.engine.loader.show("Mat:485");

                dyo.engine.showNewDesign();
                
                let part;

                if (dyo.selected) {
                    dyo.monument.deselectAll();
                }
                
                if (dyo.target == null) {
                    //dyo.target = dyo.monument.getPartByType('Headstone');
                } else {
                    part = dyo.target;
                    part._select();
                }
                
                this.selectMaterial(id, material);

                if (material.name == "No Background") {

                    if (part) {
                        part.texture = File('table').color;
                    }
                    dyo.monument.headstone.background = "";
                    
                } else if (material.name == "Upload Image") {

                    let items = dyo.config._additions.Images;

                    dyo.engine.photos.reset();    
                    dyo.engine.photos.useAsBackgroundImage = true;
                    dyo.engine.photos.uploadPhotoId = items[0].id;

                    dyo.engine.tutorial.upload();

                } else {

                    if (dyo.monument.getProductType() == "images" || 
                        dyo.monument.getProductType() == "fullcolourplaque" || 
                        dyo.monument.getProductType() == "urns") {

                        dyo.engine.loader.show("materials:210");

                        let items = dyo.config._additions.Images;
                        dyo.engine.photos.uploadPhotoId = items[0].id;

                        let img = new Image();
                        img.src = material.img.replace('/s/', '/l/');
                        img.onload = () => {
    
                            let data = {
                                bmp: img,
                                filename: material.img.replace('/s/', '/l/'),
                                src: material.img.replace('/s/', '/l/')
                            }

                            dyo.engine.photos.fileName = material.name;
                            dyo.engine.photos.tmpFileName = material.name;
                            dyo.engine.photos.useAsBackgroundImage = true;
                            dyo.engine.photos.cropSection(data);

                        }

                    } else {

                        if (dyo.target != null) {
                            part.texture = material.img.replace('/s/', '/l/');
                        } else {
                            dyo.monument.getData().forEach(_part => {
                                _part.texture = material.img.replace('/s/', '/l/');
                            });
                        }

                    }

                }

                if (dyo.mode == "2d") {

                    if (dyo.monument.id == 2350) {
                        dyo.monument.headstone.background = undefined;
                    }

                    if (dyo.target != null) {
                        part._bmp = undefined;
                        part.applyTexture();
                    } else {
                        dyo.monument.getData().forEach(_part => {
                            _part._select();
                            _part._bmp = undefined;
                            _part.applyTexture();    
                        });
                        dyo.monument.headstone._select();
                    }

                    if (dyo.monument.has_base == false) {
                        switch (dyo.config.getProductType()) {
                            case "headstones":
                                dyo.monument.base.texture = material.img.replace('/s/', '/l/');
                                dyo.monument.base.applyTexture();
                                break;
                        }
                    }

                }

                dyo.monument.updateHeader();

            });

        });

        if (dyo.engine.mobileDevice) {

            if (dyo.monument.id == 31 || dyo.monument.id == 52) {
                $('#dyo_materials_title').addEventListener('click', (e) => { 
                    dyo.engine.popupActive = true;

                    let o = dyo.engine.materials.getTutorialData();

                    dyo.engine.dialog.title = o.title;
                    dyo.engine.dialog.body = o.description;
                    dyo.engine.dialog.accept = "";
                    dyo.engine.dialog.decline = Translate(Lang.CLOSE);
                    dyo.engine.dialog.render();
                    dyo.engine.dialog.show();

                    if (dyo.template == 2) {
                        let c = 'skinAU_f0e09d';
                        $("#dialog-header").classList.add(c);
                        $("#dialog-footer").classList.add(c);
                    }
            
                });
            }

        } else {
                
            if (dyo.monument.id == 31 || dyo.monument.id == 52) {
                $('#dyo_materials_title').addEventListener('mouseover', (e) => { 

                    let o = dyo.engine.materials.getTutorialData();
                    
                    $("#tutorial-header", o.title);
                    $("#tutorial-description", o.description);

                    dyo.engine.tutorial.show(1);

                });
            
                $('#dyo_shapes_title').addEventListener('mouseout', (e) => { 
                    dyo.engine.tutorial.hide();
                });
            }

        }

    }

	getTutorialData() {

		let title, description, instructions;

        switch (dyo.monument.id) {
            default:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_BACKGROUNDS) + "</p>";
                instructions += "</div>";
                break;
            case P.TRADITIONAL_ENGRAVED_PLAQUE: case P.TRADITIONAL_ENGRAVED_HEADSTONE: case P.TRADITIONAL_ENGRAVED_HEADSTONE_3D:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_BACKGROUNDS_TRADITIONAL) + "</p>";
                instructions += "</div>";
                break;
            case P.YAG_LASERED_SS_PLAQUE:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_BACKGROUNDS_SS) + "</p>";
                instructions += "</div>";
                break;
            case P.STAINLESS_STEEL_URN: case P.FULL_COLOUR_PLAQUE: case P.CERAMIC_IMAGE:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_BACKGROUNDS_ENAMEL) + "</p>";
                instructions += "</div>";
                break;
        }

		switch (dyo.monument.id) {
            case 5:
                $("#dyo_materials_title").style.cursor = "pointer";
                title = Translate(Lang.BRONZES);
                description = "<p>" + Translate(Lang.BRONZE_BACKGROUND) + "</p>";
                break;
            case 31: case 52:
                $("#dyo_materials_title").style.cursor = "pointer";
                title = Translate(Lang.MATERIALS);
                description = "<p>" + Translate(Lang.STAINLESS_STEEL_DESCRIPTION) + "</p>";
                break;
            case P.STAINLESS_STEEL_URN: case P.FULL_COLOUR_PLAQUE: case P.CERAMIC_IMAGE:
                $("#dyo_materials_title").style.cursor = "pointer";
                title = Translate(Lang.MATERIALS);
                description = "<p>" + Translate(Lang.BACKGROUND_VITREOUS_DESCRIPTION) + "</p>";
                break;
            case P.TRADITIONAL_ENGRAVED_HEADSTONE: case P.TRADITIONAL_ENGRAVED_PLAQUE:  case P.TRADITIONAL_ENGRAVED_HEADSTONE_3D:
                $("#dyo_materials_title").style.cursor = "pointer";
                title = Translate(Lang.MATERIALS);
                description = "<p>" + Translate(Lang.BACKGROUND_TRADITIONAL_DESCRIPTION) + "</p>";
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

	
}