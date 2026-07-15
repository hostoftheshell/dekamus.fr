function formatTime(seconds: number): string {
	const mins = Math.floor(seconds / 60);
	const secs = Math.floor(seconds % 60);
	return `${mins}:${secs < 10 ? `0${secs}` : secs}`;
}

function setBufferedProgress(
	media: HTMLMediaElement,
	seek: HTMLInputElement,
	chrome: HTMLElement,
): void {
	if (media.buffered.length === 0) return;
	const bufferedEnd = media.buffered.end(media.buffered.length - 1);
	const max = Number(seek.max) || 1;
	chrome.style.setProperty("--buffered-width", `${(bufferedEnd / max) * 100}%`);
}

export function initHostedMediaControls(
	media: HTMLMediaElement,
	chrome: HTMLElement,
): void {
	const playBtn = chrome.querySelector<HTMLButtonElement>("[data-play]");
	const seek = chrome.querySelector<HTMLInputElement>("[data-seek]");
	const currentEl = chrome.querySelector<HTMLTimeElement>("[data-current]");
	const durationEl = chrome.querySelector<HTMLTimeElement>("[data-duration]");
	const muteBtn = chrome.querySelector<HTMLButtonElement>("[data-mute]");
	const playIcon = chrome.querySelector("[data-play-icon]");
	const pauseIcon = chrome.querySelector("[data-pause-icon]");
	const volumeOn = chrome.querySelector("[data-volume-on]");
	const volumeOff = chrome.querySelector("[data-volume-off]");

	if (
		!playBtn ||
		!seek ||
		!currentEl ||
		!durationEl ||
		!muteBtn ||
		!playIcon ||
		!pauseIcon ||
		!volumeOn ||
		!volumeOff
	) {
		return;
	}

	let rafId: number | null = null;

	const updatePlayUi = (playing: boolean) => {
		playBtn.setAttribute("aria-label", playing ? "Pause" : "Lire");
		playBtn.setAttribute("aria-pressed", String(playing));
		playIcon.classList.toggle("hidden", playing);
		pauseIcon.classList.toggle("hidden", !playing);
	};

	const updateMuteUi = (muted: boolean) => {
		muteBtn.setAttribute(
			"aria-label",
			muted ? "Rétablir le son" : "Couper le son",
		);
		muteBtn.setAttribute("aria-pressed", String(muted));
		volumeOn.classList.toggle("hidden", muted);
		volumeOff.classList.toggle("hidden", !muted);
	};

	const syncSeekUi = () => {
		const current = Math.floor(media.currentTime);
		seek.value = String(current);
		currentEl.textContent = formatTime(current);
		currentEl.dateTime = `PT${current}S`;
		seek.setAttribute("aria-valuenow", String(current));
	};

	const whilePlaying = () => {
		syncSeekUi();
		rafId = requestAnimationFrame(whilePlaying);
	};

	const startRaf = () => {
		if (rafId !== null) cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(whilePlaying);
	};

	const stopRaf = () => {
		if (rafId !== null) {
			cancelAnimationFrame(rafId);
			rafId = null;
		}
	};

	const displayDuration = () => {
		const duration = Math.floor(media.duration);
		durationEl.textContent = formatTime(duration);
		durationEl.dateTime = `PT${duration}S`;
		seek.max = String(duration);
		seek.setAttribute("aria-valuemax", String(duration));
		setBufferedProgress(media, seek, chrome);
	};

	if (media.readyState > 0) {
		displayDuration();
	} else {
		media.addEventListener("loadedmetadata", displayDuration, { once: true });
	}

	media.addEventListener("progress", () => {
		setBufferedProgress(media, seek, chrome);
	});

	media.addEventListener("play", () => {
		updatePlayUi(true);
		startRaf();
	});

	media.addEventListener("pause", () => {
		updatePlayUi(false);
		stopRaf();
		syncSeekUi();
	});

	media.addEventListener("ended", () => {
		updatePlayUi(false);
		stopRaf();
		syncSeekUi();
	});

	playBtn.addEventListener("click", () => {
		if (media.paused) {
			void media.play();
		} else {
			media.pause();
		}
	});

	seek.addEventListener("input", () => {
		const value = Number(seek.value);
		currentEl.textContent = formatTime(value);
		currentEl.dateTime = `PT${value}S`;
		seek.setAttribute("aria-valuenow", String(value));
		if (!media.paused) stopRaf();
	});

	seek.addEventListener("change", () => {
		media.currentTime = Number(seek.value);
		if (!media.paused) startRaf();
	});

	muteBtn.addEventListener("click", () => {
		media.muted = !media.muted;
		updateMuteUi(media.muted);
	});

	updatePlayUi(!media.paused);
	updateMuteUi(media.muted);
}

function initAudioCaptions(audio: HTMLAudioElement, figure: Element): void {
	if (!audio.querySelector("track")) return;
	const captions = figure.querySelector(".audio-captions");
	if (!captions) return;
	const track = audio.textTracks[0];
	if (!track) return;
	track.mode = "showing";
	track.addEventListener("cuechange", () => {
		const cue = track.activeCues?.[0];
		captions.textContent = cue instanceof VTTCue ? cue.text : "";
	});
}

export function initAudioPlayers(): void {
	document.querySelectorAll("figure.audio-player").forEach((figure) => {
		const chrome = figure.querySelector("[data-hosted-player]");
		const audio = figure.querySelector("audio");
		if (chrome instanceof HTMLElement && audio instanceof HTMLAudioElement) {
			initHostedMediaControls(audio, chrome);
		}
		if (audio instanceof HTMLAudioElement) {
			initAudioCaptions(audio, figure);
		}
	});
}

export function initVideoPlayers(): void {
	document.querySelectorAll("figure.video-player").forEach((figure) => {
		const chrome = figure.querySelector("[data-hosted-player]");
		const video = figure.querySelector("video");
		if (chrome instanceof HTMLElement && video instanceof HTMLVideoElement) {
			initHostedMediaControls(video, chrome);
		}
	});
}
