import NumberController from './dat/controllers/NumberController.js';
import { Button, Dialog, Loader, Drawer, TextField, Select, Slider, List, Snackbar } from './material/MaterialDesign.js';
import { Account, Borders, Stands, Emblems, Canvas, Corners, Holes, FixingSystem, Installations, Inscriptions, Materials, Motifs, Sizes, Photos, Products, Shapes, Tutorial } from './modules/Modules.js'
import { Inscription } from './dyo/Inscription.js';
import { Motif } from './dyo/Motif.js';
import { Emblem } from './dyo/Emblem.js';
import { paymentCancel, paymentSuccess } from './modules/Orders.js';
import { Monument } from './dyo/Monument.js';
import { Data, MotifsData, EmblemsData, InscriptionsData } from './dyo/Data.js';
import { Metrics } from './dyo/Metrics.js';
import { Lang, Translate, $, P } from './Const.js';
import { Engine3d } from './Engine3d.js';

export class Engine extends Data {

	constructor(data = {}) {
        super();

        dyo.engine = this;
        this.metrics = new Metrics();
        this._events = [];
        this.cached_texture = [];

        this.loader = new Loader({
            stage: document.body,
            id: "loader"
        });

        dyo.engine.designSaved = false;
        
        if (sessionStorage.getItem("uncached") != "yes") {
            sessionStorage.setItem("uncached", "yes");
            
            setTimeout(function() {
                window.location.reload(true);
            }, 50);
            
        } else {

            this.checkDevice();
            this.addContainers();

            if (!dyo.accountMode) {
                this.addControllers();

                setTimeout(function() {
                    dyo.engine.addCanvas();
                }, 50);
            } else {
                dyo.monument = new Monument({ 
                    id: dyo.product_id
                });
            }
        }

    }

