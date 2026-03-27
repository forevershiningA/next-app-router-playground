import * as React from 'react';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import Box from '@mui/material/Box';
import { DSelect } from './dselect.js';
import { DTextField } from './dtextfield.js';
import { types, languages, fonts, styles, motifs } from './data.js';

export const mainListItems = (
  <React.Fragment>
    
    <ListItemButton
      onClick={(event) => {
        console.log("@dashboard")
      }}
    >
      <ListItemIcon>
        <DashboardIcon />
      </ListItemIcon>
      <ListItemText primary="Dashboard" />
    </ListItemButton>

    <ListItemButton
      onClick={(event) => {
        console.log("@orders")
      }}
    >
      <ListItemIcon>
        <ShoppingCartIcon />
      </ListItemIcon>
      <ListItemText primary="Orders" />
    </ListItemButton>

    <ListItemButton>
      <ListItemIcon>
        <PeopleIcon />
      </ListItemIcon>
      <ListItemText primary="Customers" />
    </ListItemButton>

    <ListItemButton>
      <ListItemIcon>
        <BarChartIcon />
      </ListItemIcon>
      <ListItemText primary="Reports" />
    </ListItemButton>

    <ListItemButton>
      <ListItemIcon>
        <LayersIcon />
      </ListItemIcon>
      <ListItemText primary="Integrations" />
    </ListItemButton>

  </React.Fragment>
);

let showFontFamily = true;

const selectData = [
  { data: languages, selector: "languages", title: "Language" },
  { id: "ml", data: types, selector: "types", title: "Type" },
  { id: "ml", data: styles, selector: "styles", title: "Style" },
  { id: "ml", data: motifs, selector: "motifs", title: "Motif" }
]

export const SecondaryListItems = ({ visibleCanvas }) => {

  if (visibleCanvas) {
    return (
      <>
      <Box
        component="div" 
        id="editInscription" 
        sx={{
          '& > :not(style)': { m: 2, width: '22ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <DTextField props={{ data: fonts, selector: "inscription", title: "Edit Inscription" }} />
      </Box>

      <Box
          component="div"
          id="editFontFamily" 
          sx={{
            '& > :not(style)': { m: 2, width: '22ch' },
          }}
          noValidate
          autoComplete="off"
          >
          <DSelect props={{ data: fonts, selector: "fonts", title: "Font Family" }} />
      </Box>
      
      <ListSubheader component="div">
        Data
      </ListSubheader>
      
      {selectData.map(({data, selector, title}, index) => (
        <Box
          component="form"
          sx={{
            '& > :not(style)': { m: 2, width: '22ch' },
          }}
          noValidate
          autoComplete="off"
          key={index}
          >
          <DSelect props={{ data: data, selector: selector, title: title }} />
        </Box>
      ))}

      <Box
        component="form"
        sx={{
          '& > :not(style)': { m: 2, width: '22ch' },
        }}
        noValidate
        autoComplete="off"
      >
        <DTextField props={{ data: fonts, selector: "tags", title: "Edit Tags" }} />
      </Box>

      </>
    );
  }
  
}