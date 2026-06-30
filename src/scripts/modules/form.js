import { SELECTORS } from '../config/selectors.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// Per-field validation rules keyed by control name.
const RULES = {
  name: {
    validate: value => value.trim().length > 0,
    message: 'Пожалуйста, укажите ваше имя.',
  },
  phone: {
    // Mask produces +7 followed by 10 digits → 11 digits total.
    validate: value => value.replace(/\D/g, '').length === 11,
    message: 'Введите корректный номер телефона.',
  },
  email: {
    // Optional: valid only if filled.
    validate: value => value.trim() === '' || EMAIL_RE.test(value.trim()),
    message: 'Введите корректный e-mail.',
  },
  petType: {
    validate: value => value !== '',
    message: 'Выберите вид питомца.',
  },
  service: {
    validate: value => value !== '',
    message: 'Выберите услугу.',
  },
  date: {
    validate: value => value !== '',
    message: 'Выберите дату приёма.',
  },
  time: {
    validate: value => value !== '',
    message: 'Выберите время приёма.',
  },
}

export default class Form {
  constructor(root = document) {
    this.root = root
    this.instances = []
    this.isInitialized = false
  }

  init() {
    if (this.isInitialized) return

    const forms = this.root.querySelectorAll(SELECTORS.form.root)
    forms.forEach(form => this.setup(form))

    this.isInitialized = true
  }

  setup(form) {
    const onSubmit = event => this.handleSubmit(event, form)
    const onInput = event => this.handleInput(event)

    form.addEventListener('submit', onSubmit)
    form.addEventListener('input', onInput)
    form.addEventListener('change', onInput)

    const phone = form.querySelector(SELECTORS.form.phone)
    const onPhone = phone ? () => this.maskPhone(phone) : null
    if (phone) phone.addEventListener('input', onPhone)

    this.instances.push({ form, phone, onSubmit, onInput, onPhone })
  }

  handleInput(event) {
    const control = event.target.closest(SELECTORS.form.control)
    if (control) this.clearError(control)
  }

  handleSubmit(event, form) {
    event.preventDefault()

    const controls = form.querySelectorAll(SELECTORS.form.control)
    let firstInvalid = null

    controls.forEach(control => {
      const rule = RULES[control.name]
      this.clearError(control)
      if (rule && !rule.validate(control.value)) {
        this.setError(control, rule.message)
        if (!firstInvalid) firstInvalid = control
      }
    })

    if (firstInvalid) {
      firstInvalid.focus()
      return
    }

    this.showSuccess(form)
  }

  setError(control, message) {
    const fieldEl = control.closest(SELECTORS.form.field)
    if (!fieldEl) return

    fieldEl.classList.add(SELECTORS.form.errorClass)
    control.setAttribute('aria-invalid', 'true')

    const errorId = `${control.id}-error`
    let errorEl = fieldEl.querySelector(SELECTORS.form.error)
    if (!errorEl) {
      errorEl = document.createElement('span')
      errorEl.className = 'form-field__error'
      errorEl.id = errorId
      fieldEl.appendChild(errorEl)
    }
    errorEl.textContent = message

    const describedBy = (control.getAttribute('aria-describedby') || '')
      .split(' ')
      .filter(Boolean)
    if (!describedBy.includes(errorId)) describedBy.push(errorId)
    control.setAttribute('aria-describedby', describedBy.join(' '))
  }

  clearError(control) {
    const fieldEl = control.closest(SELECTORS.form.field)
    if (!fieldEl || !fieldEl.classList.contains(SELECTORS.form.errorClass)) return

    fieldEl.classList.remove(SELECTORS.form.errorClass)
    control.removeAttribute('aria-invalid')

    const errorId = `${control.id}-error`
    const errorEl = fieldEl.querySelector(SELECTORS.form.error)
    if (errorEl) errorEl.remove()

    const describedBy = (control.getAttribute('aria-describedby') || '')
      .split(' ')
      .filter(token => token && token !== errorId)
    if (describedBy.length) {
      control.setAttribute('aria-describedby', describedBy.join(' '))
    } else {
      control.removeAttribute('aria-describedby')
    }
  }

  showSuccess(form) {
    form.reset()

    form.querySelectorAll(SELECTORS.form.control).forEach(control => {
      this.clearError(control)
    })

    const card = form.closest('.appointment-form-card') || form.parentElement
    const success = card ? card.querySelector(SELECTORS.form.success) : null
    if (success) {
      success.hidden = false
      success.focus?.()
    }
  }

  // Simple RU phone mask: +7 (___) ___-__-__
  maskPhone(input) {
    const raw = input.value.replace(/\D/g, '')
    if (raw === '') {
      input.value = ''
      return
    }

    let digits = raw
    if (digits[0] === '8') digits = `7${digits.slice(1)}`
    if (digits[0] !== '7') digits = `7${digits}`
    digits = digits.slice(0, 11)

    const rest = digits.slice(1)
    let formatted = '+7'
    if (rest.length > 0) formatted += ` (${rest.slice(0, 3)}`
    if (rest.length >= 3) formatted += ')'
    if (rest.length > 3) formatted += ` ${rest.slice(3, 6)}`
    if (rest.length > 6) formatted += `-${rest.slice(6, 8)}`
    if (rest.length > 8) formatted += `-${rest.slice(8, 10)}`

    input.value = formatted
  }

  destroy() {
    this.instances.forEach(({ form, phone, onSubmit, onInput, onPhone }) => {
      form.removeEventListener('submit', onSubmit)
      form.removeEventListener('input', onInput)
      form.removeEventListener('change', onInput)
      if (phone && onPhone) phone.removeEventListener('input', onPhone)
    })
    this.instances = []
    this.isInitialized = false
  }
}
