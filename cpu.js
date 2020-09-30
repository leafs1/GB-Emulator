// If not flag, set it to 0x7f


// Hold the internal state vals
var cpu = {
    // time clock
    clock: {m:0},
    
    //initialize registers (a-f = 8-bit, pc and sp = 16-bit, m and t for clock)
    registers: {
        a:0, b:0, c:0, d:0, e:0, h:0, l:0, f:0, pc:0, sp:0, m:0
    },    
}

// Hold all processing operations done by the cpu
var operations = {

    // Processing Data ------------------------------------------------------------------------------------------------------------
    // Adding A to all registers
    AddAA: function() {
        cpu.registers.a += cpu.registers.a    // Addition
        
        // if result is greater than 255 (or not enough space in 8-bits)
        if (cpu.registers.a > 255) {          // Check for carry flag
            cpu.registers.f = 0x10
        } else {
            cpu.registers.f = 0
        }

        cpu.registers.a &= 255                // Convert to 8-bits

        // if a val when added to 255 with bitewise and is zero, ! in front returns true
        if (!(cpu.registers.a & 255)) {       // Check for zero flag
            cpu.registers.f |= 0x80 
        }        

        // check if operation overflows past 15 (00001111). There has to be a bit carry between the 3rd and 4th (index).
        if ((((cpu.registers.a & 0xF) + (cpu.registers.a & 0xF)) & 0x10) == 0x10) {     // Check for half-carry flag https://robdor.com/2016/08/10/gameboy-emulator-half-carry-flag/
            cpu.registers.f |= 0x20
        }

        cpu.registers.m = 1                   // 1 machine cycle (culmination of 4 clock cycles)

    },
    AddAB: function() {
        cpu.registers.a += cpu.registers.b; cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255;
        if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if ((((cpu.registers.a & 0xF) + (cpu.registers.b & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                      
    },
    AddAC: function() {
        cpu.registers.a += cpu.registers.c; cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255;
        if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if ((((cpu.registers.a & 0xF) + (cpu.registers.c & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                        
    },
    AddAD: function() {
        cpu.registers.a += cpu.registers.d; cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255;
        if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if ((((cpu.registers.a & 0xF) + (cpu.registers.d & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                        
    },
    AddAE: function() {
        cpu.registers.a += cpu.registers.e; cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255;
        if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if ((((cpu.registers.a & 0xF) + (cpu.registers.e & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                       
    },
    AddAH: function() {
        cpu.registers.a += cpu.registers.h; cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255;
        if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if ((((cpu.registers.a & 0xF) + (cpu.registers.h & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                         
    },
    AddAL: function() {
        cpu.registers.a += cpu.registers.l; cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255;
        if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if ((((cpu.registers.a & 0xF) + (cpu.registers.l & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                          
    },

    // inputted register and C flag are added to A
    ADCr_b: function(){
        cpu.registers.a += b
        cpu.registers.a += (cpu.registers.f & 0x10)?1:0
        
        if (cpu.registers.a > 255) {          // Check for carry flag
            cpu.registers.f = 0x10
        } else {
            cpu.registers.f = 0
        }

        cpu.registers.a &= 255                // Convert to 8-bits

        // if a val when added to 255 with bitewise and is zero, ! in front returns true
        if (!(cpu.registers.a & 255)) {       // Check for zero flag
            cpu.registers.f |= 0x80 
        }        

        // check if operation overflows past 15 (00001111). There has to be a bit carry between the 3rd and 4th (index).
        if ((((cpu.registers.a & 0xF) + (cpu.registers.a & 0xF)) & 0x10) == 0x10) {     // Check for half-carry flag https://robdor.com/2016/08/10/gameboy-emulator-half-carry-flag/
            cpu.registers.f |= 0x20
        }

        cpu.registers.m = 1                   // 1 machine cycle (culmination of 4 clock cycles)
    },
    ADCr_c: function() {
        cpu.registers.a += cpu.registers.c; cpu.registers.a += (cpu.registers.f & 0x10)?1:0;
        cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255; if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if ((((cpu.registers.a & 0xF) + (cpu.registers.c & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                        
    },
    ADCr_d: function() {
        cpu.registers.a += cpu.registers.d;cpu.registers.a += (cpu.registers.f & 0x10)?1:0;
        cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255; if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if ((((cpu.registers.a & 0xF) + (cpu.registers.d & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                        
    },
    ADCr_e: function() {
        cpu.registers.a += cpu.registers.e; cpu.registers.a += (cpu.registers.f & 0x10)?1:0;
        cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255; if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if ((((cpu.registers.a & 0xF) + (cpu.registers.e & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                       
    },
    ADCr_h: function() {
        cpu.registers.a += cpu.registers.h; cpu.registers.a += (cpu.registers.f & 0x10)?1:0;
        cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255; if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if ((((cpu.registers.a & 0xF) + (cpu.registers.h & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                         
    },
    ADCr_l: function() {
        cpu.registers.a += cpu.registers.l; cpu.registers.a += (cpu.registers.f & 0x10)?1:0;
        cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255; if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if ((((cpu.registers.a & 0xF) + (cpu.registers.l & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                          
    },
    ADCr_a: function() {
        cpu.registers.a += cpu.registers.a; cpu.registers.a += (cpu.registers.f & 0x10)?1:0;
        cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255; if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if ((((cpu.registers.a & 0xF) + (cpu.registers.a & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                          
    },

    // Subtraction from a that doesnt update a but it updates the flags if it were to happen
    CPab: function() { 
        var temp = cpu.registers.a
        temp -= cpu.registers.b
        
        // Check for Carry / reset f
        if (temp < 0) {          
            cpu.registers.f = 0x10
        } else {
            cpu.registers.f = 0
        }

        // Mask temp to 8-bits
        temp &= 255

        // identifies subtraction
        cpu.registers.f |= 0x40

        // Check for zero flag
        if (!(temp & 255)) {cpu.registers.f |= 0x80}

        //Check for half carry
        if((cpu.registers.a^cpu.registers.b^temp)&0x10 == 0x10) {cpu.registers.f|=0x20}

        // 1 Machine cycle and 4 clock cycles
        cpu.registers.m = 1
    },
    CPac: function() {var temp=cpu.registers.a;temp-=cpu.registers.c; cpu.registers.f=(temp < 0)?0x10:0; temp&=255; cpu.registers.f |= 0x40; 
            if(!(temp & 255)){cpu.registers.f |= 0x80};if((cpu.registers.a^cpu.registers.c^temp)&0x10 == 0x10) {cpu.registers.f|=0x20};
            cpu.registers.m = 1;      
    },
    CPad: function() {var temp=cpu.registers.a;temp-=cpu.registers.d; cpu.registers.f=(temp < 0)?0x10:0; temp&=255; cpu.registers.f |= 0x40; 
            if(!(temp & 255)){cpu.registers.f |= 0x80};if((cpu.registers.a^cpu.registers.d^temp)&0x10 == 0x10) {cpu.registers.f|=0x20};
            cpu.registers.m = 1;      
    },
    CPae: function() {var temp=cpu.registers.a;temp-=cpu.registers.e; cpu.registers.f=(temp < 0)?0x10:0; temp&=255; cpu.registers.f |= 0x40; 
            if(!(temp & 255)){cpu.registers.f |= 0x80};if((cpu.registers.a^cpu.registers.e^temp)&0x10 == 0x10) {cpu.registers.f|=0x20};
            cpu.registers.m = 1;      
    },
    CPah: function() {var temp=cpu.registers.a;temp-=cpu.registers.h; cpu.registers.f=(temp < 0)?0x10:0; temp&=255; cpu.registers.f |= 0x40; 
            if(!(temp & 255)){cpu.registers.f |= 0x80};if((cpu.registers.a^cpu.registers.h^temp)&0x10 == 0x10) {cpu.registers.f|=0x20};
            cpu.registers.m = 1;      
    },
    CPal: function() {var temp=cpu.registers.a;temp-=cpu.registers.l; cpu.registers.f=(temp < 0)?0x10:0; temp&=255; cpu.registers.f |= 0x40; 
            if(!(temp & 255)){cpu.registers.f |= 0x80};if((cpu.registers.a^cpu.registers.l^temp)&0x10 == 0x10) {cpu.registers.f|=0x20};
            cpu.registers.m = 1;      
    },
    CPaa: function() {var temp=cpu.registers.a;temp-=cpu.registers.a; cpu.registers.f=(temp < 0)?0x10:0; temp&=255; cpu.registers.f |= 0x40; 
            if(!(temp & 255)){cpu.registers.f |= 0x80};if((cpu.registers.a^cpu.registers.a^temp)&0x10 == 0x10) {cpu.registers.f|=0x20};
            cpu.registers.m = 1;      
    },

    // Subtract any reg from a
    SUBr_b: function() {
        cpu.registers.a -= cpu.registers.b; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.a&=255; cpu.registers.f |= 0x40; 
        if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.b & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
        cpu.registers.m = 1;      
    },
    SUBr_c: function() {
        cpu.registers.a -= cpu.registers.c; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.a&=255; cpu.registers.f |= 0x40; 
        if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.c & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
        cpu.registers.m = 1;      
    },
    SUBr_d: function() {
        cpu.registers.a -= cpu.registers.d; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.a&=255; cpu.registers.f |= 0x40; 
        if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.d & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
        cpu.registers.m = 1;      
    },
    SUBr_e: function() {
        cpu.registers.a -= cpu.registers.e; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.a&=255; cpu.registers.f |= 0x40; 
        if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.e & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
        cpu.registers.m = 1;      
    },
    SUBr_h: function() {
        cpu.registers.a -= cpu.registers.h; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.a&=255; cpu.registers.f |= 0x40; 
        if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.h & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
        cpu.registers.m = 1;      
    },
    SUBr_l: function() {
        cpu.registers.a -= cpu.registers.l; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.a&=255; cpu.registers.f |= 0x40; 
        if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.l & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
        cpu.registers.m = 1;      
    },
    SUBr_a: function() {
        cpu.registers.a -= cpu.registers.a; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.a&=255; cpu.registers.f |= 0x40; 
        if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.a & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
        cpu.registers.m = 1;      
    },

    // register and carry flag are subtracted from A
    SBCr_b: function(){
        cpu.registers.a -= cpu.registers.b; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
        cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.a&=255; cpu.registers.f |= 0x40; 
        if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.b & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
        cpu.registers.m = 1;
    },
    SBCr_c: function(){
        cpu.registers.a -= cpu.registers.c; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
        cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.a&=255; cpu.registers.f |= 0x40; 
        if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.c & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
        cpu.registers.m = 1;
    },
    SBCr_d: function(){
        cpu.registers.a -= cpu.registers.d; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
        cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.a&=255; cpu.registers.f |= 0x40; 
        if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.d & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
        cpu.registers.m = 1;
    },
    SBCr_e: function(){
        cpu.registers.a -= cpu.registers.e; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
        cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.a&=255; cpu.registers.f |= 0x40; 
        if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.e & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
        cpu.registers.m = 1;
    },
    SBCr_h: function(){
        cpu.registers.a -= cpu.registers.h; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
        cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.a&=255; cpu.registers.f |= 0x40; 
        if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.h & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
        cpu.registers.m = 1;
    },
    SBCr_l: function(){
        cpu.registers.a -= cpu.registers.l; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
        cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.a&=255; cpu.registers.f |= 0x40; 
        if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.l & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
        cpu.registers.m = 1;
    },
    SBCr_a: function(){
        cpu.registers.a -= cpu.registers.a; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
        cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.a&=255; cpu.registers.f |= 0x40; 
        if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.a & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
        cpu.registers.m = 1;
    },

    // Adjust A reg for BCD addition and subtraction
    DAA: function(){var a=Z80._r.a; if((Z80._r.f&0x20)||((Z80._r.a&15)>9)) Z80._r.a+=6; Z80._r.f&=0xEF; 
        if((Z80._r.f&0x20)||(a>0x99)) { Z80._r.a+=0x60; Z80._r.f|=0x10; } Z80._r.m=1;
    },

    // AND operation on registers
    ANDr_b: function(){cpu.registers.a &= cpu.registers.b; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    ANDr_c: function(){cpu.registers.a &= cpu.registers.c; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    ANDr_d: function(){cpu.registers.a &= cpu.registers.d; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    ANDr_e: function(){cpu.registers.a &= cpu.registers.e; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    ANDr_h: function(){cpu.registers.a &= cpu.registers.h; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    ANDr_l: function(){cpu.registers.a &= cpu.registers.l; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    ANDr_a: function(){cpu.registers.a &= cpu.registers.a; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},

    // OR operation on registers
    ORr_b: function(){cpu.registers.a |= cpu.registers.b; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    ORr_c: function(){cpu.registers.a |= cpu.registers.c; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    ORr_d: function(){cpu.registers.a |= cpu.registers.d; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    ORr_e: function(){cpu.registers.a |= cpu.registers.e; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    ORr_h: function(){cpu.registers.a |= cpu.registers.h; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    ORr_l: function(){cpu.registers.a |= cpu.registers.l; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    ORr_a: function(){cpu.registers.a |= cpu.registers.a; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},

    // XOR operation on registers
    XORr_b: function(){cpu.registers.a ^= cpu.registers.b; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    XORr_c: function(){cpu.registers.a ^= cpu.registers.c; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    XORr_d: function(){cpu.registers.a ^= cpu.registers.d; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    XORr_e: function(){cpu.registers.a ^= cpu.registers.e; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    XORr_h: function(){cpu.registers.a ^= cpu.registers.h; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    XORr_l: function(){cpu.registers.a ^= cpu.registers.l; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
    XORr_a: function(){cpu.registers.a ^= cpu.registers.a; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},

    // Increment register
    INCb: function() {cpu.registers.b ++; cpu.registers.b&=255; cpu.registers.f=cpu.registers.b?0:0x80; cpu.registers.m=1;},
    INCc: function() {cpu.registers.c ++; cpu.registers.c&=255; cpu.registers.f=cpu.registers.c?0:0x80; cpu.registers.m=1;},
    INCd: function() {cpu.registers.d ++; cpu.registers.d&=255; cpu.registers.f=cpu.registers.d?0:0x80; cpu.registers.m=1;},
    INCe: function() {cpu.registers.e ++; cpu.registers.e&=255; cpu.registers.f=cpu.registers.e?0:0x80; cpu.registers.m=1;},
    INCh: function() {cpu.registers.h ++; cpu.registers.h&=255; cpu.registers.f=cpu.registers.h?0:0x80; cpu.registers.m=1;},
    INCl: function() {cpu.registers.l ++; cpu.registers.l&=255; cpu.registers.f=cpu.registers.l?0:0x80; cpu.registers.m=1;},
    INCa: function() {cpu.registers.a ++; cpu.registers.a&=255; cpu.registers.f=cpu.registers.a?0:0x80; cpu.registers.m=1;},

    // Decrement register
    DECb: function() {cpu.registers.b --; cpu.registers.b&=255; cpu.registers.f=cpu.registers.b?0:0x80; cpu.registers.m=1;},
    DECc: function() {cpu.registers.c --; cpu.registers.c&=255; cpu.registers.f=cpu.registers.c?0:0x80; cpu.registers.m=1;},
    DECd: function() {cpu.registers.d --; cpu.registers.d&=255; cpu.registers.f=cpu.registers.d?0:0x80; cpu.registers.m=1;},
    DECe: function() {cpu.registers.e --; cpu.registers.e&=255; cpu.registers.f=cpu.registers.e?0:0x80; cpu.registers.m=1;},
    DECh: function() {cpu.registers.h --; cpu.registers.h&=255; cpu.registers.f=cpu.registers.h?0:0x80; cpu.registers.m=1;},
    DECl: function() {cpu.registers.l --; cpu.registers.l&=255; cpu.registers.f=cpu.registers.l?0:0x80; cpu.registers.m=1;},
    DECa: function() {cpu.registers.a --; cpu.registers.a&=255; cpu.registers.f=cpu.registers.a?0:0x80; cpu.registers.m=1;},

    
    // Bit Manupulation ------------------------------------------------------------------------------------------------------------
    // Test bit at index with register
    BIT0b: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.b&0x01)?0:0x80; cpu.registers.m=2;},
    BIT0c: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.c&0x01)?0:0x80; cpu.registers.m=2;},
    BIT0d: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.d&0x01)?0:0x80; cpu.registers.m=2;},
    BIT0e: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.e&0x01)?0:0x80; cpu.registers.m=2;},
    BIT0h: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.h&0x01)?0:0x80; cpu.registers.m=2;},
    BIT0l: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.l&0x01)?0:0x80; cpu.registers.m=2;},
    BIT0a: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.a&0x01)?0:0x80; cpu.registers.m=2;},

    BIT1b: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.b&0x02)?0:0x80; cpu.registers.m=2;},
    BIT1c: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.c&0x02)?0:0x80; cpu.registers.m=2;},
    BIT1d: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.d&0x02)?0:0x80; cpu.registers.m=2;},
    BIT1e: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.e&0x02)?0:0x80; cpu.registers.m=2;},
    BIT1h: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.h&0x02)?0:0x80; cpu.registers.m=2;},
    BIT1l: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.l&0x02)?0:0x80; cpu.registers.m=2;},
    BIT1a: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.a&0x02)?0:0x80; cpu.registers.m=2;},
    
    BIT2b: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.b&0x03)?0:0x80; cpu.registers.m=2;},
    BIT2c: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.c&0x03)?0:0x80; cpu.registers.m=2;},
    BIT2d: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.d&0x03)?0:0x80; cpu.registers.m=2;},
    BIT2e: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.e&0x03)?0:0x80; cpu.registers.m=2;},
    BIT2h: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.h&0x03)?0:0x80; cpu.registers.m=2;},
    BIT2l: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.l&0x03)?0:0x80; cpu.registers.m=2;},
    BIT2a: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.a&0x03)?0:0x80; cpu.registers.m=2;},

    BIT3b: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.b&0x04)?0:0x80; cpu.registers.m=2;},
    BIT3c: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.c&0x04)?0:0x80; cpu.registers.m=2;},
    BIT3d: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.d&0x04)?0:0x80; cpu.registers.m=2;},
    BIT3e: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.e&0x04)?0:0x80; cpu.registers.m=2;},
    BIT3h: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.h&0x04)?0:0x80; cpu.registers.m=2;},
    BIT3l: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.l&0x04)?0:0x80; cpu.registers.m=2;},
    BIT3a: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.a&0x04)?0:0x80; cpu.registers.m=2;},

    BIT4b: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.b&0x05)?0:0x80; cpu.registers.m=2;},
    BIT4c: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.c&0x05)?0:0x80; cpu.registers.m=2;},
    BIT4d: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.d&0x05)?0:0x80; cpu.registers.m=2;},
    BIT4e: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.e&0x05)?0:0x80; cpu.registers.m=2;},
    BIT4h: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.h&0x05)?0:0x80; cpu.registers.m=2;},
    BIT4l: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.l&0x05)?0:0x80; cpu.registers.m=2;},
    BIT4a: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.a&0x05)?0:0x80; cpu.registers.m=2;},

    BIT5b: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.b&0x06)?0:0x80; cpu.registers.m=2;},
    BIT5c: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.c&0x06)?0:0x80; cpu.registers.m=2;},
    BIT5d: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.d&0x06)?0:0x80; cpu.registers.m=2;},
    BIT5e: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.e&0x06)?0:0x80; cpu.registers.m=2;},
    BIT5h: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.h&0x06)?0:0x80; cpu.registers.m=2;},
    BIT5l: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.l&0x06)?0:0x80; cpu.registers.m=2;},
    BIT5a: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.a&0x06)?0:0x80; cpu.registers.m=2;},

    BIT6b: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.b&0x07)?0:0x80; cpu.registers.m=2;},
    BIT6c: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.c&0x07)?0:0x80; cpu.registers.m=2;},
    BIT6d: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.d&0x07)?0:0x80; cpu.registers.m=2;},
    BIT6e: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.e&0x07)?0:0x80; cpu.registers.m=2;},
    BIT6h: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.h&0x07)?0:0x80; cpu.registers.m=2;},
    BIT6l: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.l&0x07)?0:0x80; cpu.registers.m=2;},
    BIT6a: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.a&0x07)?0:0x80; cpu.registers.m=2;},

    BIT7b: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.b&0x08)?0:0x80; cpu.registers.m=2;},
    BIT7c: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.c&0x08)?0:0x80; cpu.registers.m=2;},
    BIT7d: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.d&0x08)?0:0x80; cpu.registers.m=2;},
    BIT7e: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.e&0x08)?0:0x80; cpu.registers.m=2;},
    BIT7h: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.h&0x08)?0:0x80; cpu.registers.m=2;},
    BIT7l: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.l&0x08)?0:0x80; cpu.registers.m=2;},
    BIT7a: function() {cpu.registers.f&=0x1F; cpu.registers.f|=0x20; cpu.registers.f=(cpu.registers.a&0x08)?0:0x80; cpu.registers.m=2;},

    // Resets bit b in register
    RES0b: function(){cpu.registers.b &= 0xFE; cpu.registers.m = 2}, RES0c: function(){cpu.registers.c &= 0xFE; cpu.registers.m = 2},
    RES0d: function(){cpu.registers.d &= 0xFE; cpu.registers.m = 2}, RES0e: function(){cpu.registers.e &= 0xFE; cpu.registers.m = 2},
    RES0h: function(){cpu.registers.h &= 0xFE; cpu.registers.m = 2}, RES0l: function(){cpu.registers.l &= 0xFE; cpu.registers.m = 2},
    RES0a: function(){cpu.registers.a &= 0xFE; cpu.registers.m = 2},

    RES1b: function(){cpu.registers.b &= 0xFD; cpu.registers.m = 2}, RES1c: function(){cpu.registers.c &= 0xFD; cpu.registers.m = 2},
    RES1d: function(){cpu.registers.d &= 0xFD; cpu.registers.m = 2}, RES1e: function(){cpu.registers.e &= 0xFD; cpu.registers.m = 2},
    RES1h: function(){cpu.registers.h &= 0xFD; cpu.registers.m = 2}, RES1l: function(){cpu.registers.l &= 0xFD; cpu.registers.m = 2},
    RES1a: function(){cpu.registers.a &= 0xFD; cpu.registers.m = 2},

    RES2b: function(){cpu.registers.b &= 0xFB; cpu.registers.m = 2}, RES2c: function(){cpu.registers.c &= 0xFB; cpu.registers.m = 2},
    RES2d: function(){cpu.registers.d &= 0xFB; cpu.registers.m = 2}, RES2e: function(){cpu.registers.e &= 0xFB; cpu.registers.m = 2},
    RES2h: function(){cpu.registers.h &= 0xFB; cpu.registers.m = 2}, RES2l: function(){cpu.registers.l &= 0xFB; cpu.registers.m = 2},
    RES2a: function(){cpu.registers.a &= 0xFB; cpu.registers.m = 2},

    RES3b: function(){cpu.registers.b &= 0xF7; cpu.registers.m = 2}, RES3c: function(){cpu.registers.c &= 0xF7; cpu.registers.m = 2},
    RES3d: function(){cpu.registers.d &= 0xF7; cpu.registers.m = 2}, RES3e: function(){cpu.registers.e &= 0xF7; cpu.registers.m = 2},
    RES3h: function(){cpu.registers.h &= 0xF7; cpu.registers.m = 2}, RES3l: function(){cpu.registers.l &= 0xF7; cpu.registers.m = 2},
    RES3a: function(){cpu.registers.a &= 0xF7; cpu.registers.m = 2},

    RES4b: function(){cpu.registers.b &= 0xEF; cpu.registers.m = 2}, RES4c: function(){cpu.registers.c &= 0xEF; cpu.registers.m = 2},
    RES4d: function(){cpu.registers.d &= 0xEF; cpu.registers.m = 2}, RES4e: function(){cpu.registers.e &= 0xEF; cpu.registers.m = 2},
    RES4h: function(){cpu.registers.h &= 0xEF; cpu.registers.m = 2}, RES4l: function(){cpu.registers.l &= 0xEF; cpu.registers.m = 2},
    RES4a: function(){cpu.registers.a &= 0xEF; cpu.registers.m = 2},

    RES5b: function(){cpu.registers.b &= 0xDF; cpu.registers.m = 2}, RES5c: function(){cpu.registers.c &= 0xDF; cpu.registers.m = 2},
    RES5d: function(){cpu.registers.d &= 0xDF; cpu.registers.m = 2}, RES5e: function(){cpu.registers.e &= 0xDF; cpu.registers.m = 2},
    RES5h: function(){cpu.registers.h &= 0xDF; cpu.registers.m = 2}, RES5l: function(){cpu.registers.l &= 0xDF; cpu.registers.m = 2},
    RES5a: function(){cpu.registers.a &= 0xDF; cpu.registers.m = 2},

    RES6b: function(){cpu.registers.b &= 0xBF; cpu.registers.m = 2}, RES6c: function(){cpu.registers.c &= 0xBF; cpu.registers.m = 2},
    RES6d: function(){cpu.registers.d &= 0xBF; cpu.registers.m = 2}, RES6e: function(){cpu.registers.e &= 0xBF; cpu.registers.m = 2},
    RES6h: function(){cpu.registers.h &= 0xBF; cpu.registers.m = 2}, RES6l: function(){cpu.registers.l &= 0xBF; cpu.registers.m = 2},
    RES6a: function(){cpu.registers.a &= 0xBF; cpu.registers.m = 2},

    RES7b: function(){cpu.registers.b &= 0x7F; cpu.registers.m = 2}, RES7c: function(){cpu.registers.c &= 0x7F; cpu.registers.m = 2},
    RES7d: function(){cpu.registers.d &= 0x7F; cpu.registers.m = 2}, RES7e: function(){cpu.registers.e &= 0x7F; cpu.registers.m = 2},
    RES7h: function(){cpu.registers.h &= 0x7F; cpu.registers.m = 2}, RES7l: function(){cpu.registers.l &= 0x7F; cpu.registers.m = 2},
    RES7a: function(){cpu.registers.a &= 0x7F; cpu.registers.m = 2},
    
    // set the bit in the register
    SET0b: function() { cpu.registers.b|=0x01; cpu.registers.m=2;}, SET0c: function() { cpu.registers.c|=0x01; cpu.registers.m=2;},
    SET0d: function() { cpu.registers.d|=0x01; cpu.registers.m=2;}, SET0e: function() { cpu.registers.e|=0x01; cpu.registers.m=2;},
    SET0h: function() { cpu.registers.h|=0x01; cpu.registers.m=2;}, SET0l: function() { cpu.registers.l|=0x01; cpu.registers.m=2;},
    SET0a: function() { cpu.registers.a|=0x01; cpu.registers.m=2;},
    
    SET1b: function() { cpu.registers.b|=0x02; cpu.registers.m=2;}, SET1c: function() { cpu.registers.c|=0x02; cpu.registers.m=2;},
    SET1d: function() { cpu.registers.d|=0x02; cpu.registers.m=2;}, SET1e: function() { cpu.registers.e|=0x02; cpu.registers.m=2;},
    SET1h: function() { cpu.registers.h|=0x02; cpu.registers.m=2;}, SET1l: function() { cpu.registers.l|=0x02; cpu.registers.m=2;},
    SET1a: function() { cpu.registers.a|=0x02; cpu.registers.m=2;},

    SET2b: function() { cpu.registers.b|=0x04; cpu.registers.m=2;}, SET2c: function() { cpu.registers.c|=0x04; cpu.registers.m=2;},
    SET2d: function() { cpu.registers.d|=0x04; cpu.registers.m=2;}, SET2e: function() { cpu.registers.e|=0x04; cpu.registers.m=2;},
    SET2h: function() { cpu.registers.h|=0x04; cpu.registers.m=2;}, SET2l: function() { cpu.registers.l|=0x04; cpu.registers.m=2;},
    SET2a: function() { cpu.registers.a|=0x04; cpu.registers.m=2;},

    SET3b: function() { cpu.registers.b|=0x08; cpu.registers.m=2;}, SET3c: function() { cpu.registers.c|=0x08; cpu.registers.m=2;},
    SET3d: function() { cpu.registers.d|=0x08; cpu.registers.m=2;}, SET3e: function() { cpu.registers.e|=0x08; cpu.registers.m=2;},
    SET3h: function() { cpu.registers.h|=0x08; cpu.registers.m=2;}, SET3l: function() { cpu.registers.l|=0x08; cpu.registers.m=2;},
    SET3a: function() { cpu.registers.a|=0x08; cpu.registers.m=2;},

    SET4b: function() { cpu.registers.b|=0x10; cpu.registers.m=2;}, SET4c: function() { cpu.registers.c|=0x10; cpu.registers.m=2;},
    SET4d: function() { cpu.registers.d|=0x10; cpu.registers.m=2;}, SET4e: function() { cpu.registers.e|=0x10; cpu.registers.m=2;},
    SET4h: function() { cpu.registers.h|=0x10; cpu.registers.m=2;}, SET4l: function() { cpu.registers.l|=0x10; cpu.registers.m=2;},
    SET4a: function() { cpu.registers.a|=0x10; cpu.registers.m=2;},

    SET5b: function() { cpu.registers.b|=0x20; cpu.registers.m=2;}, SET5c: function() { cpu.registers.c|=0x20; cpu.registers.m=2;},
    SET5d: function() { cpu.registers.d|=0x20; cpu.registers.m=2;}, SET5e: function() { cpu.registers.e|=0x20; cpu.registers.m=2;},
    SET5h: function() { cpu.registers.h|=0x20; cpu.registers.m=2;}, SET5l: function() { cpu.registers.l|=0x20; cpu.registers.m=2;},
    SET5a: function() { cpu.registers.a|=0x20; cpu.registers.m=2;},

    SET6b: function() { cpu.registers.b|=0x40; cpu.registers.m=2;}, SET6c: function() { cpu.registers.c|=0x40; cpu.registers.m=2;},
    SET6d: function() { cpu.registers.d|=0x40; cpu.registers.m=2;}, SET6e: function() { cpu.registers.e|=0x40; cpu.registers.m=2;},
    SET6h: function() { cpu.registers.h|=0x40; cpu.registers.m=2;}, SET6l: function() { cpu.registers.l|=0x40; cpu.registers.m=2;},
    SET6a: function() { cpu.registers.a|=0x40; cpu.registers.m=2;},

    SET7b: function() { cpu.registers.b|=0x80; cpu.registers.m=2;}, SET7c: function() { cpu.registers.c|=0x80; cpu.registers.m=2;},
    SET7d: function() { cpu.registers.d|=0x80; cpu.registers.m=2;}, SET7e: function() { cpu.registers.e|=0x80; cpu.registers.m=2;},
    SET7h: function() { cpu.registers.h|=0x80; cpu.registers.m=2;}, SET7l: function() { cpu.registers.l|=0x80; cpu.registers.m=2;},
    SET7a: function() { cpu.registers.a|=0x80; cpu.registers.m=2;},


    // Loading Functions ------------------------------------------------------------------------------------------------------------
    // LDrr, contents of rPrime (any register (A-L)) are loaded into r (another register (A-L))
    LDrrAA: function() {cpu.registers.a = cpu.registers.a; cpu.registers.m = 1;},
    LDrrAB: function() {cpu.registers.a = cpu.registers.b; cpu.registers.m = 1;},
    LDrrAC: function() {cpu.registers.a = cpu.registers.c; cpu.registers.m = 1;},
    LDrrAD: function() {cpu.registers.a = cpu.registers.d; cpu.registers.m = 1;},
    LDrrAE: function() {cpu.registers.a = cpu.registers.e; cpu.registers.m = 1;},
    LDrrAH: function() {cpu.registers.a = cpu.registers.h; cpu.registers.m = 1;},
    LDrrAL: function() {cpu.registers.a = cpu.registers.l; cpu.registers.m = 1;},
    LDrrBA: function() {cpu.registers.b = cpu.registers.a; cpu.registers.m = 1;},
    LDrrBB: function() {cpu.registers.b = cpu.registers.b; cpu.registers.m = 1;},
    LDrrBC: function() {cpu.registers.b = cpu.registers.c; cpu.registers.m = 1;},
    LDrrBD: function() {cpu.registers.b = cpu.registers.d; cpu.registers.m = 1;},
    LDrrBE: function() {cpu.registers.b = cpu.registers.e; cpu.registers.m = 1;},
    LDrrBH: function() {cpu.registers.b = cpu.registers.h; cpu.registers.m = 1;},
    LDrrBL: function() {cpu.registers.b = cpu.registers.l; cpu.registers.m = 1;},
    LDrrCA: function() {cpu.registers.c = cpu.registers.a; cpu.registers.m = 1;},
    LDrrCB: function() {cpu.registers.c = cpu.registers.b; cpu.registers.m = 1;},
    LDrrCC: function() {cpu.registers.c = cpu.registers.c; cpu.registers.m = 1;},
    LDrrCD: function() {cpu.registers.c = cpu.registers.d; cpu.registers.m = 1;},
    LDrrCE: function() {cpu.registers.c = cpu.registers.e; cpu.registers.m = 1;},
    LDrrCH: function() {cpu.registers.c = cpu.registers.h; cpu.registers.m = 1;},
    LDrrCL: function() {cpu.registers.c = cpu.registers.l; cpu.registers.m = 1;},
    LDrrDA: function() {cpu.registers.d = cpu.registers.a; cpu.registers.m = 1;},
    LDrrDB: function() {cpu.registers.d = cpu.registers.b; cpu.registers.m = 1;},
    LDrrDC: function() {cpu.registers.d = cpu.registers.c; cpu.registers.m = 1;},
    LDrrDD: function() {cpu.registers.d = cpu.registers.d; cpu.registers.m = 1;},
    LDrrDE: function() {cpu.registers.d = cpu.registers.e; cpu.registers.m = 1;},
    LDrrDH: function() {cpu.registers.d = cpu.registers.h; cpu.registers.m = 1;},
    LDrrDL: function() {cpu.registers.d = cpu.registers.l; cpu.registers.m = 1;},
    LDrrEA: function() {cpu.registers.e = cpu.registers.a; cpu.registers.m = 1;},
    LDrrEB: function() {cpu.registers.e = cpu.registers.b; cpu.registers.m = 1;},
    LDrrEC: function() {cpu.registers.e = cpu.registers.c; cpu.registers.m = 1;},
    LDrrED: function() {cpu.registers.e = cpu.registers.d; cpu.registers.m = 1;},
    LDrrEE: function() {cpu.registers.e = cpu.registers.e; cpu.registers.m = 1;},
    LDrrEH: function() {cpu.registers.e = cpu.registers.h; cpu.registers.m = 1;},
    LDrrEL: function() {cpu.registers.e = cpu.registers.l; cpu.registers.m = 1;},
    LDrrHA: function() {cpu.registers.h = cpu.registers.a; cpu.registers.m = 1;},
    LDrrHB: function() {cpu.registers.h = cpu.registers.b; cpu.registers.m = 1;},
    LDrrHC: function() {cpu.registers.h = cpu.registers.c; cpu.registers.m = 1;},
    LDrrHD: function() {cpu.registers.h = cpu.registers.d; cpu.registers.m = 1;},
    LDrrHE: function() {cpu.registers.h = cpu.registers.e; cpu.registers.m = 1;},
    LDrrHH: function() {cpu.registers.h = cpu.registers.h; cpu.registers.m = 1;},
    LDrrHL: function() {cpu.registers.h = cpu.registers.l; cpu.registers.m = 1;},
    LDrrLA: function() {cpu.registers.l = cpu.registers.a; cpu.registers.m = 1;},
    LDrrLB: function() {cpu.registers.l = cpu.registers.b; cpu.registers.m = 1;},
    LDrrLC: function() {cpu.registers.l = cpu.registers.c; cpu.registers.m = 1;},
    LDrrLD: function() {cpu.registers.l = cpu.registers.d; cpu.registers.m = 1;},
    LDrrLE: function() {cpu.registers.l = cpu.registers.e; cpu.registers.m = 1;},
    LDrrLH: function() {cpu.registers.l = cpu.registers.h; cpu.registers.m = 1;},
    LDrrLL: function() {cpu.registers.l = cpu.registers.l; cpu.registers.m = 1;},

    
}
