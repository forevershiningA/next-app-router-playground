import * as React from 'react';
import Modal from '@mui/material/Modal';
import { styled, alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import MuiDrawer from '@mui/material/Drawer';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Badge from '@mui/material/Badge';
import MuiAppBar from '@mui/material/AppBar';
import Divider from '@mui/material/Divider';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import NotificationsIcon from '@mui/icons-material/Notifications';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import PolylineIcon from '@mui/icons-material/Polyline';
import ImageIcon from '@mui/icons-material/Image';
import { SecondaryListItems } from './listItems';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SchoolIcon from '@mui/icons-material/School';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import DynamicFeedIcon from '@mui/icons-material/DynamicFeed';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { DataTable } from './table.js'
import { Canvas } from './canvas.js'
import { Three } from './three.js'
import { run, load } from './tensor.js';
import { getPath } from './path.js';
import { $, getRandom } from './data.js';
import { TitlebarImageList } from './TitlebarImageList.js';
import { types, styles, motifs, fonts } from './data.js';
import { DSelect } from './dselect.js';
import { DTextField } from './dtextfield.js';
import ListSubheader from '@mui/material/ListSubheader';
import { getRef, getRefObj, setCallback } from './dselect.js';
import { getTRef } from './dtextfield.js';
import { updateParams, generateFiles } from './tensor.js';
import { showLoader } from './loader';

const path = getPath();

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const drawerWidth = 240;
  
const AppBar = styled(MuiAppBar, {
    shouldForwardProp: (prop) => prop !== 'open',
   })(({ theme, open }) => ({
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    ...(open && {
      marginLeft: drawerWidth,
      width: `calc(100% - ${drawerWidth}px)`,
      transition: theme.transitions.create(['width', 'margin'], {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
    }),
}));
  
const Drawer = styled(MuiDrawer, { shouldForwardProp: (prop) => prop !== 'open' }) (
  ({ theme, open }) => ({
    '& .MuiDrawer-paper': {
      position: 'relative',
      whiteSpace: 'nowrap',
      width: drawerWidth,
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.sharp,
        duration: theme.transitions.duration.enteringScreen,
      }),
      boxSizing: 'border-box',
      ...(!open && {
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
          width: theme.spacing(9),
        },
      }),
    },
  }),
);
  
const defaultTheme = createTheme();

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '75%',
  maxHeight: '90%',
  bgcolor: 'background.paper',
  border: '2px solid #333',
  overflowY: 'auto',
  boxShadow: 24,
  p: 4
};

const selectData = [
  { id: "model", data: types, selector: "types", title: "Type" },
  { id: "model", data: styles, selector: "styles", title: "Style" },
  { id: "model", data: motifs, selector: "motifs", title: "Motif" }
]

let callback, callbackHandleOpen, callBackGenerateData, _setOpenModal, _setDataTF;

export function setLoadDesignCallback(f) {
  callback = f;
}

export function setHandleOpenCallback(f) {
  callbackHandleOpen = f;
}

export function setGenerateDataCallback(f) {
  callBackGenerateData = f;
}

export const updateData = (data, generate = false, filename = "") => {
  if (generate == false) {
    _setDataTF(data);
  } else {
    //setTimeout(() => {
      saveResults(filename, data);
    //}, 1000);
  }
}

const saveResults = (filename, data) => {
  //console.log(JSON.stringify(data));
  console.log(filename);

  let formData = new FormData();
  formData.append('data', JSON.stringify(data, null, 2));
  formData.append('filename', filename);

  fetch(path + "design/includes-dyo5/save_json.php", {
      method: 'POST',
      body: formData
  })
  .then(response => response.text())
  .then(data => { 
    console.log("[tf] saved json: " + data);
    generateFiles();
  });

}

