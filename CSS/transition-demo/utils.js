export async function getPageContent(url) {
  const response = await fetch(url);
  const text = await response.text();
  return /<body[^>]*>([\w\W]*)<\/body>/.exec(text)[1];
}

function isBackNavigation(navigateEvent) {
  if (
    navigateEvent.navigationType === "push" ||
    navigateEvent.navigationType === "replace"
  ) {
    return false;
  }
  if (
    navigateEvent.destination.index !== -1 &&
    navigateEvent.destination.index < navigation.currentEntry.index
  ) {
    return true;
  }
  return false;
}

export async function onLinkNavigate(callback) {
  navigation.addEventListener("navigate", (event) => {
    const toUrl = new URL(event.destination.url);
    if (location.origin !== toUrl.origin) return;

    const fromPath = location.pathname;
    const isBack = isBackNavigation(event);

    event.intercept({
      async handler() {
        console.log(event);
        if (event.info === "ignore") return;
        await callback({
          toPath: toUrl.pathname,
          fromPath,
          isBack,
        });
      },
    });
  });
}

export function getLink(href) {
  const fullLink = new URL(href, location.href).href.split("/").at(-1);
  return [...document.querySelectorAll("a")].find(
    (link) => link.href.split("/").at(-1) === fullLink
  );
}

export function transitionHelper({
  skipTransition = false,
  classNames = "",
  updateDOM,
}) {
  if (skipTransition || !document.startViewTransition) {
    const updateCallbackDone = Promise.resolve(updateDOM()).then(
      () => undefined
    );

    return {
      ready: Promise.reject(Error("View transitions unsupported")),
      domUpdated: updateCallbackDone,
      updateCallbackDone,
      finished: updateCallbackDone,
    };
  }

  const classNamesArray = classNames.split(/\s+/g).filter(Boolean);

  document.documentElement.classList.add(...classNamesArray);

  const transition = document.startViewTransition(updateDOM);

  transition.finished.finally(() =>
    document.documentElement.classList.remove(...classNamesArray)
  );

  return transition;
}
