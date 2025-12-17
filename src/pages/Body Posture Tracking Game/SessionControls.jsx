import React from "react";

export default function SessionControls({
  childId,
  setChildId,
  age,
  setAge,
  group,
  setGroup,
  running,
  onStart,
  onStop,
}) {
  return (
    <div className="p-5 border bg-white/10 rounded-2xl border-white/20">
      <h3 className="mb-3 text-lg font-semibold">Session Details 📄</h3>

      <div className="space-y-3 text-black">
        <input
          className="w-full px-3 py-2 rounded-lg"
          placeholder="Child ID"
          value={childId}
          onChange={(e) => setChildId(e.target.value)}
        />

        <input
          className="w-full px-3 py-2 rounded-lg"
          placeholder="Age"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
        />

        <select
          className="w-full px-3 py-2 rounded-lg"
          value={group}
          onChange={(e) => setGroup(e.target.value)}
        >
          <option value="Unknown">Unknown</option>
          <option value="Control">Control</option>
          <option value="ADHD">ADHD</option>
        </select>
      </div>

      <div className="flex gap-3 mt-4">
        <button
          onClick={onStart}
          disabled={running}
          className={`flex-1 px-4 py-2 rounded-xl ${
            running
              ? "bg-gray-500"
              : "bg-green-400 hover:bg-green-300 text-black font-semibold"
          }`}
        >
          {running ? "Running..." : "Start"}
        </button>

        <button
          onClick={onStop}
          disabled={!running}
          className={`flex-1 px-4 py-2 rounded-xl ${
            running
              ? "bg-red-500 hover:bg-red-400"
              : "bg-gray-500 cursor-not-allowed"
          }`}
        >
          Stop
        </button>
      </div>
    </div>
  );
}
