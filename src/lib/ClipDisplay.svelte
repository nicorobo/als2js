<script lang="ts">
  import type { Track } from '../../lib/main'
  export let tracks: Track[] // this is the array of tracks that we want to display
  const getMaxClipEnd = (tracks: Track[]) => {
    let max = 0
    for (let i = 0; i < tracks.length; i++) {
      const track = tracks[i]
      for (let j = 0; j < track.clips.length; j++) {
        const clip = track.clips[j]
        if (clip.end > max) max = clip.end
      }
    }
    return max
  }

  $: maxClipEnd = getMaxClipEnd(tracks)

  let canvas: HTMLCanvasElement
  $: if (canvas) {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      for (let i = 0; i < tracks.length; i++) {
        const track = tracks[i]
        for (let j = 0; j < track.clips.length; j++) {
          const clip = track.clips[j]
          ctx.fillStyle = clip.color
          const x = (clip.start / maxClipEnd) * 500
          const y = (i / tracks.length) * 300
          const width = ((clip.end - clip.start) / maxClipEnd) * 500 - 3
          const height = 300 / tracks.length - 3
          ctx.fillRect(x, y, width, height)
        }
      }
    }
  }
</script>

<canvas bind:this={canvas} height="300" width="500" />

<style>
</style>
