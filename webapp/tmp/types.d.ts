declare interface ImportMeta {
  hot: {
    accept(callback: AcceptFn): void;
    dispose(callback: DisposeFn): void;
  };
}

type AcceptFn = (opts: { module: any }) => any;
type DisposeFn = () => any;
