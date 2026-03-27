import {Component} from './Component.js';
import {Lang, Translate, $} from '../Const.js';

const SNACKBAR_SIMPLE = 1;
const SNACKBAR_WITH_ACTION = 2;

export class Snackbar extends Component {
	constructor(data = {}) {
		super();
		this.stage = data.stage;
        this.id = data.id;
        this.isOpen = false;
        this.set = false;
        this.intervalId = 0;

		if (data.title) {
			this.title = data.title;
		}

		if (data.description) {
			this.description = data.description;
		}

		if (data.value) {
			this.value = data.value;
		} else {
			this.value = "";
        }
        
		if (data.type) {
			this.type = data.type;
		}

		this.container = document.createElement('div');

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

    set description(value) {
        this.setDescription(value);
    }

    get description() {
        return this.getDescription();
    }

    setDescription(value) {
        this._description = value;
    }

    getDescription() {
        return this._description;
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

		if (this.type == SNACKBAR_SIMPLE) {
            
            this.content = `
            <div class="mdc-snackbar" id="snackbar-${this.id}" aria-live="assertive" aria-atomic="true" aria-hidden="true" style="z-index: 999">
            <div class="mdc-snackbar__text" style="margin: 0px auto;"></div>
            <div class="mdc-snackbar__action-wrapper" style="display:none;">
                <button type="button" class="mdc-button mdc-snackbar__action-button" style="color:#ffffff">
                </button>
           </div>
          `
            
		}

		if (this.type == SNACKBAR_WITH_ACTION) {
 
            this.content = `
            <div class="mdc-snackbar" id="snackbar-${this.id}"
            aria-live="assertive"
            aria-atomic="true"
            aria-hidden="true">
            <div class="mdc-snackbar__text"></div>
          `
            
		}

        this.container.innerHTML = this.content;
		this.events();
		
	}

	events() {
        let self = this;
	 
        const MDCSnackbar = mdc.snackbar.MDCSnackbar;
        this.snackbar = new MDCSnackbar($('#snackbar-' + this.id));
        this.snackbarContainer = $('#snackbar-' + this.id);

    }

    setIsOpen(value) {
        this.isOpen = value;
    }

    open(data) {
        let self = this;

        if (this.isOpen == false) {
            this.isOpen = true;
            this.snackbar.show(data);
            $(".mdc-snackbar__text").innerHTML = data.message;

            setTimeout(() => {
                this.snackbarContainer.classList.add('mdc-snackbar--active');
                this.snackbarContainer.setAttribute("aria-hidden", "false");
            }, 150);

            setTimeout(() => {
                self.setIsOpen(false);
                self.close();
            }, data.timeout);
        }
    }

    clearSnackInterval() {
        clearInterval(this.intervalId);
    }

    close() {
        this.setIsOpen(false);
        this.snackbarContainer.classList.remove('mdc-snackbar--active');
        this.snackbarContainer.setAttribute("aria-hidden", "true");
    }
	
	getContent() {
		return this.content;
	}
	
}