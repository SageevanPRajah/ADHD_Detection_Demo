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

export const FREEZE_VIDEO = "/body posture video/freezze.mp4";

export function pickAction() {
  return ACTIONS[Math.floor(Math.random() * ACTIONS.length)];
}
