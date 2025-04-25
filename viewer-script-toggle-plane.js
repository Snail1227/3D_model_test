
document.addEventListener('DOMContentLoaded', () => {
  const modelViewer = document.querySelector("#viewer");
  const textureSelect = document.getElementById("texture-select");
  const textureControls = document.getElementById("texture-controls");
  let materialRef = null;
  let originalColor = null;
  let selectedColor = null;
  let lastPlaneTexture = null;
  let planeVisible = true;

  window.changeModel = function (file) {
    modelViewer.src = file;
    const bgControls = document.getElementById("background-controls");
    if (file === "frame.glb" || file === "frameV2.glb") {
      bgControls.style.display = "flex";
    } else {
      bgControls.style.display = "none";
    }
    textureControls.style.display = "none";
  };

  window.loadFrameV2NoTexture = function () {
    document.getElementById('models-control').selectedIndex = -1;
    lastPlaneTexture = "None";
    changeModel("frameV2.glb");
    document.getElementById("texture-controls").style.display = "block";
  };

  window.loadFrame = function () {
    document.getElementById('models-control').value = "frame.glb";
    changeModel("frame.glb");
  };

  window.loadFrameV2 = function () {
    document.getElementById('models-control').selectedIndex = -1;
    changeModel("frameV2.glb");
  };

  window.togglePlaneVisibility = async function () {
    await modelViewer.updateComplete;
    const mesh = modelViewer.model.getObjectByName("Plane");
    if (mesh) {
      mesh.visible = !planeVisible;
      planeVisible = !planeVisible;
    }
  };

  async function applyTextureToPlaneMaterial(textureFile) {
    await modelViewer.updateComplete;
    const targetMaterial = modelViewer.model.materials.find(mat => mat.name === "Material.001");
    if (!targetMaterial) return;
    if (textureFile === "None") {
      targetMaterial.pbrMetallicRoughness.baseColorTexture.setTexture(null);
    } else {
      const tex = await modelViewer.createTexture(textureFile);
      targetMaterial.pbrMetallicRoughness.baseColorTexture.setTexture(tex);
    }
  }

  textureSelect.addEventListener("change", (e) => {
    lastPlaneTexture = e.target.value;
    applyTextureToPlaneMaterial(lastPlaneTexture);
  });

  modelViewer.addEventListener('load', async () => {
    await modelViewer.updateComplete;
    const [material] = modelViewer.model.materials;
    materialRef = material;
    if (!originalColor) {
      originalColor = material.pbrMetallicRoughness.baseColorFactor.slice();
    }
    if (selectedColor) {
      material.pbrMetallicRoughness.setBaseColorFactor(selectedColor);
    }
    document.getElementById("metalness").value = material.pbrMetallicRoughness.metallicFactor;
    document.getElementById("roughness").value = material.pbrMetallicRoughness.roughnessFactor;
    document.getElementById("metalness-value").textContent = material.pbrMetallicRoughness.metallicFactor;
    document.getElementById("roughness-value").textContent = material.pbrMetallicRoughness.roughnessFactor;
    if (lastPlaneTexture) {
      applyTextureToPlaneMaterial(lastPlaneTexture);
    }
  });

  document.querySelector('#color-controls').addEventListener('click', async (event) => {
    const color = event.target.dataset.color;
    if (!color || !materialRef) return;
    selectedColor = hexToRgba(color);
    await modelViewer.updateComplete;
    materialRef.pbrMetallicRoughness.setBaseColorFactor(selectedColor);
  });

  document.getElementById('default-color').addEventListener('click', async () => {
    if (!originalColor || !materialRef) return;
    await modelViewer.updateComplete;
    materialRef.pbrMetallicRoughness.setBaseColorFactor(originalColor);
    selectedColor = null;
  });

  document.getElementById('metalness').addEventListener('input', (event) => {
    if (materialRef) {
      materialRef.pbrMetallicRoughness.setMetallicFactor(event.target.value);
      document.getElementById("metalness-value").textContent = event.target.value;
    }
  });

  document.getElementById('roughness').addEventListener('input', (event) => {
    if (materialRef) {
      materialRef.pbrMetallicRoughness.setRoughnessFactor(event.target.value);
      document.getElementById("roughness-value").textContent = event.target.value;
    }
  });

  function hexToRgba(hex) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    const r = ((bigint >> 16) & 255) / 255;
    const g = ((bigint >> 8) & 255) / 255;
    const b = (bigint & 255) / 255;
    return [r, g, b, 1];
  }
});
