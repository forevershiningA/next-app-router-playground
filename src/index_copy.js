import React, { Component } from 'react';
import { createRoot } from 'react-dom/client';
import { Stage, Layer, Image, Circle, Text } from 'react-konva';
import useImage from 'use-image';

// FONT LOADING DETECTION CODE:
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
ctx.font = 'normal 20px Lato';

var isFontLoaded = false;
var TEXT_TEXT = 'Some test text;';
var initialMeasure = ctx.measureText(TEXT_TEXT);
var initialWidth = initialMeasure.width;

// here is how the function works
// different fontFamily may have different width of symbols
// when font is not loaded a browser will use startard font as a fallback
// probably Arial
// when font is loaded measureText will return another width
function whenFontIsLoaded(callback, attemptCount) {
  if (attemptCount === undefined) {
    attemptCount = 0;
  }
  if (attemptCount >= 20) {
    callback();
    return;
  }
  if (isFontLoaded) {
    callback();
    return;
  }
  const metrics = ctx.measureText(TEXT_TEXT);
  const width = metrics.width;
  if (width !== initialWidth) {
    isFontLoaded = true;
    callback();
  } else {
    setTimeout(function () {
      whenFontIsLoaded(callback, attemptCount + 1);
    }, 100);
  }
}

whenFontIsLoaded(function () {
  // set font style when font is loaded
  // so Konva will recalculate text wrapping if it has limited width
  console.log("@font loaded");
  text.fontFamily('Lato');
});

const Img = ({x, y, width, height, img}) => {
  const [image] = useImage(img);
  return <Image image={image} x={x} y={y} width={width} height={height}/>;
};

const Inscriptions = ({x, y}) => {

  return (
    <>
    <Inscription text={"HUSBAND & FATHER"} x={x} y={y} size={40}/>
    <Inscription text={"WALTER H."} x={x} y={y += 60} size={50}/>
    <Inscription text={"MONROE"} x={x} y={y += 60} size={50}/>
    <Inscription text={"JANUARY 6, 1908"} x={x} y={y += 60} size={50}/>
    <Inscription text={"JUNE 8, 1970"} x={x} y={y += 60} size={50}/>
    </>
  );

}

const Inscription = ({text, x, y, size}) => {
  return <Text 
            text={text} 
            fontFamily='Lato'
            fontSize={size}
            align="center"
            width="500"
            x={x}
            y={y}
        />
}

function generateItems() {
  const items = [];
  for (let i = 0; i < 10; i++) {
    let file = (100 + Math.floor(Math.random(1) * 100)) + '_1' + Math.floor(10 * Math.random(1));
    items.push({
      x: window.innerWidth / 2 + Math.sin(i * 10 * (Math.PI / 180)) * window.innerWidth / 3,
      y: window.innerHeight / 2 + Math.cos(i * 10 * (Math.PI / 180)) * window.innerHeight / 3,
      id: 'node-' + i,
      nr: i,
      color: Konva.Util.getRandomColor(),
      url: 'https://headstonesdesigner.com/design/html5/data/svg/motifs/1_' + file + '.svg',
      text: file
    });
  }
  return items;
}

const text = new Konva.Text({

});

class App extends Component {
  state = {
    items: generateItems(),
  };
  handleDragStart = (e) => {
    const id = e.target.name();
    const items = this.state.items.slice();
    const item = items.find((i) => i.id === id);
    const index = items.indexOf(item);
    // remove from the list:
    items.splice(index, 1);
    // add to the top
    items.push(item);
    this.setState({
      items,
    });
  };
  onDragEnd = (e) => {
    const id = e.target.name();
    const items = this.state.items.slice();
    const item = this.state.items.find((i) => i.id === id);
    const index = this.state.items.indexOf(item);
    // update item position
    items[index] = {
      ...item,
      x: e.target.x(),
      y: e.target.y(),
    };
    this.setState({ items });
  };
  render() {

    return (
      <Stage width={window.innerWidth} height={window.innerHeight}>
        <Layer>
          {this.state.items.map((item) => (
            <Text
                key={item.id}
                fontFamily='Lato'
                text={item.text}
                fontSize={item.nr}
                x={item.x}
                y={item.y}
            />
          ))}
        </Layer>
        <Layer>
          {this.state.items.map((item) => (
              <Img
                  key={item.id}
                  x={item.x}
                  y={item.y + 20}
                  width={item.nr * 4}
                  height={item.nr * 4}
                  img={item.url}
              />
            ))}
        </Layer>
        <Layer>
          {this.state.items.map((item) => (
            <Circle
              key={item.id}
              name={item.id}
              draggable
              x={item.x}
              y={item.y - 20}
              fill={item.color}
              radius={item.nr}
              onDragStart={this.handleDragStart}
              onDragEnd={this.handleDragEnd}
            />
          ))}
        </Layer>
        <Layer>
          <Inscriptions x={600} y={100} />
        </Layer>
      </Stage>
    );
  }
}

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<App />);
