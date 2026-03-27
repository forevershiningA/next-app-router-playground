import { Drawer, Dialog, ImageList, TextField, Select, Slider, List } from '../material/MaterialDesign.js';
import { P, Lang, Translate, $ } from '../Const.js';
import { Border } from '../dyo/Border.js';
import { Component } from '../material/Component.js';

export class Borders extends Component {

	constructor(data = {}) {
        super(data);
        dyo.borders = this;

        this.isRendered = false;
        this.container = $("div", "add", "container", this.stage);
        
        this.hide();
    }

    show() {
        dyo.currentSection = "Borders";
        this.container.style.display = "block";
        dyo.monument.updateHeader("Borders:20");
    }

    update() {

        if (this.colors_list) {
            if (dyo.monument.id == 31) {
                this.colors_list.render();
                this.colors_list.show();
            } else {
                this.colors_list.hide();
            }
        }

        if (this.borders) {
            this.input.data = this.borders;
            this.input.render();
        }

    }

    render() {

        if (!this.isRendered) {

            this.isRendered = true;

            this.menu = new Drawer({
                stage: this.container,
                drawer_type: 0,
                toolbar_type: 1,
                title: this.title,
                id: "dyo_borders"
            });
            this.menu.render();

            this.input = new List({
                stage: $("#dyo_borders-mdc-list"),
                parent: this,
                id: "dyo_borders_list",
                type: 1,
                data: this.borders,
                title: Lang.SELECT_BORDER
            });
            
            if (this.borders) {
                this.input.render();
            }

        } else {
            if (this.borders) {
                this.input.data = this.borders;
                this.input.render();
            }
        }

    }

    showAllBorders() {
        if (this.borders) {
            this.input.data = this.borders;
            this.input.render();
        }
        this.input.showAll();
    }

    showOnlyFirstBorders() {
        this.input.showOnlyFirst();
    }


    selectBorder(id) {

        let type = dyo.config.getProductType();

        if (id.indexOf(type) == -1) {
            id = type + "_" + id;
        }

        if (this.borders) {

            this.borders.forEach(border => {

                if (border.class == type) {

                    let id2 = border.class + "_" + this.makeSafeName(border.name);
                    if ($('#' + id2)) {
                        $('#' + id2).classList.remove("mdc-list-selected");
                    }

                }

            });

        }
       
        if ($('#' + id)) {
            $('#' + id).classList.add("mdc-list-selected");
        }

    }

