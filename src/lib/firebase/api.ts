import { db } from "$lib/firebase/firebase";
import { doc, updateDoc, increment } from "firebase/firestore/lite";



/**
 * increment games played by 1, increment how many leafs collected
 * @param leaf how many leafs collected in this game
 */
export async function updateLeafUsage(leaf : number) {
    const docRef = doc(db, "game_stats/leaf");

    const payload = {
        gamesCompleted: increment(1),
        leafsCollected: increment(leaf)
    }
    await updateDoc(docRef, payload);
}