function preload() {
  mySound = loadSound('./door.mp3');
}


function setup() {
  createCanvas(100, 100);
  background(0, 255, 0);
  
  textAlign(CENTER);
  text('click here to play', width/2, height/2);

  mySound.setVolume(0.1);
}
