import { Button, Drawer, ImageList, List, TextField, Select } from '../material/MaterialDesign.js';
import { Lang, Translate, $ } from '../Const.js';
import { paymentCancel, paymentSuccess } from '../modules/Orders.js';
import { Component } from '../material/Component.js';

export class Account extends Component {

	constructor(data = {}) {
        super(data);
        
        dyo.account = this;

        this.rendered = false;
        this.name = "Account";

		this.account = $("div", "add", "account", this.stage);
        this.range_container = $("div", "add", "range", this.account);
        this.container = $("div", "add", "container-account", this.stage);
        this.container_account = $("div", "add", "container-account-internal");
        this.container_buttons = $("div", "add", "container-buttons");
        this.container_account_details = $("div", "add", "account-details");

        this.hide();
    }

    hide() {
		dyo.selected = null;
        this.container.style.display = "none";
        this.account.style.display = "none";

        if (!dyo.accountMode) {
            if (dyo.mode == "3d") {
                //$("#openfl").style.visibility = "visible";
                $("#openfl").style.opacity = 1;
            }
        }
    }

    show() {

        dyo.design.getOrders(true);

        dyo.currentSection = "Account";

        if (!dyo.accountMode) {
            if (dyo.mode == "3d") {
                //$("#openfl").style.visibility = "hidden";
                $("#openfl").style.opacity = 0.05;
            }
        } else {
            document.body.style.backgroundColor = "#cfe8fc";
        }
        
        let greet = $("#dyo_greetings");
        let avatar = $("#dyo_account_avatar");

        if (greet) {
            if (sessionStorage.getItem('customer_firstname') && sessionStorage.getItem('customer_lastname')) {
                greet.innerHTML = Translate(Lang.WELCOME) + ",<br/>" + sessionStorage.getItem('customer_firstname') + " " + sessionStorage.getItem('customer_lastname');
                avatar.innerHTML =  sessionStorage.getItem('customer_firstname').substr(0,1).toUpperCase() + sessionStorage.getItem('customer_lastname').substr(0,1).toUpperCase();
            } else if (sessionStorage.getItem('customer_email')) {
                greet.innerHTML = Translate(Lang.WELCOME) + "<br/>" + sessionStorage.getItem('customer_email');
                avatar.innerHTML =  sessionStorage.getItem('customer_email').substr(0,2).toUpperCase();
            } else {
                greet.innerHTML = Translate(Lang.WELCOME);
            }
        }

        this.container.style.display = "block";
        
        if (!dyo.accountMode) {
            dyo.engine.canvas.hide();
        }

    }
    
    update() {
        $("#back_to_menu_" + this.title, Translate(Lang.BACK_TO_DESIGN_MENU));
    }

    render() {

        this.menu = new Drawer({
            stage: this.container,
            drawer_type: 0,
            toolbar_type: 2,
            title: this.title,
            id: "dyo_account"
        });
        this.menu.render();

		$("#dyo_account-mdc-list").appendChild(this.container_account);
		$("#dyo_account-mdc-list").appendChild(this.container_buttons);

        if (dyo.accountMode) {
            let h = document.querySelector(".dyo_account-container .mdc-toolbar");
            h.style.display = "none";
            $("#dyo_account_new_design").style.display = "none";
            document.body.style.backgroundColor = "#cfe8fc";
        }

		this.button_logout = new Button({
            stage: this.container_buttons,
            id: "dyo_button_account_logout",
			type: 2,
			title: Lang.LOGOUT
        });       
		this.button_logout.render();
        
        this.design_list = new List({
            stage: this.account,
            parent: this,
            id: "dyo_saved_design_list",
            type: 2,
            data: [],
            title: Translate(Lang.SAVED_DESIGNS),
            header_title: Translate(Lang.SAVED_DESIGNS)
        });

        this.design_list.render();

        this.orders_list = new List({
            stage: this.account,
            parent: this,
            id: "dyo_your_orders_list",
            type: 5,
            hide: true,
            data: [],
            title: Translate(Lang.YOUR_ORDERS),
            header_title: Translate(Lang.YOUR_ORDERS)
        });

        this.range = new Select({
            stage: this.range_container,
            id: "dyo_select_range",
            type: 1,
            selected: 0,
            title: Lang.RANGE
        });

        this.orders_list.hide();
        this.rendered = true;

    }

    addRange() {
    }
	
	open() {

        this.resetAccount();

        dyo.engine.popupActive = false;

        if (!dyo.accountMode) {
            if (dyo.mode == "3d") {
                //$("#openfl").style.visibility = "hidden";
                $("#openfl").style.opacity = 0.05;
            }    
        }

        if (!dyo.accountMode) {
            if (dyo.engine.canvas.isTickerOn()) {
                dyo.engine.canvas.removeTicker();
                dyo.engine.canvas.hide();
            }
        }

        dyo.engine.hide();
		
		if (!this.rendered) {
			this.render();
        }        
        
        this.show();

        if (dyo.engine.popup_login.last_action) {
            dyo.engine.popup_login.last_action();
            dyo.engine.popup_login.last_action = null;
        }

        if (dyo.engine.mobileDevice) {
            if (dyo.engine.deviceType == "mobile") {
                if (window.matchMedia("(orientation: portrait)").matches) {
                    dyo.engine.canvas.swipeArrow.show();
                }
            }
        }
    }

    getSocial() {
        return this.social;
    }

    getPayments() {
        return this.payment_methods;
    }

    getDelivery() {
        return this.delivery_methods;
    }

    shareDesign(e) {

        let share_url = dyo.account.share_method;
        let result = dyo.engine.account.design_result;

        let id = dyo.monument.design_stampid;
        let url = dyo.path.forever + dyo.path.design5 + 'shared/' + dyo.monument.design_stampid;
        let media = dyo.path.forever + dyo.path.design + this.currentDesign.design_preview;
        let title = result.title;
        let description = result.description;
        let link = result.link;

        share_url = share_url.replace("$id", id);

        if (share_url.indexOf("mailto") > -1) {
            title = Translate(Lang.SHARED_DESIGN_EMAIL) + dyo.design_name + " - " + sessionStorage.getItem('customer_email');
        }
        share_url = share_url.replace("$url", url);
        share_url = share_url.replace("$media", media);
        share_url = share_url.replace("$title", title);
        share_url = share_url.replace("$description", description);
        share_url = share_url.replace("$link", link);

        $("#shareForm").setAttribute("action", share_url);


        if (share_url.indexOf("mailto") > -1) {
            e.preventDefault();

            $("#account-popup").classList.remove("mdc-dialog--open");

            dyo.monument.design_stampid = id;
            dyo.design_name = title;

            dyo.engine.email_design.title = Translate(Lang.SEND_DESIGN_TO_FAMILY_OR_A_FRIEND);
            dyo.engine.email_design.accept = Translate(Lang.SEND_DESIGN);
            dyo.engine.email_design.decline = Translate(Lang.CLOSE);
            dyo.engine.email_design.action = dyo.design.Send;
            dyo.engine.email_design.render();

            if (dyo.template == 2) {
                let c = 'skinAU_9899c2';
                $("#single-layout-header").classList.add(c);
                $("#single-layout-footer").classList.add(c);
            }

            $("#design-send-img").src = media.replace(".jpg", "_small.jpg")
            dyo.engine.email_design.show();


        } else if (share_url.indexOf("twitter") > -1 || 
                   share_url.indexOf("/design/html5/shared/") > -1 ||
                   share_url.indexOf("linkedin") > -1) {
            e.preventDefault();
            window.open(share_url);
        } 

    }

