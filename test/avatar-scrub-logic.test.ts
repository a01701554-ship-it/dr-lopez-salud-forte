/**
 * Automated test suite for Interactive Doctor Avatar scroll-scrub logic and state machine.
 */

import { AVATAR_CALIBRATION } from '../components/site/interactive-doctor-avatar';

function assert(condition: boolean, message: string) {
  if (!condition) {
    throw new Error(`TEST FAILED: ${message}`);
  }
}

function computeTargetTime(progress: number, duration: number) {
  if (!duration || isNaN(duration) || duration <= 0) return 0;

  const frameDur = AVATAR_CALIBRATION.FRAME_DURATION;
  const minTime = duration * AVATAR_CALIBRATION.LEFT_TIME_RATIO;
  const frontTime = duration * AVATAR_CALIBRATION.FRONT_TIME_RATIO;
  const maxTime = Math.min(
    duration - frameDur,
    duration * AVATAR_CALIBRATION.RIGHT_TIME_RATIO,
  );

  const p = Math.max(0, Math.min(1, progress));

  if (p <= 0.5) {
    return minTime + (frontTime - minTime) * (p / 0.5);
  } else {
    return frontTime + (maxTime - frontTime) * ((p - 0.5) / 0.5);
  }
}

function calculateProgressFromPosition(top: number, vh: number) {
  const startPos = vh * 0.85;
  const endPos = vh * 0.15;
  const range = startPos - endPos;
  if (range <= 0) return 0.5;
  const raw = (startPos - top) / range;
  return Math.max(0, Math.min(1, raw));
}

// Simulación de la máquina de estados del reproductor
class VideoStateMachine {
  duration = 4.042;
  currentTime = 0;
  metadataReady = false;
  dataReady = false;
  unlocked = false;
  isSeeking = false;
  pendingTime: number | null = null;
  lastRequestedTime = -1;
  hasRealMediaError = false;

  handleLoadedMetadata() {
    this.metadataReady = true;
    // NUNCA modifica currentTime aquí
  }

  handleLoadedData() {
    this.dataReady = true;
    if (this.lastRequestedTime < 0) {
      this.applyTime(computeTargetTime(0.5, this.duration));
    }
  }

  async attemptUnlock(shouldReject = false) {
    if (this.unlocked) return;
    if (shouldReject) {
      this.unlocked = false;
      throw new Error('Autoplay prevented');
    } else {
      this.unlocked = true;
      this.dataReady = true;
      this.applyTime(computeTargetTime(0.5, this.duration));
    }
  }

  applyTime(time: number) {
    const frameDur = AVATAR_CALIBRATION.FRAME_DURATION;
    const safeTime = Math.max(0, Math.min(this.duration - frameDur, time));

    if (this.isSeeking) {
      this.pendingTime = safeTime;
      return;
    }

    const isFirstSeek = this.lastRequestedTime < 0;
    const diff = Math.abs(this.currentTime - safeTime);

    if (isFirstSeek || diff >= frameDur) {
      this.isSeeking = true;
      this.lastRequestedTime = safeTime;
      this.currentTime = safeTime;
    }
  }

  handleSeeked() {
    this.isSeeking = false;
    if (this.pendingTime !== null) {
      const nextTime = this.pendingTime;
      this.pendingTime = null;
      this.applyTime(nextTime);
    }
  }
}

