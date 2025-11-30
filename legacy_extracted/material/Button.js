import {Component} from './Component.js';
import {Lang, Translate} from '../Const.js';

const BUTTON_BASELINE = 0;
const BUTTON_DENSE = 1;
const BUTTON_SECONDARY = 2;
const BUTTON_ICON = 3;
const BUTTON_ICON_FILE = 4;
const BUTTON_ICON_TEXT = 5;
const BUTTON_ICON_SMALL = 6;
const BUTTON_ICON_LIGHT = 7;
const BUTTON_ICON_WIDE = 8;

export class Button extends Component {
	constructor(data = {}) {
		super();
		this.stage = data.stage;
		this.id = data.id;
		this.title = data.title;
		if (data.icon) {
			this.icon = data.icon;
		}
		if (data.css) {
			this.css = data.css;
		}
		if (data.html) {
			this.html = data.html;
		}
		if (data.parentcss) {
			this.parentcss = data.parentcss;
		}
		if (data.onclick) {
			this.onclick = data.onclick;
		}
		if (data.dataType) {
			this.dataType = data.dataType;
		}
		this.type = data.type;

		this.state = {
		  inputSelected: false
		};

		this.container = document.createElement('div');
		this.container.classList.add("container-button");
		if (this.parentcss == "float: right") {
			this.container.style.cssFloat = "right";
		}
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
	
    set icon(value) {
        this.setIcon(value);
    }

    get icon() {
        return this.getIcon();
    }

    setIcon(value) {
        this._icon = value;
    }

    getIcon() {
        return this._icon;
    }

	render() {
				
		if (this.type == BUTTON_BASELINE) {
			this.content = `
			<button id="${this.id}" class="mdc-button mdc-button--padded" style="${this.css}">
			<span id="${this.id}_icon_base" class="mdc-typography--caption">${Translate(this.title)}</span>
			</button>
			`
		}
		
		if (this.type == BUTTON_DENSE) {
			let onclick = '';
			if (this.onclick) {
				onclick = 'onClick="' + this.onclick + '()"';
			}
			let type = '';
			if (this.dataType) {
				type = 'type="' + this.dataType + '"';
			}
			this.content = `
			<button id="${this.id}" ${onclick} ${type} class="mdc-button mdc-button--raised mdc-button--padded" style="${this.css}" >
			<span id="${this.id}_dense" class="mdc-typography--caption">${Translate(this.title)}</span>
			</button>
			`
		}
		
		if (this.type == BUTTON_SECONDARY) {
			this.content = `
			<button id="${this.id}" class="mdc-button mdc-button--raised mdc-button--padded secondary-filled-button">
			<span id="${this.id}_secondary" class="mdc-typography--caption">${Translate(this.title)}</span>
			</button>
			`
		}
		
		if (this.type == BUTTON_ICON) {
			this.content = `
			<button id="${this.id}" class="mdc-button mdc-button--raised" style="${this.css}">
				<i class="material-icons mdc-button__icon ${this.class}">${this.icon}</i>
				<br/>
				<span id="${this.id}_icon" class="mdc-typography--caption">${Translate(this.title)}</span>
			</button>
			`
		}

		if (this.type == BUTTON_ICON_FILE) {
			this.content = `
			<input id="${this.id}_file" type="file" accept="image/jpeg,image/x-png" style="display:none;" />

			<button id="${this.id}" class="mdc-button mdc-button--raised">
				<i class="material-icons mdc-button__icon ${this.class}">${this.icon}</i>
			</button>
			<p style="margin-top: 0px;width:64px;text-align:center;line-height: 16px;"><span id="${this.id}_icon_file" class="mdc-typography--caption">${this.title}</span></p>
			`
		}

		if (this.type == BUTTON_ICON_TEXT) {
			this.content = `
			<button id="${this.id}" class="mdc-button mdc-button--raised" style="width: 100px !important; margin-bottom: 100px !important;">
				<i class="material-icons mdc-button__icon ${this.class}">${this.icon}</i>
				<br/>
				<span id="${this.id}_text" class="mdc-typography--caption">${Translate(this.title)}</span>
			</button>
			`
			if (this.html) {
				this.content += this.html;
			}
		}

		if (this.type == BUTTON_ICON_SMALL) {
			this.content = `
			<button id="${this.id}" class="mdc-button mdc-button-padding" style="color:#000000;padding:8px !important;">
				<i class="material-icons mdc-button__icon ${this.class}">${this.icon}</i>
				<br/>
				<span id="${this.id}_icon_small" class="mdc-typography--caption" style="line-height: 1em">${Translate(this.title)}</span>
			</button>
			`
			if (this.html) {
				this.content += this.html;
			}
		}

		if (this.type == BUTTON_ICON_LIGHT) {
			this.content = `
			<button id="${this.id}" class="mdc-button" style="padding: 0px;">
				<i class="material-icons mdc-button__icon" style="margin-top: 5px">${this.icon}</i>
				<br/>
				<span id="${this.id}_icon_light" class="mdc-typography--caption">${Translate(this.title)}</span>
			</button>
			`
		}

		if (this.type == BUTTON_ICON_WIDE) {
			this.content = `
			<button id="${this.id}" class="mdc-button mdc-button-padding" style="${this.css}">
				<i class="material-icons mdc-button__icon ${this.class}" style="${this.css}">${this.icon}</i>
				<p id="${this.id}_icon_wide" class="mdc-typography--caption">${Translate(this.title)}</p>
			</button>
			`
			if (this.html) {
				this.content += this.html;
			}
		}

		this.container.innerHTML = this.content;

	}
	
	getContent() {
		return this.content;
	}
	
}