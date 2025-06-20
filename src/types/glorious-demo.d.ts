declare module '@glorious/demo' {
  interface OpenAppOptions {
    minHeight?: string;
    windowTitle?: string;
    promptString?: string;
  }

  interface CommandOptions {
    onCompleteDelay?: number; // ✅ 딜레이 추가
  }

  class GDemo {
    constructor(element: string);

    openApp(app: 'editor' | 'terminal', options?: OpenAppOptions): this;

    write(text: string, options?: CommandOptions): this;

    command(text: string, options?: CommandOptions): this;

    respond(text: string): this;

    end(): this;
  }

  export default GDemo;
}