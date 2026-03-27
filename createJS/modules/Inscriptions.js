import { Button, Drawer, ImageList, Select, Slider, TextField } from '../material/MaterialDesign.js';
import { P, Lang, Translate, $ } from '../Const.js';
import { Component } from '../material/Component.js';

export class Inscriptions extends Component {

	constructor(data = {}) {
		super(data);

		this.container = $("div", "add", "container-inscriptions", this.stage);
        this.hide();
    }

    hide() {
		this.hideContainer(this.container);

		if (this.colors_list) {
			this.colors_list.hide();
		}
    }

    show() {

		dyo.currentSection = "Inscriptions";
		this.showContainer(this.container);

		switch (dyo.monument._config.formula) {
			default:
				this.colors_list.show();
				break;
			case "Bronze": case "Laser":
			break;
		}

		if (dyo.selected) {
			this.showButtons();
		} else {
			this.hideButtons();
		}

		dyo.monument.updateHeader("Inscriptions:225");

	}

	hideButtons() {
		this.buttonSizeIncrease.hide();
		this.buttonSizeDecrease.hide();
		this.buttonRotationIncrease.hide();
		this.buttonRotationDecrease.hide();

		this.buttonDuplicate.hide();
		this.buttonDelete.hide();

		this.slider_size.hide();
		this.slider_rotation.hide();
		this.colors_list.hide();
	}

	showButtons() {
		this.buttonSizeIncrease.show();
		this.buttonSizeDecrease.show();
		this.buttonRotationIncrease.show();
		this.buttonRotationDecrease.show();
		this.buttonDuplicate.show();
		this.buttonDelete.show();

		this.slider_size.show();
		this.slider_rotation.show();

		switch (dyo.monument._config.color) {
			default:
				this.colors_list.show();
				break;
			case 0:
				this.colors_list.hide();
			break;
		}
	}

    update() {

		let color_type;
		let data_colors;

		if (dyo.monument.id == 31) {
			color_type = 3;
			data_colors = this.borders_colors;

			this.colors_list.type = color_type,
            this.colors_list.data = data_colors,
			this.colors_list.render();
		} else {
			color_type = 1;
			data_colors = this.colors;

			this.colors_list.type = color_type,
            this.colors_list.data = data_colors,
			this.colors_list.render();
		}

		if (dyo.monument.id == 31) {
			this.font_family.data = this.fonts_steel;
		} else {
			this.font_family.data = this.fonts;
		}
		
		this.font_family.render();

		$("#dyo_inscriptions_title", Translate(Lang.INSCRIPTIONS) + " <i class='material-icons'>help_outline</i>");
		$("#select_font_label", Translate(Lang.SELECT_FONT));
		$("#dyo_button_new_line_secondary", Translate(Lang.ADD_NEW_LINE));
		$("#dyo_button_font_height_decrease_icon_small", Translate(Lang.DECREASE));
		$("#dyo_button_font_height_increase_icon_small", Translate(Lang.INCREASE));
		
		$("#dyo_button_inscription_delete_icon", Translate(Lang.DELETE));
		$("#dyo_button_inscription_duplicate_icon", Translate(Lang.DUPLICATE));

		$("#dyo_button_inscription_slider_rotation_decrease_icon_small", Translate(Lang.DECREASE));
		$("#dyo_button_inscription_slider_rotation_increase_icon_small", Translate(Lang.INCREASE));

    }

