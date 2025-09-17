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
            imageSrc: string;
            content: string;
        }[];
    };
}

// Maze game configuration
export const mazeGameConfig: GameSlideConfig = {
    instructions: {
        title: "Maze Instructions",
        slides: [
            {
                imageSrc: "/assets/experiences/leaf/starting_modal/start_1.png",
                content:
                    "<strong>Welcome to the Maze Adventure!</strong><br><br>Navigate through the maze using the arrow keys or on-screen controls. Your goal is to find the exit while avoiding traps and enemies.",
            },
            {
                imageSrc: "/assets/experiences/leaf/starting_modal/start_2.png",
                content:
                    "<strong>Movement Controls:</strong><br><br>Use <strong>ARROW KEYS</strong> or <strong>WASD</strong> on desktop.<br>On mobile, use the <strong>touch controls</strong> that appear on screen.",
            },
            {
                imageSrc: "/assets/experiences/leaf/starting_modal/start_3.png",
                content:
                    "<strong>Watch out for hazards!</strong><br><br>Avoid traps and enemies as you navigate. Some areas may have special mechanics - explore carefully to find the safest path.",
            },
        ],
    },
    ending: {
        title: "Maze Complete!",
        slides: [
            {
                imageSrc: "/assets/experiences/leaf/ending_modal/image.png",
                content: `<strong>Congratulations!</strong><br><br>You successfully navigated the maze and completed your adventure! Well done on reaching the exit.`,
            },
        ],
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
        slides: [
            {
                imageSrc: "/path/to/ending/image.png",
                content: "<strong>Game completed!</strong><br><br>Congratulations!",
            },
        ],
    },
};