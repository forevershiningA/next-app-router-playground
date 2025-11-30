import { Lang, Translate, $ } from '../Const.js';

export function setSession(card) {

    dyo.engine.loader.show("Engine:794");

    let data = new FormData();
    data.append('customer_email', sessionStorage.getItem('customer_email'));
    data.append('customer_password', sessionStorage.getItem('customer_password'));
    data.append('order_id', sessionStorage.getItem('order_id'));
    data.append('name', card.name);
    data.append('description', card.description);
    data.append('image', card.image);
    data.append('amount', card.amount);
    data.append('currency', card.currency);
    data.append('quantity', card.quantity);

    fetch(dyo.path.session, {
        method: 'POST',
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        body: data
    })
    .then(response => response.text())
    .then(data => {
        let result = JSON.parse(data);
    })
    .catch(error => { 
        dyo.engine.loader.hide(); 
        console.error('Error:', error) 
    });

}

// Paypal OPEN //

export function getPaypalSession(card) {

    dyo.engine.loader.hide(); 

    if ($("#dyo_dialog_accept_delivery")) {
        $("#dyo_dialog_accept_delivery").style.visibility = "hidden";
    }

    // Hide Payments Options in Header
    if ($("#dyo_account_payment_container")) {
        $("#dyo_account_payment_container").style.visibility = "hidden";
    }

    let container = $("#delivery_details-description");
    container.innerHTML = "";
    container.scrollTop = 0;
    container.style.paddingTop = "24px";

    dyo.engine.popup_account.showContainer();
    paypal.Buttons({
        createOrder: function(data, actions) {
          // This function sets up the details of the transaction, including the amount and line item details.
          return actions.order.create({
            purchase_units: [{
              amount: {
                currency_code: "USD",
                value: card.amount,
                breakdown: {
                    "item_total": {
                      "currency_code": "USD",
                      "value": card.amount
                    }
                }
              },
              items: [
                {
                  "name": card.name,
                  "description": card.description,
                  "sku": sessionStorage.getItem('order_id'),
                  "unit_amount": {
                    "currency_code": "USD",
                    "value": card.amount
                  },
                  "quantity": "1",
                  "category": "PHYSICAL_GOODS"
                }]
            }]
          });
        },
        onApprove: function(data, actions) {
          return actions.order.capture().then(function(details) {
            $("#delivery_details").classList.remove('mdc-dialog--open');
            dyo.payment = "paypal";
            paymentSuccess();
          });
        },
        onCancel: function (data) {
            $("#delivery_details").classList.remove('mdc-dialog--open');
            dyo.payment = "paypal";
            paymentCancel();
        },
        onError: function (err) {
            $("#delivery_details").classList.remove('mdc-dialog--open');
            dyo.payment = "paypal";
            paymentCancel();
        }
      }).render('#delivery_details-description');

}

// Paypal CLOSE //

// Stripe OPEN //

export function getStripeSession(card) {

    dyo.engine.loader.show("Engine:794");

    let data = new FormData();
    data.append('customer_email', sessionStorage.getItem('customer_email'));
    data.append('customer_password', sessionStorage.getItem('customer_password'));
    data.append('order_id', sessionStorage.getItem('order_id'));
    data.append('name', card.name);
    data.append('description', card.description);
    data.append('image', card.image);
    data.append('amount', card.amount);
    data.append('currency', card.currency);
    data.append('quantity', card.quantity);

    fetch(dyo.path.stripe_session, {
        method: 'POST',
        body: data
    })
    .then(response => response.text())
    .then(data => {
        console.log(data);
        dyo.stripe_session_id = JSON.parse(data);

        let stripe = Stripe(dyo.stripe_key);

        stripe.redirectToCheckout({
            sessionId: dyo.stripe_session_id
            //successUrl: dyo.path.design5 + "#payment-success",
            //cancelUrl: dyo.path.design5 + "#payment-cancel"
        }).then(function (result) {
            console.log("error");
        });

    })
    .catch(error => { 
        dyo.engine.loader.hide(); 
        console.error('Error:', error) 
    });

}