    orderDesign() {
        
        let dialog = dyo.engine.popup_account;
        dialog.hide();

        this.deliveryDetails();
        
    }

    accountDetails() {

        if ($("#dyo_account_password")) {
            dyo.engine.resetInput("#dyo_account_password");
        }
        if ($("#dyo_account_old_password")) {
            dyo.engine.resetInput("#dyo_account_old_password");
        }
        if ($("#dyo_account_password_repeat")) {
            dyo.engine.resetInput("#dyo_account_password_repeat");
        }

        dyo.engine.popup_account_details.description = Translate(Lang.PLEASE_UPDATE_YOUR_CONTACT_DETAILS) + "...";
        
        if (this.accountDetailsRendered == undefined) {

            this.accountDetailsRendered = true;
            let dialog = dyo.engine.popup_account_details;
            dialog.title = Translate(Lang.ACCOUNT_DETAILS);
            dialog.accept = Translate(Lang.UPDATE);
            dialog.decline = Translate(Lang.GO_BACK_TO_SAVED_DESIGNS);
            dialog.render();

            if (dyo.template == 2) {
                let c = 'skinAU_9899c2';
                $("#my-account-details-header").classList.add(c);
                $("#my-account-details-footer").classList.add(c);
            }

            $("#dyo_account_old_password").addEventListener("keyup", event => {
                dyo.engine.account.checkPassword($("#dyo_account_old_password").value);
            });

        } else {
            $('#account_details-label-description').innerHTML = Translate(Lang.PLEASE_UPDATE_YOUR_CONTACT_DETAILS) + "...";

            if (!dyo.engine.validatePhone($("#dyo_account_mobile").value)) {
                dyo.engine.resetInput("#dyo_account_mobile");
            }

        }

        $("#dyo_account_first_name").value =  sessionStorage.getItem('customer_firstname');
        $("#dyo_account_last_name").value =  sessionStorage.getItem('customer_lastname');
        $("#dyo_account_mobile").value =  sessionStorage.getItem('customer_mobile');

        dyo.engine.popup_account_details.show();

    }

