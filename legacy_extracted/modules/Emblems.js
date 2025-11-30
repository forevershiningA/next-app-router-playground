import { Button, Drawer, ImageList, List, Select, Slider, Title, TextField } from '../material/MaterialDesign.js';
import { P,Lang, Translate, _, $ } from '../Const.js';
import { Component } from '../material/Component.js';

export class Emblems extends Component {

	constructor(data = {}) {
		super(data);

		this.categoriesLoaded = [];
		this.categoriesRendered = false;

		this.loadMorePressed = false;
		this.fullListVisible = true;
		this.eventsInited = false;

		this.container = $("div", "add", "container-emblems", this.stage);

        this.menu = new Drawer({
            stage: this.container,
            toolbar_type: 1,
            title: this.title,
            id: "dyo_emblems"
        });
        this.menu.render();

		this.container_emblems = $("div", "add", "container-emblems-internal", $("#dyo_emblems-mdc-list"));
		this.container_buttons = $("div", "add", "container-buttons", $("#dyo_emblems-mdc-list"));
		this.container_slider_size = $("div", "add", "slider-size-container");
		this.container_slider_rotation = $("div", "add", "slider-size-container");

        this.hide();
    }

    render() {

		this.emblems_list = new ImageList({
            stage: this.container_emblems,
            parent: this,
			id: "dyo_emblems_list",
			selector: "emblem",
			path: dyo.xml_path + 'data/png/emblems',
			class: "ptop10",
            type: 2,
            data: []
		});
		
		this.container_emblems.appendChild(this.container_slider_size);

        this.slider_size = new Slider({
            stage: this.container_slider_size,
			id: "dyo_slider_emblem_size",
			step: 1,	
            title: Lang.SELECT_SIZE
        });
		this.slider_size.render();
		
		this.buttonSizeDecrease = new Button({
            stage: this.container_slider_size,
            id: "dyo_button_emblem_size_decrease",
			type: 6,
			icon: 'remove',
			title: Lang.DECREASE
        });       
		this.buttonSizeDecrease.render();
		
		this.buttonSizeIncrease = new Button({
            stage: this.container_slider_size,
            id: "dyo_button_emblem_size_increase",
			type: 6,
			parentcss: "float: right",
            icon: 'add',
			title: Lang.INCREASE
        });       
		this.buttonSizeIncrease.render();

		this.container_emblems.appendChild(this.container_slider_rotation);

		this.slider_rotation = new Slider({
			stage: this.container_slider_rotation,
			id: "dyo_slider_emblem_slider_rotation",
			step: 1,
			title: Lang.ROTATE
		});
		this.slider_rotation.render();
		
		this.buttonRotationDecrease = new Button({
			stage: this.container_slider_rotation,
			id: "dyo_button_emblem_slider_rotation_decrease",
			type: 6,
			icon: 'remove',
			title: Lang.DECREASE
		});       
		this.buttonRotationDecrease.render();
		
		this.buttonRotationIncrease = new Button({
			stage: this.container_slider_rotation,
			id: "dyo_button_emblem_slider_rotation_increase",
			parentcss: "float: right",
			type: 6,
			icon: 'add',
			title: Lang.INCREASE
		});       
		this.buttonRotationIncrease.render();

        this.slider_rotation.slider.min = -180;
        this.slider_rotation.slider.max = 180;
        this.slider_rotation.slider.value = 0;

		this.colors_list = new ImageList({
            stage: this.container_slider_rotation,
            parent: this,
            id: "dyo_emblems_colors_list",
            type: 1,
            data: this.colors,
            title: Lang.SELECT_COLOUR
        });
		this.colors_list.render();

		this.buttonFlipX = new Button({
			stage: this.container_buttons,
			id: "dyo_button_emblem_flipx",
			css: "margin-top: 10px !important;",
			type: 3,
			icon: 'border_vertical',
			title: Lang.FLIP_X
		});       
		this.buttonFlipX.render();

		this.buttonFlipY = new Button({
            stage: this.container_buttons,
			id: "dyo_button_emblem_flipy",
			css: "margin-top: 10px !important; margin-right: 20px !important",
            type: 3,
			icon: 'border_horizontal',
			title: Lang.FLIP_Y
        });       
		this.buttonFlipY.render();
		
        this.buttonDuplicate = new Button({
            stage: this.container_buttons,
            id: "dyo_button_emblem_duplicate",
			type: 3,
			icon: 'add_to_photos',
			title: Lang.DUPLICATE
        });       
		this.buttonDuplicate.render();
		
		this.buttonDelete = new Button({
            stage: this.container_buttons,
            id: "dyo_button_emblem_delete",
			type: 3,
			icon: 'delete',
			title: Lang.DELETE
        });       
        this.buttonDelete.render();

        this.buttonLoadMore = new Button({
            stage: this.container_buttons,
            id: "dyo_button_emblem_load_more",
			type: 7,
			icon: 'more_vert',
			title: Lang.LOAD_MORE
        });       
		this.buttonLoadMore.render();

		this.buttonBackToemblems = new Button({
            stage: this.container_buttons,
			id: "dyo_button_go_back_to_emblems_list",
			css: "margin-top: 10px !important;",
			type: 7,
			icon: 'keyboard_backspace',
			title: Lang.BACK_TO_EMBLEMS_LIST
        });       
		this.buttonBackToemblems.render();
		this.buttonBackToemblems.hide();
		
		this.events();
       
	}

