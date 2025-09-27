import {Design} from './Design.js';
import {Lang, Translate, $} from './Const.js';

const currentMetric = 0;
const cm = 10;
const mm = 100;
const inch = 25.4;
const foot = 12 * inch;

export class Quote extends Design {

	constructor(data = {}) {
        super(data);
		
        this.items = [];
        this.itemID = 0;
        this.motifsFree = 0;
        this.photosFree = 0;
    }

    getItemById(id) {
        let item;
        
        //console.log("@getId: " + id);

        for (let nr = 0; nr < this.items.length; nr++) {
            if (this.items[nr].itemID == id) {
                item = this.items[nr];
            }
        }

        //console.log(item);

        return item;
    }

    getItemID() {

        let highestID = 0;

        for (let nr = 0; nr < this.items.length; nr++) {
            //console.log(this.items[nr].itemID);
            if (this.items[nr].itemID >= highestID) {
                highestID = this.items[nr].itemID;
            }
        }

        this.itemID = highestID += 1;

        //console.log(this.itemID);

        return this.itemID;
    }

    addItem(item) {
        this.items.push(item);
    }

    updateItem(item) {
        this.removeItem(item);
        this.addItem(item);
    }

    getItems() {
        return this.items;
    }

    removeItem(item) {
        for (let nr = 0; nr < this.items.length; nr++) {
            if (this.items[nr].itemID == item.itemID) {
                this.items.splice(nr, 1);
            }
        }
    }

    getArea(product, w, h, l, cubic) {
        
        let mod = 1;
        let price;

        switch (product) {

            default:
        
                if (cubic) {

                    if (dyo.mode == "3d") {

                        let p;

                        switch(product) {
                            default: case "Headstone":
                                p = dyo.engine3d.headstone3d;
                                break
                            case "Stand":
                                p = dyo.engine3d.stand3d;
                                break
                            case "Ledger":
                                p = dyo.engine3d.ledger3d;
                                break
                            case "Base":
                                p = dyo.engine3d.stand3d;
                                break
                        }

                        if (p) {
                            price = p.getInfo(Engine3D.ModelInfoType.MODEL_STONE_VOLUME_CUBIC_METERS);
                        } else {
                            price = 0;
                        }

                    }

                } else {
                    price = 2 * ((l * w) + (l * h) + (w * h));
                }

                break;

            case "Kerbset": 

                if (dyo.engine3d.kerb3d) {
                    price = dyo.engine3d.kerb3d.getInfo(Engine3D.ModelInfoType.MODEL_STONE_VOLUME_CUBIC_METERS);
                }

                break;
                
        }

        let currency_ratio = this.getCurrencyRatio(dyo.currency);

        return Number(price * currency_ratio);
        
    }

    hasBaseAddition() {

        let hasAddition = false;

        for (let nr = 0; nr < this.items.length; nr++) {

            if (dyo.edit) {
                let headstoneTest = dyo.monument.headstone.shape.hitTest(this.items[nr].container.x, this.items[nr].container.y);

                if (headstoneTest) {
                    this.items[nr].part = "Headstone";
                } else {
                    this.items[nr].part = "Base";
                }
            }
            
            if (this.items[nr].part == "Base") {
                hasAddition = true;
            }
        }

        return hasAddition;

    }

