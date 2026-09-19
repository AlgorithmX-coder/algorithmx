"use client";

import { useEffect, useRef, useState } from "react";

/**
 * SchoolsGlobe: the environment behind /schools and /schools/login.
 *
 * Britain lit on a globe of code, sending lessons out along arcs of light to
 * the places British schools teach: Dubai, Singapore, Madrid, Nairobi, Sydney
 * and the rest. What travels along each arc is real code from this repository,
 * one character at a time; when it lands, the school pin turns green and names
 * its city. It says "built in the UK, for UK and British schools worldwide"
 * before a word of the page is read.
 *
 * Deliberately no counter and no class codes: we are not claiming a number of
 * schools we do not have.
 *
 * Drawn entirely in the browser. No map image, no 3D library: coastlines are
 * coarse lat/lon polygons sampled onto a dot grid once per size, and the arcs
 * are great circles (slerp) lifted off the surface. The globe sways around
 * London rather than spinning, so Britain never rotates out of view.
 *
 * Accessibility: a "Pause animation" control (WCAG 2.2.2) stops the loop and
 * is remembered across visits; it starts paused under prefers-reduced-motion.
 *
 * School hardware: 30 fps cap, devicePixelRatio capped at 1.5, pre-rendered
 * glow sprites, the sky in CSS so it paints before hydration, and the loop
 * stops on hidden tabs. Fixed, pointer-events: none, z-index: -1.
 */

const D2R = Math.PI / 180;
const FRAME_MS = 1000 / 30;
const MOTION_KEY = "ax-schools-motion";
const TILT = 20 * D2R; // camera latitude with Britain facing us
const LIFT = 50 * D2R; // how far the camera climbs as Britain swings away
const SPIN = (2 * Math.PI) / 100; // one revolution, in radians per second
const FLIGHT = 0.28; // arc progress per second: a lesson crosses in ~3.6s

/** Real lines from this codebase: the cargo on every arc. */
const CODE =
  'const lesson = await loadWeek(5); if (safe) award("phishing-spotter"); teacher.sync(classroom); ';

/*
 * Coastlines: Natural Earth 110m land, outer rings only, simplified to about
 * half a degree and stripped of anything smaller than a dot. Antarctica is
 * left out, since the sampled band stops at 56S. [lat, lon] to match vec().
 */
