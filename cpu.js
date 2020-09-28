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
        
        cpu.registers.a &= 255 // mask to 8-bits
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



    // Loading ------------------------------------------------------------------------------------------------------------
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
