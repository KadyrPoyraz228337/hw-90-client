import React, {useEffect, useRef, useState} from 'react';
import './App.css';
import {Input} from "reactstrap";

const webSocket = new WebSocket('ws://localhost:8000/paint');

function App() {
  const canvasRef = useRef(null);
  let ctx;

  const [color, setColor] = useState({color: '#000'});
  const [range, setRange] = useState({range: '10'});
  const [isDraw, setDraw] = useState(false);

  const sendData = e => {
    e.persist();
    if (isDraw) {
      console.log(e);
      const data = {
        type: 'CREATE_DATA',
        data: {x: e.clientX, y: e.clientY, range: range.range, color: color.color}
      };
      webSocket.send(JSON.stringify(data));
    }
  };

  const setDrawState = value => {
    const data = {
      type: 'SET_DRAW_STATE',
      value: value
    };
    webSocket.send(JSON.stringify(data));
  };

  const draw = (x, y, range, color) => {
    const canvas = canvasRef.current;
    ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    x -= rect.left;
    y -= rect.top;

    ctx.fillStyle = color;

    ctx.strokeStyle = color;
    ctx.lineWidth = range * 2;
    ctx.lineTo(x, y);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x, y, range, 0, 2 * Math.PI);
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const colorChangeHandler = e => setColor({color: e.target.value});
  const rangeChangeHandler = e => setRange({range: e.target.value});

  useEffect(() => {

    webSocket.onmessage = message => {
      const data = JSON.parse(message.data);

      if(data.type === 'CREATE_DATA') {
        draw(data.data.x, data.data.y, data.data.range, data.data.color)
      } else if (data.type === 'SET_DRAW_STATE') {
        setDraw(data.value);
        if(!data.value) {
          if (ctx) ctx.beginPath();
        }
      }
    };

  }, [ctx]);

  return (
    <div className='border rounded m-3 p-5 bg-light d-flex flex-column align-items-center justify-content-center'>
      <div className='d-flex w-25 mb-3'>
        <h3>Color</h3>
        <Input type='color' className='ml-4' onChange={colorChangeHandler}/>
      </div>
      <h1 className='font-weight-bold'>Canvas</h1>
      <div className='d-flex'>
        <canvas
          ref={canvasRef}
          width='800'
          height='500'
          className='canvas border rounded'
          onMouseMove={sendData}
          onMouseLeave={() => setDrawState(false)}
          onMouseDown={() => setDrawState(true)}
          onMouseUp={() => setDrawState(false)}
        >you dont have canvas
        </canvas>
        <div className='d-flex flex-column align-items-start ml-2'>
          <div className='d-flex align-items-center'>
            <h6 className='m-0 mr-2 font-weight-bold'>size:</h6>
            <div className='rounded border p-2 d-inline-block bg-white'>
              <Input
                className='mb-2'
                type='text' style={{width: '55px'}}
                onChange={rangeChangeHandler}
                value={range.range}
              />
              <div
                style={{
                  borderRadius: '50%',
                  background: color.color,
                  width: range.range * 2 + 'px',
                  height: range.range * 2 + 'px'
                }}
                className='border'
              />
              <input type="range" onChange={rangeChangeHandler} value={range.range} className='m-2'/>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
