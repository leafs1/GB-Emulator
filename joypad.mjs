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
    }
}

export default JOYPAD