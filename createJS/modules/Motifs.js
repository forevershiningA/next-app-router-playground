import { Button, Drawer, ImageList, List, Select, Slider, Radio, TextField } from '../material/MaterialDesign.js';
import { Lang, Translate, $ } from '../Const.js';
import { Component } from '../material/Component.js';

export class Motifs extends Component {

	constructor(data = {}) {
		super(data);

		this.categoriesLoaded = [];
		this.categoriesRendered = false;

		this.loadMorePressed = false;
		this.fullListVisible = true;
		this.eventsInited = false;

		this.container = $("div", "add", "container-motifs", this.stage);
		this.container_motifs_types = $("div", "add", "container-motifs-types", this.stage);
		this.container_slider_size = $("div", "add", "container-size-container", this.stage);
		this.container_slider_rotation = $("div", "add", "slider-rotation-container", this.stage);

		this.motif_typeId = 0;

        this.hide();
	}
	
    update() {
		this.updateMotifsInfo();
    }

    render() {

        this.menu = new Drawer({
            stage: this.container,
            toolbar_type: 1,
            title: this.title,
            id: "dyo_motifs"
        });
        this.menu.render();

		this.container_motifs = $("div", "add", "container-motifs-internal", $("#dyo_motifs-mdc-list"));
		this.container_motifs_types = $("div", "add", "container-motifs-types-internal", $("#dyo_motifs-mdc-list"));
		this.container_buttons = $("div", "add", "container-buttons", $("#dyo_motifs-mdc-list"));

        this.input = new List({
            stage: $("#dyo_motifs-mdc-list"),
            parent: this,
            id: "dyo_motifs_categories_list",
            type: 6,
            data: this.categories,
            title: Lang.SELECT_CATEGORY
		});
		this.input.render();

		this.input_motifs_types = new List({
			stage: $("#dyo_motifs-mdc-list"),
			parent: this,   
			id: "dyo_motifs_types_list",
			type: 8,
			data: this.motifs_types,
			title: Lang.SELECT_MOTIF
		});
		this.input_motifs_types.render();

        this.category = new Select({
            stage: this.container_motifs,
            id: "dyo_select_category",
            data: this.categories,
            type: 1,
            selected: 0,
            title: Lang.SELECT_CATEGORY
        });
        this.category.render();

		this.motifs_list = new ImageList({
            stage: this.container_motifs,
            parent: this,
			id: "dyo_motifs_list",
			selector: "motif",
			path: dyo.xml_path + 'data/png/motifs',
			class: "ptop10",
            type: 0,
            data: [],
            title: Lang.SELECT_MOTIF
		});
		
		this.container_motifs.appendChild(this.container_slider_size);

        let step = 1;

        if (dyo.metric == "inches") {
            step = dyo.engine.metrics.getMMtoInch() / 4;
		}
		
        this.slider_size = new Slider({
            stage: this.container_slider_size,
			id: "dyo_slider_motif_height",
			step: step,
            title: Lang.SELECT_SIZE
        });
		this.slider_size.render();
		
		this.buttonSizeDecrease = new Button({
            stage: this.container_slider_size,
            id: "dyo_button_motif_height_decrease",
			type: 6,
			icon: 'remove',
			title: Lang.DECREASE
        });       
		this.buttonSizeDecrease.render();
		
		this.buttonSizeIncrease = new Button({
            stage: this.container_slider_size,
            id: "dyo_button_motif_height_increase",
			type: 6,
			parentcss: "float: right",
            icon: 'add',
			title: Lang.INCREASE
        });       
		this.buttonSizeIncrease.render();

		this.container_motifs.appendChild(this.container_slider_rotation);

		this.slider_rotation = new Slider({
			stage: this.container_slider_rotation,
			id: "dyo_slider_motif_slider_rotation",
			step: 1,
			title: Lang.ROTATE
		});
		this.slider_rotation.render();
		
		this.buttonRotationDecrease = new Button({
			stage: this.container_slider_rotation,
			id: "dyo_button_motif_slider_rotation_decrease",
			type: 6,
			icon: 'remove',
			title: Lang.DECREASE
		});       
		this.buttonRotationDecrease.render();
		
		this.buttonRotationIncrease = new Button({
			stage: this.container_slider_rotation,
			id: "dyo_button_motif_slider_rotation_increase",
			parentcss: "float: right",
			type: 6,
			icon: 'add',
			title: Lang.INCREASE
		});       
		this.buttonRotationIncrease.render();

        this.slider_rotation.slider.min = -180;
        this.slider_rotation.slider.max = 180;
        this.slider_rotation.slider.value = 0;

 		this.buttonFlipX = new Button({
            stage: this.container_buttons,
			id: "dyo_button_motif_flipx",
            type: 3,
			icon: 'border_vertical',
			title: Lang.FLIP_X
        });       
        this.buttonFlipX.render();

 		this.buttonFlipY = new Button({
            stage: this.container_buttons,
			id: "dyo_button_motif_flipy",
            type: 3,
			icon: 'border_horizontal',
			title: Lang.FLIP_Y
        });       
		this.buttonFlipY.render();

        this.buttonDuplicate = new Button({
            stage: this.container_buttons,
            id: "dyo_button_motif_duplicate",
			type: 3,
			icon: 'add_to_photos',
			title: Lang.DUPLICATE
        });       
		this.buttonDuplicate.render();
		
		this.buttonDelete = new Button({
            stage: this.container_buttons,
            id: "dyo_button_motif_delete",
			type: 3,
			icon: 'delete',
			title: Lang.DELETE
        });       
        this.buttonDelete.render();

		let color_type = 1;
		let data_colors = this.colors;

		if (dyo.monument.id == 31) {
			color_type = 3;
			data_colors = this.borders_colors;

            this.radio_button = new Radio({
                stage: this.container_slider_rotation,
                id: "dyo_radio_button_part",
                data: this.motif_part,
                type: 1,
                title: Lang.SHARE
            });
            this.radio_button.render();

		}

		this.colors_list = new ImageList({
            stage: this.container_slider_rotation,
            parent: this,
			id: "dyo_motifs_colors_list",
            type: color_type,
			section: "motifs",
            data: data_colors,
            title: Lang.SELECT_COLOUR
        });
		this.colors_list.render();

        this.buttonLoadMore = new Button({
            stage: this.container_buttons,
            id: "dyo_button_motif_load_more",
			type: 7,
			icon: 'more_vert',
			title: Lang.LOAD_MORE
        });       
		this.buttonLoadMore.render();

		this.buttonBackToMotifs = new Button({
            stage: this.container_buttons,
			id: "dyo_button_go_back_to_motifs_list",
			type: 7,
			icon: 'keyboard_backspace',
			title: Lang.BACK_TO_MOTIFS_LIST
        });       
		this.buttonBackToMotifs.render();
		this.buttonBackToMotifs.hide();
		
		this.events();
       
	}

