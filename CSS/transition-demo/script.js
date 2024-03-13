import {
  getPageContent,
  onLinkNavigate,
  transitionHelper,
  getLink,
} from "./utils.js";

const galleryPath = "/CSS/transition-demo/";
const catsPath = `${galleryPath}cats/`;

function getNavigationType(fromPath, toPath) {
  console.log(fromPath, toPath)
  if (fromPath.startsWith(catsPath) && toPath === galleryPath) {
    return "cat-page-to-gallery";
  }

  if (fromPath === galleryPath && toPath.startsWith(catsPath)) {
    return "gallery-to-cat-page";
  }

  return "other";
}

onLinkNavigate(async ({ fromPath, toPath }) => {
  // console.log("Navigating from", fromPath, "to", toPath);
  const navigationType = getNavigationType(fromPath, toPath);
  console.log("Navigation type", navigationType);
  const content = await getPageContent(toPath);
  let targetThumbnail;

  if (navigationType === "gallery-to-cat-page") {
    targetThumbnail = getLink(toPath).querySelector("img");
    targetThumbnail.style.viewTransitionName = "banner-img";
  }

  const transition = transitionHelper({
    classNames: navigationType,
    updateDOM() {
      console.log("Will update DOM!!!!");
      document.body.innerHTML = content;
      if (navigationType === "cat-page-to-gallery") {
        targetThumbnail = getLink(fromPath).querySelector("img");
        targetThumbnail.style.viewTransitionName = "banner-img";
      }
    },
  });

  transition.finished.finally(() => {
    if (targetThumbnail) targetThumbnail.style.viewTransitionName = "";
  });
});
