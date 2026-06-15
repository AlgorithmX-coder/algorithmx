"use client";

/**
 * AlgorithmX Cinematic Engine — shared keyframe library.
 *
 * One `<JuiceKeyframes />` component carrying every `@keyframes` and
 * animation utility class the cinematic scenes share. Mount it ONCE per
 * scene (e.g. at the top of the scene body) and every juice helper +
 * scene-local element can reference the keyframes by name.
 *
 * These are the keyframes the Password Vault previously defined inline
 * via styled-jsx (`SceneStyles`), renamed to a neutral `cine*` prefix so
 * they belong to the engine rather than one scene. The legacy vault keeps
 * its own `vault*` keyframes until it is retired, so there is no clash.
 */

export function JuiceKeyframes() {
  return (
    <style jsx global>{`
      @keyframes cineLockPulse {
        0%, 100% { opacity: 0.55; transform: scale(1); }
        50%      { opacity: 0.95; transform: scale(1.08); }
      }
      @keyframes cineSpark {
        0%   { opacity: 1; transform: scale(0.6); }
        100% { opacity: 0; transform: scale(2.2); }
      }
      @keyframes cineBeamIn {
        0%   { opacity: 0; transform: rotate(var(--ang, 0deg)) scaleX(0); }
        60%  { opacity: 1; transform: rotate(var(--ang, 0deg)) scaleX(1); }
        100% { opacity: 0.85; transform: rotate(var(--ang, 0deg)) scaleX(1); }
      }
      @keyframes cineReject {
        0%   { opacity: 0; transform: scale(0.9); }
        30%  { opacity: 0.95; transform: scale(1.02); }
        100% { opacity: 0; transform: scale(1); }
      }
      @keyframes cineShakeMd {
        0%, 100% { transform: translate(0, 0); }
        20%  { transform: translate(-2px, 1px); }
        40%  { transform: translate(2px, -1px); }
        60%  { transform: translate(-1px, 2px); }
        80%  { transform: translate(1px, -2px); }
      }
      @keyframes cineShakeLg {
        0%, 100% { transform: translate(0, 0); }
        15%  { transform: translate(-5px, 3px); }
        30%  { transform: translate(5px, -3px); }
        45%  { transform: translate(-3px, 5px); }
        60%  { transform: translate(4px, -4px); }
        75%  { transform: translate(-4px, -2px); }
      }
      .cine-shake-md { animation: cineShakeMd 180ms ease-in-out infinite; }
      .cine-shake-lg { animation: cineShakeLg 90ms ease-in-out infinite; }

      @keyframes cineStream {
        0%   { transform: translateY(-100%); }
        100% { transform: translateY(100%); }
      }
      @keyframes cineDialSpin {
        from { transform: rotate(0); }
        to   { transform: rotate(360deg); }
      }
      @keyframes cineRaysSpin {
        from { transform: rotate(0deg); }
        to   { transform: rotate(360deg); }
      }
      @keyframes cineShieldFloat {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-10px); }
      }
      @keyframes cineShaftDrift {
        0%, 100% { opacity: 0.85; filter: blur(8px); }
        50%      { opacity: 0.6;  filter: blur(11px); }
      }
      @keyframes cineCoreAura {
        0%, 100% { transform: scale(1);    opacity: 0.95; }
        50%      { transform: scale(1.08); opacity: 0.7;  }
      }
      @keyframes cineArtifactBob {
        0%, 100% { transform: translateY(0); }
        50%      { transform: translateY(-5px); }
      }
      @keyframes cineSparkleRise {
        0%   { opacity: 0; transform: translateY(0) scale(0.6); }
        15%  { opacity: 1; }
        90%  { opacity: 1; }
        100% { opacity: 0; transform: translateY(-340px) scale(1.1); }
      }
    `}</style>
  );
}
