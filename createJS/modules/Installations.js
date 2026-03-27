import { Drawer, Dialog, TextField, Select, Slider, List } from '../material/MaterialDesign.js';
import { Lang, Translate, $ } from '../Const.js';
import { Component } from '../material/Component.js';

export class Installations extends Component {

	constructor(data = {}) {
		super(data);
        this.eventsCollector = [];

        this.container = $("div", "add", "container", this.stage);
        
        this.hide();
    }

    show() {
        dyo.currentSection = "Installations";
        this.container.style.display = "block";
    }

    update() {
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
                id: "dyo_installations"
            });
            this.menu.render();

        }

        this.input = new List({
            stage: $("#dyo_installations-mdc-list"),
            parent: this,
            id: "dyo_installations_list",
            type: 7,
            data: this.installations,
            title: Translate(Lang.SELECT_INSTALLATION)
        });
        this.input.render();
        
    }

    events() {

        let self = this;
        let id;
        let type = dyo.config.getProductType();
        let _id;

        this.installations.forEach(installation => {

            if (installation.class == type) {

                let id = installation.class + "_" + this.makeSafeName(installation.name);

                let img = installation.img;

                if (dyo.monument.id == 8) {
                    img = img.replace("base", "pet-base");
                    img = img.replace("flat", "pet-flat");
                    img = img.replace("ground", "pet-ground");
                }
                
                if (dyo.engine.deviceType == "desktop") {
                   
                    $('#' + id).addEventListener('mouseover', () => { 
                        $("#tutorial-header", Translate(Lang[this.makeSafeName(installation.name).toUpperCase()]));
                        $("#tutorial-description", "<p style='text-align:center'><img src='" + img + "' /></p>");
                        dyo.engine.tutorial.show(installation.nr);
                    });

                    $('#' + id).addEventListener('mouseout', () => { 
                        dyo.engine.tutorial.hide();
                    });

                } 

                $('#' + id).addEventListener('click', (e) => { 

                    if (dyo.engine.deviceType == "desktop") {
        
                        this.selectInstallation(id, installation);
        
                    } else {
        
                        dyo.engine.installation_id = id;
                        dyo.engine.installation_installation = installation;
        
                        dyo.engine.popupActive = true;
        
                        let dialog = dyo.engine.dialog_resp;
        
                        dialog.title = Translate(Lang[this.makeSafeName(installation.name).toUpperCase()]);
                        dialog.body = "<p style='text-align:center'><img src='" + img + "' /></p>";
                        dialog.accept = Translate(Lang.SELECT);
                        dialog.decline = Translate(Lang.CLOSE);
                        dialog.action = this.selectInstallation;
                        dialog.render();
                        dialog.show();
        
                        if (dyo.template == 2) {
                            let c = 'skinAU_e1bd81';
                            $("#resp-header").classList.add(c);
                            $("#resp-footer").classList.add(c);
                        }
        
                    }
        
                });

            }

        })

		if (dyo.engine.mobileDevice) {

            $('#dyo_installations_title').addEventListener('click', (e) => { 
                dyo.engine.popupActive = true;

				let o = self.getTutorialData();
                let dialog = dyo.engine.dialog_resp;

                dialog.title = o.title;
				dialog.body = o.description;
				dialog.accept = "";
                dialog.decline = Lang.CLOSE
                dialog.render();
                dialog.show();

                if (dyo.template == 2) {
                    let c = 'skinAU_e1bd81';
					$("#resp-header").classList.add(c);
					$("#resp-footer").classList.add(c);
                }
            });

        } else {
				
			$('#dyo_installations_title').addEventListener('mouseover', (e) => { 

				let o = self.getTutorialData();
				
				$("#tutorial-header", o.title);
				$("#tutorial-description", o.description);

				dyo.engine.tutorial.show(1);

			});

			$('#dyo_installations_title').addEventListener('mouseout', (e) => { 
				dyo.engine.tutorial.hide();
			});

		}

    }

    selectInstallation(id, installation) {

        let _id;
        let _installation;

        if (id == undefined) {
            _id = dyo.engine.installation_id
            _installation = dyo.engine.installation_installation;
        } else {
            _id = id;
            _installation = installation;
        }

        let type = dyo.config.getProductType();

        this.installations.forEach(installation => {

            if (installation.class == type) {

                let id2 = installation.class + "_" + this.makeSafeName(installation.name);
                if ($('#' + id2)) {
                    $('#' + id2).classList.remove("mdc-list-selected");
                }

            }

        });

        $('#' + _id).classList.add("mdc-list-selected");

        switch (_installation.option) {

            case 1:
                //Mini Headstone with Granite Base
                $('#dyo_add_headstone_base').style.display = "flex";

                dyo.monument.installationMethod = 1;
                dyo.monument.has_base = true;
                $('#dyo_add_headstone_base_flower_pot_holes').style.display = "none";
                
                dyo.monument.base.update();
            
                dyo.monument.showBase();
                dyo.monument.updateMonument("instalaations:84");

                if (dyo.mode == "3d") {
                    dyo.engine3d.loadTexture(dyo.engine3d.headstone3d, dyo.engine3d.currentModelTextureURL);
                }

                break;

            case 2:
                //Mini Headstone only - Lay Flat
                $('#dyo_add_headstone_base').style.display = "none";

                dyo.monument.installationMethod = 2;
                dyo.monument.has_base = false;
                $('#dyo_add_headstone_base_flower_pot_holes').style.display = "none";

                dyo.monument.showBase();
                dyo.monument.updateMonument("instalaations:97");

                if (dyo.mode == "3d") {
                    dyo.engine3d.loadTexture(dyo.engine3d.headstone3d, dyo.engine3d.currentModelTextureURL);
                }

                break;

            case 3:
                //Mini Headstone - 100 mm Buried into Ground
                $('#dyo_add_headstone_base').style.display = "none";

                dyo.monument.installationMethod = 3;
                dyo.monument.has_base = false;
                $('#dyo_add_headstone_base_flower_pot_holes').style.display = "none";

                if (dyo.mode == "3d") {
                    if (dyo.engine3d.currentModel) {
                        dyo.engine3d.loadTexture(dyo.engine3d.headstone3d, "data/png/ground.png");
                    }
                }

                dyo.monument.showBase();
                dyo.monument.updateMonument("instalaations:109");

                break;

        }

    }

	getTutorialData() {

		let title, description, instructions;

        switch (dyo.monument.id) {
            default:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.SELECT_INSTALLATION) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.SELECT_INSTALLATION_INSTRUCTIONS) + "</p>";
                instructions += "</div>";
                break;
        }

		switch (dyo.monument.id) {
			case 8:
				title = Translate(Lang.SELECT_INSTALLATION);
				description = "<p>" + Translate(Lang.SELECT_INSTALLATION_DESCRIPTION) + "</p>";
				break;	
            case 22:
                title = Translate(Lang.SELECT_INSTALLATION);
                description = "<p>" + Translate(Lang.SELECT_INSTALLATION_DESCRIPTION) + "</p>";
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