    render() {

		dyo.engine.inscriptions.lastY = 0;

        this.menu = new Drawer({
            stage: this.container,
            toolbar_type: 1,
            title: this.title,
            id: "dyo_inscriptions"
        });
		this.menu.render();
		
		this.container_inscriptions = $("div", "add", "container-inscriptions-internal", $("#dyo_inscriptions-mdc-list"));
		this.container_buttons = $("div", "add", "container-buttons", $("#dyo_inscriptions-mdc-list"));
		this.container_slider_size = $("div", "add", "slider-size-container");
		this.container_slider_rotation = $("div", "add", "slider-rotation-container");

        this.input = new TextField({
            stage: this.container_inscriptions,
            id: "dyo_textfield",
            type: 1,
			dataType: "text",
            title: Lang.ADD_YOUR_INSCRIPTION
        });
        this.input.render();
		
		this.buttonNewline = new Button({
            stage: this.container_inscriptions,
            id: "dyo_button_new_line",
			type: 2,
			title: Lang.ADD_NEW_LINE
        });       
		this.buttonNewline.render();

		let fontsFamily = this.fonts;

		if (dyo.monument.id == 31) {
			fontsFamily = this.fonts_steel;
		}

        this.font_family = new Select({
            stage: this.container_inscriptions,
            id: "dyo_select_font_family",
			data: fontsFamily,
			type: 1,
			parentcss: "float: right",
            title: Lang.SELECT_FONT
        });
        this.font_family.render();

        this.container_inscriptions.appendChild(this.container_slider_size);

        this.slider_size = new Slider({
            stage: this.container_slider_size,
			id: "dyo_slider_font_height",
			step: 1,
            title: Lang.SELECT_SIZE
        });
		this.slider_size.render();

		this.buttonSizeDecrease = new Button({
            stage: this.container_slider_size,
            id: "dyo_button_font_height_decrease",
			type: 6,
			icon: 'remove',
			title: Lang.DECREASE
        });       
		this.buttonSizeDecrease.render();
		
		this.buttonSizeIncrease = new Button({
            stage: this.container_slider_size,
            id: "dyo_button_font_height_increase",
			type: 6,
			parentcss: "float: right",
            icon: 'add',
			title: Lang.INCREASE
        });       
		this.buttonSizeIncrease.render();

		this.container_inscriptions.appendChild(this.container_slider_rotation);

		this.slider_rotation = new Slider({
			stage: this.container_slider_rotation,
			id: "dyo_slider_inscription_slider_rotation",
			step: 1,
			title: Lang.ROTATE
		});
		this.slider_rotation.render();
		
		this.buttonRotationDecrease = new Button({
			stage: this.container_slider_rotation,
			id: "dyo_button_inscription_slider_rotation_decrease",
			type: 6,
			icon: 'remove',
			title: Lang.DECREASE
		});       
		this.buttonRotationDecrease.render();
		
		this.buttonRotationIncrease = new Button({
			stage: this.container_slider_rotation,
			id: "dyo_button_inscription_slider_rotation_increase",
			parentcss: "float: right",
			type: 6,
			icon: 'add',
			title: Lang.INCREASE
		});       
		this.buttonRotationIncrease.render();

        this.slider_rotation.slider.min = -180;
        this.slider_rotation.slider.max = 180;
		this.slider_rotation.slider.value = 0;
		
		let color_type = 1;
		let data_colors = this.colors;

		if (dyo.monument.id == 31) {
			color_type = 3;
			data_colors = this.borders_colors;
		}

		this.colors_list = new ImageList({
            stage: this.container_inscriptions,
            parent: this,
            id: "dyo_fonts_colors_list",
            type: color_type,
			section: "inscriptions",
            data: data_colors,
            title: Lang.SELECT_COLOUR
        });
		this.colors_list.render();

        this.buttonDuplicate = new Button({
            stage: this.container_buttons,
            id: "dyo_button_inscription_duplicate",
			type: 3,
			icon: 'add_to_photos',
			title: Lang.DUPLICATE
        });       
		this.buttonDuplicate.render();

		this.buttonDelete = new Button({
			stage: this.container_buttons,
			id: "dyo_button_inscription_delete",
			type: 3,
			css: "margin-bottom: 100px !important",
			icon: 'delete',
			title: Lang.DELETE
		});       
		this.buttonDelete.render();
		
		this.events();
       
    }
	
	reset() {
		this.colors_list.render();
		$('#dyo_textfield').blur();

		this.input.text_field.value = '';

		this.buttonDuplicate.hide();
		this.buttonDelete.hide();
	}

