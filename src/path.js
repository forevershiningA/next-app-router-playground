import { useRef, useEffect } from 'react';

export const getPath = () => {

    let path = "";
    
    if (document.location.href.indexOf("127.0.0.1") > -1 || 
        document.location.href.indexOf("localhost") > -1 || 
        document.location.href.indexOf("bs-local.com") > -1) {
        
        path = "http://localhost/";
        path = "https://www.forevershining.com.au/";
        //path = 'https://www.headstonesandplaques-papuanewguinea.com/';
        //path = 'https://headstonesdesigner.com/';
        //path = 'https://www.bronze-plaque.com/';
        //path = "https://www.wiecznapamiec.pl/";
    } else {
        if (document.location.href.indexOf("https") > -1) {
            path = "https://" + window.location.hostname + "/";
        } else {
            path = "http://" + window.location.hostname + "/";
        }
    }
    
    return path;
  
  }
