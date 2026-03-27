import * as React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import { $ } from './data.js';

const loader = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    width: '100%',
    height: '100%',
    maxHeight: '100%',
    bgcolor: 'rgba(0,0,0,0.5)',
    overflowY: 'auto',
    boxShadow: 24,
    p: 4,
    justifyContent: "center",
    alignItems: "center"
};

const loaderTitle = {
  position: 'absolute',
  top: '55%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  width: '100%',
  height: '100%',
  maxHeight: '100%',
  bgcolor: 'rgba(0,0,0,0.5)',
  overflowY: 'auto',
  boxShadow: 24,
  p: 4,
  justifyContent: "center",
  alignItems: "center"
};

let _setOpen;

export const Loader = () => {

    const [open, setOpen] = React.useState(false);
    _setOpen = setOpen;

    return (
      <>
        <Modal open={open}>
          <Box id="loader"sx={loader}>
            <CircularProgress id="loaderIcon" />
            <Typography id="loaderTitle" component="h6" variant="h6" sx={loaderTitle}>
            </Typography>
          </Box>
        </Modal>        
      </>
    );
  
}

export const setTitle = (value) => {
  //console.log(value);
  if ($("#loaderTitle")) {
    $("#loaderTitle").innerHTML = value;
  }
}

export const showLoader = () => {
  _setOpen(true);
}

export const hideLoader = () => {
  _setOpen(false);
}