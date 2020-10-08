var GPU = {
    lcdon: 0,
    
    bgtilebase: 0x0000,
    bgmapbase: 0x1800,
    
    objsize: 0,
    objon: 0,
    
    bgon: 0,

    yscrl: 0,
    xscrl: 0,

    curline: 0,
    linemode: 0,

    raster: 0,

    reg: [],

    vram: [],
    spriteRam: [],

    // Update screen tiles
    updateTile: function(addr, val) {

    },

    // Update Sprites on screen
    updateOAM: function(addr, val) {

    },

    // read 8-bit byte
    readByte: function(addr, val) {
        var gaddr = addr - 0xef40

        if (gaddr == 0) {
            return (GPU.lcdon?0x80:0) | ((GPU.bgtilebase == 0x0000)?0x10:0) | (GPU.objsize)?0x04:0 | (GPU.objon)?0x02:0 | (GPU.bgon)?0x01:0
        } else if (gaddr == 1) {
            return (GPU.curline == GPU.raster?4:0) | GPU.linemode
        } else if (gaddr == 2) {
            return GPU.yscrl
        } else if (gaddr == 3) {
            return GPU.xscrl
        } else if (gaddr == 4) {
            return GPU.curline
        } else if (gaddr == 5) {
            return GPU.raster
        } else {
            return GPU.reg[gaddr]
        }
    },

    // write 8-bit byte
    writeByte: function(addr, val) {

    }
}

export default GPU