    events() {

        let type = dyo.config.getProductType();
        let nr = 0;

        this.borders.forEach(border => {

            let id = border.class + "_" + this.makeSafeName(border.name);

            nr ++;

            switch (dyo.monument.id) {
                default:
                    let n = 2;

                    if (dyo.currentBorder == "Border 4") {
                        n = 5;
                    }
                    if (dyo.currentBorder == "No Border") {
                        n = 1;
                    }
                    if (nr == n) {
                        $('#' + id).classList.add("mdc-list-selected");
                    }        
                    break;
                case 31: case 32:
                    if (nr == 1) {
                        $('#' + id).classList.add("mdc-list-selected");
                    }        
                    break;
            }

            $('#' + id).addEventListener('click', () => { 
                dyo.borderId = id;

                dyo.engine.showNewDesign();

                if (dyo.target == null) {
                    dyo.target = dyo.monument.getPartByType("Headstone");
                }

                //console.log(dyo.target.borderName, border.name);

                if (dyo.target.borderName != border.name) {

                    dyo.currentBorder = border.name;

                    this.selectBorder(id);

                    if (dyo.selected) {
                        dyo.monument.deselectAll();
                    }
                    
                    if (dyo.target == null) {
                        dyo.target = dyo.monument.getPartByType('Headstone');
                    }
                    
                    let part = dyo.monument.getPartByType(dyo.target.type);
                    part._select();
                    
                    if (dyo.target.type == 'Headstone') {

                        let Headstone = dyo.monument.getPartByType('Headstone');

                        Headstone.name = Headstone.name;
                        Headstone.border = border.drawing;
                        Headstone.border_name = border.disp_name;
                        
                        if (border.nr > 0) {
                            if (Headstone.fixed == 2) {
                                if (Headstone.getConfig().border == undefined) {
                                    Headstone.border = "Border " + Headstone.getConfig().drawing;
                                } else {
                                    Headstone.border = Headstone.getConfig().border;
                                }
                            }
                        }

                        if (dyo.monument.id == 31) {
                            switch (Headstone.border) {
                                default:

                                    if (dyo.monument.headstone.productBorder) {
                                        dyo.monument.headstone.productBorder.delete();
                                    }
                                    dyo.monument.headstone.productBorder = new Border({ 
                                        type: "Border",
                                        border_drawing: Headstone.border,
                                        productid: 89
                                    });

                                    dyo.engine.loader.hide("ImageList:242");
        
                                    if (dyo.target == null) {
                                        dyo.target = dyo.monument.getPartByType('Headstone');
                                    }
        
                                    dyo.target.add(dyo.monument.headstone.productBorder);
                                    dyo.monument.updateHeader();
                                    break;
                                case "No Border":
                                    if (dyo.monument.headstone.productBorder) {
                                        dyo.monument.headstone.productBorder.delete();
                                    }
                                    break;
                            }
                        }

                        Headstone.renderOverlay();
                        dyo.monument.updateHeader();

                        if (dyo.mode == "3d") {
                            if (dyo.monument.id == 5) {
                                setTimeout(function() {
                                    dyo.engine.addBorder();
                                }, 500);
                            } 
                        }
                                                
                    }

                }

                dyo.target.borderName = border.drawing;

                if (border.msg) {

                        let data = {
                            message: border.msg,
                            timeout: 5000
                        };
                        
                        dyo.engine.snackbar.open(data);

                } else {

                    dyo.engine.snackbar.close();

                }

            });

        });

        if (dyo.engine.mobileDevice) {

            $('#dyo_borders_title').addEventListener('click', (e) => { 
                dyo.engine.popupActive = true;

                let o = dyo.borders.getTutorialData();
                let dialog = dyo.engine.dialog_resp;

                dialog.title = o.title;
                dialog.body = o.description;
                dialog.accept = "";
                dialog.decline = Translate(Lang.CLOSE);
                dialog.render();
                dialog.show();

                if (dyo.template == 2) {
                    let c = 'skinAU_f4c3bd';
                    $("#resp-header").classList.add(c);
                    $("#resp-footer").classList.add(c);
                }
        
            });

        } else {
                
            $('#dyo_borders_title').addEventListener('mouseover', (e) => { 

                let o = dyo.borders.getTutorialData();
                
                $("#tutorial-header", o.title);
                $("#tutorial-description", o.description);

                dyo.engine.tutorial.show(1);

            });

            $('#dyo_borders_title').addEventListener('mouseout', (e) => { 
                dyo.engine.tutorial.hide();
            });

        }

    }

	getTutorialData() {

		let title, description, instructions;

        switch (dyo.monument.id) {
            case P.BRONZE_PLAQUE:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_BORDERS) + "</p>";
                instructions += "</div>";
                break;
            case P.FULL_COLOUR_PLAQUE:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_SS_BORDERS) + "</p>";
                instructions += "</div>";
                break;
        }

		switch (dyo.monument.id) {
			case 5:
				title = Translate(Lang.BORDERS);
				description = "<p>" + Translate(Lang.BRONZE_BORDERS) + "</p>";
				break;
            case 31:
                title = Translate(Lang.BORDERS);
                description = "<p>" + Translate(Lang.FULL_COLOUR_PLAQUE_BORDER) + "</p>";
                break;    
            case 32:
                title = Translate(Lang.BORDERS);
                description = "<p>" + Translate(Lang.FULL_COLOUR_PLAQUE_BORDER) + "</p>";
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