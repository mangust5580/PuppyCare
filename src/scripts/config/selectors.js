export const SELECTORS = {
  alert: {
    root: '.alert, .toast',
    close: '[data-feedback-close]',
  },

  modal: {
    root: '[data-js-modal]',
    trigger: '[data-js-modal-trigger]',
    close: '[data-js-modal-close]',
    backdrop: '[data-js-modal-backdrop]',
    dialog: '[data-js-modal-dialog]',
    focusable: 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
  },

  tooltip: {
    root: '[data-js-tooltip]',
  },

  miniPanel: {
    root: '[data-js-panel]',
    close: '[data-js-panel-close]',
  },

  table: {
    root: '[data-js-table]',
    row: '[data-js-table-row]',
    action: '[data-js-table-action]',
  },

  header: {
    root: '[data-js-header]',
    burger: '[data-js-header-toggle]',
    menu: '[data-js-header-menu]',
    link: '[data-js-header-link]',
    dropdownToggle: '[data-js-header-dropdown-toggle]',
    dropdown: '[data-js-header-dropdown]',
    focusable: 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    inert: '[data-page-content], .site-footer',
  },

  video: {
    root: '[data-js-video]',
    player: '[data-js-video-player]',
    play: '[data-js-video-play]',
  },

  accordion: {
    root: '[data-js-accordion]',
    item: '[data-js-accordion-item]',
    trigger: '[data-js-accordion-trigger]',
    panel: '[data-js-accordion-panel]',
    mode: 'data-js-accordion-mode',
  },

  form: {
    root: '[data-form]',
    control: '.form-field__input, .form-field__select, .form-field__textarea',
    field: '.form-field',
    error: '.form-field__error',
    errorClass: 'form-field--error',
    success: '[data-form-success]',
    phone: 'input[type="tel"]',
  },
}
