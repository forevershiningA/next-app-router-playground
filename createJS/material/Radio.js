import { Component } from './Component.js';
import {Lang, Translate, $} from '../Const.js';

const TEXT_FIELD_SIMPLE = 0;
const TEXT_FIELD_OUTLINED = 1;

export class Radio extends Component {
	constructor(data = {}) {
		super();
		this.stage = data.stage;
		this.id = data.id;
        this.title = data.title;
        this.type = data.type;
        this.data = data.data;
        this.selected = data.selected;

		this.container = document.createElement('div');
		this.container.classList.add("container-radio");
		this.stage.appendChild(this.container);
		
    }

    set data(value) {
        this.setData(value);
    }

    get data() {
        return this.getData();
    }

    setData(value) {
        this._data = value;
    }

    getData() {
        return this._data;
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

    hide() {
        this.container.style.display = "none";
    }

    show() {
		this.container.style.display = "block";
    }

	render() {

        let content = '';
        let checked = 'checked';
        let nr = 0;
        let style = '';
        let mt = -12;
        
        this.data.forEach(item => {

            if (nr > 0) {
                checked = '';
            }

            if (this.type == 0) {
                style = '';
            }

            if (this.type == 1) {
                style = 'style="width:auto;float:left;margin:0px;padding:0px;"'
            }

            if (item.list) {
                content +=
                `<a id="radio-${item.id}-${this.makeSafeName(item.name)}" class="mdc-list-item noselect" ${style}>

                    <div class="mdc-radio">
                        <input class="mdc-radio__native-control" type="radio" id="radio-${this.makeSafeName(item.name)}" name="radios" ${checked}>
                        <div class="mdc-radio__background">
                            <div class="mdc-radio__outer-circle"></div>
                            <div class="mdc-radio__inner-circle"></div>
                        </div>
                    </div>
                    <label for="radio-${this.makeSafeName(item.name)}" class="noselect" style="pointer-events: none;">${item.name}</label>

                </a>
                `
            } else {
                content +=
                `<p style="margin: ${mt}px 0px 0px 56px">${item.name}</p>
                `
                mt = 0;
            }

            nr ++;

		});

        this.container.innerHTML = content;
        
        this.events();

    }

	events() {

        let self = this;

        if (dyo.account) {
            dyo.account.payment_method = 1;
        }

        this.data.forEach(item => {

            if (item.list) {
                $("#radio-" + item.id + "-" + this.makeSafeName(item.name)).addEventListener("click", (e) => {
                    $("#radio-" + this.makeSafeName(item.name)).checked = 'checked';

                    if (dyo.monument.id == 31) {
                        switch (item.name) {
                            case "Top part":
                                dyo.selected.colorTextureTarget = 1;
                                break;
                            case "Bottom part":
                                dyo.selected.colorTextureTarget = 2;
                                break;    
                        }
                    }

                    if (self.type == 0) {
                        dyo.account.payment_method = item.nr;

                        if (dyo.usa) {
                            switch (item.nr) {
                                case 1:
                                    $("#dyo_payment_info").innerHTML = Translate(Lang.PAYMENT_STRIPE);
                                    break;
                                case 2:
                                    $("#dyo_payment_info").innerHTML = Translate(Lang.PAYMENT_PAYPAL);
                                    break;
                            }  
                        }

                    }

                    if (self.type == 1) {
                        dyo.account.share_method = item.src;
                    }

                });

            }

        });

    }

    getId(value) {
        let id = 0;
        this.data.forEach(item => {
            if (value == item.name) {
                id = item.id;
            }
        });
        return id;  
    }

    getLineHeight(id) {
        let value = '';
        this.data.forEach(item => {
            if (id == item.id) {
                value = item.lineHeight;
            }
        });
        return value;
    }

    getValue(id) {
        let value = '';
        this.data.forEach(item => {
            if (id == item.id) {
                value = item.name;
            }
        });
        return value;
    }

    setValue(value) {
        if (!isNaN(value)) {
            value += " mm";
        }
        this.data.forEach(item => {
            if (value == item.name) {
                this.select.selectedIndex = item.id;
            }
        });
    }
	
    getSrc(id) {
        let value = '';
        this.data.forEach(item => {
            if (id == item.id) {
                value = item.src;
            }
        });
        return value;
    }

    getSrcByValue(id) {
        let value = '';
        this.data.forEach(item => {
            if (id.trim() == item.name.trim()) {
                value = item.src;
            }
        });
        return value;
    }
	
	getSelected() {
		if (this.select.selectedIndex == -1) {
			this.select.selectedIndex = 1;
		}
		
		return this.getValue(this.select.selectedIndex);
    }
    
	getSelectedId() {
		if (this.select.selectedIndex == -1) {
			this.select.selectedIndex = 1;
		}
		
		return this.getId(this.select.selectedIndex);
	}

	
}