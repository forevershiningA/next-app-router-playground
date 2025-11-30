import { Drawer, Dialog, TextField, Select, Slider, List } from '../material/MaterialDesign.js';
import { P, Lang, Translate, $ } from '../Const.js';
import { Component } from '../material/Component.js';

export class FixingSystem extends Component {

	constructor(data = {}) {
		super(data);
        this.eventsCollector = [];

        this.container = $("div", "add", "container", this.stage);
        
        this.hide();
    }

    show() {
        dyo.currentSection = "FixingSystem";
        this.container.style.display = "block";
    }

    update() {
        $("#dyo_fixing_title", Translate(Lang.FIXING_SYSTEM) + " <i class='material-icons'>help_outline</i>");
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
                id: "dyo_fixing"
            });
            this.menu.render();

            this.input = new List({
                stage: $("#dyo_fixing-mdc-list"),
                parent: this,
                id: "dyo_fixing_list",
                type: 7,
                data: this.fixingSystem,
                title: Lang.PLEASE_CHOOSE_A_FIXING_SYSTEM_FOR_YOUR_BRONZE_PLAQUE
            });
            this.input.render();

        }
        
    }

    selectFixing(id, fixing) {

        let _id;
        let _fixing;

        if (id == undefined) {
            _id = dyo.engine.fixing_id
            _fixing = dyo.engine.fixing_fixing;
        } else {
            _id = id;
            _fixing = fixing;
        }

        let type = dyo.config.getProductType();

        this.fixingSystem.forEach(fixing => {

            if (fixing.class == type) {

                let id2 = fixing.class + "_" + this.makeSafeName(fixing.name);
                if ($('#' + id2)) {
                    $('#' + id2).classList.remove("mdc-list-selected");
                }

            }

        });

        $('#' + _id).classList.add("mdc-list-selected");

        switch (_fixing.option) {

            case 1:
                //Flat Back
                dyo.monument.fixingSystemType = 1;
                break;

            case 2:
                //Lugs with Studs
                dyo.monument.fixingSystemType = 2;
                break;

            case 3:
                //Screws (visible from front)
                dyo.monument.fixingSystemType = 3;
                break;

        }

    }

    events() {

        let self = this;
        let type = dyo.config.getProductType();

        this.fixingSystem.forEach(fixing => {

            if (fixing.class == type) {

                let id = fixing.class + "_" + this.makeSafeName(fixing.name);
                
                if (dyo.engine.deviceType == "desktop") {
                   
                    $('#' + id).addEventListener('mouseover', () => { 
                        $("#tutorial-header", fixing.title);
                        $("#tutorial-description", "<p style='text-align:center'>" + Translate(Lang.CLICK_MENU_ITEM_TO_SELECT_FIXING_SYSTEM) + "<br/><br/>" + fixing.description + "</p>" + "<p style='text-align:center'>" + fixing.description_img + "</p>");
                        dyo.engine.tutorial.show(fixing.nr);
                    });

                    $('#' + id).addEventListener('mouseout', () => { 
                        dyo.engine.tutorial.hide();
                    });

                } 

                $('#' + id).addEventListener('click', (e) => { 

                    if (dyo.engine.deviceType == "desktop") {

                        this.selectFixing(id, fixing);

                    } else {

                        dyo.engine.fixing_id = id;
                        dyo.engine.fixing_fixing = fixing;

                        dyo.engine.popupActive = true;

                        let dialog = dyo.engine.dialog_resp;

                        dialog.title = fixing.title;
                        dialog.body = "<p style='text-align:center'>" + fixing.description + "</p>" + "<p style='text-align:center'>" + fixing.description_img + "</p>";
                        dialog.accept = Translate(Lang.SELECT);
                        dialog.decline = Translate(Lang.CLOSE);
                        dialog.action = this.selectFixing;
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

        let title = Translate(Lang.FIXING_SYSTEM);
        let description = Translate(Lang.FIXING_INFO);
        let instructions;
        
		switch (dyo.monument.id) {
            case P.BRONZE_PLAQUE:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_FIXING) + "</p>";
                instructions += "</div>";
                break;
        }

        if (instructions) {           
            description += instructions;
        }

        if (dyo.engine.mobileDevice) {

            $('#dyo_fixing_title').addEventListener('click', (e) => { 
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
                
            $('#dyo_fixing_title').addEventListener('mouseover', (e) => { 

                $("#tutorial-header", title);
                $("#tutorial-description", description);

                dyo.engine.tutorial.show(1);

            });

            $('#dyo_fixing_title').addEventListener('mouseout', (e) => { 
                dyo.engine.tutorial.hide();
            });

        }

    }
	
}