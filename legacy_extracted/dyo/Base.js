import {Shape} from './Shape.js';
import {EncodePath} from './EncodePath.js';

export class Base extends Shape {
	constructor(...args) {
        super(...args);
        this._data = [];
    }
    
    get type() {
        return this._type;
    }

    get data() {
        return this._data;
    }

    add(data = {}) {
        if (data.type == "Inscription") {
            data.parent = dyo.monument.headstone;
            data.render();
        }

        if (data.type == "Motif") {
            data.parent = dyo.monument.headstone;
            data.render();
        }

        if (data.type == "Emblem") {
            data.parent = dyo.monument.headstone;
            data.render();
        }

        if (data.type == "Photo") {
            data.parent = dyo.monument.headstone;
            data.render();
        }

        this._data.push(data);
    }

    serialize(json) {
    
        this.quantity = 1;
        //this.price = dyo.monument.getPrice({ width: this.width, height: this.height, length: this.length });

        const self = {};

        self.productid = dyo.monument.id;
        self.type = this.type;
        self.name = this.name;
        if (this.border) {
            if (this.border != undefined) {
                self.border = this.border;
                self.shape_url = 'shapes/photos/' + this.border.replace(" ", "").toLowerCase() + ".svg";
            }
        }

        if (dyo.monument.has_base_flower_pot_holes) {
            if (this.flower_pot_holes != undefined) {
                self.flower_pot_holes = true;
            }
            if (this.base_flower_pots != undefined) {
                self.base_flower_pots = this.base_flower_pots;
            }
        }

        if (dyo.monument.installationMethod != null) {
            self.installationMethod = dyo.monument.installationMethod;
        }

        self.shape = this.getShape();
        self.color = this.color;
        self.fixed = this.fixed;

        if (this.texture) {
            self.texture = this.texture.replace('data/jpg/','src/');
        }
        
        self.price = this.price;
        self.quantity = this.quantity;
        self.width = this.width;
        self.height = this.height;
        self._length = this.length;
        self.init_width = dyo.w;
        self.init_height = dyo.h;
        self.mode = dyo.mode;

        if (this.background) {
            self.color = dyo.monument.headstone.background;
        }

        if (dyo.monument.backgroundOption != undefined && dyo.monument.backgroundOption != "undefined") {
            self.backgroundOption = dyo.monument.backgroundOption;
        } 

        if (json) {
            return JSON.stringify(self);
        } else {
            return self;
        }
		
    }
    
	calcShape(id) {

		this.shapeId = id;

		if (this.stack) {

            if (this.maxY == undefined) {
                this.minX = 0;
                this.maxX = 0;
                this.minY = 0;
                this.maxY = 0;
            }
            
			this.stack = this.stackId[id];

			this.encodePath = new EncodePath()

			let x, y, cpx, cpy, proc, width, height, scale, use;
			let ratio = 1;

			use = Number(dyo.monument.headstone.baseHeightPx);
			
			if (dyo.monument.has_base) {

                dyo.monument.base.min_width = Number(dyo.monument.headstone.width);
                
                if (dyo.target == null) {
                    dyo.target = dyo.monument.getPartByType('Headstone');
                }
            
                if (dyo.target.type == "Headstone") {

                    if (dyo.monument.headstone.fixed == 4) {
                        width = Number((dyo.monument.headstone.scale_maxX * 2) * (dyo.monument.base.width / dyo.monument.headstone.width));
                    } else {
                        if (dyo.monument.headstone.pixels) {
                            width = Number(dyo.monument.headstone.pixels.width * (dyo.monument.base.width / dyo.data.width));
                        }
                    }

                }

                if (dyo.target.type == "Base") {

                    if (dyo.monument.headstone.fixed == 4) {
                        width = (dyo.monument.headstone.scale_maxX * 2) * (dyo.monument.base.width / dyo.monument.headstone.width);
                    } else {
                        width = dyo.monument.headstone.pixels.width * (dyo.data.width / dyo.monument.headstone.width);
                    }

                }

                height = use;

            }

			this.bottom = 0;
			
            let detail = 20;
            
            for (let key in this.containers) {
				this.containers[key].x = this.x;
				this.containers[key].y = this.y;
            }

			if (this.stack) {

				for (let nr = 0; nr < this.stack.length; nr++) {

					proc = ((this.stack[nr].x + this.p.right) / (this.p.right - this.p.left)) * 100;
					x = ((width) * proc / 100) - (width / 2);

					proc = ((this.stack[nr].y + this.p.bottom) / (this.p.bottom - this.p.top)) * 100;
					y = (use * proc / 100) - height / 2;

					if (this.stack[nr].y >= this.p.top) {
						proc = ((this.stack[nr].y + this.p.bottom) / (this.p.bottom - this.p.top)) * 100;
						y = (width * proc / 100) - height / 2;
					}

					if (this.stack[nr].y > this.p.bottom - detail) {
						proc = ((this.stack[nr].y - this.p.bottom) / (this.p.bottom - this.p.top)) * 100;
						y = (width * proc / 100) + height / 2;
					} 

					if (this.minY > y) {
						this.minY = y;
					}

					if (this.minX > x) {
						this.minX = x;
					}

					if (this.maxY < y) {
                        this.maxY = y;
					}

					if (this.maxX < x) {
						this.maxX = x;
					}

					if (this.stack[nr].cpx) {
						proc = ((this.stack[nr].cpx + this.p.right) / (this.p.right - this.p.left)) * 100;
						cpx = ((width) * proc / 100) - (width / 2);
					}

					if (this.stack[nr].cpy) {
						proc = ((this.stack[nr].cpy + this.p.bottom) / (this.p.bottom - this.p.top)) * 100;
						cpy = ((height) * proc / 100) - (height / 2);

						if (this.stack[nr].cpy >= this.p.top) {
							proc = ((this.stack[nr].cpy + this.p.bottom) / (this.p.bottom - this.p.top)) * 100;
							cpy = (width * proc / 100) - height / 2;
						}
					}

					if (this.stack[nr].cpy > this.p.bottom - detail) {
						proc = ((this.stack[nr].cpy - this.p.bottom) / (this.p.bottom - this.p.top)) * 100;
						cpy = (width * proc / 100) + height / 2;
					}

					switch (this.stack[nr].c) {
						default:
							this.encodePath[this.stack[nr].c](x, y);
							break;

						case "quadraticCurveTo":
							this.encodePath[this.stack[nr].c](cpx, cpy, x, y);
							break;

						case "bezierCurveTo":
							this.encodePath[this.stack[nr].c](this.stack[nr].cp1x, this.stack[nr].cp1y, this.stack[nr].cp2x, this.stack[nr].cp2y, this.stack[nr].x, this.stack[nr].y);
							break;

					}

				}

            }

			return this.encodePath;

		}

	}

    addFlowerPotHolders() {
        
    }

    addFlowerPots() {

    }

}