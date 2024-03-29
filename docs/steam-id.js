"use strict";
const butConvertBatch = document.getElementById("butConvertBatch");
const txtBatch = document.getElementById("txtBatch");
function ConvertBatch() {
    let inputType = SteamId.SteamIdType.id64;
    let radios = document.getElementsByName("steamIdType2");
    let inputv = "";
    for (const element of radios) {
        const radio = element;
        if (radio.checked) {
            inputv = radio.value;
            inputType = getTypeFromTypeName(radio.value);
            break;
        }
    }
    let outputType = "";
    radios = document.getElementsByName("steamIdType3");
    for (const element of radios) {
        const radio = element;
        if (radio.checked) {
            outputType = radio.value;
            break;
        }
    }
    let raw = txtBatch.value.trim();
    if (raw.length < 1) {
        return "";
    }
    let lines = raw.split("\n");
    let output = "";
    function addLine(str) {
        if (output.length > 0) {
            output += "\n";
        }
        output += str;
    }
    for (const lineraw of lines) {
        let line = lineraw.trim();
        if (line.length < 1) {
            addLine("");
            continue;
        }
        switch (inputv) {
            case 'id3num':
                line = `U:1:${line}`;
                break;
            case 'id3numgroup':
                line = `g:1:${line}`;
                break;
        }
        try {
            const id = new SteamId.SteamIdInfo(line, inputType);
            switch (outputType) {
                case "id64":
                    addLine(id.GetId64());
                    break;
                case "id32":
                    addLine(id.GetId32());
                    break;
                case "id3":
                    addLine(id.GetId3());
                    break;
                case "id3num":
                    addLine(id.GetId3Number().toString());
                    break;
                default:
                    addLine("未知类型 " + outputType);
                    break;
            }
        }
        catch (error) {
            addLine(`错误 ${line} ${error}`);
        }
    }
    return output.trim();
}
butConvertBatch.addEventListener("click", function () {
    let str;
    try {
        str = ConvertBatch();
    }
    catch (error) {
        str = "出错: " + String(error);
    }
    txtBatch.value = str;
});
var SteamId;
(function (SteamId) {
    let SteamIdType;
    (function (SteamIdType) {
        SteamIdType[SteamIdType["id3"] = 3] = "id3";
        SteamIdType[SteamIdType["id32"] = 32] = "id32";
        SteamIdType[SteamIdType["id64"] = 64] = "id64";
    })(SteamIdType = SteamId.SteamIdType || (SteamId.SteamIdType = {}));
    let SteamIdUniverse;
    (function (SteamIdUniverse) {
        SteamIdUniverse[SteamIdUniverse["Unspecified"] = 0] = "Unspecified";
        SteamIdUniverse[SteamIdUniverse["Individual"] = 0] = "Individual";
        SteamIdUniverse[SteamIdUniverse["Public"] = 1] = "Public";
        SteamIdUniverse[SteamIdUniverse["Beta"] = 2] = "Beta";
        SteamIdUniverse[SteamIdUniverse["Internal"] = 3] = "Internal";
        SteamIdUniverse[SteamIdUniverse["Dev"] = 4] = "Dev";
        SteamIdUniverse[SteamIdUniverse["RC"] = 5] = "RC";
    })(SteamIdUniverse = SteamId.SteamIdUniverse || (SteamId.SteamIdUniverse = {}));
    const regid32 = /([0-1]):([0-9]+)/i;
    const regid64 = /([0-9]{17,})/i;
    const regid3 = /([a-z]):[0-1]:([0-9]+)/i;
    const userId64Identifier = BigInt(`76561197960265728`);
    const groupId64Identifier = BigInt(`103582791429521408`);
    const big0 = BigInt(`0`);
    const big1 = BigInt(`1`);
    const big2 = BigInt(`2`);
    const big4 = BigInt(`4`);
    const big7 = BigInt(`7`);
    const big32 = BigInt(`32`);
    const big56 = BigInt(`56`);
    const big52 = BigInt(`52`);
    class SteamIdInfo {
        constructor(input, inputType) {
            this.Universe = SteamIdUniverse.Unspecified;
            this.LastBitIs1 = false;
            this.AccountNumber = -1;
            this.IsGroup = false;
            input = input.trim();
            if (input.length < 2) {
                throw `input 为空`;
            }
            let regs = null;
            let big = big0;
            let accountnum = big0;
            switch (inputType) {
                case SteamIdType.id32:
                    input = input.replace("_0", "").replace("_1", "");
                    regs = regid32.exec(input);
                    if (regs == null) {
                        throw `不满足 id32 的基本格式: ${input}`;
                    }
                    this.LastBitIs1 = regs[1] == `1`;
                    this.AccountNumber = parseInt(regs[2]);
                    break;
                case SteamIdType.id3:
                    regs = regid3.exec(input);
                    if (regs == null) {
                        throw `不满足 id3 的基本格式: ${input}`;
                    }
                    let universe = regs[1].toLowerCase();
                    if (universe == 'g') {
                        this.IsGroup = true;
                    }
                    big = BigInt(regs[2]);
                    accountnum = big >> big1;
                    this.AccountNumber = parseInt(accountnum.toString());
                    this.LastBitIs1 = (big - (accountnum << big1)) == big1;
                    break;
                case SteamIdType.id64:
                    regs = regid64.exec(input);
                    if (regs == null) {
                        throw `不满足 id64 的基本格式: ${input}`;
                    }
                    big = BigInt(regs[1]);
                    let uni = big >> big56;
                    this.Universe = parseInt(uni.toString());
                    let accountType = (big >> big52) - (uni << big4);
                    if (accountType == big7) {
                        this.IsGroup = true;
                    }
                    let last32 = big - ((big >> big32) << big32);
                    accountnum = last32 >> big1;
                    this.AccountNumber = parseInt(accountnum.toString());
                    this.LastBitIs1 = (last32 - (accountnum << big1)) == big1;
                    break;
                default:
                    throw `不正确的 SteamIdType: ${inputType}`;
            }
        }
        GetId64() {
            let big = big0;
            big += BigInt(this.AccountNumber) * big2;
            if (this.IsGroup) {
                big += groupId64Identifier;
            }
            else {
                big += userId64Identifier;
            }
            if (this.LastBitIs1) {
                big += big1;
            }
            return big.toString();
        }
        GetId32() {
            return `STEAM_0:${this.LastBitIs1 ? '1' : '0'}:${this.AccountNumber}`;
        }
        GetId3Number() {
            let n = this.AccountNumber * 2;
            if (this.LastBitIs1) {
                n += 1;
            }
            return n;
        }
        GetId3() {
            return `[${this.IsGroup ? 'g' : 'U'}:1:${this.GetId3Number()}]`;
        }
    }
    SteamId.SteamIdInfo = SteamIdInfo;
})(SteamId || (SteamId = {}));
const divButtons = document.getElementById('buttons');
const txtInput = document.getElementById("txtInput");
const butConvert = document.getElementById('butConvert');
const txtOutput = document.getElementById('txtOutput');
const butGotoURL = document.getElementById('butGotoURL');
let lastUrl = "";
function getTypeFromTypeName(s) {
    switch (s) {
        case 'id3num':
            return SteamId.SteamIdType.id3;
        case 'id3numgroup':
            return SteamId.SteamIdType.id3;
        case 'id3':
            return SteamId.SteamIdType.id3;
        case 'id64':
            return SteamId.SteamIdType.id64;
        case 'id32':
            return SteamId.SteamIdType.id32;
        default:
            throw `无法识别的输入类型: ${s}`;
    }
}
function doWork() {
    lastUrl = "";
    let inputType = SteamId.SteamIdType.id64;
    const radios = document.getElementsByName("steamIdType");
    let inputv = "";
    for (const element of radios) {
        const radio = element;
        if (radio.checked) {
            inputv = radio.value;
            inputType = getTypeFromTypeName(inputv);
            break;
        }
    }
    let line = txtInput.value.trim();
    if (line.length < 1) {
        return "";
    }
    switch (inputv) {
        case 'id3num':
            line = `U:1:${line}`;
            break;
        case 'id3numgroup':
            line = `g:1:${line}`;
            break;
    }
    const id = new SteamId.SteamIdInfo(line, inputType);
    let out = '';
    function addLine(str) {
        if (out.length > 0) {
            out += "\n\n";
        }
        out += str;
    }
    if (id.IsGroup) {
        lastUrl = `https://steamcommunity.com/gid/${id.GetId3Number()}`;
    }
    else {
        lastUrl = `https://steamcommunity.com/profiles/${id.GetId64()}`;
    }
    addLine(lastUrl);
    addLine(`id64: ${id.GetId64()}`);
    addLine(`id32: ${id.GetId32()}`);
    addLine(`id3: ${id.GetId3()}`);
    if (id.IsGroup) {
        addLine(`群组代码: ${id.GetId3Number()}`);
    }
    else {
        addLine(`好友代码: ${id.GetId3Number()}`);
    }
    return out;
}
butConvert.addEventListener('click', function () {
    let str;
    try {
        str = doWork();
    }
    catch (error) {
        str = "出错: " + String(error);
    }
    const gotUrl = lastUrl.length > 5;
    butGotoURL.href = gotUrl ? lastUrl : "#";
    butGotoURL.style.display = gotUrl ? "inline-block" : "none";
    txtOutput.value = str;
});
