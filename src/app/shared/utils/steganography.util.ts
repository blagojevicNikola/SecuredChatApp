

export class CustomSteg
{

    static hideMessageInImage(base64Img:string, message:string)
    {
        const binaryRepresentation = this.stringToBinary(message);

    }


    static stringToBinary(content:string):number[]
    {
        const binaryMessage: number[] = [];
        for(var i = 0; i < content.length; i++)
        {
            const charCode = content.charCodeAt(i);
            const binary = charCode.toString(2).padStart(8,'0');
            for(let j = 0; j < binary.length; j++)
            {
                binaryMessage.push(Number(binary[j]))
            }
        }
        return binaryMessage;
    }
}