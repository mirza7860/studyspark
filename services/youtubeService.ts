export async function getYouTubeTranscript(videoId: string): Promise<string> {
    const apiKey = import.meta.env.VITE_SUPDATA_API_KEY;
    if (!apiKey) {
        throw new Error("API key for Supadata is not configured. Make sure VITE_SUPDATA_API_KEY is set in your .env file.");
    }

    const url = `https://api.supadata.ai/v1/youtube/transcript?videoId=${videoId}&text=true`;

    try {
        const response = await fetch(url, {
            headers: {
                'x-api-key': apiKey,
            },
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.error === 'transcript-unavailable') {
                console.log("Transcript not available, trying to generate it...");
                const generateUrl = `${url}&mode=generate`;
                const generateResponse = await fetch(generateUrl, {
                    headers: {
                        'x-api-key': apiKey,
                    },
                });

                const generateData = await generateResponse.json();

                if (!generateResponse.ok) {
                    const errorMessage = generateData.message || `HTTP error! status: ${generateResponse.status}`;
                    throw new Error(errorMessage);
                }
                
                if (generateData && generateData.content) {
                    return generateData.content;
                } else {
                    throw new Error("Transcript content is not available in the API response after generation.");
                }
            }
            // Use the error message from the API if available
            const errorMessage = data.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
        }

        if (data && data.content) {
            return data.content;
        } else {
            throw new Error("Transcript content is not available in the API response.");
        }
    } catch (error) {
        console.error('Error fetching YouTube transcript from Supadata:', error);
        // Re-throw the error to be handled by the calling component
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("An unknown error occurred while fetching the transcript.");
    }
}

export function getYouTubeVideoId(url: string): string | null {
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/.exec(url);
    return regex ? regex[1] : null;
}
