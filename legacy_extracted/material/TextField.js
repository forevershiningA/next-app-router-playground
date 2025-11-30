import { Component } from './Component.js';
import { Inscription } from '../dyo/Inscription.js';
import { Lang, Translate, $ } from '../Const.js';
import { Order } from '../modules/Orders.js';

const TEXT_FIELD_SIMPLE = 0;
const TEXT_FIELD_OUTLINED = 1;
const TEXT_FIELD_PASSWORD = 2;
const TEXT_FIELD_MESSAGE = 3;
const TEXT_FIELD_LONG = 4;
const TEXT_FIELD_TITLE = 5;
const TEXT_FIELD_FILED = 6;
const TEXT_FIELD_NUMBER = 7;
const TEXT_FIELD_LONG_MULTI = 8;
const TEXT_AREA = 9;
const TEXT_FIELD_MESSAGE_LONG = 10;
const TEXT_AREA_SEC = 11;

export class TextField extends Component {
	constructor(data = {}) {
		super(data);

		if (data.value) {
			this.value = data.value;
		} else {
			this.value = "";
		}

		if (data.dataType) {
			this.dataType = data.dataType;
		} else {
			this.dataType = "text";
		}

		this.container = document.createElement('div');

		if (this.type != TEXT_FIELD_MESSAGE && this.type != TEXT_FIELD_NUMBER) {
			this.container.classList.add("container-textfield");
		}

		this.maxLength = data.maxLength || -1;

		this.stage.appendChild(this.container);
		
    }

    hide() {
        this.container.style.display = "none";
    }

    show() {
        this.container.style.display = "block";
	}
	
    set title(value) {
        this.setTitle(value);
    }

    get title() {
        return this.getTitle();
    }

    setTitle(value) {
        this._title = value;
    }

    getTitle() {
        return this._title;
	}
	
    set value(value) {
        this.setValue(value);
    }

    get value() {
        return this.getValue();
    }

    setValue(value) {
        this._value = value;
    }

    getValue() {
        return this._value;
    }
	
    set type(value) {
        this.setType(value);
    }

    get type() {
        return this.getType();
    }

    setType(value) {
        this._type = value;
    }

    getType() {
        return this._type;
    }

