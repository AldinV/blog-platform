(function () {
  function ensureModal() {
    let modal = document.getElementById('app-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'app-modal';
      modal.className = 'modal fade';
      modal.tabIndex = -1;
      modal.innerHTML = [
        '<div class="modal-dialog modal-dialog-centered modal-lg">',
        '  <div class="modal-content">',
        '    <div class="modal-header">',
        '      <h5 class="modal-title"></h5>',
        '      <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>',
        '    </div>',
        '    <div class="modal-body"></div>',
        '    <div class="modal-footer">',
        '      <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>',
        '    </div>',
        '  </div>',
        '</div>'
      ].join('');
      document.body.appendChild(modal);
    }
    return modal;
  }

  function open(options) {
    const modal = ensureModal();
    modal.querySelector('.modal-title').textContent = options.title || '';
    modal.querySelector('.modal-body').innerHTML = options.body || '';
    const footer = modal.querySelector('.modal-footer');
    footer.innerHTML = '';
    (options.buttons || [{ label: 'Close', class: 'btn btn-secondary', attrs: { 'data-bs-dismiss': 'modal' } }]).forEach(btn => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = btn.class || 'btn btn-secondary';
      b.textContent = btn.label;
      if (btn.onClick) b.addEventListener('click', btn.onClick);
      if (btn.attrs) Object.entries(btn.attrs).forEach(([k, v]) => b.setAttribute(k, v));
      footer.appendChild(b);
    });
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
  }

  window.Modal = { open };
})();
