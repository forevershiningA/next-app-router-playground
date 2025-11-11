import { Data } from './dyo/Data.js';
import { Headstone } from './dyo/Headstone.js';
import { Base } from './dyo/Base.js';
import { Ledger } from './dyo/Ledger.js';
import { Kerbset } from './dyo/Kerbset.js';
import { Border } from './dyo/Border.js';
import { Inscription } from './dyo/Inscription.js';
import { Motif } from './dyo/Motif.js';
import { Emblem } from './dyo/Emblem.js';
import { Photo } from './dyo/Photo.js';
import { $, Lang, Translate, File } from './Const.js';
import { Component } from './material/Component.js';

import { MotifsData, EmblemsData, InscriptionsData, EpitaphData, Fonts } from './dyo/Data.js';


export class Design extends Component {

	constructor() {
        super();
        
        dyo.design = this;
        dyo.design.loadQueueState = false;

        this.fontsHeight = [];
        this.clearCache();

    }

    clearCache() {
        this.cache = {
            Bitmaps: [],
            DesignList: [],
            Designs: [],
            Orders: [],
            OrdersList: []
        }
    }

    switchMode() {
        let ext = "php";
        if (dyo.local) {
            ext = "html";
        }
        
        switch (dyo.mode) {
            case "2d":
                switch (dyo.monument.id) {
                    default:
                        window.onbeforeunload = null;
                        document.location.href = "index3d." + ext + "?product-id" + dyo.monument.id;
                        break;
                    case 124:
                        window.onbeforeunload = null;
                        document.location.href = "index3d." + ext + "?product-id102";
                        break;
                    case 7: case 135: case 2350:
                        window.onbeforeunload = null;
                        document.location.href = "index3d." + ext;;
                        break;
                }
                break;
            case "3d":
                window.onbeforeunload = null;
                switch (dyo.monument.id) {
                    default:
                        document.location.href = "index." + ext + "?product-id" + dyo.monument.id;
                        break;
                    case 100: 
                        document.location.href = "index." + ext + "?product-id4";
                        break;
                    case 101:
                        document.location.href = "index." + ext + "?product-id124";
                        break;
                    case 102:
                        document.location.href = "index." + ext + "?product-id124";
                        break;
                }
                break;
        }
    }

    clearDesigns() {
        this.cache = {
            Bitmaps: [],
            DesignList: [],
            Designs: [],
            Orders: [],
            OrdersList: []
        }
        if ($("#dyo_saved_design_list")) {
            $("#dyo_saved_design_list").outerHTML = "";
        }
    }


    getDesignsCount() {

        dyo.engine.loader.force = true;
        dyo.engine.loader.show();

        let data = new FormData();
        data.append('customer_email', sessionStorage.getItem('customer_email'));
        data.append('customer_password', sessionStorage.getItem('customer_password'));
        data.append('mode', dyo.mode);

        fetch(dyo.path.get_designs_count, {
            method: 'POST',
            body: data
        })
        .then(response => response.text())
        .then(data => {
            dyo.totalDesigns = Number(JSON.parse(data)[0]);

            if (dyo.totalDesigns < 10) {
                $(".range").style.display = "none";
            } else {
                $(".range").style.display = "none";
            }

            dyo.engine.loader.force = false;
            dyo.engine.loader.hide();

            dyo.account.addRange();
        })
        .catch(error => { 
            dyo.engine.loader.hide(); 
            console.error('Error:', error) 
        });

    }

    getDesigns() {

        dyo.engine.loader.force = true;
        dyo.engine.loader.show();

        if (this.cache.DesignList.length == 0 ||
            this.cache.DesignList.length == 1) {

            let data = new FormData();
            data.append('customer_email', sessionStorage.getItem('customer_email'));
            data.append('customer_password', sessionStorage.getItem('customer_password'));
            data.append('design_start', dyo.design_start);
            data.append('design_end', dyo.design_end);
            data.append('mode', dyo.mode);

            fetch(dyo.path.get_designs, {
                method: 'POST',
                body: data
            })
            .then(response => response.text())
            .then(data => {

                //console.log(data);

                this.cache.DesignList = JSON.parse(data);
                if (this.cache.DesignList.length > 0) {
                    this.cacheDesigns();
                } else {
                    dyo.engine.loader.force = false;
                    dyo.engine.loader.hide();
                }
            })
            .catch(error => { 
                dyo.engine.loader.hide(); 
                console.error('Error:', error) 
            });

        } else {

            dyo.engine.loader.force = false;
            dyo.engine.loader.hide();

            dyo.engine.account.design_list.data = this.cache.DesignList;
            dyo.engine.account.design_list.render();
            
        }

        this.getOrders(false);

    }

    cacheDesigns(opt) {

        if (dyo.engine.account.design_list) {
            dyo.engine.account.design_list.data = this.cache.DesignList;
            dyo.engine.account.design_list.render();
        }

        this.designNr = 0;
        let arr = dyo.design.cache.DesignList;

        dyo.design.cache.DesignList.forEach(design => {

            if (arr[arr.length - 1] === design){
                dyo.engine.loader.force = false;
                dyo.engine.loader.hide();
            }

            dyo.design.cache.Designs[Number(design.design_stampid)] = {};
            dyo.design.cache.Designs[Number(design.design_stampid)].productid = design.design_productid;

            if (opt) {
                dyo.design.loadDesign();
            }

        });

    }
    
    getOrdersCount() {

        dyo.engine.loader.force = true;
        dyo.engine.loader.show();

        let data = new FormData();
        data.append('customer_email', sessionStorage.getItem('customer_email'));
        data.append('customer_password', sessionStorage.getItem('customer_password'));
        data.append('mode', dyo.mode);

        fetch(dyo.path.get_orders_count, {
            method: 'POST',
            body: data
        })
        .then(response => response.text())
        .then(data => {
            if (dyo.engine.isJSON(data)) {
                dyo.totalOrders = Number(JSON.parse(data)[0]);
            }

            dyo.engine.loader.force = false;
            dyo.engine.loader.hide();

            dyo.account.addRange();
        })
        .catch(error => { 
            dyo.engine.loader.hide(); 
            console.error('Error:', error) 
        });

    }

    getOrders(show) {

        dyo.engine.loader.show("Design:151");

        if (show) {

            if (this.cache.OrdersList.length == 0) {

                let data = new FormData();
                data.append('customer_email', sessionStorage.getItem('customer_email'));
                data.append('customer_password', sessionStorage.getItem('customer_password'));
                data.append('design_start', dyo.design_start);
                data.append('design_end', dyo.design_end);

                let path = dyo.path.get_orders;

                if (dyo.path.php.indexOf("test") >-1) {
                    path = path.replace("design/", "test-design/");
                }

                fetch(dyo.path.get_orders, {
                    method: 'POST',
                    body: data
                })
                .then(response => response.text())
                .then(data => {
                    this.cache.OrdersList = JSON.parse(data);
                    this.cacheOrders();
                });

            } else {
                dyo.engine.account.orders_list.data = this.cache.OrdersList;
                dyo.engine.account.orders_list.render();
            }

        } else {
            dyo.engine.account.orders_list.hide();
        }

        dyo.engine.loader.hide("Design:221");

    }

    cacheOrders() {

        let data = '';

		dyo.engine.account.orders_list.data = this.cache.OrdersList;
		dyo.engine.account.orders_list.render();

        if (document.location.href.indexOf("your-orders") == -1) {
            dyo.engine.account.orders_list.hide();
        }

        for (let nr = 0; nr < this.cache.OrdersList.length; nr++ ) {

            if (this.cache.OrdersList[nr]) {

                this.cache.OrdersList[this.cache.OrdersList[nr].order_designstampid] = [];

                data = this.getOrderData(this.cache.OrdersList[nr].order_designstampid);
                this.cache.OrdersList[this.cache.OrdersList[nr].order_designstampid] = data;

            }

        }

        let id = setInterval(checkLoad, 5);
		let orders = this.cache;
		
        function checkLoad() {

            let status = true;
			
            for (let key in orders.Orders) {
                if (orders.Orders[key].length == 0) {
                    status = false;
                }
            }

            if (status) {
                clearInterval(id);

                let orders_id = setInterval(checkLoad_Orders, 5);

                function checkLoad_Orders() {

                    if (dyo.design.cache.OrdersList) {
                        dyo.engine.account.orders_list.data = dyo.design.cache.OrdersList;
                        dyo.engine.account.orders_list.render();
                        dyo.engine.loader.hide("Design:221");
                        clearInterval(orders_id);

                        if (document.location.href.indexOf("your-orders") == -1) {
                            dyo.engine.account.orders_list.hide();
                        } 
                    }

                }

            }

        }

    }

