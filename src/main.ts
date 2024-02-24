/// <reference path="steamid.ts" />

const divButtons = document.getElementById('buttons') as HTMLDivElement
const txtInput = document.getElementById("txtInput") as HTMLInputElement
const butConvert = document.getElementById('butConvert') as HTMLButtonElement
const txtOutput = document.getElementById('txtOutput') as HTMLTextAreaElement
const butGotoURL = document.getElementById('butGotoURL') as HTMLAnchorElement

let lastUrl = ""

function getTypeFromTypeName(s: string): SteamId.SteamIdType {
    switch (s) {
        case 'id3num':
            return SteamId.SteamIdType.id3
        case 'id3numgroup':
            return SteamId.SteamIdType.id3
        case 'id3':
            return SteamId.SteamIdType.id3
        case 'id64':
            return SteamId.SteamIdType.id64
        case 'id32':
            return SteamId.SteamIdType.id32
        default:
            throw `无法识别的输入类型: ${s}`
    }
}

function doWork(): string {
    lastUrl = ""
    let inputType: SteamId.SteamIdType = SteamId.SteamIdType.id64
    const radios = document.getElementsByName("steamIdType")
    let inputv: string = ""
    for (const element of radios) {
        const radio = element as HTMLInputElement
        if (radio.checked) {
            inputv = radio.value
            inputType = getTypeFromTypeName(inputv)
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
        addLine(`群组代码: ${id.GetId3Number()}`)
    } else {
        addLine(`好友代码: ${id.GetId3Number()}`)
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
