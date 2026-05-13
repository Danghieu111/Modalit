function Modalit(option= {}) {
    if (!option.content && !option.templateId) { 
        console.error("You must provide on of 'content' or 'templateId'.")
        return 
    }

    if (option.content && option.templateId) {
        option.templateId = null
    }

    if (option.templateId) {
        this.teamplate = document.querySelector(`#${option.templateId}`)

        if (!this.teamplate) {
            console.error(`${this.otp.templateId} does not exist`)
        }
    }

    this.otp = { 
        destroyOnClose : true,
        classContent : [],
        closeMethod : ['button', 'overlay', 'escape'],
        enableScrolLock : true,
        scrollLockTarget: () => document.scrollingElement,
        footer : false,
        ...option
    }

    this._escapeHandle = this._escapeHandle.bind(this)
    this.content = this.otp.content


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
    const lastModal = Modalit.openModals[Modalit.openModals.length - 1]
    if (e.key == 'Escape' && this === lastModal) {
        this.close()
    } 
}

Modalit.prototype._hasScrollbar = (target) => {
    return target.scrollHeight > target.clientHeight
}

Modalit.prototype.open = function() {
    if (!this._backdrop) {
        this._build()
    }

    if (this.otp.enableScrolLock && !Modalit.openModals.length) {
        const target = this.otp.scrollLockTarget()
        if (this._hasScrollbar(target)) {
            target.classList.add('modalit--no-scroll')
            console.log(Modalit.openModals)
            target.style.paddingRight = this._getScrollBarWidth() + parseInt(getComputedStyle(target).paddingRight) + 'px'
        }
    }


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

    Modalit.openModals.push(this)

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
    this._backdrop.classList.remove('modalit--show')  
    Modalit.openModals.pop()
    if (this._allowEscapeClose) {
        document.removeEventListener('keydown', this._escapeHandle) 
    }

        this._onTranstionEnd(() => {
            if (destroy && this._backdrop) {
                this._backdrop.remove() 
                this._backdrop = null
                this._modalFooter = null
            }

            if (Modalit.openModals.length == 0 && this.otp.enableScrolLock) {
                const target = this.otp.scrollLockTarget()
                if (this._hasScrollbar(target)) {
                    target.classList.remove('modalit--no-scroll')
                    target.style.paddingRight = ''
                }
            }
            if (typeof this.otp.onClose === 'function') this.otp.onClose()
        })
}

Modalit.prototype._build = function() {
    const contentNode = this.content ? document.createElement('div') : this.teamplate.content.cloneNode(true)

    if (this.content) {
        contentNode.innerHTML = this.content
    }

    this._backdrop = document.createElement('div')
    this._backdrop.className = 'modalit'
    this._backdrop.style.zIndex = 1000 + Modalit.openModals.length

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

    this._modalContent = document.createElement('div')
    this._modalContent.className = 'modalit__content'
    this._modalContent.append(contentNode)

    this._backdrop.append(container)
    container.append(this._modalContent)
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

Modalit.prototype.setContent = function(content) {
    this.content = content

    if(this._modalContent) {
        this._modalContent.innerHTML = this.content
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

Modalit.openModals = []