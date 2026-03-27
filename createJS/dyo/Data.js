import {_, $, Lang, Translate } from '../Const.js';

export class Data {

    constructor(data = {}) {

		this.setName(data.Name);
		this.setType(data.Type);
		this.cache = [];

	}
	
	set name(value) {
		this.setName(value);
	}

	get name() {
		return this._name;
	}

	setName(value) {
		this._name = value;
	}

	getName() {
		return this._name;
	}

	set type(value) {
		this.setType(value);
	}

	get type() {
		return this._type;
	}

	setType(value) {
		this._type = value;
	}

	getType() {
		return this._type;
	}

	get delivery_methods() {

		const data = [
			{ nr: 1, list: true, name: Translate(Lang.COURIER) }
		]

		return data;

	}

	get payment_methods() {

		let data;
		
		switch (dyo.country) {
			default:
				data = [
					{ nr: 1, list: true, name: Translate(Lang.CREDIT_CARD) + " - pay online"},
					{ nr: 2, list: true, name: Translate(Lang.CREDIT_CARD) + " - pay by phone"},
					{ nr: 3, list: false, name: Translate(Lang.BPAY) },
					{ nr: 4, list: false, name: Translate(Lang.DIRECT_DEPOSIT) },
					{ nr: 5, list: false, name: Translate(Lang.CHEQUE) }
				];	
				break;
			case "us": case "uk": case "eu": case "pg": case "ca":
				data = [
					{ nr: 1, list: true, name: Translate(Lang.CREDIT_CARD) },
					{ nr: 2, list: true, name: Translate(Lang.PAYPAL) }
				];
				break;
			case "pl":
				data = [
					{ nr: 1, list: true, name: Translate(Lang.CREDIT_CARD) }
				];	
				break;

		}

		return data;

	}

	get products() {

		// mode - 1 (2D & 3D)
		// mode - 2 (2D)
		// mode - 3 (3D)

		let ext = "webp";

		if (dyo.engine.deviceOs == "ios") {
			ext = "jpg";
		}

		//ext = "jpg";
		let teh = 124;
		if (dyo.mode == "3d") {
			teh = 102;
		}

		const data = [
			{ 	
				nr: 1, 
				live: 1,
				header: Translate(Lang.PLAQUE),
				name: Translate(Lang.BRONZE_PLAQUE), 
				description: Translate(Lang.BRONZE_PLAQUE_DESCRIPTION), 
				product_id: 5, 
				pet: false,
				mode: 1,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_5-medium." + ext, 
				youtube: "https://www.youtube.com/watch?v=_U6IJJoqk_A" 
			},
			{ 	
				nr: 2,
				live: 1,
				name: Translate(Lang.FULL_COLOUR_PLAQUE), 
				description: Translate(Lang.FULL_COLOUR_PLAQUE_DESCRIPTION), 
				product_id: 32, 
				pet: false,
				mode: 2,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_32-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=61l2alQE4sI" 
			},
			{ 	
				nr: 3,
				live: 1,
				name: Translate(Lang.TRADITIONAL_ENGRAVED_PLAQUE), 
				description: Translate(Lang.TRADITIONAL_ENGRAVED_PLAQUE_DESCRIPTION), 
				product_id: 34, 
				pet: false,
				mode: 1,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_34-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=61l2alQE4sI" 
			},
			{ 	
				nr: 4,
				live: 1,
				name: Translate(Lang.LASER_ETCHED_BLACK_GRANITE_PLAQUE), 
				description: Translate(Lang.LASER_ETCHED_BLACK_GRANITE_PLAQUE_DESCRIPTION), 
				product_id: 30, 
				pet: false,
				mode: 1,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_30-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=7W3Ot4EpZw0"
			},
			{ 	
				nr: 5,
				live: 1,
				name: Translate(Lang.YAG_LASERED_STAINLESS_STEEL_PLAQUE), 
				description: Translate(Lang.YAG_LASERED_STAINLESS_STEEL_PLAQUE_DESCRIPTION), 
				product_id: 52, 
				pet: false,
				mode: 2,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_52-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=61l2alQE4sI" 
			},
			{ 	
				nr: 6,
				live: 0,
				name: Translate(Lang.STAINLESS_STEEL_LIGHT_TRANSMITTING_PLAQUE), 
				description: Translate(Lang.STAINLESS_STEEL_LIGHT_TRANSMITTING_PLAQUE_DESCRIPTION), 
				product_id: 31, 
				pet: false,
				mode: 2,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_31-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=61l2alQE4sI" 
			},
			{ 	
				nr: 7,
				live: 1,
				header: Translate(Lang.HEADSTONE),
				name: Translate(Lang.TRADITIONAL_ENGRAVED_HEADSTONE), 
				description: Translate(Lang.TRADITIONAL_ENGRAVED_HEADSTONE_DESCRIPTION),
				product_id: teh, 
				pet: false,
				mode: 1,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_124-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=-WohUXqkO-4"
			},
			{ 	
				nr: 8,
				live: 1,
				name: Translate(Lang.LASER_ETCHED_BLACK_GRANITE_HEADSTONE), 
				description: Translate(Lang.LASER_ETCHED_BLACK_GRANITE_HEADSTONE_DESCRIPTION),
				product_id: 4, 
				pet: false,
				mode: 1,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_4-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=itMFdSXx4HA"
			},
			{ 	
				nr: 9,
				live: 1,
				name: Translate(Lang.LASER_ETCHED_BLACK_GRANITE_MINI_HEADSTONE), 
				description: Translate(Lang.LASER_ETCHED_BLACK_GRANITE_MINI_HEADSTONE_DESCRIPTION),
				product_id: 22, 
				pet: false,
				mode: 1,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_22-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=iVw77Td-aAo"
			},
			{ 
				nr: 10,
				live: 1,
				header: Translate(Lang.FULL_MONUMENT),
				name: Translate(Lang.LASER_ETCHED_BLACK_GRANITE_FULL_MONUMENT), 
				description: Translate(Lang.LASER_ETCHED_BLACK_GRANITE_FULL_MONUMENT_DESCRIPTION),
				product_id: 100, 
				pet: false,
				mode: 3,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_100-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=VTNcf0-pzGI"
			},
			{ 	
				nr: 11,
				live: 1,
				name: Translate(Lang.TRADITIONAL_ENGRAVED_FULL_MONUMENT), 
				description: Translate(Lang.TRADITIONAL_ENGRAVED_FULL_MONUMENT_DESCRIPTION),
				product_id: 101, 
				pet: false,
				mode: 3,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_101-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=RTNI4OmVukg"
			},
			{ 	
				nr: 12,
				live: 1,
				header: Translate(Lang.URN),
				name: Translate(Lang.STAINLESS_STEEL_VITREOUS_URN), 
				description: Translate(Lang.STAINLESS_STEEL_VITREOUS_URN_DESCRIPTION), 
				product_id: 2350, 
				pet: false,
				mode: 2,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_2350-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=jbr-RCWO2to"
			},
			{ 
				nr: 13,
				live: 1,
				header: Translate(Lang.OTHER),
				name: Translate(Lang.CERAMIC_PHOTO), 
				description: Translate(Lang.CERAMIC_PHOTO_DESCRIPTION), 
				product_id: 7, 
				pet: false,
				mode: 2,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_7-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=UiI-SN-h1K8"
			},
			{ 	
				nr: 14, 
				live: 1,
				header: Translate(Lang.PETS),
				name: Translate(Lang.LASER_ETCHED_BLACK_GRANITE_PET_PLAQUE), 
				description: Translate(Lang.LASER_ETCHED_BLACK_GRANITE_PET_PLAQUE_DESCRIPTION),
				product_id: 9, 
				pet: true,
				mode: 1,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_9-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=CS06oBHLX2A"
			},
			{
				nr: 15, 
				live: 1,
				name: Translate(Lang.LASER_ETCHED_BLACK_GRANITE_PET_MINI_HEADSTONE), 
				description: Translate(Lang.LASER_ETCHED_BLACK_GRANITE_PET_MINI_HEADSTONE_DESCRIPTION),
				product_id: 8, 
				pet: true,
				mode: 1,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_8-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=skwHX4mO59I"
			},
			{ 	
				nr: 16, 
				live: 1,
				name: Translate(Lang.LASER_ETCHED_BLACK_GRANITE_PET_ROCK), 
				description: Translate(Lang.LASER_ETCHED_BLACK_GRANITE_PET_ROCK_DESCRIPTION),
				product_id: 135, 
				pet: true,
				mode: 2,
				class: "products", 
				img: "data/" + ext + "/products2/APP_ID_135-medium." + ext,
				youtube: "https://www.youtube.com/watch?v=oJ3M-gD9Phg"
			}
		]

		return data;

	}

	get ranges() {

		let data = [];

		let href = window.location.href.split("#")[1];

		switch (href) {
			default: case "saved-designs": case "my-account":
				for (let nr = 0; nr < Math.floor(dyo.totalDesigns / 10) + 1; nr ++) {
					data.push({ id: nr, start: nr * 10, end: (nr + 10) + 10, name: ((nr*10)+1)+"-"+((nr*10)+10) });
				}	
				break;
			case "your-orders":
				for (let nr = 0; nr < Math.floor(dyo.totalOrders / 10) + 1; nr ++) {
					data.push({ id: nr, start: nr * 10, end: (nr + 10) + 10, name: ((nr*10)+1)+"-"+((nr*10)+10) });
				}
				break;
		}


		return data;

	}

	get languages() {

		const data = [
			{ id: 0, code: "us_EN", name: "American English" },
			{ id: 1, code: "au_EN", name: "Australian English" },
			{ id: 2, code: "uk_EN", name: "British English" },
			{ id: 3, code: "pl_PL", name: "Polish" },
			{ id: 4, code: "en_EN", name: "English" }

		]

		return data;

	}

	getLanguageId(_language) {

		let id = 0;

		this.languages.forEach(language => {
			if (language.code  == _language) {
				id = language.id;
			}
		});

		return id;

	}

	get currencies() {

		const data = [
			{ id: 0, code: "USD", symbol: "$", name: "USD", side: 0, ratio: 1 },
			{ id: 1, code: "AUD", symbol: "$", name: "AUD", side: 0, ratio: 1 },
			{ id: 2, code: "GBP", symbol: "£", name: "GBP", side: 0, ratio: 0.562 },
			{ id: 3, code: "EURO", symbol: "€", name: "EURO", side: 0, ratio: 0.67 },
			{ id: 4, code: "PLN", symbol: "zł", name: "PLN", side: 1, ratio: 3 },
			{ id: 5, code: "PGK", symbol: "K", name: "PGK", side: 1, ratio: 2.59 },
			{ id: 6, code: "YEN", symbol: "¥", name: "JPY", side: 1, ratio: 98.73 },
			{ id: 7, code: "CAD", symbol: "$", name: "CAD", side: 0, ratio: 1 }
		]

		return data;

	}

	getCurrencyId(_currency) {

		let id = 0;

		this.currencies.forEach(currency => {
			if (currency.code  == _currency) {
				id = currency.id;
			}
		});

		return id;

	}

	getCurrencyRatio(_currency) {

		let ratio = 1;

		this.currencies.forEach(currency => {
			if (currency.code  == _currency) {
				ratio = currency.ratio;
			}
		});

		return ratio;

	}

	getCurrencySymbol(_currency) {

		let symbol = '$';

		this.currencies.forEach(currency => {
			if (currency.code  == _currency) {
				symbol = currency.symbol;
			}
		});

		return symbol;

	}

	getCurrencySide(_currency) {

		let side = 0;

		this.currencies.forEach(currency => {
			if (currency.code  == _currency) {
				side = currency.side;
			}
		});

		return side;

	}

	get metric_system() {

		const data = [
			{ id: 0, code: "inches", name: "Inches" },
			{ id: 1, code: "millimeters", name: "Millimeters" },
		]

		return data;

	}

	getMetricId(_metric) {

		let id = 0;

		this.metric_system.forEach(metric => {
			if (metric.code  == _metric) {
				id = metric.id;
			}
		});

		return id;

	}

	get installations() {

		const data = [
			
			{ name: Lang.MINI_HEADSTONE_ONLY_LAY_FLAT, option: 2, class: "mini-headstones", img: "data/png/installations/flat.png" },
			{ name: Lang.MINI_HEADSTONE_WITH_GRANITE_BASE, option: 1, class: "mini-headstones", img: "data/png/installations/base.png" },
			{ name: Lang.MINI_HEADSTONE_BURIED_INTO_GROUND, option: 3, class: "mini-headstones", img: "data/png/installations/ground.png" },

		]

		return data;

	}

	get fixingSystem() {

		const data = [
			
			{ 
				nr: 1, 
			  	name: "Flat Back", 
			  	option: 1,
			  	class: "plaques", 
			  	img: "data/png/fixingsystem/fixing-flat-back.png",
			  	title: Translate(Lang.FLAT_BACK),
			  	description: Translate(Lang.FLAT_BACK_FOR_GLUE_FIXING),
			  	description_img: "<img alt='" + Translate(Lang.FLAT_BACK_FOR_GLUE_FIXING) + "' src='data/jpg/fixingsystem/l/fixing-flat-back.jpg' style='max-width:100%;' />"
			},
			{ 
				nr: 2, 
				name: "Lugs with Studs", 
				option: 2, 
				class: "plaques", 
				img: "data/png/fixingsystem/fixing-lugs-with-studs.png",
				title: Translate(Lang.LUGS_WITH_STUDS),
				description: Translate(Lang.EXTRA_DURABILITY_AND_EXTRA_FASTENING),
				description_img: "<img alt='" + Translate(Lang.EXTRA_DURABILITY_AND_EXTRA_FASTENING) + "' src='data/jpg/fixingsystem/l/fixing-lugs-with-studs.jpg' style='max-width:100%;' />"
			},
			{ 
				nr: 3,
				name: "Screws (visible from front)", 
				option: 3, 
				class: "plaques", 
				img: "data/png/fixingsystem/fixing-screws.png",
				title: Translate(Lang.SCREWS_VISIBLE_FROM_FRONT),
				description: "",
				description_img: "<img alt='" + Translate(Lang.SCREWS_VISIBLE_FROM_FRONT) + "' src='data/jpg/fixingsystem/l/fixing-screws.jpg' style='max-width:100%;' />"
			 }

		]

		return data;

	}

	get corners() {

		const data = [
			
			{ 
				nr: 1, 
			  	name: "Rounded", 
			  	option: 1,
			  	class: "plaques", 
			  	img: "data/png/corners/rounded.png",
			  	title: Translate(Lang.ROUNDED),
			  	description: Translate(Lang.ROUNDED),
			  	description_img: "<img alt='" + Translate(Lang.ROUNDED) + "' src='data/jpg/corners/rounded.jpg' style='max-width:100%;' />"
			},
			{ 
				nr: 2, 
				name: "Straight", 
				option: 2, 
				class: "plaques", 
				img: "data/png/corners/straight.png",
				title: Translate(Lang.STRAIGHT),
				description: Translate(Lang.STRAIGHT),
				description_img: "<img alt='" + Translate(Lang.STRAIGHT) + "' src='data/jpg/corners/straight.jpg' style='max-width:100%;' />"
			}

		]

		return data;

	}

	get holes() {

		const data = [
			
			{ 
				nr: 1, 
			  	name: Translate(Lang.ON_CORNERS), 
			  	option: 1,
			  	class: "plaques", 
			  	img: "data/png/holes/4-on-4-corners.png",
			  	title: Translate(Lang.ON_CORNERS),
			  	description: Translate(Lang.ON_CORNERS),
			  	description_img: "<img alt='" + Translate(Lang.ON_CORNERS) + "' src='data/jpg/holes/4-on-4-corners.jpg' style='max-width:100%;' />"
			},
			{ 
				nr: 2, 
				name: Translate(Lang.ON_TOP_CORNERS), 
				option: 2, 
				class: "plaques", 
				img: "data/png/holes/2-on-top-2-corners.png",
				title: Translate(Lang.ON_TOP_CORNERS),
				description: Translate(Lang.ON_TOP_CORNERS),
				description_img: "<img alt='" + Translate(Lang.ON_TOP_CORNERS) + "' src='data/jpg/holes/2-on-top-2-corners.jpg' style='max-width:100%;' />"
			},
			{ 
				nr: 3, 
				name: Translate(Lang.NO_DRILLED_HOLES), 
				option: 3, 
				class: "plaques", 
				img: "data/png/holes/no-drilled-holes.png",
				title: Translate(Lang.NO_DRILLED_HOLES),
				description: Translate(Lang.NO_DRILLED_HOLES),
				description_img: "<img alt='" + Translate(Lang.NO_DRILLED_HOLES) + "' src='data/jpg/holes/no-drilled-holes.jpg' style='max-width:100%;' />"
			}

		]

		return data;

	}

	get stands() {

		const data = [
			
			{ 
				nr: 1, 
			  	name: Translate(Lang.NO_STAND), 
			  	option: 1,
			  	class: "plaques", 
			  	img: "data/svg/borders/border_0_0x000000.svg",
			  	title: Translate(Lang.NO_STAND)
			},
			{ 
				nr: 2, 
				name: Translate(Lang.SEPARATE), 
				option: 2, 
				class: "plaques", 
				img: "data/jpg/stand/separate.jpg",
				title: Translate(Lang.SEPERATE)
			},
			{ 
				nr: 3, 
				name: Translate(Lang.INBUILT), 
				option: 3, 
				class: "plaques", 
				img: "data/svg/borders/border_0_raised_0x000000.svg",
				title: Translate(Lang.INBUILT)
			}

		]

		return data;

	}

