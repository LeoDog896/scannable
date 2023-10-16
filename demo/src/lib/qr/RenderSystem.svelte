<script lang="ts">
  import { tick } from "svelte";

  import type { RenderSystem } from "./rendererTypes"

  export let value: string
  export let selectedRenderSystem: RenderSystem<any>
  
  let w: number

  const baseSize = 100
  $: chosenSize = Math.round(baseSize + w / 4)
  $: size = Math.round(chosenSize + ((selectedRenderSystem.options.padding?.value || 0) * 2))

  $: if (size && selectedRenderSystem.type == "canvas") {
    tick().then(() => {
      if (selectedRenderSystem.type == "canvas" && selectedRenderSystem.currentCanvas)
        selectedRenderSystem.render(value, selectedRenderSystem.currentCanvas, selectedRenderSystem.options, chosenSize)
    })
  }
</script>

<svelte:window bind:innerWidth={w}></svelte:window>

{#if selectedRenderSystem.name == "ASCII" && selectedRenderSystem.type == "text"}
  <h1 class="font-mono text-center my-10" style="
    line-height: 10px;
    letter-spacing: 0;
    font-size: 12px;
    ">
      {@html selectedRenderSystem
        .render(value, selectedRenderSystem.options)
        .replaceAll("\n", "<br/>")
        .replaceAll(" ", "&nbsp;")
      }
  </h1>
{:else if selectedRenderSystem.type == "text"}
  <h1 class="font-mono text-center my-10" style="
  line-height: {selectedRenderSystem.lineSpacing};
  letter-spacing: {selectedRenderSystem.tracking}
  ">
    {@html selectedRenderSystem
      .render(value, selectedRenderSystem.options)
      .replaceAll("\n", "<br/>")
      .replaceAll(" ", "&nbsp;")
    }
  </h1>
{:else if selectedRenderSystem.type == "canvas"}
  {#if selectedRenderSystem.name == "Simple Image"}
    <canvas class="m-auto" height={size} width={size} bind:this={selectedRenderSystem.currentCanvas} />
  {:else}
    <canvas class="m-auto" height={size} width={size} bind:this={selectedRenderSystem.currentCanvas} />
  {/if}
{/if}