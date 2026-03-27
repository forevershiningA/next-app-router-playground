import { Button } from '../material/MaterialDesign.js';
import { Lang, Translate, $ } from '../Const.js';
import { Component } from '../material/Component.js';

export class Canvas extends Component {

	constructor(data = {}) {
		super(data);

		this.touchTimer = 0;
		this.prevDiff = 1;

		this.cachedCanvas = [];

		this.container = $("div", "add", ["container", "canvasParent"], this.stage);
		this.top_container = $("div", "id", { id: "top-container", class: "top-container" }, this.stage);
		this.bottom_container = $("div", "id", { id: "bottom-container", class: "bottom-container" }, this.stage);
		this.crop_container = $("div", "id", { id: "crop-container", class: "crop-container" }, this.stage);
		this.openfl = $("div", "id", { id: "openfl" }, this.stage);
		this.common_container = $("div", "add", "common-container", this.bottom_container);
		
		this.measureTextInited = false;
		this.inited = false;

    }

    show() {
		this.container.style.display = "block";
	}
	
	addMeasureTextFix() {

		if (!this.measureTextInited) {

			this.measureTextInited = true;

			this.calc_canvas = document.createElement('canvas');
			this.calc_context = this.calc_canvas.getContext('2d', { willReadFrequently: true });
			this.calc_context.textAlign = 'center';
			this.calc_context.textBaseline = 'middle';

			this.measureText = CanvasRenderingContext2D.prototype.measureText.bind(this.calc_context);

		}

	}

	render() {

		this.canvas = document.createElement('canvas');
		this.canvas.oncontextmenu = (e) => {
			e.preventDefault();
		};

		this.canvas.id = "canvas";

		if (dyo.monument_design_stampid != undefined) {
			dyo.engine.canvas.hide();
		}

		this.container.appendChild(this.canvas);

		if (!this.webgl_support) {
			this.stage = new createjs.Stage(document.getElementById("canvas"));
		} else {
			this.stage = new createjs.StageGL(document.getElementById("canvas"));
		}

		if (dyo.mode == "2d") {

			this.stage.on("stagemouseup", function(e) {
				createjs.Ticker.timingMode = null;
			});

			this.stage.on("stagemousedown", function(e) {
				if (dyo.currentSection != "Crop" && 
					dyo.currentSection != "Sizes" &&
					dyo.currentSection != "Shapes") {
						document.location.href = "#design-menu";
						dyo.last_url = "design-menu";
						if (dyo.monument) {
							dyo.monument.deselectAll("Canvas:80");
							dyo.monument.updateHeader();
						}
				}
			})

		}

		createjs.Touch.enable(this.stage, false, true);
		this.stage.setClearColor("#cfe8fc");

		if (dyo.mode == "3d") {
			$("#canvas").style.display = "none";
		}

		this.addTicker();
		this.events();
		this.addMeasureTextFix();

		let self = this;

	}