	get shapes() {

		let mh = "mini-headstones";
		let pp = "petplaques";
		let h = "headstones";
		let p = "data/svg/headstones/";
		let d = "Headstone";
		let e = "headstone";
		let cp = "Cropped Peak";
		let cg = "Curved Gable";
		let cr = "Curved Peak";
		let ct = "Curved Top";
		let hr = "Half Round";
		let g = "Gable";
		let lw = "Left Wave";
		let r = "Peak";
		let rw = "Right Wave";
		let s = "Serpentine";
		let rectangle = "Rectangle";
		let square = "Square";

		if (dyo.code == "jp_JP") {
			rectangle = "長方形";
			square = "正方形";
		}

		const data = [

			{ name: cp, m3d: true, drawing: cp, class: mh, width: 200, height: 300, fixed: 0, ratio: 0.25, scale: 1, img: p + "cropped_peak.svg" },
			{ name: cg, m3d: true, drawing: cg, class: mh, width: 200, height: 300, fixed: 0, ratio: 0.4, scale: 1, img: p + "curved_gable.svg" },
			{ name: cr, m3d: true, drawing: cr, class: mh, width: 200, height: 300, fixed: 0, ratio: 0.25, scale: 1, img: p + "curved_peak.svg" },
			{ name: ct, m3d: true, drawing: ct, class: mh, width: 200, height: 300, fixed: 0, ratio: 0.25, scale: 1, img: p + "curved_top.svg" },
			{ name: hr, m3d: true, drawing: hr, class: mh, width: 200, height: 300, fixed: 0, ratio: 0.66, scale: 1, img: p + "half_round.svg" },
			{ name: g, m3d: true, drawing: g, class: mh, width: 200, height: 300, fixed: 0, ratio: 0.4, scale: 1, img: p + "gable.svg" },
			{ name: lw, m3d: true, drawing: lw, class: mh, width: 200, height: 300, fixed: 0, ratio: 0.4, scale: 1, img: p + "left_wave.svg" },
			{ name: r, m3d: true, drawing: r, class: mh, width: 200, height: 300, fixed: 0, ratio: 0.25, scale: 1, img: p + "peak.svg" },
			{ name: rw, m3d: true, drawing: rw, class: mh, width: 200, height: 300, fixed: 0, ratio: 0.4, scale: 1, img: p + "right_wave.svg" },
			{ name: s, m3d: true, drawing: s, class: mh, width: 200, height: 300, fixed: 0, ratio: 0.25, scale: 1, img: p + "serpentine.svg" },
			{ name: rectangle, m3d: true, drawing: "Square", class: mh, width: 200, height: 300, fixed: 0, ratio: 0, scale: 1, img: p + "portrait.svg" },
			
			{ name: cp, m3d: true, drawing: cp, class: h, width: 600, height: 600, fixed: 0, ratio: 0.25, scale: 1, img: p + "cropped_peak.svg" },
			{ name: cg, m3d: true, drawing: cg, class: h, width: 600, height: 600, fixed: 0, ratio: 0.4, scale: 1, img: p + "curved_gable.svg" },
			{ name: cr, m3d: true, drawing: cr, class: h, width: 600, height: 600, fixed: 0, ratio: 0.25, scale: 1, img: p + "curved_peak.svg" },
			{ name: ct, m3d: true, drawing: ct, class: h, width: 600, height: 600, fixed: 0, ratio: 0.25, scale: 1, img: p + "curved_top.svg" },
			{ name: hr, m3d: true, drawing: hr, class: h, width: 600, height: 600, fixed: 0, ratio: 0.66, scale: 1, img: p + "half_round.svg" },
			{ name: g, m3d: true, drawing: g, class: h, width: 600, height: 600, fixed: 0, ratio: 0.4, scale: 1, img: p + "gable.svg" },
			{ name: lw, m3d: true, drawing: lw, class: h, width: 600, height: 600, fixed: 0, ratio: 0.4, scale: 1, img: p + "left_wave.svg" },
			{ name: r, m3d: true, drawing: r, class: h, width: 600, height: 600, fixed: 0, ratio: 0.25, scale: 1, img: p + "peak.svg" },
			{ name: rw, m3d: true, drawing: rw, class: h, width: 600, height: 600, fixed: 0, ratio: 0.4, scale: 1, img: p + "right_wave.svg" },
			{ name: s, m3d: true, drawing: s, class: h, width: 600, height: 600, fixed: 0, ratio: 0.25, scale: 1, img: p + "serpentine.svg" },
			{ name: "Square", m3d: true, drawing: "Square", class: h, width: 600, height: 600, fixed: 0, ratio: 0, scale: 1, img: p + "square.svg" },
			{ name: "Headstone 1", m3d: true, drawing: d + " 1", class: h, width: 350, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_1.svg" },
			{ name: "Headstone 2", m3d: true, drawing: d + " 2", class: h, width: 560, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_2.svg" },
			{ name: "Guitar 1", m3d: true, drawing: d + " 3", class: h, width: 580, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_3.svg" },
			{ name: "Guitar 2", m3d: true, drawing: d + " 4", class: h, width: 590, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_4.svg" },
			{ name: "Guitar 3", m3d: true, drawing: d + " 5", class: h, width: 580, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_5.svg" },
			{ name: "Guitar 4", m3d: true, drawing: d + " 6", class: h, width: 590, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_6.svg" },
			{ name: "Guitar 5", m3d: true, drawing: d + " 7", class: h, width: 600, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_7.svg" },
			{ name: d + " 3", m3d: true, drawing: d + " 8", class: h, width: 350, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_8.svg" },
			{ name: d + " 4", m3d: true, drawing: d + " 9", class: h, width: 435, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_9.svg" },
			{ name: d + " 5", m3d: true, drawing: d + " 10", class: h, width: 465, height: 600, fixed: 4,  ratio: 0, scale: 1, img: p + e + "_10.svg" },
			{ name: d + " 6", m3d: true, drawing: d + " 11", class: h, width: 515, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_11.svg" },
			{ name: d + " 7", m3d: true, drawing: d + " 12", class: h, width: 570, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_12.svg" },
			{ name: d + " 8", m3d: true, drawing: d + " 13", class: h, width: 350, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_13.svg" },
			{ name: d + " 9", m3d: true, drawing: d + " 14", class: h, width: 480, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_14.svg" },
			{ name: d + " 10", m3d: true, drawing: d + " 15", class: h, width: 485, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_15.svg" },
			{ name: d + " 11", m3d: true, drawing: d + " 16", class: h, width: 520, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_16.svg" },
			{ name: d + " 12", m3d: true, drawing: d + " 17", class: h, width: 575, height: 600, fixed: 4, ratio: 0.4, scale: 1, img: p + e + "_17.svg" },
			{ name: d + " 13", m3d: true, drawing: d + " 18", class: h, width: 390, height: 600, fixed: 4, ratio: 0.5, scale: 1, img: p + e + "_18.svg" },
			{ name: d + " 14", m3d: true, drawing: d + " 19", class: h, width: 390, height: 600, fixed: 4, ratio: 0.4, scale: 1, img: p + e + "_19.svg" },
			{ name: d + " 15", m3d: true, drawing: d + " 20", class: h, width: 435, height: 600, fixed: 4, ratio: 0.9, scale: 1, img: p + e + "_20.svg" },
			{ name: d + " 16", m3d: true, drawing: d + " 21", class: h, width: 475, height: 600, fixed: 4, ratio: 0.4, scale: 1, img: p + e + "_21.svg" },
			{ name: d + " 17", m3d: true, drawing: d + " 22", class: h, width: 340, height: 600, fixed: 4, ratio: 0.5, scale: 1, img: p + e + "_22.svg" },
			{ name: d + " 18", m3d: true, drawing: d + " 23", class: h, width: 350, height: 600, fixed: 4, ratio: 0.5, scale: 1, img: p + e + "_23.svg" },
			{ name: d + " 19", m3d: true, drawing: d + " 24", class: h, width: 365, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_24.svg" },
			{ name: d + " 20", m3d: true, drawing: d + " 25", class: h, width: 350, height: 600, fixed: 4, ratio: 0.9, scale: 1, img: p + e + "_25.svg" },
			{ name: d + " 21", m3d: true, drawing: d + " 26", class: h, width: 300, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_26.svg" },
			{ name: d + " 22", m3d: true, drawing: d + " 27", class: h, width: 590, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_27.svg" },
			{ name: d + " 23", m3d: true, drawing: d + " 28", class: h, width: 500, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_28.svg" },
			{ name: d + " 24", m3d: true, drawing: d + " 29", class: h, width: 360, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_29.svg" },
			{ name: d + " 25", m3d: true, drawing: d + " 30", class: h, width: 350, height: 600, fixed: 4, ratio: 0.5, scale: 1, img: p + e + "_30.svg" },
			{ name: d + " 26", m3d: true, drawing: d + " 31", class: h, width: 430, height: 600, fixed: 4, ratio: 0.5, scale: 1, img: p + e + "_31.svg" },
			{ name: d + " 27", m3d: true, drawing: d + " 32", class: h, width: 520, height: 600, fixed: 4, ratio: 0.5, scale: 1, img: p + e + "_32.svg" },
			{ name: d + " 28", m3d: true, drawing: d + " 33", class: h, width: 365, height: 600, fixed: 4, ratio: 0.4, scale: 1, img: p + e + "_33.svg" },
			{ name: d + " 29", m3d: true, drawing: d + " 34", class: h, width: 380, height: 600, fixed: 4, ratio: 0.5, scale: 1, img: p + e + "_34.svg" },
			{ name: d + " 30", m3d: true, drawing: d + " 35", class: h, width: 415, height: 600, fixed: 4, ratio: 0.7, scale: 1, img: p + e + "_35.svg" },
			{ name: d + " 31", m3d: true, drawing: d + " 36", class: h, width: 490, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_36.svg" },
			{ name: d + " 32", m3d: true, drawing: d + " 38", class: h, width: 600, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_38.svg" },
			//{ name: d + " 33", m3d: true, drawing: d + " 39", class: h, width: 345, height: 600, fixed: 4, ratio: 0.5, scale: 1, img: p + e + "_39.svg" },
			{ name: d + " 33", m3d: true, drawing: d + " 40", class: h, width: 350, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_40.svg" },
			{ name: d + " 34", m3d: true, drawing: d + " 41", class: h, width: 400, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_41.svg" },
			{ name: d + " 35", m3d: true, drawing: d + " 42", class: h, width: 300, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_42.svg" },
			{ name: d + " 36", m3d: true, drawing: d + " 43", class: h, width: 600, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_43.svg" },
			{ name: d + " 37", m3d: true, drawing: d + " 44", class: h, width: 600, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_44.svg" },
			{ name: d + " 38", m3d: true, drawing: d + " 45", class: h, width: 630, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_45.svg" },
			{ name: d + " 39", m3d: true, drawing: d + " 46", class: h, width: 590, height: 600, fixed: 4, ratio: 0, scale: 1, img: p + e + "_46.svg" },
			
			//{ name: "Landscape", drawing: "Square", class: "plaques", border: "Border 1", fixed: 0,  width: 300, height: 200, scale: 1, img: p + "landscape.svg" },
			//{ name: "Portrait", drawing: "Square", class: "plaques", border: "Border 1", fixed: 0, width: 200, height: 300, scale: 1, img: p + "portrait.svg" },
			//{ name: "Oval", drawing: "Oval", class: "plaques", border: "Border Oval", width: 200, height: 300, ratio: 0.95, fixed: 2, scale: 1, img: "data/svg/masks/oval_vertical.svg" },
			
			{ name: "Rectangle (Landscape)", m3d: true, drawing: "Square", class: "plaques", border: "Border 1", fixed: 0, width: 300, height: 200, scale: 1, img: p + "landscape.svg" },
			{ name: "Rectangle (Portrait)", m3d: true, drawing: "Square", class: "plaques", border: "Border 1", fixed: 0, width: 200, height: 300, scale: 1, img: p + "portrait.svg" },
			{ name: "Oval (Landscape)", m3d: false, drawing: "Oval Landscape", class: "plaques", border: "Border Oval Landscape", fixed: 2, width: 400, height: 275, ratio: 0.25, scale: 1, img: "data/svg/masks/oval_horizontal.svg" },
			{ name: "Oval (Portrait)", m3d: false, drawing: "Oval", class: "plaques", border: "Border Oval", fixed: 2, width: 275, height: 400, ratio: 0.25, scale: 1, img: "data/svg/masks/oval_vertical.svg" },
			{ name: "Circle", m3d: false, drawing: "Circle", class: "plaques", border: "Border Circle", fixed: 2, width: 400, height: 400, ratio: 0.25, scale: 1, img: "data/svg/masks/circle.svg" },
			
			{ nr: 1, name: rectangle + " 125x175", m3d: true, drawing: "Square", class: pp, fixed: 0, width: 125, height: 175, scale: 1, img: p + "portrait.svg" },
			{ nr: 2, name: rectangle + " 175x125", m3d: true, drawing: "Square", class: pp, fixed: 0, width: 175, height: 125, scale: 1, img: p + "landscape.svg" },
			{ nr: 2, name: rectangle + " 200x250", m3d: true, drawing: "Square", class: pp, fixed: 0, width: 200, height: 250, scale: 1, img: p + "portrait.svg" },
			{ nr: 2, name: rectangle + " 200x300", m3d: true, drawing: "Square", class: pp, fixed: 0, width: 200, height: 300, scale: 1, img: p + "portrait.svg" },
			{ nr: 2, name: rectangle + " 250x200", m3d: true,  drawing: "Square", class: pp, fixed: 0, width: 250, height: 200, scale: 1, img: p + "landscape.svg" },
			{ nr: 2, name: rectangle + " 300x150", m3d: true, drawing: "Square", class: pp, fixed: 0, width: 300, height: 150, scale: 1, img: p + "landscape.svg" },
			{ nr: 2, name: rectangle + " 300x200", m3d: true, drawing: "Square", class: pp, fixed: 0, width: 300, height: 200, scale: 1, img: p + "landscape.svg" },
			{ nr: 2, name: square + " 125x125", m3d: true, drawing: "Square", class: pp, fixed: 0, width: 125, height: 125, scale: 1, img: p + "square.svg" },
			{ nr: 2, name: square + " 200x200", m3d: true, drawing: "Square", class: pp, fixed: 0, width: 200, height: 200, scale: 1, img: p + "square.svg" },
			/*{ nr: 2, name: "Square 240x240", drawing: "Square", class: "petplaques", fixed: 0, width: 240, height: 240, scale: 1, img: p + "square.svg" },*/
			{ nr: 2, name: square + " 300x300", m3d: true, drawing: "Square", class: pp, fixed: 0, width: 300, height: 300, scale: 1, img: p + "square.svg" },
			
			{ nr: 1, name: "Landscape", m3d: true, drawing: "Square", class: "fullcolourplaque", fixed: 0, width: 250, height: 200, scale: 1, img: p + "landscape.svg" },
			{ nr: 2, name: "Portrait", m3d: true, drawing: "Square", class: "fullcolourplaque", fixed: 0, width: 200, height: 250, scale: 1, img: p + "portrait.svg" },
			
			{ nr: 3, name: "Bone", drawing: "Bone", class: "petrock", fixed: 2, width: 220, height: 100, note: "bone", scale: 1, img: p + "pet_bone.svg" },
			{ nr: 4, name: "Cat Bowl", drawing: "Bowl-Cat", class: "petrock", fixed: 2, width: 220, height: 220, note: "bowl", scale: 1, img: p + "pet_bowl_cat.jpg" },
			{ nr: 4, name: "Dog Bowl", drawing: "Bowl", class: "petrock", fixed: 2, width: 220, height: 220, note: "bowl", scale: 1, img: p + "bowl.jpg" },
			{ nr: 5, name: "Heart", drawing: "Heart", class: "petrock", fixed: 2, width: 220, height: 200, note: "heart", scale: 1, img: p + "pet_heart.svg" },
			{ nr: 6, name: "Paw", drawing: "Paw", class: "petrock", fixed: 2, width: 220, height: 210, note: "paw", scale: 1, img: p + "pet_paw.svg" },
			
			{ name: "Heart", drawing: "Urn Heart", class: "urns", border: "Border Heart", width: 302, height: 307, ratio: 0.95, fixed: 2, scale: 1, img: "data/svg/urns/heart.svg" },
			{ name: "Oval", drawing: "Oval", class: "urns", border: "Border Oval", width: 206, height: 285, ratio: 0.95, fixed: 2, scale: 1, img: "data/svg/masks/oval_vertical.svg" },
			{ name: "Rectangle", drawing: "Urn Rectangle", class: "urns", border: "Border Rectangle", width: 200, height: 270, ratio: 0.95, fixed: 2, scale: 1, img: "data/svg/masks/rectangle_vertical.svg" },
			/*{ name: "Teardrop", drawing: "Teardrop", class: "urns", border: "Border Teardrop", width: 188, height: 307, ratio: 0.95, fixed: 2, scale: 1, img: "data/svg/urns/teardrop.svg" },*/
			{ name: "Triangle", drawing: "Triangle", class: "urns", border: "Border Triangle", width: 242, height: 211, ratio: 0.95, fixed: 2, scale: 1, img: "data/svg/urns/triangle.svg" },
			
			{ name: "Oval (Portrait)", drawing: "Oval Portrait", class: "images", fixed: 2, width: 200, height: 300, ratio: 0.25, scale: 1, img: "data/svg/masks/oval_vertical.svg" },
			{ name: "Oval (Landscape)", drawing: "Oval Landscape", class: "images", fixed: 2, width: 300, height: 200, ratio: 0.25, scale: 1, img: "data/svg/masks/oval_horizontal.svg" },
			{ name: "Rectangle (Portrait)", drawing: "Rectangle Portrait", class: "images", fixed: 2, width: 200, height: 300, scale: 1, img: p + "portrait.svg" },
			{ name: "Rectangle (Landscape)", drawing: "Rectangle Landscape", class: "images",fixed: 2,  width: 300, height: 200, scale: 1, img: p + "landscape.svg" }
			
		]

		return data;

	}
	
	get borders() {

		switch (dyo.monument.id) {

			case 5: case 999:
				return [{ nr: 0, name: "No Border", disp_name: "Plain cut (no border)", m3d: true, drawing: "No Border", class: "plaques", ratio: 0.25, img: "data/svg/borders/border0.svg" },
					{ nr: 1, name: "Border 1", disp_name: "Bar", m3d: true, drawing: "Border 1", class: "plaques", ratio: 0.25, img: "data/svg/borders/border1.svg" },
					{ nr: 2, name: "Border 2", disp_name: "Square", m3d: true, drawing: "Border 2", class: "plaques", ratio: 0.25, img: "data/svg/borders/border2.svg" },
					{ nr: 3, name: "Border 3", disp_name: "Solid outline", m3d: true, drawing: "Border 3", class: "plaques", ratio: 0.25, img: "data/svg/borders/border3.svg" },
					{ nr: 4, name: "Border 4", disp_name: "Solid", m3d: true, drawing: "Border 4", class: "plaques", ratio: 0.25, img: "data/svg/borders/border4.svg" },
					{ nr: 5, name: "Border 5", disp_name: "Notch", m3d: true, drawing: "Border 5", class: "plaques", ratio: 0.25, img: "data/svg/borders/border5.svg" },
					{ nr: 6, name: "Border 6", disp_name: "Scallop", m3d: true, drawing: "Border 6", class: "plaques", ratio: 0.25, img: "data/svg/borders/border6.svg" },
					{ nr: 7, name: "Border 7", disp_name: "Round outline", m3d: true, drawing: "Border 7", class: "plaques", ratio: 0.25, img: "data/svg/borders/border7.svg" },
					{ nr: 8, name: "Border 8", disp_name: "Floral", m3d: true, drawing: "Border 8", class: "plaques", msg: "The finished plaque will have whole, evenly spaced border elements", ratio: 0.25, img: "data/svg/borders/border8.svg" },
					{ nr: 9, name: "Border 9", disp_name: "Decorative", m3d: true, drawing: "Border 9", class: "plaques", msg: "The finished plaque will have whole, evenly spaced border elements", ratio: 0.25, img: "data/svg/borders/border9.svg" },
					{ nr: 10, name: "Border 10", disp_name: "Square angular", m3d: true, drawing: "Border 10", class: "plaques", ratio: 0.25, img: "data/svg/borders/border10.svg" }]
				break;

			case 31:
				return [{ name: "No Border", drawing: "No Border", class: "plaques", ratio: 0.25, img: "data/svg/borders/border_0_0x000000.svg" },
					{ name: "Raised", drawing: "Raised - No Pattern", class: "plaques", ratio: 0.25, img: "data/svg/borders/border_0_raised_0x000000.svg" }]
				break;
				/*
				return [{ name: "No Border", drawing: "No Border", class: "plaques", ratio: 0.25, img: "data/svg/borders/border_0_0x000000.svg" },
					{ name: "Raised - No Pattern", drawing: "Raised - No Pattern", class: "plaques", ratio: 0.25, img: "data/svg/borders/border_0_raised_0x000000.svg" },
					{ name: "Flush", drawing: "Flush", class: "plaques", ratio: 0.25, img: "data/svg/borders/border_0_flush_pattern_0x000000.svg" },
					{ name: "Raised", drawing: "Raised", class: "plaques", ratio: 0.25, img: "data/svg/borders/border_0_raised_pattern_0x000000.svg" },
					{ name: "Border 1", drawing: "Border 11", class: "plaques", ratio: 0.25, img: "data/svg/borders/border_11_0x000000.svg" },
					{ name: "Border 2", drawing: "Border 12", class: "plaques", ratio: 0.25, img: "data/svg/borders/border_12_0x000000.svg" },
					{ name: "Border 3", drawing: "Border 13", class: "plaques", ratio: 0.25, img: "data/svg/borders/border_13_0x000000.svg" }]
				break;
				*/
			case 32:
				return [{ name: "No Border", drawing: "No Border", class: "fullcolourplaque", ratio: 0.25, img: "data/svg/borders/border0_999.svg" },
					{ name: "Stainless Steel Border", drawing: "Border 4", class: "fullcolourplaque", ratio: 0.25, img: "data/svg/borders/border4_999.svg" }]
				break;
	
		}

	}

	get motif_part() {
		const data = [
			{ id: 0, list: true, name: "Top part", src: "" },
			{ id: 1, list: true, name: "Bottom part", src: "" }
		]

		return data;
	}

	get social() {
		const data = [
			{ id: 0, list: true, name: "Email", src: "mailto:?subject=$title&body=$url" },
			{ id: 1, list: true, name: "URL", src: "/design/html5/shared/$id" },
			{ id: 2, list: true, name: "Facebook", src: "https://www.facebook.com/sharer/sharer.php?u=$url&picture=$media&caption=$title&description=$description" },
			{ id: 3, list: true, name: "Twitter", src: "https://twitter.com/intent/tweet?text=$title&url=$url&image=$media" },
			{ id: 4, list: true, name: "LinkedIn", src: "https://www.linkedin.com/shareArticle?mini=true&url=$url&title=$title&summary=$description&source=$link" },
		]

		return data;
	}

	get fonts() {

		let data;

		switch (dyo.code) {

			default:
				data = [
					{ id: 0, name: "Adorable", lineHeight: 1.3, src: "assets/fonts/adorable.woff" },
					{ id: 1, name: "Arial",  lineHeight: 1.3, src: "assets/fonts/Arial.woff" },
					{ id: 2, name: "Chopin Script", lineHeight: 1.75,  src: "assets/fonts/chopinscript-webfont.woff" },
					{ id: 3, name: "Dobkin",  lineHeight: 1.25, src: "assets/fonts/DobkinPlain-webfont.woff" },
					{ id: 4, name: "Franklin Gothic", lineHeight: 1.25, src: "assets/fonts/franklin.woff" },
					{ id: 5, name: "French Script", lineHeight: 1.25, src: "assets/fonts/french.woff" },
					{ id: 6, name: "Garamond", lineHeight: 1.25, src: "assets/fonts/garamond.woff" },
					{ id: 7, name: "Great Vibes", lineHeight: 1.6, src: "assets/fonts/great_vibes.woff" },
					{ id: 8, name: "Lucida Calligraphy", lineHeight: 1.4, src: "assets/fonts/lucida.woff" },
					{ id: 9, name: "Xirwena", lineHeight: 2.5, src: "assets/fonts/xirwena1_0.woff" }
				]
		
				break;

			case "jp_JP":
				data = [
					{ id: 0, name: "Hina Mincho", lineHeight: 1.3, src: "assets/fonts/HinaMincho-Regular.woff" },
					{ id: 1, name: "Noto Sans JP", lineHeight: 1.3, src: "assets/fonts/NotoSansJP-VariableFont_wght.woff" },
					{ id: 2, name: "Potta One", lineHeight: 1.3, src: "assets/fonts/PottaOne-Regular.woff" },
					{ id: 3, name: "RocknRoll One", lineHeight: 1.3, src: "assets/fonts/RocknRollOne-Regular.woff" },
					{ id: 4, name: "Shippori Antique", lineHeight: 1.3, src: "assets/fonts/ShipporiAntique-Regular.woff" },
					{ id: 5, name: "Zen Maru Gothic", lineHeight: 1.3, src: "assets/fonts/ZenMaruGothic-Regular.woff" }
				]
		
				break;

		}

		return data;

	}

	get fonts_steel() {

		const data = [
			{ id: 0, name: "Arial",  lineHeight: 1.3, src: "assets/fonts/Arial.woff" },
			{ id: 1, name: "French Script", lineHeight: 1.25, src: "assets/fonts/french.woff" },
			{ id: 2, name: "Garamond", lineHeight: 1.25, src: "assets/fonts/garamond.woff" }
		]

		return data;

	}

	get colors() {
		
		let pf = "Paint Fill";
		let p = "data/jpg/backgrounds/colors/s/";

 		const data = [
			{ name: "Gold Gilding", img: p + "01.jpg", hex: "#c99d44" },
			{ name: "Silver Gilding", img: p + "35.jpg", hex: "#eeeeee" },
			{ name: "Alizarin", img: p + "02.jpg", hex: "#f6303e" },
			{ name: "Tangerine (gold drop)", img: p + "03.jpg", hex: "#f28b00" },
			{ name: "Tangerine yellow", img: p + "04.jpg", hex: "#ffce00" },
			{ name: "Sherwood Green", img: p + "05.jpg", hex: "#154733" },
			{ name: "Java", img: p + "06.jpg", hex: "#19988b" },
			{ name: "Indigo", img: p + "07.jpg", hex: "#510b76" },
			{ name: "Black", img: p + "08.jpg", hex: "#000000" },
			{ name: "Brown", img: p + "09.jpg", hex: "#a22b2a" },
			{ name: "International Orange", img: p + "10.jpg", hex: "#fd4f00" },
			{ name: "Gorse", img: p + "11.jpg", hex: "#fee123" },
			{ name: "La Rioja", img: p + "12.jpg", hex: "#c3d600" },
			{ name: "Dark Turquoise", img: p + "13.jpg", hex: "#00c2df" },
			{ name: "East Side", img: p + "14.jpg", hex: "#bd83cb" },
			{ name: "Mako", img: p + "15.jpg", hex: "#4e5859" },
			{ name: "Chantilly", img: p + "16.jpg", hex: "#f0b3cb" },
			{ name: "Texas Rose", img: p + "17.jpg", hex: "#ffb35a" },
			{ name: "Vis Vis", img: p + "18.jpg", hex: "#f7de8c" },
			{ name: "Caribbean Green", img: p + "19.jpg", hex: "#00ce7d" },
			{ name: "Summer Sky", img: p + "20.jpg", hex: "#3b8ede" },
			{ name: "Wistful", img: p + "21.jpg", hex: "#a8a4e0" },
			{ name: "Submarine", img: p + "22.jpg", hex: "#8f9d9d" },
			{ name: "Ruby", img: p + "23.jpg", hex: "#d41568" },
			{ name: "Dark Brown", img: p + "24.jpg", hex: "#643c1f" },
			{ name: "Watercourse", img: p + "25.jpg", hex: "#006746" },
			{ name: "Riptide", img: p + "26.jpg", hex: "#87e2d1" },
			{ name: "Smalt", img: p + "27.jpg", hex: "#00269a" },
			{ name: "Tiara", img: p + "28.jpg", hex: "#bdc6c2" },
			//{ name: pf, img: p + "29.jpg", hex: "#e60895" },
			{ name: "Chocolate", img: p + "30.jpg", hex: "#c26b13" },
			{ name: "Christi", img: p + "31.jpg", hex: "#799a05" },
			{ name: "Robins Egg Blue", img: p + "32.jpg", hex: "#1fcfcb" },
			{ name: "Jordy Blue", img: p + "33.jpg", hex: "#7aa4dd" },
			{ name: "White", img: p + "34.jpg", hex: "#ffffff" }
		]
		
		return data;
           
	}

	get borders_colors() {
		
		let pf = "Glass Backing";
		let p = "data/jpg/glass_backings/s/";

 		const data = [
			{ name: pf, path: p, img: "01defaultred" },
			{ name: pf, path: p, img: "02defaultgreen" },
			{ name: pf, path: p, img: "1009s" },
			{ name: pf, path: p, img: "1009w" },
			{ name: pf, path: p, img: "1102RR" },
			{ name: pf, path: p, img: "1102s" },
			{ name: pf, path: p, img: "1102w" },
			{ name: pf, path: p, img: "1108A" },
			{ name: pf, path: p, img: "1108RR" },
			{ name: pf, path: p, img: "1108w" },
			{ name: pf, path: p, img: "111RR" },
			{ name: pf, path: p, img: "111SF" },
			{ name: pf, path: p, img: "121RR" },
			{ name: pf, path: p, img: "121s" },
			{ name: pf, path: p, img: "121w" },
			{ name: pf, path: p, img: "123H" },
			{ name: pf, path: p, img: "123RR" },
			{ name: pf, path: p, img: "123s" },
			{ name: pf, path: p, img: "123w" },
			{ name: pf, path: p, img: "125RR" },
			{ name: pf, path: p, img: "125s" },
			{ name: pf, path: p, img: "125w" },
			{ name: pf, path: p, img: "132A" },
			{ name: pf, path: p, img: "132w" },
			{ name: pf, path: p, img: "134RR" },
			{ name: pf, path: p, img: "134w" },
			{ name: pf, path: p, img: "136RR" },
			{ name: pf, path: p, img: "136s" },
			{ name: pf, path: p, img: "136w" },
			{ name: pf, path: p, img: "1408A" },
			{ name: pf, path: p, img: "1408RR" },
			{ name: pf, path: p, img: "1408w" },
			{ name: pf, path: p, img: "142A" },
			{ name: pf, path: p, img: "142RR" },
			{ name: pf, path: p, img: "142s" },
			{ name: pf, path: p, img: "142w" },
			{ name: pf, path: p, img: "146RR" },
			{ name: pf, path: p, img: "151RR" },
			{ name: pf, path: p, img: "151w" },
			{ name: pf, path: p, img: "152A" },
			{ name: pf, path: p, img: "152G" },
			{ name: pf, path: p, img: "152RR" },
			{ name: pf, path: p, img: "152s" },
			{ name: pf, path: p, img: "152w" },
			{ name: pf, path: p, img: "161A" },
			{ name: pf, path: p, img: "161s" },
			{ name: pf, path: p, img: "161w" },
			{ name: pf, path: p, img: "171RR" },
			{ name: pf, path: p, img: "171s" },
			{ name: pf, path: p, img: "1808A" },
			{ name: pf, path: p, img: "1808RR" },
			{ name: pf, path: p, img: "1808V" },
			{ name: pf, path: p, img: "1808w" },
			{ name: pf, path: p, img: "200s" },
			{ name: pf, path: p, img: "25072S" },
			{ name: pf, path: p, img: "26072S" },
			{ name: pf, path: p, img: "5238RR" },
			{ name: pf, path: p, img: "5238W" },
			{ name: pf, path: p, img: "5262w" },
			{ name: pf, path: p, img: "5281RR" },
			{ name: pf, path: p, img: "5284RR" },
			{ name: pf, path: p, img: "5331A" },
			{ name: pf, path: p, img: "5331RR" },
			{ name: pf, path: p, img: "5331w" },
			{ name: pf, path: p, img: "5333RR" },
			{ name: pf, path: p, img: "5333SF" },
			{ name: pf, path: p, img: "5333w" },
			{ name: pf, path: p, img: "5342RR" },
			{ name: pf, path: p, img: "5342SF" },
			{ name: pf, path: p, img: "5342W" },
			{ name: pf, path: p, img: "5384RR" },
			{ name: pf, path: p, img: "5384w" },
			{ name: pf, path: p, img: "5386RR" },
			{ name: pf, path: p, img: "5386SF" },
			{ name: pf, path: p, img: "5432RR" },
			{ name: pf, path: p, img: "5911RR" },
			{ name: pf, path: p, img: "5911w" },
			{ name: pf, path: p, img: "591A" }
		]
		
		return data;
           
	}

	get bronzes() {

		let p = "data/jpg/bronzes/phoenix/s/";
		let t = "texture";

		const data = [
			{ name: "Black", class: t, color: "#000000", img: p + "01.jpg" },
			{ name: "Brown", class: t, color: "#48280f", img: p + "02.jpg" },
			{ name: "Casino Blue", class: t, color: "#0c1137", img: p + "03.jpg" },
			{ name: "Dark Brown", class: t, color: "#24160b", img: p + "04.jpg" },
			{ name: "Dark Green", class: t, color: "#1a391a", img: p + "05.jpg" },
			{ name: "Grey", class: t, color: "#6d696a", img: p + "06.jpg" },
			{ name: "Holly Green", class: t, color: "#07723a", img: p + "07.jpg" },
			{ name: "Ice Blue", class: t, color: "#afcadb", img: p + "08.jpg" },
			{ name: "Maroon", class: t, color: "#4c0f1e", img: p + "09.jpg" },
			{ name: "Navy Blue", class: t, color: "#2c2c76", img: p + "10.jpg" },
			{ name: "Purple", class: t, color: "#513a68", img: p + "11.jpg" },
			{ name: "Red", class: t, color: "#c72028", img: p + "12.jpg" },
			{ name: "Sundance Pink", class: t, color: "#c99cb0", img: p + "13.jpg" },
			{ name: "Turquoise", class: t, color: "#295363", img: p + "14.jpg" },
			{ name: "White", class: t, color: "#ffffff", img: p + "15.jpg" }
		]

		return data;

	}


	get product_image() {

		let t = "texture";
		let p = "data/jpg/photos/s/";

		const data = [
			{ name: Translate(Lang.CERAMIC_IMAGE), class: t, img: p + "product-ceramic-image.png", origin: "", m2: "2500", m3: "26500", sample: "" },
			{ name: Translate(Lang.VITREOUS_ENAMEL_IMAGE_OVERLAY), class: t, img: p + "product-vitreous-enamel-image.png", origin: "", m2: "2500", m3: "26500", sample: "" },
			{ name: Translate(Lang.PREMIUM_PLANA), class: t, img: p + "plana.png", origin: "", m2: "2500", m3: "26500", sample: "" }
		]

		return data;

	}

	get metals() {

		let t = "texture";
		let p = "data/jpg/metals/forever/s/";

		const data = [
			{ name: Translate(Lang.BRUSHED_FINISH), class: t, img: p + "brushed-ss-swatch.jpg", origin: "", m2: "2500", m3: "26500", sample: "" },
			{ name: Translate(Lang.HIGHLY_POLISHED_FINISH), class: t, img: p + "high-polished-ss-swatch.jpg", origin: "", m2: "2500", m3: "26500", sample: "" }
		]

		return data;

	}

	get granites() {

		let t = "texture";
		let p = "data/jpg/granites/forever2/s/";

		const data = [
			{ name: "African Black", textColor: "#c99d44", class: t, img: p + "African-Black.jpg", origin: "", m2: "2500", m3: "7900", sample: "" },
			{ name: "African Red", textColor: "#c99d44", class: t, img: p + "African-Red.jpg", origin: "", m2: "2500", m3: "8970", sample: "" },
			{ name: "Australian Calca", textColor: "#000000", class: t, img: p + "Australian-Calca.jpg", origin: "", m2: "2500", m3: "9800", sample: "" },
			{ name: "Australian Grandee", textColor: "#c99d44", class: t, img: p + "Australian-Grandee.jpg", origin: "", m2: "2500", m3: "8690", sample: "" },
			{ name: "Balmoral Green", textColor: "#c99d44", class: t, img: p + "Balmoral-Green.jpg", origin: "", m2: "2500", m3: "9600", sample: "" },
			{ name: "Balmoral Red", textColor: "#eeeeee", class: t, img: p + "Balmoral-Red.jpg", origin: "", m2: "2500", m3: "8970", sample: "" },
			{ name: "Blue Pearl", textColor: "#c99d44", class: t, img: p + "Blue-Pearl.jpg", origin: "", m2: "2500", m3: "9350", sample: "" },
			{ name: "Chinese Calca", textColor: "#000000", class: t, img: p + "Chinese-Calca.jpg", origin: "", m2: "2500", m3: "5810", sample: "" },
			{ name: "Darwin Brown", textColor: "#000000", class: t, img: p + "Darwin-Brown.jpg", origin: "", m2: "2500", m3: "10500", sample: "" },
			{ name: "Emerald Pearl", textColor: "#000000", class: t, img: p + "Emerald-Pearl.jpg", origin: "", m2: "2500", m3: "9180", sample: "" },
			{ name: "English Brown", textColor: "#000000", class: t, img: p + "English-Brown.jpg", origin: "", m2: "2500", m3: "6700", sample: "" },
			{ name: "G439", textColor: "#eeeeee", class: t, img: p + "G439.jpg", origin: "", m2: "2500", m3: "5830", sample: "" },
			{ name: "G623", textColor: "#eeeeee", class: t, img: p + "G623.jpg", origin: "", m2: "2500", m3: "5000", sample: "" },
			{ name: "G633", textColor: "#eeeeee", class: t, img: p + "G633.jpg", origin: "", m2: "2500", m3: "5000", sample: "" },
			{ name: "G654", textColor: "#eeeeee", class: t, img: p + "G654.jpg", origin: "", m2: "2500", m3: "7250", sample: "" },
			{ name: "G788", textColor: "#000000", class: t, img: p + "G788.jpg", origin: "", m2: "2500", m3: "5550", sample: "" },
			{ name: "Glory Gold Spots", textColor: "#ffffff" ,class: t, img: p + "17.jpg", origin: "", m2: "2500", m3: "14000", sample: "" },
			{ name: "Glory Black", textColor: "#ffffff", class: t, img: p + "18.jpg", origin: "", m2: "2500", m3: "15000", sample: "" },
			{ name: "G9426", textColor: "#000000", class: t, img: p + "G9426.jpg", origin: "", m2: "2500", m3: "5400", sample: "" },
			{ name: "Imperial Red", textColor: "#000000", class: t, img: p + "Imperial-Red.jpg", origin: "", m2: "9150", m3: "26500", sample: "" },
			{ name: "Maroon Brown", textColor: "#eeeeee",class: t, img: p + "Marron-Brown.jpg", origin: "", m2: "8860", m3: "26500", sample: "" },
			{ name: "Multicolour Red", textColor: "#000000", class: t, img: p + "Multicolour-red.jpg", origin: "", m2: "2500", m3: "7300", sample: "" },
			{ name: "Noble Black", textColor: "#c99d44", class: t, img: p + "Noble-Black.jpg", origin: "", m2: "2500", m3: "7500", sample: "" },
			{ name: "Noble Red", textColor: "#000000", class: t, img: p + "Noble-Red.jpg", origin: "", m2: "2500", m3: "6580", sample: "" },
			{ name: "Paradiso", textColor: "#000000", class: t, img: p + "Paradiso.jpg", origin: "", m2: "2500", m3: "6865", sample: "" },
			{ name: "Sandstone", textColor: "#000000", class: t, img: p + "Sandstone.jpg", origin: "", m2: "2500", m3: "6800", sample: "" },
			{ name: "Sapphire Brown", textColor: "#eeeeee", class: t, img: p + "Saphire-Brown.jpg", origin: "", m2: "2500", m3: "7180", sample: "" },
			{ name: "Visage Blue", textColor: "#eeeeee", class: t, img: p + "Vizage-Blue.jpg", origin: "", m2: "2500", m3: "6700", sample: "" },
			{ name: "White Carrara", textColor: "#000000", class: t, img: p + "White-Carrara-600-x-600.jpg", origin: "", m2: "2500", m3: "14500", sample: "" },
		]

		if (dyo.mode == "2d") {
			if (dyo.monument._config.formula == "Engraved") {
				for (let nr = 0; nr < data.length; nr++) {
					if (data[nr].name == "Glory Gold Spots") {
						let removed = data.splice(nr, 2);
					}
				}
			}
		}

		return data;

	}

	get backgrounds() {

		let t = "texture";
		let p = "data/jpg/backgrounds/forever/s/";
		let b = "Background";

		const data = [

			{ name: "No Background", class: t, img: "data/svg/borders/border_0_0x999999.svg" },
			{ name: "Upload Image", class: t, img: "data/svg/borders/border_upload_0x999999.svg" },
			{ name: b + " 1", class: t, img: p + "1.jpg" },
			{ name: b + " 2", class: t, img: p + "2.jpg" },
			{ name: b + " 3", class: t, img: p + "3.jpg" },
			{ name: b + " 4", class: t, img: p + "4.jpg" },
			{ name: b + " 5", class: t, img: p + "5.jpg" },
			{ name: b + " 6", class: t, img: p + "6.jpg" },
			{ name: b + " 7", class: t, img: p + "7.jpg" },
			{ name: b + " 8", class: t, img: p + "8.jpg" },
			{ name: b + " 9", class: t, img: p + "9.jpg" },
			{ name: b + " 10", class: t, img: p + "10.jpg" },
			{ name: b + " 11", class: t, img: p + "11.jpg" },
			{ name: b + " 12", class: t, img: p + "12.jpg" },
			{ name: b + " 13", class: t, img: p + "13.jpg" },
			{ name: b + " 14", class: t, img: p + "14.jpg" },
			{ name: b + " 15", class: t, img: p + "15.jpg" },
			{ name: b + " 16", class: t, img: p + "16.jpg" },
			{ name: b + " 17", class: t, img: p + "17.jpg" },
			{ name: b + " 18", class: t, img: p + "18.jpg" },
			{ name: b + " 19", class: t, img: p + "19.jpg" },
			{ name: b + " 20", class: t, img: p + "20.jpg" },
			{ name: b + " 21", class: t, img: p + "21.jpg" },
			{ name: b + " 22", class: t, img: p + "22.jpg" },
			{ name: b + " 23", class: t, img: p + "23.jpg" },
			{ name: b + " 24", class: t, img: p + "24.jpg" },
			{ name: b + " 25", class: t, img: p + "25.jpg" },
			{ name: b + " 26", class: t, img: p + "26.jpg" },
			{ name: b + " 27", class: t, img: p + "27.jpg" },
			{ name: b + " 28", class: t, img: p + "28.jpg" },
			{ name: b + " 29", class: t, img: p + "29.jpg" },
			{ name: b + " 30", class: t, img: p + "30.jpg" },
			{ name: b + " 31", class: t, img: p + "31.jpg" },
			{ name: b + " 32", class: t, img: p + "32.jpg" },
			{ name: b + " 33", class: t, img: p + "33.jpg" },
			{ name: b + " 34", class: t, img: p + "34.jpg" },
			{ name: b + " 35", class: t, img: p + "35.jpg" },
			{ name: b + " 36", class: t, img: p + "36.jpg" },
			{ name: b + " 37", class: t, img: p + "37.jpg" },
			{ name: b + " 38", class: t, img: p + "38.jpg" },
			{ name: b + " 39", class: t, img: p + "39.jpg" },
			{ name: b + " 40", class: t, img: p + "40.jpg" }
		]

		return data;

	}

	get headstone_sizes() {

		const data = [
			{ name: "Mini Headstone", class: "headstones", width: 200, height: 300, img: "data/svg/headstones/cropped_peak.svg" },
			{ name: "Small Headstone", class: "headstones", width: 600, height: 400, img: "data/svg/headstones/cropped_peak.svg" },
			{ name: "Medium Headstone", class: "headstones", width: 600, height: 600, img: "data/svg/headstones/cropped_peak.svg" },
			{ name: "Single Headstone", class: "headstones", width: 1000, height: 1200, img: "data/svg/headstones/cropped_peak.svg" },
			{ name: "Double Headstone", class: "headstones", width: 2400, height: 1200, img: "data/svg/headstones/cropped_peak.svg" },
			{ name: "Landscape", class: "plaques", width: 300, height: 200, img: "data/svg/headstones/landscape.svg" },
			{ name: "Portrait", class: "plaques", width: 200, height: 300, img: "data/svg/headstones/portrait.svg" },
			{ name: "Square", class: "plaques", width: 300, height: 300, img: "data/svg/headstones/square.svg" },
		]

		return data;

	}

	getMaterialByURL(texture) {

		console.log("getMaterialByURL: " + texture);

		let _item;

		// *** localhost ******************
		/*
        this.bronzes.forEach(item => {
			console.log(dyo.path.forever + dyo.path.design5 + item.img, texture);

            if (dyo.path.forever + dyo.path.design5 + item.img == texture.replace("l/","s/")) {
				if (item.img == texture.replace("l/","s/")) {
	                _item = item;
            	}
			}
        });
		*/
		// *******************************

		// *** online ********************
		
        this.bronzes.forEach(item => {
			//console.log(dyo.path.forever + dyo.path.design5 + item.img, texture);
            //if (dyo.path.forever + dyo.path.design5 + item.img == texture.replace("l/","s/")) {
			if (item.img == texture.replace("l/","s/")) {
                _item = item;
            }
        });
		
		// *******************************

		return _item;
		
	}

	getDrawing(name, type, callback) {

		if (name.indexOf("Rectangle") > -1) {
			name = "Plaque (Landscape)";
		}
		if (name.indexOf("Square") > -1) {
			name = "Plaque (Square)";
		}

		if (name.indexOf("長方形") > -1) {
			name = "Plaque (Landscape)";
		}
		if (name.indexOf("正方形") > -1) {
			name = "Plaque (Square)";
		}

		if (name == undefined) {

			if (typeof callback === 'function') {
				callback();
				return
			} else {
				return
			}
			
		}

		let self = this;
		let _name = this._name;

		this._name = name;
		let _drawing = this.drawing;

		this._name = _name;

		if (_drawing) {

			if (_drawing.indexOf("@src=") > -1) {

				let url = _drawing.split("@src=")[1];

				if (self.cache[url] != undefined) {

					this.decodePath(self.cache[url].data, type);

					dyo.borderNoDetail = false;
					
					if (self.cache[url].detail_top) {
						self.cache["detail_top"] = self.cache[url].detail_top;
						if (self.cache["detail_top"].indexOf("@none") > -1) {
							dyo.borderNoDetail = true;
						}
					}
					if (self.cache[url].detail_bottom) {
						self.cache["detail_bottom"] = self.cache[url].detail_bottom;
						if (self.cache["detail_bottom"].indexOf("@none") > -1) {
							dyo.borderNoDetail = true;
						}
					}
					if (self.cache[url].detail_left) {
						self.cache["detail_left"] = self.cache[url].detail_left;
						if (self.cache["detail_left"].indexOf("@none") > -1) {
							dyo.borderNoDetail = true;
						}
					}
					if (self.cache[url].detail_right) {
						self.cache["detail_right"] = self.cache[url].detail_right;
						if (self.cache["detail_right"].indexOf("@none") > -1) {
							dyo.borderNoDetail = true;
						}
					}

					if (typeof callback === 'function') {
						callback();
						dyo.monument.updateMonument("data: 667");
					}

				} else {

					if (!dyo.engine.loader.force) {
						dyo.engine.loader.show("Data:624");
					}

					fetch(dyo.xml_path + "data/json/" + url, {
					})
					.then((response) => {
						response.text().then((data) => {

							if (dyo.edit != true) {
								dyo.engine.loader.hide("Data:631");
							}

							let result = JSON.parse(data);
							//console.log(result);
							self.cache[url] = result;

							dyo.borderNoDetail = false;
							
							if (result.detail_top) {
								self.cache["detail_top"] = result.detail_top;
								if (self.cache["detail_top"].indexOf("@none") > -1) {
									dyo.borderNoDetail = true;
								}		
							}
							if (result.detail_bottom) {
								self.cache["detail_bottom"] = result.detail_bottom;
								if (self.cache["detail_bottom"].indexOf("@none") > -1) {
									dyo.borderNoDetail = true;
								}		
							}
							if (result.detail_left) {
								self.cache["detail_left"] = result.detail_left;
								if (self.cache["detail_left"].indexOf("@none") > -1) {
									dyo.borderNoDetail = true;
								}		
							}
							if (result.detail_right) {
								self.cache["detail_right"] = result.detail_right;
								if (self.cache["detail_right"].indexOf("@none") > -1) {
									dyo.borderNoDetail = true;
								}		
							}

							this.decodePath(result.data, type);
		
							if (typeof callback === 'function') {
								callback();
								dyo.monument.updateMonument("data: 703");
							}

							dyo.engine.loader.hide("Data:1123");
		
						})
					})
					.catch(error => { 
						dyo.engine.loader.hide(); 
						console.error('Error:', error);
					});

				}

			} else {
				
				this.decodePath(_drawing, "border");

				if (typeof callback === 'function') {
					callback();
					dyo.monument.updateMonument("data:720");
				}
				
			}

		}

	}

    get drawing() {

		let pb = "@src=borders/";
		let ps = "@src=shapes/";
		let b = "Border";
		let bb = "border";
		let h = "Headstone";
		let hh = "headstone";

		const data = {

			["No " + b]: pb + "no_" + bb + ".json",
			"Raised - No Pattern": pb + bb + "_raised_no_pattern.json",
			"Flush": pb + bb + "_raised_no_pattern.json",
			"Raised": pb + bb + "_raised_no_pattern.json",
			[b + " 1"]: pb + bb + "1.json",
			[b + " 2"]: pb + bb + "2.json",
			[b + " 3"]: pb + bb + "3.json",
			[b + " 4"]: pb + bb + "4.json",
			[b + " 5"]: pb + bb + "5.json",
			[b + " 6"]: pb + bb + "6.json",
			[b + " 7"]: pb + bb + "7.json",
			[b + " 8"]: pb + bb + "8.json",
			[b + " 9"]: pb + bb + "9.json",
			[b + " 10"]: pb + bb + "10.json",
			[b + " 11"]: pb + bb + "11.json",
			[b + " 12"]: pb + bb + "12.json",
			[b + " 13"]: pb + bb + "13.json",
			[b + " Square"]: pb + bb + "_square.json",
			[b + " Heart"]: pb + bb + "_heart.json",
			[b + " Circle"]: pb + bb + "_circle.json",
			[b + " Oval"]: pb + bb + "_oval.json",
			[b + " Oval Landscape"]: pb + bb + "_oval_landscape.json",
			[b + " Rectangle"]: pb + bb + "_rectangle.json",
			[b + " Teardrop"]: pb + bb + "_teardrop.json",
			[b + " Triangle"]: pb + bb + "_triangle.json",

			"Stainless Steel Plaque": ps + "square.json",

			"Full-colour Plaque": ps + "square.json",

			"Bronze Plaque": ps + "square.json",
			"Bronze Plaque (Landscape)": ps + "square.json",
			"Bronze Plaque (Portrait)": ps + "square.json",
			"Bronze Plaque (Square)": ps + "square.json",
			"Plaque (Landscape)": ps + "square.json",
			"Plaque (Portrait)": ps + "square.json",
			"Plaque (Square)": ps + "square.json",
			"Square": ps + "square.json",
			"Bone": ps + "bone.json",
			"Bowl": ps + "bowl.json",
			"Bowl-Cat": ps + "cat_bowl.json",
			"Cat Bowl": ps + "cat_bowl.json",
			"Heart": ps + "heart.json",
			"Oval": ps + "oval.json",
			"Circle": ps + "circle.json",
			"Urn Rectangle": ps + "urn_rectangle.json",
			"Urn Heart": ps + "urn_heart.json",
			"Teardrop": ps + "urn_teardrop.json",
			"Triangle": ps + "triangle.json",

			"Paw": ps + "paw.json",

			"Cropped Peak": ps + "cropped_peak.json",
			"Curved Gable": ps + "curved_gable.json",
			"Curved Peak": ps + "curved_peak.json",
			"Curved Top": ps + "curved_top.json",
			"Half Round": ps + "half_round.json",
			"Gable": ps + "gable.json",
			"Left Wave": ps + "left_wave.json",
			"Peak": ps + "peak.json",
			"Right Wave": ps + "right_wave.json",
			"Serpentine":  ps + "serpentine.json",
			"Rectangle": ps + "rectangle.json",
			[h + " 1"]: ps + hh + "_1.json",
			[h + " 2"]: ps + hh + "_2.json",
			[h + " 3"]: ps + hh + "_3.json",
			[h + " 4"]: ps + hh + "_4.json",
			[h + " 5"]: ps + hh + "_5.json",
			[h + " 6"]: ps + hh + "_6.json",
			[h + " 7"]: ps + hh + "_7.json",
			[h + " 8"]: ps + hh + "_8.json",
			[h + " 9"]: ps + hh + "_9.json",
			[h + " 10"]: ps + hh + "_10.json",
			[h + " 11"]: ps + hh + "_11.json",
			[h + " 12"]: ps + hh + "_12.json",
			[h + " 13"]: ps + hh + "_13.json",
			[h + " 14"]: ps + hh + "_14.json",
			[h + " 15"]: ps + hh + "_15.json",
			[h + " 16"]: ps + hh + "_16.json",
			[h + " 17"]: ps + hh + "_17.json",
			[h + " 18"]: ps + hh + "_18.json",
			[h + " 19"]: ps + hh + "_19.json",
			[h + " 20"]: ps + hh + "_20.json",
			[h + " 21"]: ps + hh + "_21.json",
			[h + " 22"]: ps + hh + "_22.json",
			[h + " 23"]: ps + hh + "_23.json",
			[h + " 24"]: ps + hh + "_24.json",
			[h + " 25"]: ps + hh + "_25.json",
			[h + " 26"]: ps + hh + "_26.json",
			[h + " 27"]: ps + hh + "_27.json",
			[h + " 28"]: ps + hh + "_28.json",
			[h + " 29"]: ps + hh + "_29.json",
			[h + " 30"]: ps + hh + "_30.json",
			[h + " 31"]: ps + hh + "_31.json",
			[h + " 32"]: ps + hh + "_32.json",
			[h + " 33"]: ps + hh + "_33.json",
			[h + " 34"]: ps + hh + "_34.json",
			[h + " 35"]: ps + hh + "_35.json",
			[h + " 36"]: ps + hh + "_36.json",
			[h + " 37"]: ps + hh + "_37.json",
			[h + " 38"]: ps + hh + "_38.json",
			[h + " 39"]: ps + hh + "_39.json",
			[h + " 40"]: ps + hh + "_40.json",
			[h + " 41"]: ps + hh + "_41.json",
			[h + " 42"]: ps + hh + "_42.json",
			[h + " 43"]: ps + hh + "_43.json",
			[h + " 44"]: ps + hh + "_44.json",
			[h + " 45"]: ps + hh + "_45.json",
			[h + " 46"]: ps + hh + "_46.json",

			"Oval Landscape": ps + "oval_landscape.json",
			"Oval (Landscape)": ps + "oval_landscape.json",
			"Oval Portrait": ps + "oval_portrait.json",
			"Oval (Portrait)": ps + "oval_portrait.json",
			"Rectangle Landscape": ps + "rectangle_landscape.json",
			"Rectangle (Landscape)": ps + "rectangle_landscape.json",
			"Rectangle Portrait": ps + "rectangle_portrait.json",
			"Rectangle (Portrait)": ps + "rectangle_portrait.json"

		}

		return data[this._name];

	}

	getCategory(index) {

		let files;

		switch (dyo.monument._config.formula) {
			case "Bronze":
				files = "bronze-files.txt";
				break;
			case "Laser":
				files = "laser-files.txt";
				break;
			case "Engraved":
				files = "engraved-files.txt";
				break;
			case "Enamel":
				files = "enamel-files.txt";
				break;
		}

		// force same motifs for all products
		files = "files.txt";
		
		let url = dyo.xml_path + "data/motifs/" + this.categories[index].src + "/" + files;

		fetch(url)
		.then((response) => {
			response.text().then((text) => {
				let data = text.split(',');
				data.filter(n => true);

				dyo.engine.motifs.category_data = data;

				if (data.length > 50) {
					dyo.engine.motifs.motifs_list.data = data.slice(0, 50);
					if (dyo.engine.motifs.buttonLoadMore) {
						if (!dyo.engine.motifs.fullListVisible) {
							dyo.engine.motifs.buttonLoadMore.show();
						}
					}
				} else {
					dyo.engine.motifs.motifs_list.data = data;
				}

				dyo.engine.motifs.motifs_list.render();
			});
		});

	}

	getCategoryEmblems(index) {

		let files;

		files = "emblems-files.txt";

		// force same motifs for all products
		//files = "files.txt";

		//let url = "data/emblems/" + this.categories_emblems[index].name + "/" + files;
		let url = dyo.xml_path + "data/emblems/" + files;

		if (url) {
			fetch(url)
			.then((response) => {
				response.text().then((text) => {
					let data = text.split(',');
					data.filter(n => true);

					dyo.engine.emblems.category_data = data;

					if (data.length > 50) {
						dyo.engine.emblems.emblems_list.data = data.slice(0, 50);
						if (dyo.engine.emblems.buttonLoadMore) {
							if (!dyo.engine.emblems.fullListVisible) {
								dyo.engine.emblems.buttonLoadMore.show();
							}
						}
					} else {
						dyo.engine.emblems.emblems_list.data = data;
					}

					dyo.engine.emblems.emblems_list.render();
				});
			});
		}

	}


	get masks() {

		const data = [
			{ id: 0, name: "Portrait Oval" },
			{ id: 1, name: "Portrait Rectangle" },
			{ id: 2, name: "Landscape Oval" },
			{ id: 3, name: "Landscape Rectangle" },
			{ id: 4, name: "Square" }
		]

		return data;

	}

	get motifs_types() {

		const data = [
			
			{ 
				nr: 1, id: 76, name: Translate(Lang.STAINLESS_STEEL_MOTIF), selector: Lang.STAINLESS_STEEL_MOTIF,
				class: "motifs", img: "data/jpg/motifs/xs/stainless-steel-motif.jpg", 
				title: Translate(Lang.STAINLESS_STEEL_MOTIF), 
				description: Translate(Lang.STAINLESS_STEEL_MOTIF_DESCRIPTION)
			},
			{ 
				nr: 2, id: 13, name: Translate(Lang.ONE_COLOUR_GLASS_BACKED_MOTIF), selector: Lang.ONE_COLOUR_GLASS_BACKED_MOTIF,
				class: "motifs", img: "data/jpg/motifs/xs/one-colour-glass-backed-motif.jpg", 
				title: Translate(Lang.ONE_COLOUR_GLASS_BACKED_MOTIF), 
				description: Translate(Lang.ONE_COLOUR_GLASS_BACKED_MOTIF_DESCRIPTION)
			},
			{ 
				nr: 3, id: 14, name: Translate(Lang.ONE_COLOUR_GLASS_BACKED_MOTIF), selector: Lang.ONE_COLOUR_GLASS_BACKED_MOTIF,
				class: "motifs", img: "data/jpg/motifs/xs/one-colour-glass-backed-motif.jpg", 
				title: Translate(Lang.ONE_COLOUR_GLASS_BACKED_MOTIF), 
				description: Translate(Lang.ONE_COLOUR_GLASS_BACKED_MOTIF_DESCRIPTION)
			},
			{ 
				nr: 4, id: 15, name: Translate(Lang.ONE_COLOUR_RAISED_GLASS_BACKED_MOTIF), selector: Lang.ONE_COLOUR_RAISED_GLASS_BACKED_MOTIF,
				class: "motifs", img: "data/jpg/motifs/xs/one-colour-raised-motif.jpg", 
				title: Translate(Lang.ONE_COLOUR_RAISED_GLASS_BACKED_MOTIF), 
				description: Translate(Lang.ONE_COLOUR_RAISED_GLASS_BACKED_MOTIF_DESCRIPTION)
			},
			{ 
				nr: 5, id: 16, name: Translate(Lang.ONE_COLOUR_RAISED_GLASS_BACKED_MOTIF), selector: Lang.ONE_COLOUR_RAISED_GLASS_BACKED_MOTIF,
				class: "motifs", img: "data/jpg/motifs/xs/one-colour-raised-motif.jpg", 
				title: Translate(Lang.ONE_COLOUR_RAISED_GLASS_BACKED_MOTIF), 
				description: Translate(Lang.ONE_COLOUR_RAISED_GLASS_BACKED_MOTIF_DESCRIPTION)
			},
			{ 
				nr: 6, id: 18, name: "Two Colour Glass Backed Motif", selector: "Two Colour Glass Backed Motif",
				class: "motifs", img: "data/jpg/motifs/xs/two-colour-raised-motif.jpg", 
				title: "Two Colour Glass Backed Motif", 
				description: "Two Colour Glass Backed Motif"
			},
			{ 
				nr: 7, id: 17, name: "Two Colour Raised Glass Backed Motif", selector: "Two Colour Raised Glass Backed Motif",
				class: "motifs", img: "data/jpg/motifs/xs/two-colour-raised-motif.jpg", 
				title: "Two Colour Raised Glass Backed Motif", 
				description: "Two Colour Raised Glass Backed Motif"
			}

		]

		return data;

	}

	get photos_types() {

		let p = "data/jpg/photos/xs/";

		const data = [
			
			{ 
				nr: 1, id: 21, name: Translate(Lang.GRANITE_IMAGE_DIRECT_ON_STONE), selector: Lang.GRANITE_IMAGE_DIRECT_ON_STONE,
				class: "photos", img: p + "granite-image.jpg", 
				title: Translate(Lang.LASER_ETCHED_GRANITE_IMAGE), 
				description: Translate(Lang.GRANITE_IMAGE_DIRECT_ON_STONE_DESCRIPTION)
			},
			{ 
				nr: 2, id: 7, name: Translate(Lang.CERAMIC_IMAGE), selector: Lang.CERAMIC_IMAGE,
				class: "photos", img: p + "ceramic-image.jpg", 
				title: Translate(Lang.CERAMIC_IMAGE_OVERLAY), 
				description: Translate(Lang.CERAMIC_IMAGE_DESCRIPTION)
			},
			{ 
				nr: 3, id: 2300, name: Translate(Lang.VITREOUS_ENAMEL), selector: Lang.VITREOUS_ENAMEL,
				class: "photos", img: p + "vitreous-enamel-image.jpg", 
				title: Translate(Lang.VITREOUS_ENAMEL_IMAGE_OVERLAY), 
				description: Translate(Lang.VITREOUS_ENAMEL_DESCRIPTION)
			},
			{ 
				nr: 4, id: 2400, name: Translate(Lang.PREMIUM_PLANA), selector: Lang.PREMIUM_PLANA,
				class: "photos", img: p + "plana.jpg", 
				title: Translate(Lang.PREMIUM_PLANA), 
				description: Translate(Lang.PREMIUM_PLANA_DESCRIPTION)
			},
			{ 
				nr: 5, id: 135, name: Translate(Lang.YAG_LASSERED_IMAGE), selector: Lang.YAG_LASSERED_IMAGE,
				class: "photos", img: p + "granite-image.jpg", 
				title: Translate(Lang.YAG_LASSERED_IMAGE), 
				description: Translate(Lang.YAG_LASSERED_IMAGE_DESCRIPTION)
			}

		]

		return data;

	}

	get photo_upload() {

		const data = [
			{ 
				title: Translate(Lang.UPLOADING_YOUR_IMAGE), 
				description: Translate(Lang.UPLOADING_YOUR_IMAGE_DESCRIPTION)
			}
		]

		return data;

	}

	get measurment_info() {

		let measurement = '';

		if (dyo.metric == "inches") {
			measurement = Translate(Lang.INCHES);
		} else {
			measurement = Translate(Lang.MILLIMETERS);
		}

		const data = [
			{ 
				title: Translate(Lang.MEASURMENT), description: Translate(Lang.MEASURMENT_DESCRIPTION) + ' ' + measurement 
			},
			{ 
				title: Translate(Lang.MEASURMENT_COLOR), description: Translate(Lang.MEASURMENT_DESCRIPTION) + ' ' + measurement + '<br/>' + Translate(Lang.MEASURMENT_COLOR_DESCRIPTION)
			}
		]

		return data;

	}

	plaque_sizes(id) {

		let nr = 0;
		let loop = 0;

		dyo.config._additions.Sizes.forEach(size => {
			if (Number(size.id) == id) {
				nr = loop;
			}
			loop ++;
		});

		let data = [];
		let obj = {};
		let min_width, min_height, max_width, max_height, init_width, init_height;

		this.plaquesHeight = [];

		dyo.config._additions.Sizes[nr].types.forEach(size => {

			min_width = Number(size.min_width);
			min_height = Number(size.min_height);
			max_width = Number(size.max_width);
			max_height = Number(size.max_height);
			init_width = Number(size.init_width);
			init_height = Number(size.init_height);

			if (dyo.usa) {
				min_width = dyo.engine.metrics.convertToInches(Number(size.min_width));
				min_height = dyo.engine.metrics.convertToInches(Number(size.min_height));
				max_width = dyo.engine.metrics.convertToInches(Number(size.max_width));
				max_height = dyo.engine.metrics.convertToInches(Number(size.max_height));
				init_width = dyo.engine.metrics.convertToInches(Number(size.init_width));
				init_height = dyo.engine.metrics.convertToInches(Number(size.init_height));
			}

			obj = { 
				id: Number(size.id) - 1, 
				name: min_width + " x " + min_height + " mm", 
				min_width: min_width, 
				min_height: min_height, 
				max_width: max_width, 
				max_height: size.max_height, 
				init_width: init_width, 
				init_height: init_height,
				note: size.note
			}

			this.plaquesHeight.push(max_height);
			data.push(obj)
		});

		this.plaquesHeight.push(Number(this.plaquesHeight[this.plaquesHeight.length - 1] * 2));

		return data;

	}

	photos_sizes(id, from) {

		let nr = 0;
		let loop = 0;

		dyo.config._additions.Images.forEach(image => {
			if (Number(image.id) == id) {
				nr = loop;
			}
			loop ++;
		});

		let data = [];
		let obj = {};

		this.photosHeight = [];

		dyo.config._additions.Images[nr].types.forEach(size => {
			obj = { 
				id: Number(size.id) - 1, 
				name: Number(size.min_width) + " x " + Number(size.min_height) + " mm", 
				min_width: Number(size.min_width), 
				min_height: Number(size.min_height), 
				max_width: Number(size.max_width), 
				max_height: Number(size.max_height), 
				init_width: Number(size.init_width), 
				init_height: Number(size.init_height) 
			}

			this.photosHeight.push(Number(size.max_height));
			data.push(obj)
		});

		if (id == 2400) {
			if (dyo.selected) {
				switch (dyo.selected.mask) {
					case 1: case 3:
						data.splice(0, 2);
						break;
				}
			}
		}

		this.photosHeight.push(Number(this.photosHeight[this.photosHeight.length - 1] * 2));

		return data;

	}

	emblems_nonflippable() {

		const data = ["1111", "103", "106", "118", "137", "145", "161", "180", "187", "318", "325", "377", "378", "394", "001", "400", "003", "004", "002", "006", "117", "130", "141", "005", "4196", "4219", "4226", "4233", "4237", "4241", "4247", "4248", "4249", "4254", "001", "4256", "002", "4260", "4263", "008", "4266", "4267", "4270", "4271", "4272", "4275", "4278", "4282", "4283", "009", "4286", "4287", "4288", "4289", "4290", "4291", "4292", "4293", "4294", "4295", "4279", "4298", "4299", "4300", "4301", "4302", "4303", "4304", "4305", "4306", "4310", "4311", "2915", "4607", "4619", "4622", "4628", "4631", "4632", "4640", "4643", "4649", "4650", "4651", "4654", "4657", "4685"];

		return data;

	}

	emblem_sizes(id) {

		let nr = 0;
		let loop = 0;

		dyo.config._additions.Emblems.forEach(emblem => {
			if (Number(emblem.id) == id) {
				nr = loop;
			}
			loop ++;
		});

		let data = [];
		let obj = {};
		this.emblemsHeight = [];

		let min_width, min_height, max_width, max_height, init_width, init_height;

		dyo.config._additions.Emblems[nr].types.forEach(size => {

			min_width = Number(size.min_width);
			min_height = Number(size.min_height);
			max_width = Number(size.max_width);
			max_height = Number(size.max_height);
			init_width = Number(size.init_width);
			init_height = Number(size.init_height);

			if (dyo.usa) {
				min_width = dyo.engine.metrics.convertToInches(Number(size.min_width));
				min_height = dyo.engine.metrics.convertToInches(Number(size.min_height));
				max_width = dyo.engine.metrics.convertToInches(Number(size.max_width));
				max_height = dyo.engine.metrics.convertToInches(Number(size.max_height));
				init_width = dyo.engine.metrics.convertToInches(Number(size.init_width));
				init_height = dyo.engine.metrics.convertToInches(Number(size.init_height));
			}

			obj = { 
				id: Number(size.id) - 1, 
				name: min_width + " x " + min_height + " mm", 
				min_width: min_width, 
				min_height: min_height, 
				max_width: max_width, 
				max_height: max_height, 
				init_width: init_width, 
				init_height: init_height 
			}

			this.emblemsHeight.push(max_height);

			data.push(obj)
		});

		this.emblemsHeight.push(Number(this.emblemsHeight[this.emblemsHeight.length - 1] * 2));

		return data;

	}

	get rotation_degrees() {

		const data = [
			{ id: 0, name: "0&deg; " + Lang.DEGREES },
			{ id: 1, name: "90&deg; " + Lang.DEGREES },
			{ id: 2, name: "180&deg; " + Lang.DEGREES },
			{ id: 3, name: "270&deg; " + Lang.DEGREES },
			{ id: 4, name: "360&deg; " + Lang.DEGREES }
		]

		return data;

	}
	
	get photos_color() {

		const data = [
			{ id: 1, name: Translate(Lang.FULL_COLOUR), traditional: true },
			{ id: 0, name: Translate(Lang.GREYSCALE), traditional: false },
			{ id: 2, name: Translate(Lang.SEPIA), traditional: true }
		]

		return data;

	}

	get categories() {

		let p = "data/png/motifs/s/";
		let c = "category";

		const data = [
			
			{ id: 0, class: c, name: Translate(Lang.AQUATIC), src: "Animals/Aquatic", img: p + "whale_002.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 1, class: c, name: Translate(Lang.BIRDS), src: "Animals/Birds", img: p + "dove_002.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 2, class: c, name: Translate(Lang.BUTTERFLIES), src: "Animals/Butterflies", img: p + "butterfly_005.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 3, class: c, name: Translate(Lang.CATS), src: "Animals/Cats", img: p + "2_056_04.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 4, class: c, name: Translate(Lang.DOGS), src: "Animals/Dogs", img: p + "1_137_10.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 5, class: c, name: Translate(Lang.FARM_ANIMAL), src: "Animals/Farm-Animal", img: p + "1_138_12.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 6, class: c, name: Translate(Lang.HORSES), src: "Animals/Horses", img: p + "horse_009.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 7, class: c, name: Translate(Lang.INSECTS), src: "Animals/Insects", img: p + "dragonfly_03.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 8, class: c, name: Translate(Lang.MYSTICAL_ANIMALS), src: "Animals/Mystical-Animals", img: p + "2_061_17.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 9, class: c, name: Translate(Lang.PREHISTORIC), src: "Animals/Prehistoric", img: p + "1_135_02.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 10, class: c, name: Translate(Lang.REPTILES), src: "Animals/Reptiles", img: p + "1_173_05.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 11, class: c, name: Translate(Lang.WORLD_ANIMALS), src: "Animals/World-Animals", img: p + "1_145_20.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 12, class: c, name: Translate(Lang.AUS_WILDLIFE), src: "Aus-Wildlife", img: p + "gecko_003.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 13, class: c, name: Translate(Lang.AUS_FLORA), src: "Australiana-Flora", img: p + "banksiarufa.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 14, class: c, name: Translate(Lang.ARCHITECTURAL), src: "Architectural", img: p + "1_217_23.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 15, class: c, name: Translate(Lang.ARROW), src: "Arrow", img: p + "1_207_07.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 16, class: c, name: Translate(Lang.BORDERS), src: "Borders", img: p + "1_018_10.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 17, class: c, name: Translate(Lang.CARTOONS_AND_ANIMALS), src: "Animals", img: p + "1_055_01.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 18, class: c, name: Translate(Lang.CORNERS), src: "Borders-Corners", img: p + "1_208_03.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 19, class: c, name: Translate(Lang.CHILDREN_TOYS), src: "Children-Toys", img: p + "teddy-bear_003.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 20, class: c, name: Translate(Lang.FLORISH), src: "Florish", img: p + "1_011_09.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 21, class: c, name: Translate(Lang.FLOURISHES), src: "Flourishes", img: p + "2_139_07.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 22, class: c, name: Translate(Lang.FLOWER_INSERTS), src: "Flowers", img: p + "flower rose_03.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 23, class: c, name: Translate(Lang.FLOWER_INSERTS) + " (NEW)", src: "1ColRaisedMotif", img: p + "f1_0.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 24, class: c, name: Translate(Lang.FOOD_AND_DRINK), src: "Food-and-Drink", img: p + "2_117_01.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 25, class: c, name: Translate(Lang.HEARTS), src: "Hearts-and-Ribbons", img: p + "2_155_14.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 26, class: c, name: Translate(Lang.HISTORY), src: "History-and-Culture", img: p + "2_079_03.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 27, class: c, name: Translate(Lang.HOLIDAY), src: "Holiday", img: p + "clover_001.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 28, class: c, name: Translate(Lang.HOUSEHOLD_ITEMS), src: "Household-Items", img: p + "2_092_15.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 29, class: c, name: Translate(Lang.ISLANDER), src: "Islander", img: p + "1_140_12.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 30, class: c, name: Translate(Lang.ICONIC_PLACES), src: "Iconic-Places", img: p + "2_111_05.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 31, class: c, name: Translate(Lang.MOON_AND_STARS), src: "Moon-Stars-Sun", img: p + "2_082_17.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 32, class: c, name: Translate(Lang.MUSIC_AND_DANCE), src: "Music-and-Dance", img: p + "1_172_08.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 33, class: c, name: Translate(Lang.NAUTICLE), src: "Nauticle", img: p + "anchor_001.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 34, class: c, name: Translate(Lang.OFFICIAL), src: "Official", img: p + "1_127_06.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 35, class: c, name: Translate(Lang.PETS), src: "Pets", img: p + "paw_001.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 36, class: c, name: Translate(Lang.PLANTS_AND_TREES), src: "Plants-and-Trees", img: p + "1_158_16.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 37, class: c, name: Translate(Lang.RELIGIOUS), src: "Religious", img: p + "angel_001.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 38, class: c, name: Translate(Lang.SHAPES_AND_PATTERNS), src: "Shapes-and-Patterns", img: p + "2_147_09.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 39, class: c, name: Translate(Lang.SKULLS_AND_WEAPONS), src: "Skulls-and-Weapons", img: p + "1_061_07.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 40, class: c, name: Translate(Lang.SPORT_AND_FITNESS), src: "Sport-and-Fitness", img: p + "2_120_13.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 41, class: c, name: Translate(Lang.SYMBOLS_ZODIAC), src: "Symbols-Zodiac", img: p + "zodiac_003.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 42, class: c, name: Translate(Lang.TEXT), src: "Text", img: p + "2_172_21.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 43, class: c, name: Translate(Lang.TOOLS_OFFICE), src: "Tools-Office-Trades-and-Professions", img: p + "2_124_26.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 44, class: c, name: Translate(Lang.TRIBAL), src: "Tribal", img: p + "1_206_16.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 45, class: c, name: Translate(Lang.USA), src: "American", img: p + "1_127_23.png", traditional: true, ss: false, col2: false, col1: false },
			{ id: 46, class: c, name: Translate(Lang.VEHICLES), src: "Vehicles", img: p + "1_188_24.png", traditional: true, ss: true, col2: false, col1: false },
			{ id: 47, class: c, name: "2 Colour Motifs", src: "2ColRaisedMotif", img: p + "01.png", traditional: false, ss: false, col2: true, col1: false },
			{ id: 48, class: c, name: "1 Colour Motifs", src: "1ColRaisedMotif", img: p + "f1_1.png", traditional: false, ss: false, col2: false, col1: true }

		]

		return data;

	}

	get categories_emblems() {

		const data = [
			{ id: 0, class: "category_emblems", name: "Bronze", src: "Bronze", img: "data/png/emblems/s/br118-bible.png", traditional: true },

		]

		return data;

	}
	
}

export const EmblemsData = ["br111l-horse-head","br111r-horse-head","br112-scotch-thistle","br113-scotch-thistle","br114-tulips","br115l-gum-leaves","br115r-gum-leaves","br116l-dove-of-peace","br116r-dove-of-peace","br118-bible","br119-jesus-brown","br119-jesus","br120l-angel-kneeling","br120r-angel-kneeling","br121-fossicker","br122-football-soccer","br123-spray-of-roses","br124-jockey-cap","br125l-gum-tree","br125r-gum-tree","br126-angel","br127-aeroplane","br128l-motorbike","br128r-motorbike","br129-ivy","br138-golfer-male","br139l-gum-leaves","br139r-gum-leaves","br140-bullock-team","br141-beetle","br142-magpie","br145-heart","br146-mormon","br148l-footballer-rugby","br148r-footballer-rugby","br150-waratah","br151-horse-head-and-shoe","br152l-shearer","br152r-shearer","br153-cricketer-batsman","br154l-tennis-player","br154r-tennis-player","br155-daffodils","br157l-ram","br157r-ram","br158-elephant","br160l-fisherman","br161-crucifix","br162-wattle","br163-lilies","br164_butterfly_profile","br165-butterfly","br166-gladioli","br167-child-in-hand","br168-mary-magdalene","br169-mary-and-child-standing","br171-pansies","br172l-trotter","br172r-trotter","br173-cherubs","br174-ploughman","br177-violets","br178-rose-long-stem","br179l-madonna-and-child","br179r-madonna-and-child","br180-orchid","br181-waratah","br182-gum-leaves-and-blossoms","br183-truck","br184-lilies","br185-daisy","br186-flannel-flowers","br187-wheat-sheaf","br189-cat-persian","br190-labrador","br191-bull-horned","br192-dolphin","br197-fire-engine","br198-cat-general","br200-last-supper","br2915-infant-of-prague","br300-daffodils-short","br301-bull-polled","br304-clown-and-drum","br305-rosebud-stem-and-leaves","br310-kangaroo","br310l-kangaroo","br310r-kangaroo","br311l-lion-rampant","br311r-lion-rampant","br312-key","br313-cat-sleeping","br314-bat","br315l-firemans-axe","br315r-firemans-axe","br317-cricketer-bowler","br318-violin","br319-dog-head","br321-dancing-couple","br324-bishops-mitre","br325-angel-face-and-wings","br326-mary-and-infant-jesus","br328-st-patrick-medal","br332-see-i-have-carved-you","br333-flannel-flowers","br334-curved-vase","br336-gum-leaf-and-nuts","br336gum-leaf-and-nuts","br338-australia-remembers","br339-the-australian-army","br340-gwydir-regiment","br341-royal-sussex-regiment","br342-polish-eagle","br343-st-vincent-de-paul","br349l-footballer-afl","br349r-footballer-afl","br350-mary-the-ascension","br358-cosmos-flower","br362-man-on-horse-trotting","br362l-man-on-horse-trotting","br362l-man-on-horse","br363-dogs-two","br364-jesus-(without-cross)","br365-jesus-on-cross","br369-ram-head","br371-chinese-dragon","br374-christmas-bells","br375-cricketer-batsman-front","br378-guitar","br384-hands-with-rosary-and-cross","br389-puppy","br389-puppy_brown","br390-seagull","br391-kitten-with-wool","br391-kitten_green","br392-bird-in-hands","br392-hands-and-dove_brown","br393-mother-and-child","br394-sacred-heart-of-mary","br396-violets","br398r-man-on-horse","br400-station-viii---gethsemane","br400-station-viii-gethsemane","br4195-wattle","br4196-sacred-heart","br4198-climbing-rose","br4199-lilyofvalley","br4200-dogwood-render","br4202-oak-1","br4204-maple--render","br4206-maple-2","br4222--caring-hands","br4223-canadian-wheat2","br4224-chapel-romanesque","br4225-church-on-the-hill","br4226-crucifixion","br4227-fairies-butterfly","br4228-fairy","br4229-fairy-on-plant","br4230-flannel-flowers-(corner)","br4231-forever-springtime","br4233--gabriel","br4234-graceful-memories","br4237-last-supper","br4238-lawn-bowler","br4240--peacefulness","br4241-pieta","br4247-trees-left---canadian","br4248-trees-right---canadian","br4249-mountain-scene---canadian-","br4279-schooner","br4281-welcoming-arms","br4283-footprints","br4289-blank-book","br4292-stations-of-cross-1-jesus-is-condemned-to-death","br4293-station-of-cross-2-jesus-is-given-his-cross","br4294-stations-of-cross-3-jesus-falls-1st-time","br4295-stations-of-cross-4-jesus-meets-his-mother","br4297-sations-of-cross-5-simon-of-cyrene-carries-cross","br4298-station-of-cross-6-veronica-wipes-the-face-of-jesus","br4299-stations-of-cross-7-jesus-falls-2nd-time","br4300-stations-of-cross-8","br4301-stations-9","br4302-stations-10","br4302-stations-11","br4304-station-of-cross-12","br4305-stations-of-cross-13","br4306-station-of-cross-14","br4307-padre-pio","br4606-mary-and-child-standing-2","br4607-sacred-heart-jesus-2","br4622-lady-of-mount-carmel","br4629-cowboy-hat---braided"];

export const InscriptionsData = ["Forever in Our Hearts","Gone but Not Forgotten","Always Remembered","Rest in Peace","Cherished Forever","Loved and Missed","Your Memory Lives On","Until We Meet Again","A Life Well Lived","Never to Be Forgotten","In God's Care","Peace Be with You","Treasured Memories","Deeply Missed","Remembered with Love","Forever in Our Thoughts","With Eternal Love","Loved Beyond Measure","Forever Cherished","Resting in Heaven","A Soul at Peace","Always in Our Prayers","In the Arms of Angels","Forever Loved and Remembered","Your Love Will Light Our Way","Held in Our Hearts","Love Never Dies","Eternally Missed","Precious Memories","Sleep in Heavenly Peace","Always in My Heart","Gone from Our Sight, but Never Our Hearts","Remembered with a Smile","Your Spirit Lives On","A Life Full of Love","Love You Always","In the Lord’s Arms","Your Legacy Lives On","Loved Without End","Missed More Each Day","With Love and Grace","Until We Meet Again in Heaven","A Love That Will Never Fade","Gone, but Always Here","In Eternal Rest","Remembered with Gratitude","Forever by Our Side","Resting in Peace","With Everlasting Love","In Loving Remembrance","Gone but Not Lost","Resting in Eternal Peace","With All Our Love","Your Light Shines On","Always in Our Hearts and Minds","Your Love Is Our Guide","Deeply Loved, Deeply Missed","Forever in God's Light","In Faithful Memory","Your Memory Is Our Treasure","With Love Everlasting","Forever in Peace","A Life Remembered","Loved and Never Forgotten","Remembered Always with Love","Resting in Eternal Love","Loved by All Who Knew You","Your Spirit Will Never Fade","In the Care of the Lord","Always in Our Hearts, Forever Missed","Forever in Grace","With Endless Love","Gone but Always Near","Remembered with a Smile and a Tear","Your Love Lives On in Us","Forever in His Light","Resting in God's Embrace","Always in Our Hearts and Souls","Your Memory Will Never Die","In the Hands of God","With Love Unending","In Fond Remembrance","Remembered with Honor","Your Love Is Our Strength","Eternally Remembered","Always Loved, Never Forgotten","Your Love Is Forever in Our Hearts","In the Shelter of His Love","A Light That Will Never Dim","Loved and Remembered Forever","Resting in the Lord’s Peace","In Memory of a Life Well Spent","Your Love Still Guides Us","Always in Our Hearts, Never Far Away","Rest in His Loving Care","Your Love Will Never Be Forgotten","In Peaceful Rest","With Love Beyond Words","Your Spirit Will Always Be with Us","In Loving and Everlasting Memory","Forever in God’s Grace","Your Love Lives on in Our Hearts","A Heart That Loved Deeply","Remembered for All Time","Resting in the Light of God","Your Legacy Will Never Fade","Always with Us, Forever Missed","Your Love Was Our Blessing","In Quiet Rest","Love’s Eternal Flame","Always Loved, Always Missed","Resting Where No Shadows Fall","Loved Beyond Words","A Love That Will Never End","Forever in Our Hearts, Always Missed","Resting Where Peace Is Found","Always in Our Hearts, Forever in Our Thoughts","Remembered in Our Hearts Forever","Resting in the Arms of the Savior","Loved and Remembered Always","Forever in Our Prayers","In the Shelter of God's Love","Your Love Will Never Be Lost","In Eternal Light and Love","With a Love That Never Dies","Always in Our Hearts and Thoughts","Your Love Was a Gift to All","In God's Grace Forever","Your Memory Will Live Forever","Resting in the Peace of God","Your Love Is Our Eternal Guide","Remembered with Endless Love","Resting in the Love of God","Your Spirit Shines Forever","Always in Our Hearts and Forever Missed","Resting in the Peace of His Love","Your Love Lives on in Our Hearts Forever","In the Love of the Lord","Always in Our Thoughts and Prayers","Forever in the Peace of God","Your Love Will Light Our Way Forever","Resting in the Arms of Love","Remembered in Our Hearts Always","Forever in God's Love and Peace","In the Loving Arms of God","Your Love Will Never Be Forgotten","Resting in the Light of His Love","Your Spirit Lives on in Our Hearts","Always in Our Thoughts, Forever in Our Hearts","In the Grace of God Forever","Your Love Was a Blessing to All","Resting in the Arms of Peace","In God's Loving Arms","Your Love Will Be with Us Forever","Resting in His Eternal Light","Always in Our Hearts and Minds Forever","Your Love Will Guide Us Always","In the Eternal Light of God","Forever in the Peace of His Love","Always Remembered, Forever Loved","In the Loving Care of God","Your Love Was Our Blessing","Resting in the Peace of the Lord","Your Spirit Shines in Our Hearts","Always Loved, Forever Missed","In the Loving Embrace of God","Your Love Lives on in Our Hearts Forever","Resting in His Eternal Care","Always in Our Thoughts and Hearts","Your Love Will Be with Us Always","Resting in the Arms of the Savior Forever","In God's Eternal Peace and Love","Your Spirit Will Live on in Our Hearts Forever","Resting in the Eternal Light of God","Your Love Will Never Be Lost to Us","In God's Loving Embrace Forever","Your Love Was Our Greatest Blessing","Resting in the Peace of His Love Forever","Your Spirit Shines on in Our Hearts Forever","Always in Our Hearts and Forever Remembered","Your Love Will Light Our Way Always","Resting in the Eternal Light of His Love","Always Loved, Never to Be Forgotten","In the Loving Arms of the Lord Forever","Your Love Will Be with Us Always in Our Hearts","Resting in God's Eternal Peace and Love","Your Spirit Lives on in Our Hearts Always","Forever in the Loving Care of God","Your Love Was Our Greatest Gift","Resting in the Peace of God's Love","Your Spirit Shines on in Our Hearts Always","Always in Our Thoughts, Forever Remembered","Your Love Will Guide Us Always in Our Hearts","Resting in the Loving Arms of God","Your Spirit Lives on in Our Hearts Forevermore","Forever in the Peace of God's Love","Your Love Will Light Our Way Forevermore","Resting in His Eternal Light and Love","Always Loved, Forever in Our Hearts","In the Loving Arms of God, Forever at Peace"];

export const EpitaphData = ["In Loving Memory","Beloved by all who knew them","Ours is love everlasting","Death cannot part them","Always together, never apart, joined as one heart","Goodnight and God bless you","Life is not forever – love is","Gone but not forgotten","Dearly beloved","Into the sunshine","Dearly loved","Once met, never forgotten","Uncompromisingly unique","Remembered with love","Love you always","With a greater thing to do","Love is enough","Peace perfect peace","Deep peace of the quiet earth to you","Generous of heart, constant of faith","Love you miss you","In everloving memory","Love is enough","May his memory be eternal","Always together","Devoted in love","Always loving, always loved","Your love will light my way","Asleep in Jesus","Forever in our hearts","Until we meet again","Rest in Peace","An inspiration","Loved and remembered","In God's care","An inspiration to all","Together again","Love is waiting","Once met, never forgotten","A long life well lived","Remembered with love"];

export const Fonts = ["Adorable", "Arial", "Chopin Script", "Dobkin", "Franklin Gothic", "French Script", "Garamond", "Great Vibes", "Lucida Calligraphy"];

export const MotifsData = [
	{
	  name: "Aquatic",  
	  files: "1_044_24,1_109_08,1_135_01,1_135_13,1_140_01,1_140_02,1_140_03,1_140_05,1_140_07,1_140_08,1_140_09,1_140_10,1_140_13,1_140_14,1_140_15,1_140_16,1_140_18,1_140_19,1_140_20,1_140_21,1_140_23,1_140_24,1_141_01,1_141_02,1_141_03,1_141_04,1_141_05,1_141_06,1_141_07,1_141_08,1_141_10,1_141_11,1_141_12,1_141_13,1_141_14,1_141_15,1_141_16,1_141_17,1_141_18,1_141_19,1_141_20,1_141_21,1_141_22,1_141_23,1_141_24,1_141_25,1_141_26,1_142_08,1_142_09,1_142_14,1_142_15,1_142_16,1_142_17,1_142_18,1_142_24,1_174_13,2_054_26,2_055_06,2_055_12,2_055_23,2_055_25,2_059_01,2_059_02,2_059_03,2_059_04,2_059_05,2_059_06,2_059_07,2_059_08,2_059_09,2_059_10,2_059_11,2_059_12,2_059_13,2_059_14,2_059_15,2_059_16,2_059_17,2_059_18,2_059_19,2_059_20,2_059_21,2_059_22,2_059_23,2_059_24,2_059_25,2_059_26,2_086_20,angelfish_001,angelfish_002,dolphin_001,dolphin_002,dolphin_003,dolphin_004,dolphin_005,dolphin_006,dolphin_007,dolphin_008,dolphin_009,dolphin_010,fish_003,lobster_001,lobster_002,marlin_001,orca_001,shark_001,shark_002,shark_003,tortoise_001,turtle_001,turtle_002,turtle_005,turtle_009,turtle_010,turtle_011,whale_001,whale_002"
	},
	{
	  name: "Birds",
	  files: "1_127_02,1_127_07,1_129_03,1_129_06,1_129_09,1_129_12,1_129_13,1_129_14,1_129_15,1_129_17,1_129_22,1_138_06,1_138_09,1_138_16,1_138_21,1_139_01,1_139_05,1_139_07,1_139_09,1_139_10,1_139_14,1_139_15,1_139_23,1_139_24,1_139_25,1_139_26,1_177_21,1_178_22,1_229_08,2_075_22,2_078_26,2_086_17,2_086_19,2_086_24,bird_003,bird_004,bird_005,bronze3,bronze8,dove_001,dove_002,dove_003,dove_004,duck_001,duck_002,duck_003,eagle_002,eagle_003,hummingbird_001,owl_001,parrot_001,parrot_002,penguin_001,small-bird_001,small-bird_003,small-bird_004,small-bird_005,swan_001,swan_002,water-bird_001,water-bird_002"
	},
	{
	  name: "Butterflies",
	  files: "butterfliy_001,butterfliy_002,butterfliy_003,butterfly_004,butterfly_005,butterfly_006,butterfly_007,butterfly_008,butterfly_009,butterfly_017,butterfly_020,butterfly_024,butterfly_025,butterfly_026,butterfly_027,butterfly_028,butterfly_029,butterfly_030,butterfly_031"
	},
	{
	  name: "Cats",
	  files: "1_131_10,1_043_22,1_132_02,1_132_03,1_132_25,1_132_07,2_056_25,1_043_11,1_131_21,1_132_24,1_045_21,1_131_24,2_056_03,2_056_23,1_043_09,1_131_05,2_056_17,1_131_02,1_131_01,1_131_07,1_132_08,1_043_10,2_056_06,1_131_18,1_131_12,1_131_25,2_056_21,1_131_17,1_131_06,2_056_07,1_131_22,2_056_24,2_056_05,1_131_03,1_131_08,2_056_16,1_043_02,2_056_22,1_131_19,1_043_23,2_056_19,2_056_12,1_132_06,1_131_11,1_167_05,1_131_20,1_132_10,1_043_08,2_056_20,2_056_10,1_131_16,1_132_01,2_056_18,2_138_25,1_132_22,1_131_14,1_139_04,2_056_15,2_056_09,1_131_04,2_056_02,1_132_20,1_131_15,2_056_01,2_056_08,2_056_11,2_056_04"
	},
	{
	  name: "Dogs",
	  files: "1_137_15,2_057_17,1_136_09,2_031_04,2_057_07,1_136_26,1_139_08,2_057_13,1_137_19,1_137_04,1_137_01,1_136_13,1_136_08,1_137_20,2_031_20,1_043_18,2_057_19,2_057_05,1_137_07,1_043_14,1_137_17,2_057_23,1_137_06,1_136_25,1_137_21,1_137_14,2_031_23,2_057_12,2_057_26,2_057_08,1_137_09,1_045_20,1_136_01,1_136_15,2_057_10,1_136_14,2_057_21,1_136_12,2_031_13,1_136_04,1_137_02,2_031_22,2_031_10,1_136_02,1_137_25,2_057_20,1_137_12,2_057_11,1_136_05,1_136_18,2_057_18,1_136_10,1_136_11,2_057_14,2_057_02,1_136_06,1_136_07,1_137_18,1_136_16,1_043_16,2_086_18,1_136_21,2_057_04,1_137_13,1_044_10,1_043_13,1_136_03,1_043_17,2_057_16,2_057_24,1_136_23,2_057_09,1_136_17,2_031_25,1_137_03,2_057_15,1_136_22,1_136_24,2_057_22,1_045_22,2_057_03,1_137_23,1_137_05,1_045_05,2_057_06,2_080_01,1_137_11,1_137_24,2_031_16,2_057_25,1_044_09,1_137_10"
	},
	{
	  name: "Farm Animals",
	  files: "1_133_02,1_133_03,1_133_04,1_133_05,1_133_07,1_133_08,1_133_09,1_133_10,1_133_12,1_133_13,1_133_14,1_133_15,1_133_16,1_133_17,1_133_18,1_133_19,1_133_20,1_133_21,1_133_22,1_133_23,1_133_25,1_133_26,1_134_03,1_134_05,1_134_06,1_134_08,1_134_10,1_134_13,1_134_14,1_134_18,1_134_19,1_134_24,1_138_04,1_138_12,1_138_14,1_138_23,1_139_02,1_139_03,1_139_06,1_139_11,1_139_12,1_139_13,1_139_17,1_139_18,1_139_20,1_139_21,1_143_08,1_143_09,2_080_05,2_080_06,2_080_08,2_086_15,2_112_26"
	},
	{
	  name: "Horses",
	  files: "1_134_01,1_134_02,1_134_07,1_134_11,1_134_15,1_134_17,1_134_21,1_134_22,1_139_16,1_143_01,1_143_02,1_143_03,1_143_04,1_143_05,1_143_06,1_143_09,1_143_10,1_143_11,1_143_12,1_143_13,1_143_14,1_143_15,1_143_16,1_143_17,1_143_18,1_143_19,1_143_20,1_143_21,1_143_22,1_143_23,1_143_26,1_178_25,1_178_26,2_061_01,2_061_02,2_061_04,2_061_06,2_061_12,2_061_13,2_061_15,2_061_22,2_061_23,2_061_24,2_061_25,2_061_26,2_080_03,2_086_21,2_190_21a,2_190_22a,2_190_23a,horse_001,horse_002,horse_003,horse_005,horse_006,horse_009"
	},
	{
	  name: "Insects",
	  files: "1_113_22,1_144_01,1_144_11,1_144_16,1_144_17,1_144_21,1_144_23,1_229_24,2_095_09,2_158_23,dragonfly_01,dragonfly_02,dragonfly_03"
	},
	{
	  name: "Mythical Animals",
	  files: "1_174_03,2_085_23,1_173_14,1_174_06,1_174_14,2_061_17,1_175_19,1_173_04,1_173_07,2_061_10,2_085_20,1_174_10,2_190_02a,2_061_03,1_174_25,1_173_02,1_173_01,1_173_11,1_173_03,1_174_21,1_044_05,1_173_20,2_061_20,1_180_11,2_158_26,2_190_01a,2_080_02,1_228_15,2_119_07,1_173_24,1_125_18,2_085_03,1_173_09"
	},
	{
	  name: "Prehistoric",
	  files: "1_135_01,1_135_02,1_135_03,1_135_04,1_135_05,1_135_06,1_135_07,1_135_08,1_135_09,1_135_10,1_135_11,1_135_13,1_135_14,1_135_15,1_135_16,1_135_17,1_135_18,1_135_20,1_135_21,1_135_22,1_135_23,1_135_25,1_135_26,dinosaur_001,dinosaur_002,dinosaur_003,dinosaur_004,dinosaur_005,dinosaur_006,dinosaur_007"
	},
	{
	  name: "Reptiles",
	  files: "lizard_001,1_173_05,frog_001,1_145_01,cobra_001,snake_001,2_080_11"
	},
	{
	  name: "World Animals",
	  files: "1_108_03,1_132_11,1_132_12,1_132_13,1_132_14,1_132_21,1_132_23,1_135_19,1_138_02,1_138_07,1_138_26,1_145_03,1_145_11,1_145_12,1_145_13,1_145_17,1_145_18,1_145_19,1_145_20,1_145_21,1_145_23,1_145_26,1_146_03,1_146_06,1_146_07,1_146_13,1_146_14,1_146_16,1_146_17,1_146_23,1_168_22,1_173_25,1_177_25,1_178_01,1_178_15,2_080_04,2_080_09,2_080_12,2_086_23,2_086_25,2_086_26,elephant_001,giraffe_001,giraffe_002,rhino_001"
	},
	{
	  name: "Australian Wildlife",
	  files: "1 numbat SOLID,10 cockatoo SOLID,11 cuckooshrike SOLID,12 sandpiper SOLID,13 blackwinged SOLID,14 tit SOLID,15 pardalote SOLID,16 willie SOLID,17 maggie SOLID,18 silvereye SOLID,19 raven SOLID,2 Bilby no1 SOLID,2 Bilby no2 SOLID,20 wattlebird SOLID,21 bee eater SOLID,22 swallow SOLID,23 honeyeater SOLID,24 spinifex hopping mouse SOLID,3 Spinebill SOLID,4 Robin SOLID,5 grasswren SOLID,6 fairy wren SOLID,7 red parrot SOLID,8 rosella SOLID,9 corella SOLID,Barn Owl SOLID,birdy SOLID,chuditch SOLID,Gecko_001,Gecko_002,Gecko_003,Kangaroo_001,Kangaroo_002,Kangaroo_003,Numbat_001,NZ_Kiwi Design_003,NZ_Kiwi_02"
	},
	{
	  name: "Australian Flora",
	  files: "alyogynehakeifolia(nativehibiscus),anigozanthos(kangaroopaw),banksiarufa,convolvulusangustissimus(bindweed),darwiniacarnea(mogumberbell),ivy(hedera)copy,swainsonaformosa(sturt’sdesertpea)"
	},
	{
	  name: "Architectural",
	  files: "1_217_01,1_217_02,1_217_03,1_217_04,1_217_05,1_217_06,1_217_07,1_217_08,1_217_09,1_217_10,1_217_11,1_217_12,1_217_13,1_217_14,1_217_15,1_217_16,1_217_17,1_217_18,1_217_19,1_217_20,1_217_21,1_217_22,1_217_23,1_217_24,1_217_25,1_217_26"
	},
	{
	  name: "Arrows",
	  files: "1_207_01,1_207_02,1_207_03,1_207_04,1_207_05,1_207_06,1_207_07,1_207_08,1_207_09,1_207_10,1_207_11,1_207_12,1_207_13,1_207_14,1_207_15,1_207_16,1_207_17,1_207_18,1_207_19,1_207_20,1_207_21,1_207_22,1_207_23,1_207_24,1_207_25,1_207_26"
	},
	{
	  name: "Borders",
	  files: "1_003_16,1_003_26,1_004_01,1_004_02,1_004_10,1_004_11,1_004_12,1_004_13,1_004_14,1_004_17,1_004_23,1_005_13,1_015_05,1_015_08,1_017_01,1_017_02,1_017_03,1_017_04,1_017_05,1_017_06,1_017_08,1_017_09,1_017_11,1_017_12,1_017_13,1_017_14,1_017_15,1_017_16,1_017_17,1_017_18,1_017_19,1_017_20,1_017_21,1_017_22,1_017_24,1_017_25,1_018_01,1_018_02,1_018_03,1_018_04,1_018_05,1_018_06,1_018_07,1_018_08,1_018_09,1_018_10,1_018_11,1_018_12,1_018_13,1_018_14,1_018_15,1_018_16,1_018_17,1_018_18,1_018_19,1_018_20,1_018_21,1_018_22,1_018_23,1_018_24,1_018_25,1_019_01,1_019_02,1_019_03,1_019_04,1_019_05,1_019_06,1_019_07,1_019_08,1_019_09,1_019_10,1_019_11,1_019_12,1_019_13,1_019_14,1_019_15,1_019_16,1_019_17,1_019_18,1_019_19,1_019_20,1_019_21,1_019_22,1_019_23,1_019_24,1_019_25,1_020_01,1_021_01,1_021_02,1_021_03,1_021_04,1_021_05,1_021_06,1_021_07,1_021_08,1_021_09,1_021_10,1_021_11,1_021_12,1_021_13,1_021_14,1_021_15,1_021_16,1_021_17,1_021_18,1_021_20,1_021_21,1_021_22,1_021_23,1_021_25,1_021_26,1_022_01,1_022_02,1_022_03,1_022_04,1_022_06,1_022_07,1_022_08,1_022_10,1_022_11,1_022_12,1_022_13,1_022_14,1_022_15,1_022_16,1_022_17,1_022_18,1_022_19,1_022_20,1_022_21,1_022_24,1_022_25,1_022_26,1_023_06,1_023_07,1_023_08,1_023_09,1_023_10,1_023_11,1_023_12,1_023_13,1_023_14,1_023_15,1_023_16,1_023_17,1_023_18,1_023_19,1_023_22,1_023_23,1_023_24,1_023_26,1_024_01,1_024_02,1_024_03,1_024_04,1_024_05,1_024_06,1_024_07,1_024_08,1_024_09,1_024_10,1_024_11,1_024_12,1_024_13,1_024_14,1_024_15,1_024_16,1_024_17,1_024_18,1_024_19,1_024_20,1_024_21,1_024_22,1_024_24,1_024_26,1_025_01,1_025_02,1_025_03,1_025_04,1_025_05,1_025_07,1_025_09,1_025_11,1_025_12,1_025_14,1_025_15,1_025_16,1_025_17,1_025_21,1_025_22,1_025_23,1_025_24,1_025_25,1_025_26,1_026_01,1_026_02,1_026_03,1_026_07,1_026_08,1_026_09,1_026_10,1_026_11,1_026_13,1_026_14,1_026_15,1_026_16,1_026_17,1_026_18,1_026_19,1_026_21,1_027_02,1_027_03,1_027_05,1_027_06,1_027_07,1_027_08,1_027_09,1_027_10,1_027_11,1_027_12,1_027_14,1_027_15,1_027_16,1_027_17,1_027_19,1_027_20,1_027_21,1_027_22,1_027_23,1_027_25,1_027_26,1_028_02,1_028_04,1_028_05,1_028_06,1_028_07,1_028_08,1_028_09,1_028_10,1_028_11,1_028_12,1_028_13,1_028_14,1_028_16,1_028_17,1_035_01,1_035_02,1_035_03,1_035_04,1_035_05,1_035_06,1_035_07,1_035_08,1_067_01,1_067_06,1_067_19,1_067_21,1_067_22,1_067_24,1_067_26,1_069_19,1_069_20,1_069_23,1_069_25,1_069_26,1_071_12,1_071_19,1_071_20,1_071_21,1_071_22,1_073_06,1_197_07,1_197_08,2_012_11,2_012_18,2_012_24,2_013_01,2_029_04,2_029_05,2_029_06,2_029_10,2_029_13,2_185_07"
	},
	{
	  name: "Cartoons",
	  files: "1_043_03,1_043_04,1_043_05,1_043_06,1_043_07,1_043_19,1_043_21,1_043_26,1_052_04,1_052_12,1_052_18,1_063_11,2_038_15,2_041_14,2_041_15,2_058_01,2_058_02,2_058_03,2_058_04,2_058_05,2_058_06,2_058_07,2_058_08,2_058_09,2_058_10,2_058_11,2_058_12,2_058_13,2_058_14,2_058_15,2_058_16,2_058_17,2_058_18,2_058_19,2_058_20,2_058_21,2_058_22,2_058_23,2_058_24,2_058_25,2_058_26,2_100_25,1_041_12,1_041_23,1_042_02,1_044_02,1_044_03,1_044_04,1_044_13,1_044_14,1_044_18,1_044_19,1_045_10,1_045_24,1_054_14,1_055_01,1_177_03,1_177_06,1_177_09,2_030_02,2_030_07,2_030_15,2_030_18,2_030_19,2_032_04,2_032_09,2_032_17,1_041_22,1_041_24,1_042_07,1_042_21,1_043_20,1_043_25,1_044_01,1_044_11,1_044_12,1_044_24,1_045_12,1_045_13,1_049_10,1_054_19,1_151_26,1_177_11,2_030_16,2_030_24,2_032_05,2_032_06,2_032_08,2_032_20,1_044_15,1_041_03,1_041_25,2_032_19,1_042_08,1_042_13,1_042_24,1_043_01,1_043_02,1_044_20,1_044_21,1_045_02,1_045_09,1_049_16,1_054_04,1_054_23,1_068_01,1_169_12,1_177_01,1_177_21,2_030_17,2_030_20,2_030_22,2_032_02,2_032_11,2_032_12,2_032_14,2_032_16,2_032_25,2_117_26,2_138_11,2_138_16,2_155_16,1_043_02,1_043_08,1_043_09,1_043_10,1_043_11,1_043_12,1_043_22,1_043_23,1_044_07,1_044_08,1_044_16,1_045_04,1_045_11,1_045_14,1_045_21,1_049_04,1_054_24,2_032_13,2_032_21,2_032_22,2_034_25,1_041_17,1_041_26,1_042_10,1_042_26,1_043_13,1_043_14,1_043_15,1_043_16,1_043_17,1_043_18,1_043_24,1_044_06,1_044_09,1_044_10,1_044_23,1_045_05,1_045_06,1_045_07,1_045_08,1_045_19,1_045_20,1_045_22,1_049_09,1_054_20,2_030_08,2_031_01,2_031_02,2_031_03,2_031_04,2_031_05,2_031_06,2_031_07,2_031_08,2_031_09,2_031_10,2_031_11,2_031_12,2_031_13,2_031_14,2_031_15,2_031_16,2_031_17,2_031_18,2_031_19,2_031_20,2_031_21,2_031_22,2_031_23,2_031_24,2_031_25,2_031_26,2_032_07,2_032_15,2_032_18,2_032_24,1_176_21,1_178_05,2_081_19,1_041_04,1_042_03,1_042_04,1_042_12,1_042_17,1_044_22,1_045_18,1_045_23,1_054_01,1_178_04,2_032_01,2_032_23,1_045_16,1_045_17,1_054_05,1_178_18,2_032_26,1_041_07,1_043_25,1_044_17,1_044_25,1_044_26,1_045_25,1_176_20,1_176_22,1_177_15,1_178_24,2_032_03,2_032_10,2_081_23,1_125_16,1_125_18,1_125_20,1_130_01,1_130_02,1_130_03,1_130_04,1_130_05,1_130_06,1_130_07,1_130_08,1_130_09,1_130_10,1_130_11,1_130_12,1_130_13,1_130_14,1_130_15,1_130_16,1_130_17,1_130_18,1_130_19,1_130_20,1_130_21,1_130_22,1_130_23,1_130_24,1_130_25,1_130_26,1_132_18,1_177_10,1_178_02,1_178_06,1_178_07,1_178_11,1_178_22,1_229_01,1_229_03,1_229_04,1_229_05,1_229_06,1_229_07,1_229_11,1_229_25,1_229_26,1_230_13,1_231_49,1_231_51,1_232_51,1_232_52,1_233_04,2_080_13,2_080_15,2_080_16,2_080_17,2_080_18,2_080_19,2_080_20,2_080_21,2_080_22,2_080_23,2_080_24,2_081_15,2_081_17,2_180_06,2_180_07,2_180_08,2_190_07a,2_190_07b,2_190_09a,2_190_09b,2_190_10a,2_190_10b,2_190_11a,2_190_11b,2_190_12a,2_190_12b,2_190_13a,2_190_13b,2_190_14a,2_190_14b,2_190_15a,2_190_15b,2_190_16a,2_190_16b,2_190_17a,2_190_17b,2_190_18a,2_190_18b,2_190_19a,2_190_19b,1_041_01,1_041_02,1_041_05,1_041_06,1_041_08,1_041_09,1_041_10,1_041_11,1_041_13,1_041_14,1_041_15,1_041_16,1_041_18,1_041_19,1_041_20,1_041_21,1_042_01,1_042_06,1_042_18,1_042_22,1_042_25,1_045_01,1_045_03,1_045_15,1_045_26,1_054_08,1_054_09,1_054_21,1_059_01,1_059_02,1_059_03,1_059_04,1_059_05,1_059_06,1_059_07,1_059_08,1_059_09,1_059_10,1_059_11,1_059_12,1_059_13,1_059_14,1_059_15,1_059_16,1_059_17,1_059_20,1_059_21,1_059_22,1_059_23,1_059_24,1_059_25,2_030_01,2_030_04,2_030_06,2_030_11,2_030_12,2_030_25,2_037_01,2_037_02,2_037_03,2_037_04,2_037_05,2_037_06,2_037_07,2_037_08,2_037_09,2_037_10,2_037_11,2_037_12,2_037_13,2_037_14,2_037_15,2_037_16,2_037_17,2_037_18,2_037_19,2_037_20,2_037_21,2_037_22,2_037_23,2_037_24,2_037_25,2_037_26,2_117_04,1_005_10,1_053_17,2_064_06,2_064_12,2_064_16,2_064_17,2_064_18,2_064_20,2_064_22,2_064_25,2_064_26,2_065_04,2_065_09,2_065_10,2_065_12,2_065_19,2_065_21,2_065_22,2_065_23,2_065_24,2_065_25,2_065_26,1_049_01,1_049_02,1_049_03,1_049_05,1_049_06,1_049_07,1_049_13,1_049_14,1_049_17,1_049_20,1_049_21,1_049_22,1_049_23,1_049_24,1_049_25,1_049_26,1_054_06,1_054_16,1_054_17,1_054_25,1_055_11,2_033_11,2_033_13,2_033_14,2_033_17,2_033_18,2_033_19,2_033_22,2_033_24,2_034_05,2_034_12,2_034_20,2_034_22,2_034_23,2_035_01,2_035_02,2_035_03,2_035_04,2_035_05,2_035_06,2_035_07,2_035_08,2_035_09,2_035_10,2_035_11,2_035_12,2_035_13,2_035_14,2_035_15,2_035_16,2_035_17,2_035_18,2_035_19,2_035_20,2_035_21,2_035_22,2_035_23,2_035_24,2_035_25,2_035_26,1_042_19,1_049_11,1_049_18,1_062_26,1_042_05,1_042_09,1_042_11,1_042_14,1_042_15,1_042_16,1_042_20,1_042_23,1_049_08,1_049_12,1_049_15,1_049_19,1_050_01,1_050_02,1_050_03,1_050_04,1_050_05,1_050_06,1_050_07,1_050_08,1_050_09,1_050_10,1_050_11,1_050_12,1_050_13,1_050_14,1_050_15,1_050_16,1_050_17,1_050_18,1_050_19,1_050_20,1_050_21,1_050_22,1_050_23,1_050_24,1_050_25,1_050_26,1_051_01,1_051_02,1_051_03,1_051_04,1_051_05,1_051_06,1_051_07,1_051_08,1_051_09,1_051_10,1_051_11,1_051_12,1_051_13,1_051_14,1_051_15,1_051_16,1_051_17,1_051_18,1_051_19,1_051_20,1_051_21,1_051_22,1_051_23,1_051_24,1_051_25,1_051_26,1_052_01,1_052_02,1_052_03,1_052_05,1_052_06,1_052_07,1_052_08,1_052_09,1_052_10,1_052_11,1_052_13,1_052_14,1_052_15,1_052_16,1_052_17,1_052_19,1_052_20,1_052_21,1_052_22,1_052_23,1_052_24,1_052_25,1_052_26,1_053_01,1_053_02,1_053_03,1_053_04,1_053_05,1_053_06,1_053_07,1_053_08,1_053_09,1_053_10,1_053_11,1_053_12,1_053_13,1_053_14,1_053_15,1_053_16,1_053_18,1_053_19,1_053_20,1_053_21,1_053_22,1_053_23,1_053_24,1_053_25,1_054_02,1_054_03,1_054_07,1_054_10,1_054_12,1_054_13,1_054_15,1_054_18,1_054_22,1_054_26,1_055_02,1_055_03,1_055_04,1_055_05,1_055_06,1_055_07,1_055_08,1_055_09,1_055_10,1_055_12,1_055_13,1_055_14,1_055_15,1_055_16,1_055_17,1_055_18,1_055_19,1_055_20,1_055_21,1_055_22,1_055_23,1_055_24,1_055_25,1_055_26,1_056_01,1_056_02,1_056_03,1_056_04,1_056_05,1_056_06,1_056_07,1_056_08,1_056_09,1_056_10,1_056_11,1_056_12,1_056_13,1_056_14,1_056_15,1_056_16,1_056_17,1_056_18,1_056_19,1_056_20,1_056_21,1_056_22,1_056_23,1_056_24,1_056_25,1_056_26,1_057_01,1_057_02,1_057_03,1_057_04,1_057_05,1_057_06,1_057_07,1_057_08,1_057_09,1_057_10,1_057_11,1_057_12,1_057_13,1_057_14,1_057_15,1_057_16,1_057_17,1_057_18,1_057_19,1_057_20,1_057_21,1_057_22,1_057_23,1_057_24,1_057_25,1_057_26,1_058_01,1_058_02,1_058_03,1_058_04,1_058_05,1_058_06,1_058_07,1_058_08,1_058_09,1_058_10,1_058_11,1_058_12,1_058_13,1_058_14,1_058_15,1_058_16,1_058_17,1_058_18,1_058_19,1_058_20,1_058_21,1_058_22,1_058_23,1_058_24,1_058_25,1_058_26,1_059_18,1_059_19,1_059_26,1_060_01,1_060_02,1_060_03,1_060_04,1_060_05,1_060_06,1_060_07,1_060_08,1_060_09,1_060_10,1_060_11,1_060_12,1_060_13,1_060_14,1_060_15,1_060_16,1_060_17,1_060_18,1_060_19,1_060_20,1_060_21,1_060_22,1_060_23,1_060_24,1_060_25,1_060_26,1_062_01,1_062_02,1_062_03,1_062_04,1_062_05,1_062_06,1_062_07,1_062_08,1_062_09,1_062_10,1_062_11,1_062_12,1_062_13,1_062_14,1_062_15,1_062_18,1_062_19,1_062_20,1_062_21,1_062_22,1_062_24,1_062_25,1_063_01,1_063_02,1_063_03,1_063_04,1_063_05,1_063_06,1_063_07,1_063_08,1_063_09,1_063_10,1_063_12,1_063_13,1_063_14,1_063_15,1_063_16,1_063_17,1_063_18,1_063_19,1_063_20,1_063_21,1_063_22,1_063_23,1_063_24,1_063_25,1_063_26,1_153_01,1_153_26,1_175_13,2_030_03,2_030_05,2_030_09,2_030_10,2_030_13,2_030_14,2_030_21,2_030_23,2_030_26,2_033_02,2_033_03,2_033_04,2_033_05,2_033_06,2_033_07,2_033_08,2_033_09,2_033_10,2_033_12,2_033_15,2_033_16,2_033_20,2_033_21,2_033_25,2_033_26,2_034_01,2_034_02,2_034_03,2_034_04,2_034_06,2_034_07,2_034_08,2_034_09,2_034_10,2_034_11,2_034_14,2_034_15,2_034_16,2_034_17,2_034_18,2_034_19,2_034_24,2_036_01,2_036_02,2_036_03,2_036_04,2_036_05,2_036_06,2_036_07,2_036_08,2_036_09,2_036_10,2_036_11,2_036_12,2_036_13,2_036_14,2_036_15,2_036_16,2_036_17,2_036_18,2_036_19,2_036_20,2_036_21,2_036_22,2_036_23,2_036_24,2_036_25,2_036_26,2_038_01,2_038_02,2_038_03,2_038_04,2_038_05,2_038_06,2_038_07,2_038_08,2_038_09,2_038_10,2_038_11,2_038_12,2_038_13,2_038_14,2_038_16,2_038_17,2_038_18,2_038_19,2_038_20,2_038_21,2_038_22,2_038_23,2_038_24,2_038_25,2_038_26,2_040_01,2_040_02,2_040_03,2_040_04,2_040_05,2_040_06,2_040_07,2_040_08,2_040_09,2_040_10,2_040_11,2_040_12,2_040_13,2_040_14,2_040_15,2_040_16,2_040_17,2_040_18,2_040_19,2_040_20,2_040_21,2_040_22,2_040_23,2_040_24,2_040_25,2_040_26,2_041_01,2_041_02,2_041_03,2_041_04,2_041_05,2_041_06,2_041_07,2_041_08,2_041_09,2_041_10,2_041_11,2_041_12,2_041_13,2_041_16,2_041_17,2_041_18,2_041_19,2_041_20,2_041_21,2_041_22,2_041_23,2_041_24,2_041_25,2_041_26,2_084_01,2_084_02,2_084_03,2_084_04,2_084_05,2_084_06,2_084_07,2_084_08,2_084_09,2_084_10,2_084_11,2_084_12,2_084_13,2_084_14,2_084_15,2_084_16,2_084_17,2_084_18,2_084_19,2_084_20,2_084_21,2_084_22,2_084_23,2_084_24,2_084_25,2_084_26,2_117_07,2_117_24,2_119_25,1_062_16,1_062_17,1_062_23,2_033_01,2_033_23,2_034_13,2_034_21,2_034_26,2_117_14"
	},
	{
	  name: "Corners",
	  files: "1_007_25,1_007_26,1_008_21,1_011_16,1_011_17,1_037_10,1_037_11,1_037_12,1_037_13,1_065_04,1_065_05,1_065_06,1_065_07,1_065_10,1_065_11,1_065_12,1_065_13,1_065_14,1_065_15,1_065_16,1_065_18,1_065_19,1_065_21,1_069_02,1_069_04,1_069_05,1_069_07,1_208_01,1_208_03,1_208_04,1_208_05,1_208_15,1_208_20,1_208_26,1_209_01,1_209_14,1_209_15,1_209_17,1_209_18,1_209_19,1_209_20,1_209_21,1_209_22,1_209_23,1_209_24,1_209_25,1_209_26,1_210_01,1_210_03,1_210_04,1_210_05,1_210_06,1_210_08,1_210_09,1_210_14,1_210_15,1_210_16,1_210_17,1_210_18,1_210_19,1_210_20,1_210_21,1_210_22,1_210_23,1_210_24,1_210_25,1_210_26,2_001_21,2_003_01,2_003_02,2_003_03,2_003_04,2_003_05,2_003_06,2_003_24"
	},
	{
	  name: "Children's Toys",
	  files: "1_182_08,teddy-bear_001,teddy-bear_002,teddy-bear_003,teddy-bear_007"
	},
	{
	  name: "Ornaments",
	  files: "1_008_22,1_008_23,1_008_24,1_008_25,1_008_26,1_008_27,1_008_28,1_008_29,1_008_30,1_008_31,1_008_32,1_008_33,1_008_34,1_008_35,1_008_36,1_008_37,1_008_38,1_008_39,1_008_40,1_009_07,1_009_14,1_009_16,1_009_22,1_009_23,1_009_24,1_009_26,1_010_01,1_010_03,1_010_04,1_010_10,1_010_11,1_010_12,1_010_13,1_010_14,1_010_15,1_011_06,1_011_07,1_011_08,1_011_09,1_011_10,1_011_11,1_011_12,1_011_24,1_011_25,1_013_20,1_013_21,1_029_12,1_029_13,1_029_14,1_029_15,1_029_16,1_029_17,1_029_18,1_029_19,1_029_21,1_029_22,1_029_23,1_030_10,1_030_11,1_032_23,1_032_25,1_065_01,1_065_02,1_065_22,1_065_23,1_065_24,1_065_25,1_066_07,1_066_12,1_066_13,1_066_14,1_066_15,1_066_16,1_066_17,1_066_18,1_066_19,1_066_20,1_066_21,1_066_22,1_066_23,1_066_24,1_066_25,1_066_26,1_069_08,1_069_17,1_071_05,1_124_01,1_124_04,1_124_08,1_124_09,1_124_10,1_124_11,1_124_12,1_124_13,1_124_16,1_124_17,1_124_18,1_124_20,1_124_21,1_228_18"
	},
	{
	  name: "Flourishes",
	  files: "1_006_20,1_006_21,1_007_07,1_007_08,1_007_12,1_007_19,1_194_04,1_194_12,1_194_16,1_195_25,1_225_21,1_228_11,1_228_20,1_228_21,1_228_24,1_228_25,1_235_10,1_235_24,2_001_07,2_001_08,2_001_12,2_012_03,2_012_04,2_134_01,2_134_02,2_134_03,2_134_10,2_134_16,2_139_07,2_139_08,2_139_09,2_139_10,2_139_11,2_139_12,2_139_13,2_139_14,2_139_15,2_139_16,2_139_18,2_139_20,2_139_21,2_139_22,2_139_23,2_139_24,2_139_25,2_139_26,2_148_13,2_154_04,2_154_05,2_154_06,2_154_07,2_154_08,2_154_09,2_154_10,2_154_11,2_154_12,2_154_13,2_154_14,2_154_15,2_154_16,2_154_20,2_154_24,2_154_25,2_154_26,2_159_06,2_194_16,1_008_22,1_008_23,1_008_24,1_008_25,1_008_26,1_008_27,1_008_28,1_008_29,1_008_30,1_008_31,1_008_32,1_008_33,1_008_34,1_008_35,1_008_36,1_008_37,1_008_38,1_008_39,1_008_40,1_009_07,1_009_14,1_009_16,1_009_22,1_009_23,1_009_24,1_009_26,1_010_01,1_010_03,1_010_04,1_010_10,1_010_11,1_010_12,1_010_13,1_010_14,1_010_15,1_011_06,1_011_07,1_011_08,1_011_09,1_011_10,1_011_11,1_011_12,1_011_24,1_011_25,1_013_20,1_013_21,1_029_12,1_029_13,1_029_14,1_029_15,1_029_16,1_029_17,1_029_18,1_029_19,1_029_21,1_029_22,1_029_23,1_030_10,1_030_11,1_032_23,1_032_25,1_065_01,1_065_02,1_065_22,1_065_23,1_065_24,1_065_25,1_066_07,1_066_12,1_066_13,1_066_14,1_066_15,1_066_16,1_066_17,1_066_18,1_066_19,1_066_20,1_066_21,1_066_22,1_066_23,1_066_24,1_066_25,1_066_26,1_069_08,1_069_17,1_071_05,1_124_01,1_124_04,1_124_08,1_124_09,1_124_10,1_124_11,1_124_12,1_124_13,1_124_16,1_124_17,1_124_18,1_124_20,1_124_21,1_228_18,1_005_23,1_005_25,1_005_26,1_202_13,1_205_11,1_205_17,1_205_21,1_205_22,1_206_01,1_206_02,1_206_03,1_206_04,1_206_05,1_206_06,1_206_07,1_206_09,1_206_10,1_206_11,1_206_15,1_206_16,1_206_25,1_240_26,2_001_01,2_001_09,2_156_02,2_156_03,2_156_06,2_156_07,2_156_08,2_156_11,2_156_12,2_156_13,2_156_14,2_156_15,2_156_16,2_156_17,2_156_18,2_156_19,2_156_20,2_156_21,2_156_22,2_156_23,2_156_24,2_156_25,2_156_26,2_157_01,2_157_02,2_157_03,2_157_04,2_157_05,2_157_06,2_157_07,2_157_08,2_157_10,2_157_11,2_157_12,2_157_13,2_157_14,2_157_16,2_157_18,2_157_19,2_157_20,2_157_21,2_157_22,2_157_24,2_157_25,2_157_26,2_158_10,2_158_13,2_159_01,2_159_02,2_159_07,2_159_10,2_195_03,2_195_04,2_195_06,2_195_07,2_195_08,Border-Tropical_001,Islander_001,Surfboard_01,Surfboard_02,Surfboard_04,Surfboard_05"
	},
	{
	  name: "Flowers",
	  files: "1_002_16,1_002_20,1_006_01,1_006_03,1_006_05,1_006_07,1_006_09,1_006_11,1_006_13,1_153_07,1_153_08,1_153_10,1_153_11,1_153_12,1_153_14,1_153_18,1_153_20,1_153_21,1_154_01,1_154_02,1_154_05,1_154_06,1_154_07,1_154_08,1_154_10,1_154_11,1_154_12,1_154_13,1_154_14,1_154_15,1_154_16,1_154_17,1_154_18,1_154_19,1_154_23,1_154_26,1_155_01,1_155_04,1_155_05,1_155_06,1_155_07,1_155_08,1_155_09,1_155_10,1_155_11,1_155_12,1_155_13,1_155_14,1_155_15,1_155_16,1_155_17,1_155_19,1_155_20,1_155_22,1_155_23,1_155_25,1_156_01,1_156_02,1_156_03,1_156_04,1_156_05,1_156_06,1_156_07,1_156_08,1_156_09,1_156_10,1_156_11,1_156_12,1_156_13,1_156_14,1_156_15,1_156_16,1_156_17,1_156_18,1_156_19,1_156_20,1_156_21,1_156_22,1_156_23,1_156_24,1_156_25,1_156_26,1_157_06,1_157_08,1_157_17,1_157_25,1_159_01,1_159_03,1_159_06,1_159_07,1_159_09,1_159_13,1_159_15,1_159_16,1_159_17,1_159_18,1_159_19,1_159_21,1_159_23,1_159_25,1_159_26,1_167_01,1_167_19,1_167_21,1_169_11,1_169_18,1_179_05,1_193_01,1_193_02,1_193_03,1_193_04,1_193_06,1_193_07,1_193_08,1_193_09,1_193_10,1_193_11,1_193_12,1_193_13,1_193_14,1_193_15,1_193_16,1_193_17,1_193_18,1_193_19,1_193_20,1_193_21,1_193_22,1_193_23,1_193_24,1_193_25,1_193_26,1_194_01,1_197_07,1_197_08,1_197_22,1_198_02,1_198_08,1_198_09,1_198_11,1_198_20,1_198_21,1_198_24,1_199_01,1_199_02,1_199_03,1_199_04,1_199_05,1_199_06,1_199_07,1_199_08,1_199_09,1_199_10,1_199_11,1_199_12,1_199_13,1_199_14,1_199_15,1_199_16,1_199_17,1_199_18,1_199_19,1_199_20,1_199_21,1_199_22,1_199_23,1_199_24,1_199_25,1_199_26,2_081_04,2_081_05,2_081_06,2_081_07,2_081_08,2_086_01,2_086_04,2_095_19,2_095_20,2_095_23,2_116_20,2_129_01,2_129_02,2_129_03,2_129_04,2_129_05,2_129_06,2_129_07,2_129_08,2_129_10,2_129_11,2_129_12,2_129_13,2_129_14,2_129_15,2_129_16,2_129_17,2_129_18,2_129_19,2_129_20,2_129_21,2_129_22,2_129_24,2_129_25,2_129_26,2_131_01,2_131_02,2_131_03,2_131_04,2_131_05,2_131_06,2_131_07,2_131_08,2_131_09,2_131_10,2_131_11,2_131_12,2_131_13,2_131_14,2_131_15,2_131_16,2_131_17,2_131_18,2_131_19,2_131_20,2_131_21,2_131_22,2_131_23,2_131_24,2_131_25,2_131_26,2_132_02,2_132_03,2_132_04,2_132_05,2_132_06,2_132_07,2_132_08,2_132_11,2_132_12,2_132_13,2_132_14,2_132_17,2_132_18,2_132_19,2_132_20,2_132_21,2_132_22,2_132_23,2_132_24,2_132_25,2_155_13,flower5_full_flower,flowerrose_01,flowerrose_02,flowerrose_03,flower_001,flower_002,flower_003,flower_004,flower_005,flower_006,flower_007,flower_009,flower_010,flower_011,flower_012 [przekonwertowany],flower_013 [przekonwertowany],flower_015,fullflower_005,lotus_001,rose_001,rose_002"
	},
	{
	  name: "Food & Drink",
	  files: "1_163_17,1_163_18,1_163_21,1_164_05,1_164_07,1_164_08,1_164_11,1_164_12,1_164_13,1_164_14,1_164_15,1_164_16,1_164_24,1_165_02,1_165_13,1_165_25,1_165_26,1_182_02,2_073_04,2_075_01,2_075_02,2_075_03,2_075_04,2_075_05,2_075_07,2_076_02,2_076_04,2_076_05,2_076_06,2_076_07,2_076_08,2_076_09,2_076_10,2_076_11,2_076_12,2_076_13,2_076_14,2_076_15,2_076_16,2_076_17,2_076_18,2_076_19,2_076_20,2_076_21,2_076_22,2_076_23,2_076_24,2_076_25,2_076_26,2_077_01,2_077_02,2_077_03,2_077_04,2_077_05,2_077_06,2_077_07,2_077_08,2_077_09,2_077_10,2_077_11,2_077_12,2_077_13,2_077_14,2_077_15,2_077_16,2_077_17,2_077_18,2_077_19,2_077_20,2_077_21,2_077_22,2_077_23,2_077_25,2_077_26,2_091_15,2_091_21,2_091_22,2_103_10,2_103_11,2_103_19,2_103_21,2_103_26,2_116_21,2_116_24,2_116_25,2_119_02,2_119_15,1_157_02,1_160_01,1_160_02,1_160_03,1_160_04,1_160_05,1_160_06,1_160_10,1_160_12,1_160_13,1_160_14,1_160_15,1_160_17,1_160_18,1_160_19,1_160_21,1_160_23,1_161_01,1_161_02,1_161_03,1_161_04,1_161_05,1_161_06,1_161_07,1_161_08,1_161_11,1_161_12,1_161_13,1_161_14,1_161_15,1_161_16,1_161_17,1_161_18,1_161_20,1_161_22,1_161_23,1_161_24,1_161_25,1_161_26,1_162_01,1_162_02,1_162_03,1_162_04,1_162_05,1_162_06,1_162_07,1_162_08,1_162_10,1_162_11,1_162_12,1_162_13,1_162_14,1_162_15,1_162_16,1_162_17,1_162_18,1_162_19,1_162_20,1_162_21,1_162_22,1_162_23,1_162_24,1_162_25,1_163_05,1_163_07,1_163_11,1_169_01,1_177_13,1_198_10,1_200_01,1_200_02,1_200_03,1_200_04,1_200_05,1_200_06,1_200_07,1_200_08,1_200_09,1_200_10,1_200_11,1_200_12,1_200_13,1_200_14,1_200_15,1_200_16,1_200_17,1_200_18,1_200_19,1_200_20,1_200_21,1_200_22,1_200_23,1_200_24,1_200_25,1_200_26,2_074_01,2_074_03,2_074_04,2_074_07,2_074_13,2_074_14,2_074_15,2_075_13,2_075_18,2_075_20,2_078_13,2_117_01"
	},
	{
	  name: "Hearts",
	  files: "1_167_03,1_168_24,2_152_01,2_152_05,2_152_06,2_152_07,2_152_08,2_152_09,2_152_10,2_152_11,2_152_12,2_152_14,2_152_17,2_152_18,2_152_19d,2_152_20,2_152_21,2_152_22,2_152_23,2_152_24,2_152_25,2_152_26,2_155_14,ribbon_01"
	},
	{
	  name: "History",
	  files: "1_167_12,1_170_01,1_170_10,1_170_18,1_170_19,1_170_20,1_170_21,1_170_24,1_173_23,1_176_04,1_176_10,1_176_19,1_177_14,1_177_17,1_177_19,1_177_20,1_178_13,1_184_11,1_229_21,2_079_02,2_079_03,2_079_04,2_079_05,2_079_06,2_079_07,2_079_08,2_079_10,2_079_12,2_079_13,2_079_14,2_079_15,2_079_17,2_079_18,2_079_19,2_079_22,2_079_23,2_079_26,2_081_13,2_081_14,2_081_16,2_081_18,2_081_20,2_081_21,2_081_22,2_081_24,2_081_25,2_081_26,2_086_22"
	},
	{
	  name: "Festivals",
	  files: "1_167_06,1_167_08,1_167_19,1_167_25,1_168_01,1_168_05,1_168_08,1_168_10,1_168_11,1_168_19,1_169_07,1_169_13,1_169_14,1_169_16,1_169_22,1_169_26,2_116_03,2_116_24,2_116_25,2_116_26,2_118_01,2_118_03,2_118_04,2_118_06,2_118_08,2_118_10,2_118_24,2_119_02,2_119_06,2_119_10,2_119_15,2_119_19,2_119_22,clover_001,black+shamrock"
	},
	{
	  name: "Household Items",
	  files: "1_128_01,1_134_09,1_147_01,1_147_02,1_147_03,1_147_04,1_147_05,1_147_06,1_147_07,1_147_08,1_147_09,1_147_10,1_147_11,1_147_12,1_147_13,1_147_14,1_147_15,1_147_16,1_147_17,1_147_18,1_147_19,1_147_20,1_147_21,1_147_22,1_147_23,1_147_24,1_147_25,1_147_26,1_151_02,1_151_03,1_151_04,1_151_05,1_151_06,1_151_07,1_151_08,1_151_09,1_151_10,1_151_11,1_151_12,1_151_13,1_151_14,1_151_15,1_151_16,1_151_17,1_151_18,1_151_19,1_151_20,1_151_21,1_151_22,1_151_23,1_151_24,1_151_25,1_153_05,1_154_03,1_162_26,1_167_02,1_167_11,1_167_13,1_167_16,1_167_17,1_168_03,1_168_16,1_169_02,1_169_03,1_169_23,1_171_01,1_175_01,1_175_12,1_175_14,1_175_21,1_177_04,1_177_05,1_177_07,1_177_22,1_177_24,1_178_03,1_179_08,1_179_18,1_179_22,1_182_13,1_219_02,1_219_12,1_220_26,2_068_01,2_068_02,2_068_03,2_068_04,2_068_05,2_068_06,2_068_07,2_068_08,2_068_09,2_068_10,2_068_11,2_068_12,2_068_13,2_068_14,2_068_15,2_068_16,2_068_17,2_068_18,2_068_19,2_068_20,2_068_21,2_068_22,2_068_23,2_068_24,2_068_25,2_068_26,2_069_01,2_069_02,2_069_03,2_069_04,2_069_05,2_069_06,2_069_07,2_069_08,2_069_09,2_069_10,2_069_11,2_069_12,2_069_13,2_069_14,2_069_15,2_069_16,2_069_17,2_069_18,2_069_19,2_069_20,2_069_21,2_069_22,2_069_23,2_069_24,2_069_25,2_069_26,2_070_01,2_070_02,2_070_03,2_070_04,2_070_05,2_070_06,2_070_07,2_070_08,2_070_09,2_070_10,2_070_11,2_070_12,2_070_13,2_070_14,2_070_15,2_070_16,2_070_17,2_070_18,2_070_19,2_070_20,2_070_21,2_070_22,2_070_23,2_070_24,2_070_25,2_073_05,2_073_06,2_073_08,2_073_11,2_073_12,2_073_16,2_073_22,2_073_23,2_073_24,2_073_25,2_073_26,2_074_20,2_074_22,2_074_25,2_075_06,2_075_10,2_075_11,2_075_12,2_075_15,2_075_16,2_075_23,2_078_02,2_086_05,2_086_06,2_086_07,2_086_08,2_086_09,2_086_10,2_086_11,2_086_12,2_086_13,2_086_14,2_087_01,2_087_03,2_087_04,2_087_05,2_087_06,2_087_07,2_087_09,2_087_10,2_087_11,2_087_12,2_087_13,2_087_14,2_087_15,2_087_16,2_087_17,2_087_18,2_087_19,2_087_20,2_087_21,2_087_22,2_087_23,2_087_24,2_087_25,2_087_26,2_089_19,2_089_20,2_089_22,2_089_26,2_091_01,2_091_02,2_091_03,2_091_04,2_091_05,2_091_06,2_091_07,2_091_08,2_091_09,2_091_10,2_091_11,2_091_12,2_091_13,2_091_14,2_091_16,2_091_17,2_091_18,2_091_19,2_091_20,2_091_23,2_091_24,2_091_25,2_091_26,2_092_01,2_092_02,2_092_03,2_092_04,2_092_05,2_092_06,2_092_07,2_092_08,2_092_09,2_092_10,2_092_11,2_092_12,2_092_13,2_092_14,2_092_15,2_092_16,2_092_17,2_092_18,2_092_19,2_092_20,2_092_21,2_092_22,2_092_23,2_092_24,2_092_25,2_092_26,2_093_01,2_093_02,2_093_03,2_093_04,2_093_05,2_093_06,2_093_07,2_093_08,2_093_09,2_093_10,2_093_11,2_093_12,2_093_13,2_093_14,2_093_15,2_093_16,2_093_17,2_093_18,2_093_19,2_093_20,2_093_21,2_093_22,2_093_23,2_093_24,2_093_25,2_093_26,2_094_01,2_094_02,2_094_03,2_094_04,2_094_05,2_094_06,2_094_07,2_094_08,2_094_09,2_094_10,2_094_11,2_094_12,2_094_13,2_094_14,2_094_15,2_094_16,2_094_17,2_094_18,2_094_19,2_094_20,2_094_21,2_094_22,2_094_23,2_094_24,2_094_25,2_094_26,2_096_01,2_096_02,2_096_03,2_096_04,2_096_05,2_096_06,2_096_07,2_096_08,2_096_09,2_096_10,2_096_11,2_096_12,2_096_13,2_096_14,2_096_15,2_096_16,2_096_17,2_096_18,2_096_19,2_096_20,2_096_21,2_096_22,2_096_23,2_096_24,2_096_25,2_096_26,2_103_01,2_103_02,2_103_03,2_103_04,2_103_05,2_103_06,2_103_08,2_103_13,2_103_14,2_103_15,2_103_16,2_103_17,2_103_18,2_103_22,2_103_23,2_103_25,2_116_02,2_116_07,2_116_09,2_116_10,2_116_15,2_116_17,2_116_18,2_116_19,2_117_02,2_117_03,2_117_05,2_117_06,2_117_09,2_117_10,2_117_12,2_117_15,2_117_17,2_117_18,2_117_19,2_117_21,2_119_01,2_119_11,2_119_16,2_119_17,2_119_18,2_119_24,2_125_01,2_125_02,2_125_03,2_125_04,2_125_05,2_125_06,2_125_07,2_125_08,2_125_09,2_125_10,2_125_11,2_125_12,2_125_13,2_125_14,2_125_15,2_125_16,2_125_17,2_125_18,2_125_19,2_125_20,2_125_21,2_125_22,2_125_23,2_125_24,2_125_25,2_125_26,2_126_01,2_126_02,2_126_03,2_126_04,2_126_05,2_126_06,2_126_07,2_126_08,2_126_09,2_126_10,2_126_11,2_126_12,2_126_13,2_126_14,2_126_15,2_126_16,2_126_17,2_126_18,2_126_19,2_126_20,2_126_22,2_126_23,2_126_24,2_126_25,2_126_26,2_149_01,2_149_02,2_149_03,2_149_04,2_149_05,2_149_06,2_149_07,2_149_08,2_149_09,2_149_10,2_149_11,2_149_12,2_149_13,2_149_14,2_149_15,2_149_16,2_149_17,2_149_18,2_149_19,2_149_20,2_149_21,2_149_22,2_149_23,2_149_24,2_149_25,2_149_26"
	},
	{
	  name: "Islander",
	  files: "129-01,129-02,129-03,129-05,129-06,129-07,129-08,129-10,129-11,129-14,129-15,129-21,129-25,144-04,145-15,155-01,155-02,155-03,155-04,155-05,155-06,155-07,155-08,155-09,155-10,155-11,155-12,155-13,155-14,155-15,155-16,155-17,155-18,155-19,155-20,155-21,155-22,155-23,155-24,155-25,156-10,156-13,156-20,157-06,158-24,158-25,158-26,159-01,159-02,159-03,159-04,159-05,159-06,159-07,159-08,159-09,159-10,159-11,159-12,159-13,159-14,159-15,159-16,159-17,159-18,159-19,159-20,159-21,159-22,159-23,159-24,159-25,159-26,206-25,bronzeangel2,butterfly_005,butterfly_008,butterfly_027,cockatoo2,croc _ 01,croc_01,cross_004,cross_005,dolphin_002,dolphin_007,dove_002,dragonfly_03,flag_aboriginal,flag_australian,flag_png,flag_torresstrait,flowerrose_02,flowerrose_03,flower_002,flower_004,flower_005,flower_006,flower_010,gecko_003,gumnuts_01,horse_009,kangaroo_003,palmtree_005,parrot,schooner2[converted],schooner4[converted]2,shell_001,shell_003 [przekonwertowany],southerncross_001,sun_002,tortoise_001,turtle_001,turtle_002,turtle_005,turtle_008,turtle_01,turtle_010,turtle_011,turtle_02"
	},
	{
	  name: "Iconic Places",
	  files: "1_152_02,1_152_03,1_152_04,1_152_05,1_152_06,1_152_07,1_152_08,1_152_09,1_152_10,1_152_11,1_152_12,1_152_13,1_152_14,1_152_15,1_152_16,1_152_17,1_152_18,1_152_19,1_152_20,1_152_21,1_152_22,1_152_23,1_152_24,1_152_25,2_088_02,2_088_03,2_088_04,2_088_05,2_088_06,2_088_07,2_088_08,2_088_09,2_088_10,2_088_11,2_088_12,2_088_13,2_088_14,2_088_15,2_088_16,2_088_17,2_088_18,2_088_19,2_088_20,2_088_21,2_088_22,2_088_23,2_088_24,2_088_25,2_088_26,2_109_01,2_109_02,2_109_03,2_109_04,2_109_05,2_109_07,2_109_08,2_109_09,2_109_10,2_109_11,2_109_12,2_109_13,2_109_14,2_109_15,2_109_16,2_109_17,2_109_18,2_109_19,2_109_20,2_109_21,2_109_22,2_109_23,2_109_24,2_109_25,2_109_26,2_110_01,2_110_02,2_110_03,2_110_04,2_110_05,2_110_06,2_110_07,2_110_08,2_110_11,2_110_13,2_110_14,2_110_15,2_110_16,2_110_19,2_110_20,2_110_22,2_110_23,2_110_24,2_110_26,2_111_01,2_111_02,2_111_03,2_111_04,2_111_05,2_111_06,2_111_07,2_111_08,2_111_09,2_111_10,2_111_11,2_111_12,2_111_13,2_111_14,2_111_15,2_111_16,2_111_17,2_111_18,2_111_19,2_111_20,2_111_21,2_111_22,2_111_23,2_111_24,2_111_25,2_111_26,2_112_01,2_112_02,2_112_03,2_112_04,2_112_05,2_112_06,2_112_07,2_112_08,2_112_09,2_112_10,2_112_11,2_112_12,2_112_13,2_112_14,2_112_15,2_112_16,2_112_17,2_112_18,2_112_19,2_112_20,2_112_21,2_112_22,2_112_23,2_112_24,2_112_25,2_113_01,2_113_02,2_113_04,2_113_05,2_113_06,2_113_07,2_113_08,2_113_09,2_113_10,2_113_11,2_113_12,2_113_13,2_113_14,2_113_15,2_113_16,2_113_18,2_113_19,2_113_20,2_113_21,2_113_22,2_113_23,2_113_24,2_113_25,2_113_26,2_114_01,2_114_02,2_114_03,2_114_04,2_114_05,2_114_06,2_114_07,2_114_08,2_114_09,2_114_10,2_114_11,2_114_12,2_114_13,2_114_14,2_114_15,2_114_16,2_114_17,2_114_18,2_114_19,2_114_20,2_114_21,2_114_22,2_114_23,2_114_24,2_114_25,2_114_26,2_115_02,2_115_03,2_115_04,2_115_05,2_115_06,2_115_07,2_115_09,2_115_10,2_115_13,2_115_19,2_117_16,2_117_20"
	},
	{
	  name: "Moon & Stars",
	  files: "1_002_09,1_002_10,1_126_26,1_169_06,1_175_08,1_175_17,1_175_24,1_176_23,1_179_02,1_179_03,1_179_06,1_179_19,2_082_01,2_082_02,2_082_03,2_082_04,2_082_05,2_082_06,2_082_07,2_082_08,2_082_09,2_082_10,2_082_11,2_082_17,2_082_18,2_082_19,2_082_20,2_082_23,2_082_24,2_082_25,2_082_26,2_083_03,2_083_04,2_083_05,2_083_06,2_083_07,2_083_08,2_083_09,2_083_10,2_083_11,2_083_12,2_083_13,2_083_14,2_083_15,2_083_16,2_083_17,2_083_18,2_083_19,2_083_20,2_083_21,2_083_22,2_083_23,2_083_24,2_083_25,2_083_26,2_119_13,2_119_20,2_147_13,2_147_15,2_147_18,2_147_19,2_147_20,2_147_21,2_147_23,2_147_24,Moon-Star_001,Sun_001,Sun_002"
	},
	{
	  name: "Music & Dance",
	  files: "1_072_06,1_072_07,1_072_08,1_072_09,1_072_10,1_072_11,1_072_12,1_072_13,1_072_14,1_072_15,1_072_16,1_072_17,1_072_18,1_072_19,1_072_20,1_171_02,1_171_03,1_171_04,1_171_05,1_171_07,1_171_08,1_171_10,1_171_11,1_171_12,1_171_14,1_171_15,1_171_16,1_171_17,1_171_18,1_171_19,1_171_20,1_171_21,1_171_22,1_171_23,1_171_24,1_171_25,1_171_26,1_172_01,1_172_02,1_172_03,1_172_04,1_172_05,1_172_06,1_172_07,1_172_08,1_172_09,1_172_10,1_172_11,1_172_12,1_172_13,1_172_14,1_172_15,1_172_16,1_172_17,1_172_18,1_172_19,1_172_20,1_172_21,1_172_22,1_172_23,1_172_24,1_172_25,1_172_26,2_098_01,2_098_02,2_098_03,2_098_04,2_098_05,2_098_06,2_098_07,2_098_08,2_098_09,2_098_10,2_098_11,2_098_12,2_098_13,2_098_14,2_098_15,2_098_16,2_098_17,2_098_18,2_098_19,2_098_20,2_098_21,2_098_22,2_098_23,2_098_25,2_098_26,ballerina_001,ballerina_002,guitar_001,musiclal-notes_001,violin_001"
	},
	{
	  name: "Nautical",
	  files: "1_140_04,1_140_11,1_140_12,1_140_17,1_140_25,1_154_21,1_154_22,1_179_01,1_179_04,1_179_07,1_179_09,1_179_10,1_179_11,1_179_14,1_179_16,1_179_26,1_180_01,1_180_02,1_180_04,1_180_06,1_180_08,1_180_12,1_180_13,1_180_14,1_180_16,1_180_17,1_180_18,1_180_20,1_180_21,1_180_22L,1_184_22,1_185_24,2_054_04,anchor_001,compass_01,shell_001,shell_003 [przekonwertowany],wave_001"
	},
	{
	  name: "Official",
	  files: "1_030_26,1_127_06,1_127_09,1_127_11,1_127_23,1_130_11,2_171_07,2_171_09,2_171_13,2_171_17,2_171_21,2_171_26,2_179_23a,2_179_26a,australianarmy,australiancoat,flag_aboriginal,flag_australian,flag_png,flag_torresstrait,nz_flag_01,rotary,southerncross_001,wacoat"
	},
	{
	  name: "Pets",
	  files: "1_043_02,1_043_08,1_043_09,1_043_10,1_043_11,1_043_22,1_043_23,1_045_21,1_131_01,1_131_02,1_131_03,1_131_04,1_131_05,1_131_06,1_131_07,1_131_08,1_131_10,1_131_11,1_131_12,1_131_14,1_131_15,1_131_16,1_131_17,1_131_18,1_131_19,1_131_20,1_131_21,1_131_22,1_131_24,1_131_25,1_132_01,1_132_02,1_132_03,1_132_06,1_132_07,1_132_08,1_132_10,1_132_20,1_132_22,1_132_24,1_132_25,1_139_04,1_167_05,2_056_01,2_056_02,2_056_03,2_056_04,2_056_05,2_056_06,2_056_07,2_056_08,2_056_09,2_056_10,2_056_11,2_056_12,2_056_13,2_056_14,2_056_15,2_056_16,2_056_17,2_056_18,2_056_19,2_056_20,2_056_21,2_056_22,2_056_23,2_056_24,2_056_25,2_056_26,2_087_02,2_138_25,Cat_001,1_043_13,1_043_14,1_043_16,1_043_17,1_043_18,1_044_09,1_044_10,1_045_05,1_045_20,1_045_22,1_136_01,1_136_02,1_136_03,1_136_04,1_136_05,1_136_06,1_136_07,1_136_08,1_136_09,1_136_10,1_136_11,1_136_12,1_136_13,1_136_14,1_136_15,1_136_16,1_136_17,1_136_18,1_136_21,1_136_22,1_136_23,1_136_24,1_136_25,1_136_26,1_137_01,1_137_02,1_137_03,1_137_04,1_137_05,1_137_06,1_137_07,1_137_09,1_137_10,1_137_11,1_137_12,1_137_13,1_137_14,1_137_15,1_137_17,1_137_18,1_137_19,1_137_20,1_137_21,1_137_23,1_137_24,1_137_25,1_139_08,2_031_04,2_031_10,2_031_13,2_031_16,2_031_20,2_031_22,2_031_23,2_031_25,2_057_01,2_057_02,2_057_03,2_057_04,2_057_05,2_057_06,2_057_07,2_057_08,2_057_09,2_057_10,2_057_11,2_057_12,2_057_13,2_057_14,2_057_15,2_057_16,2_057_17,2_057_18,2_057_19,2_057_20,2_057_21,2_057_22,2_057_23,2_057_24,2_057_25,2_057_26,2_080_01,2_086_18,1_043_15,1_132_09,1_139_19,1_139_22,1_174_22,1_177_18,2_080_07,1_132_16,Paws_003,Paw_001,Paw_002,1_145_01,1_173_05,1_178_24,2_080_11,Cobra_001,Frog_001,Lizard_001,Snake_001"
	},
	{
	  name: "Plants & Trees",
	  files: "1_154_24,1_157_01,1_157_03,1_157_04I,1_157_05,1_157_07,1_157_09,1_157_10,1_157_11,1_157_12,1_157_13,1_157_14,1_157_15,1_157_16,1_157_19,1_157_20,1_157_21,1_157_22,1_157_23,1_158_01,1_158_02,1_158_04,1_158_05,1_158_06,1_158_07,1_158_08,1_158_09,1_158_10,1_158_14,1_158_16,1_158_17,1_158_19,1_158_20,1_158_22,1_158_23,1_158_24,1_158_25,2_089_15,2_095_01,2_095_24,2_116_06,2_130_01,2_130_02,2_130_03,2_130_04,2_130_05,2_130_06,2_130_07,2_130_08,2_130_09,2_130_11,2_130_12,2_130_13,2_130_14,2_130_15,2_130_16,2_130_17,2_130_18,2_130_19,2_130_20,2_130_21,2_130_22,2_130_23,2_130_24,2_130_25,2_130_26,branch_001 [przekonwertowany],clover_001,leaf_001,leaf_002,palmtree_001,palmtree_002,palmtree_003,palmtree_004,palmtree_005,plant_001,tree_001"
	},
	{
	  name: "Religious",
	  files: "1_016_05,1_016_22,1_151_01,1_165_08,1_167_04,1_168_12,1_168_13,1_169_04,1_169_08,1_169_20,1_175_07,1_177_12,1_179_21,1_184_03,1_184_04,1_184_05,1_184_06,1_184_07,1_184_09,1_184_12,1_184_13,1_184_14,1_184_18,1_184_19,1_184_20,1_184_22,1_184_23,1_184_24,1_184_25,1_218_09,1_218_12,1_218_18,1_218_19,1_218_20,2_082_12,2_082_13,2_082_14,2_082_15,2_082_16,2_082_21,2_082_22,2_083_01,2_083_02,2_086_16,2_116_01,2_116_04,2_116_05,2_116_11,2_116_12,2_116_13,2_116_16,2_119_03,2_119_04,2_119_05,2_119_09,2_119_14,2_119_23,2_119_26,2_150_08,2_155_01,2_155_02,2_155_03,2_155_04,2_155_05,2_155_06,2_155_07,2_155_08,2_155_09,2_155_10,2_155_11,2_155_12,2_155_15,2_155_17,2_155_18,2_155_19,2_155_20,2_155_21,2_155_22,2_155_23,2_155_25,2_155_26,2_156_01,angel_001,bronzeangel2,cross91-final,cross_001,cross_002,cross_003,cross_004,cross_005,cross_008,cross_010,cross_011,cross_013,cross_021,cross_028,cross_029,cross_035,cross_036,cross_052,cross_054,dovefinal8-11-16[converted],moon-star_001"
	},
	{
	  name: "Shapes & Patterns",
	  files: "1_176_01,1_176_02,1_176_03,1_176_06,1_176_07,1_176_08,1_176_09,1_176_13,1_176_14,1_176_15,1_176_17,1_176_18,1_178_08,1_201_07,1_201_22,1_202_03,1_202_05,1_202_11,1_202_16,2_001_22,2_001_23,2_001_24,2_001_25,2_001_26,2_095_06,2_095_12,2_095_14,2_095_15,2_095_16,2_095_17,2_147_01,2_147_03,2_147_06,2_147_08,2_147_09,2_148_01,2_148_08,2_148_10,2_148_12,2_148_14,PATTERN_01"
	},
	{
	  name: "Skulls & Weapons",
	  files: "1_061_07,1_061_11,1_061_14,1_061_20,1_061_21,1_061_22,1_142_03,1_142_04,canon_001,gun_001,gun_002,rifle_001"
	},
	{
	  name: "Sport & Fitness",
	  files: "1_048_16,1_185_02,1_185_03,1_185_04,1_185_05,1_185_06,1_185_07,1_185_08,1_185_09,1_185_10,1_185_11,1_185_12,1_185_13,1_185_15,1_185_16,1_185_18,1_185_19,1_185_21,1_185_22,1_185_23,1_185_25,2_120_01,2_120_02,2_120_03,2_120_04,2_120_05,2_120_06,2_120_07,2_120_08,2_120_09,2_120_10,2_120_11,2_120_12,2_120_13,2_120_14,2_120_15,2_120_16,2_120_17,2_120_18,2_120_19,2_120_20,2_120_21,2_120_22,2_120_23,2_120_24,2_120_25,2_120_26,2_121_01,2_121_02,2_121_03,2_121_04,2_121_05,2_121_06,2_121_07,2_121_08,2_121_09,2_121_10,2_121_11,2_121_12,2_121_13,2_121_14,2_121_15,2_121_16,2_121_17,2_121_18,2_121_19,2_121_20,2_121_21,2_121_22,2_121_23,2_121_24,2_121_25,2_121_26,2_122_01,2_122_02,2_122_03,2_122_04,2_122_05,2_122_06,2_122_07,2_122_08,2_122_09,2_122_10,2_122_11,2_122_12,2_122_13,2_122_14,2_122_15,2_122_16,2_122_17,2_122_18,2_122_19,2_122_20,2_122_21,2_122_22,2_122_23,2_122_24,2_122_25,2_122_26,2_123_01,2_123_02,2_123_03,2_123_04,2_123_05,2_123_06,2_123_07,2_123_08,2_123_09,2_123_10,2_123_11,2_123_12,2_123_13,2_123_14,2_123_15,2_123_16,2_123_17,2_123_18,2_123_19,2_123_20,2_123_21,2_123_22,2_123_23,2_123_24,2_123_25,2_123_26,soccer-ball_001"
	},
	{
	  name: "Symbols Zodiac",
	  files: "1_175_05,1_175_06,1_175_11,1_175_15,1_175_16,1_175_20,1_175_22,1_175_25,zodiac_001,zodiac_002,zodiac_003,zodiac_004,zodiac_005,zodiac_006,zodiac_007,zodiac_008,zodiac_009,zodiac_010,zodiac_011,zodiac_012,zodiac_013,zodiac_014,zodiac_015,zodiac_016,zodiac_017,zodiac_018,zodiac_019,zodiac_020,zodiac_021,zodiac_022,zodiac_023,zodiac_024"
	},
	{
	  name: "Text",
	  files: "2_172_01,2_172_02,2_172_03,2_172_04,2_172_05,2_172_06,2_172_07,2_172_08,2_172_09,2_172_10,2_172_11,2_172_12,2_172_13,2_172_14,2_172_15,2_172_16,2_172_17,2_172_18,2_172_19,2_172_20,2_172_21,2_172_22,2_172_23,2_172_24,2_172_25,2_172_26,2_173_01,2_173_02,2_173_03,2_173_04,2_173_05,2_173_06,2_173_07,2_173_08,2_173_09,2_173_10,2_173_11,2_173_12,2_173_13,2_173_14,2_173_15,2_173_16,2_173_17,2_173_18,2_173_19,2_173_20,2_173_21,2_173_22,2_173_23,2_173_24,2_173_25,2_173_26,2_174_01,2_174_02,2_174_03,2_174_04,2_174_05,2_174_06,2_174_07,2_174_08,2_174_09,2_174_10,2_174_11,2_174_12,2_174_13,2_174_14,2_174_15,2_174_16,2_174_17,2_174_18,2_174_19,2_174_20,2_174_21,2_174_22,2_174_23,2_174_24,2_174_25,2_174_26,1_013_09,1_013_10,1_013_11,1_013_12,1_013_13,1_013_14,1_013_15,1_013_16,1_013_17,1_074_01,1_074_02,1_074_03,1_074_04,1_074_05,1_074_06,1_074_07,1_074_08,1_074_09,1_074_10,1_074_11,1_074_12,1_074_13,1_074_14,1_074_15,1_074_16,1_074_17,1_074_18,1_074_19,1_074_20,1_074_21,1_074_22,1_074_23,1_074_24,1_074_25,1_074_26,1_075_01,1_075_02,1_075_03,1_075_04,1_075_05,1_075_06,1_075_07,1_075_08,1_075_09,1_075_10,1_075_11,1_075_12,1_075_13,1_075_14,1_075_15,1_075_16,1_075_17,1_075_18,1_075_19,1_075_20,1_075_21,1_075_22,1_075_23,1_075_24,1_075_25,1_075_26,1_076_01,1_076_02,1_076_03,1_076_04,1_076_05,1_076_06,1_076_07,1_076_08,1_076_09,1_076_10,1_076_11,1_076_12,1_076_13,1_076_14,1_076_15,1_076_16,1_076_17,1_076_18,1_076_19,1_076_20,1_076_21,1_076_22,1_076_23,1_076_24,1_076_25,1_076_26,1_077_01,1_077_02,1_077_03,1_077_04,1_077_05,1_077_06,1_077_07,1_077_08,1_077_09,1_077_10,1_077_11,1_077_12,1_077_13,1_077_14,1_077_15,1_077_16,1_077_17,1_077_18,1_077_19,1_077_20,1_077_21,1_077_22,1_077_23,1_077_24,1_077_25,1_077_26,1_078_01,1_078_02,1_078_03,1_078_04,1_078_05,1_078_06,1_078_07,1_078_08,1_078_09,1_078_10,1_078_11,1_078_12,1_078_13,1_078_14,1_078_15,1_078_16,1_078_17,1_078_18,1_078_19,1_078_20,1_078_21,1_078_22,1_078_23,1_078_24,1_078_25,1_078_26,1_079_01,1_079_02,1_079_03,1_079_04,1_079_05,1_079_06,1_079_07,1_079_08,1_079_09,1_079_10,1_079_11,1_079_12,1_079_13,1_079_14,1_079_15,1_079_16,1_079_17,1_079_18,1_079_19,1_079_20,1_079_21,1_079_22,1_079_23,1_079_24,1_079_25,1_079_26,1_080_01,1_080_02,1_080_03,1_080_04,1_080_05,1_080_06,1_080_07,1_080_08,1_080_09,1_080_10,1_080_11,1_080_12,1_080_13,1_080_14,1_080_15,1_080_16,1_080_17,1_080_18,1_080_19,1_080_20,1_080_21,1_080_22,1_080_23,1_080_24,1_080_25,1_080_26,1_081_01,1_081_02,1_081_03,1_081_04,1_081_05,1_081_06,1_081_07,1_081_08,1_081_09,1_081_10,1_081_11,1_081_12,1_081_13,1_081_14,1_081_15,1_081_16,1_081_17,1_081_18,1_081_19,1_081_20,1_081_21,1_081_22,1_081_23,1_081_24,1_081_25,1_081_26,1_082_01,1_082_02,1_082_03,1_082_04,1_082_05,1_082_06,1_082_07,1_082_08,1_082_09,1_082_10,1_082_11,1_082_12,1_082_13,1_082_14,1_082_15,1_082_16,1_082_17,1_082_18,1_082_19,1_082_20,1_082_21,1_082_22,1_082_23,1_082_24,1_082_25,1_082_26,1_083_01,1_083_02,1_083_03,1_083_04,1_083_05,1_083_06,1_083_07,1_083_08,1_083_09,1_083_10,1_083_11,1_083_12,1_083_13,1_083_14,1_083_15,1_083_16,1_083_17,1_083_18,1_083_19,1_083_20,1_083_21,1_083_22,1_083_23,1_083_24,1_083_25,1_083_26,1_084_01,1_084_02,1_084_03,1_084_04,1_084_05,1_084_06,1_084_07,1_084_08,1_084_09,1_084_10,1_084_11,1_084_12,1_084_13,1_084_14,1_084_15,1_084_16,1_084_17,1_084_18,1_084_19,1_084_20,1_084_21,1_084_22,1_084_23,1_084_24,1_084_25,1_084_26,1_085_01,1_085_02,1_085_03,1_085_04,1_085_05,1_085_06,1_085_07,1_085_08,1_085_09,1_085_10,1_085_11,1_085_12,1_085_13,1_085_14,1_085_15,1_085_16,1_085_17,1_085_18,1_085_19,1_085_20,1_085_21,1_085_22,1_085_23,1_085_24,1_085_25,1_085_26,1_086_01,1_086_02,1_086_03,1_086_04,1_086_05,1_086_06,1_086_07,1_086_08,1_086_09,1_086_10,1_086_11,1_086_12,1_086_13,1_086_14,1_086_15,1_086_16,1_086_17,1_086_18,1_086_19,1_086_20,1_086_21,1_086_22,1_086_23,1_086_24,1_086_25,1_086_26,1_087_01,1_087_02,1_087_03,1_087_04,1_087_05,1_087_06,1_087_07,1_087_08,1_087_09,1_087_10,1_087_11,1_087_12,1_087_13,1_087_14,1_087_15,1_087_16,1_087_17,1_087_18,1_087_19,1_087_20,1_087_21,1_087_22,1_087_23,1_087_24,1_087_25,1_087_26,1_088_01,1_088_02,1_088_03,1_088_04,1_088_05,1_088_06,1_088_07,1_088_08,1_088_09,1_088_10,1_088_11,1_088_12,1_088_13,1_088_14,1_088_15,1_088_16,1_088_17,1_088_18,1_088_19,1_088_20,1_088_21,1_088_22,1_088_23,1_088_24,1_088_25,1_088_26,1_089_01,1_089_02,1_089_03,1_089_04,1_089_05,1_089_06,1_089_07,1_089_08,1_089_09,1_089_10,1_089_11,1_089_12,1_089_13,1_089_14,1_089_15,1_089_16,1_089_17,1_089_18,1_089_19,1_089_20,1_089_21,1_089_22,1_089_23,1_089_24,1_089_25,1_089_26,1_090_01,1_090_02,1_090_03,1_090_04,1_090_05,1_090_06,1_090_07,1_090_08,1_090_09,1_090_10,1_090_11,1_090_12,1_090_13,1_090_14,1_090_15,1_090_16,1_090_17,1_090_18,1_090_19,1_090_20,1_090_21,1_090_22,1_090_23,1_090_24,1_090_25,1_090_26,1_091_01,1_091_02,1_091_03,1_091_04,1_091_05,1_091_06,1_091_07,1_091_08,1_091_09,1_091_10,1_091_11,1_091_12,1_091_13,1_091_14,1_091_15,1_091_16,1_091_17,1_091_18,1_091_19,1_091_20,1_091_21,1_091_22,1_091_23,1_091_24,1_091_25,1_091_26,1_092_01,1_092_02,1_092_03,1_092_04,1_092_05,1_092_06,1_092_07,1_092_08,1_092_09,1_092_10,1_092_11,1_092_12,1_092_13,1_092_14,1_092_15,1_092_16,1_092_17,1_092_18,1_092_19,1_092_20,1_092_21,1_092_25,1_092_26,1_093_01,1_093_02,1_093_03,1_093_04,1_093_05,1_093_06,1_093_07,1_093_08,1_093_09,1_093_10,1_093_11,1_093_12,1_093_13,1_093_14,1_093_15,1_093_16,1_093_17,1_093_18,1_093_19,1_093_20,1_093_21,1_093_22,1_093_23,1_093_24,1_093_25,1_093_26,1_094_01,1_094_02,1_094_03,1_094_04,1_094_05,1_094_06,1_094_07,1_094_08,1_094_09,1_094_10,1_094_11,1_094_12,1_094_13,1_094_14,1_094_15,1_094_16,1_094_17,1_094_18,1_094_19,1_094_20,1_094_21,1_094_22,1_094_23,1_094_24,1_094_25,1_094_26,1_095_01,1_095_02,1_095_03,1_095_04,1_095_05,1_095_06,1_095_07,1_095_08,1_095_09,1_095_10,1_095_11,1_095_12,1_095_13,1_095_14,1_095_15,1_095_16,1_095_17,1_095_18,1_095_19,1_095_20,1_095_21,1_095_22,1_095_23,1_095_24,1_095_25,1_095_26,1_096_01,1_096_02,1_096_03,1_096_04,1_096_05,1_096_06,1_096_07,1_096_08,1_096_09,1_096_10,1_096_11,1_096_12,1_096_13,1_096_14,1_096_15,1_096_16,1_096_17,1_096_18,1_096_19,1_096_20,1_096_21,1_096_22,1_096_23,1_096_24,1_096_25,1_096_26,1_097_01,1_097_02,1_097_03,1_097_04,1_097_05,1_097_06,1_097_07,1_097_08,1_097_09,1_097_10,1_097_11,1_097_12,1_097_13,1_097_14,1_097_15,1_097_16,1_097_17,1_097_18,1_097_19,1_097_20,1_097_21,1_097_22,1_097_23,1_097_24,1_097_25,1_097_26,1_098_01,1_098_02,1_098_03,1_098_04,1_098_05,1_098_06,1_098_07,1_098_08,1_098_09,1_098_10,1_098_11,1_098_12,1_098_13,1_098_14,1_098_15,1_098_16,1_098_17,1_098_18,1_098_19,1_098_20,1_098_21,1_098_22,1_098_23,1_098_24,1_098_25,1_098_26,1_099_01,1_099_02,1_099_03,1_099_04,1_099_05,1_099_06,1_099_07,1_099_08,1_099_09,1_099_10,1_099_11,1_099_12,1_099_13,1_099_14,1_099_15,1_099_16,1_099_17,1_099_18,1_099_19,1_099_20,1_099_21,1_099_22,1_099_23,1_099_24,1_099_25,1_099_26,1_100_01,1_100_02,1_100_03,1_100_04,1_100_05,1_100_06,1_100_07,1_100_08,1_100_09,1_100_10,1_100_11,1_100_12,1_100_13,1_100_14,1_100_15,1_100_16,1_100_17,1_100_18,1_100_19,1_100_20,1_100_21,1_100_22,1_100_23,1_100_24,1_100_25,1_100_26,1_101_01,1_101_02,1_101_03,1_101_04,1_101_05,1_101_06,1_101_07,1_101_08,1_101_09,1_101_10,1_101_11,1_101_12,1_101_13,1_101_14,1_101_15,1_101_16,1_101_17,1_101_18,1_101_19,1_101_20,1_101_21,1_101_22,1_101_23,1_101_24,1_101_25,1_101_26,1_102_01,1_102_02,1_102_03,1_102_04,1_102_05,1_102_06,1_102_07,1_102_08,1_102_09,1_102_10,1_102_11,1_102_12,1_102_13,1_102_14,1_102_15,1_102_16,1_102_17,1_102_18,1_102_19,1_102_20,1_102_21,1_102_22,1_102_23,1_102_24,1_102_25,1_102_26,1_103_01,1_103_02,1_103_03,1_103_04,1_103_05,1_103_06,1_103_07,1_103_08,1_103_09,1_103_10,1_103_11,1_103_12,1_103_13,1_103_14,1_103_15,1_103_16,1_103_17,1_103_18,1_103_19,1_103_20,1_103_21,1_103_22,1_103_23,1_103_24,1_103_25,1_103_26,1_104_01,1_104_02,1_104_03,1_104_04,1_104_05,1_104_06,1_104_07,1_104_08,1_104_09,1_104_10,1_104_11,1_104_12,1_104_13,1_104_14,1_104_15,1_104_16,1_104_17,1_104_18,1_104_19,1_104_20,1_104_21,1_104_22,1_104_23,2_045_01,2_045_02,2_045_03,2_045_04,2_045_05,2_045_06,2_045_07,2_045_08,2_045_09,2_045_10,2_045_11,2_045_12,2_045_13,2_045_14,2_045_15,2_045_16,2_045_17,2_045_18,2_045_19,2_045_20,2_045_21,2_045_22,2_045_23,2_045_24,2_045_25,2_045_26,2_046_01,2_046_02,2_046_03,2_046_04,2_046_05,2_046_06,2_046_07,2_046_08,2_046_09,2_046_10,2_046_11,2_046_12,2_046_13,2_046_14,2_046_15,2_046_16,2_046_17,2_046_18,2_046_19,2_046_20,2_046_21,2_046_22,2_046_23,2_046_24,2_046_25,2_046_26,2_047_01,2_047_02,2_047_03,2_047_04,2_047_05,2_047_06,2_047_07,2_047_08,2_047_09,2_047_10,2_047_11,2_047_12,2_047_13,2_047_14,2_047_15,2_047_16,2_047_17,2_047_18,2_047_19,2_047_20,2_047_21,2_047_22,2_047_23,2_047_24,2_047_25,2_047_26,2_048_01,2_048_02,2_048_03,2_048_04,2_048_05,2_048_06,2_048_07,2_048_08,2_048_09,2_048_10,2_048_11,2_048_12,2_048_13,2_048_14,2_048_15,2_048_16,2_048_17,2_048_18,2_048_19,2_048_20,2_048_21,2_048_22,2_048_23,2_048_24,2_048_25,2_048_26,2_049_01,2_049_02,2_049_03,2_049_04,2_049_05,2_049_06,2_049_07,2_049_08,2_049_09,2_049_10,2_049_11,2_049_12,2_049_13,2_049_14,2_049_15,2_049_16,2_049_17,2_049_18,2_049_19,2_049_20,2_049_21,2_049_22,2_049_23,2_049_24,2_049_25,2_049_26,2_050_01,2_050_02,2_050_03,2_050_04,2_050_05,2_050_06,2_050_07,2_050_08,2_050_09,2_050_10,2_050_11,2_050_12,2_050_13,2_050_14,2_050_15,2_050_16,2_050_17,2_050_18,2_050_19,2_050_20,2_050_21,2_050_22,2_050_23,2_050_24,2_050_25,2_050_26,2_051_01,2_051_02,2_051_03,2_051_04,2_051_05,2_051_06,2_051_07,2_051_08,2_051_09,2_051_10,2_051_11,2_051_12,2_051_13,2_051_14,2_051_15,2_051_16,2_051_17,2_051_18,2_051_19,2_051_20,2_051_21,2_051_22,2_051_23,2_051_24,2_051_25,2_051_26,2_052_01,2_052_02,2_052_03,2_052_04,2_052_05,2_052_06,2_052_07,2_052_08,2_052_09,2_052_10,2_052_11,2_052_12,2_052_13,2_052_14,2_052_15,2_052_16,2_052_17,2_052_18,2_052_19,2_052_20,2_052_21,2_052_22,2_052_23,2_052_24,2_052_25,2_052_26,2_053_01,2_053_02,2_053_03,2_053_04,2_053_05,2_053_06,2_053_07,2_053_08,2_053_09,2_053_10,2_053_11,2_053_12,2_053_13,2_053_14,2_053_15,2_053_16,2_053_17,2_053_18,2_053_19,2_053_20,2_053_21,2_053_22,2_053_23,2_053_24,2_053_25,2_053_26,"
	},
	{
	  name: "Tools Office",
	  files: "1_070_01,1_070_02,1_070_03,1_070_04,1_070_05,1_070_09,1_070_11,1_070_14,1_070_15,1_070_20,1_070_21,1_070_22,1_070_23,1_070_26,1_071_04,1_148_01,1_148_02,1_148_03,1_148_04,1_148_05,1_148_06,1_148_07,1_148_08,1_148_09,1_148_10,1_148_11,1_148_12,1_148_13,1_148_14,1_148_15,1_148_16,1_148_17,1_148_18,1_148_19,1_148_20,1_148_21,1_148_22,1_148_23,1_148_24,1_148_25,1_149_01,1_149_02,1_149_03,1_149_04,1_149_05,1_149_06,1_149_07,1_149_08,1_149_09,1_149_10,1_149_11,1_149_12,1_149_13,1_149_14,1_149_15,1_149_16,1_149_17,1_149_18,1_149_19,1_149_20,1_149_21,1_149_22,1_149_23,1_149_24,1_149_25,1_182_05,1_182_19,1_182_20,1_182_21,1_182_22,2_062_05,2_062_08,2_062_10,2_062_14,2_062_15,2_062_17,2_062_18,2_062_19,2_062_20,2_062_22,2_062_23,2_062_26,2_063_01,2_063_03,2_063_07,2_063_08,2_063_10,2_063_11,2_063_12,2_063_13,2_063_14,2_063_16,2_063_17,2_063_18,2_063_19,2_063_20,2_063_21,2_063_22,2_063_23,2_063_24,2_063_25,2_063_26,2_064_01,2_066_06,2_066_08,2_066_14,2_067_09,2_067_18,2_067_19,2_067_20,2_067_21,2_067_22,2_067_23,2_067_24,2_067_25,2_067_26,2_070_26,2_071_01,2_071_02,2_071_03,2_071_04,2_071_05,2_071_06,2_071_07,2_071_08,2_071_09,2_071_10,2_071_11,2_071_12,2_071_13,2_071_14,2_071_15,2_071_16,2_071_17,2_071_18,2_071_19,2_071_20,2_071_21,2_071_22,2_071_23,2_071_24,2_071_25,2_071_26,2_072_01,2_072_02,2_072_03,2_072_04,2_072_05,2_072_06,2_072_07,2_072_08,2_072_09,2_072_10,2_072_11,2_072_12,2_072_13,2_072_14,2_072_15,2_072_16,2_072_17,2_072_18,2_072_19,2_072_20,2_072_21,2_072_22,2_072_23,2_072_24,2_072_25,2_101_08,2_102_02,2_102_03,2_102_04,2_102_05,2_102_06,2_102_09,2_102_11,2_102_12,2_102_16,2_102_17,2_102_22,2_102_25,2_124_01,2_124_03,2_124_04,2_124_05,2_124_06,2_124_07,2_124_08,2_124_09,2_124_10,2_124_11,2_124_12,2_124_13,2_124_14,2_124_15,2_124_16,2_124_17,2_124_18,2_124_19,2_124_20,2_124_21,2_124_22,2_124_23,2_124_24,2_124_25,2_124_26,2_126_21,2_127_01,2_127_02,2_127_03,2_127_04,2_127_05,2_127_06,2_127_07,2_127_08,2_127_09,2_127_10,2_127_11,2_127_12,2_127_13,2_127_14,2_127_15,2_127_16,2_127_17,2_127_18,2_127_19,2_127_20,2_127_21,2_127_22,2_127_23,2_127_24,2_127_25,2_127_26,2_128_01,2_128_02,2_128_03,2_128_04,2_128_05,2_128_06,2_128_07,2_128_08,2_128_09,2_128_10,2_128_11,2_128_12,2_128_13,2_128_14,2_128_15,2_128_16,2_128_17,2_128_18,2_128_19,2_128_20,2_128_21,2_128_22,2_128_23,2_128_24,2_128_25,2_128_26"
	},
	{
	  name: "Tribal",
	  files: "1_005_23,1_005_25,1_005_26,1_202_13,1_205_11,1_205_17,1_205_21,1_205_22,1_206_01,1_206_02,1_206_03,1_206_04,1_206_05,1_206_06,1_206_07,1_206_09,1_206_10,1_206_11,1_206_15,1_206_16,1_206_25,1_240_26,2_001_01,2_001_09,2_156_02,2_156_03,2_156_06,2_156_07,2_156_08,2_156_11,2_156_12,2_156_13,2_156_14,2_156_15,2_156_16,2_156_17,2_156_18,2_156_19,2_156_20,2_156_21,2_156_22,2_156_23,2_156_24,2_156_25,2_156_26,2_157_01,2_157_02,2_157_03,2_157_04,2_157_05,2_157_06,2_157_07,2_157_08,2_157_10,2_157_11,2_157_12,2_157_13,2_157_14,2_157_16,2_157_18,2_157_19,2_157_20,2_157_21,2_157_22,2_157_24,2_157_25,2_157_26,2_158_10,2_158_13,2_159_01,2_159_02,2_159_07,2_159_10,2_195_03,2_195_04,2_195_06,2_195_07,2_195_08,Border-Tropical_001,Islander_001,Surfboard_01,Surfboard_02,Surfboard_04,Surfboard_05"
	},
	{
	  name: "USA",
	  files: "1_030_26,1_127_11,1_127_23,1_169_10,2_171_13,2_171_21,2_171_26,2_179_22a,2_179_23a,2_179_26a,1_125_08,1_125_14,1_125_16,1_125_18,1_127_02,1_127_04,1_127_08,1_127_10,1_127_12,1_127_13,1_127_15,1_127_16,1_127_17,1_127_21,1_127_24,1_127_25,1_130_01,1_130_02,1_130_06,1_130_08,1_130_12,1_130_14,1_130_15,1_130_16,1_130_17,1_130_18,1_130_20,1_130_26,1_228_01,1_228_02,1_228_03,1_228_04,1_228_05,1_228_06,1_228_07,1_228_08,1_228_09,1_228_10,1_228_13,1_228_15,1_228_17,1_228_18,1_228_19,1_229_01,1_229_02,1_229_03,1_229_04,1_229_05,1_229_06,1_229_07,1_229_08,1_229_09,1_229_10,1_229_11,1_229_12,1_229_13,1_229_15,1_229_16,1_229_17,1_229_18,1_229_19,1_229_20,1_229_21,1_229_22,1_229_23,1_229_24,1_229_25,1_229_26,1_236_01,1_236_02,1_236_04,1_236_05,1_236_06,1_236_07,1_236_08,1_238_05,1_238_07,1_238_08,1_238_10,1_238_11"
	},
	{
	  name: "Vehicles",
	  files: "1_150_02,1_150_08,1_150_14,1_150_15,1_150_16,1_150_17,1_150_18,1_150_19,1_150_20,1_150_21,1_150_22,1_150_23,1_150_24,1_150_25,1_188_08,1_188_09,1_188_15,1_188_16,1_188_23,1_188_24,1_192_01,1_192_02,1_192_03,1_192_04,1_192_05,1_192_06,1_192_07,1_192_08,1_192_09,1_192_10,1_192_11,1_192_12,1_192_13,1_192_14,1_192_15,1_192_16,1_192_17,1_192_18,1_192_19,1_192_20,1_192_21,1_192_22,1_192_23,1_192_24,1_192_25,1_192_26,2_102_01,2_117_22,2_117_23,2_124_02,Plane_001,Scooter_001,1_015_07,1_048_01,1_048_02,1_048_03,1_048_04,1_048_05,1_048_07,1_048_08,1_048_10,1_048_11,1_048_12,1_048_13,1_048_14,1_048_15,1_048_18,1_048_19,1_048_22,1_048_24,1_188_01,1_188_02,1_188_03,1_188_04,1_188_05,1_188_06,1_188_07,1_188_10,1_188_11,1_188_12,1_188_13,1_188_14,1_188_17,1_188_18,1_188_19,1_188_20,1_188_21,1_188_22,1_188_25,1_189_04,1_189_05,1_189_06,1_189_07,1_189_08,1_189_09,1_189_10,1_189_11,1_189_12,1_189_13,1_189_14,1_189_15,1_189_16,1_189_17,1_189_18,1_189_19,1_189_20,1_189_21,1_189_22,1_189_23,1_189_24,1_189_25,1_190_01,1_190_02,1_190_03,1_190_04,1_190_05,1_190_07,1_190_08,1_190_09,1_190_10,1_190_11,1_190_12,1_190_13,1_190_15,1_190_16,1_190_17,1_190_18,1_190_20,1_190_21,1_190_22,1_190_23,1_190_24,1_190_25,1_190_26,1_191_01,1_191_02,1_191_03,1_191_04,1_191_05,1_191_06,1_191_07,1_191_09,1_191_11,1_191_12,1_191_13,1_191_14,1_191_16,1_191_17,1_191_18,1_191_19,1_191_20,1_191_21,1_191_22,1_191_24,1_235_11,2_090_01,2_090_03,2_090_04,2_090_05,2_090_06,2_090_07,2_090_08,2_090_09,2_090_10,2_090_11,2_090_12,2_090_13,2_090_14,2_090_15,2_090_16,2_090_17,2_090_18,2_090_19,2_090_20,2_090_21,2_090_22,2_090_23,2_090_24,2_090_25,2_090_26,Car_001,1_167_07,1_180_24,1_186_01,1_186_02,1_186_03,1_186_04,1_186_05,1_186_07,1_186_08,1_186_09,1_186_10,1_186_15,1_186_17,1_186_18,1_186_19,1_186_22,1_186_24,1_186_25,1_187_01,1_187_02,1_187_03,1_187_05,1_187_06,1_187_07,1_187_08,1_187_09,1_187_10,1_187_11,1_187_13,1_187_14,1_187_15,1_187_16,1_187_17,1_187_18,1_187_19,1_187_20,1_187_21,1_187_22,1_187_23,1_187_24,1_187_25,1_187_26,2_097_03,2_097_05,2_097_06,2_097_07,2_097_08,2_097_09,2_097_10,2_097_11,2_097_12,2_097_14,2_097_15,2_097_17,2_097_18,2_097_20,2_097_21,2_097_23,2_097_24,2_097_25,2_097_26"
	}
]   