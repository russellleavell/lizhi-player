if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => console.log('ServiceWorker registered'))
      .catch(error => console.log('ServiceWorker registration failed:', error));
  });
}
document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const playButton = document.getElementById('playButton');
    const downloadButton = document.getElementById('downloadButton');
    const audioPlayer = document.getElementById('audioPlayer');

    function getAudioInfo(url) {
        const match = url.match(/\/(\d+)\/(\d+)/);
        if (match) {
            return {
                audioId: match[2],
                adjustedDate: '2024/06/13', // This should be dynamically calculated
                originalDate: '2024/06/14'  // This should be dynamically calculated
            };
        }
        return null;
    }

    function getAudioUrl(audioInfo) {
        return `https://cdn5.lizhi.fm/audio/${audioInfo.adjustedDate}/${audioInfo.audioId}_hd.mp3`;
    }

    playButton.addEventListener('click', () => {
        const audioInfo = getAudioInfo(urlInput.value);
        if (audioInfo) {
            const audioUrl = getAudioUrl(audioInfo);
            audioPlayer.innerHTML = `<audio controls src="${audioUrl}"></audio>`;
        } else {
            alert('Invalid URL');
        }
    });

    downloadButton.addEventListener('click', () => {
        const audioInfo = getAudioInfo(urlInput.value);
        if (audioInfo) {
            const audioUrl = getAudioUrl(audioInfo);
            window.open(audioUrl, '_blank');
        } else {
            alert('Invalid URL');
        }
    });
});