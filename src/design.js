import { useRef, useEffect } from 'react';
import { showLoader, hideLoader, setTitle } from './loader.js';
import { convertPosition, convertSize, setDpr, setDesignDpr, setDevice, setNavigator } from './convert.js';
import { $ } from './data.js';
import { getPath } from './path.js';
import { getRef, getRefObj, setCallback } from './dselect.js';
import { getTRef } from './dtextfield.js';
import { motifs } from './data.js';

let currentDesign = {};
let designPreview = '';
let designsTotal = 1;
let dpr = window.devicePixelRatio;
let design_dpr = 1;
let _width = window.innerWidth - 480;
let _height = window.innerHeight - 128;
let x = _width / 2;
let y = _height / 2;
let ml_data = {};
let ml_data_jsons = [];
let ref = {};
let currentItemPath = "";
let designLoading = false;

let url, design_stampid, design_id, design_name, designData;

let device, navigator, init_width, init_height, ratio_width = 1, ratio_height = 1, ratio = 1, tagsCloud = new Array();

const path = getPath();

let images = [];
let imagesInfo = [];
let imageId = 0;
let generateData = false;

const preloadImages = () => {

  console.log("[design] preloadImages: " + images.length);

  if (images.length > 0) {

    var image = document.createElement('img');
    let id = "id" + Date.now();
    image.src = images[imageId];
    image.id = id;
    image.style.display = "none";
    image.onload = () => {
        imagesInfo[imageId] = { width: image.width, height: image.height, url: images[imageId] };
        imageId ++;

        if (imageId < images.length) {
          preloadImages();
        } else {
          handleLoadDesign();
        }

    } 
    
  } else {

      handleLoadDesign();

  }

}

const getItemInfo = (id) => {

  let info = {};

  for (let nr = 0; nr < imagesInfo.length; nr++) {
    if (imagesInfo[nr].url.indexOf(id) > -1) {
      info = {
        width: imagesInfo[nr].width,
        height: imagesInfo[nr].height
      }
    }
  }

  return info;

}

const mode = (arr) => {
  return arr.sort((a,b) =>
        arr.filter(v => v===a).length
      - arr.filter(v => v===b).length
  ).pop();
}

export async function setDesignsTotal(value) { 
    designsTotal = value;
}

export async function setRef(r) { 
    ref = r;
}

export const getDesignLoading = () => { 
  return designLoading;
}

export const setGenerateData = (v) => {
  generateData = v;
}

async function fetchData(url) {
    return fetch(url, {
        method: 'GET'
    })
    .then(response => response.text())
    .then(data => { 
      //console.log(data);
      return data 
    });
}  

export async function loadDesign(design, generate = false) {

  //console.clear()
  designPreview = design.design_preview;
  
  generateData = generate;
  images = [];
  imagesInfo = [];
  designLoading = true;

  showLoader();

  url = path + `design/saved-designs/json/${design.design_stampid}.json`;

  design_stampid = design.design_stampid;
  design_id = design.design_id;
  design_name = design.design_name;
  
  try {
    designData = JSON.parse(await fetchData(url));
  }
  catch(e) {
    console.log("Can't load file...");  
    designLoading = false;
  }
  
  if (generate) {
    setTitle("Generating data: " + design.design_id + " / " + design.design_name);
  }

  if ($("#designControl")) {
    $("#designControl").style = "display:flex";
  }

  if ($("#showImage")) {
    $("#showImage").style = "display:flex";
  }

  if (design_id == designsTotal) {

    if ($("#prevDesign")) {
      $("#prevDesign").style = "display:flex";
    }
    if ($("#nextDesign")) {
      $("#nextDesign").style = "display:none";
    }    

  } else {

    if ($("#prevDesign")) {
      $("#prevDesign").style = "display:flex";
    }
    if ($("#nextDesign")) {
      $("#nextDesign").style = "display:flex";
    }    

  }

  designData.forEach(item => {
    if (item.src) {
      switch (item.type) {
        case "Motif":
          images.push(path + "design/html5/data/svg/motifs/" + item.src + ".svg");
          break;
      }
    }
  });

  imageId = 0;
  if (generateData == false) {
    preloadImages();
  } else {
    handleLoadDesign();
  }

}