	enhanceMinHeight() {

		if (dyo.monument.id) {
			let family = dyo.engine.inscriptions.font_family.getSelected();

			switch (dyo.monument.id) {

				// Laser - 4mm
				default:

					switch (family) {

						default:
							let _config = dyo.monument._additions.Inscriptions[0];
							dyo.engine.inscriptions.slider_size.slider.min = Number(_config.min_height);
							break;

						case "Arial":
							dyo.engine.inscriptions.slider_size.slider.min = 7;
							break;	
						case "Adorable":
							dyo.engine.inscriptions.slider_size.slider.min = 10;
							break;
						case "Chopin Script":
							dyo.engine.inscriptions.slider_size.slider.min = 12;
							break;	
						case "Dobkin":
							dyo.engine.inscriptions.slider_size.slider.min = 12;
							break;		
						case "Franklin Gothic":
							dyo.engine.inscriptions.slider_size.slider.min = 8;
							break;
						case "French Script":
							dyo.engine.inscriptions.slider_size.slider.min = 15;
							break;
						case "Garamond":
							dyo.engine.inscriptions.slider_size.slider.min = 9;
							break;
						case "Great Vibes":
							dyo.engine.inscriptions.slider_size.slider.min = 8;
							break;
						case "Lucida Calligraphy":
							dyo.engine.inscriptions.slider_size.slider.min = 8;
							break;
						case "Xirwena":
							dyo.engine.inscriptions.slider_size.slider.min = 8;
							break;
					}
	
				break;

				// Bronze - 4mm
				case 5:

					switch (family) {
						default:
							let _config = dyo.monument._additions.Inscriptions[0];
							dyo.engine.inscriptions.slider_size.slider.min = Number(_config.min_height);
							break;
						case "Arial":
							dyo.engine.inscriptions.slider_size.slider.min = 9;
							break;	
						case "Adorable":
							dyo.engine.inscriptions.slider_size.slider.min = 36;
							break;
						case "Chopin Script":
							dyo.engine.inscriptions.slider_size.slider.min = 45;
							break;	
						case "Dobkin":
							dyo.engine.inscriptions.slider_size.slider.min = 68;
							break;		
						case "Franklin Gothic":
							dyo.engine.inscriptions.slider_size.slider.min = 8;
							break;
						case "French Script":
							dyo.engine.inscriptions.slider_size.slider.min = 27;
							break;
						case "Garamond":
							dyo.engine.inscriptions.slider_size.slider.min = 16;
							break;
						case "Great Vibes":
							dyo.engine.inscriptions.slider_size.slider.min = 27;
							break;
						case "Lucida Calligraphy":
							dyo.engine.inscriptions.slider_size.slider.min = 17;
							break;
						case "Xirwena":
							dyo.engine.inscriptions.slider_size.slider.min = 12;
							break;
					}

				break;

				// Traditional - 8mm
				case 34: case 124: case 100: case 102:

					switch (family) {
						default:
							let _config = dyo.monument._additions.Inscriptions[0];
							dyo.engine.inscriptions.slider_size.slider.min = Number(_config.min_height);
							break;
						case "Arial":
							dyo.engine.inscriptions.slider_size.slider.min = 15;
							break;		
						case "Adorable":
							dyo.engine.inscriptions.slider_size.slider.min = 18;
							break;
						case "Chopin Script":
							dyo.engine.inscriptions.slider_size.slider.min = 25;
							break;	
						case "Dobkin":
							dyo.engine.inscriptions.slider_size.slider.min = 23;
							break;		
						case "Franklin Gothic":
							dyo.engine.inscriptions.slider_size.slider.min = 15;
							break;
						case "French Script":
							dyo.engine.inscriptions.slider_size.slider.min = 33;
							break;
						case "Garamond":
							dyo.engine.inscriptions.slider_size.slider.min = 18;
							break;
						case "Great Vibes":
							dyo.engine.inscriptions.slider_size.slider.min = 22;
							break;
						case "Lucida Calligraphy":
							dyo.engine.inscriptions.slider_size.slider.min = 15;
							break;
						case "Xirwena":
							dyo.engine.inscriptions.slider_size.slider.min = 17;
							break;
					}
	
					break;

				// Steel - 3mm
				case 52:

					switch (family) {
						default:
							let _config = dyo.monument._additions.Inscriptions[0];
							dyo.engine.inscriptions.slider_size.slider.min = Number(_config.min_height);
							break;
						case "Arial":
							dyo.engine.inscriptions.slider_size.slider.min = 5;
							break;	
						case "Adorable":
							dyo.engine.inscriptions.slider_size.slider.min = 7;
							break;
						case "Chopin Script":
							dyo.engine.inscriptions.slider_size.slider.min = 8;
							break;	
						case "Dobkin":
							dyo.engine.inscriptions.slider_size.slider.min = 8;
							break;		
						case "Franklin Gothic":
							dyo.engine.inscriptions.slider_size.slider.min = 6;
							break;
						case "French Script":
							dyo.engine.inscriptions.slider_size.slider.min = 12;
							break;
						case "Garamond":
							dyo.engine.inscriptions.slider_size.slider.min = 7;
							break;
						case "Great Vibes":
							dyo.engine.inscriptions.slider_size.slider.min = 7;
							break;
						case "Lucida Calligraphy":
							dyo.engine.inscriptions.slider_size.slider.min = 6;
							break;
						case "Xirwena":
							dyo.engine.inscriptions.slider_size.slider.min = 6;
							break;
					}


					break;

			}

			if (dyo.selected) {
				//console.log(dyo.engine.inscriptions.slider_size.slider.value, dyo.engine.inscriptions.slider_size.slider.min);
				if (dyo.engine.inscriptions.slider_size.slider.value == dyo.engine.inscriptions.slider_size.slider.min) {
					//dyo.selected.setSize(dyo.engine.inscriptions.slider_size.slider.min);
				}
			}
	
		}

	}
	
