// 三个函数快速创建页面操作指引
export const createGuide = () => {
  const guide = document.createElement("div");
  guide.id = "guide";
  guide.style.position = "absolute";
  guide.style.zIndex = "10000";
  guide.style.transition = "all .3s";
  document.documentElement.appendChild(guide);
  guide.style.outline = "10000px solid #0006";
  guide.style.border = "1px solid";
  return guide;
};

export const guideTo = (el, option = { padding: 2 }) => {
  const { x, y, width, height } = el.getBoundingClientRect();
  const guide = document.querySelector("#guide") || createGuide();
  guide.style.left = `${x - option.padding}px`;
  guide.style.top = `${y - option.padding}px`;
  guide.style.width = `${width + 2 * option.padding}px`;
  guide.style.height = `${height + 2 * option.padding}px`;
};
export const hiddenGuide = () => {
  const guide = document.getElementById("guide");
  guide.style.outline = "unset";
  guide.style.border = "unset";
};
