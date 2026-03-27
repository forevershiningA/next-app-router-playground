import { Engine } from './Engine.js';
import { Engine3d } from './Engine3d.js';

const dyo = window.dyo = {};

dyo.path = {};
dyo.xml_path = "";
dyo.accountModule = false;

const paths = () => {
	dyo.path.design = "design/";
	dyo.path.design5 = dyo.path.design + "html5/";
	dyo.path.saved_designs = "saved-designs/";
	dyo.path.php = dyo.path.design + "includes-dyo5/";
	dyo.path.json = dyo.path.php + 'get.php';
	dyo.path.check_password = dyo.path.forever + dyo.path.php + 'check_password.php';
	dyo.path.js_error = dyo.path.forever + dyo.path.php + 'js_error.php';
	dyo.path.upload = dyo.path.forever + dyo.path.php + 'upload5.php';
	dyo.path.upload_directory = dyo.path.forever + dyo.path.design + "upload/";
	dyo.path.upload_masked = dyo.path.forever + dyo.path.php + 'create_masked5.php';
	dyo.path.update = dyo.path.forever + dyo.path.php + 'update.php';
	dyo.path.reset_password = dyo.path.forever + dyo.path.php + 'reset_password.php';
	dyo.path.reset_password_email = dyo.path.forever + dyo.path.php + 'reset_password_email.php';
	dyo.path.reset_password_email_set_new = dyo.path.forever + dyo.path.php + 'reset_password_email_set_new.php';
	dyo.path.register = dyo.path.forever + dyo.path.php + 'register.php';
	dyo.path.login = dyo.path.forever + dyo.path.php + 'login.php';
	dyo.path.save_design = dyo.path.forever + dyo.path.php + 'save.php';
	dyo.path.send_design = dyo.path.forever + dyo.path.php + 'send.php';
	dyo.path.delete_design = dyo.path.forever + dyo.path.php + 'delete.php';
	dyo.path.create_screenshot = dyo.path.forever + dyo.path.php + 'create_screenshots5.php';
	dyo.path.create_image = dyo.path.forever + dyo.path.php + 'create_image.php';
	dyo.path.pdf = dyo.path.forever + dyo.path.php + 'pdf.php';
	dyo.path.order = dyo.path.forever + dyo.path.php + 'order.php';
	dyo.path.order_update_payment_date = dyo.path.forever + dyo.path.php + 'update_order_payment_date.php';
	dyo.path.get_next_order_id = dyo.path.forever + dyo.path.php + 'get_next_order_id.php';
	dyo.path.get_session = dyo.path.forever + dyo.path.php + 'get_session.php';
	dyo.path.session = dyo.path.forever + dyo.path.php + 'session.php';
	dyo.path.stripe_session = dyo.path.forever + dyo.path.php + 'stripe_session.php';
	dyo.path.get_designs = dyo.path.forever + dyo.path.php + 'get_designs.php';
	dyo.path.get_design_data = dyo.path.forever + dyo.path.php + 'get_design_data.php';
	dyo.path.get_designs_count = dyo.path.forever + dyo.path.php + 'get_designs_count.php';
	dyo.path.get_orders = dyo.path.forever + dyo.path.php + 'get_orders.php';
	dyo.path.get_orders_count = dyo.path.forever + dyo.path.php + 'get_orders_count.php';
	dyo.path.read_file = dyo.path.forever + dyo.path.design5 + 'rf.php?directory=';
}

if (document.location.href.indexOf("127.0.0.1") > -1 || 
	document.location.href.indexOf("localhost") > -1 || 
	document.location.href.indexOf("bs-local.com") > -1) {
	
	//dyo.path.forever = "http://localhost/";
	dyo.path.forever = "https://www.forevershining.com.au/";
	//dyo.path.forever = "https://mikutimelesstributes.jp/";
	//dyo.path.forever = 'https://www.headstonesandplaques-papuanewguinea.com/';
	//dyo.path.forever = 'https://headstonesdesigner.com/';
	//dyo.path.forever = 'https://bronzeplaquedesigner.com/';
	//dyo.path.forever = 'https://canadabronzeplaque.ca/';
	//dyo.path.forever = 'https://memorialphotoceramics.com/';
	//dyo.path.forever = 'https://bronze-plaque.com/';
	//dyo.path.forever = 'https://bronze-plaque.co.uk/';
	//dyo.path.forever = 'https://bronze-plaque.eu/';
	//dyo.path.forever = "https://www.wiecznapamiec.pl/";
	dyo.local = true;
} else {
	if (document.location.href.indexOf("https") > -1) {
		dyo.path.forever = "https://" + window.location.hostname + "/";
	} else {
		dyo.path.forever = "http://" + window.location.hostname + "/";
	}
	dyo.local = false;
}

paths();

