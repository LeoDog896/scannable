<script lang="ts">
  import { renderCanvas, renderText, renderTwoTone, type MaskType } from "../../../../src"
  import RenderSystemDisplay from "$lib/qr/RenderSystem.svelte";
  import { createRenderSystems } from "$lib/qr/rendererTypes";

  const renderSystems = createRenderSystems([{
    type: "canvas",
    name: "Simple Image",
    render: (value, canvas, options, size) => {
      clearCanvas(canvas)
      const context = canvas.getContext("2d")
      context.fillStyle = options.backgroundColor.value;
      context.globalAlpha = options.backgroundTransparency.value;
      context.fillRect(0, 0, canvas.width, canvas.height)
      renderCanvas({ 
        value, 
        foregroundColor: options.foregroundColor.value,
        backgroundAlpha: 0,
        // we dont specify background as it's handled by padding.
        x: options.padding.value || 0,
        y: options.padding.value || 0,
        width: size,
        height: size,
        maskType: options.customMask.value ? options.mask.value : undefined
      }, canvas)
    },
    options: {
      foregroundColor: { type: "color", name: "Foreground Color", value: "#000000", defaultValue: "#000000" },
      backgroundColor: { type: "color", name: "Background Color", value: "#ffffff", defaultValue: "#ffffff" },
      foregroundTransparency: { type: "number", name: "Foreground Transparency", value: 1, defaultValue: 1, min: 0, max: 1, step: 0.1 },
      backgroundTransparency: { type: "number", name: "Background Transparency", value: 1, defaultValue: 1, min: 0, max: 1, step: 0.1 },
      padding: { type: "number", min: 0, name: "Padding", defaultValue: 0, value: 50 },
      customMask: { type: "boolean", value: false, defaultValue: false, name: "Custom Mask" },
      mask: { type: "number", min: 0, max: 7, name: "Mask Number", defaultValue: 0, value: 0 }
    }
  }, {
    type: "text",
    name: "Unicode",
    render: (value, options) => renderTwoTone({
      value,
      maskType: options.customMask.value ? options.mask.value : undefined
    }),
    lineSpacing: "1.1rem",
    tracking: "-0.05em",
    options: {
      customMask: { type: "boolean", value: false, defaultValue: false, name: "Custom Mask" },
      mask: { type: "number", min: 0, max: 7, name: "Mask Number", defaultValue: 0, value: 0 }
    }
  }, {
    type: "text",
    name: "ASCII",
    render: (value, { foregroundChar, backgroundChar, thickness, inverse, padding, customMask, mask }) => renderText({ 
      value, // NOTE: foreground = 0, background = 1
      foregroundChar: "0".repeat(thickness.value),
      backgroundChar: "1".repeat(thickness.value),
      maskType: customMask.value ? mask.value : undefined
    }).split("\n")
      .map(it => "1".repeat(padding.value) + it + "1".repeat(padding.value)) // padding
      .map(it => (it + "\n").repeat(thickness.value).slice(0, -1)) // thickness
      .join("\n")
      .replaceAll("0", inverse.value ? backgroundChar.value : foregroundChar.value)
      .replaceAll("1", inverse.value ? foregroundChar.value : backgroundChar.value),
    lineSpacing: ".75rem",
    tracking: "0",
    options: { 
      foregroundChar: { type: "text", name: "Foreground Character", value: "%", defaultValue: "%" },
      backgroundChar: { type: "text", name: "Background Character", value: " ", defaultValue: " " },
      thickness: { type: "number", name: "Thickness", value: 1, defaultValue: 1, min: 0 },
      padding: { type: "number", name: "Padding", value: 0, defaultValue: 0, min: 0 },
      inverse: { type: "boolean", name: "Inverse", value: false, defaultValue: false },
      customMask: { type: "boolean", value: true, defaultValue: true, name: "Custom Mask" },
      mask: { type: "number", min: 0, max: 7, name: "Mask Number", defaultValue: 0, value: 0 }
    }
  }])

  function clearCanvas(canvas: HTMLCanvasElement) {
    canvas.getContext("2d")?.clearRect(0, 0, canvas.width, canvas.height)
  }

  let selectedRenderSystem = renderSystems[0]
  let value = ""

</script>
<div class="flex flex-row w-screen h-screen">
  <div class="bg-white z-10 flex-row w-1/5 place-content-between hidden sm:block print:hidden overflow-x-scroll">
    {#if selectedRenderSystem.options}
      <div class="m-4 flex flex-wrap flex-col">
        {#each Object.values(selectedRenderSystem.options) as option}
          <div class="border-b mb-12 border-gray-400">
            <label for={option.name}>{option.name}:</label>
            {#if option.type == "text"}
              <input id={option.name} class="transition-all border-b w-full" bind:value={option.value} placeholder={option.name}/>
            {:else if option.type == "color"}
              <input type="color" bind:value={option.value}>
            {:else if option.type == "number"}
              <input type="number" class="w-full" min={option.min ?? Number.MIN_SAFE_INTEGER} max={option.max ?? Number.MAX_SAFE_INTEGER} step={option.step ?? 1} bind:value={option.value}>
            {:else if option.type == "boolean"}
              <input type="checkbox" bind:checked={option.value}>
            {/if}
          </div>
        {/each}
      </div>
    {/if}
  </div>
  <div class="border-l border-gray-400 flex-shrink flex sm:flex-col flex-row sm:w-32 w-full sm:h-full bg-gray-100 print:hidden shadow-lg">
    {#each renderSystems as renderSystem}
      <div tabindex=0 class="
        w-full text-center {selectedRenderSystem == renderSystem ? "bg-gray-200 font-bold" : "bg-gray-100"} hover:bg-gray-300
        hover:cursor-pointer transition-colors p-6 px-8 text-lg
      "
      on:click={() => {selectedRenderSystem = renderSystem}}
      on:keydown={(e) => {
        if (e.key == "Enter") {
          selectedRenderSystem = renderSystem
        }
      }}
      >{renderSystem.name}</div>
    {/each}
  </div>
  <div class="flex sm:flex-row flex-col flex-grow w-full">
    <div class="h-full flex-grow p-8">
      <textarea tabindex=0
        placeholder="Type URL here (EX: https://example.com). The current QR code is empty."
        class="flex-grow w-full text-center mb-8 print:hidden" bind:value={value}
      />
      <RenderSystemDisplay {selectedRenderSystem} {value} />
    </div>
  </div>
</div>