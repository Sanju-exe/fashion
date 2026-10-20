import './style.css';
import { REAL_GARMENTS, REAL_HUMAN_MODELS } from './data/clothes.js';
import { initPoseDetector, extractTorsoGeometry } from './services/poseDetector.js';
import { preloadGarmentImage, TorsoSmoother, renderVirtualGarment, captureStudioSnapshot } from './services/arEngine.js';

const API_BASE = 'http://127.0.0.1:8000';

/* ==========================================================================
   APPLICATION STATE
   ========================================================================== */
const state = {
  garments: [...REAL_GARMENTS],
  activeCategory: 'All',
  searchQuery: '',
  selectedGarment: REAL_GARMENTS[0],
  currentMode: 'photo_ai', // 'photo_ai' | 'camera_ar'

  // Add Shirt Modal State
  isAddShirtModalOpen: false,
  newShirtFile: null,
  newShirtProcessedPreview: null,
  newShirtMetadata: null,
  isProcessingNewShirt: false,
  isSavingNewShirt: false,

  // Photo Try-On State
  activeModelId: 'real-male',
  currentPersonFile: null,
  currentPersonDataUrl: null,
  aiResultDataUrl: null,
  aiOriginalDataUrl: null,
  compareMode: 'after', // 'before' | 'after'
  isAiGenerating: false,
  measurements: null,

  // Camera AR State
  cameraStream: null,
  isCameraActive: false,
  isMirrored: true,
  facingMode: 'user',
  showSkeleton: false,
  scaleMultiplier: 1.0,
  verticalOffset: 0,
  garmentOpacity: 1.0,

  // FPS & Status
  fps: 0,
  frameCount: 0,
  lastFpsUpdate: performance.now()
};

const smoother = new TorsoSmoother(0.32);
let cameraAnimationFrameId = null;
let poseDetectorInstance = null;
let currentGarmentCutoutImg = null;

/* ==========================================================================
   INITIALIZATION
   ========================================================================== */
async function initApp() {
  // Fetch latest persistent garments from backend API
  try {
    const res = await fetch(`${API_BASE}/api/garments`);
    if (res.ok) {
      const data = await res.json();
      if (data.garments && Array.isArray(data.garments) && data.garments.length > 0) {
        state.garments = data.garments;
        state.selectedGarment = data.garments[0];
      }
    }
  } catch (e) {
    console.warn('Backend /api/garments offline, using local garments:', e);
  }

  const app = document.getElementById('app');
  app.innerHTML = renderAppShell();

  setupEventListeners();

  // Preload initial garment cutout
  currentGarmentCutoutImg = await preloadGarmentImage(state.selectedGarment.cutout || state.selectedGarment.image);

  // Initialize MediaPipe Pose detector in background for Live AR
  initPoseDetector().then(detector => {
    poseDetectorInstance = detector;
  });
}

/* ==========================================================================
   HTML SHELL
   ========================================================================== */
