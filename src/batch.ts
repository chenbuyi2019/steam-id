const butConvertBatch = document.getElementById("butConvertBatch") as HTMLButtonElement
const txtBatch = document.getElementById("txtBatch") as HTMLTextAreaElement

function ConvertBatch(): string {
    let inputType: SteamId.SteamIdType = SteamId.SteamIdType.id64
    let radios = document.getElementsByName("steamIdType2")
    let inputv: string = ""
    for (const element of radios) {
        const radio = element as HTMLInputElement
        if (radio.checked) {
            inputv = radio.value
            inputType = getTypeFromTypeName(radio.value)
            break;
        }
    }
    let outputType: string = ""
    radios = document.getElementsByName("steamIdType3")
    for (const element of radios) {
        const radio = element as HTMLInputElement
        if (radio.checked) {
            outputType = radio.value
            break;
        }
    }
    let raw = txtBatch.value.trim()
    if (raw.length < 1) { return ""; }
    let lines = raw.split("\n")
    let output = ""
    function addLine(str: string) {
        if (output.length > 0) {
            output += "\n"
        }
        output += str
    }
    for (const lineraw of lines) {
        let line = lineraw.trim()
        if (line.length < 1) {
            addLine("")
            continue
        }
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
            switch (outputType) {
                case "id64":
                    addLine(id.GetId64())
                    break
                case "id32":
                    addLine(id.GetId32())
                    break
                case "id3":
                    addLine(id.GetId3())
                    break
                case "id3num":
                    addLine(id.GetId3Number().toString())
                    break
                default:
                    addLine("未知类型 " + outputType)
                    break
            }
        } catch (error) {
            addLine(`错误 ${line} ${error}`)
        }
    }
    return output.trim()
}

butConvertBatch.addEventListener("click", function () {
    let str: string
    try {
        str = ConvertBatch()
    } catch (error) {
        str = "出错: " + String(error)
    }
    txtBatch.value = str
})