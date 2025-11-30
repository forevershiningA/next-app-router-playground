import { Button, Radio, Select, TextField, Title } from './MaterialDesign.js';
import { Component } from './Component.js';
import { Lang, Translate, $ } from '../Const.js';
import { Order } from '../modules/Orders.js';

export class Dialog extends Component {

	constructor(data = {}) {
		super(data);
        this.placeholder = data.placeholder;
        this.multi_placeholder = data.multi_placeholder;
        this.enquiry_placeholder = data.enquiry_placeholder;
        this.msg_input_result = data.msg_input_result;
        this.description = data.description;
        this.body = data.body;
        this.decline = data.decline;
        this.accept = data.accept;
        this.action = data.action;
        if (data.last_action) {
            this.last_action = data.last_action;
        }

		this.container = document.createElement('div');
		this.container.classList.add("container");
        this.stage.appendChild(this.container);
                
    }

    set title(value) {
        this.setTitle(value);
    }

    get title() {
        return this.getTitle();
    }

    setTitle(value) {
        this._title = value;
    }

    getTitle() {
        return this._title;
    }

    set body(value) {
        this.setBody(value);
    }

    get body() {
        return this.getBody();
    }

    setBody(value) {
        this._body = value;
    }

    getBody() {
        return this._body;
    }

    set decline(value) {
        this.setDecline(value);
    }

    get decline() {
        return this.getDecline();
    }

    setDecline(value) {
        this._decline = value;
    }

    getDecline() {
        return this._decline;
    }

    set accept(value) {
        this.setAccept(value);
    }

    get accept() {
        return this.getAccept();
    }

    setAccept(value) {
        this._accept = value;
    }

    getAccept() {
        return this._accept;
    }

    set action(value) {
        this.setAction(value);
    }

    get action() {
        return this.getAction();
    }

    setAction(value) {
        this._action = value;
    }

    getAction() {
        return this._action;
    }

    set last_action(value) {
        this.setLastAction(value);
    }

    get last_action() {
        return this.getLastAction();
    }

    setLastAction(value) {
        this._last_action = value;
    }

    getLastAction() {
        return this._last_action;
    }

    showContainer() {
		this.container.style.display = "block";
    }

