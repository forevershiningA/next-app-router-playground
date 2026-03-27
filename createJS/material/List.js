import { Component } from './Component.js';
import { Lang, Translate, $ } from '../Const.js';

export class List extends Component {
	constructor(dat = {}) {
		super(dat);

        this.data = dat.data;

        if ($(".container-" + this.id)) {
            this.container = $(".container-" + this.id);
        } else {
            this.container = $("div", "add", "container-" + this.id, this.stage);
        }

        this.hide();
    }

	render() {

        let self = this;
        let content = '';
        let type = dyo.config.getProductType();
        
		if (this.header_title) {
			content += `
			<div class="mdc-layout-grid">
				<div class="mdc-layout-grid__cell">
					<span id="header_${this.id}" class="mdc-typography--title">${this.title}</span>
				</div>
			</div>
			`
		}
		
		content += `<ul id="${this.id}" class="mdc-list mdc-list--two-line mdc-list--avatar-list">`;

        if (this.type == 1) {

			this.data.forEach(item => {

                if (item.class == type) {

                    let allow = true;

                    if (dyo.mode == "3d" && dyo.monument.id == 2350) {
                        allow = true;
                    }

                    if (dyo.mode == "3d") {
                        allow = item.m3d;
                    }

                    if (dyo.monument.id != 5) {
                        if (item.class == "plaques") {
                            if (item.fixed > 0) {
                                allow = false;
                            }
                        }
                    }

                    if (allow) {

                        let name = item.name;

                        if (this.id == "dyo_borders_list") {
                            if (dyo.monument.id == 5 || dyo.monument.id == 999) {
                                name = item.disp_name;
                            }
                        }
                        
                        content += `
                        <li class="mdc-list-item ${item.class}" id="${item.class}_${this.makeSafeName(item.name)}">
                            <span class="mdc-list-item__graphic" role="presentation">
                            <img alt="${name}" data-src="${dyo.xml_path}${item.img}" class="lazyload" width="32" height="32" border="0" />
                            </span>
                            <span class="mdc-list-item__text">
                            ${name}
                            </span>
                        </li>
                        `
                    }
                    this.lastItemName = item.name;

                } 

                if (item.class == "texture") {

                    let icon = "</span>";
                    let px = 32;

                    if (dyo.monument.id == 52) {
                        icon = '</span><i class="material-icons" style="float:right !important;pointer-events: none !important;">help_outline</i>';
                    }

                    if (dyo.monument.id == 7) {
                        px = 48;
                    }

                    content += `
                    <li class="mdc-list-item ${item.class}" id="${item.class}_${this.makeSafeName(item.name)}">
                        <span class="mdc-list-item__graphic" role="presentation">
                        <img alt="${item.name}" data-src="${dyo.xml_path}${item.img}" class="lazyload" width="${px}" height="${px}" border="0" />
                        </span>
                        <span class="mdc-list-item__text">
                        ${item.name}${icon}
                    </li>
                    `

                }
                
			});

        }
        
        // Saved Designs
	
        if (this.type == 2) {

            let path = dyo.path.forever + dyo.path.design5 + "../";

            if (dyo.path.php.indexOf("test") >-1) {
                path = path.replace("design/", "test-design/");
            }

            let url;
            let symbol = this.getCurrencySymbol(dyo.currency);
            let side = this.getCurrencySide(dyo.currency);
            let design_price;
            let allow = true;

            if (this.data.length > 0) {

                this.data.forEach(item => {
                    
                    if (allow) {

                        if (item.design_preview) {
                            if (item.design_preview.indexOf(".jpg") > -1) {
                                url = path + item.design_preview.replace(".jpg", "_small.jpg");
            
                                if (side == 0) {
                                    design_price = symbol + item.design_price;
                                }
            
                                if (side == 1) {
                                    design_price = item.design_price + " " + symbol;
                                }

                                let w = 40;
                                let ml = '1%';

                                if (dyo.w > 390 * 3) {
                                    w = 28;
                                }

                                if (dyo.engine.deviceType == Lang.MOBILE) {
                                    w = 100;
                                    ml = '1%';
                                }

                                let last_modified = item.design_lastmodified;
                                if (item.design_user_date != "") {
                                    last_modified = item.design_user_date;
                                }

                                if (dyo.usa) {
                                    let l = last_modified.split("-");
                                    let l2 = l[2].split(" ");
                                    let l3 = l2[1].split(":");
                                    last_modified = l[1] + "-" + l2[0] + "-" + l[0] + " " + l3[0] + ":" + l3[1];
                                } else {
                                    let l = last_modified.split("-");
                                    let l2 = l[2].split(" ");
                                    let l3 = l2[1].split(":");
                                    last_modified = l2[0] + "-" + l[1] + "-" + l[0] + " " + l3[0] + ":" + l3[1];
                                }

                                let showPrice = Translate(Lang.PRICE) + ": " + design_price + "<br/>";

                                if (dyo.sub_mode == "traditional") {
                                    showPrice = "";
                                }

                                content += `
                                <li id="design_${item.design_stampid}" style="width:${w}%; display: inline-table; margin-left: ${ml}; margin-bottom: 20px; pointer-events: none; background-color: #ddeffd; padding: 10px; overflow: hidden; ">

                                    <span style='text-transform:capitalize;margin: 16px 16px 16px 0px;'>
                                        <span class="mdc-typography--title">${Translate(Lang.DESIGN_NAME)}: ${item.design_name}</span>
                                        <hr/>
                                        <span class="mdc-list-item__primary-text">${showPrice}${Translate(Lang.CREATED)}: ${last_modified}</span>

                                        <br style="clear:both" />

                                        <div class="container-button" style="height: 240px !important;">
                                            <img id="img_design_more_${item.design_stampid}" class="lazyload" src="${url}" style="margin-top: 20px; pointer-events: auto; max-height: 210px !important; " border="0" />
                                        </div>

                                        <br style="clear:both" />
                                        <p>${Translate(Lang.REQUIREMENTS_1)}</p>

                                        <div class="container-button">
                                            <button id="design_edit_${item.design_stampid}" class="mdc-button mdc-button--raised mdc-button--padded" style="pointer-events: auto;">
                                                <span class="mdc-typography--caption">${Translate(Lang.EDIT)}</span>
                                            </button>
                                        </div>
                                        <div class="container-button">
                                            <button id="design_buy_${item.design_stampid}" class="mdc-button mdc-button--raised mdc-button--padded" style="pointer-events: auto;">
                                                <span class="mdc-typography--caption">${Translate(Lang.BUY)}</span>
                                            </button>
                                        </div>
                                        <div class="container-button">
                                            <button id="design_email_${item.design_stampid}" class="mdc-button mdc-button--raised mdc-button--padded" style="pointer-events: auto;">
                                                <span class="mdc-typography--caption">${Translate(Lang.EMAIL)}</span>
                                            </button>
                                        </div>
                                        <div class="container-button">
                                            <button id="design_more_${item.design_stampid}" class="mdc-button mdc-button--raised mdc-button--padded" style="margin-right:0px !important;pointer-events: auto;">
                                                <span class="mdc-typography--caption">${Translate(Lang.MORE)}</span>
                                            </button>
                                        </div>

                                    </span>
                                </li>
                                `
                            } else {
                                content += `
                                <li class="mdc-list-item" id="design_${item.design_stampid}">
                                    <span class="mdc-list-item__graphic" role="presentation">
                                    </span>
                                    <span class="mdc-list-item__text" style='text-transform:capitalize;'>
                                    </span>
                                </li>
                                `
                            }

                            let d = "account";

                            if (document.getElementsByClassName(d)[0]) {
                                document.getElementsByClassName(d)[0].scrollTo(0,0);
                            }

                            dyo.engine._events['img_design_more_' + item.design_stampid] = false;
                            dyo.engine._events['design_edit_' + item.design_stampid] = false;
                            dyo.engine._events['design_buy_' + item.design_stampid] = false;
                            dyo.engine._events['design_email_' + item.design_stampid] = false;
                            dyo.engine._events['design_more_' + item.design_stampid] = false;

                        }

                    }

                });

            } else {

                content += '<li class="mdc-list-item">' + Translate(Lang.YOU_HAVE_NO_SAVED_DESIGNS) + '</li>';

            }

        }

        // Add Your Image

        if (this.type == 3) {

            let path = dyo.path.forever + dyo.path.design5;

			this.data.forEach(item => {

                dyo.config._additions.Images.forEach(addition => {

                    if (item.id == addition.id) {

                        content += `
                        <li class="mdc-list-item" id="${item.class}_${this.makeSafeName(item.selector)}" style="height: 100px !important;">
                            <span class="mdc-list-item__graphic" role="presentation">
                            <img alt="${item.selector}" data-src="${dyo.xml_path}${item.img}" class="lazyload" alt="${item.name}" />
                            </span>
                            <span class="mdc-list-item__text" style='text-transform:capitalize;'>
                            ${item.name}
                            </span>
                            <i class="material-icons">help_outline</i>
                        </li>
                        `

                    }

                });

			});

        }

        // Select Product

        if (this.type == 4) {

            let allow = true;
            let header = '';
            let nr = 0;

			this.data.forEach(item => {

                allow = dyo.products.checkMode(item);
                
                if (allow) {

                    if (item.img) {

                        nr ++;

                        header = '';

                        if (item.header) {
                            header = `<h2>${item.header}</h2>`
                        }

                        if (item.live) {
                            content += `
                            ${header}
                            <li class="mdc-list-item ${item.class}" id="${item.class}_${this.makeSafeName(item.name)}">
                                <span class="mdc-list-item__graphic" role="presentation">
                                <img alt="${item.name}" data-src="${dyo.xml_path}${item.img}" class="lazyload" />
                                </span>
                                <span class="mdc-list-item__text">
                                ${item.name.replace("Black ", "")}
                                </span>
                            </li>
                            `
                        }

                    } else {

                        if (item.live) {
                            content += `
                            <li class="mdc-list-item ${item.class}" id="${item.class}_${this.makeSafeName(item.name)}">
                                <span style="line-height: 18px;">
                                ${item.name}
                                </span>
                            </li>
                            `
                        }

                    }

                }

            });
            
        }

        // Your Orders

        if (this.type == 5) {

            let path = dyo.path.forever + dyo.path.design5 + "../";

            if (dyo.path.php.indexOf("test") >-1) {
                path = path.replace("design/", "test-design/");
            }

            let url;
            let design_preview;
            let symbol = this.getCurrencySymbol(dyo.currency);
            let side = this.getCurrencySide(dyo.currency);
            let design_price;

            this.data.forEach(item => {

                let design_name = item.order_designname;
                let allow = true;

                let date = new Date(Number(item.order_designstampid));
                let month = ("0" + (date.getMonth() + 1)).slice(-2)
                let year = date.getFullYear();
                let path = dyo.path.forever + "design/saved-designs/screenshots/" + year + "/" + month + "/";

                let design_preview = item.order_designstampid + ".jpg";

                if (design_preview) {
                    url = path + design_preview.replace(".jpg", "_small.jpg");
                } else {
                    url = path + design_preview;
                }

                if (side == 0) {
                    design_price = symbol + item.order_designprice;
                }

                if (side == 1) {
                    design_price = item.order_designprice + " " + symbol;
                }

                let w = 40;
                let ml = '1%';

                if (dyo.w > 390 * 3) {
                    w = 28;
                }

                if (dyo.engine.deviceType == Lang.MOBILE) {
                    w = 100;
                    ml = '1%';
                }

                let last_modified = item.order_date;

                if (dyo.usa) {
                    let l = last_modified.split("-");
                    last_modified = l[1] + "-" + l[2] + "-" + l[0];
                } 

                let showPrice = Translate(Lang.PRICE) + ": " + design_price + "<br/>";

                if (dyo.sub_mode == "traditional") {
                    showPrice = "";
                }

                if (allow) {
                    content += `
                    <li id="order_${item.order_id}" style="width:${w}%; display: inline-table; margin-left: ${ml}; margin-bottom: 20px; pointer-events: none; background-color: #ddeffd; padding: 20px; overflow: hidden; ">

                        <span style='text-transform:capitalize;margin: 16px 16px 16px 0px;'>
                            <span class="mdc-typography--title">${Translate(Lang.ORDER_ID)}: ${item.order_id}</span>
                            <hr/>
                            <span class="mdc-list-item__primary-text">${Translate(Lang.DESIGN_NAME)}: ${item.order_designname}<br/>${showPrice}${Translate(Lang.CREATED)}: ${last_modified}</span>
                        
                            <br style="clear:both" />

                            <div class="container-button" style="height: 240px !important; " >
                                <img id="img_design_more_${item.design_stampid}" src="${url}" class="lazyload" style="margin-top: 20px; pointer-events: auto; max-height: 210px;" border="0" />
                            </div>

                            <br style="clear:both" />

                            <div class="container-button">
                                <button id="design_edit_${item.design_stampid}" class="mdc-button mdc-button--raised mdc-button--padded" style="pointer-events: auto;">
                                    <span class="mdc-typography--caption">${Translate(Lang.MORE)}</span>
                                </button>
                            </div>
                        </span>

                    </li>
                    `
                    dyo.engine._events['order_' + item.order_id] = false;
                }

                let d = "account";

                if (document.getElementsByClassName(d)[0]) {
                    document.getElementsByClassName(d)[0].scrollTo(0,0);
                }
                
            });

        }

        // Select Motif

        if (this.type == 6) {

			this.data.forEach(item => {
                    
                let c = "";
                let c2 = "";
                let c3 = "";
                let c4 = "";

                if (item.traditional == true) {
                    c = "traditional_motif";
                }
                if (item.ss == true) {
                    c2 = "ss_motif";
                }
                if (item.col1 == true) {
                    c3 = "col1_motif";
                }
                if (item.col2 == true) {
                    c4 = "col2_motif";
                }

                let allow = true;

                if (dyo.monument.id != 31) {
                    if (item.col1 || item.col2) {
                        allow = false;
                    }
                }

                if (item.img) {
                    if (allow) {
                        content += `
                        <li class="mdc-list-item ${c} ${c2} ${c3} ${c4} ${item.class}" id="${item.class}_${this.makeSafeName(item.name)}">
                            <span class="mdc-list-item__graphic" role="presentation">
                            <img alt="${item.name}" data-src="${dyo.xml_path}${item.img}" class="lazyload" width="32" height="32" />
                            </span>
                            <span style="line-height: 18px;">
                            ${item.name}
                            </span>
                        </li>
                        `
                    }
                } else {
                    if (allow) {
                        content += `
                        <li class="mdc-list-item ${c} ${c2} ${c3} ${c4} ${item.class}" id="${item.class}_${this.makeSafeName(item.name)}">
                            <span style="line-height: 18px;">
                            ${item.name.replace(" & ", "_and_")}
                            </span>
                        </li>
                        `
                    }
                }

                /*
                if (item.traditional) {
                    if (item.img) {
                        content += `
                        <li class="mdc-list-item traditional_motif ${item.class}" id="${item.class}_${this.makeSafeName(item.name)}">
                            <span class="mdc-list-item__graphic" role="presentation">
                            <img alt="${item.name}" data-src="${dyo.xml_path}${item.img}" class="lazyload" width="32" height="32" />
                            </span>
                            <span style="line-height: 18px;">
                            ${item.name}
                            </span>
                        </li>
                        `
                    } else {
                        content += `
                        <li class="mdc-list-item traditional_motif ${item.class}" id="${item.class}_${this.makeSafeName(item.name)}">
                            <span style="line-height: 18px;">
                            ${item.name.replace(" & ", "_and_")}
                            </span>
                        </li>
                        `
                    }
                } else {
                    content += `
                    <li class="mdc-list-item ${item.class}" id="${item.class}_${this.makeSafeName(item.name)}">
                        <span class="mdc-list-item__graphic" role="presentation">
                        <img alt="${item.name}" data-src="${dyo.xml_path}${item.img}" class="lazyload" width="32" height="32" />
                        </span>
                        <span style="line-height: 18px;">
                        ${item.name}
                        </span>
                    </li>
                    `
                }
                */

            });
            
        }

        // Fixing System
        if (this.type == 7) {

            let path = dyo.path.forever + dyo.path.design5;

			this.data.forEach(item => {

                if (item.class == type) {

                    let id = `${item.class}_${this.makeSafeName(item.name)}`
                    let tr_job = Translate(Lang[this.makeSafeName(item.name).toUpperCase()]);

                    if (tr_job == undefined) {
                        tr_job = item.name;
                    }

                    let more_info = '';
                    let img = item.img;
                    let selected = '';

                    if (item.name == "Lugs with Studs") {
                        selected = ' mdc-list-selected';
                    }

                    if (item.name == "Straight") {
                        selected = ' mdc-list-selected';
                        dyo.monument.cornerType = 2;
                    }

                    if (item.name == "No drilled holes") {
                        selected = ' mdc-list-selected';
                        dyo.monument.holeType = 3;
                    }

                    if (dyo.monument.id == 8) {
                        img = img.replace("base", "pet-base");
                        img = img.replace("flat", "pet-flat");
                        img = img.replace("ground", "pet-ground");
                    }

                    content += `
                    <li class="mdc-list-item${selected}" id="${id}" style="height: 100px !important;">
                        <span class="mdc-list-item__graphic" role="presentation" style="pointer-events: none !important;">
                        <img width="64" height="64" data-src="${dyo.xml_path}${img}" class="lazyload" alt="${item.name}" />
                        </span>
                        <span style="line-height: 18px; pointer-events: none;">
                        ${tr_job}
                        </span>
                        ${more_info}
                    </li>
                    `

                }

            });
            
        }

        // Select Motifs Type
        if (this.type == 8) {

			this.data.forEach(item => {

                dyo.config._additions.Motifs.forEach(addition => {

                    if (item.id == addition.id) {

                        content += `
                        <li class="mdc-list-item" id="${item.class}_${this.makeSafeName(item.selector)}" style="height: 100px !important;">
                            <span class="mdc-list-item__graphic" role="presentation">
                            <img data-src="${dyo.xml_path}${item.img}" class="lazyload" alt="${item.name}" />
                            </span>
                            <span class="mdc-list-item__text" style='text-transform:capitalize;'>
                            ${item.name}
                            </span>
                            <i class="material-icons">help_outline</i>
                        </li>
                        `

                    }

                });

			});

        }

        // Select Material Image
        if (this.type == 9) {

			this.data.forEach(item => {

                content += `
                <li class="mdc-list-item ${item.class}" id="${item.class}_${this.makeSafeName(item.name)}" style="height: 100px !important;">
                    <span class="mdc-list-item__graphic" role="presentation">
                    <img alt="${item.name}" data-src="${dyo.xml_path}${item.img}" class="lazyload" border="0" />
                    </span>
                    <span class="mdc-list-item__text">
                    ${item.name}
                    </span>
                </li>
                `
                
			});

        }

        content += '</ul>';

        this.container.innerHTML = content;

        dyo.engine.loader.hide("List 2");

        if (this.events == undefined || this.events == true) {
            self.parent.events();
        }
        
        if (self._hide) {
            self._hide = false;
            self.hide();
        } else {
            self.show();
        }
    
    }
    
    hide() {
        this.container.style.display = "none";
    }

    show() {
		this.container.style.display = "block";
    }

    showOnlyFirst() {
        let nr = 0;
        this.data.forEach(item => {
            nr ++;
            let id = `${item.class}_${this.makeSafeName(item.name)}`;
            switch (nr) {
                case 1: case 5: case 999:
                    break;
                default:
                    $("#" + id).style.display = "none";
                    break;
            }
        });
    }

    showAll() {
        this.data.forEach(item => {
            let id = `${item.class}_${this.makeSafeName(item.name)}`;
            $("#" + id).style.display = "flex";
        });
    }

	getContent() {
		return this.content;
	}
	
}