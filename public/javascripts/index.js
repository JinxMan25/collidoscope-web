var app = angular.module("home", []);

app.controller("collidoscope", function($scope, $timeout) {
  var canvas = new fabric.Canvas('c');

  var test = [20,30,40, 80, 120, 150, 50, 20, 200, 210, 220, 300]
  var objects1 = [];
  var objects2 = [];
  counter = 0;

  canvas.setWidth(window.innerWidth);
  canvas.setHeight(window.innerHeight);
  canvas.setBackgroundColor('rgba(24,24,24,0.9)', canvas.renderAll.bind(canvas));
  canvas.calcOffset();

  
  function addObj(height) {
    var rect = new fabric.Rect({
      left: counter*15,
      top: 100,
      fill: 'white',
      stroke: 'rgba(24,24,24,0.9',
      strokeWidth: 2,
      width: 15,
      height: 0
    });

    var rect2 = new fabric.Rect({
      left: counter*15,
      top: 100,
      stroke: 'rgba(24,24,24,0.9',
      strokeWidth: 2,
      fill: 'white',
      width: 15,
      height: 0
    });

    rect2.rotate(180);

    objects1.push(rect);
    objects2.push(rect2);


    rect.animate('height', height, {
      duration: 550,
      onChange: canvas.renderAll.bind(canvas),
      easing: fabric.util.ease.easeOutBack
    });

    rect2.animate('height', height, {
      duration: 550,
      onChange: canvas.renderAll.bind(canvas),
      easing: fabric.util.ease.easeOutBack
    });

    rect.top = (window.innerHeight/2) - (rect.height/2) + 1;
    rect2.top = (window.innerHeight/2) - (rect2.height/2) - 1;

    counter++;

    canvas.add(rect);
    canvas.add(rect2);
  }
  

  test.forEach(function(height){
    addObj(height);
  });



  /*var rect = new fabric.Rect({
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

  var rect3 = new fabric.Rect({
    left: 20+1,
    top: 100,
    fill: 'white',
    width: 20,
    height: 0
  });

  var rect4 = new fabric.Rect({
    left: 20+1,
    top: 200,
    fill: 'white',
    width: 20,
    height: 0
  });

  rect2.rotate(180);
  rect4.rotate(180);

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

  setTimeout(function() {
    rect3.animate('height', 200, {
      duration: 550,
      onChange: canvas.renderAll.bind(canvas),
      easing: fabric.util.ease.easeOutBack
    });

    rect4.animate('height', 200, {
      duration: 550,
      onChange: canvas.renderAll.bind(canvas),
      easing: fabric.util.ease.easeOutBack
    });
  }, 200);



  rect.top = (window.innerHeight/2) - (rect.height/2) + 1;
  rect2.top = (window.innerHeight/2) - (rect2.height/2) - 1;
  rect3.top = (window.innerHeight/2) - (rect3.height/2) + 1;
  rect4.top = (window.innerHeight/2) - (rect4.height/2) - 1;

  canvas.add(rect);
  canvas.add(rect2);
  canvas.add(rect3);
  canvas.add(rect4);*/



  // "add" rectangle onto canvas
});