	addComponents() {

		let self = this;
		
		this.buttonCropImage = new Button({
			stage: this.crop_container,
			id: "dyo_button_crop_image",
			type: 3,
			icon: 'crop_free',
			title: Lang.CROP_IMAGE
			
		});       
		this.buttonCropImage.render();
		this.buttonCropImage.hide();
		
		$("#dyo_button_crop_image").addEventListener("click", () => {
			dyo.engine.photos.photoSection();
			$("#dyo_button_crop_image").blur();
		}, {passive: true});

		//console.log("@addComponents");
		if (dyo.engine.deviceType != "mobile" || window.matchMedia("(orientation: landscape)").matches) {
			this.hideContainer(this.crop_container);
		}

		if (dyo.engine.swipeArrow != true) {
			dyo.engine.swipeArrow = true;

			this.swipeArrow = new Button({
				stage: this.top_container,
				id: "dyo_button_swipeArrow",
				type: 8,
				css: "font-size: 2.5em;vertical-align: middle;background-color:#cfe8fc;z-index:1 !important",
				icon: 'compare_arrows',
				title: Lang.SWITCH
			});       
			this.swipeArrow.render();
			this.swipeArrow.hide();

			$("#dyo_button_swipeArrow").addEventListener("click", (event) => {
				var targetElement = event.target || event.srcElement;

				if (targetElement.id == "dyo_button_swipeArrow_icon_wide" && dyo.currentSection == "Crop") {
					let dialog = dyo.engine.dialog;
					dialog.title = Translate(Lang.ARE_YOU_SURE_YOU_WANT_TO_GO_BACK);
					dialog.body = Translate(Lang.YOUR_PHOTO_WILL_NOT_BE_SAVED);
					dialog.accept = Translate(Lang.YES);
					dialog.decline = Translate(Lang.NO);
					dialog.action = dyo.engine.designMenu;
					dialog.render();
					dialog.show();
				} else {
					if (targetElement.id == "dyo_button_swipeArrow_icon_wide") {
						if (document.location.href.indexOf("#design-menu") == -1) {
							document.location.href = "#design-menu";
							dyo.engine.designMenu();
							if (dyo.engine.drawer.drawer.open == false) {
								$("#button_dyo_menu").click();
							}
							return;
						}
					}
			
					$("#button_dyo_menu").click();
					if (dyo.engine.drawer.drawer.open == true) {
						this.hideContainer(this.common_container);
					} else {
						if (dyo.currentSection != "Crop") {
							if (dyo.selected) {
								this.showContainer(this.common_container);
							}
						}
					}

					if (dyo.engine.mobileDevice) {
						if (dyo.currentSection == "Crop") {
							if (dyo.engine.drawer.drawer.open == true) {
								self.hideContainer(self.crop_container);
							} else {
								self.showContainer(self.crop_container);
							}
						}
					}
					$("#dyo_button_swipeArrow").blur();
				}

				if (dyo.selected) {
					dyo.engine.canvas.showButtons();
				}

			}, {passive: true});

		}

		this.buttonFlipX = new Button({
			stage: this.common_container,
			id: "dyo_button_flipx",
			type: 6,
			icon: 'border_vertical',
			title: Lang.FLIP_X
		});       
		this.buttonFlipX.render();

		$("#dyo_button_flipx").addEventListener("click", () => {
			if (dyo.selected) {
				dyo.selected.flipX();
				$("#dyo_button_flipx").blur();
			}
		}, {passive: true});

		this.buttonFlipY = new Button({
			stage: this.common_container,
			id: "dyo_button_flipy",
			type: 6,
			icon: 'border_horizontal',
			title: Lang.FLIP_Y
			});       
		this.buttonFlipY.render();

		$("#dyo_button_flipy").addEventListener("click", () => {
			if (dyo.selected) {
				dyo.selected.flipY();
				$("#dyo_button_flipy").blur();
			}
		}, {passive: true});

		this.buttonEdit = new Button({
			stage: this.common_container,
			id: "dyo_button_edit",
			type: 6,
			icon: 'create',
			title: Lang.EDIT
		});       
		this.buttonEdit.render();

		$("#dyo_button_edit").addEventListener("click", () => {
			if (dyo.selected) {
				dyo.engine.drawer.drawer.open = true;
				dyo.engine.canvas.hideButtons();
				dyo.selected.select();

				$("#dyo_button_edit").blur();
			}
		}, {passive: true});

		this.buttonDuplicate = new Button({
			stage: this.common_container,
			id: "dyo_button_duplicate",
			type: 6,
			icon: 'add_to_photos',
			title: Lang.DUPLICATE
		});       
		this.buttonDuplicate.render();

		$("#dyo_button_duplicate").addEventListener("click", () => {
			if (dyo.selected) {
				dyo.selected.duplicate();
				$("#dyo_button_duplicate").blur();
			}
		}, {passive: true});

		this.buttonDelete = new Button({
			stage: this.common_container,
			id: "dyo_common_button_delete",
			type: 6,
			icon: 'delete',
			title: Lang.DELETE
		});       
		this.buttonDelete.render();

		$("#dyo_common_button_delete").addEventListener("click", () => {
			if (dyo.selected) {
				dyo.selected.delete();
				$("#dyo_common_button_delete").blur();
				dyo.engine.designMenu();
			}
		}, {passive: true});

		this.buttonIncrease = new Button({
			stage: this.common_container,
			id: "dyo_button_increase",
			type: 6,
			icon: 'add',
			title: Lang.HOLD_INCREASE
		});       
		this.buttonIncrease.render();

		//console.log(Translate(Lang.HOLD_INCREASE));

		$("#dyo_button_increase").addEventListener("touchstart", () => {
			if (dyo.selected) {
				dyo.engine.increaseId = setInterval(() => {
					dyo.selected.increase();
				}, 20);
			}
		}, {passive: true});

		$("#dyo_button_increase").addEventListener("touchend", () => {
			clearInterval(dyo.engine.increaseId);
			$("#dyo_button_increase").blur();
		}, {passive: true});

		this.buttonDecrease = new Button({
			stage: this.common_container,
			id: "dyo_button_decrease",
			type: 6,
			icon: 'remove',
			title: Lang.HOLD_DECREASE
		});       
		this.buttonDecrease.render();

		$("#dyo_button_decrease").addEventListener("touchstart", () => {
			if (dyo.selected) {
				dyo.engine.decreaseId = setInterval(() => {
					dyo.selected.decrease();
				}, 20);
			}
		}, {passive: true});

		$("#dyo_button_decrease").addEventListener("touchend", () => {
			clearInterval(dyo.engine.decreaseId);
			$("#dyo_button_decrease").blur();
		}, {passive: true});

		this.hideButtons();

		if (dyo.mode == "3d") {
			$("#openfl").style.visibility = "visible";
			$("#canvas").style.visibility = "hidden";
		}
	}

