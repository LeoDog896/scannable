<script lang="ts">
	import { renderCanvas, renderText, renderTwoTone, renderSVG, type MaskType } from 'scannable/qr';
	import RenderSystemDisplay from '$lib/qr/RenderSystem.svelte';
	import { createRenderSystems } from '$lib/qr/rendererTypes';

	const renderSystems = createRenderSystems([
		{
			type: 'html',
			name: 'SVG',
			render: (value, options, size) =>
				renderSVG({
					value,
					maskType: options.customMask.value ? options.mask.value : undefined,
					width: size,
					height: size
				}),
			options: {
				customMask: { type: 'boolean', value: true, defaultValue: true, name: 'Custom Mask' },
				mask: { type: 'number', min: 0, max: 7, name: 'Mask Number', defaultValue: 0, value: 0 }
			}
		},
		{
			type: 'canvas',
			name: 'Simple Image',
			render: (value, canvas, options, size) => {
				clearCanvas(canvas);
				const context = canvas.getContext('2d');
				context.fillStyle = options.backgroundColor.value;
				context.globalAlpha = options.backgroundTransparency.value;
				context.fillRect(0, 0, canvas.width, canvas.height);
				renderCanvas(
					{
						value,
						foregroundColor: options.foregroundColor.value,
						backgroundAlpha: 0,
						// we dont specify background as it's handled by padding.
						x: options.padding.value || 0,
						y: options.padding.value || 0,
						width: size,
						height: size,
						maskType: options.customMask.value ? options.mask.value : undefined
					},
					canvas
				);
			},
			options: {
				foregroundColor: {
					type: 'color',
					name: 'Foreground Color',
					value: '#000000',
					defaultValue: '#000000'
				},
				backgroundColor: {
					type: 'color',
					name: 'Background Color',
					value: '#ffffff',
					defaultValue: '#ffffff'
				},
				foregroundTransparency: {
					type: 'number',
					name: 'Foreground Transparency',
					value: 1,
					defaultValue: 1,
					min: 0,
					max: 1,
					step: 0.1
				},
				backgroundTransparency: {
					type: 'number',
					name: 'Background Transparency',
					value: 1,
					defaultValue: 1,
					min: 0,
					max: 1,
					step: 0.1
				},
				padding: { type: 'number', min: 0, name: 'Padding', defaultValue: 0, value: 50 },
				customMask: { type: 'boolean', value: false, defaultValue: false, name: 'Custom Mask' },
				mask: { type: 'number', min: 0, max: 7, name: 'Mask Number', defaultValue: 0, value: 0 }
			}
		},
		{
			type: 'text',
			name: 'Unicode',
			render: (value, options) =>
				renderTwoTone({
					value,
					maskType: options.customMask.value ? options.mask.value : undefined
				}),
			lineSpacing: '1.6rem',
			tracking: '-0.05em',
			options: {
				customMask: { type: 'boolean', value: false, defaultValue: false, name: 'Custom Mask' },
				mask: { type: 'number', min: 0, max: 7, name: 'Mask Number', defaultValue: 0, value: 0 }
			}
		},
		{
			type: 'text',
			name: 'ASCII',
			render: (
				value,
				{ foregroundChar, backgroundChar, thickness, inverse, padding, customMask, mask }
			) =>
				renderText({
					value, // NOTE: foreground = 0, background = 1
					foregroundChar: '0'.repeat(thickness.value),
					backgroundChar: '1'.repeat(thickness.value),
					maskType: customMask.value ? mask.value : undefined
				})
					.split('\n')
					.map((it) => '1'.repeat(padding.value) + it + '1'.repeat(padding.value)) // padding
					.map((it) => (it + '\n').repeat(thickness.value).slice(0, -1)) // thickness
					.join('\n')
					.replaceAll('0', inverse.value ? backgroundChar.value : foregroundChar.value)
					.replaceAll('1', inverse.value ? foregroundChar.value : backgroundChar.value),
			lineSpacing: '.75rem',
			tracking: '0',
			options: {
				foregroundChar: {
					type: 'text',
					name: 'Foreground Character',
					value: '%',
					defaultValue: '%'
				},
				backgroundChar: {
					type: 'text',
					name: 'Background Character',
					value: ' ',
					defaultValue: ' '
				},
				thickness: { type: 'number', name: 'Thickness', value: 1, defaultValue: 1, min: 0 },
				padding: { type: 'number', name: 'Padding', value: 0, defaultValue: 0, min: 0 },
				inverse: { type: 'boolean', name: 'Inverse', value: false, defaultValue: false },
				customMask: { type: 'boolean', value: true, defaultValue: true, name: 'Custom Mask' },
				mask: { type: 'number', min: 0, max: 7, name: 'Mask Number', defaultValue: 0, value: 0 }
			}
		}
	]);

	function clearCanvas(canvas: HTMLCanvasElement) {
		canvas.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
	}

	let selectedRenderSystem = renderSystems[0];
	let value = '';
</script>

<div class="container">
	<div
		class="settings"
	>
    <h1>Settings</h1>
		{#if selectedRenderSystem.options}
			<div>
				{#each Object.values(selectedRenderSystem.options) as option}
					<div>
						<label for={option.name}>{option.name}:</label>
						{#if option.type == 'text'}
							<input
								id={option.name}
								bind:value={option.value}
								placeholder={option.name}
							/>
						{:else if option.type == 'color'}
							<input type="color" bind:value={option.value} />
						{:else if option.type == 'number'}
							<input
								type="number"
								min={option.min ?? Number.MIN_SAFE_INTEGER}
								max={option.max ?? Number.MAX_SAFE_INTEGER}
								step={option.step ?? 1}
								bind:value={option.value}
							/>
						{:else if option.type == 'boolean'}
							<input type="checkbox" bind:checked={option.value} />
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
	<div
		class="categories"
	>
		{#each renderSystems as renderSystem}
			<button
				on:click={() => {
					selectedRenderSystem = renderSystem;
				}}
				on:keydown={(e) => {
					if (e.key == 'Enter') {
						selectedRenderSystem = renderSystem;
					}
				}}>{renderSystem.name}</button
			>
		{/each}
	</div>
	<div class="display">
		<div class="display-sub">
			<textarea
				tabindex="0"
				placeholder="Type URL here (EX: https://example.com). The current QR code is empty."
				bind:value
			/>
			<RenderSystemDisplay {selectedRenderSystem} {value} />
		</div>
	</div>
</div>

<style>
  .container {
    display: flex;
    flex-direction: row;
    width: 100vw;
    height: 100vh;
  }

  .settings {
    overflow-x: scroll;
    z-index: 10;
    flex-direction: row;
    place-content: space-between;
    width: 20%;
    background-color: #ffffff;
    padding: 2rem;
  }

  .categories {
    display: flex;
    flex-direction: column;
    border-left-width: 1px;
    border-color: #9CA3AF;
    background-color: #F3F4F6;
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  textarea {
    margin-bottom: 2rem;
    flex-grow: 1;
    width: 100%;
    text-align: center;
  }

  .display {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 100%;
  }

  .display-sub {
    padding-left: 2rem;
    padding-right: 2rem;
    width: calc(100% - 4rem);
    display: flex;
    align-items: center;
    flex-direction: column;
  }
</style>