function renderAppShell() {
  return `
    <header class="header">
      <div class="brand" id="brandLogo">
        <div class="brand-icon">V</div>
        <span class="brand-text">VERVE</span>
      </div>
      <div class="header-actions">
        <button class="btn-add-shirt-nav" id="btnOpenAddShirt">
          <span style="font-size:1.1rem; line-height:1;">+</span>
          <span>Add Shirt</span>
        </button>
      </div>
    </header>

    <section class="hero">
      <h1 class="hero-title">Real Garments. Genuine Identity.</h1>
      <p class="hero-description">
        Try on authentic designer shirts with natural fabric drape, realistic tension folds, and zero distortion to your face, hair, or skin tone.
      </p>

      <div class="filter-bar" id="categoryFilterBar">
        ${renderCategoryFilterButtons()}
      </div>
    </section>

    <main class="catalog-section">
      <div class="clothing-grid" id="clothingGrid">
        ${renderClothingCards()}
      </div>
    </main>

    <!-- Product Detail & Try-On Choice Modal -->
    <div class="modal-overlay" id="detailModalOverlay">
      <div class="detail-modal" id="detailModalContent"></div>
    </div>

    <!-- + Add New Shirt AI Processing Modal -->
    <div class="add-shirt-modal-overlay" id="addShirtModalOverlay">
      <div class="add-shirt-modal-content" id="addShirtModalContent">
        ${renderAddShirtModalInner()}
      </div>
    </div>

    <!-- Main Try-On Studio Workspace -->
    <div class="studio-view" id="studioView">
      <div class="studio-navbar">
        <div class="studio-title-group">
          <button class="btn-return-catalog" id="btnReturnToCatalog">
            ← Return to Collection
          </button>
          <div class="current-shirt-badge">
            <img class="badge-thumb" id="studioCurrentThumb" src="${state.selectedGarment.image}" alt="Garment" />
            <span class="badge-name" id="studioCurrentName">${state.selectedGarment.name}</span>
          </div>
        </div>

        <!-- Mode Switcher Tabs -->
        <div class="studio-mode-tabs" id="studioModeTabs">
          <button class="studio-tab-btn active" data-mode="photo_ai">
            <span>✨</span>
            <span>AI Virtual Try-On</span>
          </button>
          <button class="studio-tab-btn" data-mode="camera_ar">
            <span>📷</span>
            <span>Live Webcam AR</span>
          </button>
        </div>
      </div>

      <div class="studio-body">
        <!-- Center Viewport Stage -->
        <div class="studio-stage" id="studioStage">
          <div class="stage-viewport-wrap">
            <!-- 1. Live AR Canvas -->
            <canvas id="arCanvas"></canvas>
            <video id="webcamVideo" playsinline autoplay muted></video>

            <!-- 2. Photorealistic AI Comparison Image -->
            <div class="compare-slider-container" id="compareSliderContainer">
              <img class="compare-img-after" id="compareImg" src="" alt="Try-On Result" />
            </div>

            <!-- 3. Clean Upload Photo Stage (Initial Photo Try-On State) -->
            <div class="clean-upload-stage" id="cleanUploadStage" style="display:none;">
              <div class="clean-upload-container">
                <!-- A: Empty Upload Box with large + icon and 'Add Photo' & 'Click Photo' -->
                <div class="clean-upload-empty" id="cleanUploadEmpty">
                  <div class="clean-upload-cards-row">
                    <div class="clean-upload-plus-box" id="cleanUploadPlusBox" title="Upload portrait from device">
                      <span class="clean-upload-plus-icon">+</span>
                      <span class="clean-upload-plus-text">Add Photo</span>
                      <span class="clean-upload-subtext">From Device</span>
                    </div>

                    <div class="clean-upload-divider-text">OR</div>

                    <div class="clean-upload-plus-box camera-box" id="cleanCaptureCameraBox" title="Take a live photo with webcam">
                      <span class="clean-upload-camera-icon">📸</span>
                      <span class="clean-upload-plus-text">Click Photo</span>
                      <span class="clean-upload-subtext">Live Webcam</span>
                    </div>
                  </div>
                  <div class="clean-upload-hint">Upload or click a live portrait to try on this garment. Identity and background preserved.</div>
                </div>

                <!-- B: Preview Box (Shown after selecting/capturing photo) -->
                <div class="clean-preview-wrapper" id="cleanPreviewWrapper" style="display:none; width:100%; flex-direction:column; align-items:center;">
                  <div class="clean-preview-box">
                    <span class="clean-preview-tag">SELECTED PHOTO</span>
                    <img class="clean-preview-img" id="cleanPreviewImg" src="" alt="Photo Preview" />
                  </div>
                  <div class="clean-preview-actions">
                    <button class="btn-change-photo" id="btnCleanChangePhoto">
                      <span>📁</span>
                      <span>Change File</span>
                    </button>
                    <button class="btn-change-photo" id="btnCleanRetakePhoto">
                      <span>📸</span>
                      <span>Retake Live</span>
                    </button>
                    <button class="btn-generate-tryon" id="btnCleanGenerateTryOn">
                      <span>⚡</span>
                      <span>Generate Try-On</span>
                    </button>
                  </div>
                </div>

                <!-- Hidden file input for Clean Upload Stage -->
                <input type="file" id="cleanFileInput" accept="image/jpeg,image/png,image/webp" style="display:none;" />
              </div>
            </div>

            <!-- Live Camera Snapshot Capture Modal -->
            <div class="capture-modal-overlay" id="captureModalOverlay" style="display:none;">
              <div class="capture-modal-container">
                <div class="capture-modal-header">
                  <div class="capture-modal-title">
                    <span class="capture-pulse-dot"></span>
                    <span>Live Camera Snapshot</span>
                  </div>
                  <button class="capture-close-btn" id="btnCaptureModalClose">✕</button>
                </div>
                <div class="capture-modal-viewport">
                  <video id="captureModalVideo" playsinline autoplay muted></video>
                  <canvas id="captureModalCanvas" style="display:none;"></canvas>
                  <div class="capture-guide-overlay">
                    <div class="capture-guide-box">
                      <span class="guide-corner tl"></span>
                      <span class="guide-corner tr"></span>
                      <span class="guide-corner bl"></span>
                      <span class="guide-corner br"></span>
                      <div class="capture-guide-label">Align your face & torso inside frame</div>
                    </div>
                  </div>
                </div>
                <div class="capture-modal-footer">
                  <button class="btn-capture-flip" id="btnCaptureModalFlip" title="Switch Camera">
                    ⇄ Flip Mirror
                  </button>
                  <button class="btn-capture-snap" id="btnCaptureModalSnap">
                    <span class="snap-shutter-inner"></span>
                    <span class="snap-text">Click Photo</span>
                  </button>
                  <div style="width: 80px;"></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Live AR HUD Info (webcam mode only) -->
          <div class="stage-hud" id="stageHud" style="display:none;">
            <div class="hud-item">
              <span>TRACKING:</span>
              <span class="hud-val" id="hudConfidence">98%</span>
            </div>
            <div class="hud-item">
              <span>FPS:</span>
              <span class="hud-val" id="hudFps">60</span>
            </div>
            <div class="hud-item">
              <span>MODE:</span>
              <span class="hud-val">LIVE 60FPS AR</span>
            </div>
          </div>

          <!-- Bottom Floating Action Bar -->
          <div class="stage-controls-bar" id="stageControlsBar">
            <!-- Camera AR buttons -->
            <div id="cameraControlsGroup" style="display:none; gap:0.5rem; align-items:center;">
              <button class="hud-ctrl-btn" id="btnToggleMirror">⇄ Mirror</button>
            </div>

            <!-- Photo AI buttons -->
            <div id="photoControlsGroup" style="display:flex; gap:0.5rem; align-items:center; flex-wrap:wrap; justify-content:center;">
              <button class="hud-ctrl-btn active" id="btnShowAfter">✨ Try-On Result</button>
              <button class="hud-ctrl-btn" id="btnShowBefore">Original Photo</button>
            </div>
          </div>

          <!-- Loading Spinner -->
          <div class="stage-loading" id="stageLoading" style="display:none;">
            <div class="spinner"></div>
            <div class="loading-text" id="loadingText">GENERATING AI VIRTUAL TRY-ON...</div>
          </div>
        </div>

        <!-- Right Side Controls Panel -->
        <aside class="studio-side-panel">
          <div class="panel-header">
            <span>Atelier Controls</span>
            <span style="font-size:0.75rem; color:var(--accent-cyan); font-family:var(--font-mono);">IDENTITY-PRESERVED</span>
          </div>

          <!-- Real Garment Quick Switch -->
          <div class="panel-section">
            <div class="panel-section-title">Select Authentic Garment</div>
            <div class="shirt-switch-grid" id="shirtSwitchGrid">
              ${REAL_GARMENTS.map(item => `
                <div class="switch-thumb-card ${item.id === state.selectedGarment.id ? 'active' : ''}" data-shirt-id="${item.id}">
                  <img src="${item.image}" alt="${item.name}" />
                  <span class="switch-thumb-name">${item.name}</span>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- Live AR Fit Controls (Camera Mode) -->
          <div class="panel-section" id="arFitSidebarSection" style="display:none;">
            <div class="panel-section-title">Live AR Fit & Coverage</div>
            <div style="display:flex; flex-direction:column; gap:0.9rem;">
              <div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-secondary); margin-bottom:0.35rem;">
                  <span>Garment Coverage / Width:</span>
                  <span id="labelScaleMultiplier" style="color:var(--accent-cyan); font-family:var(--font-mono);">1.00x</span>
                </div>
                <input type="range" class="fit-slider" id="sliderScaleMultiplier" min="0.80" max="1.50" step="0.02" value="1.00" />
              </div>

              <div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-secondary); margin-bottom:0.35rem;">
                  <span>Vertical Alignment:</span>
                  <span id="labelVerticalOffset" style="color:var(--accent-cyan); font-family:var(--font-mono);">0 px</span>
                </div>
                <input type="range" class="fit-slider" id="sliderVerticalOffset" min="-80" max="80" step="2" value="0" />
              </div>

              <div>
                <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:var(--text-secondary); margin-bottom:0.35rem;">
                  <span>Fabric Opacity:</span>
                  <span id="labelGarmentOpacity" style="color:var(--accent-cyan); font-family:var(--font-mono);">100%</span>
                </div>
                <input type="range" class="fit-slider" id="sliderGarmentOpacity" min="0.2" max="1.0" step="0.05" value="1.0" />
              </div>
            </div>
          </div>

          <!-- Photo Mode Section: Real Models & Upload -->
          <div class="panel-section" id="photoSidebarSection">
            <div class="panel-section-title">Your Photograph</div>
            <div class="upload-dropzone" id="panelUploadDropzone">
              <div class="dropzone-icon">📁</div>
              <div class="dropzone-text" id="dropzoneMainText">Upload Your Real Photo</div>
              <div class="dropzone-subtext" id="dropzoneSubText">Click to browse or drop an image (JPG, PNG, WebP)</div>
              <input type="file" id="panelFileInput" accept="image/jpeg,image/png,image/webp" style="display:none;" />
            </div>

            <button class="btn-sidebar-capture" id="btnSidebarLivePhoto">
              <span>📸</span>
              <span>Click Live Photo with Webcam</span>
            </button>

            <div style="margin-top: 1.5rem;">
              <div class="panel-section-title">Or Try on Preset Studio Models</div>
              <div class="model-presets-wrap">
                ${REAL_HUMAN_MODELS.map(m => `
                  <button class="preset-model-btn ${m.id === state.activeModelId ? 'active' : ''}" data-model-id="${m.id}">
                    <img src="${m.image}" alt="${m.name}" />
                    <span>${m.name}</span>
                  </button>
                `).join('')}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <div class="toast-container" id="toastContainer"></div>
  `;
}

function renderCategoryFilterButtons() {
  const categories = ['All', ...new Set(state.garments.map(g => g.category || 'Overshirt'))];
  return categories.map(cat => `
    <button class="filter-btn ${cat === state.activeCategory ? 'active' : ''}" data-category="${cat}">
      ${cat}
    </button>
  `).join('');
}

function renderAddShirtModalInner() {
  if (state.isProcessingNewShirt) {
    return `
      <div class="add-shirt-header">
        <h2 class="add-shirt-title">⚡ AI Atelier Processing</h2>
      </div>
      <div class="modal-ai-loader">
        <div class="spinner"></div>
        <div class="loading-text" style="font-size:1rem; color:#fff;">REMOVING BACKGROUND & EXTRACTING GARMENT DETAILS...</div>
        <div style="font-size:0.85rem; color:var(--text-secondary); text-align:center; max-width:400px;">
          Converting into a high-fidelity transparent PNG and analyzing fabric, weave, pattern, and tailoring attributes with AI.
        </div>
      </div>
    `;
  }

  if (state.newShirtProcessedPreview && state.newShirtMetadata) {
    const meta = state.newShirtMetadata;
    return `
      <div class="add-shirt-header">
        <h2 class="add-shirt-title">✨ Review AI Generated Garment Details</h2>
        <button class="modal-close-btn" id="btnCloseAddShirtModal">✕</button>
      </div>
      <div class="add-shirt-body">
        <p style="font-size:0.9rem; color:var(--text-secondary); margin:0;">
          The background has been removed and converted to a transparent PNG. Review and adjust the AI-detected details below before adding it to the atelier gallery.
        </p>

        <div class="review-split">
          <!-- Transparent PNG Preview -->
          <div class="review-preview-card">
            <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--accent-cyan); margin-bottom:0.75rem;">
              TRANSPARENT PNG CUTOUT
            </span>
            <img src="${state.newShirtProcessedPreview}" alt="Cutout Preview" />
            <span style="font-size:0.75rem; color:var(--text-secondary); margin-top:0.75rem;">
              Preserved sleeves, collar & fabric weave
            </span>
          </div>

          <!-- Edit Form -->
          <form class="review-form-fields" id="formSaveNewShirt" onsubmit="return false;">
            <div class="field-group">
              <label class="field-label">Shirt Name *</label>
              <input type="text" class="field-input" id="editShirtName" value="${meta.name || ''}" required />
            </div>

            <div class="field-row-2">
              <div class="field-group">
                <label class="field-label">Category</label>
                <input type="text" class="field-input" id="editShirtCategory" value="${meta.category || 'Overshirt'}" />
              </div>
              <div class="field-group">
                <label class="field-label">Badge</label>
                <input type="text" class="field-input" id="editShirtBadge" value="${meta.badge || 'New Arrival'}" />
              </div>
            </div>

            <div class="field-group">
              <label class="field-label">Tagline (Short Summary)</label>
              <input type="text" class="field-input" id="editShirtTagline" value="${meta.tagline || ''}" />
            </div>

            <div class="field-group">
              <label class="field-label">Product Description</label>
              <textarea class="field-textarea" id="editShirtDescription" rows="3">${meta.description || ''}</textarea>
            </div>

            <div class="field-row-3">
              <div class="field-group">
                <label class="field-label">Fabric / Material</label>
                <input type="text" class="field-input" id="editShirtFabric" value="${meta.fabric || '100% Cotton'}" />
              </div>
              <div class="field-group">
                <label class="field-label">Fit Type</label>
                <input type="text" class="field-input" id="editShirtFit" value="${meta.fit || 'Tailored Relaxed Fit'}" />
              </div>
              <div class="field-group">
                <label class="field-label">Accent Color</label>
                <input type="color" class="field-input" id="editShirtAccentColor" value="${meta.accentColor || '#3b4252'}" style="height:42px; padding:2px 6px; cursor:pointer;" />
              </div>
            </div>
          </form>
        </div>
      </div>
      <div class="add-shirt-footer">
        <button class="btn-secondary-action" id="btnCancelAddShirt">Cancel / Re-upload</button>
        <button class="btn-primary-action" id="btnConfirmSaveShirt">
          ${state.isSavingNewShirt ? 'Saving...' : 'Confirm & Add to Gallery →'}
        </button>
      </div>
    `;
  }

  return `
    <div class="add-shirt-header">
      <h2 class="add-shirt-title">➕ Add New Shirt to Atelier</h2>
      <button class="modal-close-btn" id="btnCloseAddShirtModal">✕</button>
    </div>
    <div class="add-shirt-body">
      <p style="font-size:0.9rem; color:var(--text-secondary); margin:0;">
        Upload any photograph of a shirt. Our AI will automatically remove the background, convert it into a transparent PNG, and identify fabric & tailoring attributes for the gallery.
      </p>

      <div class="shirt-upload-area" id="shirtUploadArea">
        <div style="font-size:3rem; margin-bottom:0.8rem;">👔</div>
        <div style="font-size:1.1rem; color:#fff; font-weight:600; margin-bottom:0.3rem;">
          Drag & Drop Shirt Photograph Here
        </div>
        <div style="font-size:0.85rem; color:var(--text-secondary);">
          or click to choose file (JPG, PNG, WebP)
        </div>
        <input type="file" id="inputNewShirtFile" accept="image/jpeg,image/png,image/webp" style="display:none;" />
      </div>

      <div class="field-group">
        <label class="field-label">Optional Shirt Name or Notes (Optional)</label>
        <input 
          type="text" 
          class="field-input" 
          id="inputOptionalShirtName" 
          placeholder="e.g. Vintage Italian Silk Overshirt (or leave blank for AI to name)" 
        />
      </div>
    </div>
    <div class="add-shirt-footer">
      <button class="btn-secondary-action" id="btnCancelAddShirt">Cancel</button>
    </div>
  `;
}

function renderClothingCards() {
  const query = (state.searchQuery || '').trim().toLowerCase();
  let list = state.activeCategory === 'All'
    ? state.garments
    : state.garments.filter(g => g.category === state.activeCategory);

  if (query) {
    list = list.filter(g => 
      g.name.toLowerCase().includes(query) ||
      (g.tagline && g.tagline.toLowerCase().includes(query)) ||
      (g.description && g.description.toLowerCase().includes(query)) ||
      (g.category && g.category.toLowerCase().includes(query)) ||
      (g.fabric && g.fabric.toLowerCase().includes(query))
    );
  }

  if (list.length === 0) {
    return `
      <div style="grid-column: 1 / -1; text-align: center; padding: 4rem 1rem; color: var(--text-secondary);">
        <div style="font-size: 2.5rem; margin-bottom: 0.8rem;">🔍</div>
        <div style="font-size: 1.1rem; color: #fff; font-weight: 600; margin-bottom: 0.3rem;">No matching shirts found</div>
        <div style="font-size: 0.85rem;">Try searching for a different keyword or category.</div>
      </div>
    `;
  }

  return list.map(item => `
    <article class="clothing-card" data-shirt-id="${item.id}">
      <div class="card-image-wrap">
        <span class="card-badge">${item.badge || 'Design'}</span>
        <img src="${item.image}" alt="${item.name}" loading="lazy" />
        <div class="card-tryon-hint">
          <span>✨ AI Virtual Try-On</span>
        </div>
      </div>
      <div class="card-content">
        <span class="card-category">${item.category || 'Garment'}</span>
        <h3 class="card-title">${item.name}</h3>
        <p class="card-tagline">${item.tagline || item.description || ''}</p>
        <div class="card-footer">
          <span class="card-authentic-tag">Authentic Design</span>
          <button class="card-action-btn">
            <span>Try On</span>
            <span>→</span>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