const LAND: number[][][] = [
  [
    [77,107], [75.8,114.1], [74.2,109.4], [73,123.2], [73.7,123.3], [73.6,127], [70.8,131.3], [71.8,132.3],
    [71.5,139.9], [72.4,139.1], [72.8,140.5], [72.2,149.5], [70.8,153], [70.9,159], [69.4,160.9], [69.6,167.8],
    [68.7,169.6], [69,170.8], [70.1,170.5], [69.4,178.6], [69,180], [65,180], [64.6,177.4], [62.6,179.5],
    [61.7,173.7], [59.9,170.3], [60.6,168.9], [59.9,163.5], [58.2,162], [57.6,163.2], [54.9,162.1], [54.3,160.4],
    [51,156.8], [55.4,155.4], [56.8,155.9], [61.1,163.7], [62.6,164.5], [60.5,160.1], [61.8,159.3], [61.4,156.7],
    [59.8,154.2], [59.1,155], [59,142.2], [54.7,135.1], [53.8,138.2], [54.2,139.9], [52.2,141.4], [48.4,140.1],
    [46.3,138.2], [43.4,134.9], [43.3,132.3], [39.8,127.5], [36.8,129.5], [35.1,129.1], [34.4,126.5], [36.7,126.1],
    [36.9,126.9], [38.1,124.7], [39.6,125.3], [38.9,121.1], [40.4,122.2], [40.9,121.6], [39.2,118], [38.7,117.5],
    [37.4,118.9], [37.5,122.4], [34.9,119.2], [31.7,121.9], [28.2,121.7], [24.5,118.7], [22.8,115.9], [21.4,110.8],
    [20.3,110.4], [21.7,108.5], [19.8,105.9], [13.4,109.3], [11.7,109.2], [8.6,105.2], [9.9,105.1], [13.4,100.1],
    [9.2,99.2], [5.5,103], [1.3,104.2], [2.8,101.4], [6.5,100.1], [7.8,98.3], [11.4,98.8], [16.9,97.2],
    [15.7,95.4], [16,94.2], [18.2,94.3], [22.8,91.4], [21.5,87], [20.2,86.5], [15.9,80.3], [10.4,79.9],
    [8,77.5], [16,73.5], [21.4,72.6], [20.9,70.5], [25.4,66.4], [25.7,57.4], [27.1,56.5], [26.5,54.7],
    [27.9,51.5], [30.1,50.1], [30,48], [24.8,50.8], [25.8,51.6], [24,51.8], [24.1,54], [26.4,56.4],
    [24.2,56.8], [22.3,59.8], [18.9,57.7], [17.2,55.3], [14,48.7], [12.6,43.5], [16.8,42.6], [21.3,39.1],
    [23.7,38.5], [28.1,34.6], [29.5,34.9], [27.6,33.9], [29.9,32.4], [23.1,35.5], [22,36.9], [18.6,37.5],
    [12.4,43.3], [11.7,42.7], [10.4,44.6], [12,51.1], [10.6,51], [4.2,47.7], [-2.6,40.3], [-4.7,39.2],
    [-6.5,38.8], [-10.8,40.5], [-14.7,40.8], [-16.7,39.5], [-19.8,34.8], [-23.7,35.6], [-25.7,32.6], [-28.8,32.2],
    [-32.8,28.2], [-33.9,25.8], [-34.8,19.6], [-34.1,18.4], [-31.7,18.2], [-27.1,15.2], [-22.1,14.3], [-18.1,11.8],
    [-10.7,13.7], [-5,11.9], [-1.1,8.8], [3.7,9.4], [4.8,8.5], [4.3,5.9], [6.3,4.3], [4.7,-2],
    [4.8,-9], [7.3,-12.4], [12.2,-16.6], [14.7,-17.6], [18.1,-16.1], [21.9,-17], [26.3,-14.4], [29.9,-9.6],
    [32.6,-9.3], [35.8,-5.9], [35.2,-2.2], [36.6,1.5], [37.4,9.5], [36.9,11.1], [33.8,10.3], [30.3,19.1],
    [32.2,20.1], [32.8,21.5], [30.9,28.9], [31.6,31], [31,33.8], [34.6,36], [36.7,36.2], [36.7,27.6],
    [39.5,26.2], [41.2,29.2], [42,33.5], [40.9,38.3], [42,41.7], [45.2,36.7], [47.3,39.1], [46.3,35],
    [45.1,36.3], [44.4,33.9], [45.3,32.5], [46.1,33.3], [46.6,30.7], [42.6,27.7], [41.1,28.8], [40.3,22.6],
    [37.7,24], [37.9,23.1], [36.4,23.2], [36.4,22.5], [40.3,19.4], [41.7,19.5], [45.7,13.1], [45.4,12.3],
    [44.1,12.6], [40.2,18.5], [40.4,16.9], [38.9,17.1], [38,16.1], [40,15.4], [44.4,8.9], [43.1,6.5],
    [43.1,3.1], [41.9,3], [41,0.8], [38.7,0.1], [36.7,-2.1], [35.9,-5.4], [36.9,-6.5], [36.9,-8.9],
    [43,-9.4], [44,-1.4], [46,-1.2], [48.7,-4.6], [48.6,-1.6], [49.8,-1.9], [50.1,1.3], [53.1,4.7],
    [53.5,8.1], [54,8.8], [57.1,8.5], [57.7,10.6], [56.5,10.9], [55.5,9.7], [54,10.9], [54.4,19.7],
    [55.2,21.3], [57.4,21.6], [57,24.1], [58.4,24.4], [59.2,23.3], [60,29.1], [59.8,22.9], [60.7,21.3],
    [63.2,21.5], [65.1,25.4], [65.7,22.2], [64.4,21.4], [62.7,17.8], [61.3,17.1], [60.1,18.8], [58.7,16.8],
    [56.1,15.9], [55.4,12.9], [59.5,10.4], [58.3,8.4], [58.6,5.7], [62,5], [64.5,10.5], [67.8,14.8],
    [71,24.5], [71.2,28.2], [70.5,31.3], [70.2,30], [69.6,31.1], [67.9,40.3], [66.8,41.1], [66.3,40],
    [66.6,33.2], [65.9,34.8], [64.4,34.9], [63.8,37], [64.8,36.5], [65.1,37.2], [64.5,39.6], [64.8,40.4],
    [65.5,39.8], [66.5,42.1], [66.1,43.9], [66.8,44.5], [68.6,43.5], [68.3,46.3], [67.7,46.8], [67,45.6],
    [66.7,46.3], [68.9,53.7], [68.8,54.5], [68.2,53.5], [68.9,58.8], [68.3,59.9], [68.9,61.1], [69.5,60],
    [69.9,60.6], [68.1,68.5], [68.6,69.2], [69.5,66.9], [71,66.7], [72.8,69.2], [72.8,72.6], [71.4,71.8],
    [70.4,72.8], [69,72.6], [68.4,73.7], [66.3,71.3], [66.2,72.4], [67.8,75.1], [69,74.9], [69.6,73.6],
    [70.6,74.4], [71.4,73.1], [72.1,74.9], [72.8,74.7], [72.3,75.7], [71.3,75.3], [71.2,76.4], [71.9,75.9],
    [72.3,77.6], [71.8,81.5], [73.6,80.5], [73.9,86.8], [74.5,86], [75.1,87.2], [76.4,100.8], [77.7,104.4],
    [77.4,106.1], [77.1,104.7],
  ],
  [
    [69.5,-90.5], [68.5,-90.6], [69.3,-89.2], [67.2,-87.4], [69.9,-85.5], [69.7,-82.6], [69.2,-81.3], [68.1,-82],
    [67.6,-81.3], [66.4,-83.3], [66.6,-85.8], [64.8,-87.3], [62,-93.2], [58.9,-94.7], [58.8,-93.2], [57.1,-92.3],
    [55.1,-82.3], [53.3,-82.1], [51.2,-79.9], [52.6,-78.6], [54.7,-79.8], [56.5,-76.5], [58.8,-78.5], [59.9,-77.3],
    [62.3,-78.1], [62.4,-73.8], [61.1,-69.6], [59,-69.3], [58.2,-67.6], [60.3,-64.6], [57,-61.4], [56.3,-61.8],
    [54.6,-57.3], [52.1,-55.7], [50.2,-60], [50.2,-66.4], [46.8,-71.1], [49.2,-65.1], [48.7,-64.2], [48.1,-65.1],
    [46.2,-64.5], [45.9,-61.5], [47,-60.5], [45.9,-59.8], [43.5,-65.4], [44.5,-66.2], [45.3,-64.4], [45.1,-67.1],
    [43,-70.7], [41.6,-70], [40.9,-73.7], [40.9,-71.9], [40.8,-74], [38.9,-74.9], [39.5,-75.5], [38.4,-75.1],
    [37.2,-75.9], [39.2,-76.3], [38.1,-76.3], [38.2,-77], [35.6,-75.7], [31.4,-81.3], [25.2,-80.4], [25.9,-81.7],
    [30.1,-84.1], [30.3,-89.2], [29.3,-89.2], [29.1,-90.2], [29.7,-93.8], [28.3,-96.6], [22.4,-97.9], [19.3,-96.3],
    [18.1,-94.4], [18.7,-92], [19.3,-90.8], [21,-90.3], [21.5,-87.1], [15.9,-88.9], [15.3,-83.4], [11.1,-83.8],
    [8.8,-81.4], [9.6,-79.6], [8.6,-76.8], [11.1,-74.9], [12.4,-71.8], [12.1,-71.1], [11.4,-71.9], [9.1,-71.7],
    [11,-71.4], [12.2,-69.9], [10.6,-68.2], [10.7,-61.9], [9.9,-62.4], [6,-57.1], [5.8,-54], [4.2,-51.3],
    [1.7,-50], [-0.1,-50.4], [-0.2,-48.6], [-1.2,-48.6], [-0.6,-47.8], [-1.6,-44.9], [-2.7,-44.6], [-2.9,-40],
    [-5.1,-35.6], [-7.3,-34.7], [-9,-35.1], [-13.1,-38.7], [-17.9,-39.3], [-21.9,-40.9], [-24.9,-47.6], [-28.7,-48.9],
    [-34.4,-53.8], [-34.9,-56.2], [-33.9,-58.4], [-36.9,-56.8], [-38.7,-59.2], [-38.8,-62.3], [-41,-62.7], [-41.1,-65.1],
    [-42.1,-65], [-42.6,-63.5], [-43.5,-65.2], [-45,-65.6], [-45.6,-67.3], [-46.3,-67.6], [-47.2,-65.6], [-48.1,-66],
    [-50.7,-69.1], [-52.3,-68.2], [-52.9,-70.8], [-53.8,-71], [-52.3,-74.9], [-48.7,-75.6], [-46.9,-74.1], [-46.6,-75.6],
    [-44.1,-74.4], [-44.5,-73.2], [-42.4,-72.7], [-43.2,-74.3], [-39.3,-73.2], [-37.2,-73.6], [-32.4,-71.4], [-19.8,-70.2],
    [-17.4,-71.5], [-14.6,-76], [-7.2,-79.8], [-6.1,-81.2], [-4.7,-81.4], [-2.7,-79.8], [-2.2,-81], [-1.1,-80.9],
    [3.8,-77.1], [8.3,-78.2], [8.9,-79.6], [7.2,-80.9], [9.9,-85.7], [13.3,-87.5], [13.9,-91.2], [16.2,-94.7],
    [15.7,-96.6], [18.3,-103.5], [19.9,-105.5], [22.8,-106], [31.6,-113.9], [31.8,-114.8], [30.2,-114.7], [23.4,-109.4],
    [22.8,-110], [24.7,-112.2], [26,-112.3], [27.7,-115.1], [28.6,-114.2], [33,-117.3], [34.6,-120.6], [40.3,-124.4],
    [45.5,-123.9], [48.2,-124.7], [47.1,-122.6], [49,-122.8], [50.8,-127.4], [52.3,-127.9], [58.1,-134.1], [60.9,-147.1],
    [59.2,-151.7], [61.3,-150.6], [56,-158.4], [54.4,-164.8], [57.6,-157.7], [58.9,-157], [58.7,-162], [59.6,-161.9],
    [59.8,-163.8], [61.5,-166.1], [63.1,-164.6], [63.8,-160.8], [64.4,-161.5], [64.8,-160.8], [64.4,-165], [65.7,-168.1],
    [66.6,-164.5], [66.1,-161.7], [68.4,-166.8], [71.4,-156.6], [68.9,-136.5], [70.5,-128.1], [69.5,-125.8], [69.8,-121.5],
    [68.9,-115.2], [68.4,-113.9], [67.9,-115.3], [67.4,-108.9], [67.9,-107.8], [68.3,-108.8], [68.7,-108.2], [68.8,-106.2],
    [67.6,-101.5], [68.6,-97.7], [68.2,-96.1], [67.3,-96.1], [69.1,-94.2], [70.1,-96.5], [71.9,-95.2], [71.3,-92.9],
    [70.2,-91.5], [69.7,-92.4],
  ],
  [
    [-13.8,143.6], [-15,145.4], [-19,146.4], [-20.4,148.8], [-26.1,153.1], [-31.6,152.9], [-37.4,150], [-39,146.3],
    [-37.9,145], [-38.8,143.6], [-38,140.6], [-36.1,139.6], [-35.6,138.1], [-34.4,138.2], [-35.3,136.8], [-32.9,137.8],
    [-34.9,136], [-32.6,134.3], [-31.5,131.3], [-32.2,126.1], [-33.9,123.7], [-34,119.9], [-35.1,118], [-34.2,115],
    [-31.6,115.7], [-26.1,113.3], [-26.3,114.2], [-24.4,113.4], [-21.8,114.1], [-22.5,114.2], [-20.7,116.7], [-19.7,120.9],
    [-14.2,125.7], [-13.8,127.1], [-15,129.6], [-12.5,130.6], [-12.1,132.6], [-11.3,131.8], [-11.9,136.5], [-15,135.5],
    [-17.7,140.2], [-15,141.7], [-11,142.1], [-13.4,143.6],
  ],
  [
    [83.5,-27.1], [82.7,-20.8], [82,-31.4], [81.3,-12.2], [80.2,-20], [80.1,-17.7], [78.8,-19.7], [77.6,-19.7],
    [77,-18.5], [76.6,-21.7], [76.1,-19.8], [75.2,-19.6], [75.2,-20.7], [74.3,-19.4], [73.3,-23.6], [72.2,-22.3],
    [72.3,-24.8], [70.7,-21.8], [71.4,-25.5], [70.8,-25.2], [70.2,-26.4], [70.1,-22.3], [65.5,-39.8], [62.7,-42.8],
    [60.1,-43.4], [60.9,-48.3], [63.6,-51.6], [67.2,-54], [69.9,-50.9], [69.6,-54.7], [70.8,-54.4], [70.6,-51.4],
    [71.7,-55.8], [72.6,-54.7], [75.5,-58.6], [76.1,-68.5], [77,-71.4], [77.4,-66.8], [78,-73.3], [79.4,-65.7],
    [80.1,-68], [81.8,-62.7], [82.4,-50.4], [81.7,-44.5], [82.6,-46.8], [83.6,-35.1],
  ],
  [
    [73.2,-86.6], [72.5,-85.8], [73.8,-82.3], [72.1,-80.7], [72.7,-77.8], [71.3,-74.1], [71.6,-72.2], [70.1,-67.9],
    [69.2,-67], [68.7,-68.8], [66.9,-61.9], [65,-63.9], [66.3,-68], [63.4,-64.7], [62.7,-65], [63.7,-68.8],
    [61.9,-66.2], [64.7,-74.8], [64.2,-77.7], [64.6,-78.6], [65.3,-77.9], [65.5,-74], [67.7,-72.9], [70.2,-79],
    [70.8,-89.5], [71.2,-88.5], [71.2,-89.9], [73.1,-89.4], [73.8,-85.8],
  ],
  [
    [83.1,-68.5], [82.4,-61.9], [81.5,-67.7], [81.5,-65.5], [79.8,-71.2], [79.3,-76.9], [78.5,-75.4], [77.2,-79.8],
    [76.8,-77.9], [76.2,-80.6], [76.5,-89.5], [77.2,-87.8], [77.9,-88.3], [77.5,-85], [78.4,-88], [79.3,-85.1],
    [80.3,-86.9], [80.5,-81.8], [80.5,-87.6], [81.9,-91.6], [83.2,-70.7],
  ],
  [
    [-1.2,134.1], [-3.4,135.5], [-1.7,138.3], [-3.9,144.6], [-6.1,147.6], [-7.4,147.2], [-10.6,150.7], [-10.1,147.9],
    [-7.6,144.7], [-9.3,142.6], [-8.4,137.6], [-7.3,138.7], [-5.4,137.9], [-3.5,133.7], [-4.1,133], [-2.8,132],
    [-2.2,133.7], [-0.9,130.5], [-0.8,134],
  ],
  [
    [1.8,117.9], [0.9,119], [0.8,117.8], [-4,116.1], [-2.9,110.2], [-0.5,109.1], [2,109.7], [1.9,111.2],
    [3.1,113], [6.9,116.7], [5.4,119.2], [3.2,117.3], [2.3,118],
  ],
  [
    [73.1,-114.2], [73,-109.9], [71.7,-108.2], [73.1,-108.4], [73.1,-106.5], [71,-104.5], [69.6,-101.1], [69.5,-102.7],
    [68.8,-102.4], [69.2,-116.1], [70,-117.3], [70.4,-112.4], [70.5,-117.9], [71.3,-116.1], [71.6,-119.4], [73.3,-115.2],
  ],
  [
    [-13.6,50.1], [-15.7,50.4], [-15.7,49.7], [-24.9,47.1], [-25.6,45.4], [-25,44], [-22.1,43.3], [-20.1,44.4],
    [-16.2,44.4], [-14.6,47.7], [-12,49.2], [-12.9,49.8],
  ],
  [
    [-5.9,105.8], [-4.2,102.6], [5.5,95.3], [5.2,97.5], [1.4,102.5], [-3.1,106.1], [-4.3,105.9],
  ],
  [
    [37.1,141], [35.1,140.3], [33.5,135.8], [34.6,135.1], [33.9,131], [33.1,132], [31.5,131.3], [31.4,130.2],
    [33.3,129.4], [35.4,132.6], [35.5,135.7], [37.3,136.7], [36.8,137.4], [38.2,139.4], [41.2,140.3], [41.4,141.4],
    [40,141.9], [38.2,141],
  ],
  [
    [70.7,57.5], [71.5,51.6], [75.1,55.6], [76.5,68.9], [74.3,58.5], [72.4,55.4], [71.5,55.6],
  ],
  [
    [66.6,-175], [66.9,-171.9], [66,-169.9], [65.4,-172.5], [64.3,-173], [66.1,-178.7], [65.9,-179.9], [65,-180],
    [69,-180], [67.2,-174.9],
  ],
  [
    [66.5,-14.5], [65.1,-13.6], [63.5,-18.7], [64,-22.8], [64.4,-21.8], [64.9,-24], [65.4,-22.2], [65.6,-24.3],
    [66.5,-16.2],
  ],
  [
    [71.4,-120.5], [70.9,-123.1], [71.9,-125.9], [73.7,-123.9], [74.3,-124.9], [74.4,-121.5], [73.5,-115.5], [71.8,-120.5],
  ],
  [
    [79.7,-87], [79.3,-85.8], [78.2,-90.8], [80.2,-96.7], [81.3,-92.4], [80.3,-87.8],
  ],
  [
    [77.1,-94.7], [75.6,-89.2], [75.7,-81.1], [74.9,-79.8], [74.8,-92.4], [75.9,-92.9], [77.2,-96.7],
  ],
  [
    [79.7,18.3], [79,21.5], [76.8,15.9], [79.7,10.4], [80.1,17],
  ],
  [
    [-40.9,173], [-41.3,174.2], [-43.9,173.1], [-44.2,171.5], [-46.6,169.3], [-46.2,166.7], [-40.5,172.8],
  ],
  [
    [1.4,125.2], [0.2,123.7], [0.2,120.2], [-1.4,120.9], [-0.6,123.3], [-1.9,121.5], [-5.3,123.2], [-5.3,122.2],
    [-4.5,122.7], [-4.6,121.5], [-2.6,121], [-5.5,120.4], [-5.4,119.4], [-2.8,118.8], [0.6,120], [1.6,125.1],
  ],
  [
    [50.7,-56.1], [49.8,-56.8], [49.2,-53.5], [46.7,-53.1], [46.8,-54.2], [47.8,-54.2], [46.9,-55.4], [47.6,-59.3],
    [50.7,-57.4], [51.3,-55.6],
  ],
  [
    [76.2,-108.2], [76,-105.9], [75,-106.3], [74.4,-113.7], [75.2,-111.8], [75.2,-117.7], [76.5,-115.4], [75.5,-109.1],
    [76.4,-110.5], [76.7,-108.5],
  ],
  [
    [78.9,99.9], [79,95], [80.3,91.2], [81.3,95.9], [79.8,100.2],
  ],
  [
    [-36.2,174.6], [-37.9,176.8], [-37.7,178.5], [-41.7,175.2], [-39.9,174.9], [-39.5,173.8], [-37.4,174.7], [-34.5,172.6],
    [-35.3,174.3],
  ],
  [
    [-53.8,-67.7], [-54.7,-65], [-55.5,-69.2], [-52.8,-74.7], [-54.1,-71.1], [-52.5,-69.3], [-53.1,-68.2],
  ],
  [
    [-6.8,108.6], [-6.5,110.8], [-8.4,115.7], [-7.4,106.5], [-6.9,105.4], [-5.9,106.1], [-6.4,108.5],
  ],
  [
    [50.7,143.6], [49,144.7], [49.3,143.2], [47.9,142.6], [46.1,143.5], [46.7,142.7], [46,142.1], [53.3,141.7],
    [54.4,142.7], [51.8,143.2],
  ],
  [
    [22.8,-79.7], [20.3,-74.2], [19.9,-77.8], [20.4,-77.1], [21.6,-78.7], [22.6,-81.8], [21.9,-85], [23.1,-80.6],
  ],
  [
    [44.2,143.9], [44.4,145.3], [43.3,145.5], [41.6,140], [45.6,142], [44.5,143.1],
  ],
  [
    [18.5,121.3], [18.5,122.2], [17.1,122.5], [14.3,121.7], [13.8,124], [12.5,124.1], [13.9,120.6], [16.4,119.9],
    [18.5,120.7],
  ],
  [
    [52.3,-6.8], [51.8,-10], [52.9,-9.2], [53.9,-9.7], [55.2,-6.7], [54.6,-5.7], [53.2,-6],
  ],
  [
    [73.8,-100.4], [73.8,-97.4], [73,-98.1], [72.6,-96.5], [71.7,-96.7], [71.4,-99.3], [72.5,-102.5], [72.7,-100.4],
    [73.4,-101.5],
  ],
  [
    [75.6,145.1], [74.8,144.3], [74.6,139], [75.3,137], [76.1,141.5],
  ],
  [
    [8.4,126.4], [5.6,125.4], [7.8,123.6], [7.2,121.9], [8.7,123.5], [9,125.5], [9.8,125.4], [8.8,126.3],
  ],
  [
    [80.4,25.4], [80.1,27.4], [79.4,23], [80.3,17.4], [80.7,22.9],
  ],
  [
    [65.7,-85.2], [63.7,-80.1], [63.5,-87.2], [65.7,-85.9],
  ],
  [
    [-40.8,145.4], [-40.9,148.3], [-43.2,147.9], [-43.5,146], [-40.7,144.7],
  ],
  [
    [72.8,-93.2], [72.1,-95.4], [73.4,-96], [74.1,-92.4], [73.9,-90.5], [73,-92],
  ],
  [
    [19.9,-72.6], [18.6,-68.3], [17.6,-71.4], [18,-73.9], [18.7,-74.4], [18.7,-72.3], [19.9,-73.2],
  ],
  [
    [76.7,-98.5], [76.3,-97.7], [75,-98.2], [75.6,-102.5], [76.3,-102.6], [76.6,-98.6],
  ],
  [
    [77.6,-116.2], [76.5,-117.1], [76.1,-122.9], [77.5,-117.6],
  ],
  [
    [6.2,81.2], [6.8,79.9], [9.8,80.1], [6.5,81.6],
  ],
  [
    [78.3,105.1], [77.9,99.4], [79.3,102.1], [78.7,105.4],
  ],
  [
    [48.5,-123.5], [48.8,-125.7], [50.8,-128.4], [49.1,-123.9],
  ],
  [
    [78.3,-100.1], [78.4,-105.2], [78.7,-104.2], [79.3,-105.5], [78.8,-100.8],
  ],
  [
    [73.1,-76.3], [72.8,-76.3], [72.9,-77.3], [72.9,-78.4], [72.7,-79.5], [72.8,-79.8], [73.3,-80.9], [73.7,-80.8],
    [73.8,-80.4], [73.7,-78.1], [73.1,-76.3],
  ],
  [
    [-5.5,152], [-6.3,150.2], [-5.7,148.3], [-5.5,150.8], [-4.2,151.5], [-4.9,152.3],
  ],
  [
    [22.8,121.2], [22,120.7], [23.6,120.1], [25.3,121.5], [24.4,121.8],
  ],
];

