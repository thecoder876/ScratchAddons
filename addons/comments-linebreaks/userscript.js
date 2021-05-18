export default async function ({ addon, global, console }) {
  while (true) {
    let comment = await addon.tab.waitForElement(".comment .content, .comment-content", {
      markAsSeen: true,
      reduxCondition: (state) => {
        if (!state.scratchGui) return true;
        return state.scratchGui.mode.isPlayerOnly;
      },
    });
    comment.style.whiteSpace = "break-spaces";
    if (!comment.classList.contains("comment-content")) {
      let nodes = comment.childNodes;
      for (let child of nodes) {
        if (child instanceof Text) {
          if (child === nodes[0]) {
            child.textContent = child.textContent.trimStart();
            if (!child.nextSibling) {
              child.textContent = child.textContent.trim();
            }
          } else {
            if (child === nodes[nodes.length - 1]) {
              child.textContent = child.textContent.trimEnd();
            }
            const firstA = Array.prototype.find.call(
              nodes,
              (n) => n instanceof HTMLAnchorElement && (!n.previousSibling || !n.previousSibling.textContent)
            );

            if (firstA && child.previousSibling === firstA) {
              if (child.textContent.startsWith("*")) {
                child.textContent = "* " + child.textContent.replace(/^\*\s*/, "");
              } else {
                child.textContent = " " + child.textContent.trimStart();
              }
            }
          }
        }
      }
    }
  }
}