    checkPrice(pdf) {

        if (this.items.length > 0) {
            dyo.design_exists = true;

            if (dyo.engine.designSaved) {
                $("#dyo_new_design").style.display = "none";

                if (dyo.design.loadQueueState == false) {
                    if (dyo.engine.loadedItemsCount == this.items.length) {
                        $("#dyo_new_design").style.display = "none";
                    } else {
                        $("#dyo_new_design").style.display = "flex";
                    }
                }

            } else {
                if ($("#dyo_new_design")) {
                    $("#dyo_new_design").style.display = "flex";
                }
            }

        } else {
            dyo.design_exists = false;
            if ($("#dyo_new_design")) {
                if ($("#dyo_new_design").style.display != "flex") {
                    $("#dyo_new_design").style.display = "none";
                }
            }
        }

        if (dyo.monument.backgroundOption == "photo") {
            dyo.design_exists = true;
        }

        if (dyo.monument.headstone == undefined) {
            return;
        }

        let headstone = dyo.monument.headstone;
        let base = dyo.monument.base;
		
        let material_id = headstone.texture;
        let total = 0;
        let price;
        let area;
        let price_model_id;
        let quantity = 0;

        let data = `
        <div class="mdc-data-table">

        <table class="mdc-data-table__content ">
            <thead>
                <tr>
                    <th width="55%" class="mdc-data-table--sortable(aria-label='Product')">${Translate(Lang.PRODUCT)}</th>
                    <th width="15%">${Translate(Lang.QUANTITY)}</th>
                    <th width="15%">${Translate(Lang.UNIT_PRICE)}</th>
                    <th width="15%">${Translate(Lang.ITEM_TOTAL)}</th>
                </tr>
            </thead>
        <tbody>`

        let materialName = '';
        let material = '';
        let productImage = '';

        dyo.monument._data.forEach(part => {

            if ((part.type == 'Headstone' && dyo.monument.has_headstone) ||
                (part.type == 'Base' && dyo.monument.has_base && dyo.config.hasBase() && dyo.monument.installationMethod != 3) || 
                dyo.monument.full_monument) {

                    let product = Translate(Lang.PRODUCT) + " ID: " + dyo.monument.id + " - " + Translate(Lang[dyo.monument._config.translate]);
                    
                    if (dyo.monument.has_base) {
                        if (part.type == 'Base') {
                            let addition = this.getAdditionByType("base");
                            if (addition) {
                                product = Translate(Lang.PRODUCT) + " ID: " + addition.id + " - " + addition.name;
                            }
                        } 
                    }

                    if (dyo.monument.full_monument) {
                        if (part.type == 'Base') {
                            let addition = this.getAdditionByType("base");
                            product = Translate(Lang.PRODUCT) + " ID: " + addition.id + " - " + addition.name;
                        } 
                        if (part.type == 'Ledger') {
                            let addition = this.getAdditionByType("ledger");
                            product = Translate(Lang.PRODUCT) + " ID: " + addition.id + " - " + addition.name;
                        } 
                        if (part.type == 'Kerbset') {
                            let addition = this.getAdditionByType("kerbset");
                            product = Translate(Lang.PRODUCT) + " ID: " + addition.id + " - " + addition.name;
                        } 
                    }

                    switch (dyo.monument._config.formula) {
                        case "Laser": case "Engraved": 
                            material = Translate(Lang.GRANITE);

                            if (dyo.mode == "2d") {
                                part.granites.forEach(granite => {
                                    if (granite.img.replace('/s/','/l/') == part.texture) {
                                        materialName = granite.name;
                                    }
                                });
                            }

                            if (dyo.mode == "3d") {

                                let part3d;

                                switch (part.type) {
                                    case "Headstone":
                                        part3d = dyo.engine3d.headstone3d;
                                        break;
                                    case "Base":
                                        part3d = dyo.engine3d.stand3d;
                                        break;
                                    case "Ledger":
                                        part3d = dyo.engine3d.ledger3d;
                                        break;
                                    case "Kerbset":
                                        part3d = dyo.engine3d.kerb3d;
                                        break;
        
                                }

                                part.granites.forEach(granite => {
                                    if (part3d) {
                                        if (part3d.extra) {
                                            if (granite.img.replace('/s/','/l/') == part3d.extra.color) {
                                                materialName = granite.name;
                                            }
                                        }
                                    }
                                });
                            }

                            break;
                        case "Bronze":
                            material = 'Bronze colour';

                            part.bronzes.forEach(bronze => {
                                if (bronze.img.replace('/s/','/l/') == part.texture) {
                                    materialName = bronze.name;
                                }
                            });
                            break;
                        case "Steel":
                            material = Translate(Lang.GRANITE);

                            part.metals.forEach(metal => {
                                if (metal.img.replace('/s/','/l/') == part.texture) {
                                    materialName = metal.name;
                                }
                            });
                            break;
                        case "Enamel":

                            productImage = Translate(Lang.CERAMIC_IMAGE);

                            if (dyo.monument.materialImage == 2) {
                                productImage = Translate(Lang.VITREOUS_ENAMEL);
                            }

                            if (dyo.monument.materialImage == 3) {
                                productImage = Translate(Lang.PREMIUM_PLANA);
                            }

                            material += Translate(Lang.BACKGROUND_COLOUR);

                            switch (dyo.monument.backgroundOption) {
                                case "color":
                                    if (part.texture.indexOf("backgrounds/colors") > -1) {
                                        part.colors.forEach(color => {
                                            if (color.img.replace('/s/','/l/') == part.texture) {
                                                materialName = color.hex;
                                            }
                                        });
                                    }
                                    break;
                                case "photo":
                                    if (part.backgrounds) {
                                        part.backgrounds.forEach(background => {
                                            if (background.img.replace('/s/','/l/') == part.texture) {
                                                materialName = background.name;
                                            }
                                        });
                                    }
                                    break;
                            }

                            break;
                    }

                    if (part.type == 'Headstone') {

                        if (dyo.monument.headstone.background) {
                            materialName += "<br/>" + Translate(Lang.IMAGE) + ": " + dyo.monument.headstone.background;
                        }

                    }

                    let productData = ``

                    if (dyo.monument.id == 5 ||
                        dyo.monument.id == 30 ||
                        dyo.monument.id == 32 ||
                        dyo.monument.id == 34 ||
                        dyo.monument.id == 999) {
                    } else {
                        productData += `${Translate(Lang.SHAPE)}: ${part.name} <br/>`
                    }

                    if (materialName) {
                        productData += `${material}: ${materialName} <br/>`
                    }

                    if (dyo.monument.getProductType() == "images" || 
                        dyo.monument.getProductType() == "fullcolourplaque" || 
                        dyo.monument.getProductType() == "urns") {

                        let _material = Translate(Lang.MATERIALS);

                        if (dyo.monument.headstone.background) {
                            if (dyo.monument.headstone.background.length > 24) {
                                productData = `
                                ${Translate(Lang.SHAPE)}: ${part.name} <br/>`
                                if (dyo.monument.id == 7) {
                                    productData += `${_material}: ${productImage} <br/>`
                                }
                                productData += `${Translate(Lang.BACKGROUNDS)}: ${dyo.monument.headstone.background}<br/>`
                            } else {
                                productData = `
                                ${Translate(Lang.SHAPE)}: ${part.name} <br/>`
                                if (dyo.monument.id == 7) {
                                    productData += `${_material}: ${productImage} <br/>`
                                }
                                productData += `${Translate(Lang.BACKGROUNDS)}: ${dyo.monument.headstone.background}<br/>`
                            }
    
                        } else {

                            _material = _material.substring(0, _material.length - 1);

                            if (materialName != "") {
                                productData = `
                                ${Translate(Lang.SHAPE)}: ${part.name} <br/>`
                                if (dyo.monument.id == 7) {
                                    productData += `${_material}: ${productImage} <br/>`
                                }
                                productData += `${material}: ${materialName} <br/>`
                            } else {
                                productData = `
                                ${Translate(Lang.SHAPE)}: ${part.name} <br/>`
                                if (dyo.monument.id == 7) {
                                    productData += `${_material}: ${productImage} <br/>`
                                }
                            }

                        }

                    }

                    if (dyo.monument.id == 31) {
                        if (part.border) {
                            if (part.border != "undefined") {
                                productData += `
                                ${Translate(Lang.BORDER)}:  ${part.border} <br/>`
                            }
                        }
                    }

                    if (dyo.monument.id != 32 && dyo.monument.id != 31) {
                        if (part.border) {
                            if (part.border != "undefined") {
                                productData += `
                                ${Translate(Lang.BORDER)}:  ${part.border_name} <br/>`
                            }
                        }
                    }

                    if (dyo.mode == "3d") {

                        if (dyo.engine3d.currentModel) {

                            let part3d = {};
                            let model;

                            switch (part.type) {
                                case "Headstone":
                                    model = dyo.engine3d.headstone3d;
                                    break;
                                case "Base":
                                    model = dyo.engine3d.stand3d;
                                    break;
                                case "Ledger":
                                    model = dyo.engine3d.ledger3d;
                                    break;
                                case "Kerbset":
                                    model = dyo.engine3d.kerb3d;
                                    break;    
                            }

                            if (model) {
                                part3d = {
                                    width: model.getProperty("width"),
                                    height: model.getProperty("height"),
                                    length: model.getProperty("depth")
                                }
                            }

                            if (dyo.metric == "inches") {
                                productData += `${Translate(Lang.SIZE)}:  ${dyo.engine.metrics.toInch(Math.round(part3d.width), true)} x  ${dyo.engine.metrics.toInch(Math.round(part3d.height), true)} x  ${dyo.engine.metrics.toInch(Math.round(part3d.length), true)}`
                            } else {
                                productData += `${Translate(Lang.SIZE)}:  ${Math.round(part3d.width)} mm x  ${Math.round(part3d.height)} mm x  ${Math.round(part3d.length)} mm`
                            }

                        }
                        
                    } else {

                        if (dyo.target) {
                            switch (dyo.target.name) {
                                default:

                                    if (dyo.metric == "inches") {

                                        if (dyo.config._shapes[0].files.table.min_depth == dyo.config._shapes[0].files.table.max_depth) {
                                            productData += `${Translate(Lang.SIZE)}:  ${dyo.engine.metrics.toInch(part.width, true)} x  ${dyo.engine.metrics.toInch(part.height, true)}`
                                        } else {
                                            productData += `${Translate(Lang.SIZE)}:  ${dyo.engine.metrics.toInch(part.width, true)} x  ${dyo.engine.metrics.toInch(part.height, true)}`
                                        }
        
                                    } else {

                                        switch (dyo.monument.id) {
                                            default:
                                                if (dyo.config._shapes[0].files.table.min_depth == dyo.config._shapes[0].files.table.max_depth) {
                                                    productData += `${Translate(Lang.SIZE)}:  ${Math.round(part.width)} mm x  ${Math.round(part.height)} mm`
                                                } else {
                                                    productData += `${Translate(Lang.SIZE)}:  ${Math.round(part.width)} mm x  ${Math.round(part.height)} mm`
                                                }        
                                                break;
                                            case 4: case 124:
                                                if (dyo.config._shapes[0].files.table.min_depth == dyo.config._shapes[0].files.table.max_depth) {
                                                    productData += `${Translate(Lang.SIZE)}:  ${Math.round(part.width)} mm x ${Math.round(part.height)} mm x  ${Math.round(part.length)} mm`
                                                } else {
                                                    productData += `${Translate(Lang.SIZE)}:  ${Math.round(part.width)} mm x ${Math.round(part.height)} mm x  ${Math.round(part.length)} mm`
                                                }        

                                                break;
                                            case 7:
                                                if (dyo.monument.headstone.name.indexOf("Portrait") > -1) {
                                                    if (dyo.config._shapes[0].files.table.min_depth == dyo.config._shapes[0].files.table.max_depth) {
                                                        productData += `${Translate(Lang.SIZE)}:  ${Math.round(part.width)} mm x  ${Math.round(part.height)} mm`
                                                    } else {
                                                        productData += `${Translate(Lang.SIZE)}:  ${Math.round(part.width)} mm x  ${Math.round(part.height)} mm`
                                                    }
                                                }
                                                if (dyo.monument.headstone.name.indexOf("Landscape") > -1) {
                                                    if (dyo.config._shapes[0].files.table.min_depth == dyo.config._shapes[0].files.table.max_depth) {
                                                        productData += `${Translate(Lang.SIZE)}:  ${Math.round(part.height)} mm x  ${Math.round(part.width)} mm`
                                                    } else {
                                                        productData += `${Translate(Lang.SIZE)}:  ${Math.round(part.height)} mm x  ${Math.round(part.width)} mm`
                                                    }
                                                }
                                                break;        
                                        }
        
                                    }
                                    
                                    break;
                            }

                        } else {

                            if (dyo.metric == "inches") {
                                productData += `${Translate(Lang.SIZE)}:  ${dyo.engine.metrics.toInch(part.width, true)} x  ${dyo.engine.metrics.toInch(part.height, true)}`
                            } else {
                                switch (dyo.monument.id) {
                                    default:
                                        productData += `${Translate(Lang.SIZE)}:  ${Math.round(part.width)} mm x  ${Math.round(part.height)} mm`
                                        break;
                                    case 7:
                                        if (dyo.monument.headstone.name.indexOf("Portrait") > -1) {
                                            productData += `${Translate(Lang.SIZE)}:  ${Math.round(part.width)} mm x  ${Math.round(part.height)} mm`
                                        }
                                        if (dyo.monument.headstone.name.indexOf("Landscape") > -1) {
                                            productData += `${Translate(Lang.SIZE)}:  ${Math.round(part.height)} mm x  ${Math.round(part.width)} mm`
                                        }
                                        break;
                                }
                            }

                        }
                    }

                    if (part.type == 'Headstone') {
                        if (dyo.monument.getProductType() == "mini-headstones") {

                            let installationMethod = '';

                            switch (dyo.monument.installationMethod) {
                                case 1:
                                    installationMethod = Translate(Lang.MINI_HEADSTONE_WITH_GRANITE_BASE);
                                    break;
                                case 2:
                                    installationMethod = Translate(Lang.MINI_HEADSTONE_ONLY_LAY_FLAT);
                                    break;
                                case 3:
                                    installationMethod = Translate(Lang.MINI_HEADSTONE_BURIED_INTO_GROUND);
                                    break;
                            }

                            productData += `<br/>${Translate(Lang.INSTALLATIONS_METHODS)}: ${installationMethod}<br/>`
                        }
                        if (dyo.monument.getProductType() == "plaques") {

                            if (dyo.monument.id == 5 ||
                                dyo.monument.id == 999) {
                                let fixingSystem = '';

                                switch (dyo.monument.fixingSystemType) {
                                    case 1:
                                        fixingSystem = Translate(Lang.FLAT_BACK);
                                        break;
                                    case 2:
                                        fixingSystem = Translate(Lang.LUGS_WITH_STUDS);
                                        break;
                                    case 3:
                                        fixingSystem = Translate(Lang.SCREWS_VISIBLE_FROM_FRONT);
                                        break;
                                }

                                productData += `<br/>` + Translate(Lang.FIXING_SYSTEM) + `: ${fixingSystem}`
                                if (this.hasEmblems()) {
                                    productData += `<br/>${Translate(Lang.COLOR_OF_BRONZE_EMBLEMS)}<br/>`
                                }
                            }
                            
                        }

                        if (dyo.monument.getProductType() == "plaques") {

                            if (dyo.monument.id == 52) {
                                let corner = '';
                                let hole = '';

                                switch (dyo.monument.cornerType) {
                                    case 1:
                                        corner = Translate(Lang.ROUNDED);
                                        break;
                                    case 2:
                                        corner = Translate(Lang.STRAIGHT);
                                        break;
                                }

                                productData += `<br/>` + Translate(Lang.CORNERS) + `: ${corner}`

                                switch (dyo.monument.holeType) {
                                    case 1:
                                        hole = Translate(Lang.ON_CORNERS);
                                        break;
                                    case 2:
                                        hole = Translate(Lang.ON_TOP_CORNERS);
                                        break;
                                    case 3:
                                        hole = Translate(Lang.NO_DRILLED_HOLES);
                                        break;
                                }

                                productData += `<br/>` + Translate(Lang.HOLES) + `: ${hole}`

                            }
                            
                        }
                        
                    }

                    let partData = {
                        width: Number(part.width), 
                        height: Number(part.height), 
                        length: Number(part.length), 
                        type: part.type 
                    }

                    if (part.note) {
                        partData.note = part.note;
                    }

                    if (dyo.mode == "3d") {

                        let model;

                        switch (part.type) {
                            case "Headstone":
                                model = dyo.engine3d.headstone3d;
                                break;
                            case "Base":
                                model = dyo.engine3d.stand3d;
                                break;
                            case "Ledger":
                                model = dyo.engine3d.ledger3d;
                                break;
                            case "Kerbset":
                                model = dyo.engine3d.kerb3d;
                                break;        
                        }

                        if (model) {

                            let type = part.type;

                            partData = {
                                width: model.getProperty("width"),
                                height: model.getProperty("height"),
                                length: model.getProperty("depth"),
                                type: type
                            }

                        }

                    }

                    if (dyo.mode == "3d") {
                        if (dyo.engine3d.ledger3d) {
                            if (dyo.edit == false) {
                                let regions = dyo.engine3d.ledger3d.getRegionList();
                                let childs;

                                for (let i = 0; i < regions.length; i++) {
                                    let region = regions[i];
                                    childs = region.getChildList();
                                }

                                if (childs.length > 0) {
                                    dyo.engine.extra_price = 500;
                                } else {
                                    dyo.engine.extra_price = 0;
                                }
                            }                            
                        }
                    }

                    let unitPrice = this.getPrice(partData);

                    switch (dyo.monument._config.formula) {
                        case "Laser":
                            if (this.hasBaseAddition()) {
                                switch (dyo.monument.id) {
                                    default:
                                        dyo.engine.extra_price = 60;
                                        break;
                                    case 4:
                                        dyo.engine.extra_price = 180 * 1.1;
                                        break;
                                }
                            } else {
                                dyo.engine.extra_price = 0;
                            }
                            break;
                    }

                    if (dyo.mode != "3d") {
                        // Multiply price by height for bases
                        if (part.type == "Base") {
                            let addition = this.getBasesAdditionByType("base");
                            if (addition.prices[0].quantity_type == "Width") {
                                let heightMultiplier = (dyo.monument.base.height - 100) / 100;
                                let extraHeight = Math.round(unitPrice * heightMultiplier);
                                unitPrice = Number(unitPrice);
                                unitPrice += extraHeight;
                                unitPrice = Math.round(unitPrice).toFixed(2);
                            }
                        }
                    }
                    
                    switch (dyo.monument._config.formula) {
                        default:
                            break;
                        case "Laser":
                            // extra price for laser etching on ledger
                            if (part.type == "Ledger") {
                                if (dyo.engine.extra_price > 0) {
                                    unitPrice = Number(unitPrice);
                                    unitPrice += dyo.engine.extra_price;
                                    unitPrice = unitPrice.toFixed(2);
                                }
                            }
                            if (part.type == "Base") {
                                if (dyo.engine.extra_price > 0) {
                                    unitPrice = Number(unitPrice);
                                    unitPrice += dyo.engine.extra_price;
                                    unitPrice = unitPrice.toFixed(2);
                                }
                            }
                            break;
                        case "Engraved":
                            if (dyo.monument.has_border || dyo.monument.border > 0) {
                                unitPrice *= 1.2;
                                unitPrice = unitPrice.toFixed(2);
                            }
                            break;
                    }

                    let symbol = this.getCurrencySymbol(dyo.currency);
                    let side = this.getCurrencySide(dyo.currency);

                    data += '<tr>' +
                    `<td><span class="table-header-for-mobile">${Translate(Lang.PRODUCT)}</span><p><strong>` + product + '</strong><br/>' + productData + '</p></td>' + 
                    `<td><span class="table-header-for-mobile">${Translate(Lang.QUANTITY)}</span>` + '1</td>';

                    
                    if (side == 0) {
                        data += `<td><span class="table-header-for-mobile">${Translate(Lang.UNIT_PRICE)}</span>` + symbol + unitPrice + '</td>';
                        data += `<td><span class="table-header-for-mobile">${Translate(Lang.ITEM_TOTAL)}</span>` + symbol + unitPrice + '</td>';
                    }
                    
                    if (side == 1) {
                        data += `<td><span class="table-header-for-mobile">${Translate(Lang.UNIT_PRICE)}</span>` + unitPrice + " " + symbol + '</td>';
                        data += `<td><span class="table-header-for-mobile">${Translate(Lang.ITEM_TOTAL)}</span>` + unitPrice + " " + symbol + '</td>';
                    }

                    data += '</tr>';

                    if (dyo.monument.id == 32) {
                        if (dyo.monument.headstone.border == "Border 4") {

                            let border_price = 299;

                            data += '<tr>' +
                            '<td><span class="table-header-for-mobile"><strong>' + Translate(Lang.PRODUCT) + '</span><p><strong>Product ID: 37 - ' + Translate(Lang.STAINLESS_STEEL_BORDER) + '</strong></p></td>' + 
                            '<td><span class="table-header-for-mobile">' + Translate(Lang.QUANTITY) + '</span>1</td>' + 
                            '<td><span class="table-header-for-mobile">' + Translate(Lang.UNIT_PRICE) + '</span>' + symbol + (border_price).toFixed(2) + '</td>' + 
                            '<td><span class="table-header-for-mobile">' + Translate(Lang.ITEM_TOTAL) + '</span>' + symbol + (border_price).toFixed(2) + '</td>' + 
                            '</tr>';

                            total += Number(border_price);

                        }
                    }

                    if (part.type == "Base") {

                        if (dyo.monument.has_base_flower_pot_holes) {

                            let prices = dyo.monument._additions.Bases[0].prices[0];
                            let model = prices.model;
                            let retail_multiplier = prices.retail_multiplier;
                            let note = prices.note;
                            var pot_hole_q = Math.floor(this.getEquation(model, 1) * retail_multiplier);

                            dyo.monument.base.flower_pot_holes = true;
                        }

                        if (dyo.monument.has_base_flower_pot_holes) {
                            if (dyo.monument.has_base_flower_pots) {
                                if (dyo.monument.has_base_flower_pots > 1) {

                                    let prices = dyo.monument._additions.Bases[1].prices[0];
                                    let model = prices.model;
                                    let retail_multiplier = prices.retail_multiplier;
                                    let note = prices.note;
                                    let q = Math.floor(this.getEquation(model, 1) * retail_multiplier);
                                    let color;

                                    switch (Number(dyo.monument.has_base_flower_pots)) {
                                        case 1:
                                            color = Translate(Lang.FLOWER_INSERTS);
                                            q = 0;
                                            break;
                                        case 2:
                                            color = Translate(Lang.BLACK_LID);
                                            break;
                                        case 3:
                                            color = Translate(Lang.SILVER_LID);
                                            break;
                                        case 4:
                                            color = Translate(Lang.GOLD_LID);
                                            break;
                                    }

                                    data += '<tr>' +
                                    '<td><p><strong>' + Translate(Lang.PRODUCT) + " ID: 53 - " + Translate(Lang.FLOWER_POT_HOLES).replace("s", "") + " " + dyo.monument._additions.Bases[1].name +  " " + Translate(Lang.WITH) + " " + color + '</p></td>' + 
                                    '<td>2</td>' + 
                                    '<td>' + symbol + (q + pot_hole_q + 1).toFixed(2) + '</td>' + 
                                    '<td>' + symbol + ((q + pot_hole_q + 1) * 2).toFixed(2) + '</td>' +
                                    '</tr>';

                                    total += Number(((q + pot_hole_q + 1) * 2).toFixed(2));

                                    dyo.monument.base.base_flower_pots = dyo.monument.has_base_flower_pots;
                                }
                            }
                        }

                    }

                    part.price = Number(unitPrice);
            
                    total += Number(unitPrice);

            }
    
        });

        this.paidInscriptionsLines = dyo.monument.getInscriptionsLines();
        this.charsFree = 60;

        switch (dyo.monument.id) {
            default:
                this.photosFree = 0;
                this.motifsFree = 0;
                break;
            case 5: case 52: case 999:
                this.motifsFree = 1;
                break;
            case 4: case 7: case 22: case 30: case 100:
                this.photosFree = 2;
                break;
            case 8: case 9: case 135:
                this.photosFree = 1;
                this.motifsFree = 1;
                break;
        }

        this.totalChars = 0;

        for (let nr = 0; nr < this.items.length; nr++) {

            let itemType = this.items[nr].type;
            let itemLabel = "<strong>" + Translate(Lang.PRODUCT) + " ID: " + this.items[nr].productid + " - ";
            let itemQuantity = 1;
            let itemData;
            let unitPrice;
            let itemTotal;
            let colorName = '';
            let name;
            let size;
            let width;
            let height;
            let self = this;
            let item_label;

            switch (itemType) {
                case "Border": 
                    itemLabel += this.getNameByID("borders", this.items[nr].productid) + "</strong>";

                    headstone.colors.forEach(color => {
                        if (color.hex == this.items[nr].color) {
                            colorName = color.name;
                        }
                    });

                    itemData = "";

                    let v2;
                    v2 = Math.round(dyo.data.width + dyo.data.height);

                    unitPrice = this.getItemPrice(itemType, 1, v2, "");
                    itemTotal = this.getItemPrice(itemType, 1, v2, "");

                    this.items[nr].price = unitPrice;

                    break;
                case "Stand": 
                    itemLabel += this.getNameByID("stand", this.items[nr].productid) + "</strong>";

                    itemData = "";

                    let v3;
                    v3 = Math.round(dyo.data.width + dyo.data.height);

                    unitPrice = this.getItemPrice(itemType, 1, v3, this.items[nr].productid);
                    itemTotal = this.getItemPrice(itemType, 1, v3, this.items[nr].productid);

                    this.items[nr].price = unitPrice;

                    break;
                case "Inscription":

                    switch (dyo.monument._additions.Inscriptions[0].prices[0].quantity_type) {
                        default:
                            itemQuantity = this.strip(this.items[nr].text.text).length;
                            break;
                        case "Lines 4":
                            itemQuantity = 1;
                            break;
                    }

                    item_label = dyo.monument._additions.Inscriptions[0].name;

                    if (dyo.code == "jp_JP") {
                        switch (item_label) {
                            case "Black Granite Inscription (free)":
                                item_label = "黒御影石の碑文（無料）";
                                break;
                        }
                    }

                    itemLabel += item_label + "</strong>";

                    headstone.colors.forEach(color => {
                        if (color.hex == this.items[nr].color) {
                            colorName = color.name;
                        }
                    });

                    itemData = this.items[nr].text.text;
                    
                    if (dyo.metric == "inches") {
                        itemData += "<br/>" + dyo.engine.metrics.toInch(this.items[nr].getHeight(), true) + " " + this.items[nr].getFontFamily() + ", " + Translate(Lang.COLOR).toLowerCase() + ": ";
                    } else {
                        itemData += "<br/>" + this.items[nr].getHeight() + "mm " + this.items[nr].getFontFamily() + ", " + Translate(Lang.COLOR).toLowerCase() + ": ";
                    }

                    switch (dyo.monument.id) {
                        default:
                            if (dyo.monument.getProductType() != "images") {
                                itemData += this.items[nr].colorName + " (" + this.items[nr].color + ")";
                            }        
                            break;
                        case 31:
                            if (dyo.monument.getProductType() != "images") {

                                if (this.items[nr].color_texture) {
                                    let color_tex = this.items[nr].color_texture.split("/");
                                    color_tex = color_tex[color_tex.length - 1].replace(".jpg", "");
                                    itemData += Translate(Lang.IMAGE) + " (" + color_tex + ")";
                                }

                            }
                            break;
                    }

                    if (this.items[nr].getRotation() != 0 && this.items[nr].getRotation() != 360) {
                        itemData += "<br/>" + Translate(Lang.ROTATION) + ": " + this.items[nr].getRotation() + "&deg;";
                    }

                    let value = this.items[nr].getHeight();

                    if (dyo.monument.id == 31) {
                        value = this.items[nr].countChars();

                        this.totalChars += value;

                        if (value > 60) {
                            itemQuantity -= this.charsFree;
                            this.charsFree = 0;
                        } else {
                            this.charsFree = 60 - this.totalChars;

                            if (this.charsFree < 1) {
                                itemQuantity -= this.lastFreeChars;
                            }
                        } 

                    }

                    let _colorName = this.items[nr].colorName;
                    if (_colorName != "Gold Gilding" && colorName != "Silver Gilding") {
                        _colorName = "Paint Fill";
                    }

                    unitPrice = this.getItemPrice(itemType, 1, value, _colorName);
                    itemTotal = this.getItemPrice(itemType, itemQuantity, value, _colorName);

                    this.items[nr].price = unitPrice;

                    if (dyo.monument.id == 31) {
                        if (this.charsFree > 0) {
                            this.lastFreeChars = this.charsFree;
                        } else {
                            this.lastFreeChars = 0;
                        }
                    }

                    if (isNaN(unitPrice)) {
                        this.items[nr].delete();
                    } else if (this.items[nr].text.text == " " || this.items[nr].text.text == "") {
                        this.items[nr].delete();
                    } else if (this.items[nr].text.text == "  ") {
                        setTimeout(function() {
                            if (dyo.engine3d.inst3d == undefined) {
                                self.items[nr].delete();
                            }
                        }, 500);
                        
                    } else {
                        this.paidInscriptionsLines --;
                    }

                    break;
                case "Motif": 

                    item_label = this.getNameByID("motifs", this.items[nr].productid);

                    if (dyo.code == "jp_JP") {
                        switch (item_label) {
                            case "Motif (Laser)":
                                item_label = "モチーフ（レーザー）";
                                break;
                        }
                    }
                    
                    itemLabel += item_label + "</strong>";

                    headstone.colors.forEach(color => {
                        if (color.hex == this.items[nr].color) {
                            colorName = color.name;
                        }
                    });

                    itemData = Translate(Lang.FILE) + ": " + this.items[nr].item;

                    let color = this.items[nr].color;

                    switch (dyo.monument.id) {
                        case 31:
                            switch (this.items[nr].productid) {
                                case 76:
                                    color = "";
                                    break;
                                case 13: case 15:
                                    if (this.items[nr].color_texture) {
                                        color = this.items[nr].color_texture.split("/");
                                        color = color[color.length - 1].replace(".jpg", "");
                                    }
                                    break;
                            }
                            break;
                    }

                    let motif_height = Math.round(this.items[nr].get_height() / this.items[nr].dimmension_ratio);

                    if (dyo.metric == "inches") {
                        itemData += "<br/>" + dyo.engine.metrics.toInch(motif_height, true) + ", " + Translate(Lang.COLOR).toLowerCase() + ": ";
                    } else {
                        if (this.items[nr].productid == 76) {
                            itemData += "<br/>" + motif_height + " mm";
                        } else {
                            itemData += "<br/>" + motif_height + " mm" + ", " + Translate(Lang.COLOR).toLowerCase() + ": ";
                        }
                    }

                    switch (dyo.monument.id) {
                        default:
                            itemData += this.items[nr].colorName + " (" + color + ")";
                            break;
                        case 7: case 32: case 2350:
                            break;
                        case 31:
                            if (this.items[nr].productid != 76) {
                                itemData += Translate(Lang.IMAGE) + " (" + color + ")";
                            }
                            break;
                    }

                    if (this.items[nr].getRotation() != 0 && this.items[nr].getRotation() != 360) {
                        itemData += "<br/>" + Translate(Lang.ROTATION) + ": " + this.items[nr].getRotation() + "&deg;";
                    }

                    let v;

                    let note = this.items[nr].colorName;

                    if (this.items[nr].colorName == "Gold Gilding" || this.items[nr].colorName == "Silver Gilding") {
                    } else {
                        note = "Paint Fill";
                    }

                    if (note == undefined) {
                        note = nr;
                        v = Math.round(this.items[nr].get_width() + this.items[nr].get_height());
                    } else {
                        v = Math.round(this.items[nr].get_width() * this.items[nr].get_height()) / 100;
                    }

                    v =  Math.round(this.items[nr].get_height() / this.items[nr].dimmension_ratio);

                    unitPrice = this.getItemPrice(itemType, nr, v, note, this.items[nr].productid);
                    itemTotal = this.getItemPrice(itemType, nr, v, note, this.items[nr].productid);

                    this.items[nr].price = unitPrice;

                    this.motifsFree --;
                    break;

                case "Emblem": 
                    
                    name = this.items[nr].item;

                    dyo.monument._additions.Emblems.forEach(emblem => {
                        if (emblem.id == this.items[nr].id) {
                            this.product = emblem;
                        }
                    });

                    itemLabel += this.product.name + "</strong><br/>" + "File: " + name;

                    size = this.items[nr].getQuoteSize();
                    size = size.replace(' mm', '').split(' x ');

                    width = Math.round(Number(size[0]));
                    height = Math.round(Number(size[1].replace(" mm", "")));

                    if (dyo.metric == "inches") {
                        itemData = dyo.engine.metrics.toInch(width, true) + " x " + dyo.engine.metrics.toInch(height, true);
                    } else {
                        itemData = width + " mm x " + height + " mm";
                    }

                    if (this.items[nr].getRotation() != 0 && this.items[nr].getRotation() != 360) {
                        itemData += "<br/>Rotation: " + this.items[nr].getRotation() + "&deg;";
                    }

                    if (dyo.monument.getProductType() == "images") {
                        unitPrice = 0;
                        itemTotal = 0;
                    } else {
                        unitPrice = this.getItemPrice(itemType, 1, Math.round(width + height));
                        itemTotal = this.getItemPrice(itemType, 1, Math.round(width + height));    
                    }

                    this.items[nr].price = unitPrice;

                    break;

                case "Photo":

                    name = this.items[nr].item;

                    if (name == undefined) {
                        name = this.items[nr].fileNameCropped;
                    }

                    let ext;

                    if (name.indexOf(".") > -1) {
                        ext = name.split(".")[1].substr(0,3);
                    } else {
                        ext = "jpg";
                    }

                    if (name.length > 24) {
                        name = name.substr(0, 24) + "." + ext;
                    }

                    //this.items[nr].updateSize();

                    dyo.monument._additions.Images.forEach(image => {
                        if (image.id == this.items[nr].id) {
                            this.product = image;
                        }
                    });

                    switch (Number(this.product.id)) {
                        default:
                            itemLabel += this.product.name + "</strong><br/>" + Translate(Lang.FILE) + ": " + name;
                            break;
                        case 21:
                            if (this.photosFree > 0) {
                                itemLabel += Translate(Lang.GRANITE_IMAGE_DIRECT_ON_STONE) + " (" + Translate(Lang.FREE).toLowerCase() + ")</strong><br/>" + Translate(Lang.FILE) + ": " + name;
                            } else {
                                itemLabel += Translate(Lang.GRANITE_IMAGE_DIRECT_ON_STONE) + "</strong><br/>" + Translate(Lang.FILE) + ": " + name;
                            }
                            break;
                        case 137:
                            if (this.photosFree > 0) {
                                itemLabel += Translate(Lang.IMAGE) + " (" + Translate(Lang.FREE).toLowerCase() + ")</strong><br/>" + Translate(Lang.FILE) + ": " + name;
                            } else {
                                itemLabel += Translate(Lang.IMAGE) + "</strong><br/>" + Translate(Lang.FILE) + ": " + name;
                            }
                            break;    
                    }

                    size = this.items[nr].getSize();
                                     
                    // if size is not fixed
                    if (size * 1 == size) {
                        width = Math.round(this.items[nr].getWidthMm());
                        height = Math.round(Number(size));

                        if (dyo.metric == "inches") {
                            itemData = dyo.engine.metrics.toInch(width, true) + " x " + dyo.engine.metrics.toInch(height, true);
                        } else {
                            itemData = width + " mm x " + height + " mm";
                        }
                    } else {
                        size = size.replace(' mm', '').split(' x ');
                        width = Number(size[0]);
                        height = Number(size[1]);

                        switch (Number(this.items[nr].mask)) {
                            case 0: case 1:
                                if (dyo.metric == "inches") {
                                    itemData = dyo.engine.metrics.toInch(width, true) + " x " + dyo.engine.metrics.toInch(height, true);
                                } else {
                                    itemData = width + " mm x " + height + " mm";
                                }
                                break;
                            case 2: case 3:
                                if (dyo.metric == "inches") {
                                    itemData = dyo.engine.metrics.toInch(height, true) + " x " + dyo.engine.metrics.toInch(width, true);
                                } else {
                                    itemData = height + " mm x " + width + " mm";
                                }
                                break;
                        }
                    }

                    if (this.items[nr].getRotation() != 0 && this.items[nr].getRotation() != 360) {
                        itemData += "<br/>" + Translate(Lang.ROTATION) + ": " + this.items[nr].getRotation() + "&deg;";
                    }

                    if (dyo.monument.getProductType() == "image" && dyo.monument.id != 7) {
                        unitPrice = 0;
                        itemTotal = 0;
                    } else {
                        unitPrice = this.getItemPrice(itemType, 1, Math.round(width + height));
                        itemTotal = this.getItemPrice(itemType, 1, Math.round(width + height));    
                    }

                    if (this.items[nr].id == 21 || this.items[nr].id == 137) {
                        this.photosFree --;
                    }

                    this.items[nr].price = unitPrice;

                    break;
            }


            if (this.items[nr]) {
                if (this.items[nr].parent) {
                    if (this.items[nr].parent.type == 'Base' && dyo.monument.has_base ||
                        this.items[nr].parent.type == 'Headstone' && dyo.monument.has_headstone) {

                            let symbol = this.getCurrencySymbol(dyo.currency);
                            let side = this.getCurrencySide(dyo.currency);
                    
                            data += '<tr>' + 
                            `<td><span class="table-header-for-mobile">${Translate(Lang.PRODUCT)}</span><p>` + itemLabel + '<br/>' + itemData + '</p></td>' + 
                            `<td><span class="table-header-for-mobile">${Translate(Lang.QUANTITY)}</span><p>` + itemQuantity + '</td>';
                            if (side == 0) {
                                data += `<td><span class="table-header-for-mobile">${Translate(Lang.UNIT_PRICE)}</span>` + symbol + unitPrice.toFixed(2) + '</td>';
                                data += `<td><span class="table-header-for-mobile">${Translate(Lang.ITEM_TOTAL)}</span>` + symbol + itemTotal.toFixed(2) + '</td>';
                            }
                            if (side == 1) {
                                data += `<td><span class="table-header-for-mobile">${Translate(Lang.UNIT_PRICE)}</span>` + unitPrice.toFixed(2) + " " + symbol + '</td>';
                                data += `<td><span class="table-header-for-mobile">${Translate(Lang.ITEM_TOTAL)}</span>` + itemTotal.toFixed(2) + " " + symbol + '</td>';
                            }
                            data += '</tr>';


                        if (Number(itemTotal)) {
                            total += Number(itemTotal);
                        }

                    }
                }
            }

        }

        if (total < 3000) {
            total = total * 1.08;
        } else {
            total = total * 1.05;
        }

        total = total.toFixed(2);

        let symbol = this.getCurrencySymbol(dyo.currency);
        let side = this.getCurrencySide(dyo.currency);

        let add = '';

        //console.log("***" + dyo.engine.promoCodeValue + "***");

        if (dyo.engine.promoCodeValue != '' && dyo.engine.promoCodeValue != undefined) {
            add = "<br/>" + dyo.engine.promoCodeValue;
        }

        data += '<tr class="total-flex">' + 
        '<td class="empty-cell">' + add + '</td>' + 
        '<td class="empty-cell"></td>' + 
        '<td class="total-title">' + Translate(Lang.TOTAL) + '</td>';

        let discount_price = 0;

        //console.log(dyo.config._config.force_retail);

        if (Number(dyo.config._config.force_retail)) {
            discount_price = (total * Number(dyo.config._config.retail)).toFixed(2);
        }

        if (dyo.engine.promoCodeValue != '' && dyo.engine.promoCodeValue != undefined) {
            discount_price = (total * 0.9).toFixed(2);
            add = "<br/>" + dyo.engine.promoCodeValue;
        }
        
        if (side == 0) {
            if (discount_price == 0) {
                data += '<td>' + symbol + total + '</td>';
            } else {
                data += '<td><span style="color:red;text-decoration:line-through;">' + symbol + total + '</span><br>' + symbol + discount_price + '</td>';
                total = discount_price;
            }
        }
        if (side == 1) {
            if (discount_price == 0) {
                data += '<td>' + total + " " + symbol + '</td>';
            } else {
                data += '<td><span style="color:red;text-decoration:line-through;">' + total + " " + symbol + '</span><br>' + discount_price + " " + symbol + '</td>';
                total = discount_price;
            }
        }

        data += '</tr>';

        let gst = '';

        if (dyo.country == "au") {
            gst = Translate(Lang.GST_AUSTRALIA);
        } else {
            gst = Translate(Lang.GST);
        }

        data += '<tr>' + 
        '<td style="display:block">' + gst + '</td>' + 
        '<td class="empty-cell"></td>' + 
        '<td class="empty-cell"></td>' +
        '<td class="empty-cell"></td>' + 
        '</tr>';

        data += '</tbody>' + 
        '</table></div>';

        this.totalPrice = total;

        if (pdf) {
            let headersRegex = `<span class="table-header-for-mobile">(${Translate(Lang.PRODUCT)}|${ Translate(Lang.QUANTITY)}|${Translate(Lang.UNIT_PRICE)}|${Translate(Lang.ITEM_TOTAL)})</span>`;
            data = data.replace(new RegExp(headersRegex, "gi"), "");
        }

		return {
			price: total,
			data: data
		}

    }