	render() {

        let content = '';
        let container_open = "";
        let container_close = `<div class="mdc-dialog__backdrop"></div></aside></div>`;
        let aside = `<aside id="${this.id}" class="mdc-dialog" role="alertdialog" aria-hidden="true" aria-labelledby="${this.id}-label" aria-describedby="${this.id}-description">`;
        let acceptClasses = "mdc-button mdc-dialog__footer__button mdc-button--raised mdc-button--padded";
        let acceptClasses2 = "accept_button mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--accept mdc-button--raised mdc-button--padded";
        let declineClasses = "mdc-button mdc-dialog__footer__button mdc-dialog__footer__button--cancel mdc-button--raised mdc-button--padded";
        let popup = '<div class="mdc-dialog__surface mdc-dialog__popup"';
        let dialog = '<div class="mdc-dialog__surface"';
        let header = '<header class="mdc-dialog__header"';
        let footer = '<footer class="mdc-dialog__footer"';
        let h2title = 'class="mdc-dialog__header__title';
        let overflow = 'style="overflow-y: auto; max-height: 75vh; margin-top: 0px;';
        let section = '<section class="mdc-dialog__body"';
        let btn = '<button type="button"';
        let g30 = '<div class="grid30"';
        let g50 = '<div class="grid50"';
        let p16 = 'style="padding: 16px !important;';

        if (dyo.engine.mobile) {
            if (dyo.engine.deviceType == "mobile") {
                container_open = '<div class="dyo-mobile">';
            }
        } else {
            container_open = '<div class="dyo-desktop">';
        }

        switch (this.type) {

            case 0:
                content = `
                ${container_open}
                ${aside}
                    ${dialog}>
                    ${header} id="resp-header">
                        <h2 id="${this.id}-label" ${h2title}">
                        ${this.title}
                        </h2>
                    </header>
                    ${section} id="${this.id}-description" style="color:#232323">
                    ${this.body}
                    </section>
                    ${footer} id="resp-footer">
                        ${btn} id="accept_button" class="${acceptClasses2}" ${p16}">${this.accept}</button>
                        ${btn} id="close_button" class="${declineClasses}" ${p16}">${this.decline}</button>
                    </footer>
                </div>
                ${container_close}
                `
                break;

            case 1:
                content = `
                ${container_open}
                ${aside}
                ${popup}>
                    ${header} id="my-account-login-header">
                    <h2 id="welcome-to-design-your-own" ${h2title}">
                    ${Translate(Lang.WELCOME_TO_DYO)}
                    </h2>
                    </header>
                    ${section} id="${this.id}-description" ${overflow}">
                    <div id="mobile_account_menu" style="margin: 20px 0px;">
                    <button
                        id="dyo_mobile_menu_register" 
                        class="mdc-button mdc-button--padded" 
                        ${p16}" />
                        ${Translate(Lang.REGISTER)}
                    </button>
                    <button 
                        id="dyo_mobile_menu_login" 
                        class="mdc-button mdc-button--padded" 
                        ${p16}" />
                        ${Translate(Lang.LOGIN)}
                    </button>
                    </div>
                    ${g50} id="dyo_register_container">
                    </div>
                    ${g50} id="dyo_login_container">
                    </div>
                    </section>
                    ${footer} id="my-account-login-footer">
                    ${g50} style="width:49%;">
                    </div>
                    ${g50} style="width:49%;text-align: right;">
                    ${btn} id="closeButton" class="${declineClasses}" ${p16}">${this.decline}</button>
                    </div>
                    </footer>
                </div>
                ${container_close}
                `
                break;

            case 2:
                content = `
                ${container_open}
                ${aside}
                ${dialog} style="width: 40%; min-width: 300px;">
                    ${header}>
                    <h2 id="${this.id}-label" ${h2title}">
                    ${this.title}
                    </h2>
                    </header>
                    ${section} id="${this.id}-description" ${overflow} padding-bottom: 10px;">
                    <div id="dyo_single_container">
                    </div>
                    </section>
                    ${footer}>
                    ${btn} id="dyo_dialog_accept" class="${acceptClasses}" ${p16}">${this.accept}</button>
                    ${btn} class="${declineClasses}" ${p16}">${this.decline}</button>
                    </footer>
                </div>
                ${container_close}
                `
                break;

            case 21:
                content = `
                ${container_open}
                ${aside}
                ${dialog} style="width: 50%; min-width: 300px;">
                    ${header} id="single-layout-header">
                    <h2 id="${this.id}-label" ${h2title}">
                    ${this.title}
                    </h2>
                    </header>
                    ${section} id="${this.id}-description" ${overflow} padding-bottom: 10px;">
                    <div align="center"><img id="design-send-img" src="" style="margin: 20px 0px;"/></div>
                    <div id="dyo_single_container_1">
                    </div>
                    </section>
                    ${footer} id="single-layout-footer">
                    ${btn} id="dyo_dialog_accept_email_send" class="${acceptClasses}" ${p16}">${this.accept}</button>
                    ${btn} class="${declineClasses}" ${p16}">${this.decline}</button>
                    </footer>
                </div>
                ${container_close}
                `
                break;

            case 22:
                if (dyo.engine.deviceType == "mobile") {
                    content = `
                    ${container_open}
                    ${aside}
                    ${dialog}>
                        ${header} id="quick-enquiry-header">
                        <h2 id="${this.id}-label" ${h2title}">
                        ${this.title}
                        </h2>
                        </header>
                        ${section} id="${this.id}-description" ${overflow} padding-bottom: 10px;">
                        <div align="center"><img id="design-send-img" style="margin-top: 20px; max-width: 240px;" src="" /></div>
                        <p id="enquiry_desc">${Translate(Lang.QUICK_ENQUIRY_DESCRIPTION)}</p>
                        <div id="dyo_single_container_2" style="padding-top: 20px;">
                        </div>
                        </section>
                        ${footer} id="quick-enquiry-footer">
                        ${btn} id="dyo_dialog_accept_send" class="${acceptClasses}" ${p16}">${this.accept}</button>
                        ${btn} class="${declineClasses}" ${p16}">${this.decline}</button>
                        </footer>
                    </div>
                    ${container_close}
                    `
                } else {
                    content = `
                    ${container_open}
                    ${aside}
                    ${dialog} style="width: 80%; min-width: 300px; max-width: 800px;">
                        ${header} id="quick-enquiry-header">
                        <h2 id="${this.id}-label" ${h2title}">
                        ${this.title}
                        </h2>
                        </header>
                        ${section} id="${this.id}-description" style="overflow-y: hidden; max-height: 50vh; margin-top: 0px; padding-bottom: 10px;">
                        <div class="quick-enquiry-left"><img id="design-send-img" style="max-width: 240px;" src="" /><p id="enquiry_desc">${Translate(Lang.QUICK_ENQUIRY_DESCRIPTION)}</p></div>
                        <div class="quick-enquiry-right" id="dyo_single_container_2">
                        </div>
                        </section>
                        ${footer} id="quick-enquiry-footer">
                        ${btn} id="dyo_dialog_accept_send" class="${acceptClasses}" ${p16}">${this.accept}</button>
                        ${btn} class="${declineClasses}" ${p16}">${this.decline}</button>
                        </footer>
                    </div>
                    ${container_close}  
                    `
                }
                break;

            case 3:
                let padding = "16px 16px 16px 0px";
                if (dyo.engine.mobileDevice) {
                    if (dyo.engine.deviceType == "mobile") {
                        padding = "16px 0px";
                    }
                }
                content = `
                ${container_open}
                ${aside}
                ${dialog}>
                    ${header} id="my-account-design-header">
                    <h2 id="${this.id}-label" ${h2title}">
                    ${this.title}
                    </h2>
                    </header>
                    ${section} style="overflow-y: auto; max-height: 55vh; margin-top: 0px;">
                    <div id="dyo_account_share_container" style="height:auto !important"></div>
                    <div id="${this.id}-description"></div>
                    ${this.body}
                    </section>
                    ${footer} id="my-account-design-footer" style="padding: 0px; background-color:#f6f6f6;">
                    <div id="dyo_account_container">
                    </div>
                    <button id="${this.id}" class="mdc-button mdc-dialog__footer__button--cancel" style="float:right;padding: ${padding} !important;">${Translate(Lang.CLOSE)}</button>
                    </footer>
                </div>
                ${container_close}
                `
                break;
            
            case 4:
                content = `
                ${container_open}
                ${aside}
                ${popup}>
                    ${header} id="my-account-details-header">
                        <h2 id="${this.id}-label" ${h2title}">${this.title}</h2>
                    </header>
                    ${section} id="${this.id}-description" style="overflow-y: hidden; max-height: 50vh; margin-top: 0px;">
                        <p class="mdc-typography" id="${this.id}-label-description" style="margin-bottom: 30px;">${this.description}</p>
                        ${g50} id="dyo_left_container">
                        </div>
                        ${g50} id="dyo_right_container">
                        </div>
                    </section>
                    ${footer} id="my-account-details-footer">
                        ${btn} id="dyo_dialog_accept_details" class="${acceptClasses}" ${p16}">${this.accept}</button>
                        ${btn} class="${declineClasses}" ${p16}">${this.decline}</button>
                    </footer>
                </div>
                ${container_close}
                `
                break;

            case 5:
                content = `
                ${container_open}
                ${aside}
                ${popup}>
                    ${header} id="my-account-invoice-header">
                        <h2 id="${this.id}-label" ${h2title}">${this.title}</h2>
                    </header>
                    ${section} id="${this.id}-description" ${overflow}">
                        <p class="mdc-typography" id="${this.id}-label-description" style="margin-bottom: 30px;">${this.description}</p>
                        ${g50} id="dyo_left_container_invoice_details">
                        </div>
                        ${g50} id="dyo_right_container_invoice_details">
                        </div>
                    </section>
                    ${footer} id="my-account-invoice-footer">
                        ${btn} id="dyo_dialog_accept_invoice" class="${acceptClasses}" ${p16}">${this.accept}</button>
                        ${btn} class="${declineClasses}" ${p16}">${this.decline}</button>
                    </footer>
                    
                </div>
                ${container_close}
                `
                break;

            case 6:
                content = `
                ${container_open}
                ${aside}
                ${popup} style="width:80%;max-width:900px;">
                    ${header} ${this.desktop_style} id="my-account-delivery-header">
                        <h4 id="${this.id}-label" ${h2title}">${this.title}</h4>
                        <div id="dyo_account_payment_container"></div>
                    </header>
                    ${section} id="${this.id}-description" style="overflow-y: auto; max-height: 60vh; margin-top: 0px;">
                        <p class="mdc-typography" id="${this.id}-label-description" style="margin-bottom: 30px;">${this.description}</p>
                        ${g30} id="dyo_left_container_delivery_details">
                        </div>
                        ${g30} id="dyo_middle_container_delivery_details">
                        </div>
                        ${g30} id="dyo_right_container_delivery_details">
                        </div>
                    </section>
                    ${footer} id="my-account-delivery-footer">
                        ${btn} id="dyo_dialog_accept_delivery" class="${acceptClasses}" ${p16}">${this.accept}</button>
                        ${btn} class="${declineClasses}" ${p16}">${this.decline}</button>
                    </footer>
                </div>
                ${container_close}
                `
                break;

            case 7:
                content = `
                ${container_open}
                ${aside}
    
                ${popup}>
                    ${header}>
                    <h2 ${h2title}">
                    Design Your Own
                    </h2>
                    </header>
                    ${section} id="${this.id}-description" ${overflow}">
                    ${g50} id="dyo_reset_container_left">
                    </div>
                    ${g50} id="dyo_reset_container_right">
                    </div>
                    </section>
                    ${footer}>
                    ${btn} class="${declineClasses}" ${p16}">${this.decline}</button>
                    </footer>
                </div>
                ${container_close}
                `
                break;

            case 8:
                content = `
                ${aside}
                ${dialog}>
                    ${header} id="dialog-header">
                        <h2 id="${this.id}-label" ${h2title}">
                        ${this.title}
                        </h2>
                    </header>
                    ${section} id="${this.id}-description">
                    ${this.body}
                    </section>
                    ${footer} id="dialog-footer">
                        ${btn} id="accept_button" class="${acceptClasses2}" ${p16}">${this.accept}</button>
                        ${btn} class="${declineClasses}" ${p16}">${this.decline}</button>
                    </footer>
                </div>
                ${container_close}
                `
                break;

            case 9:
                content = `
                ${aside}
                ${dialog} style="width: 40%; min-width: 300px;">
                    ${header} id="save-header">
                    <h2 id="${this.id}-label" ${h2title}">
                    ${this.title}
                    </h2>
                    </header>
                    ${section} id="${this.id}-description" ${overflow} padding-bottom: 10px;">
                    <div id="dyo_single_container_9">
                    </div>
                    </section>
                    ${footer} id="save-footer">
                        ${btn} id="dyo_dialog_accept" class="${acceptClasses}" ${p16}">${this.accept}</button>
                        ${btn} class="${declineClasses}" ${p16}">${this.decline}</button>
                    </footer>
                </div>
                ${container_close}
                `
                break;

            case 90:

                content = `
                ${aside}
                ${dialog} style="width: 40%; min-width: 300px;">
                    ${header} id="promo-header">
                    <h2 id="${this.id}-label" ${h2title}">
                    ${this.title}
                    </h2>
                    </header>
                    ${section} id="${this.id}-description" ${overflow} padding-bottom: 10px;">
                    <div id="dyo_single_container_90">
                    </div>
                    </section>
                    ${footer} id="promo-footer">
                        ${btn} id="dyo_dialog_accept" class="${acceptClasses}" ${p16}">${this.accept}</button>
                        ${btn} class="${declineClasses}" ${p16}">${this.decline}</button>
                    </footer>
                </div>
                ${container_close}
                `
                break;

        }

        this.container.innerHTML = content;

        if (this.type == 1) {

            this.container_login = $("div", "add", "container", $('#dyo_login_container'));
            this.container_register = $("div", "add", "container", $('#dyo_register_container'));

            this.login_title = new Title({
                stage: this.container_login,
                id: "dyo_login_title",
                css: "margin: 0px 0px 10px 0px; font-size: 1em;color:#000;",
                type: 1,
                title: Translate(Lang.LOGIN_RETURNING_CUSTOMERS)
            });
            this.login_title.render();
           
            this.login_user = new TextField({
                stage: this.container_login,
                id: "dyo_login",
                type: 1,
                dataType: "email",
                title: Lang.EMAIL
            });
            this.login_user.render();
    
            this.login_password = new TextField({
                stage: this.container_login,
                id: "dyo_password",
                type: 2,
                dataType: "text",
                title: Lang.PASSWORD
            });
            this.login_password.render();

            this.login_button = new Button({
                stage: this.container_login,
                id: "dyo_button_login",
                type: 1,
                icon: 'save',
                title: Lang.LOGIN
            });       
            this.login_button.render();

            this.reset_button = new Button({
                stage: this.container_login,
                id: "dyo_button_reset",
                type: 1,
                icon: 'save',
                title: Lang.RESET
            });       
            this.reset_button.render();
            this.reset_button.hide();

            this.reset_password_button = new Button({
                stage: this.container_login,
                id: "dyo_button_reset_password",
                type: 6,
                icon: 'lock_reset',
                title: Lang.RESET_PASSWORD
            });       
            this.reset_password_button.render();

            this.login_to_account_button = new Button({
                stage: this.container_login,
                id: "dyo_button_login_to_account",
                type: 6,
                icon: 'login',
                title: Lang.LOGIN_TO_ACCOUNT
            });       
            this.login_to_account_button.render();
            this.login_to_account_button.hide();

            this.login_info = new TextField({
                stage: this.container_login,
                id: "dyo_login_info",
                type: 3,
                dataType: "text",
                title: Lang.LOGIN_INFO
            });
            this.login_info.render();
            this.login_info.hide();

            
            let title = Translate(Lang.REGISTER);

            this.register_title = new Title({
                stage: this.container_register,
                id: "dyo_register_title",
                css: "margin: 0px 0px 10px 0px; font-size: 1em;color:#000;",
                type: 1,
                title: title + " (" + Translate(Lang.NEW_CUSTOMER) + ")"
            });
            this.register_title.render();

            this.register_user = new TextField({
                stage: this.container_register,
                id: "dyo_register_login",
                type: 1,
                dataType: "email",
                title: Lang.EMAIL
            });
            this.register_user.render();
    
            this.register_password = new TextField({
                stage: this.container_register,
                id: "dyo_register_password",
                type: 2,
                dataType: "text",
                title: Lang.PASSWORD
            });
            this.register_password.render();
    
            this.register_password = new TextField({
                stage: this.container_register,
                id: "dyo_register_repeat_password",
                type: 2,
                dataType: "text",
                title: Lang.REPEAT_PASSWORD
            });
            this.register_password.render();

            this.register_button = new Button({
                stage: this.container_register,
                id: "dyo_button_register",
                type: 1,
                icon: 'save',
                css: "margin: 0px !important;",
                title: Lang.REGISTER
            });       
            this.register_button.render();

            this.register_info = new TextField({
                stage: this.container_register,
                id: "dyo_register_info",
                type: 3,
                dataType: "text",
                title: Lang.REGISTER_INFO
            });
            this.register_info.render();
            this.register_info.hide();

        }

        if (this.type == 2) {

            this.container_single = $("div", "add", "container", $('#dyo_single_container'));

            this.input_single = new TextField({
                stage: this.container_single,
                id: "input_" + this.id,
                type: 4,
                dataType: "text",
                title: this.placeholder
            });
            this.input_single.render();
            
        }

        if (this.type == 21) {

            this.container_single = $("div", "add", "container", $('#dyo_single_container_1'));

            this.input_single = new TextField({
                stage: this.container_single,
                id: "input_" + this.id,
                type: 4,
                dataType: "email",
                title: this.placeholder
            });
            this.input_single.render();

            this.input_single_phone = new TextField({
                stage: this.container_single,
                id: "multi_" + this.id,
                type: 4,
                dataType: "text",
                title: this.multi_placeholder
            });
            this.input_single_phone.render();

            this.input_result = new TextField({
                stage: this.container_single,
                id: "info_" + this.id,
                type: 3,
                dataType: "text",
                title: this.msg_input_result
            });
            this.input_result.render();
            this.input_result.hide();

            dyo.engine.dialog.input_result = this.input_result;

        }

        if (this.type == 22) {

            this.container_single = $("div", "add", "container", $('#dyo_single_container_2'));

            this.input_single = new TextField({
                stage: this.container_single,
                id: "input_" + this.id,
                type: 4,
                dataType: "email",
                title: this.placeholder
            });
            this.input_single.render();

            this.input_single_phone = new TextField({
                stage: this.container_single,
                id: "multi_" + this.id,
                type: 4,
                dataType: "tel",
                title: this.multi_placeholder,
                maxLength: 20
            });
            this.input_single_phone.render();

            this.input_multi_enquiry = new TextField({
                stage: this.container_single,
                id: "enquiry_" + this.id,
                type: 9,
                dataType: "text",
                title: this.enquiry_placeholder
            });
            this.input_multi_enquiry.render();

            this.input_result = new TextField({
                stage: this.container_single,
                id: "info_" + this.id,
                type: 3,
                dataType: "text",
                title: this.msg_input_result
            });
            this.input_result.render();
            this.input_result.hide();

            dyo.engine.dialog.input_result = this.input_result;

        }

        if (this.type == 3) {

            this.container_account = $("div", "add", "container", $('#dyo_account_container'));
            this.container_account_share = $("form", "add", "", $('#dyo_account_share_container'));
            this.container_account_share.setAttribute('id',"shareForm");
            this.container_account_share.setAttribute('method',"get");
            this.container_account_share.setAttribute('target',"blank");

            this.share_radio_button = new Radio({
                stage: this.container_account_share,
                id: "dyo_radio_button_share",
                data: dyo.account.getSocial(),
                type: 1,
                title: Lang.SHARE
            });
            this.share_radio_button.render();

            this.share_button = new Button({
                stage: this.container_account_share,
                id: "dyo_button_share",
                type: 1,
                dataType: "submit",
                css: "margin-top: 5px !important;",
                parentcss: "float: right",
                title: Lang.SHARE
            });
            this.share_button.render();

            // Button - Pdf
            this.pdf_button = new Button({
                stage: this.container_account,
                id: "dyo_button_pdf",
                type: 1,
                icon: 'pdf',
                title: Lang.PDF
            });       
            this.pdf_button.render();

            // Button - Load
            this.load_button = new Button({
                stage: this.container_account,
                id: "dyo_button_load",
                type: 1,
                icon: 'cloud_upload',
                title: Lang.EDIT
            });       
            this.load_button.render();

            // Button - Order
            this.order_button = new Button({
                stage: this.container_account,
                id: "dyo_button_order",
                type: 1,
                icon: 'shop',
                title: Lang.BUY
            });
            this.order_button.render();

            // Button - Delete
            this.delete_button = new Button({
                stage: this.container_account,
                id: "dyo_button_delete",
                type: 1,
                icon: 'remove',
                title: Lang.DELETE
            });
            this.delete_button.render();

        }

        // My Account - Update Account Details

        if (this.type == 4) {

            this.container_left = $("div", "add", "container", $('#dyo_left_container'));
            this.container_right = $("div", "add", "container", $('#dyo_right_container'));

            // Input Text Field - Email
            this.email = new TextField({
                stage: this.container_left,
                id: "dyo_account_email",
                type: 6,
                dataType: "disabled",
                title: Lang.EMAIL_LOGIN,
                value: sessionStorage.getItem('customer_email')
            });
            this.email.render();

            // Input Text Field - First Name
            this.first_name = new TextField({
                stage: this.container_left,
                id: "dyo_account_first_name",
                type: 6,
                dataType: "text",
                title: Lang.FIRST_NAME,
                value: sessionStorage.getItem('customer_firstname'),
                maxLength: 30
            });
            this.first_name.render();

            // Input Text Field - Last Name
            this.last_name = new TextField({
                stage: this.container_left,
                id: "dyo_account_last_name",
                type: 6,
                dataType: "text",
                title: Lang.LAST_NAME,
                value: sessionStorage.getItem('customer_lastname'),
                maxLength: 30
            });
            this.last_name.render();

            // Input Text Field - Phone
            this.mobile = new TextField({
                stage: this.container_left,
                id: "dyo_account_mobile",
                type: 6,
                dataType: "tel",
                title: Lang.MOBILE,
                value: sessionStorage.getItem('customer_mobile')
            });
            this.mobile.render();

            // Input Text Field - Old Password
            this.old_password = new TextField({
                stage: this.container_right,
                id: "dyo_account_old_password",
                type: 6,
                dataType: "text",
                title: Lang.OLD_PASSWORD
            });
            this.old_password.render();

            // Input Text Field - Password
            this.password = new TextField({
                stage: this.container_right,
                id: "dyo_account_password",
                type: 6,
                dataType: "text",
                title: Lang.NEW_PASSWORD
            });
            this.password.render();

            // Input Text Field - Repeat Password
            this.repeat_password = new TextField({
                stage: this.container_right,
                id: "dyo_account_password_repeat",
                type: 6,
                dataType: "text",
                title: Lang.REPEAT_PASSWORD
            });
            this.repeat_password.render();

            // Register Info Text Field
            this.change_password = new TextField({
                stage: this.container_right,
                id: "dyo_change_password",
                type: 3,
                dataType: "text",
                title: Lang.CHANGE_PASSWORD
            });
            this.change_password.render();
            this.change_password.hide();

        }

        // My Account - Update Invoice Details

        if (this.type == 5) {

            this.container_left = $("div", "add", "container", $('#dyo_left_container_invoice_details'));
            this.container_right = $("div", "add", "container", $('#dyo_right_container_invoice_details'));

            // Input Text Field - Trading Name
            this.trading_name = new TextField({
                stage: this.container_left,
                id: "dyo_account_trading_name",
                type: 6,
                dataType: "text",
                title: Lang.TRADING_NAME,
                value: sessionStorage.getItem('customer_tradingname')
            });
            this.trading_name.render();

            // Input Text Field - Business Name
            this.business_name = new TextField({
                stage: this.container_left,
                id: "dyo_account_business_name",
                type: 6,
                dataType: "text",
                title: Lang.BUSINESS_NAME,
                value: sessionStorage.getItem('customer_businessname')
            });
            this.business_name.render();

            // Input Text Field - Last Name
            this.abn = new TextField({
                stage: this.container_left,
                id: "dyo_account_abn",
                type: 6,
                dataType: "text",
                title: Lang.ABN,
                value: sessionStorage.getItem('customer_abn')
            });
            this.abn.render();

            // Input Text Field - Phone
            this.phone = new TextField({
                stage: this.container_left,
                id: "dyo_account_phone",
                type: 6,
                dataType: "tel",
                title: Lang.CONTACT_NUMBER,
                value: sessionStorage.getItem('customer_phone')
            });
            this.phone.render();

            // Input Text Field - Phone
            this.website = new TextField({
                stage: this.container_left,
                id: "dyo_account_website",
                type: 6,
                dataType: "url",
                title: Lang.WEBSITE,
                value: sessionStorage.getItem('customer_website')
            });
            this.website.render();

            // Input Text Field - Address
            this.address = new TextField({
                stage: this.container_right,
                id: "dyo_account_address",
                type: 6,
                dataType: "text",
                title: Lang.ADDRESS,
                value: sessionStorage.getItem('customer_address')
            });
            this.address.render();

            // Input Text Field - Place
            this.address = new TextField({
                stage: this.container_right,
                id: "dyo_account_place",
                type: 6,
                dataType: "text",
                title: Lang.CITY,
                value: sessionStorage.getItem('customer_place')
            });
            this.address.render();

            // Input Text Field - Post Code
            this.postcode = new TextField({
                stage: this.container_right,
                id: "dyo_account_postcode",
                type: 6,
                dataType: "text",
                title: Lang.POSTCODE,
                value: sessionStorage.getItem('customer_postcode')
            });
            this.postcode.render();

            // Input Text Field - State
            this.state = new TextField({
                stage: this.container_right,
                id: "dyo_account_state",
                type: 6,
                dataType: "text",
                title: Lang.STATE,
                value: sessionStorage.getItem('customer_state')
            });
            this.state.render();

            // Input Text Field - Country
            this.country = new TextField({
                stage: this.container_right,
                id: "dyo_account_country",
                type: 6,
                dataType: "text",
                title: Lang.COUNTRY,
                value: sessionStorage.getItem('customer_country')
            });
            this.country.render();

        }

        // My Account - Update Delivery Details
        if (this.type == 6) {

            this.container_left = $("div", "add", "container", $('#dyo_left_container_delivery_details'));
            this.container_middle = $("div", "add", "container", $('#dyo_middle_container_delivery_details'));
            this.container_right = $("div", "add", "container", $('#dyo_right_container_delivery_details'));
            this.payment_container = $("div", "add", "", $('#dyo_account_payment_container'));

            // Input Text Field - First Name
            this.first_name = new TextField({
                stage: this.container_middle,
                id: "dyo_account_order_first_name",
                type: 6,
                dataType: "text",
                title: Lang.FIRST_NAME,
                value: sessionStorage.getItem('customer_firstname')
            });
            this.first_name.render();

            // Input Text Field - Last Name
            this.last_name = new TextField({
                stage: this.container_middle,
                id: "dyo_account_order_last_name",
                type: 6,
                dataType: "text",
                title: Lang.LAST_NAME,
                value: sessionStorage.getItem('customer_lastname')
            });
            this.last_name.render();

            // Input Text Field - Phone
            this.mobile = new TextField({
                stage: this.container_middle,
                id: "dyo_account_order_mobile",
                type: 6,
                dataType: "text",
                title: Lang.MOBILE,
                value: sessionStorage.getItem('customer_mobile')
            });
            this.mobile.render();

            // Register Info Text Field
            this.delivery_details_info = new TextField({
                stage: this.container_right,
                id: "dyo_delivery_details_info",
                type: 3,
                dataType: "text",
                title: Lang.DELIVERY_DETAILS_INFO
            });
            this.delivery_details_info.render();
            this.delivery_details_info.hide();

            // Radio - Payment Method
            this.payment = new Radio({
                stage: this.container_right,
                id: "dyo_payment_methods",
                data: dyo.account.getPayments(),
                type: 0,
                title: Lang.PAYMENT_METHOD
            });
            this.payment.render();

            this.payment_title = new Title({
                stage: this.container_right,
                id: "dyo_payment_info",
                css: "margin: 10px 0px 10px 0px; font-size: 1em;",
                type: 1,
                title: Translate(Lang.WE_WILL_COMMENCE_WITH_YOUR_ORDER)
            });
            this.payment_title.render();

            // Input Text Field - Address
            this.address = new TextField({
                stage: this.container_left,
                id: "dyo_account_order_address",
                type: 6,
                dataType: "text",
                title: Lang.ADDRESS,
                value: sessionStorage.getItem('customer_address')
            });
            this.address.render();

            // Input Text Field - Place
            this.address = new TextField({
                stage: this.container_left,
                id: "dyo_account_order_place",
                type: 6,
                dataType: "text",
                title: Lang.CITY,
                value: sessionStorage.getItem('customer_place')
            });
            this.address.render();

            // Input Text Field - Post Code
            this.postcode = new TextField({
                stage: this.container_left,
                id: "dyo_account_order_postcode",
                type: 6,
                dataType: "text",
                title: Lang.POSTCODE,
                value: sessionStorage.getItem('customer_postcode')
            });
            this.postcode.render();

            // Input Text Field - State
            this.state = new TextField({
                stage: this.container_left,
                id: "dyo_account_order_state",
                type: 6,
                dataType: "text",
                title: Lang.STATE,
                value: sessionStorage.getItem('customer_state')
            });
            this.state.render();

            // Input Text Field - Country
            this.country = new TextField({
                stage: this.container_left,
                id: "dyo_account_order_country",
                type: 6,
                dataType: "text",
                title: Lang.COUNTRY,
                value: sessionStorage.getItem('customer_country')
            });
            this.country.render();

            // Input Text Field - Comments
            this.comments = new TextField({
                stage: this.container_middle,
                id: "dyo_account_order_comments",
                type: 11,
                dataType: "text",
                title: Lang.COMMENTS,
                data: Lang.REQUIREMENTS
            });
            this.comments.render();

            $("#dyo_account_order_comments").style.width = "215px";

            this.login_title = new Title({
                stage: this.container_right,
                id: "dyo_delivery_methods",
                css: "margin: 10px 20px 10px 0px; font-size: 1em;",
                type: 1,
                title: Translate(Lang.SOME_CEMETERIES)
            });
            this.login_title.render();

        }

        // Reset Password
        if (this.type == 7) {

            this.container_login = $("div", "add", "container", $('#dyo_reset_container_left'));
            this.container_register = $("div", "add", "container", $('#dyo_reset_container_right'));

            this.reset_password_title = new Title({
                stage: this.container_login,
                id: "dyo_reset_title",
                type: 1,
                css: "margin: 10px 0px 20px 0px",
                title: Translate(Lang.RESET_PASSWORD)
            });
            this.reset_password_title.render();

            // Input Text Field - Customer Data
            this.customer_data = new Title({
                stage: this.container_register,
                id: "dyo_reset_password_customer_data",
                type: 2,
                title: Translate(Lang.CUSTOMER),
                css: "margin: 10px 0px 20px 0px",
                description: sessionStorage.getItem('customer_data')
            });
            this.customer_data.render();
           
            // Input Text Field - Login
            this.reset_password_login_user = new TextField({
                stage: this.container_login,
                id: "dyo_reset_password_login",
                type: 1,
                dataType: "text",
                title: Lang.LOGIN_EMAIL,
                css: "margin-top: 120px",
                value: sessionStorage.getItem('reset_password_email')
            });
            this.reset_password_login_user.render();
    
            // Input Text Field - Password
            this.reset_password_login_password = new TextField({
                stage: this.container_login,
                id: "dyo_reset_password_password",
                type: 2,
                dataType: "text",
                title: Lang.NEW_PASSWORD
            });
            this.reset_password_login_password.render();

            // Input Text Field - Repeat Password
            this.register_password = new TextField({
                stage: this.container_login,
                id: "dyo_reset_password_repeat_password",
                type: 2,
                dataType: "text",
                title: Lang.REPEAT_PASSWORD
            });
            this.register_password.render();

            // Register Info Text Field
            this.reset_info = new TextField({
                stage: this.container_login,
                id: "dyo_reset_password_register_info",
                type: 3,
                dataType: "text",
                title: Lang.RESET_INFO
            });
            this.reset_info.render();
            this.reset_info.hide();

            // Button - Login
            this.reset_password_login_button = new Button({
                stage: this.container_login,
                id: "dyo_button_reset_password_reset",
                type: 1,
                icon: 'save',
                title: Lang.RESET
            });       
            this.reset_password_login_button.render();

        }

        if (this.type == 9) {

            this.container_single = $("div", "add", "container", $('#dyo_single_container_9'));

            // Input Text Field - Enter Name
            this.input_single = new TextField({
                stage: this.container_single,
                id: "input_" + this.id,
                type: 4,
                dataType: "text",
                title: this.placeholder
            });
            this.input_single.render();
            
        }

        if (this.type == 90) {

            this.container_single = $("div", "add", "container", $('#dyo_single_container_90'));

            // Input Text Field - Enter Name
            this.input_single = new TextField({
                stage: this.container_single,
                id: "input_" + this.id,
                type: 4,
                dataType: "text",
                title: this.placeholder,
                value: dyo.engine.promoCodeValue
            });
            this.input_single.render();
            
        }

		this.events();
		
	}

