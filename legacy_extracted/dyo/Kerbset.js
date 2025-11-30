import {Shape} from './Shape.js';
import {EncodePath} from './EncodePath.js';

export class Kerbset extends Shape {
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
            data.parent = dyo.monument.headstone;//this;
            data.render();
        }

        if (data.type == "Motif") {
            data.parent = dyo.monument.headstone;//this;
            data.render();
        }

        if (data.type == "Emblem") {
            data.parent = dyo.monument.headstone;//this;
            data.render();
        }

        if (data.type == "Photo") {
            data.parent = dyo.monument.headstone;//this;
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
            self.border = this.border;
            self.shape_url = 'shapes/photos/' + this.border.replace(" ", "").toLowerCase() + ".svg";
        }
        self.shape = this.getShape();
        self.color = this.color;
        self.fixed = this.fixed;

        self.texture = this.texture.replace('data/jpg/','src/');
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

        if (dyo.monument.backgroundOption) {
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

            if (dyo.monument.has_base) {

				if (this._width > this._height) {
					width = this.headstoneHeightPx;
					height = this.headstoneHeightPx * (this._height / this._width);

					this.baseHeightPx = (use) * (baseHeight / this._width);

				} else {
					width = this.headstoneHeightPx * (this._width / this._height);
					height = this.headstoneHeightPx;

					this.baseHeightPx = (use) * (baseHeight / totalHeight);
				}


			} else {

				if (this._width > this._height) {
					width = use;
					height = use * (this._height / this._width);
				} else {
					width = use * (this._width / this._height);
					height = use;
				}

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

}