function decodeUINT8Array(uint8array: Uint8Array) {
  return new TextDecoder("utf-8").decode(uint8array);
}

export { decodeUINT8Array };