    updateAccountDetails() {
        dyo.engine.popup_account_details.change_password.hide();
        $('#dyo_change_password').value = "";

        let customer_firstname = this.makeInputSafe('#dyo_account_first_name');
        let customer_lastname = this.makeInputSafe('#dyo_account_last_name');
        let customer_mobile = this.makeInputSafe('#dyo_account_mobile');
        let customer_email = $("#dyo_account_email").value;
        let customer_old_password = $("#dyo_account_old_password").value;
        let customer_password = $("#dyo_account_password").value;
        let customer_password_repeat = $("#dyo_account_password_repeat").value;
        let customer_new_password;
        let allow = true;


        if ($("#dyo_account_first_name").value != "") {

            if (allow) {
                if (!dyo.engine.validateInput(customer_firstname)) {
                    $("#dyo_account_first_name").value = "";
                    if (dyo.engine.mobileDevice) {
                        $("#dyo_account_first_name").blur();
                    } else {
                        $("#dyo_account_first_name").focus();
                    }
                    dyo.engine.popup_account_details.change_password.show();
                    allow = false;

                    let data = {
                        message: Translate(Lang.PLEASE_ENTER_FIRST_NAME),
                        timeout: 5000
                    };
                    dyo.engine.snackbar.open(data);
                    return;
                }
            }

        }

        if ($("#dyo_account_last_name").value != "") {

            if (allow) {
                if (!dyo.engine.validateInput(customer_lastname)) {
                    $("#dyo_account_last_name").value = "";
                    if (dyo.engine.mobileDevice) {
                        $("#dyo_account_last_name").blur();
                    } else {
                        $("#dyo_account_last_name").focus();
                    }
                    dyo.engine.popup_account_details.change_password.show();
                    allow = false;

                    let data = {
                        message: Translate(Lang.PLEASE_ENTER_LAST_NAME),
                        timeout: 5000
                    };
                    dyo.engine.snackbar.open(data);
                    return;
                }
            }

        }

        if ($("#dyo_account_mobile").value != "") {

            if (allow) {
                if (!dyo.engine.validatePhone(customer_mobile)) {

                    $("#dyo_account_mobile").value = "";
                    if (dyo.engine.mobileDevice) {
                        $("#dyo_account_mobile").blur();
                    } else {
                        $("#dyo_account_mobile").focus();
                    }
                    dyo.engine.popup_account_details.change_password.show();
                    allow = false;

                    let data = {
                        message: Translate(Lang.PLEASE_ENTER_MOBILE),
                        timeout: 5000
                    };
                    dyo.engine.snackbar.open(data);
                    return;
                }
            }

        }

        if (customer_firstname == sessionStorage.getItem('customer_firstname')) {
            if (customer_lastname == sessionStorage.getItem('customer_lastname')) {
                if (customer_mobile == sessionStorage.getItem('customer_mobile')) {
                    if (customer_email == sessionStorage.getItem('customer_email')) {
                        if (customer_password == "") {
                            allow = false;
                        }
                    }
                }
            }
        }
        
        if (dyo.engine.validateEmail(customer_email) && 
            customer_old_password != "" &&
            dyo.engine.account.new_password_ready && 
            customer_password != "" &&
            customer_password_repeat != "" &&
            customer_password == customer_password_repeat) {

                customer_new_password = customer_password;

        } else {

            if (customer_old_password != "" || 
                customer_password != "" || 
                customer_password_repeat !="") {

                if (customer_password != customer_password_repeat) {
                    if (dyo.engine.mobileDevice) {
                        $("#dyo_account_password_repeat").blur();
                    } else {
                        $("#dyo_account_password_repeat").focus();
                    }
                    dyo.engine.popup_account_details.change_password.show();
                    allow = false;

                    let data = {
                        message: Translate(Lang.PASSWORD_AND_REPEAT_PASSWORD_DOES_NOT_MATCH),
                        timeout: 5000
                    };
                    dyo.engine.snackbar.open(data);
                    return;
                }

                if (customer_password_repeat.length == 0) {
                    if (dyo.engine.mobileDevice) {
                        $("#dyo_account_password_repeat").blur();
                    } else {
                        $("#dyo_account_password_repeat").focus();
                    }
                    dyo.engine.popup_account_details.change_password.show();
                    allow = false;

                    let data = {
                        message: Translate(Lang.PLEASE_REPEAT_PASSWORD),
                        timeout: 5000
                    };
                    dyo.engine.snackbar.open(data);
                    return;
                }

                if (customer_password.length == 0) {
                    if (dyo.engine.mobileDevice) {
                        $("#dyo_account_password").blur();
                    } else {
                        $("#dyo_account_password").focus();
                    }
                    dyo.engine.popup_account_details.change_password.show();
                    allow = false;

                    let data = {
                        message: Translate(Lang.PLEASE_ENTER_PASSWORD),
                        timeout: 5000
                    };
                    dyo.engine.snackbar.open(data);
                    return;
                } 

                if (customer_old_password.length == 0) {
                    if (dyo.engine.mobileDevice) {
                        $("#dyo_account_old_password").blur();
                    } else {
                        $("#dyo_account_old_password").focus();
                    }
                    dyo.engine.popup_account_details.change_password.show();
                    allow = false;

                    let data = {
                        message: Translate(Lang.PLEASE_ENTER_PASSWORD),
                        timeout: 5000
                    };
                    dyo.engine.snackbar.open(data);
                    return;
                }

                if (customer_old_password.length > 0) {
                    if (dyo.engine.account.new_password_ready == false) {
                        
                        if (dyo.engine.mobileDevice) {
                            $("#dyo_account_old_password").blur();
                        } else {
                            $("#dyo_account_old_password").focus();
                        }
                        dyo.engine.popup_account_details.change_password.show();
                        allow = false;

                        let data = {
                            message: Translate(Lang.PLEASE_ENTER_A_CORRECT_PASSWORD),
                            timeout: 5000
                        };
                        dyo.engine.snackbar.open(data);
                        return;
                    }
                }

            }
    
        }

        dyo.engine.loader.hide("Account:511");

        if (allow) {

            dyo.engine.loader.show("Account:511");

            let data = new FormData();
            data.append('customer_email', sessionStorage.getItem('customer_email'));
            data.append('customer_password', sessionStorage.getItem('customer_password'));
            
            data.append('customer_firstname', customer_firstname);
            data.append('customer_lastname', customer_lastname);
            data.append('customer_mobile', customer_mobile);

            if (dyo.engine.account.new_password_ready) {
                if (customer_new_password != undefined) {
                    data.append('customer_new_password', customer_new_password);
                }
            } 

            let self = this;

            fetch(dyo.path.update, {
                method: 'POST',
                body: data
            })
            .then((response) => {
                response.text().then((data) => {
                    dyo.engine.loader.hide("Account:534");
                    let result = JSON.parse(data);
                    if (result["result"] == 'success') {

                        if (dyo.engine.account.new_password_ready) {
                            sessionStorage.setItem('customer_password', result["password"]);
                        }
                        dyo.engine.resetInput("#dyo_account_old_password");
                        dyo.engine.resetInput("#dyo_account_password");
                        dyo.engine.resetInput("#dyo_account_password_repeat");

                        if (customer_old_password != "" && customer_password != "" && customer_password_repeat !="") {
                            let data = {
                                message: Translate(Lang.PASSWORD_HAS_BEEN_CHANGED),
                                timeout: 5000
                            };
                            dyo.engine.snackbar.open(data);

                        } else {
                            let data = {
                                message: Translate(Lang.SETTINGS_UPDATED),
                                timeout: 5000
                            };
                            dyo.engine.snackbar.open(data);
                        }

                        sessionStorage.setItem('customer_firstname', customer_firstname);
                        sessionStorage.setItem('customer_lastname', customer_lastname);
                        sessionStorage.setItem('customer_mobile', customer_mobile);
                        sessionStorage.setItem('customer_email', customer_email);

                    } else {
                        $('#account_details-label-description').innerHTML = Translate(Lang.SETTINGS_UPDATE_ERROR);
                        let data = {
                            message: Translate(Lang.SETTINGS_UPDATE_ERROR),
                            timeout: 5000
                        };
                        dyo.engine.snackbar.open(data);
                    }
                    
                });
            })
            .catch(error => { 
                dyo.engine.loader.hide("Account:548");
                console.error('Error:', error) 
            });

        }

    }

    invoiceDetails() {
        
        if (this.invoiceDetailsRendered == undefined) {
            this.invoiceDetailsRendered = true;

            dyo.engine.popup_invoice_details.title = Translate(Lang.INVOICE_DETAILS);
            dyo.engine.popup_invoice_details.description = Translate(Lang.PLEASE_UPDATE_YOUR_INVOICE_DETAILS);
            dyo.engine.popup_invoice_details.accept = Translate(Lang.UPDATE);
            dyo.engine.popup_invoice_details.decline = Translate(Lang.GO_BACK_TO_SAVED_DESIGNS);
            dyo.engine.popup_invoice_details.render();

            if (dyo.template == 2) {
                let c = 'skinAU_9899c2';
                $("#my-account-invoice-header").classList.add(c);
                $("#my-account-invoice-footer").classList.add(c);
            }

        } else {
            $('#invoice_details-label-description').innerHTML = Translate(Lang.PLEASE_UPDATE_YOUR_CONTACT_DETAILS) + "...";
            $('#invoice_details-label').innerHTML = Translate(Lang.INVOICE_DETAILS);

            if ($("#dyo_account_phone").value == "") {
                dyo.engine.resetInput("#dyo_account_phone");
            }
            if ($("#dyo_account_website").value == "") {
                dyo.engine.resetInput("#dyo_account_website");
            }
            if ($("#dyo_account_address").value == "") {
                dyo.engine.resetInput("#dyo_account_address");
            }
            if ($("#dyo_account_place").value == "") {
                dyo.engine.resetInput("#dyo_account_place");
            }
            if ($("#dyo_account_state").value == "") {
                dyo.engine.resetInput("#dyo_account_state");
            }
            if ($("#dyo_account_postcode").value == "") {
                dyo.engine.resetInput("#dyo_account_postcode");
            }
            if ($("#dyo_account_country").value == "") {
                dyo.engine.resetInput("#dyo_account_country");
            }
            if ($("#dyo_account_trading_name").value == "") {
                dyo.engine.resetInput("#dyo_account_trading_name");
            }
            if ($("#dyo_account_business_name").value == "") {
                dyo.engine.resetInput("#dyo_account_business_name");
            }
            if ($("#dyo_account_abn").value == "") {
                dyo.engine.resetInput("#dyo_account_abn");
            }
        }

        dyo.engine.popup_invoice_details.show();

    }

    makeInputSafe(input) {
        let nr = 0;
        let safe = $(input).value.split(" ");
        let output = "";
        
        safe = safe.filter(function(e){return e}); 

        for (nr = 0; nr < safe.length; nr++) {
            safe[nr] = safe[nr].replaceAll(' ', '');
        }

        output = safe.join(" ");
        $(input).value = output;
        
        return output;
    }

