//const $cartridge = document.getElementById('cartridge');
///const gameRequester = new GameRequester();


function handleFileSelect(evt, $cartridge) {
 
    //const file = evt.target.files[0]; // FileList object
    const file = evt
    const reader = new FileReader();
  
    reader.onload = function(event){
  
      $cartridge.blur();
      init(event.target.result);
    };
  
    if (file) {
      var result = reader.readAsArrayBuffer(file);
      console.log(`result - ${result}`)
      //return result
    }
}
  
/**
 * @param {ArrayBuffer} arrayBuffer
 */
function init(arrayBuffer){
    console.log("in init")
    console.log(arrayBuffer)
    uint = new Uint8Array(arrayBuffer)
    console.log(uint)
    result = ""
    for (var i=0; i<uint.length; i++) {
        result += String.fromCharCode(uint[i])
        if (i == 0x1047) {
            console.log(`testing = ${uint[0x1047]}`)
        }
    }
    //console.log(result)
    MMU.rom = result
    MMU.cartridgeType = MMU.rom.charCodeAt(0x1047)

    //console.log(`cart = ${MMU.cartridgeType}`)
    //console.log(`${MMU.rom[0x1047]}`)
    //return result


    /*
    mmu = new MMU(new Uint8Array(arrayBuffer), new BrowserStorage(window.localStorage));
    let bootstrap = true;
    if (!mmu.isCartridgeSupported()){
        bootstrap = window.confirm('This game is not supported. Do you want to continue? Your browser may crash.');
    }
    if (bootstrap) {
        const lcd = new LCD(mmu, $ctx);
        cpu = new CPU(mmu, lcd);
        new InputHandler(cpu, $body);
        frame();
    }
    */
}

function request(gameName, callback){

    const file = gameName;

    if (file){
      const request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
          callback.call(this, this.response);
        }
      };
      request.open('GET', file, true);
      request.responseType = 'arraybuffer';
      request.send();
    }
    
    request()
  }



//request('/rom/ttt.gb', init);
