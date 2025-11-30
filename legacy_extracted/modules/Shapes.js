import { Drawer, Dialog, TextField, Select, Slider, List, Title } from '../material/MaterialDesign.js';
import { Component } from '../material/Component.js';
import { Monument } from '../dyo/Monument.js';
import { P, Lang, Translate, File, $ } from '../Const.js';

export class Shapes extends Component {

	constructor(data = {}) {
		super(data);

        dyo.shapes = this;
        
        this.container = $("div", "add", "container", this.stage);

        this.menu = new Drawer({stage: this.container,drawer_type: 0,toolbar_type: 1,title: this.title,id: "dyo_shapes"});
        this.menu.render();
        
        this.container_list = $("div", "add", "container-list", $("#dyo_shapes-mdc-list"));

        this.hide();
    }

    show() {
        dyo.currentSection = "Shapes";
        dyo.last_url = "select-shape";
        this.container.style.display = "block";

        if (dyo.mode == "3d") {
            let showNr = 0;

            showNr = setInterval(() => {

                if (Engine3D.Controller) {
                    if (Engine3D.Controller.getCurrentProject()) {
                        if (dyo.engine3d_ready) {
                            if (Engine3D.Controller.getCurrentProject().getSelectedModel() == null) {
                                Engine3D.Controller.getCurrentProject().setSelectedModel(dyo.engine3d.headstone3d);
                                clearInterval(showNr);
                            }
                        }
                    }
                }
        
            }, 100);

        }

        dyo.monument.updateHeader("Shapes:33");
    }

    update() {
        $("#back_to_menu_" + this.title, Translate(Lang.BACK_TO_DESIGN_MENU));
        $("#dyo_" + this.id + "_title", Translate(Lang.SHAPES) + " <i class='material-icons'>help_outline</i>");

        this.input.render();
    }

    render() {

        this.input = new List({
            stage: this.container_list,
            parent: this,
            id: "dyo_shapes_list",
            type: 1,
            data: this.shapes,
            title: Lang.SELECT_SHAPE
        });
        this.input.render();

    }

    selectShape(id) {

        let type = dyo.config.getProductType();

        this.shapes.forEach(shape => {

            if (shape.class == type) {

                let id2 = shape.class + "_" + this.makeSafeName(shape.name);
                if ($('#' + id2)) {
                    $('#' + id2).classList.remove("mdc-list-selected");
                }

            }

        });
       
        if ($('#' + id)) {
            $('#' + id).classList.add("mdc-list-selected");
        }

    }