	events() {

        this.dialog = null;
        this.dialog = new mdc.dialog.MDCDialog($('#' + this.id));

        let self = this;
        this.dialog.listen('MDCDialog:accept', function() {

            if (dyo.engine.mobileDevice) {
                if (dyo.engine.deviceType == "mobile") {
                    if (window.matchMedia("(orientation: portrait)").matches) {
                        dyo.engine.canvas.swipeArrow.show();
                    }
                }
            }
            if (self.action) {
                self.action();
            }

        });
        
        this.dialog.listen('MDCDialog:cancel', function() {

            if (dyo.engine.mobileDevice) {
                if (dyo.engine.deviceType == "mobile" || dyo.engine.deviceType == "tablet") {
                    if (window.matchMedia("(orientation: portrait)").matches) {
                        dyo.engine.canvas.swipeArrow.show();
                    }
                }
            }

            let href = dyo.currentSection;

            switch (dyo.currentSection) {
                default:
                    document.location.href = "#design-menu";
                    break;
                case "Borders":
                    document.location.href = "#select-border";
                    break;        
                case "Shapes":
                    document.location.href = "#select-shapes";
                    break;        
                case "FixingSystem":
                    document.location.href = "#select-fixing-system";
                    break;    
                case "Installations":
                    document.location.href = "#select-installations";
                    break;        
                case "Materials":

                    if (window.location.href.indexOf("select-material-image") == -1) {
                        document.location.href = "#select-material";
                    } else {
                        document.location.href = "#select-material-image";
                    }
                    break;
                case "Emblems": case "Inscriptions": case "Motifs": case "Photos":
                    if (dyo.last_url != undefined) {
						document.location.href = "#" + dyo.last_url;
					} else {
						document.location.href = "#design-menu";
					}
                    break;    
                case "Settings":
                    document.location.href = "#settings";
                    break;
                case "Products":
                    document.location.href = "#select-product";
                    break;
                case "Sizes":
                    document.location.href = "#select-size";
                    break;
                case "Crop":
                    document.location.href = "#crop-photo";
                    break;
                case "Account":
                    if (document.location.href.indexOf("your-orders") > -1) {
                        document.location.href = "#your-orders";
                    } else if (document.location.href.indexOf("saved-designs") > -1) {
                        document.location.href = "#saved-designs";
                    } else {
                        document.location.href = "#my-account";
                    }
                    break;
            }

        });

        if (this.type == 1) {
            let self = this;
            self.login_view = 0;
            $('#dyo_button_login').addEventListener('click', (e) => { 
                dyo.engine.login();
            });
            $('#dyo_login').addEventListener('focus', (e) => { 
                $('#dyo_login').addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        switch (self.login_view) {
                            case 0:
                                dyo.engine.login();
                                break;
                            case 1:
                                dyo.engine.reset_password();
                                break;
                        }
                    }
                });
            });
            $('#dyo_password').addEventListener('focus', (e) => { 
                $('#dyo_password').addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        dyo.engine.login();
                    }
                });
            });
            $('#dyo_button_reset_password').addEventListener('click', (e) => { 
                self.login_view = 1;
                dyo.engine.login_view(1);
            });
            $('#dyo_button_login_to_account').addEventListener('click', (e) => { 
                self.login_view = 0;
                dyo.engine.login_view(0);
            });
            $('#dyo_button_reset').addEventListener('click', (e) => { 
                dyo.engine.reset_password();
            });
            $('#dyo_button_register').addEventListener('click', (e) => { 
                dyo.engine.register();
            });
            $('#dyo_register_login').addEventListener('focus', (e) => { 
                $('#dyo_register_login').addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        dyo.engine.register();
                    }
                });
            });
            $('#dyo_register_password').addEventListener('focus', (e) => { 
                $('#dyo_register_password').addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        dyo.engine.register();
                    }
                });
            });
            $('#dyo_register_repeat_password').addEventListener('focus', (e) => { 
                $('#dyo_register_repeat_password').addEventListener('keypress', function (e) {
                    if (e.key === 'Enter') {
                        dyo.engine.register();
                    }
                });
            });
        }

        if (this.type == 2) {
            $('#dyo_dialog_accept').addEventListener('click', (e) => { 
                if (self.action) {
                    self.action();
                }
            });
        }

        if (this.type == 21) {
            $('#dyo_dialog_accept_email_send').addEventListener('click', (e) => { 
                if (self.action) {
                    self.action();
                }
            });
        }

        if (this.type == 22) {
            $('#dyo_dialog_accept_send').addEventListener('click', (e) => { 
                if (self.action) {
                    self.action();
                }
            });
        }

        if (this.type == 3) {
            $('#dyo_button_share').addEventListener('click', (e) => { 
                dyo.account.shareDesign(e);
            });
            
            $('#dyo_button_order').addEventListener('click', (e) => { 
                $('#account-popup').style.visibility = 'hidden';
                dyo.account.orderDesign();
            });
            $('#dyo_button_load').addEventListener('click', (e) => { 
                self.hide();
                dyo.account.hide();
                dyo.design.loadDesign();
            });
            $('#dyo_button_pdf').addEventListener('click', (e) => { 

                let href = window.location.href.split("#")[1];

                switch (href) {
                    default: case "saved-designs": case "my-account":
                        dyo.design.downloadAvailablePDF(0);
                        break;
                    case "your-orders":
                        dyo.design.downloadAvailablePDF(1);
                        break;
                }

            });
            $('#dyo_button_delete').addEventListener('click', (e) => { 
                self.hide();
                dyo.account.hide();
                dyo.design.deleteDesign();
            });

        }

        if (this.type == 4) {
            $('#dyo_dialog_accept_details').addEventListener('click', (e) => { 
                dyo.account.updateAccountDetails();
            });
        }

        if (this.type == 5) {
            $('#dyo_dialog_accept_invoice').addEventListener('click', (e) => { 
                dyo.account.updateInvoiceDetails();
            });
        }

        if (this.type == 6) {
            $('#dyo_dialog_accept_delivery').addEventListener('click', (e) => { 
                Order();
            });
        }

        if (this.type == 7) {
            $('#dyo_button_reset_password_reset').addEventListener('click', (e) => { 
                dyo.engine.reset_password_set_new();
            });
        }

        if (this.type == 9) {
            $('#dyo_dialog_accept').addEventListener('click', (e) => { 
                if (self.action) {
                    self.action();
                }
            });
        }

        if (this.type == 90) {
            $('#dyo_dialog_accept').addEventListener('click', (e) => { 
                if (self.action) {
                    self.action();
                }
            });
        }

    }
    
    hide() {

        this.container.style.display = "none";

        dyo.engine.popupActive = false;

        if (dyo.engine.mobileDevice) {
            if (dyo.engine.deviceType == "mobile" || dyo.engine.deviceType == "tablet") {
                if (window.matchMedia("(orientation: portrait)").matches) {
                    dyo.engine.canvas.swipeArrow.show();
                }
            }
        }

    }

    show() {

        if (!dyo.accountMode) {
            dyo.engine.canvas.setSize("Dialog");
        }

        let h = window.location.href.split("#");
        dyo.last_url = h[1];

        this.container.style.display = "block";

        if ($("#" + this.id+"-description")) {
            $("#" +this.id+"-description").scrollTop = 0;
        }

        if (dyo.engine.mobileDevice) {
            if (dyo.engine.deviceType == "mobile" || dyo.engine.deviceType == "tablet") {
                if (window.matchMedia("(orientation: portrait)").matches) {
                    if (!dyo.accountMode) {
                        dyo.engine.canvas.swipeArrow.hide();
                    }
                }
            }
        }
       
        if (this._accept == "") {
            if ($("#accept_button")) {
                //$("#accept_button").style.display = "none";
                let c = 'disp_none';
                let b = document.getElementsByClassName("accept_button");
                for (let nr = 0; nr < b.length; nr++) {
                    b[nr].classList.add(c);
                }
            }
        } else {
            if ($("#accept_button")) {
                //$("#accept_button").style.display = "flex";
                let c = 'disp_flex';
                let b = document.getElementsByClassName("accept_button");
                for (let nr = 0; nr < b.length; nr++) {
                    b[nr].classList.add(c);
                }
            }
        }
        
        this.dialog.show();

        if (this.container && this.container.querySelector("#quick-email-design-description")) {
            setTimeout(() => {                
                this.container.querySelectorAll(".mdc-text-field__input").forEach(inp => {
                    inp.focus();
                    inp.blur()
                });
                this.container.querySelector(".mdc-text-field__input").focus();
            }, 250);
        }

    }
	
}