    hide() {
		this.hideContainer(this.container);
    }

    show() {
		dyo.currentSection = "Motifs";
		dyo.monument.updateHeader();
		this.showContainer(this.container);
    }

	reset() {

		this.colors_list.render();
		
		this.hideButtons();
		this.category.show();
		this.motifs_list.show();

		if (dyo.engine.motifs.category_data) {
			if (dyo.engine.motifs.category_data.length > 50) {
				if (!this.loadMorePressed) {
					this.buttonLoadMore.show();
				}
			} else {
				this.buttonLoadMore.hide();
			}
		}

		if (this.fullListVisible) {

			this.buttonLoadMore.hide();

			this.addMotifsCategoriesEvents();

			if (dyo.config._additions.Motifs.length > 1) {
				
				this.input.hide();
				this.category.hide();
				this.motifs_list.hide();
				this.input_motifs_types.render();
				this.input_motifs_types.show();

				if (this.motif_typeId > 0) {
					this.input_motifs_types.hide();
					this.input.show();
				}

				const traditional_motifs = document.getElementsByClassName("traditional_motif");
				const ss_motifs = document.getElementsByClassName("ss_motif");
				const col1_motifs = document.getElementsByClassName("col1_motif");
				const col2_motifs = document.getElementsByClassName("col2_motif");

				switch (this.motif_typeId) {
					default:
						this.radio_button.hide();
						for (let tm_nr = 0; tm_nr < traditional_motifs.length; tm_nr++) {
							traditional_motifs[tm_nr].style.display = "flex";
						};
						for (let tm_nr = 0; tm_nr < col1_motifs.length; tm_nr++) {
							col1_motifs[tm_nr].style.display = "none";
						};
						for (let tm_nr = 0; tm_nr < col2_motifs.length; tm_nr++) {
							col2_motifs[tm_nr].style.display = "none";
						};
						break;
					case 16:
						this.radio_button.hide();
						for (let tm_nr = 0; tm_nr < traditional_motifs.length; tm_nr++) {
							traditional_motifs[tm_nr].style.display = "none";
						};
						for (let tm_nr = 0; tm_nr < ss_motifs.length; tm_nr++) {
							ss_motifs[tm_nr].style.display = "none";
						};
						for (let tm_nr = 0; tm_nr < col2_motifs.length; tm_nr++) {
							col2_motifs[tm_nr].style.display = "none";
						};
						for (let tm_nr = 0; tm_nr < col2_motifs.length; tm_nr++) {
							col1_motifs[tm_nr].style.display = "flex";
						};

						break;
					case 17: case 18:
						this.radio_button.show();

						for (let tm_nr = 0; tm_nr < traditional_motifs.length; tm_nr++) {
							traditional_motifs[tm_nr].style.display = "none";
						};
						for (let tm_nr = 0; tm_nr < ss_motifs.length; tm_nr++) {
							ss_motifs[tm_nr].style.display = "none";
						};
						for (let tm_nr = 0; tm_nr < col2_motifs.length; tm_nr++) {
							col1_motifs[tm_nr].style.display = "none";
						};
						for (let tm_nr = 0; tm_nr < col2_motifs.length; tm_nr++) {
							col2_motifs[tm_nr].style.display = "flex";
						};
						break;
					case 76: case 14:
						this.radio_button.hide();
						for (let tm_nr = 0; tm_nr < traditional_motifs.length; tm_nr++) {
							traditional_motifs[tm_nr].style.display = "none";
						};
						for (let tm_nr = 0; tm_nr < col1_motifs.length; tm_nr++) {
							col1_motifs[tm_nr].style.display = "none";
						};
						for (let tm_nr = 0; tm_nr < col2_motifs.length; tm_nr++) {
							col2_motifs[tm_nr].style.display = "none";
						};
						for (let tm_nr = 0; tm_nr < ss_motifs.length; tm_nr++) {
							ss_motifs[tm_nr].style.display = "flex";
						};
						break;
				}

			} else {

				if (dyo.config._additions.Motifs.length == 1) {
					this.input_motifs_types.hide();
				}

				this.motifs_list.hide();
				this.category.hide();
				this.input.show();

			}

		} else {

			this.input.hide();

			this.motifs_list.show();
			this.category.show();

			if (dyo.config._additions.Motifs.length == 1) {
				this.input_motifs_types.hide();
			}

		}

	}

