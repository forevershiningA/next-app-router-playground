import { Button, Drawer, Dialog, Select, Slider, List, Title, TextField } from '../material/MaterialDesign.js';
import { P, Lang, Translate, File, Metric, _, $ } from '../Const.js';
import { Component } from '../material/Component.js';

export class Sizes extends Component {

	constructor(data = {}) {
		super(data);

        this.container = $("div", "add", "container-sizes", this.stage);
        
        this.menu = new Drawer({stage: this.container,drawer_type: 0,toolbar_type: 1,id: "dyo_sizes",title: this.title});
        this.menu.render();

        this.container_sizes = $("div", "add", "container-sizes-internal", $("#dyo_sizes-mdc-list"));
        this.container_buttons = $("div", "add", "container-buttons", $("#dyo_sizes-mdc-list"));
        
        this.hide();
    }

    getType() {
        let out = "";

        if (dyo.mode == "2d") { 

            switch (this.targetType) {
                case "Base":
                    out = Lang.BASE;
                    break;
                case "Headstone":
                    out = Lang.HEADSTONE;
                    break;
                case "Plaque":
                    out = Lang.PLAQUE;
                    break;
                case "Urn":
                    out = Lang.URN;
                    break;
            }

            switch (dyo.monument.id) {
                case 5: case 31: case 32: case 52: case 999:
                    out = Lang.PLAQUE;
                    break;
                case 7:
                    out = Lang.IMAGE;
                    break;
                case 135:
                    out = Lang.PET_ROCK;
                    break;
            }

            return out;

        }

        if (dyo.mode == "3d") {

            let m = dyo.engine3d.selectedModel;

            if (m) {
                switch (m.getGeneralType()) {
                    case "Headstone": case "table":
                        out = Lang.HEADSTONE;
                        break;
                    case "stand":
                        out = Lang.STAND;
                        break;    
                    case "lid":
                        out = Lang.LEDGER;
                        break;
                    case "kerb":
                        out = Lang.KERBSET;
                        break;    
                }
            }
            
            if (dyo.monument.id == 5 || dyo.monument.id == 999) {
                out = Lang.PLAQUE;
            }
            if (dyo.monument.id == 7) {
                out = Lang.IMAGE;
            }

            return out;

        }
    
    }

    update() {
        $("#dyo_sizes_title", Translate(Lang.SIZES) + ": " + Translate(this.getType()) + ' <i class="material-icons">help_outline</i>');
        $("#dyo_button_width_decrease_icon_small", Translate(Lang.DECREASE));
        $("#dyo_button_width_increase_icon_small", Translate(Lang.INCREASE));
        $("#dyo_button_height_decrease_icon_small", Translate(Lang.DECREASE));
        $("#dyo_button_height_increase_icon_small", Translate(Lang.INCREASE));
        $("#dyo_button_length_decrease_icon_small", Translate(Lang.DECREASE));
        $("#dyo_button_length_increase_icon_small", Translate(Lang.INCREASE));
        $("#back_to_menu_" + this.title, Translate(Lang.BACK_TO_DESIGN_MENU));

        let sliders = ["slider_width", "slider_height", "slider_length"];
        
        let inputs = [
            { name: "text_width_input", min: "min_width", max: "max_width" },
            { name: "text_height_input", min: "min_height", max: "max_height" },
            { name: "text_length_input", min: "min_length", max: "max_length" }]
            
        let min, max;

        sliders.forEach(slider => {
            this[slider].slider.step = Metric().step;
        });

        inputs.forEach(input => {
            min = Number(File('table')[input.min]);
            max = Number(File('table')[input.max]);

            if (dyo.metric == "inches") {
                min = dyo.engine.metrics.toInchPlain(min);
                max = dyo.engine.metrics.toInchPlain(max);
            }

            this[input.name].min = min;
            this[input.name].max = max;
            this[input.name].step = Metric().step;
        });

    }

