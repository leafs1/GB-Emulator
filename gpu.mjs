import cpu from './cpu.mjs'
import MMU from './mmu.mjs'

var GPU = {
    // Initialize values
    lcdon: 0,
    
    bgtilebase: 0x0000,
    bgmapbase: 0x1800,
    wintilebase: 0x1800,

    objsize: 0,
    objon: 0,
    
    bgon: 0,

    winon: 0,

    yscrl: 0,
    xscrl: 0,

    curline: 0,
    curscan: 0,
    linemode: 0,

    raster: 0,

    modeclocks: 0,

    ints: 0,

    reg: [],
    scanrow: [],
    tilemap: [],
    objdata: [],

    palette: {'bg': [], 'obj0': [], 'obj1': []},

    vram: [],
    spriteRam: [],

    // Update screen tiles
    updateTile: function(addr, val) {
        var saddr = addr
        if (addr & 1) {
            saddr --
            addr --
        }
        var tile = (addr >> 4)&511
        var y = (addr >> 1) & 7
        var sx
        for (var x=0; x < 8; x++) {
            sx = 1<<(7-x)
            GPU.tilemap[tile][y][x] = ((GPU.vram[saddr]&sx)?1:0) | ((GPU.vram[saddr+1]&sx)?2:0)
        }
    },

    // Update Sprites on screen
    updateOAM: function(addr, val) {
        addr -= 0xfe00
        var obj = addr >> 2
        if (obj < 40) {
            switch(addr & 3) {
                case 0:
                    GPU.objdata[obj].y = val-16
                    break;
                case 1:
                    GPU.objdata[obj].x = val-8
                    break;
                case 2:
                    if (GPU.objsize) {
                        GPU.objdata[obj].tile = (val & 0xfe)
                    } else {
                        GPU.objdata[obj].tile = val
                    }
                    break;
                case 3:
                    GPU.objdata[obj].palette = (val & 0x10)?1:0
                    GPU.objdata[obj].xflip = (val & 0x20)?1:0
                    GPU.objdata[obj].yflip = (val & 0x40)?1:0
                    GPU.objdata[obj].prio = (val & 0x80)?1:0
                    break;
            }
        }

        GPU.objdatasorted = GPU.objdata
        GPU.objdatasorted.sort(function(a,b) {
            if (a.x > b.x) {
                return -1
            }
            if (a.num > b.num) {
                return -1
            }
        });
    },

    // Reset GPU / Create canvas
    reset: function() {
        // reset vals
        for (var i = 0; i < 8192; i++) {
            GPU.vram[i] = 0
        }

        for (i = 0; i < 160; i++) {
            GPU.spriteRam[i] = 0
        }

        for (i = 0; i < 4; i++) {
            GPU.palette.bg[i] = 255
            GPU.palette.obj0[i] = 255
            GPU.palette.obj1[i] = 255
        }

        for (i = 0; i < 512; i++) {
            GPU.tilemap[i] = []

            for (j = 0; j < 8; j++) {
                GPU.tilemap[i][j] = []

                for (k = 0; k < 8; k++) {
                    GPU.tilemap[i][j][k] = 0
                }
            }
        }

        console.log("starting screen")

        // Initialize canvas
        canvas = document.getElementById('screen')
        if (canvas && canvas.getContext) {
            GPU.canvas = canvas.getContext('2d')

            if (!GPU.canvas) {
                console.log("Canvas not created")
            } else {
                if (GPU.canvas.createImageData) {
                    GPU.scrn = GPU.canvas.createImageData(160, 144)
                } else if (GPU.canvas.getImageData) {
                    GPU.scrn = GPU.canvas.getImageData(0, 0, 160, 144)
                } else {
                    GPU.scrn = {
                        'width': 160, 
                        'height': 144, 
                        'data': new Array(160*144*4)
                    }
                }

                // Set canvas to white
                for (var i = 0; i < 160*144*4; i++) {
                    GPU.scrn.data[i] = 255
                }
                GPU.canvas.putImageData(GPU.scrn, 0, 0)
            }
        }

        GPU.curline = 0
        GPU.curscan = 0
        GPU.linemode = 0
        GPU.modeclocks = 0
        GPU.yscrl = 0
        GPU.xscrl = 0
        GPU.raster = 0
        GPU.ints = 0
        GPU.lcdon = 0
        GPU.bgon = 0
        GPU.objon = 0
        GPU.winon = 0
        GPU.objsize = 0

        for (i = 0; i < 160; i++) {
            GPU.scanrow[i] = 0
        }

        for (i = 0; i < 40; i++) {
            GPU.objdata[i] = {'y':-16, 'x':8, 'tile':0, 'palette':0, 'yflip':0, 'xflip':0, 'prio':0, 'num':i}
        }

        GPU.bgtilebase = 0x0000
        GPU.bgmapbase = 0x1800
        GPU.wintilebase = 0x1800

        console.log("GPU reset")
    },

    checkline: function() {
        GPU.modeclocks += cpu.registers.m

        // Hblank
        if (GPU.linemode == 0) {
            if (GPU.modeclocks >= 51) {

                // End of hblank for last scanline and then render screen
                if (GPU.curline == 143) {
                    GPU.linemode = 1
                    GPU.canvas.putImageData(GPU.scrn, 0, 0)
                    MMU.if |= 1
                } else {
                    GPU.linemode = 2
                }

                GPU.curline ++
                GPU.curscan += 640
                GPU.modeclocks = 0
            }

            // vblank section
        } else if (GPU.linemode == 1) {
            if (GPU.modeclocks >= 114) {
                GPU.modeclocks = 0
                GPU.curline ++

                if (GPU.curline > 153) {
                    GPU.curline = 0
                    GPU.curscan = 0
                    GPU.linemode = 2
                }
            }
        
            // Sprite load section
        } else if (GPU.linemode == 2) {
            if (GPU.modeclocks >= 20) {
                GPU.modeclocks = 0
                GPU.linemode = 3
            }
        
            // VRAM load section
        } else if (GPU.linemode == 3) {
            // Render scanline at end of waiting time
            if (GPU.modeclocks >= 43) {
                GPU.modeclocks = 0
                GPU.linemode = 0
                if (GPU.lcdon) {
                    if (GPU.bgon) {
                        var linebase = GPU.curscan
                        var mapbase = GPU.bgmapbase + ((((GPU.curline + GPU.yscrl)&255)>>3)<<5)
                        var y = (GPU.curline + GPU.yscrl) & 7
                        var x = GPU.xscrl & 7
                        var t = (GPU.xscrl >> 3) & 31
                        var pixel
                        var w = 160

                        if (GPU.bgtilebase) {
                            var tile = GPU.vram[mapbase + t]

                            if (tile < 128) {
                                tile = 256 + tile
                            }

                            var tilerow = GPU.tilemap[tile][y]

                            do {
                                GPU.scanrow[160-x] = tilerow[x]
                                GPU.scrn.data[linebase + 3] = GPU.palette,bg[tilerow[x]]
                                x++

                                if (x == 8) {
                                    t = (t+1) & 31
                                    x = 0
                                    tile = GPU.vram[mapbase+t]                                    
                                    if (tile < 128) {
                                        tile = 256 + tile
                                    }
                                    tilerow = GPU.tilemap[tile][y]
                                }
                                linebase += 4
                            } while (--w)
                        } else {
                            var tilerow = GPU.tilemap[GPU.vram[mapbase + t]][y]
                            do {
                                GPU.scanrow[160-x] = tilerow[x]
                                GPU.scrn.data[linebase+3] = GPU.palette.bg[tilerow[x]]
                                x++
                                if (x == 8) {
                                    t = (t+1) & 31
                                    x = 0
                                    tilerow = GPU.tilemap[GPU.vram[mapbase+t]][y]
                                }
                                linebase += 4
                            } while (--w)
                        } 
                    }

                    if (GPU.objon) {
                        var cnt = 0
                        if (GPU.objsize) {
                            for (var i=0; i<40; i++) {}
                        } else {
                            var tilerow
                            var obj
                            var pal
                            var pixel
                            var x
                            var linebase = GPU.curscan

                            for (var i=0; i<40; i++) {
                                obj = GPU.objdatasorted[i]
                                if (obj.y <= GPU.curscan && (obj.y + 8) > GPU.curline) {
                                    if (obj.yflip) {
                                        tilerow = GPU.tilemap[obj.tile][7-(GPU.curline-obj.y)]
                                    } else {
                                        tilerow = GPU.tilemap[obj.tile][GPU.curline-obj.y]
                                    }

                                    if (obj.palette) {
                                        pal = GPU.palette.obj1
                                    } else {
                                        pal = GPU.pal.obj0
                                    }

                                    linebase = (GPU.curline * 160 + obj.x) * 4

                                    if (obj.xflip) {
                                        for (x = 0; x < 8; x++) {
                                            if (obj.x + x >= 0 && obj.x + x < 160) {
                                                if (tilerow[7-x] && (obj.prio || !GPU.scanrow[x])) {
                                                    GPU.scrn.data[linebase+3] = pal[tilerow[7-x]]
                                                }
                                            }

                                            linebase += 4
                                        }
                                    }

                                    else {
                                        for (x=0; x<8; x++) {
                                            if (obj.x + x >= 0 && obj.x + x < 160) {
                                                if (tilerow[x] && (obj.prio || !GPU.scanrow[x])) {
                                                    GPU.scrn.data[linebase+3] = pal[tilerow[x]]
                                                }
                                            }

                                            linebase += 4
                                        }
                                    }

                                    cnt ++
                                    if (cnt > 10) {
                                        break;
                                    }
                                }
                            }
                        }
                    }
                }
            }

            break;
        }
    },

    // read 8-bit byte
    readByte: function(addr) {
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
        var gaddr = addr - 0xff40
        GPU.reg[gaddr] = val

        if (gaddr == 0) {
            GPU.lcdon = (val & 0x80)? 1:0
            GPU.bgtilebase = (val & 0x10)? 0x0000:0x0800
            GPU.bgmapbase = (val & 0x08)? 0x1c00:0x1800
            GPU.objsize = (val & 0x04)? 1:0
            GPU.objon = (val & 0x02)? 1:0
            GPU.bgon = (val & 0x01)? 1:0
        } else if (gaddr == 2) {
            GPU.yscrl = val
        } else if (gaddr == 3) {
            GPU.xscrl = val
        } else if (gaddr == 5) {
            GPU.raster = val
        } else if (gaddr == 6) {                // sprite ram
            var v

            for (var i=0; i<160; i++) {
                v = MMU.readByte((val<<8)+i)
                GPU.spriteRam[i] = v
                GPU.updateOAM(0xfe00+i, v)
            }
        } else if (gaddr == 7) {                // Colour palette mapping
            for (var i=0; i<4; i++) {
                switch((val>>(i*2))&3) {
                    case 0:
                        GPU.palette.bg[i] = 255
                        break;
                    case 1:
                        GPU.palette.bg[i] = 192
                        break;
                    case 2:
                        GPU.palette.bg[i] = 96
                        break;
                    case 3:
                        GPU.palette.bg[i] = 0
                        break;
                }
            }
        } else if (gaddr == 8) {                // map obj0 to colours
            for (var i=0; i<4; i++) {
                switch((val>>(i*2))&3) {
                    case 0:
                        GPU.palette.obj0[i] = 255
                        break;
                    case 1:
                        GPU.palette.obj0[i] = 192
                        break;
                    case 2:
                        GPU.palette.obj0[i] = 96
                        break;
                    case 3:
                        GPU.palette.obj0[i] = 0
                        break;
                }
            }
        } else if (gaddr == 9) {                // map obj1 to colours
            for (var i=0; i<4; i++) {
                switch((val>>(i*2))&3) {
                    case 0:
                        GPU.palette.obj1[i] = 255
                        break;
                    case 1:
                        GPU.palette.obj1[i] = 192
                        break;
                    case 2:
                        GPU.palette.obj1[i] = 96
                        break;
                    case 3:
                        GPU.palette.obj1[i] = 0
                        break;
                }
            }
        }
    }
}

export default GPU