dyo.build_version = '1.45';
dyo.build_date = 20251014;
//dyo.stripe_key = "pk_test_vjVzC76RkQPsj04twNUl4LK900Ntez8Fwv"; // test
dyo.stripe_key = "pk_live_DKYRjFmV5mPjBM9tm5Q9I4fY00EUt98Iix"; // live
dyo.dpr = window.devicePixelRatio;
dyo.height = window.innerHeight;

if (document.location.href.indexOf("/my-account") > -1 || document.location.href.indexOf("account_mode") > -1) {
	dyo.accountMode = true;
} else if (document.location.href.indexOf("localhost") > -1 && document.location.href.indexOf("account.html") > -1) {
	dyo.accountMode = true;
} else {
	dyo.accountMode = false;
}

if (dyo.accountMode) {
	document.body.style.backgroundColor = "#424242";
}

//accountModule - for allowing Save Designs

dyo.design_edit = [];
dyo.design_buy = [];
dyo.design_more = [];
dyo.order = [];
dyo.grid_size = 16;
dyo.blockDelete = false;

dyo.design_start = 0;
dyo.design_end = 40;
dyo.currentSelectRange = 0;

//dyo.product_id = 124; // Traditional Engraved Headstone
//dyo.product_id = 34; // Traditional Engraved Headstone
//dyo.product_id = 30; // Laser Etched Plaque
//dyo.product_id = 32; // Full-colour Plaque
//dyo.product_id = 52; // YAG Lasered Stainless Steel Plaque
dyo.product_id = 5; // Bronze Plaque
//dyo.product_id = 52; // Bronze Plaque
//dyo.product_id = 8; // Pet Mini Headstone
//dyo.product_id = 9; // Laser Etched Pet Plaque
//dyo.product_id = 31; // Stainless Steel Light Transmitting Plaque
//dyo.product_id = 7; // Ceramic Image
//dyo.product_id = 22; // Mini Headstone
//dyo.product_id = 4; // Laser Etched Headstone
//dyo.product_id = 135; // Pet Rock
//dyo.product_id = 2350; // Stainless Steel Vitreous Enamel Inlaid Urn

dyo.mode = "2d";
dyo.allow_3d = false;
dyo.first_run = true;

if (document.location.href.indexOf("3d") > -1) {

	// 4 - Laser Etched Black Granite Headstone
	// 100 - Laser Etched Black Granite Full Monument
	// 101 - Traditional Engraved Full Monument
	// 102 - Traditional Engraved Headstone

	dyo.product_id = 4;
	//dyo.product_id = 30;
	//dyo.product_id = 5;
	//dyo.product_id = 8; // Pet Mini Headstone
	//dyo.product_id = 100; // Laser Etched Black Granite Full Monument
	//dyo.product_id = 101; // Traditional Engraved Full Monument
	//dyo.product_id = 102; // Traditional Engraved Headstone

	dyo.mode = "3d";
	dyo.allow_3d = true;
}

if (document.location.href.indexOf("traditional-engraved-full-monuments") > -1) {
	dyo.product_id = 101; // Traditional Engraved Full Monument
	dyo.mode = "3d";
	dyo.sub_mode = "traditional";
	dyo.allow_3d = true;
}

dyo.code = "au_EN";
dyo.metric = "millimeters";
dyo.edit = false;
dyo.init = false;
dyo.size = {};
dyo.size.headstone = {};
dyo.size.base = {};

let href = document.location.href;
let country_code;
let product_id;
let shape_id;

//dyo.shape_id = 49;

if (href.indexOf("country-code") > -1) {
	country_code = href.split("country-code")[1];

	if (country_code.indexOf("&") > -1) {
		dyo.code = country_code.split("&")[0];
	} else {
		dyo.code = country_code;
	}
}