    render() {

        this.container_slider_width = $("div", "add", "slider-width-container", this.container_sizes);
        this.container_slider_height = $("div", "add", "slider-height-container", this.container_sizes);
        this.container_slider_length = $("div", "add", "slider-length-container", this.container_sizes);
        this.container_slider_size = $("div", "add", "slider-size-container", this.container_sizes);

        this.slider_width = new Slider({
            stage: this.container_slider_width,
            id: "dyo_slider_width",
            step: Metric().step,
            title: Lang.WIDTH
        });
        this.slider_width.render();

        let min = Number(File('table').min_width);
        let max = Number(File('table').max_width);
        let value = Number(File('table').init_width);

        if (dyo.metric == "inches") {
            min = dyo.engine.metrics.toInchPlain(min);
            max = dyo.engine.metrics.toInchPlain(max);
            value = dyo.engine.metrics.toInchPlain(value);
        }

        this.text_width_input = new TextField({
            stage: this.container_slider_width,
            id: "dyo_width_textfield",
            type: 7,
            value: value,
            step: Metric().step,
            min: min,
            max: max,
            dataType: "number",
            title: "Enter Width (" + this.metrics + ")"
        });
        this.text_width_input.render();
        
		this.buttonWidthDecrease = new Button({
            stage: this.container_slider_width,
            id: "dyo_button_width_decrease",
			type: 6,
			icon: 'remove',
			title: Lang.DECREASE
        });       
		this.buttonWidthDecrease.render();
		
		this.buttonWidthIncrease = new Button({
            stage: this.container_slider_width,
            id: "dyo_button_width_increase",
            type: 6,
            parentcss: "float: right",
            icon: 'add',
            css: "margin-right: 0px !important",
			title: Lang.INCREASE
        });       
		this.buttonWidthIncrease.render();
		
        this.slider_height = new Slider({
            stage: this.container_slider_height,
            id: "dyo_slider_height",
            step: Metric().step,
            title: Lang.HEIGHT
        });
        this.slider_height.render();

        min = Number(File('table').min_height);
        max = Number(File('table').max_height);
        value = Number(File('table').init_height);

        if (dyo.metric == "inches") {
            min = dyo.engine.metrics.toInchPlain(min);
            max = dyo.engine.metrics.toInchPlain(max);
            value = dyo.engine.metrics.toInchPlain(value);
        }

        this.text_height_input = new TextField({
            stage: this.container_slider_height,
            id: "dyo_height_textfield",
            type: 7,
            value: value,
            step: Metric().step,
            min: min,
            max: max,
            dataType: "number",
            title: Translate(Lang.ENTER) + " " + Translate(Lang.HEIGHT) + "(" + this.metrics + ")"
        });
        this.text_height_input.render();
        
		this.buttonHeightDecrease = new Button({
            stage: this.container_slider_height,
            id: "dyo_button_height_decrease",
			type: 6,
			icon: 'remove',
			title: Lang.DECREASE
        });       
		this.buttonHeightDecrease.render();
		
		this.buttonHeightIncrease = new Button({
            stage: this.container_slider_height,
            id: "dyo_button_height_increase",
			type: 6,
            icon: 'add',
            parentcss: "float: right",
            css: "margin-right: 0px !important",
			title: Lang.INCREASE
        });       
        this.buttonHeightIncrease.render();

        this.slider_length = new Slider({
            stage: this.container_slider_length,
            id: "dyo_slider_length",
            step: Metric().step,
            title: Lang.THICKNESS
        });
        this.slider_length.render();

        min = Number(File('table').min_depth);
        max = Number(File('table').max_depth);
        value = Number(File('table').init_depth);

        if (dyo.usa == true) {
            max = max * 3;
        }

        //console.log("@thickness")
        //console.log(min,max,value);

        if (dyo.metric == "inches") {
            min = dyo.engine.metrics.toInchPlain(min);
            max = dyo.engine.metrics.toInchPlain(max);
            value = dyo.engine.metrics.toInchPlain(value);
        }

        this.text_length_input = new TextField({
            stage: this.container_slider_length,
            id: "dyo_length_textfield",
            type: 7,
            value: value,
            step: Metric().step,
            min: min,
            max: max,
            dataType: "number",
            title: Translate(Lang.ENTER) + " " + Translate(Lang.LENGTH) + "(" + this.metrics + ")"
        });
        this.text_length_input.render();

        this.buttonLengthDecrease = new Button({
            stage: this.container_slider_length,
            id: "dyo_button_length_decrease",
            type: 6,
            icon: 'remove',
            title: Lang.DECREASE
        });       
        this.buttonLengthDecrease.render();
        
        this.buttonLengthIncrease = new Button({
            stage: this.container_slider_length,
            id: "dyo_button_length_increase",
            type: 6,
            icon: 'add',
            parentcss: "float: right",
            title: Lang.INCREASE
        });       
        this.buttonLengthIncrease.render();

        this.stitle = new Title({
            stage: this.container_slider_size,
            id: "dyo_sizes_incremental_only",
			css: "margin: 10px 0px 10px 0px; padding: 5px 10px; background-color: red; color: white; font-size: 1em;",
			type: 1,
			title: Translate(Lang.INCREMENTAL_SIZES_ONLY)
        });
        if (dyo.monument.id != 5 && dyo.monument.id != 7) {
		    this.stitle.render();
        }

        this.slider_size = new Slider({
            stage: this.container_slider_size,
            id: "dyo_slider_size",
            step: 1,
            title: Lang.SIZES
        });
        this.slider_size.render();

        this.buttonSizeDecrease = new Button({
            stage: this.container_slider_size,
            id: "dyo_button_size_decrease",
            type: 6,
            icon: 'remove',
            title: Lang.DECREASE
        });       
        this.buttonSizeDecrease.render();
        
        this.buttonSizeIncrease = new Button({
            stage: this.container_slider_size,
            id: "dyo_button_size_increase",
            type: 6,
            icon: 'add',
            parentcss: "float: right",
            title: Lang.INCREASE
        });       
        this.buttonSizeIncrease.render();
        
        this.events();

    }

