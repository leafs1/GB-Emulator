//import MMU from './mmu.mjs'
utils = {
    // Util functions -----------------------------------------------------------------------------------------------------------
        // Set flags
        setZ: function(num){
            if(num == 1) {
                cpu.registers.f |= 0x80
            } else if (num == 0) {
                cpu.registers.f &= 0x7f
            } else {
                console.log("invalid num for setZ()")
            }
        },
        setN: function(num){
            if(num == 1) {
                cpu.registers.f |= 0x40
            } else if (num == 0) {
                cpu.registers.f &= 0xbf
            } else {
                console.log("invalid num for setN()")
            }
        },
        setH: function(num){
            if(num == 1) {
                cpu.registers.f |= 0x20
            } else if (num == 0) {
                cpu.registers.f &= 0xdf
            } else {
                console.log("invalid num for setH()")
            }
        },
        setC: function(num){
            if(num == 1) {
                cpu.registers.f |= 0x10
            } else if (num == 0) {
                cpu.registers.f &= 0xef
            } else {
                console.log("invalid num for setC()")
            }
        },

        // Check for Z flag in register
        checkForZ: function(reg){
            (reg)?this.setZ(0):this.setZ(1)
        },
    }
// Hold the internal state vals
var cpu = {
    // time clock
    clock: {
        m:0
    },

    // Used to reset registers after interrupt
    _resetValues: {
        a:0, b:0, c:0, d:0, e:0, h:0, l:0, f:0
    },

    // value for fn, halt (stop CPU)
    halt: 0,

    // Stop cpu val
    stop: 0,
    
    //initialize registers (a-f = 8-bit, pc and sp = 16-bit, m for clock)
    registers: {
        a:0, b:0, c:0, d:0, e:0, h:0, l:0, f:0, i:0, r:0, pc:0, sp:0, m:0, ime:0, 
        // Flags = Z(0x80), N(0x40), H(0x20), C(0x10)
    }, 

    // Map 8-bit cpu functions
    map: {},

    // Map 16-bit cpu functions
    cbMap: {},

    // Reset the CPU (Used on startup)
    reset: function() {
        cpu.registers.a = 0
        cpu.registers.b = 0
        cpu.registers.c = 0
        cpu.registers.d = 0
        cpu.registers.e = 0
        cpu.registers.h = 0
        cpu.registers.l = 0
        cpu.registers.f = 0
        cpu.registers.sp = 0
        cpu.registers.pc = 0
        cpu.registers.i = 0
        cpu.registers.r = 0
        cpu.registers.m = 0
        cpu.halt = 0
        cpu.stop = 0
        cpu.clock.m = 0
        cpu.registers.ime = 1
        console.log("CPU Reset")
    },

    // Executes a command
    execute: function() {
        cpu.registers.r = (cpu.registers.r + 1) & 127
        cpu.map[MMU.readByte(cpu.registers.pc++)]()
        cpu.registers.pc &= 65535
        cpu.clock.m += cpu.registers.m
    },

    


    

    // Hold all processing operations done by the cpu
    operations: {

        // Processing Data ------------------------------------------------------------------------------------------------------------
        // Adding A to all registers
        AddAA: function() {
            cpu.registers.a += cpu.registers.a    // Addition
            
            // if result is greater than 255 (or not enough space in 8-bits)
            console.log(`a reg = ${cpu.registers.a}`)
            if (cpu.registers.a > 255) {          // Check for carry flag
                console.log("aa yes")
                cpu.registers.f = 0x10
            } else {
                console.log("AA no")
                cpu.registers.f = 0
            }

            cpu.registers.a &= 255                // Convert to 8-bits

            // if a val when added to 255 with bitewise and is zero, ! in front returns true
            if (!cpu.registers.a) {       // Check for zero flag
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
            if (!cpu.registers.a) {cpu.registers.f |= 0x80};
            if ((((cpu.registers.a & 0xF) + (cpu.registers.b & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                      
        },
        AddAC: function() {
            cpu.registers.a += cpu.registers.c; cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255;
            if (!cpu.registers.a) {cpu.registers.f |= 0x80};
            if ((((cpu.registers.a & 0xF) + (cpu.registers.c & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                        
        },
        AddAD: function() {
            cpu.registers.a += cpu.registers.d; cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255;
            if (!cpu.registers.a) {cpu.registers.f |= 0x80};
            if ((((cpu.registers.a & 0xF) + (cpu.registers.d & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                        
        },
        AddAE: function() {
            cpu.registers.a += cpu.registers.e; cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255;
            if (!cpu.registers.a) {cpu.registers.f |= 0x80};
            if ((((cpu.registers.a & 0xF) + (cpu.registers.e & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                       
        },
        AddAH: function() {
            cpu.registers.a += cpu.registers.h; cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255;
            if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
            if ((((cpu.registers.a & 0xF) + (cpu.registers.h & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                         
        },
        AddAL: function() {
            cpu.registers.a += cpu.registers.l; cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255;
            if (!cpu.registers.a) {cpu.registers.f |= 0x80};
            if ((((cpu.registers.a & 0xF) + (cpu.registers.l & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m = 1;                                          
        },
        AddHL: function() {var hl=MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.a += hl; 
            cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255; if (!cpu.registers.a) {cpu.registers.f |= 0x80};
            if ((((cpu.registers.a & 0xF) + (cpu.registers.l & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m=2;}, 
        
        // Add info at PC mem address to A
        Addn: function() {var n=MMU.readByte(cpu.registers.pc); cpu.registers.a += n; 
            cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255; if (!cpu.registers.a) {cpu.registers.f |= 0x80};
            if ((((cpu.registers.a & 0xF) + (cpu.registers.l & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m=2;},
        
        // Add BC to HL
        AddHLBC: function() {var hl=(cpu.registers.h<<8)+cpu.registers.l; hl+=(cpu.registers.b<<8)+cpu.registers.c; (hl>65535)?cpu.registers.f|=0x10:cpu.registers.f&=0xef;
                            cpu.registers.h=(hl>>8)&255; cpu.registers.l=hl&255; cpu.registers.m=3;},
        
        // Add DE to HL
        AddHLDE: function() {var hl=(cpu.registers.h<<8)+cpu.registers.l; hl+=(cpu.registers.d<<8)+cpu.registers.e; (hl>65535)?cpu.registers.f|=0x10:cpu.registers.f&=0xef;
                            cpu.registers.h=(hl>>8)&255; cpu.registers.l=hl&255;cpu.registers.m=3;},

        // Add HL to itself
        AddHLHL: function() {var hl=(cpu.registers.h<<8)+cpu.registers.l; hl+=(cpu.registers.h<<8)+cpu.registers.l; (hl>65535)?cpu.registers.f|=0x10:cpu.registers.f&=0xef;
                            cpu.registers.h=(hl>>8)&255; cpu.registers.l=hl&255; cpu.registers.m=3;},

        // Add HL to SP
        AddHLSP: function() {var hl=(cpu.registers.h<<8)+cpu.registers.l; hl+=cpu.registers.sp; (hl>65535)?cpu.registers.f|=0x10:cpu.registers.f&=0xef;
                            cpu.registers.h=(hl>>8)&255; cpu.registers.l=hl&255;  cpu.registers.m=3;},

        // Add content at mem address, PC, to SP
        ADDSPn: function() {console.log("ADDSPn"); i=MMU.readByte(cpu.registers.pc); if(i>127) i=-((~i+1)&255); cpu.registers.pc++; cpu.registers.sp+=i; cpu.registers.m=4;},


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
        ADCHL: function() {var hl=MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.a += hl; cpu.registers.a += (cpu.registers.f & 0x10)?1:0;
            cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255; if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
            if ((((cpu.registers.a & 0xF) + (hl & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m=2;                                          
        },
        ADCn: function() {var n=MMU.readByte(cpu.registers.pc); cpu.registers.a += n; cpu.registers.pc++; cpu.registers.a += (cpu.registers.f & 0x10)?1:0;
            cpu.registers.f=(cpu.registers.a > 255)?0x10:0; cpu.registers.a &= 255; if (!(cpu.registers.a & 255)) {cpu.registers.f |= 0x80};
            if ((((cpu.registers.a & 0xF) + (n & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20} cpu.registers.m=2;                                          
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
            cpu.registers.f=(temp<0)?0x50:0x40

            // Check for zero flag
            if (!(temp & 255)) {cpu.registers.f |= 0x80}

            //Check for half carry
            if((cpu.registers.a^cpu.registers.b^temp)&0x10 == 0x10) {cpu.registers.f|=0x20}

            // 1 Machine cycle and 4 clock cycles
            cpu.registers.m = 1
        },
        CPac: function() {var temp=cpu.registers.a;temp-=cpu.registers.c; cpu.registers.f=(temp < 0)?0x10:0; temp&=255; cpu.registers.f=(temp<0)?0x50:0x40; 
                if(!(temp & 255)){cpu.registers.f |= 0x80};if((cpu.registers.a^cpu.registers.c^temp)&0x10 == 0x10) {cpu.registers.f|=0x20};
                cpu.registers.m = 1;      
        },
        CPad: function() {var temp=cpu.registers.a;temp-=cpu.registers.d; cpu.registers.f=(temp < 0)?0x10:0; temp&=255; cpu.registers.f=(temp<0)?0x50:0x40; 
                if(!(temp & 255)){cpu.registers.f |= 0x80};if((cpu.registers.a^cpu.registers.d^temp)&0x10 == 0x10) {cpu.registers.f|=0x20};
                cpu.registers.m = 1;      
        },
        CPae: function() {var temp=cpu.registers.a;temp-=cpu.registers.e; cpu.registers.f=(temp < 0)?0x10:0; temp&=255; cpu.registers.f=(temp<0)?0x50:0x40; 
                if(!(temp & 255)){cpu.registers.f |= 0x80};if((cpu.registers.a^cpu.registers.e^temp)&0x10 == 0x10) {cpu.registers.f|=0x20};
                cpu.registers.m = 1;      
        },
        CPah: function() {var temp=cpu.registers.a;temp-=cpu.registers.h; cpu.registers.f=(temp < 0)?0x10:0; temp&=255; cpu.registers.f=(temp<0)?0x50:0x40; 
                if(!(temp & 255)){cpu.registers.f |= 0x80};if((cpu.registers.a^cpu.registers.h^temp)&0x10 == 0x10) {cpu.registers.f|=0x20};
                cpu.registers.m = 1;      
        },
        CPal: function() {var temp=cpu.registers.a;temp-=cpu.registers.l; cpu.registers.f=(temp < 0)?0x10:0; temp&=255; cpu.registers.f=(temp<0)?0x50:0x40; 
                if(!(temp & 255)){cpu.registers.f |= 0x80};if((cpu.registers.a^cpu.registers.l^temp)&0x10 == 0x10) {cpu.registers.f|=0x20};
                cpu.registers.m = 1;      
        },
        CPaa: function() {var temp=cpu.registers.a;temp-=cpu.registers.a; cpu.registers.f=(temp < 0)?0x10:0; temp&=255; cpu.registers.f=(temp<0)?0x50:0x40; 
                if(!(temp & 255)){cpu.registers.f |= 0x80};if((cpu.registers.a^cpu.registers.a^temp)&0x10 == 0x10) {cpu.registers.f|=0x20};
                cpu.registers.m = 1;      
        },
        CPHL: function() {var temp=cpu.registers.a; var hl=MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); temp-=hl; cpu.registers.f=(temp<0)?0x50:0x40; 
                        temp&=255; if(!temp) cpu.registers.f|=0x80; if((cpu.registers.a^temp^hl)&0x10) cpu.registers.f|=0x20; cpu.registers.m=2;},
        CPn: function() {console.log(`f reg before = ${cpu.registers.f}, a = ${cpu.registers.a}`); var temp=cpu.registers.a; var n=MMU.readByte(cpu.registers.pc); temp-=n; cpu.registers.pc++; cpu.registers.f=(temp<0)?0x50:0x40; 
                        temp&=255; if(!temp) cpu.registers.f|=0x80; if((cpu.registers.a^temp^n)&0x10) cpu.registers.f|=0x20; cpu.registers.m=2; console.log(`f reg after = ${cpu.registers.f}, a = ${cpu.registers.a}`)},

        // Subtract any reg from a
        SUBr_b: function() {
            cpu.registers.a -= cpu.registers.b; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255;
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.b & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m = 1;      
        },
        SUBr_c: function() {
            cpu.registers.a -= cpu.registers.c; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255;
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.c & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m = 1;      
        },
        SUBr_d: function() {
            cpu.registers.a -= cpu.registers.d; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255;
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.d & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m = 1;      
        },
        SUBr_e: function() {
            cpu.registers.a -= cpu.registers.e; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255;
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.e & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m = 1;      
        },
        SUBr_h: function() {
            cpu.registers.a -= cpu.registers.h; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255;
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.h & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m = 1;      
        },
        SUBr_l: function() {
            cpu.registers.a -= cpu.registers.l; cpu.registers.f=(cpu.registers.a < 0)?0x10:0;cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255; 
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.l & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m = 1;      
        },
        SUBr_a: function() {
            cpu.registers.a -= cpu.registers.a; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255; 
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.a & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m = 1;      
        },
        SUBHL: function() {var hl=MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.a -= hl; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255;
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (hl & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m=2;
        },
        SUBn: function() {var n=MMU.readByte(cpu.registers.pc); cpu.registers.a -= n; cpu.registers.pc++; cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255; 
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (n & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m=2;},

        // register and carry flag are subtracted from A
        SBCr_b: function(){
            cpu.registers.a -= cpu.registers.b; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
            cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255;  
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.b & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m = 1;
        },
        SBCr_c: function(){
            cpu.registers.a -= cpu.registers.c; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
            cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255;
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.c & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m = 1;
        },
        SBCr_d: function(){
            cpu.registers.a -= cpu.registers.d; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
            cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255; 
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.d & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m = 1;
        },
        SBCr_e: function(){
            cpu.registers.a -= cpu.registers.e; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
            cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255; 
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.e & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m = 1;
        },
        SBCr_h: function(){
            cpu.registers.a -= cpu.registers.h; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
            cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255; 
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.h & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m = 1;
        },
        SBCr_l: function(){
            cpu.registers.a -= cpu.registers.l; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
            cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40;cpu.registers.a&=255; 
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.l & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m = 1;
        },
        SBCr_a: function(){
            cpu.registers.a -= cpu.registers.a; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
            cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255;  
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (cpu.registers.a & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m = 1;
        },
        SBCHL: function() {var hl=MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.a -= hl; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
            cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255; 
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (hl & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m=2;},
        SBCn: function() {var n=MMU.readByte(cpu.registers.pc); cpu.registers.a -= n; cpu.registers.a -= (cpu.registers.f & 0x10)?1:0;
            cpu.registers.f=(cpu.registers.a < 0)?0x10:0; cpu.registers.f=(cpu.registers.a<0)?0x50:0x40; cpu.registers.a&=255; 
            if(!(cpu.registers.a & 255)){cpu.registers.f |= 0x80};if ((((cpu.registers.a & 0xF) + (n & 0xF)) & 0x10) == 0x10) {cpu.registers.f |= 0x20}
            cpu.registers.m=2;},

        // Adjust A reg for BCD addition and subtraction
        DAA: function(){var a=cpu.registers.a; if((cpu.registers.f&0x20)||((cpu.registers.a&15)>9)) cpu.registers.a+=6; cpu.registers.f&=0xEF; 
            if((cpu.registers.f&0x20)||(a>0x99)) { cpu.registers.a+=0x60; cpu.registers.f|=0x10; } cpu.registers.m=1;
        },

        // AND operation on registers
        ANDr_b: function(){cpu.registers.a &= cpu.registers.b; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        ANDr_c: function(){cpu.registers.a &= cpu.registers.c; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        ANDr_d: function(){cpu.registers.a &= cpu.registers.d; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        ANDr_e: function(){cpu.registers.a &= cpu.registers.e; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        ANDr_h: function(){cpu.registers.a &= cpu.registers.h; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        ANDr_l: function(){cpu.registers.a &= cpu.registers.l; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        ANDr_a: function(){cpu.registers.a &= cpu.registers.a; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        ANDHL: function(){cpu.registers.a&=MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m=2;},
        ANDn: function(){cpu.registers.a&=MMU.readByte(cpu.registers.pc); cpu.registers.pc++; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m=2;},

        // OR operation on registers
        ORr_b: function(){cpu.registers.a |= cpu.registers.b; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        ORr_c: function(){cpu.registers.a |= cpu.registers.c; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        ORr_d: function(){cpu.registers.a |= cpu.registers.d; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        ORr_e: function(){console.log(`or before || a = ${cpu.registers.a}, f = ${cpu.registers.f}`); cpu.registers.a |= cpu.registers.e; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1; console.log(`or after || a = ${cpu.registers.a}, f = ${cpu.registers.f}`);},
        ORr_h: function(){cpu.registers.a |= cpu.registers.h; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        ORr_l: function(){cpu.registers.a |= cpu.registers.l; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        ORr_a: function(){cpu.registers.a |= cpu.registers.a; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        ORHL: function(){cpu.registers.a |= MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m=2;},
        ORn: function(){cpu.registers.a |= MMU.readByte(cpu.registers.pc); cpu.registers.pc++; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m=2;},

        // XOR operation on registers
        XORr_b: function(){cpu.registers.a ^= cpu.registers.b; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        XORr_c: function(){cpu.registers.a ^= cpu.registers.c; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        XORr_d: function(){cpu.registers.a ^= cpu.registers.d; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        XORr_e: function(){cpu.registers.a ^= cpu.registers.e; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        XORr_h: function(){cpu.registers.a ^= cpu.registers.h; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        XORr_l: function(){cpu.registers.a ^= cpu.registers.l; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        XORr_a: function(){cpu.registers.a ^= cpu.registers.a; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m = 1;},
        XORHL: function(){cpu.registers.a ^= MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m=2;},
        XORn: function(){cpu.registers.a ^= MMU.readByte(cpu.registers.pc); cpu.registers.pc++; cpu.registers.a &= 255; cpu.registers.f = cpu.registers.a?0:0x80; cpu.registers.m=2;},

        // Increment register
        INCb: function() {cpu.registers.b ++; cpu.registers.b&=255; cpu.registers.f=cpu.registers.b?0:0x80; cpu.registers.m=1;},
        INCc: function() {cpu.registers.c ++; cpu.registers.c&=255; cpu.registers.f=cpu.registers.c?0:0x80; cpu.registers.m=1;},
        INCd: function() {cpu.registers.d ++; cpu.registers.d&=255; cpu.registers.f=cpu.registers.d?0:0x80; cpu.registers.m=1;},
        INCe: function() {cpu.registers.e ++; cpu.registers.e&=255; cpu.registers.f=cpu.registers.e?0:0x80; cpu.registers.m=1;},
        INCh: function() {cpu.registers.h ++; cpu.registers.h&=255; cpu.registers.f=cpu.registers.h?0:0x80; cpu.registers.m=1;},
        INCl: function() {cpu.registers.l ++; cpu.registers.l&=255; cpu.registers.f=cpu.registers.l?0:0x80; cpu.registers.m=1;},
        INCa: function() {cpu.registers.a ++; cpu.registers.a&=255; cpu.registers.f=cpu.registers.a?0:0x80; cpu.registers.m=1;},
        INCHLm: function() {var incremented=MMU.readByte((cpu.registers.h<<8)+cpu.registers.l);if(incremented==0xff){incremented=0;utils.setZ(1)}else{incremented++; utils.setZ(0)}; 
                            MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, incremented); ((incremented&0x0f)==0)?utils.setH(1):utils.setH(0); utils.setN(0); cpu.registers.m=3;},
        INCBC: function() {cpu.registers.c=(cpu.registers.c+1)&255; (cpu.registers.c)?null:cpu.registers.b=(cpu.registers.b+1)&255; cpu.registers.m=1;},
        INCDE: function() {cpu.registers.e=(cpu.registers.e+1)&255; (cpu.registers.e)?null:cpu.registers.d=(cpu.registers.d+1)&255; cpu.registers.m=1;},
        INCHL: function() {cpu.registers.l=(cpu.registers.l+1)&255; (cpu.registers.l)?null:cpu.registers.h=(cpu.registers.h+1)&255; cpu.registers.m=1;},
        INCSP: function() {console.log("INCSP"); cpu.registers.sp=(cpu.registers.sp+1)&65535; cpu.registers.m=1;},

        // Decrement register
        DECb: function() {cpu.registers.b --; cpu.registers.b&=255; cpu.registers.f=cpu.registers.b?0:0x80; cpu.registers.m=1;},
        DECc: function() {cpu.registers.c --; cpu.registers.c&=255; cpu.registers.f=cpu.registers.c?0:0x80; cpu.registers.m=1;},
        DECd: function() {cpu.registers.d --; cpu.registers.d&=255; cpu.registers.f=cpu.registers.d?0:0x80; cpu.registers.m=1;},
        DECe: function() {cpu.registers.e --; cpu.registers.e&=255; cpu.registers.f=cpu.registers.e?0:0x80; cpu.registers.m=1;},
        DECh: function() {cpu.registers.h --; cpu.registers.h&=255; cpu.registers.f=cpu.registers.h?0:0x80; cpu.registers.m=1;},
        DECl: function() {cpu.registers.l --; cpu.registers.l&=255; cpu.registers.f=cpu.registers.l?0:0x80; cpu.registers.m=1;},
        DECa: function() {cpu.registers.a --; cpu.registers.a&=255; cpu.registers.f=cpu.registers.a?0:0x80; cpu.registers.m=1;},
        DECHLm: function() {var decremented=MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); ((decremented&0x0f)==0)?utils.setH(1):utils.setH(0); utils.setN(1);  
                            (decremented==0)?decremented=0xff:decremented--; if(decremented==0){utils.setZ(1)}else{utils.setZ(0)}; 
                            MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, decremented);  cpu.registers.m=3;},
        DECBC: function() {cpu.registers.c=(cpu.registers.c-1)&255; (cpu.registers.c==255)?cpu.registers.b=(cpu.registers.b-1)&255:null; cpu.registers.m=1;},
        DECDE: function() {console.log(`decde before || e = ${cpu.registers.e}, d = ${cpu.registers.d}`); cpu.registers.e=(cpu.registers.e-1)&255; (cpu.registers.e==255)?cpu.registers.d=(cpu.registers.d-1)&255 : null; console.log(`decde after || e = ${cpu.registers.e}, d = ${cpu.registers.d}`);cpu.registers.m=1;},
        DECHL: function() {cpu.registers.l=(cpu.registers.l-1)&255; (cpu.registers.l==255)?cpu.registers.h=(cpu.registers.h-1)&255:null; cpu.registers.m=1;},
        DECSP: function() {console.log("DECSP"); cpu.registers.sp=(cpu.registers.sp-1)&65535; cpu.registers.m=1;},

        // Bit Manupulation ------------------------------------------------------------------------------------------------------------
        // Test bit at index with register
        BIT0b: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.b&0x01)?0:0x80; cpu.registers.m=2;},
        BIT0c: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.c&0x01)?0:0x80; cpu.registers.m=2;},
        BIT0d: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.d&0x01)?0:0x80; cpu.registers.m=2;},
        BIT0e: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.e&0x01)?0:0x80; cpu.registers.m=2;},
        BIT0h: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.h&0x01)?0:0x80; cpu.registers.m=2;},
        BIT0l: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.l&0x01)?0:0x80; cpu.registers.m=2;},
        BIT0a: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.a&0x01)?0:0x80; cpu.registers.m=2;},
        BIT0m: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(MMU.readByte((cpu.registers.h<<8)+cpu.registers.l)&0x01)?0:0x80; cpu.registers.m=3;},

        BIT1b: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.b&0x02)?0:0x80; cpu.registers.m=2;},
        BIT1c: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.c&0x02)?0:0x80; cpu.registers.m=2;},
        BIT1d: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.d&0x02)?0:0x80; cpu.registers.m=2;},
        BIT1e: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.e&0x02)?0:0x80; cpu.registers.m=2;},
        BIT1h: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.h&0x02)?0:0x80; cpu.registers.m=2;},
        BIT1l: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.l&0x02)?0:0x80; cpu.registers.m=2;},
        BIT1a: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.a&0x02)?0:0x80; cpu.registers.m=2;},
        BIT1m: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(MMU.readByte((cpu.registers.h<<8)+cpu.registers.l)&0x02)?0:0x80; cpu.registers.m=3;},

        BIT2b: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.b&0x03)?0:0x80; cpu.registers.m=2;},
        BIT2c: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.c&0x03)?0:0x80; cpu.registers.m=2;},
        BIT2d: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.d&0x03)?0:0x80; cpu.registers.m=2;},
        BIT2e: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.e&0x03)?0:0x80; cpu.registers.m=2;},
        BIT2h: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.h&0x03)?0:0x80; cpu.registers.m=2;},
        BIT2l: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.l&0x03)?0:0x80; cpu.registers.m=2;},
        BIT2a: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.a&0x03)?0:0x80; cpu.registers.m=2;},
        BIT2m: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(MMU.readByte((cpu.registers.h<<8)+cpu.registers.l)&0x03)?0:0x80; cpu.registers.m=3;},

        BIT3b: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.b&0x04)?0:0x80; cpu.registers.m=2;},
        BIT3c: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.c&0x04)?0:0x80; cpu.registers.m=2;},
        BIT3d: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.d&0x04)?0:0x80; cpu.registers.m=2;},
        BIT3e: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.e&0x04)?0:0x80; cpu.registers.m=2;},
        BIT3h: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.h&0x04)?0:0x80; cpu.registers.m=2;},
        BIT3l: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.l&0x04)?0:0x80; cpu.registers.m=2;},
        BIT3a: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.a&0x04)?0:0x80; cpu.registers.m=2;},
        BIT3m: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(MMU.readByte((cpu.registers.h<<8)+cpu.registers.l)&0x04)?0:0x80; cpu.registers.m=3;},

        BIT4b: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.b&0x05)?0:0x80; cpu.registers.m=2;},
        BIT4c: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.c&0x05)?0:0x80; cpu.registers.m=2;},
        BIT4d: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.d&0x05)?0:0x80; cpu.registers.m=2;},
        BIT4e: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.e&0x05)?0:0x80; cpu.registers.m=2;},
        BIT4h: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.h&0x05)?0:0x80; cpu.registers.m=2;},
        BIT4l: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.l&0x05)?0:0x80; cpu.registers.m=2;},
        BIT4a: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.a&0x05)?0:0x80; cpu.registers.m=2;},
        BIT4m: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(MMU.readByte((cpu.registers.h<<8)+cpu.registers.l)&0x05)?0:0x80; cpu.registers.m=3;},

        BIT5b: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.b&0x06)?0:0x80; cpu.registers.m=2;},
        BIT5c: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.c&0x06)?0:0x80; cpu.registers.m=2;},
        BIT5d: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.d&0x06)?0:0x80; cpu.registers.m=2;},
        BIT5e: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.e&0x06)?0:0x80; cpu.registers.m=2;},
        BIT5h: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.h&0x06)?0:0x80; cpu.registers.m=2;},
        BIT5l: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.l&0x06)?0:0x80; cpu.registers.m=2;},
        BIT5a: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.a&0x06)?0:0x80; cpu.registers.m=2;},
        BIT5m: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(MMU.readByte((cpu.registers.h<<8)+cpu.registers.l)&0x06)?0:0x80; cpu.registers.m=3;},

        BIT6b: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.b&0x07)?0:0x80; cpu.registers.m=2;},
        BIT6c: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.c&0x07)?0:0x80; cpu.registers.m=2;},
        BIT6d: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.d&0x07)?0:0x80; cpu.registers.m=2;},
        BIT6e: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.e&0x07)?0:0x80; cpu.registers.m=2;},
        BIT6h: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.h&0x07)?0:0x80; cpu.registers.m=2;},
        BIT6l: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.l&0x07)?0:0x80; cpu.registers.m=2;},
        BIT6a: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.a&0x07)?0:0x80; cpu.registers.m=2;},
        BIT6m: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(MMU.readByte((cpu.registers.h<<8)+cpu.registers.l)&0x07)?0:0x80; cpu.registers.m=3;},

        BIT7b: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.b&0x08)?0:0x80; cpu.registers.m=2;},
        BIT7c: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.c&0x08)?0:0x80; cpu.registers.m=2;},
        BIT7d: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.d&0x08)?0:0x80; cpu.registers.m=2;},
        BIT7e: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.e&0x08)?0:0x80; cpu.registers.m=2;},
        BIT7h: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.h&0x08)?0:0x80; cpu.registers.m=2;},
        BIT7l: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.l&0x08)?0:0x80; cpu.registers.m=2;},
        BIT7a: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(cpu.registers.a&0x08)?0:0x80; cpu.registers.m=2;},
        BIT7m: function() {cpu.registers.f&=0x1F; utils.setH(1); cpu.registers.f=(MMU.readByte((cpu.registers.h<<8)+cpu.registers.l)&0x08)?0:0x80; cpu.registers.m=3;},

        // Resets bit b in register
        RES0b: function(){cpu.registers.b &= 0xFE; cpu.registers.m=2}, RES0c: function(){cpu.registers.c &= 0xFE; cpu.registers.m=2},
        RES0d: function(){cpu.registers.d &= 0xFE; cpu.registers.m=2}, RES0e: function(){cpu.registers.e &= 0xFE; cpu.registers.m=2},
        RES0h: function(){cpu.registers.h &= 0xFE; cpu.registers.m=2}, RES0l: function(){cpu.registers.l &= 0xFE; cpu.registers.m=2},
        RES0a: function(){cpu.registers.a &= 0xFE; cpu.registers.m=2}, RES0m: function(){MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))&0xFE); cpu.registers.m=4;},

        RES1b: function(){cpu.registers.b &= 0xFD; cpu.registers.m=2}, RES1c: function(){cpu.registers.c &= 0xFD; cpu.registers.m=2},
        RES1d: function(){cpu.registers.d &= 0xFD; cpu.registers.m=2}, RES1e: function(){cpu.registers.e &= 0xFD; cpu.registers.m=2},
        RES1h: function(){cpu.registers.h &= 0xFD; cpu.registers.m=2}, RES1l: function(){cpu.registers.l &= 0xFD; cpu.registers.m=2},
        RES1a: function(){cpu.registers.a &= 0xFD; cpu.registers.m=2}, RES1m: function(){MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))&0xFD); cpu.registers.m=4;},

        RES2b: function(){cpu.registers.b &= 0xFB; cpu.registers.m=2}, RES2c: function(){cpu.registers.c &= 0xFB; cpu.registers.m=2},
        RES2d: function(){cpu.registers.d &= 0xFB; cpu.registers.m=2}, RES2e: function(){cpu.registers.e &= 0xFB; cpu.registers.m=2},
        RES2h: function(){cpu.registers.h &= 0xFB; cpu.registers.m=2}, RES2l: function(){cpu.registers.l &= 0xFB; cpu.registers.m=2},
        RES2a: function(){cpu.registers.a &= 0xFB; cpu.registers.m=2}, RES2m: function(){MMU.writeByte((cpu.registers.h<<8)+cpu.rgsters.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))&0xFB); cpu.registers.m=4;},

        RES3b: function(){cpu.registers.b &= 0xF7; cpu.registers.m=2}, RES3c: function(){cpu.registers.c &= 0xF7; cpu.registers.m=2},
        RES3d: function(){cpu.registers.d &= 0xF7; cpu.registers.m=2}, RES3e: function(){cpu.registers.e &= 0xF7; cpu.registers.m=2},
        RES3h: function(){cpu.registers.h &= 0xF7; cpu.registers.m=2}, RES3l: function(){cpu.registers.l &= 0xF7; cpu.registers.m=2},
        RES3a: function(){cpu.registers.a &= 0xF7; cpu.registers.m=2}, RES3m: function(){MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))&0xF7); cpu.registers.m=4;},

        RES4b: function(){cpu.registers.b &= 0xEF; cpu.registers.m=2}, RES4c: function(){cpu.registers.c &= 0xEF; cpu.registers.m=2},
        RES4d: function(){cpu.registers.d &= 0xEF; cpu.registers.m=2}, RES4e: function(){cpu.registers.e &= 0xEF; cpu.registers.m=2},
        RES4h: function(){cpu.registers.h &= 0xEF; cpu.registers.m=2}, RES4l: function(){cpu.registers.l &= 0xEF; cpu.registers.m=2},
        RES4a: function(){cpu.registers.a &= 0xEF; cpu.registers.m=2}, RES4m: function(){MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))&0xEF); cpu.registers.m=4;},

        RES5b: function(){cpu.registers.b &= 0xDF; cpu.registers.m=2}, RES5c: function(){cpu.registers.c &= 0xDF; cpu.registers.m=2},
        RES5d: function(){cpu.registers.d &= 0xDF; cpu.registers.m=2}, RES5e: function(){cpu.registers.e &= 0xDF; cpu.registers.m=2},
        RES5h: function(){cpu.registers.h &= 0xDF; cpu.registers.m=2}, RES5l: function(){cpu.registers.l &= 0xDF; cpu.registers.m=2},
        RES5a: function(){cpu.registers.a &= 0xDF; cpu.registers.m=2}, RES5m: function(){MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))&0xDF); cpu.registers.m=4;},

        RES6b: function(){cpu.registers.b &= 0xBF; cpu.registers.m=2}, RES6c: function(){cpu.registers.c &= 0xBF; cpu.registers.m=2},
        RES6d: function(){cpu.registers.d &= 0xBF; cpu.registers.m=2}, RES6e: function(){cpu.registers.e &= 0xBF; cpu.registers.m=2},
        RES6h: function(){cpu.registers.h &= 0xBF; cpu.registers.m=2}, RES6l: function(){cpu.registers.l &= 0xBF; cpu.registers.m=2},
        RES6a: function(){cpu.registers.a &= 0xBF; cpu.registers.m=2}, RES6m: function(){MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))&0xBF); cpu.registers.m=4;},

        RES7b: function(){cpu.registers.b &= 0x7F; cpu.registers.m=2}, RES7c: function(){cpu.registers.c &= 0x7F; cpu.registers.m=2},
        RES7d: function(){cpu.registers.d &= 0x7F; cpu.registers.m=2}, RES7e: function(){cpu.registers.e &= 0x7F; cpu.registers.m=2},
        RES7h: function(){cpu.registers.h &= 0x7F; cpu.registers.m=2}, RES7l: function(){cpu.registers.l &= 0x7F; cpu.registers.m=2},
        RES7a: function(){cpu.registers.a &= 0x7F; cpu.registers.m=2}, RES7m: function(){MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))&0x7F); cpu.registers.m=4;},
        
        // set the bit in the register
        SET0b: function() { cpu.registers.b|=0x01; cpu.registers.m=2;}, SET0c: function() { cpu.registers.c|=0x01; cpu.registers.m=2;},
        SET0d: function() { cpu.registers.d|=0x01; cpu.registers.m=2;}, SET0e: function() { cpu.registers.e|=0x01; cpu.registers.m=2;},
        SET0h: function() { cpu.registers.h|=0x01; cpu.registers.m=2;}, SET0l: function() { cpu.registers.l|=0x01; cpu.registers.m=2;},
        SET0a: function() { cpu.registers.a|=0x01; cpu.registers.m=2;}, SET0m: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))|0x01); cpu.registers.m=4;},
        
        SET1b: function() { cpu.registers.b|=0x02; cpu.registers.m=2;}, SET1c: function() { cpu.registers.c|=0x02; cpu.registers.m=2;},
        SET1d: function() { cpu.registers.d|=0x02; cpu.registers.m=2;}, SET1e: function() { cpu.registers.e|=0x02; cpu.registers.m=2;},
        SET1h: function() { cpu.registers.h|=0x02; cpu.registers.m=2;}, SET1l: function() { cpu.registers.l|=0x02; cpu.registers.m=2;},
        SET1a: function() { cpu.registers.a|=0x02; cpu.registers.m=2;}, SET1m: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))|0x02); cpu.registers.m=4;},

        SET2b: function() { cpu.registers.b|=0x04; cpu.registers.m=2;}, SET2c: function() { cpu.registers.c|=0x04; cpu.registers.m=2;},
        SET2d: function() { cpu.registers.d|=0x04; cpu.registers.m=2;}, SET2e: function() { cpu.registers.e|=0x04; cpu.registers.m=2;},
        SET2h: function() { cpu.registers.h|=0x04; cpu.registers.m=2;}, SET2l: function() { cpu.registers.l|=0x04; cpu.registers.m=2;},
        SET2a: function() { cpu.registers.a|=0x04; cpu.registers.m=2;}, SET2m: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))|0x04); cpu.registers.m=4;},

        SET3b: function() { cpu.registers.b|=0x08; cpu.registers.m=2;}, SET3c: function() { cpu.registers.c|=0x08; cpu.registers.m=2;},
        SET3d: function() { cpu.registers.d|=0x08; cpu.registers.m=2;}, SET3e: function() { cpu.registers.e|=0x08; cpu.registers.m=2;},
        SET3h: function() { cpu.registers.h|=0x08; cpu.registers.m=2;}, SET3l: function() { cpu.registers.l|=0x08; cpu.registers.m=2;},
        SET3a: function() { cpu.registers.a|=0x08; cpu.registers.m=2;}, SET3m: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))|0x08); cpu.registers.m=4;},

        SET4b: function() { cpu.registers.b|=0x10; cpu.registers.m=2;}, SET4c: function() { cpu.registers.c|=0x10; cpu.registers.m=2;},
        SET4d: function() { cpu.registers.d|=0x10; cpu.registers.m=2;}, SET4e: function() { cpu.registers.e|=0x10; cpu.registers.m=2;},
        SET4h: function() { cpu.registers.h|=0x10; cpu.registers.m=2;}, SET4l: function() { cpu.registers.l|=0x10; cpu.registers.m=2;},
        SET4a: function() { cpu.registers.a|=0x10; cpu.registers.m=2;}, SET4m: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))|0x10); cpu.registers.m=4;},

        SET5b: function() { cpu.registers.b|=0x20; cpu.registers.m=2;}, SET5c: function() { cpu.registers.c|=0x20; cpu.registers.m=2;},
        SET5d: function() { cpu.registers.d|=0x20; cpu.registers.m=2;}, SET5e: function() { cpu.registers.e|=0x20; cpu.registers.m=2;},
        SET5h: function() { cpu.registers.h|=0x20; cpu.registers.m=2;}, SET5l: function() { cpu.registers.l|=0x20; cpu.registers.m=2;},
        SET5a: function() { cpu.registers.a|=0x20; cpu.registers.m=2;}, SET5m: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))|0x20); cpu.registers.m=4;},

        SET6b: function() { cpu.registers.b|=0x40; cpu.registers.m=2;}, SET6c: function() { cpu.registers.c|=0x40; cpu.registers.m=2;},
        SET6d: function() { cpu.registers.d|=0x40; cpu.registers.m=2;}, SET6e: function() { cpu.registers.e|=0x40; cpu.registers.m=2;},
        SET6h: function() { cpu.registers.h|=0x40; cpu.registers.m=2;}, SET6l: function() { cpu.registers.l|=0x40; cpu.registers.m=2;},
        SET6a: function() { cpu.registers.a|=0x40; cpu.registers.m=2;}, SET6m: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))|0x40); cpu.registers.m=4;},

        SET7b: function() { cpu.registers.b|=0x80; cpu.registers.m=2;}, SET7c: function() { cpu.registers.c|=0x80; cpu.registers.m=2;},
        SET7d: function() { cpu.registers.d|=0x80; cpu.registers.m=2;}, SET7e: function() { cpu.registers.e|=0x80; cpu.registers.m=2;},
        SET7h: function() { cpu.registers.h|=0x80; cpu.registers.m=2;}, SET7l: function() { cpu.registers.l|=0x80; cpu.registers.m=2;},
        SET7a: function() { cpu.registers.a|=0x80; cpu.registers.m=2;}, SET7m: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, (MMU.readByte((cpu.registers.h<<8)+cpu.registers.l))|0x80); cpu.registers.m=4;},
    
        // Shift register 1 bit to the left and carry flag is moved to bit 1.
        RLA: function() {var C_flag=cpu.registers.f&0x10?1:0; var bit8=cpu.registers.a&0x80?0x10:0; cpu.registers.a=(cpu.registers.a<<1)+C_flag; 
                        cpu.registers.a&=255; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=1;},
        
        // Shift register 1 bit to the left and set Carry flag and A to 8th bit.
        RLCA: function() {var C_flag=cpu.registers.a&0x80?1:0; var bit8=cpu.registers.a&0x80?0x10:0; cpu.registers.a=(cpu.registers.a<<1)+C_flag; 
                        cpu.registers.a&=255; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=1;},

        // Shift register 1 bit to the right and carry flag is moved to bit 8.
        RRA: function() {var C_flag=cpu.registers.f&0x10?0x80:0; var bit1=cpu.registers.a&1?0x10:0; cpu.registers.a=(cpu.registers.a>>1)+C_flag; 
                        cpu.registers.a&=255; cpu.registers.f=(cpu.registers.f&0xEF)+bit1; cpu.registers.m=1;},

        // Shift register 1 bit to the right and set Carry flag and A to 1st bit.
        RRCA: function() {var C_flag=cpu.registers.a&1?0x80:0; var bit1=cpu.registers.a&1?0x10:0; cpu.registers.a=(cpu.registers.a>>1)+C_flag; 
                        cpu.registers.a&=255; cpu.registers.f=(cpu.registers.f&0xEF)+bit1; cpu.registers.m=1;},

        // Shift register 1 bit to the left and carry flag is moved to bit 1.
        RLr_b: function() {var C_flag=cpu.registers.f&0x10?1:0; var bit8=cpu.registers.b&0x80?0x10:0; cpu.registers.b=(cpu.registers.b<<1)+C_flag; cpu.registers.b&=255; 
                        cpu.registers.f=(cpu.registers.b)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},   
        RLr_c: function() {var C_flag=cpu.registers.f&0x10?1:0; var bit8=cpu.registers.c&0x80?0x10:0; cpu.registers.c=(cpu.registers.c<<1)+C_flag; cpu.registers.b&=255; 
                        cpu.registers.f=(cpu.registers.c)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        RLr_d: function() {var C_flag=cpu.registers.f&0x10?1:0; var bit8=cpu.registers.d&0x80?0x10:0; cpu.registers.d=(cpu.registers.d<<1)+C_flag; cpu.registers.b&=255; 
                        cpu.registers.f=(cpu.registers.d)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        RLr_e: function() {var C_flag=cpu.registers.f&0x10?1:0; var bit8=cpu.registers.e&0x80?0x10:0; cpu.registers.e=(cpu.registers.e<<1)+C_flag; cpu.registers.b&=255; 
                        cpu.registers.f=(cpu.registers.e)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;}, 
        RLr_h: function() {var C_flag=cpu.registers.f&0x10?1:0; var bit8=cpu.registers.h&0x80?0x10:0; cpu.registers.h=(cpu.registers.h<<1)+C_flag; cpu.registers.b&=255; 
                        cpu.registers.f=(cpu.registers.h)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        RLr_l: function() {var C_flag=cpu.registers.f&0x10?1:0; var bit8=cpu.registers.l&0x80?0x10:0; cpu.registers.l=(cpu.registers.l<<1)+C_flag; cpu.registers.b&=255; 
                        cpu.registers.f=(cpu.registers.l)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        RLr_a: function() {var C_flag=cpu.registers.f&0x10?1:0; var bit8=cpu.registers.a&0x80?0x10:0; cpu.registers.a=(cpu.registers.a<<1)+C_flag; cpu.registers.b&=255; 
                        cpu.registers.f=(cpu.registers.a)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        RLHL: function() {var hl=MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); var C_flag=cpu.registers.f&0x10?1:0; var co=hl&0x80?0x10:0; hl=(hl<<1)+C_flag; hl&=255; 
                        cpu.registers.f=(hl)?0:0x80; MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l,hl); cpu.registers.f=(cpu.registers.f&0xEF)+co; cpu.registers.m=4; },

        // Shift register 1 bit to the left and copy contents of Carry flag to bit 0
        RLCr_b: function() {var C_flag=cpu.registers.b&0x80?1:0; var bit8=cpu.registers.b&0x80?0x10:0; cpu.registers.b=(cpu.registers.b<<1)+C_flag;
                            cpu.registers.b&=255; cpu.registers.f=(cpu.registers.b)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        RLCr_c: function() {var C_flag=cpu.registers.c&0x80?1:0; var bit8=cpu.registers.c&0x80?0x10:0; cpu.registers.c=(cpu.registers.c<<1)+C_flag;
                            cpu.registers.c&=255; cpu.registers.f=(cpu.registers.c)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        RLCr_d: function() {var C_flag=cpu.registers.d&0x80?1:0; var bit8=cpu.registers.d&0x80?0x10:0; cpu.registers.d=(cpu.registers.d<<1)+C_flag;
                            cpu.registers.d&=255; cpu.registers.f=(cpu.registers.d)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        RLCr_e: function() {var C_flag=cpu.registers.e&0x80?1:0; var bit8=cpu.registers.e&0x80?0x10:0; cpu.registers.e=(cpu.registers.e<<1)+C_flag;
                            cpu.registers.e&=255; cpu.registers.f=(cpu.registers.e)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        RLCr_h: function() {var C_flag=cpu.registers.h&0x80?1:0; var bit8=cpu.registers.h&0x80?0x10:0; cpu.registers.h=(cpu.registers.h<<1)+C_flag;
                            cpu.registers.h&=255; cpu.registers.f=(cpu.registers.h)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        RLCr_l: function() {var C_flag=cpu.registers.l&0x80?1:0; var bit8=cpu.registers.l&0x80?0x10:0; cpu.registers.l=(cpu.registers.l<<1)+C_flag;
                            cpu.registers.l&=255; cpu.registers.f=(cpu.registers.l)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        RLCr_a: function() {var C_flag=cpu.registers.a&0x80?1:0; var bit8=cpu.registers.a&0x80?0x10:0; cpu.registers.a=(cpu.registers.a<<1)+C_flag;
                            cpu.registers.a&=255; cpu.registers.f=(cpu.registers.a)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        RLCHL: function() {var hl=MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); var C_flag=hl&0x80?1:0; var co=h&0x80?0x10:0; hl=(hl<<1)+C_flag; hl&=255; 
                            cpu.registers.f=(hl)?0:0x80; MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l,hl); cpu.registers.f=(cpu.registers.f&0xEF)+co; cpu.registers.m=4; },

        // Shift register 1 bit to the rigt and copy contents of bit 0 to carry flag and Carry flag to bit 7
        RRr_b: function() {var C_flag=cpu.registers.f&0x10?0x80:0; var bit0=cpu.registers.b&1?0x10:0; cpu.registers.b=(cpu.registers.b>>1)+C_flag;
                            cpu.registers.b&=255; cpu.registers.f=(cpu.registers.b)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit0; cpu.registers.m=2;},
        RRr_c: function() {var C_flag=cpu.registers.f&0x10?0x80:0; var bit0=cpu.registers.c&1?0x10:0; cpu.registers.c=(cpu.registers.c>>1)+C_flag;
                            cpu.registers.c&=255; cpu.registers.f=(cpu.registers.c)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit0; cpu.registers.m=2;},
        RRr_d: function() {var C_flag=cpu.registers.f&0x10?0x80:0; var bit0=cpu.registers.d&1?0x10:0; cpu.registers.d=(cpu.registers.d>>1)+C_flag;
                            cpu.registers.d&=255; cpu.registers.f=(cpu.registers.d)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit0; cpu.registers.m=2;},
        RRr_e: function() {var C_flag=cpu.registers.f&0x10?0x80:0; var bit0=cpu.registers.e&1?0x10:0; cpu.registers.e=(cpu.registers.e>>1)+C_flag;
                            cpu.registers.e&=255; cpu.registers.f=(cpu.registers.e)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit0; cpu.registers.m=2;},
        RRr_h: function() {var C_flag=cpu.registers.f&0x10?0x80:0; var bit0=cpu.registers.h&1?0x10:0; cpu.registers.h=(cpu.registers.h>>1)+C_flag;
                            cpu.registers.h&=255; cpu.registers.f=(cpu.registers.h)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit0; cpu.registers.m=2;},
        RRr_l: function() {var C_flag=cpu.registers.f&0x10?0x80:0; var bit0=cpu.registers.l&1?0x10:0; cpu.registers.l=(cpu.registers.l>>1)+C_flag;
                            cpu.registers.l&=255; cpu.registers.f=(cpu.registers.l)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit0; cpu.registers.m=2;},
        RRr_a: function() {var C_flag=cpu.registers.f&0x10?0x80:0; var bit0=cpu.registers.a&1?0x10:0; cpu.registers.a=(cpu.registers.a>>1)+C_flag;
                            cpu.registers.a&=255; cpu.registers.f=(cpu.registers.a)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit0; cpu.registers.m=2;},
        RRHL: function() {var hl=MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); var C_flag=cpu.registers.f&0x10?0x80:0; var co=hl&1?0x10:0; hl=(hl>>1)+C_flag; 
                            hl&=255; MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l,hl); cpu.registers.f=(hl)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+co; cpu.registers.m=4;},

        // Reg rotated 1 bit to the right. Bit 0 copied to Carry flag and bit 7
        RRCr_b: function(){var C_flag = (cpu.registers.b&1)?0x80:0; var bit0=(cpu.registers.b&1)?0x10:0; cpu.registers.b=(cpu.registers.b>>1)+C_flag;
                            cpu.registers.b&=255; cpu.registers.f=(cpu.registers.b)?0:0x80; cpu.registers.f=(cpu.registers.f&0xFE)+bit0; cpu.registers.m=2;},
        RRCr_c: function(){var C_flag = (cpu.registers.c&1)?0x80:0; var bit0=(cpu.registers.c&1)?0x10:0; cpu.registers.c=(cpu.registers.c>>1)+C_flag;
                            cpu.registers.c&=255; cpu.registers.f=(cpu.registers.c)?0:0x80; cpu.registers.f=(cpu.registers.f&0xFE)+bit0; cpu.registers.m=2;},
        RRCr_d: function(){var C_flag = (cpu.registers.d&1)?0x80:0; var bit0=(cpu.registers.d&1)?0x10:0; cpu.registers.d=(cpu.registers.d>>1)+C_flag;
                            cpu.registers.d&=255; cpu.registers.f=(cpu.registers.d)?0:0x80; cpu.registers.f=(cpu.registers.f&0xFE)+bit0; cpu.registers.m=2;},
        RRCr_e: function(){var C_flag = (cpu.registers.e&1)?0x80:0; var bit0=(cpu.registers.e&1)?0x10:0; cpu.registers.e=(cpu.registers.e>>1)+C_flag;
                            cpu.registers.e&=255; cpu.registers.f=(cpu.registers.e)?0:0x80; cpu.registers.f=(cpu.registers.f&0xFE)+bit0; cpu.registers.m=2;},
        RRCr_h: function(){var C_flag = (cpu.registers.h&1)?0x80:0; var bit0=(cpu.registers.h&1)?0x10:0; cpu.registers.h=(cpu.registers.h>>1)+C_flag;
                            cpu.registers.h&=255; cpu.registers.f=(cpu.registers.h)?0:0x80; cpu.registers.f=(cpu.registers.f&0xFE)+bit0; cpu.registers.m=2;},
        RRCr_l: function(){var C_flag = (cpu.registers.l&1)?0x80:0; var bit0=(cpu.registers.l&1)?0x10:0; cpu.registers.l=(cpu.registers.l>>1)+C_flag;
                            cpu.registers.l&=255; cpu.registers.f=(cpu.registers.l)?0:0x80; cpu.registers.f=(cpu.registers.f&0xFE)+bit0; cpu.registers.m=2;},
        RRCr_a: function(){var C_flag = (cpu.registers.a&1)?0x80:0; var bit0=(cpu.registers.a&1)?0x10:0; cpu.registers.a=(cpu.registers.a>>1)+C_flag;
                            cpu.registers.a&=255; cpu.registers.f=(cpu.registers.a)?0:0x80; cpu.registers.f=(cpu.registers.f&0xFE)+bit0; cpu.registers.m=2;},
        RRCHL: function(){var hl=MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); var C_flag=hl&1?0x80:0; var co=hl&1?0x10:0; hl=(hl>>1)+C_flag; hl&=255; MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l,hl); cpu.registers.f=(hl)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+co; cpu.registers.m=4;},

        // operand rotated 1 bit to left and contents of bit 8 become Carry flag. Bit 0 is the least significant bit.
        SLAr_b: function() {var bit8 = (cpu.registers.b&0x80)?0x10:0; cpu.registers.b=(cpu.registers.b<<1)&255;
                            cpu.registers.f=(cpu.registers.b)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        SLAr_c: function() {var bit8 = (cpu.registers.c&0x80)?0x10:0; cpu.registers.c=(cpu.registers.c<<1)&255;
                            cpu.registers.f=(cpu.registers.c)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        SLAr_d: function() {var bit8 = (cpu.registers.d&0x80)?0x10:0; cpu.registers.d=(cpu.registers.d<<1)&255;
                            cpu.registers.f=(cpu.registers.d)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        SLAr_e: function() {var bit8 = (cpu.registers.e&0x80)?0x10:0; cpu.registers.e=(cpu.registers.e<<1)&255;
                            cpu.registers.f=(cpu.registers.e)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        SLAr_h: function() {var bit8 = (cpu.registers.h&0x80)?0x10:0; cpu.registers.h=(cpu.registers.h<<1)&255;
                            cpu.registers.f=(cpu.registers.h)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        SLAr_l: function() {var bit8 = (cpu.registers.l&0x80)?0x10:0; cpu.registers.l=(cpu.registers.l<<1)&255;
                            cpu.registers.f=(cpu.registers.l)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        SLAr_a: function() {var bit8 = (cpu.registers.a&0x80)?0x10:0; cpu.registers.a=(cpu.registers.a<<1)&255;
                            cpu.registers.f=(cpu.registers.a)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        
        // same as SLA except mask to 256 instead of 255
        SLLr_b: function() {var bit8 = (cpu.registers.b&0x80)?0x10:0; cpu.registers.b=(cpu.registers.b<<1)&255;
            cpu.registers.f=(cpu.registers.b)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        SLLr_c: function() {var bit8 = (cpu.registers.c&0x80)?0x10:0; cpu.registers.c=(cpu.registers.c<<1)&255;
                cpu.registers.f=(cpu.registers.c)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        SLLr_d: function() {var bit8 = (cpu.registers.d&0x80)?0x10:0; cpu.registers.d=(cpu.registers.d<<1)&255;
                cpu.registers.f=(cpu.registers.d)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        SLLr_e: function() {var bit8 = (cpu.registers.e&0x80)?0x10:0; cpu.registers.e=(cpu.registers.e<<1)&255;
                cpu.registers.f=(cpu.registers.e)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        SLLr_h: function() {var bit8 = (cpu.registers.h&0x80)?0x10:0; cpu.registers.h=(cpu.registers.h<<1)&255;
                cpu.registers.f=(cpu.registers.h)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        SLLr_l: function() {var bit8 = (cpu.registers.l&0x80)?0x10:0; cpu.registers.l=(cpu.registers.l<<1)&255;
                cpu.registers.f=(cpu.registers.l)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},
        SLLr_a: function() {var bit8 = (cpu.registers.a&0x80)?0x10:0; cpu.registers.a=(cpu.registers.a<<1)&255;
                cpu.registers.f=(cpu.registers.a)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+bit8; cpu.registers.m=2;},

        // bit shift right in operand. Bit 0 copied to carry flag. Bit 7 stays the same.
        SRAr_b: function(){var bit8=cpu.registers.b&0x80; var C_flag=(cpu.registers.b&1)?0x10:0; ((cpu.registers.b>>1)+bit8)&255; 
                            cpu.registers.f=(cpu.registers.b)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+C_flag; cpu.registers.m=2;},
        SRAr_c: function(){var bit8=cpu.registers.c&0x80; var C_flag=(cpu.registers.c&1)?0x10:0; ((cpu.registers.c>>1)+bit8)&255; 
                            cpu.registers.f=(cpu.registers.c)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+C_flag; cpu.registers.m=2;},
        SRAr_d: function(){var bit8=cpu.registers.d&0x80; var C_flag=(cpu.registers.d&1)?0x10:0; ((cpu.registers.d>>1)+bit8)&255; 
                            cpu.registers.f=(cpu.registers.d)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+C_flag; cpu.registers.m=2;},
        SRAr_e: function(){var bit8=cpu.registers.e&0x80; var C_flag=(cpu.registers.e&1)?0x10:0; ((cpu.registers.e>>1)+bit8)&255; 
                            cpu.registers.f=(cpu.registers.e)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+C_flag; cpu.registers.m=2;},
        SRAr_h: function(){var bit8=cpu.registers.h&0x80; var C_flag=(cpu.registers.h&1)?0x10:0; ((cpu.registers.h>>1)+bit8)&255; 
                            cpu.registers.f=(cpu.registers.h)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+C_flag; cpu.registers.m=2;},
        SRAr_l: function(){var bit8=cpu.registers.l&0x80; var C_flag=(cpu.registers.l&1)?0x10:0; ((cpu.registers.l>>1)+bit8)&255; 
                            cpu.registers.f=(cpu.registers.l)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+C_flag; cpu.registers.m=2;},
        SRAr_a: function(){var bit8=cpu.registers.a&0x80; var C_flag=(cpu.registers.a&1)?0x10:0; ((cpu.registers.a>>1)+bit8)&255; 
                            cpu.registers.f=(cpu.registers.a)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+C_flag; cpu.registers.m=2;},

        // m operand shifter 1 bit to the right. Bit 0 copied to C flag and bit 7 is reset.
        SRLr_b: function() { var co=cpu.registers.b&1?0x10:0; cpu.registers.b=(cpu.registers.b>>1)&255; 
                            cpu.registers.f=(cpu.registers.b)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+co; cpu.registers.m=2; },
        SRLr_c: function() { var co=cpu.registers.c&1?0x10:0; cpu.registers.c=(cpu.registers.c>>1)&255; 
                            cpu.registers.f=(cpu.registers.c)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+co; cpu.registers.m=2; },
        SRLr_d: function() { var co=cpu.registers.d&1?0x10:0; cpu.registers.d=(cpu.registers.d>>1)&255; 
                            cpu.registers.f=(cpu.registers.d)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+co; cpu.registers.m=2; },
        SRLr_e: function() { var co=cpu.registers.e&1?0x10:0; cpu.registers.e=(cpu.registers.e>>1)&255; 
                            cpu.registers.f=(cpu.registers.e)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+co; cpu.registers.m=2; },
        SRLr_h: function() { var co=cpu.registers.h&1?0x10:0; cpu.registers.h=(cpu.registers.h>>1)&255; 
                            cpu.registers.f=(cpu.registers.h)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+co; cpu.registers.m=2; },
        SRLr_l: function() { var co=cpu.registers.l&1?0x10:0; cpu.registers.l=(cpu.registers.l>>1)&255; 
                            cpu.registers.f=(cpu.registers.l)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+co; cpu.registers.m=2; },
        SRLr_a: function() { var co=cpu.registers.a&1?0x10:0; cpu.registers.a=(cpu.registers.a>>1)&255; 
                            cpu.registers.f=(cpu.registers.a)?0:0x80; cpu.registers.f=(cpu.registers.f&0xEF)+co; cpu.registers.m=2; },

        // Flip all bits in A reg
        CPL: function() {cpu.registers.a ^= 255; utils.setN(1); utils.setH(1); cpu.registers.m=1;},

        // Flips the carry flag and clears N and H flags.
        CCF: function() {(cpu.registers.f&0x10)?utils.setC(0):utils.setC(1); utils.setN(0); utils.setH(0); cpu.registers.m=1;},

        // Set Carry flag and reset N and H
        SCF: function() {utils.setC(1); utils.setN(0); utils.setH(0); cpu.registers.m=1;},


        // Jump Functions ----------------------------------------------------------------------------------------------------------------
        // nn operand is loaded to PC and the next instruction in fetched
        JPpc: function() {cpu.registers.pc=MMU.readWord(cpu.registers.pc); cpu.registers.m=3;},
        JPHL: function() {cpu.registers.pc=(cpu.registers.h<<8)+cpu.registers.l; cpu.registers.m=1;},
        
        // If last operation was not zero, jump to address nn (Checks zero flag) 
        JPNZnn: function() {cpu.registers.m=3; if(!(cpu.registers.f&0x80)){cpu.registers.pc=MMU.readWord(cpu.registers.pc); cpu.registers.m++;}else{cpu.registers.pc+=2;} }, 
        
        // If last operation was zero, jump to address nn (Checks zero flag) 
        JPZnn: function() {cpu.registers.m=3; if(cpu.registers.f&0x80){cpu.registers.pc=MMU.readWord(cpu.registers.pc); cpu.registers.m++;}else{cpu.registers.pc+=2;} }, 
        
        // If last operation was not a carry, jump to address nn (Checks carry flag) 
        JPNCnn: function() {cpu.registers.m=3; if(!(cpu.registers.f&0x10)){cpu.registers.pc=MMU.readWord(cpu.registers.pc); cpu.registers.m++;}else{cpu.registers.pc+=2;} }, 
        
        // If last operation was a carry, jump to address nn (Checks carry flag) 
        JPCnn: function() {cpu.registers.m=3; if(cpu.registers.f&0x10){cpu.registers.pc=MMU.readWord(cpu.registers.pc); cpu.registers.m++;}else{cpu.registers.pc+=2;} }, 

        // Adds signed byte to the current address, then jumps to it.
        JRpc: function() {var nextAdd=MMU.readByte(cpu.registers.pc); if(nextAdd>127){nextAdd=-((~nextAdd+1)&255)}; cpu.registers.pc++; cpu.registers.m=2; cpu.registers.pc+=nextAdd; cpu.registers.m++;},

        // Adds signed byte to the current address, then jumps to it. Only if last operation was not zero
        JRNZpc: function() { var i=MMU.readByte(cpu.registers.pc); if(jsGB.counter > 60000){console.log(`i = ${i}, f = ${cpu.registers.f}`)}; if(i>127) {i=-((~i+1)&255); if(jsGB.counter > 60000){console.log(`True 1 = ${i}`)}}; cpu.registers.pc++; cpu.registers.m=2; if((cpu.registers.f&0x80)==0x00) { if(jsGB.counter > 60000){console.log(`True 2`);} cpu.registers.pc+=i; cpu.registers.m++; } console.log(`pc = ${cpu.registers.pc}`)},

        // Adds signed byte to the current address, then jumps to it. Only if last operation was zero
        JRZpc: function() {var nextAdd=MMU.readByte(cpu.registers.pc); if(nextAdd>127){nextAdd=-((~nextAdd+1)&255)}; cpu.registers.pc++; cpu.registers.m=2; if(cpu.registers.f&0x80) {cpu.registers.pc+=nextAdd; cpu.registers.m++;}},

        // Adds signed byte to the current address, then jumps to it. Only if last operation was not a carry
        JRNCpc: function() {var nextAdd=MMU.readByte(cpu.registers.pc); if(nextAdd>127){nextAdd=-((~nextAdd+1)&255)}; cpu.registers.pc++; cpu.registers.m=2; if(!(cpu.registers.f&0x10)) {cpu.registers.pc+=nextAdd; cpu.registers.m++;}},

        // Adds signed byte to the current address, then jumps to it. Only if last operation was a carry
        JRCpc: function() {var nextAdd=MMU.readByte(cpu.registers.pc); if(nextAdd>127){nextAdd=-((~nextAdd+1)&255)}; cpu.registers.pc++; cpu.registers.m=2; if(cpu.registers.f&0x10) {cpu.registers.pc+=nextAdd; cpu.registers.m++;}},

        // If b reg is greater than zero, add signed byte to the current address and then jump to it.
        DJNZn: function() {var nextAdd=MMU.readByte(cpu.registers.pc); if(nextAdd>127){nextAdd=-((~nextAdd+1)&255)}; cpu.registers.pc++; cpu.registers.m=2; cpu.registers.b--; if(cpu.registers.b){cpu.registers.pc+=nextAdd; cpu.registers.m++;}},

        // Write nn to top of stack
        CALLnn: function() {console.log("CALLnnSP"); cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp, cpu.registers.pc+2); cpu.registers.pc=MMU.readWord(cpu.registers.pc); cpu.registers.m=5;},
        CALLNotZnn: function() {console.log("CALLnnSP2");cpu.registers.m=3; if((cpu.registers.f&0x80)==0x00) {cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp,cpu.registers.pc+2); cpu.registers.pc=MMU.readWord(cpu.registers.pc); cpu.registers.m+=2;}else{cpu.registers.pc+=2;}},
        CALLZnn: function() {console.log("CALLnnSP3");cpu.registers.m=3; if((cpu.registers.f&0x80)==0x80) {cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp,cpu.registers.pc+2); cpu.registers.pc=MMU.readWord(cpu.registers.pc); cpu.registers.m+=2;}else{cpu.registers.pc+=2;}},
        CALLNotCnn: function() {console.log("CALLnnSP4");cpu.registers.m=3; if((cpu.registers.f&0x10)==0x00) {cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp,cpu.registers.pc+2); cpu.registers.pc=MMU.readWord(cpu.registers.pc); cpu.registers.m+=2;}else{cpu.registers.pc+=2;}},
        CALLCnn: function() {console.log("CALLnnSP5");cpu.registers.m=3; if((cpu.registers.f&0x10)==0x10) {cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp,cpu.registers.pc+2); cpu.registers.pc=MMU.readWord(cpu.registers.pc); cpu.registers.m+=2;}else{cpu.registers.pc+=2;}},

        // Info at mem address SP is put in PC
        RET: function() {console.log(`sp = ${cpu.registers.sp}, hl = ${(cpu.registers.h<<8)+cpu.registers.l}`); cpu.registers.pc=MMU.readWord(cpu.registers.sp); cpu.registers.sp+=2; cpu.registers.m=3;},

        // Used at end of interrupt. Resets PC. Signal IO device that interrupt is complete.
        RETI: function() {console.log("RETIsp");cpu.operations.resetReg(); cpu.operations.resetValues; cpu.registers.pc=MMU.readWord(cpu.registers.sp); cpu.registers.sp+=2; cpu.registers.ime=1; cpu.registers.m = 3},
        // If zero flag is not set
        RETNotZ: function() {console.log("RETI2SP");cpu.registers.m=1; if((cpu.registers.f&0x80)==0x00){cpu.registers.pc=MMU.readWord(cpu.registers.sp); cpu.registers.sp+=2; cpu.registers.m+=2}},
        // If zero flag is set
        RETZ: function() {console.log("RETI3SP");cpu.registers.m=1; if((cpu.registers.f&0x80)==0x80){cpu.registers.pc=MMU.readWord(cpu.registers.sp); cpu.registers.sp+=2; cpu.registers.m+=2}},
        // If carry flag is not set
        RETNotC: function() {console.log(`retnc F = ${cpu.registers.f&0x10}`);cpu.registers.m=1; if((cpu.registers.f&0x10)==0x00){cpu.registers.pc=MMU.readWord(cpu.registers.sp); cpu.registers.sp+=2; cpu.registers.m+=2}},
        // If carry flag is set
        RETC: function() {console.log("RETI5SP");cpu.registers.m=1; if((cpu.registers.f&0x10)==0x10){cpu.registers.pc=MMU.readWord(cpu.registers.sp); cpu.registers.sp+=2; cpu.registers.m+=2}},

        // PC contents pushed into external mem stack and contents of operand loaded to PC
        RST00: function() {console.log("RST1sp"); cpu.operations.resetValues(); cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp, cpu.registers.pc); cpu.registers.pc=0x00; cpu.registers.m=3;},
        RST08: function() {console.log("RST2sp");cpu.operations.resetValues(); cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp, cpu.registers.pc); cpu.registers.pc=0x08; cpu.registers.m=3;},
        RST10: function() {console.log("RST3sp");cpu.operations.resetValues(); cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp, cpu.registers.pc); cpu.registers.pc=0x10; cpu.registers.m=3;},
        RST18: function() {console.log("RST4sp");cpu.operations.resetValues(); cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp, cpu.registers.pc); cpu.registers.pc=0x18; cpu.registers.m=3;},
        RST20: function() {console.log("RST5sp");cpu.operations.resetValues(); cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp, cpu.registers.pc); cpu.registers.pc=0x20; cpu.registers.m=3;},
        RST28: function() {console.log("RST6sp");cpu.operations.resetValues(); cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp, cpu.registers.pc); cpu.registers.pc=0x28; cpu.registers.m=3;},
        RST30: function() {console.log("RST7sp");cpu.operations.resetValues(); cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp, cpu.registers.pc); cpu.registers.pc=0x30; cpu.registers.m=3;},
        RST38: function() {console.log("RST8sp");cpu.operations.resetValues(); cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp, cpu.registers.pc); cpu.registers.pc=0x38; cpu.registers.m=3;},
        RST40: function() {console.log("RST9sp");cpu.operations.resetValues(); cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp, cpu.registers.pc); cpu.registers.pc=0x40; cpu.registers.m=3;},
        RST48: function() {console.log("RST10sp");cpu.operations.resetValues(); cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp, cpu.registers.pc); cpu.registers.pc=0x48; cpu.registers.m=3;},
        RST50: function() {console.log("RST11sp");cpu.operations.resetValues(); cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp, cpu.registers.pc); cpu.registers.pc=0x50; cpu.registers.m=3;},
        RST58: function() {console.log("RST12sp");cpu.operations.resetValues(); cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp, cpu.registers.pc); cpu.registers.pc=0x58; cpu.registers.m=3;},
        RST60: function() {console.log("RST13sp");cpu.operations.resetValues(); cpu.registers.sp-=2; MMU.writeWord(cpu.registers.sp, cpu.registers.pc); cpu.registers.pc=0x60; cpu.registers.m=3;},

        // CPU performs nothing during this machine cycle
        NOP: function() {cpu.registers.m=1;},

        // Execute NOP untill interupt or reset (suspend CPU)
        HALT: function() {cpu.halt=1; cpu.registers.m=1;},

        // Dissable Interrupt
        DI: function() {cpu.registers.ime=0; cpu.registers.m=1;},

        // Enable Interrupt
        EI: function() {cpu.registers.ime=1; cpu.registers.m=1;},

        // Utils for interrupt ----------------------------------------------------------------------------------------------------------
        // Set the reset values to the current reg values.
        resetValues: function() {cpu._resetValues.a=cpu.registers.a;; cpu._resetValues.b=cpu.registers.b; cpu._resetValues.c=cpu.registers.c;
                                cpu._resetValues.d=cpu.registers.d; cpu._resetValues.e=cpu.registers.e; cpu._resetValues.f=cpu.registers.f
                                cpu._resetValues.h=cpu.registers.h; cpu._resetValues.l=cpu.registers.l;},
        
        // Set register values to the reset vals
        resetReg: function() {cpu.registers.a=cpu._resetValues.a; cpu.registers.b=cpu._resetValues.b; cpu.registers.c=cpu._resetValues;
                            cpu.registers.d=cpu._resetValues.d; cpu.registers.e=cpu._resetValues.e; cpu.registers.f=cpu._resetValues.f;
                            cpu.registers.h=cpu._resetValues.h; cpu.registers.l=cpu._resetValues.l;},


        // Stack Functions----------------------------------------------------------------------------------------------------------------
        // Push 16-bit reg to LFIO stack (last-in first-out).
        PUSHBC: function() {console.log("PUSHsp1"); cpu.registers.sp--; MMU.writeByte(cpu.registers.sp, cpu.registers.b); cpu.registers.sp--; MMU.writeByte(cpu.registers.sp, cpu.registers.c); cpu.registers.m=3;},
        PUSHDE: function() {console.log("PUSHsp2");cpu.registers.sp--; MMU.writeByte(cpu.registers.sp, cpu.registers.d); cpu.registers.sp--; MMU.writeByte(cpu.registers.sp, cpu.registers.e); cpu.registers.m=3;},
        PUSHHL: function() {console.log(`PUSHsp3 before = ${cpu.registers.sp}`);cpu.registers.sp--; MMU.writeByte(cpu.registers.sp, cpu.registers.h); cpu.registers.sp--; MMU.writeByte(cpu.registers.sp, cpu.registers.l); console.log(`PUSHsp3 after = ${cpu.registers.sp}`); cpu.registers.m=3;},
        PUSHAF: function() {console.log("PUSHsp4");cpu.registers.sp--; MMU.writeByte(cpu.registers.sp, cpu.registers.a); cpu.registers.sp--; MMU.writeByte(cpu.registers.sp, cpu.registers.f); cpu.registers.m=3;},

        // Pop 16-bit reg off of stack
        POPBC: function() {console.log("POPsp1"); cpu.registers.c=MMU.readByte(cpu.registers.sp); cpu.registers.sp++; cpu.registers.b=MMU.readByte(cpu.registers.sp); cpu.registers.sp++; cpu.registers.m=3;},
        POPDE: function() {console.log(`POPsp2 before = ${cpu.registers.sp}`);cpu.registers.e=MMU.readByte(cpu.registers.sp); cpu.registers.sp++; cpu.registers.d=MMU.readByte(cpu.registers.sp); cpu.registers.sp++; console.log(`POPsp2 after = ${cpu.registers.sp}`);cpu.registers.m=3;},
        POPHL: function() {console.log("POPsp3");cpu.registers.l=MMU.readByte(cpu.registers.sp); cpu.registers.sp++; cpu.registers.h=MMU.readByte(cpu.registers.sp); cpu.registers.sp++; cpu.registers.m=3;},
        POPAF: function() {console.log("POPsp4");cpu.registers.f=MMU.readByte(cpu.registers.sp); cpu.registers.sp++; cpu.registers.a=MMU.readByte(cpu.registers.sp); cpu.registers.sp++; cpu.registers.m=3;},

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
        LDrrBB: function() {console.log(`LDrrBB before = ${cpu.registers.a}`); cpu.registers.b = cpu.registers.b; console.log(`LDrrBB after = ${cpu.registers.a}`); cpu.registers.m = 1;},
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

        // 8-bit part of HL loaded into reg
        LDrHLm_b: function() {cpu.registers.b = MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.m=2;},
        LDrHLm_c: function() {cpu.registers.c = MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.m=2;},
        LDrHLm_d: function() {cpu.registers.d = MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.m=2;},
        LDrHLm_e: function() {cpu.registers.e = MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.m=2;},
        LDrHLm_h: function() {cpu.registers.h = MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.m=2;},
        LDrHLm_l: function() {cpu.registers.l = MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.m=2;},
        LDrHLm_a: function() {cpu.registers.a = MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.m=2;},

        // register is loaded into HL
        LDHLmr_b: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, cpu.registers.b); cpu.registers.m=2;},
        LDHLmr_c: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, cpu.registers.c); cpu.registers.m=2;},
        LDHLmr_d: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, cpu.registers.d); cpu.registers.m=2;},
        LDHLmr_e: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, cpu.registers.e); cpu.registers.m=2;},
        LDHLmr_h: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, cpu.registers.h); cpu.registers.m=2;},
        LDHLmr_l: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, cpu.registers.l); cpu.registers.m=2;},
        LDHLmr_a: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, cpu.registers.a); cpu.registers.m=2;},

        // load n into register
        LDrn_b: function() {cpu.registers.b = MMU.readByte(cpu.registers.pc); cpu.registers.pc++; cpu.registers.m=2;},
        LDrn_c: function() {cpu.registers.c = MMU.readByte(cpu.registers.pc); cpu.registers.pc++; cpu.registers.m=2;},
        LDrn_d: function() {cpu.registers.d = MMU.readByte(cpu.registers.pc); cpu.registers.pc++; cpu.registers.m=2;},
        LDrn_e: function() {cpu.registers.e = MMU.readByte(cpu.registers.pc); cpu.registers.pc++; cpu.registers.m=2;},
        LDrn_h: function() {cpu.registers.h = MMU.readByte(cpu.registers.pc); cpu.registers.pc++; cpu.registers.m=2;},
        LDrn_l: function() {cpu.registers.l = MMU.readByte(cpu.registers.pc); cpu.registers.pc++; cpu.registers.m=2;},
        LDrn_a: function() {cpu.registers.a = MMU.readByte(cpu.registers.pc); cpu.registers.pc++; cpu.registers.m=2;},

        // load mem address (mn) into HL
        LDHLmn: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, MMU.readByte(cpu.registers.pc)); cpu.registers.pc++; cpu.registers.m=3;},

        // A loaded into BC or DE
        LDBCmA: function() {MMU.writeByte((cpu.registers.b<<8)+cpu.registers.c, cpu.registers.a); cpu.registers.m=2;},
        LDDEmA: function() {MMU.writeByte((cpu.registers.d<<8)+cpu.registers.e, cpu.registers.a); cpu.registers.m=2;},

        // Load content in BC into A
        LDABCm: function () {console.log(`LDABCm before a = ${cpu.registers.a}, b = ${cpu.registers.b}, c = ${cpu.registers.c}`); cpu.registers.a = MMU.readByte((cpu.registers.b << 8)+cpu.registers.c); console.log(`LDABCm after a = ${cpu.registers.a}, b = ${cpu.registers.b}, c = ${cpu.registers.c}`); cpu.registers.m=2;},

        // Load content in DE into A
        LDADEm: function() {cpu.registers.a = MMU.readByte((cpu.registers.d << 8) + cpu.registers.e); cpu.registers.m=2;},

        // Load A reg into mem address in PC
        LDmmA: function() {MMU.writeByte(MMU.readWord(cpu.registers.pc), cpu.registers.a); cpu.registers.pc+=2; cpu.registers.m=4},

        // Load content in mem address in PC into A
        LDAmm: function() {console.log(`LDAmm before = ${cpu.registers.a}`); cpu.registers.a = MMU.readByte(MMU.readWord(cpu.registers.pc)); cpu.registers.pc += 2; console.log(`LDAmm after = ${cpu.registers.a}`);cpu.registers.m = 4;},

        // Loads 16-bit nn into BC, DE, HL or SP
        LDBCnn: function() {cpu.registers.c = MMU.readByte(cpu.registers.pc); cpu.registers.b = MMU.readByte(cpu.registers.pc+1); cpu.registers.pc+=2; cpu.registers.m=3;},
        LDDEnn: function() {cpu.registers.e = MMU.readByte(cpu.registers.pc); cpu.registers.d = MMU.readByte(cpu.registers.pc+1); cpu.registers.pc+=2; cpu.registers.m=3;},
        LDHLnn: function() {cpu.registers.l = MMU.readByte(cpu.registers.pc); cpu.registers.h = MMU.readByte(cpu.registers.pc+1); cpu.registers.pc+=2; cpu.registers.m=3;},
        LDSPnn: function() {console.log(`LDSPNN before = ${cpu.registers.sp}`); cpu.registers.sp= MMU.readWord(cpu.registers.pc); cpu.registers.pc+=2; console.log(`LDSPNN after = ${cpu.registers.sp}`);cpu.registers.m=3;},

        // contents of mm loaded into HL
        LDHLmm: function() {var mm = MMU.readWord(cpu.registers.pc); cpu.registers.pc+=2; cpu.registers.l=MMU.readByte(mm); cpu.registers.h=MMU.readByte(mm+1); cpu.registers.m=5;},

        // contents of SP loaded into mm
        LDmmSP: function() {var mm = MMU.readWord(cpu.registers.pc); cpu.registers.pc+=2; MMU.writeWord(mm, cpu.registers.sp); cpu.registers.m=5;},

        // Set A to HL and sets L and H
        LDHLIA: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, cpu.registers.a); cpu.registers.l=(cpu.registers.l+1)&255; 
                            if(!cpu.registers.l) cpu.registers.h=(cpu.registers.h+1)&255; cpu.registers.m=2;},
        LDAHLI: function() {cpu.registers.a=MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.l=(cpu.registers.l+1)&255; 
                            if(!cpu.registers.l) cpu.registers.h=(cpu.registers.h+1)&255; cpu.registers.m=2; },

        // Set HL to A and sets L and H
        LDHLDA: function() {MMU.writeByte((cpu.registers.h<<8)+cpu.registers.l, cpu.registers.a); cpu.registers.l=(cpu.registers.l-1)&255; 
                            if(cpu.registers.l==255) cpu.registers.h=(cpu.registers.h-1)&255; cpu.registers.m=2;},
        LDAHLD: function() {cpu.registers.a=MMU.readByte((cpu.registers.h<<8)+cpu.registers.l); cpu.registers.l=(cpu.registers.l-1)&255; 
                            if(cpu.registers.l==255) cpu.registers.h=(cpu.registers.h-1)&255; cpu.registers.m=2;},

        // Get value from mem address in PC appended to 0xFF00.
        LDAIOn: function() {console.log(`LDAIOn before a = ${cpu.registers.a}`); cpu.registers.a=MMU.readByte(0xFF00+MMU.readByte(cpu.registers.pc)); console.log(`LDAIOn after a = ${cpu.registers.a}`); cpu.registers.pc++; cpu.registers.m=3;},

        // Add A to right half(lower 8 bits) of value in mem address pc.
        LDIOnA: function() {MMU.writeByte(0xFF00+MMU.readByte(cpu.registers.pc),cpu.registers.a); cpu.registers.pc++; cpu.registers.m=3;},

        // set A to reg C added to 0xFF00
        LDAIOC: function() {cpu.registers.a=MMU.readByte(0xFF00+cpu.registers.c); cpu.registers.m=2;},

        // set mem address of reg c added to 0xFF00 to A
        LDIOCA: function() {MMU.writeByte(0xFF00+cpu.registers.c,cpu.registers.a); cpu.registers.m=2;},

        // load hl into stack pointer. 
        LDSPHL: function() {console.log("LDSPHL"); cpu.registers.sp = (cpu.registers.h<<8)+cpu.registers.l; cpu.registers.m=2;},
        
        // Put SP + signed n effective address into HL
        LDHLSPn: function() {var i=MMU.readByte(cpu.registers.pc); if(i>127) i=-((~i+1)&255); cpu.registers.pc++; i+=cpu.registers.sp; 
                            cpu.registers.h=(i>>8)&255; cpu.registers.l=i&255; cpu.registers.m=3;},

        // Swaps halfs of 8-bit regs and set reg to it 
        SWAPr_b: function() {var originalB=cpu.registers.b; cpu.registers.b=((originalB&0xF)<<4)|((originalB&0xF0)>>4); 
                            (cpu.registers.b)?utils.setZ(0):utils.setZ(1); utils.setN(0); utils.setH(0); utils.setC(0); cpu.registers.m=1;},
        SWAPr_c: function() {var originalC=cpu.registers.c; cpu.registers.c=((originalC&0xF)<<4)|((originalC&0xF0)>>4); 
                            (cpu.registers.c)?utils.setZ(0):utils.setZ(1); utils.setN(0); utils.setH(0); utils.setC(0); cpu.registers.m=1;},
        SWAPr_d: function() {var originalD=cpu.registers.d; cpu.registers.d=((originalD&0xF)<<4)|((originalD&0xF0)>>4); 
                            (cpu.registers.d)?utils.setZ(0):utils.setZ(1); utils.setN(0); utils.setH(0); utils.setC(0); cpu.registers.m=1;},
        SWAPr_e: function() {var originalE=cpu.registers.e; cpu.registers.e=((originalE&0xF)<<4)|((originalE&0xF0)>>4); 
                            (cpu.registers.e)?utils.setZ(0):utils.setZ(1); utils.setN(0); utils.setH(0); utils.setC(0); cpu.registers.m=1;},
        SWAPr_h: function() {var originalH=cpu.registers.h; cpu.registers.h=((originalH&0xF)<<4)|((originalH&0xF0)>>4); 
                            (cpu.registers.h)?utils.setZ(0):utils.setZ(1); utils.setN(0); utils.setH(0); utils.setC(0); cpu.registers.m=1;},
        SWAPr_l: function() {var originalL=cpu.registers.l; cpu.registers.l=((originalL&0xF)<<4)|((originalL&0xF0)>>4); 
                            (cpu.registers.l)?utils.setZ(0):utils.setZ(1); utils.setN(0); utils.setH(0); utils.setC(0); cpu.registers.m=1;},
        SWAPr_a: function() {var originalA=cpu.registers.a; cpu.registers.a=((originalA&0xF)<<4)|((originalA&0xF0)>>4); 
                            (cpu.registers.a)?utils.setZ(0):utils.setZ(1); utils.setN(0); utils.setH(0); utils.setC(0); cpu.registers.m=1;},

        
        // Other functions -----------------------------------------------------------------------------------------------------------
        // No function exists for opcode
        noSuchOpCode: function() {
            var code=cpu.registers.pc-1; 
            console.log(`No function for opcode, ${code.toString(16)}`)
            cpu.stop=1;
        },

        // call function in CB map
        MAPcb: function() {
            var pcAdd = MMU.readByte(cpu.registers.pc)
            cpu.registers.pc++
            cpu.registers.pc &= 65535
            console.log(`MAPcb m start = ${cpu.registers.m}, ${pcAdd} `)
            
            if (cpu.cbMap[pcAdd]) {
                cpu.cbMap[pcAdd]()
            } else {
                console.log(pcAdd)
            }
            console.log(`MAPcb m end = ${cpu.registers.m}`)
        },
    },

}

