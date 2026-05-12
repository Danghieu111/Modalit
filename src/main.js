function Modalit(option= {}) {
    this.otp = { 
        destroyOnClose : true,
        classContent : [],
        closeMethod : ['button', 'overlay', 'escape'],
        footer : false,
        ...option
    }

    this._escapeHandle = this._escapeHandle.bind(this)
    this.teamplate = document.querySelector(this.otp.templateId)

    if (!this.teamplate) { return }

    this._allowButtonClose = this.otp.closeMethod.includes('button')
    this._allowOverlayClose = this.otp.closeMethod.includes('overlay') 
    this._allowEscapeClose = this.otp.closeMethod.includes('escape')
    this._footerButtons = [] 
}

Modalit.prototype._onTranstionEnd = function(callback) {
    this._backdrop.ontransitionend = (e) => {
        if (e.propertyName !== 'transform') return
        callback()
    }
}

Modalit.prototype._escapeHandle = function(e) {
    const lastModal = Modalit.openModels[Modalit.openModels.length - 1]
    if (e.key == 'Escape' && this === lastModal) {
        this.close()
    } 
}

Modalit.prototype.open = function() {
    if (!this._backdrop) {
        this._build()
    }

    document.body.classList.add('modalit--no-scroll')
    document.body.style.paddingRight = this._getScrollBarWidth() + 'px'

    setTimeout(() => {
        this._backdrop.classList.add('modalit--show')
    },0)

    this._backdrop.onclick = (e) => {
        if (this._allowOverlayClose) {
            if (e.target === this._backdrop) {
                this.close()
            }
        }
    }

if (this._allowEscapeClose) {
    document.addEventListener('keydown', this._escapeHandle) 
}

    Modalit.openModels.push(this)

    this._onTranstionEnd(() => {
        if (typeof this.otp.onOpen === 'function') this.otp.onOpen()
    })

    return this._backdrop
}

Modalit.prototype.addFooterButton = function(title, cssClass, callback) {
    const buttonFooter = this._createButton(title, cssClass, callback)
    this._footerButtons.push(buttonFooter)

    if(this._modalFooter) {
        this._modalFooter.append(buttonFooter)
    }
    
}

Modalit.prototype._createButton = function(title, cssClass, callback) {
    const button = document.createElement('button')
    button.className = cssClass
    button.innerHTML = title
    button.onclick = callback

    return button
}

Modalit.prototype.destroy = function() {
    this.close(true)
}

Modalit.prototype.setFooterContent = function(html) {
    this._footerContent = html

    if (this._modalFooter) {
        this._modalFooter.innerHTML = html
    }
}

Modalit.prototype.close = function(destroy = this.otp.destroyOnClose) { 
    this._backdrop.classList.remove('show')  
    Modalit.openModels.pop()
    if (this._allowEscapeClose) {
        document.removeEventListener('keydown', this._escapeHandle) 
    }

        this._onTranstionEnd(() => {
            if (destroy && this._backdrop) {
                this._backdrop.remove() 
                this._backdrop = null
                this._modalFooter = null
            }

            if (Modalit.openModels.length == 0) {
                document.body.classList.remove('modalit--no-scroll')
                document.body.style.paddingRight = ''
            }
            if (typeof this.otp.onClose === 'function') this.otp.onClose()
        })
}

Modalit.prototype._build = function() {
    const content = this.teamplate.content.cloneNode(true)
    this._backdrop = document.createElement('div')
    this._backdrop.className = 'modalit'
    this._backdrop.style.zIndex = 1000 + Modalit.openModels.length

    const container = document.createElement('div')
    container.className = 'modalit__container'

    this.otp.classContent.forEach((className) => {
        container.classList.add(className)
    });

    if (this._allowButtonClose) {
        const button = this._createButton('&times;', 'modalit__close', () => {
            this.close()
        })
        container.append(button)
    }

    const modalContent = document.createElement('div')
    modalContent.className = 'modalit__content'
    modalContent.append(content)

    this._backdrop.append(container)
    container.append(modalContent)
    document.body.append(this._backdrop)

    if (this.otp.footer) {
        this._modalFooter = document.createElement('div')
        this._modalFooter.className = 'modalit__footer'
        if (this._footerContent) {
            this._modalFooter.innerHTML = this._footerContent
        }

        this._footerButtons.forEach((button) => {
            this._modalFooter.append(button)
        })
        container.append(this._modalFooter)
    }
}

Modalit.prototype._getScrollBarWidth = function() {
    if (this._scrollBarWidth) return this._scrollBarWidth
    const div =  document.createElement('div')
        Object.assign(div.style, {
            overflow: 'scroll',
            position: 'absolute',
            top: '-999px',
        })

    document.body.append(div)

    this._scrollBarWidth = div.offsetWidth - div.clientWidth

    div.remove()

    return this._scrollBarWidth
}

Modalit.openModels = []