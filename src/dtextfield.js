import React, { Component, useState, useRef } from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { getCurrentTarget, setCurrentTarget } from './target.js';

let ref = new Array();
let selector;

export function getTRef() {
    return ref;
}

export function DTextField({props}) {  

    const [data, setData] = React.useState(props.data[0].name);
    const selectorId = "select-" + props.selector;
    const selectorLabel = "select-" + props.selector + "-label";
    const selectorName = props.title;
    selector = props.selector;
  
    const handleChange = (event) => {
      setData(event.target.value);
    };
  
    const setChange = (value) => {
      setData(value);
    }
  
    let defaultValue = "";
    if (props.selector == "tags") {
      defaultValue = "abc";
    }

    return (

        <TextField 
        inputRef={node => {
          ref[props.selector] = node;
        }}
        id={selectorId}
        label={selectorName} 
        variant="standard" 
        multiline
        defaultValue={defaultValue}
        inputProps={{
          onBlur: (e) => {
            if (props.selector == "inscription") {
              e.target.value = '';
            }
          },
          onFocus: (e) => {
            //e.target.value = '';
          },
          onKeyUp: (e) => {
            if (props.selector == "inscription") {
              try {
                getCurrentTarget().setText(e.target.value);
              }
              catch (e) {
                console.log(e);
              }
            }
          }
    
        }}
        />
        
    );  

  }