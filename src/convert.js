import { useRef, useEffect } from 'react';

let dpr, design_dpr, device, navigator;

export const setDpr = (v) => {
    dpr = v;
}

export const setDesignDpr = (v) => {
    design_dpr = v;
}

export const setDevice = (v) => {
  if (v) {
    device = v.toLowerCase();
  } else {
    device = "Desktop";
  }
}

export const setNavigator = (v) => {
  if (v) {
    navigator = v.toLowerCase();
  } else {
    navigator = "Unknown";
  }
}

export const convertPosition = (originalPosition) => {
    let scaleFactor = (design_dpr / dpr) * 0.75;
  
    //if (navigator.indexOf("desktop") > -1 || device == "desktop") {
    //  scaleFactor = 1;
    //}
    
    const convertedPosition = {
        x: (originalPosition.x * scaleFactor),
        y: (originalPosition.y * scaleFactor),
        s: scaleFactor
    };

    return convertedPosition;
  }
  
  export const convertSize = (originalSize) => {

    let multiply = 1;
    if (navigator.indexOf("safari") > -1) {
      //multiply = 2;
    }

    const physicalSize = originalSize * design_dpr * multiply;
    let convertedSize = physicalSize / dpr;
  
    //if (navigator.indexOf("desktop") > -1 || device == "desktop") {
      //convertedSize = originalSize;
    //}
  
    return convertedSize;
  }