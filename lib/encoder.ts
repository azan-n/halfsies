/// https://stackoverflow.com/a/42630481
export function encodeUri(v: any) {
    return encodeURIComponent(JSON.stringify(v, undefined, 0))
}

export function decodeUri(t: string) {
    return JSON.parse(decodeURIComponent(t))
}