import { SELECTORS } from '../config/selectors.js'
import { EVENTS } from '../config/constants.js'

export default class Alert {
  constructor(root = document) {
    this.root = root
    this.instances = []
    this.isInitialized = false
  }

  init() {
    if (this.isInitialized) return

    const alerts = this.root.querySelectorAll(SELECTORS.alert.root)

    alerts.forEach(alertEl => {
      const closeBtn = alertEl.querySelector(SELECTORS.alert.close)
      if (!closeBtn) return

      const handler = () => this.dismiss(alertEl)
      closeBtn.addEventListener('click', handler)
      this.instances.push({ el: alertEl, closeBtn, handler })
    })

    this.isInitialized = true
  }

  dismiss(el) {
    el.dispatchEvent(new CustomEvent(EVENTS.alertDismiss, { bubbles: true }))
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
