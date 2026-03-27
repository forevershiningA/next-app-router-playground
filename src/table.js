import * as React from 'react';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import { getCachedData } from './data.js';
import { getPath } from './path.js';
import { setLoadDesignCallback, setHandleOpenCallback, setGenerateDataCallback } from './admin.js';
import { setDesignsTotal, setRef, loadDesign, getDesignLoading, setGenerateData } from './design.js';
import { hideLoader, showLoader, setTitle } from './loader.js';

let _setData, _setVisible, _setVisibleCanvas, _setCurrentDesign, _setDesignsTotal;

let currentDesign = {};
let currentDesignId = 0;
let designsTotal = 0;
let handleOpenCallback;
let designId = 0;

const path = getPath();
let designs = await getCachedData(0, 100);

designsTotal = designs[0].design_id;
setDesignsTotal(designsTotal);

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '75%',
  maxHeight: '80%',
  bgcolor: 'background.paper',
  border: '2px solid #333',
  overflowY: 'auto',
  boxShadow: 24,
  p: 4
};

async function fetchData(url) {
  return fetch(url, {
      method: 'GET'
  })
  .then(response => response.text())
  .then(data => { return data });
}

async function getData(name, url, props) {
  document.querySelector("#modal-modal-title").innerHTML = name + ' - ' + props;
  document.querySelector("#modal-modal-description").innerHTML = await fetchData(path + "design/saved-designs/html/" + url + "-desktop.html");
}

const handleLoadDesign = (value) => {
  
  let design;

  for (let nr = 0; nr < designs.length; nr++) {
    if (designs[nr].design_id == value) {
      design = designs[nr];
    }
  }

  loadDesign(design);
}

const beforeHandleOpen = (value) => {

  let design;

  for (let nr = 0; nr < designs.length; nr++) {
    if (designs[nr].design_id == value) {
      design = designs[nr];
    }
  }

  window.open(path + `design/${design.design_preview}`);

}

const generateData = () => {
  let isLoading = getDesignLoading();

  console.log("[generateData]: " + designId + " / " + designs.length + " / " + Boolean(Number(designs[designId].design_retailmultiplier)));

  if (isLoading == false) {
    if (Boolean(Number(designs[designId].design_retailmultiplier))) {
      loadDesign(designs[designId], true);
      designId ++;
    } else {
      designId ++;
    }
  } 

  setTimeout(() => {
    if (designId < (designs.length - 1)) {
      generateData();
    } else {
      hideLoader();
      setGenerateData(false);
    }
  }, 100);
}

