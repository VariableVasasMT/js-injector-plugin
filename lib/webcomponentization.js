// @ts-ignore
// @ts-ignore
const createWC = (createElement, wcname, propsExpected) => {
  // @ts-ignore
  class WebComponent extends HTMLElement {
    // @ts-ignore
    mountPoint = document.createElement('div');
    createComponents() {
      return createElement(this.mountPoint);
    }
    connectedCallback() {
      // eslint-disable-next-line no-console
      console.log('Hey');
      this.createComponents();
    }
  }
  // @ts-ignore
  customElements.define(wcname, WebComponent);
}

module.exports = createWC;