	showButtons() {
		if (dyo.engine.deviceType == "mobile") {
			if (dyo.engine.drawer.drawer.open == false) {
				this.showContainer(this.common_container);

				if (dyo.selected) {
					if (dyo.selected.type != "Inscription") {
						dyo.engine.canvas.buttonFlipX.show();
						dyo.engine.canvas.buttonFlipY.show();
						dyo.engine.canvas.buttonIncrease.hide();
						dyo.engine.canvas.buttonDecrease.hide();
					} else {
						dyo.engine.canvas.buttonFlipX.hide();
						dyo.engine.canvas.buttonFlipY.hide();
						dyo.engine.canvas.buttonIncrease.show();
						dyo.engine.canvas.buttonDecrease.show();
					}
				}

			}
		}
	}

	hideButtons() {
		this.hideContainer(this.common_container);
	}

	isTickerOn() {
		return this.ticker;
	}

	removeTicker() {
		this.ticker = false;
		createjs.Ticker.removeEventListener("tick", this.stage);
		this.stage.enableMouseOver(0);
	}

	addTicker() {
		this.ticker = true;
		createjs.Ticker.addEventListener("tick", this.stage, {passive: true});

		if (dyo.engine.mobileDevice) {
			this.stage.enableMouseOver(30);
		} else {
			this.stage.enableMouseOver(30);
		}
	}

	getParam(name, value) {
		let param = document.createElement('param');
		param.setAttribute("name", name);
		param.setAttribute("value", value);

		return param;
	}

	getMainStage() {
		return this.stage;
	}
	
	getStage() {
		if (this.stage_container) {
			this.stage.removeChild(this.stage_container);
		}

		this.stage_container = new createjs.Container();

		let use_h;
		
		use_h = window.innerHeight - dyo.th;
		
		this.stage_container.x = (dyo.dpr * dyo.w) / 2;
		this.stage_container.y = (dyo.dpr * use_h) / 2;

		this.stage.addChild(this.stage_container);

		this.stage.alpha = 1;
		
		return this.stage_container;
	}


