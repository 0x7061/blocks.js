/*
 * Copyright (c) 2012 by Aleksandar Palic, Blog http://skripted.ruhoh.com
 * Released under MIT license
 */

var config = {
    
    viewport: {
        // defined in px
        x: 480,
        y: 480,
        border: 10,
        // defined as quantity
        backgrounds: 2,
        // defined as class
        bgClassName: 'bg_type'
    },
    
    block: {
        // defined in px
        size: 20,
        paddingX: 20,
        paddingY: 100,
        // defined as quantity
        minGroup: 6,
        maxGroup: 10,
        colors: 3,
        // defined as class
        colorsClassName: 'type'
    },
    
    player: {
        // defined in px
        x: 32,
        y: 32,
        // defined as value
        speed: 5,
        jumpPower: 4
    },
    
    physics: {
        // defined as value
        gravity: 5
    },
    
    elevator: {
        // defined as value
        speed: 1,
        brake: 1
    },
    
    animation: {
        // defined as value
        fps: 60
    },
    
    handle: {
        // defined as value
        keyLeft: 37,
        keyRight: 39,
        keySpace: 32
    }
    
}