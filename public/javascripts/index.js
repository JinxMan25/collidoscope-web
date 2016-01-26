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
  $scope.rate = 50;

  $(".bar").bind("click",function() {
    soundFile.jump(($(this).index())/($scope.time*counter)); 
  });

  var clicked = true;
  $(".options .drop").click(function() {
    $(".options").css("transform", clicked ? "translateY(0px)" : "translateY(100px)");
    $(this).children("i").css("transform", clicked ? "rotate(360deg)" : "rotate(180deg)");
    clicked = !clicked;
  });


  var recording = false;
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


  var seeker = function() {
    var i = 0;
    var bar = counter / $scope.time;
    
    setInterval(function() {
      y = i;
      i = Math.round(bar*soundFile.currentTime());
      i = (i >= counter) ? 0 : i;

      $($(".container .bar")[y == 0 ? y + 1 : y]).css("background", "white");
      $($(".container .bar")[i == 0 ? i + 1 : i]).css("background", "rgba(250,120,0,1)");
    }, 0);
  }

  $scope.record = function() {
    $scope.stop = true;
    recorder.record(soundFile);
    if (javascriptNode) {
      soundFile.stop();
      javascriptNode = null;
      $(".container").empty();
    }
    if (sourceNode) sourceNode.disconnect();

    try {
      audioContext = new AudioContext();
    } catch(e) {
      alert('Web Audio API is not supported in this browser');
    }


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
        soundFile.rate($scope.rate/50);
        seeker();
        delay = new p5.Delay();

        delay.process(soundFile, .12, .7, 2300);
          
        env = new p5.Env(.01, 0.2, .2, .1);
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

    if ((maxValue - 0.5) == 0) {
      maxValue = 10;
    } else {
      maxValue = (maxValue - 0.5) *2500;
    }
    maxValue = (maxValue >= 300) ? 300 : maxValue;

    if ((counter* ($scope.width+5)+5) >= window.innerWidth) {
      return;
    }
    var bar = $compile('<div bar-directive width="' + $scope.width + '" height="' + maxValue + '" time="' + $scope.time + '"></div>');
    var barHtml = bar($scope);
    $(".container").append(barHtml);
    counter++;
  }
  YUI().use('dial', function(Y) {
      setRate = function(e){
        soundFile.rate(e.newVal);
      }
      
      var reverbDial = new Y.Dial({
      });

      var rateDial = new Y.Dial({
          min:0,
          max:5,
          diameter: 50,
          centerButtonDiameter: 0.3,
          stepsPerRevolution:5,
          decimalPlaces: 2,

          value: 1,
          strings: {label:'', resetStr:'Reset', tooltipHandle:'Drag to set value'},
          after: {
            valueChange: Y.bind(setRate, rateDial)
          }
      });

      rateDial.render('#demo');

  });
});

app.factory("AudioFactory", function(){
  var o = {
  };
  return o;
});

app.directive("barDirective", function() {
  return {
    scope: {
      height: '=',
      width: '=',
      time: '='
    },
    template: '<div class="bar"></div>',
    replace: true,
    link: function(scope, elem, attrs) {
      elem.css("height", scope.height);
      elem.css("width", scope.width);

      elem.bind("click", function(e){
        soundFile.jump(scope.time, 0.5);
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
