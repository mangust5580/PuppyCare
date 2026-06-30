import { KEYS, CLASSES } from '../config/constants.js'

const SELECTORS = {
  root: '[data-subscribe-modal]',
  dialog: '.subscribe-modal__dialog',
  close: '[data-subscribe-modal-close]',
  form: '[data-subscribe-modal-form]',
  success: '[data-subscribe-modal-success]',
  focusable:
    'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
}

// Auto-open after this delay, or earlier if the user scrolls near the page end.
// Shown at most once per browser session (sessionStorage), so a refresh within
// the same session never re-triggers it.
const OPEN_DELAY = 10000
const SCROLL_THRESHOLD = 0.85
const STORAGE_KEY = 'puppycareSubscribeModalShown'
const CLOSE_ANIMATION_MS = 220
const SUCCESS_CLOSE_MS = 1600

export default class SubscribeModal {
  constructor(root = document) {
    this.root = root
    this.modal = null
    this.dialog = null
    this.form = null
    this.success = null
    this.isOpen = false
    this.lastFocused = null
    this.openTimer = null
    this.closeTimer = null
    this.successTimer = null
    this.reducedMotion = null

    this._onScroll = this._onScroll.bind(this)
    this._onKeydown = this._onKeydown.bind(this)
    this._onCloseClick = this._onCloseClick.bind(this)
    this._onSubmit = this._onSubmit.bind(this)
  }

  init() {
    this.modal = this.root.querySelector(SELECTORS.root)
    if (!this.modal) return

    this.dialog = this.modal.querySelector(SELECTORS.dialog)
    this.form = this.modal.querySelector(SELECTORS.form)
    this.success = this.modal.querySelector(SELECTORS.success)
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Close controls + form work whenever the modal is present.
    this.modal.querySelectorAll(SELECTORS.close).forEach(btn => {
      btn.addEventListener('click', this._onCloseClick)
    })
    this.form?.addEventListener('submit', this._onSubmit)

    // Only arm the auto-open triggers if it has not been shown this session.
    if (this._alreadyShown()) return

    this.openTimer = window.setTimeout(() => this.open(), OPEN_DELAY)
    window.addEventListener('scroll', this._onScroll, { passive: true })
  }

  destroy() {
    this._clearTimers()
    window.removeEventListener('scroll', this._onScroll)
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
    this.success = null
    this.isOpen = false
  }

  open() {
    if (!this.modal || this.isOpen) return

    // Mark as shown and disarm auto-open triggers immediately, so the scroll
    // handler or a refresh can never re-open it this session.
    this._markShown()
    this._clearTimers()
    window.removeEventListener('scroll', this._onScroll)

    this.lastFocused = document.activeElement
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

  _onScroll() {
    const doc = document.documentElement
    const scrollable = doc.scrollHeight - window.innerHeight
    if (scrollable <= 0) return
    const progress = window.scrollY / scrollable
    if (progress >= SCROLL_THRESHOLD) this.open()
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
    e.preventDefault()
    if (this.form && !this.form.checkValidity()) {
      this.form.reportValidity()
      return
    }

    // Static demo: no backend. Confirm, then close shortly after.
    if (this.success) this.success.hidden = false
    this._markShown()
    this.successTimer = window.setTimeout(() => this.close(), SUCCESS_CLOSE_MS)
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

  _clearTimers() {
    if (this.openTimer !== null) {
      clearTimeout(this.openTimer)
      this.openTimer = null
    }
    if (this.closeTimer !== null) {
      clearTimeout(this.closeTimer)
      this.closeTimer = null
    }
    if (this.successTimer !== null) {
      clearTimeout(this.successTimer)
      this.successTimer = null
    }
  }

  // sessionStorage may be unavailable (privacy mode / disabled) — fail open
  // gracefully so the modal logic never throws.
  _alreadyShown() {
    try {
      return window.sessionStorage.getItem(STORAGE_KEY) === '1'
    } catch {
      return false
    }
  }

  _markShown() {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, '1')
    } catch {
      // Ignore — without storage the modal simply may reappear next load.
    }
  }
}
