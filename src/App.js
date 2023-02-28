//import Canvas from "./Canvas";
import React, { useRef, useEffect, useState } from "react";
import generateMap from "./noiseGen/noiseGen";

function App() {
  const [seed, setSeed] = useState(Math.round(Math.random() * 100000000000000));
  const [width, setWidth] = useState(350);
  const [height, setHeight] = useState(300);
  const [octaves, setOctaves] = useState(8);
  const [persistence, setPersistence] = useState(0.6);
  const [lacunarity, setLacunarity] = useState(2);
  const [amplitude, setAmplitude] = useState(1);
  const [frequency, setFrequency] = useState(0.003);
  const [waterThreshold, setWaterThreshold] = useState(0.4);
  const [worldName, setWorldName] = useState(null);
  const [coloredMap, setColoredMap] = useState(false);

  const canvasRef = useRef(null);
  async function updateOptions(key, value) {
    //await delay(1000);
    switch (key) {
      case "seed":
        setSeed(value);
        break;
      case "width":
        setWidth(value);
        break;
      case "height":
        setHeight(value);
        break;
      case "octaves":
        setOctaves(value);
        break;
      case "persistence":
        setPersistence(value);
        break;
      case "lacunarity":
        setLacunarity(value);
        break;
      case "amplitude":
        setAmplitude(value);
        break;
      case "frequency":
        setFrequency(value);
        break;
      case "waterThreshold":
        setWaterThreshold(value);
        break;
      default:
    }
  }

  function color(noiseValue, ctx) {
    //console.log(waterThreshold);
    // Water: #FFFFFF
    // Crossing: #CCCCCC
    // Land: #000000
    // Hill: #999999
    // Mountain: #333333

    // Make sure the noise value is between 0 and 1
    noiseValue = Math.abs(noiseValue);
    // We want to make it so that water level can be increased or decreased
    // This should also affect the crossing level
    // Water level

    let waterThresholdNew = new Number(waterThreshold);

    if (noiseValue < waterThresholdNew) {
      ctx.fillStyle = "#FFFFFF";
      if (coloredMap) {
        ctx.fillStyle = "#457b9d";
      }
    }
    // Crossing level
    else if (noiseValue < waterThresholdNew + 0.1) {
      ctx.fillStyle = "#CCCCCC";
      if (coloredMap) {
        ctx.fillStyle = "#ade8f4";
      }
    }
    // Land level
    else if (noiseValue < waterThresholdNew + 0.5) {
      ctx.fillStyle = "#000000";
      if (coloredMap) {
        ctx.fillStyle = "#31a354";
      }
    }
    // Hill level
    else if (noiseValue < waterThresholdNew + 0.6) {
      ctx.fillStyle = "#999999";
    }
    // Mountain level
    else if (noiseValue < waterThresholdNew + 0.7) {
      ctx.fillStyle = "#333333";
      if (coloredMap) {
        ctx.fillStyle = "#000000";
      }
    }
  }

  function download() {
    const canvas = canvasRef.current;
    const image = canvas
      .toDataURL("image/png")
      .replace("image/png", "image/octet-stream");
    const link = document.createElement("a");
    if (!worldName) {
      link.download = `noise_map_${seed}_${width}x${height}.png`;
    } else {
      link.download = `${worldName}.png`;
    }
    link.href = image;
    link.click();
  }

  useEffect(() => {
    console.log("Map updated");
    function draw() {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      var map = generateMap(
        seed,
        [width, height],
        octaves,
        persistence,
        lacunarity,
        amplitude,
        frequency
      );
      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const noise = map[x][y];
          color(noise, ctx, 0.2);
          ctx.fillRect(x, y, 1, 1);
        }
      }
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
    }
    const delayDebounceFn = setTimeout(() => {
      draw();
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [
    seed,
    width,
    height,
    octaves,
    persistence,
    lacunarity,
    amplitude,
    frequency,
    waterThreshold,
    coloredMap,
  ]);

  return (
    <div className="h-full w-full p-4s bg-slate-800">
      <div className="w-full h-full text-white placeholder-gray">
        <div className="flex flex-col items-center justify-center h-screen">
          <div className="w-full flex justify-center items-center flex-col">
            <div className="flex">
              <canvas
                // Min width and height of 200.
                width={width > 200 ? width : 200}
                height={height > 200 ? height : 200}
                ref={canvasRef}
                style={{ border: "1px solid black" }}
              />
              {/* Checkbox to toggle color */}
            </div>
            <div className="flex flex-col justify-center items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  className="form-checkbox"
                  onClick={() => setColoredMap(!coloredMap)}
                />
                <span className="ml-2">Colored Map</span>
              </label>
            </div>
            <div className="flex">
              <div className="m-2">
                <div className="flex flex-row">
                  <label className="font-medium mb-2" htmlFor="seed">
                    Seed
                  </label>
                  <button
                    className="block font-medium mb-2 ml-1 text-sm bg-slate-700 px-2 rounded-lg"
                    onClick={() =>
                      setSeed(Math.round(Math.random() * 100000000000000))
                    }
                  >
                    Reroll
                  </button>
                </div>
                <input
                  onChange={(e) => updateOptions("seed", e.target.value)}
                  className="text-black appearance-none border border-gray-300 rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  id="seed"
                  type="text"
                  placeholder="Enter seed"
                  value={seed}
                />
              </div>
              <div className="m-2">
                <label className="block font-medium mb-2" htmlFor="height">
                  Height
                </label>
                <input
                  onChange={(e) => updateOptions("height", e.target.value)}
                  className="text-black appearance-none border border-gray-300 rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  id="height"
                  type="number"
                  max={707}
                  placeholder="Enter height"
                  value={height}
                />
              </div>
              <div className="m-2">
                <label className="block font-medium mb-2" htmlFor="width">
                  Width
                </label>
                <input
                  onChange={(e) => updateOptions("width", e.target.value)}
                  className="text-black appearance-none border border-gray-300 rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                  id="width"
                  type="number"
                  max={707}
                  placeholder="Enter width"
                  value={width}
                />
              </div>
            </div>
          </div>
          <div className="w-full max-w-2xl mt-4 flex items-start justify-start">
            <div className="w-1/4 p-4">
              <div className="flex flex-row">
                <label className="block font-medium mb-2" htmlFor="slider1">
                  Octaves
                </label>
                <label
                  className="block font-medium mb-2 ml-1 text-sm bg-slate-700 p-1 rounded-lg"
                  htmlFor="slider1"
                >
                  {octaves}
                </label>
              </div>
              <input
                onChange={(e) => updateOptions("octaves", e.target.value)}
                className="text-black block slider w-full"
                id="slider1"
                defaultValue="8"
                type="range"
                min="0"
                max="20"
                step="1"
              />
            </div>
            <div className="w-1/4 p-4">
              <div className="flex flex-row">
                <label className="block font-medium mb-2" htmlFor="slider2">
                  Persistence
                </label>
                <label
                  className="block font-medium mb-2 ml-1 text-sm bg-slate-700 p-1 rounded-lg"
                  htmlFor="slider2"
                >
                  {persistence}
                </label>
              </div>
              <input
                onChange={(e) => updateOptions("persistence", e.target.value)}
                className="text-black block slider w-full"
                id="slider2"
                defaultValue="0.6"
                type="range"
                min="0"
                max="1"
                step="0.01"
              />
            </div>
            <div className="w-1/4 p-4">
              <div className="flex flex-row">
                <label className="block font-medium mb-2" htmlFor="slider3">
                  Lacunarity
                </label>
                <label
                  className="block font-medium mb-2 ml-1 text-sm bg-slate-700 p-1 rounded-lg"
                  htmlFor="slider3"
                >
                  {lacunarity}
                </label>
              </div>
              <input
                onChange={(e) => updateOptions("lacunarity", e.target.value)}
                className="text-black block slider w-full"
                defaultValue="2"
                id="slider4"
                type="range"
                min="0"
                max="4"
                step="0.01"
              />
            </div>
            <div className="w-1/4 p-4">
              <div className="flex flex-row">
                <label className="block font-medium mb-2" htmlFor="slider4">
                  Frequency
                </label>
                <label
                  className="block font-medium mb-2 ml-1 text-sm bg-slate-700 p-1 rounded-lg"
                  htmlFor="slider4"
                >
                  {frequency}
                </label>
              </div>
              <input
                onChange={(e) => updateOptions("frequency", e.target.value)}
                className="text-black block slider w-full"
                defaultValue="0.003"
                id="slider4"
                type="range"
                min="0.000001"
                max="0.05"
                step={0.0001}
              />
            </div>
          </div>
          <div className="w-full max-w-2xl mt-4 flex items-start justify-start">
            <div className="w-full p-4">
              <div className="flex flex-row">
                <label className="block font-medium mb-2" htmlFor="slider5">
                  Water Threshold
                </label>
                <label
                  className="block font-medium mb-2 ml-1 text-sm bg-slate-700 p-1 rounded-lg"
                  htmlFor="slider5"
                >
                  {waterThreshold}
                </label>
              </div>
              <input
                onChange={(e) =>
                  updateOptions("waterThreshold", e.target.value)
                }
                className="text-black block slider w-full"
                id="slider5"
                defaultValue="0.4"
                type="range"
                min="0.1"
                max="1"
                step="0.01"
              />
            </div>
          </div>
          {/* Now a big button for downloading */}
          <div className="w-full max-w-2xl mt-4 flex self-center text-center justify-center">
            <div className="p-4 m-auto flex flex-col justify-center">
              <input
                onChange={(e) => setWorldName(e.target.value)}
                className="text-black appearance-none border mb-2 border-gray-300 rounded py-2 px-3 leading-tight focus:outline-none focus:shadow-outline"
                id="worldName"
                type="text"
                placeholder="Enter world name"
              />
              <button
                onClick={download}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Download
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
