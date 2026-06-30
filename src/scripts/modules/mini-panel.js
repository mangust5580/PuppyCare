import { SELECTORS } from '../config/selectors.js'
import { EVENTS } from '../config/constants.js'

export default class MiniPanel {
  constructor(root = document) {
    this.root = root
    this.instances = []
    this.isInitialized = false
  }

  init() {
    if (this.isInitialized) return

    const panels = this.root.querySelectorAll(SELECTORS.miniPanel.root)

    panels.forEach(panelEl => {
      const closeBtn = panelEl.querySelector(SELECTORS.miniPanel.close)
      if (!closeBtn) return

      const handler = () => this.dismiss(panelEl)
      closeBtn.addEventListener('click', handler)
      this.instances.push({ el: panelEl, closeBtn, handler })
    })

    this.isInitialized = true
  }

  dismiss(el) {
    el.dispatchEvent(new CustomEvent(EVENTS.panelDismiss, { bubbles: true }))
    el.remove()
  }

  destroy() {
    this.instances.forEach(({ closeBtn, handler }) => {
      closeBtn.removeEventListener('click', handler)
    })
    this.instances = []
    this.isInitialized = false
  }
}