/* ==========================================================================
   PRODUCT DETAIL & CHOICE MODAL
   ========================================================================== */
function openDetailModal(garment) {
  state.selectedGarment = garment;
  const overlay = document.getElementById('detailModalOverlay');
  const modalContent = document.getElementById('detailModalContent');

  modalContent.innerHTML = `
    <button class="modal-close-btn" id="btnCloseDetailModal">✕</button>

    <div class="modal-preview-side">
      <img class="modal-preview-img" src="${garment.image}" alt="${garment.name}" />
    </div>

    <div class="modal-info-side">
      <div>
        <div class="detail-badge-wrap">
          <span class="card-badge" style="position:static;">${garment.badge}</span>
          <span class="card-badge" style="position:static; border-color:var(--accent-cyan); color:var(--accent-cyan);">${garment.category}</span>
        </div>
        <h2 class="detail-title">${garment.name}</h2>
        <div class="detail-tagline">${garment.tagline}</div>
        <p class="detail-desc">${garment.description}</p>

        <div class="detail-specs-grid">
          <div>
            <div class="spec-item-label">Fabric</div>
            <div class="spec-item-val">${garment.fabric}</div>
          </div>
          <div>
            <div class="spec-item-label">Fit</div>
            <div class="spec-item-val">${garment.fit}</div>
          </div>
          <div>
            <div class="spec-item-label">Authenticity</div>
            <div class="spec-item-val" style="color:var(--accent-cyan);">Original Cutout</div>
          </div>
          <div>
            <div class="spec-item-label">AI Try-On</div>
            <div class="spec-item-val">Identity-Preserved</div>
          </div>
        </div>
      </div>

      <div>
        <div class="tryon-actions-label">Select Virtual Try-On Experience</div>
        <div class="tryon-actions-group">
          <button class="btn-upload-photo" id="btnModalUploadPhoto">
            <span class="btn-icon-large">✨</span>
            <span>Upload Photo</span>
            <small style="font-size:0.7rem; opacity:0.9; font-weight:400;">Full AI fabric drape & identity preservation</small>
          </button>

          <button class="btn-open-camera" id="btnModalOpenCamera">
            <span class="btn-icon-large">📷</span>
            <span>Open Camera</span>
            <small style="font-size:0.7rem; opacity:0.85; font-weight:400;">Live 60 FPS real-time motion preview</small>
          </button>
        </div>
      </div>
    </div>
  `;

  overlay.classList.add('open');

  document.getElementById('btnCloseDetailModal').onclick = closeDetailModal;
  document.getElementById('btnModalUploadPhoto').onclick = () => {
    closeDetailModal();
    // Reset any previous generated result or person file when opening Upload Photo fresh
    state.currentPersonFile = null;
    state.currentPersonDataUrl = null;
    state.aiResultDataUrl = null;
    state.aiOriginalDataUrl = null;
    state.compareMode = 'after';
    openStudio('photo_ai', false); // false = do not auto-generate
  };
  document.getElementById('btnModalOpenCamera').onclick = () => {
    closeDetailModal();
    openStudio('camera_ar');
  };
}