cpu.map = {
    0x00: cpu?.operations?.NOP,
    0x01: cpu?.operations?.LDBCnn,
    0x02: cpu?.operations?.LDBCmA,
    0x03: cpu?.operations?.INCBC,
    0x04: cpu?.operations?.INCb,
    0x05: cpu?.operations?.DECb,
    0x06: cpu?.operations?.LDrn_b,
    0x07: cpu?.operations?.RLCA,
    0x08: cpu?.operations?.LDmmSP,
    0x09: cpu?.operations?.AddHLBC,
    0x0a: cpu?.operations?.LDABCm,
    0x0b: cpu?.operations?.DECBC,
    0x0c: cpu?.operations?.INCc,
    0x0d: cpu?.operations?.DECc,
    0x0e: cpu?.operations?.LDrn_c,
    0x0f: cpu?.operations?.RRCA,
    0x10: cpu?.operations?.DJNZn,
    0x11: cpu?.operations?.LDDEnn,
    0x12: cpu?.operations?.LDDEmA,
    0x13: cpu?.operations?.INCDE,
    0x14: cpu?.operations?.INCd,
    0x15: cpu?.operations?.DECd,
    0x16: cpu?.operations?.LDrn_d,
    0x17: cpu?.operations?.RLA,
    0x18: cpu?.operations?.JRpc,
    0x19: cpu?.operations?.AddHLDE,
    0x1a: cpu?.operations?.LDADEm,
    0x1b: cpu?.operations?.DECDE,
    0x1c: cpu?.operations?.INCe,
    0x1d: cpu?.operations?.DECe,
    0x1e: cpu?.operations?.LDrn_e,
    0x1f: cpu?.operations?.RRA,
    0x20: cpu?.operations?.JRNZpc,
    0x21: cpu?.operations?.LDHLnn,
    0x22: cpu?.operations?.LDHLIA,
    0x23: cpu?.operations?.INCHL,
    0x24: cpu?.operations?.INCh,
    0x25: cpu?.operations?.DECh,
    0x26: cpu?.operations?.LDrn_h,
    0x27: cpu?.operations?.DAA,
    0x28: cpu?.operations?.JRZpc,
    0x29: cpu?.operations?.AddHLHL,
    0x2a: cpu?.operations?.LDAHLI,
    0x2b: cpu?.operations?.DECHL,
    0x2c: cpu?.operations?.INCl,
    0x2d: cpu?.operations?.DECl,
    0x2e: cpu?.operations?.LDrn_l,
    0x2f: cpu?.operations?.CPL,
    0x30: cpu?.operations?.JRNCpc,
    0x31: cpu?.operations?.LDSPnn,
    0x32: cpu?.operations?.LDHLDA,
    0x33: cpu?.operations?.INCSP,
    0x34: cpu?.operations?.INCHLm,
    0x35: cpu?.operations?.DECHLm,
    0x36: cpu?.operations?.LDHLmn,
    0x37: cpu?.operations?.SCF,
    0x38: cpu?.operations?.JRCpc,
    0x39: cpu?.operations?.AddHLSP,
    0x3a: cpu?.operations?.LDAHLD,
    0x3b: cpu?.operations?.DECSP,
    0x3c: cpu?.operations?.INCa,
    0x3d: cpu?.operations?.DECa,
    0x3e: cpu?.operations?.LDrn_a,
    0x3f: cpu?.operations?.CCF,
    0x40: cpu?.operations?.LDrrBB,
    0x41: cpu?.operations?.LDrrBC,
    0x42: cpu?.operations?.LDrrBD,
    0x43: cpu?.operations?.LDrrBE,
    0x44: cpu?.operations?.LDrrBH,
    0x45: cpu?.operations?.LDrrBL,
    0x46: cpu?.operations?.LDrHLm_b,
    0x47: cpu?.operations?.LDrrBA,
    0x48: cpu?.operations?.LDrrCB,
    0x49: cpu?.operations?.LDrrCC,
    0x4a: cpu?.operations?.LDrrCD,
    0x4b: cpu?.operations?.LDrrCE,
    0x4c: cpu?.operations?.LDrrCH,
    0x4d: cpu?.operations?.LDrrCL,
    0x4e: cpu?.operations?.LDrHLm_c,
    0x4f: cpu?.operations?.LDrrCA,
    0x50: cpu?.operations?.LDrrDB,
    0x51: cpu?.operations?.LDrrDC,
    0x52: cpu?.operations?.LDrrDD,
    0x53: cpu?.operations?.LDrrDE,
    0x54: cpu?.operations?.LDrrDH,
    0x55: cpu?.operations?.LDrrDL,
    0x56: cpu?.operations?.LDrHLm_d,
    0x57: cpu?.operations?.LDrrDA,
    0x58: cpu?.operations?.LDrrEB,
    0x59: cpu?.operations?.LDrrEC,
    0x5a: cpu?.operations?.LDrrED,
    0x5b: cpu?.operations?.LDrrEE,
    0x5c: cpu?.operations?.LDrrEH,
    0x5d: cpu?.operations?.LDrrEL,
    0x5e: cpu?.operations?.LDrHLm_e,
    0x5f: cpu?.operations?.LDrrEA,
    0x60: cpu?.operations?.LDrrHB,
    0x61: cpu?.operations?.LDrrHC,
    0x62: cpu?.operations?.LDrrHD,
    0x63: cpu?.operations?.LDrrHE,
    0x64: cpu?.operations?.LDrrHH,
    0x65: cpu?.operations?.LDrrHL,
    0x66: cpu?.operations?.LDrHLm_h,
    0x67: cpu?.operations?.LDrrHA,
    0x68: cpu?.operations?.LDrrLB,
    0x69: cpu?.operations?.LDrrLC,
    0x6a: cpu?.operations?.LDrrLD,
    0x6b: cpu?.operations?.LDrrLE,
    0x6c: cpu?.operations?.LDrrLH,
    0x6d: cpu?.operations?.LDrrLL,
    0x6e: cpu?.operations?.LDrHLm_l,
    0x6f: cpu?.operations?.LDrrLA,
    0x70: cpu?.operations?.LDHLmr_b,
    0x71: cpu?.operations?.LDHLmr_c,
    0x72: cpu?.operations?.LDHLmr_d,
    0x73: cpu?.operations?.LDHLmr_e,
    0x74: cpu?.operations?.LDHLmr_h,
    0x75: cpu?.operations?.LDHLmr_l,
    0x76: cpu?.operations?.HALT, 
    0x77: cpu?.operations?.LDHLmr_a,
    0x78: cpu?.operations?.LDrrAB,
    0x79: cpu?.operations?.LDrrAC,
    0x7a: cpu?.operations?.LDrrAD,
    0x7b: cpu?.operations?.LDrrAE,
    0x7c: cpu?.operations?.LDrrAH,
    0x7d: cpu?.operations?.LDrrAL,
    0x7e: cpu?.operations?.LDrHLm_a,
    0x7f: cpu?.operations?.LDrrAA,
    0x80: cpu?.operations?.AddAB,
    0x81: cpu?.operations?.AddAC,
    0x82: cpu?.operations?.AddAD,
    0x83: cpu?.operations?.AddAE,
    0x84: cpu?.operations?.AddAH,
    0x85: cpu?.operations?.AddAL,
    0x86: cpu?.operations?.AddHL,
    0x87: cpu?.operations?.AddAA,
    0x88: cpu?.operations?.ADCr_b,
    0x89: cpu?.operations?.ADCr_c,
    0x8a: cpu?.operations?.ADCr_d,
    0x8b: cpu?.operations?.ADCr_e,
    0x8c: cpu?.operations?.ADCr_h,
    0x8d: cpu?.operations?.ADCr_l,
    0x8e: cpu?.operations?.ADCHL,
    0x8f: cpu?.operations?.ADCr_a,
    0x90: cpu?.operations?.SUBr_b,
    0x91: cpu?.operations?.SUBr_c,
    0x92: cpu?.operations?.SUBr_d,
    0x93: cpu?.operations?.SUBr_e,
    0x94: cpu?.operations?.SUBr_h,
    0x95: cpu?.operations?.SUBr_l,
    0x96: cpu?.operations?.SUBHL,
    0x97: cpu?.operations?.SUBr_a,
    0x98: cpu?.operations?.SBCr_b,
    0x99: cpu?.operations?.SBCr_c,
    0x9a: cpu?.operations?.SBCr_d,
    0x9b: cpu?.operations?.SBCr_e,
    0x9c: cpu?.operations?.SBCr_h,
    0x9d: cpu?.operations?.SBCr_l,
    0x9e: cpu?.operations?.SBCHL,
    0x9f: cpu?.operations?.SBCr_a,
    0xa0: cpu?.operations?.ANDr_b,
    0xa1: cpu?.operations?.ANDr_c,
    0xa2: cpu?.operations?.ANDr_d,
    0xa3: cpu?.operations?.ANDr_e,
    0xa4: cpu?.operations?.ANDr_h,
    0xa5: cpu?.operations?.ANDr_l,
    0xa6: cpu?.operations?.ANDHL,
    0xa7: cpu?.operations?.ANDr_a,
    0xa8: cpu?.operations?.XORr_b,
    0xa9: cpu?.operations?.XORr_c,
    0xaa: cpu?.operations?.XORr_d,
    0xab: cpu?.operations?.XORr_e,
    0xac: cpu?.operations?.XORr_h,
    0xad: cpu?.operations?.XORr_l,
    0xae: cpu?.operations?.XORHL,
    0xaf: cpu?.operations?.XORr_a,
    0xb0: cpu?.operations?.ORr_b,
    0xb1: cpu?.operations?.ORr_c,
    0xb2: cpu?.operations?.ORr_d,
    0xb3: cpu?.operations?.ORr_e,
    0xb4: cpu?.operations?.ORr_h,
    0xb5: cpu?.operations?.ORr_l,
    0xb6: cpu?.operations?.ORHL,
    0xb7: cpu?.operations?.ORr_a,
    0xb8: cpu?.operations?.CPab,
    0xb9: cpu?.operations?.CPac,
    0xba: cpu?.operations?.CPad,
    0xbb: cpu?.operations?.CPae,
    0xbc: cpu?.operations?.CPah,
    0xbd: cpu?.operations?.CPal,
    0xbe: cpu?.operations?.CPHL,
    0xbf: cpu?.operations?.CPaa,
    0xc0: cpu?.operations?.RETNotZ,
    0xc1: cpu?.operations?.POPBC,
    0xc2: cpu?.operations?.JPNZnn,
    0xc3: cpu?.operations?.JPpc,
    0xc4: cpu?.operations?.CALLNotZnn,
    0xc5: cpu?.operations?.PUSHBC,
    0xc6: cpu?.operations?.Addn,
    0xc7: cpu?.operations?.RST00,
    0xc8: cpu?.operations?.RETZ,
    0xc9: cpu?.operations?.RET,
    0xca: cpu?.operations?.JPZnn,
    0xcb: cpu?.operations?.MAPcb,
    0xcc: cpu?.operations?.CALLZnn,
    0xcd: cpu?.operations?.CALLnn,
    0xce: cpu?.operations?.ADCn,
    0xcf: cpu?.operations?.RST08,
    0xd0: cpu?.operations?.RETNotC,
    0xd1: cpu?.operations?.POPDE,
    0xd2: cpu?.operations?.JPNCnn,
    0xd3: cpu?.operations?.noSuchOpCode,
    0xd4: cpu?.operations?.CALLNotCnn,
    0xd5: cpu?.operations?.PUSHDE,
    0xd6: cpu?.operations?.SUBn,
    0xd7: cpu?.operations?.RST10,
    0xd8: cpu?.operations?.RETC,
    0xd9: cpu?.operations?.RETI,
    0xda: cpu?.operations?.JPCnn,
    0xdb: cpu?.operations?.noSuchOpCode,
    0xdc: cpu?.operations?.CALLCnn,
    0xdd: cpu?.operations?.noSuchOpCode,
    0xde: cpu?.operations?.SBCn,
    0xdf: cpu?.operations?.RST18,
    0xe0: cpu?.operations?.LDIOnA,
    0xe1: cpu?.operations?.POPHL,
    0xe2: cpu?.operations?.LDIOCA,
    0xe3: cpu?.operations?.noSuchOpCode,
    0xe4: cpu?.operations?.noSuchOpCode,
    0xe5: cpu?.operations?.PUSHHL,
    0xe6: cpu?.operations?.ANDn,
    0xe7: cpu?.operations?.RST20,
    0xe8: cpu?.operations?.ADDSPn,
    0xe9: cpu?.operations?.JPHL,
    0xea: cpu?.operations?.LDmmA,
    0xeb: cpu?.operations?.noSuchOpCode,
    0xec: cpu?.operations?.noSuchOpCode,
    0xed: cpu?.operations?.noSuchOpCode,
    0xee: cpu?.operations?.XORn,
    0xef: cpu?.operations?.RST28,
    0xf0: cpu?.operations?.LDAIOn,
    0xf1: cpu?.operations?.POPAF,
    0xf2: cpu?.operations?.LDAIOC,
    0xf3: cpu?.operations?.DI,
    0xf4: cpu?.operations?.noSuchOpCode,
    0xf5: cpu?.operations?.PUSHAF,
    0xf6: cpu?.operations?.ORn,
    0xf7: cpu?.operations?.RST30,
    0xf8: cpu?.operations?.LDHLSPn,
    0xf9: cpu?.operations?.noSuchOpCode,
    0xfa: cpu?.operations?.LDAmm,
    0xfb: cpu?.operations?.EI,
    0xfc: cpu?.operations?.noSuchOpCode,
    0xfd: cpu?.operations?.noSuchOpCode,
    0xfe: cpu?.operations?.CPn,
    0xff: cpu?.operations?.RST38
}