    events() {

        let self = this;
        let id;
        let type = dyo.config.getProductType();
        let nr = 0;
        let nr3 = 0;

        this.shapes.forEach(shape => {

            if (shape.class == type) {

                let id = shape.class + "_" + this.makeSafeName(shape.name);

                if (dyo.mode == "3d" && dyo.shape_id > 0) {

                    if (shape.m3d) {
                        nr3 ++;
                    }

                    if (nr3 == (dyo.shape_id + 1)) {
                        if ($('#' + id)) {
                            $('#' + id).classList.add("mdc-list-selected");
                        }
                    }
    
                } else {

                    nr ++;

                    switch (dyo.monument.id) {
                        default: case 32:
                            if (nr == 1) {
                                if ($('#' + id)) {
                                    $('#' + id).classList.add("mdc-list-selected");
                                }
                            }
                            break;
                        case 4: case 8: case 22: case 124:
                            if (nr == 10) {
                                $('#' + id).classList.add("mdc-list-selected");
                            }        
                            break;
                    }

                }

                if ($('#' + id)) {
                    $('#' + id).addEventListener('click', () => { 

                        dyo.engine.showNewDesign();

                        dyo.currentSection = "Shapes";

                        this.selectShape(id);

                        if (dyo.target == null) {
                            dyo.target = dyo.monument.getPartByType('Headstone');
                        }

                        if (shape.name != dyo.target.name) {

                            //console.log(id, shape.nr, shape.drawing);

                            switch (dyo.mode) {
                                case "3d":
                                    let Width = shape.width;
                                    let Height = shape.height;
                                    let Length = shape.depth;
                                    let Ratio = Width / Height;

                                    let Headstone = dyo.monument.getPartByType('Headstone');

                                    switch (dyo.config._config.type) {
                                        default:
                                            dyo.target.name = shape.name;
                                            dyo.engine3d.replaceModel("models/forevershining/headstones/" + shape.drawing.toLowerCase().replace(" ", "-") + ".m3d");
                                            break;
                                        case "urn":
                                            $("#openfl").style.visibility = "hidden";
                                            dyo.engine.loader.show("Shapes:101");

                                            setTimeout(() => {
                                                dyo.engine3d.headstone3d.changeProperty("width", Number(Width));
                                                dyo.engine3d.headstone3d.changeProperty("height", Number(Height));
                                                dyo.target.name = shape.name;

                                                dyo.engine3d.replaceModel("models/forevershining/urns/" + shape.drawing.toLowerCase().replace(" ", "-") + ".m3d");
                                            }, 1000);
                                            break;
                                        case "plaque":

                                            if (shape.length == undefined) {
                                                Length = dyo.config._config.thickness;
                                            } else {
                                                Length = shape.length;
                                            }
                                                
                                            switch (dyo.monument.id) {
                                                case 5: case 999: case 2350:
                                                    if (shape.border) {
                                                        Headstone.setBorder(shape.border);
                                                    }        
                                                    break;
                                                case 32:
                                                    dyo.engine.sizes.setupSlider();
                                                    break;
                                            }
        
                                            Headstone.render();
        
                                            dyo.target.name = shape.name;
        
                                            break;

                                    }

                                    if (dyo.metric == "inches") {
                                        Width = dyo.engine.metrics.convertToInches(Width);
                                        Height = dyo.engine.metrics.convertToInches(Height);
                                        Length = dyo.engine.metrics.convertToInches(Length);
                                    }
                            
                                    Headstone.width = Width;
                                    Headstone.height = Height;
                                    Headstone.length = Length;
                                    Headstone.ratio4 = Ratio;

                                    dyo.controller_Width.setValue(Width);
                                    
                                    if (dyo.monument.installationMethod != 3) {
                                        dyo.controller_Height.setValue(Height);
                                    }
                                    
                                    Headstone.setName(shape.name);
                                    Headstone.setShape(shape.drawing);
                                    Headstone.setFixed(shape.fixed);
                                    Headstone.setConfig(shape);
                                    
                                    if (shape.note) {
                                        Headstone.setNote(shape.note);
                                    }
                                    break;

                                case "2d":

                                    if (dyo.selected) {
                                        dyo.monument.deselectAll();
                                    }

                                    if (dyo.target.type == 'Headstone') {

                                        let shapeXML = dyo.config._shapes[shape.nr - 1];
                                        let old_name = dyo.engine.shapeName.split(" ")[0];
                                        let current_name = shape.name.split(" ")[0];
                                        dyo.data.current_name = current_name;

                                        let Headstone = dyo.monument.getPartByType('Headstone');

                                        if (old_name == current_name) {
                                            if (dyo.monument.id == 5 || dyo.monument.id == 30 || dyo.monument.id == 34) {

                                                if (dyo.data.width >= dyo.data.height) {
                                                    if (shape.name.indexOf("Portrait") > -1) {
                                                        shape.width = dyo.data.height;
                                                        shape.height = dyo.data.width;
                                                    }
                                                }

                                                if (dyo.data.width < dyo.data.height) {
                                                    if (shape.name.indexOf("Landscape") > -1) {
                                                        shape.width = dyo.data.height;
                                                        shape.height = dyo.data.width;
                                                    }
                                                }

                                                if (dyo.data.width == dyo.data.height) {
                                                    if (shape.name.indexOf("Circle") > -1) {
                                                        shape.width = dyo.data.width;
                                                        shape.height = dyo.data.height;
                                                    }
                                                }

                                            }
                                        }

                                        if (current_name == "Rectangle" || old_name == "Rectangle" || 
                                            (current_name == "Circle" && old_name == "Oval") || (old_name == "Circle" && current_name == "Oval")) {
                                            dyo.data.sizeNr = 1;
                                            //dyo.controller_Size.setValue(dyo.engine.sizes.slider_size.slider.max);
                                            //dyo.monument.updateHeader("Shapes:225");
                                            //console.log("@setting sizeNr to 1");
                                        }

                                        if (shape.class == "urns") {
                                            Headstone.setMinWidth(shape.width);
                                            Headstone.setMaxWidth(shape.width);
                                            Headstone.setMinHeight(shape.height);
                                            Headstone.setMaxHeight(shape.height);
                                        }

                                        Headstone.setName(shape.name);
                                        Headstone.setShape(shape.drawing);
                                        Headstone.setFixed(shape.fixed);
                                        Headstone.setConfig(shape);

                                        if (shape.note) {
                                            Headstone.setNote(shape.note);
                                        }

                                        switch (dyo.monument.id) {
                                            case 5: case 999: case 2350:
                                                if (shape.border) {
                                                    let border = shape.border;
                                                    if (dyo.currentBorder == "Border Oval Landscape" || 
                                                        dyo.currentBorder == "Border Oval" ||
                                                        dyo.currentBorder == "Border Circle" ||
                                                        dyo.currentBorder == "Border 4") {
                                                            if (border == "Border 1") {
                                                                border = "Border 4";
                                                            }
                                                    }
                                                    if (dyo.currentBorder == "No Border") {
                                                            if (border == "Border Oval Landscape" ||
                                                                border == "Border Oval" ||
                                                                border == "Border Circle") {
                                                                border = "No Border";
                                                            }
                                                    }
                                                    if (dyo.currentBorder == "No Border") {
                                                        if (border == "Border 1") {
                                                            border = "No Border";
                                                        }
                                                    
                                                    }
                                                    Headstone.setBorder(border);
                                                    dyo.currentBorder = border;
                                                }        
                                                break;
                                        }

                                        if (dyo.monument.id == 7) {
                                            dyo.engine.sizes.setup();
                                            dyo.engine.sizes.setupSlider("shapes:249");
                                        } else {

                                            if (shape.width) {
                                                Headstone.scaling = "set";

                                                if (shape.fixed == 2 && dyo.monument.id == 5 || dyo.monument.id == 999) {
                                                    dyo.oneTimeSizeSetup = true;
                                                    dyo.engine.sizes.showSizes();
                                                    dyo.borders.showOnlyFirstBorders();
                                                }

                                                if (dyo.monument.id == 32) {
                                                    dyo.oneTimeSizeSetup = true;
                                                    dyo.engine.sizes.showSizes();
                                                }

                                                if (shape.fixed == 0 && dyo.monument.id == 5 || dyo.monument.id == 999) {
                                                    dyo.engine.sizes.showWidthAndHeight();
                                                    dyo.borders.showAllBorders();
                                                }

                                                let Width = shape.width;
                                                let Height = shape.height;
                                                let Length = shape.depth;
                                                let Ratio = Width / Height;

                                                if (shape.length == undefined) {
                                                    Length = dyo.config._config.thickness;
                                                } else {
                                                    Length = shape.length;
                                                }

                                                if (dyo.monument.id != 32 && dyo.monument.id != 7) {

                                                    if (dyo.metric == "inches") {
                                                        Width = dyo.engine.metrics.convertToInches(Width);
                                                        Height = dyo.engine.metrics.convertToInches(Height);
                                                        Length = dyo.engine.metrics.convertToInches(Length);
                                                    }                                    

                                                    Headstone.width = Width;
                                                    Headstone.height = Height;
                                                    Headstone.length = Length;
                                                    Headstone.ratio4 = Ratio;

                                                    //console.log(Width, Height);

                                                    //if (shape.name.indexOf("Oval") == -1) {
                                                        dyo.controller_Width.setValue(Width);
                                                        dyo.controller_Height.setValue(Height);
                                                    //}

                                                }

                                            }  
                                            
                                        }
                                            
                                        Headstone.render();

                                        if (dyo.monument.has_base) {

                                            let Base = dyo.monument.getPartByType('Base');

                                            if (!dyo.edit) {
                                                if (dyo.monument.id == 8) {
                                                    Base.width = shape.width;
                                                } else {
                                                    Base.width = shape.width + 100;
                                                }
                                                Base.height = Number(File('stand').init_height);
                                            }
                                            
                                        }

                                    }
                                break;
                            }

                            if (dyo.data.sizeNr != 1) {
                                dyo.monument.updateHeader("Shapes:225");
                            }

                            if (dyo.data.current_name == "Rectangle") {
                                dyo.monument.updateHeader("Shapes:225");
                            }

                        }

                        dyo.monument.updateHeader("Shapes:225");

                    });

                }

            }

        });

        if (dyo.engine.mobileDevice) {

            $('#dyo_shapes_title').addEventListener('click', (e) => { 
                dyo.engine.popupActive = true;

                let o = dyo.engine.select_shapes.getTutorialData();
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
                
            $('#dyo_shapes_title').addEventListener('mouseover', (e) => { 

                let o = dyo.engine.select_shapes.getTutorialData();
                
                $("#tutorial-header", o.title);
                $("#tutorial-description", o.description);

                dyo.engine.tutorial.show(1);

            });

            $('#dyo_shapes_title').addEventListener('mouseout', (e) => { 
                dyo.engine.tutorial.hide();
            });

        }

    }

	getTutorialData() {

		let title, description, instructions;

        switch (dyo.monument.id) {
            case P.BRONZE_PLAQUE: case P.FULL_COLOUR_PLAQUE: case P.TRADITIONAL_ENGRAVED_PLAQUE: case P.LASER_ETCHED_BLACK_GRANITE_PLAQUE: case P.YAG_LASERED_SS_PLAQUE: case P.TRADITIONAL_ENGRAVED_HEADSTONE: case P.LASER_ETCHED_BLACK_GRANITE_HEADSTONE: case P.LASER_ETCHED_BLACK_GRANITE_MINI_HEADSTONE: case P.STAINLESS_STEEL_URN: case P.CERAMIC_IMAGE: case P.LASER_ETCHED_PET_MINI_HEADSTONE: case P.LASER_ETCHED_PET_ROCK:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_SHAPES) + "</p>";
                instructions += "</div>";
                break;
            case 9:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_SIZES_PET) + "</p>";
                instructions += "</div>";
                break;    
        }

		switch (dyo.monument.id) {
			default:
				title = Translate(Lang.SHAPES);
				description = "<p>" + Translate(Lang.SHAPES_INFO) + "</p>";
				break;
			case 5:
				title = Translate(Lang.SHAPES);
				description = "<p>" + Translate(Lang.SHAPES_INFO) + "</p>";
				break;	
			case 9:
				title = Translate(Lang.PLAQUE) + " " + Translate(Lang.SIZES);
				description = "<p>" + Translate(Lang.LASER_ETCHED_BLACK_GRANITE_PET_PLAQUE_SHAPES) + "</p>";
				break;
            case 32:
                title = Translate(Lang.SHAPES);
                description = "<p>" + Translate(Lang.SHAPES_INFO) + "</p>";
                break;    
            case 34:
                title = Translate(Lang.SHAPES);
                description = "<p>" + Translate(Lang.TRADITIONAL_ENGRAVED_PLAQUE_SHAPES) + "</p>";
                break;
            case 52:
                title = Translate(Lang.SHAPES);
                description = "<p>" + Translate(Lang.SHAPES_YAG) + "</p>";
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