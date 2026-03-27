import { Drawer, Dialog, TextField, Select, Slider, List } from '../material/MaterialDesign.js';
import { Lang, Translate, $ } from '../Const.js';
import { Component } from '../material/Component.js';

export class Products extends Component {

	constructor(data = {}) {
        super(data);
        
        dyo.products = this;

        this.container = $("div", "add", "container", this.stage);
        this.hide();
    }

    show() {
        dyo.currentSection = "Products";
        dyo.last_url = "select-product";
        this.container.style.display = "block";
    }

    update() {
        $("#back_to_menu_" + this.title, Translate(Lang.BACK_TO_DESIGN_MENU));
    }

    render() {

        this.menu = new Drawer({
            stage: this.container,
            drawer_type: 0,
            toolbar_type: 1,
            title: this.title,
            id: "dyo_products"
        });
        this.menu.render();

        this.input = new List({
            stage: $("#dyo_products-mdc-list"),
            parent: this,
            id: "dyo_products_list",
            type: 4,
            data: this.products,
            title: Lang.SELECT_PRODUCTS
        });
        this.input.render();

    }

    selectProduct(id) {

        if (id == undefined) {
            id = dyo.monument.tmp_product_id;
        }

        if (dyo.path.forever == "https://www.forevershining.com.au/" || dyo.local) {

            let ext = "php";

            switch (dyo.mode) {
                case "3d":
                    window.onbeforeunload = null;
                    document.location.href = "index3d." + ext + "?product-id" + id + "#design-menu";
                    break;
                case "2d":
                    window.onbeforeunload = null;
                    document.location.href = "index." + ext + "?product-id" + id + "#design-menu";
                    break;
            }

            return;
        
        } else {

            $("#openfl").style.visibility = "hidden";
            
            //if (dyo.mode == "2d") {
                dyo.design.newDesign();

                if (id == undefined) {
                    dyo.monument.id = dyo.monument.tmp_product_id;
                } else {
                    dyo.monument.id = id;
                }

                if (dyo.mode == "3d") {

                    dyo.monument.full_monument = false;
                    dyo.monument.switch_full_monument = false;
        
                    dyo.config._config.type = "headstone";

                    if ($('#full_monument-switch')) {
                        $('#full_monument-switch').checked = '';
                    }
                    if ($("#dyo_add_headstone_base")) {
                        $("#dyo_add_headstone_base").style.display = "flex";
                    }
                    if ($("#dyo_full_monument")) {
                        $("#dyo_full_monument").style.display = "flex";
                    }

                    if (id == undefined) {
                        dyo.monument.id = dyo.monument.tmp_product_id;
                    } else {
                        dyo.monument.id = id;
                    }
        
                    if (id == 124) {
                        dyo.monument.id = 102;
                    }
                    if (dyo.monument.tmp_product_id == 124) {
                        dyo.monument.tmp_product_id = 102;
                        dyo.monument.id = 102;
                    }

                    if (dyo.monument.id == 100 || dyo.monument.id == 101) {
                        dyo.monument.full_monument = true;
                        dyo.monument.switch_full_monument = true;
                        dyo.config._config.type = "full-monument";

                        if ($('#full_monument-switch')) {
                            $('#full_monument-switch').checked = 'checked';
                        }
                        if ($("#dyo_add_headstone_base")) {
                            $("#dyo_add_headstone_base").style.display = "none";
                        }
                        if ($("#dyo_full_monument")) {
                            $("#dyo_full_monument").style.display = "flex";
                        }
                    }

                    if (dyo.monument.id != 5) {
                        if (dyo.borderLoaded) {
                            dyo.engine.removeBorder();
                        }
                    }

                }
                
                dyo.monument.Product();
                dyo.engine.show();

                dyo.engine.dialog_resp.hide();
                
                document.location.href = "#design-menu";

        }
        
    }

    checkMode(product) {

        let dyo_mode;
        let allow = true;

        switch (dyo.mode) {
            case "2d":
                dyo_mode = 2;
                break;
            case "3d":
                dyo_mode = 3;
                break;
        }

        switch (product.mode) {
            case 1:
                allow = true;
                break;
            case 2:
                if (dyo_mode == 2) {
                    allow = true;
                } else {
                    allow = false;
                }
                break;
            case 3:
                if (dyo_mode == 3) {
                    allow = true;
                } else {
                    allow = false;
                }
                break;
        }

        if (dyo.pet == true && product.pet == false) {
            allow = false;
        } 

        if (dyo.pet == true && product.pet == true) {
            allow = true;
        } 

        return allow;
    }

