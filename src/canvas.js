import React, { Component, useState, useRef } from 'react';
import Box from '@mui/material/Box';
import { Stage, Layer, Image, Text, Transformer } from 'react-konva';
import { Item, update, getCurrentTarget } from './item.js';
import { $, getRandom } from './data.js';
import { getPath } from './path.js';

const id = [];
const data = [];
const path = getPath();
const mute = true;

let person = Math.floor(2 * Math.random(1));
let stage, title, title_m, title_f, name, name_m, name_f, surnames, inscriptions, isSelected;
var design_items = [];
let inited = false;
let state = "init";

export const select = () => {
  design_items[Math.floor(design_items.length * Math.random(1))].ref.current.fire('click');
}

export const Canvas = ({data, setData, visibleCanvas, setVisibleCanvas, scale, setScale}) => {

  const [selectedId, selectShape] = React.useState(null);

  const stageEl = React.useRef();
  const url = path + 'design/html5/rf.php?directory=/design/html5/data/xml/';

  React.useEffect(() => {
    stage = stageEl;

    setTimeout(function() {
      //stage.current.destroyChildren();

      if (state == "init") {
        if (stage.current) {
          let layer = stage.current.getChildren();
          let childrens = layer[0].children;
          state = "edit";

          childrens.forEach(child => {
            if (child.attrs.type == "inscription") {
                let measure = child.measureSize(child.attrs.text);
                child.x(child.x() - (measure.width / 2) + 120);
            }
            if (child.attrs.type == "motif") {
              //console.log(child);
              //child.x(child.x() - (child.width() / 2) + 120);
            }
          });
        }
      }

    }, 10);
  });

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    //console.log(stageEl);
    //stageEl.current.hide();
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }

    if ($("#editFontFamily")) {
      $("#editFontFamily").style = "display:none";
    }
    if ($("#editInscription")) {
      $("#editInscription").style = "display:none";
    }

  };

  if (!visibleCanvas) {
    state = "init";
  }

  let width = window.innerWidth - 240;
  let height = window.innerHeight - 75;

  let layerX = 0;//width / 2;
  let layerY = 0;//height / 2;

  let log = "[canvas] layerX: " + layerX + " | " + "layerY: " + layerY;
  if (!mute) {
    console.log(log);
    log = "[canvas] scale: " + scale;
    console.log(log);
  }

  if (visibleCanvas) {
    if (stage) {
    //  
    }
    return (
      <>
      <Stage 
        ref={stageEl}
        width={width}
        height={height}
        onMouseDown={checkDeselect}
        onTouchStart={checkDeselect}
      >
      <Layer x={layerX} y={layerY} scaleX={scale} scaleY={scale}
>
          {data.map((dat, i) => {
            return (
              <Item
                key={i}
                type={dat.type}
                size={dat.size}
                width={dat.width}
                height={dat.height}
                rotation={dat.rotation} 
                url={dat.url}
                shapeProps={dat}
                fontfamily={dat.fontfamily}
                design_items={design_items}
                dataSet={data}
                state={state}
                inited={inited}
                isSelected={dat.id === selectedId}
                onSelect={(e) => {
                  update(e);
                  selectShape(dat.id);
                }}
                onChange={(newAttrs) => {
                  const _d = data.slice();
                  _d[i] = newAttrs;
                  setData(_d);
                }}
              />
            );
          })}
        </Layer>
      </Stage>
      </>
    );
  }
  
};