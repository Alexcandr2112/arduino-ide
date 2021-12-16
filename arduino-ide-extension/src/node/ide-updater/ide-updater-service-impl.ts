import { injectable } from '@theia/core/shared/inversify';
import { Emitter } from '@theia/core/lib/common/event';
import { AllPublishOptions } from 'builder-util-runtime';
import {
  AppUpdater,
  AppImageUpdater,
  MacUpdater,
  NsisUpdater,
  UpdateInfo,
  ProgressInfo,
  CancellationToken,
} from 'electron-updater';
import {
  IDEUpdaterService,
  IDEUpdaterServiceClient,
} from '../../common/protocol/ide-updater-service';

// IDEUpdater TODO docs
@injectable()
export class IDEUpdaterServiceImpl implements IDEUpdaterService {
  private updater: AppUpdater;
  private cancellationToken?: CancellationToken;
  protected theiaFEClient?: IDEUpdaterServiceClient;

  constructor() {
    const options: AllPublishOptions = {
      provider: 's3',
      bucket: '',
      region: '',
      acl: 'public-read',
      endpoint: 'https://{service}.{region}.amazonaws.com',
      channel: '',
    };
    // TODO: Search S3 bucket name for the two channels
    // https://downloads.arduino.cc/arduino-ide/arduino-ide_2.0.0-rc2_Linux_64bit.zip
    // https://downloads.arduino.cc/arduino-ide/nightly/arduino-ide_nightly-latest_Linux_64bit.zip

    this.cancellationToken = new CancellationToken();
    debugger;
    if (process.platform === 'win32') {
      this.updater = new NsisUpdater(options);
    } else if (process.platform === 'darwin') {
      this.updater = new MacUpdater(options);
    } else {
      this.updater = new AppImageUpdater(options);
    }
    this.updater.autoDownload = false;

    this.updater.on('checking-for-update', (e) =>
      this.theiaFEClient?.notifyCheckingForUpdate(e)
    );
    this.updater.on('update-available', (e) =>
      this.theiaFEClient?.notifyUpdateAvailable(e)
    );
    this.updater.on('update-not-available', (e) =>
      this.theiaFEClient?.notifyUpdateNotAvailable(e)
    );
    this.updater.on('download-progress', (e) =>
      this.theiaFEClient?.notifyDownloadFinished(e)
    );
    this.updater.on('update-downloaded', (e) =>
      this.theiaFEClient?.notifyDownloadFinished(e)
    );
    this.updater.on('error', (e) => this.theiaFEClient?.notifyError(e));
  }

  setClient(client: IDEUpdaterServiceClient | undefined): void {
    this.theiaFEClient = client;
  }

  dispose(): void {
    throw new Error('Method not implemented.');
  }

  async checkForUpdates(): Promise<UpdateInfo> {
    const { updateInfo } = await this.updater.checkForUpdates();
    return updateInfo;
  }

  async downloadUpdate(): Promise<void> {
    await this.updater.downloadUpdate(this.cancellationToken);
  }

  stopDownload(): void {
    this.cancellationToken?.cancel();
  }

  quitAndInstall(): void {
    this.updater.quitAndInstall();
  }
}

@injectable()
export class IDEUpdaterServiceClientImpl implements IDEUpdaterServiceClient {
  protected readonly onErrorEmitter = new Emitter<Error>();
  protected readonly onCheckingForUpdateEmitter = new Emitter<void>();
  protected readonly onUpdateAvailableEmitter = new Emitter<UpdateInfo>();
  protected readonly onUpdateNotAvailableEmitter = new Emitter<UpdateInfo>();
  protected readonly onDownloadProgressEmitter = new Emitter<ProgressInfo>();
  protected readonly onDownloadFinishedEmitter = new Emitter<UpdateInfo>();

  readonly onError = this.onErrorEmitter.event;
  readonly onCheckingForUpdate = this.onCheckingForUpdateEmitter.event;
  readonly onUpdateAvailable = this.onUpdateAvailableEmitter.event;
  readonly onUpdateNotAvailable = this.onUpdateNotAvailableEmitter.event;
  readonly onDownloadProgressChanged = this.onDownloadProgressEmitter.event;
  readonly onDownloadFinished = this.onDownloadFinishedEmitter.event;

  notifyError(message: Error): void {
    this.onErrorEmitter.fire(message);
  }
  notifyCheckingForUpdate(message: void): void {
    this.onCheckingForUpdateEmitter.fire(message);
  }
  notifyUpdateAvailable(message: UpdateInfo): void {
    this.onUpdateAvailableEmitter.fire(message);
  }
  notifyUpdateNotAvailable(message: UpdateInfo): void {
    this.onUpdateNotAvailableEmitter.fire(message);
  }
  notifyDownloadProgressChanged(message: ProgressInfo): void {
    this.onDownloadProgressEmitter.fire(message);
  }
  notifyDownloadFinished(message: UpdateInfo): void {
    this.onDownloadFinishedEmitter.fire(message);
  }
}