export const DataTable = ({ 
    visible, setVisible, 
    visibleCanvas, setVisibleCanvas, 
    setData,
    scale, setScale, 
    setCurrentDesign, setDesignsTotal
  }) => {

  setRef({
    setData: setData,
    setScale: setScale,
    setVisible: setVisible,
    setVisibleCanvas: setVisibleCanvas,
    setCurrentDesign: setCurrentDesign,
    setDesignsTotal: setDesignsTotal
  });

  _setData = setData;
  _setVisible = setVisible;
  _setVisibleCanvas = setVisibleCanvas;
  _setCurrentDesign = setCurrentDesign;
  _setDesignsTotal = setDesignsTotal;

  let checkList = [];

  designs.map((design) => (
    checkList.push(Boolean(Number(design.design_retailmultiplier)))
  ))

  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [checked, setChecked] = React.useState(
    checkList
  );

  const handleOpen = (name, url, props) => {

    setOpen(true);
    setTimeout(function() {

      switch (name) {
        default:
          document.getElementById("modal-modal-title").innerHTML = name;
          document.getElementById("modal-modal-description").innerHTML = url;
          break;
        case "Quote":
          getData(name, url, props);
          break;
        case "Photo":
          document.getElementById("modal-modal-title").innerHTML = name;
          document.getElementById("modal-modal-description").innerHTML = "";
          let img = new Image();
          img.src = url;
          img.style.width = "50%";
          img.style.marginLeft = "25%";
          img.style.cursor = 'pointer';
          document.getElementById("modal-modal-description").appendChild(img);
          img.addEventListener("click", openImage, false);
          img.url = url;
          break;
      }

    }, 10);
  }

  setLoadDesignCallback(handleLoadDesign);
  setHandleOpenCallback(beforeHandleOpen);
  setGenerateDataCallback(generateData);
  handleOpenCallback = handleOpen;

  function openImage(e) {
    window.open(e.currentTarget.url);
  }

  const handleClose = () => {
    setOpen(false);
  }

  const handleChange = (index) => {

    //console.log(designs[index].design_stampid);
    let value = false;

    const nextChecked = checked.map((c, i) => {
      if (i === index) {
        return !c;
      } else {
        return c;
      }
    });

    setChecked(nextChecked);

    let formData = new FormData();
    formData.append('id', designs[index].design_stampid);
    formData.append('checked', Number(!checked[index]));
  
    fetch(path + "design/includes-dyo5/set_data.php", {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => { 
      //console.log("[tf] data set: " + data);
    });

  };

  //console.log(designs);

  async function loadDesignsData(start, limit) {

    showLoader();
    setOpen(true);
    designs = await getCachedData(start, limit);
    //console.log(designs);
    setTimeout(() => {
      setOpen(false);
      hideLoader();

      document.getElementById("page1").style.color = "grey";
      document.getElementById("page2").style.color = "grey";
      document.getElementById("page3").style.color = "grey";
      document.getElementById("page4").style.color = "grey";
      document.getElementById("page5").style.color = "grey";
      
      switch (start) {
        case 0:
          if (limit == 1000) {
            document.getElementById("page1").style.color = "white";
          } else {
            document.getElementById("page_all").style.color = "white";
          }
          break;
        case 1000:
          document.getElementById("page2").style.color = "white";
          break;
        case 2000:
          document.getElementById("page3").style.color = "white";
          break;
        case 3000:
          document.getElementById("page4").style.color = "white";
          break;
        case 4000:
          document.getElementById("page5").style.color = "white";
          break;
        case 5000:
          document.getElementById("page6").style.color = "white";
          break;
        case 6000:
          document.getElementById("page7").style.color = "white";
          break;
        case 7000:
          document.getElementById("page8").style.color = "white";
          break;
          }
  
    }, 500);
  }

  if (visible) {
    return (
      <>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Design name<br/>
              <span id="page1" style={{ color: "grey", cursor: "pointer" }} onClick={() => { loadDesignsData(0, 1000) }}> [Page 1]</span>
              <span id="page2" style={{ color: "grey", cursor: "pointer" }} onClick={() => { loadDesignsData(1000, 1000) }}> [ 2 ]</span>
              <span id="page3" style={{ color: "grey", cursor: "pointer" }} onClick={() => { loadDesignsData(2000, 1000) }}> [ 3 ]</span>
              <span id="page4" style={{ color: "grey", cursor: "pointer" }} onClick={() => { loadDesignsData(3000, 1000) }}> [ 4 ]</span>
              <span id="page5" style={{ color: "grey", cursor: "pointer" }} onClick={() => { loadDesignsData(4000, 1000) }}> [ 5 ]</span>
              <span id="page6" style={{ color: "grey", cursor: "pointer" }} onClick={() => { loadDesignsData(5000, 1000) }}> [ 6 ]</span>
              <span id="page7" style={{ color: "grey", cursor: "pointer" }} onClick={() => { loadDesignsData(6000, 1000) }}> [ 7 ]</span>
              <span id="page8" style={{ color: "grey", cursor: "pointer" }} onClick={() => { loadDesignsData(7000, 1000) }}> [ 8 ]</span>
              <span id="page_all" style={{ color: "grey", cursor: "pointer" }} onClick={() => { loadDesignsData(0, 10000) }}> [ ALL ]</span>
              </TableCell>
              <TableCell align="right">No</TableCell>
              <TableCell align="right">Date</TableCell>
              <TableCell align="right">Photo</TableCell>
              <TableCell align="right">Price</TableCell>
              <TableCell align="right">Edit</TableCell>
              <TableCell align="right">Quote</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {designs.map((design, i) => (
              <TableRow
                key={design.design_id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {design.design_name}
                </TableCell>
                <TableCell align="right">
                  <FormControlLabel
                    label={design.design_id}
                    control={<Checkbox id={"cb" + i} checked={checked[i]} onChange={() => {
                      handleChange(i);
                    }} />}
                  />
                  
                </TableCell>
                <TableCell align="right">{design.design_user_date}</TableCell>
                <TableCell align="right">
                  <img 
                    onClick={() => handleOpen("Photo", path + `design/${design.design_preview}`)}
                    src={path + `design/${design.design_preview.replace(".jpg","_small.jpg")}`} 
                    style={{cursor: 'pointer'}}
                    width="128px"
                  >
                  </img>
                </TableCell>
                <TableCell align="right">
                  ${design.design_data}
                </TableCell>
                <TableCell align="right">
                  <Button 
                  onClick={(e) => {
                    currentDesignId = design.design_stampid;
                    _setCurrentDesign(design.design_id);
                    _setDesignsTotal(designsTotal);
                  
                    e.preventDefault();
                    loadDesign(design);
                    }}
                    >
                    Edit
                  </Button>
                </TableCell>
                <TableCell align="right">
                  <Button 
                    onClick={() => {
                      handleOpen("Quote", design.design_stampid, design.design_name);
                    }}
                    >
                      Show
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
          </Typography>
          <Typography id="modal-modal-description" sx={{ mt: 2 }}>
          </Typography>
        </Box>
      </Modal>
      </>
    );
  }
}