	emblemSizes() {
        return this.emblem_sizes(this.id);
    }

    hide() {
		this.hideContainer(this.container);
    }

    show() {
		dyo.currentSection = "Emblems";
		this.showContainer(this.container);
		dyo.monument.updateHeader("Emblems:225");
    }

	reset() {

		this.colors_list.render();
		
		this.hideButtons();
		this.emblems_list.show();

		if (dyo.engine.emblems.category_data) {
			if (dyo.engine.emblems.category_data.length > 50) {
				if (!this.loadMorePressed) {
					this.buttonLoadMore.show();
				}
			} else {
				this.buttonLoadMore.hide();
			}
		}

		if (this.fullListVisible) {
			this.buttonLoadMore.hide();
			this.emblems_list.show();
			this.addEmblemsCategoriesEvents();
		} else {
			this.emblems_list.show();
		}

	}

	addEmblemsCategoriesEvents() {

		if (!this.categoriesRendered) {
			this.categoriesRendered = true;
				
			let self = this;
			let id;

			dyo.engine.emblems.buttonLoadMore.show();
            
			let files = "emblems-files.txt";
			let url = dyo.xml_path + "data/emblems/" + files;
	
			fetch(url)
			.then((response) => {
				response.text().then((text) => {
					let data = text.split(',');
					data.filter(n => true);

					dyo.engine.emblems.category_data = data;
					
					if (data.length > 50) {
						dyo.engine.emblems.emblems_list.data = data.slice(0, 50);
						dyo.engine.emblems.buttonLoadMore.show();
					} else {
						dyo.engine.emblems.emblems_list.data = data;
						dyo.engine.emblems.buttonLoadMore.hide();
					}

					dyo.engine.emblems.fullListVisible = false;
					dyo.engine.emblems.emblems_list.render();  
					dyo.engine.emblems.reset();
					
				});
			});

		}

	}

	hideButtons() {
		this.buttonSizeIncrease.hide();
		this.buttonSizeDecrease.hide();
		this.buttonFlipX.hide();
		this.buttonFlipY.hide();
		this.buttonDuplicate.hide();
		this.buttonLoadMore.hide();
		this.buttonDelete.hide();

		this.buttonBackToemblems.hide();

		this.hideContainer(this.container_slider_size);
		this.hideContainer(this.container_slider_rotation);
		this.colors_list.hide();

	}

