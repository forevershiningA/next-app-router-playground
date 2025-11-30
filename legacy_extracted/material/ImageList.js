import { Component } from './Component.js';
import { Motif } from '../dyo/Motif.js';
import { Emblem } from '../dyo/Emblem.js';
import { Lang, Translate, _, $ } from '../Const.js';

export class ImageList extends Component {
	constructor(dat = {}) {
        super(dat);

        this.data = dat.data;
        this.eventsInited = [];

        this.container = $("div", "add", "container-" + this.id, this.stage);
    }

    show() {
        this.container.style.display = "block";
	}

	render() {

        this.container.innerHTML = '';
        
        let content;

        switch (this.type) {
            case 0: case 2:

                $("span", "id", { 
                    id: "span_" + this.id, 
                    css: this.css, 
                    class: _(["mdc-typography--caption"], this._class), 
                    desc: Translate(this.title)
                }, this.container);
                
                let ul = $("ul", "id", { 
                    id: this.id, 
                    class: _(["mdc-image-list", "mdc-image-list--masonry", "masonry-image-list", "hide-supporting", "ptop10"])
                }, this.container);

                this.data.forEach(item => {
                    if (item != "") {
                        
                        let li = $("li", "id", { 
                            id: this.selector + "_" + this.makeSafeName(item), 
                            class: "mdc-image-list__item" 
                        }, ul);
                        
                        let s;
                        if (this.path.indexOf("svg") > -1) {
                            s = this.path + "/" + item.toLowerCase() + ".svg";
                        } else {
                            let i = item.toLowerCase();
                            s = this.path + "/s/" + i + ".png";
                        }

                        let img = $("img", "id", { 
                            src: s,
                            class: ["lazyload", "mdc-image-list__image"] 
                        }, li);
                        
                    }
                });

                break;
            
            case 1:

                // **********************************
                // Select Color [Image List]
                // **********************************

                content = `
                <span class="mdc-typography--caption" style="${this.css}">${Translate(this.title)}</span>
                <ul id="${this.id}" class="mdc-image-list hide-supporting" style="${this.css}">
                `

                let special = true;
    
                this.data.forEach(item => {
                
                    switch (dyo.config._config.formula) {
                        case "Engraved":
    
                            if (item.name == "Gold Gilding" || item.name == "Silver Gilding") {
                                content += `
                                <li class="mdc-image-list__item" style="margin-right: 40px;" id="${this.makeSafeName(this.id)}_${this.makeSafeName(item.hex, '#')}">
                                    <div class="mdc-image-list__image-aspect-container" style="border: 1px solid #cccccc; background-color: ${item.hex}">
                                    </div>
                                    <div class="mdc-image-list__supporting" style="width: 64px;">
                                    <span class="mdc-image-list__label">${item.name}</span>
                                    </div>
                                </li>`;
                            } else {
                                if (special) {
                                    special = false;
                                    content += `</ul>
                                    <ul id="${this.id}_2" class="mdc-image-list standard-image-list hide-supporting">`;
                                }
                                content += `
                                <li class="mdc-image-list__item" id="${this.makeSafeName(this.id)}_${this.makeSafeName(item.hex, '#')}">
                                    <div class="mdc-image-list__image-aspect-container" style="border: 1px solid #cccccc; background-color: ${item.hex}">
                                    </div>
                                </li>`;
                            }
    
                            break;
    
                        default: 
                        
                            if (this.id == "dyo_materials_colors_list") {
                                content += `
                                <li class="mdc-image-list__item" id="materials_${this.makeSafeName(this.id)}_${this.makeSafeName(item.hex, '#')}">
                                    <div class="mdc-image-list__image-aspect-container" style="border: 1px solid #cccccc; background-color: ${item.hex}">
                                    </div>
                                </li>`;
                            } else {
                                content += `
                                <li class="mdc-image-list__item" id="${this.makeSafeName(this.id)}_${this.makeSafeName(item.hex, '#')}">
                                    <div class="mdc-image-list__image-aspect-container" style="border: 1px solid #cccccc; background-color: ${item.hex}">
                                    </div>
                                </li>`;
                            }
    
                            break;
    
                        }
    
                });
                break;

            case 3:

                $("span", "id", { 
                    id: "span_" + this.id, 
                    css: this.css, 
                    class: _(["mdc-typography--caption"], this._class), 
                    desc: Translate(this.title)
                }, this.container);
                
                let ul2 = $("ul", "id", { 
                    id: this.id, 
                    css: this.css, 
                    class: _(["mdc-image-list", "mdc-image-list--masonry", "masonry-image-list", "hide-supporting"])
                }, this.container);

                this.data.forEach(item => {
                    if (item != "") {

                        let li = $("li", "id", { 
                            id: this.makeSafeName(this.section) + "_" + this.makeSafeName(item.name) + "_" + this.makeSafeName(item.img), 
                            class: "mdc-image-list__item" 
                        }, ul2);
                        
                        let s;
                        if (item.img.indexOf("svg") > -1) {
                            s = dyo.xml_path + item.img.toLowerCase() + ".svg";
                        } else {
                            let i = dyo.xml_path + item.path + item.img + ".jpg";
                            s = i;
                        }

                        let img = $("img", "id", { 
                            src: s,
                            class: ["lazyload", "mdc-image-list__image"]
                        }, li);
                        
                    }
                });

                break;

        }

        if (dyo.monument.getProductType() == "images" || dyo.monument.getProductType() == "urns") {
            if (this.type == "1") {
                content += '<div class="mdc-typography--caption" style="color:#bbbbbb;margin-top:10px;">' + Translate(Lang.ACTUAL_COLOUR_MAY_VARY) + '</div>'
            }
        }

        content += '</ul>';

        if (this.type == 1) {
            this.container.innerHTML = content;
        }

        if (this.data.length > 0) {
            this.eventsInited[this.type] = true;
            this.events();
        }

    }
    
