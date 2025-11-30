import { Button, Drawer, ImageList, Select, Slider, TextField } from '../material/MaterialDesign.js';
import { Lang, Translate, $ } from '../Const.js';
import { Component } from '../material/Component.js';

export class Settings extends Component {

	constructor(data = {}) {
        super(data);

        dyo.settings = this;
        this.config = {};

        this.container = $("div", "add", "container-settings", this.stage);
        this.menu = new Drawer({ stage: this.container, toolbar_type: 1, title: this.title, id: "dyo_settings" });
        this.menu.render();

        this.container_settings = $("div", "add", "container-settings-internal", $("#dyo_settings-mdc-list"));
        this.container_buttons = $("div", "add", "container-buttons", $("#dyo_settings-mdc-list"));

        this.hide();

    }

    hide() {
		this.hideContainer(this.container);
    }

    show() {
		dyo.currentSection = "settings";
        this.showContainer(this.container);
    }

    update() {
        $("#dyo_settings_title", Translate(Lang.SETTINGS));
        $("#language_label", Translate(Lang.LANGUAGE));
        $("#currency_label", Translate(Lang.CURRENCY));
        $("#metric_label", Translate(Lang.METRIC));
        $("#dyo_button_settings_update_dense", Translate(Lang.SAVE));
        $("#back_to_menu_" + this.title, Translate(Lang.BACK_TO_DESIGN_MENU));
    }

    render() {

        let language = sessionStorage.getItem('settings_language');
        let language_id = this.getLanguageId(language);

        let currency = sessionStorage.getItem('settings_currency');
        let currency_id = this.getCurrencyId(currency);

        let metric = sessionStorage.getItem('settings_metric');
        let metric_id = this.getMetricId(metric);

        this.config.language = language;
        this.config.currency = currency;
        this.config.metric = metric;

        this.language = new Select({
            stage: this.container_settings,
            id: "dyo_select_language",
			data: this.languages,
            type: 1,
            selected: language_id,
			parentcss: "float: right",
            title: Lang.LANGUAGE
        });
        this.language.render();

        this.currency = new Select({
            stage: this.container_settings,
            id: "dyo_select_currency",
			data: this.currencies,
            type: 1,
            selected: currency_id,
			parentcss: "float: right",
            title: Lang.CURRENCY
        });
        this.currency.render();

        this.metric = new Select({
            stage: this.container_settings,
            id: "dyo_select_metric",
			data: this.metric_system,
            type: 1,
            selected: metric_id,
			parentcss: "float: right",
            title: Lang.METRIC
        });
        this.metric.render();

		this.save = new Button({
            stage: this.container_settings,
            id: "dyo_button_settings_update",
			type: 1,
			css: "margin-bottom: 20px !important; padding: 8px 16px !important;",
			title: Lang.SAVE
        });       
		this.save.render();
		
		this.events();
       
    }

	events() {
		$("#dyo_button_settings_update").addEventListener("click", () => {
            sessionStorage.setItem('settings_language', dyo.settings.config.language);
            sessionStorage.setItem('settings_currency', dyo.settings.config.currency);
            sessionStorage.setItem('settings_metric', dyo.settings.config.metric);
            dyo.config.checkSettings();
		});
	}
	
}