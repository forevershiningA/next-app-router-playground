import { Component } from './Component.js';
import { Lang, Translate, $ } from '../Const.js';

const DRAWER_TYPE_PERSISTENT = 0;

export class Drawer extends Component {
	
	constructor(data = {}) {
		super(data);

		this.toolbar_type = data.toolbar_type;
		this.toolbar_title = data.toolbar_title;
		this.inited = false;
		
		this.container = $("div", "add", this.id + "-container", this.stage);

		this.drawer_type = DRAWER_TYPE_PERSISTENT;

		if (data.drawer_type) {
			this.drawer_type = data.drawer_type;
		}

	}
	
	render() {
		this.drawer_content = this.getDrawerContent();
		this.container.innerHTML = this.getToolbar() + this.getDrawer();

		if (!this.inited) {
			this.inited = true;
			this.events();
		}

		if (this.toolbar_type == 0) {
			if (dyo.engine.mobileDevice) {
				if (dyo.engine.deviceType == "mobile" || dyo.engine.deviceType == "tablet") {
					if (window.matchMedia("(orientation: landscape)").matches) {
						this.drawer.open = true;
						dyo.engine.drawer.drawer.open = true;
					} else {
						this.drawer.open = false;
						dyo.engine.drawer.drawer.open = false;
					}
				}
			} else {
				if (dyo.engine.deviceType == "desktop") {
					dyo.engine.drawer.drawer.open = false;
				}
			}
		}
	}

	update(data) {
		if (data.title) {
			if ($('#' + this.id + '_title')) {
				$('#' + this.id + '_title', data.title);
			}
		}
		if ($('#' + this.id + '_description')) {
			$('#' + this.id + '_description', data.description);
		}
	}

	hideDrawer() {
		this.drawer.open = false;
	}

	events() {

		//console.log("@drawer events");

		let drawer, toolbar_type;

		switch (this.drawer_type) {
			case 0:
				this.drawer = new mdc.drawer.MDCPersistentDrawer($('.mdc-drawer--persistent'));

				let _mdc = document.getElementsByClassName("mdc-drawer--persistent");
	
				for (let nr = 0; nr < _mdc.length; nr ++) {
					_mdc[nr].setAttribute("data-keyboard", false);
				}

				drawer = this.drawer;
				toolbar_type = this.toolbar_type;

				$('#button_' + this.id).addEventListener('click', () => {

					switch (this.id) {
						default:

							if (toolbar_type == 0) {

								drawer.open = !drawer.open;

								if (dyo.engine.deviceType == "mobile" || dyo.engine.deviceType == "tablet") {
									if (window.matchMedia("(orientation: landscape)").matches) {
										if (dyo.engine.drawer.drawer.open == false) {
											dyo.engine.canvas.swipeArrow.hide();
										} 
									}
								}

							}

							if (toolbar_type == 1) {
								document.location.href = "#design-menu";
								dyo.engine.drawer.drawer.open = true;
							}

							if (toolbar_type == 2) {
								document.location.href = "#design-menu";
							}

							break;

						case "dyo_photos":

							if (dyo.currentSection == "Crop") {

								let dialog = dyo.engine.dialog;
								dialog.title = Translate(Lang.ARE_YOU_SURE_YOU_WANT_TO_GO_BACK);
								dialog.body = Translate(Lang.YOUR_PHOTO_WILL_NOT_BE_SAVED);
								dialog.accept = Translate(Lang.YES);
								dialog.decline = Translate(Lang.NO);
								dialog.action = dyo.engine.designMenu;
								dialog.render();
								dialog.show();

							} else {

								document.location.href = "#design-menu";

							}

							break;

					}

				});

				if (!dyo.drawerInited) {
					dyo.drawerInited = true;

					//console.log(this.drawer.open);
					//console.log(dyo.drawerInited);

					$('.mdc-drawer--persistent').addEventListener('MDCPersistentDrawer:open', function() {

						//console.log("@open");

						let canvas;

						switch (dyo.currentSection) {
							case "Account":
								canvas = $('.account');
								break;
							default:
								if (dyo.mode == "2d") {
									canvas = $('#canvas');
								}
								if (dyo.mode == "3d") {
									canvas = $('#openfl');
								}
								break;
						}

						if (canvas.classList.contains('canvasDrawerClose')) {
							canvas.classList.remove('canvasDrawerClose');
						}
						
						canvas.classList.add('canvasDrawerOpen');

					});

					$('.mdc-drawer--persistent').addEventListener('MDCPersistentDrawer:close', function() {

						//console.log("@close");

						let canvas;

						switch (dyo.currentSection) {
							case "Account":
								canvas = $('.account');

								break;
							default:
								if (dyo.mode == "2d") {
									canvas = $('#canvas');
								}
								if (dyo.mode == "3d") {
									canvas = $('#openfl');
								}
								break;
						}

						if (canvas) {
							if (canvas.classList.contains('canvasDrawerOpen')) {
								canvas.classList.remove('canvasDrawerOpen');
							}

							canvas.classList.add('canvasDrawerClose');
						}

					});

				}

				break;

			case 1:
	
				break;

			case 2:

				if (this.drawer_type == 2) {

					this.drawer = new mdc.drawer.MDCTemporaryDrawer($('.mdc-drawer'));
					this.drawer.disableClose = true;
					this.drawer.keyboard = false;
	
					drawer = this.drawer;
					toolbar_type = this.toolbar_type;

					/*
					$('.mdc-toolbar__menu-icon').addEventListener('click', () => { 
						console.log("@@@@");
						console.log(drawer.open);
						drawer.open = !drawer.open;
					});
	
					$('.mdc-drawer--temporary').addEventListener('MDCTemporaryDrawer:open', () => { console.log("open") });
					$('.mdc-drawer--temporary').addEventListener('MDCTemporaryDrawer:close', () => { console.log("close") });
					*/
				}

				break;
		}

	}

