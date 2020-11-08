import "./lib/webaudio-controls.js";

const urlBase = new URL('.', import.meta.url).href;
const templateFile = `${urlBase}index.html`;
const equlizerfrequencies = [60, 170, 350, 1000, 3500, 10000];

class MyAudioPlayer extends HTMLElement {

  static get observedAttributes() { return ["volume", "current-time", "loop", "balance", "gain", "play", "src"]; }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.duration = 0;
    this.wave = {};
  }

  async connectedCallback() {
    const template = document.createElement("template");

    //HTML Import
    const res = await fetch(templateFile)
    template.innerHTML = await res.text()
    this.shadowRoot.appendChild(template.content.cloneNode(true));
    //patch relatives paths
    this.fixRelativePaths();
    this.addFont();

    this.assignHTMLNodes();
    this.assignAudioNodes();

    this.declareListeners();
    this.applyAttributs();

    requestAnimationFrame(() => {
      this.visualize();
    });
  }

  fixRelativePaths() {
    let webaudioControls = this.shadowRoot.querySelectorAll(
      'webaudio-knob, webaudio-switch'
    );
    webaudioControls.forEach((e) => {
      let imagePath = e.getAttribute('src');
      if (imagePath !== undefined) {
        e.src = `${urlBase}/${imagePath}`;
      }
    });
  }

  addFont(){
    let junction_font = new FontFace('digit', `url(${urlBase}/assets/fonts/taximeter.ttf)`);
    junction_font.load().then(function(loaded_face) {
      document.fonts.add(loaded_face);
        document.body.style.fontFamily = '"digit", cursive';
    }).catch(function(error) {
      // error occurred
    });
  }

  assignHTMLNodes(){
    this.player = this.shadowRoot.querySelector("#myPlayer");
    this.playPauseSwitch = this.shadowRoot.querySelector("#playPauseSwitch");
    this.loopSwitch = this.shadowRoot.querySelector("#loopSwitch");
    this.volumeKnob = this.shadowRoot.querySelector("#volumeKnob");
    this.balanceKnob = this.shadowRoot.querySelector("#balanceKnob");
    this.gainKnob = this.shadowRoot.querySelector("#gainKnob");
    this.progressSlider = this.shadowRoot.querySelector("#progressSlider");
    this.timeDisplay = this.shadowRoot.querySelector("#timeDisplay");

    this.equalizerSlideNodes = [];
    equlizerfrequencies.forEach((freq) => {
      this.equalizerSlideNodes.push(this.shadowRoot.querySelector("#equalizer" + freq + "Slider"));
   });

   this.wave.canvas = this.shadowRoot.querySelector("#waveCanvas");
   this.wave.canvasContext = this.wave.canvas.getContext("2d");
   this.wave.canvasContext.setB
  }

  assignAudioNodes(){
    let audioContext = new AudioContext();
    
    let playerNode = audioContext.createMediaElementSource(this.player);

    this.equalizerNodes = [];
    equlizerfrequencies.forEach((freq) => {
      var node = audioContext.createBiquadFilter();
      node.frequency.value = freq;
      node.type = "peaking";
      node.gain.value = 0;
      this.equalizerNodes.push(node);
    });

    this.pannerNode = audioContext.createStereoPanner();
    this.gainNode = audioContext.createGain();

    this.analyserNode = audioContext.createAnalyser();
    this.analyserNode.fftSize = 1024;
    this.wave.bufferLength = this.analyserNode.frequencyBinCount;
    this.wave.dataArray = new Uint8Array(this.wave.bufferLength);

    playerNode.connect(this.equalizerNodes[0]);
    
    for(let i = 0; i < this.equalizerNodes.length - 1; i++){
        this.equalizerNodes[i].connect(this.equalizerNodes[i + 1]);
    }

    this.equalizerNodes[this.equalizerNodes.length - 1].connect(this.pannerNode);
    this.pannerNode.connect(this.gainNode);
    this.gainNode.connect(this.analyserNode);
    this.analyserNode.connect(audioContext.destination);
  }

  declareListeners() {
    //update duration when it is available
    this.player.onloadedmetadata = (e) => {
      this.duration = e.target.duration;
      this.progressSlider.max = this.duration;

      let currentTime = parseFloat(this.getAttribute("current-time"));
      if (currentTime !== undefined && currentTime !== null && currentTime >= 0 && currentTime <= this.duration)
        this.currentTime = currentTime;
      else
        this.currentTime = 0;

      let play = this.getAttribute("play")
      if (play !== undefined && play !== null)
        this.play = play.toString().toUpperCase() == "TRUE";
      else
        this.play = false;
    }

    //switch play/pause when player ending and no loop
    this.player.onended = (e) => {
      if(! this.loop)
        this.play = false;
    }

    //Switches
    this.playPauseSwitch.addEventListener("click", (event) => {
      this.play = event.target.value == 1;
    });
    this.shadowRoot.querySelector("#resetSwitch").addEventListener("click", (event) => {
      this.reset();
    });
    this.loopSwitch.addEventListener("click", (event) => {
      this.loop = event.target.value == 1;
    })

    //Knobs
    this.volumeKnob.addEventListener("input", (event) => {
      this.volume = event.target.value;
    });
    this.balanceKnob.addEventListener("input", (event) => {
      this.balance = event.target.value;
    });
    this.gainKnob.addEventListener("input", (event) => {
      this.gain = event.target.value;
    });
    this.player.addEventListener("timeupdate", (event) => {
      this.progressSlider.value = event.target.currentTime;
      this.timeDisplay.innerHTML = `${this.getTimeDisplay(event.target.currentTime)}/${this.getTimeDisplay(this.duration)}`;
    })

    //Sliders
    this.progressSlider.addEventListener("input", (event) => {
      this.currentTime = event.target.value;
    });
    this.equalizerSlideNodes.forEach((slider, i) => {
      slider.addEventListener("input", (event) => {
          this.equalizerNodes[i].gain.value = event.target.value;
      });
   });
  }

  applyAttributs() {
    //apply attributs
    let volume = parseFloat(this.getAttribute("volume"));
    if (volume !== undefined && volume !== null && volume >= 0 && volume <= 100)
      this.volume = volume;
    else
      this.volume = 100;

    let loop = this.getAttribute("loop")
    if (loop !== undefined && loop !== null)
      this.loop = loop.toString().toUpperCase() == "TRUE";
    else
      this.loop = false;

    let balance = parseFloat(this.getAttribute("balance"));
    if (balance !== undefined && balance !== null && balance >= -1 && balance <= 1)
      this.balance = balance;
    else
      this.balance = 0;

    let gain = parseFloat(this.getAttribute("gain"));
    if (gain !== undefined && gain !== null && gain >= 0 && gain <= 2)
      this.gain = gain;
    else
      this.gain = 1;
    
    this.src = this.getAttribute("src");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    try{
      switch (name) {
        case "volume":
          this.player.volume = parseFloat(newValue) / 100.0;
          this.volumeKnob.setValue(parseFloat(newValue), false);
          break;
        case "current-time":
          this.player.currentTime = parseFloat(newValue);
          this.progressSlider.value = parseFloat(newValue);
          this.timeDisplay.innerHTML = `${this.getTimeDisplay(newValue)}/${this.getTimeDisplay(this.duration)}`;
          break;
        case "loop":
          let loop = newValue.toString().toUpperCase() == "TRUE";
          this.player.loop = loop;
          this.loopSwitch.setValue(loop, false);
          break;
        case "balance":
          this.pannerNode.pan.value = parseFloat(newValue);
          this.balanceKnob.setValue(parseFloat(newValue), false);
          break;
        case "gain":
          this.gainNode.gain.value = parseFloat(newValue);
          this.gainKnob.setValue(parseFloat(newValue), false);
          break;
        case "play":
          let play = newValue.toString().toUpperCase() == "TRUE";
          if(play){
            this.player.play();
            this.playPauseSwitch.setValue(1, false);
          }
          else{
            this.player.pause();
            this.playPauseSwitch.setValue(0, false);
          }
            break;
        case "src":
          this.player.src = newValue;
          break;
      }
    }catch(error){}
  }

  visualize(){
    this.analyserNode.getByteTimeDomainData(this.wave.dataArray);
    this.visualizeVolume();
    this.visualizeWave();

    requestAnimationFrame(() => {
      this.visualize();
    });
  }

  visualizeVolume(){
    let value = 0;
    for(const v of this.wave.dataArray){
      value += v;
    }

    let average = value / this.wave.bufferLength;
    this.shadowRoot.querySelector("#meterKnob").setValue(average);

  }

  visualizeWave(){
    this.wave.canvasContext.fillStyle = 'rgba(0, 0, 0, 0.5)';
    this.wave.canvasContext.fillRect(0, 0, this.wave.canvas.width, this.wave.canvas.height);

    this.wave.canvasContext.lineWidth = 2;
    this.wave.canvasContext.strokeStyle = 'red';
    this.wave.canvasContext.beginPath();

    let sliceWidth = this.wave.canvas.width / this.wave.bufferLength;
    let x = 0;

    for(var i = 0; i < this.wave.bufferLength; i++) {
      var v = this.wave.dataArray[i] / 255;
      var y = v * this.wave.canvas.height;
   
      if(i === 0) {
        this.wave.canvasContext.moveTo(x, y);
      } else {
        this.wave.canvasContext.lineTo(x, y);
      }
   
      x += sliceWidth;
    }

    this.wave.canvasContext.lineTo(this.wave.canvas.width, this.wave.canvas.height/2);
    this.wave.canvasContext.stroke();
  }
  // API

  get volume() {
    return this.getAttribute("volume");
  }
  set volume(value) {
    this.setAttribute("volume", value);
  }

  get currentTime() {
    return this.player.currentTime;
  }
  set currentTime(value){
    this.setAttribute("current-time", value);
  }

  get loop() {
    return this.player.loop;
  }
  set loop(value) {
    return this.setAttribute("loop", value);
  }

  get balance() {
    return this.pannerNode.pan.value;
  }
  set balance(value){
    this.setAttribute("balance", value);
  }

  get gain(){
    return this.gainNode.gain.value;
  }
  set gain(value){
    this.setAttribute('gain', value);
  }

  get src(){
    return this.player.src;
  }
  set src(value){
    this.setAttribute("src", value);
  }

  get play() {
    this.playPauseSwitch.value;
  }
  set play(value){
    this.setAttribute("play", value);
  }
  reset() {
    this.player.currentTime = 0;
  }

  getTimeDisplay(time){
    let sec = Math.round(time);
    let min = Math.floor(sec / 60);
    sec = sec % 60;
    return `${min}:${("0" + sec).slice(-2)}`;
  }
}

customElements.define("my-audioplayer", MyAudioPlayer);
