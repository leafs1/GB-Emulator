TIMER = {

    div: 0,
    tma: 0,
    tima: 0,
    tac: 0,

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
}

export default TIMER