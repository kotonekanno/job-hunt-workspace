// One document owns its draft, acknowledgement and debounce timer.
export class DocumentSaveSession {
  private savedText: string;
  private text: string;
  private timer: ReturnType<typeof setTimeout> | undefined;
  private version = 0;
  private pending: Promise<boolean> | undefined;
  private disposed = false;

  constructor(
    text: string,
    private write: (text: string) => Promise<void>,
    private notify: () => void,
    private reportError: (message: string) => void,
  ) {
    this.savedText = text;
    this.text = text;
  }

  get dirty() {
    return this.text !== this.savedText || this.pending !== undefined;
  }
  get saving() {
    return this.pending !== undefined;
  }

  update(text: string) {
    this.text = text;
    this.cancelTimer();
    this.notify();
    if (!this.dirty) return;
    const version = this.version;
    this.timer = setTimeout(() => {
      this.timer = undefined;
      void this.autoSave(version);
    }, 1500);
  }

  private cancelTimer() {
    clearTimeout(this.timer);
    this.timer = undefined;
    this.version += 1;
  }

  private async autoSave(version: number) {
    await this.pending;
    // Typing while an earlier request is in flight starts a new 1.5s wait.
    if (version !== this.version || this.disposed) return;
    await this.saveOnce();
  }

  private async saveOnce(): Promise<boolean> {
    if (this.disposed) return false;
    if (this.pending) return this.pending;
    if (this.text === this.savedText) return true;
    if (this.text.length > 50000) {
      this.reportError(
        '本文は50,000文字以内にしてください。変更はまだ保存されていません。',
      );
      return false;
    }
    const text = this.text;
    this.pending = Promise.resolve()
      .then(() => this.write(text))
      .then(() => {
        this.savedText = text;
        return true;
      })
      .catch(() => {
        this.reportError(
          '本文の保存に失敗しました。入力内容は保持しています。保存ボタンで再試行してください。',
        );
        return false;
      })
      .finally(() => {
        this.pending = undefined;
        if (!this.disposed) this.notify();
      });
    this.notify();
    return this.pending;
  }

  async flush(): Promise<boolean> {
    this.cancelTimer();
    if (this.pending && !(await this.pending)) return false;
    while (this.dirty && !this.disposed) {
      this.cancelTimer();
      if (!(await this.saveOnce())) return false;
    }
    return !this.disposed;
  }

  dispose() {
    this.disposed = true;
    this.cancelTimer();
  }
}