    getOrderData(id) {

        let design_data = [];
        let item_id = -1;
        
        let url = dyo.path.read_file + "../" + dyo.path.saved_designs + "html/" + id + ".html";

        //console.log(url);

        fetch(url, { method: 'GET' })
        .catch(error => { 
            dyo.engine.loader.hide(); 
            console.error('Error:', error) 
        })
        .then(response => response.text())
        .then(data => {
            design_data = data;
        });

        return design_data;

    }

	newDesign() {

        dyo.monument.container.regX = dyo.w / 2;
        switch (dyo.monument.id) {
            default:
                dyo.engine.sizes.setup();
                break;
            case 32:
                break;

        }

        dyo.edit = false;

        dyo.newDesign = true;
        dyo.uniqueid = Date.now();
        dyo.monument.itemID = 0;

        this.design_data = undefined;
        dyo.engine.account.hide();
        dyo.engine.show();

        if (dyo.monument.headstone) {
            if (dyo.monument.headstone.background) {

                try {
                    dyo.monument.headstone.background = "";
                    dyo.monument.headstone.texture = File('table').color;
                }
                catch(e) {
                    console.log(e);
                }

            }
        }
        if (dyo.monument.base) {
            dyo.monument.base.texture = File('table').color;
        }

        if (dyo.monument.has_base) {

            dyo.target = dyo.monument.base;
            dyo.monument.removeAllItems("Design:375");
            
            let Width = Number(File('stand').init_width);
            let Height = Number(File('stand').init_height);
            let Length = Number(File('stand').init_depth);

            if (dyo.metric == "inches") {
                Width = dyo.engine.metrics.convertToInches(Width);
                Height = dyo.engine.metrics.convertToInches(Height);
                Length = dyo.engine.metrics.convertToInches(Length);
            }
    
            dyo.controller_Width.setValue(Width);
            dyo.controller_Height.setValue(Height);

            dyo.monument.has_base = false;
			dyo.monument.has_base_flower_pot_holes = false;
			dyo.monument.has_base_flower_pots = 3;

			if (dyo.monument.base) {
				dyo.monument.base.hide();
			}

            if ($('#base-switch')) {
			    $('#base-switch').checked = '';
            }
            if ($('#dyo_add_headstone_base_flower_pot_holes')) {
			    $('#dyo_add_headstone_base_flower_pot_holes').style.display = "none";
            }
            if ($('#base-flower-pot-holes-switch')) {
			    $('#base-flower-pot-holes-switch').checked = '';
            }
            if ($('#base_flower_pots')) {
			    $('#base_flower_pots').style.display = "none";
            }
            if ($('#radio-3')) {
			    $('#radio-3').checked = 'checked';
            }

        } 

        if (dyo.monument.id == 9 ||
            dyo.monument.id == 22) {

            this.installations.forEach(installation2 => {
                let id2 = installation2.class + "_" + this.makeSafeName(installation2.name);
                if ($('#' + id2)) {
                    $('#' + id2).classList.remove("mdc-list-selected");
                }
            });

            if ($('#mini-headstones_mini_headstone_only_lay_flat')) {
                $('#mini-headstones_mini_headstone_only_lay_flat').classList.add("mdc-list-selected");
            }
        }

        dyo.target = dyo.monument.headstone;
        dyo.monument.removeAllItems("Design:409");

        let Width = Number(File('table').init_width);
        let Height = Number(File('table').init_height);
        let Length = Number(File('table').init_depth);

        if (dyo.metric == "inches") {
            Width = dyo.engine.metrics.convertToInches(Width);
            Height = dyo.engine.metrics.convertToInches(Height);
            Length = dyo.engine.metrics.convertToInches(Length);
        }

        dyo.controller_Width.setValue(Width);
        dyo.controller_Height.setValue(Height);
        dyo.monument.updateMonument("design: 252");

        if (dyo.monument.headstone) {
            if (dyo.monument.headstone.background) {
                try {
                    dyo.monument.headstone.background = "";
                }
                catch(e) {
                    console.log(e);
                }
            }
        }

        if (dyo.monument.id == 5 ||
            dyo.monument.id == 999) {

            let Product = dyo.monument.getPartByType('Headstone');
            Product.setName("Rectangle (Landscape)");
            Product.setShape("Square");
            Product.setFixed(0);
            Product.setBorder("Border 1");
            Product.texture = File('table').color;
            Product.applyTexture();
            Product.render();

            $('#fixingType', Translate(Lang.FIXING_SYSTEM));

            dyo.monument.fixingSystemType = 2;

            let fixingSystem = dyo.engine.getFixing();
            
            fixingSystem.forEach(fixing => {

                let id = fixing.class + "_" + this.makeSafeName(fixing.name);
                
                if ($('#' + id)) {
                    $('#' + id).classList.remove("mdc-list-selected");
                }

            });

        } else {
            dyo.monument.headstone.applyTexture();
            if (dyo.monument.base) {
                dyo.monument.base.applyTexture();
            }
        }

        dyo.target = dyo.monument.headstone;
        dyo.monument.updateHeader("Design: 283");

        dyo.engine.motifs.fullListVisible = true;
        dyo.engine.motifs.reset();

        if (dyo.mode == "3d") {
            if (dyo.config._config.type == "headstone") {
                dyo.engine3d.stand3d.changeProperty("width", 1);
                dyo.engine3d.stand3d.changeProperty("height", 1);
                dyo.engine3d.stand3d.changeProperty("depth", 1);
            }
            dyo.monument.headstone.removeGround();
        }

        let config_name, config_border;

        switch (dyo.monument.id) {
            default:
                config_name = dyo.monument._shapes[0].name;
                break;
            case 4: case 8: case 22: case 124: case 100: case 101: case 102:
                config_name = dyo.monument._shapes[9].name;
                break;
        }

        dyo.target.setName(config_name);
        dyo.target.setShape(config_name);
        if (dyo.monument.id == 7) {
            dyo.target._bmp = undefined;
            dyo.target.applyTexture();
            dyo.monument.materialImage = 1;

            dyo.engine.materials.data_image.forEach(material_image => {

                let id3 = material_image.class + "_" + this.makeSafeName(material_image.name);
                if ($('#' + id3)) {
                    $('#' + id3).classList.remove("mdc-list-selected");
                }

            });
        }
        if (dyo.monument.id == 31) {
            dyo.target.setBorder("No Border");
            dyo.borders.selectBorder("plaques_no_border");
            dyo.stands.selectStand("plaques_no_stand");
        }
        if (dyo.monument.id == 39) {
            dyo.target.setBorder("No Border");
            dyo.borders.selectBorder("plaques_no_border");
        }
        if (dyo.monument.id == 32) {
            dyo.monument.headstone.border = "No Border";
            dyo.target.setBorder("No Border");
            dyo.borders.selectBorder("fullcolourplaque_no_border");

            dyo.target._bmp = undefined;
            dyo.target.applyTexture();
        }
        if (dyo.monument.id == 2350) {
            dyo.target._bmp = undefined;
            dyo.target.applyTexture();
        }
        if (dyo.monument.id == 135) {
            dyo.target.setNote(config_name.toLowerCase());
        }

        dyo.target.render();
        dyo.engine.designMenu();

        $("#dyo_new_design").style.display = "none";

	}
	
	loadDesign() {

        if (!dyo.accountMode) {
            dyo.currentSection = "Sizes";
            dyo.engine.canvas.hide();
            dyo.edit = true;
            dyo.design.Load(dyo.monument.design_stampid);
            
        } else {
            let p = dyo.path.forever + dyo.path.design5;
            window.onbeforeunload = null;

            switch (Number(dyo.monument.design_mode)) {
                case 998:
                    document.location.href = p + "index3d.php" + "?edit" + dyo.monument.design_stampid;
                    break;
                case 999:
                    document.location.href = p + "index.php" + "?edit" + dyo.monument.design_stampid;
                    break;
            }
        }

    }
    
