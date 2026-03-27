import { Component } from './Component.js';
import { File, Lang, Translate, $ } from '../Const.js';

const TEXT_FIELD_SIMPLE = 0;
const TEXT_FIELD_OUTLINED = 1;

export class Slider extends Component {
	constructor(data = {}) {
        super(data);
        this.container = $("div", "add", "container", this.stage);
    }

    getValue() {
        return this.slider.value;
    }

    getMin() {
        return this.slider.min;
    }

    getMax() {
        return this.slider.max;
    }

    setMax(value) {
        this.slider.max = value;
    }

	render() {

        let content = `
        <span id='${this.id}_value' class="mdc-typography--button">${Translate(this.title)}</span>

        <div id='slider-${this.id}' class="mdc-slider" tabindex="0" role="slider"
            aria-valuemin="5" aria-valuemax="200" aria-valuenow="50"
            aria-label="Select Value" vertical="false" style="width: 190px !important;">

            <div class="mdc-slider__track-container">
                <div class="mdc-slider__track"></div>
            </div>

            <div class="mdc-slider__thumb-container">
                <svg class="mdc-slider__thumb" width="21" height="21">
                    <circle cx="10.5" cy="10.5" r="7.875"></circle>
                </svg>
                <div class="mdc-slider__focus-ring"></div>
            </div>

        </div>
        `

        if (this.html) {
            this.content += this.html;
        }

		this.container.innerHTML = content;

        this.slider = new mdc.slider.MDCSlider($('#slider-' + this.id));
        this.slider.step = Number(this.step);

        this.events();

    }

    setValue(value) {
        if (value != undefined) {
            this.slider.value = value;
        }
    }