	showButtons() {
		this.buttonSizeIncrease.show();
		this.buttonSizeDecrease.show();
		this.buttonFlipX.show();
		this.buttonFlipY.show();
		this.buttonDuplicate.show();
		this.buttonDelete.show();
		this.buttonBackToemblems.show();
		this.buttonLoadMore.hide();

		this.showContainer(this.container_slider_size);
		this.showContainer(this.container_slider_rotation);

		switch (dyo.monument._config.color) {
			default:
				this.colors_list.show();
				break;
			//case "Bronze": case "Laser": case "Steel":
			case 0:
				this.colors_list.hide();
			break;
		}
		
	}

	events() {

		if ($("#dyo_button_emblem_load_more")) {
				
			if (!this.eventsInited) {
				this.eventsInited = true;

                let self = this;
                
				$("#dyo_button_emblem_load_more").addEventListener("click", () => {
					dyo.engine.emblems.emblems_list.data = dyo.engine.emblems.category_data;
					dyo.engine.emblems.emblems_list.render();

					dyo.engine.emblems.buttonLoadMore.hide();
					self.loadMorePressed = true;
				});

				$("#dyo_button_go_back_to_emblems_list").addEventListener("click", () => {
					document.location.href = "#add-your-emblem";
				});

				$("#dyo_button_emblem_size_increase").addEventListener("click", () => {
					self.slider_size.increase();
					$("#dyo_button_emblem_size_increase").blur();
				});
	
				$("#dyo_button_emblem_size_decrease").addEventListener("click", () => {
					self.slider_size.decrease();
					$("#dyo_button_emblem_size_decrease").blur();
				});

				$("#dyo_button_emblem_slider_rotation_increase").addEventListener("click", () => {
					if (dyo.selected) {
						self.slider_rotation.increase();
						$("#dyo_button_emblem_slider_rotation_increase").blur();
					}
				});

				$("#dyo_button_emblem_slider_rotation_decrease").addEventListener("click", () => {
					if (dyo.selected) {
						self.slider_rotation.decrease();
						$("#dyo_button_emblem_slider_rotation_increase").blur();
					}
				});

				$("#dyo_button_emblem_flipx").addEventListener("click", (e) => {
					if (dyo.selected) {
						dyo.selected.flipX();
						$("#dyo_button_emblem_flipx").blur();
					}
				});

				$("#dyo_button_emblem_flipy").addEventListener("click", () => {
					if (dyo.selected) {
						dyo.selected.flipY();
						$("#dyo_button_emblem_flipy").blur();
					}
				});

				$("#dyo_button_emblem_duplicate").addEventListener("click", () => {
					if (dyo.selected) {
						dyo.selected.duplicate();
						$("#dyo_button_emblem_duplicate").blur();
					}
				});

				$("#dyo_button_emblem_delete").addEventListener("click", () => {
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
						
						$("#dyo_button_emblem_delete").blur();
					}
				});

				let title = Translate(Lang.EMBLEMS);
				let description = Translate(Lang.EMBLEMS_INFO);
				let instructions = "<div class='instructions'>";
					instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
					instructions += "<p>" + Translate(Lang.INSTRUCTIONS_EMBLEMS) + "</p>";
					instructions += "</div>";

				description += instructions;

				if (dyo.engine.mobileDevice) {

					$('#dyo_emblems_title').addEventListener('click', (e) => { 
						dyo.engine.popupActive = true;

						let dialog = dyo.engine.dialog_resp;

						dialog.title = title;
						dialog.body = description;
						dialog.accept = "";
						dialog.decline = Translate(Lang.CLOSE);
						dialog.render();
						dialog.show();

						if (dyo.template == 2) {
							let c = 'skinAU_b9b58e';
							$("#resp-header").classList.add(c);
							$("#resp-footer").classList.add(c);
						}
					});

				} else {
						
					$('#dyo_emblems_title').addEventListener('mouseover', (e) => { 

						$("#tutorial-header", title);
						$("#tutorial-description", description);

						dyo.engine.tutorial.show(1);

					});

					$('#dyo_emblems_title').addEventListener('mouseout', (e) => { 
						dyo.engine.tutorial.hide();
					});

				}

			}

		}
			
	}
	
}