    hasEmblems() {
        let hasEmblems = false;
        
        for (let nr = 0; nr < this.items.length; nr++) {
            let itemType = this.items[nr].type;
            switch (itemType) {
                case "Emblem":
                    hasEmblems = true;
                    break;
            }
        }

        return hasEmblems;
    }

    getTotalPrice() {
        return this.checkPrice().price;
    }

    getPrice(s) {

        let m3;
        
        if (dyo.monument.materials[13]) {
            m3 = dyo.monument.materials[13].m3;
        }
        
        let area;
        let price;
        let wholesale;
        let quantity_type;
        let _type;

        quantity_type = dyo.monument._price_Model[0].quantity_type;

        if (s.type == "Base") {
            quantity_type = this.getBasesAdditionByType("base").prices[0].quantity_type;
        }

        if (dyo.mode == "3d" && dyo.config._config.type == "full-monument") {
            quantity_type = "Area";

            if (s.type == "Headstone" || s.type == "Base") {
                quantity_type = "Width + Height";
            }
        }

        if (dyo.mode == "3d" && dyo.config._config.type == "headstone") {
            quantity_type = "Area";

            if (s.type == "Headstone") {
                quantity_type = "Width + Height";
            }
        }

        if (dyo.mode == "3d") {
            if (dyo.monument.id != 4) {
                if (dyo.monument.id != 5) {
                    if (dyo.monument.id != 30) {
                        if (dyo.monument.id != 34) {
                            quantity_type = "Area";
                        }
                    }
                }
            }
        } 

        //console.log(quantity_type);

        if (dyo.engine.material_material) {
            for (let m_nr = 0; m_nr < dyo.monument.materials.length; m_nr++) {
                switch (s.type) {
                    case "Headstone":
                        if (dyo.monument.headstone.texture.indexOf(dyo.engine.material_material.img.replace("/s","/l")) > -1) {
                            m3 = dyo.engine.material_material.m3;
                        }    
                        break;
                    case "Base":
                        if (dyo.monument.base.texture.indexOf(dyo.engine.material_material.img.replace("/s","/l")) > -1) {
                            m3 = dyo.engine.material_material.m3;
                        }    
                        break;
                }
            }
        }

        switch (quantity_type) {

            case "Area":
                switch (s.type) {
                    case "Headstone":
                        area = this.getArea(s.type, s.width, s.height, s.length, true);
                        wholesale = area * m3;
                        price = wholesale * Number(dyo.monument._config.retail) * Number(dyo.monument._config["formula-multiplier"]);
                        break;
                    case "Base":
                        area = this.getArea(s.type, s.width, s.height, s.length, true);
                        wholesale = area * m3;
                        price = wholesale * dyo.monument._config.retail * Number(dyo.monument._config["formula-multiplier"]);
                        console.log(m3, wholesale, dyo.monument._config.retail, Number(dyo.monument._config["formula-multiplier"]));
                        break;
                    case "Ledger":
                        area = this.getArea(s.type, s.width, s.height, s.length, true);
                        wholesale = area * dyo.monument.materials[13].m3;
                        price = wholesale * dyo.monument._config.retail * dyo.monument._config["formula-multiplier"];
                        break;
                    case "Kerbset":
                        area = this.getArea(s.type, s.width, s.height, s.length, true);
                        wholesale = area * dyo.monument.materials[13].m3;
                        price = wholesale * dyo.monument._config.retail;
                        break;
                }

                break;
                
            case "Width + Height":

                if (s.type == "Base") {
                    _type = s.type;
                }

                if (s.note) {
                    _type = s.note;
                }

                price = this.getItemPrice(s.type, 1, s.width + s.height, _type);

                if (dyo.monument.id == 34) {
                    price = price * Number(dyo.monument._config["formula-multiplier"]);
                }

                //console.log(price);

                break;

            case "Units":

                if (s.type == "Base") {
                    _type = s.type;
                }

                if (s.note) {
                    _type = s.note;
                }

                price = this.getItemPrice(s.type, 1, s.width + s.height, _type);
                break;

            case "Width * Height":

                if (s.type == "Base") {
                    _type = s.type;
                }

                if (s.note) {
                    _type = s.note;
                }

                price = this.getItemPrice(s.type, 1, s.width * s.height, _type);
                break;

            case "Width":

                if (s.type == "Base") {
                    _type = s.type;
                }

                price = this.getItemPrice(s.type, 1, s.width, _type);
                break;
            
        }
        
        if (dyo.monument.getProductType() == "images") {
            let item_id = 200;

            if (dyo.monument.materialImage == 2) {
                item_id = 201;
            }

            if (dyo.monument.materialImage == 3) {
                item_id = 202;
            }

            price = this.getItemPrice("Photo", 1, Math.round(s.width) + Math.round(s.height), item_id);

        }

        //let currency_ratio = this.getCurrencyRatio(dyo.currency);
        //console.log(Number(dyo.config._config.force_retail));
        //this.standard_price = price;

        return (price).toFixed(2);
        
    }

