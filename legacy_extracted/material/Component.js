import { Module } from '../Module.js';
import { _, $, Lang, Translate } from '../Const.js';
import { Item } from '../dyo/Item.js';

export class Component extends Module {
	constructor(data) {

		super();

		if (typeof data !== 'undefined') {

			this.data = data;

			if (typeof data.data !== 'undefined') {
				this.data_list = data.data;
			}

			if (typeof data.stage !== 'undefined') {
				this.stage = data.stage;
			}

			if (typeof data.events !== 'undefined') {
				this.events = data.events;
			}

			if (typeof data.parent !== 'undefined') {
				this.parent = data.parent;
			}

			if (typeof data.id !== 'undefined') {
				this.id = data.id;
			}

			if (typeof data.selector !== 'undefined') {
				this.selector = data.selector;
			}

			if (typeof data.path !== 'undefined') {
				this.path = data.path;
			}

			if (typeof data.placeholder !== 'undefined') {
				this.placeholder = data.placeholder;
			}

			if (typeof data.title !== 'undefined') {
				this.title = data.title;
			}

			if (typeof data.hide !== 'undefined') {
				this._hide = data.hide;
			}

			if (typeof data.selected !== 'undefined') {
				this.selected = data.selected;
			}

			if (typeof data.header_title !== 'undefined') {
				this.header_title = data.header_title;
			}
			
			if (typeof data.css !== 'undefined') {
				this.css = data.css;
			}

			if (typeof data.class !== 'undefined') {
				this._class = data.class;
			}

			if (typeof data.html !== 'undefined') {
				this.html = data.html;
			}
			
			if (typeof data.description !== 'undefined') {
				this.description = data.description;
			}

			if (typeof data.value !== 'undefined') {
				this.value = data.value;
			} 

			if (typeof data.step !== 'undefined') {
				this.step = data.step;
			}

			if (typeof data.min !== 'undefined') {
				this.min = data.min;
			}

			if (typeof data.max !== 'undefined') {
				this.max = data.max;
			}

			if (typeof data.icon !== 'undefined') {
				this.icon = data.icon;
			}

			if (typeof data.type !== 'undefined') {
				this.type = data.type;
			}

			if (typeof data.section !== 'undefined') {
				this.section = data.section;
			}

		}

	}

	getDateURL() {
		let date = new Date();
		let month = date.getMonth() + 1;
		if (month < 10) {
			month = "0" + month;
		}
		return date.getFullYear() + "/" + month + "/";
	}


    makeSafeName(name, s) {
		if (name != undefined) {
			if (typeof s == 'undefined') {
				s = ' ';
			}
			return name.toLowerCase().split(s).join('_').replace('(','').replace(')','').replace('&','').replace("'",'').replace("[",'').replace("]",'').replace("+",'');
		}
    }

    hide() {
        this.container.style.display = "none";
    }

    hide_image() {
        this.container_image.style.display = "none";
    }

    show() {
        this.container.style.display = "flex";
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

}