/* Mainland Britain, kept finer so it reads as a shape, not a blob. */
const UK: number[][] = [
  [58.6,-3], [57.6,-4.1], [57.7,-2], [56.9,-2.2], [56,-3.1], [55.9,-2.1],
  [54.6,-1.1], [54.5,-0.4], [52.9,0.5], [52.7,1.7], [52.1,1.6], [51.8,1.1],
  [51.3,1.4], [50.8,0.6], [50.8,-0.8], [50.5,-2.5], [50.7,-3], [50.2,-3.6],
  [50.3,-4.5], [50,-5.2], [50.2,-5.8], [51.2,-4.3], [51.4,-3.4], [51.6,-5],
  [52,-5.3], [52.3,-4.2], [52.8,-4.8], [53.5,-4.6], [53.4,-3.1], [54,-2.9],
  [54.6,-3.6], [54.8,-4.8], [55.1,-5.1], [55.5,-4.7], [55.8,-5], [55.3,-5.6],
  [56.3,-5.6], [56.8,-6.1], [57.8,-5.8], [58.6,-5], [58.6,-4.2],
];

/** Lat/lon bounds, so the sampler can dismiss a landmass in one test. */
function bounds(poly: number[][]) {
  let latMin = 90;
  let latMax = -90;
  let lonMin = 180;
  let lonMax = -180;
  for (const p of poly) {
    if (p[0] < latMin) latMin = p[0];
    if (p[0] > latMax) latMax = p[0];
    if (p[1] < lonMin) lonMin = p[1];
    if (p[1] > lonMax) lonMax = p[1];
  }
  return [latMin, latMax, lonMin, lonMax];
}