	setSize(from) {

		if (from) {
			//console.log("@setSize: " + from);
		}

		let th = 64;

		if ($(".mdc-toolbar")) {
			th = $(".mdc-toolbar").getBoundingClientRect().height;

			let mdc = document.getElementsByClassName("mdc-toolbar");
			let mdc_nr = 0;

			for (let nr = 0; nr < mdc.length; nr ++) {
				if (mdc[nr].getBoundingClientRect().height > 0) {
					th = mdc[nr].getBoundingClientRect().height;
				}
			}
			
			dyo.th = th;
			
			if (th == 0) {
				return;
			}

			document.documentElement.style.setProperty('--th', `${th}px`);
		} 

		let headerWidth = 0;
		let headerHeight = 64;

		dyo.engine.checkDevice();

		if (window.matchMedia("(orientation: portrait)").matches) {
			headerWidth = 0;
			headerHeight = th;
			dyo.w = window.innerWidth - headerWidth;
			dyo.h = window.innerHeight - headerHeight;	
		}
		if (window.matchMedia("(orientation: landscape)").matches) {
			if (dyo.engine.deviceType == "mobile") {
				headerWidth = 240;
				headerHeight = th;
				dyo.w = window.innerHeight;
				dyo.h = window.innerWidth;
			} else {
				headerWidth = 240;
				headerHeight = th;	
				dyo.w = window.innerWidth - headerWidth;
				dyo.h = window.innerHeight - headerHeight;	
			}
		}

		let use_h;
		
		use_h = window.innerHeight - dyo.th;

		if (this.stage_container) {
			this.stage_container.x = (dyo.dpr * dyo.w) / 2;
			this.stage_container.y = (dyo.dpr * use_h) / 2;
		}

		if (dyo.monument) {
			dyo.monument.container.x = dyo.w / 2;
		}

		if (dyo.engine.canvas) {
			let canvas = dyo.engine.canvas.canvas;
			canvas.width = dyo.w * dyo.dpr;
			canvas.height = dyo.h * dyo.dpr;
			canvas.style.width = dyo.w + "px";
			canvas.style.height = dyo.h + "px";

			if (dyo.mode == "3d") {
				let canvas3d = dyo.engine.canvas.openfl;
				canvas3d.width = dyo.w * dyo.dpr;
				canvas3d.height = dyo.h * dyo.dpr;
				canvas3d.style.width = dyo.w + "px";
				canvas3d.style.height = dyo.h + "px";	
			}

		}

		if (dyo.monument) {
			if (dyo.monument.headstone) {
				dyo.monument.headstone.cacheMinX = -(dyo.w * dyo.dpr) / 2;
				dyo.monument.headstone.cacheMinY = -(dyo.h * dyo.dpr) / 2;
				dyo.monument.headstone.cacheMaxX = (dyo.w * dyo.dpr);
				dyo.monument.headstone.cacheMaxY = (dyo.h * dyo.dpr);
			}
			dyo.monument.updateHeader("canvas");
		}

		this.updateView();

	}

	orientationChange() {

		let vh;
		let vw;
	
		if (window.matchMedia("(orientation: portrait)").matches) {
			if (dyo.engine.canvas.swipeArrow) {
				dyo.engine.canvas.swipeArrow.show();
			}

			vh = window.innerHeight * 0.01;
			if ($("#dyo_menu-mdc-list")) {
				$("#dyo_menu-mdc-list").style.display = "block";
			}
			document.documentElement.style.setProperty('--vh', `${vh}px`);

			if (dyo.engine.drawer && dyo.engine.drawer.drawer.open == true) {
				this.hideContainer(this.common_container);
			}
		}
		 
		if (window.matchMedia("(orientation: landscape)").matches) {
			if (dyo.engine.canvas.swipeArrow) {
				dyo.engine.canvas.swipeArrow.hide();
			}

			vw = window.innerHeight * 0.01;
			document.documentElement.style.setProperty('--vw', `${vw}px`);

			if (dyo.engine.drawer) {
				dyo.engine.drawer.drawer.open = true;
			}
	
		}

	}

	resize(close) {

		dyo.engine.checkDevice();

		let allow = true;

		var landscape = false;

		if (dyo.engine.deviceOs == "ios") {
			if (window.matchMedia("(orientation: landscape)").matches) {
				landscape = true;
			}
		} else {
			if (screen.orientation) {
				if (screen.orientation.type == "landscape-primary" || screen.orientation.type == "landscape-secondary") {
					landscape = true;
				}
			} else {
				if (window.matchMedia("(orientation: landscape)").matches) {
					landscape = true;
				}	
			}
		}

		if (dyo.engine.deviceType == "mobile" && landscape) {

			$(".dyo").style.display = "none";
			$("#canvas").style.display = "none";
			$("#openfl").style.visibility = "hidden";
			if ($("#dyo_button_swipeArrow")) {
				$("#dyo_button_swipeArrow").style.display = "none";
			}
			allow = false;

			if (close != true) {

				let d = dyo.engine.dialog_resp;
				
				if (d) {

					if ($("#login")) {
						$("#login").classList.remove("mdc-dialog--open");
						$("#login").classList.remove("mdc-dialog--closed");
					}

					if ($("#quick-email-design")) {
						$("#quick-email-design").classList.remove("mdc-dialog--open");
						$("#quick-email-design").classList.remove("mdc-dialog--closed");
					}

					d.title = ""; 
					d.accept = "";
					d.decline = "";
					d.body = "<p align='center'><img alt='Phone position - rotation from horizontal to vertical' class='lazyload' src='data/svg/misc/phone-position-rotation-from-horizontal-to-vertical.svg' style='height: 50vh;' /></p>";
					d.render();
					d.show();

					let arr = ["surface", "backdrop", "body", "header", "footer"];

					if (document.querySelectorAll(".mdc-dialog")) {
						for (let nr = 0; nr < arr.length; nr++) {
							document.querySelectorAll(".mdc-dialog .mdc-dialog__" + arr[nr]).forEach(dialog => {
								dialog.style.backgroundColor = "#cfe8fc";
							})
						}
					}

					$("#close_button").style.display = "none";
				}	

			}

		} else {

			$(".dyo").style.display = "block";
			if (dyo.mode == "2d") {
				$("#canvas").style.display = "block";
			}
			$("#openfl").style.visibility = "visible";
			if ($("#dyo_button_swipeArrow")) {
				$("#dyo_button_swipeArrow").style.display = "block";
			}
			if (close != true) {
				if (dyo.engine.dialog_resp) {
					if ($("#close_button")) {
						$("#close_button").style.display = "block";
					}
					dyo.engine.dialog_resp.hide();
				}
			}
			clearInterval(dyo.engine.orientationId);
		}

		this.setSize("Canvas:601");

		if (allow) {
			this.orientationChange()

			if (dyo.mode == "2d") {
				this.setDrawer();
			}
	
			this.updateView();
			this.updateMonument();
		}

		dyo.engine.checkMobileMenu();

	}
	