    popup() {

        dyo.engine.popupActive = true;

        let html = $("#dyo_products-mdc-list").innerHTML;

        html =  html.split('products_').join('popup_products_');

        dyo.engine.dialog_resp.title = Translate(Lang.SELECT_PRODUCT)
        dyo.engine.dialog_resp.body = html;
        dyo.engine.dialog_resp.accept = "";
        dyo.engine.dialog_resp.decline = Translate(Lang.CLOSE)
        dyo.engine.dialog_resp.action = dyo.engine.contactForm;
        dyo.engine.dialog_resp.render();
        dyo.engine.dialog_resp.show();

        if (dyo.template == 2) {
            let c = 'skinAU_386047';
            $("#resp-header").classList.add(c);
            $("#resp-footer").classList.add(c);
        }

        let self = this;
        let id;
        let mode;
        let type = 'products';//dyo.config.getProductType();

        this.products.forEach(product => {

            mode = product.mode;

            if (product.class == type) {

                id = '#popup_' + product.class + "_" + this.makeSafeName(product.name);

                if ($(id) != undefined) {

                    $(id).addEventListener('click', () => { 
                        dyo.monument.tmp_product_id = product.product_id;
                        
                        self.beforeSelectProduct();

                    });

                }

            }

        });

        $("#accept_button").style.visibility = "hidden";

    }

    beforeSelectProduct() {

        dyo.engine.dialog_resp.hide();

        let self = this;
        let dialog = dyo.engine.dialog;

        if (dyo.design_exists && dyo.engine.designSaved == false) {
            dialog.title = Translate(Lang.ARE_YOU_SURE_YOU_WANT_TO_START_NEW_DESIGN);
            dialog.body = Translate(Lang.YOUR_CURRENT_DESIGN_WILL_BE_LOST);
            dialog.accept = Translate(Lang.YES);
            dialog.decline = Translate(Lang.NO);
            dialog.action = dyo.products.selectProduct;
            dialog.render();
            dialog.show();

            if (dyo.template == 2) {
                let c = 'skinAU_386047';
                $("#dialog-header").classList.add(c);
                $("#dialog-footer").classList.add(c);
            }
        } else {
            dyo.products.selectProduct(dyo.monument.tmp_product_id);
        }

    }

    events() {

        let self = this;
        let id;
        let allow;
        let type = 'products';//dyo.config.getProductType();

        this.products.forEach(product => {

            allow = dyo.products.checkMode(product);

            if (allow) {

                if (product.live) {
                        
                    if (product.class == type) {

                        id = '#' + product.class + "_" + this.makeSafeName(product.name);

                        if (dyo.engine.deviceType == "desktop") {
                        
                            $(id).addEventListener('mouseover', () => { 

                                $("#tutorial-header", product.name);
                                $("#tutorial-description", `<div class="select-products"><img alt="${product.name}" src="${dyo.xml_path}${product.img.replace("small", "medium")}" style="pointer: none; float:left; margin: 0px 40px 70px 0px;" /></div>` + product.description);

                                dyo.engine.tutorial.show(product.nr);

                            });

                            $(id).addEventListener('mouseout', () => { 
                                dyo.engine.tutorial.hide();
                            });

                        }

                        $(id).addEventListener('click', () => { 

                            dyo.monument.tmp_product_id = product.product_id;

                            let img = dyo.xml_path + product.img.replace("-small", "-medium");
                            let name = "product_" + this.makeSafeName(product.name);
                            let body = "";

                            if (product.youtube) {
                                body = `<div class="select-products"><img id="${name}" src="${img}" alt="${product.name}" />
                                <span class="mdc-typography">${product.description}
                                <ul><li style="list-style-type: none"><a href="${product.youtube}" target="_blank">${Translate(Lang.CLICK_HERE_TO_WATCH_A_DESIGN_YOUR_OWN_HELP_VIDEO)}</a></li></ul>
                                </span>
                                </div>`
                            } else {
                                body = `<div class="select-products"><img id="${name}" src="${img}" alt="${product.name}" />
                                <span class="mdc-typography">${product.description}
                                </span>
                                </div>`
                            }

                            dyo.engine.dialog_resp.title = product.name;
                            dyo.engine.dialog_resp.body = body;
                            dyo.engine.dialog_resp.accept = Translate(Lang.START_DESIGN);
                            dyo.engine.dialog_resp.decline = Translate(Lang.CLOSE);
                            dyo.engine.dialog_resp.action = self.beforeSelectProduct;
                            dyo.engine.dialog_resp.render();
                            dyo.engine.dialog_resp.show();

                            if (dyo.template == 2) {
                                let c = 'skinAU_386047';
                                $("#resp-header").classList.add(c);
                                $("#resp-footer").classList.add(c);
                            }

                            $('#' + name).addEventListener('click', () => { 

                                dyo.monument.tmp_product_id = product.product_id;

                                self.beforeSelectProduct();
                                
                            });

                        });

                    }

                }

            }

        });

    }
	
}