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
        
    // Read 8-bit byte from a given address
    readByte: function(addr) {
        switch(addr & 0xF000) {
            // ROM bank 0 (0000-3FFF)
            case 0x0000:

                
            
        }
    },

    // Read 16-bit word from a given address
    readWord: function(addr) {
        
    },

    // Write 8-bit byte to a given address
    writeByte: function(addr, val) {

    },

    // Write 16-bit word to a given address
    writeWord: function(addr, val) {

    }
};

export default MMU