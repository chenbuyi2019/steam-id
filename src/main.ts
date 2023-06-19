/// <reference path="steamid.ts" />

const divButtons = document.getElementById('buttons') as HTMLDivElement
const txtInput = document.getElementById("txtInput") as HTMLInputElement
const butConvert = document.getElementById('butConvert') as HTMLButtonElement
const txtOutput = document.getElementById('txtOutput') as HTMLTextAreaElement
const butGotoURL = document.getElementById('butGotoURL') as HTMLAnchorElement

let lastUrl = ""

function doWork(): string {
    lastUrl = ""
    let inputType: SteamId.SteamIdType = SteamId.SteamIdType.id64
    const radios = document.getElementsByName("steamIdType")
    let inputv: string = ""
    for (const element of radios) {
        const radio = element as HTMLInputElement
        if (radio.checked) {
            inputv = radio.value
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
                    throw `无法识别的输入类型: ${inputv}`
            }
            break;
        }
    }
    let line = txtInput.value.trim()
    if (line.length < 1) { return ""; }
    switch (inputv) {
        case 'id3num':
            line = `U:1:${line}`
            break
        case 'id3numgroup':
            line = `g:1:${line}`
            break
    }
    const id = new SteamId.SteamIdInfo(line, inputType)
    let out = ''
    function addLine(str: string) {
        if (out.length > 0) {
            out += "\n\n"
        }
        out += str
    }
    if (id.IsGroup) {
        lastUrl = `https://steamcommunity.com/gid/${id.GetId3Number()}`
    } else {
        lastUrl = `https://steamcommunity.com/profiles/${id.GetId64()}`
    }
    addLine(lastUrl)
    addLine(`id64: ${id.GetId64()}`)
    addLine(`id32: ${id.GetId32()}`)
    addLine(`id3: ${id.GetId3()}`)
    if (id.IsGroup) {
        addLine("群组")
    }
    return out;
}

butConvert.addEventListener('click', function () {
    let str: string
    try {
        str = doWork()
    } catch (error) {
        str = "出错: " + String(error)
    }
    const gotUrl = lastUrl.length > 5;
    butGotoURL.href = gotUrl ? lastUrl : "#"
    butGotoURL.style.display = gotUrl ? "inline-block" : "none"
    txtOutput.value = str
})
