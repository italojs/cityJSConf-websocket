import React, { Component } from "react";
import "./App.css";
import Sockette from "sockette";
import { uniqueNamesGenerator, colors, animals } from 'unique-names-generator';
let ws = null;

function getRandonColor() {
  var r = 255*Math.random()|0,
      g = 255*Math.random()|0,
      b = 255*Math.random()|0;
  return 'rgb(' + r + ',' + g + ',' + b + ')';
}

class App extends Component {
  constructor(props) {
    super(props);

    this.isConnected = false
    this.positions = {}

    this.my ={
      username: uniqueNamesGenerator({ dictionaries: [colors, animals] }),
      color: getRandonColor(),
      x: 0,
      y: 0
    }

    this.onMouseMove = this.onMouseMove.bind(this);
    this.openConnection()
  }

  openConnection(){
    ws = new Sockette(
      "wss://qq332uhrxl.execute-api.us-east-1.amazonaws.com/dev",
      {
        onopen: _ => this.onOpen(),
        onmessage: e => this.onMessageReceived(e),
        onreconnect: e => console.log("Reconnecting...", e),
        onmaximum: e => console.log("Stop Attempting!", e),
        onclose: e => console.log("Closed!", e),
        onerror: e => console.log("Error:", e)
      }
    )
  }

  onOpen(){
    const canvas = document.getElementById("canvas")

    this.ctx = canvas.getContext("2d");

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    this.isConnected = true
    console.log('connected')
  }

  render(){
    return (
        <div>
          <canvas onMouseMove={this.onMouseMove} id="canvas" />
        </div>
    );
  }

  onMouseMove(e) {
    if(!this.isConnected) return
      
    ws.json({
      action: "sendMessage",
      data: JSON.stringify({ 
        x: this.my.x, 
        y: this.my.y, 
        author: this.my.username, 
        color: this.my.color 
      })
    });

    this.my.x = e.nativeEvent.offsetX
    this.my.y = e.nativeEvent.offsetY
  }

  onMessageReceived({ data }) {
    const {x , y, author, color } = JSON.parse(data)
    if(author !== this.my.username) this.positions[author] = { x, y, color }
    this.ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

    this.drawPoint(this.my.x, this.my.y, this.my.color, author)
    this.printPositions()
  };

  drawPoint(x, y, color, author){
    this.ctx.fillStyle = color;
    this.ctx.beginPath();
    this.ctx.arc(x, y, 5, 0, Math.PI * 2, true);
    this.ctx.fill();
    this.ctx.fillText(author, x+10, y);
  }

  printPositions(){
    Object.keys(this.positions).forEach((author) => {
      const { x, y, color } = this.positions[author]
      this.drawPoint(x,y, color)
    });
  }






}

export default App
