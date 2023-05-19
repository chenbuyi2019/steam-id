/// <reference path="steamid.ts" />

const divButtons = document.getElementById('buttons') as HTMLDivElement
const txtInput = document.getElementById("txtInput") as HTMLTextAreaElement
const selInputIdType = document.getElementById('selInputIdType') as HTMLSelectElement
const selOutputIdType = document.getElementById('selOutputIdType') as HTMLSelectElement
const butConvert = document.getElementById('butConvert') as HTMLButtonElement

butConvert.addEventListener('click', function () {
    const lines = txtInput.value.split(/[\r\n]+/gi)
    if (lines.length < 1) {
        return
    }
    let inputType: SteamId.SteamIdType = SteamId.SteamIdType.id64
    const inputv = selInputIdType.value
    switch (inputv) {
        case 'id3num':
            inputType = SteamId.SteamIdType.id3
            break
        case 'id3numgroup':
            inputType = SteamId.SteamIdType.id3
            break
        case 'id3':
            inputType = SteamId.SteamIdType.id3
            break
        case 'id64':
            inputType = SteamId.SteamIdType.id64
            break
        case 'id32':
            inputType = SteamId.SteamIdType.id32
            break
        default:
            alert(`无法识别的输入类型: ${inputv}`)
            return
    }
    let ids: Array<SteamId.SteamIdInfo> = []
    let errs: string = ''
    for (const linestr of lines) {
        let line = linestr.trim()
        if (line.length > 2) {
            switch (inputv) {
                case 'id3num':
                    line = `U:1:${line}`
                    break
                case 'id3numgroup':
                    line = `g:1:${line}`
                    break
            }
            try {
                const id = new SteamId.SteamIdInfo(line, inputType)
                ids.push(id)
            } catch (error) {
                errs += String(error) + '\n'
            }
        }
    }
    let out = ''
    const outputv = selOutputIdType.value
    for (const id of ids) {
        switch (outputv) {
            case 'id64p':
                out += `'` + id.GetId64()
                break
            case 'id64':
                out += id.GetId64()
                break
            case 'id64url':
                out += "https://steamcommunity.com/profiles/" + id.GetId64()
                break
            case 'id32':
                out += id.GetId32()
                break
            case 'id3':
                out += id.GetId3()
                break
            case 'id3num':
                out += id.GetId3Number().toString()
                break
            default:
                alert(`无法识别的输出类型: ${outputv}`)
                return
        }
        out += '\n'
    }
    if (errs.length > 2) {
        alert(`无法识别：\n${errs}`)
        return
    }
    txtInput.value = out
    if (navigator.clipboard) {
        navigator.clipboard.writeText(out)
    }
})