    setup() {

        let data = {
            description: dyo.config._config.hint
        } 

        if (dyo.config._config.hint) {
            data.description = dyo.config._config.hint;
        } else {
            data.description = "";
        }

        this.menu.update(data);

        if (dyo.monument.getProductType() == "images") {

            this.showContainer(this.container_slider_size);
            this.hideContainer(this.container_slider_width);
            this.hideContainer(this.container_slider_height);

        } else {
            this.hideContainer(this.container_slider_size);
            this.showContainer(this.container_slider_width);
            this.showContainer(this.container_slider_height);

            this.hideContainer(this.container_slider_length);
            
            if (dyo.mode == "3d") {
                if (dyo.config._config.type == "full-monument") {
                    this.showContainer(this.container_slider_length);
                }
                if (dyo.config._config.type == "headstone") {
                    this.showContainer(this.container_slider_length);
                }
            } else {
                this.hideContainer(this.container_slider_length);
            }

        }

    }

    setupPhotoSizes(photo_id) {

        if (dyo.currentSection != "Account") {

            let self = this;
            let slider = this.slider_size;
            let sizes = this.photos_sizes(photo_id, "sizes:386");

            if (sizes.length > 1) {

                this.hideContainer(this.container_slider_width);
                this.hideContainer(this.container_slider_height);
                this.hideContainer(this.container_slider_length);
                this.showContainer(this.container_slider_size);

                slider.slider.min = 0;
                slider.slider.max = sizes.length - 1;
                slider.slider.value = 0;

                let nr = 0;
                let id = 0;

                this.photos_sizes(photo_id, "sizes:402").forEach(size => {

                    if (this.slider_width.slider.value == size.init_width && this.slider_height.slider.value == size.init_height) {
                        id = nr;
                        if (dyo.monument.id == 7) {
                            dyo.controller_Size.setValue(id);
                        }        
                    }
                    nr ++;
                    
                });

            } 

        }

    }

    showWidthAndHeight() {

        this.showContainer(this.container_slider_width);
        this.showContainer(this.container_slider_height);
        this.hideContainer(this.container_slider_length);
        this.hideContainer(this.container_slider_size);

        if (dyo.mode == "3d") {
            this.showContainer(this.container_slider_length);
        } 
    }

    showSizes() {

        this.setupSlider("sizes:452");

        this.showContainer(this.container_slider_size);
        this.hideContainer(this.container_slider_width);
        this.hideContainer(this.container_slider_height);
        this.hideContainer(this.container_slider_length);

    }

    emblemSizes() {
        return dyo.engine.emblems.emblemSizes();
    }

    plaqueSizes() {
        return this.plaque_sizes(201);
    }

