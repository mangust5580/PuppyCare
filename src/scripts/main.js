import Accordion from './modules/accordion.js'
import Alert from './modules/alert.js'
import FeedbackModal from './modules/feedback-modal.js'
import Form from './modules/form.js'
import Header from './modules/header.js'
import MiniPanel from './modules/mini-panel.js'
import SubscribeModal from './modules/subscribe-modal.js'
import Video from './modules/video.js'

class App {
  constructor(root = document) {
    this.root = root
    this.modules = [
      new Accordion(this.root),
      new Alert(this.root),
      new FeedbackModal(this.root),
      new Form(this.root),
      new Header(this.root),
      new MiniPanel(this.root),
      new SubscribeModal(this.root),
      new Video(this.root),
    ]
  }

  init() {
    this.modules.forEach(module => module.init())
  }

  destroy() {
    this.modules.forEach(module => module.destroy())
  }
}

const app = new App(document)

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init())
} else {
  app.init()
}

window.addEventListener('pagehide', () => app.destroy())
window.addEventListener('pageshow', event => {
  if (event.persisted) app.init()
})
