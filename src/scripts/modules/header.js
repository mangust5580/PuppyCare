import { SELECTORS } from '../config/selectors.js'
import { KEYS, CLASSES, BREAKPOINTS, TIMINGS } from '../config/constants.js'

export default class Header {
  constructor(root = document) {
    this.root = root
    this.header = null
    this.burger = null
    this.menu = null
    this.dropdowns = []
    this.desktopQuery = null
    this._closeTimer = null
    this._onBurgerClick = this._onBurgerClick.bind(this)
    this._onKeydown = this._onKeydown.bind(this)
    this._onMenuClick = this._onMenuClick.bind(this)
    this._onOutsideClick = this._onOutsideClick.bind(this)
    this._onDropdownClick = this._onDropdownClick.bind(this)
    this._onDropdownEnter = this._onDropdownEnter.bind(this)
    this._onDropdownLeave = this._onDropdownLeave.bind(this)
    this._onDesktopChange = this._onDesktopChange.bind(this)
  }

  init() {
    this.header = this.root.querySelector(SELECTORS.header.root)
    if (!this.header) return

    this.burger = this.header.querySelector(SELECTORS.header.burger)
    this.menu = this.header.querySelector(SELECTORS.header.menu)
    if (!this.burger || !this.menu) return

    this.dropdowns = [...this.header.querySelectorAll(SELECTORS.header.dropdownToggle)]
      .map(btn => {
        const id = btn.getAttribute('aria-controls')
        const panel = id ? this.root.querySelector(`#${id}`) : null
        return { btn, navItem: btn.parentElement, panel }
      })
      .filter(d => d.panel)

    this.burger.addEventListener('click', this._onBurgerClick)
    this.root.addEventListener('keydown', this._onKeydown)
    this.menu.addEventListener('click', this._onMenuClick)
    this.root.addEventListener('click', this._onOutsideClick)
    this.dropdowns.forEach(d => {
      d.btn.addEventListener('click', this._onDropdownClick)
      // Hover open/close (desktop) is driven here, not by CSS :hover alone, so a
      // grace delay can keep the panel open while the pointer crosses the gap.
      d.navItem.addEventListener('pointerenter', this._onDropdownEnter)
      d.navItem.addEventListener('pointerleave', this._onDropdownLeave)
    })

    this.desktopQuery = window.matchMedia(BREAKPOINTS.headerDesktop)
    this.desktopQuery.addEventListener('change', this._onDesktopChange)
  }

  destroy() {
    this._clearCloseTimer()
    this.burger?.removeEventListener('click', this._onBurgerClick)
    this.root.removeEventListener('keydown', this._onKeydown)
    this.menu?.removeEventListener('click', this._onMenuClick)
    this.root.removeEventListener('click', this._onOutsideClick)
    this.dropdowns.forEach(d => {
      d.btn.removeEventListener('click', this._onDropdownClick)
      d.navItem.removeEventListener('pointerenter', this._onDropdownEnter)
      d.navItem.removeEventListener('pointerleave', this._onDropdownLeave)
    })
    this.desktopQuery?.removeEventListener('change', this._onDesktopChange)

    if (this.menu && !this.menu.hidden) this._close()

    this.header = null
    this.burger = null
    this.menu = null
    this.dropdowns = []
    this.desktopQuery = null
  }

  _open() {
    this.menu.hidden = false
    this.burger.setAttribute('aria-expanded', 'true')
    this.burger.setAttribute('aria-label', 'Закрыть меню')
    this.header.classList.add(CLASSES.open)
    document.body.style.setProperty('overflow', 'hidden')
    this._setInert(true)

    const focusable = this._getFocusable()
    if (focusable.length) focusable[0].focus()
  }

  _close({ restoreFocus = false } = {}) {
    this.menu.hidden = true
    this.burger.setAttribute('aria-expanded', 'false')
    this.burger.setAttribute('aria-label', 'Открыть меню')
    this.header.classList.remove(CLASSES.open)
    document.body.style.removeProperty('overflow')
    this._setInert(false)

    if (restoreFocus) this.burger.focus()
  }

