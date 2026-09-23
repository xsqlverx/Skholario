"use client";

import React, { useState, useEffect } from "react";
import { useStudyHub } from "@/lib/store";
import { playSuccessChime, playTickSound, startAmbientNoise, stopAmbientNoise, setAmbientVolume } from "@/lib/audio";
import { fireCelebrationConfetti } from "@/lib/confetti";
import { Play, Pause, RotateCcw, Volume2, VolumeX, CloudRain, Wind, Radio, Sparkles, CheckCircle2, Headphones } from "lucide-react";
import { cn } from "@/lib/utils";

type TimerMode = "pomodoro" | "shortBreak" | "longBreak";

const MODE_TIMES: Record<TimerMode, number> = {
  pomodoro: 25 * 60,
  shortBreak: 5 * 60,
  longBreak: 15 * 60,
};

export function PomodoroTimer() {
  const { buddies, incrementStudyMinutes } = useStudyHub();
  const [mode, setMode] = useState<TimerMode>("pomodoro");
  const [timeLeft, setTimeLeft] = useState<number>(MODE_TIMES.pomodoro);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [ambientType, setAmbientType] = useState<"off" | "rain" | "whitenoise" | "drone">("off");
  const [volume, setVolume] = useState<number>(0.2);
  const [completedSessions, setCompletedSessions] = useState<number>(3);

  // Timer interval
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            // Timer finished!
            setIsRunning(false);
            playSuccessChime();
            fireCelebrationConfetti();
            if (mode === "pomodoro") {
              setCompletedSessions((c) => c + 1);
              incrementStudyMinutes(25);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, mode, incrementStudyMinutes]);

  const switchMode = (newMode: TimerMode) => {
    setMode(newMode);
    setTimeLeft(MODE_TIMES[newMode]);
    setIsRunning(false);
  };

  const toggleTimer = () => {
    playTickSound();
    setIsRunning(!isRunning);
  };

  const resetTimer = () => {
    setTimeLeft(MODE_TIMES[mode]);
    setIsRunning(false);
  };

  const handleAmbientChange = (type: "off" | "rain" | "whitenoise" | "drone") => {
    setAmbientType(type);
    if (type === "off") {
      stopAmbientNoise();
    } else {
      startAmbientNoise(type, volume);
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    setAmbientVolume(newVol);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const progressPercent = ((MODE_TIMES[mode] - timeLeft) / MODE_TIMES[mode]) * 100;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left 2 Cols: Timer & Audio Controls */}
      <div className="lg:col-span-2 space-y-6">
        {/* Main Timer Card */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-b from-slate-900/90 to-slate-950 p-6 md:p-8 shadow-2xl backdrop-blur-md">
          {/* Ambient Glow */}
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-pink-600/10 blur-3xl pointer-events-none" />

          {/* Mode Switcher Tabs */}
          <div className="flex items-center justify-center gap-2 mb-8">
            <button
              onClick={() => switchMode("pomodoro")}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                mode === "pomodoro"
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              )}
            >
              Focus Session (25m)
            </button>
            <button
              onClick={() => switchMode("shortBreak")}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                mode === "shortBreak"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              )}
            >
              Short Break (5m)
            </button>
            <button
              onClick={() => switchMode("longBreak")}
              className={cn(
                "rounded-xl px-4 py-2 text-xs font-bold transition-all cursor-pointer",
                mode === "longBreak"
                  ? "bg-purple-600 text-white shadow-lg shadow-purple-600/30"
                  : "bg-slate-800/80 text-slate-400 hover:text-white"
              )}
            >
              Long Break (15m)
            </button>
          </div>

          {/* Digital Clock Display */}
          <div className="flex flex-col items-center justify-center my-6">
            <div className="text-7xl md:text-8xl font-black tracking-tight text-white font-mono drop-shadow-md">
              {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
            </div>
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-400">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>
                {mode === "pomodoro"
                  ? "Deep work mode active • Silence notifications"
                  : "Relax your eyes & stretch"}
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 mb-8 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Timer Controls */}
          <div className="flex items-center justify-center gap-4">
            <button
              onClick={toggleTimer}
              className={cn(
                "flex items-center justify-center gap-2 rounded-2xl px-8 py-3.5 text-base font-bold shadow-xl transition-all cursor-pointer transform active:scale-95",
                isRunning
                  ? "bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-amber-500/20"
                  : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-600/30"
              )}
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5 fill-current" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 fill-current" />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              onClick={resetTimer}
              className="rounded-2xl border border-slate-700 bg-slate-800/80 p-3.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-all cursor-pointer"
              title="Reset Timer"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
          </div>

          {/* Completed streak counter */}
          <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400 border-t border-slate-800/60 pt-4">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Today&apos;s Focus Sprints: <strong className="text-white">{completedSessions} completed</strong></span>
          </div>
        </div>

        {/* Ambient Soundscape Synthesizer */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-sm font-bold text-white">
              <Headphones className="h-4 w-4 text-indigo-400" />
              <span>Procedural Ambient Soundscapes</span>
              <span className="rounded bg-indigo-500/20 px-1.5 py-0.5 text-[10px] text-indigo-300 font-semibold">Web Audio Synth</span>
            </div>
            {ambientType !== "off" && (
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                Playing Soundscape
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
            <button
              onClick={() => handleAmbientChange("off")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-semibold border transition-all cursor-pointer",
                ambientType === "off"
                  ? "border-slate-600 bg-slate-800 text-white"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800"
              )}
            >
              <VolumeX className="h-4 w-4" />
              <span>Mute</span>
            </button>

            <button
              onClick={() => handleAmbientChange("rain")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-semibold border transition-all cursor-pointer",
                ambientType === "rain"
                  ? "border-blue-500 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/10"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800"
              )}
            >
              <CloudRain className="h-4 w-4 text-blue-400" />
              <span>Cozy Rain</span>
            </button>

            <button
              onClick={() => handleAmbientChange("whitenoise")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-semibold border transition-all cursor-pointer",
                ambientType === "whitenoise"
                  ? "border-purple-500 bg-purple-500/20 text-purple-300 shadow-lg shadow-purple-500/10"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800"
              )}
            >
              <Wind className="h-4 w-4 text-purple-400" />
              <span>White Noise</span>
            </button>

            <button
              onClick={() => handleAmbientChange("drone")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-xl p-3 text-xs font-semibold border transition-all cursor-pointer",
                ambientType === "drone"
                  ? "border-pink-500 bg-pink-500/20 text-pink-300 shadow-lg shadow-pink-500/10"
                  : "border-slate-800 bg-slate-900 text-slate-400 hover:bg-slate-800"
              )}
            >
              <Radio className="h-4 w-4 text-pink-400" />
              <span>Lo-Fi Drone</span>
            </button>
          </div>

          {/* Volume Slider */}
          {ambientType !== "off" && (
            <div className="flex items-center gap-3 pt-2">
              <Volume2 className="h-4 w-4 text-slate-400" />
              <input
                type="range"
                min="0.01"
                max="0.8"
                step="0.01"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <span className="text-xs text-slate-400 font-mono w-8">{Math.round(volume * 100)}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Right Col: Active Friends Studying */}
      <div className="space-y-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-white">Study Room Presence</h3>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs text-emerald-400 font-semibold border border-emerald-500/20">
              {buddies.length} online
            </span>
          </div>

          <div className="space-y-3">
            {buddies.map((buddy) => (
              <div
                key={buddy.id}
                className="flex items-start gap-3 rounded-xl border border-slate-800/80 bg-slate-950/50 p-3 hover:border-slate-700 transition-all"
              >
                <div className="relative">
                  <img
                    src={buddy.avatar}
                    alt={buddy.name}
                    className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-800"
                  />
                  <span
                    className={cn(
                      "absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900",
                      buddy.status === "focusing" ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white truncate">{buddy.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{buddy.timeStudyingMinutes}m</span>
                  </div>
                  <div className="text-[11px] font-semibold text-indigo-400">{buddy.currentCourse}</div>
                  <div className="text-[11px] text-slate-400 truncate">{buddy.currentTopic}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 p-3 text-center">
            <p className="text-xs text-indigo-300 font-medium">Studying together boosts focus by up to 40%!</p>
          </div>
        </div>
      </div>
    </div>
  );
}
