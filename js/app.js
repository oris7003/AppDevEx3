// Vanilla JavaScript AJAX client for HTTP & REST Educational Game
document.addEventListener('DOMContentLoaded', () => {
  // Read stage data embedded from server SSR
  const stagesDataElement = document.getElementById('stages-data');
  const stages = stagesDataElement ? JSON.parse(stagesDataElement.textContent) : [];
  const totalStages = stages.length;

  // Local storage state tracking keys
  const STORAGE_KEY_STAGE = 'appdev_ex3_current_stage';
  const STORAGE_KEY_COMPLETED = 'appdev_ex3_completed_stages';
  const STORAGE_KEY_ATTEMPTS = 'appdev_ex3_attempts';

  // Game state
  let currentStageIndex = 0;
  let completedStages = new Set();
  let totalAttempts = 0;

  // DOM Elements
  const activeStageNumEl = document.getElementById('active-stage-number');
  const stageDisplayTextEl = document.getElementById('stage-display-text');
  const attemptCounterEl = document.getElementById('attempt-counter');
  const completedCounterEl = document.getElementById('completed-counter');
  const progressBarEl = document.getElementById('progress-bar');
  const stageNavGridEl = document.getElementById('stage-nav-grid');

  const scenarioStageBadgeEl = document.getElementById('scenario-stage-badge');
  const scenarioTitleEl = document.getElementById('scenario-title');
  const scenarioDescEl = document.getElementById('scenario-desc');
  const conceptsListEl = document.getElementById('concepts-list');

  const formEl = document.getElementById('http-request-form');
  const methodSelectEl = document.getElementById('http-method');
  const pathInputEl = document.getElementById('http-path');
  const queryParamsListEl = document.getElementById('query-params-list');
  const addQueryParamBtn = document.getElementById('add-query-param-btn');
  const bodyTextareaEl = document.getElementById('http-body');
  const formatJsonBtn = document.getElementById('format-json-btn');
  const clearBodyBtn = document.getElementById('clear-body-btn');
  const resetInputsBtn = document.getElementById('reset-inputs-btn');
  const sendRequestBtn = document.getElementById('send-request-btn');

  const statusIndicatorWrap = document.getElementById('status-indicator-wrap');
  const statusBadgeEl = document.getElementById('status-badge');
  const timeBadgeEl = document.getElementById('time-badge');
  const validationBannerEl = document.getElementById('validation-banner');
  const validationIconEl = document.getElementById('validation-icon');
  const validationTitleEl = document.getElementById('validation-title');
  const validationDescEl = document.getElementById('validation-desc');
  const nextStageBtn = document.getElementById('next-stage-btn');
  const requestedUrlDisplay = document.getElementById('requested-url-display');
  const responseHeadersDisplay = document.getElementById('response-headers-display');
  const responseCodeDisplay = document.getElementById('response-code-display');
  const copyResponseBtn = document.getElementById('copy-response-btn');
  const resetStoreBtn = document.getElementById('reset-store-btn');

  // Load saved state from localStorage
  function loadSavedState() {
    try {
      const savedStage = parseInt(localStorage.getItem(STORAGE_KEY_STAGE), 10);
      if (!isNaN(savedStage) && savedStage >= 1 && savedStage <= totalStages) {
        currentStageIndex = savedStage - 1;
      }
      const savedCompleted = JSON.parse(localStorage.getItem(STORAGE_KEY_COMPLETED) || '[]');
      completedStages = new Set(savedCompleted);

      const savedAttempts = parseInt(localStorage.getItem(STORAGE_KEY_ATTEMPTS), 10);
      if (!isNaN(savedAttempts)) {
        totalAttempts = savedAttempts;
      }
    } catch (e) {
      console.warn('Could not read saved game state:', e);
    }
  }

  // Save current state to localStorage
  function persistState() {
    try {
      localStorage.setItem(STORAGE_KEY_STAGE, String(currentStageIndex + 1));
      localStorage.setItem(STORAGE_KEY_COMPLETED, JSON.stringify(Array.from(completedStages)));
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, String(totalAttempts));
    } catch (e) {
      console.warn('Could not save game state:', e);
    }
  }

  // Render stage UI details (without page reload)
  function renderStage(index) {
    if (index < 0 || index >= totalStages) return;
    currentStageIndex = index;
    const stage = stages[currentStageIndex];

    // Update progress numbers
    activeStageNumEl.textContent = stage.id;
    stageDisplayTextEl.innerHTML = `שלב <span id="active-stage-number">${stage.id}</span> מתוך ${totalStages}`;
    attemptCounterEl.textContent = totalAttempts;
    completedCounterEl.textContent = completedStages.size;

    const percent = Math.round(((currentStageIndex + 1) / totalStages) * 100);
    progressBarEl.style.width = `${percent}%`;

    // Update scenario card
    scenarioStageBadgeEl.textContent = `שלב ${stage.id}`;
    scenarioTitleEl.textContent = stage.title;
    scenarioDescEl.textContent = stage.description;

    // Render concept tags
    conceptsListEl.innerHTML = '';
    stage.concepts.forEach(concept => {
      const span = document.createElement('span');
      span.className = 'concept-pill';
      span.textContent = concept;
      conceptsListEl.appendChild(span);
    });

    // Update stage nav buttons
    renderNavButtons();

    // Reset validation banner to initial stage prompt
    validationBannerEl.className = 'validation-banner';
    validationIconEl.textContent = '💡';
    validationTitleEl.textContent = `אתגר שלב ${stage.id}`;
    validationDescEl.textContent = 'הרכב את פרטי הבקשה ולחץ על "שלח בקשת HTTP" כדי לבדוק את תשובת השרת.';
    nextStageBtn.style.display = 'none';

    persistState();
  }

  // Render navigation buttons states
  function renderNavButtons() {
    const navButtons = stageNavGridEl.querySelectorAll('.stage-nav-btn');
    navButtons.forEach(btn => {
      const stageId = parseInt(btn.dataset.stageId, 10);
      const isCompleted = completedStages.has(stageId);
      const isCurrent = stageId === (currentStageIndex + 1);

      btn.classList.remove('active', 'completed', 'locked');

      if (isCurrent) {
        btn.classList.add('active');
      } else if (isCompleted) {
        btn.classList.add('completed');
      } else if (stageId <= completedStages.size + 1) {
        // Next accessible stage
      } else {
        btn.classList.add('locked');
      }
    });
  }

  // Add dynamic Query Parameter row
  function addQueryParamRow(key = '', value = '') {
    const row = document.createElement('div');
    row.className = 'param-row';
    row.innerHTML = `
      <input type="text" class="param-input param-key code-font" placeholder="Key (e.g. category)" value="${escapeHtml(key)}" dir="ltr">
      <input type="text" class="param-input param-val code-font" placeholder="Value (e.g. Science)" value="${escapeHtml(value)}" dir="ltr">
      <button type="button" class="btn-remove-param" title="הסר פרמטר">&times;</button>
    `;

    row.querySelector('.btn-remove-param').addEventListener('click', () => {
      row.remove();
    });

    queryParamsListEl.appendChild(row);
  }

  // Helper to escape HTML characters
  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // Collect Query Parameters from input fields
  function getQueryParamsString() {
    const rows = queryParamsListEl.querySelectorAll('.param-row');
    const params = new URLSearchParams();
    rows.forEach(row => {
      const key = row.querySelector('.param-key').value.trim();
      const val = row.querySelector('.param-val').value.trim();
      if (key) {
        params.append(key, val);
      }
    });
    const qs = params.toString();
    return qs ? `?${qs}` : '';
  }

  // Execute AJAX HTTP request to server
  async function sendHttpRequest(e) {
    if (e) e.preventDefault();

    const method = methodSelectEl.value.toUpperCase();
    let rawPath = pathInputEl.value.trim();

    if (!rawPath.startsWith('/')) {
      rawPath = '/' + rawPath;
    }

    const queryStr = getQueryParamsString();
    const fullUrl = rawPath + queryStr;

    // Increment attempt counter
    totalAttempts++;
    attemptCounterEl.textContent = totalAttempts;
    persistState();

    // Prepare Request options
    const stageId = stages[currentStageIndex].id;
    const headers = {
      'Accept': 'application/json',
      'X-Stage-Id': String(stageId)
    };

    const options = {
      method,
      headers
    };

    // Attach Body if method is POST, PUT, or PATCH
    if (['POST', 'PUT', 'PATCH'].includes(method)) {
      const rawBody = bodyTextareaEl.value.trim();
      if (rawBody) {
        try {
          // Validate JSON syntax before sending
          JSON.parse(rawBody);
          headers['Content-Type'] = 'application/json';
          options.body = rawBody;
        } catch (err) {
          showValidationResult(false, 'שגיאת תחביר ב-JSON: בדוק תקינות מרכאות ופסיקים ב-Request Body.', 400);
          return;
        }
      }
    }

    requestedUrlDisplay.textContent = `${method} ${fullUrl}`;
    sendRequestBtn.disabled = true;
    sendRequestBtn.textContent = '⏳ שולח בקשה...';

    const startTime = performance.now();

    try {
      const response = await fetch(fullUrl, options);
      const endTime = performance.now();
      const elapsedMs = Math.round(endTime - startTime);

      // Extract response metadata
      const status = response.status;
      const statusText = response.statusText || '';
      const responseContentType = response.headers.get('content-type') || '';
      responseHeadersDisplay.textContent = `Status: ${status} | Content-Type: ${responseContentType}`;

      // Update timing & status badge
      statusIndicatorWrap.style.display = 'flex';
      statusBadgeEl.textContent = `${status} ${statusText}`;
      statusBadgeEl.className = 'status-badge ' + (status >= 200 && status < 300 ? 'status-2xx' : (status >= 400 && status < 500 ? 'status-4xx' : 'status-5xx'));
      timeBadgeEl.textContent = `${elapsedMs}ms`;

      // Read response payload
      let data;
      try {
        data = await response.json();
      } catch (jsonErr) {
        data = { message: await response.text() };
      }

      // Render response code block
      responseCodeDisplay.textContent = JSON.stringify(data, null, 2);

      // Read server-side validation result
      const isSolvedHeader = response.headers.get('X-Stage-Solved') === 'true';
      const validationData = data && data.validation ? data.validation : null;
      const isSuccess = isSolvedHeader || (validationData && validationData.success);
      const message = validationData ? validationData.message : (isSuccess ? 'הבקשה תואמת לדרישות השלב!' : 'הבקשה לא התקבלה על ידי השרת.');

      showValidationResult(isSuccess, message, status);

      if (isSuccess) {
        completedStages.add(stageId);
        completedCounterEl.textContent = completedStages.size;
        renderNavButtons();
        persistState();

        if (currentStageIndex < totalStages - 1) {
          nextStageBtn.style.display = 'inline-flex';
          nextStageBtn.textContent = `המשך לשלב ${stageId + 1} ⬅️`;
        } else {
          nextStageBtn.style.display = 'none';
          validationTitleEl.textContent = '🎉 מזל טוב! סיימת את כל שלבי המשחק!';
        }
      } else {
        nextStageBtn.style.display = 'none';
      }

    } catch (networkErr) {
      console.error('Network error during HTTP request:', networkErr);
      statusIndicatorWrap.style.display = 'flex';
      statusBadgeEl.textContent = 'ERROR';
      statusBadgeEl.className = 'status-badge status-5xx';
      timeBadgeEl.textContent = '0ms';
      responseCodeDisplay.textContent = `Error: ${networkErr.message}`;
      showValidationResult(false, `שגיאת רשת בשליחת הבקשה: ${networkErr.message}`, 0);
    } finally {
      sendRequestBtn.disabled = false;
      sendRequestBtn.innerHTML = '🚀 שלח בקשת HTTP';
    }
  }

  // Display validation banner outcome
  function showValidationResult(success, message, statusCode) {
    validationBannerEl.className = 'validation-banner ' + (success ? 'success' : 'error');
    validationIconEl.textContent = success ? '✅' : '❌';
    validationTitleEl.textContent = success ? 'פתרון נכון! (Stage Solved)' : 'פתרון שגוי (Try Again)';
    validationDescEl.textContent = message;
  }

  // Setup Event Listeners
  function attachEventListeners() {
    // Submit HTTP request
    formEl.addEventListener('submit', sendHttpRequest);

    // Add query parameter row
    addQueryParamBtn.addEventListener('click', () => addQueryParamRow());

    // Format JSON body button
    formatJsonBtn.addEventListener('click', () => {
      try {
        const parsed = JSON.parse(bodyTextareaEl.value);
        bodyTextareaEl.value = JSON.stringify(parsed, null, 2);
      } catch (err) {
        alert('לא ניתן לעצב: מבנה JSON אינו תקין');
      }
    });

    // Clear body textarea
    clearBodyBtn.addEventListener('click', () => {
      bodyTextareaEl.value = '';
    });

    // Reset inputs form
    resetInputsBtn.addEventListener('click', () => {
      methodSelectEl.value = 'GET';
      pathInputEl.value = '/api/books';
      queryParamsListEl.innerHTML = '';
      bodyTextareaEl.value = '';
      statusIndicatorWrap.style.display = 'none';
      responseCodeDisplay.textContent = '// התוצאה שתתקבל מהשרת תוצג כאן...';
      validationBannerEl.className = 'validation-banner';
      validationIconEl.textContent = '💡';
      validationTitleEl.textContent = `אתגר שלב ${stages[currentStageIndex].id}`;
      validationDescEl.textContent = 'הרכב את פרטי הבקשה ולחץ על "שלח בקשת HTTP" לבדיקה.';
      nextStageBtn.style.display = 'none';
    });

    // Next stage button
    nextStageBtn.addEventListener('click', () => {
      if (currentStageIndex < totalStages - 1) {
        renderStage(currentStageIndex + 1);
        resetInputsBtn.click();
      }
    });

    // Stage navigation pills click
    stageNavGridEl.addEventListener('click', (e) => {
      const btn = e.target.closest('.stage-nav-btn');
      if (!btn) return;
      const targetId = parseInt(btn.dataset.stageId, 10);
      const isCompleted = completedStages.has(targetId);
      const isNextAccessible = targetId <= completedStages.size + 1;

      if (isCompleted || isNextAccessible) {
        renderStage(targetId - 1);
        resetInputsBtn.click();
      }
    });

    // Copy JSON response
    copyResponseBtn.addEventListener('click', () => {
      navigator.clipboard.writeText(responseCodeDisplay.textContent).then(() => {
        copyResponseBtn.textContent = '✔️ הועתק!';
        setTimeout(() => {
          copyResponseBtn.textContent = '📋 העתק JSON';
        }, 2000);
      });
    });

    // Reset store in-memory database
    if (resetStoreBtn) {
      resetStoreBtn.addEventListener('click', async () => {
        if (!confirm('האם לאפס את נתוני השרת למצבם ההתחלתי?')) return;
        try {
          const res = await fetch('/api/reset', { method: 'POST' });
          const result = await res.json();
          alert(result.message || 'נתוני השרת אופסו בהצלחה');
        } catch (err) {
          alert('שגיאה באיפוס נתוני השרת: ' + err.message);
        }
      });
    }
  }

  // Initialize application
  loadSavedState();
  renderStage(currentStageIndex);
  attachEventListeners();
});