	render() {

		let type = this.dataType;
		let spellCheck = '';
		let disabled = '';
		if (type == "email") {
			spellCheck = "spellcheck='false'";
		}
		if (type == "disabled") {
			disabled = " disabled";
		}

		let date = Date.now();

		if (this.type == TEXT_FIELD_SIMPLE) {
			this.content = `
			<div id="${this.id}-tf-outlined" class="mdc-text-field">
			  <input value="${this.value}" ${spellCheck}${disabled} type="${type}" maxLength="${this.maxLength}" class="mdc-text-field__input" id="${this.id}" aria-controls="${this.id}-helper-text" autocomplete="off">
			  <label for="${this.id}" class="mdc-floating-label">${Translate(this.title)}</label>
			  <div class="mdc-line-ripple"></div>
			</div>
			`
		}
		
		if (this.type == TEXT_FIELD_OUTLINED) {
			this.content = `
			<div id="${this.id}-tf-outlined" class="mdc-text-field mdc-text-field--outlined">
				<input value="${this.value}" ${spellCheck}${disabled} type="${type}" maxLength="${this.maxLength}" id="${this.id}" style="${this.css}" class="mdc-text-field__input" aria-controls="name-validation-message" name="${this.id}"  autocomplete="off">
				<label for="${this.id}" class="mdc-floating-label">${Translate(this.title)}</label>
				<div class="mdc-text-field__outline">
				  <svg>
					<path class="mdc-text-field__outline-path"/>
				  </svg>
				</div>
				<div class="mdc-text-field__idle-outline"></div>
			</div>
			`
		}

		if (this.type == TEXT_FIELD_PASSWORD) {
			let typePassword = "password";
			if (dyo.engine.deviceOs == "ios") {
				typePassword = "text";
			}

			this.content = `
			<div id="${this.id}-tf-outlined" class="mdc-text-field mdc-text-field--outlined">
				<input value="${this.value}" type="${typePassword}" maxLength="${this.maxLength}" id="${this.id}" class="mdc-text-field__input" aria-controls="name-validation-message" autocomplete="new-password" name="${date}">
				<label for="${this.id}" class="mdc-floating-label">${Translate(this.title)}</label>
				<div class="mdc-text-field__outline">
				  <svg>
					<path class="mdc-text-field__outline-path"/>
				  </svg>
				</div>
				<div class="mdc-text-field__idle-outline"></div>
			</div>
			`
		}

		if (this.type == TEXT_FIELD_MESSAGE_LONG) {

			this.content = `
			<div id="${this.id}-tf-outlined" class="mdc-text-field" style="margin: 20px 0px 0px 0px; width: 99%;overflow:hidden;">
				<textarea id="${this.id}" class="mdc-text-field__input" aria-controls="${this.id}-helper-text" rows="3" cols="60" maxlength="200" style="border-bottom-width: 0px !important;" disabled>${Translate(this.title)}</textarea>
			</div>
			`
		}

		if (this.type == TEXT_FIELD_MESSAGE) {

			this.content = `
			<div id="${this.id}-tf-outlined" class="mdc-text-field" style="margin: 60px 0px 0px 0px; width: 99%;">
				<textarea id="${this.id}" class="mdc-text-field__input" aria-controls="${this.id}-helper-text" rows="4" cols="60" maxlength="200" style="resize: none !important; border-bottom-width: 0px !important;overflow:hidden;" disabled>${Translate(this.title)}</textarea>
			</div>
			`
			
		}

		if (this.type == TEXT_FIELD_LONG) {

			let add = "";

			if (this.id == "input_quick-email-design") {
				add = " (" + Translate(Lang.REQUIRED).toLowerCase() + ")";
			}

			if (this.id == "enquiry_quick-email-design") {
				add = " (" + Translate(Lang.REQUIRED).toLowerCase() + ")";
			}
			
			this.content = `
			<div id="${this.id}-tf-outlined" class="mdc-text-field mdc-text-field--outlined" style="margin: 0px; width: 100%;">
				<input value="${this.value}" ${spellCheck}${disabled} type="${type}" maxLength="${this.maxLength}" id="${this.id}" class="mdc-text-field__input"
					   aria-controls="name-validation-message" autocomplete="off">
				<label for="${this.id}" class="mdc-floating-label">${Translate(this.title)}${add}</label>
				<div class="mdc-text-field__outline">
				  <svg>
					<path class="mdc-text-field__outline-path"/>
				  </svg>
				</div>
				<div class="mdc-text-field__idle-outline"></div>
			</div>
			`
		}

		if (this.type == TEXT_FIELD_FILED) {
			this.content = `
			<div class="mdc-text-field">
				<div id="${this.id}-tf-outlined" class="mdc-text-field">
					<input style="background-color:#f2f2f2; border-radius: 10px 10px 0px 0px; padding: 15px" value="${this.value}" type="${type}" maxLength="${this.maxLength}" ${spellCheck}${disabled} class="mdc-text-field__input" id="${this.id}" aria-controls="${this.id}-helper-text" autocomplete="off">
					<label for="${this.id}" class="mdc-floating-label" style="left: 15px;top:12px;">${Translate(this.title)}</label>
					<div class="mdc-line-ripple"></div>
				</div>
			`
		}

		if (this.type == TEXT_FIELD_NUMBER) {

			this.content = `
			<div class="mdc-text-field">
				<div id="${this.id}-tf-outlined" class="mdc-text-field">
					<input id="${this.id}" step="any" style="background-color:#f2f2f2; padding: 15px; width: 85%; " type="number" class="mdc-text-field__input" autocomplete="off">
				</div>
			`

		}

		if (this.type == TEXT_FIELD_LONG_MULTI) {
			this.content = `
			<div id="${this.id}-tf-outlined" class="mdc-text-field mdc-text-field--outlined" style="margin: 0px; width: 100%;">
				<input value="${this.value}" ${spellCheck}${disabled} type="${type}" maxLength="${this.maxLength}" id="${this.id}" class="mdc-text-field__input"
					   aria-controls="name-validation-message" autocomplete="off">
				<label for="${this.id}" class="mdc-floating-label">${Translate(this.title)}</label>
				<div class="mdc-text-field__outline">
				  <svg>
					<path class="mdc-text-field__outline-path"/>
				  </svg>
				</div>
				<div class="mdc-text-field__idle-outline"></div>
			</div>
			`
		}

		if (this.type == TEXT_AREA) {

			this.content = `
			<label id="${this.id}-tf-outlined" class="mdc-text-field mdc-text-field--textarea">
			<span class="mdc-notched-outline">
				<span class="mdc-notched-outline__leading"></span>
				<span class="mdc-notched-outline__notch">
				<span class="mdc-floating-label" id="${this.id}-label-id">
				${Translate(this.title)} (${Translate(Lang.REQUIRED).toLowerCase()})
				</span>
				</span>
				<span class="mdc-notched-outline__trailing"></span>
			</span>
			<span class="mdc-text-field__resizer">
				<textarea id="${this.id}" class="mdc-text-field__input" aria-labelledby="${this.id}-label-id" rows="6"
				cols="60" maxlength="300" style="border-width: 0px !important;"></textarea>
			</span>
			</label>
			<div class="mdc-text-field-helper-line">
				<div class="mdc-text-field-character-counter">${Translate(Lang.MAX_CHARS)}</div>
		  	</div>
			`
		}

		if (this.type == TEXT_AREA_SEC) {

			this.content = `
			<span style="font-size: 11px; line-height: 13px; color: black;width:250px;display:block;">
			${Translate(Lang.REQUIREMENTS_2)}.
			</span>
			<label id="${this.id}-tf-outlined" class="mdc-text-field mdc-text-field--textarea">
			<span class="mdc-notched-outline">
				<span class="mdc-notched-outline__leading"></span>
				<span class="mdc-notched-outline__notch">
				<span class="mdc-floating-label" id="${this.id}-label-id">
				${Translate(this.title)}
				</span>
				</span>
				<span class="mdc-notched-outline__trailing"></span>
			</span>
			<span class="mdc-text-field__resizer">
				<textarea id="${this.id}" class="mdc-text-field__input" aria-labelledby="${this.id}-label-id" rows="6"
				cols="60" maxlength="300" style="border-width: 0px !important;"></textarea>
			</span>
			</label>
			<div class="mdc-text-field-helper-line">
				<div class="mdc-text-field-character-counter">${Translate(Lang.MAX_CHARS)}</div>
		  	</div>
			`
		}

		this.container.innerHTML = this.content;

		var tfs = document.querySelectorAll(
			'.mdc-text-field'
		);
		
		for (var i = 0, tf; tf = tfs[i]; i++) {
			mdc.textField.MDCTextField.attachTo(tf);
		}

		this.text_field = new mdc.textField.MDCTextField(document.getElementById(this.id + '-tf-outlined'));

		this.events();
		
	}

