import { KEYS, CLASSES } from '../config/constants.js'

const SELECTORS = {
  root: '[data-feedback-modal]',
  dialog: '.feedback-modal__dialog',
  open: '[data-feedback-modal-open]',
  close: '[data-feedback-modal-close]',
  form: '[data-feedback-modal-form]',
  focusable:
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
}

const CLOSE_ANIMATION_MS = 220

// Trigger-driven feedback/contact modal. Opens from any `[data-feedback-modal-open]`
// element (event-delegated, so triggers added on any page just work). Mirrors the
// SubscribeModal accessibility behaviour (focus trap, focus return, scroll lock).
export default class FeedbackModal {
  constructor(root = document) {
    this.root = root
    this.modal = null
    this.dialog = null
    this.form = null
    this.isOpen = false
    this.lastFocused = null
    this.closeTimer = null
    this.reducedMotion = null

    this._onOpenClick = this._onOpenClick.bind(this)
    this._onCloseClick = this._onCloseClick.bind(this)
    this._onKeydown = this._onKeydown.bind(this)
    this._onSubmit = this._onSubmit.bind(this)
  }

  init() {
    this.modal = this.root.querySelector(SELECTORS.root)
    if (!this.modal) return

    this.dialog = this.modal.querySelector(SELECTORS.dialog)
    this.form = this.modal.querySelector(SELECTORS.form)
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Delegate open clicks so any trigger (header/footer/page) works without
    // per-element wiring.
    this.root.addEventListener('click', this._onOpenClick)

    this.modal.querySelectorAll(SELECTORS.close).forEach(btn => {
      btn.addEventListener('click', this._onCloseClick)
    })
    this.form?.addEventListener('submit', this._onSubmit)
  }

  destroy() {
    this._clearTimer()
    this.root.removeEventListener('click', this._onOpenClick)
    document.removeEventListener('keydown', this._onKeydown)

    if (this.modal) {
      this.modal.querySelectorAll(SELECTORS.close).forEach(btn => {
        btn.removeEventListener('click', this._onCloseClick)
      })
    }
    this.form?.removeEventListener('submit', this._onSubmit)

    if (this.isOpen) this._unlockScroll()

    this.modal = null
    this.dialog = null
    this.form = null
    this.isOpen = false
  }

  open(trigger = null) {
    if (!this.modal || this.isOpen) return

    this._clearTimer()
    this.lastFocused = trigger || document.activeElement
    this.isOpen = true

    this.modal.hidden = false
    // Next frame so the fade/scale transition runs from the hidden state.
    window.requestAnimationFrame(() => {
      if (this.modal) this.modal.classList.add(CLASSES.open)
    })

    this._lockScroll()
    document.addEventListener('keydown', this._onKeydown)

    const focusTarget = this._getFocusable()[0] || this.dialog
    focusTarget?.focus()
  }

  close({ restoreFocus = true } = {}) {
    if (!this.modal || !this.isOpen) return

    this.isOpen = false
    this.modal.classList.remove(CLASSES.open)
    document.removeEventListener('keydown', this._onKeydown)
    this._unlockScroll()

    const hide = () => {
      if (this.modal) this.modal.hidden = true
    }
    if (this.reducedMotion?.matches) {
      hide()
    } else {
      this.closeTimer = window.setTimeout(hide, CLOSE_ANIMATION_MS)
    }

    if (restoreFocus && this.lastFocused && typeof this.lastFocused.focus === 'function') {
      this.lastFocused.focus()
    }
  }

  _onOpenClick(e) {
    const trigger = e.target.closest(SELECTORS.open)
    if (!trigger) return
    // Allow triggers on <a> without navigating away.
    e.preventDefault()
    this.open(trigger)
  }

  _onCloseClick() {
    this.close()
  }

  _onKeydown(e) {
    if (e.key === KEYS.Escape) {
      e.preventDefault()
      this.close()
      return
    }
    if (e.key === KEYS.Tab) {
      this._trapTab(e)
    }
  }

  _onSubmit(e) {
    // Static demo: no backend. Let the browser validate, then keep the user on
    // the page and close the modal.
    e.preventDefault()
    if (this.form && !this.form.checkValidity()) {
      this.form.reportValidity()
      return
    }
    this.close()
  }

  // Keep Tab / Shift+Tab cycling within the dialog.
  _trapTab(e) {
    const focusable = this._getFocusable()
    if (!focusable.length) {
      e.preventDefault()
      this.dialog?.focus()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    const inside = this.dialog?.contains(active)

    if (e.shiftKey) {
      if (!inside || active === first) {
        e.preventDefault()
        last.focus()
      }
    } else if (!inside || active === last) {
      e.preventDefault()
      first.focus()
    }
  }

  _getFocusable() {
    if (!this.dialog) return []
    return [...this.dialog.querySelectorAll(SELECTORS.focusable)].filter(
      el => !el.hasAttribute('hidden') && el.getClientRects().length > 0,
    )
  }

  _lockScroll() {
    document.body.style.setProperty('overflow', 'hidden')
  }

  _unlockScroll() {
    document.body.style.removeProperty('overflow')
  }

  _clearTimer() {
    if (this.closeTimer !== null) {
      clearTimeout(this.closeTimer)
      this.closeTimer = null
    }
  }
}
