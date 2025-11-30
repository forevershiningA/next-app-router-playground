import {Drawer, Dialog, TextField, Select, Slider, List} from '../material/MaterialDesign.js';
import {Module} from '../Module.js';
import {Lang, Translate, $} from '../Const.js';

export class Tutorial extends Module {

	constructor(data = {}) {
		super();
		this.stage = data.stage;
		this.id = data.id;
        this.title = data.title;
		this.type = data.type;

        this.container = $("div", "add", "container-tutorial", this.stage);
        this.hide();

        this.tutorial_header = $("h4", "add", "mdc-typography--headline", this.container);
        this.tutorial_header.id = "tutorial-header";

        this.tutorial_description = $("p", "add", "mdc-typography--body1", this.container);
        this.tutorial_description.id = "tutorial-description";

        dyo.tutorial = this;
    }

    hide() {
        this.container.style.display = "none";
    }

    show(nr) {
        if (!this.block) {
            this.container.style.display = "block";
            nr = 1;
            $(".container-tutorial").style.top = ((nr * 50) + 50) / dyo.dpr + "px";
        }
    }

    get uploadStarted() {
        return this._uploadStarted;
    }

    set uploadStarted(state) {
        this._uploadStarted = state;
    }

    upload() {

        dyo.engine.popupActive = true;
        
        dyo.engine.dialog_resp.title = dyo.tutorial.photo_upload[0].title;
        dyo.engine.dialog_resp.body = dyo.tutorial.photo_upload[0].description;

		if (dyo.monument.id == 32) {
			dyo.engine.dialog_resp.body = Translate(Lang.UPLOADING_YOUR_IMAGE_FCP) + "<br/><br/>" + Translate(Lang.UPLOADING_YOUR_IMAGE_DESCRIPTION);
		}

        dyo.engine.dialog_resp.accept = Translate(Lang.UPLOAD);
        dyo.engine.dialog_resp.decline = Translate(Lang.CLOSE);
        dyo.engine.dialog_resp.action = dyo.engine.photos.hitUpload;
        dyo.engine.dialog_resp.render();
        dyo.engine.dialog_resp.show();

        if (dyo.template == 2) {
            let c = 'skinAU_efece0';
            $("#resp-header").classList.add(c);
            $("#resp-footer").classList.add(c);
        }
        
    }

    dropUpload() {
        this.uploadStarted = false;
        this.container.classList.remove("container-tutorial-centered");
        this.container.classList.add("container-tutorial");
        this.hide();
    }

    update() {
        
    }

    render() {
        
    }

    events() {

    }
	
}