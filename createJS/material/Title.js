import {Component} from './Component.js';
import {_, $, Lang, Translate} from '../Const.js';

const TITLE_SIMPLE = 1;
const TITLE_WITH_DESCRIPTION = 2;

export class Title extends Component {
	constructor(data = {}) {
        super(data);
        this.container = $("div", "add", "container", this.stage);
    }

	render() {
        
        let c = _(["mdc-typography--caption"], this._class)

        switch (this.type) {

            case TITLE_SIMPLE:

                this.content = $("div", "id", 
                { 
                    id: this.id, 
                    css: this.css, 
                    class: c, 
                    desc: this.title
                }, this.container);

                break;

            case TITLE_WITH_DESCRIPTION:

                this.content = $("div", "id", 
                { 
                    id: this.id, 
                    css: this.css, 
                    class: c, 
                    desc: this.title
                }, this.container);
    
                this.content = $("div", "id", 
                { 
                    css: this.css, 
                    class: "mdc-typography--button", 
                    desc: this.description
                }, this.container);

                break;
                
        }

	}
	
}