import * as React from 'react';
import ImageList from '@mui/material/ImageList';
import ImageListItem from '@mui/material/ImageListItem';
import ImageListItemBar from '@mui/material/ImageListItemBar';
import ListSubheader from '@mui/material/ListSubheader';
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ImageIcon from '@mui/icons-material/Image';
import { getPath } from './path.js';

const path = getPath();

export function TitlebarImageList(data) {

  let itemData;
  
  if (data) {
    if (data.dataTF.length > 0) {
      itemData = data.dataTF;
    }
  }

  const handleOpen = (img) => {
    window.open(img);
  }

  const handleEdit = (id) => {
    window.open(path + 'design/html5/#edit' + id);
  }

  if (data) {
    if (itemData) {
      if (itemData.length > 0) {

        return (
          <ImageList sx={{ height: 540, overflowY: 'auto' }} cols={3} rowHeight={256}>
            {itemData.map((item) => (
              <ImageListItem key={item.img} sx={{ margin: 1 }}>
                <img
                  srcSet={`${item.img}?w=248&fit=crop&auto=format&dpr=2 2x`}
                  src={`${item.img}?w=248&fit=crop&auto=format`}
                  alt={item.title}
                  loading="lazy"
                />
                <ImageListItemBar
                  title={item.title}
                  subtitle={item.author}
                  actionIcon={
                    <>
                    <IconButton
                      sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                      aria-label={`Open Image ${item.title}`}
                    >
                      <ImageIcon onClick={(event) => {
                        handleOpen(item.img);
                      }} />
                    </IconButton>
                    <IconButton
                      sx={{ color: 'rgba(255, 255, 255, 0.9)' }}
                      aria-label={`Edit Design ${item.title}`}
                    >
                      <UploadFileIcon onClick={(event) => {
                        handleEdit(item.id);
                      }} />
                    </IconButton>
                    </>
                  }
                />
              </ImageListItem>
            ))}
          </ImageList>
        );

      }
    }
  }
}