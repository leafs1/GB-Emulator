JOYPAD = {
    keys: [0x0f, 0x0f],
    typeKey: 0,

    // Return the key that is currently being pressed
    rb: function() {
        if (typeKey == 0x00) {
            return 0x00
        } else if (typeKey == 0x10) {
            return keys[0]
        } else if (typeKey == 0x20) {
            return keys[1]
        }
    },

    wb: function(val) {
        JOYPAD.typeKey = v & 0x30
    },

    reset: function() {
        JOYPAD.keys = [0x0f, 0x0f]
        JOYPAD.typeKey = 0
        console.log("Reset keys")
    },

    keydown: function(e) {
        switch(e.keyCode) {
            case 39:
                JOYPAD.keys[1] &= 0xe
                break;
            case 37:
                JOYPAD.keys[1] &= 0xd
                break;
            case 38:
                JOYPAD.keys[1] &= 0xb
                break;
            case 40:
                JOYPAD.keys[1] &= 0x7
                break;
            case 90:
                JOYPAD.keys[0] &= 0xe
                break;
            case 88:
                JOYPAD.keys[0] &= 0xd
                break;
            case 32:
                JOYPAD.keys[0] &= 0xb
                break;
            case 13:
                JOYPAD.keys[0] &= 0x7
                break;
        }
    },

    keyup: function(e) {
        switch(e.keyCode) {
            case 39:
                JOYPAD.keys[1] |= 0x1
                break;
            case 37:
                JOYPAD.keys[1] |= 0x2
                break;
            case 38:
                JOYPAD.keys[1] |= 0x4
                break;
            case 40:
                JOYPAD.keys[1] |= 0x8
                break;
            case 90:
                JOYPAD.keys[0] |= 0x1
                break;
            case 88:
                JOYPAD.keys[0] |= 0x2
                break;
            case 32:
                JOYPAD.keys[0] |= 0x4
                break;
            case 13:
                JOYPAD.keys[0] |= 0x8
                break;
        }
    }
}

export default JOYPAD