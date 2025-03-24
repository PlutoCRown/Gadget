import { useRef, useState, useEffect } from "react";
import imageUrl from "@assets/image.webp";

const Test = () => {
  const [bool, setBool] = useState(false);
  const containerRef = useRef<any>(null); // 用来存储容器的 ref
  const imgElementRef = useRef<any>(null); // 用来缓存 img 元素

  useEffect(() => {
    if (!imgElementRef.current) {
      imgElementRef.current = document.createElement("img");
      imgElementRef.current.src = imageUrl;
    }

    if (containerRef.current) {
      containerRef.current.appendChild(imgElementRef.current);
    }

    // // 清理：如果组件卸载或容器改变，移除 img 元素
    // return () => {
    // 	if (containerRef.current && imgElementRef.current) {
    // 		containerRef.current.removeChild(imgElementRef.current);
    // 	}
    // };
  }, [bool]); // 依赖于 bool，表示容器切换时重新插入 img 元素

  return (
    <div>
      <button onClick={() => setBool((prev) => !prev)}>切换容器</button>
      {bool ? (
        <span className="a" ref={containerRef}></span>
      ) : (
        <div className="b" ref={containerRef}></div>
      )}
    </div>
  );
};

export default Test;
