<script lang="ts">
  import { renderSVG } from "../../../src";

  const links = [
    { href: "/scannable/demo", name: "Demo" },
    { href: "https://github.com/LeoDog896/scannable", name: "GitHub" },
    { href: "https://npmjs.com/package/scannable", name: "NPM" }
  ]

  let svgContent = "https://leodog896.github.io/scannable"
</script>

<header class="
text-center p-8 w-full min-h-screen h-max text-white
flex flex-col lg:flex-row justify-around items-center
bg-gradient-to-r from-sky-500 via-blue-500 to-cyan-500 background-animate"
>
  <div class="text-center">
    <h1 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl mb-4 drop-shadow-xl">Scannable</h1>

    <h2 class="text-3xl mb-4 drop-shadow-lg">Generate QR codes</h2>

    <div class="flex flex-row w-full justify-center">
      {#each links as link}
        <a href={link.href} class="drop-shadow-md px-4 py-1 text-xl underline mx-4 hover:gray-100">  {link.name}  </a>
      {/each}
    </div>
  </div>

  <div class="lg:mt-0 mt-20 p-8 rounded-lg bg-white                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               ">
    {@html renderSVG({ value: svgContent, width: 400, height: 400 })}
    <input class="text-black border-b mt-5 border-black" placeholder="Enter URL" bind:value={svgContent}>
  </div>
</header>

<style>
  .background-animate {
    background-size: 400%;

    -webkit-animation: GradientAnimation 10s ease infinite;
    -moz-animation: GradientAnimation 10s ease infinite;
    animation: GradientAnimation 10s ease infinite;
  }

  @keyframes GradientAnimation {
    0%,
    100% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
  }
</style>
