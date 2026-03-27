import { useRef, useEffect } from 'react';
import { fonts } from './data.js';

let inscription_nr = 0;

export const getRandomInscriptionLine = (o) => {

    if (o.arr == null) {
      return "";
    }
  
    let text = o.arr[Math.floor(o.arr.length * Math.random(1))];
  
    if (o.arr2) {
      text += " " + o.arr2[Math.floor(o.arr2.length * Math.random(1))];
    }
  
    return text;
  
  }
  
  export const getRandomInscription = (o) => {

    if (o.inscription_nr == 1) {
      inscription_nr = 0;
    }
  
    let text = getRandomInscriptionLine(o);
    let size = o.size;
  
    inscription_nr ++;
  
    if (o.spaceY == null) {
      o.spaceY = 0;
    }
  
    let x = window.innerWidth / 2, 
        y = o.spaceY + (50 * inscription_nr),
        id = "inscription_" + inscription_nr;
  
    if (document.getElementById("textarea")) {
      document.getElementById("textarea").value = text;
    }
  
    return { 
      type: "inscription",
      sub_type: o.sub_type,
      id: id,
      fontfamily: fonts[Math.floor(fonts.length * Math.random(1))].name,
      text: text,
      size: size,
      x: x,
      y: y,
      set: false
    }
  
  }