	events() {

		window.addEventListener('orientationchange', () => dyo.engine.canvas.resize(), {passive: true});
		window.addEventListener('resize', () => dyo.engine.canvas.resize(), {passive: true});

		this.resize();

		let self = this;

		//if (dyo.mode == "2d") {

			window.addEventListener('touchstart', function(e) {

				self.touchesLength = e.touches.length;

				self.points = [];

				self.points[0] = {
					current: {
						x: e.touches[0].pageX,
						y: e.touches[0].pageY
					},
					old: {
						x: e.touches[0].pageX,
						y: e.touches[0].pageY
					}
				}

				if (self.touchesLength > 1) {
					self.points[1] = {
						current: {
							x: e.touches[1].pageX,
							y: e.touches[1].pageY
						},
						old: {
							x: e.touches[1].pageX,
							y: e.touches[1].pageY
						}
					}
				}

				switch (e.touches.length) {
					case 1: 

						self.xPos = e.changedTouches[0].clientX;
						self.yPos = e.changedTouches[0].clientY;

						break;
					case 2: 

						self.doubleClick = true;

						let onTouchMove = (e) => {

							if (dyo.selected) {

								// scaling
								let curDiff = Math.abs(e.touches[0].pageY - e.touches[1].pageY);
								let value;

								// rotating
								let point1, point2;
								self.points[0].current.x = e.touches[0].pageX;
								self.points[0].current.y = e.touches[0].pageY;
								self.points[1].current.x = e.touches[1].pageX;
								self.points[1].current.y = e.touches[1].pageY;

								// calculate initial angle
								point1 = self.points[0].old;
								point2 = self.points[1].old;
								let startAngle = Math.atan2((point1.y - point2.y), (point1.x - point2.x)) * (180 / Math.PI);

								// calculate new angle
								point1 = self.points[0].current;
								point2 = self.points[1].current;
								let currentAngle = Math.atan2((point1.y - point2.y), (point1.x - point2.x)) * (180 / Math.PI);

								// set rotation based on difference between the two angles
								let currentRotation = (currentAngle - startAngle);

								// moving
								let average = { x: 0, y: 0 };
	
								// caluclate average movement between all points
								average.x += (self.points[0].current.x - self.points[0].old.x);
								average.y += (self.points[0].current.y - self.points[0].old.y);
								average.x += (self.points[1].current.x - self.points[1].old.x);
								average.y += (self.points[1].current.y - self.points[1].old.y);
						
								average.x /= Math.max(1, 2);
								average.y /= Math.max(1, 2);

								let position = dyo.selected.getPosition();
								position.x += average.x;
								position.y += average.y;
						
								switch (dyo.currentSection) {
									default:
										value = curDiff;
										value = Math.max(dyo.selected.get_min(), Math.min(dyo.selected.get_max(), curDiff));
										
										switch (dyo.selected.type) {
											default:
												if (dyo.mode == "2d") {
													dyo.selected.setSize(value);
												}
												break;

											case "Photo":
												if (dyo.mode == "2d") {
													if (dyo.selected.fixed) {
													
														if (self.prevDiff > 0) {
															if (curDiff > self.prevDiff) {
																dyo.engine.photos.slider_size.increase();
															}
															if (curDiff < self.prevDiff) {
																dyo.engine.photos.slider_size.decrease();
															}
														}

													} else {
														dyo.selected.setSize(value);
													}
												}
												break;
										}

										dyo.selected.setPosition(position);
										
										break;
									case "Crop":
										value = (curDiff / dyo.engine.photos.getPhotoHeight()) * 100;

										if (value > 100) {
											value = 100;
										}

										dyo.controller_Size.setValue(value);
										dyo.engine.photos.crop_Size(value);

										break;

								}

								self.prevDiff = curDiff;
						
							} else {

								switch (dyo.currentSection) {
										
									case "Design Menu":
										break;

								}

							}

						}
						let onTouchEnd = (event) => {
							event.target.removeEventListener("touchmove", onTouchMove);
							event.target.removeEventListener("touchend", onTouchEnd);
						}
						e.target.addEventListener("touchmove", onTouchMove);
						e.target.addEventListener("touchend", onTouchEnd);					
						break;
				}   
			}, {passive: true});

			window.addEventListener('touchend', function(e) {

				if (dyo.engine.popupActive == false) {
					if (dyo.engine.deviceType == "mobile") {

						let xPos = e.changedTouches[0].clientX;
						let yPos = e.changedTouches[0].clientY;

						if (self.touchesLength == 1) {

							if (dyo.selected == null) {

								switch (dyo.currentSection) {
									case "Crop":
									break;
									default:
										if (dyo.mode == "2d") {
											if (self.xPos - xPos < -120) {
												if (dyo.engine.drawer.drawer.open == false) {
													$("#button_dyo_menu").click();
												}
											}
							
											if (self.xPos > 240) {
												if (self.xPos - xPos > 25) {

													if (dyo.engine.drawer.drawer.open == true) {
														$("#button_dyo_menu").click();
													}
													
												}
											}
										}
									break;

								}
								
							}
							
						}
					}

				}

				self.doubleClick = false;

			}, {passive: true});

		//}

	}