function closeDetailModal() {
  document.getElementById('detailModalOverlay').classList.remove('open');
}

/* ==========================================================================
   STUDIO CONTROLLER (PHOTO AI / WEBCAM AR / 3D AVATAR)
   ========================================================================== */
async function openStudio(mode = 'photo_ai', autoGenerate = false) {
  state.currentMode = mode;
  const studioView = document.getElementById('studioView');
  studioView.classList.add('active');

  updateStudioGarmentBadge();
  updateStudioModeUI();

  if (mode === 'photo_ai') {
    if (autoGenerate) {
      await runPhotorealisticTryOn();
    }
  } else if (mode === 'camera_ar') {
    await startCameraTryOn();
  }
}

function updateStudioGarmentBadge() {
  const thumb = document.getElementById('studioCurrentThumb');
  const name = document.getElementById('studioCurrentName');
  if (thumb && name) {
    thumb.src = state.selectedGarment.image;
    name.innerText = state.selectedGarment.name;
  }
}

function updateStudioModeUI() {
  const mode = state.currentMode;

  // Tabs
  document.querySelectorAll('.studio-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  // Viewport elements
  const arCanvas = document.getElementById('arCanvas');
  const compareContainer = document.getElementById('compareSliderContainer');
  const stageHud = document.getElementById('stageHud');
  const cleanUploadStage = document.getElementById('cleanUploadStage');
  const cleanUploadEmpty = document.getElementById('cleanUploadEmpty');
  const cleanPreviewWrapper = document.getElementById('cleanPreviewWrapper');
  const cleanPreviewImg = document.getElementById('cleanPreviewImg');

  const cameraControls = document.getElementById('cameraControlsGroup');
  const photoControls = document.getElementById('photoControlsGroup');

  const photoSidebar = document.getElementById('photoSidebarSection');
  const arFitSidebar = document.getElementById('arFitSidebarSection');

  if (mode === 'photo_ai') {
    stopCameraStream();

    arCanvas.style.display = 'none';
    stageHud.style.display = 'none';
    cameraControls.style.display = 'none';
    if (photoSidebar) photoSidebar.style.display = 'block';
    if (arFitSidebar) arFitSidebar.style.display = 'none';

    // Check if an AI result has already been generated
    if (state.aiResultDataUrl) {
      // Show comparison result view
      if (cleanUploadStage) cleanUploadStage.style.display = 'none';
      if (compareContainer) compareContainer.style.display = 'flex';
      if (photoControls) photoControls.style.display = 'flex';
    } else {
      // In upload/preview mode: show clean upload stage, hide comparison & result controls
      if (compareContainer) compareContainer.style.display = 'none';
      if (photoControls) photoControls.style.display = 'none';
      if (cleanUploadStage) cleanUploadStage.style.display = 'flex';

      // Check if user has selected a photo preview
      if (state.currentPersonDataUrl) {
        if (cleanUploadEmpty) cleanUploadEmpty.style.display = 'none';
        if (cleanPreviewWrapper) {
          cleanPreviewWrapper.style.display = 'flex';
        }
        if (cleanPreviewImg) cleanPreviewImg.src = state.currentPersonDataUrl;
      } else {
        // Clean initial state: "+" icon and "Add Photo"
        if (cleanUploadEmpty) cleanUploadEmpty.style.display = 'flex';
        if (cleanPreviewWrapper) cleanPreviewWrapper.style.display = 'none';
      }
    }

    const statusEl = document.getElementById('studioTrackingStatus');
    if (statusEl) statusEl.innerText = 'AI Virtual Try-On Active';
  } else if (mode === 'camera_ar') {
    if (cleanUploadStage) cleanUploadStage.style.display = 'none';
    arCanvas.style.display = 'block';
    compareContainer.style.display = 'none';
    stageHud.style.display = 'flex';

    cameraControls.style.display = 'flex';
    photoControls.style.display = 'none';
    if (photoSidebar) photoSidebar.style.display = 'none';
    if (arFitSidebar) arFitSidebar.style.display = 'block';

    const statusEl = document.getElementById('studioTrackingStatus');
    if (statusEl) statusEl.innerText = 'Live 60 FPS Webcam AR';
  }
}

/* ==========================================================================
   MODE 1: PHOTOREALISTIC AI TRY-ON
   ========================================================================== */
async function runPhotorealisticTryOn() {
  const stageLoading = document.getElementById('stageLoading');
  const loadingText = document.getElementById('loadingText');
  stageLoading.style.display = 'flex';
  loadingText.innerText = 'PRESERVING IDENTITY & RUNNING AI FABRIC DRAPE...';

  try {
    const formData = new FormData();
    formData.append('garment_id', state.selectedGarment.id);

    if (state.currentPersonFile) {
      formData.append('person_image', state.currentPersonFile);
    } else {
      // Fetch selected real human model image blob
      const model = REAL_HUMAN_MODELS.find(m => m.id === state.activeModelId) || REAL_HUMAN_MODELS[0];
      const resp = await fetch(model.image);
      const blob = await resp.blob();
      formData.append('person_image', blob, 'model.jpg');
    }

    const apiRes = await fetch(`${API_BASE}/api/tryon/photorealistic`, {
      method: 'POST',
      body: formData
    });

    if (apiRes.status === 429) {
      const errData = await apiRes.json().catch(() => ({}));
      showQuotaExhaustedAlert(errData.detail || 'API token quota limit finished (HTTP 429). Replenish tokens in backend/.env.');
      throw new Error(errData.detail || 'API token quota finished.');
    }

    if (!apiRes.ok) {
      const errData = await apiRes.json().catch(() => ({}));
      const msg = errData.detail || `Inference failed with status ${apiRes.status}`;
      if (typeof msg === 'string' && (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('exhausted') || msg.toLowerCase().includes('tokens'))) {
        showQuotaExhaustedAlert(msg);
      }
      throw new Error(msg);
    }

    const data = await apiRes.json();
    state.aiResultDataUrl = data.result_image;
    state.aiOriginalDataUrl = data.original_image;
    state.measurements = data.measurements;

    // Check if cloud diffusion reached quota and safely fell back
    if (data.quota_exhausted && data.quota_message) {
      showQuotaExhaustedAlert(data.quota_message);
    }

    // Update image
    const compareImg = document.getElementById('compareImg');
    compareImg.src = state.compareMode === 'after' ? state.aiResultDataUrl : state.aiOriginalDataUrl;

    // Update measurements in sidebar if elements exist
    if (data.measurements) {
      const elShoulder = document.getElementById('measShoulder');
      const elChest = document.getElementById('measChest');
      const elTorso = document.getElementById('measTorso');
      const elWaist = document.getElementById('measWaist');
      if (elShoulder) elShoulder.innerText = `${data.measurements.shoulder_breadth_cm} cm`;
      if (elChest) elChest.innerText = `${data.measurements.chest_circumference_cm} cm`;
      if (elTorso) elTorso.innerText = `${data.measurements.torso_length_cm} cm`;
      if (elWaist) elWaist.innerText = `${data.measurements.waist_circumference_cm} cm`;
    }

    stageLoading.style.display = 'none';
    updateStudioModeUI();
    const pipelineMsg = data.pipeline || 'AI Virtual Try-On';
    showToast(`Try-on rendered: ${pipelineMsg}`, 'success');
  } catch (err) {
    console.error('Try-on error:', err);
    stageLoading.style.display = 'none';
    const errText = err.message || '';
    if (errText.toLowerCase().includes('quota') || errText.toLowerCase().includes('exhausted') || errText.toLowerCase().includes('tokens')) {
      showQuotaExhaustedAlert(errText);
    } else {
      showToast(`Try-on service notice: ${errText}`, 'error');
    }
  }
}

/* ==========================================================================
   MODE 2: LIVE WEBCAM AR
   ========================================================================== */
async function startCameraTryOn() {
  const stageLoading = document.getElementById('stageLoading');
  const loadingText = document.getElementById('loadingText');
  stageLoading.style.display = 'flex';
  loadingText.innerText = 'INITIALIZING CAMERA FEED...';

  currentGarmentCutoutImg = await preloadGarmentImage(state.selectedGarment.cutout || state.selectedGarment.image);

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: state.facingMode },
      audio: false
    });

    state.cameraStream = stream;
    state.isCameraActive = true;
    const video = document.getElementById('webcamVideo');
    video.srcObject = stream;

    await new Promise(resolve => {
      video.onloadedmetadata = () => { video.play(); resolve(); };
    });

    poseDetectorInstance = await initPoseDetector();
    smoother.reset();

    stageLoading.style.display = 'none';
    startCameraLoop();
    showToast('Live AR mirror active. Stand facing the screen to align the shirt.', 'info');
  } catch (err) {
    stageLoading.style.display = 'none';
    showToast(`Camera Access: ${err.message || 'Permission denied'}.`, 'error');
  }
}

