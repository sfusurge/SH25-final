// Game slide content configurations and helper functions
export interface GameSlideConfig {
    instructions: {
        title: string;
        slides: {
            imageSrc: string;
            content: string;
        }[];
    };
    ending: {
        title: string;
        slides: {
            win?: {
                imageSrc: string;
                content: string;
            }[];
            lose?: {
                imageSrc: string;
                content: string;
            }[];
            default?: {
                imageSrc: string;
                content: string;
            }[];
        };
    };
}

// Maze game configuration 
export const mazeGameConfig: GameSlideConfig = {
    instructions: {
        title: "The Maze",
        slides: [
            {
                imageSrc: "/maze/slides/maze.png",
                content:
                    "<strong><em>WELCOME TO THE MAZE!</em></strong><br><br>Navigate through <strong>5 floors</strong>, finding the exit door to progress<br>If you find a room with a door, defeat the enemies inside to unlock it<br>Enemies get stronger as you progress, <strong>so be prepared</strong>!<br>",
            },
            {
                imageSrc: "/maze/slides/controls.png",
                content:
                    "<strong><em>CONTROLS</em></strong><br><br>Desktop: Use <strong>WASD</strong> to move and <strong>ARROW KEYS</strong> to shoot/aim<br><br>Mobile: Touch the left/right sides, and <strong>JOYSTICKS</strong> will appear to move/aim",
            },
            {
                imageSrc: "/maze/slides/what.png",
                content:
                    "Points are awarded for:<br>• Defeating enemies<br>• Clearing rooms<br>• Completing floors<br><em>Score system coming soon!</em>",
            },
            {
                imageSrc: "/maze/slides/scroll.png",
                content:
                    "<strong><em>SCROLL EFFECTS</em></strong>: Golden scrolls = permanent effects!<br><strong>Multishot: Extra Spread Projectiles</strong> (stackable)<br><strong>Shield: Temporary Immunity From Enemies</strong> (instant)<br><strong>Heal: +2 Health</strong> (instant)<br><strong>Explosion: Area Damage To All Room Enemies</strong> (instant)",
            },
            {
                imageSrc: "/maze/slides/golden_scroll.png",
                content:
                    "<strong>Rapid Fire: Fire Rate Up</strong> (permanent)<br><strong>Fleetfoot: Movement Speed Up</strong> (permanent)<br><strong>Longshot: Projectile Range Up</strong> (permanent)<br><strong>Strength: Damage Increased</strong> (permanent)<br><strong>Vitality: Max Health +1</strong> (permanent)<br>",
            },
            {
                imageSrc: "/maze/slides/trap.png",
                content:
                    "<strong><em>TRAP EFFECTS</em></strong>: Watch out!<br><strong>Spikes: -1 Health</strong> (instant)<br><strong>Burdened: Slow Movement</strong> (stackable)<br><strong>Sluggish: Slow Shooting</strong> (unstackable)<br><strong>Weakened: Reduced Attack Power</strong> (unstackable)",
            },
        ],
    },
    ending: {
        title: "Maze Complete!",
        slides: {
            win: [
                {
                    imageSrc: "/maze/door_open.webp",
                    content: `You have conquered all 5 floors of the maze!<br>Your bravery and skill have led you through countless dangers<br>to emerge triumphant.<br>The realm is safe thanks to you, champion!<br>`,
                },
            ],
            lose: [
                {
                    imageSrc: "/maze/door_locked.webp",
                    content: `The maze has claimed another adventurer.<br>Your journey ends here, but the path remains open<br>for those brave enough to try again.<br>Will you face the challenge once more?<br>`,
                },
            ],
            default: [
                {
                    imageSrc: "/maze/scroll.webp",
                    content: `Your adventure through the maze has concluded.<br>Whether by triumph or defeat, you have tested<br>your mettle against its challenges.<br>The maze awaits your return...<br>`,
                },
            ],
        },
    },
};

export const rhythmGameConfig: GameSlideConfig = {
    instructions: {
        title: "Rhythm of the Kingdom",
        slides: [
            {
                imageSrc: "/rhythm/instructions1.png",
                content:
                    "<br>Perform the most divine ballad in all the realms! <strong>Land every note with perfect rhythm and win the hearts of your audience</strong>.",
            },
            {
                imageSrc: "/rhythm/instructions2.png",
                content:
                    "Each beat appears as a colored cloud. <strong>Click the ASD or JKL keys/Tap the matching color-coded button at the right moment to strike the beat</strong> and keep the rhythm flowing!",
            },
            {
                imageSrc: "/rhythm/instructions3.png",
                content:
                    "Each cloud carries its own rhythm. <strong>Look at the symbol and shape of the cloud</strong> to see how long to hold the note, then hit the matching color-coded button in time!",
            },
        ],
    },
    ending: {
        title: "Game Over!",
        slides: {
            win: [
                {
                    imageSrc: "/rhythm/best.png",
                    content: `Nice work! Your timing was on point.`,
                },
            ],
            lose: [
                {
                    imageSrc: "/rhythm/lose.png",
                    content: `The audience was left unmoved, better luck next time ...`,
                },
            ],
            default: [
                {
                    imageSrc: "/rhythm/neutral.png",
                    content: `Nice work! Your timing was on point.`,
                },
            ],
        },
    },
};

// Helper function to create action buttons for different game states
export function createGameActionButton(
    type: "start" | "continue" | "restart",
    action: () => void,
    isRunning?: boolean
): { text: string; action: () => void; className?: string } {
    switch (type) {
        case "start":
            return {
                text: isRunning ? "Continue Game" : "Start Game",
                action,
                className: "action-button",
            };
        case "continue":
            return {
                text: "Continue Game",
                action,
                className: "action-button",
            };
        case "restart":
            return {
                text: "Play Again",
                action,
                className: "action-button",
            };
        default:
            return {
                text: "OK",
                action,
                className: "action-button",
            };
    }
}

// gpt generated example game config lol
export const exampleGameConfig: GameSlideConfig = {
    instructions: {
        title: "Game Instructions",
        slides: [
            {
                imageSrc: "/path/to/instruction/image.png",
                content: "<strong>How to play:</strong><br><br>Your instructions here...",
            },
        ],
    },
    ending: {
        title: "Game Over!",
        slides: {
            default: [
                {
                    imageSrc: "/path/to/ending/image.png",
                    content: "<strong>Game completed!</strong><br><br>Congratulations!",
                },
            ],
        },
    },
};