import { Drawer, Dialog, TextField, Select, Slider, List } from '../material/MaterialDesign.js';
import { P, Lang, Translate, $ } from '../Const.js';
import { Component } from '../material/Component.js';

export class Corners extends Component {

	constructor(data = {}) {
		super(data);
        this.eventsCollector = [];

        this.container = $("div", "add", "container", this.stage);
        
        this.hide();
    }

    show() {
        dyo.currentSection = "Corners";
        this.container.style.display = "block";
    }

    update() {
        $("#dyo_corners_title", Translate(Lang.CORNERS) + " <i class='material-icons'>help_outline</i>");
        $("#back_to_menu_" + this.title, Translate(Lang.BACK_TO_DESIGN_MENU));
    }

    render() {

        if (!this.rendered) {
            this.rendered = true;

            this.menu = new Drawer({
                stage: this.container,
                drawer_type: 0,
                toolbar_type: 1,
                title: this.title,
                id: "dyo_corners"
            });
            this.menu.render();

            this.input = new List({
                stage: $("#dyo_corners-mdc-list"),
                parent: this,
                id: "dyo_corners_list",
                type: 7,
                data: this.corners
            });
            this.input.render();
        }
        
    }

    selectCorner(id, corner) {

        let _id;
        let _corner;

        if (id == undefined) {
            _id = dyo.engine.corner_id
            _corner = dyo.engine.corner_corner;
        } else {
            _id = id;
            _corner = corner;
        }

        let type = dyo.config.getProductType();

        this.corners.forEach(corner => {

            if (corner.class == type) {

                let id2 = corner.class + "_" + this.makeSafeName(corner.name);
                if ($('#' + id2)) {
                    $('#' + id2).classList.remove("mdc-list-selected");
                }

            }

        });

        $('#' + _id).classList.add("mdc-list-selected");

        switch (_corner.option) {
            case 1:
                //Rounded
                dyo.monument.cornerType = 1;
                break;

            case 2:
                //Straight
                dyo.monument.cornerType = 2;
                break;
        }

    }

    events() {

        let self = this;
        let type = dyo.config.getProductType();

        this.corners.forEach(corner => {

            if (corner.class == type) {

                let id = corner.class + "_" + this.makeSafeName(corner.name);
                
                if (dyo.engine.deviceType == "desktop") {
                   
                    $('#' + id).addEventListener('mouseover', () => { 
                        $("#tutorial-header", corner.title);
                        $("#tutorial-description", "<p style='text-align:center'>" + corner.description_img + "</p>");
                        dyo.engine.tutorial.show(corner.nr);
                    });

                    $('#' + id).addEventListener('mouseout', () => { 
                        dyo.engine.tutorial.hide();
                    });

                } 

                $('#' + id).addEventListener('click', (e) => { 

                    if (dyo.engine.deviceType == "desktop") {

                        this.selectCorner(id, corner);

                    } else {

                        dyo.engine.corner_id = id;
                        dyo.engine.corner_corner = corner;

                        dyo.engine.popupActive = true;

                        let dialog = dyo.engine.dialog_resp;

                        dialog.title = corner.title;
                        dialog.body = "<p style='text-align:center'>" + corner.description_img + "</p>";
                        dialog.accept = Translate(Lang.SELECT);
                        dialog.decline = Translate(Lang.CLOSE);
                        dialog.action = this.selectCorner;
                        dialog.render();
                        dialog.show();

                        if (dyo.template == 2) {
                            let c = 'skinAU_aea097';
                            $("#resp-header").classList.add(c);
                            $("#resp-footer").classList.add(c);
                        }

                    }


                });

            }

        });

        let title = Translate(Lang.CORNERS);
        let description = Translate(Lang.CORNERS_INFO);
        let instructions;
        
		switch (dyo.monument.id) {
            case P.YAG_LASERED_SS_PLAQUE:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_CORNERS) + "</p>";
                instructions += "</div>";
                break;
        }

        if (instructions) {           
            description += instructions;
        }

        if (dyo.engine.mobileDevice) {

            $('#dyo_corners_title').addEventListener('click', (e) => { 
                dyo.engine.popupActive = true;

                let dialog = dyo.engine.dialog_resp;

                dialog.title = title;
                dialog.body = description;
                dialog.accept = "";
                dialog.decline = Lang.CLOSE
                dialog.render();
                dialog.show();

				if (dyo.template == 2) {
					let c = 'skinAU_aea097';
					$("#resp-header").classList.add(c);
					$("#resp-footer").classList.add(c);
				}
            });

        } else {
                
            $('#dyo_corners_title').addEventListener('mouseover', (e) => { 

                $("#tutorial-header", title);
                $("#tutorial-description", description);

                dyo.engine.tutorial.show(1);

            });

            $('#dyo_corners_title').addEventListener('mouseout', (e) => { 
                dyo.engine.tutorial.hide();
            });

        }

    }
	
}