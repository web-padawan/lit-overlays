export const notify = (node: Element, prop: string, value: unknown) => {
  node.dispatchEvent(
    new CustomEvent(`${prop}-changed`, {
      detail: {
        value
      }
    })
  );
};
