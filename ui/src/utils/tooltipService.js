export default class TooltipService {
    startService() {
        this._ttiv = setInterval(() => this.observeTooltips(), 1000);
        this._eriv = setInterval(() => this.observeErrortips(), 100);

        window.addEventListener('click', document.querySelectorAll('.app-tooltip.tooltip').forEach(el => el.parentNode.removeChild(el)));
    }

    stopService() {
        clearInterval(this._ttiv);
        clearInterval(this._eriv);
        delete this._ttiv;
        delete this._eriv;
    }

    // observe() {
    //     this.observeTooltips();
    //     this.observeErrortips();
    // }

    observeTooltips() {
        let elements = document.querySelectorAll('[data-tooltip]:not([data-tooltip-attached])');

        elements.forEach(el => {
            let tooltipAttachId = String.random();
            let hideTipHandler = (elem) => {
                this.hideTip(elem);
                elem.removeEventListener('DOMNodeRemovedFromDocument', hideTipHandler)
            };

            el.addEventListener('mouseover', () => this.showTip(el));
            el.addEventListener('mouseout', () => this.hideTip(el));
            el.addEventListener('DOMNodeRemovedFromDocument', hideTipHandler.bind(this, el));

            el.setAttribute('data-tooltip-attached', tooltipAttachId);
        });
    }

    observeErrortips() {
        let elements = document.querySelectorAll('[data-error]:not([data-tooltip-attached])');

        elements.forEach(el => {
            let tooltipAttachId = String.random();
            let hideTipHandler = (elem) => {
                this.hideTip(elem);
                elem.removeEventListener('DOMNodeRemovedFromDocument', hideTipHandler)
            };

            this.showTip(el);
            this.observeAttributeChange(el);

            el.addEventListener('DOMNodeRemovedFromDocument', hideTipHandler.bind(this, el));
            el.setAttribute('data-tooltip-attached', tooltipAttachId);
        });

        let removedEls = [];

        elements = document.querySelectorAll('.app-tooltip.error');
        elements.forEach(errEl => {
            let tooltipAttachId = errEl.getAttribute('id');
            let el = document.querySelector('[data-error][data-tooltip-attached="' + tooltipAttachId + '"]');

            if (!el) { removedEls.push(errEl) }
        });

        removedEls.forEach(el => el.parentNode.removeChild(el));
    }

    observeAttributeChange(el) {
        let element = el;
        let observer = new MutationObserver((mutations) =>
            mutations.forEach(mutation => {
                let name = mutation.attributeName;
                let newValue = mutation.target.getAttribute(name);

                if (name === 'data-error' && !newValue) {
                    this.hideTip(el);
                    el.removeAttribute('data-tooltip-attached');
                }
            }));

        observer.observe(element, {attributes: true});
    }

    showTip(el, tipContent) {
        var isError = !!el.getAttribute('data-error');
        // var timeout = (isError ? 0 : 80);

        this._to = setTimeout(() => {
            tipContent = tipContent || el.getAttribute('data-tooltip') || el.getAttribute('data-error');

            if (!tipContent) return;

            let body = document.body;
            let cssClass = (isError ? 'error' : 'tooltip');
            let tooltipAttachId = el.getAttribute('data-tooltip-attached');
            let tooltip = document.createElement('div');
                tooltip.classList.add('app-tooltip');
                tooltip.classList.add(cssClass);
                tooltip.innerHTML = tipContent;

            body.appendChild(tooltip);
            tooltip.setAttribute('id', tooltipAttachId);

            this.calcSizeAndPosition(el, tooltip);

            // if (!!el.getAttribute('data-error')) {
            //     this.bindScrollableContainerScrollEvent(el, tooltip);
            // }
        }, 80);
    }

    calcSizeAndPosition(el, tooltip) {
        let rect = el.getBoundingClientRect();
        let bodyRect = document.body.getBoundingClientRect();
        let tooltipRect = tooltip.getBoundingClientRect();
        let topPadding = 5;

        tooltip.style.left = ((rect.left + rect.width / 2) - (tooltipRect.width / 2)) + 'px';

        if (!!el.getAttribute('data-error')) {
            tooltip.style.top = (rect.top - (tooltipRect.height + topPadding)) + 'px';
            tooltip.style.display = ((rect.top < 0 ? 'none' : 'inline-block')) + 'px';
        }else{
            if ((rect.bottom + tooltipRect.height + topPadding) >= bodyRect.bottom) {
                tooltip.style.top = (rect.top - (topPadding + tooltipRect.height)) + 'px';
            }else{
                tooltip.style.top = (rect.bottom + topPadding) + 'px';
            }
        }
    }

    // bindScrollableContainerScrollEvent(el, tooltip) {
    //     var scrollable = el.parents('.scrollable');
    //
    //     if (!scrollable.length) return;
    //
    //     var tooltipAttachId = $el.attr('data-tooltip-attached');
    //
    //     if (!tooltipAttachId) return;
    //
    //     this['_boundScrollEvent_' + tooltipAttachId] = this.onScrollableContainerScroll.bind(this, $scrollable, $el, $tooltip);
    //     $scrollable.on('scroll', this['_boundScrollEvent_' + tooltipAttachId]);
    // }

    // unbindScrollableContainerScrollEvent($el) {
    //     var $scrollable = $el.parents('.scrollable');
    //
    //     if (!$scrollable.length) return;
    //
    //     var tooltipAttachId = $el.attr('data-tooltip-attached');
    //
    //     if (!tooltipAttachId) return;
    //     if (!this['_boundScrollEvent_' + tooltipAttachId]) return;
    //
    //     $scrollable.off('scroll', this['_boundScrollEvent_' + tooltipAttachId]);
    //     delete this['_boundScrollEvent_' + tooltipAttachId];
    // }

    // onScrollableContainerScroll($scrollable, $el, $tooltip) {
    //     this.calcSizeAndPosition($el, $tooltip);
    // }

    // elementDOMChanged($el) {
    //     if ($el.attr('hidden')) { this.hideTip($el) }
    // }

    hideTip(el) {
        if (this._to) {
            clearTimeout(this._to);
            delete this._to;
        }

        let tooltipAttachId = el.getAttribute('data-tooltip-attached');
        let tooltip = document.querySelector('[id="' + tooltipAttachId + '"]');

        if (tooltip) { tooltip.parentNode.removeChild(tooltip) }

        // this.unbindScrollableContainerScrollEvent($el);

        // $el.off('DOMSubtreeModified', this._boundElementDOMChangedEventHandler);
        // delete this._boundElementDOMChangedEventHandler;
    }

    // removeElement($el) {
    //     $el.remove();
    //     this.hideTip($el);
    // }
}