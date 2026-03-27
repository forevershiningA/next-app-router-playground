import { useRef, useEffect } from 'react';
import { getPath } from './path.js';

const path = getPath();
//const religious = '1_016_05,1_016_22,1_165_08,1_167_04,1_168_12,1_168_13,1_169_04,1_169_08,1_169_20,1_175_07,1_177_12,1_179_21,1_184_03,1_184_04,1_184_05,1_184_07,1_184_13,1_184_14,1_184_18,1_184_19,1_184_20,1_184_22,1_184_23,1_184_24,1_184_25,2_082_13,2_082_22,2_083_01,2_116_01,2_116_04,2_116_05,2_116_11,2_116_12,2_116_13,2_116_16,2_119_03,2_119_04,2_119_05,2_119_09,2_119_14,2_119_23,2_119_26,2_155_01,2_155_02,2_155_03,2_155_04,2_155_05,2_155_06,2_155_07,2_155_08,2_155_09,2_155_10,2_155_11,2_155_12,2_155_15,2_155_17,2_155_18,2_155_19,2_155_20,2_155_22,2_155_23,2_155_26,2_156_01,angel_001,bronzeangel2,cross91-final,cross_001,cross_002,cross_003,cross_004,cross_005,cross_008,cross_010,cross_013,cross_021,cross_028,cross_029,cross_035,cross_036,cross_052,cross_054';
const religious = 'Butterfly_024,Butterfly_026,Butterfly_009,Butterfly_025,Butterfliy_002,Butterfly_031,1_144_04,Butterfly_004,Butterfly_027,Butterfly_005,Butterfliy_003,Butterfly_008,Butterfly_017,1_144_19,Butterfliy_001,Butterfly_029,Butterfly_028,Butterfly_030';

let motif_nr = 0;

export const getRandomFile = () => {

    let files = religious.split(',');
    let file = files[Math.floor(files.length * Math.random(1))];
    let url = path + 'design/html5/data/svg/motifs/' + file + '.svg';
    return url;
}

export function getRandomMotif(data) {

    motif_nr++;

    let url = getRandomFile();

    let id = "motif_" + motif_nr;
    let x, y, w, h;

    switch (data.type) {
        case "sin":
            x = Number(10) * motif_nr;
            y = Number((window.innerHeight * 0.55) - data.h * Math.sin((data.n * data.w) * Math.PI/180));
            w = Number(32 + 16 * Math.sin((data.n * data.n) * Math.PI/180));
            h = Number(32 + 16 * Math.sin((data.n * data.n) * Math.PI/180));
            console.log(x,y);
            break;
        case "circle":
            w = (data.n * data.n);
            x = Number(data.x - (w * w / 64) * Math.sin(w * Math.PI/180));
            y = Number(data.y - (w * w / 64) * Math.cos(w * Math.PI/180));

            w = Number((w / 32) + (w) * Math.sin(w * Math.PI/180));
            h = Number((w / 32) + (w) * Math.sin(w * Math.PI/180));
            break;    
    }

    //const img = new Image();
    //img.src = url;
    //await img.decode();

    if (data.n == data.total) {
        setTimeout(data.callback, 1);
    }

    return {
      type: "motif",
      id: id,
      nr: data.n,
      url: url,
      size: 50,
      x: x,
      y: y,
      width: w,
      height: h,
      set: false
    };

}