	getDesignInfo() {

		if (dyo.accountModule) {
			if (dyo.engine.deviceType != Lang.MOBILE) {

				return $("button", "id", 
				{ 
					css: this.css, 
					class: ["quick-enquiry", "quick-enquiry-top", "mdc-button", "mdc-button--raised"], 
					desc: Translate(Lang.QUICK_ENQUIRY),
					serialize: true
				}, this.container).replace('">', '" onclick=\'document.location.href = \"#quick-enquiry\"\'>');

			}
		} else {
			if (dyo.engine.deviceType != Lang.MOBILE) {

				return $("button", "id", 
				{ 
					css: this.css, 
					class: ["quick-enquiry", "quick-enquiry-top", "mdc-button", "mdc-button--raised"], 
					desc: "HeadstonesDesigner.com",
					serialize: true
				}, this.container).replace('">', '" onclick=\'document.location.href = \"https://headstonesdesigner.com/\"\'>');

			}

		}

	}

	getSection(id, title) {
		return `	
		<section id="button_${id}" class="mdc-toolbar__section mdc-toolbar__section--align-start">
			<button class="material-icons mdc-toolbar__menu-icon">menu</button>
			<h1 class="mdc-toolbar__title catalog-title" style="margin-top: 0px; margin-bottom: 0px">${title}</h1>
		</section>
		`
	}

	getSectionMenu(id, title, text) {
		return `	
		<section id="button_${id}" class="mdc-toolbar__section mdc-toolbar__section--align-start">
			<button class="material-icons mdc-toolbar__menu-icon">&#xE5C4;</button>
			<span id=${"back_to_menu_" + title} class="mdc-toolbar__title catalog-title back-to-design">${text}</span>
		</section>
		`
	}

	getHeader(action) {
		return `
		<header class="mdc-toolbar">
			<div class="mdc-toolbar__row">
			` + action + `
			</div>
		</header>
		`
	}

	getToolBarAction() {

		if (this.toolbar_type == 0) {

			let header = '';

			if (dyo.engine.deviceType == Lang.MOBILE) {
				header = this.getSection(this.id, this.toolbar_title);
			}

			if (header == "") {
				header = this.getSection(this.id, this.toolbar_title);
			}

			if (this.getDesignInfo() != undefined) {
				header += this.getDesignInfo();
			}

			return header;

		}

		if (this.toolbar_type == 1) {
			let r = this.getSectionMenu(this.id, this.title, Translate(Lang.BACK_TO_DESIGN_MENU));

			if (this.getDesignInfo() != undefined) {
				r += this.getDesignInfo();
			}

			return r;
		}

		if (this.toolbar_type == 2) {
			let r = this.getSectionMenu(this.id, this.title, Translate(Lang.BACK_TO_DESIGN_MENU));

			if (this.getDesignInfo() != undefined) {
				r += this.getDesignInfo();
			}

			return r;

		}

	}

