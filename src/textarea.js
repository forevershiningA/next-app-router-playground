import { useRef, useEffect } from 'react';

export const getTextArea = (data) => {
    var textarea = document.createElement('textarea');
    document.body.appendChild(textarea);
    
    textarea.id = "textarea";
    textarea.style.position = 'absolute';
    textarea.style.top = '50px';
    textarea.style.left = '5%';
    textarea.style.width = '90%';
    textarea.style.height = '75px';
    textarea.style.fontSize = '28px';
    textarea.style.border = '1px solid #72ccc9';
    textarea.style.overflow = 'hidden';
    textarea.style.background = 'none';
    textarea.style.outline = 'none';
    textarea.style.resize = 'none';
    textarea.style.lineHeight = '1em';
    textarea.style.fontFamily = 'Lato';
    textarea.style.transformOrigin = 'left top';
    textarea.style.textAlign = 'center';

    return document.getElementById(data.id);
 }