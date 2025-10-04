import { db } from "$lib/firebase/firebase";
import { doc, updateDoc, increment, setDoc, FieldValue, getDoc } from "firebase/firestore/lite";



/**
 * increment games played by 1, increment how many leafs collected
 * @param leaf how many leafs collected in this game
 */
export async function updateLeafUsage(leaf: number) {
    const docRef = doc(db, "game_stats/leaf");

    const payload = {
        gamesCompleted: increment(1),
        leafsCollected: increment(leaf)
    }
    // setDoc with merge is a "upsert"
    // update existing doc if exist, make the doc if not
    await setDoc(docRef, payload, { merge: true });
}

export async function updateComicUsage(title: string, type: "view" | "finish") {
    const docRef = doc(db, `site_stats/${title}`);

    const payload: { [key: string]: FieldValue } = {};
    if (type === "view") {
        payload["view"] = increment(1);
    } else {
        payload["finished"] = increment(1);
    }

    await setDoc(docRef, payload, { merge: true });
}

export async function updateMusicStats() {
    const docRef = doc(db, `site_stats/music`);
    const payload = {
        songsPlayed: increment(1)
    }

    await setDoc(docRef, payload, { merge: true });
}

export async function updateRhythmSessions() {
    const docRef = doc(db, "game_stats/rhythm");

    const payload = {
        playSessions: increment(1)
    }
    await setDoc(docRef, payload, { merge: true });
}

export async function updateRhythmBeatsBeaten(beats: number) {
    const docRef = doc(db, "game_stats/rhythm");

    const payload = {
        beatsBeaten: increment(beats)
    }
    await setDoc(docRef, payload, { merge: true });
}

interface MazeStats {
    score: number;
    enemiesKilled: number;
    scrollsCollected: number;
    trapsTriggered: number;
    roomsCleared: number;
    timeMs: number;
    won: boolean;
}

export async function updateMazeStats(stats: MazeStats) {
    const docRef = doc(db, "game_stats/maze");

    const payload: { [key: string]: FieldValue | number } = {
        totalGames: increment(1),
        totalScore: increment(stats.score),
        totalEnemiesKilled: increment(stats.enemiesKilled),
        totalScrollsCollected: increment(stats.scrollsCollected),
        totalTrapsTriggered: increment(stats.trapsTriggered),
        totalRoomsCleared: increment(stats.roomsCleared)
    };

    if (stats.won) {
        payload.gamesWon = increment(1);
    }
    else {
        payload.gamesLost = increment(1);
    }

    payload.totalTimePlayed = increment(stats.timeMs);

    await setDoc(docRef, payload, { merge: true });

    // Track high score and fastest run separately (only if better)
    if (stats.won) {
        const highScoreDocRef = doc(db, "game_stats/maze_records");
        const recordsSnap = await getDoc(highScoreDocRef);
        const records = recordsSnap.exists() ? recordsSnap.data() : {};

        const updatePayload: { [key: string]: number } = {};
        if (!records.highScore || stats.score > records.highScore) {
            updatePayload.highScore = stats.score;
        }
        if (!records.fastestRunMs || stats.timeMs < records.fastestRunMs) {
            updatePayload.fastestRunMs = stats.timeMs;
        }

        if (Object.keys(updatePayload).length > 0) {
            await setDoc(highScoreDocRef, updatePayload, { merge: true });
        }
    }
}