	getToolbar() {

		let toolbar_action = this.getToolBarAction();

		if (this.drawer_type == 0) {
			return this.getHeader(this.getToolBarAction());
		}

		if (this.drawer_type == 1) {	
			return this.getHeader(this.getToolBarAction());
		}

		if (this.drawer_type == 2) {	
			return this.getHeader(this.getToolBarAction());
		}

	}

	getDrawer() {

		let skin = '';

		switch(dyo.template) {
			case 2:
				switch (this.id) {
					case "dyo_products":
						skin = ' skinAU_386047';
						break;
					case "dyo_shapes":
						skin = ' skinAU_f0e09d';
						break;
					case "dyo_materials_image":
						skin = ' skinAU_c19999';
						break;
					case "dyo_sizes":
						skin = ' skinAU_a58a6b';
						break;	
					case "dyo_borders":
						skin = ' skinAU_f4c3bd';
						break;	
					case "dyo_backgrounds":
						skin = ' skinAU_c19999';
						break;	
					case "dyo_materials":
						skin = ' skinAU_9899c2';
						break;
					case "dyo_inscriptions":
						skin = ' skinAU_e1bd81';
						break;
					case "dyo_photos":
						skin = ' skinAU_efece0';
						break;
					case "dyo_emblems":
						skin = ' skinAU_b9b58e';
						break;
					case "dyo_motifs":
						skin = ' skinAU_f4c3bd';
						break;
					case "dyo_fixing":
						skin = ' skinAU_aea097';
						break;
					case "dyo_corners":
						skin = ' skinAU_aea097';
						break;	
					case "dyo_holes":
						skin = ' skinAU_e6daca';
						break;		
					case "dyo_account":
						skin = ' skinAU_9899c2';
						break;
					case "dyo_installations":
						skin = ' skinAU_e6daca';
						break;
				}
				break;
		}

		let section_name = '';

		if (this.title) {

			let t;

			switch (this.title) {
				default:
					t = Translate(Lang[this.title.toUpperCase()]) + ' ' + '<i class="material-icons">help_outline</i>';
					section_name = `
					<div class="mdc-layout-grid${skin}" style="padding:0px 0px 0px 15px;">
						<div class="mdc-layout-grid__cell">
							<h3 id='${this.id}_title' class="mdc-typography--headline" style="cursor:pointer;">${t}</h3>
						</div>
					</div>
					`
					break;
				case "products": case "settings": case "my_account":
				case "backgrounds": case "select_installations":
					t = Translate(Lang[this.title.toUpperCase()]);
					section_name = `
					<div class="mdc-layout-grid${skin}" style="padding:0px 0px 0px 15px;">
						<div class="mdc-layout-grid__cell">
							<h3 id='${this.id}_title' class="mdc-typography--headline">${t}</h3>
						</div>
					</div>
					`
					break;
			}

		}

		if (this.title && this.description) {
			section_name = `
			<div class="mdc-layout-grid" style="padding:0px 0px 0px 15px;">
				<div class="mdc-layout-grid__cell">
					<h3 id='${this.id}_title' class="mdc-typography--headline" style="margin:15px 0px 5px 0px;">${Translate(this.title)}</h2>
					<span id='${this.id}_description' class="mdc-typography--description">${this.description}</span>
				</div>
			</div>
			`
		}

		switch (dyo.template) {

			case 1:

				if (this.drawer_type == 0) {	
					return `
					<aside class="mdc-drawer mdc-drawer--persistent mdc-drawer--open">
						<div class="mdc-drawer__drawer">
							<div class="mdc-list-group">
								<nav id="${this.id}-mdc-list" class="mdc-list">
									${section_name}
									${this.drawer_content}
								</nav>
							</div>
						</div>
					</aside>
					`
				}

				break;

			case 2:

				if (this.drawer_type == 0) {	

					let bc = '';
					
					if (this.id == "dyo_menu") {
						bc = 'style="background-color: #cfe8fc !important"';
					}

					return `
					<aside class="mdc-drawer mdc-drawer--persistent mdc-drawer--open">
						<div class="mdc-drawer__drawer">
							<div class="mdc-list-group">
								<nav id="${this.id}-mdc-list" class="mdc-list" ${bc}>
									${section_name}
									${this.drawer_content}
								</nav>
							</div>
						</div>
					</aside>
					`
				}

				break;

			}

	}

