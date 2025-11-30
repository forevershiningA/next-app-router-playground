import { Drawer, Dialog, TextField, Select, Slider, List } from '../material/MaterialDesign.js';
import { P, Lang, Translate, $ } from '../Const.js';
import { Component } from '../material/Component.js';

export class Holes extends Component {

	constructor(data = {}) {
		super(data);
        this.eventsCollector = [];

        this.container = $("div", "add", "container", this.stage);
        
        this.hide();
    }

    show() {
        dyo.currentSection = "Holes";
        this.container.style.display = "block";
    }

    update() {
        $("#dyo_holes_title", Translate(Lang.HOLES) + " <i class='material-icons'>help_outline</i>");
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
                id: "dyo_holes"
            });
            this.menu.render();

            this.input = new List({
                stage: $("#dyo_holes-mdc-list"),
                parent: this,
                id: "dyo_holes_list",
                type: 7,
                data: this.holes
            });
            this.input.render();
        }
        
    }

    selectHole(id, hole) {

        let _id;
        let _hole;

        if (id == undefined) {
            _id = dyo.engine.hole_id
            _hole = dyo.engine.hole_hole;
        } else {
            _id = id;
            _hole = hole;
        }

        let type = dyo.config.getProductType();

        this.holes.forEach(hole => {

            if (hole.class == type) {

                let id2 = hole.class + "_" + this.makeSafeName(hole.name);
                if ($('#' + id2)) {
                    $('#' + id2).classList.remove("mdc-list-selected");
                }

            }

        });

        $('#' + _id).classList.add("mdc-list-selected");

        switch (_hole.option) {
            case 1:
                //Hole on each corners
                dyo.monument.holeType = 1;
                break;
            case 2:
                //Hole on top two corners
                dyo.monument.holeType = 2;
                break;
            case 3:
                //No drilled holes
                dyo.monument.holeType = 3;
                break;
        }

    }

    events() {

        let self = this;
        let type = dyo.config.getProductType();

        this.holes.forEach(hole => {

            if (hole.class == type) {

                let id = hole.class + "_" + this.makeSafeName(hole.name);
                
                if (dyo.engine.deviceType == "desktop") {
                   
                    $('#' + id).addEventListener('mouseover', () => { 
                        $("#tutorial-header", hole.title);
                        $("#tutorial-description", "<p style='text-align:center'>" + hole.description_img + "</p>");
                        dyo.engine.tutorial.show(hole.nr);
                    });

                    $('#' + id).addEventListener('mouseout', () => { 
                        dyo.engine.tutorial.hide();
                    });

                } 

                $('#' + id).addEventListener('click', (e) => { 

                    if (dyo.engine.deviceType == "desktop") {

                        this.selectHole(id, hole);

                    } else {

                        dyo.engine.hole_id = id;
                        dyo.engine.hole_hole = hole;

                        dyo.engine.popupActive = true;

                        let dialog = dyo.engine.dialog_resp;

                        dialog.title = hole.title;
                        dialog.body = "<p style='text-align:center'>" + hole.description_img + "</p>";
                        dialog.accept = Translate(Lang.SELECT);
                        dialog.decline = Translate(Lang.CLOSE);
                        dialog.action = this.selecthole;
                        dialog.render();
                        dialog.show();

                        if (dyo.template == 2) {
                            let c = 'skinAU_e6daca';
                            $("#resp-header").classList.add(c);
                            $("#resp-footer").classList.add(c);
                        }

                    }


                });

            }

        });

        let title = Translate(Lang.HOLESS);
        let description = Translate(Lang.HOLES_INFO);
        let instructions;
        
		switch (dyo.monument.id) {
            case P.YAG_LASERED_SS_PLAQUE:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_HOLES) + "</p>";
                instructions += "</div>";
                break;
        }

        if (instructions) {           
            description += instructions;
        }

        if (dyo.engine.mobileDevice) {

            $('#dyo_holes_title').addEventListener('click', (e) => { 
                dyo.engine.popupActive = true;

                let dialog = dyo.engine.dialog_resp;

                dialog.title = title;
                dialog.body = description;
                dialog.accept = "";
                dialog.decline = Lang.CLOSE
                dialog.render();
                dialog.show();

				if (dyo.template == 2) {
					let c = 'skinAU_e6daca';
					$("#resp-header").classList.add(c);
					$("#resp-footer").classList.add(c);
				}
            });

        } else {
                
            $('#dyo_holes_title').addEventListener('mouseover', (e) => { 

                $("#tutorial-header", title);
                $("#tutorial-description", description);

                dyo.engine.tutorial.show(1);

            });

            $('#dyo_holes_title').addEventListener('mouseout', (e) => { 
                dyo.engine.tutorial.hide();
            });

        }

    }
	
}