switch (dyo.path.forever) {

	default: case "https://forevershining.com.au/": case "https://www.forevershining.com.au/":
		dyo.template = 2;
		dyo.country = "au";
		dyo.usa = false;
		dyo.pet = false;
		dyo.code = "au_EN";
		dyo.metric = "mm";
		dyo.accountModule = true;
	
		sessionStorage.setItem('settings_language', dyo.code);
		sessionStorage.setItem('settings_currency', "AUD");
		sessionStorage.setItem('settings_metric', "millimeters");
		break;

	case "https://canadabronzeplaque.ca/": case "https://www.canadabronzeplaque.ca/":
		dyo.template = 2;
		dyo.country = "ca";
		dyo.usa = false;
		dyo.pet = false;
		dyo.code = "ca_EN";
		dyo.metric = "mm";
		dyo.accountModule = true;
	
		sessionStorage.setItem('settings_language', dyo.code);
		sessionStorage.setItem('settings_currency', "CAD");
		sessionStorage.setItem('settings_metric', "millimeters");
		break;

	case "https://mikutimelesstributes.jp/": case "https://www.mikutimelesstributes.jp/":
		dyo.template = 2;
		dyo.country = "jp";
		dyo.usa = false;
		dyo.pet = true;
		dyo.code = "jp_JP";
		dyo.metric = "mm";
		dyo.accountModule = true;
		dyo.product_id = 9; // Laser Etched Pet Plaque

		sessionStorage.setItem('settings_language', dyo.code);
		sessionStorage.setItem('settings_currency', "YEN");
		sessionStorage.setItem('settings_metric', "millimeters");
		break;
	
	case "https://memorialspet.com.au/": case "https://www.memorialspet.com.au/":
		dyo.template = 2;
		dyo.country = "au";
		dyo.usa = false;
		dyo.pet = true;
		dyo.code = "au_EN";
		dyo.metric = "mm";
		dyo.accountModule = true;
		dyo.product_id = 9; // Laser Etched Pet Plaque

		sessionStorage.setItem('settings_language', dyo.code);
		sessionStorage.setItem('settings_currency', "AUD");
		sessionStorage.setItem('settings_metric', "millimeters");
		break;

	case "https://www.memorialphotoceramics.com/": case "https://memorialphotoceramics.com/": 
		dyo.template = 2;
		dyo.country = "us";
		dyo.usa = false;
		dyo.pet = false;
		dyo.code = "au_EN";
		dyo.metric = "mm";
		dyo.accountModule = true;
		dyo.product_id = 7; // Laser Etched Pet Plaque
	
		sessionStorage.setItem('settings_language', dyo.code);
		sessionStorage.setItem('settings_currency', "AUD");
		sessionStorage.setItem('settings_metric', "millimeters");
		break;

	case "https://headstonesandplaques-papuanewguinea.com/": case "https://www.headstonesandplaques-papuanewguinea.com/":
		dyo.template = 2;
		dyo.country = "pg";
		dyo.usa = false;
		dyo.pet = false;
		dyo.code = "pg_EN";
		dyo.metric = "mm";
		dyo.accountModule = true;
	
		sessionStorage.setItem('settings_language', dyo.code);
		sessionStorage.setItem('settings_currency', "PGK");
		sessionStorage.setItem('settings_metric', "millimeters");

		break;

	case "https://headstonesdesigner.com/": case "https://www.headstonesdesigner.com/":
		dyo.template = 2;
		dyo.country = "us";
		dyo.usa = true;
		dyo.pet = false;
		dyo.code = "us_EN";
		dyo.metric = "inches";
		dyo.accountModule = true;
		//dyo.product_id = 4;
	
		sessionStorage.setItem('settings_language', dyo.code);
		sessionStorage.setItem('settings_currency', "USD");
		sessionStorage.setItem('settings_metric', "inches");

		break;

	case "https://www.bronze-plaque.com/": case "https://bronze-plaque.com/": 
		dyo.template = 2;
		dyo.country = "us";
		dyo.usa = true;
		dyo.pet = false;
		dyo.code = "us_EN";
		dyo.metric = "inches";
		dyo.accountModule = true;
	
		sessionStorage.setItem('settings_language', dyo.code);
		sessionStorage.setItem('settings_currency', "USD");
		sessionStorage.setItem('settings_metric', "inches");
		break;

	case "https://www.bronzeplaquedesigner.com/": case "https://bronzeplaquedesigner.com/": 
		dyo.template = 2;
		dyo.country = "us";
		dyo.usa = true;
		dyo.pet = true;
		dyo.code = "us_EN";
		dyo.metric = "inches";
		dyo.accountModule = true;
	
		sessionStorage.setItem('settings_language', dyo.code);
		sessionStorage.setItem('settings_currency', "USD");
		sessionStorage.setItem('settings_metric', "inches");
		break;

	case "https://www.bronze-plaque.eu/": case "https://bronze-plaque.eu/":
		dyo.template = 1;
		dyo.country = "eu";
		dyo.usa = false;
		dyo.pet = false;
		dyo.code = "en_EN";
		dyo.metric = "mm";
		dyo.accountModule = true;
	
		sessionStorage.setItem('settings_language', dyo.code);
		sessionStorage.setItem('settings_currency', "EURO");
		sessionStorage.setItem('settings_metric', "millimeters");
		break;

	case "https://www.bronze-plaque.co.uk/": case "https://bronze-plaque.co.uk/":
		dyo.template = 2;
		dyo.country = "uk";
		dyo.usa = false;
		dyo.pet = false;
		dyo.code = "uk_EN";
		dyo.metric = "mm";
		dyo.accountModule = true;
	
		sessionStorage.setItem('settings_language', dyo.code);
		sessionStorage.setItem('settings_currency', "GBP");
		sessionStorage.setItem('settings_metric', "millimeters");
		break;
	
	case "https://www.wiecznapamiec.pl/": case "https://wiecznapamiec.pl/":
		dyo.template = 1;
		dyo.country = "pl";
		dyo.usa = false;
		dyo.pet = false;
		dyo.code = "pl_PL";
		dyo.metric = "mm";
		dyo.accountModule = true;
	
		sessionStorage.setItem('settings_language', dyo.code);
		sessionStorage.setItem('settings_currency', "PLN");
		sessionStorage.setItem('settings_metric', "millimeters");
		break;

}