	events() {

        let self = this;

        this.slider.listen('MDCSlider:change', (e) => {

            createjs.Ticker.timingMode = null;

            if (self.title == Lang.WIDTH || self.title == Lang.HEIGHT) {
                dyo.resizing = false;
                dyo.monument.updateMonument();
            }
            
        });

        this.slider.listen('MDCSlider:input', (e) => {

            let value = self.slider.value;

            createjs.Ticker.timingMode = createjs.Ticker.RAF;
            
            switch (self.title) {
                case Lang.WIDTH:
                    dyo.resizing = true;

                    switch (dyo.mode) {
                        case "3d":
                            if (value != this.old_value) {
                                dyo.controller_Width.setValue(value);
    
                                this.old_value = value;
    
                                if (dyo.monument.id == 5 ||
                                    dyo.monument.id == 999) {
                                    dyo.monument.updateMonument();
                                }
    
                            }
                            break;
                        case "2d":
                            if (dyo.target) {
                                if (dyo.target.type == "Headstone" && dyo.monument.headstone.ratio) {

                                    if (dyo.data.height / dyo.monument.headstone.ratio > value) {
                                        if (value != this.old_value) {
                                            dyo.controller_Width.setValue(value);
                                            this.old_value = value;
                                        }
                                    }

                                    dyo.monument.updateMonument();

                                } else {

                                    dyo.controller_Width.setValue(value);
                                    dyo.monument.updateMonument();

                                }
                            }
                            break;
                    }
                    break;

                case Lang.HEIGHT:
                    dyo.resizing = true;

                    switch (dyo.mode) {
                        case "3d":

                            if (value != this.old_value) {
                                dyo.controller_Height.setValue(value);

                                this.old_value = value;

                                if (dyo.monument.id == 5 ||
                                    dyo.monument.id == 999) {
                                    dyo.monument.updateMonument();
                                }
                            }
                            break;
                        
                        default:
                            // Ratio

                            if (dyo.target == dyo.monument.headstone) {
                                if (dyo.monument.headstone) {
                                    if (dyo.monument.headstone.ratio) {
                                        this.slider.min = Math.round(dyo.data.width * dyo.monument.headstone.ratio);
                                        if (this.slider.min < Number(File("table").min_height)) {
                                            this.slider.min = Number(File("table").min_height);
                                        } 
                                    }

                                    if (value != this.old_value) {
                                        dyo.controller_Height.setValue(value);
                                        dyo.monument.updateMonument();
                                        this.old_value = value;
                                    }
                                }
                            }

                            if (dyo.target == dyo.monument.base) {
                                if (value != this.old_value) {
                                    dyo.controller_Height.setValue(value);
                                    dyo.monument.updateMonument();
                                    this.old_value = value;
                                }
                            }
                            break;

                        }
                    break;

                case Lang.THICKNESS:

                    if (dyo.mode == "3d") {

                        if (value != this.old_value) {
                            dyo.controller_Length.setValue(value);

                            this.old_value = value;
                        }

                    }

                    break;

            }

            let sizes = [];

            switch (dyo.currentSection) {

                default:
                    if (dyo.selected) {

                        if (self.title == Lang.SELECT_SIZE) {

                            switch (dyo.currentSection) {
                                default:
                                    if (dyo.mode == "3d") {
                                        if (dyo.engine3d.inst3d) {
                                            dyo.engine3d.inst3d.changeProperty("height", Number(value));
                                            dyo.controller_Size.setValue(value);
                                            return;
                                        }
                                    } else {
                                        dyo.selected.setSize(value);
                                    }
                                    return;
                                    break;
                                case "Inscriptions":
                                    if (dyo.mode == "3d") {
                                        if (dyo.engine3d.inst3d) {
                                            dyo.engine3d.inst3d.changeProperty("height", Number(value));
                                        }
                                    } else {
                                        dyo.selected.setSize(value);
                                    }
                                    return;
                                    break;
                                case "Photos": 
                                    sizes = dyo.engine.photos.photoSizes();

                                    if (dyo.mode == "3d") {
                                        if (dyo.engine3d.inst3d) {
                                            if (dyo.engine3d.inst3d.fixed) {
                                                if (sizes.length > 1) {
                                                    let photo_width = Math.round(sizes[value - 1].name.replace(" mm", "").split(" x ")[0]);
                                                    let photo_height = Math.round(sizes[value - 1].name.replace(" mm", "").split(" x ")[1]);

                                                    dyo.engine3d.lockUpdate = true;

                                                    if (dyo.selected.img_type == 1) {
                                                        dyo.engine3d.inst3d.changeProperty("height", Number(photo_height));
                                                    } else {
                                                        dyo.engine3d.inst3d.changeProperty("width", Number(photo_width));
                                                    }

                                                    dyo.selected.setSize(sizes[value - 1].name);
                                                }
                                            } else {
                                                dyo.engine3d.inst3d.changeProperty("height", Number(value));
                                            }
                                        }
                                    } else {
                                        if (sizes.length > 1) {
                                            dyo.selected.setSize(sizes[value - 1].name);
                                        } else {
                                            dyo.selected.setSize(value);
                                        }
                                    }

                                    dyo.controller_Size.setValue(value);
                                    return;
                                    break;
                                case "Emblems": 
                                    sizes = dyo.engine.emblems.emblemSizes();

                                    if (dyo.mode == "3d") {
                                        if (sizes.length > 1) {
                                            if (dyo.engine3d.inst3d) {
                                                
                                                let emblem_width = Math.round(sizes[value - 1].name.replace(" mm", "").split(" x ")[0]);
                                                let emblem_height = Math.round(sizes[value - 1].name.replace(" mm", "").split(" x ")[1]);

                                                dyo.engine3d.lockUpdate = true;

                                                if (dyo.selected.img_type == 1) {
                                                    dyo.engine3d.inst3d.changeProperty("height", Number(emblem_height));
                                                } else {
                                                    dyo.engine3d.inst3d.changeProperty("width", Number(emblem_width));
                                                }

                                                dyo.selected.setSize(sizes[value - 1].name);
                                                
                                            }
                                        } else {
                                            if (dyo.engine3d.inst3d) {
                                                dyo.engine3d.inst3d.changeProperty("height", Number(value));
                                            }
                                        }
                                    } else {
                                        if (sizes.length > 1) {
                                            dyo.selected.setSize(sizes[value - 1].name);
                                        } else {
                                            dyo.selected.setSize(value);
                                        }
    
                                    }

                                    dyo.controller_Size.setValue(value);
                                    return;
                                    break;
                            }

                        }
                    }

                    if (dyo.selected) {
                        if (self.title == Lang.ROTATE) {
                            dyo.selected.setRotation(value);
                        }
        
                    }

                    break;
                    
                case "Crop":

                    if (self.title == Lang.SELECT_SIZE) {
                        dyo.controller_Size.setValue(value);
                        dyo.engine.photos.crop_Size(value);
                    }

                    if (self.title == Lang.ROTATE) {
                        dyo.controller_Rotate.setValue(value);
                        dyo.engine.photos.crop_Rotation(value);
                    }

                    return;
    
                    break;

                case "Sizes":
                    if (self.title == Lang.SIZES) {
                        dyo.controller_Size.setValue(value);
                        this.old_value = value;
                        dyo.data.sizeNr = value;
                    }    
                    break;

            }

            this.value = value;

            dyo.monument.updateHeader("Slider:370");

        });

    }

