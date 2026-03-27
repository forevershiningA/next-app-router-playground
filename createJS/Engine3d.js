import {$, Lang, Translate, File} from './Const.js';
import { Data } from './dyo/Data.js';

export class Engine3d extends Data {

	constructor(data = {}) {
        super();

        dyo.engine3d = this;
        this.currentModelTextureURL = "data/jpg/granites/forever2/l/18.jpg";     
        
        this._baseModel = null;
        this._kerbModel = null;
        this._lidModel = null;
        this._standModel = null;
        this._tableModel = null;
        
        this._models = [];
        this._models_data = [];
    }

    BuildEngine() {

        let self = this;

        $("#openfl").style.visibility = "hidden";
        $("#openfl").style.position = "absolute";
        $("#openfl").style.top = "2000px";

        lime.embed("Engine3D", "openfl", dyo.w, dyo.h, { parameters: {} });
        
        $("#canvas").style.display = "block";
        $("#canvas").style.visibility = "hidden";

        //dyo.engine3d.engine.changeProperty("color", 0xffffff);

        this.engine = Engine3D.Controller.getCurrentProject().loadRootModel("models/scenery-solid-color.m3d");

        //console.log(Engine3D);

        this.engine.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {

            Engine3D.Globals.set(Globals.VIEW_DEFAULT_SHOW_REFLECTIONS, true);
            dyo.engine3d.engine.changeProperty("showFloorReflection", true);

            let headstoneShape = File('table').url_3d;

            if (dyo.edit == false) {

                if (dyo.shape_id) {
                    let shape = "headstone-1";
                    headstoneShape = "models/forevershining/headstones/" + shape + ".m3d";
                }
                
                let nr = 0;

                let Headstone = dyo.monument.getPartByType('Headstone');

                self.shapes.forEach(shape => {
                    if (shape.m3d) {
                        if (shape.class == "headstones") {
                            if (dyo.shape_id == nr) {
                                Headstone.setFixed(shape.fixed);
                                headstoneShape = "models/forevershining/headstones/" + shape.drawing.toLowerCase().replace(" ", "-") + ".m3d";
                            }
                            nr ++;
                        }
                    }
                });                
            }

            dyo.engine3d.loadModel(headstoneShape);

            //console.log(Engine3D.View.get_camera());

            Engine3D.Controller.addEventListener(Engine3D.Engine3DModelEvent.MODEL_SELECT, function(e) {

                let model = e.getModel();

                if (model) {
                    dyo.monument.updateHeader();
                }

            });

            dyo.engine.canvas.inited = false;
            dyo.engine.canvas.setDrawer();
        });

    }

    setupVideo() {

        dyo.engine.rotateH = 0;

        var c = document.querySelector("#openfl canvas");
        
        var videoStream = c.captureStream(60);
        dyo.engine3d.mediaRecorder = new MediaRecorder(videoStream);
        
        var chunks = [];
        dyo.engine3d.mediaRecorder.ondataavailable = function(e) {
          chunks.push(e.data);
        };
        
        dyo.engine3d.mediaRecorder.onstop = function(e) {
          var blob = new Blob(chunks, { 'type' : 'video/mp4' });
          chunks = [];
          var videoURL = URL.createObjectURL(blob);
          
          const newWindow = window.open()
            newWindow.document.title = 'Video'
            newWindow.document.write(`<iframe src="${URL.createObjectURL(blob)}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`)

        };
        dyo.engine3d.mediaRecorder.ondataavailable = function(e) {
          chunks.push(e.data);
        };

        dyo.engine3d.mediaRecorder.start();

        dyo.engine.animId = setInterval(dyo.engine3d.an, 1);

        dyo.engine3d.alfa = 0;
        dyo.engine3d.beta = 0;
        dyo.engine3d.alfaCount = 0;

        dyo.engine3d.camInterface = Engine3D.View.get_camera();
        dyo.engine3d.mediaRecorderRec = true;

    }
    
    stopVideo() {
        dyo.engine3d.mediaRecorder.stop();
        dyo.engine3d.mediaRecorderRec = false;
        dyo.engine3d.alfa = 0;
        dyo.engine3d.beta = 0;
        dyo.engine3d.alfaCount = 0;
        clearInterval(dyo.engine.animId);
        document.location.href = "#design-menu";
    }

    an() {
        dyo.engine3d.alfa += 0.25;
        dyo.engine3d.beta += 1;
        if (dyo.engine3d.beta > 359) {
            dyo.engine3d.beta = 0;
        }
        if (dyo.engine3d.alfa > 359) {
            dyo.engine3d.alfa = 0;
            dyo.engine3d.alfaCount ++;
            if (dyo.engine3d.alfaCount == 4) {
                document.location.href = "#stop-video";
            }
        }

        let h = 45 * Math.sin(dyo.engine3d.alfa * Math.PI/180);
        let v = 15 + 15 * Math.cos(dyo.engine3d.alfa * Math.PI/180);
        let z = 1.5 + 0.2 * Math.cos(dyo.engine3d.beta * Math.PI/180);

        dyo.engine3d.camInterface.set_angleH(h);
        dyo.engine3d.camInterface.set_angleV(v);
        //dyo.engine3d.camInterface.set_distance(z);
    }

    addListeners(part) {

        let self = this;

        switch (part) {
            default:
                self.addListenerBase();
                self.addListenerKerb();
                self.addListenerLedger();
                self.addListenerStand();
                self.addListenerHeadstone();        
                break;
            case "headstone":
                self.addListenerHeadstone();
                break;
            case "stand":
                self.addListenerStand();
                break;
            case "ledger":
                self.addListenerLedger();
                break;
            case "kerb":
                self.addListenerKerb();
                break;
            case "base":
                self.addListenerBase();
                break;
        }

    }

    addListenerBase() {

        let self = this;

        self.base3d.addEventListener(Engine3D.Model3D.EVENT_INTERNAL_MODEL_UNSELECTED, function(e) {
            setTimeout(()=> {
                if (Engine3D.Controller) {
                    if (Engine3D.Controller.getCurrentProject()) {
                        let selectedModel = Engine3D.Controller.getCurrentProject().getSelectedModel();

                        if (!selectedModel) {
                            document.location.href = "#design-menu";
                        }
                    }
                }
            }, 100);
        });

        self.base3d.addEventListener(Engine3D.Model3D.EVENT_INTERNAL_MODEL_SELECTED, function(e) {

            self.currentModel = self.base3d;
            self.currentModel.generalType = "base";

            let o = self.base3d;
            dyo.engine3d.selectedModel = o;

            let Width = o.getProperty("width");
            let Height = o.getProperty("height");
            let Length = o.getProperty("depth");

            if (dyo.metric == "inches") {
                Width = dyo.engine.metrics.convertToInches(Width);
                Height = dyo.engine.metrics.convertToInches(Height);
                Length = dyo.engine.metrics.convertToInches(Length);
            }

            dyo.controller_Width.setValue(Width);
            dyo.controller_Height.setValue(Height);
            dyo.controller_Length.setValue(Length);    

            let v_min = dyo.engine.sizes.slider_length.slider.min;
            let v_max = dyo.engine.sizes.slider_length.slider.max;

            if (dyo.metric == "inches") {

                v_min = dyo.engine.metrics.toInchPlain(v_min);
                v_max = dyo.engine.metrics.toInchPlain(v_max);

                $("#dyo_length_textfield").min = v_min;
                $("#dyo_length_textfield").max = v_max;

                $("#dyo_width_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("width"));
                $("#dyo_height_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("height"));
                $("#dyo_length_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("depth"));

            } else {

                $("#dyo_length_textfield").min = v_min;
                $("#dyo_length_textfield").max = v_max;

                $("#dyo_width_textfield").value = o.getProperty("width");
                $("#dyo_height_textfield").value = o.getProperty("height");
                $("#dyo_length_textfield").value = o.getProperty("depth");
                
            }

            if (document.location.href.indexOf("#select-size") == -1 && 
                document.location.href.indexOf("#select-shape") == -1 && 
                document.location.href.indexOf("#select-material") == -1) {
                    document.location.href = "#design-menu";
                    dyo.monument.updateHeader("Engine 3D: 138");
            }

            if (dyo.currentSection == "Sizes") {
                dyo.engine.sizes.show();
            }

        });

    }

    addListenerKerb() {

        let self = this;

        self.kerb3d.addEventListener(Engine3D.Model3D.EVENT_INTERNAL_MODEL_UNSELECTED, function(e) {
            setTimeout(()=> {
                if (Engine3D.Controller) {
                    if (Engine3D.Controller.getCurrentProject()) {
                        let selectedModel = Engine3D.Controller.getCurrentProject().getSelectedModel();

                        if (!selectedModel) {
                            document.location.href = "#design-menu";
                        }
                    }
                }
            }, 100);
        });

        self.kerb3d.addEventListener(Engine3D.Model3D.EVENT_INTERNAL_MODEL_SELECTED, function(e) {

            self.currentModel = self.kerb3d;
            self.currentModel.generalType = "kerbset";

            let o = self.kerb3d;
            dyo.engine3d.selectedModel = o;

            let Width = o.getProperty("width");
            let Height = o.getProperty("height");
            let Length = o.getProperty("depth");

            if (dyo.metric == "inches") {
                Width = dyo.engine.metrics.convertToInches(Width);
                Height = dyo.engine.metrics.convertToInches(Height);
                Length = dyo.engine.metrics.convertToInches(Length);
            }

            dyo.controller_Width.setValue(Width);
            dyo.controller_Height.setValue(Height);
            dyo.controller_Length.setValue(Length);    

            let v_min = dyo.engine.sizes.slider_length.slider.min;
            let v_max = dyo.engine.sizes.slider_length.slider.max;

            if (dyo.metric == "inches") {

                v_min = dyo.engine.metrics.toInchPlain(v_min);
                v_max = dyo.engine.metrics.toInchPlain(v_max);

                $("#dyo_length_textfield").min = v_min;
                $("#dyo_length_textfield").max = v_max;

                $("#dyo_width_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("width"));
                $("#dyo_height_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("height"));
                $("#dyo_length_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("depth"));

            } else {

                $("#dyo_length_textfield").min = v_min;
                $("#dyo_length_textfield").max = v_max;

                $("#dyo_width_textfield").value = o.getProperty("width");
                $("#dyo_height_textfield").value = o.getProperty("height");
                $("#dyo_length_textfield").value = o.getProperty("depth");
                
            }

            if (document.location.href.indexOf("#select-size") == -1 && 
                document.location.href.indexOf("#select-shape") == -1 && 
                document.location.href.indexOf("#select-material") == -1) {
                    document.location.href = "#design-menu";
                    dyo.monument.updateHeader("Engine 3D: 138");
            }

            if (dyo.currentSection == "Sizes") {
                dyo.engine.sizes.show();
            }

            if ($("#dyo_select_shape").style.display != "none") {
                $("#dyo_select_shape").style.display = "none";
            }

        });

    }

    addListenerLedger() {

        let self = this;

        self.ledger3d.addEventListener(Engine3D.Model3D.EVENT_INTERNAL_MODEL_UNSELECTED, function(e) {
            setTimeout(()=> {
                if (Engine3D.Controller) {
                    if (Engine3D.Controller.getCurrentProject()) {
                        let selectedModel = Engine3D.Controller.getCurrentProject().getSelectedModel();

                        if (!selectedModel) {
                            document.location.href = "#design-menu";
                        }
                    }
                }
            }, 100);
        });

        self.ledger3d.addEventListener(Engine3D.Model3D.EVENT_INTERNAL_MODEL_SELECTED, function(e) {

            self.currentModel = self.ledger3d;
            self.currentModel.generalType = "ledger";

            let o = self.ledger3d;

            dyo.engine3d.selectedModel = o;

            let Width = o.getProperty("width");
            let Height = o.getProperty("height");
            let Length = o.getProperty("depth");

            if (dyo.metric == "inches") {
                Width = dyo.engine.metrics.convertToInches(Width);
                Height = dyo.engine.metrics.convertToInches(Height);
                Length = dyo.engine.metrics.convertToInches(Length);
            }

            dyo.controller_Width.setValue(Width);
            dyo.controller_Height.setValue(Height);
            dyo.controller_Length.setValue(Length);    

            let v_min = dyo.engine.sizes.slider_length.slider.min;
            let v_max = dyo.engine.sizes.slider_length.slider.max;

            if (dyo.metric == "inches") {

                v_min = dyo.engine.metrics.toInchPlain(v_min);
                v_max = dyo.engine.metrics.toInchPlain(v_max);

                $("#dyo_length_textfield").min = v_min;
                $("#dyo_length_textfield").max = v_max;

                $("#dyo_width_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("width"));
                $("#dyo_height_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("height"));
                $("#dyo_length_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("depth"));

            } else {

                $("#dyo_length_textfield").min = v_min;
                $("#dyo_length_textfield").max = v_max;

                $("#dyo_width_textfield").value = o.getProperty("width");
                $("#dyo_height_textfield").value = o.getProperty("height");
                $("#dyo_length_textfield").value = o.getProperty("depth");

            }

            if (document.location.href.indexOf("#select-size") == -1 && 
                document.location.href.indexOf("#select-shape") == -1 && 
                document.location.href.indexOf("#select-material") == -1) {
                    document.location.href = "#design-menu";
                    dyo.monument.updateHeader("Engine 3D: 138");
            }

            if (dyo.currentSection == "Sizes") {
                dyo.engine.sizes.show();
            }

            if ($("#dyo_select_shape").style.display != "none") {
                $("#dyo_select_shape").style.display = "none";
            }

        });

    }

    addListenerStand() {

        let self = this;

        self.stand3d.addEventListener(Engine3D.Model3D.EVENT_INTERNAL_MODEL_UNSELECTED, function(e) {
            setTimeout(()=> {
                if (Engine3D.Controller) {
                    if (Engine3D.Controller.getCurrentProject()) {
                        let selectedModel = Engine3D.Controller.getCurrentProject().getSelectedModel();

                        if (!selectedModel) {
                            document.location.href = "#design-menu";
                        }
                    }
                }
            }, 100);
        });

        self.stand3d.addEventListener(Engine3D.Model3D.EVENT_INTERNAL_MODEL_SELECTED, function(e) {

            if (dyo.monument.id == 8) {
                if (dyo.monument.installationMethod == 3){
                    if (dyo.engine3d_ready) {
                        Engine3D.Controller.getCurrentProject().setSelectedModel(dyo.engine3d.base3d);
                        return;
                    }
                }
            }

            let o = self.stand3d;

            dyo.engine3d.selectedModel = o;

            self.currentModel = self.stand3d;
            self.currentModel.generalType = "stand";

            let Width = o.getProperty("width");
            let Height = o.getProperty("height");
            let Length = o.getProperty("depth");

            if (dyo.metric == "inches") {
                Width = dyo.engine.metrics.convertToInches(Width);
                Height = dyo.engine.metrics.convertToInches(Height);
                Length = dyo.engine.metrics.convertToInches(Length);
            }

            dyo.controller_Width.setValue(Width);
            dyo.controller_Height.setValue(Height);
            dyo.controller_Length.setValue(Length);    

            if (dyo.metric == "inches") {
                $("#dyo_width_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("width"));
                $("#dyo_height_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("height"));
                $("#dyo_length_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("depth"));
            } else {
                $("#dyo_width_textfield").value = o.getProperty("width");
                $("#dyo_height_textfield").value = o.getProperty("height");
                $("#dyo_length_textfield").value = o.getProperty("depth");
            }

            if (document.location.href.indexOf("#select-size") == -1 && 
                document.location.href.indexOf("#select-shape") == -1 && 
                document.location.href.indexOf("#select-material") == -1) {
                    document.location.href = "#design-menu";
                    dyo.monument.updateHeader("Engine 3D: 138");
            }

            if (dyo.currentSection == "Sizes") {
                dyo.engine.sizes.show();
            }

            if ($("#dyo_select_shape").style.display != "none") {
                $("#dyo_select_shape").style.display = "none";
            }

        });

    }

    addListenerHeadstone() {

        let self = this;

        self.headstone3d.addEventListener(Engine3D.Model3D.EVENT_INTERNAL_MODEL_UNSELECTED, function(e) {
            setTimeout(()=> {
                if (Engine3D.Controller) {
                    if (Engine3D.Controller.getCurrentProject()) {
                        let selectedModel = Engine3D.Controller.getCurrentProject().getSelectedModel();
                        if (selectedModel == null) {
                            document.location.href = "#design-menu";
                        } else {
                        }
                    }
                }
            }, 10);
        });

        self.headstone3d.addEventListener(Engine3D.Model3D.EVENT_INTERNAL_MODEL_SELECTED, function(e) {

            let o = self.headstone3d;
            dyo.engine3d.selectedModel = o;

            self.currentModel = self.headstone3d;
            self.currentModel.generalType = "headstone";

            let Width = o.getProperty("width");
            let Height = o.getProperty("height");
            let Length = o.getProperty("depth");

            if (dyo.metric == "inches") {
                Width = dyo.engine.metrics.convertToInches(Width);
                Height = dyo.engine.metrics.convertToInches(Height);
                Length = dyo.engine.metrics.convertToInches(Length);
            }

            dyo.controller_Width.setValue(Width);
            dyo.controller_Height.setValue(Height);
            dyo.controller_Length.setValue(Length);

            let v_min = dyo.engine.sizes.slider_length.slider.min;
            let v_max = dyo.engine.sizes.slider_length.slider.max;

            if (dyo.metric == "inches") {

                v_min = dyo.engine.metrics.toInchPlain(v_min);
                v_max = dyo.engine.metrics.toInchPlain(v_max);

                $("#dyo_length_textfield").min = v_min;
                $("#dyo_length_textfield").max = v_max;

                $("#dyo_width_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("width"));
                $("#dyo_height_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("height"));
                $("#dyo_length_textfield").value = dyo.engine.metrics.toInchPlain(o.getProperty("depth"));

            } else {

                $("#dyo_length_textfield").min = v_min;
                $("#dyo_length_textfield").max = v_max;

                $("#dyo_width_textfield").value = o.getProperty("width");
                $("#dyo_height_textfield").value = o.getProperty("height");
                $("#dyo_length_textfield").value = o.getProperty("depth");
                
            }
            
            if (document.location.href.indexOf("#select-size") == -1 && 
                document.location.href.indexOf("#select-shape") == -1 && 
                document.location.href.indexOf("#select-material") == -1) {
                    document.location.href = "#design-menu";
                    dyo.monument.updateHeader("Engine 3D: 138");
            }

            if (dyo.currentSection == "Sizes") {
                dyo.engine.sizes.show();
            }

            if ($("#dyo_select_shape").style.display != "flex") {
                $("#dyo_select_shape").style.display = "flex";
            }

        });

    }

    updateEngine(from) {

        if (dyo.engine.shapeName3D) {
            dyo.engine3d.replaceModel(dyo.engine.shapeName3D);
        } else {
            dyo.engine3d.replaceModel(File('table').url_3d);    
        }

        this.defaultSize();

        if (dyo.monument.id == 5) {
            setTimeout(function() {
                dyo.engine.addBorder();
            }, 500);
        } 

    }

    defaultSize() {

        let self = this;

        if (self.base3d) {
            self.base3d.changeProperty("width", 0.1);
            self.base3d.changeProperty("height", 0.1);
            self.base3d.changeProperty("depth", 0.1);
        }

        if (self.kerb3d) {
            self.kerb3d.changeProperty("width", 0.1);
            self.kerb3d.changeProperty("height", 0.1);
            self.kerb3d.changeProperty("depth", 0.1);
        }

        if (self.ledger3d) {
            self.ledger3d.changeProperty("width", 0.1);
            self.ledger3d.changeProperty("height", 0.1);
            self.ledger3d.changeProperty("depth", 0.1);
        }

        if (self.stand3d) {
            self.stand3d.changeProperty("width", 0.1);
            self.stand3d.changeProperty("height", 0.1);
            self.stand3d.changeProperty("depth", 0.1);
        }

        if (dyo.config._config.type == "full-monument" || dyo.monument.switch_full_monument) {

            if (self.base3d) {
                self.base3d.changeProperty("width", Number(File('base').init_width));
                self.base3d.changeProperty("height", Number(File('base').init_height));
                self.base3d.changeProperty("depth", Number(File('base').init_depth));
            }

            if (self.kerb3d) {
                self.kerb3d.changeProperty("width", Number(File('kerb').init_width));
                self.kerb3d.changeProperty("height", Number(File('kerb').init_height));
                self.kerb3d.changeProperty("depth", Number(File('kerb').init_depth));
            }

            if (self.ledger3d) {
                self.ledger3d.changeProperty("width", Number(File('lid').init_width));
                self.ledger3d.changeProperty("height", Number(File('lid').init_height));
                self.ledger3d.changeProperty("depth", Number(File('lid').init_depth));    
            }

            if (self.stand3d) {
                self.stand3d.changeProperty("width", Number(File('stand').init_width));
                self.stand3d.changeProperty("height", Number(File('stand').init_height));
                self.stand3d.changeProperty("depth", Number(File('stand').init_depth));
            }

        }

        if (dyo.engine.shapeName3D == undefined) {
            if (self.headstone3d) {
                self.headstone3d.changeProperty("width", Number(File('table').init_width));
                self.headstone3d.changeProperty("height", Number(File('table').init_height));
                if (dyo.usa) {
                    self.headstone3d.changeProperty("depth", Number(File('table').init_depth) * 2);
                } else {
                    self.headstone3d.changeProperty("depth", Number(File('table').init_depth));
                }
                
            }
        }

        if (dyo.config._config.type == "full-monument" || dyo.monument.switch_full_monument) {

            let diff = 200;
            
            let object = {};
            object.width = Number(self.kerb3d.getProperty("width"));
            object.height = Number(self.kerb3d.getProperty("height"));
            object.length = Number(self.kerb3d.getProperty("depth"));

            if (self.ledger3d) {
                dyo.engine3d.ledger3d.changeProperty("width", Number(object.width - diff));
            }
            if (self.stand3d) {
                dyo.engine3d.stand3d.changeProperty("width", Number(object.width));
            }

            if (self.stand3d) {
                dyo.engine3d.stand3d.changeProperty("height", Number(object.height + diff / 2));
            }

            if (self.ledger3d) {
                dyo.engine3d.ledger3d.changeProperty("depth", Number(object.length - diff / 2));
            }
        }

        dyo.engine.loader.force = false;
        dyo.engine.loader.hide("Engine:643");

        dyo.engine.sizes.setup();

        if (self.init != false) {
            self.init = false
        }

        if ($("#openfl").style.visibility == "hidden") {
            if (dyo.currentSection != "Account") {
                setTimeout(() => {
                    $("#openfl").style.visibility = "visible";
                }, 200);
            }
        }

        $("#openfl").style.top = "64px";
        dyo.monument.updateHeader("Engine 3D: 501");

    }

    replaceModel(url) {

        dyo.engine.shapeName3D = url;

        let self = this;
        dyo.engine.loader.show("Engine:684");

        var old_size = {};
        old_size.width = self.headstone3d.getProperty("width");
        old_size.height = self.headstone3d.getProperty("height");
        old_size.length = self.headstone3d.getProperty("depth");

        var color = self.headstone3d.extra.color;

        if (dyo.monument.headstone.ratio > 0) {
            let _newMinValue = (dyo.monument.headstone.getMaxHeight() * dyo.monument.headstone.ratio);

            if (old_size.height < _newMinValue) {
                old_size.height = _newMinValue;
            }    
        }

        try {
            var headstone3d = new Engine3D.Model3D(url);

            headstone3d.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {
                new Engine3D.Model3DEditUtility.replace(self.headstone3d, headstone3d);
                self.headstone3d = headstone3d;

                self.headstone3d.changeProperty("width", Number(old_size.width));
                self.headstone3d.changeProperty("height", Number(old_size.height));
                self.headstone3d.changeProperty("depth", Number(old_size.length));
                
                self.addListeners("headstone");

                if (dyo.monument.switch_full_monument) {
                    //if (!dyo.monument.has_base) {
                        dyo.engine3d.loadTexture(self.stand3d, self.currentModelTextureURL);
                    //}
                    dyo.engine3d.loadTexture(self.ledger3d, self.currentModelTextureURL);
                    dyo.engine3d.loadTexture(self.kerb3d, self.currentModelTextureURL);
                }

                if (dyo.edit == false) {
                    Engine3D.Controller.getCurrentProject().setSelectedModel(dyo.engine3d.headstone3d);
                }

                if (!dyo.edit) {
                    dyo.engine3d.loadTexture(self.headstone3d, self.currentModelTextureURL);
                } else {
                    //console.log(color);
                    dyo.engine3d.loadTexture(self.headstone3d, color);
                }

                dyo.engine.loader.hide("Engine:716");

                if (dyo.currentSection != "Account") {
                    setTimeout(() => {
                        $("#openfl").style.visibility = "visible";
                    }, 200);
                }

            });
        }
        catch(e) {
            console.log("3D Error: " + e);
        }

    }


    replaceModelType(type, url) {

        let self = this;
        dyo.engine.loader.show("Engine:684");

        let model;

        switch (type) {
            case "stand":
                model = self.stand3d;
                break;
            case "kerb":
                model = self.kerb3d;
                break;
            case "ledger":
                model = self.ledger3d;
                break;
        }

        let old_size = {};
        old_size.width = model.getProperty("width");
        old_size.height = model.getProperty("height");
        old_size.length = model.getProperty("depth");

        let color;
        if (model) {
            if (model.extra) {
                color = model.extra.color;
            }
        }

        var model3d = new Engine3D.Model3D(url);

        model3d.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {

            new Engine3D.Model3DEditUtility.replace(model, model3d);
            model = model3d;

            switch (type) {
                case "stand":
                    self.stand3d = model3d;
                    break;
                case "kerb":
                    self.kerb3d = model3d;
                    break;
                case "ledger":
                    self.ledger3d = model3d;
                    break;
            }

            model.changeProperty("width", Number(old_size.width));
            model.changeProperty("height", Number(old_size.height));
            model.changeProperty("depth", Number(old_size.length));

            self.addListeners(type);

            if (color) {
                dyo.engine3d.loadTexture(model, color);
            }

            //Engine3D.Controller.getCurrentProject().setSelectedModel(null);

        });

    }

    loadModel(url) {

        let self = this;

        dyo.engine.loader.show("Engine:684");

        if (this.kerb3d == undefined) {
            this.base3d = new Engine3D.Model3D(File('base').url_3d);

            this.base3d.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {

                self.currentModel = self.base3d;
                self.currentModel.generalType = "base";
                self.base3d.generalType = "base";
                
                if (!dyo.edit) {
                    dyo.engine3d.loadTexture(self.base3d, dyo.config._shapes[0].files.base.color);
                }
                
                self.kerb3d = new Engine3D.Model3D(File('kerb').url_3d);

                self.kerb3d.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {

                    self.currentModel = self.kerb3d;
                    self.currentModel.generalType = "kerbset";
                    self.kerb3d.generalType = "kerbset";
                    
                    if (!dyo.edit) {
                        dyo.engine3d.loadTexture(self.kerb3d, dyo.config._shapes[0].files.kerb.color);
                    }
    
                    self.ledger3d = new Engine3D.Model3D(File('lid').url_3d);

                    self.ledger3d.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {

                        self.currentModel = self.ledger3d;
                        self.currentModel.generalType = "ledger";
                        
                        if (!dyo.edit) {
                            dyo.engine3d.loadTexture(self.ledger3d, dyo.config._shapes[0].files.lid.color);
                        }
    
                        self.stand3d = new Engine3D.Model3D(File('stand').url_3d);

                        self.stand3d.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {

                            self.currentModel = self.stand3d;
                            self.stand3d.generalType = "stand";
                            //self.stand3d.changeProperty("showReflections", true);
                            if (!dyo.edit) {
                                dyo.engine3d.loadTexture(self.stand3d, dyo.config._shapes[0].files.stand.color);
                            }
        
                            self.headstone3d = new Engine3D.Model3D(url);

                            self.headstone3d.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {

                                self.headstone3d.generalType = "headstone";
                                //self.headstone3d.changeProperty("showReflections", true);

                                self.currentModel = self.headstone3d;

                                self.engine.addChild(self.base3d);
                                self.base3d.addChild(self.kerb3d);

                                dyo.engine.loader.update("090");

                                if (dyo.config._config.type == "full-monument") {
                                        
                                    setTimeout(function() {
                                        self.kerb3d.addChild(self.ledger3d, "lid-back");
                                    }, 500);

                                    setTimeout(function() {
                                        self.kerb3d.addChild(self.stand3d, "stand-back");
                                        dyo.engine.loader.update("095");
                                    }, 1000);

                                    setTimeout(function() {
                                        self.stand3d.addChild(self.headstone3d);
                                        self.launch3D();
                                    }, 1500);
                                    
                                } else {
                                    self.kerb3d.addChild(self.ledger3d, "lid-back");
                                    self.kerb3d.addChild(self.stand3d, "stand-back");
                                    self.stand3d.addChild(self.headstone3d);
                                    self.launch3D();
                                }

                                if (!dyo.edit) {
                                    dyo.engine3d.loadTexture(self.headstone3d, dyo.config._shapes[0].files.table.color);
                                }

                            });

                        });

                    });

                });
                
            });

        } else {

            let old_size = {};
            old_size.width = self.headstone3d.getProperty("width");
            old_size.height = self.headstone3d.getProperty("height");
            old_size.length = self.headstone3d.getProperty("depth");

            self.headstone3d.removeFromParent();
            //self.headstone3d.dispose();

            self.headstone3d = new Engine3D.Model3D(url);
            self.headstone3d.addEventListener(Engine3D.Model3DEvent.IS_READY, function(e) {
                self.stand3d.addChild(self.headstone3d);

                let o = self.headstone3d;

                self.headstone3d.changeProperty("width", Number(old_size.width));
                self.headstone3d.changeProperty("height", Number(old_size.height));
                self.headstone3d.changeProperty("depth", Number(old_size.length));

                dyo.engine3d.loadTexture(self.headstone3d, dyo.config._shapes[0].files.table.color);

                dyo.engine.loader.force = false;
                dyo.engine.loader.hide("Engine:716");

                self.addListeners("headstone");
                
            });

        }

    }

    launch3D() {

        let self = this;

        clearInterval(dyo.lid2);
        dyo.engine.loader.hidePercent();
        dyo.engine.loader.hide("Engine:716");

        if (dyo.currentSection != "Account") {
            $("#openfl").style.visibility = "visible";
            $("#canvas").style.visibility = "hidden";
        }

        dyo.engine.engineStarted = true;
        
        if (dyo.monument.id == 5) {
            dyo.engine.addBorder();
        }

        self.addListeners();
        self.defaultSize();

        if (dyo.monument.id == 5) {
            self.headstone3d.selected = true;
        }

        dyo.monument.updateHeader("Engine 3D: 702");
        
        dyo.engine3d_ready = true;

    }

    loadTexture(model, url) {

        let self = this;

        //console.log(url);

        if (url.indexOf("#") > -1 ) {
            return;
        }

        self.currentModelTextureURL = url;

        if (dyo.monument.switch_full_monument) {
            url = self.currentModelTextureURL;
        }

        if (dyo.monument.switch_headstone) {
            url = self.currentModelTextureURL;
        }

        if (url != null) {
            if (model != undefined) {

                let self = this;
                if (dyo.monument.installationMethod != 3) {
                    self.currentModelTextureURL = url;
                }
                
                if (dyo.engine.loader.force == false) {
                    dyo.engine.loader.show("Engine:733");
                }

                new Engine3D.utils.BitmapLoader(url, function(error, bitmap) {
                    
                    if (error) {
                        console.log(bitmap);
                        console.log(error);
                        return;
                    }

                    var texture = new Engine3D.values.BitmapTextureValue(bitmap, 8);
                    texture.setEmbedType(Engine3D.enums.EmbedType.NO_EMBEDDED);
                    
                    let prop = "color";

                    switch (model.generalType) {
                        default:
                            if (model != null) {
                                model.changeProperty(prop, texture);
                                model.extra = { color: url }
                            }        
                            break;
                        case "Scenery":
                            self.headstone3d.changeProperty(prop, texture);
                            self.stand3d.changeProperty(prop, texture);
                            self.ledger3d.changeProperty(prop, texture);
                            self.kerb3d.changeProperty(prop, texture);
                            break;
                    }

                    //dyo.engine.loader.force = false;
                    if (dyo.engine.loader.force == false) {
                        if (dyo.edit == false) {
                            dyo.engine.loader.hide("Engine 3d:672");
                        }
                    }

                }).load();

            }
        }
        
    }

    selectModel(e) {

        if (e) {

            var selectedModel = e.getModel();

            //console.log(selectedModel);
            //console.log(selectedModel.extra);

            if (selectedModel) {
                //let generalType = selectedModel.getGeneralType();

                let itemID;
                let item;

                //console.log(selectedModel.extra.id);

                if (selectedModel.extra) {
                    itemID = selectedModel.extra.id;
                    item = dyo.monument.getItemById(itemID);
                }

                if (item) {
                    switch (item.type) {
                        case "Photo":
                            // add instance of events for change of fixed photo sizes
                            dyo.engine3d.inst3d = selectedModel;
                            item.setInst3d(selectedModel);
                            item.select();
                            if (item.events3D != true) {
                                item.addEvents3D();
                            }
                            break;
                        case "Motif":
                            dyo.engine3d.inst3d = selectedModel;
                            item.setInst3d(selectedModel);
                            item.select();
                            if (item.events3D != true) {
                                item.addEvents3D();
                            }
                            break;
                        case "Inscription":
                            dyo.engine3d.inst3d = selectedModel;
                            item.setInst3d(selectedModel);
                            item.select();
                            if (item.events3D != true) {
                                item.addEvents3D();
                            }
                            break;
                        case "Emblem":
                            dyo.engine3d.inst3d = selectedModel;
                            item.setInst3d(selectedModel);
                            item.select();
                            if (item.events3D != true) {
                                item.addEvents3D();
                            }
                            break;    
    
                    }
                }

            }

        }

    }
		
    loadProject() {
        dyo.engine.loader.force = true;
        dyo.engine.loader.show();

        var context = new Engine3D.project.ProjectContext();

        //context.registerResourceLoadTrigger(Engine3D.project.triggers.BaseUrlLoadTrigger);
        Engine3D.Controller.loadProject(dyo.path.forever + dyo.path.design + dyo.path.saved_designs + "p3d/" + dyo.monument.design_stampid + ".p3d", context);

        Engine3D.Controller.addEventListener(Engine3D.Engine3DProjectEvent.PROJECT_LOADED, dyo.engine3d.projectLoaded);
        
        $("#openfl").style.visibility = "hidden";
    }

    projectLoaded() {
        
        document.location.href = "#design-menu";
        dyo.edit = false;

        Engine3D.Controller.removeEventListener(Engine3D.Engine3DProjectEvent.PROJECT_LOADED, dyo.engine3d.projectLoaded);

        dyo.engine3d.project = Engine3D.Controller.getCurrentProject();

        Engine3D.Controller.addEventListener(Engine3D.Engine3DModelEvent.MODEL_SELECT, dyo.engine3d.selectModel);

        this.rootModel = dyo.engine3d.project.getRootModel();

        dyo.engine3d.createModelData(this.rootModel);

        //dyo.engine.loader.hide();

        setTimeout(() => {
            dyo.engine3d.updateProject();
        }, 2000);

    }

    createModelData(model) {

        switch (model.getGeneralType()) {
            case "table":
                if (model.extra) {
                    if (model.extra.color) {
                        dyo.engine3d.loadTexture(dyo.engine3d.headstone3d, model.extra.color);
                    }
                }
                break;
            case "stand":
                if (model.extra) {
                    if (model.extra.color) {
                        dyo.engine3d.loadTexture(dyo.engine3d.stand3d, model.extra.color);
                    }
                }
                break;
            case "lid":
                if (model.extra) {
                    if (model.extra.color) {
                        dyo.engine3d.loadTexture(dyo.engine3d.ledger3d, model.extra.color);
                    }
                }
                break;
            case "kerb":
                if (model.extra) {
                    if (model.extra.color) {
                        dyo.engine3d.loadTexture(dyo.engine3d.kerb3d, model.extra.color);
                    }
                }
                break;
            case "base":
                if (model.extra) {
                    if (model.extra.color) {
                        dyo.engine3d.loadTexture(dyo.engine3d.base3d, model.extra.color);
                    }
                }
                break;
        }

        let regions = model.getRegionList();

        for (let i = 0; i < regions.length; i++) {

            let region = regions[i];
            let childs = region.getChildList();

            if (childs.length > 0) {
                for (let nr = 0; nr < childs.length; nr++) {
                    
                    if (childs[nr].getGeneralType() == "base") {
                        this._baseModel = childs[nr];
                        this._models[0] = childs[nr];
                        this._models_data[0] = {};

                        dyo.engine3d.base3d = childs[nr];
                        dyo.engine3d.addListeners("base");

                        dyo.engine3d.createModelData(this._models[0]);
                    }
                    if (childs[nr].getGeneralType() == "kerb") {
                        this._kerbModel = childs[nr];
                        this._models[1] = childs[nr];
                        this._models_data[1] = {};

                        dyo.engine3d.kerb3d = childs[nr];
                        dyo.engine3d.addListeners("kerb");

                        dyo.engine3d.createModelData(this._models[1]);
                    }
                    if (childs[nr].getGeneralType() == "lid") {
                        this._lidModel = childs[nr];
                        this._models[2] = childs[nr];
                        this._models_data[2] = {};

                        dyo.engine3d.ledger3d = childs[nr];
                        dyo.engine3d.addListeners("ledger");

                        dyo.engine3d.createModelData(this._models[2]);
                    }
                    if (childs[nr].getGeneralType() == "stand") {
                        this._standModel = childs[nr];
                        this._models[3] = childs[nr];
                        this._models_data[3] = {};

                        dyo.engine3d.stand3d = childs[nr];
                        dyo.engine3d.addListeners("stand");
                        
                        dyo.engine3d.createModelData(this._models[3]);
                    }
                    if (childs[nr].getGeneralType() == "table") {
                        this._tableModel = childs[nr];

                        //console.log(childs[nr].getContext().get_url().url);

                        dyo.engine3d.headstone3d = childs[nr];
                        dyo.engine3d.addListeners("headstone");

                        this._models[4] = childs[nr];
                        this._models_data[4] = {};
                        dyo.engine3d.createModelData(this._models[4]);

                        if (dyo.monument.id == 5) {
                            dyo.borderLoaded = false;
                            dyo.engine.addBorder();
                        }

                    }
                }

            }

        }

    }

    updateProject() {

        /*
        $("#openfl").style.visibility = "visible";
        dyo.edit = false;
        dyo.engine.loader.force = false;
        dyo.engine.loader.hide("Engine3d:1320");
        return;
        */

        dyo.edit = true;

        this.replaceModelType("ledger", dyo.engine3d.ledger3d.getContext().get_url().url);

        setTimeout(() => {
            //this.replaceModel(dyo.engine3d.headstone3d.getContext().get_url().url);
            setTimeout(() => {
                this.replaceModelType("kerb", dyo.engine3d.kerb3d.getContext().get_url().url);
                setTimeout(() => {
                    this.replaceModelType("stand", dyo.engine3d.stand3d.getContext().get_url().url);
                    $("#openfl").style.visibility = "visible";
                    dyo.edit = false;
                    dyo.engine.loader.force = false;
                    dyo.engine.loader.hide("Engine3d:1320");
                }, 750);
            }, 750);
        }, 750);

    }

}