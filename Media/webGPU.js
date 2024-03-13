/** I. WebGPU 显存基本使用  */
// 常规的获取 GPU
const adapter = await navigator.gpu.requestAdapter();
const device = await adapter.requestDevice();

// 创建Buffer并填入数据
const gpuWriteBuffer = device.createBuffer({
  mappedAtCreation: true, // 不知道
  size: 4, // 大小
  usage: GPUBufferUsage.MAP_WRITE | GPUBufferUsage.COPY_SRC, // 类型为写入或者复制
});

/** II. 写入 */
// 写入数据需要创建到内存的映射，然后再反向读回去
const arrayBuffer = gpuWriteBuffer.getMappedRange();
new Uint8Array(arrayBuffer).set([0, 1, 2, 3]);
gpuWriteBuffer.unmap();

/** III. 复制 */
const gpuReadBuffer = device.createBuffer({
  size: 4,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
});
const copyEncoder = device.createCommandEncoder();
// 复制源，源偏移，复制目标，目标偏移，复制大小
copyEncoder.copyBufferToBuffer(gpuWriteBuffer, 0, gpuReadBuffer, 0, 4);
// 发送复制命令
const copyCommands = copyEncoder.finish();
device.queue.submit([copyCommands]);

/** IV. 读取 */
await gpuReadBuffer.mapAsync(GPUMapMode.READ);
const copyArrayBuffer = gpuReadBuffer.getMappedRange();
console.log(new Uint8Array(copyArrayBuffer));

/** V. 矩阵 */
// 创建 2x4 的矩阵，前面两个元素是宽高
const Matrix_left = new Float32Array([2, 4, 1, 2, 3, 4, 5, 6, 7, 8]);
const Matrix_left_GPU = device.createBuffer({
  mappedAtCreation: true,
  size: Matrix_left.byteLength,
  usage: GPUBufferUsage.STORAGE,
});
const arrayBufferFirstMatrix = Matrix_left_GPU.getMappedRange();
new Float32Array(arrayBufferFirstMatrix).set(Matrix_left);
Matrix_left_GPU.unmap();
const Matrix_right = new Float32Array([4, 2, 1, 2, 3, 4, 5, 6, 7, 8]);
const Matrix_right_GPU = device.createBuffer({
  mappedAtCreation: true,
  size: Matrix_right.byteLength,
  usage: GPUBufferUsage.STORAGE,
});
const arrayBufferSecondMatrix = Matrix_right_GPU.getMappedRange();
new Float32Array(arrayBufferSecondMatrix).set(Matrix_right);
Matrix_right_GPU.unmap();

const MatrixResultSize =
  Float32Array.BYTES_PER_ELEMENT * (2 + Matrix_left[0] * Matrix_right[1]);
const Matrix = device.createBuffer({
  size: MatrixResultSize,
  usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC,
});

/** VI. 摆好位置 */
const bindGroupLayout = device.createBindGroupLayout({
  entries: [
    {
      binding: 0,
      visibility: GPUShaderStage.COMPUTE,
      buffer: { type: "read-only-storage" },
    },
    {
      binding: 1,
      visibility: GPUShaderStage.COMPUTE,
      buffer: { type: "read-only-storage" },
    },
    {
      binding: 2,
      visibility: GPUShaderStage.COMPUTE,
      buffer: { type: "storage" },
    },
  ],
});
const bindGroup = device.createBindGroup({
  layout: bindGroupLayout,
  entries: [
    { binding: 0, resource: { buffer: Matrix_left_GPU } },
    { binding: 1, resource: { buffer: Matrix_right_GPU } },
    { binding: 2, resource: { buffer: Matrix } },
  ],
});

/** VII. 设定Shader算法 */
const shaderModule = device.createShaderModule({
  code: `
    struct Matrix {
      size : vec2f,
      numbers: array<f32>,
    }

    @group(0) @binding(0) var<storage, read> firstMatrix : Matrix;
    @group(0) @binding(1) var<storage, read> secondMatrix : Matrix;
    @group(0) @binding(2) var<storage, read_write> resultMatrix : Matrix;

    @compute @workgroup_size(8, 8)
    fn main(@builtin(global_invocation_id) global_id : vec3u) {
      // Guard against out-of-bounds work group sizes
      if (global_id.x >= u32(firstMatrix.size.x) || global_id.y >= u32(secondMatrix.size.y)) {
        return;
      }

      resultMatrix.size = vec2(firstMatrix.size.x, secondMatrix.size.y);

      let resultCell = vec2(global_id.x, global_id.y);
      var result = 0.0;
      for (var i = 0u; i < u32(firstMatrix.size.y); i = i + 1u) {
        let a = i + resultCell.x * u32(firstMatrix.size.y);
        let b = resultCell.y + i * u32(secondMatrix.size.y);
        result = result + firstMatrix.numbers[a] * secondMatrix.numbers[b];
      }

      let index = resultCell.y + resultCell.x * u32(secondMatrix.size.y);
      resultMatrix.numbers[index] = result;
    }
  `,
});

/** VIII. 创建计算任务 */
const computePipeline = device.createComputePipeline({
  layout: device.createPipelineLayout({
    bindGroupLayouts: [bindGroupLayout],
  }),
  compute: {
    module: shaderModule,
    entryPoint: "main",
  },
});
const commandEncoder = device.createCommandEncoder();
const passEncoder = commandEncoder.beginComputePass();
passEncoder.setPipeline(computePipeline);
passEncoder.setBindGroup(0, bindGroup);
const workgroupCountX = Math.ceil(firstMatrix[0] / 8);
const workgroupCountY = Math.ceil(secondMatrix[1] / 8);
passEncoder.dispatchWorkgroups(workgroupCountX, workgroupCountY);
passEncoder.end();
/** IX. 读取结果 */
const Result = device.createBuffer({
  size: resultMatrixBuffer,
  usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
});
commandEncoder.copyBufferToBuffer(Matrix, 0, Result, 0, resultMatrixBuffer);
const gpuCommands = commandEncoder.finish();
device.queue.submit([gpuCommands]);
await gpuReadBuffer.mapAsync(GPUMapMode.READ);
console.log(new Float32Array(gpuReadBuffer.getMappedRange()));
