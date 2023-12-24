<script lang="ts">
  import type { Track } from '../../lib/main'
  export let tracks: Track[] // this is the array of tracks that we want to display
</script>

<h2>Tracks</h2>
<ul>
  {#each tracks as track}
    <li>
      <span style="background-color: {track.color}" class="color-dot" />
      {track.name}
    </li>
    <pre>{JSON.stringify(track, null, 2)}</pre>
  {/each}
</ul>

<style>
  .color-dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    margin-right: 5px;
  }
  pre,
  li {
    text-align: left;
  }
</style>
