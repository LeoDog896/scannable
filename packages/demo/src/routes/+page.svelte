<script lang="ts">
	import { renderSVG } from 'scannable/qr';

	const links = [
		{ href: '/scannable/demo', name: 'Demo' },
		{ href: 'https://github.com/LeoDog896/scannable', name: 'GitHub' },
		{ href: 'https://npmjs.com/package/scannable', name: 'NPM' }
	];

	let svgContent = 'https://leodog896.github.io/scannable';
</script>

<header>
	<div class="center background-animate">
		<h1>Scannable</h1>

		<h2>Generate QR codes</h2>

		<div class="links">
			{#each links as link}
				<a href={link.href} class="link">
					{link.name}
				</a>
			{/each}
		</div>
	</div>

	<div class="qr-container">
		{@html renderSVG({ value: svgContent, width: 400, height: 400 })}
		<input
			placeholder="Enter URL"
			bind:value={svgContent}
		/>
	</div>
</header>

<style>
  .qr-container {
    padding: 2rem;
    margin-top: 5rem;
    border-radius: 0.5rem;
    background-color: #ffffff;
    text-align: center;
  }

  input {
    margin-top: 1.25rem;
    border-bottom-width: 1px;
    border-color: black;
    color: black;
    display: block;
    border: none;
    border-bottom: 1px solid black;
    width: 100%;
    text-align: center;
    font-size: 1rem;
  }

  .center {
    text-align: center;
  }

  .links {
    display: flex;
    flex-direction: row;
    justify-content: center;
    width: 100%;
  }

  .link {
    padding-top: 0.25rem;
    padding-bottom: 0.25rem;
    padding-left: 1rem;
    padding-right: 1rem;
    margin-left: 1rem;
    margin-right: 1rem;
    font-size: 1.25rem;
    line-height: 1.75rem;
    text-decoration: underline;
    color: white;
    filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07)) drop-shadow(0 2px 2px rgba(0, 0, 0, 0.06));
  }

  header {
    display: flex;
    padding: 2rem;
    flex-direction: column;
    justify-content: space-around;
    align-items: center;
    width: calc(100% - 4rem);
    height: max-content;
    min-height: calc(100vh - 4rem);
    text-align: center;
    color: #ffffff;
    background-image: linear-gradient(to right, var(--tw-gradient-stops));
    background-color: #3B82F6;
  }

  h1 {
    margin-bottom: 1rem;
    font-size: 2.25rem;
    line-height: 2.5rem;
    filter: drop-shadow(0 20px 13px rgba(0, 0, 0, 0.03)) drop-shadow(0 8px 5px rgba(0, 0, 0, 0.08));
  }

  h2 {
    margin-bottom: 1rem;
    font-size: 1.875rem;
    line-height: 2.25rem;
    filter: drop-shadow(0 10px 8px rgba(0, 0, 0, 0.04)) drop-shadow(0 4px 3px rgba(0, 0, 0, 0.1));
  }

  @media (min-width: 1024px) {
    header {
      flex-direction: row;
    }

    h1 {
      font-size: 4.5rem;
      line-height: 1;
    }

    .qr-container {
      margin-top: 0;
    }
  }

  @media (min-width: 768px) {
    h1 {
      font-size: 3.75rem;
    }
  }

  @media (min-width: 640px) {
    h1 {
      font-size: 3rem;
    }
  }

	.background-animate {
		background-size: 400%;

		-webkit-animation: gradientAnimation 10s ease infinite;
		-moz-animation: gradientAnimation 10s ease infinite;
		animation: gradientAnimation 10s ease infinite;
	}

	@keyframes gradientAnimation {
		0%,
		100% {
			background-position: 0% 50%;
		}
		50% {
			background-position: 100% 50%;
		}
	}
</style>
