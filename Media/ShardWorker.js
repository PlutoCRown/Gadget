const connected = [];
self.onconnect = (event) => {
  const port = event.ports[0];
  port.onmessage = function (event) {
    const data = event.data;
    switch (data.type) {
      case "主窗口准备":
        port.postMessage({ type: "在线状态", data: `${data.data} 上线成功` });
        if (connected.some((i) => i.name == data.data)) return;
        connected.forEach(({ name, port }) => {
          port.postMessage({
            type: "在线状态",
            data: `<div class='name'>${data.data}</div> 上线`,
          });
        });
        connected.push({ name: data.data, port: port });
        port.postMessage({
          type: "在线状态",
          data: `当前在线：${connected
            .map((i) => "<div class='name'>" + i.name + "</div>")
            .join(" ")}`,
        });
        break;
      case "发送信息":
        connected.forEach(({ port }) => {
          port.postMessage({ type: "收到信息", data: data.data });
        });
        break;
      case "下线":
        connected.splice(
          connected.findIndex((i) => i.name == data.data),
          1
        );
        connected.forEach(({ port }) => {
          port.postMessage({
            type: "在线状态",
            data: `<div class='name'>${data.data}</div> 下线`,
          });
        });
        break;
      default:
        port.postMessage({ type: "Pong", data: data });
    }
  };

  port.port.start();
  port.postMessage({ type: "Worker在线", data: "启动完成" });
};
self.onerror = (e) => {
  connected.forEach((c) => c.postMessage({ type: "Worker错误", data: e }));
};