    Load(url) {

        dyo.engine.designSaved = true;
        dyo.edit = true;

        let allow = true;

        if (isNaN(url)) {
            allow = false;
            dyo.engine.loader.hide();
        } else {
            dyo.engine.loader.show();
        }

        if (allow) {

            let design_data = [];
            let item_id = -1;

            let path = dyo.path.saved_designs;
            let _url = "../" + path + "xml/" + url + ".xml";

            path = dyo.path.read_file;
    
            fetch(path + _url, { method: 'GET' })
            .catch(error => { 
                console.error('Error:', error) 
            })
            .then(response => response.text())
            .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
            .then(data => {
    
                [].map.call(data.querySelectorAll("item"), function(item) {
    
                    let node, childNodes = item.childNodes;

                    item_id ++;
                    design_data[item_id] = [];
    
                    if (item_id == 0) {
                        design_data[item_id]["design_stampid"] = url;
                    }
    
                    for (let i = 0; i < childNodes.length; i++) {
                        node = childNodes[i];
                        if (node.nodeType !== Node.TEXT_NODE) {
                            design_data[item_id][node.nodeName] = node.textContent;
                        }
                    }
    
                });

                dyo.monument.itemID = 0;

                url = String(url);
    
                dyo.monument.removeAllItems("Design:531");

                //if (window.location.href.indexOf("edit") == -1) {

                    if (dyo.path.forever.indexOf("www.forevershining.com.au") > -1 || dyo.local) {
                    //if (dyo.path.forever == "https://www.forevershining.com.au/" && !dyo.local) {
                        if (dyo.monument.id != Number(design_data[0].productid)) {

                            let p = dyo.path.forever + dyo.path.design5;
                            p = '';

                            window.onbeforeunload = null;

                            switch (Number(dyo.monument.design_mode)) {
                                case 998:
                                    document.location.href = p + "index3d.php?product-id" + Number(design_data[0].productid) + "&edit" + url;
                                    break;
                                case 999:
                                    document.location.href = p + "index.php?product-id" + Number(design_data[0].productid) + "&edit" + url;
                                    break;
                            }

                        }
                    }

                //}

                dyo.monument.id = Number(design_data[0].productid);
                dyo.product_id = dyo.monument.id;
                dyo.design.design_data = design_data;

                if (design_data[0].promo_code != "") {
                    dyo.engine.promoCodeValue = design_data[0].promo_code;
                }

                dyo.monument.Product();

                dyo.uniqueid = Date.now();
                
                if (dyo.engine.mobileDevice && dyo.engine.deviceType == "mobile") {
                    $("#button_dyo_menu").click();
                }

                dyo.engine.show();

                dyo.monument.container.regX = dyo.w / 2;

            });
            
        }

    }

	saveDesign() {

        let design = dyo.engine.design_name;

        design.title = Translate(Lang.PLEASE_ENTER_NAME_FOR_YOUR_DESIGN);
        design.accept = Translate(Lang.SAVE_DESIGN);
        design.decline = Translate(Lang.CLOSE);
        design.action = dyo.design.Save;
        design.render();
        design.show();

        if (dyo.template == 2) {
            let c = 'skinAU_e6daca';
            $("#save-header").classList.add(c);
            $("#save-footer").classList.add(c);
        }

    }
    
    Save() {

        if ($("#input_design-name").value.replace(/\s/g, '').length) {

            let dialogElement = $('#design-name');
            let dialog = new mdc.dialog.MDCDialog(dialogElement);
            dialog.close();

            dyo.design.action = "Save";
            dyo.design.CreateImage(dyo.design.SaveData);

        } else {

            $("#input_design-name").focus();

        }

    }

    SaveData() {

        document.location.href = "#save-design";

        dyo.engine.loader.show("Design:345");

        let json = dyo.monument.serialize();

        let data_elements;
        for (let item_id = 0; item_id < dyo.monument.items.length; item_id++) {
            data_elements = dyo.monument.items[item_id].serialize();
            json.push(data_elements);
        }

        let xml = dyo.design.json2xml(json);
        let design_name = $("#input_design-name").value;
        let price = dyo.monument.checkPrice(false);

        let pdf = price.data;
        let headersRegex = `<span class="table-header-for-mobile">(${Translate(Lang.PRODUCT)}|${ Translate(Lang.QUANTITY)}|${Translate(Lang.UNIT_PRICE)}|${Translate(Lang.ITEM_TOTAL)})</span>`;
        pdf = pdf.replace(new RegExp(headersRegex, "gi"), "");

        var data = new FormData();
        data.append('product_name', dyo.monument._config.name);
        data.append('html', pdf);
        data.append('html4', price.data);

        if (dyo.mode == "3d") {

            if (dyo.monument.id == 5) {
                dyo.engine.removeBorder();
            }

            let config = {
                customizator: Engine3D.project.ProjectSaveCustomizator = null,
                output: "Base64String"
            }

            var projectData = Engine3D.Controller.saveProject(config.customizator, config.output);
            data.append('design_data_p3d', projectData);
        }

        data.append('customer_email', sessionStorage.getItem('customer_email'));
        data.append('customer_password', sessionStorage.getItem('customer_password'));
        data.append('design_stampid', dyo.uniqueid);
        data.append('design_name', design_name);
        data.append('design_date', dyo.engine.getDate());
        data.append('design_data', xml);
        data.append('design_data_json', JSON.stringify(json));
        data.append('design_price', dyo.monument.getTotalPrice());
        data.append('design_xmlurl', dyo.path.saved_designs + 'xml/' + dyo.uniqueid + '.xml');
        data.append('design_productid', dyo.monument.id);
        data.append('design_preview', dyo.path.saved_designs + "screenshots/" + dyo.design.getDateURL() + dyo.uniqueid + ".jpg");
        data.append('design_customerid', sessionStorage.getItem('customer_id'));
        data.append('agent', dyo.navigator);
        data.append('mode', dyo.mode);
        data.append('country', dyo.country);

        if (dyo.engine.promoCodeValue != "") {
            data.append('promo_code', dyo.engine.promoCodeValue);
        }

        if (dyo.mode == "3d") {
            if (dyo.monument.id == 5) {
                dyo.engine.addBorder();
            }
        }

        fetch(dyo.path.save_design, {
          method: 'POST',
          body: data
        })
        .catch(error => { 
            dyo.engine.loader.hide(); 
            console.error('Error:', error)
        })
        .then(response => { 
            dyo.design.cache.DesignList = [];
            dyo.engine.account.open();
            dyo.design.getDesigns();
            dyo.engine.account.show();
            dyo.engine.designSaved = true;
            dyo.uniqueid = Date.now();
            document.location.href = "#my-account";
        });

    }

    deleteDesign() {

        dyo.engine.loader.show("Design:398");

        var data = new FormData();

        data.append('customer_email', sessionStorage.getItem('customer_email'));
        data.append('customer_password', sessionStorage.getItem('customer_password'));
        data.append('design_stampid', dyo.monument.design_stampid);

        fetch(dyo.path.delete_design, {
          method: 'POST',
          body: data
        })
        .catch(error => { 
            dyo.engine.loader.hide(); 
            console.error('Error:', error)
        })
        .then((response) => {
			response.text().then((data) => {
                console.log(data);
                dyo.design.cache.DesignList = [];
                dyo.engine.account.open();
                dyo.design.getDesigns();
                dyo.engine.account.show();
                dyo.engine.loader.hide("Design:420");

                document.location.href = "#my-account";
            })
        });

    }

    downloadAvailablePDF(type) {

        let file_type;
        let id;

        switch (type) {
            case 0:
                id = dyo.monument.design_stampid;
                file_type = "quote";
                break;
            case 1:
                id = dyo.monument.order_id;
                file_type = "invoice";
                break;
        }

        dyo.engine.loader.show("Design:441");

        let data = new FormData();
        data.append('directory', '../pdf/' + file_type + "-" + id + ".pdf");

        fetch(dyo.path.read_file, {
            method: 'POST',
            body: data
        })
        .then(response => response.blob())
        .then(data => {

            var file = new Blob([data], {type: 'application/pdf'});
            var fileURL = URL.createObjectURL(file);

            let link = document.createElement('a');
            link.href = fileURL;
            link.download = file_type + '-' + id + '.pdf';
            link.dispatchEvent(new MouseEvent('click'));

            dyo.engine.loader.hide("Design:461");

        })
        .catch(error => { 
            console.error('Error:', error) 
            dyo.engine.loader.hide(); 
        });
    }

	downloadPDF() {

        if (sessionStorage.getItem('customer_email') && sessionStorage.getItem('customer_password')) {
            dyo.design.action = "PDF";
            dyo.design.CreateImage(dyo.design.download);
        } else {
            let popup_login = dyo.engine.popup_login;
            popup_login.accept = "";
            popup_login.decline = Translate(Lang.CLOSE);
            popup_login.last_action = dyo.design.saveDesign;
            popup_login.render();
            if ($("#welcome-to-design-your-own")) {
                $("#welcome-to-design-your-own").style.display = "block";
            }
            popup_login.show();
            if (dyo.template == 2) {
                let c = 'skinAU_e6daca';
                $("#my-account-login-header").classList.add(c);
                $("#my-account-login-footer").classList.add(c);
            }
            // Login view
            if (dyo.engine.deviceType == "mobile" && window.matchMedia("(orientation: portrait)").matches) {
                if ($("#dyo_login_container")) {
                    $("#dyo_login_container").style.display = "block";
                    $("#dyo_register_container").style.display = "none";
                    $("#mobile_account_menu").style.display = "block";
                }
            } else {
                if ($("#mobile_account_menu")) {
                    $("#mobile_account_menu").style.display = "none";
                    $("#dyo_register_container").style.display = "block";
                    $("#dyo_login_container").style.display = "block";
                }
            }
        }
        
    }