const CITIES: [string, number, number][] = [
  ["DUBAI", 25.2, 55.3], ["ABU DHABI", 24.5, 54.4], ["DOHA", 25.3, 51.5],
  ["RIYADH", 24.7, 46.7], ["CAIRO", 30, 31.2], ["NAIROBI", -1.3, 36.8],
  ["LAGOS", 6.5, 3.4], ["CAPE TOWN", -33.9, 18.4], ["MADRID", 40.4, -3.7],
  ["GENEVA", 46.2, 6.1], ["MUMBAI", 19.1, 72.9], ["BANGKOK", 13.8, 100.5],
  ["SINGAPORE", 1.3, 103.8], ["KUALA LUMPUR", 3.1, 101.7], ["HONG KONG", 22.3, 114.2],
  ["SHANGHAI", 31.2, 121.5], ["TOKYO", 35.7, 139.7], ["SYDNEY", -33.9, 151.2],
  ["AUCKLAND", -36.8, 174.8], ["TORONTO", 43.7, -79.4], ["NEW YORK", 40.7, -74],
];
const LONDON: [number, number] = [51.5, -0.12];

type Vec = [number, number, number];
interface Arc {
  name: string;
  a: Vec;
  b: Vec;
  t: number;
  lit: number;
  landed: boolean;
}
interface Flash {
  v: Vec;
  t: number;
}

const vec = (lat: number, lon: number): Vec => {
  const a = lat * D2R;
  const b = lon * D2R;
  return [Math.cos(a) * Math.sin(b), Math.sin(a), Math.cos(a) * Math.cos(b)];
};