	getItem(id1, class1, class2, icon, id2, text, link) {

		let title = "";
		let href = "";

		if (text) {
			title = 'title="' + text.replace('</span>&nbsp;<i class="material-icons priority_high">priority_high</i><span>', '') + '"';
		}

		if (link) {
			href = 'href="' + link + '" ';
		}

		return `<a id="${id1}" class="${class1}" ${href} ${title}">
					<i class="${class2}" aria-hidden="true">${icon}</i><span id="${id2}">${text}</span>
				</a>`;
	}

	getKnob(id1, id2, id3, text, class1, link) {

		let title = "";
		let href = "";

		if (text) {
			title = 'title="' + text.replace('</span>&nbsp;<i class="material-icons priority_high">priority_high</i><span>', '') + '"';
		}

		if (link) {
			href = 'href="' + link + '" ';
		}		
		return `<a id="${id1}" class="mdc-list-item noselect ${class1}" ${href} ${title}>
					<div class="mdc-switch" style="margin-right: 20px; pointer-events: none;">
					<input type="checkbox" id="${id2}" class="mdc-switch__native-control"/>
					<div class="mdc-switch__background">
						<div class="mdc-switch__knob"></div>
					</div>
					</div>
					<label for="${id2}" class="noselect" style="pointer-events: none;"><span id="${id3}">${text}</span></label>
				</a>`;
	}

	getRadio(id1, id2, id3, text, class1, link) {

		
		let title = "";
		let href = "";

		if (text) {
			title = 'title="' + text.replace('</span>&nbsp;<i class="material-icons priority_high">priority_high</i><span>', '') + '"';
		}

		if (link) {
			href = 'href="' + link + '" ';
		}		

		return `<a id="${id1}" class="mdc-list-item noselect" ${href} ${title}>
					<div class="mdc-radio" style="margin-right: 20px; ">
						<input class="mdc-radio__native-control" type="radio" id="${id2}" name="radios" checked>
						<div class="mdc-radio__background">
							<div class="mdc-radio__outer-circle"></div>
							<div class="mdc-radio__inner-circle"></div>
						</div>
					</div>
					<label for="radio-2" class="noselect" style="pointer-events: none;"><span id="${id3}">${text}</span></label>
				</a>`;
	}