    download() {

		let price = dyo.monument.checkPrice(true);

		let data = new FormData();
        data.append('design_stampid', dyo.uniqueid);
        data.append('product_name', dyo.monument._config.name);
        data.append('html', price.data);

        if (sessionStorage.getItem('customer_email') != undefined) {
            data.append('customer_email', sessionStorage.getItem('customer_email'));
        }
        
		dyo.engine.loader.show("Design:487");

		fetch(dyo.path.pdf, {
			method: 'POST',
			body: data
		})
		.then((response) => {
			response.text().then((data) => {

				let result = JSON.parse(data);

				if (result != 'failure') {

					let data = new FormData();
                    data.append('directory', '../pdf/' + result);

					fetch(dyo.path.read_file, {
						method: 'POST',
						body: data
					})
					.then(response => response.blob())
					.then(data => {

						var file = new Blob([data], {type: 'application/pdf'});
						var fileURL = URL.createObjectURL(file);
                        let filename = Translate(Lang.QUOTE) + '-' + dyo.uniqueid + '.pdf';

						let link = document.createElement('a');
						link.href = fileURL;
                        link.setAttribute('download', filename)
						link.download = filename;
						link.dispatchEvent(new MouseEvent('click'));

						dyo.engine.loader.hide(); 

					})
					.catch(error => { 
						console.error('Error:', error) 
						dyo.engine.loader.hide(); 
					});

				}

			});
		})
		.catch(error => { 
			console.error('Error:', error) 
			dyo.engine.loader.hide(); 
		});
		
    }

    getBorderName(border) {
        let border_name = border;
        if (this.borders) {
            this.borders.forEach(item => {
                if (item.name == border) {
                    border_name = item.disp_name;
                }
            });
        }
        return border_name;
    }
    
    getHeadstone() {
        let headstone;
        let border;

        switch (Number(dyo.monument.id)) {
            case 5: case 999:
                border = "Border 1";
                break;
            case 31:
                dyo.borderId = "plaques_no_border";
                border = "No Border";
                break;
            case 32:
                border = "Border 1";
                break;
            case 10: case 30: case 34:
                border = 0;
                break;
            case 2350:
                border = "Border Heart";
                break;
        }

        let config_name;
        
        switch (dyo.monument.id) {
            default:
                config_name = dyo.monument._shapes[0].name;
                break;
            case 4: case 8: case 22: case 124: case 100: case 101: case 102:
                config_name = dyo.monument._shapes[9].name;
                break;
        }

        if (dyo.shape_id) {
            
            let id = 0;
            let name;

            this.shapes.forEach(item => {
                if (dyo.shape_id == id) {
                    config_name = item.name;
                }
                id ++;
            });

        }
        
        if (this.design_data == undefined) {

            dyo.design_init_width = dyo.w;
            dyo.design_init_height = dyo.h;

            let Width = Number(File('table').init_width);
            let Height = Number(File('table').init_height);
            let Length = Number(File('table').init_depth);

            if (dyo.metric == "inches") {
                Width = dyo.engine.metrics.convertToInches(Width);
                Height = dyo.engine.metrics.convertToInches(Height);
                Length = dyo.engine.metrics.convertToInches(Length);
            }

            let shape_name = config_name;

            if (dyo.monument.id == 5 || dyo.monument.id == 30 || dyo.monument.id == 34) {    
                shape_name = "Rectangle (Landscape)";
            }

            if (dyo.monument.id == 9) {
                shape_name = "Rectangle 125x175";
            }

            if (dyo.monument.id == 2350) {
                shape_name = "Heart";
            }

            if (dyo.code == "jp_JP") {
                config_name = config_name.replace("長方形", "rectangle");
                config_name = config_name.replace("正方形", "square");
            }

            headstone = new Headstone({ 
                Stage: this.container_headstone,
                Name: shape_name,
                Shape: config_name,
                Type: "Headstone",
                Width: Number(Width),
                Height: Number(Height),
                Length: Number(Length), 
                Fixed: Number(File('table').fixed), 
                Color: "#000000", 
                Border: border, 
                border_name: this.getBorderName(border),
                Texture: File('table').color,
                Selected: true
            });

        } else {

            dyo.design_init_width = dyo.w;
            dyo.design_init_height = dyo.h;

            if (Number(this.design_data[0].installationMethod)) {
                dyo.monument.installationMethod = Number(this.design_data[0].installationMethod);
            }

            if (Number(this.design_data[0].fixingSystem)) {
                dyo.monument.fixingSystemType = Number(this.design_data[0].fixingSystem);
    
                let id_array = [];

                this.fixingSystem.forEach(fixing => {

                    let id = fixing.class + "_" + this.makeSafeName(fixing.name);
                    $('#' + id).classList.remove("mdc-list-selected");

                    id_array.push(id);

                });

                $('#' + id_array[dyo.monument.fixingSystemType - 1]).classList.add("mdc-list-selected");
            }

            if (Number(this.design_data[0].corner)) {
                dyo.monument.cornerType = Number(this.design_data[0].corner);
    
                let id_array = [];

                this.corners.forEach(corner => {

                    let id = corner.class + "_" + this.makeSafeName(corner.name);
                    if ($('#' + id)) {
                        $('#' + id).classList.remove("mdc-list-selected");
                    } 

                    id_array.push(id);

                });

                if ($('#' + id_array[dyo.monument.cornerType - 1])) {
                    $('#' + id_array[dyo.monument.cornerType - 1]).classList.add("mdc-list-selected");
                }

            }

            if (Number(this.design_data[0].hole)) {
                dyo.monument.holeType = Number(this.design_data[0].hole);
    
                let id_array = [];

                this.holes.forEach(hole => {

                    let id = hole.class + "_" + this.makeSafeName(hole.name);
                    if ($('#' + id)) {
                        $('#' + id).classList.remove("mdc-list-selected");
                    }

                    id_array.push(id);

                });

                if ($('#' + id_array[dyo.monument.holeType - 1])) {
                    $('#' + id_array[dyo.monument.holeType - 1]).classList.add("mdc-list-selected");
                }
            }

            if (String(this.design_data[0].backgroundOption)) {
                dyo.monument.backgroundOption = String(this.design_data[0].backgroundOption);
            }

            let _shape = this.design_data[0].shape;

            if (dyo.monument.id == 2350) {
                if (_shape == "Heart") {
                    _shape = "Urn Heart";
                }
            }
            
            dyo.edit_width = Number(this.design_data[0].width);
            dyo.edit_height = Number(this.design_data[0].height);

            //console.log(this.design_data[0]);

            let _name = _shape;

            if (dyo.monument.id == 5 || dyo.monument.id == 999) {
                switch (this.design_data[0].shape) {
                    case "Oval Landscape": case "Oval (Landscape)":
                        _shape = "Oval (Landscape)";
                        break;
                    case "Oval Portrait": case "Oval (Portrait)":
                        _shape = "Oval";
                        break;
                    case "Circle":
                        _shape = "Circle";
                        break;    
                    default:
                        _shape = "Square";
                        break;
                }
            }

            if (dyo.monument.id == 32) {
                switch (this.design_data[0].shape) {
                    case "Landscape": case "Portrait":
                        _shape = "Square";
                        break;
                }
            }

            headstone = new Headstone({ 
                Stage: this.container_headstone,
                Name: _name, 
                Shape: _shape, 
                Type: "Headstone",
                Width: Number(this.design_data[0].width),
                Height: Number(this.design_data[0].height),
                Length: Number(this.design_data[0]._length),
                Fixed: Number(this.design_data[0].fixed),
                Color: this.design_data[0].color,
                Border: this.design_data[0].border,
                border_name: this.design_data[0].border,
                Texture: this.design_data[0].texture,
                Selected: true
            });

            let type = dyo.config.getProductType();
            let id = type + "_" + this.makeSafeName(_name);

            this.shapes.forEach(shape => {    
                if (shape.class == type) {
                    if (shape.drawing == _name) {
                        id = type + "_" + this.makeSafeName(shape.name);
                    }
                }
            });

            dyo.shapes.selectShape(id);
            
            //console.log(this.design_data[0].shape);
            /*
            switch (this.design_data[0].shape) {
                case "Oval Landscape":
                    headstone.Name = "Oval (Landscape)";
                    break;
                case "Oval Portrait":
                    headstone.Name = "Oval (Portrait)";
                    //headstone.Name = "Oval";
                    //console.log("@name: " + headstone.Name);
                    break;
                case "Rectangle Landscape":
                    headstone.Name = "Rectangle (Landscape)";
                    break;
                case "Rectangle Portrait":
                    headstone.Name = "Rectangle (Portrait)";
                    break;
            }
            */

        }

        return headstone;
    }