function inPoly(lat: number, lon: number, poly: number[][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const yi = poly[i][0];
    const xi = poly[i][1];
    const yj = poly[j][0];
    const xj = poly[j][1];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

function slerp(a: Vec, b: Vec, t: number): Vec {
  let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  d = Math.max(-1, Math.min(1, d));
  const o = Math.acos(d);
  if (o < 1e-4) return [a[0], a[1], a[2]];
  const s = Math.sin(o);
  const k1 = Math.sin((1 - t) * o) / s;
  const k2 = Math.sin(t * o) / s;
  return [a[0] * k1 + b[0] * k2, a[1] * k1 + b[1] * k2, a[2] * k1 + b[2] * k2];
}

/**
 * Where the camera is at a moment. The globe turns steadily; the camera
 * climbs towards the pole only as Britain swings behind, and the squared ease
 * keeps it low (and the equator wide open) for most of the revolution.
 */
function cameraAt(time: number) {
  const away = time * SPIN;
  const climb = (1 - Math.cos(away)) / 2;
  return { away, rot: -LONDON[1] * D2R + away, tilt: TILT + LIFT * climb * climb };
}

/** Depth of a point at a moment: positive is the half facing the viewer. */
function depthAt(v: Vec, time: number) {
  const { rot, tilt } = cameraAt(time);
  const behind = -v[0] * Math.sin(rot) + v[2] * Math.cos(rot);
  return v[1] * Math.sin(tilt) + behind * Math.cos(tilt);
}

function glowSprite(rgb: string, size: number) {
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const g = c.getContext("2d");
  if (!g) return c;
  const r = size / 2;
  const grad = g.createRadialGradient(r, r, 0, r, r, r);
  grad.addColorStop(0, `rgba(${rgb},0.95)`);
  grad.addColorStop(0.3, `rgba(${rgb},0.3)`);
  grad.addColorStop(1, `rgba(${rgb},0)`);
  g.fillStyle = grad;
  g.fillRect(0, 0, size, size);
  return c;
}

/**
 * The site's mono family, resolved for canvas.
 *
 * ctx.font is parsed without an element, so a var() reference is REJECTED and
 * the context silently keeps 10px sans-serif. Read the custom property first,
 * then check the assignment actually took.
 */
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace';
function monoFont(px: number, weight: string) {
  let family = "";
  try {
    family = getComputedStyle(document.documentElement).getPropertyValue("--lv2-font-mono").trim();
  } catch {}
  return `${weight} ${px}px ${family ? family + ", " : ""}${MONO}`;
}

type AtlasOpts = { glow?: string; track?: number };

/**
 * Monospace sprite sheet: characters are stamped, never re-rendered.
 *
 * Each cell bakes its own halo (a dark plate, then a coloured bloom), so a
 * label holds over the lit side of the globe with no blur at draw time. The
 * halo lives in `pad` either side of the glyph; layout still steps by `cw`.
 */
function makeAtlas(px: number, color: string, weight: string, opts: AtlasOpts = {}) {
  const dpr = Math.max(1, Math.round(Math.min(window.devicePixelRatio || 1, 2)));
  const probe = document.createElement("canvas").getContext("2d");
  let font = monoFont(px, weight);
  let adv = px * 0.6;
  if (probe) {
    probe.font = font;
    const took = probe.font.toLowerCase().includes("mono") && probe.font.includes(`${px}px`);
    if (!took) {
      font = `${weight} ${px}px ${MONO}`;
      probe.font = font;
    }
    adv = probe.measureText("M").width || adv;
  }
  const cw = Math.max(1, Math.ceil(adv + (opts.track ?? 0)));
  const ch = Math.ceil(px * 1.34);
  const pad = opts.glow ? Math.ceil(px * 0.72) : 0;
  const dw = cw + pad * 2;
  const dh = ch + pad * 2;
  const c = document.createElement("canvas");
  c.width = dw * 95 * dpr;
  c.height = dh * dpr;
  const g = c.getContext("2d");
  if (g) {
    g.scale(dpr, dpr);
    g.font = font;
    g.textBaseline = "alphabetic";
    for (let i = 0; i < 95; i++) {
      const glyph = String.fromCharCode(32 + i);
      const x = i * dw + pad;
      const y = pad + px;
      if (opts.glow) {
        g.shadowColor = "rgba(3,8,26,0.92)";
        g.shadowBlur = px * 0.55;
        g.fillStyle = "rgba(3,8,26,0.92)";
        g.fillText(glyph, x, y);
        g.fillText(glyph, x, y);
        g.shadowColor = opts.glow;
        g.shadowBlur = px * 0.7;
        g.fillStyle = color;
        g.fillText(glyph, x, y);
        g.fillText(glyph, x, y);
        g.shadowBlur = 0;
        g.shadowColor = "transparent";
      }
      g.fillStyle = color;
      g.fillText(glyph, x, y);
    }
  }
  // cw/ch are the layout box; dw/dh include the halo, drawn back by pad.
  return { c, cw, ch, pad, dw, dh, sw: dw * dpr, sh: dh * dpr };
}
type Atlas = ReturnType<typeof makeAtlas>;

export default function SchoolsGlobe() {
  const rootRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const setMotionRef = useRef<((paused: boolean) => void) | null>(null);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const root = rootRef.current;
    const canvas = canvasRef.current;
    if (!root || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let stored: string | null = null;
    try {
      stored = window.localStorage.getItem(MOTION_KEY);
    } catch {}
    let isPaused = stored === "paused" || (stored !== "playing" && reduceMotion);

    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let disposed = false;

    const GLOW = {
      cyan: glowSprite("125,240,255", 110),
      amber: glowSprite("255,196,107", 110),
      mint: glowSprite("156,255,138", 96),
    };

    let w = 0;
    let h = 0;
    let R = 0;
    let cx = 0;
    let cy = 0;
    let bx = 0; // canvas origin in page coordinates
    let by = 0;
    let bw = 0;
    let bh = 0;
    let land: Vec[] = [];
    let uk: Vec[] = [];
    let stars: { x: number; y: number; r: number; p: number }[] = [];
    let dotX = new Float32Array(0);
    let dotY = new Float32Array(0);
    let dotBucket = new Uint8Array(0);
    let arcs: Arc[] = [];
    let flashes: Flash[] = [];
    let cityAtlas: Atlas | null = null;
    let codeAtlas: Atlas | null = null;
    // Where the label element ended up, so the leader can reach out of it.
    let labelX = 0;
    let labelY = 0;
    let labelW = 0;
    let labelH = 0;
    // The label annotates the first screen. Once the page scrolls, content
    // passes over it, so it stands down rather than sitting behind the copy.
    let labelOn = true;

    const blit = (a: Atlas, code: number, x: number, y: number, alpha: number) => {
      const i = (code | 0) - 32;
      if (i < 0 || i > 94 || alpha <= 0.01) return;
      ctx.globalAlpha = alpha;
      ctx.drawImage(a.c, i * a.sw, 0, a.sw, a.sh, x - a.pad, y - a.pad, a.dw, a.dh);
      ctx.globalAlpha = 1;
    };
    // x, y is the top left of the first layout cell; runs land on whole pixels.
    const text = (a: Atlas, str: string, x: number, y: number, alpha: number) => {
      const left = Math.round(x);
      const top = Math.round(y);
      for (let i = 0; i < str.length; i++) blit(a, str.charCodeAt(i), left + i * a.cw, top, alpha);
    };

    const buildAtlases = () => {
      const px = Math.max(11, Math.min(15, Math.round(R / 26)));
      cityAtlas = makeAtlas(px, "#c2ffb2", "700", { glow: "rgba(120,255,130,0.8)", track: px * 0.1 });
      codeAtlas = makeAtlas(Math.max(9, Math.round(R / 26)), "#eafcff", "600");
    };

    const build = () => {
      w = window.innerWidth;
      h = window.innerHeight;

      // The globe sits right of the reading column on wide screens, and drops
      // low and centred on phones so it never sits behind the copy.
      if (w >= 1100) {
        R = Math.min(w * 0.26, h * 0.42);
        cx = w * 0.76;
        cy = h * 0.6;
      } else if (w >= 700) {
        R = Math.min(w * 0.34, h * 0.34);
        cx = w * 0.7;
        cy = h * 0.48;
      } else {
        R = Math.min(w * 0.5, h * 0.26);
        cx = w * 0.56;
        cy = h * 0.72;
      }

      // Size the canvas to the globe plus its halo, clamped to the viewport.
      const reach = R * 1.8;
      bx = Math.max(0, Math.floor(cx - reach));
      by = Math.max(0, Math.floor(cy - reach));
      bw = Math.min(w, Math.ceil(cx + reach)) - bx;
      bh = Math.min(h, Math.ceil(cy + reach)) - by;
      canvas.style.left = `${bx}px`;
      canvas.style.top = `${by}px`;
      canvas.style.width = `${bw}px`;
      canvas.style.height = `${bh}px`;
      canvas.width = Math.max(1, Math.round(bw * dpr));
      canvas.height = Math.max(1, Math.round(bh * dpr));
      // Drawing stays in page coordinates; the transform does the offset.
      ctx.setTransform(dpr, 0, 0, dpr, -bx * dpr, -by * dpr);

      buildAtlases();

      // Even spacing ON THE SPHERE: a fixed lon step bunches dots at the
      // poles and thins them at the equator, which distorts every coastline.
      const step = w < 700 ? 2.6 : 1.6;
      const boxes = LAND.map(bounds);
      land = [];
      for (let lat = -56; lat <= 80; lat += step) {
        const ring = Math.max(6, Math.round((360 * Math.cos(lat * D2R)) / step));
        const lonStep = 360 / ring;
        for (let k = 0; k < ring; k++) {
          const lon = -180 + k * lonStep;
          for (let i = 0; i < LAND.length; i++) {
            const b = boxes[i];
            if (lat < b[0] || lat > b[1] || lon < b[2] || lon > b[3]) continue;
            if (inPoly(lat, lon, LAND[i])) {
              land.push(vec(lat, lon));
              break;
            }
          }
        }
      }
      uk = [];
      for (let lat = 49.8; lat <= 59; lat += 0.4) {
        for (let lon = -8; lon <= 2.2; lon += 0.4) {
          if (inPoly(lat, lon, UK)) uk.push(vec(lat, lon));
        }
      }
      dotX = new Float32Array(land.length);
      dotY = new Float32Array(land.length);
      dotBucket = new Uint8Array(land.length);
      stars = [];
      for (let i = 0; i < 46; i++) {
        stars.push({ x: bx + Math.random() * bw, y: by + Math.random() * bh, r: 0.6 + Math.random() * 1.2, p: Math.random() * 6 });
      }
      // The label is a DOM element ABOVE the scrim: drawn on the canvas it
      // sat under the vignette that keeps the page's own text readable, which
      // muted the one thing up there meant to be read. Placed here because
      // this is where the globe's size is known.
      const label = labelRef.current;
      if (label) {
        label.style.setProperty("--sg-label-px", `${Math.max(13, Math.min(20, Math.round(R / 19)))}px`);
        // High on the globe: clear of the page's top row above it and of the
        // hero's screens below it, both of which it used to run into.
        const ly = cy - R * 0.8;
        label.style.top = `${Math.round(ly)}px`;
        label.style.left = "0px";
        const box = label.getBoundingClientRect();
        labelW = box.width;
        labelH = box.height;
        labelY = ly;
        labelX = Math.max(bx + 10, Math.min(bx + bw - labelW - 10, cx - R * 0.6));
        label.style.left = `${Math.round(labelX)}px`;
      }

      const src = vec(LONDON[0], LONDON[1]);
      arcs = CITIES.map((c, i) => ({
        name: c[0],
        a: src,
        b: vec(c[1], c[2]),
        t: 1.6, // relaunch() plans the first departure on the first frame
        lit: 0,
        landed: false,
      }));
      flashes = [];
    };

    /**
     * Hold a lesson back until its city will be facing us when it arrives.
     * Without this, most of every revolution lands on the far side of the
     * globe and the page looks idle however many routes are running.
     */
    const relaunch = (arc: Arc, now: number) => {
      const travel = 1 / FLIGHT;
      for (let wait = 0; wait < 34; wait += 0.5) {
        if (depthAt(arc.b, now + wait + travel) > 0.2) {
          arc.t = -FLIGHT * (wait + Math.random() * 2.2);
          return;
        }
      }
      // Never in view within the next half minute (the far south, while the
      // camera is lifted north): send it anyway, so the route still reads.
      arc.t = -FLIGHT * (4 + Math.random() * 10);
    };

    /**
     * A classroom screen coming on at a city: a browser window in miniature,
     * three dots on its bar and code on its page, matching the screenshots
     * fanned in the hero. Drawn, not stamped, because it is a handful of
     * rectangles and it has to scale with the globe.
     */
    const classroom = (x: number, y: number, scale: number, alpha: number, seed: number) => {
      const cw2 = 34 * scale;
      const ch2 = 24 * scale;
      const left = Math.round(x - cw2 / 2);
      const top = Math.round(y - ch2 - 11);
      const bar = Math.max(3, 5 * scale);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = "rgba(5,16,40,0.94)";
      ctx.fillRect(left, top, cw2, ch2);
      ctx.fillStyle = "rgba(156,255,138,0.22)";
      ctx.fillRect(left, top, cw2, bar);
      // the window's three dots
      ctx.fillStyle = "rgba(200,255,205,0.8)";
      for (let i = 0; i < 3; i++) ctx.fillRect(left + 3 + i * 3.4, top + bar * 0.3, 1.6, 1.6);
      // lines of code, ragged like real ones
      for (let i = 0; i < 3; i++) {
        const n = (seed + i * 7) % 5;
        ctx.fillStyle = i === 1 ? "rgba(125,240,255,0.85)" : "rgba(196,255,206,0.8)";
        ctx.fillRect(left + 3, top + bar + 3 + i * 5 * scale, (0.3 + n * 0.14) * (cw2 - 6), Math.max(1, 1.6 * scale));
      }
      ctx.strokeStyle = "rgba(156,255,138,0.8)";
      ctx.lineWidth = 1;
      ctx.strokeRect(left + 0.5, top + 0.5, cw2 - 1, ch2 - 1);
      // stand and desk, so it reads as a room rather than a floating card
      ctx.fillStyle = "rgba(156,255,138,0.6)";
      ctx.fillRect(x - 1.5, top + ch2, 3, 3 * scale);
      ctx.fillRect(x - 8 * scale, top + ch2 + 3 * scale, 16 * scale, Math.max(1, 1.4 * scale));
      ctx.globalAlpha = 1;
    };

    const draw = (t: number, dt: number) => {
      ctx.clearRect(bx, by, bw, bh);
      if (!cityAtlas || !codeAtlas) return;

      // One steady revolution, never reversing. A full spin would carry
      // Britain behind the limb for half of it, so the camera climbs towards
      // the pole as Britain swings away and drops back as it returns: London
      // stays within about 60 degrees of the centre the whole way round.
      const { rot, tilt } = cameraAt(t);
      const cr = Math.cos(rot);
      const sr = Math.sin(rot);
      const ct = Math.cos(tilt);
      const st = Math.sin(tilt);
      const project = (v: Vec): [number, number, number] => {
        const x = v[0] * cr + v[2] * sr;
        const z0 = -v[0] * sr + v[2] * cr;
        const y = v[1] * ct - z0 * st;
        const z = v[1] * st + z0 * ct;
        return [cx + x * R, cy - y * R, z];
      };

      // Stars, so the empty half of the screen is not flat.
      for (const s of stars) {
        const tw = 0.4 + 0.35 * Math.sin(t * 0.7 + s.p);
        ctx.globalAlpha = tw * 0.6;
        ctx.fillStyle = "#cfe6ff";
        ctx.fillRect(s.x, s.y, s.r, s.r);
      }
      ctx.globalAlpha = 1;

      // Atmosphere and sphere.
      ctx.drawImage(GLOW.cyan, cx - R * 1.7, cy - R * 1.7, R * 3.4, R * 3.4);
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(6,20,48,0.72)";
      ctx.fill();
      ctx.strokeStyle = "rgba(125,240,255,0.22)";
      ctx.lineWidth = 1;
      ctx.stroke();

      // Graticule.
      ctx.strokeStyle = "rgba(125,240,255,0.1)";
      for (let lat = -60; lat <= 60; lat += 30) {
        ctx.beginPath();
        for (let lon = -180; lon <= 180; lon += 6) {
          const p = project(vec(lat, lon));
          if (p[2] < 0) {
            ctx.stroke();
            ctx.beginPath();
            continue;
          }
          ctx.lineTo(p[0], p[1]);
        }
        ctx.stroke();
      }

      // Land, then Britain lit on top of it.
      const dot = Math.max(1.1, R / 105);
      ctx.fillStyle = "#67b6e6";
      let visible = 0;
      for (let i = 0; i < land.length; i++) {
        const v = land[i];
        const x = v[0] * cr + v[2] * sr;
        const z0 = -v[0] * sr + v[2] * cr;
        const y = v[1] * ct - z0 * st;
        const z = v[1] * st + z0 * ct;
        if (z < 0.04) continue;
        dotX[visible] = cx + x * R;
        dotY[visible] = cy - y * R;
        dotBucket[visible] = z < 0.3 ? 0 : z < 0.6 ? 1 : z < 0.85 ? 2 : 3;
        visible++;
      }
      const BUCKET_ALPHA = [0.32, 0.5, 0.67, 0.81];
      for (let b = 0; b < 4; b++) {
        ctx.globalAlpha = BUCKET_ALPHA[b];
        for (let i = 0; i < visible; i++) {
          if (dotBucket[i] !== b) continue;
          ctx.fillRect(dotX[i], dotY[i], dot, dot);
        }
      }
      ctx.fillStyle = "#ffd88f";
      for (const v of uk) {
        const p = project(v);
        if (p[2] < 0.04) continue;
        ctx.globalAlpha = 0.5 + p[2] * 0.5;
        ctx.fillRect(p[0], p[1], dot * 0.95, dot * 0.95);
      }
      ctx.globalAlpha = 1;

      // Every name drawn this frame, so the next one can avoid them.
      const taken: [number, number, number, number][] = [];
      const pulse = 0.72 + 0.28 * Math.sin(t * 1.5);
      const ukP = project(vec(LONDON[0], LONDON[1]));
      if (ukP[2] > 0) {
        ctx.globalAlpha = 0.55 * pulse;
        ctx.drawImage(GLOW.amber, ukP[0] - R * 0.36, ukP[1] - R * 0.36, R * 0.72, R * 0.72);
        ctx.globalAlpha = 1;
        ctx.strokeStyle = `rgba(255,216,143,${0.5 * pulse})`;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(ukP[0], ukP[1], R * 0.1 * (1 + 0.25 * Math.sin(t * 1.5)), 0, Math.PI * 2);
        ctx.stroke();
        // The label itself is DOM, above the scrim. All that is left here is
        // its leader, reaching from the words to Britain wherever the turn has
        // carried it, and keeping city names off the words.
        if (w >= 1100 && labelW > 0 && labelOn) {
          taken.push([labelX - 6, labelY - 4, labelX + labelW + 6, labelY + labelH + 4]);
          const tipX = ukP[0] > labelX + labelW * 0.5 ? labelX + labelW + 9 : labelX - 9;
          const tipY = labelY + labelH * 0.72;
          const dx = ukP[0] - tipX;
          const dy = ukP[1] - tipY;
          const len = Math.hypot(dx, dy) || 1;
          if (len > R * 0.42) {
            const run = len - R * 0.16;
            ctx.strokeStyle = "rgba(255,206,140,0.34)";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(tipX, tipY);
            ctx.lineTo(tipX + (dx / len) * run, tipY + (dy / len) * run);
            ctx.stroke();
          }
        }
      }

      // Lessons on their way out of the UK.
      for (const arc of arcs) {
        arc.t += dt * FLIGHT;
        if (arc.t > 1.5) relaunch(arc, t);
        const p = Math.max(0, Math.min(1, arc.t));
        const steps = 36;
        const span = (from: number, to: number, style: string, width: number) => {
          ctx.beginPath();
          let started = false;
          for (let i = 0; i <= steps; i++) {
            const k = from + ((to - from) * i) / steps;
            if (k < 0) continue;
            const v = slerp(arc.a, arc.b, k);
            const l = 1 + 0.3 * Math.sin(Math.PI * k);
            const pt = project([v[0] * l, v[1] * l, v[2] * l]);
            if (pt[2] < -0.25) {
              started = false;
              continue;
            }
            if (!started) {
              ctx.moveTo(pt[0], pt[1]);
              started = true;
            } else ctx.lineTo(pt[0], pt[1]);
          }
          ctx.strokeStyle = style;
          ctx.lineWidth = width;
          ctx.stroke();
        };
        span(0, 1, "rgba(125,240,255,0.16)", 1);
        if (p > 0.002) span(0, p, "rgba(160,245,255,0.62)", 1.2);
        if (arc.lit > 0.05) span(0, 1, `rgba(156,255,138,${arc.lit * 0.5})`, 1.4);

        if (arc.t > 0 && arc.t <= 1) {
          for (let k = 0; k < 4; k++) {
            const q = Math.max(0, p - k * 0.03);
            const v = slerp(arc.a, arc.b, q);
            const l = 1 + 0.3 * Math.sin(Math.PI * q);
            const pt = project([v[0] * l, v[1] * l, v[2] * l]);
            if (pt[2] < -0.25) continue;
            if (k === 0) {
              ctx.globalAlpha = 0.8;
              ctx.drawImage(GLOW.cyan, pt[0] - 16, pt[1] - 16, 32, 32);
              ctx.globalAlpha = 1;
            }
            const cargo = CODE.charCodeAt((Math.floor(t * 12) + k * 5) % CODE.length);
            blit(codeAtlas, cargo, pt[0] - codeAtlas.cw * 0.5, pt[1] - codeAtlas.ch * 0.48, 1 - k * 0.22);
          }
        }
        if (arc.t > 1 && !arc.landed) {
          arc.landed = true;
          arc.lit = 1;
          flashes.push({ v: arc.b, t: 0 });
        }
        if (arc.t < 0.05) arc.landed = false;
        if (arc.lit > 0) arc.lit = Math.max(0, arc.lit - dt * 0.26);

        const pin = project(arc.b);
        if (pin[2] > 0.02) {
          const hot = arc.lit > 0.05;
          ctx.globalAlpha = hot ? 0.9 : 0.3;
          ctx.drawImage(hot ? GLOW.mint : GLOW.cyan, pin[0] - 13, pin[1] - 13, 26, 26);
          ctx.globalAlpha = 1;
          ctx.fillStyle = hot ? "#9cff8a" : "#7df0ff";
          ctx.fillRect(pin[0] - 1.6, pin[1] - 1.6, 3.2, 3.2);
          // Screens and names only where the globe has a column of its own:
          // narrower, the page's copy runs full width and they land behind it.
          if (hot && w >= 1100) {
            const free = (b: [number, number, number, number]) =>
              !taken.some((o) => b[0] < o[2] && b[2] > o[0] && b[1] < o[3] && b[3] > o[1]);
            // The screen grows as the lesson arrives and sits above the pin.
            const grow = Math.min(1, (1 - arc.lit) * 7);
            const k = (0.55 + 0.45 * grow) * Math.max(0.7, Math.min(1.25, R / 340));
            const screenBox: [number, number, number, number] = [pin[0] - 20 * k, pin[1] - 38 * k, pin[0] + 20 * k, pin[1] - 6];
            if (free(screenBox)) {
              taken.push(screenBox);
              classroom(pin[0], pin[1], k, Math.min(1, arc.lit * 2.4), arc.name.length);
            }
            // The name goes BELOW the pin, since the screen has the space above.
            const nameW = arc.name.length * cityAtlas.cw;
            const flip = pin[0] > w - nameW - 24;
            const lx = flip ? pin[0] - 7 - nameW : pin[0] + 7;
            const ly = pin[1] + 5;
            const nameBox: [number, number, number, number] = [lx - 4, ly - 2, lx + nameW + 4, ly + cityAtlas.ch + 2];
            if (free(nameBox)) {
              taken.push(nameBox);
              text(cityAtlas, arc.name, lx, ly, 1);
            }
          }
        }
      }

      for (let i = flashes.length - 1; i >= 0; i--) {
        const f = flashes[i];
        f.t += dt * 0.9;
        if (f.t >= 1) {
          flashes.splice(i, 1);
          continue;
        }
        const p = project(f.v);
        if (p[2] < 0) continue;
        ctx.strokeStyle = `rgba(156,255,138,${(1 - f.t) * 0.85})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(p[0], p[1], 6 + f.t * R * 0.16, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };

    /* ---------------- loop and controls ---------------- */

    let raf = 0;
    let running = false;
    let last = 0;
    let prev = 0;

    const frame = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(frame);
      if (now - last < FRAME_MS) return;
      const dt = Math.min(0.08, (now - (prev || now)) / 1000);
      prev = now;
      last = now;
      draw(now / 1000, dt);
    };
    const start = () => {
      if (running || isPaused || document.hidden) return;
      running = true;
      prev = 0;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const applyMotion = (pause: boolean) => {
      isPaused = pause;
      if (pause) {
        stop();
        draw(performance.now() / 1000, 0);
      } else {
        start();
      }
    };
    setMotionRef.current = applyMotion;

    let rt = 0;
    const onResize = () => {
      window.clearTimeout(rt);
      rt = window.setTimeout(() => {
        stop();
        build();
        if (isPaused) draw(performance.now() / 1000, 0);
        else start();
      }, 150);
    };
    let dimmed = false;
    const onScroll = () => {
      const y = window.scrollY;
      const show = y < 140;
      if (show !== labelOn) {
        labelOn = show;
        labelRef.current?.classList.toggle("sg-label-gone", !show);
      }
      const dim = y > 220;
      if (dim !== dimmed) {
        dimmed = dim;
        root.classList.toggle("sg-root-dim", dim);
      }
    };
    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };

    build();
    applyMotion(isPaused);
    // The mono webfont lands after first paint: restamp the sheets when it does.
    if (document.fonts && document.fonts.status !== "loaded") {
      document.fonts.ready.then(() => {
        if (disposed) return;
        buildAtlases();
        if (isPaused) draw(performance.now() / 1000, 0);
      });
    }
    const labelTimer = isPaused ? window.setTimeout(() => setPaused(true), 0) : 0;
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      disposed = true;
      setMotionRef.current = null;
      stop();
      window.clearTimeout(rt);
      window.clearTimeout(labelTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const toggleMotion = () => {
    const next = !paused;
    setPaused(next);
    setMotionRef.current?.(next);
    try {
      window.localStorage.setItem(MOTION_KEY, next ? "paused" : "playing");
    } catch {}
  };

  return (
    <>
      <div ref={rootRef} aria-hidden className="sg-root">
        <div className="sg-sky" />
        <canvas ref={canvasRef} className="sg-canvas" />
        <div className="sg-scrim" />
        {/* Past the hero the page's own copy runs over the globe wherever a
            section puts it, so the backdrop recedes rather than trusting the
            layout to keep clear of the bright side. */}
        <div className="sg-veil" aria-hidden />
        <div className="sg-label" ref={labelRef} aria-hidden>
          <span className="sg-label-head">UNITED KINGDOM</span>
          <span className="sg-label-sub">
            <span className="sg-label-lead">SOURCE</span>
            <span className="sg-label-dot" />
            <span className="sg-label-brand">ALGORITHMX</span>
          </span>
        </div>
      </div>

      <button type="button" className="sg-motion" onClick={toggleMotion}>
        {paused ? (
          <svg viewBox="0 0 12 12" aria-hidden>
            <path d="M3 1.8v8.4L10.2 6z" fill="currentColor" />
          </svg>
        ) : (
          <svg viewBox="0 0 12 12" aria-hidden>
            <rect x="2.4" y="1.8" width="2.6" height="8.4" rx="0.6" fill="currentColor" />
            <rect x="7" y="1.8" width="2.6" height="8.4" rx="0.6" fill="currentColor" />
          </svg>
        )}
        <span className="sg-motion-label">{paused ? "Play animation" : "Pause animation"}</span>
      </button>

      <style>{`
        .sg-root {
          position: fixed;
          inset: 0;
          z-index: -1;
          pointer-events: none;
          overflow: hidden;
          background: #03071a;
        }
        /* The sky is CSS, so it paints with the server HTML. */
        .sg-sky {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 72% 46%, rgba(18,52,104,0.85) 0%, rgba(8,20,54,0.5) 45%, rgba(3,7,26,0) 72%),
            linear-gradient(180deg, #071231 0%, #040a20 55%, #02050f 100%);
        }
        /* Sized and placed in script: it covers the globe, not the screen. */
        .sg-canvas {
          position: absolute;
          left: 0;
          top: 0;
        }
        /* Keeps the reading column calm and legible over the globe, and gives
           the nav and the top row a dark bed wherever the globe reaches. */
        .sg-veil {
          position: absolute;
          inset: 0;
          background: rgba(3,7,26,0.55);
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .sg-root-dim .sg-veil { opacity: 1; }

        .sg-label {
          transition: opacity 0.35s ease;
          position: absolute;
          display: none;
          flex-direction: column;
          gap: calc(var(--sg-label-px, 18px) * 0.34);
          font-family: var(--lv2-font-mono, ui-monospace, monospace);
          line-height: 1;
          white-space: nowrap;
          pointer-events: none;
        }
        /* Same rule as the leader: only where the globe has a column of its
           own does an annotation have anywhere to sit. */
        @media (min-width: 1100px) {
          .sg-label { display: flex; }
        }
        .sg-label-gone { opacity: 0; }
        .sg-label-head {
          font-size: var(--sg-label-px, 18px);
          font-weight: 700;
          letter-spacing: 0.13em;
          color: #ffd9a2;
          text-shadow: 0 0 calc(var(--sg-label-px, 18px) * 0.75) rgba(255,181,84,0.7), 0 0 2px rgba(3,8,26,0.95);
        }
        .sg-label-sub {
          display: flex;
          align-items: center;
          gap: calc(var(--sg-label-px, 18px) * 0.44);
          font-size: calc(var(--sg-label-px, 18px) * 0.78);
          font-weight: 700;
          letter-spacing: 0.15em;
        }
        .sg-label-lead { color: #8fb6dc; }
        .sg-label-dot {
          width: calc(var(--sg-label-px, 18px) * 0.16);
          height: calc(var(--sg-label-px, 18px) * 0.16);
          background: rgba(125,240,255,0.7);
        }
        .sg-label-brand {
          color: #e8fbff;
          text-shadow: 0 0 calc(var(--sg-label-px, 18px) * 0.62) rgba(110,230,255,0.85), 0 0 2px rgba(3,8,26,0.95);
        }

        .sg-scrim {
          position: absolute;
          inset: 0;
          background:
            linear-gradient(180deg, rgba(3,7,26,0.93) 0px, rgba(3,7,26,0.88) 130px, rgba(3,7,26,0.64) 205px, rgba(3,7,26,0.22) 310px, rgba(3,7,26,0) 420px),
            radial-gradient(ellipse 52% 62% at 26% 50%, rgba(3,7,26,0.86) 0%, rgba(3,7,26,0.46) 58%, rgba(3,7,26,0) 84%);
        }
        /* Below 1100 the page's copy runs the full width over the globe, so
           the veil is even rather than a column: the same width at which the
           labels and city names stand down. */
        @media (max-width: 1099px) {
          .sg-scrim {
            background: linear-gradient(180deg, rgba(3,7,26,0.9) 0%, rgba(3,7,26,0.76) 38%, rgba(3,7,26,0.62) 70%, rgba(3,7,26,0.58) 100%);
          }
        }

        .sg-motion {
          position: fixed;
          left: max(14px, env(safe-area-inset-left));
          bottom: max(14px, env(safe-area-inset-bottom));
          z-index: 40;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 30px;
          height: 30px;
          padding: 0;
          border-radius: 999px;
          border: 1px solid rgba(125,240,255,0.26);
          background: rgba(5,12,32,0.88);
          color: rgba(233,242,255,0.82);
          /* A pause control is required for anything that moves on its own
             (WCAG 2.2.2), but it does not have to announce itself: it sits as
             a faint dot and comes up on hover, focus or keyboard. */
          opacity: 0.26;
          font-family: var(--lv2-font-mono, ui-monospace, monospace);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          line-height: 1;
          cursor: pointer;
          transition: border-color 0.2s ease, color 0.2s ease, opacity 0.25s ease;
        }
        .sg-motion:hover,
        .sg-motion:focus-visible {
          border-color: rgba(125,240,255,0.6);
          color: #fff;
          opacity: 1;
        }
        .sg-motion:focus-visible {
          outline: 2px solid #7df0ff;
          outline-offset: 3px;
        }
        .sg-motion svg {
          width: 11px;
          height: 11px;
          flex: none;
        }
        /* The words are for assistive tech only, at every width. */
        .sg-motion-label {
          position: absolute;
          width: 1px;
          height: 1px;
          overflow: hidden;
          clip-path: inset(50%);
          white-space: nowrap;
        }
      `}</style>
    </>
  );
}
