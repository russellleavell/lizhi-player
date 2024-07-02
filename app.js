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
            const adjustedDate = new Date(date);
            adjustedDate.setDate(adjustedDate.getDate() - 1);

            return {
                audioId: audioId,
                adjustedDate: formatDate(adjustedDate),
                originalDate: formatDate(date)
            };
        }
        return null;
    }

    function formatDate(date) {
        return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}`;
    }

    function tryAudioUrl(audioId, date) {
        return new Promise((resolve, reject) => {
            const audioUrl = `https://cdn5.lizhi.fm/audio/${date}/${audioId}_hd.mp3`;
            fetch(audioUrl, { method: 'HEAD' })
                .then(response => {
                    if (response.ok) {
                        resolve(audioUrl);
                    } else {
                        reject(`Failed to fetch ${audioUrl}`);
                    }
                })
                .catch(error => reject(`Error fetching ${audioUrl}: ${error}`));
        });
    }

    function getAudioUrl(audioInfo) {
        return tryAudioUrl(audioInfo.audioId, audioInfo.adjustedDate)
            .catch(() => tryAudioUrl(audioInfo.audioId, audioInfo.originalDate))
            .catch(() => {
                console.log("Both URLs failed, using adjusted date as fallback");
                return `https://cdn5.lizhi.fm/audio/${audioInfo.adjustedDate}/${audioInfo.audioId}_hd.mp3`;
            });
    }

    playButton.addEventListener('click', () => {
        const audioInfo = getAudioInfo(urlInput.value, dateInput.value);
        if (audioInfo) {
            statusDiv.textContent = "Fetching audio...";
            getAudioUrl(audioInfo)
                .then(url => {
                    audioPlayer.innerHTML = `<audio controls src="${url}"></audio>`;
                    statusDiv.textContent = "Audio loaded successfully.";
                })
                .catch(error => {
                    statusDiv.textContent = `Error: ${error}`;
                });
        } else {
            statusDiv.textContent = 'Invalid URL or date';
        }
    });

    downloadButton.addEventListener('click', () => {
        const audioInfo = getAudioInfo(urlInput.value, dateInput.value);
        if (audioInfo) {
            statusDiv.textContent = "Preparing download...";
            getAudioUrl(audioInfo)
                .then(url => {
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `audio_${audioInfo.audioId}.mp3`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    statusDiv.textContent = "Download started.";
                })
                .catch(error => {
                    statusDiv.textContent = `Error: ${error}`;
                });
        } else {
            statusDiv.textContent = 'Invalid URL or date';
        }
    });
});

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => console.log('ServiceWorker registered'))
            .catch(error => console.log('ServiceWorker registration failed:', error));
    });
}
