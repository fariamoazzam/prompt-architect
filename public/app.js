var gapAnswers = [];
var finalGoal = '';
var selectedModel = '';
var selectedFormat = '';
var selectedComplexity = '';
var generatedPrompt = '';

// ─── Chip selection ───────────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      var isSingle = chip.getAttribute('data-single') === 'true';
      var group = chip.closest('.chips');

      if (isSingle) {
        group.querySelectorAll('.chip').forEach(function (c) {
          c.classList.remove('selected');
        });
        chip.classList.add('selected');
      } else {
        chip.classList.toggle('selected');
      }
    });
  });
});

function getSelected(groupId) {
  var chips = document.getElementById(groupId).querySelectorAll('.chip.selected');
  return Array.from(chips).map(function (c) { return c.textContent.trim(); }).join(', ');
}

// ─── Phase 1 → Phase 2: Analyze gaps ─────────────────────────────────────────

async function analyzeGaps() {
  var goal = document.getElementById('goal').value.trim();
  if (!goal) {
    document.getElementById('goal').focus();
    return;
  }

  finalGoal = goal;
  selectedModel = getSelected('modelChips') || 'Claude';
  selectedFormat = getSelected('formatChips') || 'Code';
  selectedComplexity = getSelected('complexChips') || 'Multi-step task';

  var btn = document.getElementById('analyzeBtn');
  btn.disabled = true;
  btn.classList.add('loading-text');
  btn.textContent = 'Analysing';

  try {
    var res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal: finalGoal,
        model: selectedModel,
        format: selectedFormat,
        complexity: selectedComplexity
      })
    });

    var data = await res.json();
    if (data.error) throw new Error(data.error);

    renderGaps(data.gaps);
    showPhase(2);
  } catch (err) {
    alert('Error: ' + err.message);
    btn.disabled = false;
    btn.classList.remove('loading-text');
    btn.textContent = 'Identify gaps →';
  }
}

function renderGaps(gaps) {
  gapAnswers = gaps.map(function (g) {
    return { question: g.question, why: g.why, answer: '' };
  });

  var html = '';
  gaps.forEach(function (g, i) {
    html += '<div class="gap-item">';
    html += '<div class="gap-q">' + escapeHtml(g.question) + '</div>';
    html += '<div class="gap-why">Why this matters: ' + escapeHtml(g.why) + '</div>';
    html += '<textarea rows="2" placeholder="Your answer (or leave blank to skip)..." data-index="' + i + '"></textarea>';
    html += '</div>';
  });

  document.getElementById('gapsList').innerHTML = html;

  document.getElementById('gapsList').querySelectorAll('textarea').forEach(function (ta) {
    ta.addEventListener('input', function () {
      gapAnswers[parseInt(ta.getAttribute('data-index'))].answer = ta.value;
    });
  });
}

// ─── Phase 2 → Phase 3: Build prompt ─────────────────────────────────────────

async function buildPrompt() {
  var btn = document.getElementById('buildBtn');
  btn.disabled = true;
  btn.classList.add('loading-text');
  btn.textContent = 'Building prompt';

  try {
    var res = await fetch('/api/build', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goal: finalGoal,
        model: selectedModel,
        format: selectedFormat,
        gapAnswers: gapAnswers
      })
    });

    var data = await res.json();
    if (data.error) throw new Error(data.error);

    generatedPrompt = data.prompt;
    renderOutput(generatedPrompt);
    document.getElementById('modelBadge').textContent = selectedModel + ' optimised';
    showPhase(3);
  } catch (err) {
    alert('Error: ' + err.message);
    btn.disabled = false;
    btn.classList.remove('loading-text');
    btn.textContent = 'Build my prompt →';
  }
}

function renderOutput(text) {
  var escaped = escapeHtml(text);

  // Highlight XML tags in purple
  escaped = escaped.replace(/&lt;(\/?[\w_]+)&gt;/g, function (m, tag) {
    return '<span class="xml-tag">&lt;' + tag + '&gt;</span>';
  });

  // Highlight placeholders in amber
  escaped = escaped.replace(/\[PLACEHOLDER:[^\]]+\]/g, function (m) {
    return '<span class="xml-placeholder">' + m + '</span>';
  });

  document.getElementById('outputBox').innerHTML = escaped;
}

// ─── Copy to clipboard ────────────────────────────────────────────────────────

function copyPrompt() {
  navigator.clipboard.writeText(generatedPrompt).then(function () {
    var msg = document.getElementById('copiedMsg');
    msg.classList.remove('hidden');
    setTimeout(function () { msg.classList.add('hidden'); }, 2000);
  });
}

// ─── Navigation ───────────────────────────────────────────────────────────────

function goBack() {
  showPhase(1);
  var btn = document.getElementById('analyzeBtn');
  btn.disabled = false;
  btn.classList.remove('loading-text');
  btn.textContent = 'Identify gaps →';
}

function resetAll() {
  document.getElementById('goal').value = '';
  gapAnswers = [];
  generatedPrompt = '';
  showPhase(1);
  var btn = document.getElementById('analyzeBtn');
  btn.disabled = false;
  btn.classList.remove('loading-text');
  btn.textContent = 'Identify gaps →';
}

function showPhase(n) {
  document.getElementById('phase1').classList.toggle('hidden', n !== 1);
  document.getElementById('phase2').classList.toggle('hidden', n !== 2);
  document.getElementById('phase3').classList.toggle('hidden', n !== 3);

  [1, 2, 3].forEach(function (i) {
    var el = document.getElementById('step' + i + '-indicator');
    el.classList.remove('active', 'done');
    if (i < n) {
      el.classList.add('done');
      el.querySelector('.step-num').textContent = '✓';
    } else if (i === n) {
      el.classList.add('active');
      el.querySelector('.step-num').textContent = i;
    } else {
      el.querySelector('.step-num').textContent = i;
    }
  });
}

// ─── Utility ──────────────────────────────────────────────────────────────────

function escapeHtml(text) {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