async function handleLoadDesign() {

  console.log("[design] handleLoadDesign");

  let ml_url;
  ml_data = {};
  
  try {
    ml_url = path + `design/saved-designs/json/ml/ml_${design_stampid}.json`;
    ml_data = JSON.parse(await fetchData(ml_url));
    ml_data_jsons.push(ml_data);
  }
  catch(e) {
    console.log(e);
  }

  tagsCloud = new Array();

  let output = [];
  let cp;

  designData.forEach(item => {

    switch (item.type) {

      case "Headstone":
        //console.log(item);
        currentDesign = item;

        device = item.device;
        navigator = item.navigator;
        design_dpr = item.dpr;
        init_width = item.init_width;
        init_height = item.init_height;
        ratio = _width / init_width;

        if (isNaN(item.dpr)) {
          design_dpr = 1;
        }

        setDpr(dpr);
        setDesignDpr(design_dpr);
        setDevice(device);
        setNavigator(navigator);

        switch (Number(item.productid)) {
          case 124:
            ml_data.ml_type = "Headstone";
            ml_data.ml_style = "Traditional Engraved Granite";
            break;
          case 34:
            ml_data.ml_type = "Plaque";
            ml_data.ml_style = "Traditional Engraved Granite";
            break;
          case 30:
            ml_data.ml_type = "Plaque";
            ml_data.ml_style = "Laser Etched Black Granite";
            break;
          case 32:
            ml_data.ml_type = "Plaque";
            ml_data.ml_style = "Full Color";
            break;
          case 52:
            ml_data.ml_type = "Plaque";
            ml_data.ml_style = "Stainless Steel";
            break;
          case 5:
            ml_data.ml_type = "Plaque";
            ml_data.ml_style = "Bronze";
            break;
          case 8:
            ml_data.ml_type = "Pet Headstone";
            ml_data.ml_style = "Laser Etched Black Granite";
            break;
          case 9:
            ml_data.ml_type = "Pet Plaque";
            ml_data.ml_style = "Laser Etched Black Granite";
            break;
          case 31:
            ml_data.ml_type = "Plaque";
            ml_data.ml_style = "Stainless Steel";
            break;
          case 22:
            ml_data.ml_type = "Mini Headstone";
            ml_data.ml_style = "Laser Etched Black Granite";
            break;  
          case 4:
            ml_data.ml_type = "Headstone";
            ml_data.ml_style = "Laser Etched Black Granite";
            break;  
          case 2350:
            ml_data.ml_type = "Urn";
            ml_data.ml_style = "Stainless Steel";
            break;
        }
        
        console.log(dpr, design_dpr);
        console.log(Number((dpr / design_dpr).toFixed(2)));

        ref.setScale(Number((dpr / design_dpr).toFixed(2)));

        if ($("#mainTitle")) {
          $("#mainTitle").innerHTML = design_name + ' - ' + item.navigator + ', devicePixelRatio: ' + item.dpr;
        }
      
        break;

      case "Inscription":
          cp = convertPosition({x: item.x, y: item.y});

          let tags = item.label.replaceAll("&apos;", "'").split(" ");
          for (let nr = 0; nr < tags.length; nr++) {
            tagsCloud.push(tags[nr]);
          }

          output.push({
            type: "inscription",
            id: "item_" + item.itemID,
            text: item.label.replaceAll("&apos;", "'"),
            fontFamily: item.font_family,
            size: convertSize(Number(item.font_size)),
            x:  x + (cp.x),
            y:  y + (cp.y),
            set: true
          })
          break;

      case "Motif":
          cp = convertPosition({x: item.x, y: item.y});
          let r = Number(item.height) / getItemInfo(item.src).height;

          let motifCategories = [];

          motifs.forEach(motif => {
            let files = motif.files.split(",");
            for (let nr = 0; nr < files.length; nr++) {
              if (item.src == files[nr]) {
                motifCategories.push(motif.name)
              }
            }
          });
          ml_data.ml_motif = mode(motifCategories);
          if (ml_data.ml_motif == undefined) {
            ml_data.ml_motif = "Religious";
          }
          
          if (generateData == false) {
            output.push({
              type: "motif",
              id: "item_" + item.itemID,
              flipX: Number(item.flipx),
              flipY: Number(item.flipy),
              rotation: Number(item.rotation),
              width: convertSize(Number(getItemInfo(item.src).width) * r),
              height: convertSize(Number(item.height)),
              url: path + "design/html5/data/svg/motifs/" + item.src + ".svg",
              x:  x + (cp.x),
              y:  y + (cp.y),
              set: true
            })
          }
          break;

      case "Photo":
        cp = convertPosition({x: item.x, y: item.y});
        let width = convertSize(Number(item.width));
        let height = convertSize(Number(item.height));
        let size = convertSize(Number(item.size));

        if (generateData == false) {
          if (isNaN(width) && isNaN(height)) {
            if (item.size) {
              let o = item.size.replace(" mm", "").split(" x ");

              if (item.shape_url) {
                if (item.shape_url.indexOf("horizontal") > -1) {
                  width = Number(o[1]);
                  height = Number(o[0]);  
                } else {
                  width = Number(o[0]);
                  height = Number(o[1]);  
                }
              }

              width = convertSize(width);
              height = convertSize(height);
            }
          }
        }

        if (item.path) {
          currentItemPath = item.path;
        } else {
          item.path = currentItemPath;
        }
        
        if (generateData == false) {
          output.push({
              type: "motif",
              id: "item_" + item.itemID,
              width: Number(width),
              height: Number(height),
              flipX: Number(item.flipx),
              flipY: Number(item.flipy),
              rotation: Number(item.rotation),
              url: path + "design/" + item.path.replace("../","/")  + item.item,
              x:  x + (cp.x),
              y:  y + (cp.y),
              set: true
            })
          }
          break;

     }

  });

  ref.setData(output);
  ref.setVisible(false); 
  ref.setVisibleCanvas(true); 
  
  if (ml_data) {
    setTimeout(() => {
      assignData();
    }, 250);
  }

}

