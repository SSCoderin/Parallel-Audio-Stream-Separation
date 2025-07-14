class EchoCancellationProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.filterLength = 1024;
    this.filter = new Float32Array(this.filterLength).fill(0);
    this.stepSize = 0.01;
    this.referenceBuffer = new Float32Array(this.filterLength).fill(0);
  }

  process(inputs, outputs) {
    const micInput = inputs[0]?.[0];
    const systemInput = inputs[1]?.[0];
    const output = outputs[0][0];
    if (!micInput || !output) return true;

    for (let i = 0; i < micInput.length; i++) {
      let estimatedEcho = 0;
      if (systemInput) {
        this.referenceBuffer.copyWithin(0, 1);
        this.referenceBuffer[this.filterLength - 1] = systemInput[i] || 0;
        for (let j = 0; j < this.filterLength; j++) {
          estimatedEcho += this.filter[j] * this.referenceBuffer[this.filterLength - 1 - j];
        }
        const refPower = this.referenceBuffer.reduce((sum, val) => sum + val * val, 0) + 1e-10;
        for (let j = 0; j < this.filterLength; j++) {
          this.filter[j] += (this.stepSize * (micInput[i] - estimatedEcho) * this.referenceBuffer[this.filterLength - 1 - j]) / refPower;
        }
      }
      output[i] = micInput[i] - estimatedEcho;
    }
    return true;
  }
}

registerProcessor("echo-cancellation-processor", EchoCancellationProcessor);