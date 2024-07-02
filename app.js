document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('urlInput');
    const dateInput = document.getElementById('dateInput');
    const playButton = document.getElementById('playButton');
    const downloadButton = document.getElementById('downloadButton');
    const audioPlayer = document.getElementById('audioPlayer');
    const statusDiv = document.createElement('div');
    document.body.appendChild(statusDiv);

    function getAudioInfo(url, dateString) {
        const match = url.match(/\/(\d+)\/(\d+)/);
        if (match) {
            const audioId = match[2];
            const date = new Date(dateString);
            const previousDate = new Date(date);
            previousDate.setDate(previousDate.getDate() - 1);

            return {
                audioId: audioId,
                originalDate: formatDate(date),
                previousDate: formatDate(previousDate)
            };
        }
        return null;
    }

    function formatDate(date) {
        return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    }

    function tryAudioUrl(audioId, date) {
        const audioUrl = `https://cdn5.lizhi.fm/audio/${date}/${audioId}_hd.mp3`;
        return fetch(audioUrl, { method: 'HEAD' })
            .then(response => {
                if (response.ok) {
                    return audioUrl;
                } else {
                    throw new Error(`Failed to fetch ${audioUrl}`);
                }
            });
    }

    function getAudioUrl(audioInfo) {
        return tryAudioUrl(audioInfo.audioId, audioInfo.originalDate)
            .catch(() => {
                console.log("Original date failed, trying previous date");
                return tryAudioUrl(audioInfo.audioId, audioInfo.previousDate);
            })
            .catch(() => {
                console.log("Both dates failed, using original date as fallback");
                return `https://cdn5.lizhi.fm/audio/${audioInfo.originalDate}/${audioInfo.audioId}_hd.mp3`;
            });
    }

    function handleAudioAction(action) {
        const audioInfo = getAudioInfo(urlInput.value, dateInput.value);
        if (audioInfo) {
            statusDiv.textContent = `Fetching audio... (Trying original date: ${audioInfo.originalDate})`;
            getAudioUrl(audioInfo)
                .then(url => {
                    statusDiv.textContent = `Using URL: ${url}`;
                    if (action === 'play') {
                        audioPlayer.innerHTML = `<audio controls src="${url}"></audio>`;
                    } else if (action === 'download') {
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `audio_${audioInfo.audioId}.mp3`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        statusDiv.textContent += " Download started.";
                    }
                })
                .catch(error => {
                    statusDiv.textContent = `Error: ${error}`;
                });
        } else {
            statusDiv.textContent = 'Invalid URL or date';
        }
    }

    playButton.addEventListener('click', () => handleAudioAction('play'));
    downloadButton.addEventListener('click', () => handleAudioAction('download'));
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(error => console.log('ServiceWorker registration failed:', error));
    });
}
