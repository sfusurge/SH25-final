import { writable, derived, get } from 'svelte/store';

export const paused = writable(true);
export const minutes = writable('25');
export const seconds = writable('00');

let timerInterval = null;
let totalSeconds = 0;

export const totalTime = derived(
    [minutes, seconds],
    ([$minutes, $seconds]) => {
        const mins = parseInt($minutes) || 0;
        const secs = parseInt($seconds) || 0;
        return mins * 60 + secs;
    }
);

export function toggleTimer() {
    const isPaused = get(paused);

    if (isPaused) {
        startTimer();
        paused.set(false);
    } else {
        stopTimer();
        paused.set(true);
    }
}

export function setTime({ minutes: newMinutes, seconds: newSeconds }) {
    // Stop timer when manually changing time
    if (!get(paused)) {
        stopTimer();
        paused.set(true);
    }

    if (newMinutes !== undefined) {
        minutes.set(newMinutes);
    }
    if (newSeconds !== undefined) {
        seconds.set(newSeconds);
    }
}

function startTimer() {
    // Use get() to read current values without creating subscriptions
    const currentMinutes = parseInt(get(minutes)) || 0;
    const currentSeconds = parseInt(get(seconds)) || 0;

    totalSeconds = currentMinutes * 60 + currentSeconds;

    if (totalSeconds <= 0) {
        paused.set(true);
        return;
    }

    // Clear any existing interval
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        totalSeconds--;

        if (totalSeconds <= 0) {
            stopTimer();
            minutes.set('0');
            seconds.set('00');
            paused.set(true);
            // Optional: Add timer completion callback here
            // onTimerComplete?.();
            return;
        }

        const mins = Math.floor(totalSeconds / 60);
        const secs = totalSeconds % 60;

        minutes.set(mins.toString());
        seconds.set(secs < 10 ? `0${secs}` : secs.toString());
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

export function resetTimer() {
    stopTimer();
    paused.set(true);
    minutes.set('25');
    seconds.set('00');
    totalSeconds = 0;
}

