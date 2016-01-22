function setup() {
  mic = new p5.AudioIn();
  reverb = new p5.Reverb();

  mic.start();

  recorder = new p5.SoundRecorder();

  recorder.setInput(mic);

  soundFile = new p5.SoundFile();
}

var app = angular.module("home", []);

app.controller("collidoscope", function($scope, $timeout, $compile) {
  $scope.width = (window.innerWidth/5)/11;
  navigator.getUserMedia = (navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia);
  window.requestAnimFrame = (function(){
    return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame ||
    function(callback, element){
      window.setTime(callback, 1000 / 60);
    };
  })();

  window.AudioContext = (function() {
    return window.webkitAudioContext || window.AudioContext || window.mozAudioContext;
  })();

  var audioContext, analyserNode, javascriptNode;
  var sampleSize = 4096;
  sourceNode = null;

  var amplitudeArray;
  var audioStream;
  counter = 0;
  test = 0;

  try {
    audioContext = new AudioContext();
  } catch(e) {
    alert('Web Audio API is not supported in this browser');
  }

  $scope.record = function() {
    recorder.record(soundFile);
    if (javascriptNode){
      javascriptNode.onaudioprocess = null;
      audioContext.close();
      $(".container").empty();
    }
    if (sourceNode)  sourceNode.disconnect();

    setInterval(function() {
      console.log(soundFile.currentTime());
    },1);


    try {
      navigator.getUserMedia({ video: false, audio: true }, setupAudioNodes, function(e) { console.log(e) });
    } catch (e) {
      alert('webkitGetUserMedia threw an exception' + e);
    }
  }

  /*setInterval(function() { 
  }, 10);*/
  var setupAudioNodes = function(stream) {
    sourceNode = audioContext.createMediaStreamSource(stream);
    audioStream = stream;

    analyserNode = audioContext.createAnalyser();
    javascriptNode = audioContext.createScriptProcessor(sampleSize, 1, 1);

    amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
    
    javascriptNode.onaudioprocess = function() {
      if (test == 44) {
        recorder.stop();
        reverb.process(soundFile, 3, 2);
        
        soundFile.loop();

        javascriptNode.onaudioprocess = null;
        audioContext.close();
        return;
      }
      $scope.time = audioContext.currentTime;
      $scope.$apply();
      amplitudeArray = new Uint8Array(analyserNode.frequencyBinCount);
      analyserNode.getByteTimeDomainData(amplitudeArray);
      requestAnimFrame(putBar);
      test++;
    }

    sourceNode.connect(analyserNode);
    analyserNode.connect(javascriptNode);
    javascriptNode.connect(audioContext.destination);

  }

  self = this;
  function putBar() {
    var minValue = 9999999;
    var maxValue = 0;
    for (var i = 0; i < amplitudeArray.length; i++) {
      var value = amplitudeArray[i] / 256;
      if (value > maxValue) {
          maxValue = value;
      } else if(value < minValue) {
          minValue = value;
      }
    }

    var y_lo = window.innerHeight - (window.innerHeight * minValue) - 1;
    var y_hi = window.innerHeight - (window.innerHeight * maxValue) - 1;


    if ((maxValue - 0.5) == 0) {
      maxValue = 10;
    } else {
      maxValue = (maxValue - 0.5) *2500;
    }
    maxValue = (maxValue >= 300) ? 300 : maxValue;

    if ((counter* ($scope.width+5)+5) >= window.innerWidth) {
      return;
    }
    var bar = $compile('<div bar-directive width="' + $scope.width + '" height="' + maxValue + '"></div>');
    var barHtml = bar($scope);
    $(".container").append(barHtml);
    counter++;
  }
  var y;
  wait = false;
  var throttle = function(cb, delay) {
    if (wait) {
      console.log("Limit reached!");
      return;
    }
    wait = true;
    cb();
    setTimeout(function() {
      wait = false;
    }, delay) 
  }
  $scope.loop = function() {
    soundFile.play(); // play the result!
    saveSound(soundFile, 'mySound.wav'); // save file
    throttle(function(){
      console.log("Logged!");
    }, 1000);

    /*var i = 1;
    var z = 80;
    setInterval(function(){
      y = i;
      i = (i == z) ? 0 : i;
      i++;
      debugger;
      $($(".container .bar")[y]).css("background", "white");
      $($(".container .bar")[i]).css("background", "rgba(250,120,0,1)");
    }, 17);*/
  }
  /*while(1) {
    var y;
    for (i=0;i< 5; i++) {
      setTimeout(function() {
        $(".container .bar")[y].css("background", "white");
        $(".container .bar")[i].css("background", "blue");
      }, 200);
      y = i;
    }
  }*/

});


app.directive("barDirective", function() {
  return {
    scope: {
      height: '=',
      width: '='
    },
    template: '<div class="bar"></div>',
    replace: true,
    link: function(scope, elem, attrs) {
      elem.css("height", scope.height);
      elem.css("width", scope.width);
      elem.bind("click", function() {
        elem.css("background", "blue");
      });
      elem.bind("mouseenter", function(){
        elem.css("background", "rgba(250, 120, 0, 1)");
      });
      elem.bind("mouseleave", function() {
        elem.css("background", "white");
      });
      elem.bind("dblclick", function(){
        elem.css("background", "white");
      });
    }
  };
});
