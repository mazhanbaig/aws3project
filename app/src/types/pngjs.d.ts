declare module 'pngjs' {
  import { Stream } from 'stream';

  interface PNGOptions {
    width?: number;
    height?: number;
    fill?: boolean;
    checkCRC?: boolean;
    deflateChunkSize?: number;
    deflateLevel?: number;
    deflateStrategy?: number;
    filterType?: number | number[];
    inputHasAlpha?: boolean;
    colorType?: number;
    bitDepth?: number;
  }

  interface PNGOpts {
    width: number;
    height: number;
    data: Buffer;
    gamma?: number;
    alpha?: boolean;
  }

  class PNG extends Stream {
    static sync: {
      read(buffer: Buffer, options?: PNGOptions): PNG;
      write(png: PNG, options?: PNGOptions): Buffer;
    };

    static bitblt(
      src: PNG,
      dst: PNG,
      srcX: number,
      srcY: number,
      width: number,
      height: number,
      dstX: number,
      dstY: number
    ): void;

    constructor(options?: PNGOptions);

    data: Buffer;
    width: number;
    height: number;
    gamma: number;
    alpha: boolean;

    pack(): PNG;
    parse(data: Buffer, callback?: (err: Error | null) => void): void;
  }

  export { PNG, PNGOptions };
}
