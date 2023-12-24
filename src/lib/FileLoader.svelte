<script lang="ts">
  import { AbletonParser, type Track } from '../../lib/main'
  import ClipDisplay from './ClipDisplay.svelte'
  import TrackDisplay from './TrackDisplay.svelte'
  let files: FileList | null = null
  let promise: Promise<Track[]> | null = null

  const parseFile = (e: SubmitEvent) => {
    e.preventDefault()
    if (!files || files.length <= 0) return
    promise = loadFile(files[0])
  }

  async function loadFile(file: File) {
    const parser = await AbletonParser.parseAbletonFile(file)
    const tracks = parser.tracks()
    console.log(tracks)
    return tracks
  }
</script>

<form
  id="ableton-file-form"
  enctype="multipart/form-data"
  on:submit={parseFile}>
  <label for="file-upload">Upload an Ableton Live project file (.als):</label>
  <input
    bind:files
    type="file"
    id="file-upload"
    name="file"
    accept=".als"
    required />
  <button type="submit">Upload</button>
</form>

<p>
  {#await promise}
    Loading Project File...
  {:then tracks}
    {#if tracks && tracks.length > 0}
      <ClipDisplay {tracks} />
      <TrackDisplay {tracks} />
    {:else}
      <p>No tracks found.</p>
    {/if}
  {:catch someError}
    System error: {someError.message}.
  {/await}
</p>
