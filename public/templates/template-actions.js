// Kept in an external file: the site's Content-Security-Policy blocks inline scripts and onclick handlers.
(function () {
  function updateProgress() {
    var fill = document.getElementById('progressFill');
    if (!fill) return;
    var boxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
    var done = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
    var pct = boxes.length ? Math.round((done / boxes.length) * 100) : 0;
    document.getElementById('completed').textContent = done;
    document.getElementById('total').textContent = boxes.length;
    document.getElementById('percentage').textContent = pct + '%';
    fill.style.width = pct + '%';
    fill.textContent = pct + '%';
  }

  function clearForm() {
    if (!confirm('Clear everything you have entered?')) return;
    document.querySelectorAll('input, textarea, select').forEach(function (el) {
      if (el.type === 'checkbox' || el.type === 'radio') el.checked = el.defaultChecked;
      else if (el.tagName === 'SELECT') el.selectedIndex = 0;
      else el.value = el.defaultValue;
    });
    updateProgress();
  }

  document.addEventListener('click', function (e) {
    var btn = e.target.closest('[data-action]');
    if (!btn) return;
    if (btn.dataset.action === 'print') window.print();
    if (btn.dataset.action === 'clear') clearForm();
  });

  document.addEventListener('change', updateProgress);
  document.addEventListener('DOMContentLoaded', updateProgress);
})();