	addMotifsCategoriesEvents() {

		if (!this.categoriesRendered) {
			this.categoriesRendered = true;
				
			let self = this;
			let id;

			this.categories.forEach(category => {

				//if (category.traditional) {

					id = '#' + category.class + "_" + this.makeSafeName(category.name);

					if ($(id)) {
						$(id).addEventListener('click', (e) => { 

							dyo.engine.motifs.loadMorePressed = false;

							let files;

							dyo.engine.motifs.buttonLoadMore.show();
					
							files = "files.txt";

							let url = dyo.xml_path + "data/motifs/" + category.src + "/" + files;

							fetch(url)
							.then((response) => {
								response.text().then((text) => {
									let data = text.split(',');
									data.filter(n => true);

									dyo.engine.motifs.category_data = data;
									
									if (data.length > 50) {
										dyo.engine.motifs.motifs_list.data = data.slice(0, 50);
										dyo.engine.motifs.buttonLoadMore.show();
									} else {
										dyo.engine.motifs.motifs_list.data = data;
										dyo.engine.motifs.buttonLoadMore.hide();
									}

									dyo.engine.motifs.category.setValue(category.name);

									dyo.engine.motifs.fullListVisible = false;
									dyo.engine.motifs.motifs_list.render();  
									dyo.engine.motifs.reset();
									
								});
							});
							

						});
						
					}

				//}

			});

		}

	}

