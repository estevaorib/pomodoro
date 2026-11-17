let contexto: AudioContext | null = null;

export function prepararAudio() {
  contexto ??= new AudioContext();
  if (contexto.state === "suspended") contexto.resume();
}

export function tocarAlerta() {
  prepararAudio();
  if (!contexto) return;

  const oscilador = contexto.createOscillator();
  const volume = contexto.createGain();
  const inicio = contexto.currentTime;

  oscilador.type = "sine";
  oscilador.frequency.setValueAtTime(587.33, inicio);
  volume.gain.setValueAtTime(0.12, inicio);
  volume.gain.exponentialRampToValueAtTime(0.001, inicio + 0.9);

  oscilador.connect(volume);
  volume.connect(contexto.destination);
  oscilador.start(inicio);
  oscilador.stop(inicio + 0.9);
}