function startCameraLoop() {
  const canvas = document.getElementById('arCanvas');
  const video = document.getElementById('webcamVideo');
  const ctx = canvas.getContext('2d');
  const hudConfidence = document.getElementById('hudConfidence');
  const hudFps = document.getElementById('hudFps');

  let isSending = false;
  let currentRawTorso = null;

  if (video.videoWidth) {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  }

  if (poseDetectorInstance) {
    poseDetectorInstance.onResults(results => {
      isSending = false;
      if (results.poseLandmarks) {
        const torso = extractTorsoGeometry(results.poseLandmarks, canvas.width, canvas.height, state.isMirrored);
        if (torso) {
          currentRawTorso = torso;
          hudConfidence.innerText = `${Math.round(torso.confidence * 100)}%`;
        }
      }
    });
  }

  function loop(now) {
    if (!state.isCameraActive) return;

    state.frameCount++;
    if (now - state.lastFpsUpdate >= 500) {
      state.fps = Math.round((state.frameCount * 1000) / (now - state.lastFpsUpdate));
      hudFps.innerText = state.fps;
      state.frameCount = 0;
      state.lastFpsUpdate = now;
    }

    if (canvas.width !== video.videoWidth && video.videoWidth) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }

    ctx.save();
    if (state.isMirrored) {
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    ctx.restore();

    if (poseDetectorInstance && !isSending && video.readyState >= 2) {
      isSending = true;
      poseDetectorInstance.send({ image: video }).catch(() => { isSending = false; });
    }

    if (currentRawTorso && currentGarmentCutoutImg) {
      const smoothed = smoother.update(currentRawTorso);
      if (smoothed) {
        renderVirtualGarment(ctx, currentGarmentCutoutImg, state.selectedGarment, smoothed, {
          scaleMultiplier: state.scaleMultiplier,
          verticalOffset: state.verticalOffset,
          opacity: state.garmentOpacity,
          showSkeleton: state.showSkeleton,
          mirror: state.isMirrored
        });
      }
    }

    cameraAnimationFrameId = requestAnimationFrame(loop);
  }

  cameraAnimationFrameId = requestAnimationFrame(loop);
}

function stopCameraStream() {
  state.isCameraActive = false;
  if (cameraAnimationFrameId) {
    cancelAnimationFrame(cameraAnimationFrameId);
    cameraAnimationFrameId = null;
  }
  if (state.cameraStream) {
    state.cameraStream.getTracks().forEach(t => t.stop());
    state.cameraStream = null;
  }
  const video = document.getElementById('webcamVideo');
  if (video) video.srcObject = null;
}