    setupSlider(from) {

        if (from) {
            //console.log("@setupSlider: " + from);
        }

        if (dyo.monument.id == 5) {
            let sizes = this.emblemSizes();

            if (sizes.length > 1) {
                if (dyo.data.sizeNr != 1) {
                    //console.log("@a");
                    //console.log(dyo.data.sizeNr);
                    this.slider_size.slider.min = 1;
                    this.slider_size.setMax(sizes.length - 1);
                    this.slider_size.slider.value = dyo.data.sizeNr;//this.slider_size.slider.value;
                    //dyo.controller_Size.setValue(this.slider_size.slider.value);
                    dyo.controller_Size.setValue(dyo.data.sizeNr);
                }
            } else {
                this.slider_size.setMax(Number(sizes[0].max_height));
                this.slider_size.slider.min = Number(sizes[0].min_height);
                this.slider_size.slider.value = 1;
                dyo.controller_Size.setValue(1);
            }

            if (dyo.monument.headstone.name.indexOf("Oval") > -1 || 
                dyo.monument.headstone.name.indexOf("Circle") > -1) {
                    //console.log(dyo.monument.headstone.name);
                    //if (dyo.data.sizeNr == 1) {
                        //console.log("--------------------");
                        //console.log("@b");
                        this.slider_size.slider.min = 1;
                        this.slider_size.setMax(sizes.length - 1);
                        this.slider_size.slider.value = sizes.length - 1;
                        dyo.controller_Size.setValue(sizes.length - 1);
                        //console.log(sizes.length - 1);
                    //}
            }
            
        }

        if (dyo.monument.id == 7) {

            let photo_id = 200;
            let init_value = 5;

            if (dyo.monument.materialImage == undefined) {
                dyo.monument.materialImage = 1;
            }
            
            if (dyo.monument.materialImage == 1) {
                photo_id = 200;
            }

            if (dyo.monument.materialImage == 2) {
                photo_id = 201;
            }

            if (dyo.monument.materialImage == 3) {
                photo_id = 202;
            }

            if (this.slider_size.slider.value == 50) {
                if (dyo.monument.materialImage == 1) {
                    init_value = 5;
                }

                if (dyo.monument.materialImage == 2) {
                    init_value = 3;
                }
            } else {
                let nr = 0;
                let allow = false;

                this.photos_sizes(photo_id, "sizes:526").forEach(item => {
                    if (dyo.monument.headstone.width == item.min_width && dyo.monument.headstone.height == item.min_height) {
                        init_value = nr;
                        allow = true;
                    }
                    nr ++;
                });

                if (!allow) {
                    nr = 0;
                    init_value = 0;
                    this.photos_sizes(photo_id, "sizes:537").forEach(item => {
                        if (dyo.monument.headstone.width > item.min_width && dyo.monument.headstone.height > item.min_height) {
                            init_value = nr;
                            allow = true;
                        }
                        nr ++;
                    });
                }

            }

            this.slider_size.slider.min = 0;
            this.slider_size.setMax(this.photos_sizes(photo_id, "sizes:549").length - 1);
            this.slider_size.slider.value = init_value;

            if (dyo.monument.materialImage == 2) {
                if (dyo.monument.headstone.name.indexOf("Rectangle") > -1) {
                    if (init_value == this.photos_sizes(photo_id, "sizes:554").length - 1) {
                        init_value -= 2;
                        this.slider_size.slider.value = init_value;
                        this.slider_size.setMax(init_value);
                    } 
                    this.slider_size.setMax(this.photos_sizes(photo_id, "sizes:559").length - 2);
                } else {
                    this.slider_size.setMax(this.photos_sizes(photo_id, "sizes:561").length - 1);
                }
            }

            let photo_size = dyo.engine.photos_sizes(photo_id, "sizes:565")[this.slider_size.slider.value];

            if (photo_size) {

                let size = photo_size.name.split(' x ');
                let width = size[0];
                let height = size[1].replace(' mm', '');

                if (dyo.metric == "inches") {
                    $('#dyo_slider_size_value', Translate(Lang.SIZE) + ": " + dyo.engine.metrics.toInch(width) + " x " + dyo.engine.metrics.toInch(height));
                } else {
                    $('#dyo_slider_size_value', Translate(Lang.SIZE) + ": " + Math.round(width) + " x " + Math.round(height) + " MM");
                }

                dyo.controller_Width.setValue(width);
                dyo.controller_Height.setValue(height);

                if (dyo.monument.headstone) {
                    dyo.monument.headstone.width = width;
                    dyo.monument.headstone.height = height;

                    dyo.monument.updateHeader("Engine: 472");
                    dyo.monument.updateMonument("engine:499");
                }

            } 

        }

        if (dyo.monument.id == 32) {
            let sizes = this.plaque_sizes(201);

            if (sizes.length > 1) {
                this.slider_size.slider.min = 0;
                this.slider_size.setMax(sizes.length - 1);
                this.slider_size.slider.value = 5;
            } else {
                this.slider_size.setMax(Number(sizes[0].max_height));
                this.slider_size.slider.min = Number(sizes[0].min_height);
                this.slider_size.slider.value = sizes.length;
            }

            if (dyo.slider_size != undefined) {
                this.slider_size.slider.value = dyo.slider_size;
                dyo.controller_Size.setValue(dyo.slider_size);
                dyo.monument.updateHeader();
            } else {
                dyo.controller_Size.setValue(this.slider_size.slider.value);
            }
        }

    }