export function paymentCancel() {

    // update DB with new data even if cancelled payment

    let form_data = new FormData();
    let order_data = JSON.parse(sessionStorage.getItem('order_data'));

    if (order_data != null) {

        for (let key in order_data) {
            form_data.append(key, order_data[key]);
        }

        fetch(dyo.path.update, {
            method: 'POST',
            body: form_data
        })
        .then((response) => {
            response.text().then((data) => {
                dyo.engine.loader.hide("Account:618");
                
                let result = JSON.parse(data);

                if (result.result == 'failure') {
                    let data = {
                        message: Translate(Lang.SETTINGS_UPDATE_ERROR),
                        timeout: 5000
                    };
                    dyo.engine.snackbar.open(data);
                } 

                if (result.result == 'success') {
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

    let order_id = sessionStorage.getItem('order_id');
    let order_price = sessionStorage.getItem('order_price');
    let order_currency = sessionStorage.getItem('order_currency');

    fetch(dyo.path.get_session, {
        method: 'POST'
    })
    .catch(error => { 
        dyo.engine.loader.hide(); 
        console.error('Error:', error)
    })
    .then(response => response.text())
    .then(data => {

        let session = JSON.parse(data);

        order_id = session['order_id'];
        if (dyo.payment == "paypal") {
            order_price = session['amount'];
            dyo.payment = undefined;
        } else {
            order_price = session['amount'] / 100;
        }
        order_currency = session['currency'];

    });

    let msg = `<p style="color:#000000">${Translate(Lang.PAYMENT_WAS_NOT_SUCCESFUL)}</p>`
   
    let dialog = dyo.engine.dialog;
    dialog.title = Translate(Lang.PAYMENT_WAS_CANCELED);
    dialog.body = msg;
    dialog.accept = "";
    dialog.decline = Translate(Lang.CLOSE);
    dialog.render();
    dialog.show();

    if (dyo.mode == "3d") {
        if ($("#openfl")) {
            $("#openfl").style.visibility = "hidden";
        }
        setTimeout(function() {
            dyo.engine.myAccount();
            dyo.design.getOrders(true);
        }, 500);
    } else {
        dyo.engine.myAccount();
    }

}

export function paymentSuccess() {

    let order_id = sessionStorage.getItem('order_id');
    let order_price = sessionStorage.getItem('order_price');
    let order_currency = sessionStorage.getItem('order_currency');

    fetch(dyo.path.get_session, {
        method: 'POST'
    })
    .catch(error => { 
        dyo.engine.loader.hide(); 
        console.error('Error:', error)
    })
    .then(response => response.text())
    .then(data => {

        let session = JSON.parse(data);

        order_id = session['order_id'];
        if (dyo.payment == "paypal") {
            order_price = session['amount'];
            dyo.payment = undefined;
        } else {
            order_price = session['amount'] / 100;
        }
        order_currency = session['currency'];

        sessionStorage.setItem('order_id', order_id);
        sessionStorage.setItem('order_price', order_price);
        sessionStorage.setItem('order_currency', order_currency);

        dyo.engine.loader.show("Account:262"); 

        insertOrder(1);
       
        let msg = `
        <p style="color:#000000"><strong>${Translate(Lang.THANK_YOU_AND_CONGRATULATIONS_INVOICE)}</strong></p>
        <p style="color:#000000">${Translate(Lang.YOU_HAVE_BEEN_SENT_EMAIL)}</p>
        <p style="color:#000000">${Translate(Lang.YOUR_PRODUCT_IS_WARRANTED)}</p>

        <p style="color:#000000"><strong>${Translate(Lang.ORDER_ID)}: ${order_id}<br/>
        ${Translate(Lang.PRICE)}: ${order_currency} $${order_price}
        </p>
        `
        let dialog = dyo.engine.dialog_resp;
        dialog.title = Translate(Lang.ORDER_INFORMATION);
        dialog.body = msg;
        dialog.accept = "";
        dialog.decline = Translate(Lang.CLOSE);
        dialog.render();
        dialog.show();

        dyo.engine.canvas.swipeArrow.hide();
        
        if (dyo.usa) {
            gtag('event', 'conversion', { 'send_to': 'AW-972005728/OGcTCODF5uoCEODCvs8D', 'transaction_id': ''});
        }

        // Open Account
        
        if (dyo.mode == "3d") {
            if ($("#openfl")) {
                $("#openfl").style.visibility = "hidden";
            }
            setTimeout(function() {
                dyo.engine.myAccount();
                dyo.design.getOrders(true);
            }, 500);
        } else {
            dyo.engine.myAccount();
        }
    })
    .catch(error => { 
        dyo.engine.loader.hide(); 
        console.error('Error:', error) 
    });
}

// Stripe CLOSE //

export function insertOrder(payment_method) {

    let form_data = new FormData();
    let order_data = JSON.parse(sessionStorage.getItem('order_data'));

    for (let key in order_data) {
        form_data.append(key, order_data[key]);
    }
    
    if ($("#dyo_dialog_accept_delivery")) {
        $("#dyo_dialog_accept_delivery").style.visibility = "hidden";
    }

    fetch(dyo.path.order, {
        method: 'POST',
        body: form_data
    })
    .then((response) => {
        response.text().then((data) => {

            let result = JSON.parse(data);

            if (result['pdf']) {

                sessionStorage.setItem('order_id', result['id']);

                let data = new FormData();
                data.append('directory', '../pdf/' + result['pdf']);
                data.append('country', dyo.country);

                fetch(dyo.path.read_file, {
                    method: 'POST',
                    body: data
                }, {responseType: 'arraybuffer'})
                .then(response => response.blob())
                .then(data => {

                    var file = new Blob([data], {type: 'application/pdf'});
                    var fileURL = URL.createObjectURL(file);

                    dyo.engine.loader.hide("Account:325");

                    // Hide Payments Options in Header
                    if ($("#dyo_account_payment_container")) {
                        $("#dyo_account_payment_container").style.visibility = "hidden";
                    }

                    let container = $("#delivery_details-description");

                    let price;
                    let symbol = dyo.engine.getCurrencySymbol(dyo.currency);
                    let side = dyo.engine.getCurrencySide(dyo.currency);
                    let bpay_ref_id = Number(sessionStorage.getItem('order_id'));

                    if (bpay_ref_id < 10000) {
                        bpay_ref_id = "0" + bpay_ref_id;
                    }
            
                    if (dyo.account.currentDesign) {

                        if (side == 0) {
                            price = symbol + dyo.account.currentDesign.design_price;
                        }
                        if (side == 1) {
                            price = dyo.account.currentDesign.design_price + " " + symbol;
                        }

                    } else {

                        price = sessionStorage.getItem('order_price');
                        symbol = sessionStorage.getItem('order_currency');

                    }

                    let allow = true;

                    if (dyo.country != "au") {
                        dyo.engine.loader.hide("Account:325");
                    }

                    if (dyo.country == "us" ||
                        dyo.country == "ca" ||
                        dyo.country == "uk" ||
                        dyo.country == "eu") {
                        allow = false;
                    }

                    if (container) {
                        if (allow) {
                            container.innerHTML = getOrderConfirmation(price);
                        }
                        container.scrollTop = 0;
                    }

                    dyo.engine.popup_account.showContainer();

                    dyo.design.cache.OrdersList = [];
                    dyo.design.getOrders(true);

                })
                .catch(error => { 
                    console.error('Error:', error) 
                    dyo.engine.loader.hide("Account:375");
                });

            }

        });
    })
    .catch(error => { 
        console.error('Error:', error) 
        dyo.engine.loader.hide("Account:384");
    });

}

export function getOrderConfirmation(price) {

    let bpay_ref_id = Number(sessionStorage.getItem('order_id'));

    if (bpay_ref_id < 10000) {
        bpay_ref_id = "0" + bpay_ref_id;
    }

    let content = `
    <div align="left">
    <p style="color:#000000;margin-top:30px;font-size: 1.75em;line-height: 1.25em;"><strong>${Translate(Lang.PLEASE_FINALIZE_PURCHASE)}</strong></p>
    <p style="color:#000000;font-size: 1em;">${Translate(Lang.YOU_HAVE_BEEN_SENT_EMAIL)}</p>

    <p style="font-size: 1.5em;line-height: 1.5em;color:#000000;text-align:center;margin-bottom: 30px;"><strong>${Translate(Lang.ORDER_ID)}: ${sessionStorage.getItem('order_id')}<br/>
    ${Translate(Lang.PRICE)}: ${price}</strong></p>

    <p style="font-size: 1.75em;color:#000000;margin-bottom: 30px;"><strong>${Translate(Lang.PAYMENT_OPTIONS)}</strong></p>

    <p style="font-size: 1em;color:#000000;margin-bottom: 20px;">To pay by <strong>Credit Card</strong>, please call us on:<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(08) 6191 0396 / 0419 945 950 / (International callers) +61 86191 0396</p>

    <p style="font-size: 1em;color:#000000;margin-bottom: 20px;">To pay by <strong>Direct Deposit</strong> please use your online banking account using the following details:<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The Stainless Steel Monument Company Pty Ltd<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Bank Account: BSB 034-604 Account Number 192-715</p>

    <p style="font-size: 1em;color:#000000;margin-bottom: 20px;">To pay by <strong>BPAY</strong> please use your online banking account using the following details:<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Biller Code: 566380<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Your BPay Ref: ${bpay_ref_id}</p>
    
    <p style="font-size: 1em;color:#000000;margin-bottom: 20px;">To pay by <strong>Cheque</strong> please make the cheque out to the following:<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The Stainless Steel Monument Company<br/>
	&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PO Box 1268, Bibra Lake, WA 6965</p>

    <p style="font-size: 1em;color:#000000;margin-bottom: 20px;">We will commence with your order once we have confirmation of payment.</p>

    <p style="font-size: 1em;color:#000000;margin-bottom: 20px;">If you have any questions, please call us on (08) 6191 0396 or 0419 945 950 or 1300 851 181 for the cost of a local call or email us using the <a href="https://www.forevershining.com.au/contact/" target="_blank">contact form</a>.</p>

    </div>
    `

    if (dyo.code == "jp_JP") {
        content = `
        <div align="left">
        <p style="color:#000000;margin-top:30px;font-size: 1.75em;line-height: 1.25em;"><strong>${Translate(Lang.PLEASE_FINALIZE_PURCHASE)}</strong></p>
        <p style="color:#000000;font-size: 1em;">${Translate(Lang.YOU_HAVE_BEEN_SENT_EMAIL)}</p>

        <p style="font-size: 1.5em;line-height: 1.5em;color:#000000;text-align:center;margin-bottom: 30px;"><strong>${Translate(Lang.ORDER_ID)}: ${sessionStorage.getItem('order_id')}<br/>
        ${Translate(Lang.PRICE)}: ${price}</strong></p>

        <p style="font-size: 1.75em;color:#000000;margin-bottom: 30px;"><strong>${Translate(Lang.PAYMENT_OPTIONS)}</strong></p>

        <p style="font-size: 1em;color:#000000;margin-bottom: 20px;">クレジットカードでお支払いの場合は、以下の番号にお電話ください：<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;(08) 6191 0396 / 0419 945 950 / （海外からのお客様） +61 86191 0396</p>

        <p style="font-size: 1em;color:#000000;margin-bottom: 20px;">銀行振込でお支払いの場合
オンラインバンキングを利用し、以下の口座情報にお振込みください：振込先名義: <br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The Stainless Steel Monument Company Pty Ltd<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;銀行口座: BSB 034-604 口座番号 192-715</p>

        <p style="font-size: 1em;color:#000000;margin-bottom: 20px;">BPAYでお支払いの場合
オンラインバンキングを利用し、以下の情報をご入力ください：<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;ビラーコード:  566380<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;お客様のBPAY参照番号: ${bpay_ref_id}</p>
        
        <p style="font-size: 1em;color:#000000;margin-bottom: 20px;">小切手でお支払いの場合
以下の宛先で小切手をご郵送ください：<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The Stainless Steel Monument Company<br/>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;PO Box 1268, Bibra Lake, WA 6965</p>

        <p style="font-size: 1em;color:#000000;margin-bottom: 20px;">お支払いの確認が取れ次第、ご注文を進めさせていただきます。</p>

        <p style="font-size: 1em;color:#000000;margin-bottom: 20px;">ご不明な点がございましたら、お気軽にお電話ください。(08) 6191 0396 / 0419 945 950 / 1300 851 181（市内通話料金）または、お問い合わせフォームよりメ <a href="https://www.forevershining.com.au/contact/" target="_blank">ールにてご連絡ください</a>.</p>

        </div>
        `
    }


    return content;

}

export function Order() {

    let price = dyo.monument.checkPrice(true);

    let customer_firstname = $("#dyo_account_order_first_name");
    let customer_lastname = $("#dyo_account_order_last_name");
    let customer_mobile = $("#dyo_account_order_mobile");
    let customer_address = $("#dyo_account_order_address");
    let customer_place = $("#dyo_account_order_place");
    let customer_state = $("#dyo_account_order_state");
    let customer_postcode = $("#dyo_account_order_postcode");
    let customer_country = $("#dyo_account_order_country");
    let delivery_method = 0;
    let payment_method = dyo.account.payment_method;

    let comments = $("#dyo_account_order_comments").value;

    let allow = true;

    if (!dyo.engine.validatePhone(customer_mobile.value)) {
        if (dyo.engine.mobileDevice) {
            $("#dyo_account_order_mobile").blur();
        } else {
            $("#dyo_account_order_mobile").focus();
        }
        allow = false;

        let data = {
            message: Translate(Lang.PLEASE_ENTER_MOBILE),
            timeout: 5000
        };
        dyo.engine.snackbar.open(data);
        return;
    }

    if (!dyo.engine.validatePostcode(customer_postcode.value)) {
        if (dyo.engine.mobileDevice) {
            $("#dyo_account_order_postcode").blur();
        } else {
            $("#dyo_account_order_postcode").focus();
        }
        allow = false;

        let data = {
            message: Translate(Lang.PLEASE_ENTER_POST_CODE),
            timeout: 5000
        };
        dyo.engine.snackbar.open(data);
        return;
    }

    if (customer_firstname.value) {
        sessionStorage.setItem('customer_firstname', customer_firstname.value);
    }

    if (customer_lastname.value) {
        sessionStorage.setItem('customer_lastname', customer_lastname.value);
    }

    if (customer_mobile.value) {
        sessionStorage.setItem('customer_mobile', customer_mobile.value);
    }

    if (customer_address.value) {
        sessionStorage.setItem('customer_address', customer_address.value);
    }

    if (customer_place.value) {
        sessionStorage.setItem('customer_place', customer_place.value);
    }

    if (customer_state.value) {
        sessionStorage.setItem('customer_state', customer_state.value);
    }

    if (customer_postcode.value) {
        sessionStorage.setItem('customer_postcode', customer_postcode.value);
    }

    if (customer_country.value) {
        sessionStorage.setItem('customer_country', customer_country.value);
    }

    if (allow && customer_firstname.value && customer_lastname.value && customer_mobile.value && 
        customer_address.value && customer_place.value && customer_state.value && customer_postcode.value && customer_country.value) {

        let data = new FormData();

        data.append('order_date', dyo.engine.getDate());
        data.append('design_stampid', dyo.monument.design_stampid);
        data.append('customer_email', sessionStorage.getItem('customer_email'));
        data.append('customer_password', sessionStorage.getItem('customer_password'));

        // Invoice Details
        data.append('customer_abn', sessionStorage.getItem('customer_abn'));
        data.append('customer_businessname', sessionStorage.getItem('customer_businessname'));
        data.append('customer_fax', sessionStorage.getItem('customer_fax'));
        data.append('customer_phone', sessionStorage.getItem('customer_phone'));
        data.append('customer_tradingname', sessionStorage.getItem('customer_tradingname'));
        data.append('customer_website', sessionStorage.getItem('customer_website'));

        // Delivery
        data.append('customer_firstname', sessionStorage.getItem('customer_firstname'));
        data.append('customer_lastname', sessionStorage.getItem('customer_lastname'));
        data.append('customer_mobile', sessionStorage.getItem('customer_mobile'));
        data.append('customer_address', sessionStorage.getItem('customer_address'));
        data.append('customer_place', sessionStorage.getItem('customer_place'));
        data.append('customer_state', sessionStorage.getItem('customer_state'));
        data.append('customer_postcode', sessionStorage.getItem('customer_postcode'));
        data.append('customer_state', sessionStorage.getItem('customer_state'));
        data.append('customer_country', sessionStorage.getItem('customer_country'));
        data.append('customer_comments', comments);
        data.append('customer_deliverymethod', delivery_method);
        data.append('customer_paymentmethod', payment_method);
        data.append('agent', dyo.agent);

        dyo.engine.loader.show("Orders:293"); 

        let object = {};
        data.forEach((value, key) => object[key] = value);

        sessionStorage.setItem('order_data', JSON.stringify(object));
        
        switch (dyo.country) {
            case "us": case "ca": case "pg": case "uk": case "eu":
                window.onbeforeunload = null;

                let form_data = new FormData();
                form_data.append('customer_email', sessionStorage.getItem('customer_email'));
                form_data.append('customer_password', sessionStorage.getItem('customer_password'));

                fetch(dyo.path.get_next_order_id, {
                    method: 'POST',
                    body: form_data
                })
                .then((response) => {
                    response.text().then((data) => {

                        let result = JSON.parse(data);
                        sessionStorage.setItem('order_id', Number(result["result"]));
                        
                        let card = {};

                        switch (payment_method) {
                            case 1:
                                card.name = Translate(Lang.ORDER_ID) + ': ' + sessionStorage.getItem('order_id');
                                card.description = dyo.engine.account.currentDesign.design_name;
                                card.image = dyo.path.forever + dyo.path.design + "/" + dyo.engine.account.currentDesign.design_preview.replace(".jpg", "_small.jpg");
                                card.amount = Math.round(dyo.engine.account.currentDesign.design_price * 100);
                                card.currency = dyo.config.country.currency_code;
                                card.quantity = 1;

                                sessionStorage.setItem('order_price', dyo.engine.account.currentDesign.design_price);
                                sessionStorage.setItem('order_currency', dyo.config.country.currency_code);

                                getStripeSession(card);
                                break;
                            case 2:
                                card.name = Translate(Lang.ORDER_ID) + ': ' + sessionStorage.getItem('order_id');
                                card.description = dyo.engine.account.currentDesign.design_name;
                                card.image = dyo.path.forever + dyo.path.design + "/" + dyo.engine.account.currentDesign.design_preview.replace(".jpg", "_small.jpg");
                                card.amount = dyo.engine.account.currentDesign.design_price;
                                card.currency = dyo.config.country.currency_code;
                                card.quantity = 1;

                                sessionStorage.setItem('order_price', dyo.engine.account.currentDesign.design_price);
                                sessionStorage.setItem('order_currency', dyo.config.country.currency_code);

                                setSession(card);
                                getPaypalSession(card);
                                break;
                        }
        
                    });
                });

                break;

            default:

                switch (payment_method) {

                    default:
                        insertOrder(payment_method);
                        break;

                    case 1:
                        // credit card

                        let form_data = new FormData();
                        form_data.append('customer_email', sessionStorage.getItem('customer_email'));
                        form_data.append('customer_password', sessionStorage.getItem('customer_password'));
        
                        fetch(dyo.path.get_next_order_id, {
                            method: 'POST',
                            body: form_data
                        })
                        .then((response) => {
                            response.text().then((data) => {
        
                                let result = JSON.parse(data);
                                sessionStorage.setItem('order_id', Number(result["result"]));

                                let card = {};

                                card.name = Translate(Lang.ORDER_ID) + ': ' + sessionStorage.getItem('order_id');
                                card.description = dyo.engine.account.currentDesign.design_name;
                                card.image = dyo.path.forever + dyo.path.design + "/" + dyo.engine.account.currentDesign.design_preview.replace(".jpg", "_small.jpg");
                                card.amount = Math.round(dyo.engine.account.currentDesign.design_price * 100);
                                card.currency = dyo.config.country.currency_code;
                                card.quantity = 1;

                                setSession(card);
                                //insertOrder(payment_method);

                                window.onbeforeunload = null;
                                    
                                let container = $("#delivery_details-description");

                                let customerName = sessionStorage.getItem('customer_firstname') + ' ' + sessionStorage.getItem('customer_lastname');
                                let customerAddress = sessionStorage.getItem('customer_address');
                                let customerPlace = sessionStorage.getItem('customer_place') + ' ' + sessionStorage.getItem('customer_state') + ' ' + sessionStorage.getItem('customer_postcode');
                                let customerCountry = sessionStorage.getItem('customer_country');

                                container.innerHTML = `
                                <form id="credit_card" name="credit_card" action="https://www.payway.com.au/MakePayment" method="post">
                                <input type="hidden" name="biller_code" value="136051" />
                                <input type="hidden" name="merchant_id" value="23755754" />
                                <input type="hidden" name="payment_amount" value="${dyo.account.currentDesign.design_price}" />
                                <input type="hidden" name="payment_amount_text" value="Total Price" />
                                <input type="hidden" name="information_fields" value="Name,Address,Place,Country" />
                                <input type="hidden" name="Name" value="${customerName}" />
                                <input type="hidden" name="Address" value="${customerAddress}" />
                                <input type="hidden" name="Place" value="${customerPlace}" />
                                <input type="hidden" name="Country" value="${customerCountry}" />
                                <input type="hidden" name="payment_reference" value="${sessionStorage.getItem('order_id')}" />
                                <input type="hidden" name="receipt_address" value="${sessionStorage.getItem('customer_email')}" />
                                </form>`
                             
                                dyo.engine.loader.hide("Orders:421"); 

                                if (dyo.country == "au") {
                                    document.getElementById("delivery_details").classList.remove("mdc-dialog--open");
                                    document.getElementById("credit_card").submit();
                                    dyo.engine.loader.show("Orders:670"); 
                                }

                            });

                        });

                    break;

                }

        }

    } else {

        let info = $('#dyo_delivery_details_info');
        let infoField = dyo.engine.popup_delivery_details.delivery_details_info;

        if (!customer_firstname.value) {
            if (dyo.engine.mobileDevice) {
                customer_firstname.blur();
            } else {
                customer_firstname.focus();
            }
    
            let data = {
                message: Translate(Lang.PLEASE_ENTER_FIRST_NAME),
                timeout: 5000
            };
            dyo.engine.snackbar.open(data);
            return;
        }

        if (!customer_lastname.value) {
            if (dyo.engine.mobileDevice) {
                customer_lastname.blur();
            } else {
                customer_lastname.focus();
            }
    
            let data = {
                message: Translate(Lang.PLEASE_ENTER_LAST_NAME),
                timeout: 5000
            };
            dyo.engine.snackbar.open(data);
            return;
        }

        if (!customer_address.value) {
            if (dyo.engine.mobileDevice) {
                customer_address.blur();
            } else {
                customer_address.focus();
            }
    
            let data = {
                message: Translate(Lang.PLEASE_ENTER_ADDRESS),
                timeout: 5000
            };
            dyo.engine.snackbar.open(data);
            return;
        }

        if (!customer_place.value) {
            if (dyo.engine.mobileDevice) {
                customer_place.blur();
            } else {
                customer_place.focus();
            }
    
            let data = {
                message: Translate(Lang.PLEASE_ENTER_CITY),
                timeout: 5000
            };
            dyo.engine.snackbar.open(data);
            return;
        }

        if (!customer_state.value) {
            if (dyo.engine.mobileDevice) {
                customer_state.blur();
            } else {
                customer_state.focus();
            }
    
            let data = {
                message: Translate(Lang.PLEASE_ENTER_STATE),
                timeout: 5000
            };
            dyo.engine.snackbar.open(data);
            return;
        }

        if (!customer_postcode.value) {
            if (dyo.engine.mobileDevice) {
                customer_postcode.blur();
            } else {
                customer_postcode.focus();
            }
    
            let data = {
                message: Translate(Lang.PLEASE_ENTER_POST_CODE),
                timeout: 5000
            };
            dyo.engine.snackbar.open(data);
            return;
        }

        if (!customer_country.value) {

            if (dyo.engine.mobileDevice) {
                customer_country.blur();
            } else {
                customer_country.focus();
            }
    
            let data = {
                message: Translate(Lang.PLEASE_ENTER_COUNTRY),
                timeout: 5000
            };
            dyo.engine.snackbar.open(data);
            return;

        }

        if (!customer_mobile.value) {
            if (dyo.engine.mobileDevice) {
                customer_mobile.blur();
            } else {
                customer_mobile.focus();
            }
    
            let data = {
                message: Translate(Lang.PLEASE_ENTER_MOBILE),
                timeout: 5000
            };
            dyo.engine.snackbar.open(data);
            return;
        }

    }
        
}