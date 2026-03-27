import React from 'react';
import { Transformer } from 'react-konva';
import { getCurrentTarget, setCurrentTarget } from './target.js';
import { getRef } from './dselect.js';
import { getTRef } from './dtextfield.js';
import { $ } from './data.js';
import useImage from 'use-image';

export const showHand = () => {
  document.body.style.cursor = 'pointer';
}

export const showCursor = () => {
  document.body.style.cursor = 'default';
}

export const update = (e) => {
  setCurrentTarget(e.target);
  
  if (getTRef().inscription) {
    
    if ($("#editFontFamily")) {
      $("#editFontFamily").style = "display:flex";
    }
    if ($("#editInscription")) {
      $("#editInscription").style = "display:flex";
    }
  
    if (getCurrentTarget().getText) {
      getTRef().inscription.value = e.target.getText();
      getRef().fonts(e.target.attrs.fontFamily);
    } else {
      try {
        getTRef().inscription.value = e.target.attrs.image.currentSrc;      
      }
      catch (e) {
        console.log(e);
      }
    }

    getTRef().inscription.focus();

  }

}

export const handleDragStart = (e) => {
  document.body.style.cursor = 'pointer';
  const i = e.target.id();
  update(e);
};

export const handleDragEnd = (e) => {
  document.body.style.cursor = 'default';
  const id = e.target.id();
  update(e);
};

export const Item = ({ 
  shapeProps, 
  currentTarget, 
  dataSet, 
  design_items, 
  isSelected, 
  onSelect, 
  onChange, 
  url, 
  x, 
  y, 
  width, 
  height, 
  rotation,
  type, 
  size
  }) => {
    const [image] = useImage(url);
    const shapeRef = React.useRef();
    const trRef = React.useRef();

    let CustomTag = `Image`;
    let scaleX = shapeProps.flipX;
    let scaleY = shapeProps.flipY;
    let scale = 1;

    switch (type) {
      case "motif":
        CustomTag = `Image`;
        break;
      case "inscription":
        CustomTag = `Text`;
        break;
    }
  
    React.useEffect(() => {

      shapeProps.ref = shapeRef;
      design_items.push(shapeProps);
  
      if (isSelected) {
        // we need to attach transformer manually
        if (shapeRef.current) {
          trRef.current.nodes([shapeRef.current]);
          trRef.current.getLayer().batchDraw();
        }
      }
    }, [isSelected]);
  
    return (
      <React.Fragment>
          <CustomTag
          ref={shapeRef}
          image={image} 
          x={x} 
          y={y} 
          rotation={rotation}
          fontSize={size}
          align={"center"}
          onClick={onSelect}
          onTap={onSelect}
          onDragStart={handleDragStart}
          onMouseOver={showHand} 
          onMouseOut={showCursor}
          scaleX={scaleX}
          scaleY={scaleY}
          {...shapeProps}
          draggable
          onDragEnd={(e) => {
            onChange({
              ...shapeProps,
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
          onTransformEnd={(e) => {
            // transformer is changing scale of the node
            // and NOT its width or height
            // but in the store we have only width and height
            // to match the data better we will reset scale on transform end
            const node = shapeRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            let font_size;
            
            if (type == "inscription") {
              font_size = node.fontSize();
            }
  
            // we will reset it back
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              ...shapeProps,
              x: node.x(),
              y: node.y(),
              // set minimal value
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(node.height() * scaleY),
              fontSize: Math.floor(font_size * scaleX)
            });
          }}
        />
        {isSelected && (
          <Transformer
            ref={trRef}
            flipEnabled={true}
            enabledAnchors={[
              'top-left',
              'top-right',
              'bottom-left',
              'bottom-right',
            ]}
            boundBoxFunc={(oldBox, newBox) => {
              // limit resize
              if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        )}
      </React.Fragment>
    );
  };