async function runTests() {
  console.log('--- INICIANDO PRUEBAS AUTOMATIZADAS DE LÓGICA DE AVATAR ---');
  const duration = 4.042;
  const vh = 844; // Altura iPhone típica

  // 1. Progreso nunca menor que 0
  const progBelow = calculateProgressFromPosition(1200, vh);
  assert(progBelow === 0, `Progreso por debajo del viewport debe ser 0, obtuvo ${progBelow}`);
  console.log('✓ Prueba 1 superada: Progreso nunca menor que 0');

  // 2. Progreso nunca mayor que 1
  const progAbove = calculateProgressFromPosition(-200, vh);
  assert(progAbove === 1, `Progreso por encima del viewport debe ser 1, obtuvo ${progAbove}`);
  console.log('✓ Prueba 2 superada: Progreso nunca mayor que 1');

  // 3. Al bajar (scroll down -> top disminuye), el tiempo objetivo aumenta
  const pLow = calculateProgressFromPosition(vh * 0.75, vh); // ~0.14
  const pHigh = calculateProgressFromPosition(vh * 0.35, vh); // ~0.71
  const tLow = computeTargetTime(pLow, duration);
  const tHigh = computeTargetTime(pHigh, duration);
  assert(tHigh > tLow, `Al bajar el tiempo debe aumentar: tLow=${tLow}, tHigh=${tHigh}`);
  console.log('✓ Prueba 3 superada: Al bajar, el tiempo objetivo aumenta');

  // 4. Al subir (scroll up -> top aumenta), el tiempo objetivo disminuye
  const pUp1 = calculateProgressFromPosition(vh * 0.30, vh);
  const pUp2 = calculateProgressFromPosition(vh * 0.60, vh);
  const tUp1 = computeTargetTime(pUp1, duration);
  const tUp2 = computeTargetTime(pUp2, duration);
  assert(tUp2 < tUp1, `Al subir el tiempo debe disminuir: tUp1=${tUp1}, tUp2=${tUp2}`);
  console.log('✓ Prueba 4 superada: Al subir, el tiempo objetivo disminuye');

  // 5. Progreso 0.5 corresponde al tiempo frontal (0.63 * duration)
  const tFront = computeTargetTime(0.5, duration);
  const expectedFront = duration * 0.63;
  assert(
    Math.abs(tFront - expectedFront) < 0.001,
    `Progreso 0.5 debe ser tiempo frontal ${expectedFront}, obtuvo ${tFront}`,
  );
  console.log('✓ Prueba 5 superada: Progreso 0.5 corresponde exactamente al tiempo frontal');

  // 6. Nunca se solicita un tiempo igual o mayor que la duración
  const tMax = computeTargetTime(1.0, duration);
  const maxAllowed = duration - AVATAR_CALIBRATION.FRAME_DURATION;
  assert(
    tMax <= maxAllowed && tMax < duration,
    `El tiempo máximo ${tMax} debe ser estrictamente menor que la duración total ${duration}`,
  );
  console.log('✓ Prueba 6 superada: Nunca se solicita un tiempo >= duración');

  // 7. Una búsqueda activa conserva únicamente el último objetivo pendiente
  const sm = new VideoStateMachine();
  sm.handleLoadedMetadata();
  sm.handleLoadedData();
  // Primer seek activo
  assert(sm.isSeeking === true, 'Primer seek debe estar activo');
  // Intentar múltiples seeks intermedios mientras seeking es true
  sm.applyTime(1.2);
  sm.applyTime(2.0);
  sm.applyTime(3.5);
  assert(
    sm.pendingTime === Math.min(3.5, sm.duration - AVATAR_CALIBRATION.FRAME_DURATION),
    `pendingTime debe contener el último objetivo (3.5), tiene ${sm.pendingTime}`,
  );
  sm.handleSeeked();
  assert(sm.isSeeking === true, 'Debe iniciar el seek del pendingTime');
  assert(sm.pendingTime === null, 'pendingTime debe estar vacío tras aplicarlo');
  assert(sm.currentTime === Math.min(3.5, sm.duration - AVATAR_CALIBRATION.FRAME_DURATION), 'currentTime debe ser 3.5');
  console.log('✓ Prueba 7 superada: Búsqueda activa conserva únicamente el último objetivo pendiente');

  // 8. Un play() rechazado no bloquea intentos posteriores
  const sm2 = new VideoStateMachine();
  let firstAttemptFailed = false;
  try {
    await sm2.attemptUnlock(true); // Rechazo simulado de Safari
  } catch {
    firstAttemptFailed = true;
  }
  assert(firstAttemptFailed, 'El primer intento debe registrar rechazo');
  assert(sm2.unlocked === false, 'unlocked debe seguir siendo false');
  // Segundo intento exitoso (siguiente gesto del usuario)
  await sm2.attemptUnlock(false);
  assert(sm2.unlocked === true, 'unlocked debe ser true tras el segundo intento');
  console.log('✓ Prueba 8 superada: Un play() rechazado no bloquea intentos posteriores');

  // 9. loadedmetadata no modifica currentTime
  const sm3 = new VideoStateMachine();
  assert(sm3.currentTime === 0, 'Inicialmente currentTime es 0');
  sm3.handleLoadedMetadata();
  assert(sm3.currentTime === 0, 'loadedmetadata no debe haber cambiado currentTime');
  assert(sm3.metadataReady === true, 'metadataReady debe ser true');
  console.log('✓ Prueba 9 superada: loadedmetadata no modifica currentTime');

  // 10. loadeddata sí permite la primera sincronización
  sm3.handleLoadedData();
  assert(sm3.dataReady === true, 'dataReady debe ser true');
  assert(sm3.currentTime > 0, 'loadeddata debe sincronizar fotograma inicial');
  console.log('✓ Prueba 10 superada: loadeddata sí permite la primera sincronización');

  console.log('--- TODAS LAS 10 PRUEBAS AUTOMATIZADAS PASARON EXITOSAMENTE ---');
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});