    checkDevice() {

        const ua = navigator.userAgent;

        if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
            dyo.engine.timeInterval = 500;
            this.deviceType = "tablet";
            this.mobile = false;
            this.mobileDevice = true;
        } else if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
            dyo.engine.timeInterval = 500;
            this.deviceType = "mobile";
            this.mobile = true;
            this.mobileDevice = true;
        } else {
            dyo.engine.timeInterval = 50;
            this.deviceType = "desktop";
            this.mobile = false;
            this.mobileDevice = false;
        }
        
        let ios;
        if (navigator.userAgent.match(/iPhone/i) || navigator.userAgent.match(/iPad/i)) {
            ios = true;
        } else {
            ios = false;
        }

        if (ios) {
            this.deviceOs = "ios";
        } else {
            this.deviceOs = "android";
        }

        if (ios) {
            if (dyo.engine.iosInterval != true) {
                setInterval(() => {
                    if (document.querySelectorAll(".mdc-dialog")) {
                        document.querySelectorAll(".mdc-dialog").forEach(dialog => {
                            dyo.engine.iosInterval = true;
                            dialog.style.cssText = `max-height: ${window.innerHeight}px; top: ${window.scrollY}px !important`;
                            dialog.style.cssText = `max-height: ${window.innerHeight}px; min-height: 50vh; top: ${window.scrollY}px !important`;
                        })
                    }
                }, 1000);
            }
        }

        let deviceType = this.deviceType;

        if (this.mobileDevice) {
            deviceType += "(" + this.deviceOs + ")";
        }

        dyo.navigator = this.getBrowserName() + " (" + deviceType + "), " + window.screen.width + "x" + window.screen.height;

    }

    addContainers() {

        dyo.engine.promoCodeValue = "";

        this.stage = $("div", "add", "dyo", document.body);
		this.container = $("div", "add", "menu-container", this.stage);
		this.container_products = $("div", "add", "container-products", this.stage);
        this.container_shapes = $("div", "add", "shapes-container", this.stage);
        this.container_installations = $("div", "add", "installations-container", this.stage);
        this.container_fixing = $("div", "add", "fixing-container", this.stage);
        this.container_corner = $("div", "add", "corner-container", this.stage);
        this.container_hole = $("div", "add", "hole-container", this.stage);
        this.container_borders = $("div", "add", "borders-container", this.stage);
        this.container_stand = $("div", "add", "stand-container", this.stage);
        this.container_materials = $("div", "add", "materials-container", this.stage);
        this.container_backgrounds = $("div", "add", "backgrounds-container", this.stage);
        this.container_sizes = $("div", "add", "sizes-container", this.stage);
        this.container_inscriptions = $("div", "add", "inscription-container", this.stage);
        this.container_photos = $("div", "add", "photos-container", this.stage);
        this.container_motifs = $("div", "add", "motifs-container", this.stage);
        this.container_emblems = $("div", "add", "emblems-container", this.stage);
        this.container_tutorial = $("div", "add", "tutorial-container", this.stage);
        this.container_account = $("div", "add", "account-container", this.stage);
        this.container_settings = $("div", "add", "settings-container", this.stage);

        //document.addEventListener('contextmenu', event => event.preventDefault());

        if (window.self !== window.top) {
            //mode = 'iframe';
		} else {
            if (dyo.engine.deviceOs == "ios") {
                window.addEventListener('pagehide', () => {
                    window.event.cancelBubble = true; 
                    alert(Translate(Lang.YOUR_CURRENT_DESIGN_WILL_BE_LOST));
                    return false;
                });
            } else {
                window.onbeforeunload = function() {
                    alert(Translate(Lang.YOUR_CURRENT_DESIGN_WILL_BE_LOST));
                    return false;
                }
            }
        }

    }

    addCanvas() {

		this.canvas = new Canvas({
			stage: document.body,
			id: "canvas"
        })
        this.canvas.render();

        let _font = [];
        let _nr = 0;
        let regex = " ";
        this.fonts.forEach(f => {
            _font[_nr] = document.createElement('span');
            _font[_nr].style.fontFamily = f.name;

            //_font[_nr].id = f.name.replace(" ", "_");
            _font[_nr].id = f.name.replaceAll(new RegExp(regex, "gi"), "_");
            //console.log(_font[_nr].id);
            $('body').appendChild(_font[_nr]);
            _nr ++;
        });

        let t = 0;

        if (document.fonts) {
            document.fonts.ready.then(function () {
                dyo.engine.fonts.forEach(f => {
                    setTimeout(() => {
                        t ++;
                        $('body').removeChild($('#' + f.name.replaceAll(new RegExp(regex, "gi"), "_")));
                    }, 500 * t);
                });

                dyo.monument = new Monument({ 
                    id: dyo.product_id, 
                    stage: dyo.engine.canvas.stage
                });

            });
        } else {
            dyo.monument = new Monument({
                id: dyo.product_id, 
                stage: this.canvas.stage
            });
        }

        if (dyo.mode == "3d") {
            var dyo3d = document.createElement('script');
            dyo3d.setAttribute('src','Engine3D.js');
            document.head.appendChild(dyo3d);
        }

        this.engineStarted = false;
        
    }

    removeBorder() {
        dyo.monument.headstone.removeBorder();
        dyo.borderLoaded = false;
    }

    addBorder() {

        if (dyo.monument.headstone) {
            let bitmap = new createjs.Container();
            bitmap.addChild(dyo.monument.headstone.overlayFront);
            switch (dyo.monument.headstone.border) {
                case "Border 8": case "Border 9":
                    bitmap.addChild(dyo.monument.headstone.overlayFrontDetail);
                    bitmap.addChild(dyo.monument.headstone.overlayFrontDetail_2);
                    bitmap.addChild(dyo.monument.headstone.overlayFrontDetail_3);
                    bitmap.addChild(dyo.monument.headstone.overlayFrontDetail_4);
                    break;
            }

            bitmap.cache(-(dyo.dpr * dyo.monument.headstone.pixels.width) / 2, -(dyo.dpr * dyo.monument.headstone.pixels.height) / 2, (dyo.dpr * dyo.monument.headstone.pixels.width), (dyo.dpr * dyo.monument.headstone.pixels.height));

            if (dyo.borderLoaded) {
                if (dyo.monument.headstone.inst3d) {
                    dyo.monument.headstone.inst3d.changeProperty("display_object", new Engine3D.values.DisplayObjectValue(bitmap.cacheCanvas));
                    dyo.monument.headstone.inst3d.changeProperty("width", dyo.data.width);
                    dyo.monument.headstone.inst3d.changeProperty("height", dyo.data.height);
                }
            } else {
                dyo.monument.headstone.addBorder(bitmap.cacheCanvas);
            }
            
        }

    }

    addControllers() {

        dyo.data = { width: 1, height: 1, length: 1, size: 1, detail: 0 }

        dyo.controller_Width = new NumberController(dyo.data, "width").onChange(function(e) {

            dyo.engine.resizing = "width";

            switch (dyo.metric) {
                case "inches":
                    $('#dyo_slider_width_value', Translate(Lang.WIDTH) + ": " + dyo.engine.metrics.toInch(this.object.width));
                    $('#dyo_width_textfield', "value", dyo.engine.metrics.toInchPlain(this.object.width));
                    break;
                default:
                    $('#dyo_slider_width_value', Translate(Lang.WIDTH) + ": " + this.object.width + " MM");
                    $('#dyo_width_textfield', "value", this.object.width);
                    break;
            }

            dyo.engine.sizes.slider_width.slider.value = this.object.width;

            if (dyo.target) {
                switch (dyo.target.type) {
                    case "Headstone":

                        switch (dyo.target.fixed) {
                            case 3:
                                if (this.object.width != this.object.height) {
                                    dyo.engine.sizes.slider_height.slider.value = this.object.width;

                                    if (this.object.width <= dyo.target.max_height) {
                                        dyo.controller_Height.setValue(this.object.width);
                                    } else {
                                        dyo.controller_Height.setValue(dyo.target.max_height);
                                    }
                                }
                                break;

                            case 4:
                                if (dyo.monument.headstone) {
                                    if (dyo.monument.headstone.ratio4) {

                                        let new_height = Math.round(this.object.width / dyo.monument.headstone.ratio4);

                                        if (this.object.width != (Math.round(this.object.height * dyo.monument.headstone.ratio4))) {   

                                            if (dyo.mode == "2d") {
                                                dyo.engine.sizes.slider_height.slider.value = new_height;
                                                dyo.controller_Height.setValue(new_height);

                                            } else {
                                                if (Engine3D.Controller.getCurrentProject().getSelectedModel()) {
                                                    if (Engine3D.Controller.getCurrentProject().getSelectedModel().getGeneralType() == "table") {

                                                        let o = dyo.engine3d.headstone3d;

                                                        let Width = o.getProperty("width");
                                                        let Height = o.getProperty("height");
                                                        let Length = o.getProperty("depth");

                                                        dyo.engine.sizes.slider_height.slider.value = new_height;
                                                        dyo.controller_Height.setValue(new_height);
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                                break;

                        }

                        break;

                }

                
                if (dyo.monument.id == 4 || dyo.monument.id == 124) {

                    if (dyo.monument.has_base) {

                        let base_thickness = 130;

                        if (Number(this.object.width) > 600) {
                            base_thickness = 250;
                        } 
        
                        if (dyo.monument.base) {
                            dyo.monument.base.setLength(base_thickness);
                        }

                    }

                }

            }

            if (dyo.mode == "3d") {
                let diff = 200;

                if (dyo.engine.engineStarted) {
                    if (dyo.borderLoaded) {
                        dyo.engine.addBorder();
                    }
                }

                if (dyo.engine3d.currentModel) {
                    dyo.engine3d.currentModel.changeProperty("width", Number(this.object.width));

                    switch (dyo.config._config.type) {

                        case "headstone":    

                            if (dyo.engine3d.currentModel.generalType) {
                                switch (dyo.engine3d.currentModel.generalType.toLowerCase()) {
                                    case "headstone": case "table":
                                        if (dyo.monument.has_base) {
                                            if (Number(this.object.width) > dyo.engine3d.stand3d.getProperty("width")) {
                                                dyo.engine3d.stand3d.changeProperty("width", Number(this.object.width) + diff / 2);
                                            }

                                            if (dyo.monument.has_base) {

                                                let current_thickness = dyo.engine3d.stand3d.getProperty("depth");
                                                let base_thickness = 130;
            
                                                if (Number(this.object.width) > 600) {
                                                    base_thickness = 250;
                                                } 
                                
                                                if (current_thickness < base_thickness) {
                                                    dyo.engine3d.stand3d.changeProperty("depth", base_thickness);
                                                }
            
                                            }
                                        }
                                        break;
                                }
                            }
                            
                            break;

                        case "full-monument":
                                
                            switch (dyo.engine3d.currentModel.generalType.toLowerCase()) {
                                case "headstone": case "table":
                                    if (Number(this.object.width) > Number(dyo.engine3d.stand3d.getProperty("width"))) {
                                        dyo.engine3d.stand3d.changeProperty("width", Number(this.object.width) + diff);    
                                        dyo.engine3d.ledger3d.changeProperty("width", Number(this.object.width));
                                        dyo.engine3d.kerb3d.changeProperty("width", Number(this.object.width) + diff);
                                    }
                                    break;
                                case "stand":
                                    dyo.engine3d.ledger3d.changeProperty("width", Number(this.object.width) - diff);
                                    dyo.engine3d.kerb3d.changeProperty("width", Number(this.object.width));
                                    break;
                                case "ledger": case "lid":
                                    dyo.engine3d.kerb3d.changeProperty("width", Number(this.object.width) + diff);
                                    dyo.engine3d.stand3d.changeProperty("width", Number(this.object.width) + diff);
                                    break;
                                case "kerbset": case "kerb":
                                    dyo.engine3d.ledger3d.changeProperty("width", Number(this.object.width) - diff);
                                    dyo.engine3d.stand3d.changeProperty("width", Number(this.object.width));
                                    break;        
                            }
                            break;

                    }

                }

            }

        });

        dyo.controller_Height = new NumberController(dyo.data, "height").onChange(function(e) {

            dyo.engine.resizing = "height";

            dyo.engine.sizes.slider_height.slider.value = this.object.height;

                switch (dyo.metric) {
                    case "inches":
                        $('#dyo_slider_height_value', Translate(Lang.HEIGHT) + ": " + dyo.engine.metrics.toInch(this.object.height));
                        $('#dyo_height_textfield', "value", dyo.engine.metrics.toInchPlain(this.object.height));
                        break;
                    default:
                        $('#dyo_slider_height_value', Translate(Lang.HEIGHT) + ": " + this.object.height + " MM");
                        $('#dyo_height_textfield', "value", this.object.height);
                        break;
                }

                if (dyo.target) {
                    switch (dyo.target.type) {
                        case "Headstone":

                            switch (dyo.target.fixed) {
                                case 3:
                                    if (this.object.width != this.object.height) {
                                        dyo.engine.sizes.slider_width.slider.value = this.object.height;
                                        dyo.controller_Width.setValue(this.object.height);
                                    }        
                                    break;
                                case 4:
                                    if (dyo.monument.headstone) {
                                        if (dyo.monument.headstone.ratio4) {
        
                                            let new_width = Math.round(this.object.height * dyo.monument.headstone.ratio4);
            
                                            if (this.object.height != (Math.round(this.object.width / dyo.monument.headstone.ratio4))) {

                                                if (dyo.mode == "2d") {
                                                    dyo.engine.sizes.slider_width.slider.value = new_width;
                                                    dyo.controller_Width.setValue(new_width);
                                                } else {
                                                    if (Engine3D.Controller.getCurrentProject().getSelectedModel()) {
                                                        if (Engine3D.Controller.getCurrentProject().getSelectedModel().getGeneralType() == "table") {
                                                            dyo.engine.sizes.slider_width.slider.value = new_width;
                                                            dyo.controller_Width.setValue(new_width);
                                                        }
                                                    }
                                                }
                                                
                                            }

                                        }
                
                                    }        
                                    break;
                            }

                            if (dyo.monument.id == 4 || dyo.monument.id == 124) {

                                if (Number(this.object.height) < 700) {
                                    if (dyo.monument.headstone) {
                                        dyo.monument.headstone.setLength(80);
                                    }
                                } else if (Number(this.object.height) > 700 && Number(this.object.height) < 800) {
                                    if (dyo.monument.headstone) {
                                        dyo.monument.headstone.setLength(90);
                                    }
                                } else if (Number(this.object.height) > 800) {
                                    if (dyo.monument.headstone) {
                                        dyo.monument.headstone.setLength(100);
                                    }
                                }

                                if (dyo.monument.has_base) {

                                    let base_thickness = 130;

                                    if (Number(this.object.height) > 600) {
                                        base_thickness = 250;
                                    } 
                    
                                    if (dyo.monument.base) {
                                        dyo.monument.base.setLength(base_thickness);
                                    }

                                }

                            }

                    }
                }

                if (dyo.mode == "3d") {
                    if (dyo.engine3d.currentModel) {
                        dyo.engine3d.currentModel.changeProperty("height", Number(this.object.height));

                        if (dyo.monument._config.type == "headstone" || dyo.monument._config.type == "full-monument") {
                            
                            let part;

                            if (dyo.engine.engineStarted) {
                                if (dyo.borderLoaded) {
                                    dyo.engine.addBorder();
                                }
                            }
                            
                            if (Engine3D.Controller.getCurrentProject().getSelectedModel()) {
                                part = Engine3D.Controller.getCurrentProject().getSelectedModel().getGeneralType();
                            } 

                            switch (part) {
                                default:
                                    dyo.engine.sizes.enable("length");
                                    break;

                                case "table":

                                    if (dyo.usa == false) {
                                        if (Number(this.object.height) < 700) {
                                            dyo.engine.sizes.disable("length");
                                            dyo.controller_Length.setValue(80);
                                        } else if (Number(this.object.height) > 700 && Number(this.object.height) < 800) {
                                            dyo.engine.sizes.disable("length");
                                            dyo.controller_Length.setValue(90);
                                        } else if (Number(this.object.height) > 800) {
                                            dyo.engine.sizes.disable("length");
                                            dyo.controller_Length.setValue(100);
                                        }
                                    }

                                    if (dyo.monument.has_base) {

                                        let current_thickness = dyo.engine3d.stand3d.getProperty("depth");
                                        let base_thickness = 130;
    
                                        if (Number(this.object.width) > 600) {
                                            base_thickness = 250;
                                        } 
                        
                                        if (current_thickness < base_thickness) {
                                            dyo.engine3d.stand3d.changeProperty("depth", base_thickness);
                                        }
                                        
                                    }

                                    break;
                            }

                        } 

                        switch (dyo.config._config.type) {
                            case "full-monument":
                                let diff = 200;
                                switch (dyo.engine3d.currentModel.generalType.toLowerCase()) {
                                    case "stand":
                                        dyo.engine3d.kerb3d.changeProperty("height", Number(this.object.height) - diff / 2);
                                        break;        
                                    case "kerbset": case "kerb":
                                        dyo.engine3d.stand3d.changeProperty("height", Number(this.object.height) + diff / 2);
                                        break;        
                                }
                                break;
                        }

                    }

                }

        });

        dyo.controller_Length = new NumberController(dyo.data, "length").onChange(function(e) {

            dyo.engine.sizes.slider_length.slider.value = this.object.length;
            
            let lang = Translate(Lang.THICKNESS) + ":&nbsp;";

            switch (dyo.engine3d.currentModel.generalType.toLowerCase()) {
                default:
                    lang = Translate(Lang.THICKNESS) + ":&nbsp;";
                    break;
                case "ledger":
                    lang = Translate(Lang.LENGTH) + ":&nbsp;";
                    break;
                case "kerbset": case "kerb":
                    lang = Translate(Lang.LENGTH) + ":&nbsp;";
                    break;        
            }

            switch (dyo.metric) {
                case "inches":
                    $('#dyo_slider_length_value', lang + dyo.engine.metrics.toInch(this.object.length));
                    $('#dyo_length_textfield', "value", dyo.engine.metrics.toInchPlain(this.object.length));
                    break;
                default:
                    $('#dyo_slider_length_value', lang + this.object.length + " MM");
                    $('#dyo_length_textfield', "value", this.object.length);
                    break;
            }

            if (dyo.mode == "3d") {

                if (dyo.engine3d.currentModel) {

                    if (this.object.length > 0) {

                        dyo.engine3d.currentModel.changeProperty("depth", Number(this.object.length));

                        if (dyo.config._config.type == "full-monument") {
                                
                            let diff = 200;

                            switch (dyo.engine3d.currentModel.generalType.toLowerCase()) {
                                case "headstone":
                                    //dyo.engine3d.stand3d.changeProperty("depth", Number(this.object.length) + diff / 2);
                                    break;
                                case "ledger": case "lid":
                                    dyo.engine3d.kerb3d.changeProperty("depth", Number(this.object.length) + diff / 2);
                                    break;
                                case "kerbset": case "kerb":
                                    dyo.engine3d.ledger3d.changeProperty("depth", Number(this.object.length) - diff / 2);
                                    break;        
                            }

                        }

                    }
                    
                }

            }

        });

        dyo.controller_Size = new NumberController(dyo.data, "size").onChange(function(e) {

            switch (dyo.currentSection) {
                case "Sizes": case "Shapes": case "Design Menu":

                    if (dyo.monument.id == 5 ||
                        dyo.monument.id == 32 ||
                        dyo.monument.id == 52 ||
                        dyo.monument.id == 999) {

                        if (dyo.mode == "2d") {

                            let size;

                            dyo.slider_size = this.object.size;

                            //console.log(this.object.size, dyo.data.size, dyo.data.sizeNr);
                            //dyo.engine.sizes.slider_size.slider.value = this.object.size;
                            
                            if (dyo.monument.id == 5) {
                                size = dyo.engine.sizes.emblemSizes()[this.object.size];
                            }

                            if (dyo.monument.id == 32) {
                                size = dyo.engine.sizes.plaqueSizes()[this.object.size];
                            }

                            if (size != undefined) {

                                let s = size.name.split(' x ');
                                let width = Number(s[0]);
                                let height = Number(s[1].replace(' mm', ''));

                                if (dyo.monument.id == 5) {

                                    //console.log(dyo.monument.headstone.name);
                                    //console.log(size.name, width, height);

                                    if (dyo.monument.headstone.name.indexOf("Landscape") > -1) {
                                        height = Math.round(width * 0.69);
                                    }

                                    if (dyo.monument.headstone.name.indexOf("Portrait") > -1) {
                                        width = Math.round(height * 0.69);
                                    }
                                }

                                if (dyo.monument.id == 32) {
                                    if (dyo.monument.headstone.name.indexOf("Landscape") > -1) {
                                        let w = width;
                                        let h = height;
                                        width = Math.round(h);
                                        height = Math.round(w);
                                    }

                                    if (dyo.monument.headstone.name.indexOf("Full-colour Plaque") > -1) {
                                        let w = width;
                                        let h = height;
                                        width = Math.round(h);
                                        height = Math.round(w);
                                    }
                                }
                                
                                if (dyo.metric == "inches") {
                                    $('#dyo_slider_size_value', Translate(Lang.SIZE) + ": " + dyo.engine.metrics.toInch(width) + " x " + dyo.engine.metrics.toInch(height));
                                } else {
                                    $('#dyo_slider_size_value', Translate(Lang.SIZE) + ": " + Math.round(width) + " x " + Math.round(height) + " MM");
                                }

                                dyo.controller_Width.setValue(width);
                                dyo.controller_Height.setValue(height);

//                                console.log(width, height);

                                if (dyo.monument.headstone) {
                                    dyo.monument.headstone.width = width;
                                    dyo.monument.headstone.height = height;

                                    dyo.monument.updateHeader("Engine: 440");
                                    dyo.monument.updateMonument("engine:469");
                                }

                            }
                            
                        }

                    } else {

                        let photo_id = 200;

                        if (dyo.monument.materialImage == 1) {
                            photo_id = 200;
                        }
            
                        if (dyo.monument.materialImage == 2) {
                            photo_id = 201;
                        }

                        if (dyo.monument.materialImage == 3) {
                            photo_id = 202;
                        }
                        
                        let photo_size = dyo.engine.photos_sizes(photo_id, "engine:760")[this.object.size];

                        if (photo_size) {

                            let size = photo_size.name.split(' x ');
                            let width = size[0];
                            let height = size[1].replace(' mm', '');

                            dyo.engine.sizes.slider_size.slider.value = this.object.size;

                            if (dyo.metric == "inches") {
                                $('#dyo_slider_size_value', Translate(Lang.SIZE) + ": " + dyo.engine.metrics.toInch(width) + " x " + dyo.engine.metrics.toInch(height));
                            } else {
                                $('#dyo_slider_size_value', Translate(Lang.SIZE) + ": " + Math.round(width) + " x " + Math.round(height) + " MM");
                            }
            
                            dyo.controller_Width.setValue(width);
                            dyo.controller_Height.setValue(height);

                            if (dyo.monument.headstone) {
                                dyo.monument.headstone.width = width;
                                dyo.monument.headstone.height = height;

                                dyo.monument.updateHeader("Engine: 472");
                                dyo.monument.updateMonument("engine:499");
                            }

                        } 

                    }                    
                    break;

                case "Inscriptions": 
                    dyo.engine.inscriptions.slider_size.slider.value = this.object.size;
                    break;

                case "Motifs": 
                    dyo.engine.motifs.slider_size.slider.value = this.object.size;
                    if (dyo.selected) {
                        if (dyo.metric == "inches") {
                            $('#dyo_slider_motif_height_value', Translate(Lang.SIZE) + ": " + dyo.engine.metrics.toInch(Math.round(this.object.size / dyo.selected.dimmension_ratio)));
                        } else {
                            $('#dyo_slider_motif_height_value', Translate(Lang.SIZE) + ": " + Math.round(this.object.size / dyo.selected.dimmension_ratio) + " MM");
                        }
                    }
                    break;

                case "Emblems": 
                    let size = dyo.engine.sizes.emblemSizes()[this.object.size - 1];

                    if (size != undefined) {
                        if (dyo.metric == "inches") {
                            $('#dyo_slider_size_value', Translate(Lang.SIZE) + ": " + dyo.engine.metrics.toInch(size.init_width) + " x " + dyo.engine.metrics.toInch(size.init_height));
                        } else {
                            $('#dyo_slider_size_value', Translate(Lang.SIZE) + ": " + size.init_width + " x " + size.init_height + " MM");
                        }
                    }

                    dyo.engine.emblems.slider_size.slider.value = this.object.size;
                    break;

                case "Photos": 
                    dyo.engine.photos.slider_size.slider.value = this.object.size;

                    if (dyo.mode == "3d") {
                        if (dyo.selected) {
                            if (dyo.selected != "mask") {
                                if (dyo.selected.isFixed() == false) {
                                    if (dyo.metric == "inches") {
                                        $('#dyo_slider_photo_size_value', Translate(Lang.SIZE) + ": " + dyo.engine.metrics.toInch(this.object.size));
                                    } else {
                                        $('#dyo_slider_photo_size_value', Translate(Lang.SIZE) + ": " + this.object.size + " MM");
                                    }
                                }
                            }
                        }
                    }

                    dyo.monument.updateHeader("Engine: 472");

                    break;

                case "Crop": 
                    dyo.engine.photos.slider_size.slider.value = this.object.size;
                    $('#dyo_slider_photo_size_value', Translate(Lang.POSITION_PHOTO_AND_SIZE));
                    break;
            }
            
        });

        dyo.controller_Rotate = new NumberController(dyo.data, "rotate").onChange(function(e) {

            switch (dyo.currentSection) {
                case "Inscriptions": 
                    $('#dyo_slider_inscription_slider_rotation_value', Translate(Lang.ROTATION) + ": " + this.object.rotate + "&deg;");
                    dyo.engine.inscriptions.slider_rotation.slider.value = this.object.rotate;
                    break;
                case "Motifs": 
                    $('#dyo_slider_motif_slider_rotation_value', Translate(Lang.ROTATION) + ": " + this.object.rotate + "&deg;");
                    dyo.engine.motifs.slider_rotation.slider.value = this.object.rotate;
                    break;
                case "Emblems": 
                    $('#dyo_slider_emblem_slider_rotation_value', Translate(Lang.ROTATION) + ": " + this.object.rotate + "&deg;");
                    dyo.engine.emblems.slider_rotation.slider.value = this.object.rotate;
                    break;
                case "Photos": 
                    $('#dyo_slider_photo_slider_rotation_value', Translate(Lang.ROTATION) + ": " + this.object.rotate + "&deg;");
                    dyo.engine.photos.slider_rotation.slider.value = this.object.rotate;
                    break;
                case "Crop": 
                    $('#dyo_slider_photo_slider_rotation_value', Translate(Lang.SELECT_ROTATION) + ": " + this.object.rotate + "&deg;");
                    dyo.engine.photos.slider_rotation.slider.value = this.object.rotate;
                    break;
            }
            
        });
        
    }

    render() {

        dyo.uniqueid = Date.now();

        this.dialog_menu = new Dialog({
            stage: document.body,
            id: "dialog_menu",
            type: 0
        });

        if (!dyo.accountMode) {
            this.drawer = new Drawer({
                stage: this.container,
                id: "dyo_menu",
                toolbar_title: "Design Your Own",
                toolbar_type: 0
            });
            this.drawer.render();

            $("#dyo_new_design").style.display = "none";

            /*
            this.settings = new Settings({
                stage: this.container_settings,
                id: "settings",
                title: Lang.SETTINGS
            });
            this.settings.render();
            */

            this.select_products = new Products({
                stage: this.container_products,
                id: "products",
                title: Lang.PRODUCTS
            });
            this.select_products.render();

            this.select_shapes = new Shapes({
                stage: this.container_shapes,
                id: "shapes",
                title: Lang.SHAPES
            });
            this.select_shapes.render();

            this.select_installations = new Installations({
                stage: this.container_installations,
                id: "installations",
                title: Lang.SELECT_INSTALLATION
            });
            
            this.select_fixing = new FixingSystem({
                stage: this.container_fixing,
                id: "fixing",
                title: Lang.FIXING_SYSTEM
            });

            this.select_corner = new Corners({
                stage: this.container_corner,
                id: "corner",
                title: Lang.CORNERS
            });

            this.select_hole = new Holes({
                stage: this.container_corner,
                id: "hole",
                title: Lang.HOLES
            });

            this.select_borders = new Borders({
                stage: this.container_borders,
                id: "borders",
                title: Lang.BORDERS
            });

            this.select_stand = new Stands({
                stage: this.container_stand,
                id: "stand",
                title: Lang.STAND
            });

            this.materials = new Materials({
                stage: this.container_materials,
                id: "materials",
                data: this.granites,
                data_image: this.product_image,
                title: Lang.MATERIALS
            });
            this.materials.render();

            this.sizes = new Sizes({
                stage: this.container_sizes,
                id: "sizes",
                title: Lang.SIZES
            });
            this.sizes.render();

            this.inscriptions = new Inscriptions({
                stage: this.container_inscriptions,
                id: "inscriptions",
                title: Lang.INSCRIPTIONS
            });
            this.inscriptions.render();

            this.photos = new Photos({
                stage: this.container_photos,
                id: "photos",
                title: Lang.PHOTO
            });
            this.photos.render();

            this.motifs = new Motifs({
                stage: this.container_motifs,
                id: "motifs",
                title: Lang.MOTIFS
            });
            this.motifs.render();

            this.emblems = new Emblems({
                stage: this.container_motifs,
                id: "emblems",
                title: Lang.EMBLEMS
            });
            this.emblems.render();
        }

        this.account = new Account({
            stage: this.container_account,
            id: "account",
            title: Lang.MY_ACCOUNT
        });

        this.tutorial = new Tutorial({
            stage: this.container_tutorial,
            id: "tutorial",
            title: Lang.TUTORIAL
        });

        this.dialog = new Dialog({
            stage: document.body,
            id: "dialog",
            type: 8
        });

        this.dialog_resp = new Dialog({
            stage: document.body,
            id: "dialog_resp",
            type: 0
        });

        this.popup_login = new Dialog({
            stage: document.body,
            id: "login",
            type: 1
        });

        this.popup_reset_password = new Dialog({
            stage: document.body,
            id: "reset_password",
            type: 7
        });

        this.popup_account_details = new Dialog({
            stage: document.body,
            id: "account_details",
            type: 4
        });

        this.popup_invoice_details = new Dialog({
            stage: document.body,
            id: "invoice_details",
            type: 5
        });

        this.popup_delivery_details = new Dialog({
            stage: document.body,
            id: "delivery_details",
            type: 6
        });

        this.design_name = new Dialog({
            stage: document.body,
            id: "design-name",
            placeholder: Lang.DESIGN_NAME,
            type: 9
        });

        this.promo_code = new Dialog({
            stage: document.body,
            id: "promo-code",
            placeholder: Lang.PROMO_CODE,
            type: 90
        });

        this.email_design = new Dialog({
            stage: document.body,
            id: "email-design",
            placeholder: Lang.EMAIL_ADDRESS,
            multi_placeholder: Lang.MESSAGE,
            msg_input_result: Lang.EMAIL_SENT,
            addTextInput: true,
            type: 21
        });

        this.quick_enquiry = new Dialog({
            stage: document.body,
            id: "quick-email-design",
            placeholder: Lang.EMAIL_ADDRESS,
            multi_placeholder: Lang.PHONE,
            enquiry_placeholder: Lang.ENTER_YOUR_ENQUIRY_HERE,
            msg_input_result: Lang.THANK_YOU_FOR_CONTACTING_US,
            addTextInput: true,
            type: 22
        });

        this.popup_account = new Dialog({
            stage: document.body,
            id: "account-popup",
            type: 3
        });

        this.snackbar = new Snackbar({
            stage: document.body,
            id: "info",
            type: 1
        });
        this.snackbar.render();

        this.events();
        dyo.init = true;
        
    }

    setupProduct() {

        let self = this;

        this.select_borders.isRendered = false;
        this.select_borders.render();
        this.photos.input.render();
        this.getCategory(0);
        this.getCategoryEmblems(0);

        if (dyo.engine.mobileDevice) {
            if (window.matchMedia("(orientation: portrait)").matches) {
                dyo.engine.canvas.swipeArrow.show();
            }
        }
            
        if (dyo.monument.id != 5) {
            dyo.engine.sizes.setup();
        }

        if (!dyo.accountMode) {
            if (dyo.mode == "2d") {
                if(dyo.pet == false) {
                    if (dyo.first_run) {
                        dyo.first_run = false;
                        if (window.location.href.indexOf("my-account") == -1 && window.location.href.indexOf("payment-cancel") == -1) {
                            if (dyo.product_id_set != true) {
                                if (dyo.monument_design_stampid == undefined) {
                                    if (dyo.monument.id != 7) {
                                        dyo.products.popup();
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } 

        if (dyo.mode == "3d") {
            dyo.engine.loader.show("Engine:627");
            dyo.engine.loader.force = true;

            //$("#openfl").style.visibility = "hidden";
            //$("#openfl").style.opacity = 0.05;
            $("#canvas").style.visibility = "visible";

            dyo.engine.checkEngine();
        }

        //setTimeout(() => {
        //    this.performTesting();
        //}, 1000);

    }

    checkEngine() {
        setTimeout(function() {
            if (typeof lime !== 'undefined') {
                    dyo.engine3d.BuildEngine();
            } else {
                dyo.engine.checkEngine();
            }
        }, 500);
    }

    validateInput(input) {
        if (input.length < 2) {
            return false;
        } else {
            return true;
        }
    }

    validateWebsite(input) {
        var re = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/;
        return re.test(String(input).toLowerCase());
    }

    validateEmail(email) {
        if (email.trim() == "") {
            return false;
        } else {
            var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }
    }

    validatePhone(str) {
        let result = /^[- +()]*[0-9][- +()0-9]*$/.test(str);

        if (str.length < 6) {
            result = false;
        }
        if (str.length > 30) {
            result = false;
        }

        return result;
    }

    validateNumber(str) {
        let result = /^[- +()]*[0-9][- +()0-9]*$/.test(str);

        return result;
    }

    validatePostcode(str) {
        let result = false;

        switch (dyo.country) {
            default:
                result = /^[0-9? ,_-]+$/.test(str);
                if (str.length < 4 || str.length > 6) {
                    result = false;
                }
                result = true;
                break;
            case "au":
                result = /^[a-zA-Z\-0-9? ,_-]+$/.test(str);
                if (str.length > 10) {
                    result = false;
                }
                break;
            case "us":
                result = /^[0-9? ,_-]+$/.test(str);
                if (str.length < 4 || str.length > 15) {
                    result = false;
                }
                result = true;
                break;
        }

        return result;
    }

    getFixing() {
        return this.fixingSystem;
    }

    getItemByID(items, id) {
        let _item;

        switch (items) {
            default: case "images":
                items = dyo.config._additions.Images
                break;
        }

        items.forEach(item => {
            if (Number(item.id) == id) {
                _item = item;
            }
        });

        return _item;
    }

    login_view(view) {

        let login = $("#dyo_login");
        let reset = $("#dyo_reset");
        let password = $("#dyo_password");
        dyo.engine.popup_login.login_info.hide();

        switch (view) {
            case 0:
                $('#dyo_button_login_to_account').style.display = "block";
                $('#dyo_login_container').classList.add('grid50');
                $('#welcome-to-design-your-own', Translate(Lang.WELCOME_TO_DYO));
                $('#dyo_login_title', Translate(Lang.LOGIN));
                $('#dyo_login_info', "value", '');

                $("#dyo_register_container").style.display = "block";

                $('#dyo_login_info-tf-outlined').style.display = "block";
                $('#dyo_login-tf-outlined').style.display = "flex";
                $('#dyo_login-tf-outlined').style.width = "244px";
                $('#dyo_button_reset').style.display = "block";

                dyo.engine.popup_login.login_password.show();
                dyo.engine.popup_login.reset_password_button.show();
                dyo.engine.popup_login.login_button.show();
                dyo.engine.popup_login.reset_button.hide();
                dyo.engine.popup_login.login_to_account_button.hide();

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

                break;
            case 1:
                // Reset password
                document.location.href = "#reset-password";

                $('#dyo_button_login_to_account').style.display = "block";
                $('#dyo_login_container').classList.remove('grid50');
                $('#welcome-to-design-your-own', Translate(Lang.RESET_PASSWORD));
                $('#dyo_login_title', Translate(Lang.RESET_PASSWORD_INFO_1));
                $('#dyo_login_info', "value", '');
        
                $("#dyo_register_container").style.display = "none";
                dyo.engine.popup_login.login_password.hide();
                dyo.engine.popup_login.reset_password_button.hide();
                dyo.engine.popup_login.login_button.hide();
                dyo.engine.popup_login.reset_button.show();
                dyo.engine.popup_login.login_to_account_button.show();
                break;
        }

    }

    reset_password() {

        let login = $("#dyo_login");
        $('#dyo_login_info', "value", '');

        dyo.engine.loader.show("Engine:1175");

        if (this.validateEmail(login.value)) {

            let data = new FormData();
            data.append('customer_email', login.value.toLowerCase());

            fetch(dyo.path.reset_password, {
                method: 'POST',
                body: data
            })
            .then((response) => {
                response.text().then((data) => {
                    dyo.engine.loader.hide("Engine:832");
                    let result = JSON.parse(data);

                    if (result != 0) {
                        dyo.engine.popup_login.login_info.show();
                        $('#dyo_login_title', Translate(Lang.PASSWORD_RESET_LINK_HAS_BEEN_SENT).replace("@email", login.value.toLowerCase()));
                        $('#dyo_login_info-tf-outlined').style.display = "none";
                        $('#dyo_login-tf-outlined').style.display = "none";
                        $('#dyo_button_reset').style.display = "none";
                        $('#dyo_button_login_to_account').style.display = "none";
                    } else {
                        dyo.engine.popup_login.login_info.show();
                        $('#dyo_login_info', "value", Translate(Lang.EMAIL_NOT_IN_DB));
                    }
        
                });
            })
            .catch(error => { 
                dyo.engine.loader.hide("Engine:837");
                console.error('Error:', error) 
            });

        } else {

            if (!this.validateEmail(login.value)) {
                login.focus();
                dyo.engine.popup_login.login_info.show();
                $('#dyo_login_info', "value", Translate(Lang.PLEASE_ENTER_EMAIL));
                dyo.engine.loader.hide("Engine:837");
            }

        }

    }

    login() {

        let login = $("#dyo_login");
        let password = $("#dyo_password");
        $('#dyo_login_info', "value", '');

        if (this.validateEmail(login.value) && password.value) {

            dyo.engine.loader.show("Engine:861");

            let data = new FormData();
            data.append('customer_email', login.value.toLowerCase());
            data.append('customer_password', password.value);

            console.log(dyo.path.login);

            fetch(dyo.path.login, {
                method: 'POST',
                body: data
            })
            .then((response) => {
                response.text().then((data) => {

                    dyo.engine.loader.hide("Engine:876");

                    console.log(data);

                    let result = JSON.parse(data);

                    if (result.length == 0) {

                        login.focus();
                        dyo.engine.popup_login.login_info.show();
                        $('#dyo_login_info', "value", Translate(Lang.LOGIN_AND_PASSWORD_DO_NOT_MATCH));

                    } else if (result == "not-in-db") {

                        login.focus();
                        dyo.engine.popup_login.login_info.show();
                        $('#dyo_login_info', "value", Translate(Lang.EMAIL_NOT_IN_DB));

                    } else {

                        document.location.href = "#my-account";

                        sessionStorage.setItem('customer_abn', result[0]['customer_abn']);
                        sessionStorage.setItem('customer_address', result[0]['customer_address']);
                        sessionStorage.setItem('customer_businessname', result[0]['customer_businessname']);
                        sessionStorage.setItem('customer_country', result[0]['customer_country']);
                        sessionStorage.setItem('customer_email', result[0]['customer_email']);
                        sessionStorage.setItem('customer_fax', result[0]['customer_fax']);
                        sessionStorage.setItem('customer_firstname', result[0]['customer_firstname']);
                        sessionStorage.setItem('customer_id', result[0]['customer_id']);
                        sessionStorage.setItem('customer_lastname', result[0]['customer_lastname']);
                        sessionStorage.setItem('customer_mobile', result[0]['customer_mobile']);
                        sessionStorage.setItem('customer_password', result[0]['customer_password']);
                        sessionStorage.setItem('customer_phone', result[0]['customer_phone']);
                        sessionStorage.setItem('customer_place', result[0]['customer_place']);
                        sessionStorage.setItem('customer_postcode', result[0]['customer_postcode']);
                        sessionStorage.setItem('customer_retailmultiplier', result[0]['customer_retailmultiplier']);
                        sessionStorage.setItem('customer_state', result[0]['customer_state']);
                        sessionStorage.setItem('customer_tradingname', result[0]['customer_tradingname']);
                        sessionStorage.setItem('customer_type', result[0]['customer_type']);
                        sessionStorage.setItem('customer_website', result[0]['customer_website']);                

                        dyo.engine.popup_login.dialog.close();

                        this.account.open();
                        dyo.design.getDesigns();

                    }

                });
            })
            .catch(error => { 
                dyo.engine.loader.hide("Engine:918");
                console.error('Error:', error) 
            });

        } else {

            if (!password.value) {
                password.focus();
                dyo.engine.popup_login.login_info.show();
                $('#dyo_login_info', "value", Translate(Lang.PLEASE_ENTER_PASSWORD));
            }

            if (!login.value) {
                login.focus();
                dyo.engine.popup_login.login_info.show();
                $('#dyo_login_info', "value", Translate(Lang.PLEASE_ENTER_LOGIN));
            }

            if (!this.validateEmail(login.value)) {
                login.focus();
                dyo.engine.popup_login.login_info.show();
                $('#dyo_login_info', "value", Translate(Lang.PLEASE_ENTER_EMAIL));
            }

        }

    }

    register() {

        let login = $("#dyo_register_login");
        let password = $("#dyo_register_password");
        let repeat_password = $("#dyo_register_repeat_password");
        $('#dyo_register_info').value = '';

        if (this.validateEmail(login.value) && password.value && repeat_password.value && password.value == repeat_password.value) {

            dyo.engine.loader.show("Engine:953");

            let data = new FormData();
            data.append('customer_email', login.value.toLowerCase());
            data.append('customer_password', password.value);
            data.append('agent', dyo.navigator);

            console.log(dyo.path.register);

            fetch(dyo.path.register, {
                method: 'POST',
                body: data
            })
            .then((response) => {
                response.text().then((data) => {

                    dyo.engine.loader.hide("Engine:968");
                    
                    console.log(data);

                    let result = JSON.parse(data);

                    if (result.length == 0 || result == 'failure') {

                        login.focus();
                        dyo.engine.popup_login.register_info.show();
                        $('#dyo_register_info', "value", Translate(Lang.THIS_EMAIL_IS_ALREADY_REGISTERED));

                    } else {

                        sessionStorage.setItem('customer_email', login.value);
                        sessionStorage.setItem('customer_password', result[0]['customer_password']);

                        dyo.engine.popup_login.dialog.close();
                        this.account.open();
                        dyo.design.getDesigns();

                    }

                });
            })
            .catch(error => { 
                dyo.engine.loader.hide("Engine:992");
                console.error('Error:', error) 
            });

        } else {

            if (!repeat_password.value) {
                repeat_password.focus();
                dyo.engine.popup_login.register_info.show();
                $('#dyo_register_info', "value", Translate(Lang.PLEASE_REPEAT_PASSWORD));
            }

            if (password.value != repeat_password.value) {
                repeat_password.focus();
                dyo.engine.popup_login.register_info.show();
                $('#dyo_register_info', "value", Translate(Lang.PASSWORD_AND_REPEAT_PASSWORD_DOES_NOT_MATCH));
            }

            if (!password.value) {
                password.focus();
                dyo.engine.popup_login.register_info.show();
                $('#dyo_register_info', "value", Translate(Lang.PLEASE_ENTER_PASSWORD));
            }

            if (!login.value) {
                login.focus();
                dyo.engine.popup_login.register_info.show();
                $('#dyo_register_info', "value", Translate(Lang.PLEASE_ENTER_LOGIN));
            }

            if (!this.validateEmail(login.value)) {
                login.focus();
                dyo.engine.popup_login.register_info.show();
                $('#dyo_register_info', "value", Translate(Lang.PLEASE_ENTER_EMAIL));
            }

        }

    }

    quickEnquiryAction() {
        dyo.design.action = "enquiry";
        dyo.design.CreateImage(dyo.engine.account.quickEnquiry)
    }

    navigate() {

        let href = window.location.href.split("#")[1];
        let href_parts;

        if (href) {

            if (href.length > 0) {
                href_parts = href.split("-");
            }
            
            if (href_parts[0] == "reset" && href_parts[1] == "password") {
                dyo.engine.resetPassword(href_parts[2]);
            } else {

                switch (href) {
                    case "save-design-link":
                        if (dyo.accountModule) {
                            dyo.engine.saveDesignLink();
                        }
                        break;
                    case "quick-enquiry":
                        if (dyo.accountModule) {
                            if (dyo.currentSection == "Crop") {

                                let dialog = dyo.engine.dialog;
                                dialog.title = Translate(Lang.ARE_YOUS_SURE_YOU_WANT_TO_QUICK_ENQUIRY);
                                dialog.body = Translate(Lang.CLICK_CANCEL_TO_FINISH_POSITIONING);
                                dialog.accept = Translate(Lang.CONTINUE);
                                dialog.decline = Translate(Lang.CANCEL);
                                dialog.action = dyo.engine.quickEnquiryAction;
                                dialog.render();
                                dialog.show();

                            } else {

                                dyo.engine.quickEnquiryAction();
                            }
                        }
                        break;
                    case "payment-cancel":
                        paymentCancel();
                        break;
                    case "payment-success":
                        paymentSuccess("stripe");
                        break;
                    case "home-page":
                        dyo.engine.homePage();
                        break;
                    case "settings":
                        dyo.engine.designMenu();
                        break;
                    case "perform-testing":
                        dyo.engine.performTesting();
                        break;
                    case "generate-design":
                        dyo.design.generateDesign();
                        break;
                    case "rec-video":
                        dyo.engine3d.setupVideo();
                        break;
                    case "stop-video":
                        dyo.engine3d.stopVideo();
                        break;
                    case "design-menu":
                        if (dyo.config._additions.Motifs.length > 1) {
                            dyo.engine.motifs.motif_typeId = 0;
                            dyo.engine.motifs.fullListVisible = true;
                        }
                        dyo.engine.designMenu();
                        break;
                    case "select-product":
                        dyo.engine.selectProducts();
                        break;  
                    case "select-shape":
                        dyo.engine.selectShape();
                        break;  
                    case "select-installations":
                        dyo.engine.selectInstallations();
                        break;  
                    case "select-fixing-system":
                        dyo.engine.selectFixingSystem();
                        break;  
                    case "select-corners":
                        dyo.engine.selectCorner();
                        break;  
                    case "select-holes":
                        dyo.engine.selectHole();
                        break;      
                    case "select-stand":
                        dyo.engine.selectStand();
                        break;          
                    case "select-border":
                        dyo.engine.selectBorder();
                        break;
                    case "select-size":
                        dyo.engine.selectSize();
                        break;
                    case "select-background":
                        dyo.engine.selectBackground();
                        break;    
                    case "select-material":
                        dyo.engine.selectMaterial();
                        break;
                    case "select-material-image":
                        dyo.engine.selectMaterialImage();
                        break;
                    case "add-your-inscription":            
                        dyo.engine.addYourInscription();
                        break;
                    case "add-your-photo":
                        dyo.engine.addYourPhoto();
                        break;
                    case "add-your-motif":
                        if (dyo.config._additions.Motifs.length > 1) {
                            dyo.engine.motifs.fullListVisible = true;
                        }
                        dyo.engine.addYourMotif();
                        break;
                    case "add-your-emblem":
                        dyo.engine.addYourEmblem();
                        break;
                   case "promo-code":
                        if (dyo.country == "au") {
                            dyo.engine.promoCode();
                        }
                        break;
                    case "check-price":
                        if (dyo.country == "au" && dyo.mode == "3d" && dyo.config._config.type == "full-monument") {
                            document.location.href = "#quick-enquiry";
                            dyo.design.action = "enquiry";
                            dyo.design.CreateImage(dyo.engine.account.quickEnquiry)
                        } else {
                            dyo.engine.checkPrice("Engine: 1252");
                        }
                        break;
                    case "my-account":
                        if (dyo.accountModule) {
                            if (dyo.mode == "3d") {
                                if (!dyo.accountMode) {
                                    //$("#openfl").style.visibility = "hidden";
                                    $("#openfl").style.opacity = 0.05;
                                }
                                setTimeout(function() {
                                    dyo.engine.myAccount();
                                }, 500);
                            } else {
                                console.log("@in")
                                dyo.engine.myAccount();
                            }
                        }
                        break;
                    case "my-account-login":
                        if (dyo.accountModule) {
                            if ($('#dyo_login_container')) {
                                $('#dyo_login_container').style.display = 'block';
                                $('#dyo_register_container').style.display = 'none';
                            }
                        }
                        break;
                    case "my-account-register":
                        if (dyo.accountModule) {
                            if ($('#dyo_login_container')) {
                                $('#dyo_login_container').style.display = 'none';
                                $('#dyo_register_container').style.display = 'block';
                            }
                        }
                        break;    
                    case "privacy-policy":
                        dyo.engine.privacyPolicy();
                        break;
                    case "contact-us":
                        dyo.engine.contactUs();
                        break;
                }

            }

        }
        
    }

    homePage() {
        if (window.self !== window.top) {
            window.parent.location.href = "/";
		} else {
            document.location.href = "/";
        }
    }

    designMenu(from) {

        if (from) {
            console.log(from);
        }

        dyo.currentSection = "Design Menu";
        dyo.selected = null;
        dyo.engine.popupActive = false;

        if (!dyo.accountMode) {
            if (dyo.mode == "2d") {
                if (!dyo.engine.canvas.isTickerOn()) {
                    dyo.engine.canvas.addTicker();
                }
            }
        }

        if (dyo.engine.deviceType == "mobile") {
            dyo.engine.canvas.hideContainer(dyo.engine.canvas.crop_container);
        }

        if (dyo.mode == "3d") {
            dyo.engine3d.inst3d = undefined;
            if (dyo.engine3d.currentModel) {
                $("#canvas").style.visibility = "hidden";
            }
		}
                
        dyo.engine.hide();
        dyo.engine.show();
        if (!dyo.accountMode) {
            dyo.engine.canvas.show();
            dyo.engine.canvas.hideButtons();        
            dyo.engine.inscriptions.reset();
            dyo.engine.inscriptions.hide();
            dyo.engine.motifs.hide();
            dyo.engine.emblems.hide();
        }

        dyo.monument.updateHeader();

        dyo.monument.deselectAll("engine:1338");

        if (dyo.engine.deviceType == "mobile") {
            if ($("#quick-enquiry")) {
                $("#quick-enquiry").style.visibility = "visible";
            }
        }

        if (!dyo.accountMode) {
            if (dyo.mode == "3d") {
                if (dyo.engine3d_ready) {
                    if (Engine3D.Controller) {
                        if (Engine3D.Controller.getCurrentProject()) {
                            if (dyo.engine3d_ready) {
                                if (Engine3D.Controller.getCurrentProject().getSelectedModel()) {
                                    //Engine3D.Controller.getCurrentProject().setSelectedModel(null);
                                }
                            }
                        }
                    }
                }
            }
        }

    }

    selectProducts() {
        dyo.engine.hide();
        dyo.engine.select_products.show();
        if (dyo.engine.deviceType == "mobile") {
            if (dyo.engine.drawer.drawer.open == false) {
                $("#button_dyo_menu").click();
            }
        }
    }

    selectShape() {
        dyo.engine.hide();
        dyo.engine.select_shapes.show();
    }

    selectInstallations() {
        dyo.engine.hide();
        dyo.engine.select_installations.show();
    }

    selectFixingSystem() {
        dyo.engine.hide();
        dyo.engine.select_fixing.show();
    }

    selectCorner() {
        dyo.engine.hide();
        dyo.engine.select_corner.show();
    }

    selectHole() {
        dyo.engine.hide();
        dyo.engine.select_hole.show();
    }

    selectStand() {
        dyo.engine.hide();
        dyo.engine.select_stand.show();
    }

    selectBorder() {
        dyo.engine.hide();
        dyo.engine.select_borders.show();
    }

    selectSize() {
        dyo.engine.hide();
        if (dyo.target) {
            dyo.target._select();
        }
        dyo.engine.sizes.show();
    }

    selectMaterial() {
        dyo.engine.hide();
        dyo.engine.materials.show();
    }

    selectMaterialImage() {
        dyo.engine.hide();
        dyo.engine.materials.showImage();
    }

    addYourInscription() {
        dyo.engine.hide();
        dyo.engine.inscriptions.show();
        dyo.engine.inscriptions.reset();
    }

    addYourPhoto() {
        switch (dyo.monument.getProductType()) {
            default:
                dyo.engine.hide();
                dyo.engine.photos.show();
                dyo.engine.photos.reset();
                break;
            case "images": case "urns": case "fullcolourplaque":
                let items = dyo.config._additions.Images;
                document.location.href = "#add-your-photo";
                dyo.engine.photos.reset();    
                dyo.engine.photos.uploadPhotoId = items[0].id;
                dyo.engine.photos.uploadPhotoName = items[0].name;
                dyo.engine.photos.useAsBackgroundImage = false;
                dyo.engine.tutorial.upload();
                break;
        }
    }

    addYourMotif() {
        dyo.engine.hide();
        dyo.engine.motifs.show();
        dyo.engine.motifs.reset();
    }

    addYourEmblem() {
        dyo.engine.hide();
        dyo.engine.emblems.show();
        dyo.engine.emblems.reset();
    }

    myAccount() {

        if (sessionStorage.getItem('customer_email') && sessionStorage.getItem('customer_password')) {
            this.account.open();
            dyo.design.getDesigns();
        } else {
            dyo.engine.popup_login.accept = "";
            if (!dyo.accountMode) {
                dyo.engine.popup_login.decline = Translate(Lang.CLOSE);
            } else  {
                dyo.engine.popup_login.decline = "";
            }
            dyo.engine.popup_login.render();

            if (dyo.accountMode) {
                $("#closeButton").style.display = "none";
                $("#my-account-login-footer").style.display = "none";
                $(".mdc-dialog__backdrop").style.pointerEvents = "none";
                document.body.style.backgroundColor = "#595959";
            }

            $("#welcome-to-design-your-own").style.display = "block";

            dyo.engine.popup_login.show();

            if (dyo.template == 2) {
                let c = 'skinAU_9899c2';
                $("#my-account-login-header").classList.add(c);
                $("#my-account-login-footer").classList.add(c);
            }

            if (dyo.engine.deviceType == "mobile" && window.matchMedia("(orientation: portrait)").matches) {
                if ($("#dyo_login_container")) {
                    $("#dyo_login_container").style.display = "none";
                }
            } else {
                if ($("#mobile_account_menu")) {
                    $("#mobile_account_menu").style.display = "none";
                }
            }

        }

        this.checkMobileMenu();
        
    }
    
    checkMobileMenu() {

        // Login view Mobile
        if (dyo.engine.deviceType == "mobile" && window.matchMedia("(orientation: portrait)").matches) {
			if ($('#dyo_mobile_menu_register')) {
				$('#dyo_mobile_menu_register').addEventListener('click', (e) => { 
					document.location.href = "#my-account-register";
				});
			}

			if ($('#dyo_mobile_menu_login')) {
				$('#dyo_mobile_menu_login').addEventListener('click', (e) => { 
					document.location.href = "#my-account-login";
					dyo.engine.login_view(0);
				});
			}
			if ($("#mobile_account_menu")) {
				$("#mobile_account_menu").style.display = "block";
			}
        } else {
            if (window.innerHeight == dyo.height) {
                if ($("#mobile_account_menu")) {
                    $("#mobile_account_menu").style.display = "none";
                    $("#dyo_login_container").style.display = "block";
                }
            }
        }

	}

    promoCode() {

        let promo = dyo.engine.promo_code;

        promo.title = "Please enter your Promo Code";
        promo.accept = "OK";
        promo.decline = Translate(Lang.CLOSE);
        promo.action = dyo.engine.applyPromoCode;
        promo.render();
        promo.show();

        if (dyo.template == 2) {
            let c = 'skinAU_e6daca';
            $("#promo-header").classList.add(c);
            $("#promo-footer").classList.add(c);
        }
        
    }

    applyPromoCode() {

        if ($("#input_promo-code").value.replace(/\s/g, '').length) {

            let dialogElement = $('#promo-code');
            let dialog = new mdc.dialog.MDCDialog(dialogElement);
            dialog.close();

            dyo.design.action = "promoCode";

            dyo.config.promo_codes.forEach(code => {
                if (code == $("#input_promo-code").value) {
                    dyo.engine.promoCodeValue = $("#input_promo-code").value;
                }
            })
            //dyo.design.CreateImage(dyo.design.SaveData);

            document.location.href = "#design-menu";

        } else {

            $("#input_promo-code").focus();

        }

    }

    privacyPolicy() {
        
        dyo.engine.popupActive = true;

        dyo.engine.dialog_resp.title = Translate(Lang.PRIVACY_POLICY);
        dyo.engine.dialog_resp.body = Translate(Lang.PRIVACY_POLICY_IFRAME);
        dyo.engine.dialog_resp.accept = "";
        dyo.engine.dialog_resp.decline = Translate(Lang.CLOSE);
        dyo.engine.dialog_resp.render();
        dyo.engine.dialog_resp.show();
        
        if (dyo.template == 2) {
            let c = 'skinAU_9899c2';
            $("#resp-header").classList.add(c);
            $("#resp-footer").classList.add(c);
        }

    }

    contactUs() {

        dyo.engine.popupActive = true;

        dyo.engine.dialog_resp.title = Translate(Lang.CONTACT_US);
        dyo.engine.dialog_resp.body = Translate(Lang.CONTACT_POPUP) + "<p style='margin-top:50px;color:#cccccc;font-style:italic;'>Build version: " + dyo.build_version + " (" + dyo.build_date + ")</p>";
        dyo.engine.dialog_resp.accept = Translate(Lang.CONTACT_FORM);
        dyo.engine.dialog_resp.decline = Translate(Lang.CLOSE);
        dyo.engine.dialog_resp.action = dyo.engine.contactForm;
        dyo.engine.dialog_resp.render();
        dyo.engine.dialog_resp.show();

        let c = 0;

        let id = setInterval(function() {
            $("#accept_button").blur();
            if (c > 9) {
                clearInterval(id);
            }
        }, 10);

        if (dyo.template == 2) {
            let c = 'skinAU_e6837c';
            $("#resp-header").classList.add(c);
            $("#resp-footer").classList.add(c);
        }

    }

    contactForm() {
        document.location.href = "#design-menu";
        window.open(Translate(Lang.CONTACT_PAGE));
    }

    resetPassword(email) {
        let data = new FormData();
        data.append('customer_email', email);

        fetch(dyo.path.reset_password_email, {
            method: 'POST',
            body: data
        })
        .then((response) => {
            response.text().then((data) => {
                dyo.engine.loader.hide("Engine:1236");

                let result = JSON.parse(data);

                let customerData = `
                <p>${result['customer_firstname']} ${result['customer_lastname']}<br/>
                ${result['customer_address']}<br/>
                ${result['customer_postcode']} ${result['customer_place']}<br/>
                ${result['customer_state']}<br/>
                ${result['customer_country']}</p>`

                sessionStorage.setItem('reset_password_email', result['customer_email']);
                sessionStorage.setItem('customer_data', customerData);

                dyo.engine.popup_reset_password.accept = "";
                dyo.engine.popup_reset_password.decline = Translate(Lang.CLOSE);
                dyo.engine.popup_reset_password.render();
                dyo.engine.popup_reset_password.show();

            });
        })
        .catch(error => { 
            dyo.engine.loader.hide("Engine:1257");
            console.error('Error:', error) 
        });

    }

    reset_password_set_new() {

        let password = $("#dyo_reset_password_password");
        let repeat_password = $("#dyo_reset_password_repeat_password");
        let reset_info = $('#dyo_reset_password_register_info');
        
        reset_info.value = '';

        if (password.value && repeat_password.value && password.value == repeat_password.value) {

            dyo.engine.loader.show("Engine:1271");

            let data = new FormData();
            data.append('customer_email', sessionStorage.getItem('reset_password_email'));
            data.append('customer_password', password.value);

            fetch(dyo.path.reset_password_email_set_new, {
                method: 'POST',
                body: data
            })
            .then((response) => {
                response.text().then((data) => {
                    dyo.engine.loader.hide("Engine:1285");
                    let result = JSON.parse(data);
                    if (result != 'failure') {

                        dyo.engine.popup_reset_password.hide();

                        let data = {
                            message: Translate(Lang.YOUR_PASSWORD_HAS_BEEN_CHANGED),
                            timeout: 5000
                        };
                        dyo.engine.snackbar.open(data);

                        setTimeout(() => {
                            window.onbeforeunload = null;
                            document.location.href = "#my-account";
                            document.location.reload();
                        }, 2000);
        
                    } else {

                        dyo.engine.popup_reset_password.reset_info.show();
                        reset_info.value = Translate(Lang.THERE_WAS_A_PROBLEM_CHANGING_YOUR_PASSWORD);

                    }

                });
            })
            .catch(error => { 
                dyo.engine.loader.hide("Engine:1315");
                console.error('Error:', error) 
            });

        } else {

            if (!password.value) {
                password.focus();
                dyo.engine.popup_reset_password.reset_info.show();
                reset_info.value = "Please enter password ..."
            }
    
            if (password.value && !repeat_password.value) {
                repeat_password.focus();
                dyo.engine.popup_reset_password.reset_info.show();
                reset_info.value = "Please repeat password ..."
            }
    
            if (password.value && repeat_password.value && password.value != repeat_password.value) {
                repeat_password.focus();
                dyo.engine.popup_reset_password.reset_info.show();
                reset_info.value = "Password and repeat password doesn't match ..."
            }

        }

    }

    checkPrice() {

        let price = dyo.monument.checkPrice(false);

        if (price) {

            dyo.engine.popupActive = true;

            let symbol = this.getCurrencySymbol(dyo.currency);
            let side = this.getCurrencySide(dyo.currency);
            let title = '';

            if (side == 0) {
                title = Translate(Lang.CHECK_PRICE_2) + " (" + symbol + price.price + ")";
            }

            if (side == 1) {
                title = Translate(Lang.CHECK_PRICE_2) + " (" + price.price + " " + symbol + ")";
            }

            dyo.engine.dialog_resp.title = title; 
            dyo.engine.dialog_resp.body = price.data;
            if (this.deviceOs == "ios") {
                dyo.engine.dialog_resp.accept = "";
            } else {
                if (dyo.accountModule) {
                    dyo.engine.dialog_resp.accept = Translate(Lang.DOWNLOAD) + " " + Translate(Lang.PDF);
                } else {
                    dyo.engine.dialog_resp.accept = "";
                }
            }

            dyo.engine.dialog_resp.decline = Translate(Lang.CLOSE);
            if (dyo.accountModule) {
                dyo.engine.dialog_resp.action = dyo.design.downloadPDF;
            }
            dyo.engine.dialog_resp.render();
            dyo.engine.dialog_resp.show();

            if (dyo.template == 2) {
                let c = 'skinAU_a8d0b5';
                $("#resp-header").classList.add(c);
                $("#resp-footer").classList.add(c);
            }

            let c = 0;

            let id = setInterval(function() {
                $("#accept_button").blur();
                if (c > 9) {
                    clearInterval(id);
                }
            }, 10);

        } else {
            document.location.href = "#design-menu";
        }

    }

    settingsShow() {

        dyo.engine.hide();
        dyo.engine.settings.show();

    }

    saveDesignLink() {
        if (document.getElementById('dialog')) {
            document.getElementById('dialog').classList.remove("mdc-dialog--open");
        }
        if (document.getElementById('dialog_resp')) {
            document.getElementById('dialog_resp').classList.remove("mdc-dialog--open");
        }
        $('#dyo_save_design').click();
    }

    events() {

        dyo.engine.navigate();

        window.addEventListener("hashchange", dyo.engine.navigate, false);
        
        let dialog = this.dialog;
        let popup_login = this.popup_login;
        
        if (!dyo.accountMode) {
                
            $('#dyo_home_page').addEventListener('click', (e) => { 
                if (dyo.engine.designSaved || !dyo.design_exists) {
                    window.onbeforeunload = null;
                    dyo.engine.homePage();
                } else {
                    if (dyo.design_exists && dyo.engine.designSaved != true) {
                        dialog.title = Translate(Lang.ARE_YOU_SURE_YOU_WANT_TO_GO_TO_HOME_PAGE);
                        dialog.body = Translate(Lang.YOUR_CURRENT_DESIGN_WILL_BE_LOST);
                        dialog.accept = Translate(Lang.YES);
                        dialog.decline = Translate(Lang.NO);
                        dialog.action = dyo.engine.homePage;
                        dialog.render();
                        dialog.show();
                    }
                }
            });            
            
            $('#dyo_new_design').addEventListener('click', (e) => { 

                if ((dyo.design_exists && dyo.engine.designSaved != true) || $("#dyo_new_design").style.display == "flex") {

                    dialog.title = Translate(Lang.ARE_YOU_SURE_YOU_WANT_TO_START_NEW_DESIGN);
                    dialog.body = Translate(Lang.YOUR_CURRENT_DESIGN_WILL_BE_LOST);
                    dialog.accept = Translate(Lang.YES);
                    dialog.decline = Translate(Lang.NO);
                    dialog.action = dyo.design.newDesign;
                    dialog.render();
                    dialog.show();

                    if (dyo.template == 2) {
                        let c = 'skinAU_a8d0b5';
                        $("#dialog-header").classList.add(c);
                        $("#dialog-footer").classList.add(c);
                    }

                }
            
            });

            //if (dyo.usa != true) {
                if ($('#dyo_switch_mode')) {
                    $('#dyo_switch_mode').addEventListener('click', (e) => { 
                        if (dyo.mode == "2d") {
                            dialog.title = Translate(Lang.YOU_ARE_ABOUT_TO_GO_TO_THE_3D);
                            dialog.body = Translate(Lang.PLEASE_NOTE_3D_MODE_STILL_IN_TESTING);
                            dialog.accept = Translate(Lang.CONFIRM);
                            dialog.decline = Translate(Lang.DECLINE);
                            dialog.action = dyo.design.switchMode;
                            dialog.render();
                            dialog.show();

                            if (dyo.template == 2) {
                                let c = 'skinAU_cca96c';
                                $("#dialog-header").classList.add(c);
                                $("#dialog-footer").classList.add(c);
                            }
                        } else {
                            dialog.title = Translate(Lang.ARE_YOU_SURE_YOU_WANT_TO_SWITCH_MODE);
                            dialog.body = Translate(Lang.YOUR_CURRENT_DESIGN_WILL_BE_LOST);
                            dialog.accept = Translate(Lang.YES);
                            dialog.decline = Translate(Lang.NO);
                            dialog.action = dyo.design.switchMode;
                            dialog.render();
                            dialog.show();

                            if (dyo.template == 2) {
                                let c = 'skinAU_cca96c';
                                $("#dialog-header").classList.add(c);
                                $("#dialog-footer").classList.add(c);
                            }
                        }
                    });
                }
            //}

            if (dyo.sub_mode != "traditional") {
                if ($('#dyo_select_product')) {
                    $('#dyo_select_product').addEventListener('click', (e) => { 
                        document.location.href = "#select-product";
                    });
                }
            }

            if ($('#quick-enquiry')) {
                $('#quick-enquiry').addEventListener('click', (e) => { 
                    document.location.href = "#quick-enquiry";
                    dyo.design.action = "enquiry";
                    dyo.design.CreateImage(dyo.engine.account.quickEnquiry)
                });
            }

            $('#dyo_select_shape').addEventListener('click', (e) => { 
                document.location.href = "#select-shape";
            });

            $('#dyo_select_installations').addEventListener('click', (e) => { 
                document.location.href = "#select-installations";
            });

            $('#dyo_select_fixing_system').addEventListener('click', (e) => { 
                document.location.href = "#select-fixing-system";
            });

            $('#dyo_select_corners').addEventListener('click', (e) => { 
                document.location.href = "#select-corners";
            });

            $('#dyo_select_holes').addEventListener('click', (e) => { 
                document.location.href = "#select-holes";
            });

            $('#dyo_select_stand').addEventListener('click', (e) => { 
                document.location.href = "#select-stand";
            });

            $('#dyo_select_border').addEventListener('click', (e) => { 
                document.location.href = "#select-border";
            });

            if (dyo.mode == "3d") {
                $('#dyo_full_monument').addEventListener('click', (e) => { 

                    if (dyo.monument.switch_full_monument) {
                        dyo.monument.switch_full_monument = false;
                        dyo.monument.switch_headstone = true;
                    } else {
                        dyo.monument.switch_full_monument = true;
                        dyo.monument.switch_headstone = false;
                    }
                    
                    dyo.monument.switchFullMonument();
                });
            }
            
            $('#dyo_add_headstone_base').addEventListener('click', (e) => { 

                if (dyo.monument.has_base) {
                    dyo.monument.has_base = false;
                    $('#dyo_add_headstone_base_flower_pot_holes').style.display = "none";

                    if (dyo.monument.getProductType() == "mini-headstones") {
                        $('#dyo_add_headstone_base').style.display = "none";
                        dyo.monument.installationMethod = 2;
                    }

                } else {
                    dyo.monument.has_base = true;
                    $('#dyo_add_headstone_base_flower_pot_holes').style.display = "flex";
                    if (dyo.monument.base) {
                        dyo.monument.base.update();
                    }
                }
                
                dyo.monument.showBase();
                dyo.monument.updateMonument("engine:1592");

            });

            $('#dyo_link_headstone_base').addEventListener('click', (e) => { 
                if (dyo.monument.has_linked_base) {
                    dyo.monument.has_linked_base = false;
                    $('#base-link-switch').checked = '';
                } else {
                    dyo.monument.has_linked_base = true;
                    $('#base-link-switch').checked = 'checked';
                }
            });

            $('#dyo_add_headstone_base_flower_pot_holes').addEventListener('click', (e) => { 

                if (dyo.monument.has_base_flower_pot_holes) {
                    dyo.monument.has_base_flower_pot_holes = false;
                } else {
                    dyo.monument.has_base_flower_pot_holes = true;
                }

                dyo.monument.showBaseFlowerPotHoles();

            });

            $('#dyo_add_headstone_base_flower_pots2').addEventListener('click', (e) => { 
                $('#radio-2').checked = 'checked';
                dyo.monument.has_base_flower_pots = 2;
                dyo.monument.updateHeader("Engine: 1726");
            });
            
            $('#dyo_add_headstone_base_flower_pots3').addEventListener('click', (e) => { 
                $('#radio-3').checked = 'checked';
                dyo.monument.has_base_flower_pots = 3;
                dyo.monument.updateHeader("Engine: 1732");
            });

            $('#dyo_add_headstone_base_flower_pots4').addEventListener('click', (e) => { 
                $('#radio-4').checked = 'checked';
                dyo.monument.has_base_flower_pots = 4;
                dyo.monument.updateHeader("Engine: 1738");
            });

            $('#dyo_select_material_image').addEventListener('click', (e) => { 
                document.location.href = "#select-material-image";
            });

            $('#dyo_select_material').addEventListener('click', (e) => { 
                document.location.href = "#select-material";
            });

            $('#dyo_select_size').addEventListener('click', (e) => { 
                document.location.href = "#select-size";
            });

            $('#dyo_inscriptions').addEventListener('click', (e) => {     
                document.location.href = "#add-your-inscription";
            });

            $('#dyo_photos').addEventListener('click', (e) => { 
                document.location.href = "#add-your-photo";
            });

            $('#dyo_motifs').addEventListener('click', (e) => { 
                document.location.href = "#add-your-motif";
            });

            $('#dyo_emblems').addEventListener('click', (e) => { 
                document.location.href = "#add-your-emblem";
            });

            if (dyo.accountModule) {
                if ($('#dyo_my_account')) {
                    $('#dyo_my_account').addEventListener('click', (e) => { 
                        document.location.href = "#my-account";
                        if (dyo.mode == "3d") {
                            //$("#openfl").style.visibility = "hidden";
                            $("#openfl").style.opacity = 0.05;
                        }
                        if (sessionStorage.getItem('customer_email') && sessionStorage.getItem('customer_password')) {
                            dyo.engine.popupActive = true;
                            if (dyo.mode == "3d") {
                                //$("#openfl").style.visibility = "hidden";
                                $("#openfl").style.opacity = 0.05;
                            } else {
                                this.account.open();
                            }
                        }
                    });
                }
            }

            if (dyo.sub_mode != "traditional") {
                $('#dyo_check_price').addEventListener('click', (e) => { 
                    document.location.href = "#check-price";
                });
            }

            if (dyo.accountModule) {
                if ($('#dyo_save_design')) {
                    $('#dyo_save_design').addEventListener('click', (e) => { 

                        if (sessionStorage.getItem('customer_email') && sessionStorage.getItem('customer_password')) {
                            dyo.design.saveDesign();
                        } else {
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

                        dyo.engine.checkMobileMenu();

                    });
                }
            }

            $('#dyo_contact_us').addEventListener('click', (e) => { 
                document.location.href = "#contact-us";
            });

        }

        if (window.self !== window.top) {
            //iframe
            if (!dyo.accountMode) {
                let canvas = $('.canvasParent');

                canvas.onwheel = function(event){
                    event.preventDefault();
                    dyo.engine.wheel(event);
                };
                
                canvas.onmousewheel = function(event){
                    event.preventDefault();
                    dyo.engine.wheel(event);
                };
            }

        } else {

            if (!dyo.accountMode) {
                if (dyo.mode == "2d") {
                    let canvas = $('.canvasParent');

                    if (this.deviceType == "desktop") {
                        canvas.addEventListener('mousewheel', (e) => {
                            dyo.engine.wheel(e);
                        }, false);
                        canvas.addEventListener('DOMMouseScroll', (e) => {
                            dyo.engine.wheel(e);
                        }, false);
                    }
                }

                document.addEventListener("keydown", function(event) {
                    if (event.key === "Delete") {
                        if (dyo.selected) {
                            if (!dyo.blockDelete) {
                                switch (dyo.selected.type) {
                                    case "Motif": case "Photo": case "Inscription": case "Emblem":
                                        dyo.selected.delete();
                                        dyo.engine.designMenu();
                                        break;
                                }
                            }
                        }
                    }
                });

                $("#dyo_textfield").addEventListener("keypress", (event) => {
                    if (event.keyCode == 13) {
                        event.preventDefault();
                        event.target.blur()

                        if (dyo.engine.deviceType == "mobile") {
                            if (dyo.engine.drawer.drawer.open == true) {
                                dyo.engine.drawer.drawer.open = false;
                            }
                        }

                    }
                });

                if (dyo.mode == "3d") {
                    window.onkeydown = function(evt) {
                        if (evt.keyCode == 119) {
                            //F8
                            if (dyo.engine3d.mediaRecorderRec == true) {
                                document.location.href = "#stop-video";
                            } else {
                                document.location.href = "#rec-video";
                            }
                        }
                    };
                }

            }
        }

        window.onhashchange = function() {
            let containers = ["container-products", "shapes-container", "installations-container", "fixing-container", "borders-container", "materials-container", "sizes-container", "photos-container", "container-motifs", "container-emblems", "tutorial-container"];
            containers.forEach(container => {
                let containerElement = document.querySelector(`.${container} .mdc-list`);
                if (containerElement) {
                    containerElement.scrollTop = 0;
                }
            })
        }

    }

    show() {
        this.container.style.display = "block";
        if (!dyo.accountMode) {
            dyo.monument.container.visible = true;
            let stage = dyo.engine.canvas.getStage();
            stage.visible = false;
        }
    }

    hide() {
        this.container.style.display = "none";
        
        if (!dyo.accountMode) {
            this.select_products.hide();
            this.select_shapes.hide();
            this.select_fixing.hide();
            this.select_corner.hide();
            this.select_hole.hide();
            this.select_stand.hide();
            this.select_installations.hide();
            this.select_borders.hide();
            this.materials.hide();
            this.materials.hide_image();
            this.sizes.hide();
            this.inscriptions.hide();
            this.photos.hide();
            this.photos.reset();
            this.motifs.hide();
            this.emblems.hide();
            this.account.hide();
            //this.settings.hide();
        } else {
            document.location.href = "#my-account";
        }

    }

    update() {

        if (!dyo.accountMode) {
            $(".quick-enquiry", Translate(Lang.QUICK_ENQUIRY));
            $(".back-to-design", Translate(Lang.BACK_TO_DESIGN_MENU));
            $("#selectProduct", Translate(Lang.SELECT_PRODUCT));
            //$("#switchMode", Translate(Lang.SWITCH_MODE));
            $("#dyo_home_page_text", Translate(Lang.HOME));
            $("#dyo_new_design_text", Translate(Lang.NEW_DESIGN));
            $("#dyo_select_shape_text", Translate(Lang.SELECT_SHAPE));
            $("#dyo_select_size_text", Translate(Lang.SIZES));
            $("#dyo_select_installations_text", Translate(Lang.SELECT_INSTALLATION));
            $("#dyo_add_headstone_base_text", Translate(Lang.HEADSTONE_BASE));
            $("#dyo_add_headstone_base_flower_pot_holes_text", Translate(Lang.FLOWER_POT_HOLES));
            //$("#dyo_add_headstone_base_flower_pots_text", Translate(Lang.FLOWER_INSERTS));
            $("#dyo_add_headstone_base_flower_pots2_text", Translate(Lang.BLACK_LID));
            $("#dyo_add_headstone_base_flower_pots3_text", Translate(Lang.SILVER_LID));
            $("#dyo_add_headstone_base_flower_pots4_text", Translate(Lang.GOLD_LID));
            $("#fixingType", Translate(Lang.FIXING_SYSTEM));
            $("#dyo_select_border_text", Translate(Lang.SELECT_BORDER));
            $("#dyo_select_material_text", Translate(Lang.SELECT) + " " + Translate(Lang.GRANITE));
            $("#dyo_inscriptions_text", Translate(Lang.INSCRIPTIONS));
            $("#dyo_emblems_text", Translate(Lang.EMBLEMS));
            $("#dyo_motifs_text", Translate(Lang.MOTIFS));
            $("#dyo_photos_text", Translate(Lang.PHOTO));
            $("#dyo_check_price_text", Translate(Lang.CHECK_PRICE));
            $("#dyo_my_account_text", Translate(Lang.MY_ACCOUNT));
            $("#dyo_save_design_text", Translate(Lang.SAVE_DESIGN));
            $("#dyo_settings_text", Translate(Lang.SETTINGS));
            $("#dyo_contact_us_text", Translate(Lang.CONTACT_US));
        
            this.select_products.update();
            this.select_shapes.update();
            this.select_fixing.update();
            this.select_installations.update();
            this.select_borders.update();
            this.materials.updateSettings();
            this.sizes.update();
            this.inscriptions.update();
            this.photos.update();
            this.motifs.update();
            this.account.update();
            //this.settings.update();
            this.photos.input.render();
        } else {
            this.account.update();
        }
        
    }

    showNewDesign() {
        if ($("#dyo_new_design")) {
            dyo.engine.designSaved = false;
            $("#dyo_new_design").style.display = "flex";
        }
    }

	wheel(e) {

		let delta;

		if (e.wheelDelta) {
            delta = Math.max(-10, Math.min(10, e.wheelDelta));
		}

		if (e.detail) {
            delta = Math.max(-10, Math.min(10, -e.detail));
		}

		if (dyo.selected && dyo.selected != "mask") {
            
            switch (dyo.currentSection) {

                default:

                    if (delta > 0) {
                        dyo.selected.increase(delta);
                    } else {
                        dyo.selected.decrease(-delta);
                    }    
                    break;

                case "Photos":

                    if (delta > 0) {
                        dyo.engine.photos.slider_size.increase();
                    } else {
                        dyo.engine.photos.slider_size.decrease();
                    }

                    break;
                    
                case "Emblems":
                
                    if (delta > 0) {
                        dyo.engine.emblems.slider_size.increase();
                    } else {
                        dyo.engine.emblems.slider_size.decrease();
                    }

                   break;

            }
			
		} else {

            switch (dyo.currentSection) {
                case "Crop":
                    
                    if (delta > 0) {
                        dyo.engine.photos.slider_size.increase();
                    } else {
                        dyo.engine.photos.slider_size.decrease();
                    }
                    
                    break;
                default:
                    let canvas = $('#canvas');
                
                    if (delta > 0) {
                        this.canvasScale += 0.1;
                    } else {
                        this.canvasScale -= 0.1;
                    }
                    
                    if (this.canvasScale > 1) {
                        this.canvasScale = 1;
                    }
                    
                    if (this.canvasScale < 0.5) {
                        this.canvasScale = 0.5;
                    }
                    
                    canvas.style.webkitTransform = 'scale(' + this.canvasScale + ',' + this.canvasScale + ')';

                    dyo.engine.canvas.updateView();
    
                    break;
            }
			
		}

    }

    resetInput(input) {
        let time = Math.random() * 50;
        $(input).value = "";
        setTimeout(() => {
            $(input).focus();
        }, time);
        setTimeout(() => {
            $(input).blur();
        }, time + 10);
    }
 
    md5(d) {
        let result = M(V(Y(X(d),8*d.length)));
        return result.toLowerCase();
        
        function M(d){for(var _,m="0123456789ABCDEF",f="",r=0;r<d.length;r++)_=d.charCodeAt(r),f+=m.charAt(_>>>4&15)+m.charAt(15&_);return f}function X(d){for(var _=Array(d.length>>2),m=0;m<_.length;m++)_[m]=0;for(m=0;m<8*d.length;m+=8)_[m>>5]|=(255&d.charCodeAt(m/8))<<m%32;return _}function V(d){for(var _="",m=0;m<32*d.length;m+=8)_+=String.fromCharCode(d[m>>5]>>>m%32&255);return _}function Y(d,_){d[_>>5]|=128<<_%32,d[14+(_+64>>>9<<4)]=_;for(var m=1732584193,f=-271733879,r=-1732584194,i=271733878,n=0;n<d.length;n+=16){var h=m,t=f,g=r,e=i;f=md5_ii(f=md5_ii(f=md5_ii(f=md5_ii(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_hh(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_gg(f=md5_ff(f=md5_ff(f=md5_ff(f=md5_ff(f,r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+0],7,-680876936),f,r,d[n+1],12,-389564586),m,f,d[n+2],17,606105819),i,m,d[n+3],22,-1044525330),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+4],7,-176418897),f,r,d[n+5],12,1200080426),m,f,d[n+6],17,-1473231341),i,m,d[n+7],22,-45705983),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+8],7,1770035416),f,r,d[n+9],12,-1958414417),m,f,d[n+10],17,-42063),i,m,d[n+11],22,-1990404162),r=md5_ff(r,i=md5_ff(i,m=md5_ff(m,f,r,i,d[n+12],7,1804603682),f,r,d[n+13],12,-40341101),m,f,d[n+14],17,-1502002290),i,m,d[n+15],22,1236535329),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+1],5,-165796510),f,r,d[n+6],9,-1069501632),m,f,d[n+11],14,643717713),i,m,d[n+0],20,-373897302),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+5],5,-701558691),f,r,d[n+10],9,38016083),m,f,d[n+15],14,-660478335),i,m,d[n+4],20,-405537848),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+9],5,568446438),f,r,d[n+14],9,-1019803690),m,f,d[n+3],14,-187363961),i,m,d[n+8],20,1163531501),r=md5_gg(r,i=md5_gg(i,m=md5_gg(m,f,r,i,d[n+13],5,-1444681467),f,r,d[n+2],9,-51403784),m,f,d[n+7],14,1735328473),i,m,d[n+12],20,-1926607734),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+5],4,-378558),f,r,d[n+8],11,-2022574463),m,f,d[n+11],16,1839030562),i,m,d[n+14],23,-35309556),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+1],4,-1530992060),f,r,d[n+4],11,1272893353),m,f,d[n+7],16,-155497632),i,m,d[n+10],23,-1094730640),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+13],4,681279174),f,r,d[n+0],11,-358537222),m,f,d[n+3],16,-722521979),i,m,d[n+6],23,76029189),r=md5_hh(r,i=md5_hh(i,m=md5_hh(m,f,r,i,d[n+9],4,-640364487),f,r,d[n+12],11,-421815835),m,f,d[n+15],16,530742520),i,m,d[n+2],23,-995338651),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+0],6,-198630844),f,r,d[n+7],10,1126891415),m,f,d[n+14],15,-1416354905),i,m,d[n+5],21,-57434055),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+12],6,1700485571),f,r,d[n+3],10,-1894986606),m,f,d[n+10],15,-1051523),i,m,d[n+1],21,-2054922799),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+8],6,1873313359),f,r,d[n+15],10,-30611744),m,f,d[n+6],15,-1560198380),i,m,d[n+13],21,1309151649),r=md5_ii(r,i=md5_ii(i,m=md5_ii(m,f,r,i,d[n+4],6,-145523070),f,r,d[n+11],10,-1120210379),m,f,d[n+2],15,718787259),i,m,d[n+9],21,-343485551),m=safe_add(m,h),f=safe_add(f,t),r=safe_add(r,g),i=safe_add(i,e)}return Array(m,f,r,i)}function md5_cmn(d,_,m,f,r,i){return safe_add(bit_rol(safe_add(safe_add(_,d),safe_add(f,i)),r),m)}function md5_ff(d,_,m,f,r,i,n){return md5_cmn(_&m|~_&f,d,_,r,i,n)}function md5_gg(d,_,m,f,r,i,n){return md5_cmn(_&f|m&~f,d,_,r,i,n)}function md5_hh(d,_,m,f,r,i,n){return md5_cmn(_^m^f,d,_,r,i,n)}function md5_ii(d,_,m,f,r,i,n){return md5_cmn(m^(_|~f),d,_,r,i,n)}function safe_add(d,_){var m=(65535&d)+(65535&_);return(d>>16)+(_>>16)+(m>>16)<<16|65535&m}function bit_rol(d,_){return d<<_|d>>>32-_}
    }

    getDate() {
        let now = new Date();
        let year = "" + now.getFullYear();
        let month = "" + (now.getMonth() + 1); if (month.length == 1) { month = "0" + month; }
        let day = "" + now.getDate(); if (day.length == 1) { day = "0" + day; }
        let hour = "" + now.getHours(); if (hour.length == 1) { hour = "0" + hour; }
        let minute = "" + now.getMinutes(); if (minute.length == 1) { minute = "0" + minute; }
        let second = "" + now.getSeconds(); if (second.length == 1) { second = "0" + second; }
        let out = "";

        out = year + "-" + month + "-" + day + " " + hour + ":" + minute + ":" + second;
        
        return out;
    }

    reportError(error) {

        let dat = new FormData();
        dat.append('error', error);

        fetch(dyo.path.js_error, {
            method: 'POST',
            data: dat
        })
        .then((response) => {
            response.text().then((data) => {
                //dyo.engine.loader.hide("Engine:832");
            });
        })
        .catch(error => { 
            //dyo.engine.loader.hide("Engine:837");
            console.error('Error:', error) 
        });

    }

    performTesting() {
    }

    getBrowserName() {

        let agent = window.navigator.userAgent.toLowerCase();
        let browser = '';

        if (agent.indexOf("edge") > -1) {
            browser = "MS Edge";
        } else if (agent.indexOf("edg/") > -1) {
            browser = "Edge (chromium based)";
        } else if (agent.indexOf("opr") > -1 && !!window.opr) {
            browser = "Opera";
        } else if (agent.indexOf("chrome") > -1 && !!window.chrome) {
            browser = "Chrome";
        } else if (agent.indexOf("trident") > -1) {
            browser = "MS IE";
        } else if (agent.indexOf("firefox") > -1) {
            browser = "Mozilla Firefox";
        } else if (agent.indexOf("safari") > -1) {
            browser = "Safari";
        } else {
            browser = "other";
        }

        return browser;

    }

    getInsDate() {
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
          ];

        const d = new Date();
        return String(d.getDate()).padStart(2, '0') + " " + monthNames[d.getMonth()] + " " + d.getFullYear();

    }

    // Function to extract shapes based on color
    extractShapesByColor(img, color) {

        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d', { willReadFrequently: true });

        
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0, img.width, img.height);

        var imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        var pixels = imageData.data;
        var extractedCanvas = document.createElement('canvas');
        extractedCanvas.width = canvas.width;
        extractedCanvas.height = canvas.height;
        var extractedCtx = extractedCanvas.getContext('2d', { willReadFrequently: true });

        for (var i = 0; i < pixels.length; i += 4) {
            var r = pixels[i];
            var g = pixels[i + 1];
            var b = pixels[i + 2];
            var a = pixels[i + 3];

            // Check if the pixel matches the specified color
            if (r === color[0] && g === color[1] && b === color[2] && a === color[3]) {

                // Set the pixel in the extracted canvas to the same color
                extractedCtx.fillStyle = 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
                extractedCtx.fillRect((i / 4) % canvas.width, Math.floor((i / 4) / canvas.width), 1, 1);
            }
        }
        return extractedCanvas;
    }

    isJSON(text) {
        if (typeof text !== "string") {
            return false;
        }
        try {
            JSON.parse(text);
            return true;
        } catch (error) {
            return false;
        }
    }
     

}