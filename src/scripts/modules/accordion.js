import { SELECTORS } from '../config/selectors.js'
import { KEYS, CLASSES } from '../config/constants.js'

export default class Accordion {
  constructor(root = document) {
    this.root = root
    this.accordions = []
    this.isInitialized = false
    this._onClick = this._onClick.bind(this)
    this._onKeydown = this._onKeydown.bind(this)
  }

  init() {
    if (this.isInitialized) return

    const roots = this.root.querySelectorAll(SELECTORS.accordion.root)

    roots.forEach(rootEl => {
      const entries = [...rootEl.querySelectorAll(SELECTORS.accordion.item)]
        .map(item => ({
          item,
          trigger: item.querySelector(SELECTORS.accordion.trigger),
          panel: item.querySelector(SELECTORS.accordion.panel),
        }))
        .filter(entry => entry.trigger && entry.panel)

      if (!entries.length) return

      const mode = rootEl.getAttribute(SELECTORS.accordion.mode) === 'multiple'
        ? 'multiple'
        : 'single'

      const instance = {
        rootEl,
        entries,
        triggers: entries.map(entry => entry.trigger),
        mode,
      }

      this._syncInitial(instance)

      rootEl.addEventListener('click', this._onClick)
      rootEl.addEventListener('keydown', this._onKeydown)
      this.accordions.push(instance)
    })

    this.isInitialized = true
  }

  destroy() {
    this.accordions.forEach(({ rootEl }) => {
      rootEl.removeEventListener('click', this._onClick)
      rootEl.removeEventListener('keydown', this._onKeydown)
    })
    this.accordions = []
    this.isInitialized = false
  }

  _syncInitial(instance) {
    let openSeen = false

    instance.entries.forEach(entry => {
      let open =
        entry.item.classList.contains(CLASSES.open) ||
        entry.trigger.getAttribute('aria-expanded') === 'true'

      if (open && instance.mode === 'single') {
        if (openSeen) open = false
        else openSeen = true
      }

      this._setState(entry, open)
    })
  }

  _setState(entry, open) {
    entry.item.classList.toggle(CLASSES.open, open)
    entry.trigger.setAttribute('aria-expanded', String(open))
    entry.panel.hidden = !open
  }

  _getInstance(rootEl) {
    return this.accordions.find(instance => instance.rootEl === rootEl)
  }

  _onClick(e) {
    const trigger = e.target.closest(SELECTORS.accordion.trigger)
    if (!trigger) return

    const instance = this._getInstance(e.currentTarget)
    if (!instance) return

    const entry = instance.entries.find(item => item.trigger === trigger)
    if (!entry) return

    const willOpen = entry.trigger.getAttribute('aria-expanded') !== 'true'

    if (willOpen && instance.mode === 'single') {
      instance.entries.forEach(other => {
        if (other !== entry) this._setState(other, false)
      })
    }

    this._setState(entry, willOpen)
  }

  _onKeydown(e) {
    const trigger = e.target.closest(SELECTORS.accordion.trigger)
    if (!trigger) return

    const instance = this._getInstance(e.currentTarget)
    if (!instance) return

    const { triggers } = instance
    const index = triggers.indexOf(trigger)
    if (index === -1) return

    switch (e.key) {
      case KEYS.ArrowDown:
        e.preventDefault()
        triggers[(index + 1) % triggers.length].focus()
        break
      case KEYS.ArrowUp:
        e.preventDefault()
        triggers[(index - 1 + triggers.length) % triggers.length].focus()
        break
      case KEYS.Home:
        e.preventDefault()
        triggers[0].focus()
        break
      case KEYS.End:
        e.preventDefault()
        triggers[triggers.length - 1].focus()
        break
      case KEYS.Escape: {
        const entry = instance.entries.find(item => item.trigger === trigger)
        if (entry && entry.trigger.getAttribute('aria-expanded') === 'true') {
          this._setState(entry, false)
        }
        break
      }
      default:
        break
    }
  }
}
