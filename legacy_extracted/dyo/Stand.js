import {Item} from './Item.js';
import {Lang, Translate, $} from '../Const.js';

export class Stand extends Item {
	constructor(data = {}) {
        super(data);

        this.type = 'Stand';

        if (data.productid) {
            this.productid = data.productid;
        } else {
            this.productid = dyo.monument._additions.Stand[0].id;
        }
        
        this.stand_drawing = data.stand_drawing;
        this.side = data.side;
        this.parent = data.parent;

        this.price = 0;
        this.x = 0;
        this.y = 0;

        this.color = dyo.monument.getColor();
        if (data.color) {
            this.color = data.color;
        }
        if (data.color_texture) {
            this.color_texture = data.color_texture;
        }

        if (data.itemID) {
            this.itemID = data.itemID;
        } else {
            this.itemID = dyo.monument.getItemID();
        }

        dyo.monument.addItem(this);

    }

    render() {
        dyo.monument.updateHeader("Border:64");

        let Headstone = dyo.monument.getPartByType('Headstone');

        Headstone.stand = this.stand_drawing;
        Headstone.renderOverlay();

    }

    deselect() {
    }

    resize() {
    }

    get_width() {
    }

    get_height() {
    }

    getPrice() {
        return this.price;
    }

    delete() {
        dyo.monument.removeItem(this);
		
        this.deleted = true;

        dyo.monument.updateHeader("Motif:218");
    }

    serialize(json) {

        this.quantity = 1;

        let self = {};

        self.productid = this.productid;
        self.name = dyo.monument._additions.Motifs[0].name;
        self.type = this.type;
        self.border_drawing = this.border_drawing;
        self.part = this.parent.type;
        self.price = this.price;
        self.quantity = this.quantity;
        self.color = this.color;
        self.colorName = this.colorName;
        self.itemID = this.itemID;

        if (json) {
            return JSON.stringify(self);
        } else {
            return self;
        }
    }
    
}