    decrease() {

        let value;

        if (dyo.target) {
            
            if (this.title == Lang.WIDTH) {

                if (dyo.mode == "3d") {
                    value = Number(dyo.engine3d.currentModel.getProperty("width")) - this.slider.step;
                } else {
                    value = Number(dyo.data.width) - this.slider.step;
                }

                if (value < this.slider.min) {
                    value = this.slider.min;
                }
    
                if (dyo.mode == "3d") {

                    if (value != this.old_value) {
                        dyo.controller_Width.setValue(value);
                        this.old_value = value;
                        dyo.monument.updateMonument();
                    }

                } else {
                    dyo.controller_Width.setValue(value);
                    dyo.monument.updateMonument();
                }
            }

            if (this.title == Lang.HEIGHT) {
                if (dyo.mode == "3d") {
                    value = Number(dyo.engine3d.currentModel.getProperty("height")) - this.slider.step;
                } else {
                    value = Number(dyo.data.height) - this.slider.step;
                }

                if (value < this.slider.min) {
                    value = this.slider.min;
                }

                if (dyo.mode == "3d") {

                    if (value != this.old_value) {
                        dyo.controller_Height.setValue(value);
                        this.old_value = value;
                        dyo.monument.updateMonument();
                    }

                } else {
                    // Ratio
                    if (dyo.monument.headstone) {
                        if (dyo.monument.headstone.ratio) {
                            if (dyo.data.width * dyo.monument.headstone.ratio < value) {
                                dyo.controller_Height.setValue(value);
                                dyo.monument.updateMonument();        
                            }
                        } else {
                            dyo.controller_Height.setValue(value);
                            dyo.monument.updateMonument();
                        }
                    }

                    if (dyo.target == dyo.monument.base) {
                        if (value != this.old_value) {
                            dyo.controller_Height.setValue(value);
                            dyo.monument.updateMonument();
                            this.old_value = value;
                        }
                    }
                }

            }

            if (this.title == Lang.THICKNESS) {
                if (dyo.mode == "3d") {
                    value = Number(dyo.engine3d.currentModel.getProperty("depth")) - this.slider.step;
                } else {
                    value = Number(dyo.data.length) - this.slider.step;
                }

                if (value < this.slider.min) {
                    value = this.slider.min;
                }

                if (dyo.mode == "3d") {

                    if (value != this.old_value) {
                        dyo.controller_Length.setValue(value);
                        this.old_value = value;
                    }

                } else {
                    dyo.controller_Length.setValue(value);
                    dyo.monument.updateMonument();
                }
            }

        }

        switch (dyo.currentSection) {
            default:

                if (dyo.selected) {
                    if (this.title == Lang.SELECT_SIZE) {

                        
                       if (dyo.selected.isFixed()) {

                            value = this.slider.value - this.slider.step;

                            if (value < this.slider.min) {
                                value = this.slider.min;
                            }

                            let sizes;
                            
                            if (dyo.currentSection == "Photos") {
                                sizes = dyo.selected.photoSizes();
                            }

                            if (dyo.currentSection == "Emblems") {
                                sizes = dyo.selected.emblemSizes();
                            }

                            if (dyo.currentSection == "Sizes") {
                                sizes = dyo.selected.emblemSizes();
                            }

                            if (dyo.mode == "3d") {
                                if (dyo.engine3d.inst3d) {
                                    if (sizes.length > 1) {
                                        let emblem_width = Math.round(sizes[value - 1].name.replace(" mm", "").split(" x ")[0]);
                                        let emblem_height = Math.round(sizes[value - 1].name.replace(" mm", "").split(" x ")[1]);

                                        dyo.engine3d.lockUpdate = true;
                                        if (dyo.selected.img_type == 1) {
                                            dyo.engine3d.inst3d.changeProperty("height", Number(emblem_height));
                                        } else {
                                            dyo.engine3d.inst3d.changeProperty("width", Number(emblem_width));
                                        }
                                        dyo.selected.setSize(sizes[value - 1].name);
                                    } else {
                                        dyo.engine3d.inst3d.changeProperty("height", Number(value));
                                    }
                                }
                            } else {
                                if (sizes.length > 1) {
                                    dyo.selected.setSize(sizes[value - 1].name);
                                } else {
                                    dyo.selected.setSize(value);
                                }
                            }
                            
                            
                        } else {

                            value = this.slider.value - this.slider.step;

                            if (value < this.slider.min) {
                                value = this.slider.min;
                            }

                            if (dyo.mode == "3d") {
                                if (dyo.engine3d.inst3d) {
                                    dyo.engine3d.inst3d.changeProperty("height", Number(value));
                                    dyo.selected.setSize(value);
                                }
                            } else {
                                dyo.selected.setSize(value);
                            }

                        }

                        dyo.controller_Size.setValue(value);

                    }

                    if (this.title == Lang.ROTATE) {
                        dyo.selected.decreaseRotation();
                    }
                    
                    this.value = value;
                } 
                break;

            case "Sizes":
                value = this.slider.value - this.slider.step;

                if (value < this.slider.min) {
                    value = this.slider.min;
                }

                if (value > this.slider.max) {
                    value = this.slider.max;
                }

                //console.log("@decrerase");

                if (this.title == Lang.SIZES) {
                    dyo.controller_Size.setValue(value);
                    this.slider.value = value;
                }

                this.value = value;
                dyo.data.sizeNr = value;
                break;

            case "Crop":
                value = this.slider.value - this.slider.step;

                if (value < this.slider.min) {
                    value = this.slider.min;
                }

                if (value > this.slider.max) {
                    value = this.slider.max;
                }

                if (this.title == Lang.SELECT_SIZE) {
                    dyo.controller_Size.setValue(value);
                    dyo.engine.photos.crop_Size(value);
                }

                if (this.title == Lang.ROTATE) {
                    dyo.controller_Rotate.setValue(value);
                    dyo.engine.photos.crop_Rotation(value);
                }

                this.value = value;
                break;

        }

        dyo.monument.updateHeader("Slider:377");

    }