    events() {

        let self = this;

        if (this.type == 0) {

            let path = this.path;

            this.data.forEach(item => {
                
                if (item != "" && item != undefined) {
                    
                    $("#motif_" + this.makeSafeName(item)).addEventListener('click', () => { 

                        let _config = dyo.monument._additions.Motifs[0].types[0];
                        dyo.engine.motifs.slider_size.slider.min = Number(_config.min_height);
                        dyo.engine.motifs.slider_size.slider.max = Number(_config.max_height);
                        dyo.engine.motifs.slider_size.slider.value = Number(_config.init_height);

                        dyo.engine.loader.show("Engine:207");

                        let img = new Image();
                        let url;

                        url = dyo.xml_path + "data/svg/motifs/" + item.toLowerCase() + ".svg";
                        img.src = url;

                        img.onerror = () => {
                            dyo.engine.loader.hide();
                        }
                        img.onload = () => {

                            if (img) {
                                var img_width = img.width;
                                var img_height = img.height;

                                let img_dpr;

                                img_dpr = new Image();

                                img_dpr.crossOrigin = "Anonymous";
                                img_dpr.onerror = () => {
                                    dyo.engine.loader.hide();
                                }
                                img_dpr.onload = () => {
        
                                    if (img_dpr) {
        
                                        let color = dyo.monument.getColor();
                                        let colorName = dyo.monument.getColorName(color);

                                        let containerWidth = 0;

                                        let i;

                                        i = img_dpr;

                                        if (typeof(img_dpr) == "object") {

                                            let motif = new Motif({ 
                                                type: "Motif",
                                                productid: dyo.engine.motifs.motif_typeId,
                                                bmp: i,
                                                side: dyo.side, 
                                                url: url,
                                                src: item.toLowerCase(),
                                                item: item.toLowerCase(),
                                                color: color,
                                                colorName: colorName,
                                                x: containerWidth,
                                                y: 0,
                                                draggable: true,
                                                selected: true,
                                                scale: 1
                                            });
                
                                            if (dyo.target == null) {
                                                dyo.target = dyo.monument.getPartByType('Headstone');
                                            }
                
                                            dyo.target.add(motif);

                                            dyo.engine.motifs.motif_typeId = 0;
                                        }

                                        dyo.engine.loader.hide("ImageList:242");
                                    }
        
                                }

                                img_dpr.src = dyo.xml_path + "data/svg/motifs/" + item.toLowerCase() + ".svg";

                            }

                        }

                    });
                }

            });

        }
        
        if (this.type == 1) {
            this.data.forEach(item => {

                if (this.id == "dyo_materials_colors_list") {

                    $("#materials_" + this.makeSafeName(this.id) + "_" + this.makeSafeName(item.hex, '#')).addEventListener('click', () => { 

                        if (dyo.target == null) {
                            dyo.target = dyo.monument.getPartByType('Headstone');
                        }
                        
                        let part = dyo.target;

                        part._select();
                        part.texture = item.img.replace('/s/', '/l/');
                        dyo.monument.backgroundOption = "color";
                        dyo.monument.headstone.background = undefined;
                        part._bmp = undefined;
                        part.applyTexture();

                    });
                } else {
                    $("#" + this.makeSafeName(this.id) + "_" + this.makeSafeName(item.hex, '#')).addEventListener('click', () => { 
                        if (dyo.selected) {
                            dyo.selected.colorName = item.name;
                            dyo.selected.applyColor(item.hex);
                            dyo.monument.updateHeader();
                        } else {
                            let Headstone = dyo.monument.getPartByType('Headstone');
                            Headstone.borderColor = item.hex;
                            Headstone.render();
                        }
                    });
                }
            });
        }      
        
        if (this.type == 2) {

            let path = this.path;

            this.data.forEach(item => {

                if (item != "") {
                    $("#emblem_" + this.makeSafeName(item)).addEventListener('click', () => { 

                        dyo.engine.emblems.slider_size.slider.min = 0;
                        dyo.engine.emblems.slider_size.slider.max = 1;
                        dyo.engine.emblems.slider_size.slider.value = 0;

                        dyo.engine.loader.show("Engine:207");

                        let img = new Image();
                        let i = item.toLowerCase();
                        let src = dyo.xml_path + "data/png/emblems/m/" + i + ".png";

                        img.src = src;

                        img.crossOrigin = "Anonymous";
                        img.onload = () => {

                            if (img) {

                                let color = dyo.monument.getColor();
                                let colorName = dyo.monument.getColorName(color);

                                let containerWidth = 0;
                                let sizes = dyo.engine.emblems.emblemSizes();
                                let size;

                                if (sizes.length > 1) {
                                    dyo.engine.photos.slider_size.slider.min = 1;
                                    dyo.engine.photos.slider_size.slider.max = sizes.length;
                                    dyo.engine.photos.slider_size.slider.value = 1;
                                    size = sizes[0].name;
                                }

                                let id = dyo.monument._additions.Emblems[0].id;

                                let emblem = new Emblem({ 
                                    id: id,
                                    type: "Emblem",
                                    bmp: img,
                                    size: size,
                                    side: dyo.side, 
                                    src: item.toLowerCase(),
                                    item: item.toLowerCase(),
                                    url: src,
                                    color: color,
                                    colorName: colorName,
                                    x: containerWidth,
                                    y: 0,
                                    draggable: true,
                                    selected: true,
                                    scale: 1
                                });

                                dyo.engine.loader.hide("ImageList:242");

                                if (dyo.target == null) {
                                    dyo.target = dyo.monument.getPartByType('Headstone');
                                }

                                dyo.target.add(emblem);
                                img = null;

                            }

                        }

                    });
                }

            });

        }

        if (this.type == 3) {

            this.data.forEach(item => {

                $("#" + this.makeSafeName(this.section) + "_" + this.makeSafeName(item.name) + "_" + this.makeSafeName(item.img)).addEventListener('click', () => { 

                    if (dyo.target == null) {
                        dyo.target = dyo.monument.getPartByType('Headstone');
                    }
                    
                    let target = dyo.target;

                    switch (self.section) {
                        case "borders":
        
                            target._select();
                            target.color_texture = item.path.replace("/s/", "/m/") + item.img + ".jpg";
                            target.applyColorTexture(this.section);

                            break;

                        case "motifs": case "inscriptions":

                            if (dyo.selected.colorTextureTarget == 0) {
                                dyo.selected.colorTextureTarget = 1;
                            }
                            
                            if (dyo.selected.colorTextureTarget != 2) {
                                dyo.selected.color_texture = item.path.replace("/s/", "/m/") + item.img + ".jpg";
                            }
                            if (dyo.selected.colorTextureTarget == 2) {
                                dyo.selected.color_texture2 = item.path.replace("/s/", "/m/") + item.img + ".jpg";
                            }
                            dyo.selected.applyColorTexture(item.path.replace("/s/", "/m/") + item.img + ".jpg");

                            break;
                    }

                });
                
            });

        }      
    
    }
	
	getContent() {
		return this.content;
	}
	
}