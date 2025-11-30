import {Quote} from './Quote.js';
import {Lang, Translate, $} from './Const.js';
    
export class Product extends Quote {

	constructor(data = {}) {
        super(data);
        
        this._cache = [];
        this._config = {};

        this.labels = {
        };

        this.currentAddition = 0;
        this.id = data.id;
        this.old_id = this.id;

        dyo.config = this;

        this.checkSettings();
    }

    checkSettings() {
        let language = sessionStorage.getItem('settings_language');

        if (language != null && language != "undefined") {
            dyo.code = language;
        }

        let currency = sessionStorage.getItem('settings_currency');
        if (currency != null && currency != "undefined") {
            dyo.currency = currency;
        }

        let metric = sessionStorage.getItem('settings_metric');
        if (metric != null && metric != "undefined") {
            dyo.metric = metric;
        }

        this.getCountry();
    }

    getAttr(node, data, n) {
        let o = {};
        for (let nr = 0; nr < data.length; nr++) {
            let v = data[nr];
            let w = node.getAttribute(v);

            if (v.indexOf("@") > -1) {
                v = data[nr].replace("@","");
                w = Number(node.getAttribute(v));
            } 
            if (n) {
                n[v] = w;
            } else {
                o[v] = w;
            }
        }
        if (n == false) {
            return o;
        }
    }

