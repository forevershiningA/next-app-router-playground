import { Component } from './Component.js';
import {Lang, Translate, $} from '../Const.js';

export class Loader extends Component {
	constructor(data = {}) {
		super();
		this.stage = data.stage;
        this.id = data.id;
        this.force = false;
        this.lastMsg = 0;

        this.container = document.createElement('div');
        this.container.classList.add(this.id + "-container");
        this.stage.appendChild(this.container);
        this.hide();	
    }

    set force(value) {
        this._force = value;
    }

    get force() {
        return this._force;
    }

    hide(msg) {
        if (msg) {
            //console.log("Loader Hide: " + msg + " / force: " + this.force);
        }

        if (!this.force) {
            this.container.style.display = "none";
        }
    }

    update(msg) {
        if (window.lid) {
            clearInterval(window.lid);
            window.lid = undefined;
        }
        if (msg > this.lastMsg) {
            $("#loader-percent").textContent = msg;
            this.lastMsg = msg;
        }
    }

    hidePercent() {
        $("#load").style.display = "none";
        $("#loader-percent").style.display = "none";
        this.render();
    }

    showPercent() {
        $("#load").style.display = "block";
        $("#loader-percent").style.display = "block";
    }

    show(msg) {
        if (msg) {
            //console.log("Loader Show: " + msg);
        }
        this.container.style.display = "flex";
        if ($('.spinner')) {
            $('.spinner').style.display = 'flex';
        }
    }

    block() {
        this.container.style.display = "flex";
        $('.spinner').style.display = 'none';
        let self = this;

        $('.loader-container').addEventListener('click', this.dropUpload);
        
    }

    dropUpload() {
        dyo.engine.loader.hide("Loader:53");
        dyo.engine.tutorial.dropUpload();
    }

    unblock() {
        $('.loader-container').removeEventListener('click', this.dropUpload);
    }

	render() {

        let content =  `
        <svg class="spinner" width="65px" height="65px" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
            <circle class="path" fill="none" stroke-width="6" stroke-linecap="round" cx="33" cy="33" r="30"></circle>
        </svg>
        `

		this.container.innerHTML = content;				
		
	}
	
}