import { Drawer, Dialog, TextField, Select, Slider, List } from '../material/MaterialDesign.js';
import { P, Lang, Translate, $ } from '../Const.js';
import { Stand } from '../dyo/Stand.js';
import { Component } from '../material/Component.js';

export class Stands extends Component {

	constructor(data = {}) {
		super(data);
        this.eventsCollector = [];
        dyo.stands = this;

        this.container = $("div", "add", "container", this.stage);
        
        this.hide();
    }

    show() {
        dyo.currentSection = "Stand";
        this.container.style.display = "block";
    }

    update() {
        $("#dyo_holes_title", Translate(Lang.STAND) + " <i class='material-icons'>help_outline</i>");
        $("#back_to_menu_" + this.title, Translate(Lang.BACK_TO_DESIGN_MENU));
    }

    render() {

        if (!this.rendered) {
            this.rendered = true;

            this.menu = new Drawer({
                stage: this.container,
                drawer_type: 0,
                toolbar_type: 1,
                title: this.title,
                id: "dyo_stand"
            });
            this.menu.render();

            this.input = new List({
                stage: $("#dyo_stand-mdc-list"),
                parent: this,
                id: "dyo_stand_list",
                type: 1,
                data: this.stands
            });

            this.input.render();
        }
        
    }

    selectStand(id, stand) {

        let _id;
        let _stand;

        if (id == undefined) {
            _id = dyo.engine.stand_id
            _stand = dyo.engine.stand_stand;
        } else {
            _id = id;
            _stand = stand;
        }

        let type = dyo.config.getProductType();

        this.stands.forEach(stand => {

            if (stand.class == type) {

                let id2 = stand.class + "_" + this.makeSafeName(stand.name);
                if ($('#' + id2)) {
                    $('#' + id2).classList.remove("mdc-list-selected");
                }

            }

        });

        $('#' + _id).classList.add("mdc-list-selected");

        let Headstone = dyo.monument.getPartByType('Headstone');

        if (_stand) {
            switch (_stand.option) {
                case 1:
                    //No Stand
                    dyo.monument.standType = 1;

                    if (dyo.monument.headstone.productStand) {
                        dyo.monument.headstone.productStand.delete();
                    }
                    break;
                case 2:
                    //Seperate
                    dyo.monument.standType = 2;

                    if (dyo.monument.headstone.productStand) {
                        dyo.monument.headstone.productStand.delete();
                    }

                    dyo.monument.headstone.productStand = new Stand({ 
                        type: "Stand",
                        stand_drawing: Headstone.stand,
                        productid: 87
                    });

                    if (dyo.target == null) {
                        dyo.target = dyo.monument.getPartByType('Headstone');
                    }
                    dyo.target.add(dyo.monument.headstone.productStand);

                    break;
                case 3:
                    //Inbuilt
                    dyo.monument.standType = 3;

                    if (dyo.monument.headstone.productStand) {
                        dyo.monument.headstone.productStand.delete();
                    }

                    dyo.monument.headstone.productStand = new Stand({ 
                        type: "Stand",
                        stand_drawing: Headstone.stand,
                        productid: 88
                    });

                    if (dyo.target == null) {
                        dyo.target = dyo.monument.getPartByType('Headstone');
                    }
                    dyo.target.add(dyo.monument.headstone.productStand);

                    break;
            }
        }

        dyo.monument.updateHeader();
    }

    events() {

        let self = this;
        let type = dyo.config.getProductType();

        this.stands.forEach(stand => {

            if (stand.class == type) {

                let id = stand.class + "_" + this.makeSafeName(stand.name);

                if ($('#' + id)) {
                    $('#' + id).addEventListener('click', (e) => { 
                        this.selectStand(id, stand);
                    });
                }

            }

        });

    }
	
}