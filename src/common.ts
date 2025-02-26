export class RGB {
    constructor(public r: number, public g: number, public b: number) {
    }
}

export function colorGradient(startColor: RGB, endColor: RGB, x: number) {
    const clampedX = Math.min(1, Math.max(0, x))

    const r = Math.round(startColor.r + clampedX * (endColor.r - startColor.r))
    const g = Math.round(startColor.g + clampedX * (endColor.g - startColor.g))
    const b = Math.round(startColor.b + clampedX * (endColor.b - startColor.b))

    return `rgb(${r}, ${g}, ${b})`
}

const countryName = new Intl.DisplayNames(['en'], {type: 'region'})

export function getCountryName(code: string): string {
    try {
        return countryName.of(code)
    } catch (_) {
        return code
    }
}

export function ObjectToMap<T>(object: Object): Map<string, T> {
    const map = new Map<string, T>()

    for (const [k, v] of Object.entries(object)) {
        map.set(k, v)
    }

    return map
}

export function MapValues<T>(map: Map<string, T>) {
    let values: T[] = []

    for (const [, v] of map) {
        values.push(v)
    }

    return values
}
