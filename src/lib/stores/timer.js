import { writable, derived, get } from 'svelte/store';

export const paused = writable(true);
export const minutes = writable('25');
export const seconds = writable('00');

let timerInterval = null;

export const totalTime = derived(
    [minutes, seconds],
    ([$minutes, $seconds]) => {
        const mins = parseInt($minutes) || 0;
        const secs = parseInt($seconds) || 0;
        return mins * 60 + secs;
    }
);

// Derived store to track remaining time in seconds for the active timer
export const remainingSeconds = writable(0);

export function toggleTimer() {
    const isPaused = get(paused);

    if (isPaused) {
        startTimer();
    } else {
        stopTimer();
    }
}

export function setTime({ minutes: newMinutes, seconds: newSeconds }) {
    // Stop timer when manually changing time
    if (!get(paused)) {
        stopTimer();
    }

    if (newMinutes !== undefined) {
        minutes.set(newMinutes);
    }
    if (newSeconds !== undefined) {
        seconds.set(newSeconds);
    }

    // Update remaining seconds when time is changed manually
    const currentMinutes = parseInt(get(minutes)) || 0;
    const currentSeconds = parseInt(get(seconds)) || 0;
    remainingSeconds.set(currentMinutes * 60 + currentSeconds);
}

function startTimer() {
    const currentMinutes = parseInt(get(minutes)) || 0;
    const currentSeconds = parseInt(get(seconds)) || 0;
    let totalSecondsRemaining = currentMinutes * 60 + currentSeconds;

    if (totalSecondsRemaining <= 0) {
        paused.set(true);
        return;
    }

    paused.set(false);
    remainingSeconds.set(totalSecondsRemaining);

    // Clear any existing interval
    if (timerInterval) {
        clearInterval(timerInterval);
    }

    timerInterval = setInterval(() => {
        totalSecondsRemaining--;
        remainingSeconds.set(totalSecondsRemaining);

        if (totalSecondsRemaining <= 0) {
            stopTimer();
            minutes.set('0');
            seconds.set('00');
            paused.set(true);
            remainingSeconds.set(0);
            // Optional: Add timer completion callback here
            // onTimerComplete?.();
            return;
        }

        const mins = Math.floor(totalSecondsRemaining / 60);
        const secs = totalSecondsRemaining % 60;

        minutes.set(mins.toString());
        seconds.set(secs < 10 ? `0${secs}` : secs.toString());
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    paused.set(true);
}

export function resetTimer() {
    stopTimer();
    paused.set(true);
    minutes.set('25');
    seconds.set('00');
    remainingSeconds.set(25 * 60);
}

export function cleanup() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}