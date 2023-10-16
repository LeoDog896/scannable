<script>
  import { renderText, generateFrame, renderTwoTone, renderSVG } from '../../../src';
  import { onMount } from "svelte"

  onMount(() => {
    globalThis.renderText = renderText
    globalThis.renderSVG = renderSVG
    globalThis.renderTwoTone = renderTwoTone
    globalThis.generateFrame = generateFrame

    console.log("Welcome to scannable! All [renderText, renderTwoTone, renderSvg, generateFrame] functions are now available as global variables. Feel free to play around with it!")
  })

	import '../app.css';
</script>

<slot />
