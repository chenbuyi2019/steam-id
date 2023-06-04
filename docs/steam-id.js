"use strict";
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
    const regid32 = /([0-9]):([0-1]):([0-9]+)/i;
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
                    regs = regid32.exec(input);
                    if (regs == null) {
                        throw `不满足 id32 的基本格式: ${input}`;
                    }
                    this.Universe = parseInt(regs[1]);
                    this.LastBitIs1 = regs[2] == `1`;
                    this.AccountNumber = parseInt(regs[3]);
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
const selInputIdType = document.getElementById('selInputIdType');
const selOutputIdType = document.getElementById('selOutputIdType');
const butConvert = document.getElementById('butConvert');
butConvert.addEventListener('click', function () {
    const lines = txtInput.value.split(/[\r\n]+/gi);
    if (lines.length < 1) {
        return;
    }
    let inputType = SteamId.SteamIdType.id64;
    const inputv = selInputIdType.value;
    switch (inputv) {
        case 'id3num':
            inputType = SteamId.SteamIdType.id3;
            break;
        case 'id3numgroup':
            inputType = SteamId.SteamIdType.id3;
            break;
        case 'id3':
            inputType = SteamId.SteamIdType.id3;
            break;
        case 'id64':
            inputType = SteamId.SteamIdType.id64;
            break;
        case 'id32':
            inputType = SteamId.SteamIdType.id32;
            break;
        default:
            alert(`无法识别的输入类型: ${inputv}`);
            return;
    }
    let ids = [];
    let errs = '';
    for (const linestr of lines) {
        let line = linestr.trim();
        if (line.length > 2) {
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
                ids.push(id);
            }
            catch (error) {
                errs += String(error) + '\n';
            }
        }
    }
    let out = '';
    const outputv = selOutputIdType.value;
    for (const id of ids) {
        switch (outputv) {
            case 'id64p':
                out += `'` + id.GetId64();
                break;
            case 'id64':
                out += id.GetId64();
                break;
            case 'url':
                if (id.IsGroup) {
                    out += "https://steamcommunity.com/gid/" + id.GetId3Number();
                }
                else {
                    out += "https://steamcommunity.com/profiles/" + id.GetId64();
                }
                break;
            case 'id32':
                out += id.GetId32();
                break;
            case 'id3':
                out += id.GetId3();
                break;
            case 'id3num':
                out += id.GetId3Number().toString();
                break;
            default:
                alert(`无法识别的输出类型: ${outputv}`);
                return;
        }
        out += '\n';
    }
    if (errs.length > 2) {
        alert(`无法识别：\n${errs}`);
        return;
    }
    txtInput.value = out;
    if (navigator.clipboard) {
        navigator.clipboard.writeText(out);
    }
});