    events() {

        let self = this;

        $('#dyo_button_width_decrease').addEventListener('click', () => { 
            self.slider_width.decrease();
            $("#dyo_button_width_decrease").blur();
        });
        $('#dyo_button_width_increase').addEventListener('click', () => { 
            self.slider_width.increase();
            $("#dyo_button_width_increase").blur();
        });
        $('#dyo_button_height_decrease').addEventListener('click', () => { 
            self.slider_height.decrease();
            $("#dyo_button_height_decrease").blur();
        });
        $('#dyo_button_height_increase').addEventListener('click', () => { 
            self.slider_height.increase();
            $("#dyo_button_height_increase").blur();
        });
        $('#dyo_button_length_decrease').addEventListener('click', () => { 
            self.slider_length.decrease();
            $("#dyo_button_length_decrease").blur();
        });
        $('#dyo_button_length_increase').addEventListener('click', () => { 
            self.slider_length.increase();
            $("#dyo_button_length_increase").blur();
        });
        $('#dyo_button_size_decrease').addEventListener('click', () => { 
            self.slider_size.decrease();
            $("#dyo_button_size_decrease").blur();
        });
        $('#dyo_button_size_increase').addEventListener('click', () => { 
            self.slider_size.increase();
            $("#dyo_button_size_increase").blur();
        });


        if (dyo.engine.mobileDevice) {

            $('#dyo_sizes_title').addEventListener('click', (e) => { 
                dyo.engine.popupActive = true;

                let o = dyo.engine.sizes.getTutorialData();
                let dialog = dyo.engine.dialog_resp;

                dialog.title = o.title;
                dialog.body = o.description;
                dialog.accept = "";
                dialog.decline = Translate(Lang.CLOSE);
                dialog.render();
                dialog.show();

                if (dyo.template == 2) {
                    let c = 'skinAU_f0e09d';
                    $("#resp-header").classList.add(c);
                    $("#resp-footer").classList.add(c);
                }
        
            });

        } else {
                
            $('#dyo_sizes_title').addEventListener('mouseover', (e) => { 

                let o = dyo.engine.sizes.getTutorialData();
                
                $("#tutorial-header", o.title);
                $("#tutorial-description", o.description);

                dyo.engine.tutorial.show(1);

            });

            $('#dyo_sizes_title').addEventListener('mouseout', (e) => { 
                dyo.engine.tutorial.hide();
            });

        }

    }

