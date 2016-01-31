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

      var prevBar = $($(".container .bar")[y == 0 ? y + 1 : y]);
      var currentBar = $($(".container .bar")[i == 0 ? i + 1 : i]);


      if (prevBar.attr("marker") === ""){
        prevBar.css("background", "rgb(40,250,40)");
      } else {
        $(prevBar.css("background", "white"));
      }

      $(currentBar.css("background", "rgba(250,120,0,1)"));


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
      if (test == 48) {
        recorder.stop();
        soundFile.rate($scope.rate/50);
        seeker();
        delay = new p5.Delay();

        //delay.process(soundFile, .12, .7, 2300);
          
        //reverb.process(soundFile, 3, 2);
        reverb.process(soundFile, 0, 0);
        
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
      //delay.process(soundFile, .12, .7, 2300);
      //

      setReverb = function(e){
        reverb.set(e.newVal, 2);
      }

      setFrequency = function(e){
        delay.filter(e.newVal);
      }

      /*var delayDial = new Y.
        min: 100,
        max: 2500,
        diameter: 50,
        centerButtonDiameter: 0.3,
        stepsPerRevolution:800,
        value: 0,
        strings: {label:'', resetStr:'Reset', tooltipHandle:'Drag to set value'},
        after: {
          valueChange: Y.bind(setDelay, delayDial)
        }
      });*/

      var reverbDial = new Y.Dial({
        min: 0,
        max: 6,
        diameter: 50,
        centerButtonDiameter: 0.3,
        decimalPlaces: 2,
        stepsPerRevolution:6,
        value: 0,
        strings: {label:'', resetStr:'Reset', tooltipHandle:'Drag to set value'},
        after: {
          valueChange: Y.bind(setReverb, reverbDial)
        }
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
      reverbDial.render('#reverb');

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
        if (scope.$parent.first) {
          var time;
          // If there is a second marker, find midpoint and if mouseclick is less than 
          // the midpoint, the first marker moves to that point, otherwise the second 
          // one does
          if (scope.$parent.second){
            var midpoint = (scope.$parent.first + scope.$parent.second)/2;

            if (scope.time < midpoint){
              time = scope.$parent.first;
              scope.$parent.first = scope.time;
            } else {
              time = scope.$parent.second
              scope.$parent.second = scope.time;
            }
          } else {    // else just put a damn marker!
            scope.$parent.second = scope.time;
          }

          //get rids of the previously placed marker
          var prevBar = $("div[time='" + time + "']");
          if (prevBar){
            prevBar.css("background", "white");
            prevBar.removeAttr("marker");
          }

          //pause to avoid multiple noise clashing
          soundFile.pause();
          soundFile.jump(scope.$parent.first, scope.$parent.second - scope.$parent.first);

          elem.attr("marker", "");
          elem.css("background", "rgb(40,250,40)");
        } else {
          //putting the first marker
          scope.$parent.first = scope.time;
          elem.attr("marker", "");
          elem.css("background", "rgb(40,250,40)");
        }
      });

      elem.bind("mouseenter", function(){
        if (elem.attr("marker") == typeof undefined){
          elem.css("background", "rgba(250, 120, 0, 1)");
        }
      });
      elem.bind("mouseleave", function() {
        if (elem.attr("marker") == typeof undefined){
          elem.css("background", "white");
        }
      });
      elem.bind("dblclick", function(){
        if (!elem.attr("marker")){
          elem.css("background", "white");
        }
      });
    }
  };
});
