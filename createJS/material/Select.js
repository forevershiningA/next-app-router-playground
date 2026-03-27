import { Component } from './Component.js';
import { Lang, Translate, $ } from '../Const.js';

const TEXT_FIELD_SIMPLE = 0;
const TEXT_FIELD_OUTLINED = 1;

export class Select extends Component {
	constructor(dat = {}) {
        super(dat);
        
        this.data = dat.data;
        this.selected = dat.selected;

        this.container = $("div", "add", "container-select", this.stage);
    }

	render() {

        let content = `<div id="${this.id}" class="mdc-select" role="listbox">
        <div class="mdc-select__surface" tabindex="0">
        <div id="${this.title.replace(' ', '_')}_label" class="mdc-select__label">${Translate(this.title)}</div>
            <div class="mdc-select__selected-text"></div>
            <div class="mdc-select__bottom-line"></div>
        </div>
        <div class="mdc-menu mdc-select__menu" style="overflow-y: auto !important; padding-bottom: 0px !important;">
            <ul class="mdc-list mdc-menu__items">
            `

        let formula, allow = false;

        switch (dyo.config._config.formula) {
            default:
                formula = false;
                break;
            case "Bronze": case "Engraved":
                formula = true;
                break;
        }
       
        let category;
        let selected = "";

        this.data.forEach(item => {

            let name = item.min_width + " x " + item.min_height + " mm";
            category = `<li ${selected} class="mdc-list-item" role="option" tabindex="${item.id}">
                ${item.name}
            </li>`

            if (this.id == "dyo_select_photo_color") {

                if (dyo.engine.photos.uploadPhotoId) {

                    let _item = dyo.engine.getItemByID("images", dyo.engine.photos.uploadPhotoId);

                    if (_item.color == 1) {
                        content += category;
                    } else {
                        if (item.name == Translate(Lang.GREYSCALE)) {
                            content += category;
                        }
                    }

                }

            } else {

                if (item.name.indexOf("Colour Motifs") == -1) {

                    if (item.traditional != undefined) {
        
                        if (formula && item.traditional) {
                            content += category;
                        }
        
                        if (!formula) {
                            content += category;
                        }
        
                    } else {
                        content += category;
                    }

                }
    
            }

		});

        content += `</ul>
        </div>
        </div>
        `

        this.container.innerHTML = content;
        
        this.events();

        if (this.title == Lang.SELECT_COLOUR) {
            $("#" + this.title.replace(' ', '_') + "_label").style.display = "none";
            this.container.style.marginTop = "-15px";
        }

        if (this.id == "dyo_select_font_size") {
            let init_height = dyo.config._additions.Inscriptions[0].init_height;
            this.setValue(init_height);
        }

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

        switch (dyo.code) {

            default:
                if (this.select.selectedIndex == -1) {
                    if (dyo.monument.id == 31) {
                        this.select.selectedIndex = 0;    
                    } else {
                        this.select.selectedIndex = 6;
                    }
                }
                break;

            case "jp_JP":
                if (this.select.selectedIndex == -1) {
                    this.select.selectedIndex = 2;
                }
                break;

        }
                
		return this.getValue(this.select.selectedIndex);
    }
    
	getSelectedId() {
		if (this.select.selectedIndex == -1) {
			this.select.selectedIndex = 1;
		}
		
		return this.getId(this.select.selectedIndex);
	}