    getBase() {

        let base;
        let border;
        let base_added = false;
        let Width, Height, Length;

        switch (dyo.monument.id) {
            default:
                border = 0;
                break;
        }

        if (this.design_data != undefined) {

            if (dyo.metric == "inches") {
                Width = dyo.engine.metrics.convertToInches(Width);
                Height = dyo.engine.metrics.convertToInches(Height);
                Length = dyo.engine.metrics.convertToInches(Length);
            }

            let d = "";

            for (let nr = 1; nr < this.design_data.length; nr ++) {

                d = this.design_data[nr];

                if (d.type == "Base" && !base_added) {
                    dyo.monument.has_base = true;
                }

            }

            if (this.design_data[1]) {

                if (this.design_data[1].type == "Base") {

                    for (let nr = 1; nr < this.design_data.length; nr ++) {

                        d = this.design_data[nr];
        
                        if (d.type == "Base" && !base_added) {
                            base_added = true;
        
                            let base = {
                                type: "Base",
                                name: "Rectangle",
                                shape: "Square",
                                flower_pot_holes: Boolean(this.design_data[1].flower_pot_holes),
                                base_flower_pots: Number(this.design_data[1].base_flower_pots),
                                width: d.width,
                                height: d.height,
                                length: 100,
                                color: "#000000",
                                border: border,
                                texture: this.design_data[1].texture
                            }

                            if (Boolean(this.design_data[1].flower_pot_holes)) {
                                dyo.monument.has_base_flower_pots = Number(this.design_data[1].base_flower_pots);
                            }

                            this.design_data.splice(1, 0, base);
        
                        } else if (d.type == "Base") {
                            dyo.monument.has_base = true;
                        } else {
                            dyo.monument.has_base = false;
                        }
        
                    }

                    let _Width;
                    let _Height;
                    let _Length;

                    if (this.design_data[1]) {

                        if (this.design_data[1].type == "Base") {
                            
                            _Width = Number(this.design_data[1].width);
                
                            if (isNaN(_Width)) {
                                _Width = Number(File('stand').init_width);
                            }
                            
                            _Height = Number(this.design_data[1].height);
                
                            if (isNaN(_Height)) {
                                _Height = Number(File('stand').init_height);
                            }
                
                            _Length = Number(this.design_data[1].length);
                
                            if (isNaN(_Length)) {
                                _Length = Number(File('stand').init_depth);
                            }
                
                        }

                    }

                    base = new Base({ 
                        Stage: this.container_base,
                        Name: this.design_data[1].name, 
                        Shape: this.design_data[1].shape, 
                        Type: "Base",
                        Width: Number(_Width),
                        Height: Number(_Height),
                        Length: Number(_Length),
                        Color: this.design_data[0].color,
                        Border: this.design_data[0].border,
                        Texture: this.design_data[0].color,
                        Selected: false
                    });

                } else {
                    base = this.getDefaultBase();
                }

            } else {
                base = this.getDefaultBase();
            }

        } else {
            base = this.getDefaultBase();
        }

        return base;

    }

    getDefaultBase() {

        let base;
        let border;

        switch (dyo.monument.id) {
            default:
                border = 0;
                break;
        }

        let Width = Number(File('stand').init_width);
        let Height = Number(File('stand').init_height);
        let Length = Number(File('stand').init_depth);

        if (dyo.metric == "inches") {
            Width = dyo.engine.metrics.convertToInches(Width);
            Height = dyo.engine.metrics.convertToInches(Height);
            Length = dyo.engine.metrics.convertToInches(Length);
        }

        base = new Base({ 
            Stage: this.container_base,
            Name: "Rectangle", 
            Shape: "Rectangle", 
            Type: "Base",
            Width: Number(Width), 
            Height: Number(Height),
            Length: Number(Length), 
            Color: "#000000", 
            Border: border, 
            Texture: File('stand').color,
            Selected: false
        });

        return base;

    }

    getLedger() {

        let ledger;

        let Width = Number(File('lid').init_width);
        let Height = Number(File('lid').init_height);
        let Length = Number(File('lid').init_depth);

        if (dyo.metric == "inches") {
            Width = dyo.engine.metrics.convertToInches(Width);
            Height = dyo.engine.metrics.convertToInches(Height);
            Length = dyo.engine.metrics.convertToInches(Length);
        }

        ledger = new Ledger({ 
            Stage: this.container_base,
            Name: "Rectangle", 
            Shape: "Rectangle", 
            Type: "Ledger",
            Width: Width, 
            Height: Height,
            Length: Length, 
            Color: "#000000", 
            Texture: File('lid').color,
            Selected: false
        });

        return ledger;

    }

    getKerbset() {

        let kerbset;

        let Width = Number(File('kerb').init_width);
        let Height = Number(File('kerb').init_height);
        let Length = Number(File('kerb').init_depth);

        if (dyo.metric == "inches") {
            Width = dyo.engine.metrics.convertToInches(Width);
            Height = dyo.engine.metrics.convertToInches(Height);
            Length = dyo.engine.metrics.convertToInches(Length);
        }

        kerbset = new Kerbset({ 
            Stage: this.container_base,
            Name: "Rectangle", 
            Shape: "Rectangle", 
            Type: "Kerbset",
            Width: Number(Width), 
            Height: Number(Height),
            Length: Number(Length), 
            Color: "#000000", 
            Texture: File('kerb').color,
            Selected: false
        });

        return kerbset;

    }

    strip(str) {
        let s = str.split(" ");
        return s.join("");
    }

    random(value) {
        return Math.round(Math.random() * value);
    }

