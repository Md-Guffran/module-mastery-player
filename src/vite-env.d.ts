/// <reference types="vite/client" />
/// <reference types="youtube" />

declare global {
  interface Window {
    YT: any; // Or more specific YT types if available
    onYouTubeIframeAPIReady: () => void;
  }
}