    getItemPrice(type, quantity, value, item_id = undefined, item_productid = undefined) {

        let items;
        let start_quantity;
        let end_quantity;
        let model;
        let retail_multiplier;
        let note;
        let price;
        let fixing_cost = 0;
        let q;
        let id;
        let nr;
        let SO = { 
            width: dyo.monument.headstone.width, 
            height: dyo.monument.headstone.height, 
            length: dyo.monument.headstone.length, 
            code: dyo.monument.headstone.name
        };
        
        switch (type) {
            default:
                items = dyo.monument._price_Model;
                id = 0;//this.getFirstID(items);
                items[0].prices = dyo.monument._price_Model;
                break;
            case "Headstone":
                items = dyo.monument._price_Model;
                id = 0;//this.getFirstID(items);
                items[0].prices = dyo.monument._price_Model;
                break;
            case "Base":
                let base = this.getBasesAdditionByType("base");

                items = dyo.monument._price_Model;
                id = 0;
                items[0].prices = base.prices;
                break;
            case "Border":
                items = dyo.monument._additions.Borders;
                id = 0;
                break;
            case "Stand":
                items = dyo.monument._additions.Stand;
                id = 0;
                if (item_id == 87) {
                    id = 1;
                }
                break;    
            case "Inscription":
                items = dyo.monument._additions.Inscriptions;
                id = 0;
                break;			
            case "Motif":

                items = dyo.monument._additions.Motifs;
                id = this.getAdditionID(this.getProductAdditionID(type), items);

                if (item_productid) {
                    nr = 0;
                    items.forEach(item => {

                        if (item.id == item_productid) {
                            id = nr;
                            if (item.fixing) {
                                fixing_cost = item.fixing;
                            }
                        }

                        nr ++;
                    });
                }

                break;
            case "Photo":
                items = dyo.monument._additions.Images;

                id = 0;
                nr = 0;

                if (item_id == undefined) {
                    items.forEach(item => {

                        if (item.id == this.product.id) {
                            id = nr;
                        }

                        nr ++;
                    });
                } else {
                    this.product = {};
                    this.product.id = item_id;

                    items.forEach(item => {

                        if (item.id == item_id) {
                            id = nr;
                        }

                        nr ++;
                    });                
                }

                break;
            case "Emblem":
                    items = dyo.monument._additions.Emblems;
    
                    id = 0;
                    nr = 0;
    
                    if (item_id == undefined) {
                        items.forEach(item => {
    
                            if (item.id == this.product.id) {
                                id = nr;
                            }
    
                            nr ++;
                        });
                    } else {
                        this.product = {};
                        this.product.id = item_id;
    
                        items.forEach(item => {
    
                            if (item.id == item_id) {
                                id = nr;
                            }
    
                            nr ++;
                        });                
                    }
    
                    break;
        }

        switch (items[id].prices[0].quantity_type) {

            case "Lines 4":
            
                let linesFree = 4;
                let linesFreeAdditional = 0;

                for (let nr = items[id].prices.length - 1; nr > -1; nr --) {

                    note = Number(items[id].prices[nr].note);

                    if (SO.height < note) {
                        start_quantity = items[id].prices[nr].start_quantity;
                        model = items[id].prices[nr].model;
                        linesFreeAdditional = linesFree + start_quantity;
                        retail_multiplier = items[id].prices[nr].retail_multiplier;

                        if (this.paidInscriptionsLines > (linesFreeAdditional)) {
                            q = this.getEquation(model, start_quantity + 1);
                        } else {
                            q = 0;
                        }
                        
                    }
                    
                }

                break;

            case "Width":

                for (let nr = 0; nr < items[id].prices.length; nr ++) {

                    start_quantity = items[id].prices[nr].start_quantity;
                    end_quantity = items[id].prices[nr].end_quantity;
                    quantity = 1;

                    if ((Number(value) >= Number(start_quantity) && Number(value) <= Number(end_quantity)) || items[id].prices.length == 1) {

                        model = items[id].prices[nr].model;
                        retail_multiplier = items[id].prices[nr].retail_multiplier;

                        q = this.getEquation(model, value);

                    }
                    
                }

                break;
                
            case "Units":

                if (items[id].prices[0].code == "Free") {
                    q = 0;
                    retail_multiplier = 0;
                } else {

                    for (let nr = 0; nr < items[id].prices.length; nr ++) {

                        start_quantity = items[id].prices[nr].start_quantity;
                        end_quantity = items[id].prices[nr].end_quantity;
                        note = items[id].prices[nr].note;
                        
                        let width = SO.width;
                        let height = SO.height;
                        let code = SO.code;

                        if (note == code || items[id].prices.length == 1) {
                            
                            model = items[id].prices[nr].model;
                            retail_multiplier = items[id].prices[nr].retail_multiplier;
                            quantity = 1;
                            
                            switch (type) {
                                case "Emblem":
                                    q = this.getEquation(model, 1);
                                    break;
                                case "Photo":
                                    if (this.photosFree < 1) {
                                        q = this.getEquation(model, 1);
                                    } else {
                                        q = 0;
                                    }
                                    break;
                                case "Base":
                                    q = this.getEquation(model, 1);
                                    break;
                                default: case "Motif":
                                    if (this.motifsFree < 1) {
                                        q = this.getEquation(model, 1);
                                    } else {
                                        q = 0;
                                    }
                                    break;
                            }

                        } else {

                            for (let nr = 0; nr < items[id].prices.length; nr ++) {

                                start_quantity = items[id].prices[nr].start_quantity;
                                end_quantity = items[id].prices[nr].end_quantity;

                                if ((Number(this.totalChars) >= Number(start_quantity) && Number(this.totalChars) <= Number(end_quantity)) || items[id].prices.length == 1) {
            
                                    model = items[id].prices[nr].model;
                                    retail_multiplier = items[id].prices[nr].retail_multiplier;
            
                                    q = this.getEquation(model, 61);
            
                                }
                                
                            }

                        }
                        
                    }

                }
                    
                break;
            
            case "Max Dimmension":

                let w = this.items[quantity].get_width();
                let h = this.items[quantity].get_height();

                quantity = 1;

                if (w > h) {
                    value = w;
                } else {
                    value = h;
                }

                for (let nr = 0; nr < items[id].prices.length; nr ++) {

                    start_quantity = items[id].prices[nr].start_quantity;
                    end_quantity = items[id].prices[nr].end_quantity;

                    if ((Number(value) >= Number(start_quantity) && Number(value) <= Number(end_quantity)) || items[id].prices.length == 1) {

                        model = items[id].prices[nr].model;
                        retail_multiplier = items[id].prices[nr].retail_multiplier;

                        q = this.getEquation(model, value);

                        if (this.motifsFree < 1) {
                            q = this.getEquation(model, value);
                        } else {
                            q = 0;
                        }
                        
                    }
                    
                }

                break;

            case "Max Dimmension B":

                let _w = this.items[quantity].get_width();
                let _h = this.items[quantity].get_height();

                quantity = 1;

                if (_w > _h) {
                    value = _w;
                } else {
                    value = _h;
                }

                for (let nr = 0; nr < items[id].prices.length; nr ++) {

                    start_quantity = items[id].prices[nr].start_quantity;
                    end_quantity = items[id].prices[nr].end_quantity;

                    if ((Number(value) >= Number(start_quantity) && Number(value) <= Number(end_quantity)) || items[id].prices.length == 1) {

                        model = items[id].prices[nr].model;
                        retail_multiplier = items[id].prices[nr].retail_multiplier;

                        q = this.getEquation(model, value);

                        if (this.motifsFree < 1) {
                            //q = this.getEquation(model, value);
                            q = value;

                            if (value <= 100) {
                                q = 57.23;
                            }
    
                        } else {
                            q = 0;
                        }
                        
                    }
                    
                }

                break;

            case "Width * Height":
                for (let nr = 0; nr < items[id].prices.length; nr ++) {

                    start_quantity = items[id].prices[nr].start_quantity;
                    end_quantity = items[id].prices[nr].end_quantity;
                    quantity = 1;

                    if ((Number(value) >= Number(start_quantity) && Number(value) <= Number(end_quantity)) || items[id].prices.length == 1) {

                        model = items[id].prices[nr].model;
                        retail_multiplier = items[id].prices[nr].retail_multiplier;
                        note = items[id].prices[nr].note;

                        switch (dyo.monument.id) {
                            default:
                                if (item_id) {
                                    if (item_id == note) {
                                        q = this.getEquation(model, value);
                                    } else if (note == "") {
                                        q = this.getEquation(model, value);
                                    } else {
                                        q = this.getEquation(model, value);
                                    }
                                } else {
                                    q = this.getEquation(model, value);
                                }
                                break;
                            case 52:
                                if (dyo.monument.headstone.texture.indexOf("brushed") > -1 && note == "brushed") {
                                    q = this.getEquation(model, value, 2);    
                                }
                                if (dyo.monument.headstone.texture.indexOf("polished") > -1 && note == "polished") {
                                    q = this.getEquation(model, value, 2);    
                                }
                                break;
                        }

                    }
                    
                }

                break;
            
            case "Height": case "Width + Height": case "Surfacearea":

                for (let nr = 0; nr < items[id].prices.length; nr ++) {

                    start_quantity = items[id].prices[nr].start_quantity;
                    end_quantity = items[id].prices[nr].end_quantity;

                    if (items[id].type != "inscription") {
                        quantity = 1;
                    }
                    
                    //console.log(value, start_quantity, end_quantity)

                    if (dyo.usa != true) {
                        if ((Number(value) >= Number(start_quantity) && Number(value) <= Number(end_quantity)) || items[id].prices.length == 1) {

                            model = items[id].prices[nr].model;
                            retail_multiplier = items[id].prices[nr].retail_multiplier;
                            note = items[id].prices[nr].note;

                            if (item_id) {
                                if (item_id == note) {
                                    q = this.getEquation(model, value);
                                } else if (note == "") {
                                    q = this.getEquation(model, value);
                                }

                                if (dyo.monument.getProductType() == "images" || 
                                    dyo.monument.getProductType() == "fullcolourplaque" || 
                                    dyo.monument.getProductType() == "urns") {
                                    q = this.getEquation(model, value);
                                }
                            } else {
                                q = this.getEquation(model, value);
                            }

                        }

                    } else {

                        if ((Number(value) >= Number(start_quantity) - 14 && Number(value) <= Number(end_quantity) + 14) || items[id].prices.length == 1) {

                            model = items[id].prices[nr].model;
                            retail_multiplier = items[id].prices[nr].retail_multiplier;
                            note = items[id].prices[nr].note;

                            if (item_id) {
                                if (item_id == note) {
                                    q = this.getEquation(model, value);
                                } else if (note == "") {
                                    q = this.getEquation(model, value);
                                }

                                if (dyo.monument.getProductType() == "images" || 
                                    dyo.monument.getProductType() == "fullcolourplaque" || 
                                    dyo.monument.getProductType() == "urns") {
                                    q = this.getEquation(model, value);
                                }
                            } else {
                                q = this.getEquation(model, value);
                            }

                        }

                    }                    
                }

                break;
        }

        if (items[id].fixing) {
            price = (q * retail_multiplier) + Number(items[id].fixing);
        } else {
            //console.log("@2 - " + q, retail_multiplier);
            price = (q * retail_multiplier);
        }

        if (fixing_cost > 0) {
            //price = price + Number(fixing_cost);
        }

        if (quantity) {
            price = price * quantity;
        }

        let currency_ratio = this.getCurrencyRatio(dyo.currency);

        return Number(price * currency_ratio);

    }
    