	events() {

        let self = this;

        let root = document.getElementById(this.id);

        this.select = new mdc.select.MDCSelect(root);

        if (this.selected != undefined) {
            this.select.selectedIndex = this.selected;
        }

        let select = this.select;

        root.addEventListener('MDCSelect:change', function() {

            let index = select.selectedIndex;
            let value = select.value;

			if (dyo.selected) {
                if (this.title == Lang.SELECT_FONT) {
                    let selectedFont = this.getValue(index);   
                    dyo.selected.lineHeight = this.getLineHeight(index);
                    dyo.selected.fontFamily = this.getValue(index);
                    dyo.engine.inscriptions.enhanceMinHeight();
                    setTimeout(() => {
                        dyo.selected.fontFamily = selectedFont;
                        dyo.engine.inscriptions.enhanceMinHeight();                                                
                    }, 500);
                }
                if (this.title == Lang.SELECT_SIZE) {
                    dyo.selected.size = this.getValue(index);
                }
                if (this.title == Lang.SELECT_MASK) {
                    dyo.selected.applyMask(index);
                }
                if (this.title == Lang.SELECT_ROTATION) {
                    dyo.selected.rotate(this.getValue(index).split('&deg;')[0], 0);
                }
            } 
            
            if (this.title == Lang.SELECT_COLOUR) {
                dyo.engine.photos.applyColor(index);
            }

            if (this.title == Lang.RANGE) {

                dyo.design.clearCache();
                
                dyo.currentSelectRange = index;

                dyo.design_start = (10 * index);
                dyo.design_end = 10;

                let href = window.location.href.split("#")[1];

                switch (href) {
                    default: case "saved-designs": case "my-account":
                        dyo.design.getDesigns();
                        break;
                    case "your-orders":
                        dyo.design.getOrders(true);
                        break;
                }

            }

            if (this.title == Lang.SELECT_PRODUCT) {
                dyo.monument.id = this.data[index].product_id;
                dyo.monument.Product();
            }

            if (this.title == Lang.LANGUAGE) {
                switch (index) {
                    case 0:
                        dyo.settings.config.language = "us_EN";
                        break;
                    case 1:
                        dyo.settings.config.language = "au_EN";
                        break;
                    case 2:
                        dyo.settings.config.language = "uk_EN";
                        break;
                    case 3:
                        dyo.settings.config.language = "pl_PL";
                        break;
                }
            }

            if (this.title == Lang.CURRENCY) {
                switch (index) {
                    case 0:
                        dyo.settings.config.currency = "USD";
                        break;
                    case 1:
                        dyo.settings.config.currency = "AUD";
                        break;
                    case 2:
                        dyo.settings.config.currency = "GBP";
                        break;
                    case 3:
                        dyo.settings.config.currency = "EURO";
                        break;
                    case 4:
                        dyo.settings.config.currency = "PLN";
                        break;
                }
            }

            if (this.title == Lang.METRIC) {
                switch (index) {
                    case 0:
                        dyo.settings.config.metric = "inches";
                        break;
                    case 1:
                        dyo.settings.config.metric = "millimeters";
                        break;
                }
            }

            if (this.title ==  Lang.SHARE) {
                dyo.account.shareDesign(this.getSrc(index));
            }

            if (dyo.currentSection == "Motifs") {
                if (this.title == Lang.SELECT_CATEGORY) {

                    dyo.engine.motifs.loadMorePressed = false;

                    let files;

                    switch (dyo.monument._config.formula) {
                        case "Bronze":
                            files = "bronze-files.txt";
                            break;
                        case "Laser":
                            files = "laser-files.txt";
                            break;
                        case "Engraved":
                            files = "engraved-files.txt";
                            break;
                        case "Enamel":
                            files = "enamel-files.txt";
                            break;
                    }

                    dyo.engine.motifs.buttonLoadMore.show();
            
                    files = "files.txt";
                    let url = dyo.xml_path + "data/motifs/" + this.getSrcByValue(value) + "/" + files;
            
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

                            dyo.engine.motifs.motifs_list.render();        
                        });
                    });

                }

            }

            if (dyo.currentSection == "Emblems") {
                if (this.title == Lang.SELECT_CATEGORY) {

                    dyo.engine.emblems.loadMorePressed = false;

                    let files;

                    switch (dyo.monument._config.formula) {
                        case "Bronze":
                            files = "emblems-files.txt";
                            break;
                    }

                    dyo.engine.emblems.buttonLoadMore.show();
            
                    let url = "data/emblems/" + files;

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

                            dyo.engine.emblems.emblems_list.render();        
                        });
                    });

                }

            }

        }.bind(this));
    }
	
}