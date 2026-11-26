(() => {
  "use strict";

  // Attaching a shadow root to an existing element produces no DOM mutation.
  const prototype = Element.prototype;
  const descriptor = Object.getOwnPropertyDescriptor(prototype, "attachShadow");
  const dispatch = EventTarget.prototype.dispatchEvent;
  const ShadowAttached = Event;
  const { attachShadow } = {
    attachShadow(options) {
      const root = Reflect.apply(descriptor.value, this, [options]);
      if (root.mode === "open" && this.isConnected) {
        Reflect.apply(dispatch, this, [
          new ShadowAttached("no-blaspheme-shadow-attached", { bubbles: true, composed: true }),
        ]);
      }
      return root;
    },
  };
  Object.defineProperty(prototype, "attachShadow", { ...descriptor, value: attachShadow });
})();
