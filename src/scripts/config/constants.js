export const KEYS = {
  Enter: 'Enter',
  Space: ' ',
  Escape: 'Escape',
  Tab: 'Tab',
  ArrowUp: 'ArrowUp',
  ArrowDown: 'ArrowDown',
  ArrowLeft: 'ArrowLeft',
  ArrowRight: 'ArrowRight',
  Home: 'Home',
  End: 'End',
}

export const CLASSES = {
  modalOpen: 'is-open',
  panelHidden: 'is-hidden',
  open: 'is-open',
  videoPlaying: 'is-playing',
}

export const ATTRIBUTES = {
  ariaExpanded: 'aria-expanded',
  ariaSelected: 'aria-selected',
  ariaDisabled: 'aria-disabled',
  ariaControls: 'aria-controls',
  ariaHidden: 'aria-hidden',
  ariaModal: 'aria-modal',
}

export const EVENTS = {
  alertDismiss: 'alert:dismiss',
  panelDismiss: 'panel:dismiss',
  modalOpen: 'modal:open',
  modalClose: 'modal:close',
}

export const BREAKPOINTS = {
  headerDesktop: '(min-width: 1181px)',
}

export const TIMINGS = {
  // Grace period before a hover-opened desktop dropdown closes after the pointer
  // leaves the nav item. It covers the brief moment the pointer spends in the
  // visual gap between the trigger and the panel (the panel is absolutely
  // positioned below the trigger, so crossing the gap momentarily leaves the nav
  // item region). Re-entering within this window cancels the close. Kept short
  // (180ms) so an intentional move-away still feels immediate.
  dropdownCloseDelay: 180,
}
