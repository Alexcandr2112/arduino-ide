import { Command, CommandContribution, CommandRegistry } from '@theia/core';
import { injectable, inject } from 'inversify';
import { IDEUpdaterService } from '../../common/protocol/ide-updater-service';

@injectable()
export class IDEUpdaterCommands implements CommandContribution {
  constructor(
    @inject(IDEUpdaterService)
    private readonly updater: IDEUpdaterService
  ) {}

  registerCommands(registry: CommandRegistry): void {
    registry.registerCommand(IDEUpdaterCommands.CHECK_FOR_UPDATES, {
      execute: this.checkForUpdates,
    });
    registry.registerCommand(IDEUpdaterCommands.DOWNLOAD_UPDATE, {
      execute: this.downloadUpdate,
    });
    registry.registerCommand(IDEUpdaterCommands.STOP_DOWNLOAD, {
      execute: this.stopDownload,
    });
    registry.registerCommand(IDEUpdaterCommands.INSTALL_UPDATE, {
      execute: this.quitAndInstall,
    });
  }

  checkForUpdates() {
    this.updater.checkForUpdates();
  }

  downloadUpdate() {
    this.updater.downloadUpdate();
  }

  stopDownload() {
    this.updater.stopDownload();
  }

  quitAndInstall() {
    this.updater.quitAndInstall();
  }
}
export namespace IDEUpdaterCommands {
  export const CHECK_FOR_UPDATES: Command = {
    id: 'arduino-ide-check-for-updates',
  };
  export const DOWNLOAD_UPDATE: Command = {
    id: 'arduino-ide-download-update',
  };
  export const STOP_DOWNLOAD: Command = {
    id: 'arduino-ide-stop-download',
  };
  export const INSTALL_UPDATE: Command = {
    id: 'arduino-ide-install-update',
  };
}