    increase() {

        let value;

        if (dyo.target) {

            if (this.title == Lang.WIDTH) {
                
                if (dyo.mode == "3d") {
                    value = Number(dyo.engine3d.currentModel.getProperty("width")) + this.slider.step;
                } else {
                    value = Number(dyo.data.width) + this.slider.step;
                }

                if (value > this.slider.max) {
                    value = this.slider.max;
                }
               
                if (dyo.mode == "3d") {

                    if (value != this.old_value) {
                        dyo.controller_Width.setValue(value);
                        this.old_value = value;
                        dyo.monument.updateMonument();
                    }

                } else {
                // No Ratio
                    dyo.controller_Width.setValue(value);
                    dyo.monument.updateMonument();
                }
                
            }

            if (this.title == Lang.HEIGHT) {

                if (dyo.mode == "3d") {
                    value = Number(dyo.engine3d.currentModel.getProperty("height")) + this.slider.step;
                } else {
                    value = Number(dyo.data.height) + this.slider.step;
                }

                if (value > this.slider.max) {
                    value = this.slider.max;
                }
            
                if (dyo.mode == "3d") {

                    if (value != this.old_value) {
                        dyo.controller_Height.setValue(value);
                        this.old_value = value;
                        dyo.monument.updateMonument();
                    }

                } else {

                    // Ratio
                    if (dyo.monument.headstone) {
                        if (dyo.monument.headstone.ratio) {
                            if (dyo.data.width * dyo.monument.headstone.ratio < value) {
                                dyo.controller_Height.setValue(value);
                                dyo.monument.updateMonument();        
                            }
                        } else {
                            dyo.controller_Height.setValue(value);
                            dyo.monument.updateMonument();
                        }
                    }

                    if (dyo.target == dyo.monument.base) {
                        if (value != this.old_value) {
                            dyo.controller_Height.setValue(value);
                            dyo.monument.updateMonument();
                            this.old_value = value;
                        }
                    }

                }

            }

            if (this.title == Lang.THICKNESS) {

                if (dyo.mode == "3d") {
                    value = Number(dyo.engine3d.currentModel.getProperty("depth")) + this.slider.step;
                } else {
                    value = Number(dyo.data.length) + this.slider.step;
                }

                if (value > this.slider.max) {
                    value = this.slider.max;
                }

                if (dyo.mode == "3d") {

                    if (value != this.old_value) {
                        dyo.controller_Length.setValue(value);
                        this.old_value = value;
                    }

                } else {
                    dyo.controller_Length.setValue(value);
                    dyo.monument.updateMonument();
                }                
            }


        }

        switch (dyo.currentSection) {
            default:
                if (dyo.selected) {

                    if (this.title == Lang.SELECT_SIZE) {

                        if (dyo.selected.isFixed()) {

                            value = this.slider.value + this.slider.step;

                            if (value > this.slider.max) {
                                value = this.slider.max;
                            }

                            let sizes;
                            
                            if (dyo.currentSection == "Photos") {
                                sizes = dyo.selected.photoSizes();
                            }

                            if (dyo.currentSection == "Emblems") {
                                sizes = dyo.selected.emblemSizes();
                            }

                            if (dyo.mode == "3d") {
                                if (isNaN(value)) {
                                    value = 2;
                                }
                                if (dyo.engine3d.inst3d) {
                                    if (sizes.length > 1) {
                                        let emblem_width = Math.round(sizes[value - 1].name.replace(" mm", "").split(" x ")[0]);
                                        let emblem_height = Math.round(sizes[value - 1].name.replace(" mm", "").split(" x ")[1]);

                                        dyo.engine3d.lockUpdate = true;

                                        if (dyo.selected.img_type == 1) {
                                            dyo.engine3d.inst3d.changeProperty("height", Number(emblem_height));
                                        } else {
                                            dyo.engine3d.inst3d.changeProperty("width", Number(emblem_width));
                                        }

                                        dyo.selected.setSize(sizes[value - 1].name);
                                    }
                                }
                            } else {
                                if (sizes.length > 1) {
                                    dyo.selected.setSize(sizes[value - 1].name);
                                }
                            }
                            
                        } else {

                            value = this.slider.value + this.slider.step;

                            if (value > this.slider.max) {
                                value = this.slider.max;
                            }

                            if (dyo.mode == "3d") {
                                if (dyo.engine3d.inst3d) {
                                    dyo.engine3d.inst3d.changeProperty("height", Number(value));
                                    dyo.selected.setSize(value);
                                }
                            } else {
                                dyo.selected.setSize(value);
                            }

                        }

                       dyo.controller_Size.setValue(value);

                    }
                    
                    if (this.title == Lang.ROTATE) {
                        dyo.selected.increaseRotation();
                    }

                    this.value = value;
                }
                break;

            case "Crop":
                value = this.slider.value + this.slider.step;

                if (value < this.slider.min) {
                    value = this.slider.min;
                }

                if (value > this.slider.max) {
                    value = this.slider.max;
                }

                if (this.title == Lang.SELECT_SIZE) {
                    dyo.controller_Size.setValue(value);
                    dyo.engine.photos.crop_Size(value);
                }

                if (this.title == Lang.ROTATE) {
                    dyo.controller_Rotate.setValue(value);
                    dyo.engine.photos.crop_Rotation(value);
                }

                this.value = value;

                break;

            case "Sizes":
                value = this.slider.value + this.slider.step;

                if (value < this.slider.min) {
                    value = this.slider.min;
                }

                if (value > this.slider.max) {
                    value = this.slider.max;
                }

                if (this.title == Lang.SIZES) {
                    dyo.controller_Size.setValue(value);
                    this.slider.value = value;
                }

                this.value = value;
                dyo.data.sizeNr = value;
                break;

        }

        dyo.monument.updateHeader("Slider:377");

    }

    show() {
        this.container.style.visibility = "visible";
    }

    hide() {
        this.container.style.visibility = "hidden";
    }
	
}