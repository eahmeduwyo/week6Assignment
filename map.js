var Main;

// Assuming you're using a bundler or ES module-compatible environment

import Map from "https://js.arcgis.com/4.33/@arcgis/core/Map.js";
import Graphic from "https://js.arcgis.com/4.33/@arcgis/core/Graphic.js";
import ElevationLayer from "https://js.arcgis.com/4.33/@arcgis/core/layers/ElevationLayer.js";
import SceneView from "https://js.arcgis.com/4.33/@arcgis/core/views/SceneView.js";
import FeatureLayer from "https://js.arcgis.com/4.33/@arcgis/core/layers/FeatureLayer.js";

Main = (function () {
  const layer = new ElevationLayer({
    url: "http://elevation3d.arcgis.com/arcgis/rest/services/WorldElevation3D/Terrain3D/ImageServer",
  });

  const map = new Map({
    basemap: "hybrid",
    ground: { layers: [layer] },
  });

  const view = new SceneView({
    container: "map",
    viewingMode: "global",
    map: map,
    camera: {
      position: {
        x: -105.503,
        y: 44.27,
        z: 20000000,
        spatialReference: { wkid: 4326 },
      },
      heading: 30, // Rotate Camera
      tilt: 10, // Add a Tilt to see 3D Effect
    },
    popup: {
      dockEnabled: true,
      dockOptions: { breakpoint: false },
    },
    environment: {
      lighting: { directShadowsEnabled: false },
    },
  });

  // Initial Zoom
  function setZoomLevel() {
    view.zoom = 4; // Adjust zoom level for better initial view
  }

  const initMap = function () {
    const graphics = [];
    for (const [key, value] of Object.entries(myStuff)) {
      const point = {
        type: "point",
        x: value.coord[0],
        y: value.coord[1],
        z: 10000,
      };

      const attributes = { key, city: value.city, state: value.state };

      // Altered Symbology
      const markerSymbol = {
        type: "simple-marker",
        color: [255, 69, 0, 0.9], // orange-red for visibility
        size: 10, // slightly larger
        outline: {
          color: [255, 255, 255],
          width: 1.5,
        },
      };

      // Alter Popup Content  
      const popupTemplate = {
        title: `<b>${key}</b>`,
        content: `<div style="font-size:13px;">
                    <p><b>City:</b> ${value.city}</p>
                    <p><b>State:</b> ${value.state}</p>
                  </div>`,
      };

      const graphic = new Graphic({
        geometry: point,
        attributes,
        symbol: markerSymbol, 
        popupTemplate,
      });

      graphics.push(graphic);
    }

    // FeatureLayer with clustering
    const featureLayer = new FeatureLayer({
      source: graphics,
      objectIdField: "ObjectID",
      fields: [
        { name: "ObjectID", type: "oid" },
        { name: "key", type: "string" },
        { name: "city", type: "string" },
        { name: "state", type: "string" },
      ],
      renderer: {
        type: "simple",
        symbol: {
          type: "simple-marker",
          color: [255, 69, 0, 0.9],
          size: 10,
          outline: { color: [255, 255, 255], width: 1.5 },
        },
      },
      popupTemplate: {
        title: "{key}",
        content: `<div style="font-size:13px;">
              <p><b>City:</b> {city}</p>
              <p><b>State:</b> {state}</p>
            </div>`,
                    },

      featureReduction: {
        type: "cluster", // enables clustering
        clusterRadius: "80px",
      },
    });

    map.add(featureLayer);

    // Initial zoom when view loads
    view.when(() => {
      setZoomLevel();
    });

    // Zoom to clicked point
    view.on("click", async (event) => {
      const response = await view.hitTest(event);
      const result = response.results[0];
      if (result && result.graphic) {
        view.goTo(
          {
            target: result.graphic.geometry,
            zoom: 12,
            tilt: 60,
          },
          { duration: 1500, easing: "in-out-cubic" }
        );
      }
    });

    // Search Bar
    const searchDiv = document.createElement("div");
    searchDiv.innerHTML = `
      <input id="citySearch" type="text" placeholder="Enter city name" 
    style="position:absolute;
    top:20px;
    left:50%;
    transform:translateX(-50%);
    z-index:9999;
    padding:8px 12px;
    border:1px solid #ccc;
    border-radius:6px;
    font-size:14px;
    box-shadow:0 2px 5px rgba(0,0,0,0.3);
  ">
    `;
    document.body.appendChild(searchDiv);

    const cityList = {
      "Denver": [-104.9903, 39.7392],
      "Cheyenne": [-104.8202, 41.1399],
      "Casper": [-106.3131, 42.8666],
      "Laramie": [-105.5911, 41.3114],
    };

    const searchInput = document.getElementById("citySearch");
    searchInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        const city = searchInput.value.trim();
        if (cityList[city]) {
          const coords = cityList[city];
          view.goTo({
            center: coords,
            zoom: 10,
            tilt: 45,
          });
        } else {
          alert("City not found in list.");
        }
      }
    });
  };

  initMap();
  return {};
})();
