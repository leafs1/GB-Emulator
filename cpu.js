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
    LDrr: function(r, rPrime) {
        r = rPrime
    }

}