if (href.indexOf("product-id") > -1) {
	dyo.product_id_set = true;

	product_id = href.split("product-id")[1];

	let hash = product_id.indexOf("#");
	if (hash > -1) {
		product_id = product_id.substr(0, hash);
	}

	if (product_id.indexOf("&") > -1) {
		dyo.product_id = Number(product_id.split("&")[0]);
	} else {
		dyo.product_id = Number(product_id);
	}
}

if (href.indexOf("edit") > -1) {
	let h = href.split("edit");
	dyo.monument_design_stampid = Number(h[1]);
}

if (href.indexOf("product-id") > -1) {
	if (href.indexOf("&") > -1) {
		if (product_id.split("&")[1].indexOf("shape-id") > -1) {
			href = product_id.split("&")[1];

			if (href.indexOf("shape-id") > -1) {
				shape_id = Number(href.split("shape-id")[1]);
				dyo.shape_id = Number(shape_id);
			}
		}
	}
}

const products = [4, 5, 7, 8, 9, 22, 30, 31, 32, 34, 52, 100, 101, 102, 124, 135, 999, 2350];

let allow = false;
for (let nr = 0; nr < products.length; nr++) {
	if (products[nr] == dyo.product_id) {
		allow = true;
	}
}

if (!allow) {
	if (dyo.mode == "2d") {
		dyo.product_id = 5;
	} else {
		dyo.product_id = 4;
	}
}

if (href.indexOf("ref") > -1) {
	let h = href.split("ref");
	if (h[1] == "dcea1d41fe2007ae55a9f89c996700ee") {
		dyo.accountModule = false;
	}
}

/*
if (document.location.href.indexOf("design/html5/") == -1 && document.location.href.indexOf("localhost") == -1) {
	dyo.xml_path = "https://headstonesdesigner.com/design/html5/";
	dyo.path.forever = 'https://headstonesdesigner.com/';
	dyo.path.upload = dyo.path.forever + dyo.path.php + 'upload5.php';
	dyo.path.upload_directory = dyo.path.forever + dyo.path.design + "upload/";
	dyo.path.upload_masked = dyo.path.forever + dyo.path.php + 'create_masked5.php';
	dyo.path.update = dyo.path.forever + dyo.path.php + 'update.php';
	//dyo.accountModule = false;
} else {
	dyo.xml_path = "";
}
*/

if (document.location.href.indexOf("memorialphotoceramics") > -1 || 
	document.location.href.indexOf("memorialspet.com.au") > -1 || 
	document.location.href.indexOf("mikutimelesstributes.jp") > -1 || 
	document.location.href.indexOf("localhost2") > -1) {
//|| document.location.href.indexOf("localhost") > -1) {
	dyo.path.forever = 'https://www.forevershining.com.au/';
	dyo.path.design = "design/";
	dyo.xml_path = dyo.path.forever + dyo.path.design + "html5/";
	paths();
} else {
	dyo.xml_path = "";
}

// instances init code values

if (document.location.href.indexOf("127.0.0.1") > -1 || document.location.href.indexOf("localhost") > -1) {
	//dyo.template = 1;
}

window.addEventListener('load', () => {
	const engine = new Engine();
	if (dyo.mode == "3d") {
		const engine3d = new Engine3d();
	}
}, {passive: true});

if (dyo.local == false) {
	if (dyo.country == "pl") {
		if ('serviceWorker' in navigator) {

			window.addEventListener('load', function() {

				navigator.serviceWorker.getRegistrations().then(registrations => {
					if (registrations.length == 0) {

						navigator.serviceWorker.register('service-worker.js').then(function(registration) {
							//console.log('ServiceWorker registration successful with scope: ', registration.scope);
						}, function(err) {
							//console.log('ServiceWorker registration failed: ', err);
						});
				
					}
				});

			}, {passive: true});
		}
	}
}

if (!HTMLCanvasElement.prototype.toBlob) {
	Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {
		value: function (callback, type, quality) {
		var dataURL = this.toDataURL(type, quality).split(',')[1];
		setTimeout(function() {

			var binStr = atob( dataURL ),
				len = binStr.length,
				arr = new Uint8Array(len);

			for (var i = 0; i < len; i++ ) {
			arr[i] = binStr.charCodeAt(i);
			}

			callback( new Blob( [arr], {type: type || 'image/png'} ) );

		});
		}
	});
}