/// https://stackoverflow.com/a/42630481
export function encodeUri(v: any) {
    return encodeURIComponent(
        JSON.stringify(v, undefined, 0)
            .replace(/[()'~_!*]/g, function (c) {
                // Replace ()'~_!* with \u0000 escape sequences
                return '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4)
            })
            .replace(/\{/g, '(')    //    { -> (
            .replace(/\}/g, ')')    //    } -> )
            .replace(/"/g, "'")     //    " -> '
            .replace(/\:/g, '~')    //    : -> ~
            .replace(/,/g, '_')     //    , -> _
            .replace(/\[/g, '!')    //    [ -> !
            .replace(/\]/g, '*')    //    ] -> *
    )
}

export function decodeUri(t: string) {
    return JSON.parse(
        decodeURIComponent(t)
            .replace(/\(/g, '{')    //    ( -> {
            .replace(/\)/g, '}')    //    ) -> }
            .replace(/'/g, '"')     //    ' -> "
            .replace(/~/g, ':')     //    ~ -> :
            .replace(/_/g, ',')     //    _ -> ,
            .replace(/\!/g, '[')    //    ! -> [
            .replace(/\*/g, ']')    //    * -> ]
    )
}