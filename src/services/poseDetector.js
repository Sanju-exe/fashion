/**
 * MediaPipe Pose Detector Module
 * Handles model initialization, landmark extraction, and torso geometry calculations.
 */

let poseInstance = null;
let isInitialized = false;
let initPromise = null;

/**
 * Initializes the MediaPipe Pose model.
 */
export async function initPoseDetector() {
  if (isInitialized && poseInstance) return poseInstance;
  if (initPromise) return initPromise;

  initPromise = new Promise(async (resolve, reject) => {
    try {
      // 1. Try global window.Pose loaded via CDN script
      let PoseClass = window.Pose;

      // 2. Fallback to npm package if global not present
      if (!PoseClass) {
        try {
          const mpPose = await import('@mediapipe/pose');
          PoseClass = mpPose.Pose || mpPose.default?.Pose;
        } catch (e) {
          console.warn('Could not import @mediapipe/pose via ESM:', e);
        }
      }

      if (!PoseClass) {
        console.warn('MediaPipe Pose library not yet loaded. Will retry or use smart heuristic.');
        resolve(null);
        return;
      }

      poseInstance = new PoseClass({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`
      });

      poseInstance.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      await poseInstance.initialize();
      isInitialized = true;
      console.log('MediaPipe Pose detector initialized successfully.');
      resolve(poseInstance);
    } catch (err) {
      console.error('Failed to initialize MediaPipe Pose:', err);
      resolve(null); // Resolve null so fallback can take over gracefully
    }
  });

  return initPromise;
}

/**
 * Extracts and calculates torso geometry from MediaPipe landmarks.
 * @param {Array} landmarks - 33 3D landmarks from MediaPipe
 * @param {number} width - Canvas/Display width
 * @param {number} height - Canvas/Display height
 * @param {boolean} isMirrored - Whether camera stream is mirrored
 */
export function extractTorsoGeometry(landmarks, width, height, isMirrored = false) {
  if (!landmarks || landmarks.length < 25) return null;

  // Key landmarks
  // 11: left_shoulder, 12: right_shoulder
  // 23: left_hip, 24: right_hip
  // 0: nose
  const rawLShoulder = landmarks[11];
  const rawRShoulder = landmarks[12];
  const rawLHip = landmarks[23];
  const rawRHip = landmarks[24];
  const rawNose = landmarks[0];

  // Check visibility/confidence
  const shoulderConfidence = ((rawLShoulder?.visibility ?? 1) + (rawRShoulder?.visibility ?? 1)) / 2;
  if (shoulderConfidence < 0.35) return null;

  // Convert normalized [0, 1] to canvas pixel space
  const mapPoint = (p) => {
    let px = p.x;
    if (isMirrored) {
      px = 1 - px;
    }
    return {
      x: px * width,
      y: p.y * height,
      z: p.z || 0,
      visibility: p.visibility ?? 1
    };
  };

  const ls = mapPoint(rawLShoulder);
  const rs = mapPoint(rawRShoulder);
  const lh = rawLHip ? mapPoint(rawLHip) : null;
  const rh = rawRHip ? mapPoint(rawRHip) : null;
  const nose = rawNose ? mapPoint(rawNose) : null;

  // Identify screen-left vs screen-right shoulder
  const screenLeftShoulder = ls.x < rs.x ? ls : rs;
  const screenRightShoulder = ls.x < rs.x ? rs : ls;

  // Calculate shoulder metrics
  const dx = screenRightShoulder.x - screenLeftShoulder.x;
  const dy = screenRightShoulder.y - screenLeftShoulder.y;
  const shoulderWidth = Math.sqrt(dx * dx + dy * dy);
  const shoulderAngle = Math.atan2(dy, dx);

  // Center point of shoulders / upper chest
  const shoulderCenter = {
    x: (screenLeftShoulder.x + screenRightShoulder.x) / 2,
    y: (screenLeftShoulder.y + screenRightShoulder.y) / 2
  };

  // Torso height estimation
  let torsoHeight = shoulderWidth * 1.35; // Default standard human anatomical ratio
  let hipsDetected = false;
  let hipCenter = null;

  if (lh && rh && (lh.visibility + rh.visibility) / 2 > 0.4) {
    hipsDetected = true;
    hipCenter = {
      x: (lh.x + rh.x) / 2,
      y: (lh.y + rh.y) / 2
    };
    const hdx = hipCenter.x - shoulderCenter.x;
    const hdy = hipCenter.y - shoulderCenter.y;
    torsoHeight = Math.sqrt(hdx * hdx + hdy * hdy);
  }

  // 3D rotation / Yaw tilt estimation based on z-depth
  const zDiff = (screenRightShoulder.z - screenLeftShoulder.z);
  const yawAngle = Math.max(-0.4, Math.min(0.4, zDiff * 1.5));

  return {
    screenLeftShoulder,
    screenRightShoulder,
    shoulderCenter,
    shoulderWidth,
    shoulderAngle,
    torsoHeight,
    hipsDetected,
    hipCenter,
    nose,
    yawAngle,
    confidence: shoulderConfidence,
    rawLandmarks: landmarks
  };
}

/**
 * Runs pose detection on a static image (e.g. uploaded photo or preset model).
 * @param {HTMLImageElement|HTMLCanvasElement} imageElement 
 * @param {number} width 
 * @param {number} height 
 */
export async function detectPoseFromImage(imageElement, width, height) {
  const detector = await initPoseDetector();
  if (!detector) {
    // Return heuristic center estimate if detector not loaded
    return getFallbackTorso(width, height);
  }

  return new Promise((resolve) => {
    let timeoutId = setTimeout(() => {
      console.warn('Pose detection timed out, using fallback');
      resolve(getFallbackTorso(width, height));
    }, 4000);

    const onResults = (results) => {
      clearTimeout(timeoutId);
      if (results.poseLandmarks) {
        const torso = extractTorsoGeometry(results.poseLandmarks, width, height, false);
        if (torso) {
          resolve(torso);
          return;
        }
      }
      resolve(getFallbackTorso(width, height));
    };

    detector.onResults(onResults);
    detector.send({ image: imageElement }).catch((err) => {
      console.error('Error in detector.send:', err);
      clearTimeout(timeoutId);
      resolve(getFallbackTorso(width, height));
    });
  });
}

/**
 * Fallback torso geometry when no human is detected or detector is unavailable.
 */
export function getFallbackTorso(width, height) {
  const shoulderWidth = width * 0.42;
  const shoulderCenter = {
    x: width * 0.5,
    y: height * 0.42
  };
  return {
    screenLeftShoulder: { x: shoulderCenter.x - shoulderWidth / 2, y: shoulderCenter.y, z: 0 },
    screenRightShoulder: { x: shoulderCenter.x + shoulderWidth / 2, y: shoulderCenter.y, z: 0 },
    shoulderCenter,
    shoulderWidth,
    shoulderAngle: 0,
    torsoHeight: shoulderWidth * 1.35,
    hipsDetected: false,
    confidence: 0.5,
    isFallback: true
  };
}