cpu.cbMap = {
    0x00: cpu?.operations?.RLCr_b,
    0x01: cpu?.operations?.RLCr_c,
    0x02: cpu?.operations?.RLCr_d,
    0x03: cpu?.operations?.RLCr_e,
    0x04: cpu?.operations?.RLCr_h,
    0x05: cpu?.operations?.RLCr_l,
    0x06: cpu?.operations?.RLCHL,
    0x07: cpu?.operations?.RLCr_a,
    0x08: cpu?.operations?.RRCr_b,
    0x09: cpu?.operations?.RRCr_c,
    0x0a: cpu?.operations?.RRCr_d,
    0x0b: cpu?.operations?.RRCr_e,
    0x0c: cpu?.operations?.RRCr_h,
    0x0d: cpu?.operations?.RRCr_l,
    0x0e: cpu?.operations?.RRCHL,
    0x0f: cpu?.operations?.RRCr_a,
    0x10: cpu?.operations?.RLr_b,
    0x11: cpu?.operations?.RLr_c,
    0x12: cpu?.operations?.RLr_d,
    0x13: cpu?.operations?.RLr_e,
    0x14: cpu?.operations?.RLr_h,
    0x15: cpu?.operations?.RLr_l,
    0x16: cpu?.operations?.RLHL,
    0x17: cpu?.operations?.RLr_a,
    0x18: cpu?.operations?.RRr_b,
    0x19: cpu?.operations?.RRr_c,
    0x1a: cpu?.operations?.RRr_d,
    0x1b: cpu?.operations?.RRr_e,
    0x1c: cpu?.operations?.RRr_h,
    0x1d: cpu?.operations?.RRr_l,
    0x1e: cpu?.operations?.RRHL,
    0x1f: cpu?.operations?.RRr_a,
    0x20: cpu?.operations?.SLAr_b,
    0x21: cpu?.operations?.SLAr_c,
    0x22: cpu?.operations?.SLAr_d,
    0x23: cpu?.operations?.SLAr_e,
    0x24: cpu?.operations?.SLAr_h,
    0x25: cpu?.operations?.SLAr_l,
    0x26: cpu?.operations?.noSuchOpCode,
    0x27: cpu?.operations?.SLAr_a,
    0x28: cpu?.operations?.SRAr_b,
    0x29: cpu?.operations?.SRAr_c,
    0x2a: cpu?.operations?.SRAr_d,
    0x2b: cpu?.operations?.SRAr_e,
    0x2c: cpu?.operations?.SRAr_h,
    0x2d: cpu?.operations?.SRAr_l,
    0x2e: cpu?.operations?.noSuchOpCode,
    0x2f: cpu?.operations?.SRAr_a,
    0x30: cpu?.operations?.SWAPr_b,
    0x31: cpu?.operations?.SWAPr_c,
    0x32: cpu?.operations?.SWAPr_d,
    0x33: cpu?.operations?.SWAPr_e,
    0x34: cpu?.operations?.SWAPr_h,
    0x35: cpu?.operations?.SWAPr_l,
    0x36: cpu?.operations?.noSuchOpCode,
    0x37: cpu?.operations?.SWAPr_a,
    0x38: cpu?.operations?.SRLr_b,
    0x39: cpu?.operations?.SRLr_c,
    0x3a: cpu?.operations?.SRLr_d,
    0x3b: cpu?.operations?.SRLr_e,
    0x3c: cpu?.operations?.SRLr_h,
    0x3d: cpu?.operations?.SRLr_l,
    0x3e: cpu?.operations?.noSuchOpCode,
    0x3f: cpu?.operations?.SRLr_a,
    0x40: cpu?.operations?.BIT0b,
    0x41: cpu?.operations?.BIT0c,
    0x42: cpu?.operations?.BIT0d,
    0x43: cpu?.operations?.BIT0e,
    0x44: cpu?.operations?.BIT0h,
    0x45: cpu?.operations?.BIT0l,
    0x46: cpu?.operations?.BIT0m,
    0x47: cpu?.operations?.BIT0a,
    0x48: cpu?.operations?.BIT1b,
    0x49: cpu?.operations?.BIT1c,
    0x4a: cpu?.operations?.BIT1d,
    0x4b: cpu?.operations?.BIT1e,
    0x4c: cpu?.operations?.BIT1h,
    0x4d: cpu?.operations?.BIT1l,
    0x4e: cpu?.operations?.BIT1m,
    0x4f: cpu?.operations?.BIT1a,
    0x50: cpu?.operations?.BIT2b,
    0x51: cpu?.operations?.BIT2c,
    0x52: cpu?.operations?.BIT2d,
    0x53: cpu?.operations?.BIT2e,
    0x54: cpu?.operations?.BIT2h,
    0x55: cpu?.operations?.BIT2l,
    0x56: cpu?.operations?.BIT2m,
    0x57: cpu?.operations?.BIT2a,
    0x58: cpu?.operations?.BIT3b,
    0x59: cpu?.operations?.BIT3c,
    0x5a: cpu?.operations?.BIT3d,
    0x5b: cpu?.operations?.BIT3e,
    0x5c: cpu?.operations?.BIT3h,
    0x5d: cpu?.operations?.BIT3l,
    0x5e: cpu?.operations?.BIT3m,
    0x5f: cpu?.operations?.BIT3a,
    0x60: cpu?.operations?.BIT4b,
    0x61: cpu?.operations?.BIT4c,
    0x62: cpu?.operations?.BIT4d,
    0x63: cpu?.operations?.BIT4e,
    0x64: cpu?.operations?.BIT4h,
    0x65: cpu?.operations?.BIT4l,
    0x66: cpu?.operations?.BIT4m,
    0x67: cpu?.operations?.BIT4a,
    0x68: cpu?.operations?.BIT5b,
    0x69: cpu?.operations?.BIT5c,
    0x6a: cpu?.operations?.BIT5d,
    0x6b: cpu?.operations?.BIT5e,
    0x6c: cpu?.operations?.BIT5h,
    0x6d: cpu?.operations?.BIT5l,
    0x6e: cpu?.operations?.BIT5m,
    0x6f: cpu?.operations?.BIT5a,
    0x70: cpu?.operations?.BIT6b,
    0x71: cpu?.operations?.BIT6c,
    0x72: cpu?.operations?.BIT6d,
    0x73: cpu?.operations?.BIT6e,
    0x74: cpu?.operations?.BIT6h,
    0x75: cpu?.operations?.BIT6l,
    0x76: cpu?.operations?.BIT6m,
    0x77: cpu?.operations?.BIT6a,
    0x78: cpu?.operations?.BIT7b,
    0x79: cpu?.operations?.BIT7c,
    0x7a: cpu?.operations?.BIT7d,
    0x7b: cpu?.operations?.BIT7e,
    0x7c: cpu?.operations?.BIT7h,
    0x7d: cpu?.operations?.BIT7l,
    0x7e: cpu?.operations?.BIT7m,
    0x7f: cpu?.operations?.BIT7a,
    0x80: cpu?.operations?.RES0b,
    0x81: cpu?.operations?.RES0c,
    0x82: cpu?.operations?.RES0d,
    0x83: cpu?.operations?.RES0e,
    0x84: cpu?.operations?.RES0h,
    0x85: cpu?.operations?.RES0l,
    0x86: cpu?.operations?.RES0m,
    0x87: cpu?.operations?.RES0a,
    0x88: cpu?.operations?.RES1b,
    0x89: cpu?.operations?.RES1c,
    0x8a: cpu?.operations?.RES1d,
    0x8b: cpu?.operations?.RES1e,
    0x8c: cpu?.operations?.RES1h,
    0x8d: cpu?.operations?.RES1l,
    0x8e: cpu?.operations?.RES1m,
    0x8f: cpu?.operations?.RES1a,
    0x90: cpu?.operations?.RES2b,
    0x91: cpu?.operations?.RES2c,
    0x92: cpu?.operations?.RES2d,
    0x93: cpu?.operations?.RES2e,
    0x94: cpu?.operations?.RES2h,
    0x95: cpu?.operations?.RES2l,
    0x96: cpu?.operations?.RES2m,
    0x97: cpu?.operations?.RES2a,
    0x98: cpu?.operations?.RES3b,
    0x99: cpu?.operations?.RES3c,
    0x9a: cpu?.operations?.RES3d,
    0x9b: cpu?.operations?.RES3e,
    0x9c: cpu?.operations?.RES3h,
    0x9d: cpu?.operations?.RES3l,
    0x9e: cpu?.operations?.RES3m,
    0x9f: cpu?.operations?.RES3a,
    0xa0: cpu?.operations?.RES4b,
    0xa1: cpu?.operations?.RES4c,
    0xa2: cpu?.operations?.RES4d,
    0xa3: cpu?.operations?.RES4e,
    0xa4: cpu?.operations?.RES4h,
    0xa5: cpu?.operations?.RES4l,
    0xa6: cpu?.operations?.RES4m,
    0xa7: cpu?.operations?.RES4a,
    0xa8: cpu?.operations?.RES5b,
    0xa9: cpu?.operations?.RES5c,
    0xaa: cpu?.operations?.RES5d,
    0xab: cpu?.operations?.RES5e,
    0xac: cpu?.operations?.RES5h,
    0xad: cpu?.operations?.RES5l,
    0xae: cpu?.operations?.RES5m,
    0xaf: cpu?.operations?.RES5a,
    0xb0: cpu?.operations?.RES6b,
    0xb1: cpu?.operations?.RES6c,
    0xb2: cpu?.operations?.RES6d,
    0xb3: cpu?.operations?.RES6e,
    0xb4: cpu?.operations?.RES6h,
    0xb5: cpu?.operations?.RES6l,
    0xb6: cpu?.operations?.RES6m,
    0xb7: cpu?.operations?.RES6a,
    0xb8: cpu?.operations?.RES7b,
    0xb9: cpu?.operations?.RES7c,
    0xba: cpu?.operations?.RES7d,
    0xbb: cpu?.operations?.RES7e,
    0xbc: cpu?.operations?.RES7h,
    0xbd: cpu?.operations?.RES7l,
    0xbe: cpu?.operations?.RES7m,
    0xbf: cpu?.operations?.RES7a,
    0xc0: cpu?.operations?.SET0b,
    0xc1: cpu?.operations?.SET0c,
    0xc2: cpu?.operations?.SET0d,
    0xc3: cpu?.operations?.SET0e,
    0xc4: cpu?.operations?.SET0h,
    0xc5: cpu?.operations?.SET0l,
    0xc6: cpu?.operations?.SET0m,
    0xc7: cpu?.operations?.SET0a,
    0xc8: cpu?.operations?.SET1b,
    0xc9: cpu?.operations?.SET1c,
    0xca: cpu?.operations?.SET1d,
    0xcb: cpu?.operations?.SET1e,
    0xcc: cpu?.operations?.SET1h,
    0xcd: cpu?.operations?.SET1l,
    0xce: cpu?.operations?.SET1m,
    0xcf: cpu?.operations?.SET1a,
    0xd0: cpu?.operations?.SET2b,
    0xd1: cpu?.operations?.SET2c,
    0xd2: cpu?.operations?.SET2d,
    0xd3: cpu?.operations?.SET2e,
    0xd4: cpu?.operations?.SET2h,
    0xd5: cpu?.operations?.SET2l,
    0xd6: cpu?.operations?.SET2m,
    0xd7: cpu?.operations?.SET2a,
    0xd8: cpu?.operations?.SET3b,
    0xd9: cpu?.operations?.SET3c,
    0xda: cpu?.operations?.SET3d,
    0xdb: cpu?.operations?.SET3e,
    0xdc: cpu?.operations?.SET3h,
    0xdd: cpu?.operations?.SET3l,
    0xde: cpu?.operations?.SET3m,
    0xdf: cpu?.operations?.SET3a,
    0xe0: cpu?.operations?.SET4b,
    0xe1: cpu?.operations?.SET4c,
    0xe2: cpu?.operations?.SET4d,
    0xe3: cpu?.operations?.SET4e,
    0xe4: cpu?.operations?.SET4h,
    0xe5: cpu?.operations?.SET4l,
    0xe6: cpu?.operations?.SET4m,
    0xe7: cpu?.operations?.SET4a,
    0xe8: cpu?.operations?.SET5b,
    0xe9: cpu?.operations?.SET5c,
    0xea: cpu?.operations?.SET5d,
    0xeb: cpu?.operations?.SET5e,
    0xec: cpu?.operations?.SET5h,
    0xed: cpu?.operations?.SET5l,
    0xee: cpu?.operations?.SET5m,
    0xef: cpu?.operations?.SET5a,
    0xf0: cpu?.operations?.SET6b,
    0xf1: cpu?.operations?.SET6c,
    0xf2: cpu?.operations?.SET6d,
    0xf3: cpu?.operations?.SET6e,
    0xf4: cpu?.operations?.SET6h,
    0xf5: cpu?.operations?.SET6l,
    0xf6: cpu?.operations?.SET6m,
    0xf7: cpu?.operations?.SET6a,
    0xf8: cpu?.operations?.SET7b,
    0xf9: cpu?.operations?.SET7c,
    0xfa: cpu?.operations?.SET7d,
    0xfb: cpu?.operations?.SET7e,
    0xfc: cpu?.operations?.SET7h,
    0xfd: cpu?.operations?.SET7l,
    0xfe: cpu?.operations?.SET7m,
    0xff: cpu?.operations?.SET7a,
}

//export default cpu