	webgl_support() {
		try {
			var canvas = document.createElement('canvas'); 
			return !!window.WebGLRenderingContext &&
			(canvas.getContext('webgl', { willReadFrequently: true }) || canvas.getContext('experimental-webgl', { willReadFrequently: true }));
		} 
		catch(e) {
			return false;
		}
	}

	setDrawer() {

		if (dyo.engine.deviceType == "mobile" || dyo.engine.deviceType == "tablet") {

			let _canvas;

			if (dyo.mode == "2d") {
				_canvas = $('#canvas');
			}
			if (dyo.mode == "3d") {
				_canvas = $('#openfl');
			}

			if (window.matchMedia("(orientation: landscape)").matches) {
				_canvas.classList.add('canvasDrawerOpen');

				if (_canvas.classList.contains('canvasDrawerClose')) {
					_canvas.classList.remove('canvasDrawerClose');
					_canvas.classList.add('canvasDrawerOpen');
					dyo.engine.drawer.drawer.open = true;
				}

			} else {

				if (!this.inited) {
					this.inited = true;
					if (_canvas.classList.contains('canvasDrawerOpen')) {
						_canvas.classList.remove('canvasDrawerOpen');
						_canvas.classList.add('canvasDrawerClose');
						dyo.engine.drawer.drawer.open = false;
					}
				}

			}

		} else {

			if (dyo.engine.drawer) {
				dyo.engine.drawer.drawer.open = true;
				//console.log("@setDrawer - true");
			}

			if (canvas.classList.contains('canvasDrawerClose')) {
				canvas.classList.remove('canvasDrawerClose');
				canvas.classList.add('canvasDrawerOpen');
			}

		}

	}

	updateMonument() {

		if (dyo.monument) {

			if (dyo.monument.headstone) {
				dyo.monument.headstone.render();
			}

			if (dyo.monument.has_base) {
				dyo.monument.base.render();
			}
			
			dyo.monument.updateMonument("canvas:683");

		}

	}

	updateView() {
		if (dyo) {
			if (dyo.w > 0 && dyo.h > 0) {
				if (this.stage.alpha == 1) {
					this.stage.updateViewport(dyo.w * dyo.dpr, dyo.h * dyo.dpr);
					this.stage.update();
				}
			}
		}
	}
	
}