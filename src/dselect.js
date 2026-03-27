import React, { Component, useState, useRef } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { getCurrentTarget, setCurrentTarget } from './target.js';

let ref = new Array();
let refObj = new Array();
let selector;
let callback;

export function getRef() {
    return ref;
}

export function getRefObj() {
  return refObj;
}

export function setCallback(f) {
  callback = f;
}

export function DSelect({props}) {  

    const [data, setData] = React.useState(props.data[0].name);
    const selectorId = "select-" + props.id + "-" + props.selector;
    const selectorLabel = "select-" + props.selector + "-label";
    const selectorName = props.title;
    selector = props.selector;
  
    const handleChange = (event) => {
      setData(event.target.value);
      switch (props.selector) {
        case "fonts":
          if (getCurrentTarget()) {
            if (getCurrentTarget().getText) {
              getCurrentTarget().setFontFamily(event.target.value)
            }
          }
          break;
      }

      setTimeout(() => {
        if (callback) {
          callback();
        }  
      }, 50);

    };
  
    const setChange = (value) => {
      setData(value);

      switch (props.selector) {
        case "fonts":
          getCurrentTarget().setFontFamily(value)
      }
    }

    ref[selector] = setChange;
  
    return (
      <FormControl sx={{ m: 1, minWidth: 210 }} size="small">
        <InputLabel id={selectorLabel}>{selectorName}</InputLabel>
        <Select
          inputRef={node => {
            refObj[props.selector] = node;
          }}
          labelId={selectorLabel}
          id={selectorId}
          value={data}
          label={selectorName}
          onChange={handleChange}
          defaultValue={data}
        >
        {props.data.map(({name, type}, index) => (
          <MenuItem key={index} value={name}>
            {name}
          </MenuItem>
        ))}
        </Select>
      </FormControl>
    );

  }