  // Visible, interactive elements inside the open mobile menu.
  _getFocusable() {
    return [...this.menu.querySelectorAll(SELECTORS.header.focusable)].filter(
      el => !el.hasAttribute('disabled') && el.getClientRects().length > 0,
    )
  }

  // Mark the rest of the page inert while the full-screen overlay is open so
  // keyboard/AT/pointer can't reach covered content. The burger lives outside
  // these targets and stays operable.
  _setInert(on) {
    const targets = this.root.querySelectorAll(SELECTORS.header.inert)
    targets.forEach(el => {
      if (on) el.setAttribute('inert', '')
      else el.removeAttribute('inert')
    })
  }

  // Keep Tab / Shift+Tab cycling within the open menu.
  _trapTab(e) {
    const focusable = this._getFocusable()
    if (!focusable.length) {
      e.preventDefault()
      return
    }

    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    const active = document.activeElement
    const inside = this.menu.contains(active)

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

  _onBurgerClick() {
    if (this.menu.hidden) {
      this._open()
    } else {
      this._close({ restoreFocus: true })
    }
  }

  _onKeydown(e) {
    if (e.key === KEYS.Escape) {
      this._closeDropdowns()
      if (!this.menu.hidden) this._close({ restoreFocus: true })
      return
    }

    if (e.key === KEYS.Tab && !this.menu.hidden) {
      this._trapTab(e)
    }
  }

  _onMenuClick(e) {
    if (e.target.closest(SELECTORS.header.link)) {
      this._close()
    }
  }

  _onOutsideClick(e) {
    if (this.header.contains(e.target)) return
    this._closeDropdowns()
    if (!this.menu.hidden) this._close()
  }

  _onDesktopChange(e) {
    if (e.matches) {
      // Switched to desktop: close the mobile overlay if it was open.
      if (!this.menu.hidden) this._close()
    } else {
      // Switched to mobile: tear down any open desktop dropdown + pending timer.
      this._closeDropdowns()
    }
  }

  _onDropdownClick(e) {
    const btn = e.currentTarget
    const dropdown = this.dropdowns.find(d => d.btn === btn)
    if (!dropdown) return
    const isOpen = btn.getAttribute('aria-expanded') === 'true'
    this._closeDropdowns()
    if (!isOpen) {
      dropdown.navItem.classList.add(CLASSES.open)
      btn.setAttribute('aria-expanded', 'true')
    }
  }

  _clearCloseTimer() {
    if (this._closeTimer !== null) {
      clearTimeout(this._closeTimer)
      this._closeTimer = null
    }
  }

  // Desktop hover open. The pointer entering the nav item — the trigger, or the
  // panel after crossing the gap (both are descendants of the nav item) — opens
  // this dropdown and cancels any pending close.
  _onDropdownEnter(e) {
    if (!this.desktopQuery?.matches) return
    this._clearCloseTimer()
    const dropdown = this.dropdowns.find(d => d.navItem === e.currentTarget)
    if (dropdown) this._openDropdown(dropdown)
  }

  // Desktop hover close. Defer closing so travelling through the visual gap
  // between the trigger and the panel — which briefly leaves the nav item
  // region — does not close the menu. Re-entering within the grace window
  // cancels this; Escape / outside click still close immediately.
  _onDropdownLeave() {
    if (!this.desktopQuery?.matches) return
    this._clearCloseTimer()
    this._closeTimer = setTimeout(() => {
      this._closeTimer = null
      this._closeDropdowns()
    }, TIMINGS.dropdownCloseDelay)
  }

  _openDropdown(dropdown) {
    this.dropdowns.forEach(d => {
      const isTarget = d === dropdown
      d.navItem.classList.toggle(CLASSES.open, isTarget)
      d.btn.setAttribute('aria-expanded', isTarget ? 'true' : 'false')
    })
  }

  _closeDropdowns() {
    this._clearCloseTimer()
    this.dropdowns.forEach(d => {
      d.navItem.classList.remove(CLASSES.open)
      d.btn.setAttribute('aria-expanded', 'false')
    })
  }
}