	events() {

		let self = this;

		$("#dyo_button_font_height_increase").addEventListener("click", () => {
			if (dyo.selected) {
				dyo.selected.increase();
				$("#dyo_button_font_height_increase").blur();
			}
		});

		$("#dyo_button_font_height_decrease").addEventListener("click", () => {
			if (dyo.selected) {
				dyo.selected.decrease();
				$("#dyo_button_font_height_decrease").blur();
			}
		});

		$("#dyo_button_inscription_slider_rotation_increase").addEventListener("click", () => {
			if (dyo.selected) {
				self.slider_rotation.increase();
				$("#dyo_button_inscription_slider_rotation_increase").blur();
			}
		});

		$("#dyo_button_inscription_slider_rotation_decrease").addEventListener("click", () => {
			if (dyo.selected) {
				self.slider_rotation.decrease();
				$("#dyo_button_inscription_slider_rotation_decrease").blur();
			}
		});

		$("#dyo_button_new_line").addEventListener("click", () => {
			if (dyo.selected) {
				if (dyo.selected.text.text.replace(/\s/g, '').length > 0) {
					if (dyo.selected.text.text) {
						dyo.selected.duplicate({ label: " " });
						$("#dyo_textfield").focus();
					}
				} 
				$("#dyo_button_new_line").blur();
				dyo.selected = false;
			} else {
				if ($("#dyo_textfield").value == "") {
					$("#dyo_textfield").focus();
				}
			}
		});

		$("#dyo_button_inscription_duplicate").addEventListener("click", () => {
			if (dyo.selected) {
				dyo.selected.duplicate();
				dyo.engine.showNewDesign();
				$("#dyo_button_inscription_duplicate").blur();
			}
		});

		$("#dyo_button_inscription_delete").addEventListener("click", () => {
			if (dyo.selected) {
				dyo.engine.showNewDesign();
				dyo.selected.delete();
				dyo.engine.inscriptions.input.text_field.value = '';
				dyo.selected = null;

				dyo.engine.show();
				dyo.engine.inscriptions.reset();
				dyo.engine.inscriptions.hide();

				if (dyo.mode != "3d") {
					dyo.monument.headstone._select();
				}
				
				$("#dyo_button_inscription_delete").blur();
			}
		});

		if (dyo.engine.mobileDevice) {

            $('#dyo_inscriptions_title').addEventListener('click', (e) => { 
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
				
			$('#dyo_inscriptions_title').addEventListener('mouseover', (e) => { 

				let o = self.getTutorialData();
				
				$("#tutorial-header", o.title);
				$("#tutorial-description", o.description);

				dyo.engine.tutorial.show(1);

			});

			$('#dyo_inscriptions_title').addEventListener('mouseout', (e) => { 
				dyo.engine.tutorial.hide();
			});

		}

	}

	getTutorialData() {

		let title, description, instructions;

        switch (dyo.monument.id) {
            default:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_INSCRIPTIONS) + "</p>";
                instructions += "</div>";
                break;
        }

		switch (dyo.monument.id) {
			default:
				title = Translate(Lang.INSCRIPTIONS);
				description = "<p>" + Translate(Lang.INSCRIPTIONS_INFO_LASER) + "</p>";
				break;
			case 5:
				title = Translate(Lang.INSCRIPTIONS);
				description = "<p>" + Translate(Lang.INSCRIPTIONS_INFO_BRONZE) + "</p>";
				break;	
			case 31:
				title = Translate(Lang.INSCRIPTIONS);
				description = "<p>" + Translate(Lang.INSCRIPTIONS_STEEL_LIGHT_TRANSMITTING) + "</p>";
				break;			
			case 34: case 124: case 101: case 102:
				title = Translate(Lang.INSCRIPTIONS);
				description = "<p>" + Translate(Lang.INSCRIPTIONS_INFO_TRADITIONAL) + "</p>";
				break;
			case 52:
				title = Translate(Lang.INSCRIPTIONS);
				description = "<p>" + Translate(Lang.INSCRIPTIONS_STEEL) + "</p>";
				break;		
			case 7: case 32: case 2350:
				title = Translate(Lang.INSCRIPTIONS);
				description = "<p>" + Translate(Lang.INSCRIPTIONS_INFO_OTHER) + "</p>";
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