    getCountry = async () => {

        dyo.timeStart = Date.now();

        dyo.engine.loader.update("025");

        this.code = dyo.code;
        this.country = {};

        let url = dyo.xml_path + "data/xml/countries24.xml";

        await fetch(url, { method: 'GET' })
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
            
            [].map.call(data.querySelectorAll("country"), function(country) {
                if (country.querySelector("language").textContent == dyo.config.code) {
                    dyo.config.country.name = country.getAttribute("name");
                    [].map.call(country.querySelectorAll("*"), function(data) {
                        dyo.config.country[data.nodeName] = data.textContent;
					});
				}                
            });
            
            dyo.config.getLanguage();
            
        })
        .catch(error => { 
            dyo.engine.loader.hide(); 
            console.error('Error:', error) 
        });        

    }

    getLanguage() {

        dyo.timeEnd = Date.now();
        dyo.timeInterval = (dyo.timeEnd - dyo.timeStart) / 2;

        dyo.engine.loader.update("030");
        dyo.timeValue = 30;

        dyo.lid2 = setInterval(() => {
            dyo.timeValue ++;
            if (dyo.timeValue > 34) {
                dyo.timeValue = 34;
            }
            dyo.engine.loader.update("0" + dyo.timeValue);
        }, dyo.timeInterval)
        
        this.language = {};
		
        let url = dyo.xml_path + "data/xml/" + dyo.code + "/languages24.xml";

        fetch(url, { method: 'GET' })
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
			[].map.call(data.querySelectorAll("language"), function(language) {
				if (language.getAttribute("code") == dyo.config.country.language) {
					[].map.call(language.querySelectorAll("*"), function(data) {
                        dyo.config.language[data.nodeName] = data.textContent;
					});
				}
            });

            clearInterval(dyo.lid2);

            if (dyo.mode != "web") {
                if (dyo.country == "au") {
                    dyo.config.getPromoCodes();
                }
                dyo.config.Product();
            } else {
                dyo.web.render();
            }
            
        })
        .catch(error => { 
            dyo.engine.loader.hide(); 
            console.error('Error:', error) 
        });

    }


    getPromoCodes() {

        dyo.engine.loader.update("030");

        let url = dyo.xml_path + "data/xml/" + dyo.code + "/promo-codes.xml";
        let promo_codes = [];

        fetch(url, { method: 'GET' })
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
			[].map.call(data.querySelectorAll("codes"), function(code) {
                [].map.call(code.querySelectorAll("*"), function(data) {
                    promo_codes[data.id] = data.textContent;
                });
            });

            dyo.config.promo_codes = promo_codes;
            //console.log(dyo.config.promo_codes);

        })
        .catch(error => { 
            dyo.engine.loader.hide(); 
            console.error('Error:', error) 
        });

    }
   
    Product() {

        var self = this;

        dyo.engine.loader.update("035");

        if (!dyo.accountMode) {
            if (this.first_run == undefined) {
                this.first_run = false;
                
                dyo.engine.canvas.addComponents();
            }
        }

        let url = dyo.xml_path + "data/xml/catalog-id-" + this.id + ".xml";

        if (dyo.engine.loader) {
            if ($('.loading')) {
                $('body').removeChild($('.loading'));
            }
            dyo.engine.loader.force = true;
            dyo.engine.loader.show("Product:147");
        }

        //console.log(url);

        fetch(url, { method: 'GET' })
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {

            [].map.call(data.querySelectorAll("product"), function(product) {
                if (product.getAttribute("id") == dyo.config.id) {
                    self.getAttr(product, ["code", "@color", "holes", "force", "@fixed", "granites", "thickness", "@border", "background", "monument", "@laser", "biondan", "price", "formula", "formulaID", "name", "translate", "fontsize", "bitmap-factor", "default-color", "material", "materialID", "type", "step", "sizes", "retail", "force_retail", "formula-multiplier", "description", "hint"], dyo.config._config);
                }
            });

            dyo.config._additions = [];
            dyo.config._additions.Bases = [];
            dyo.config._additions.Borders = [];
            dyo.config._additions.Inscriptions = [];
            dyo.config._additions.Motifs = [];
            dyo.config._additions.Images = [];
            dyo.config._additions.Emblems = [];
            dyo.config._additions.Sizes = [];
            dyo.config._additions.Stand = [];

            let _dat = ["id", "type", "name", "formula", "note"];

            [].map.call(data.querySelectorAll("addition"), function(addition) {
                let additionType = "";

                let _addition = {};

                for (let nr = 0; nr < _dat.length; nr ++) {
                    _addition[_dat[nr]] = addition.getAttribute(_dat[nr]);
                }
                
                let prices = [];

                switch (_addition.type) {
                    case "hole": case "pot": case "base": case "ledger": case "kerbset":

                        [].map.call(data.querySelectorAll("product"), function(products) {
                
                            if (_addition.id == products.getAttribute("id")) {

                                let cxml = products;

                                [].map.call(products.querySelector("price_model").querySelectorAll("price"), function(type) {

                                    let o = self.getAttr(type, ["id", "nr", "code", "name", "model", "@start_quantity", "@end_quantity", "@retail_multiplier", "note"], false);

                                    o.quantity_type = cxml.querySelector("price_model").getAttribute("quantity_type");
                                    o.currency = cxml.querySelector("price_model").getAttribute("currency");

                                    prices.push(o);
                                    
                                });

                                dyo.config._additions.Bases.push({ 
                                    id: products.getAttribute("id"), 
                                    name: products.getAttribute("name"), 
                                    type: products.getAttribute("type"), 
                                    prices: prices 
                                });

                                dyo.config._additions.push(_addition);

                            }

                        });

                        break;
                    case "border":
                        dyo.config._additions.push(_addition);
                        break;    
                    case "stand":
                        dyo.config._additions.push(_addition);
                        break;        
                    case "inscription":
                        dyo.config._additions.push(_addition);
                        break;
                    case "image":
                        dyo.config._additions.push(_addition);
                        break;
                    case "emblem":
                        dyo.config._additions.push(_addition);
                        break;
                    case "sizes":
                        dyo.config._additions.push(_addition);
                        break;    
                    case "motif":
                        if (_addition.name == "Motif") {
                            dyo.config._additions.push(_addition);
                        }
                    break;
                }
                
            });

            dyo.config.currentAddition = dyo.config._additions.length - 1;
            dyo.config._shapes = [];

            [].map.call(data.querySelectorAll("shape"), function(shape) {

                let files = new Array();

                for (let nr = 0; nr < shape.childNodes.length; nr ++) {
                    if (shape.childNodes[nr].nodeName == "file") {
                        let o = self.getAttr(shape.childNodes[nr], ["type", "@min_depth", "@max_depth", "@init_depth", "@min_height", "@max_height", "@init_height", "@min_width", "@max_width", "@init_width", "@fixed", "color", "color2", "url_3d"], false);
                        files[o.type] = o;
                    }
                }

                let o = self.getAttr(shape, ["type", "name", "double", "stand", "code", "url"], false); o.files = files;
                dyo.config._shapes.push(o);

            });

            dyo.config._price_Model = [];
            
            [].map.call(data.querySelectorAll("price_model"), function(price_model_data) {
                if (price_model_data.id == dyo.config.id) {
                    for (let nr = 0; nr < price_model_data.childNodes.length; nr ++) {
                        if (price_model_data.childNodes[nr].nodeName == "price") {
                            let node = price_model_data.childNodes[nr];
                            dyo.config._price_Model.push(self.getAttr(node, ["id", "nr", "code", "name", "model", "start_quantity", "end_quantity", "quantity_type", "retail_multiplier", "note"], false));
                        }
                    }
                }
            });

            dyo.timeValue = 35;

            dyo.lid2 = setInterval(() => {
                dyo.timeValue ++;
                if (dyo.timeValue > 99) {
                    dyo.timeValue = 99;
                }
                dyo.engine.loader.update("0" + dyo.timeValue);
            }, dyo.timeInterval);
            
            if (!dyo.accountMode) {
                dyo.config.getAddition();
            } else {
                dyo.config.Construct();
            }

        })
        .catch(error => { 
            dyo.engine.loader.hide(); 
            console.error('Error:', error) 
        });

    }

    getAddition() {

        let addition = this._additions[this.currentAddition];
        let type = ""
        let id = 0;

        switch (addition.type) {
            case "border":
                if (addition.name == "Border") {
                    type = "borders-" + addition.formula.toLowerCase();
                    id = addition.id;
                }
                break;
            case "stand":
                if (addition.name == "Stand") {
                    type = "stand-" + addition.formula.toLowerCase();
                    id = addition.id;
                }
                break;
            case "inscription":
                type = "inscriptions";
                id = addition.id;
                break;
            case "image":
                type = "images";
                id = addition.id;
                break;
            case "emblem":
                type = "emblems";
                id = addition.id;
                break;
            case "sizes":
                type = "sizes";
                id = addition.id;
                break;    
            case "motif":
                if (addition.name == "Motif") {
                    type = "motifs-" + addition.formula.toLowerCase();
                    id = addition.id;
                }
                break;
            default:
                type = addition.type;
                id = addition.id;
                break;
        }

        switch (addition.type) {
            default:

                if (id > 0) {
                    if (this._cache[type]) {
                        this.parseAddition(type, id, this._cache[type]);
                    } else {
                        let url = dyo.xml_path + "data/xml/en_EN/" + type + ".xml";

                        fetch(url, { method: 'GET' })
                        .then(response => response.text())
                        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
                        .then(data => {
                            dyo.config._cache[type] = data;
                            dyo.config.parseAddition(type, id, data);
                        })
                        .catch(error => { 
                            dyo.engine.loader.hide(); 
                            console.error('Error:', error) 
                        });
                    }
                }
                break;

            case "pot": case "hole": case "base": case "ledger": case "kerbset":
                this.parseAddition(type, id, "");

                break;
                
        }

    }
    
    parseAddition(type, id, data) {

        let self = this;
		let fonts = [];
		let prices = [];
		let types = [];

        setTimeout(function() {
            if (dyo.config.currentAddition > 0) {
                dyo.config.currentAddition --;
                dyo.config.getAddition();
            } else {
                dyo.config.getMaterial();
            }
        }, 50);

        if (data) {

            [].map.call(data.querySelectorAll("product"), function(products) {
                    
                if (id == products.getAttribute("id")) {
                    
                    let cxml = products;

                    switch (products.getAttribute("type")) {

                        default:
                            if (products.querySelector("product_type")) {
                                [].map.call(products.querySelector("product_type").querySelectorAll("type"), function(type) {        
                                    let o = self.getAttr(type, ["id", "nr", "code", "name", "@min_width", "@max_width", "@min_height", "@max_height", "@min_depth", "@max_depth", "@init_width", "@init_height", "@init_depth", "avail"], false);
                                    types.push(o);
                                });
                                
                                [].map.call(products.querySelector("price_model").querySelectorAll("price"), function(type) {
                                    let o = self.getAttr(type, ["id", "nr", "code", "name", "model", "@start_quantity", "@end_quantity", "@retail_multiplier", "note"], false);
                                    o.quantity_type = cxml.querySelector("price_model").getAttribute("quantity_type"), 
                                    o.currency = cxml.querySelector("price_model").getAttribute("currency")
                                    prices.push(o);
                                });

                                let o = self.getAttr(products, ["id", "name", "surface", "fixed", "type", "color"], false);
                                o.fixing = cxml.querySelector("price_model").getAttribute("fixing");
                                o.types = types;
                                o.prices = prices;

                                if (products.getAttribute("type") == "border") {
                                    dyo.config._additions.Borders.push(o);
                                }
                                if (products.getAttribute("type") == "stand") {
                                    dyo.config._additions.Stand.push(o);
                                }
                                if (products.getAttribute("type") == "motif") {
                                    dyo.config._additions.Motifs.push(o);
                                }
                                if (products.getAttribute("type") == "image") {
                                    dyo.config._additions.Images.push(o);
                                }
                                if (products.getAttribute("type") == "sizes") {
                                    dyo.config._additions.Sizes.push(o);
                                }
                                if (products.getAttribute("type") == "emblem") {
                                    dyo.config._additions.Emblems.push(o);
                                }
                            }
                            break;
                        case "inscription":
                            [].map.call(products.querySelector("shapes").querySelectorAll("font"), function(font) {
                                let o = self.getAttr(font, ["id", "nr", "code", "name", "url"], false);
                                o.path = products.querySelector("shapes").getAttribute("path") 
                                fonts.push(o);
                            });
                                
                            [].map.call(products.querySelector("price_model").querySelectorAll("price"), function(price) {
                                let o = self.getAttr(price, ["id", "nr", "code", "name", "model", "@start_quantity", "@end_quantity", "@retail_multiplier", "note"], false);
                                o.quantity_type = cxml.querySelector("price_model").getAttribute("quantity_type");
                                o.currency = cxml.querySelector("price_model").getAttribute("currency");
                                prices.push(o);
                            });
                            
                            let o = self.getAttr(products, ["id", "name", "surface", "fixed", "type", "coloursId", "free_characters", "@min_height", "@max_height", "@init_width", "@init_height", "url"], false);
                            o.fonts = fonts;
                            o.prices = prices;
                            dyo.config._additions.Inscriptions.push(o);
                            break;
                    }
                    
                }

            });

        }

    }

    getMaterial() {

		this.Materials = [];
        
        let url = dyo.xml_path + "data/xml/" + dyo.code + "/" + dyo.config._config.material + ".xml";

        //console.log(url);

        fetch(url, { method: 'GET' })
        .then(response => response.text())
        .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
        .then(data => {
            
            let path = data.querySelector("materials").getAttribute("path");
            dyo.config.materials = [];
            
            [].map.call(data.querySelectorAll("material"), function(material) {

                let id = material.getAttribute("id");
                let name = material.getAttribute("name");
                let m2 = material.getAttribute("m2");
                let m3 = material.getAttribute("m3");
                
                if (m2 == undefined) {
                    m2 = 1;
                }
                
                if (m3 == "") {
                    m3 = 1;
                }
                
                dyo.config.materials.push( { 
                    file: path + "s/" + id, 
                    name: name, 
                    m2: m2, 
                    m3: m3 
                } );
                
            });
            
            dyo.config.Construct();
            
        });
        /*
        .catch(error => { 
            dyo.engine.loader.hide(); 
            console.error('Error: ' + error);
            dyo.engine.reportError(error);
        });
        */

    }
	
	Construct() {

        let product = dyo.monument._config.name;
        
        if ($('.loading')) {
            $('body').removeChild($('.loading'));
        }

        if (!dyo.init) {
            dyo.engine.render();
            if (!dyo.accountMode) {
                dyo.engine.setupProduct();
            }
        } else {
            dyo.engine.update();
            if (dyo.mode == "3d") {
                if (!dyo.edit) {
                    setTimeout(function() {
                        dyo.engine3d.updateEngine("Product:948");
                    }, 1500);
                }
            }    
        }
        
        if (!dyo.accountMode) {
            document.querySelectorAll('.headstones').forEach(element => {
                $("#" + element.id).style.display = 'none';
            });

            document.querySelectorAll('.plaques').forEach(element => {
                $("#" + element.id).style.display = 'none';
            });

            document.querySelectorAll('.urns').forEach(element => {
                $("#" + element.id).style.display = 'none';
            });

            $('.catalog-title', dyo.monument._config.name);

            $("#dyo_select_size").style.display = "flex";
            $("#dyo_select_installations").style.display = "none";
            $("#dyo_select_fixing_system").style.display = "none";
            $("#dyo_select_corners").style.display = "none";
            $("#dyo_select_holes").style.display = "none";
            $("#dyo_select_stand").style.display = "none";
            $("#dyo_emblems").style.display = "none";
            $('#dyo_add_headstone_base_flower_pot_holes').style.display = "none";
            $('#base_flower_pots').style.display = "none";
            $('#radio-3').checked = 'checked';

            dyo.monument.installationMethod = null;
            dyo.monument.fixingSystemType = null;

            switch (dyo.monument._config.code) {
                default:
                    if (dyo.mode == "3d") {
                        $("#dyo_full_monument").style.display = "none";
                    }
                    dyo.monument.full_monument = false;
                    $("#dyo_add_headstone_base").style.display = "none";
                    dyo.monument.has_base = false;
                    break;
                    
                case "Image":
                    $("#dyo_add_headstone_base").style.display = "none";
                    dyo.monument.has_border = false;
                    document.querySelectorAll('.plaques').forEach(element => {
                        $("#" + element.id).style.display = 'flex';
                    });                
                    break;
                    
                case "Headstone": 
                    if (dyo.mode == "3d") {
                        $("#dyo_full_monument").style.display = "flex";
                        dyo.monument.full_monument = false;
                    }

                    $("#dyo_add_headstone_base").style.display = "flex";
                    dyo.monument.has_border = false;
                    document.querySelectorAll('.headstones').forEach(element => {
                        $("#" + element.id).style.display = 'flex';
                    });

                    // hide or show SELECT SIZE for fixed sized products
                    switch (dyo.config._config.fixed) {
                        case 0: 
                            $("#dyo_select_size").style.display = "flex";
                            break;
                        case 1: case 2:
                            $("#dyo_select_size").style.display = "none";
                            break;
                    }

                    break;
                    
                case "Mini Headstone":
                    dyo.monument.installationMethod = 2;

                    if (dyo.mode == "3d") {
                        $("#dyo_full_monument").style.display = "none";
                    }
                    $("#dyo_add_headstone_base").style.display = "none";
                    $("#dyo_select_installations").style.display = "flex";

                    $("#dyo_select_size").style.display = "none";
                    dyo.monument.has_border = false;
                    document.querySelectorAll('.headstones').forEach(element => {
                        $("#" + element.id).style.display = 'flex';
                    });

                    dyo.engine.select_installations.render();
                    break;

                case "Plaque":
                    if (dyo.mode == "3d") {
                        $("#dyo_full_monument").style.display = "none";
                    }
                    $("#dyo_add_headstone_base").style.display = "none";
                    if (dyo.monument.id == 5 ||
                        dyo.monument.id == 999) {
                        $("#dyo_select_fixing_system").style.display = "flex";
                        dyo.monument.fixingSystemType = 2;
                    }
                    if (dyo.monument.id == 52) {
                        $("#dyo_select_corners").style.display = "flex";
                        $("#dyo_select_holes").style.display = "flex";
                    }
                    if (dyo.monument.id == 31) {
                        $("#dyo_select_stand").style.display = "flex";
                    }
                    dyo.monument.has_border = false;
                    if (dyo.config._config.border) {
                        dyo.monument.has_border = true;
                    }
                    document.querySelectorAll('.plaques').forEach(element => {
                        $("#" + element.id).style.display = 'flex';
                    });

                    if (dyo.monument.id == 135) {
                        $("#dyo_select_size").style.display = "none";
                    }
                    
                    dyo.engine.select_fixing.render();
                    dyo.engine.select_corner.render();
                    dyo.engine.select_hole.render();
                    dyo.engine.select_stand.render();
                    break;
                case "Urn":
                    if (dyo.mode == "3d") {
                        $("#dyo_full_monument").style.display = "none";
                    }
                    $("#dyo_add_headstone_base").style.display = "none";
                    $("#dyo_select_size").style.display = "none";
                    dyo.monument.has_border = true;
                    document.querySelectorAll('.urns').forEach(element => {
                        $("#" + element.id).style.display = 'flex';
                    });
                    break;
                case "Full Monument":
                    $("#dyo_add_headstone_base").style.display = "none";
                    if (dyo.mode == "3d") {
                        if ($("#dyo_full_monument")) {
                            $("#dyo_full_monument").style.display = "flex";
                        }
                        if ($('#full_monument-switch')) {
                            $('#full_monument-switch').checked = 'checked';
                        }
                    }
                    $("#dyo_add_headstone_base").style.display = "none";
                    
                    dyo.monument.switch_full_monument = true;
                    dyo.monument.full_monument = true;
                    break;
            }

            switch (dyo.monument._config.formula) {
                default:
                    $("#dyo_select_material").style.display = "none";
                    break;
                case "Engraved": case "Enamel": case "Steel":
                    $("#dyo_select_material").style.display = "flex";
                    break;
                case "Bronze":
                    $("#dyo_select_material").style.display = "flex";
                    $("#dyo_emblems").style.display = "flex";
                    break;
            }

            if (dyo.monument.id == 31) {
                $("#dyo_select_material").style.display = "none";
            }

            dyo.engine.inscriptions.lastY = 0;

            switch (dyo.monument.id) {
                default:
                    $("#dyo_select_shape").style.display = "none";
                    break;
                case 3: case 4: case 5: case 8: case 22: case 10: case 30: case 34: case 35: case 999:
                    $("#dyo_select_shape").style.display = "flex";
                    break;
            }
            
            switch (dyo.monument.id) {
                default:
                    $("#dyo_photos").style.display = "flex";
                    $('#dyo_select_shape_text').innerHTML = Translate(Lang.SELECT_SHAPE);
                    $('#dyo_shapes_title').innerHTML = Translate(Lang.SELECT_SHAPE) + '<i class="material-icons">help_outline</i>';
                    break;
                case 9: 
                    $("#dyo_photos").style.display = "flex";
                    $('#dyo_select_shape_text').innerHTML = Translate(Lang.SIZES);
                    $('#dyo_shapes_title').innerHTML = Translate(Lang.PLAQUE) + " " + Translate(Lang.SIZES).toLowerCase() + '<i class="material-icons">help_outline</i>';
                    break;
                case 7:
                    $('#dyo_select_material_text').innerHTML = Translate(Lang.SELECT) + " " + Translate(Lang.GRANITE);
                    $('#dyo_materials_title').innerHTML = Translate(Lang.MATERIALS) + '<i class="material-icons">help_outline</i>';
                    break;
                case 52:
                    $("#dyo_photos").style.display = "none";
                    $('#dyo_select_material_text').innerHTML = Translate(Lang.SELECT) + " " + Translate(Lang.GRANITE);
                    $('#dyo_materials_title').innerHTML = Translate(Lang.MATERIALS) + '<i class="material-icons">help_outline</i>';
                    break;
        
            }

            //if (!dyo.usa) {
                if ($("#dyo_switch_mode")) {
                    $("#dyo_switch_mode").style.display = "flex";
                }
            //}

            $("#dyo_select_border").style.display = "none";

            if (dyo.config._config.border) {
                $("#dyo_select_border").style.display = "flex";
            }

            dyo.engine.select_shapes.input.render();

            let title = '';
            let title_action = '';
            let material = {};

            switch (dyo.monument._config.formula) {
                case "Laser": case "Engraved":
                    title = Translate(Lang.GRANITES);
                    title_action = Translate(Lang.SELECT_GRANITE);
                    material = this.granites;
                    break;
                case "Bronze":
                    title = Translate(Lang.BRONZES);
                    title_action = Translate(Lang.SELECT_BRONZE);
                    material = this.bronzes;
                    break;
                case "Enamel":
                    title = Translate(Lang.BACKGROUND_COLOUR);
                    title_action = Translate(Lang.BACKGROUND_COLOUR);
                    material = this.backgrounds;
                    break;
                case "Steel":
                    title = Translate(Lang.MATERIALS) + '<i class="material-icons">help_outline</i>';
                    title_action = Translate(Lang.BACKGROUND_COLOUR);
                    material = this.metals;
                    break;
            }
            
            let data = {
                data: material,
                title: title,
                title_action: title_action
            }

            dyo.engine.materials.update(data);
            dyo.engine.select_borders.update();

            if (dyo.monument.rendered == undefined || dyo.edit == true || this.old_id != this.id) {
                if (this.old_id != this.id) {
                    this.old_id = this.id;
                }
                dyo.monument.rendered = true;
                dyo.monument.render();

                $('#base-switch').checked = '';
                if (dyo.mode == "3d") {
                    if (dyo.monument.full_monument != true) {
                        if ($('#full_monument-switch')) {
                            $('#full_monument-switch').checked = '';
                        }
                    }
                }
                dyo.monument.has_base = false;
                dyo.monument.showBase();    
                
            } else {
                
                dyo.engine.loader.force = false;
                dyo.engine.loader.hide("Product:969");
            }

            switch (dyo.monument._config.code) {
                case "Headstone": case "Mini Headstone": 
                    dyo.monument.has_border = false;
                    dyo.monument.showBorder();
                    break;
            }   
            
            if (dyo.mode == "2d") {
                dyo.monument.updateHeader("Product: 1002");
            }

            let icon = '<i class="material-icons mdc-list-item__graphic" aria-hidden="true">texture</i><span id="dyo_select_material_text">';

            switch (dyo.config._config.material) {
                default:
                    $("#dyo_select_material", icon + Translate(Lang.BACKGROUND_COLOUR) + '</span>');
                    break;
                case "stones":
                    $("#dyo_select_material", icon + Translate(Lang.SELECT_GRANITE) + '</span>');
                    break;
                case "metals":
                    $("#dyo_select_material", icon + Translate(Lang.SELECT) + " " + Translate(Lang.GRANITE) + '</span>');
                    break;    
            }

            $("#dyo_select_material_image").style.display = "none";

            if (dyo.monument.id == 7) {
                $("#dyo_select_material_image").style.display = "flex";
            }

            if (dyo.monument.id == 9 ||
                dyo.monument.id == 22) {
                    if ($('#mini-headstones_mini_headstone_only_lay_flat')) {
                        $('#mini-headstones_mini_headstone_only_lay_flat').classList.add("mdc-list-selected");
                    }
            }

            if (dyo.monument.getProductType() == "images") {
                dyo.engine.sizes.setup();
            }

        } else {

            dyo.engine.loader.force = false;
            dyo.engine.loader.hide();
            dyo.engine.loader.hidePercent();
            
        }

        dyo.monument.headstone.launchDesign();

    }

    getNameByID(items, id) {
        let _item;
        let _items = items;

        switch (items) {
            default: 
                items = dyo.config._additions.Motifs;
                break;
            case "borders":
                items = dyo.config._additions.Borders;
                break;
            case "stand":
                items = dyo.config._additions.Stand;
                break;
    
        }

        let found = false;

        items.forEach(item => {
            if (Number(item.id) == id) {
                _item = item;
                found = true;
            }
        });

        if (!found) {
            switch (_items) {
                default: 
                    _item = dyo.monument._additions.Motifs[0];
                    break;
                case "borders":
                    _item = dyo.monument._additions.Borders[0];
                    break;
                case "stand":
                    _item = dyo.monument._additions.Stand[0];
                    break;    
            }
        }

        return _item.name;
    }
    
    getProductType() {
        
        let type;

        dyo.monument.full_monument = false;

        switch (dyo.config._config.code) {
            case "Plaque":
                if (dyo.config._config.name.indexOf("Pet Plaque") > -1) {
                    type = "petplaques";
                } else if (dyo.config._config.name.indexOf("Pet Rock") > -1) {
                    type = "petrock";
                } else if (dyo.config._config.name.indexOf("Full-colour") > -1) {
                    type = "fullcolourplaque";
                } else {
                    type = "plaques";
                }
                break;
            case "Headstone": 
                type = "headstones";
                break;
            case "Full Monument":
                type = "headstones";
                dyo.monument.full_monument = true;
                dyo.monument.has_base = true;
                break;
            case "Mini Headstone":
                type = "mini-headstones";
                break;
            case "Urn":
                type = "urns";
                break;
            case "Image":
                type = "images";
                break;
        }

        return type;

    }

    hasHeadstone() {
        return true;
    }

    hasBase() {
        let value;

		switch (dyo.config._config.code) {
			default:
				value = true;
				break;
			case "Headstone": case "Mini Headstone": case "Full Monument":
                value = true;
                break;
            case "Plaque":
                value = false;
				break;
			case "Urn":
				value = false
				break;
        }

        return value;
    }

}