// Hold the internal state vals
var cpu = {
    // time clock
    clock: {m:0, t:0},
    
    //initialize registers (a-f = 8-bit, pc and sp = 16-bit, m and t for clock)
    registers: {
        a:0, b:0, c:0, d:0, e:0, h:0, l:0, f:0, pc:0, sp:0, m:0, t:0
    },    
}

// Hold all processing operations done by the cpu
var operations = {

    // Adding A to E
    AddAA: function() {
        cpu.registers.a += cpu.registers.a    // Addition
        cpu.registers.f = 0                   // reset the flags (F register holds state of operation)
        
        // if a val when added to 255 with bitewise and is zero, ! in front returns true
        if (!(cpu.registers.a & 255)) {       // Check for zero flag
            cpu.registers.f |= 0x80 
        }
        
        // if result is greater than 255 (or not enough space in 8-bits)
        if (cpu.registers.a > 255) {          // Check for carry flag
            cpu.registers.f |= 0x10
        }

        // check if operation overflows past 15 (00001111). There has to be a bit carry between the 3rd and 4th (index).
        if ((((cpu.registers.a & 0xF) + (cpu.registers.a & 0xF)) & 0x10) == 0x10) {     // Check for half-carry flag https://robdor.com/2016/08/10/gameboy-emulator-half-carry-flag/
            cpu.registers.f |= 0x20
        }


        cpu.registers.a &= 255                // Convert to 8-bits

        cpu.registers.m = 1                   // 1 machine cycle (culmination of 4 clock cycles)
        cpu.registers.t = 4                   // 4 clock cycles (first 2 are fetch(next instruction is fetched by stored address),
                                              // decode (interpret encoded instruction), execute)
    },
    AddAB: function() {
        cpu.registers.a += cpu.registers.b; cpu.registers.f = 0; if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if (cpu.registers.a > 255) {cpu.registers.f |= 0x10}; 
        if ((((cpu.registers.a & 0xF) + (cpu.registers.b & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.a &= 255;               
        cpu.registers.m = 1; cpu.registers.t = 4                                          
    },
    AddAC: function() {
        cpu.registers.a += cpu.registers.c; cpu.registers.f = 0; if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if (cpu.registers.a > 255) {cpu.registers.f |= 0x10}; 
        if ((((cpu.registers.a & 0xF) + (cpu.registers.c & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.a &= 255;               
        cpu.registers.m = 1; cpu.registers.t = 4                                          
    },
    AddAD: function() {
        cpu.registers.a += cpu.registers.d; cpu.registers.f = 0; if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if (cpu.registers.a > 255) {cpu.registers.f |= 0x10}; 
        if ((((cpu.registers.a & 0xF) + (cpu.registers.d & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.a &= 255;               
        cpu.registers.m = 1; cpu.registers.t = 4                                          
    },
    AddAE: function() {
        cpu.registers.a += cpu.registers.e; cpu.registers.f = 0; if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if (cpu.registers.a > 255) {cpu.registers.f |= 0x10}; 
        if ((((cpu.registers.a & 0xF) + (cpu.registers.e & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.a &= 255;               
        cpu.registers.m = 1; cpu.registers.t = 4                                          
    },
    AddAH: function() {
        cpu.registers.a += cpu.registers.h; cpu.registers.f = 0; if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if (cpu.registers.a > 255) {cpu.registers.f |= 0x10}; 
        if ((((cpu.registers.a & 0xF) + (cpu.registers.h & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.a &= 255;               
        cpu.registers.m = 1; cpu.registers.t = 4                                          
    },
    AddAL: function() {
        cpu.registers.a += cpu.registers.l; cpu.registers.f = 0; if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
        if (cpu.registers.a > 255) {cpu.registers.f |= 0x10}; 
        if ((((cpu.registers.a & 0xF) + (cpu.registers.l & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.a &= 255;               
        cpu.registers.m = 1; cpu.registers.t = 4                                          
    },


    // contents of rPrime (any register (A-L)) are loaded into r (another register (A-L))
    LDrrAA: function() {cpu.registers.a = cpu.registers.a; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrAB: function() {cpu.registers.a = cpu.registers.b; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrAC: function() {cpu.registers.a = cpu.registers.c; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrAD: function() {cpu.registers.a = cpu.registers.d; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrAE: function() {cpu.registers.a = cpu.registers.e; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrAH: function() {cpu.registers.a = cpu.registers.h; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrAL: function() {cpu.registers.a = cpu.registers.l; cpu.registers.m = 1; cpu.registers.t = 4},

    LDrrBA: function() {cpu.registers.b = cpu.registers.a; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrBB: function() {cpu.registers.b = cpu.registers.b; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrBC: function() {cpu.registers.b = cpu.registers.c; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrBD: function() {cpu.registers.b = cpu.registers.d; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrBE: function() {cpu.registers.b = cpu.registers.e; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrBH: function() {cpu.registers.b = cpu.registers.h; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrBL: function() {cpu.registers.b = cpu.registers.l; cpu.registers.m = 1; cpu.registers.t = 4},

    LDrrCA: function() {cpu.registers.c = cpu.registers.a; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrCB: function() {cpu.registers.c = cpu.registers.b; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrCC: function() {cpu.registers.c = cpu.registers.c; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrCD: function() {cpu.registers.c = cpu.registers.d; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrCE: function() {cpu.registers.c = cpu.registers.e; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrCH: function() {cpu.registers.c = cpu.registers.h; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrCL: function() {cpu.registers.c = cpu.registers.l; cpu.registers.m = 1; cpu.registers.t = 4},
    
    LDrrDA: function() {cpu.registers.d = cpu.registers.a; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrDB: function() {cpu.registers.d = cpu.registers.b; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrDC: function() {cpu.registers.d = cpu.registers.c; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrDD: function() {cpu.registers.d = cpu.registers.d; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrDE: function() {cpu.registers.d = cpu.registers.e; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrDH: function() {cpu.registers.d = cpu.registers.h; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrDL: function() {cpu.registers.d = cpu.registers.l; cpu.registers.m = 1; cpu.registers.t = 4},

    LDrrEA: function() {cpu.registers.e = cpu.registers.a; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrEB: function() {cpu.registers.e = cpu.registers.b; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrEC: function() {cpu.registers.e = cpu.registers.c; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrED: function() {cpu.registers.e = cpu.registers.d; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrEE: function() {cpu.registers.e = cpu.registers.e; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrEH: function() {cpu.registers.e = cpu.registers.h; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrEL: function() {cpu.registers.e = cpu.registers.l; cpu.registers.m = 1; cpu.registers.t = 4},

    LDrrHA: function() {cpu.registers.h = cpu.registers.a; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrHB: function() {cpu.registers.h = cpu.registers.b; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrHC: function() {cpu.registers.h = cpu.registers.c; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrHD: function() {cpu.registers.h = cpu.registers.d; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrHE: function() {cpu.registers.h = cpu.registers.e; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrHH: function() {cpu.registers.h = cpu.registers.h; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrHL: function() {cpu.registers.h = cpu.registers.l; cpu.registers.m = 1; cpu.registers.t = 4},

    LDrrLA: function() {cpu.registers.l = cpu.registers.a; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrLB: function() {cpu.registers.l = cpu.registers.b; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrLC: function() {cpu.registers.l = cpu.registers.c; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrLD: function() {cpu.registers.l = cpu.registers.d; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrLE: function() {cpu.registers.l = cpu.registers.e; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrLH: function() {cpu.registers.l = cpu.registers.h; cpu.registers.m = 1; cpu.registers.t = 4},
    LDrrLL: function() {cpu.registers.l = cpu.registers.l; cpu.registers.m = 1; cpu.registers.t = 4},



}