    getElements() {

        dyo.design.designPhotos = 0;
        this.designEmblems = 0;

        var data = [];
        this.loadQueue = [];

        if (this.design_data != undefined) {

            let d = "";

            let dpr = 1;
            let _dpr = 1;
            let _mode = "2d";
            let allow = true;

            dyo.data.init_width = this.design_data[0].width;
            dyo.data.init_height = this.design_data[0].height;

            let init_width = Number(this.design_data[0].init_width);
            let init_height = Number(this.design_data[0].init_height);
            var ratio_width = 1, ratio_height = 1, ratio = 1;

            if (this.design_data[0].mode != undefined) {
                _mode = this.design_data[0].mode;
            }

            if (this.design_data[0].dpr != undefined) {
                _dpr = Number(this.design_data[0].dpr);
                dyo._dpr = _dpr;
            }

            if (dyo.w > dyo.h) {

                console.log("@landscape");

                if (dyo.dpr > dyo._dpr) {
                    console.log("@1");
                    ratio = dyo.dpr / dyo._dpr;

                } else {
                    console.log("@2");
                    
                    if (dyo._dpr > 2.5) {
                        ratio = ((init_height / dyo._dpr) / (dyo.h / dyo.dpr)) + (dyo.dpr / dyo._dpr);
                    
                    } else {
                    
                        if (dyo._dpr > 1.5) {
                            ratio = dyo._dpr / 2;
                            ratio = ((init_height / dyo._dpr) / (dyo.h / dyo.dpr));
                            console.log("@b");

                        } else {
                            ratio = dyo.dpr / dyo._dpr;
                            console.log("@b2");
                            
                        }   
                    
                    }
                
                }


            } else {

                if (dyo.dpr > dyo._dpr) {
                    ratio = dyo.dpr / 2;
                } else {
                    ratio = dyo.dpr / dyo._dpr;
                }

                console.log("@portrait");

            }

            if (Number(dyo.dpr) == Number(_dpr)) { ratio = 1 }

            ratio_width = (dyo.w / init_width) * (ratio);
            ratio_height = (dyo.h / init_height) * (ratio);

            console.log(ratio, _dpr, dyo.dpr);

            if (dyo.monument._config.formula == "Enamel") {
                if (this.design_data[0].color != undefined) {
                    if (dyo.monument.headstone) {
                        if (dyo.monument.headstone.background) {
                            dyo.monument.headstone.background = this.design_data[0].color;
                        }
                    }
                }
            }

            let ext = "php";
            if (dyo.local) {
                ext = "html";
            }

            if (_mode == "3d") {
                if (dyo.mode == "2d") {
                    window.onbeforeunload = null;
                    document.location.href = "index3d." + ext + "?edit" + dyo.monument.design_stampid;
                    allow = false;
                }
            }

            if (_mode == "2d") {
                if (dyo.mode == "3d") {
                    window.onbeforeunload = null;
                    document.location.href = "index." + ext + "?edit" + dyo.monument.design_stampid;
                    allow = false;
                }
            }

            if (!allow) {
                return;
            }

            if (allow) {

                if (Number(this.design_data[0].installationMethod) > 0) {
                    switch (Number(this.design_data[0].installationMethod)) {
                        case 0:
                            $('#mini-headstones_mini_headstone_only_lay_flat').classList.add("mdc-list-selected");
                            break;
                        case 1:
                            $('#mini-headstones_mini_headstone_with_granite_base').classList.add("mdc-list-selected");
                            break;
                        case 2:
                            $('#mini-headstones_mini_headstone_buried_into_ground').classList.add("mdc-list-selected");
                            break;
                    }
                }

                for (let nr = 1; nr < this.design_data.length; nr ++) {

                    d = this.design_data[nr];

                    switch (d.type) {
                        case "Base":

                            dyo.monument.has_base = true;

                            if (d.base_flower_pots) {
                                dyo.monument.has_base_flower_pots = d.base_flower_pots;
                            }

                            if (d.flower_pot_holes) {
                                dyo.monument.has_base_flower_pot_holes = d.flower_pot_holes;
                            }

                            switch (dyo.monument.has_base_flower_pots) {
                                case "1":
                                    $('#radio-1').checked = 'checked';
                                    break;
                                case "2":
                                    $('#radio-2').checked = 'checked';
                                    break;
                                case "3":
                                    $('#radio-3').checked = 'checked';
                                    break;
                                case "4":
                                    $('#radio-4').checked = 'checked';
                                    break;
                                case "5":
                                    $('#radio-5').checked = 'checked';
                                    break;
                            }

                            dyo.monument.base.setTexture(d.texture);
                            dyo.monument.base.applyTexture();
                            if (dyo.monument.has_base) {
                                dyo.monument.showBase();
                                dyo.monument.showBaseFlowerPotHoles();
                            }
                            dyo.monument.updateMonument("design: 938");

                            break;

                        case "Inscription":

                            //console.log("@add inscriptionID: " + d.itemID, d.src);

                            if (this.strip(d.label).length > 0) {

                                let regex = `&apos;`;
                                let label = d.label;

                                if (label.indexOf(regex) > -1) {
                                    label = label.replaceAll(new RegExp(regex, "gi"), "'");
                                }
                                
                                let font = d.font.split("px");
                                font = Number(font[0]) + "px" + font[1];

                                data.push({
                                    "nr": nr,
                                    "part": d.part,
                                    "type": d.type,
                                    "name": d.name,
                                    "label": label,
                                    "font": font,
                                    "font_family": d.font_family,
                                    "font_size": Number(d.font_size),
                                    "color": d.color,
                                    "colorName": d.colorName,
                                    "color_texture": d.color_texture,
                                    "side": d.side,
                                    "flipx": Number(d.flipx),
                                    "flipy": Number(d.flipy),
                                    "x": Math.round(ratio_height * Number(d.x)),
                                    "y": Math.round(ratio_height * Number(d.y)),
                                    "rotation": Number(d.rotation),
                                    "itemID": Number(d.itemID),
                                    "draggable": true
                                });

                            }

                            break;

                        case "Motif":

                            //console.log("@add motifID: " + d.itemID, d.src);

                            data.push({
                                "nr": nr,
                                "productid": Number(d.productid),
                                "part": d.part,
                                "type": d.type,
                                "name": d.name,
                                "src": d.src,
                                "color": d.color,
                                "colorName": d.colorName,
                                "colorName2": d.colorName2,
                                "color_texture": d.color_texture,
                                "color_texture2": d.color_texture2,
                                "item": d.item,
                                "side": d.side,
                                "height": Math.round(ratio_height * Number(d.height)),
                                "ratio": Number(d.ratio),
                                "flipx": d.flipx,
                                "flipy": d.flipy,
                                "x": Math.round(ratio_height * Number(d.x)),
                                "y": Math.round(ratio_height * Number(d.y)),
                                "rotation": Number(d.rotation),
                                "itemID": Number(d.itemID),
                                "draggable": true
                            });

                            //console.log(data);

                            break;

                        case "Border":

                            data.push({
                                "nr": nr,
                                "part": d.part,
                                "type": d.type,
                                "name": d.name,
                                "border_drawing": d.border_drawing,
                                "productid": d.productid
                            });

                            break;    

                        case "Photo":

                            dyo.design.designPhotos ++;

                            // Great fix to get the DIR from Timestamp

                            if (d.path == "undefined" || d.path.indexOf("NaN") > -1) {
                                var date;
                                if (Number(d.uid)) {
                                    date = new Date(Number(d.uid));
                                } else {
                                    date = new Date(Number(dyo.monument.design_stampid));
                                }
                                
                                var month = ("0" + (date.getMonth() + 1)).slice(-2)
                                var year = date.getFullYear();

                                d.path = "../upload/" + year + "/" + month + "/";
                            }

                            let photoObject = {
                                "nr": nr,
                                "id": Number(d.id),
                                "uid": Number(d.uid),
                                "part": d.part,
                                "type": d.type,
                                "name": d.name,
                                "src": d.src,
                                "shape_url": d.shape_url,
                                "path": d.path,
                                "item": d.item,
                                "mask": Number(d.mask),
                                "side": d.side,
                                "width": Number(d.width),
                                "height": Number(d.height),
                                "size": d.size,
                                "color": Number(d.color),
                                "ratio": Number(d.ratio),
                                "flipx": Number(d.flipx),
                                "flipy": Number(d.flipy),
                                "x": Math.round(ratio_height * Number(d.x)),
                                "y": Math.round(ratio_height * Number(d.y)),
                                "rotation": Number(d.rotation),
                                "itemID": Number(d.itemID),
                                "draggable": true
                            }
                            
                            data.push(photoObject);
                            break;

                        case "Emblem":

                            this.designEmblems ++;

                            data.push({
                                "nr": nr,
                                "id": Number(d.id),
                                "part": d.part,
                                "type": d.type,
                                "name": d.name,
                                "src": d.src,
                                "item": d.item,
                                "side": d.side,
                                "width": Number(d.width),
                                "height": Number(d.height),
                                "size": d.size,
                                "color": d.color,
                                "ratio": d.ratio,
                                "flipx": Number(d.flipx),
                                "flipy": Number(d.flipy),
                                "x": (ratio_height * Number(d.x)),
                                "y": Math.round(ratio_height * Number(d.y)),
                                "rotation": Number(d.rotation),
                                "itemID": Number(d.itemID),
                                "draggable": true
                            });

                            break;

                    }

                }

                if (data.length > 0) {

                    //console.log(data);

                    for (let n = 0; n < data.length; n++) {
                        dyo.design.loadQueue[n] = true;
                    }

                    for (let n = 0; n < data.length; n++) {
                        if (data[n].nr != undefined) {
                            dyo.design.loadQueue[data[n].nr] = false;
                        } 
                    }

                    var total = data.length - 1;
                    var nr = 0;

                    var did = setInterval(function() {

                        //console.log("@interval");

                        if (nr == total) {
                            clearInterval(did);
                        }

                        if (data[nr]) {

                            let itemType = data[nr].type;

                            dyo.engine.loader.show("Design:891");

                            switch (itemType) {
                                case "Border":

                                    dyo.monument.headstone.productBorder = new Border({ 
                                        type: data[nr].type,
                                        border_drawing: data[nr].border_drawing,
                                        productid: data[nr].productid
                                    });

                                    if (dyo.target == null) {
                                        dyo.target = dyo.monument.getPartByType('Headstone');
                                    }

                                    dyo.target.add(dyo.monument.headstone.productBorder);
                                    dyo.target.borderName = data[nr].border_drawing;
                                    dyo.borderId = "plaques_raised_-_no_pattern";

                                    dyo.design.loadQueue[data[nr].nr] = true;
                                    dyo.design.loadCompleted();

                                    break;

                                case "Inscription":

                                    if (data[nr].part) {
                                        dyo.monument.getPartByType(data[nr].part).add(new Inscription(data[nr]));
                                    } else {
                                        dyo.target.add(new Inscription(data[nr]));
                                    }

                                    dyo.design.loadQueue[data[nr].nr] = true;
                                    dyo.design.loadCompleted();

                                    break;

                                case "Motif": 

                                    var img = new Image();
                                    let item = data[nr].src;

                                    let i;

                                    i = "data/svg/motifs/" + item.toLowerCase() + ".svg";

                                    img.src = i;

                                    var currentData = data[nr];

                                    img.onerror = () => {
                                        dyo.engine.loader.force = false;
                                        dyo.engine.loader.hide();
                                    }
                                    img.onload = () => {
            
                                        if (img) {
                                            var img_width = img.width;
                                            var img_height = img.height;

                                            currentData.bmp = img;

                                            let motif = new Motif(currentData);

                                            if (currentData.part) {
                                                dyo.monument.getPartByType(currentData.part).add(motif);
                                            } else {
                                                dyo.target.add(motif);
                                            }
            
                                            dyo.design.loadQueue[currentData.nr] = true;
                                            dyo.design.loadCompleted();
            
                                        }
            
                                    }

                                    break;

                                case "Photo": 

                                    var img = new Image();

                                    let path = dyo.path.read_file;

                                    if (dyo.path.php.indexOf("test") >-1) {
                                        path = path.replace("design/", "test-design/");
                                    }

                                    if (data[nr].item.indexOf("../upload/") > -1) {
                                        img.src = path + data[nr].item;
                                    } else {
                                        img.src = path + data[nr].path + data[nr].item;
                                    }

                                    var currentData = data[nr];

                                    img.crossOrigin = "Anonymous";

                                    img.onerror = () => {
                                        console.log("Error loading: " + img.src);
                                        dyo.engine.loader.hide("design:1930");
                                        dyo.design.designPhotos --;
                                        dyo.design.loadCompleted();
                                    }

                                    img.onload = () => {

                                        currentData.bmp = img;

                                        var photo = new Photo(currentData);

                                        if (currentData.part) {
                                            dyo.monument.getPartByType(currentData.part).add(photo);
                                        } else {
                                            dyo.target.add(photo);
                                        }

                                        dyo.design.designPhotos --;

                                        dyo.design.loadQueue[currentData.nr] = true;
                                        dyo.design.loadCompleted();

                                    }

                                    break;

                                case "Emblem": 

                                    var img = new Image();

                                    img.src = dyo.xml_path + "data/png/emblems/m/" + data[nr].src + ".png"; 

                                    var currentData = data[nr];

                                    img.crossOrigin = "Anonymous";
                                    img.onload = () => {
                                        currentData.bmp = img;

                                        let emblem = new Emblem(currentData);
                                        if (currentData.part) {
                                            dyo.monument.getPartByType(currentData.part).add(emblem);
                                        } else {
                                            dyo.target.add(emblem);
                                        }

                                        dyo.design.designEmblems --;
                                        dyo.design.loadQueue[currentData.nr] = true;
                                        dyo.design.loadCompleted();

                                    }

                                    break;
                            }

                        }

                    nr ++;

                    //console.log(dyo.engine.timeInterval);

                    }, dyo.engine.timeInterval);

                } else {
                    dyo.design.loadCompleted();
                }

            }

        }

    }

