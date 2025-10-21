# Transcript

> Use this API endpoint to fetch text transcript from a YouTube video in various formats and languages.

<Info>
  This endpoint will soon be deprecated in favor of the [Universal
  Transcripts](/get-transcript). Please migrate your workloads.
</Info>

## Quick Start

### Request

<CodeGroup>
  ```js Node
  import { Supadata, Transcript } from "@supadata/js";

  // Initialize the client
  const supadata = new Supadata({
    apiKey: "YOUR_API_KEY",
  });

  const transcript: Transcript = await supadata.youtube.transcript({
    url: "https://youtu.be/dQw4w9WgXcQ",
  });
  console.log(transcript);
  ```

  ```python Python
  from supadata import Supadata, SupadataError

  # Initialize the client
  supadata = Supadata(api_key="YOUR_API_KEY")

  text_transcript = supadata.youtube.transcript(
      video_id="dQw4w9WgXcQ",
      text=True
  )
  print(text_transcript.content)
  ```

  ```bash cURL
  curl -X GET 'https://api.supadata.ai/v1/youtube/transcript?url=https://www.youtube.com/watch?v=dQw4w9WgXcQ&text=true' \
    -H 'x-api-key: YOUR_API_KEY'
  ```
</CodeGroup>

### Response

```json
{
  "content": "Never gonna give you up, never gonna let you down...",
  "lang": "en",
  "availableLangs": ["en", "es", "zh-TW"]
}
```

## Specification

### Endpoint

`GET https://api.supadata.ai/v1/youtube/transcript`

Each request requires an `x-api-key` header with your API key available after signing up. Get your API key [here](https://dash.supadata.ai/organizations/api-key).

### Query Parameters

| Parameter | Type    | Required | Description                                                                             |
| --------- | ------- | -------- | --------------------------------------------------------------------------------------- |
| url       | string  | Yes\*    | YouTube video URL. See [Supported YouTube URL Formats](#supported-youtube-url-formats). |
| videoId   | string  | Yes\*    | YouTube video ID. Alternative to URL                                                    |
| lang      | string  | No       | Preferred language code of the transcript (ISO 639-1). See [Languages](#languages).     |
| text      | boolean | No       | When true, returns plain text transcript. Default: false                                |
| chunkSize | number  | No       | Maximum characters per transcript chunk (only when text=false)                          |

\* Either `url` or `videoId` must be provided

### Response Format

**When `text=true`:**

```typescript
{
  "content": string,
  "lang": string             // ISO 639-1 language code
  "availableLangs": string[] // List of available languages
}
```

**When `text=false`:**

```typescript
{
  "content": [
    {
      "text": string,        // Transcript segment
      "offset": number,      // Start time in milliseconds
      "duration": number,    // Duration in milliseconds
      "lang": string         // ISO 639-1 language code of chunk
    }
  ],
  "lang": string             // ISO 639-1 language code of transcript
  "availableLangs": string[] // List of available languages
}
```

### Error Codes

The API returns HTTP status codes and error codes. See this [page](/errors) for more details.

### Supported YouTube URL Formats

`url` parameter supports various YouTube URL formats. See this [page](/youtube/supported-url-formats) for more details.

## Languages

The endpoint supports multiple languages. The `lang` parameter is used to specify the preferred language of the transcript. If the video does not have a transcript in the preferred language, the endpoint will return a transcript in the first available language and a list of other available languages. It is then possible to make another request to get the transcript in your chosen fallback language.

<Info>
  Need to get your transcript in a language not yet supported? Check the
  [Transcript Translation](/youtube/get-transcript-translation) endpoint.
</Info>

## Pricing

* 1 transcript request = 1 credit


# Error 

# Transcript Unavailable

> No transcript is available for this video. Explanation of the error and how to fix it.

No transcript is available for this video. This error occurs when you try to access a transcript for a YouTube, TikTok, Instagram or X (Twitter) video that doesn't have one available.

```json
{
  "error": "transcript-unavailable",
  "message": "Transcript Unavailable",
  "details": "No transcript is available for this video",
  "documentationUrl": "https://supadata.ai/documentation/errors/transcript-unavailable"
}
```

## Reasons and how to fix

### Video has no captions

The YouTube, TikTok, Instagram or X (Twitter) video doesn't have any captions or subtitles available.

To fix this:

1. Use the [`/transcript`](/get-transcript) endpoint with `mode=generate` or `mode=auto` option to generate captions for the video
2. Consider using a different video that has captions

### Reach out to support

If you continue to face issues or need further assistance, please reach out to [support@supadata.ai](mailto:support@supadata.ai), and we will assist you as soon as possible.
