let audioContext = null;

export async function initializeAlertSound() {
  if (typeof window === 'undefined') return null;

  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    console.warn('AudioContext is not supported in this browser.');
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
    console.log('Audio initialized');
  }

  if (audioContext.state === 'suspended') {
    await audioContext.resume();
    console.log('Audio resumed');
  }

  return audioContext;
}

export async function playAlertTone() {
  const context = await initializeAlertSound();
  if (!context) return;

  console.log('Violence threshold reached');
  console.log('Playing violence alert');

  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.type = 'square';
  oscillator.frequency.setValueAtTime(1000, context.currentTime);

  gainNode.gain.setValueAtTime(0.0001, context.currentTime);
  gainNode.gain.linearRampToValueAtTime(0.2, context.currentTime + 0.05);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.9);

  oscillator.connect(gainNode);
  gainNode.connect(context.destination);

  oscillator.start();
  oscillator.stop(context.currentTime + 1);
}
