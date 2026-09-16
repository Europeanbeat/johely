(() => {
  const tabs = document.getElementById('question-tabs');
  if (!tabs) return;
  const buttons = [...tabs.querySelectorAll('[role="tab"]')];
  const panels = buttons.map(button => document.getElementById(button.getAttribute('aria-controls')));
  const compact = window.matchMedia('(max-width: 820px)');
  let active = 0;
  const render = () => {
    tabs.hidden = !compact.matches;
    buttons.forEach((button, index) => {
      button.setAttribute('aria-selected', String(index === active));
      button.tabIndex = index === active ? 0 : -1;
      const panel = panels[index];
      panel.hidden = compact.matches && index !== active;
      panel.tabIndex = compact.matches && index === active ? 0 : -1;
      panel.setAttribute('role', compact.matches ? 'tabpanel' : 'region');
      panel.setAttribute('aria-labelledby', compact.matches ? button.id : `${panel.id}-title`);
    });
  };
  buttons.forEach((button, index) => {
    button.addEventListener('click', () => { active = index; render(); });
    button.addEventListener('keydown', event => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      active = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
      render();
      buttons[active].focus();
    });
  });
  compact.addEventListener('change', render);
  render();
})();
