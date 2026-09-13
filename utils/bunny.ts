import crypto from 'crypto';

/**
 * You must add these to your .env.local:
 * BUNNY_LIBRARY_ID=your_video_library_id
 * BUNNY_API_KEY=your_api_key
 * BUNNY_SECURITY_KEY=your_token_security_key (optional, for token auth)
 */

export async function uploadVideoToBunny(file: File): Promise<string> {
  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const apiKey = process.env.BUNNY_API_KEY;

  if (!libraryId || !apiKey) {
    throw new Error("Missing Bunny Stream credentials in .env");
  }

  // 1. Create the video in Bunny Stream
  const createRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos`, {
    method: 'POST',
    headers: {
      'AccessKey': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify({ title: file.name })
  });

  if (!createRes.ok) {
    const errorText = await createRes.text();
    throw new Error(`Failed to create video in Bunny Stream: ${errorText}`);
  }

  const videoData = await createRes.json();
  const videoId = videoData.guid;

  // 2. Upload the file binary data
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const uploadRes = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
    method: 'PUT',
    headers: {
      'AccessKey': apiKey,
      'Content-Type': 'application/octet-stream',
    },
    body: buffer
  });

  if (!uploadRes.ok) {
    const errorText = await uploadRes.text();
    throw new Error(`Failed to upload video file to Bunny Stream: ${errorText}`);
  }

  // Return the iframe embed URL
  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}`;
}

export async function deleteVideoFromBunny(url: string): Promise<boolean> {
  const libraryId = process.env.BUNNY_LIBRARY_ID;
  const apiKey = process.env.BUNNY_API_KEY;

  if (!libraryId || !apiKey) {
    console.warn("Missing Bunny Stream credentials, skipping delete.");
    return false;
  }

  // Extract video ID from URL
  // Example URL: https://iframe.mediadelivery.net/embed/12345/abcdef-1234-5678-abcd
  const match = url.match(/\/embed\/\d+\/([a-zA-Z0-9-]+)/);
  if (!match) {
    // Not a valid bunny stream iframe URL, or maybe just different format
    return false;
  }

  const videoId = match[1];

  try {
    const res = await fetch(`https://video.bunnycdn.com/library/${libraryId}/videos/${videoId}`, {
      method: 'DELETE',
      headers: {
        'AccessKey': apiKey,
        'Accept': 'application/json'
      }
    });

    return res.ok;
  } catch (error) {
    console.error("Error deleting video from Bunny Stream:", error);
    return false;
  }
}
