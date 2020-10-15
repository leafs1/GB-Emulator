//import cpu from './cpu.mjs'
//import MMU from './mmu.mjs'

var TIMER = {

    clock: {
        main: 0,
        sub: 0,
        div: 0
    },

    div: 0,
    tma: 0,
    tima: 0,
    tac: 0,

    // read byte
    rb: function(addr) {
        if (addr == 0xff04) {
            return TIMER.div
        } else if (addr == 0xff05) {
            return TIMER.tima
        } else if (addr == 0xff06) {
            return TIMER.tma
        } else if (addr == 0xff07) {
            return TIMER.tac
        }
    },

    // write byte
    wb: function(addr, val) {
        if (addr == 0xff04) {
            TIMER.div = 0
        } else if (addr == 0xff05) {
            TIMER.tima = val
        } else if (addr == 0xff06) {
            TIMER.tma = val
        } else if (addr == 0xff07) {
            TIMER.tac = val & 7
        }
    },

    reset: function() {
        TIMER.div = 0
        TIMER.sdiv = 0
        TIMER.tma = 0
        TIMER.tima = 0
        TIMER.tac = 0
        TIMER.clock.main = 0
        TIMER.clock.sub = 0
        TIMER.clock.div = 0
        console.log("Timer Reset")
    },

    step: function() {
        TIMER.tima ++
        TIMER.clock.main = 0
        if (TIMER.tima > 255) {
            TIMER.tima = TIMER.tma
            MMU.if |= 4
        }
    },

    // Increment the timer
    inc: function() {
        var oldClock = TIMER.clock.main

        TIMER.clock.sub += cpu.registers.m

        if (TIMER.clock.sub > 3) {
            TIMER.clock.main ++
            TIMER.clock.sub -= 4
            TIEMR.clock.div ++

            if (TIMER.clock.div == 16) {
                TIMER.clock.div = 0
                TIMER.div ++
                TIMER.div &= 255
            }
        }

        if (TIMER.tac & 3) {
            switch(TIMER.tac & 3) {
                case 0:
                    if (TIMER.clock.main >= 64) {
                        TIMER.step()
                    }
                    break;
                case 1:
                    if (TIMER.clock.main >= 1) {
                        TIMER.step()
                    }
                    break;
                case 2:
                    if (TIMER.clock.main >= 4) {
                        TIMER.step()
                    }
                    break;
                case 3:
                    if (TIMER.clock.main >=16) {
                        TIMER.step
                    }
                    break;
            }
        }
    }
}

//export default TIMER