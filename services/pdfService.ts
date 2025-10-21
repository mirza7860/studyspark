
declare const pdfjsLib: any;

export const extractTextFromPDF = async (file: File): Promise<string> => {
    const fileReader = new FileReader();

    return new Promise((resolve, reject) => {
        fileReader.onload = async (event) => {
            if (!event.target?.result) {
                return reject(new Error("Failed to read file."));
            }

            try {
                const typedarray = new Uint8Array(event.target.result as ArrayBuffer);
                const pdf = await pdfjsLib.getDocument(typedarray).promise;
                let fullText = '';

                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items.map((item: any) => item.str).join(' ');
                    fullText += pageText + '\n\n';
                }
                
                resolve(fullText);
            } catch (error) {
                reject(error);
            }
        };

        fileReader.onerror = (error) => {
            reject(error);
        };
        
        fileReader.readAsArrayBuffer(file);
    });
};
