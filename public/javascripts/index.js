var app = angular.module("home", []);

app.controller("collidoscope", function($scope) {
  var canvas = new fabric.Canvas('c');

  var rect = new fabric.Rect({
    left: 0,
    top: 100,
    fill: 'white',
    width: 20,
    height: 0
  });

  var rect2 = new fabric.Rect({
    left: 0,
    top: 200,
    fill: 'white',
    width: 20,
    height: 0
  });

  rect2.rotate(180);

  rect.animate('height', 120, {
    duration: 550,
    onChange: canvas.renderAll.bind(canvas),
    easing: fabric.util.ease.easeOutBack
  });

  rect2.animate('height', 120, {
    duration: 550,
    onChange: canvas.renderAll.bind(canvas),
    easing: fabric.util.ease.easeOutBack
  });

  rect.top = (window.innerHeight/2) - (rect.height/2);
  rect2.top = (window.innerHeight/2) - (rect2.height/2);



  canvas.setWidth(window.innerWidth);
  canvas.setHeight(window.innerHeight);
  canvas.setBackgroundColor('rgba(24,24,24,0.9)', canvas.renderAll.bind(canvas));
  canvas.calcOffset();

  // "add" rectangle onto canvas
  canvas.add(rect);
  canvas.add(rect2);
});
