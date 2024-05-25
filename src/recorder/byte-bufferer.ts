export class ByteBufferer {
  buffer: Buffer | undefined = undefined

  constructor(readonly size: number) {}

  write(buffer: Buffer): Buffer[] {
    if (this.buffer !== undefined) {
      this.buffer = Buffer.concat([this.buffer, buffer])
    } else {
      this.buffer = buffer
    }

    const fixedLengthBuffers = []
    while (this.buffer.length >= this.size) {
      fixedLengthBuffers.push(this.buffer.subarray(0, this.size))
      this.buffer = this.buffer.subarray(this.size)
    }
    return fixedLengthBuffers
  }
}
