//import cpu from './cpu.mjs'
//import GPU from './gpu.mjs'
///import JOYPAD from './joypad.mjs'
//import TIMER from './timer.mjs';
//import BinFileReader from './fileReader.mjs'


var MMU = {
    // Memmory (0x0000 - 0xFFFF)
        // ROM bank 0 (0x0000 - 0x3FFF)
            // Bios (0x0000 - 0x00FF)
            // Cartridge Header (0x0100 - 0x014F)
        // Rom Bank 1 (4000 - 7FFF)
        // GPU Ram (8000 - 9FFF)
        // External Ram (A000 - BFFF)
        // Working Ram (C000 - DFFF)
        // Working Ram Shadow (E000 - FDFF)
        // Sprite Info (FE00 - FE9F)
        // I/0 (FF00 - FF7F)
        // Zero-Page Ram (FF80 - FFFE)
        // Interrupt Enable Register (FFFF)

    // Var containing GB ROM
    rom: '',

    // List containing external, working and zero-page ram
    externalRam: [],
    workingRam: [],
    zeroPageRam: [],

    // Stores the type of cartridge that is currently on
    cartridgeType: 0,

    // Stores the state of the mem banks
    state: [
        {},
        {rombank: 0, rambank: 0, ramon: 0, mode: 0}
    ],

    // Var holding state of Interrupt Enable Register and Interrupt Flags
    interruptEnableRegister: 0,
    interruptFlag: 0,

    // Handles rom switching
    romOffset: 0x4000,

    // Handles ram switching
    ramOffset: 0,

    // Var keeping track of whether the system is in the bios or not
    inBios: 1,

    // Contains startup instructions for GB
    bios: [
        0x31, 0xFE, 0xFF, 0xAF, 0x21, 0xFF, 0x9F, 0x32, 0xCB, 0x7C, 0x20, 0xFB, 0x21, 0x26, 0xFF, 0x0E,
        0x11, 0x3E, 0x80, 0x32, 0xE2, 0x0C, 0x3E, 0xF3, 0xE2, 0x32, 0x3E, 0x77, 0x77, 0x3E, 0xFC, 0xE0,
        0x47, 0x11, 0x04, 0x01, 0x21, 0x10, 0x80, 0x1A, 0xCD, 0x95, 0x00, 0xCD, 0x96, 0x00, 0x13, 0x7B,
        0xFE, 0x34, 0x20, 0xF3, 0x11, 0xD8, 0x00, 0x06, 0x08, 0x1A, 0x13, 0x22, 0x23, 0x05, 0x20, 0xF9,
        0x3E, 0x19, 0xEA, 0x10, 0x99, 0x21, 0x2F, 0x99, 0x0E, 0x0C, 0x3D, 0x28, 0x08, 0x32, 0x0D, 0x20,
        0xF9, 0x2E, 0x0F, 0x18, 0xF3, 0x67, 0x3E, 0x64, 0x57, 0xE0, 0x42, 0x3E, 0x91, 0xE0, 0x40, 0x04,
        0x1E, 0x02, 0x0E, 0x0C, 0xF0, 0x44, 0xFE, 0x90, 0x20, 0xFA, 0x0D, 0x20, 0xF7, 0x1D, 0x20, 0xF2,
        0x0E, 0x13, 0x24, 0x7C, 0x1E, 0x83, 0xFE, 0x62, 0x28, 0x06, 0x1E, 0xC1, 0xFE, 0x64, 0x20, 0x06,
        0x7B, 0xE2, 0x0C, 0x3E, 0x87, 0xF2, 0xF0, 0x42, 0x90, 0xE0, 0x42, 0x15, 0x20, 0xD2, 0x05, 0x20,
        0x4F, 0x16, 0x20, 0x18, 0xCB, 0x4F, 0x06, 0x04, 0xC5, 0xCB, 0x11, 0x17, 0xC1, 0xCB, 0x11, 0x17,
        0x05, 0x20, 0xF5, 0x22, 0x23, 0x22, 0x23, 0xC9, 0xCE, 0xED, 0x66, 0x66, 0xCC, 0x0D, 0x00, 0x0B,
        0x03, 0x73, 0x00, 0x83, 0x00, 0x0C, 0x00, 0x0D, 0x00, 0x08, 0x11, 0x1F, 0x88, 0x89, 0x00, 0x0E,
        0xDC, 0xCC, 0x6E, 0xE6, 0xDD, 0xDD, 0xD9, 0x99, 0xBB, 0xBB, 0x67, 0x63, 0x6E, 0x0E, 0xEC, 0xCC,
        0xDD, 0xDC, 0x99, 0x9F, 0xBB, 0xB9, 0x33, 0x3E, 0x3c, 0x42, 0xB9, 0xA5, 0xB9, 0xA5, 0x42, 0x4C,
        0x21, 0x04, 0x01, 0x11, 0xA8, 0x00, 0x1A, 0x13, 0xBE, 0x20, 0xFE, 0x23, 0x7D, 0xFE, 0x34, 0x20,
        0xF5, 0x06, 0x19, 0x78, 0x86, 0x23, 0x05, 0x20, 0xFB, 0x86, 0x20, 0xFE, 0x3E, 0x01, 0xE0, 0x50
    ],

    // Reset values
    reset: function() {
        for (i = 0; i < 8192; i++) {
            MMU.workingRam[i] = 0
        }

        for (i = 0; i < 32768; i++) {
            MMU.externalRam[i] = 0
        }

        for (i = 0; i < 8192; i++) {
            MMU.zeroPageRam[i] = 0
        }

        MMU.inBios = 1
        MMU.interruptEnableRegister = 0
        MMU.interruptFlag = 0
        MMU.cartridgeType = 0
        MMU.state[0] = {}
        MMU.state[1] = {
            rombank: 0,
            rambank: 0,
            ramon: 0,
            mode: 0
        }
        MMU.romOffset = 0x4000
        MMU.ramOffset = 0
    },    

    // Load in a ROM
    load: function(file) {

        //fileReader = new BinFileReader(file)
        console.log("before Loaded (look for after)")
        //console.log(fileReader.getFileSize())
        //MMU.rom = fileReader.readString(fileReader.getFileSize(), 0)
        console.log("after loaded")
        console.log(MMU.rom)
        console.log("before cartridge type")
        MMU.cartridgeType = MMU.rom.charCodeAt(0x1047)
        console.log("after cartridge type")
    },
        
    // Read 8-bit byte from a given address
    readByte: function(addr) {
        if (0x0000 <= addr < 0x1000) {         // ROM bank 0 (0000-3FFF)
            // BIOS
            if (MMU.inBios) {
                if (addr < 256) {
                    return MMU.bios[addr]
                } else if (cpu.register.pc == 0x0100) {
                    MMU.inBios = 0
                }
            } else {
                return MMU.rom.charCodeAt(addr)
            }

        } else if (0x1000 <= addr < 0x4000) {             // Rest of ROM Bank 0
            return MMU.rom.charCodeAt(addr)

        } else if (0x4000 <= addr < 0x8000) {             // ROM Bank 1
            return MMU.rom.charCodeAt(MMU.romOffset+(addr&0x3FFF))

        } else if (0x8000 <= addr < 0xa000) {             // GPU RAM
            return GPU.vram[addr & 0x1fff]

        } else if (0xa000 <= addr < 0xc000) {             // External RAM
            return MMU.externalRam[MMU.ramOffset+(addr&0x1FFF)] 

        } else if (0xc000 <= addr < 0xf000) {             // Working Ram and shadow
            return MMU.workingRam[addr&0x1FFF]
            
        } else if (0xf000 <= addr < 0xfe00) {             // More Working Ram info, Sprite Info, I/O, Zero-Page Ram, Interrupt Enable Reg
            return MMU.workingRam[addr&0x1FFF]
        
        } else if (0xfe00 <= addr < 0xff00) {             // Sprites
            if ((addr & 0xFF) < 0xA0) {
                GPU.spriteRam[addr & 0xff]
            } else {
                return 0
            }
        
        } else if (0xff00 <= addr < 0xff7f) {             // I/O
            if (0xff00 <= addr < 0xff10) {
                if (addr == 0xff00) {
                    return JOYPAD.rb()                    // Joypad
                } else if (0xff04 <= addr < 0xff08) {
                    return TIMER.rb(addr)                 // Timer
                } else if (0xff0f <= addr < 0xff10) {     // Interrup Flags
                    return MMU.interruptFlag
                } else {
                    return 0
                }

            } else if (0xff10 <= addr < 0xff40) {
                return 0

            } else if (0xff40 <= addr < 0xff80) {
                GPU.rb(addr)
            }

            
        
        } else if (0xff80 <= addr < 0xfffe) {             // Zero-Page Ram
            return MMU.zeroPageRam[addr&0x7f]
        
        } else if (addr == 0xffff) {                      // Interrupt Enable Register
            return MMU.interruptEnableRegister
        } 
        
    },

    // Read 16-bit word from a given address
    readWord: function(addr) {
        return (MMU.readByte(addr) + (MMU.readByte(addr + 1) << 8))
    },

    // Write 8-bit byte to a given address
    writeByte: function(addr, val) {
        if (0x0000 <= addr < 0x2000) {                      // Rom Bank 0
            // Turn on external ram
            if (MMU.cartridgeType == 1) {
                MMU.state[1].ramon = ((val & 0xf) == 0xa)? 1 : 0
            }
        
        } else if (0x2000 <= addr < 0x4000) {
            // ROM Bank Switch
            if (MMU.cartridgeType == 1) {
                MMU.state[1].rombank &= 0x60
                
                val &= 0x1f
                if (!val) {
                    val = 1
                }

                MMU.state[1].rombank |= val

                MMU.romOffset = MMU.state[1].rombank * 0x4000
            }
        
        } else if (0x4000 <= addr < 0x6000) {                   // Rom Bank 1
            // RAM Bank Switch
            if (MMU.cartridgeType == 1) {
                if (MMU.state[1].mode) {
                    MMU.state[1].rambank = (val & 3)
                    MMU.ramOffset = MMU.state[1].rambank * 0x2000
                } else {
                    MMU.state[1].rombank &= 0x1f
                    MMU.state[1].rombank = ((val&3)<<5)
                    MMU.romOffset = MMU.state[1].rombank * 0x4000
                }
            }
        
        } else if (0x6000 <= addr < 0x8000) {                   // Rest of ROM Bank 1
            if (MMU.cartridgeType == 1) {
                MMU.state[1].mode = val
            }
        
        } else if (0x8000 <= addr < 0xa000) {                   // GPU RAM
            // Set GPU RAM
        
        } else if (0xa000 <= addr < 0xc000) {                   // External RAM
            MMU.externalRam[MMU.ramOffset + (addr & 0x1fff)] = val
        
        } else if (0xc000 <= addr < 0xf000) {                   // Working RAM and Shadow
            MMU.workingRam[addr & 0x1fff] = val
        


        } else if (0xf000 <= addr < 0xfe00) {             // More Working Ram info, Sprite Info, I/O, Zero-Page Ram, Interrupt Enable Reg
            return MMU.workingRam[addr & 0x1FFF] = val
        
        } else if (0xfe00 <= addr < 0xff00) {             // Sprites
            if ((addr & 0xFF) < 0xA0) {
                // set/update sprites in GPU
            } 
        
        } else if (0xff00 <= addr < 0xff7f) {             // I/O
            if (0xff00 <= addr < 0xff10) {
                if (addr == 0xff00) {
                    // JOYP
                } else if (0xff04 <= addr < 0xff08) {
                    // Timer
                } else if (0xff0f <= addr < 0xff10) {     // Interrup Flags
                    MMU.interruptFlag = val
                } 

            } else if (0xff10 <= addr < 0xff40) {
                return 0

            } else if (0xff40 <= addr < 0xff80) {
                // Read info from GPU mem addr
            }
        
        } else if (0xff80 <= addr < 0xfffe) {             // Zero-Page Ram
            MMU.zeroPageRam[addr&0x7f] = val
        
        } else if (addr == 0xffff) {                      // Interrupt Enable Register
            MMU.interruptEnableRegister = val
        }
    },

    // Write 16-bit word to a given address
    writeWord: function(addr, val) {
        MMU.writeByte(addr, val & 255)
        MMU.writeByte(addr + 1, val >> 8)
    }
};

//export default MMU

MMU.load('./rom/ttt.gb')