	hideButtons() {
		this.buttonSizeIncrease.hide();
		this.buttonSizeDecrease.hide();
		this.buttonDuplicate.hide();
		this.buttonLoadMore.hide();
		this.buttonFlipX.hide();
		this.buttonFlipY.hide();
		this.buttonDelete.hide();

		this.buttonBackToMotifs.hide();

		this.hideContainer(this.container_slider_size);
		this.hideContainer(this.container_slider_rotation);
		this.colors_list.hide();

	}

	showButtons() {
		this.buttonSizeIncrease.show();
		this.buttonSizeDecrease.show();
		this.buttonDuplicate.show();
		this.buttonFlipX.show();
		this.buttonFlipY.show();
		this.buttonDelete.show();
		this.buttonBackToMotifs.show();
		this.buttonLoadMore.hide();

		this.showContainer(this.container_slider_size);
		this.showContainer(this.container_slider_rotation);

		switch (dyo.monument._config.color) {
			default:
				this.colors_list.show();
				break;
			case 0:
				this.colors_list.hide();
			break;
		}
		
	}

	updateMotifsInfo() {
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

		let title, description, instructions;

		switch (dyo.monument.id) {
            default:
                instructions = "<div class='instructions'>";
                instructions += "<p><strong>" + Translate(Lang.INSTRUCTIONS) + ":</strong></p>";
                instructions += "<p>" + Translate(Lang.INSTRUCTIONS_MOTIFS) + "</p>";
                instructions += "</div>";
                break;
        }

		switch (dyo.monument.id) {
			default:
				title = Translate(Lang.MOTIFS);
				description = Translate(Lang.MOTIFS_INFO_LASER);
				break;
			case 5:
				title = Translate(Lang.MOTIFS);
				description = Translate(Lang.MOTIFS_INFO_BRONZE);
				break;
			case 52:
				title = Translate(Lang.MOTIFS);
				description = Translate(Lang.MOTIFS_INFO_STEEL);
				break;
			case 101: case 102: case 124: case 34:
				title = Translate(Lang.MOTIFS);
				description = Translate(Lang.MOTIFS_INFO_TRAD);
				break;	
			case 135: case 8: case 9:
				title = Translate(Lang.MOTIFS);
				description = Translate(Lang.MOTIFS_INFO_PET);
				break;
		}

		if (instructions) {           
            description += instructions;
        }

		if (dyo.engine.mobileDevice) {

			$('#dyo_motifs_title').addEventListener('click', (e) => { 
				dyo.engine.popupActive = true;

				let dialog = dyo.engine.dialog_resp;

				dialog.title = title;
				dialog.body = description;
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
				
			$('#dyo_motifs_title').addEventListener('mouseover', (e) => { 

				$("#tutorial-header", title);
				$("#tutorial-description", description);

				dyo.engine.tutorial.show(1);

			});

			$('#dyo_motifs_title').addEventListener('mouseout', (e) => { 
				dyo.engine.tutorial.hide();
			});

		}
	}
		
	events() {

		if ($("#dyo_button_motif_load_more")) {
				
			if (!this.eventsInited) {
				this.eventsInited = true;

				let self = this;

				$("#dyo_button_motif_load_more").addEventListener("click", () => {
					dyo.engine.motifs.motifs_list.data = dyo.engine.motifs.category_data;
					dyo.engine.motifs.motifs_list.render();

					dyo.engine.motifs.buttonLoadMore.hide();
					self.loadMorePressed = true;
				});

				$("#dyo_button_go_back_to_motifs_list").addEventListener("click", () => {
					document.location.href = "#add-your-motif";
				});

				$("#dyo_button_motif_height_increase").addEventListener("click", () => {
					if (dyo.selected) {
						dyo.selected.increase();
						$("#dyo_button_motif_height_increase").blur();
					}
				});

				$("#dyo_button_motif_height_decrease").addEventListener("click", () => {
					if (dyo.selected) {
						dyo.selected.decrease();
						$("#dyo_button_motif_height_decrease").blur();
					}
				});

				$("#dyo_button_motif_slider_rotation_increase").addEventListener("click", () => {
					if (dyo.selected) {
						self.slider_rotation.increase();
						$("#dyo_button_motif_slider_rotation_increase").blur();
					}
				});

				$("#dyo_button_motif_slider_rotation_decrease").addEventListener("click", () => {
					if (dyo.selected) {
						self.slider_rotation.decrease();
						$("#dyo_button_motif_slider_rotation_decrease").blur();
					}
				});

				$("#dyo_button_motif_flipx").addEventListener("click", (e) => {
					if (dyo.selected) {
						dyo.selected.flipX();
						$("#dyo_button_motif_flipx").blur();
					}
				});

				$("#dyo_button_motif_flipy").addEventListener("click", () => {
					if (dyo.selected) {
						dyo.selected.flipY();
						$("#dyo_button_motif_flipy").blur();
					}
				});

				$("#dyo_button_motif_duplicate").addEventListener("click", () => {
					if (dyo.selected) {
						dyo.selected.duplicate();
						$("#dyo_button_motif_duplicate").blur();
					}
				});

				$("#dyo_button_motif_delete").addEventListener("click", () => {
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

						$("#dyo_button_motif_delete").blur();
					}
				});

				this.updateMotifsInfo();

			}

		}

		if (dyo.config._additions.Motifs.length > 1) {

			this.motifs_types.forEach(motif => {

				let nr = 0;

				dyo.config._additions.Motifs.forEach(addition => {

					if (Number(motif.id) == Number(addition.id)) {
						
						if (dyo.engine.deviceType == "desktop") {

							if ($('#' + motif.class + "_" + this.makeSafeName(motif.selector))) {
								$('#' + motif.class + "_" + this.makeSafeName(motif.selector)).addEventListener('mouseover', (e) => { 

									$("#tutorial-header", motif.title);

									let motif_description = motif.description;
									$("#tutorial-description", motif_description);

									dyo.engine.tutorial.show(motif.nr);

								});
								$('#' + motif.class + "_" + this.makeSafeName(motif.selector)).addEventListener('click', (e) => { 

									dyo.engine.tutorial.hide();
									this.motif_typeId = motif.id;
									this.motif_typeName = motif.name;
									this.reset();

								});

							}

						} 

						if (dyo.engine.mobileDevice) {

							$('#' + motif.class + "_" + this.makeSafeName(motif.selector)).addEventListener('click', (e) => { 
								dyo.engine.popupActive = true;

								this.motif_typeId = motif.id;
								this.motif_typeName = motif.name;

								dyo.engine.dialog_resp.title = motif.title;
								dyo.engine.dialog_resp.body = motif.description;
								dyo.engine.dialog_resp.accept = Translate(Lang.SELECT);
								dyo.engine.dialog_resp.decline = Translate(Lang.CLOSE);
								dyo.engine.dialog_resp.action = dyo.engine.motifs.reset;
								dyo.engine.dialog_resp.render();
								dyo.engine.dialog_resp.show();

								if (dyo.template == 2) {
									let c = 'skinAU_efece0';
									$("#resp-header").classList.add(c);
									$("#resp-footer").classList.add(c);
								}

							});

						}

					}

				});

			});

			this.motifs_types.forEach(motif => {

				dyo.config._additions.Motifs.forEach(addition => {

					if (Number(motif.id) == Number(addition.id)) {

						if (dyo.engine.deviceType == "desktop") {

							if ($('#' + motif.class + "_" + this.makeSafeName(motif.selector))) {

								$('#' + motif.class + "_" + this.makeSafeName(motif.selector)).addEventListener('mouseout', () => { 
									dyo.engine.tutorial.hide();
								});

							}

						}

					}

				});
				
			});

		}

	}
	
}