	getDrawerContent() {

		let menu = '';
		let mode = 'top';
		let c1 = "mdc-list-item noselect";
		let c2 = "material-icons mdc-list-item__graphic";

        if (window.self !== window.top) {
            mode = 'iframe';
		} 

		if (this.toolbar_type == 0) {

			switch (dyo.template) {

				case 1:

					menu = this.getItem("dyo_home_page", c1, c2, "home", "dyo_home_page_text", Translate(Lang.HOME), "");
		
					//if (dyo.usa == false) {

						if (dyo.mode == "2d") {
							menu += `
							<a id="dyo_switch_mode" class="mdc-list-item noselect">
								<img alt="${Translate(Lang.SWITCH_MODE)}" id="switch_mode_img" src="data/svg/misc/switch3d.svg" width="25px" height="25px" style="margin-right:32px" /><span id="switchMode">${Translate(Lang.SWITCH_MODE)}</span>
							</a>
							`
						} else {
							menu += `
							<a id="dyo_switch_mode" class="mdc-list-item noselect">
								<img alt="${Translate(Lang.SWITCH_MODE)}" id="switch_mode_img" src="data/svg/misc/switch2d.svg" width="25px" height="25px" style="margin-right:32px" /><span id="switchMode">${Translate(Lang.SWITCH_MODE)}</span>
							</a>
							`
						}

						menu += this.getItem("dyo_select_product", c1, c2, "explore", "selectProduct", Translate(Lang.SELECT_PRODUCT), "#select-product");

					//}
		
					menu += this.getItem("dyo_new_design", c1, c2, "add", "dyo_new_design_text", Translate(Lang.NEW_DESIGN), "#new-design");
					menu += this.getItem("dyo_select_material_image", c1, c2, "grain", "dyo_select_material_image_text", Translate(Lang.SELECT) + " " + Translate(Lang.GRANITE), "#select-material");
					menu += this.getItem("dyo_select_shape", c1, c2, "auto_awesome_motion", "dyo_select_shape_text", Translate(Lang.SELECT_SHAPE), "#select-shape");
					menu += this.getItem("dyo_select_installations", c1, c2, "construction", "dyo_select_installations_text", Translate(Lang.SELECT_INSTALLATION), "#select-installations");
					menu += this.getItem("dyo_select_corners", c1, c2, "rounded_corner", "dyo_select_corners_text", Translate(Lang.CORNERS), "#select-corners");
					menu += this.getItem("dyo_select_holes", c1, c2, "radio_button_unchecked", "dyo_select_holes_text", Translate(Lang.HOLES), "#select-holes");
					menu += this.getItem("dyo_select_size", c1, c2, "aspect_ratio", "dyo_select_size_text", Translate(Lang.SELECT_SIZE), "#select-size");
					menu += this.getItem("dyo_select_stand", c1, c2, "personal_video", "dyo_select_stand_text", Translate(Lang.HOLES), "#select-stand");
					menu += this.getKnob("dyo_add_headstone_base", "base-switch", "dyo_add_headstone_base_text", Translate(Lang.HEADSTONE_BASE), "#headstone-base");
					menu += this.getKnob("dyo_link_headstone_base", "base-link-switch", "dyo_link_headstone_base_text", Translate(Lang.LINK_BASE), "#headstone-base-link");
					menu += this.getKnob("dyo_add_headstone_base_flower_pot_holes", "base-flower-pot-holes-switch", "dyo_add_headstone_base_flower_pot_holes_text", Translate(Lang.FLOWER_POT_HOLES), "#flower-pot-holes");
					
					menu += `<div id="base_flower_pots">`;
						
					menu += this.getRadio("dyo_add_headstone_base_flower_pots2", "radio-2", "dyo_add_headstone_base_flower_pots2_text", Translate(Lang.BLACK_LID), "", "#black-lid");
					menu += this.getRadio("dyo_add_headstone_base_flower_pots3", "radio-3", "dyo_add_headstone_base_flower_pots3_text", Translate(Lang.SILVER_LID), "", "#silver-lid");
					menu += this.getRadio("dyo_add_headstone_base_flower_pots4", "radio-4", "dyo_add_headstone_base_flower_pots4_text", Translate(Lang.GOLD_LID), "", "#gold-lid");
		
					menu += `</div>`;
		
					if (dyo.mode == "3d") {
						menu += `
						<a id="dyo_full_monument" class="mdc-list-item noselect">
							<div class="mdc-switch" style="margin-right: 20px; pointer-events: none;">
							<input type="checkbox" id="full_monument-switch" class="mdc-switch__native-control"/>
							<div class="mdc-switch__background">
								<div class="mdc-switch__knob"></div>
							</div>
							</div>
							<label for="full_monument-switch" class="noselect" style="pointer-events: none;"><span id="dyo_full_monument_text">${Translate(Lang.FULL_MONUMENT)}</span></label>
						</a>
						`
					}

					menu += this.getItem("dyo_select_border", c1, c2, "border_outer", "dyo_select_border_text", Translate(Lang.SELECT_BORDER), "#select-border");
					menu += this.getItem("dyo_select_material", c1, c2, "grain", "dyo_select_material_text", Translate(Lang.BACKGROUND_COLOUR), "#select-material");
					menu += this.getItem("dyo_inscriptions", c1, c2, "format_shapes", "dyo_inscriptions_text", Translate(Lang.INSCRIPTIONS), "#add-your-inscription");
					menu += this.getItem("dyo_photos", c1, c2, "photo_camera", "dyo_photos_text", Translate(Lang.PHOTO), "#add-your-photo");
					menu += this.getItem("dyo_emblems", c1, c2, "filter_vintage", "dyo_emblems_text", Translate(Lang.EMBLEMS), "#add-your-emblem");
					menu += this.getItem("dyo_motifs", c1, c2, "emoji_nature", "dyo_motifs_text", Translate(Lang.MOTIFS), "#add-your-motif");
					menu += this.getItem("dyo_select_fixing_system", c1, c2, "construction", "fixingType", Translate(Lang.FIXING_SYSTEM) + '</span>&nbsp;<i class="material-icons priority_high">priority_high</i><span>', "#select-fixing-system");
					menu += this.getItem("dyo_check_price", c1, c2, "attach_money", "dyo_check_price_text", Translate(Lang.CHECK_PRICE), "#check-price");
					if (dyo.accountModule) {
						menu += this.getItem("dyo_my_account", c1, c2, "account_box", "dyo_my_account_text", Translate(Lang.MY_ACCOUNT), "#my-account");
						menu += this.getItem("dyo_save_design", c1, c2, "cloud_upload", "dyo_save_design_text", Translate(Lang.SAVE_DESIGN), "#save-design");
					}
					menu += this.getItem("dyo_contact_us", c1, c2, "mail_outline", "dyo_contact_us_text", Translate(Lang.CONTACT_US), "#contact-us");

					if (dyo.accountModule) {
						if (dyo.engine.deviceType == Lang.MOBILE) {
							menu += this.getItem("quick-enquiry", c1, c2, "drafts", "dyo_quick", Translate(Lang.QUICK_ENQUIRY), "#quick-enquiry");
						}
					}
					
					break;
			
				case 2:

					menu = this.getItem("dyo_home_page", c1 + " skinAU_cca96c", c2 + " skinAU_cca96c", "home", "dyo_home_page_text", Translate(Lang.HOME), "");

					if (dyo.sub_mode != "traditional") {
						if (mode == 'top') {
							menu += this.getItem("dyo_select_product", c1 + " skinAU_386047", c2 + " skinAU_386047", "explore", "selectProduct", Translate(Lang.SELECT_PRODUCT), "#select-product");
						}
					}

					menu += this.getItem("dyo_new_design", c1 + " skinAU_a8d0b5", c2 + " skinAU_a8d0b5", "add", "dyo_new_design_text", Translate(Lang.NEW_DESIGN), "#new-design");
					menu += this.getItem("dyo_select_material_image", c1 + " skinAU_c19999", c2 + " skinAU_c19999", "grain", "dyo_select_material_image_text", Translate(Lang.SELECT) + " " + Translate(Lang.GRANITE), "");
					menu += this.getItem("dyo_select_shape", c1 + " skinAU_f0e09d", c2 + " skinAU_f0e09d", "auto_awesome_motion", "dyo_select_shape_text", Translate(Lang.SELECT_SHAPE), "#select-shape");
					menu += this.getItem("dyo_select_installations", c1 + " skinAU_e6daca", c2 + " skinAU_e6daca", "construction", "dyo_select_installations_text", Translate(Lang.SELECT_INSTALLATION), "#select-installations");
					menu += this.getItem("dyo_select_corners", c1 + " skinAU_aea097", c2 + " skinAU_aea097", "rounded_corner", "dyo_select_corners_text", Translate(Lang.CORNERS), "#select-corners");
					menu += this.getItem("dyo_select_holes", c1 + " skinAU_e6daca", c2 + " skinAU_e6daca", "radio_button_unchecked", "dyo_select_holes_text", Translate(Lang.HOLES), "#select-holes");
					menu += this.getItem("dyo_select_size", c1 + " skinAU_a58a6b", c2 + " skinAU_a58a6b", "aspect_ratio", "dyo_select_size_text", Translate(Lang.SELECT_SIZE), "#select-size");
					menu += this.getItem("dyo_select_stand", c1 + " skinAU_e6daca", c2 + " skinAU_e6daca", "personal_video", "dyo_select_stand_text", Translate(Lang.STAND), "#select-stand");
					menu += this.getKnob("dyo_add_headstone_base", "base-switch", "dyo_add_headstone_base_text", Translate(Lang.HEADSTONE_BASE), "skinAU_e6daca", "#headstone-base");
					menu += this.getKnob("dyo_link_headstone_base", "base-link-switch", "dyo_link_headstone_base_text", Translate(Lang.LINK_BASE), "skinAU_e6daca", "#headstone-base-link");
					menu += this.getKnob("dyo_add_headstone_base_flower_pot_holes", "base-flower-pot-holes-switch", "dyo_add_headstone_base_flower_pot_holes_text", Translate(Lang.FLOWER_POT_HOLES), "skinAU_e6daca", "#flower-pot-holes");

					menu += `<div id="base_flower_pots">`;
						
					menu += this.getRadio("dyo_add_headstone_base_flower_pots2", "radio-2", "dyo_add_headstone_base_flower_pots2_text", Translate(Lang.BLACK_LID), "", "#black-lid");
					menu += this.getRadio("dyo_add_headstone_base_flower_pots3", "radio-3", "dyo_add_headstone_base_flower_pots3_text", Translate(Lang.SILVER_LID), "", "#silver-lid");
					menu += this.getRadio("dyo_add_headstone_base_flower_pots4", "radio-4", "dyo_add_headstone_base_flower_pots4_text", Translate(Lang.GOLD_LID), "", "#gold-lid");
		
					menu += `</div>`;
	
					if (dyo.mode == "3d") {
						menu += `
						<a id="dyo_full_monument" class="mdc-list-item noselect skinAU_e6daca" href="#switch-mode" title="Switch mode">
							<div class="mdc-switch" style="margin-right: 20px; pointer-events: none;">
							<input type="checkbox" id="full_monument-switch" class="mdc-switch__native-control"/>
							<div class="mdc-switch__background">
								<div class="mdc-switch__knob"></div>
							</div>
							</div>
							<label for="full_monument-switch" class="noselect" style="pointer-events: none;"><span id="dyo_full_monument_text">${Translate(Lang.FULL_MONUMENT)}</span></label>
						</a>
						`
					}

					menu += this.getItem("dyo_select_border", c1 + " skinAU_f4c3bd", c2 + " skinAU_f4c3bd", "border_outer", "dyo_select_border_text", Translate(Lang.SELECT_BORDER), "#select-border");
					menu += this.getItem("dyo_select_material", c1 + " skinAU_9899c2", c2 + " skinAU_9899c2", "texture", "dyo_select_material_text", Translate(Lang.BACKGROUND_COLOUR), "");
					menu += this.getItem("dyo_inscriptions", c1 + " skinAU_e1bd81", c2 + " skinAU_e1bd81", "format_shapes", "dyo_inscriptions_text", Translate(Lang.INSCRIPTIONS), "#add-your-inscription");
					menu += this.getItem("dyo_photos", c1 + " skinAU_efece0", c2 + " skinAU_efece0", "photo_camera", "dyo_photos_text", Translate(Lang.PHOTO), "#add-your-photo");
					menu += this.getItem("dyo_emblems", c1 + " skinAU_b9b58e", c2 + " skinAU_b9b58e", "filter_vintage", "dyo_emblems_text", Translate(Lang.EMBLEMS), "#add-your-emblem");
					menu += this.getItem("dyo_motifs", c1 + " skinAU_f4c3bd", c2 + " skinAU_f4c3bd", "emoji_nature", "dyo_motifs_text", Translate(Lang.MOTIFS), "#add-your-motif");
					menu += this.getItem("dyo_select_fixing_system", c1 + " skinAU_aea097", c2 + " skinAU_aea097", "construction", "fixingType", Translate(Lang.FIXING_SYSTEM) + '</span>&nbsp;<i class="material-icons priority_high">priority_high</i><span>', "#select-fixing-system");
					if (mode == 'top' && dyo.country == "au" && dyo.pet == false) {
						menu += `
						<a id="dyo_promo_code" class="mdc-list-item noselect skinAU_cfe8fc" href="#promo-code" title="Promo Code">
							<img alt="Promo Code" id="switch_mode_img" src="data/svg/misc/promo-code.svg" width="25px" height="25px" style="margin-right:32px" /><span id="promoCode" style="line-height: 14px;">Promo Code</span>
						</a>
						`
					}
					if (dyo.sub_mode != "traditional") {
						menu += this.getItem("dyo_check_price", c1 + " skinAU_a8d0b5", c2 + " skinAU_a8d0b5", "attach_money", "dyo_check_price_text", Translate(Lang.CHECK_PRICE), "#check-price");
					}					
					if (dyo.accountModule) {
						menu += this.getItem("dyo_my_account", c1 + " skinAU_9899c2", c2 + " skinAU_9899c2", "account_box", "dyo_my_account_text", Translate(Lang.MY_ACCOUNT), "#my-account");
						menu += this.getItem("dyo_save_design", c1 + " skinAU_e6daca", c2 + " skinAU_e6daca", "cloud_upload", "dyo_save_design_text", Translate(Lang.SAVE_DESIGN), "#save-design");
					}
					menu += this.getItem("dyo_contact_us", c1 + " skinAU_e6837c", c2 + " skinAU_e6837c", "mail_outline", "dyo_contact_us_text", Translate(Lang.CONTACT_US), "#contact-us");

					if (dyo.accountModule) {
						if (dyo.engine.deviceType == Lang.MOBILE) {
							menu += this.getItem("quick-enquiry", c1 + " skinAU_ffffff", c2 + " skinAU_ffffff", "drafts", "dyo_quick", Translate(Lang.QUICK_ENQUIRY), "#quick-enquiry");
						}
					}

					if (mode == 'top' && dyo.usa != true && dyo.pet == false) {
						if (dyo.mode == "2d") {
							menu += `
							<a id="dyo_switch_mode" class="mdc-list-item noselect skinAU_cfe8fc" href="#switch-mode" title="Switch mode">
								<img alt="${Translate(Lang.SWITCH_MODE)}" id="switch_mode_img" src="data/svg/misc/switch3d.svg" width="25px" height="25px" style="margin-right:32px" /><span id="switchMode" style="line-height: 14px;">3D ${Translate(Lang.COMING_SOON)}</span>
							</a>
							`
						} else {
							if (dyo.sub_mode != "traditional") {
								menu += `
								<a id="dyo_switch_mode" class="mdc-list-item noselect skinAU_cfe8fc" href="#switch-mode" title="Switch mode">
									<img alt="${Translate(Lang.SWITCH_MODE)}" id="switch_mode_img" src="data/svg/misc/switch2d.svg" width="25px" height="25px" style="margin-right:32px" /><span id="switchMode">${Translate(Lang.SWITCH_MODE)}</span>
								</a>
								`
							}
						}
					}

					if (dyo.pet == false) {
						if (dyo.local || dyo.monument.id == 999) {
							//menu += this.getItem("perform-testing", c1 + " skinAU_ffffff", c2 + " skinAU_ffffff", "check_circle", "dyo_test", Translate(Lang.PERFORM_TESTING), "#perform-testing");
							menu += this.getItem("generate-design", c1 + " skinAU_ffffff", c2 + " skinAU_ffffff", "check_circle", "dyo_test", Translate(Lang.GENERATE_DESIGN), "#generate-design");
						}
					}

					break;
				}
				
			return menu;

		}

		if (this.toolbar_type == 1) {
			return ``
		}

		if (this.toolbar_type == 2) {
			return 	`

			<div id="dyo_account_avatar_parent">
				<div id="dyo_account_avatar"></div>
			</div>

			<p id="dyo_greetings" class="mdc-typography" style="margin-left: 15px;"></p>

			<a id="dyo_account_new_design" class="mdc-list-item noselect">
				<i class="material-icons mdc-list-item__graphic" aria-hidden="true">add</i>${Translate(Lang.NEW_DESIGN)}
			</a>

			<a id="dyo_saved_designs" class="mdc-list-item noselect">
				<i class="material-icons mdc-list-item__graphic" aria-hidden="true">save</i>${Translate(Lang.SAVED_DESIGNS)}
			</a>

			<a id="dyo_your_orders" class="mdc-list-item noselect">
				<i class="material-icons mdc-list-item__graphic" aria-hidden="true">shopping_cart</i>${Translate(Lang.YOUR_ORDERS)}
			</a>

			<a id="dyo_account_details" class="mdc-list-item noselect">
				<i class="material-icons mdc-list-item__graphic" aria-hidden="true">edit</i>${Translate(Lang.ACCOUNT_DETAILS)}
			</a>
			<a id="dyo_invoice_details" class="mdc-list-item noselect">
				<i class="material-icons mdc-list-item__graphic" aria-hidden="true">credit_card</i>${Translate(Lang.INVOICE_DETAILS)}
			</a>
			<a id="dyo_privacy_policy" class="mdc-list-item noselect">
				<i class="material-icons mdc-list-item__graphic" aria-hidden="true">security</i>${Translate(Lang.PRIVACY_POLICY)}
			</a>
			`

		}

	}
	
}