    loadCompleted() {

        //console.log("@loadCompleted");

        if (dyo.design.designPhotos == 0) {

            dyo.monument.updateHeader("Design: 1580");

            dyo.engine.motifs.fullListVisible = false;
            dyo.engine.motifs.reset();

            if (document.location.href.indexOf("#design-menu") == -1) {
                document.location.href = "#design-menu";
            }

            if (dyo.mode == "3d") {
                dyo.engine.loader.force = true;
                dyo.engine.loader.show("Design:962");
    
                let id_lp = setInterval(() => {

                    if (dyo.engine3d_ready) {
                        dyo.engine3d.loadProject();

                        clearInterval(id_lp);
                    }

                }, 500);

            } else {

                dyo.design.loadQueueState = true;

                setTimeout(function() {

                    let allow = true;
                    for (let nr = 0; nr < dyo.design.loadQueue.length; nr++) {
                        //console.log(nr + ": " + dyo.design.loadQueue[nr]);
                        if (dyo.design.loadQueue[nr] == false) {
                            allow = false;
                        }
                    }
    
                    //console.log("allow: " + allow);

                    if (allow) {
                        dyo.engine.loader.force = false;
                        dyo.engine.loader.hide("Design:962");
                        dyo.design.loadQueueState = false;
                        dyo.edit = false;
                        dyo.engine.loadedItemsCount = dyo.monument.getItems().length;
                    } else {
                    //    dyo.design.loadCompleted();
                    }
    
                }, dyo.engine.timeInterval);

            }

        }

    }

    getFontSize(d) {

        let multiplier = d.height / 10;
        let r = Math.ceil((this.fontsHeight[d.font] * multiplier) * this.mm);

        r = Math.ceil(r / 5) * 5;

        return Math.ceil(r);
    }

    Send() {

        let allow = true;

        if ($("#multi_quick-email-design")) {
            if ($("#multi_quick-email-design").value != "" && !dyo.engine.validatePhone($("#multi_quick-email-design").value)) {
                $("#multi_quick-email-design").focus();
                allow = false;
            }
        }

        if ($("#input_quick-email-design")) {
            if (dyo.engine.validateEmail($("#input_quick-email-design").value)) {
                if (allow) {
                    if ($("#enquiry_quick-email-design").value != "") {
                        dyo.engine.loader.show(); 

                        let price = dyo.monument.checkPrice(true);

                        var data = new FormData();

                        let message = ''
                        message += '<p><strong>' + Translate(Lang.ENQUIRY) + ':</strong><br/>' + $("#enquiry_quick-email-design").value + "</p>";
                        message += '<p><strong>' + Translate(Lang.EMAIL) + ':</strong><br/>' + $("#input_quick-email-design").value + "</p>";
                        if ($("#multi_quick-email-design").value != "") {
                            message += "<p><strong>" + Translate(Lang.PHONE) + ':</strong><br/>' + $("#multi_quick-email-design").value + "</p>";
                        }
                        message += price.data;

                        data.append('enquiry', "true");
                        data.append('product_name', dyo.monument._config.name);
                        data.append('customer_email', sessionStorage.getItem('customer_email'));
                        data.append('design_stampid', dyo.uniqueid);
                        data.append('recipient_email', dyo.config.country.email);
                        data.append('message', message);
                        data.append('html', price.data);
                        data.append('design_preview', dyo.path.saved_designs + "screenshots/" + dyo.design.getDateURL() + dyo.uniqueid + ".jpg");
                        data.append('design_name', Translate(Lang.ENQUIRY) + " - " + $("#input_quick-email-design").value);
                        data.append('agent', dyo.navigator);
                        data.append('country', dyo.country);

                        fetch(dyo.path.send_design, {
                        method: 'POST',
                        body: data
                        })
                        .catch(error => { 
                            dyo.engine.loader.hide(); 
                            console.error('Error:', error)
                        })
                        .then(response => { 
                            dyo.engine.loader.hide(); 
                            dyo.engine.quick_enquiry.hide();
                            dyo.engine.dialog.input_result.show();

                            let dialog = dyo.engine.dialog;
                            dialog.title = Translate(Lang.THANK_YOU_FOR_CONTACTING_US);
                            dialog.body = "";
                            dialog.accept = "";
                            dialog.decline = Translate(Lang.CLOSE);
                            dialog.action = dyo.engine.designMenu;
                            dialog.render();
                            dialog.show();
                        });

                    } else {
                        $("#enquiry_quick-email-design").focus();
                    }
                }

            } else {
                $("#input_quick-email-design").focus();
            }

        } 

        if ($("#input_email-design")) {

            if (dyo.engine.validateEmail($("#input_email-design").value)) {

                dyo.engine.loader.show(); 

                let price = dyo.monument.checkPrice(true);

                var data = new FormData();
        
                data.append('product_name', dyo.monument._config.name);
                data.append('customer_email', sessionStorage.getItem('customer_email'));
                data.append('design_stampid', dyo.monument.design_stampid);
                data.append('recipient_email', $("#input_email-design").value);
                data.append('message', $("#multi_email-design").value);
                data.append('html', price.data);
                data.append('design_preview', dyo.path.saved_designs + "screenshots/" + dyo.design.getDateURL() + dyo.uniqueid + ".jpg");
                data.append('design_name', dyo.design_name);

                fetch(dyo.path.send_design, {
                method: 'POST',
                body: data
                })
                .catch(error => { 
                    dyo.engine.loader.hide(); 
                    console.error('Error:', error)
                })
                .then(response => { 
                    dyo.engine.loader.hide(); 
                    dyo.engine.dialog.input_result.show();
                    dyo.engine.email_design.hide();

                    let dialog = dyo.engine.dialog;
                    dialog.title = Translate(Lang.EMAIL);
                    dialog.body = Translate(Lang.EMAIL_SENT);
                    dialog.accept = "";
                    dialog.decline = Translate(Lang.CLOSE);
                    dialog.action = dyo.engine.designMenu;
                    dialog.render();
                    dialog.show();
                });

            } else {
                $("#input_email-design").focus();
            }

        }
        
    }