/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */
function setupEventListeners() {
  // Search Input Handler
  const searchInput = document.getElementById('garmentSearchInput');
  const searchClear = document.getElementById('btnSearchClear');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      state.searchQuery = e.target.value;
      if (searchClear) {
        searchClear.style.display = state.searchQuery ? 'block' : 'none';
      }
      document.getElementById('clothingGrid').innerHTML = renderClothingCards();
    });
  }
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      state.searchQuery = '';
      if (searchInput) searchInput.value = '';
      searchClear.style.display = 'none';
      document.getElementById('clothingGrid').innerHTML = renderClothingCards();
    });
  }

  // Category Filter
  document.getElementById('categoryFilterBar').addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    state.activeCategory = btn.dataset.category;
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('clothingGrid').innerHTML = renderClothingCards();
  });

  // Clothing Card Select
  document.getElementById('clothingGrid').addEventListener('click', e => {
    const card = e.target.closest('.clothing-card');
    if (!card) return;
    const shirt = state.garments.find(g => g.id === card.dataset.shirtId);
    if (shirt) openDetailModal(shirt);
  });

  // + Add Shirt Modal Handlers
  const modalOverlay = document.getElementById('addShirtModalOverlay');
  const modalContent = document.getElementById('addShirtModalContent');
  const btnOpenAddShirt = document.getElementById('btnOpenAddShirt');

  function openAddShirtModal() {
    state.isAddShirtModalOpen = true;
    state.newShirtFile = null;
    state.newShirtProcessedPreview = null;
    state.newShirtMetadata = null;
    state.isProcessingNewShirt = false;
    state.isSavingNewShirt = false;
    modalContent.innerHTML = renderAddShirtModalInner();
    modalOverlay.classList.add('open');
    bindAddShirtModalEvents();
  }

  function closeAddShirtModal() {
    state.isAddShirtModalOpen = false;
    modalOverlay.classList.remove('open');
  }

  if (btnOpenAddShirt) {
    btnOpenAddShirt.onclick = openAddShirtModal;
  }

  function bindAddShirtModalEvents() {
    const btnClose = document.getElementById('btnCloseAddShirtModal');
    if (btnClose) btnClose.onclick = closeAddShirtModal;

    const btnCancel = document.getElementById('btnCancelAddShirt');
    if (btnCancel) {
      btnCancel.onclick = () => {
        if (state.newShirtProcessedPreview) {
          // Re-upload
          state.newShirtFile = null;
          state.newShirtProcessedPreview = null;
          state.newShirtMetadata = null;
          modalContent.innerHTML = renderAddShirtModalInner();
          bindAddShirtModalEvents();
        } else {
          closeAddShirtModal();
        }
      };
    }

    const uploadArea = document.getElementById('shirtUploadArea');
    const fileInput = document.getElementById('inputNewShirtFile');
    const optionalNameInput = document.getElementById('inputOptionalShirtName');

    if (uploadArea && fileInput) {
      uploadArea.onclick = () => fileInput.click();

      uploadArea.ondragover = e => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
      };
      uploadArea.ondragleave = () => {
        uploadArea.classList.remove('dragover');
      };
      uploadArea.ondrop = e => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
          handleNewShirtFile(e.dataTransfer.files[0], optionalNameInput ? optionalNameInput.value : '');
        }
      };

      fileInput.onchange = e => {
        if (e.target.files && e.target.files[0]) {
          handleNewShirtFile(e.target.files[0], optionalNameInput ? optionalNameInput.value : '');
        }
      };
    }

    // Confirm & Save Button
    const btnSave = document.getElementById('btnConfirmSaveShirt');
    if (btnSave) {
      btnSave.onclick = async () => {
        const nameVal = document.getElementById('editShirtName')?.value.trim();
        if (!nameVal) {
          showToast('Please provide a shirt name.', 'error');
          return;
        }

        state.isSavingNewShirt = true;
        btnSave.disabled = true;
        btnSave.innerText = 'Saving Garment...';

        try {
          const payload = {
            name: nameVal,
            category: document.getElementById('editShirtCategory')?.value.trim() || 'Overshirt',
            tagline: document.getElementById('editShirtTagline')?.value.trim() || '',
            badge: document.getElementById('editShirtBadge')?.value.trim() || 'New Arrival',
            description: document.getElementById('editShirtDescription')?.value.trim() || '',
            fabric: document.getElementById('editShirtFabric')?.value.trim() || '100% Cotton',
            fit: document.getElementById('editShirtFit')?.value.trim() || 'Tailored Relaxed Fit',
            accentColor: document.getElementById('editShirtAccentColor')?.value || '#3b4252',
            image_base64: state.newShirtProcessedPreview
          };

          const saveRes = await fetch(`${API_BASE}/api/garments/save`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
          });

          if (!saveRes.ok) {
            throw new Error(`Saving failed with status ${saveRes.status}`);
          }

          const savedData = await saveRes.json();
          if (savedData.garment) {
            state.garments.push(savedData.garment);
            state.selectedGarment = savedData.garment;
          }

          closeAddShirtModal();

          // Refresh UI components
          document.getElementById('clothingGrid').innerHTML = renderClothingCards();
          document.getElementById('categoryFilterBar').innerHTML = renderCategoryFilterButtons();

          // Update studio switches
          const switchGrid = document.getElementById('shirtSwitchGrid');
          if (switchGrid) {
            switchGrid.innerHTML = state.garments.map(item => `
              <div class="switch-thumb-card ${item.id === state.selectedGarment.id ? 'active' : ''}" data-shirt-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" />
                <span class="switch-thumb-name">${item.name}</span>
              </div>
            `).join('');
          }

          updateStudioGarmentBadge();
          showToast(`"${nameVal}" added successfully! Available in gallery and AI try-on.`, 'success');
        } catch (saveErr) {
          console.error('Error saving shirt:', saveErr);
          showToast(`Save error: ${saveErr.message}`, 'error');
          state.isSavingNewShirt = false;
          btnSave.disabled = false;
          btnSave.innerText = 'Confirm & Add to Gallery →';
        }
      };
    }
  }

  async function handleNewShirtFile(file, optionalName) {
    state.newShirtFile = file;
    state.isProcessingNewShirt = true;
    modalContent.innerHTML = renderAddShirtModalInner();

    try {
      const formData = new FormData();
      formData.append('shirt_image', file);
      if (optionalName) {
        formData.append('custom_name', optionalName);
      }

      const res = await fetch(`${API_BASE}/api/garments/process`, {
        method: 'POST',
        body: formData
      });

      if (res.status === 429) {
        const errJson = await res.json().catch(() => ({}));
        showQuotaExhaustedAlert(errJson.detail || 'Gemini API tokens finished (HTTP 429). Background removed using local vision engine.');
      } else if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        const msg = errJson.detail || `Background removal & AI analysis failed (${res.status})`;
        if (typeof msg === 'string' && (msg.toLowerCase().includes('quota') || msg.toLowerCase().includes('exhausted') || msg.toLowerCase().includes('tokens'))) {
          showQuotaExhaustedAlert(msg);
        }
        throw new Error(msg);
      }

      const data = await res.json();
      state.isProcessingNewShirt = false;
      state.newShirtProcessedPreview = data.preview_image;
      state.newShirtMetadata = data.metadata;

      modalContent.innerHTML = renderAddShirtModalInner();
      bindAddShirtModalEvents();

      if (data.quota_exhausted) {
        showQuotaExhaustedAlert(data.quota_message || 'Gemini API token quota finished. Used smart fallback metadata.');
      } else {
        showToast('AI background removal complete! Review details.', 'success');
      }
    } catch (err) {
      console.error('Processing shirt error:', err);
      state.isProcessingNewShirt = false;
      modalContent.innerHTML = renderAddShirtModalInner();
      bindAddShirtModalEvents();
      const errText = err.message || '';
      if (errText.toLowerCase().includes('quota') || errText.toLowerCase().includes('exhausted') || errText.toLowerCase().includes('tokens')) {
        showQuotaExhaustedAlert(errText);
      } else {
        showToast(`Processing notice: ${errText}`, 'error');
      }
    }
  }

  // Close modal when clicking backdrop
  modalOverlay.onclick = e => {
    if (e.target.id === 'addShirtModalOverlay') closeAddShirtModal();
  };

  // Return to Catalog
  const handleReturnToCatalog = () => {
    stopCameraStream();
    document.getElementById('studioView').classList.remove('active');
  };
  document.getElementById('btnReturnToCatalog').onclick = handleReturnToCatalog;

  const btnTryAnother = document.getElementById('btnTryAnotherShirt');
  if (btnTryAnother) {
    btnTryAnother.onclick = handleReturnToCatalog;
  }

  // Studio Mode Switcher Tabs
  document.getElementById('studioModeTabs').addEventListener('click', e => {
    const btn = e.target.closest('.studio-tab-btn');
    if (!btn) return;
    openStudio(btn.dataset.mode);
  });

  // Garment Quick Switch Grid
  document.getElementById('shirtSwitchGrid').addEventListener('click', async e => {
    const card = e.target.closest('.switch-thumb-card');
    if (!card) return;
    const shirt = state.garments.find(g => g.id === card.dataset.shirtId);
    if (!shirt) return;

    state.selectedGarment = shirt;
    updateStudioGarmentBadge();

    document.querySelectorAll('.switch-thumb-card').forEach(c => {
      c.classList.toggle('active', c.dataset.shirtId === shirt.id);
    });

    currentGarmentCutoutImg = await preloadGarmentImage(shirt.cutout || shirt.image);

    // If an AI result was previously generated, re-render it for the new garment
    if (state.currentMode === 'photo_ai' && state.aiResultDataUrl) {
      await runPhotorealisticTryOn();
    }
  });

  // Real Model Selector
  document.querySelectorAll('.preset-model-btn').forEach(btn => {
    btn.onclick = async () => {
      state.activeModelId = btn.dataset.modelId;
      state.currentPersonFile = null;
      document.querySelectorAll('.preset-model-btn').forEach(b => b.classList.toggle('active', b === btn));
      
      const dropMain = document.getElementById('dropzoneMainText');
      const dropSub = document.getElementById('dropzoneSubText');
      if (dropMain) dropMain.innerText = 'Upload Your Real Photo';
      if (dropSub) dropSub.innerText = 'Click to browse or drop an image (JPG, PNG, WebP)';

      // Set model image as preview without auto-running AI unless already in result mode
      const selectedModel = REAL_HUMAN_MODELS.find(m => m.id === state.activeModelId);
      if (selectedModel) {
        state.currentPersonDataUrl = selectedModel.image;
        updateStudioModeUI();
      }
      
      if (state.aiResultDataUrl) {
        await runPhotorealisticTryOn();
      }
    };
  });

  // Clean Upload Stage Handlers
  const cleanPlusBox = document.getElementById('cleanUploadPlusBox');
  const cleanFileInput = document.getElementById('cleanFileInput');
  const btnCleanChangePhoto = document.getElementById('btnCleanChangePhoto');
  const btnCleanGenerateTryOn = document.getElementById('btnCleanGenerateTryOn');

  if (cleanPlusBox && cleanFileInput) {
    cleanPlusBox.onclick = () => cleanFileInput.click();

    cleanPlusBox.addEventListener('dragover', e => {
      e.preventDefault();
      cleanPlusBox.classList.add('dragover');
    });
    cleanPlusBox.addEventListener('dragleave', () => {
      cleanPlusBox.classList.remove('dragover');
    });
    cleanPlusBox.addEventListener('drop', async e => {
      e.preventDefault();
      cleanPlusBox.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleUserUploadedFile(e.dataTransfer.files[0]);
      }
    });

    cleanFileInput.onchange = async e => {
      if (e.target.files && e.target.files[0]) {
        handleUserUploadedFile(e.target.files[0]);
      }
    };
  }

  if (btnCleanChangePhoto && cleanFileInput) {
    btnCleanChangePhoto.onclick = () => cleanFileInput.click();
  }

  if (btnCleanGenerateTryOn) {
    btnCleanGenerateTryOn.onclick = async () => {
      await runPhotorealisticTryOn();
    };
  }

  // Camera Live Capture Modal Handling
  const captureModalOverlay = document.getElementById('captureModalOverlay');
  const captureModalVideo = document.getElementById('captureModalVideo');
  const captureModalCanvas = document.getElementById('captureModalCanvas');
  const btnCaptureModalClose = document.getElementById('btnCaptureModalClose');
  const btnCaptureModalSnap = document.getElementById('btnCaptureModalSnap');
  const btnCaptureModalFlip = document.getElementById('btnCaptureModalFlip');
  const cleanCaptureCameraBox = document.getElementById('cleanCaptureCameraBox');
  const btnCleanRetakePhoto = document.getElementById('btnCleanRetakePhoto');
  const btnSidebarLivePhoto = document.getElementById('btnSidebarLivePhoto');

  let captureStream = null;
  let isCaptureMirrored = true;

  async function openLiveCameraCapture() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      showToast('Camera API is not supported in this browser.', 'error');
      return;
    }
    try {
      captureModalOverlay.style.display = 'flex';
      captureModalVideo.style.transform = isCaptureMirrored ? 'scaleX(-1)' : 'none';
      captureStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
        audio: false
      });
      captureModalVideo.srcObject = captureStream;
      await captureModalVideo.play();
    } catch (err) {
      console.error('Camera open error:', err);
      captureModalOverlay.style.display = 'none';
      showToast(`Unable to open camera: ${err.message || 'Permission denied'}`, 'error');
    }
  }

  function closeLiveCameraCapture() {
    if (captureStream) {
      captureStream.getTracks().forEach(t => t.stop());
      captureStream = null;
    }
    if (captureModalVideo) {
      captureModalVideo.srcObject = null;
    }
    if (captureModalOverlay) {
      captureModalOverlay.style.display = 'none';
    }
  }

  function takeLiveSnapshot() {
    if (!captureModalVideo || !captureModalVideo.videoWidth) {
      showToast('Camera feed not ready yet', 'error');
      return;
    }

    const vw = captureModalVideo.videoWidth;
    const vh = captureModalVideo.videoHeight;
    captureModalCanvas.width = vw;
    captureModalCanvas.height = vh;
    const ctx = captureModalCanvas.getContext('2d');

    ctx.save();
    if (isCaptureMirrored) {
      ctx.translate(vw, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(captureModalVideo, 0, 0, vw, vh);
    ctx.restore();

    captureModalCanvas.toBlob(blob => {
      if (!blob) {
        showToast('Failed to capture photo snapshot', 'error');
        return;
      }
      const snapshotFile = new File([blob], `live_snapshot_${Date.now()}.jpg`, { type: 'image/jpeg' });
      closeLiveCameraCapture();
      handleUserUploadedFile(snapshotFile);
      showToast('Photo clicked successfully! Click "Generate Try-On" to preview garment.', 'success');
    }, 'image/jpeg', 0.95);
  }

  if (cleanCaptureCameraBox) {
    cleanCaptureCameraBox.onclick = () => openLiveCameraCapture();
  }

  if (btnCleanRetakePhoto) {
    btnCleanRetakePhoto.onclick = () => openLiveCameraCapture();
  }

  if (btnSidebarLivePhoto) {
    btnSidebarLivePhoto.onclick = () => openLiveCameraCapture();
  }

  if (btnCaptureModalClose) {
    btnCaptureModalClose.onclick = () => closeLiveCameraCapture();
  }

  if (btnCaptureModalFlip) {
    btnCaptureModalFlip.onclick = () => {
      isCaptureMirrored = !isCaptureMirrored;
      if (captureModalVideo) {
        captureModalVideo.style.transform = isCaptureMirrored ? 'scaleX(-1)' : 'none';
      }
    };
  }

  if (btnCaptureModalSnap) {
    btnCaptureModalSnap.onclick = () => takeLiveSnapshot();
  }

  // Upload Real Photo (Sidebar Dropzone)
  const dropzone = document.getElementById('panelUploadDropzone');
  const fileInput = document.getElementById('panelFileInput');
  if (dropzone && fileInput) {
    dropzone.onclick = () => fileInput.click();

    // Drag and drop support
    dropzone.addEventListener('dragover', e => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
    dropzone.addEventListener('dragleave', () => {
      dropzone.classList.remove('dragover');
    });
    dropzone.addEventListener('drop', async e => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleUserUploadedFile(e.dataTransfer.files[0]);
      }
    });

    fileInput.onchange = async e => {
      if (e.target.files && e.target.files[0]) {
        handleUserUploadedFile(e.target.files[0]);
      }
    };
  }

  function handleUserUploadedFile(file) {
    state.currentPersonFile = file;
    // Create local object URL for preview immediately without calling any AI API
    const previewUrl = URL.createObjectURL(file);
    state.currentPersonDataUrl = previewUrl;
    state.aiResultDataUrl = null; // reset previous result so user sees preview first

    document.querySelectorAll('.preset-model-btn').forEach(b => b.classList.remove('active'));
    
    const dropMain = document.getElementById('dropzoneMainText');
    const dropSub = document.getElementById('dropzoneSubText');
    if (dropMain) dropMain.innerText = `Selected: ${file.name}`;
    if (dropSub) dropSub.innerText = 'Click "Generate Try-On" below to run virtual try-on';

    updateStudioModeUI();
    showToast(`Loaded ${file.name}. Ready to generate try-on!`, 'info');
  }

  // Before / After Compare Buttons
  const btnShowBefore = document.getElementById('btnShowBefore');
  const btnShowAfter = document.getElementById('btnShowAfter');

  if (btnShowBefore) {
    btnShowBefore.onclick = () => {
      state.compareMode = 'before';
      btnShowBefore.classList.add('active');
      if (btnShowAfter) btnShowAfter.classList.remove('active');
      document.getElementById('compareImg').src = state.aiOriginalDataUrl || '';
    };
  }

  if (btnShowAfter) {
    btnShowAfter.onclick = () => {
      state.compareMode = 'after';
      btnShowAfter.classList.add('active');
      if (btnShowBefore) btnShowBefore.classList.remove('active');
      document.getElementById('compareImg').src = state.aiResultDataUrl || '';
    };
  }

  // Camera Mirror Toggle
  const btnToggleMirror = document.getElementById('btnToggleMirror');
  if (btnToggleMirror) {
    btnToggleMirror.onclick = () => {
      state.isMirrored = !state.isMirrored;
      btnToggleMirror.classList.toggle('active', state.isMirrored);
    };
  }

  // Live AR Fit Sliders
  const sliderScale = document.getElementById('sliderScaleMultiplier');
  const labelScale = document.getElementById('labelScaleMultiplier');
  if (sliderScale && labelScale) {
    sliderScale.oninput = e => {
      state.scaleMultiplier = parseFloat(e.target.value);
      labelScale.innerText = `${state.scaleMultiplier.toFixed(2)}x`;
    };
  }

  const sliderVert = document.getElementById('sliderVerticalOffset');
  const labelVert = document.getElementById('labelVerticalOffset');
  if (sliderVert && labelVert) {
    sliderVert.oninput = e => {
      state.verticalOffset = parseInt(e.target.value, 10);
      labelVert.innerText = `${state.verticalOffset > 0 ? '+' : ''}${state.verticalOffset} px`;
    };
  }

  const sliderOpac = document.getElementById('sliderGarmentOpacity');
  const labelOpac = document.getElementById('labelGarmentOpacity');
  if (sliderOpac && labelOpac) {
    sliderOpac.oninput = e => {
      state.garmentOpacity = parseFloat(e.target.value);
      labelOpac.innerText = `${Math.round(state.garmentOpacity * 100)}%`;
    };
  }

  // Close modal when clicking overlay backdrop
  document.getElementById('detailModalOverlay').onclick = e => {
    if (e.target.id === 'detailModalOverlay') closeDetailModal();
  };
}