	getTutorialData() {

		let title, description, instructions;

        switch (dyo.monument.id) {
            case 4: case 5: case 30: case 34: case 52: case 102: case 124: case 135:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_SIZES) + "</p>";
                instructions += "</div>";
                break;
            case 9:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += Translate(Lang.INSTRUCTIONS_SIZES_PET);
                instructions += "</div>";
                break;
            case 7:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.MATERIALS_IMAGE_SIZES_INSTRUCTIONS) + "</p>";
                instructions += "</div>";
                break;
        }

		switch (dyo.monument.id) {
			default:
				title = this.measurment_info[0].title;
				description = "<p>" + this.measurment_info[0].description + "</p>";
				break;
            case 5:
                if (dyo.usa) {
				    title = Translate(Lang.PLAQUE) + " " + Translate(Lang.SIZES);
                    description = "<p>" + Translate(Lang.BRONZE_PLAQUE_SIZES) + "</p>";
                } else {
				    title = Translate(Lang.PLAQUE) + " " + Translate(Lang.SIZES);
                    description = "<p>" + Translate(Lang.BRONZE_PLAQUE_SIZES) + "</p>";
                }
                break;
            case 7:
				title = Translate(Lang.CERAMIC_PHOTO) + " " + Translate(Lang.SIZES);
				description = "<p>" + Translate(Lang.MATERIALS_IMAGE_SIZES) + "</p>";
                break;
			case 4: case 22: case 100:
				title = Translate(Lang.HEADSTONE) + " " + Translate(Lang.SIZES);
				description = "<p>" + Translate(Lang.HEADSTONE_SIZES) + "</p>";
				break;	
            case 30: case 135:
                title = Translate(Lang.PLAQUE) + " " + Translate(Lang.SIZES);
                description = "<p>" + Translate(Lang.PLAQUES_SIZES) + "</p>";
                break;	    
            case 34:
                title = Translate(Lang.PLAQUE) + " " + Translate(Lang.SIZES);
                description = "<p>" + Translate(Lang.TRADITIONAL_PLAQUES_SIZES) + "</p>";
                break;	    
            case 32:
                title = Translate(Lang.PLAQUE) + " " + Translate(Lang.SIZES);
                description = "<p>" + Translate(Lang.FULL_COLOUR_PLAQUE_SIZE) + "</p>";
                break;	
            case 52:
                title = Translate(Lang.PLAQUE) + " " + Translate(Lang.SIZES);
                description = "<p>" + Translate(Lang.YAG_LASERED_STAINLESS_STEEL_PLAQUE_SIZES) + "</p>";
                break;
            case 101: case 102: case 124:
                title = Translate(Lang.HEADSTONE) + " " + Translate(Lang.SIZES);
                description = "<p>" + Translate(Lang.HEADSTONE_SIZES_TRADITIONAL) + "</p>";
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

    hide() {
        this.hideContainer(this.container);
    }

    show() {

        if (dyo.currentSection != "Account") {
            
            if (location.href.indexOf("#select-size") > -1) {
                dyo.currentSection = "Sizes";
            }

            try {
                if (dyo.mode == "3d") {
                    clearInterval(dyo.showNr);
                    dyo.showNr = setInterval(() => {
        
                        if (Engine3D.Controller) {
                            if (Engine3D.Controller.getCurrentProject()) {
                                if (dyo.engine3d_ready) {
                                    if (Engine3D.Controller.getCurrentProject().getSelectedModel() == null) {
                                        Engine3D.Controller.getCurrentProject().setSelectedModel(dyo.engine3d.headstone3d);
                                        dyo.engine3d.selectedModel = dyo.engine3d.headstone3d;
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

            this.showContainer(this.container);

            if (dyo.monument.headstone) {

                if (dyo.mode == "3d") {

                    try {
                        let part = 'table';
                        let o;

                        if (dyo.engine3d.currentModel) {
                            if (dyo.engine3d.currentModel.generalType.toLowerCase()) {
                
                                if (Engine3D.Controller.getCurrentProject().getSelectedModel()) {
                                    dyo.engine3d.currentModel.generalType = Engine3D.Controller.getCurrentProject().getSelectedModel().getGeneralType();
                                }

                                switch (dyo.engine3d.currentModel.generalType.toLowerCase()) {
                                    case "headstone": case "table":
                                        Engine3D.Controller.getCurrentProject().setSelectedModel(dyo.engine3d.headstone3d);
                                        break;
                                    case "stand":
                                        Engine3D.Controller.getCurrentProject().setSelectedModel(dyo.engine3d.stand3d);
                                        break;
                                    case "ledger": case "lid":
                                        Engine3D.Controller.getCurrentProject().setSelectedModel(dyo.engine3d.ledger3d);
                                        break;
                                    case "kerbset": case "kerb":
                                        Engine3D.Controller.getCurrentProject().setSelectedModel(dyo.engine3d.kerb3d);
                                        break;
                                }

                                switch (dyo.engine3d.currentModel.generalType.toLowerCase()) {
                                    case "headstone": case "table":
                                        part = "table";
                                        o = dyo.engine3d.headstone3d;
                                        break;
                                    case "stand":
                                        if (dyo.config._config.code == "Plaque") {
                                            part = "table";
                                            o = dyo.engine3d.headstone3d;
                                        } else {
                                            part = "stand";
                                            o = dyo.engine3d.stand3d;    
                                        }
                                        break;
                                    case "ledger": case "lid":
                                        part = "lid";
                                        o = dyo.engine3d.ledger3d;
                                        break;
                                    case "kerbset": case "kerb":
                                        part = "kerb";
                                        o = dyo.engine3d.kerb3d;
                                        break;
                                }

                                dyo.engine.sizes.slider_width.slider.min = 1;
                                dyo.engine.sizes.slider_width.slider.max = 2;

                                dyo.engine.sizes.slider_width.slider.max = Number(File(part).max_width);
                                dyo.engine.sizes.slider_width.slider.min = Number(File(part).min_width);

                                if (Number(File(part).min_height) > dyo.engine.sizes.slider_height.slider.max) {
                                    dyo.engine.sizes.slider_height.slider.min = 1;
                                    dyo.engine.sizes.slider_height.slider.max = 1;
                                    dyo.engine.sizes.slider_length.slider.min = 1;
                                    dyo.engine.sizes.slider_length.slider.max = 1;

                                    dyo.engine.sizes.slider_height.slider.max = Number(File(part).max_height);

                                    if (dyo.monument.headstone.ratio > 0) {
                                        dyo.engine.sizes.slider_height.slider.min = Number(File(part).max_height) * dyo.monument.headstone.ratio;
                                    } else {
                                        dyo.engine.sizes.slider_height.slider.min = Number(File(part).min_height);
                                    }
                                    
                                    if (dyo.usa) {
                                        dyo.engine.sizes.slider_length.slider.max = Number(File(part).max_depth) * 2;
                                    } else {
                                        dyo.engine.sizes.slider_length.slider.max = Number(File(part).max_depth);
                                    }
                                    dyo.engine.sizes.slider_length.slider.min = Number(File(part).min_depth);
                                } else {
                                    dyo.engine.sizes.slider_height.slider.min = Number(File(part).min_height);
                                    dyo.engine.sizes.slider_height.slider.max = Number(File(part).max_height);

                                    if (dyo.monument.headstone.ratio > 0) {
                                        dyo.engine.sizes.slider_height.slider.min = Number(File(part).max_height) * dyo.monument.headstone.ratio;
                                    } else {
                                        dyo.engine.sizes.slider_height.slider.min = Number(File(part).min_height);
                                    }

                                    if (dyo.config._config.type != "plaque") {
                                        if (dyo.config._config.type == "mini-headstone") {
                                            dyo.engine.sizes.slider_length.slider.min = Number(File(part).min_depth);
                                            dyo.engine.sizes.slider_length.slider.max = Number(File(part).max_depth);
                                        } else {
                                            dyo.engine.sizes.slider_length.slider.min = 1;
                                            dyo.engine.sizes.slider_length.slider.max = 1;
                                            if (dyo.usa) {
                                                dyo.engine.sizes.slider_length.slider.max = Number(File(part).max_depth) * 2;
                                            } else {
                                                dyo.engine.sizes.slider_length.slider.max = Number(File(part).max_depth);
                                            }
                                            dyo.engine.sizes.slider_length.slider.min = Number(File(part).min_depth);
                                        }
                                    }

                                }

                                if (part == "stand") {
                                    if (dyo.mode == "3d") {
                                        if (dyo.config._config.type == "headstone") {
                                            if (dyo.monument.has_base_flower_pot_holes) {
                                                dyo.engine.sizes.slider_length.slider.max = Number(File(part).max_depth);
                                                dyo.engine.sizes.slider_length.slider.min = Number((File(part).min_depth) * 2) - 10;
                                            }
                                        }
                                    }
                                }

                                if (o) {
                                    dyo.engine.sizes.slider_width.slider.value = o.getProperty("width");
                                    dyo.engine.sizes.slider_height.slider.value = o.getProperty("height");
                                    dyo.engine.sizes.slider_length.slider.value = o.getProperty("depth");
                                }
                                
                                if (dyo.config._config.type == "full-monument" || dyo.config._config.type == "headstone") {
                                        
                                    let diff = 200, v = 0;

                                    switch (dyo.engine3d.currentModel.generalType.toLowerCase()) {
                                        case "headstone": case "table":
                                            if (dyo.config._config.type == "full-monument") {
                                                if (dyo.monument.has_base) {
                                                    dyo.engine.sizes.slider_width.slider.max = Number(dyo.engine3d.stand3d.getProperty("width"));
                                                    dyo.engine.sizes.slider_length.slider.max = Number(dyo.engine3d.stand3d.getProperty("depth"));
                                                }
                                            }
                                            break;
                                        case "stand":
                                            dyo.engine.sizes.slider_width.slider.max =  Number(File(part).max_width) + (diff / 2);
                                            dyo.engine.sizes.slider_width.slider.min = Number(dyo.engine3d.headstone3d.getProperty("width"));

                                            if (dyo.config._config.type == "full-monument") {
                                                dyo.engine.sizes.slider_length.slider.min = Number(dyo.engine3d.headstone3d.getProperty("depth"));
                                            }
                                            break;
                                        case "ledger": case "lid":
                                            v = Number(dyo.engine3d.headstone3d.getProperty("width")) + diff / 2;
                                            if (v > dyo.engine.sizes.slider_width.slider.max) {
                                                v = dyo.engine.sizes.slider_width.slider.max;
                                            }
                                            dyo.engine.sizes.slider_width.slider.min = v;
                                            break;    
                                        case "kerbset": case "kerb":
                                            v = Number(dyo.engine3d.headstone3d.getProperty("width")) + diff;
                                            if (v > dyo.engine.sizes.slider_width.slider.max) {
                                                v = dyo.engine.sizes.slider_width.slider.max;
                                            }
            
                                            dyo.engine.sizes.slider_width.slider.min = v;
                                            break;    
                
                                    }

                                }

                            }

                        }

                    }

                    catch(error) {
                        console.log(error);
                    }

                    this.targetType = dyo.engine3d.currentModel.generalType.toLowerCase();

                    if (dyo.monument.id == 5 || dyo.monument.id == 999) {
                        this.targetType = "Plaque";
                    }
                    if (dyo.monument.id == 7) {
                        this.targetType = "Image";
                    }

                    $('#dyo_sizes_title', Translate(this.getType()) + " " + Translate(Lang.SIZE).toLowerCase() + " " + '<i class="material-icons">help_outline</i>');

                } else {

                    if (dyo.target == null || dyo.target == undefined) {
                    //    dyo.target = dyo.monument.headstone;
                    }

                    if (dyo.target) {

                        this.targetType = dyo.target.type;

                        if (dyo.monument.id == 5 || 
                            dyo.monument.id == 30 ||
                            dyo.monument.id == 34 ||
                            dyo.monument.id == 999) {
                            this.targetType = "Plaque";
                        }
                        if (dyo.monument.id == 7) {
                            this.targetType = "Image";
                        }

                        let part;
                        let diff = 200, v = 0;

                        switch (dyo.target.type) {
                            case "Headstone":
                                part = "table";

                                dyo.engine.sizes.slider_width.slider.min = 1;
                                dyo.engine.sizes.slider_width.slider.max = 2;
        
                                dyo.engine.sizes.slider_width.slider.max = Number(File(part).max_width);
                                dyo.engine.sizes.slider_width.slider.min = Number(File(part).min_width);
                                dyo.engine.sizes.slider_width.slider.value = dyo.monument.headstone.width;

                                break;
                            case "Base":
                                part = "stand";

                                dyo.engine.sizes.slider_width.slider.min = 1;
                                dyo.engine.sizes.slider_width.slider.max = 2;
        
                                dyo.engine.sizes.slider_width.slider.max = Number(File(part).max_width) + (diff / 2);
                                dyo.engine.sizes.slider_width.slider.min = dyo.monument.headstone.width + (diff / 2);
                                dyo.engine.sizes.slider_width.slider.value = dyo.monument.headstone.width + (diff / 2);

                                if (Number(File(part).max_width) == dyo.monument.headstone.width) {
                                    dyo.engine.sizes.slider_width.slider.min = dyo.monument.headstone.width;
                                    dyo.engine.sizes.slider_width.slider.value = dyo.monument.base.width;

                                }
                                break;
                        }

                        $('#dyo_sizes_title', Translate(this.getType()) + " " + Translate(Lang.SIZE).toLowerCase() + " " + '<i class="material-icons">help_outline</i>');

                    }
            
                }

            }

            /*
            if (dyo.monument.id == 5 || dyo.monument.id == 999) {
                if (dyo.monument.headstone) {
                    if (dyo.monument.headstone.name == "Circle" || 
                        dyo.monument.headstone.name == "Oval (Landscape)" || dyo.monument.headstone.name == "Oval (Portrait)" ||
                        dyo.monument.headstone.name == "Oval Landscape" || dyo.monument.headstone.name == "Oval Portrait") {
                        if (dyo.oneTimeSizeSetup) {
                            dyo.oneTimeSizeSetup = false;
                            if (!dyo.edit) {
                                this.increaseSize();
                                console.log("@bla");
                            }
                        }
                    }
                }
            }
            */

        }

        dyo.monument.updateHeader("Sizes:751");

    }

    increaseSize() {
        this.slider_size.increase();
    }

    disable(id) {

        if ($("#slider-dyo_slider_" + id).classList.contains("mdc-slider--disabled") == false) {
            $("#slider-dyo_slider_" + id).classList.add("mdc-slider--disabled");
            $("#slider-dyo_slider_" + id).style.pointerEvents = "none";
        }

        if ($("#dyo_" + id + "_textfield").classList.contains("mdc-text-field--disabled") == false) {
            $("#dyo_" + id + "_textfield").classList.add("mdc-text-field--disabled");
            $("#dyo_" + id + "_textfield").style.pointerEvents = "none";
        }

        $("#dyo_button_" + id + "_increase").setAttribute("disabled", "disabled");
        $("#dyo_button_" + id + "_decrease").setAttribute("disabled", "disabled");

    }
	
    enable(id) {

        if ($("#slider-dyo_slider_" + id).classList.contains("mdc-slider--disabled") == true) {
            $("#slider-dyo_slider_" + id).classList.remove("mdc-slider--disabled");
            $("#slider-dyo_slider_" + id).style.pointerEvents = "auto";
        }

        if ($("#dyo_" + id + "_textfield").classList.contains("mdc-text-field--disabled") == true) {
            $("#dyo_" + id + "_textfield").classList.remove("mdc-text-field--disabled");
            $("#dyo_" + id + "_textfield").style.pointerEvents = "auto";
        }

        $("#dyo_button_" + id + "_increase").removeAttribute("disabled", "disabled");
        $("#dyo_button_" + id + "_decrease").removeAttribute("disabled", "disabled");

    }
	
}