    updateInvoiceDetails() {

        let customer_tradingname = this.makeInputSafe('#dyo_account_trading_name');
        let customer_businessname = this.makeInputSafe('#dyo_account_business_name');
        let customer_phone = this.makeInputSafe('#dyo_account_phone');
        let customer_website = this.makeInputSafe('#dyo_account_website');
        let customer_address = this.makeInputSafe('#dyo_account_address');
        let customer_place = this.makeInputSafe('#dyo_account_place');
        let customer_state = this.makeInputSafe('#dyo_account_state');
        let customer_postcode = this.makeInputSafe('#dyo_account_postcode');
        let customer_country = this.makeInputSafe('#dyo_account_country');
        let customer_abn = this.makeInputSafe('#dyo_account_abn');

        let allow = true;

        if (($("#dyo_account_trading_name").value != "")) {
            if (!dyo.engine.validateInput($("#dyo_account_trading_name").value)) {
                $('#invoice_details-label-description').innerHTML = Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.TRADING_NAME) + "...";
                if (dyo.engine.mobileDevice) {
                    $("#dyo_account_trading_name").blur();
                } else {
                    $("#dyo_account_trading_name").focus();
                }
                allow = false;

                let data = {
                    message: Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.TRADING_NAME) + "...",
                    timeout: 5000
                };
                dyo.engine.snackbar.open(data);
                return;
            }
        }

        if (($("#dyo_account_business_name").value != "")) {
            if ($("#dyo_account_business_name").value < 2) {
                $('#invoice_details-label-description').innerHTML = Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.BUSINESS_NAME) + "...";
                if (dyo.engine.mobileDevice) {
                    $("#dyo_account_business_name").blur();
                } else {
                    $("#dyo_account_business_name").focus();
                }
                allow = false;

                let data = {
                    message: Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.BUSINESS_NAME) + "...",
                    timeout: 5000
                };
                dyo.engine.snackbar.open(data);
                return;
            }
        }

        if (($("#dyo_account_abn").value != "")) {
            if (!dyo.engine.validateNumber($("#dyo_account_abn").value)) {
                $('#invoice_details-label-description').innerHTML = Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.ABN) + "...";
                if (dyo.engine.mobileDevice) {
                    $("#dyo_account_abn").blur();
                } else {
                    $("#dyo_account_abn").focus();
                }
                allow = false;

                let data = {
                    message: Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.ABN) + "...",
                    timeout: 5000
                };
                dyo.engine.snackbar.open(data);
                return;
            }
        }

        if (($("#dyo_account_postcode").value != "")) {
            if (!dyo.engine.validatePostcode($("#dyo_account_postcode").value)) {
                $('#invoice_details-label-description').innerHTML = Translate(Lang.PLEASE_ENTER_POST_CODE) + "...";
                if (dyo.engine.mobileDevice) {
                    $("#dyo_account_postcode").blur();
                } else {
                    $("#dyo_account_postcode").focus();
                }
                allow = false;

                let data = {
                    message: Translate(Lang.PLEASE_ENTER_POST_CODE),
                    timeout: 5000
                };
                dyo.engine.snackbar.open(data);
                return;
            }
        }

        if (($("#dyo_account_address").value != "")) {
            if ($("#dyo_account_address").value.length < 3) {
                $('#invoice_details-label-description').innerHTML = Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.ADDRESS) + "...";
                if (dyo.engine.mobileDevice) {
                    $("#dyo_account_address").blur();
                } else {
                    $("#dyo_account_address").focus();
                }
                allow = false;

                let data = {
                    message: Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.ADDRESS),
                    timeout: 5000
                };
                dyo.engine.snackbar.open(data);
                return;
            }
        }

        if (($("#dyo_account_place").value != "")) {
            if ($("#dyo_account_place").length < 3) {
                $('#invoice_details-label-description').innerHTML = Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.CITY) + "...";
                if (dyo.engine.mobileDevice) {
                    $("#dyo_account_place").blur();
                } else {
                    $("#dyo_account_place").focus();
                }
                allow = false;

                let data = {
                    message: Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.CITY),
                    timeout: 5000
                };
                dyo.engine.snackbar.open(data);
                return;
            }
        }

        if (($("#dyo_account_state").value != "")) {
            if ($("#dyo_account_state").lenght < 2) {
                $('#invoice_details-label-description').innerHTML = Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.STATE) + "...";
                if (dyo.engine.mobileDevice) {
                    $("#dyo_account_state").blur();
                } else {
                    $("#dyo_account_state").focus();
                }
                allow = false;

                let data = {
                    message: Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.STATE),
                    timeout: 5000
                };
                dyo.engine.snackbar.open(data);
                return;
            }
        }

        if (($("#dyo_account_country").value != "")) {
            if (!dyo.engine.validateInput($("#dyo_account_country").value)) {
                $('#invoice_details-label-description').innerHTML = Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.COUNTRY) + "...";
                if (dyo.engine.mobileDevice) {
                    $("#dyo_account_country").blur();
                } else {
                    $("#dyo_account_country").focus();
                }
                allow = false;

                let data = {
                    message: Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.COUNTRY),
                    timeout: 5000
                };
                dyo.engine.snackbar.open(data);
                return;
            }
        }

        if (($("#dyo_account_phone").value != "")) {
            if (!dyo.engine.validatePhone($("#dyo_account_phone").value)) {
                $('#invoice_details-label-description').innerHTML = Translate(Lang.PLEASE_ENTER_MOBILE) + "...";
                if (dyo.engine.mobileDevice) {
                    $("#dyo_account_phone").blur();
                } else {
                    $("#dyo_account_phone").focus();
                }
                allow = false;

                let data = {
                    message: Translate(Lang.PLEASE_ENTER_MOBILE),
                    timeout: 5000
                };
                dyo.engine.snackbar.open(data);
                return;
            }
        }

        if (($("#dyo_account_website").value != "")) {
            if (!dyo.engine.validateWebsite($("#dyo_account_website").value)) {
                $('#invoice_details-label-description').innerHTML = Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.WEBSITE) + "...";
                if (dyo.engine.mobileDevice) {
                    $("#dyo_account_website").blur();
                } else {
                    $("#dyo_account_website").focus();
                }
                allow = false;

                let data = {
                    message: Translate(Lang.PLEASE_ENTER) + " " + Translate(Lang.WEBSITE),
                    timeout: 5000
                };
                dyo.engine.snackbar.open(data);
                return;
            }
        }

        if (customer_phone == sessionStorage.getItem('customer_phone')) {
            if (customer_website == sessionStorage.getItem('customer_website')) {
                if (customer_address == sessionStorage.getItem('customer_address')) {
                    if (customer_place == sessionStorage.getItem('customer_place')) {
                        if (customer_state == sessionStorage.getItem('customer_state')) {
                            if (customer_postcode == sessionStorage.getItem('customer_postcode')) {
                                if (customer_country == sessionStorage.getItem('customer_country')) {
                                    if (customer_tradingname == sessionStorage.getItem('customer_tradingname')) {
                                        if (customer_businessname == sessionStorage.getItem('customer_businessname')) {
                                            if (customer_abn == sessionStorage.getItem('customer_abn')) {
                                                allow = false;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        if (allow) {

            dyo.engine.loader.show("Account:572"); 

            sessionStorage.setItem('customer_phone', customer_phone);
            sessionStorage.setItem('customer_website', customer_website);
            sessionStorage.setItem('customer_address', customer_address);
            sessionStorage.setItem('customer_place', customer_place);
            sessionStorage.setItem('customer_state', customer_state);
            sessionStorage.setItem('customer_postcode', customer_postcode);
            sessionStorage.setItem('customer_country', customer_country);

            sessionStorage.setItem('customer_tradingname', customer_tradingname);
            sessionStorage.setItem('customer_businessname', customer_businessname);
            sessionStorage.setItem('customer_abn', customer_abn);

            let data = new FormData();
            data.append('customer_email', sessionStorage.getItem('customer_email'));
            data.append('customer_password', sessionStorage.getItem('customer_password'));
            data.append('customer_phone', customer_phone);
            data.append('customer_website', customer_website);
            data.append('customer_address', customer_address);
            data.append('customer_place', customer_place);
            data.append('customer_state', customer_state);
            data.append('customer_postcode', customer_postcode);
            data.append('customer_country', customer_country);
            data.append('customer_tradingname', customer_tradingname);
            data.append('customer_businessname', customer_businessname);
            data.append('customer_abn', customer_abn);
            data.append('customer_country', customer_country);

            fetch(dyo.path.update, {
                method: 'POST',
                body: data
            })
            .then((response) => {
                response.text().then((data) => {
                    dyo.engine.loader.hide("Account:618");
                    
                    let result = JSON.parse(data);

                    if (result.result == 'failure') {
                        $('#invoice_details-label-description').innerHTML = Translate(Lang.SETTINGS_UPDATE_ERROR);
                        let data = {
                            message: Translate(Lang.SETTINGS_UPDATE_ERROR),
                            timeout: 5000
                        };
                        dyo.engine.snackbar.open(data);
                    } 

                    if (result.result == 'success') {
                        $('#invoice_details-label-description').innerHTML = Translate(Lang.SETTINGS_UPDATED);
                        $('#invoice_details-label').innerHTML = Translate(Lang.SETTINGS_UPDATED);
                        let data = {
                            message: Translate(Lang.SETTINGS_UPDATED),
                            timeout: 5000
                        };
                        dyo.engine.snackbar.open(data);
                    }
                    
                });
            })
            .catch(error => { 
                dyo.engine.loader.hide("Account:633");
                console.error('Error:', error) 
            });

        }

    }

    deliveryDetails() {
        let dialog = dyo.engine.popup_delivery_details;

        dialog.title = Translate(Lang.BUYING_A_DESIGN) + ' "' + dyo.design_name + '"';
        dialog.description = Translate(Lang.PLEASE_CONFIRM_DELIVERY_DETAILS) + " ...";
        dialog.accept = Translate(Lang.BUY);
        dialog.decline = Translate(Lang.GO_BACK_TO_SAVED_DESIGNS);
        dialog.render();
        dialog.show();

        if (dyo.template == 2) {
            let c = 'skinAU_9899c2';
            $("#my-account-delivery-header").classList.add(c);
            $("#my-account-delivery-footer").classList.add(c);
        }

        $("#dyo_account_payment_container").style.visibility = "visible";
        $("#dyo_dialog_accept_delivery").style.visibility = "visible";
    }

    quickEnquiry() {
        dyo.engine.quick_enquiry.title = Translate(Lang.QUICK_ENQUIRY);
        dyo.engine.quick_enquiry.accept = Translate(Lang.SEND_ENQUIRY);
        dyo.engine.quick_enquiry.decline = Translate(Lang.CLOSE);
        dyo.engine.quick_enquiry.action = dyo.design.Send;
        dyo.engine.quick_enquiry.render();

        $("#design-send-img").src = dyo.path.forever + dyo.path.design + 'saved-designs/screenshots/' + dyo.design.getDateURL() + dyo.uniqueid + "_small.jpg?rand=" + Math.random() * 10000;

        if (sessionStorage.getItem('customer_email') != null) {
            $("#input_quick-email-design").value = sessionStorage.getItem('customer_email');
            setTimeout(() => {
                $("#input_quick-email-design").focus();
            }, 50);
        }

        if (sessionStorage.getItem('customer_mobile') != null) {
            $("#multi_quick-email-design").value = sessionStorage.getItem('customer_mobile');
            setTimeout(() => {
                $("#multi_quick-email-design").focus();
            }, 100);
        }

        dyo.engine.quick_enquiry.show();
    }

    checkPassword(password) {

        let data = new FormData();
        data.append('customer_email', sessionStorage.getItem('customer_email'));
        data.append('customer_password', password);

        fetch(dyo.path.check_password, {
            method: 'POST',
            body: data
        })
        .then((response) => {
            response.text().then((data) => {
                dyo.engine.loader.hide("Account:873");
                let result = JSON.parse(data);

                if (result == 'success') {
                    dyo.engine.account.new_password_ready = true;
                } 
                
                if (result == 'failure') {
                    dyo.engine.account.new_password_ready = false;
                }

            });
        })
        .catch(error => { 
            dyo.engine.loader.hide("Account:883");
            console.error('Error:', error) 
        });

    }

    checkInput(session, input, opt) {
        switch (opt) {
            case 1:
                if (sessionStorage.getItem(session) != null) {
                    if ($("#" + input)) {
                        $("#" + input).value = sessionStorage.getItem(session);
                    }
                } else {
                    if ($("#" + input)) {
                        $("#" + input).value = null;
                    }
                }        
                break;
            case 2:
                if ($("#" + input)) {
                    $("#" + input).value = null;
                }
                break;
        }
    }

    resetAccount() {

        // Account Details
        this.checkInput("customer_email", "dyo_account_email", 1);
        this.checkInput("customer_firstname", "dyo_account_first_name", 1);
        this.checkInput("customer_lastname", "dyo_account_last_name", 1);
        this.checkInput("customer_mobile", "dyo_account_mobile", 1);
        this.checkInput("", "dyo_account_old_password", 2);
        this.checkInput("", "dyo_account_password", 2);
        this.checkInput("", "dyo_account_password_repeat", 2);
        this.checkInput("", "dyo_change_password", 2);

        // Invoice Details
        this.checkInput("customer_tradingname", "dyo_account_trading_name", 1);
        this.checkInput("customer_businessname", "dyo_account_business_name", 1);
        this.checkInput("customer_abn", "dyo_account_abn", 1);
        this.checkInput("customer_phone", "dyo_account_phone", 1);
        this.checkInput("customer_website", "dyo_account_website", 1);
        this.checkInput("customer_address", "dyo_account_address", 1);
        this.checkInput("customer_place", "dyo_account_place", 1);
        this.checkInput("customer_postcode", "dyo_account_postcode", 1);
        this.checkInput("customer_state", "dyo_account_state", 1);
        this.checkInput("customer_country", "dyo_account_country", 1);

        // Delivery Details
        this.checkInput("", "dyo_account_order_first_name", 2);
        this.checkInput("", "dyo_account_order_last_name", 2);
        this.checkInput("", "dyo_account_order_mobile", 2);
        this.checkInput("", "dyo_delivery_details_info", 2);
        this.checkInput("", "dyo_payment_methods", 2);
        this.checkInput("", "dyo_payment_info", 2);
        this.checkInput("", "dyo_account_order_address", 2);
        this.checkInput("", "dyo_account_order_place", 2);
        this.checkInput("", "dyo_account_order_postcode", 2);
        this.checkInput("", "dyo_account_order_state", 2);
        this.checkInput("", "dyo_account_order_country", 2);
        this.checkInput("", "dyo_account_order_comments", 2);
    }

	events() {
        
        this.account.style.display = "block";

        if (this.eventsInited != true) {
            this.eventsInited = true;

            if (dyo.engine._events['dyo_account_new_design'] != true) {
                dyo.engine._events['dyo_account_new_design'] = true;

                $("#dyo_account_new_design").addEventListener("click", () => {

                    let dialog = dyo.engine.dialog_resp;

                    if (dyo.design_exists && dyo.engine.designSaved != true) {
                        dialog.title = Translate(Lang.ARE_YOU_SURE_YOU_WANT_TO_START_NEW_DESIGN);
                        dialog.body = Translate(Lang.YOUR_CURRENT_DESIGN_WILL_BE_LOST);
                        dialog.accept = Translate(Lang.YES);
                        dialog.decline = Translate(Lang.NO);
                        dialog.action = dyo.design.newDesign;
                        dialog.render();
                        dialog.show();
                        if (dyo.template == 2) {
                            let c = 'skinAU_9899c2';
                            if ($("#dialog-header") && $("#dialog-footer")) {
                                $("#dialog-header").classList.add(c);
                                $("#dialog-footer").classList.add(c);
                            }
                        }
                    } else {
                        dyo.design.newDesign();
                    }

                });

            }
        
            if (dyo.engine._events['dyo_saved_designs'] != true) {
                dyo.engine._events['dyo_saved_designs'] = true;

                $("#dyo_saved_designs").addEventListener("click", () => {
                    document.location.href = "#saved-designs";

                    dyo.design.getOrders(true);
                    
                    this.design_list.show();
                    this.orders_list.hide();

                    $(".account").scrollTop = 0;

                });

            }

            if (dyo.engine._events['dyo_your_orders'] != true) {
                dyo.engine._events['dyo_your_orders'] = true;
                    
                $("#dyo_your_orders").addEventListener("click", () => {
                    document.location.href = "#your-orders";

                    dyo.design.getOrdersCount();
                    dyo.design.getOrders(true);

                    let self = this;

                    self.orders_list.show();
                    self.design_list.hide(); 

                    $(".account").scrollTop = 0;

                });

            }

            if (dyo.engine._events['dyo_account_details'] != true) {
                dyo.engine._events['dyo_account_details'] = true;

                $("#dyo_account_details").addEventListener("click", () => {
                    dyo.account.accountDetails();
                    document.location.href = "#account-details";
                });
            }

            if (dyo.engine._events['dyo_invoice_details'] != true) {
                dyo.engine._events['dyo_invoice_details'] = true;
                    
                $("#dyo_invoice_details").addEventListener("click", () => {
                    dyo.account.invoiceDetails();
                    document.location.href = "#invoice-details";
                });
            }

            if (dyo.engine._events['dyo_privacy_policy'] != true) {
                dyo.engine._events['dyo_privacy_policy'] = true;

                $("#dyo_privacy_policy").addEventListener("click", () => {
                    document.location.href = "#privacy-policy";
                    dyo.engine.navigate();
                });
            }

            if (dyo.engine._events['dyo_button_account_logout'] != true) {
                dyo.engine._events['dyo_button_account_logout'] = true;
                    
                $("#dyo_button_account_logout").addEventListener("click", () => {

                    dyo.engine.mobile_account_menu = false;
                    dyo.design.cache.OrdersList = [];
                
                    sessionStorage.clear();
                    dyo.design.clearDesigns();
                    dyo.engine.update();
                    dyo.engine.show();
                    dyo.engine.account.resetAccount();
                    dyo.engine.account.hide();
                    document.location.href = "#design-menu";    

                });

            }

        }

        let href = window.location.href.split("#")[1];
        let self = this;

        switch (href) {
            case "saved-designs": case "my-account":

                this.design_list.data.forEach(design => {

                    let dialog = dyo.engine.popup_account;

                    if (design.design_stampid > 1) {

                        if (dyo.engine._events['img_design_more_' + design.design_stampid] != true) {
                            dyo.engine._events['img_design_more_' + design.design_stampid] = true;
                                
                            if ($('#img_design_more_' + design.design_stampid)) {

                                $('#img_design_more_' + design.design_stampid).addEventListener('click', () => { 

                                    let body = '';

                                    dyo.account.share_method = this.getSocial()[0].src;
                                    dyo.monument.design_stampid = design.design_stampid;
                                    dyo.monument.design_mode = design.design_affiliatenumber;
                                    dyo.design_name = design.design_name;

                                    dialog.title = design.design_name;
                                    dialog.body = body;
                                    dialog.accept = "";
                                    dialog.decline = Translate(Lang.GO_BACK_TO_SAVED_DESIGNS);
                                    dialog.render();
                                    dialog.show();
                                    dialog.showContainer();

                                    if (dyo.template == 2) {
                                        let c = 'skinAU_9899c2';
                                        $("#my-account-design-header").classList.add(c);
                                        $("#my-account-design-footer").classList.add(c);
                                    }

                                    $("#dyo_button_order").style.display = "block";
                                    $("#dyo_button_load").style.display = "block";
                                    $("#dyo_button_delete").style.display = "block";

                                    this.loadQuote(design);
                                    
                                });

                            }

                        }

                    }
                    
                    if (design.design_stampid > 1) {

                        if (dyo.engine._events['design_edit_' + design.design_stampid] != true) {
                            dyo.engine._events['design_edit_' + design.design_stampid] = true;

                            if ($('#design_edit_' + design.design_stampid)) {
                                $('#design_edit_' + design.design_stampid).addEventListener('click', () => { 

                                    dyo.monument.design_stampid = design.design_stampid;
                                    dyo.monument.design_mode = design.design_affiliatenumber;

                                    dyo.account.hide();
                                    dyo.design.loadDesign();
                        
                                });
                            }

                        }

                    }

                    if (design.design_stampid > 1) {

                        if (dyo.engine._events['design_buy_' + design.design_stampid] != true) {
                            dyo.engine._events['design_buy_' + design.design_stampid] = true;

                            if ($('#design_buy_' + design.design_stampid)) {
                                $('#design_buy_' + design.design_stampid).addEventListener('click', () => { 

                                    self.currentDesign = design;
                                    dyo.monument.design_stampid = design.design_stampid;
                                    dyo.design_name = design.design_name;
                                    dyo.account.orderDesign();
                        
                                });
                            }

                        }

                    }

                    if (design.design_stampid > 1) {

                        if (dyo.engine._events['design_email_' + design.design_stampid] != true) {
                            dyo.engine._events['design_email_' + design.design_stampid] = true;
                            
                            if ($('#design_email_' + design.design_stampid)) {
                                $('#design_email_' + design.design_stampid).addEventListener('click', () => { 

                                    dyo.monument.design_stampid = design.design_stampid;
                                    dyo.design_name = design.design_name;

                                    dyo.engine.email_design.title = Translate(Lang.SEND_DESIGN_TO_FAMILY_OR_A_FRIEND);
                                    dyo.engine.email_design.accept = Translate(Lang.SEND_DESIGN);
                                    dyo.engine.email_design.decline = Translate(Lang.CLOSE);
                                    dyo.engine.email_design.action = dyo.design.Send;
                                    dyo.engine.email_design.render();

                                    if (dyo.template == 2) {
                                        let c = 'skinAU_9899c2';
                                        $("#single-layout-header").classList.add(c);
                                        $("#single-layout-footer").classList.add(c);
                                    }

                                    $("#design-send-img").src = dyo.path.forever + dyo.path.design + '/' + design.design_preview.replace(".jpg", "_small.jpg")
                                    dyo.engine.email_design.show();

                                });
                            }

                        }

                    }

                    if (design.design_stampid > 1) {

                        if (dyo.engine._events['design_more_' + design.design_stampid] != true) {
                            dyo.engine._events['design_more_' + design.design_stampid] = true;
                            
                            if ($('#design_more_' + design.design_stampid)) {
                                $('#design_more_' + design.design_stampid).addEventListener('click', () => { 

                                    let body = '';
                                
                                    dyo.account.share_method = this.getSocial()[0].src;
                                    dyo.monument.design_stampid = design.design_stampid;
                                    dyo.design_name = design.design_name;

                                    dialog.title = design.design_name;
                                    dialog.body = body;
                                    dialog.accept = "";
                                    dialog.decline = Translate(Lang.GO_BACK_TO_SAVED_DESIGNS);
                                    dialog.render();
                                    dialog.show();
                                    dialog.showContainer();

                                    if (dyo.template == 2) {
                                        let c = 'skinAU_9899c2';
                                        $("#my-account-design-header").classList.add(c);
                                        $("#my-account-design-footer").classList.add(c);
                                    }

                                    $("#dyo_button_order").style.display = "block";
                                    $("#dyo_button_load").style.display = "block";

                                    this.loadQuote(design);
                        
                                });

                            }

                        }

                    }

                });

                break;

            case "your-orders":

                this.orders_list.data.forEach(order => {

                    let dialog = dyo.engine.popup_account;

                    if (order.order_id) {

                        if (dyo.engine._events['order_' + order.order_id] != true) {
                            dyo.engine._events['order_' + order.order_id] = true;
                            
                            if ($('#order_' + order.order_id)) {
                                $('#order_' + order.order_id).addEventListener('click', () => { 

                                    let body = '';
                                
                                    dyo.monument.design_stampid = order.order_designstampid;
                                    dyo.monument.order_id = order.order_id;

                                    dyo.order_name = order.order_designname;

                                    dialog.title = Translate(Lang.ORDER_ID) + ": " + order.order_id;
                                    dialog.body = body;
                                    dialog.accept = "";
                                    dialog.decline = Translate(Lang.GO_BACK_TO_ORDERS);
                                    dialog.render();
                                    dialog.show();
                                    dialog.showContainer();

                                    if (dyo.template == 2) {
                                        let c = 'skinAU_9899c2';
                                        $("#my-account-design-header").classList.add(c);
                                        $("#my-account-design-footer").classList.add(c);
                                    }

                                    $("#dyo_button_order").style.display = "none";
                                    $("#dyo_button_load").style.display = "none";
                                    $("#dyo_button_delete").style.display = "none";

                                    this.loadInvoice(order);
                        
                                });
                            }

                        }

                    }

                });

                break;

        }

    }
    
    loadQuote = async (design) => {

        $("#dyo_account_share_container").style.display = "block";

        let d = true;

        for (let nr = 0; nr < dyo.design.cache.OrdersList.length; nr ++) {
            if (design.design_stampid == dyo.design.cache.OrdersList[nr].order_designstampid) {
                d = false;
            }
        }

        if (d == false) {
            $("#dyo_button_delete").style.display = "none";
        } 

        if (dyo.engine.mobile) {
            if (dyo.engine.deviceType == "mobile") {
                $("#dyo_button_pdf").style.display = "none";
            }
        }

        this.currentDesign = design;

        dyo.engine.loader.show("Account:841"); 

        let path = dyo.path.design5;

        if (dyo.path.php.indexOf("test") >-1) {
            path = path.replace("design/", "test-design/");
        }

        let url = dyo.path.forever + path + "json/" + dyo.monument.design_stampid;

        await fetch(url, {
            method: 'GET'
        })
        .then((response) => {
            response.text().then((data) => {
                dyo.engine.loader.hide("Account:175");
                dyo.engine.account.design_result = JSON.parse(data);
            })
        })
        .catch(error => { 
            dyo.engine.loader.hide("Account:1212");
            console.error('Error:', error) 
        });

        path = dyo.path.read_file;

        if (dyo.path.php.indexOf("test") > -1) {
            path = path.replace("design/", "test-design/");
        }

        fetch(path + "../saved-designs/html/" + dyo.monument.design_stampid + ".html", {
            method: 'POST'
        })
        .then(response => response.text())
        .then(data => {

            //console.log(path + "../saved-designs/html/" + dyo.monument.design_stampid + ".html");

            dyo.monument.design_mode = design.design_affiliatenumber;

            let id = dyo.engine.md5(design.design_preview);
            let path_design = dyo.path.design;

            if (dyo.path.php.indexOf("test") >-1) {
                path_design = path_design.replace("design", "test-design");
            }

            let img = "<div align='center' style='margin-bottom: 20px; clear:both;'><img alt='" + Translate(Lang.CLICK_TO_ENLARGE) + "' style='cursor:pointer' id='preview" + id +"' src='" + dyo.path.forever + path_design + '/' + design.design_preview.replace(".jpg", "_small.jpg") + "' class='lazyload' style='margin-bottom: 20px;' /></div>";

            if (dyo.sub_mode == "traditional") {
                $("#account-popup-description", img);
            } else {
                $("#account-popup-description", img + data);
            }

            let accSharedBody = document.querySelector("#account-popup-description").parentNode.querySelector("#dyo_account_share_container");

            dyo.engine.loader.hide("Account:853");

            let img_preview = $("#preview" + id).addEventListener("click", () => {
                window.open(dyo.path.forever + path_design + '/' + design.design_preview);
            });    

        })
        .catch(error => { 
            dyo.engine.loader.hide("Account:861");
            console.error('Error:', error) 
        });

    }

    loadInvoice(order) {

        $("#dyo_account_share_container").style.display = "none";

        dyo.engine.loader.show("Account:869"); 

        if (dyo.engine.mobile) {
            if (dyo.engine.deviceType == "mobile") {
                $("#dyo_button_pdf").style.display = "none";
            }
        }

        fetch(dyo.path.read_file + "../saved-designs/html/" + dyo.monument.design_stampid + ".html", {
            method: 'POST'
        })
        .then(response => response.text())
        .then(data => {

            let url = "";
            let date = new Date(Number(order.order_designstampid));
            let month = ("0" + (date.getMonth() + 1)).slice(-2)
            let year = date.getFullYear();
            let path = dyo.path.forever + "design/saved-designs/screenshots/" + year + "/" + month + "/";

            let design_preview = order.order_designstampid + ".jpg";

            if (design_preview) {
                url = path + design_preview.replace(".jpg", "_small.jpg");
            } else {
                url = path + design_preview;
            }

            let id = dyo.engine.md5(design_preview);
            let price;
            let symbol = this.getCurrencySymbol(dyo.currency);
            let side = this.getCurrencySide(dyo.currency);
    
            if (side == 0) {
                price = symbol + order.order_designprice;
            }
            if (side == 1) {
                price = order.order_designprice + " " + symbol;
            }

            let comments = order.order_comments;
            let c;

            if (comments.indexOf("Fixing system:") > -1) {
                c = comments.split(":");
                comments = "<br/>" + c[0] + ": " + c[1].replace("<br/>", "");
            }

            let order_info;
            let price_info = Translate(Lang.PRICE) + ": " + price + "<br/>";

            if (dyo.sub_mode == "traditional") {
                price_info = "";
            }

            if (dyo.engine.deviceType == "mobile") {
                order_info = `
                <div align="center" style="margin-bottom: 20px;"><img alt='${Translate(Lang.CLICK_TO_ENLARGE)}' class='lazyload' style='cursor:pointer;margin-top:30px;' id='preview${id}' src='${url.replace(".jpg", "_small.jpg")}' /></div>
                <div style='color:#202020;margin:0px 0px 20px 0px;padding-left:25px;'>
                <strong>${Translate(Lang.ORDER_INFORMATION)}:</strong><br/>
                ${Translate(Lang.PAYMENT_METHOD)}: ${order.order_paymentmethod}<br/>
                ${price_info}
                ${Translate(Lang.DESIGN_NAME)}: ${order.order_designname}<br/>
                Id: ${order.order_designstampid}<br/>
                ${Translate(Lang.PRODUCT)}: ${order.order_productid}<br/>
                ${Translate(Lang.DATE)}: ${order.order_date}<br/>
                ${Translate(Lang.COMMENTS)}: ${comments}<br/>
                ${Translate(Lang.NOTES)}: ${order.order_notes}
                </div>
                <div style='color:#202020;margin:0px 0px 20px 0px;padding-left:25px;'>
                <strong>${Translate(Lang.SHIPPING_ADDRESS)}:</strong><br/>
                ${Translate(Lang.SHIPPING_METHOD)}: ${order.order_shippingmethod}<br/>
                ${Translate(Lang.STREET)}: ${order.order_shippingaddress}<br/>
                ${Translate(Lang.CITY)}: ${order.order_shippingplace}<br/>
                ${Translate(Lang.POSTCODE)}: ${order.order_shippingpostcode}<br/>
                ${Translate(Lang.COUNTRY)}: ${order.order_shippingcountry}<br/>
                </div><br style='clear:both;' />`
                if (dyo.sub_mode != "traditional") {
                    order_info += data;
                }
            } else {
                order_info = `
                <div align="center" style="margin-bottom: 20px;"><img alt='${Translate(Lang.CLICK_TO_ENLARGE)}' class='lazyload' style='cursor:pointer;margin-top:30px;' id='preview${id}' src='${path}/${design_preview.replace(".jpg", "_small.jpg")}' /></div>
                <div class='grid50' style='color:#202020;margin:0px 0px 20px 0px;padding-left:25px;width:45%;'>
                <strong>${Translate(Lang.ORDER_INFORMATION)}:</strong><br/>
                ${Translate(Lang.PAYMENT_METHOD)}: ${order.order_paymentmethod}<br/>
                ${price_info}
                ${Translate(Lang.DESIGN_NAME)}: ${order.order_designname}<br/>
                Id: ${order.order_designstampid}<br/>
                ${Translate(Lang.PRODUCT)}: ${order.order_productid}<br/>
                ${Translate(Lang.DATE)}: ${order.order_date}<br/>
                ${Translate(Lang.COMMENTS)}: ${comments}<br/>
                ${Translate(Lang.NOTES)}: ${order.order_notes}
                </div>
                <div class='grid50' style='color:#202020;margin:0px 0px 20px 0px;padding-left:25px;width:45%;'>
                <strong>${Translate(Lang.SHIPPING_ADDRESS)}:</strong><br/>
                ${Translate(Lang.SHIPPING_METHOD)}: ${order.order_shippingmethod}<br/>
                ${Translate(Lang.STREET)}: ${order.order_shippingaddress}<br/>
                ${Translate(Lang.CITY)}: ${order.order_shippingplace}<br/>
                ${Translate(Lang.POSTCODE)}: ${order.order_shippingpostcode}<br/>
                ${Translate(Lang.COUNTRY)}: ${order.order_shippingcountry}<br/>
                </div><br style='clear:both;' />`    
                if (dyo.sub_mode != "traditional") {
                    order_info += data;
                }
            }

            $("#account-popup-description", order_info);
            let accSharedBody = document.querySelector("#account-popup-description").parentNode.querySelector("#dyo_account_share_container");
            document.querySelector("#account-popup-description").insertBefore(accSharedBody, document.querySelector("#account-popup-description > *:first-child"));
            dyo.engine.loader.hide("Account:905");

            let img_preview = $("#preview" + id).addEventListener("click", () => {
                window.open(path + '/' + design_preview);
            });    

        })
        .catch(error => { 
            dyo.engine.loader.hide("Account:913");
            console.error('Error:', error) 
        });

    }
	
}