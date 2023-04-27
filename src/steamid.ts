namespace SteamId {
    export enum SteamIdType {
        id3 = 3,
        id32 = 32,
        id64 = 64
    }

    export enum SteamIdUniverse {
        Unspecified = 0,
        Individual = 0,
        Public = 1,
        Beta = 2,
        Internal = 3,
        Dev = 4,
        RC = 5
    }

    const regid32 = /([0-9]):([0-1]):([0-9]+)/i
    const regid64 = /([0-9]{17,})/i
    const regid3 = /([a-z]):[0-1]:([0-9]+)/i
    const userId64Identifier = BigInt(`76561197960265728`)
    const groupId64Identifier = BigInt(`103582791429521408`)
    const big0 = BigInt(`0`)
    const big1 = BigInt(`1`)
    const big2 = BigInt(`2`)
    const big4 = BigInt(`4`)
    const big7 = BigInt(`7`)
    const big32 = BigInt(`32`)
    const big56 = BigInt(`56`)
    const big52 = BigInt(`52`)

    export class SteamIdInfo {
        constructor(input: string, inputType: SteamIdType) {
            input = input.trim()
            if (input.length < 2) {
                throw `input 为空`
            }
            let regs: RegExpExecArray | null = null
            let big: bigint = big0
            let accountnum: bigint = big0
            switch (inputType) {
                case SteamIdType.id32:
                    regs = regid32.exec(input)
                    if (regs == null) {
                        throw `不满足 id32 的基本格式: ${input}`
                    }
                    this.Universe = parseInt(regs[1])
                    this.LastBitIs1 = regs[2] == `1`
                    this.AccountNumber = parseInt(regs[3])
                    break
                case SteamIdType.id3:
                    regs = regid3.exec(input)
                    if (regs == null) {
                        throw `不满足 id3 的基本格式: ${input}`
                    }
                    let universe = regs[1].toLowerCase()
                    if (universe == 'g') {
                        this.IsGroup = true
                    }
                    big = BigInt(regs[2])
                    accountnum = big >> big1
                    this.AccountNumber = parseInt(accountnum.toString())
                    this.LastBitIs1 = (big - (accountnum << big1)) == big1
                    break
                case SteamIdType.id64:
                    regs = regid64.exec(input)
                    if (regs == null) {
                        throw `不满足 id64 的基本格式: ${input}`
                    }
                    big = BigInt(regs[1])
                    let uni = big >> big56
                    this.Universe = parseInt(uni.toString())
                    let accountType = (big >> big52) - (uni << big4)
                    if (accountType == big7) {
                        this.IsGroup = true
                    }
                    let last32 = big - ((big >> big32) << big32)
                    accountnum = last32 >> big1
                    this.AccountNumber = parseInt(accountnum.toString())
                    this.LastBitIs1 = (last32 - (accountnum << big1)) == big1
                    break
                default:
                    throw `不正确的 SteamIdType: ${inputType}`
            }
        }
        Universe: SteamIdUniverse = SteamIdUniverse.Public
        LastBitIs1: boolean = false
        AccountNumber: number = -1
        IsGroup: boolean = false
        GetId64(): string {
            let big = big0
            big += BigInt(this.AccountNumber) * big2
            if (this.IsGroup) {
                big += groupId64Identifier
            } else {
                big += userId64Identifier
            }
            if (this.LastBitIs1) {
                big += big1
            }
            return big.toString()
        }
        GetId32(): string {
            return `STEAM_0:${this.LastBitIs1 ? '1' : '0'}:${this.AccountNumber}`
        }
        GetId3Number(): number {
            let n = this.AccountNumber * 2
            if (this.LastBitIs1) { n += 1 }
            return n
        }
        GetId3(): string {
            return `[${this.IsGroup ? 'g' : 'U'}:1:${this.GetId3Number()}]`
        }
    }
}
