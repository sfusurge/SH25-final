import { writable, derived } from 'svelte/store';


export const calmMusicLibrary = [
    //Calm music
    { title: "Never Meant", artist: "American Football", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/american_football_never_meant.mp3" },
    { title: "Improvisation", artist: "Anthi Bozoviti", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/anthi_bozoviti_improvisation.mp3" },
    { title: "Duvet", artist: "bôa", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/boa_duvet.mp3" },
    { title: "Strobe", artist: "deadmau5", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/deadmau5_strobe.mp3" },
    { title: "Ancient Memories", artist: "Derek Bell", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/derek_bell_ancient_memories.mp3" },
    { title: "Sugar, We're Goin Down", artist: "Fall Out Boy", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/fall_out_boy_sugar_were_going_down.mp3" },
    { title: "Pluto's Promise", artist: "G. Sancristoforo & T. Koumartzis", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/giorgio_sancristoforo_and_theodore_koumartzis_plutos_promise.mp3" },
    { title: "Lullaby", artist: "Giorgio Sancristoforo", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/giorgio_sancristoforo_lullaby.mp3" },
    { title: "Piccolo Notturno", artist: "Giorgio Sancristoforo", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/giorgio_sancristoforo_piccolo_notturno.mp3" },
    { title: "Ohio Is for Lovers", artist: "Hawthorne Heights", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/hawthorne_heights_ohio_is_for_lovers.mp3" },
    { title: "BCKYRD", artist: "Hot Mulligan", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/hot_mulligan_bckyrd.mp3" },
    { title: "Featuring Mark Hoppus", artist: "Hot Mulligan", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/hot_mulligan_featuring_mark_hoppus.mp3" },
    { title: "Breaking the Habit", artist: "Linkin Park", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/linkin_park_breaking_the_habit.mp3" },
    { title: "In the End", artist: "Linkin Park", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/linkin_park_in_the_end.mp3" },
    { title: "Apollo's Lyre", artist: "Michael Levy", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/michael_levy_apollos_lyre.mp3" },
    { title: "Lamentations of the Algea", artist: "Michael Levy", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/michael_levy_lamentations_of_the_algea.mp3" },
    { title: "Ode to Aura", artist: "Michael Levy", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/michael_levy_ode_to_aura.mp3" },
    { title: "The Serenity of Sentience", artist: "Michael Levy", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/michael_levy_the_serentity_of_sentience.mp3" },
    { title: "The Barbiton (Lyre of Sappho)", artist: "Seikilo", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/seikilo_the_barbiton_lyre_of_sappho.mp3" },
    { title: "With You, Friends", artist: "Skrillex", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/skrillex_with_you_friends.mp3" },
    { title: "Let Go", artist: "BTS", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/bts_let_go.mp3" },
    { title: "Ditto", artist: "NewJeans", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/newjeans_ditto.mp3" },
    { title: "Flower Dance", artist: "Faker", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/faker_flower_dance.mp3" },
    { title: "Glimpse of Us", artist: "Birru", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/birru_glimpse_of_us.mp3" },
    { title: "Unravel", artist: "TK from Ling Tosite Sigure", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/tokyo_ghoul_unravel.mp3" },
    { title: "Fly Me to the Moon", artist: "Frank Sinatra", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/frank_sinatra_fly_me_to_the_moon.mp3" },
    { title: "Here I Am", artist: "Boys Planet", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/boys_planet_here_i_am.mp3" },
    { title: "From the Start", artist: "Laufey", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/laufey_from_the_start.mp3" },
    { title: "Half Moon", artist: "DEAN", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/dean_d_half_moon.mp3" },
    { title: "Sway", artist: "Michael Bublé", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/michael_bubly_sway.mp3" },
    { title: "Everything Goes On", artist: "Porter Robinson", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/porter_robinson_everything_goes_on.mp3" },
    { title: "Shelter", artist: "Porter Robinson & Madeon", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Calm%20Music/porter_robinson_and_madeon_shelter.mp3" },
];

export const epicMusicLibrary = [
    { title: "EPIC: The Musical – The Circe Saga", artist: "EPIC: The Musical", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Epic%20Music/epic_the_musical%20_the_circe_saga.mp3" },
    { title: "EPIC: The Musical – The Cyclops Saga", artist: "EPIC: The Musical", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Epic%20Music/epic_the_musical%20_the_cyclops_saga.mp3" },
    { title: "EPIC: The Musical – The Ithaca Saga", artist: "EPIC: The Musical", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Epic%20Music/epic_the_musical%20_the_ithaca_saga.mp3" },
    { title: "EPIC: The Musical – The Ocean Saga", artist: "EPIC: The Musical", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Epic%20Music/epic_the_musical%20_the_ocean_saga.mp3" },
    { title: "EPIC: The Musical – The Thunder Saga", artist: "EPIC: The Musical", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Epic%20Music/epic_the_musical%20_the_thunder_saga.mp3" },
    { title: "EPIC: The Musical – The Troy Saga", artist: "EPIC: The Musical", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Epic%20Music/epic_the_musical%20_the_troy_saga.mp3" },
    { title: "EPIC: The Musical – The Underworld Saga", artist: "EPIC: The Musical", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Epic%20Music/epic_the_musical%20_the_underworld_saga.mp3" },
    { title: "EPIC: The Musical – The Wisdom Saga", artist: "EPIC: The Musical", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Epic%20Music/epic_the_musical%20_the_wisdom_saga.mp3" },
    { title: "Apple Seed", artist: "Hiroyuki Sawano", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Epic%20Music/hiroyuki_sawano_apple_seed.mp3" }
];

export const specialMusicLibrary = [
    { title: "I NEED U", artist: "BTS", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Special%20Music/bts_i_need_u.mp3" },
    { title: "Minecraft", artist: "C418", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Special%20Music/c418_minecraft.mp3" },
    { title: "Cherry Wine", artist: "grentperez", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Special%20Music/grentperez_cherry_wine.mp3" },
    { title: "Hollow", artist: "Stray Kids", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Special%20Music/hollow_stray_kids.mp3" },
    { title: "beside you", artist: "keshi & Madeon", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Special%20Music/keshi_madeon_beside_you.mp3" },
    { title: "soft spot", artist: "keshi", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Special%20Music/keshi_soft_spot.mp3" },
    { title: "You'll Be in My Heart", artist: "NIKI", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Special%20Music/niki_youll_be_in_my_heart.mp3" },
    { title: "Free", artist: "RUMI & JINU", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Special%20Music/rumi_and_jinu_free.mp3" },
    { title: "Shizukana", artist: "Unknown", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Special%20Music/Shizukana.mp3" },
    { title: "Blue", artist: "yung kai", file: "https://x9bwborp6xanhdzl.public.blob.vercel-storage.com/Special%20Music/yung_kai_blue.mp3" },
];

export const ambianceLibrary = [
    //Ambiance
    { title: "Heavy Rain", artist: "Ambience", file: "/audio/Ambiance/heavy_rain.mp3" },
    { title: "Light Rain", artist: "Ambience", file: "/audio/Ambiance/light_rain.mp3" },
    { title: "Raining on Multiple Surfaces (Mix)", artist: "Ambience", file: "/audio/Ambiance/raining_on_multiple_surfaces_mix.mp3" },
    { title: "Gentle Ocean Waves", artist: "Ambience", file: "/audio/Ambiance/gentle_ocean_waves.mp3" },
    { title: "Gentle Ocean Waves with Birdsong & Gulls", artist: "Ambience", file: "/audio/Ambiance/gentle_ocean_waves_birdsong_and_gull.mp3" },
    { title: "Ocean Waves", artist: "Ambience", file: "/audio/Ambiance/ocean_waves.mp3" },
    { title: "Burning Fireplace (Crackling Fire)", artist: "Ambience", file: "/audio/Ambiance/burning_fireplace_crackling_fire.mp3" },
    { title: "Nighttime Outdoor Fireplace", artist: "Ambience", file: "/audio/Ambiance/nighttime_outdoor_fireplace.mp3" },
    { title: "Coffee Shop Ambience", artist: "Ambience", file: "/audio/Ambiance/cofee_shop_ambience.mp3" }, // filename kept as-is
    { title: "Museum Café", artist: "Ambience", file: "/audio/Ambiance/museum_cafe.mp3" },
];

// Music library options mapping
export const musicLibOptions = {
    calm: calmMusicLibrary,
    epic: epicMusicLibrary,
    special: specialMusicLibrary,
    ambiance: ambianceLibrary,
};

// Utility function for shuffling arrays
function shuffleArr(arr) {
    const shuffled = [...arr]; // Create a copy to avoid mutating original
    for (let i = shuffled.length - 1; i > -1; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[j], shuffled[i]] = [shuffled[i], shuffled[j]];
    }
    return shuffled;
}

// Music player stores
export const trackIndex = writable(0);
export const currentLibType = writable('calm');

// Internal music library store (shuffled)
const _musicLib = writable(shuffleArr(musicLibOptions.calm));

// Derived store for reading music library
export const musicLib = derived(_musicLib, ($lib) => $lib);

// Function to change music library (equivalent to the Jotai atom setter)
export function setMusicLibrary(variant) {
    if (musicLibOptions[variant]) {
        const newLib = shuffleArr(musicLibOptions[variant]);
        _musicLib.set(newLib);
        trackIndex.set(0);
        currentLibType.set(variant);
    }
}

// Derived store for current track
export const currentTrack = derived(
    [musicLib, trackIndex],
    ([$musicLib, $trackIndex]) => $musicLib[$trackIndex]
);

// Derived stores for current track info
export const currentTrackTitle = derived(currentTrack, ($track) => $track?.title || '');
export const currentTrackArtist = derived(currentTrack, ($track) => $track?.artist || '');