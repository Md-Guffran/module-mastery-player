/**
 * Utility functions for managing note titles without storing them in the database
 * Titles are cached in localStorage, keyed by URL
 */

const STORAGE_KEY = 'noteTitles';

interface NoteTitleCache {
  [url: string]: string;
}

/**
 * Get the title cache from localStorage
 */
function getTitleCache(): NoteTitleCache {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

/**
 * Save the title cache to localStorage
 */
function saveTitleCache(cache: NoteTitleCache): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Failed to save note titles to localStorage:', error);
  }
}

/**
 * Extract a meaningful and user-friendly title from a URL
 */
export function extractTitleFromUrl(url: string): string {
  if (!url || typeof url !== 'string') {
    return 'Note';
  }

  const trimmedUrl = url.trim();
  
  try {
    // Handle relative URLs
    const fullUrl = trimmedUrl.startsWith('/') 
      ? `http://localhost${trimmedUrl}` 
      : trimmedUrl;
    
    const urlObj = new URL(fullUrl);
    
    // Try to extract filename from pathname first
    let title = urlObj.pathname.substring(urlObj.pathname.lastIndexOf('/') + 1);
    
    // Remove query parameters and fragments
    title = title.split('?')[0].split('#')[0];
    
    // If we have a filename, clean it up
    if (title && title.trim() !== '' && title !== '/') {
      title = decodeURIComponent(title);
      // Remove file extensions
      title = title.replace(/\.(pdf|doc|docx|txt|md|html|htm|ppt|pptx|xls|xlsx)$/i, '');
      // Replace dashes, underscores, dots, and camelCase with spaces
      title = title
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters (camelCase)
        .replace(/[-_.]/g, ' ') // Replace dashes, underscores, and dots with spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
      
      // If we have a good filename, format it nicely
      if (title && title.length > 0) {
        title = title.split(' ')
          .filter(word => word.length > 0) // Remove empty strings
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' '); // Join with single space
        return title;
      }
    }
    
    // If no good filename, try to use the last meaningful path segment
    const pathParts = urlObj.pathname.split('/').filter(p => p && p !== 'index' && p !== 'home');
    if (pathParts.length > 0) {
      let pathTitle = pathParts[pathParts.length - 1];
      pathTitle = decodeURIComponent(pathTitle);
      pathTitle = pathTitle
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters (camelCase)
        .replace(/[-_.]/g, ' ') // Replace dashes, underscores, and dots with spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
      pathTitle = pathTitle.split(' ')
        .filter(word => word.length > 0) // Remove empty strings
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' '); // Join with single space
      if (pathTitle && pathTitle.length > 0) {
        return pathTitle;
      }
    }
    
    // Fall back to domain name (without www)
    let domain = urlObj.hostname.replace(/^www\./, '');
    domain = domain.split('.')[0]; // Get first part of domain
    domain = domain.charAt(0).toUpperCase() + domain.slice(1);
    
    // If domain is meaningful, use it
    if (domain && domain !== 'localhost' && domain.length > 2) {
      return `${domain} Resource`;
    }
    
    // Last resort: use the full domain
    if (urlObj.hostname && urlObj.hostname !== 'localhost') {
      return urlObj.hostname.replace(/^www\./, '');
    }
    
  } catch {
    // If URL parsing fails, try simple extraction
    const pathParts = trimmedUrl.split('/').filter(p => p);
    if (pathParts.length > 0) {
      let simpleTitle = pathParts[pathParts.length - 1];
      simpleTitle = simpleTitle.split('?')[0].split('#')[0];
      simpleTitle = decodeURIComponent(simpleTitle);
      simpleTitle = simpleTitle
        .replace(/([a-z])([A-Z])/g, '$1 $2') // Add space before capital letters (camelCase)
        .replace(/[-_.]/g, ' ') // Replace dashes, underscores, and dots with spaces
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();
      if (simpleTitle && simpleTitle.length > 0) {
        return simpleTitle.split(' ')
          .filter(word => word.length > 0) // Remove empty strings
          .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
          .join(' '); // Join with single space
      }
    }
  }
  
  return 'Note';
}

/**
 * Get the title for a note URL
 * Checks localStorage cache first, then extracts from URL
 */
export function getNoteTitle(url: string): string {
  if (!url) return 'Note';
  
  const cache = getTitleCache();
  const cachedTitle = cache[url];
  
  if (cachedTitle) {
    return cachedTitle;
  }
  
  return extractTitleFromUrl(url);
}

/**
 * Set a custom title for a note URL
 * This is stored in localStorage, not the database
 * Only saves if the title is different from the auto-generated one
 */
export function setNoteTitle(url: string, title: string): void {
  if (!url) return;
  
  const trimmedTitle = title.trim();
  const autoGenerated = extractTitleFromUrl(url);
  
  // If title is empty or same as auto-generated, remove from cache (use auto-generated)
  if (!trimmedTitle || trimmedTitle === autoGenerated) {
    const cache = getTitleCache();
    delete cache[url];
    saveTitleCache(cache);
    return;
  }
  
  // Save custom title only if it's different from auto-generated
  const cache = getTitleCache();
  cache[url] = trimmedTitle;
  saveTitleCache(cache);
}

/**
 * Get the auto-generated title for a URL (without checking cache)
 */
export function getAutoGeneratedTitle(url: string): string {
  return extractTitleFromUrl(url);
}

/**
 * Get all cached titles
 */
export function getAllCachedTitles(): NoteTitleCache {
  return getTitleCache();
}

/**
 * Clear all cached titles
 */
export function clearTitleCache(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear note titles cache:', error);
  }
}

/**
 * Convert an array of note URLs to an array of objects with title and url
 */
export function enrichNotesWithTitles(noteUrls: string[]): Array<{ title: string; url: string }> {
  return noteUrls
    .filter(url => url && url.trim())
    .map(url => ({
      title: getNoteTitle(url),
      url: url.trim()
    }));
}