export const Admin = ( userData ) => {

    const [data, setData] = React.useState(userData.data);
    const [dataTF, setDataTF] = React.useState(true);
    const [open, setOpen] = React.useState(true);
    const [openModal, setOpenModal] = React.useState(false);
    const [visible, setVisible] = React.useState(true);
    const [visibleCanvas, setVisibleCanvas] = React.useState(false);
    const [scale, setScale] = React.useState(1);
    const [currentDesignNo, setCurrentDesign] = React.useState(1);
    const [designsTotal, setDesignsTotal] = React.useState(1);
    
    _setOpenModal = setOpenModal;
    _setDataTF = setDataTF;

    setCallback(updateParams);

    const toggleDrawer = () => {
      setOpen(!open);
    };

    const handleClose = () => {
      setOpenModal(false);
    }  
  
    return (
      <ThemeProvider theme={darkTheme}>
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          
          <AppBar position="absolute" open={open}>
            <Toolbar
              sx={{
                pr: '24px', // keep right padding when drawer closed
                position: 'sticky'
              }}
            >
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={toggleDrawer}
              sx={{
                marginRight: '36px',
                ...(open && { display: 'none' }),
              }}
            >
            <MenuIcon />
            </IconButton>
            <Typography
                id="mainTitle"
                component="h1"
                variant="h6"
                color="inherit"
                noWrap
                sx={{ flexGrow: 1 }}
              >
                Dashboard
            </Typography>

            <Box id="designControl" sx={{ display: 'none' }}>

              <IconButton id="prevDesign" color="inherit" onClick={(event) => {
                let value = currentDesignNo;
                value--;
                setCurrentDesign(value);
                callback(value);
              }}>

                <Badge color="secondary">
                  <ChevronLeftIcon />
                </Badge>

              </IconButton>

              <Typography
                  id="designId" 
                  component="h6" 
                  variant="h6" 
                  color="inherit"
                  style={{ lineHeight: "2.2em" }}
                >
                  {currentDesignNo}
              </Typography>

              <IconButton id="nextDesign" color="inherit" onClick={(event) => {
                let value = currentDesignNo;
                value++;
                setCurrentDesign(value);
                callback(value);
              }}>
            
                <Badge color="secondary">
                  <ChevronRightIcon />
                </Badge>

              </IconButton>

              </Box>

              <Box id="showImage" sx={{ display: 'none' }}>

                <IconButton color="inherit" onClick={(event) => {
                  callbackHandleOpen(currentDesignNo);
                }}>
                  <ImageIcon />
                </IconButton>

              </Box>

              <IconButton color="inherit" onClick={(event) => {
                callBackGenerateData();
              }}>

                <Badge badgeContent={0} color="secondary">
                  <DynamicFeedIcon />
                </Badge>
              </IconButton>

            </Toolbar>
          </AppBar>

          <Drawer variant="permanent" open={open}>
            
            <Toolbar
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'flex-end',
                px: [1],
              }}
            >
              <IconButton onClick={toggleDrawer}>
                <ChevronLeftIcon />
              </IconButton>
            </Toolbar>

            <Divider />
            
            <List component="nav">
                          
              <ListItemButton
                onClick={(event) => {
                  if ($("#designControl")) {
                    $("#designControl").style = "display:none";
                  }
                  if ($("#showImage")) {
                    $("#showImage").style = "display:none";
                  }
                  if ($("#mainTitle")) {
                    $("#mainTitle").innerHTML = "Dashboard";
                  }
                  if ($("#showImage")) {
                    $("#showImage").style = "display:none";
                  }                
                  setVisible(true);
                  setVisibleCanvas(false);
                }}
                >
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItemButton>
             
              <ListItemButton
                onClick={(event) => {
                  setData(getRandom());
                  setVisible(false);
                  setVisibleCanvas(true);
                }}
                >
                <ListItemIcon>
                  <PolylineIcon />
                </ListItemIcon>
                <ListItemText primary="Generate" />
              </ListItemButton>

              <ListItemButton
                onClick={(event) => {
                  run();
                }}
                >
                <ListItemIcon>
                  <SchoolIcon />
                </ListItemIcon>
                <ListItemText primary="Machine Learning" />
              </ListItemButton>

              <ListItemButton
                onClick={(event) => {
                  _setOpenModal(true);
                  load();
                }}
                >
                <ListItemIcon>
                  <UploadFileIcon />
                </ListItemIcon>
                <ListItemText primary="Load Model" />
              </ListItemButton>
              
              <Divider sx={{ my: 1 }} />

              <SecondaryListItems 
                  visibleCanvas={visibleCanvas}
              />
            </List>
          </Drawer>

          <Box
              component="main"
              sx={{
                backgroundColor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? theme.palette.grey[100]
                    : theme.palette.grey[900],
                flexGrow: 1,
                height: '92.5vh',
                overflow: 'auto',
                marginTop: '68px'
              }}
            >
            <Canvas 
              data={data} 
              setData={setData} 
              scale={scale}
              setScale={setScale} 
              visibleCanvas={visibleCanvas} 
              setVisibleCanvas={setVisibleCanvas} 
            />
            <DataTable 
              visible={visible}
              setVisible={setVisible}
              visibleCanvas={visibleCanvas}
              setVisibleCanvas={setVisibleCanvas}
              setData={setData}
              scale={scale}
              setScale={setScale}  
              setCurrentDesign={setCurrentDesign} 
              setDesignsTotal={setDesignsTotal} 
            />
          </Box>
        </Box>
        <Modal
          open={openModal}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>

            {selectData.map(({data, selector, title}, index) => (
              <Box
                component="div"
                sx={{ display: 'inline-table',
                  '& > :not(style)': { m: 1, width: '22ch' },
                }}
                noValidate
                autoComplete="off"
                key={index}
                >
                <DSelect props={{ id: "model", data: data, selector: selector, title: title }} />
              </Box>
            ))}

            <Box component="div" sx={{ m: 1, width: '22ch' }}>
              <Button variant="contained" onClick={() => {
                //_setOpenModal(false);
                showLoader();
                generateFiles();
              }}>Generate files</Button>
            </Box>

            <ListSubheader component="div">
              Designs
            </ListSubheader>

            <TitlebarImageList dataTF={dataTF} />
          </Box>
        </Modal>

      </ThemeProvider>
    );

};

/*
<Three />
*/