function assignData() {

  if ($("#editFontFamily")) {
    $("#editFontFamily").style = "display:none";
  }
  if ($("#editInscription")) {
    $("#editInscription").style = "display:none";
  }

  // set from json
  if (ml_data.ml_tags) {
    getTRef().tags.value = ml_data.ml_tags;
    getTRef().tags.focus();  
  }
  if (ml_data.ml_language) {
    getRef().languages(ml_data.ml_language);
  }
  if (ml_data.ml_style) {
    getRef().styles(ml_data.ml_style);
  }
  if (ml_data.ml_type) {
    getRef().types(ml_data.ml_type);
  }
  if (ml_data.ml_motif) {
    getRef().motifs(ml_data.ml_motif);
  }
  if (ml_data.ml_tags) {
    getTRef().tags.value = ml_data.ml_tags;
  }

  setTimeout(() => {
    updateData();
  }, 250);

}

function updateData() {

  if (getTRef().tags) {
      getTRef().tags.value = tagsCloud.join(" ");
      getTRef().tags.focus();  
  }

  // Machine Learning Save Design Copy
  const ml = {};

  setCallback(updateData);

  if (getRef().languages) {
    ml.language = getRefObj().languages.value;
  }
  if (getRef().styles) {
    ml.style = getRefObj().styles.value;
  }
  if (getRef().types) {
    ml.type = getRefObj().types.value;
  }
  if (getRef().motifs) {
    ml.motif = getRefObj().motifs.value;
  }
  if (getTRef().tags) {
    ml.tags = getTRef().tags.value;
  }

  saveData({ ml: ml, ml_json: JSON.stringify(ml, null, 2) });

}

export async function saveData(props) {

  let formData = new FormData();
  formData.append('domain', window.location.hostname);
  formData.append('design_stampid', design_stampid);
  formData.append('design_name', design_name);
  formData.append('design_price', currentDesign.price);
  formData.append('design_productid', currentDesign.productid);
  formData.append('design_orientation', currentDesign.orientation);
  formData.append('design_texture', currentDesign.texture);
  formData.append('design_shape', currentDesign.shape);
  formData.append('design_width', currentDesign.width);
  formData.append('design_height', currentDesign.height);
  formData.append('preview', designPreview);
  formData.append('product_name', currentDesign.name);
  formData.append('design_data', props.design_data);
  formData.append('ml_language', props.ml.language);
  formData.append('ml_style', props.ml.style);
  formData.append('ml_type', props.ml.type);
  formData.append('ml_motif', props.ml.motif);
  formData.append('ml_tags', props.ml.tags);
  formData.append('ml_json', props.ml.ml_json);

  fetch(path + "design/includes-dyo5/save_data.php", {
      method: 'POST',
      body: formData
  })
  .then(response => response.text())
  .then(data => { 
    console.log("[ml] saved data: " + data);
  });

  if (generateData == false) {
    hideLoader();
  }

  designLoading = false;
  
}