    CreateImage(action) {

        dyo.monument.deselectAll();

        if (dyo.mode == "3d") {

            dyo.engine.loader.show("Design:1722");

            if (dyo.engine3d.inst3d) {
                dyo.engine3d.inst3d.setSelected(false);
            }

            let config = {};

            let w, h, l;
            let x = 0;
            let y = 320;
            let z = 800;
            let lx = 0;
            let ly = 0;

            let distance = (dyo.engine3d.headstone3d.getProperty("width") / 1000) * 1.3;

            let kerb_width = Number(dyo.engine3d.kerb3d.getProperty("width"));
            let kerb_height = Number(dyo.engine3d.kerb3d.getProperty("height"));
            let kerb_length = Number(dyo.engine3d.kerb3d.getProperty("depth"));

            if (dyo.engine3d.currentModel) {

                w = dyo.engine3d.currentModel.getProperty("width");
                z = w + 185;

                h = dyo.engine3d.currentModel.getProperty("height");
                ly = y = h / 1.95;

                l = dyo.engine3d.currentModel.getProperty("depth");

                z = (w + l) + 100;

                if (h > w) {
                    z = (h + l) + 200;
                }

            }

            if (dyo.config._config.type == "full-monument") {
                x = -800;
                y = 200 + kerb_height;

                if (kerb_length < 2000) {
                    z = kerb_length * 1.3;
                } else {
                    z = kerb_length;
                }

                if (kerb_width > kerb_length) {
                    z = kerb_width;
                }

                lx = 0;
                ly = 450;
            }

            config.x = x;
            config.y = y;
            config.z = z;

            config.look_at_x = lx;
            config.look_at_y = ly;
            config.look_at_z = 0;

            config.width = dyo.w;
            config.height = dyo.h;

            dyo.engine3d.engine.changeProperty("color", 0xffffff);

            var renderCamera = new Engine3D.core.cameras.Camera3D(new Engine3D.core.cameras.lenses.PerspectiveLens(50));
            renderCamera.set_position(new Engine3D.core.geom.Vector3D(config.x, config.y, config.z));
            renderCamera.lookAt(new Engine3D.core.geom.Vector3D(config.look_at_x, config.look_at_y, config.look_at_z));
            
            var renderParams = new Engine3D.utils.RenderToImageParams(renderCamera, config.width, config.height);

            var jpeg_base64 = Engine3D.View.renderToImage(new Engine3D.utils.JPEGEncoderOptions(70), renderParams, "Base64String");
            var jpeg_bytes = Engine3D.View.renderToImage(new Engine3D.utils.JPEGEncoderOptions(70), renderParams, "Uint8Array");
            //var png_base64 = Engine3D.View.renderToImage(new Engine3D.utils.PNGEncoderOptions(), renderParams, "Base64String");
            //var png_bytes = Engine3D.View.renderToImage(new Engine3D.utils.PNGEncoderOptions(), renderParams, "Uint8Array");

            dyo.engine3d.engine.changeProperty("color", 0xcfe8fc);

            var formData = new FormData();
            formData.append('uniqueid', dyo.uniqueid);
            formData.append('filename', "front");

            var _blob = new Blob([jpeg_bytes], {type: 'image/jpeg'});
            _blob.lastModifiedDate = new Date();

            formData.append("upload", _blob, dyo.uniqueid);

            document.location.href = "#design-menu";
            
            fetch(dyo.path.create_screenshot, {
            method: 'POST',
            body: formData
            })
            .then(response => response)
            .catch(error => { dyo.engine.loader.hide(); console.error('Error:', error) })
            .then(response => { 
                if (dyo.design.action != "Save") {
                    dyo.engine.loader.hide("Design.CreateImage"); 
                }
                if (action) {
                    action();
                }
            });

            document.location.href = "#design-menu";

        }

        if (dyo.mode == "2d") {

            if (dyo.monument.id == "7" || dyo.monument.id == "32") {
                if (dyo.monument.headstone.texture == "data/jpg/ceramic/l/01.jpg") {
                    dyo.monument.headstone._select();
                }
            }

            let canvasWidth = dyo.engine.canvas.canvas.width;
            let canvasHeight = dyo.engine.canvas.canvas.height;

            let self = this;

            let target = dyo.monument.container;
            target.cache(0, 0, dyo.w * dyo.dpr, dyo.h * dyo.dpr);

            let canvas = document.createElement('canvas');
            canvas.width = canvasWidth;
            canvas.height = canvasHeight;

            let context = canvas.getContext('2d');

            context.drawImage(target.cacheCanvas, 0, 0);
            target.uncache();

            switch (dyo.monument.id) {
                default:
                    canvas = this.cropImageFromCanvas(context);
                    break;
            }

            canvas.toBlob(function(blob) {

                dyo.engine.loader.show("Design:1023");

                let reader = new FileReader();
                reader.readAsDataURL(blob); 
                reader.onloadend = function() {

                    var formData = new FormData();
                    var url = dyo.path.create_screenshot

                    var _blob = new Blob([blob], {type: 'image/jpeg'});
                    _blob.lastModifiedDate = new Date();

                    if (self.action == "quotes") {
                        var path = "travel";
                        var uniqueid = self.uniqueid;
                        formData.append('path', path);
                        formData.append('uniqueid', uniqueid);
                        formData.append("upload", _blob, uniqueid);
                        url = dyo.path.create_image;
                    } else {
                        formData.append('uniqueid', dyo.uniqueid);
                        formData.append('filename', "front");    
                        formData.append("upload", _blob, dyo.uniqueid);
                    }

                    document.location.href = "#design-menu";
                    
                    fetch(url, {
                    method: 'POST',
                    body: formData
                    })
                    .then(response => response)
                    .catch(error => { dyo.engine.loader.hide(); console.error('Error:', error) })
                    .then(response => { 
                        response.text().then((data) => {
                            if (self.action == "quotes") {
                                let result = JSON.parse(data);
                            }
                            if (dyo.design.action != "Save") {
                                dyo.engine.loader.hide("Design.CreateImage"); 
                            }

                        })
                        action();
                    });
                }

            }, "image/jpeg", 0.85);

        }

    }

    cropImageFromCanvas(ctx) {

        var canvas = ctx.canvas,
        w = canvas.width, h = canvas.height,
        pix = {x:[], y:[]},
        imageData = ctx.getImageData(0, 0, canvas.width, canvas.height),
        x, y, index;

        for (y = 0; y < h; y++) {
          for (x = 0; x < w; x++) {
            index = (y * w + x) * 4;
            if (imageData.data[index+3] > 0) {
              pix.x.push(x);
              pix.y.push(y);
            } 
          }
        }
        pix.x.sort(function(a,b){return a-b});
        pix.y.sort(function(a,b){return a-b});
        var n = pix.x.length-1;
      
        w = 1 + pix.x[n] - pix.x[0];
        h = 1 + pix.y[n] - pix.y[0];
        var cut = ctx.getImageData(pix.x[0], pix.y[0], w, h);
      
        canvas.width = w;
        canvas.height = h;
        ctx.putImageData(cut, 0, 0);
      
        // Converts transparency to solid white color
        //
        let imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let data = imgData.data;
        for (var i=0; i<data.length; i+=4){
            if (data[i+3] < 255) {
                data[i] = 255;
                data[i+1] = 255;
                data[i+2] = 255;
                data[i+3] = 255;
            }
        }
        ctx.putImageData(imgData, 0, 0);
           
        return canvas;
    }

	json2xml(json) {
        var nr = 1;
		var a = json;
		var c = document.createElement("dyo");
		var t = function (v) {
			return {}.toString.call(v).split(' ')[1].slice(0, -1).toLowerCase();
		};
		var f = function (f, c, a, s) {
			c.setAttribute("id", nr); nr ++;
			if (t(a) != "array" && t(a) != "object") {
				if (t(a) != "null") {
					c.appendChild(document.createTextNode(a));
				}
			} else {
				for (var k in a) {
					var v = a[k];
					if (k == "__type" && t(a) == "object") {
						c.setAttribute("__type", v);
					} else {
						if (t(v) == "object") {
							var ch = c.appendChild(document.createElementNS(null, s ? "item" : k));
							f(f, ch, v);
						} else if (t(v) == "array") {
							var ch = c.appendChild(document.createElementNS(null, s ? "item" : k));
							f(f, ch, v, true);
						} else {
							var va = document.createElementNS(null, s ? "item" : k);
							if (t(v) != "null") {
								va.appendChild(document.createTextNode(v));
							}
							var ch = c.appendChild(va);
							ch.setAttribute("type", t(v));
						}
					}
				}
			}
		};
		f(f, c, a, t(a) == "array");
		return c.outerHTML;
	}

}