    getEquation(model, value, eq) {
        let q1, q2, q3, q4, q;

        try {
            q1 = model.split("+");
            q2 = q1[1].split("(");
            q1 = Number(q1[0]);
            q3 = q2[1].split("-");
            q2 = Number(q2[0]);
            q4 = Number(q3[1].replace(")",""));
            q3 = value;
            switch (eq) {
                default:
                    q = q1 + (q2 * (q3 - q4));
                    break;
                case 2:
                    let a = 0;
                    if (dyo.monument.headstone.texture.indexOf("brushed") > -1) {
                        a = 1;
                    }
                    if ((q3/100) < 300) {
                        q = q1 * Math.pow((q3/100),q2) + q4 + ((300 - (q3/100)) / (5 + a));
                    } else {
                        q = q1 * Math.pow((q3/100),q2) + q4;
                    }
                    break;
            }
        }
        catch (e) {
            q = 1;
        }

        return q;
    }
    
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    getFirstID(items) {   
        let id;
        
        for (let item_id in items) {
            id = item_id;
        }
        
        return id;
    }

    getBasesAdditionByType(type) {
        
        let additions = dyo.monument._additions.Bases;
        let addition;

        for (let nr = 0; nr < additions.length; nr ++) {
            if (additions[nr].type == type) {
                addition = additions[nr];
            }
        }
        
        return addition;
        
    }
    
    getAdditionByType(type) {
        
        let additions = dyo.monument._additions;
        let addition;

        for (let nr = 0; nr < additions.length; nr ++) {
            if (additions[nr].type == type) {
                addition = additions[nr];
            }
        }
        
        return addition;
        
    }

    getAdditionID(id, items) {
        
        let nr = 0;
        
        for (let nr = 0; nr < items.length; nr ++) {
            if (items[nr].id == id) {
                nr = nr;
            }
        }
        
        return nr;
        
    }
    
    getProductAdditionID(type) {
        
        let additions = dyo.monument._additions;
        let id = 0;

        for (let nr = 0; nr < additions.length; nr ++) {
            if (additions[nr].type.toLowerCase() == type.toLowerCase()) {
                id = additions[nr].id;
            }
        }
        
        return id;
        
    }
    
    getProductAdditionNR(type) {
        
        let additions = this.getAdditions();
        let id = 0;
        
        for (let nr = 0; nr < additions.length; nr ++) {
            if (additions[nr].type == type) {
                id = nr;
            }
        }
        
        return id;
        
    }

    strip(str) {
        let s = str.split(" ");
        return s.join("");
    }

}