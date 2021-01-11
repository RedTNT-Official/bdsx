
function shrinkZero(values:number[]):void
{
    for (let j=values.length-1; j>=0; j--)
    {
        if (values[j] !== 0)
        {
            values.length = j+1;
            break;
        }
    }
}

function add_with_offset(a:number[], b:string, offset:number):void
{
    let minn:number;
    let maxn:number;
    const alen = a.length;
    const blen = offset + b.length;
    let maxoff:number;
    if (alen < blen)
    {
        minn = a.length;
        maxn = blen;
        maxoff = offset;
    }
    else
    {
        minn = blen;
        maxn = a.length;
        maxoff = 0;
    }
    let v = 0;
    let i=0;
    for (;i<minn;i++)
    {
        v += a[i];
        v += b.charCodeAt(i-offset);
        a[i] = v & 0xffff;
        v >>= 16;
    }
    if (alen < blen)
    {
        for (;i<maxn;i++)
        {
            v += b.charCodeAt(i-maxoff);
            a.push(v & 0xffff);
            v >>= 16;
        }
    }
    else
    {
        for (;i<maxn;i++)
        {
            v += a[i];
            a[i] = v & 0xffff;
            v >>= 16;
            if (v === 0) return;
        }
    }
    a.push(v);
}

export namespace bin
{
    export function uint8(value:string):number
    {        
        return value.length !== 0 ? value.charCodeAt(0) & 0xff : 0;
    }
    export function uint16(value:string):number
    {        
        return value.length !== 0 ? value.charCodeAt(0) : 0;
    }
    export function int32(value:string):number
    {    
        if (value.length >= 2)
        {
            return (value.charCodeAt(1) << 16) | value.charCodeAt(0);
        }    
        else if (value.length === 0)
        {
            return 0;
        }
        else
        {
            return value.charCodeAt(0);
        }
    }
    export function int32_high(value:string):number
    {    
        if (value.length >= 4)
        {
            return (value.charCodeAt(3) << 16) | value.charCodeAt(2);
        }    
        else if (value.length >= 3)
        {
            return value.charCodeAt(2);
        }
        else
        {
            return 0;
        }
    }
    export function int32_2(value:string):[number, number]
    {    
        if (value.length >= 4)
        {
            return [
                (value.charCodeAt(1) << 16) | value.charCodeAt(0),
                (value.charCodeAt(3) << 16) | value.charCodeAt(2),
            ];
        }
        if (value.length >= 2)
        {
            if (value.length === 3)
            {
                return [
                    (value.charCodeAt(1) << 16) | value.charCodeAt(0),
                    value.charCodeAt(2),
                ];
            }
            else
            {
                return [
                    (value.charCodeAt(1) << 16) | value.charCodeAt(0),
                    0,
                ];
            }
        }
        else if (value.length === 0)
        {
            return [0, 0];
        }
        else
        {
            return [
                value.charCodeAt(0),
                0,
            ];
        }
    }
    export function make64(low:number, high:number):string
    {
        let v1 = low & 0xffff;
        let v2 = low >>> 16;
        let v3 = high & 0xffff;
        let v4 = high >>> 16;
        return String.fromCharCode(v1,v2,v3,v4);
    }
    export function toNumber(v:string):number
    {
        let out = 0;
        let mult = 1;
        const len = v.length;
        for (let i=0;i<len;i++)
        {
            out += v.charCodeAt(i) * mult;
            mult *= 0x10000;
        }
        return out;
    }
    export function make(n:number, size:number):string
    {
        n = Math.floor(n);
        if (n < 0) n = 0;
        
        const out:number[] = new Array(size);
        for (let i=0;i<size;i++)
        {
            out[i] = n % 0x10000;
            n = Math.floor(n / 0x10000);
        }
        return String.fromCharCode(...out);
    }
    export function toString(v:string, radix = 10):string
    {
        let len = v.length;
        do
        {
            if (len === 0) return '\0';
            len--;
        }
        while(v.charCodeAt(len) === 0);
        len ++;
        v = v.substr(0, len);

        const out:number[] = [];
        for (;;)
        {
            const [quotient, remainder] = bin.divn(v, radix);
            if (remainder < 10)
            {
                out.push(remainder+0x30);
            }
            else
            {
                out.push(remainder+(0x61-10));
            }
            v = quotient;

            const last = v.length-1;
            if (v.charCodeAt(last) === 0) v = v.substr(0, last);
            if (v === '') break;
        }

        out.reverse();
        return String.fromCharCode(...out);
    }
    export function add(a:string, b:string):string
    {
        let maxtext:string;
        let minn:number;
        let maxn:number;
        if (a.length < b.length)
        {
            maxtext = b;
            minn = a.length;
            maxn = b.length;
        }
        else
        {
            maxtext = a;
            minn = b.length;
            maxn = a.length;
        }
        const values:number[] = new Array(maxn);
        let v = 0;
        let i=0;
        for (;i<minn;i++)
        {
            v += a.charCodeAt(i);
            v += b.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        for (;i<maxn;i++)
        {
            v += maxtext.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        // if (v !== 0) values.push(v);
        return String.fromCharCode(...values);
    }
    export function zero(size:number):string
    {
        return '\0'.repeat(size);
    }
    export function sub(a:string, b:string):string
    {
        const alen = a.length;
        const blen = b.length;
        const values:number[] = new Array(alen);
        let v = 0;
        for (let i=alen;i<blen;i++)
        {
            if (b.charCodeAt(i) !== 0) return bin.zero(alen);
        }
        let i=0;
        for (;i<blen;i++)
        {
            v += a.charCodeAt(i);
            v -= b.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        for (;i<alen;i++)
        {
            v += a.charCodeAt(i);
            values[i] = v & 0xffff;
            v >>= 16;
        }
        if (v !== 0) return bin.zero(alen);

        // shrinkZero(values);
        return String.fromCharCode(...values);
    }
    export function divn(a:string, b:number):[string, number]
    {
        const alen = a.length;
        const out:number[] = new Array(alen);
        let v = 0;
        for (let i=a.length-1;i>=0;i--)
        {
            v *= 0x10000;
            v += a.charCodeAt(i);
            out[i] = Math.floor(v / b);
            v %= b;
        }
        // shrinkZero(values);
        return [String.fromCharCode(...out), v];
    }
    export function muln(a:string, b:number):string
    {
        let v = 0;
        const n = a.length;
        const out:number[] = new Array(n);
        for (let i=0;i<n;i++)
        {
            v += a.charCodeAt(i)*b;
            out[i] = v % 0x10000;
            v = Math.floor(v / 0x10000);
        }
        // while (v !== 0)
        // {
        //     out.push(v % 0x10000);
        //     v = Math.floor(v / 0x10000);
        // }
        return String.fromCharCode(...out);
    }
    export function mul(a:string, b:string):string
    {
        const out:number[] = [];
        const alen = a.length;
        const blen = b.length;
        for (let j=0;j<blen;j++)
        {
            const bn = b.charCodeAt(j);
            for (let i=0;i<alen;i++)
            {
                add_with_offset(out, bin.muln(a, bn), j);
            }
        }
        return String.fromCharCode(...out);
    }
    export function bitand(a:string, b:string):string
    {
        const minlen = Math.min(a.length, b.length);
        const out = new Array(minlen);
        for (let i=0;i<minlen;i++)
        {
            out[i] = a.charCodeAt(i) & b.charCodeAt(i);
        }
        return String.fromCharCode(...out);
    }
    export function bitor(a:string, b:string):string
    {
        let minstr:string;
        let maxstr:string;
        if (a.length < b.length)
        {
            minstr = a;
            maxstr = b;
        }
        else
        {
            maxstr = a;
            minstr = b;
        }

        const minlen = minstr.length;
        const maxlen = maxstr.length;
        const out = new Array(maxlen);
        let i=0;
        for (;i<minlen;i++)
        {
            out[i] = maxstr.charCodeAt(i) | minstr.charCodeAt(i);
        }
        for (;i<maxlen;i++)
        {
            out[i] = maxstr.charCodeAt(i);
        }
        return String.fromCharCode(...out);
    }
    export function bitxor(a:string, b:string):string
    {
        let minstr:string;
        let maxstr:string;
        if (a.length < b.length)
        {
            minstr = a;
            maxstr = b;
        }
        else
        {
            maxstr = a;
            minstr = b;
        }

        const minlen = minstr.length;
        const maxlen = maxstr.length;
        const out = new Array(maxlen);
        let i=0;
        for (;i<minlen;i++)
        {
            out[i] = maxstr.charCodeAt(i) ^ minstr.charCodeAt(i);
        }
        for (;i<maxlen;i++)
        {
            out[i] = maxstr.charCodeAt(i);
        }
        return String.fromCharCode(...out);
    }
    export function reads32(str:string):number[]
    {
        const n = str.length;
        const dwords = n&~1;
        const outn = (n&1)+dwords;
        const out:number[] = new Array(outn);
        let i=0;
        for (;i<dwords;i++)
        {
            const i2 = i*2;
            out[i] = str.charCodeAt(i2) | (str.charCodeAt(i2+1) << 16);
        }
        if (dwords !== outn)
        {
            out[i] = str.charCodeAt(i*2);
        }
        return out;
    }
}
