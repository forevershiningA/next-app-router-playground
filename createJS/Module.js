import {Item} from './dyo/Item.js';

export class Module extends Item {
    
    hideContainer(obj) {
        obj.style.visibility = "hidden";
        obj.style.height = "0px";
        obj.style.overflow = "hidden";
    }

    showContainer(obj) {
        obj.style.visibility = "visible";
        obj.style.height = "auto";
        obj.style.overflow = "";
    }

}