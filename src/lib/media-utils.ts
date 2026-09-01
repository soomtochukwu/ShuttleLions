export type ParsedMediaSource = {
  kind: 'youtube' | 'vimeo' | 'direct_video' | 'image' | 'generic';
  mediaUrl: string;
  embedUrl?: string;
  thumbnailUrl?: string;
};

export function parseMediaSource(url: string, storedThumbnail?: string | null): ParsedMediaSource {
  if (!url) {
    return { kind: 'generic', mediaUrl: url };
  }

  const cleanUrl = url.trim();

  // 1. YouTube Identification
  const ytMatch =
    cleanUrl.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);

  if (ytMatch && ytMatch[1]) {
    const videoId = ytMatch[1];
    return {
      kind: 'youtube',
      mediaUrl: cleanUrl,
      embedUrl: `https://www.youtube-nocookie.com/embed/${videoId}?rel=0`,
      thumbnailUrl: storedThumbnail || `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  }

  // 2. Vimeo Identification
  const vimeoMatch = cleanUrl.match(/(?:vimeo\.com\/(?:video\/)?|player\.vimeo\.com\/video\/)([0-9]+)/i);
  if (vimeoMatch && vimeoMatch[1]) {
    const vimeoId = vimeoMatch[1];
    return {
      kind: 'vimeo',
      mediaUrl: cleanUrl,
      embedUrl: `https://player.vimeo.com/video/${vimeoId}`,
      thumbnailUrl: storedThumbnail || undefined,
    };
  }

  // 3. Direct Video Files (.mp4, .webm, .mov, .m4v, Supabase video storage)
  const isDirectVideo =
    /\.(mp4|webm|mov|m4v|ogv)($|\?)/i.test(cleanUrl) ||
    cleanUrl.includes('/media/videos/') ||
    cleanUrl.includes('video');

  if (isDirectVideo) {
    return {
      kind: 'direct_video',
      mediaUrl: cleanUrl,
      thumbnailUrl: storedThumbnail || undefined,
    };
  }

  // 4. Images (.jpg, .jpeg, .png, .webp, .gif, Unsplash, Imgur, Cloudinary)
  const isImage =
    /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(cleanUrl) ||
    cleanUrl.includes('images.unsplash.com') ||
    cleanUrl.includes('cloudinary.com') ||
    cleanUrl.includes('imgur.com') ||
    cleanUrl.includes('/media/photos/') ||
    cleanUrl.includes('/avatars/');

  if (isImage) {
    return {
      kind: 'image',
      mediaUrl: cleanUrl,
      thumbnailUrl: cleanUrl,
    };
  }

  // Default Fallback
  return {
    kind: 'generic',
    mediaUrl: cleanUrl,
    thumbnailUrl: storedThumbnail || cleanUrl,
  };
}
