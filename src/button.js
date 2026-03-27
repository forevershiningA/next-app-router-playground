import { useRef, useEffect } from 'react';

export const getButton = (data) => {
    var button = document.createElement(data.id);
    document.body.append(button);
  
    button.id = data.id;
    button.style.position = 'absolute';
    button.style.top = '140px';
    if (data.left) {
      button.style.left = data.left;
    }
    if (data.right) {
      button.style.right = data.right;
    }
    button.style.width = '150px';
    button.style.height = '25px';
    button.style.fontSize = '18px';
    button.style.border = '1px solid #72ccc9';
    button.style.padding = '15px 0px 10px 0px';
    button.style.cursor = 'pointer';
    button.style.lineHeight = '1em';
    button.style.fontFamily = 'Lato';
    button.style.textAlign = 'center';
    document.getElementById(data.id).innerHTML = data.value;
  
    return document.getElementById(data.id);
  }