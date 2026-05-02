// src/pages/Body Posture Tracking Game/GameController.jsx

export const ACTIONS = [
  {
    text: "Raise your hands high 🙌",
    video: "/body posture video/RaiseHands.mp4",
  },
  {
    text: "Touch your shoulders 🤷‍♂️",
    video: "/body posture video/TouchSholders.mp4",
  },
  {
    text: "Wave to the camera 👋",
    video: "/body posture video/WavesHands.mp4",
  },
  {
    text: "Clap your hands 👏",
    video: "/body posture video/Claps.mp4",
  },
];

export const FREEZE_VIDEO = "/body posture video/freeze_new.mp4";

// Bug #8 fix: shuffled-deck picker — all 4 actions appear before any repeats.
// Pure Math.random() could show the same action 3+ times in a row.
let deck = [];
export function pickAction() {
  if (deck.length === 0) {
    // Refill and shuffle when the deck is empty
    deck = [...ACTIONS].sort(() => Math.random() - 0.5);
  }
  return deck.pop();
}