	strip(str) {
		let s = str.split(" ");
		return s.join("");
	}

	events() {

		let self = this;

		$('#' + this.id).addEventListener('focus', function(e) {
			document.querySelector("body").classList.add("input-focused");
			dyo.blockDelete = true;
		});

		$('#' + this.id).addEventListener('blur', function(e) {
			document.querySelector("body").classList.remove("input-focused");
			dyo.blockDelete = false;
		});

		$('#' + this.id).addEventListener('input', function(e) {

			switch (this.id) {

				default:

					if (this.id == "dyo_width_textfield") {

						let v = Number(this.value);
						let v_min = dyo.engine.sizes.slider_width.slider.min;
						let v_max = dyo.engine.sizes.slider_width.slider.max;
	
						if (dyo.metric == "inches") {
							v_min = dyo.engine.metrics.toInchPlain(v_min);
							v_max = dyo.engine.metrics.toInchPlain(v_max);
						}

						clearInterval(dyo.engine.intervalWidth);

						if (v >= v_min) {
							if (v <= v_min) {
								v = v_min;
							}
							if (v >= v_max) {
								v = v_max;
							}

							if (dyo.metric == "inches") {
								dyo.controller_Width.setValue(dyo.engine.metrics.toMM(v));
							} else {
								dyo.controller_Width.setValue(v);
							}
							dyo.monument.updateMonument();
							dyo.monument.updateHeader();
						} else {
							dyo.engine.intervalWidth = setInterval(() => {
								clearInterval(dyo.engine.intervalWidth);
								let v = Number(this.value);
								if (v <= v_min) {
									v = v_min;
								}

								if (dyo.metric == "inches") {
									dyo.controller_Width.setValue(dyo.engine.metrics.toMM(v));
								} else {
									dyo.controller_Width.setValue(v);
								}
								dyo.engine.sizes.slider_width.decrease();
								dyo.monument.updateMonument();
								dyo.monument.updateHeader();
							}, 1500);
						}

					}

					if (this.id == "dyo_height_textfield") {

						let v = Number(this.value);
						let v_min = dyo.engine.sizes.slider_height.slider.min;
						let v_max = dyo.engine.sizes.slider_height.slider.max;
	
						if (dyo.metric == "inches") {
							v_min = dyo.engine.metrics.toInchPlain(v_min);
							v_max = dyo.engine.metrics.toInchPlain(v_max);
						}

						if (dyo.mode == "3d") {
							$("#dyo_height_textfield").min = v_min;
							$("#dyo_height_textfield").max = v_max;
						}

						clearInterval(dyo.engine.intervalHeight);

						if (v >= v_min) {

							if (v <= v_min) {
								v = v_min;
							}
							if (v >= v_max) {
								v = v_max;
							}

							if (dyo.metric == "inches") {
								dyo.controller_Height.setValue(Number(dyo.engine.metrics.toMM(v)));
							} else {
								dyo.controller_Height.setValue(v);
							}
							dyo.monument.updateMonument();
							dyo.monument.updateHeader();
						} else {
							dyo.engine.intervalHeight = setInterval(() => {
								clearInterval(dyo.engine.intervalHeight);
								let v = Number(this.value);
								if (v <= v_min) {
									v = v_min;
								}

								if (dyo.metric == "inches") {
									dyo.controller_Height.setValue(dyo.engine.metrics.toMM(v));
								} else {
									dyo.controller_Height.setValue(v);
								}
								dyo.engine.sizes.slider_height.decrease();
								dyo.monument.updateMonument();
								dyo.monument.updateHeader();
							}, 1500);
						}

					}

					if (this.id == "dyo_length_textfield") {
				
						let v = Number(this.value);
						let v_min = dyo.engine.sizes.slider_length.slider.min;
						let v_max = dyo.engine.sizes.slider_length.slider.max;
	
						if (dyo.metric == "inches") {
							v_min = dyo.engine.metrics.toInchPlain(v_min);
							v_max = dyo.engine.metrics.toInchPlain(v_max);
						}

						if (dyo.mode == "3d") {
							$("#dyo_length_textfield").min = v_min;
							$("#dyo_length_textfield").max = v_max;
						}

						if (v >= v_min) {
							if (v <= v_min) {
								v = v_min;
							}
							if (v >= v_max) {
								v = v_max;
							}

							if (dyo.metric == "inches") {
								dyo.controller_Length.setValue(dyo.engine.metrics.toMM(v));
							} else {
								dyo.controller_Length.setValue(v);
							}
							dyo.monument.updateMonument();
							dyo.monument.updateHeader();
						}

					}

					break;

				case "dyo_textfield":

					if (dyo.selected) {

						dyo.selected.text.text = this.value.trim();
						dyo.selected.update();

						if (dyo.selected) {
							if (isNaN(dyo.selected.getHeight())) {
							}
						}
		
					} else {

						if (dyo.target == null) {
							dyo.target = dyo.monument.headstone;
						}
		
						if (dyo.side == undefined) {
							dyo.side = "Front";
						}
		
						let color = dyo.monument.getColor();
						let colorName = dyo.monument.getColorName(color);
		
						let _config = dyo.monument._additions.Inscriptions[0];
						dyo.engine.inscriptions.slider_size.slider.min = Number(_config.min_height);
						dyo.engine.inscriptions.slider_size.slider.max = Number(_config.max_height);
						dyo.engine.inscriptions.slider_size.slider.value = Number(_config.init_height);
	
						// ******************************************************
						// init height for motifs = 0.5 height of plaque/headstone
						// ******************************************************
		
						dyo.engine.inscriptions.enhanceMinHeight();
	
						let init_height;
		
						if (dyo.monument.headstone.height > 600) {
							init_height = 50;
						} else {
							init_height = 20;
						}
						
						if (init_height < _config.min_height) {
							init_height = _config.min_height;
						}
						if (init_height > _config.max_height) {
							init_height = _config.max_height;
						}
		
						dyo.engine.inscriptions.slider_size.slider.value = init_height;
		
						dyo.engine.inscriptions.showButtons();
		
						let containerWidth = 0;

						if (this.value != " ") {

							let inscription = new Inscription({ 
								side: dyo.side, 
								label: this.value,
								font: dyo.engine.inscriptions.slider_size.slider.value + "px " + dyo.engine.inscriptions.font_family.getSelected(),
								color: color,
								colorName: colorName,
								x: containerWidth,
								y: dyo.engine.inscriptions.lastY,
								draggable: true,
								selected: true,
								scale: 1
							});

							dyo.target.add(inscription);
		
						} else {

							this.value = "";
							
						}
						
					}

					break;
			}
			
		});

	}
	
	getContent() {
		return this.content;
	}
	
}