/* ==========================================================================
   TOASTS & API QUOTA ALERTS
   ========================================================================== */
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'error' ? '⚠️' : type === 'warning' ? '⏳' : type === 'success' ? '✨' : 'ℹ️'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

function showQuotaExhaustedAlert(customMessage) {
  // Check if modal already exists
  let existing = document.getElementById('quotaAlertModalOverlay');
  if (existing) existing.remove();

  const msg = customMessage || 'Your API token or quota limit has finished (HTTP 429 Resource Exhausted).';

  const overlay = document.createElement('div');
  overlay.className = 'quota-alert-modal-overlay';
  overlay.id = 'quotaAlertModalOverlay';
  overlay.innerHTML = `
    <div class="quota-alert-card">
      <div class="quota-alert-icon">⚠️</div>
      <div class="quota-alert-title">API Token Limit Finished</div>
      <div class="quota-alert-desc">
        ${msg}
      </div>
      <div class="quota-alert-tip">
        <strong>What this means:</strong><br/>
        • Gemini / Cloud AI vision or diffusion credits for this key are temporarily exhausted.<br/>
        • The atelier automatically uses high-precision local fallback rendering.<br/>
        • You can renew your token in <code>backend/.env</code>.
      </div>
      <button class="quota-alert-btn" id="btnDismissQuotaAlert">Understood & Continue</button>
    </div>
  `;

  document.body.appendChild(overlay);

  const dismissBtn = overlay.querySelector('#btnDismissQuotaAlert');
  if (dismissBtn) {
    dismissBtn.onclick = () => overlay.remove();
  }
  overlay.onclick = (e) => {
    if (e.target === overlay) overlay.remove();
  };
}

window.showQuotaExhaustedAlert = showQuotaExhaustedAlert;

window.addEventListener('DOMContentLoaded', initApp);

