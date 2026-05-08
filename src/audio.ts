let activeAudio: HTMLAudioElement | null = null;

export async function playAudio(url: string) {
  if (activeAudio) {
    activeAudio.pause();
    activeAudio.currentTime = 0;
  }

  activeAudio = new Audio(url);
  activeAudio.preload = "none";
  await activeAudio.play();
}
