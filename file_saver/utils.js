const createBlob = data => type => new Blob([data], {type});

export default {
    stringToBlob: data => {
        data = new Uint8Array(data);
        console.log('DATA', JSON.stringify(Object.values(data)));

        return createBlob(data);
    },

    base64ToBlob: data => {
        const byteCharacters = atob(data),
            {length} = byteCharacters,
            byteNumbers = new Array(length);

        for (let i = 0; i < length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }

        return createBlob(new Uint8Array(byteNumbers));
    }
};
