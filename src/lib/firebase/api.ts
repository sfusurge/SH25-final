import { db } from "$lib/firebase/firebase";
import { doc, updateDoc, increment, setDoc, FieldValue } from "firebase/firestore/lite";



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