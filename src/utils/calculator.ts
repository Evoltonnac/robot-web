// calculate linear value of 2 Hex RGB color

function hex2Rgb(hex: string): { r: number; g: number; b: number } {
    hex = hex.replace(/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i, function (m, r, g, b) {
        return r + g + b
    })
    const result = {
        r: parseInt(hex.substring(0, 2), 16),
        g: parseInt(hex.substring(2, 4), 16),
        b: parseInt(hex.substring(4, 6), 16),
    }
    return result
}

function rgb2Hex(rgb: { r: number; g: number; b: number }): string {
    return `#${rgb.r.toString(16)}${rgb.g.toString(16)}${rgb.b.toString(16)}`
}

function linearHexColor(c1: string, c2: string, percent: number): string {
    const { r: r1, g: g1, b: b1 } = hex2Rgb(c1)
    const { r: r2, g: g2, b: b2 } = hex2Rgb(c2)
    const p = Math.max(0, Math.min(1, percent))
    return rgb2Hex({
        r: parseInt((r1 + (r2 - r1) * p).toFixed(0)),
        g: parseInt((g1 + (g2 - g1) * p).toFixed(0)),
        b: parseInt((b1 + (b2 - b1) * p).toFixed(0)),
    })
}

export { hex2Rgb, rgb2Hex, linearHexColor }
