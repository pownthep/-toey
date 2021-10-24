import { ipcMain, IpcMainEvent, WebContents, webContents } from 'electron';

interface IResponse<T> {
  isSuccess: boolean;
  output?: T;
  error?: any;
}
/**
 * Initialize module in the main process
 *
 * @remarks
 *
 * This function must be call first before any publishing and subscribing can be call.
 */
export const init = () => {
  ipcMain.on('pubSub', (evt, channel, data) => {
    ipcMain.listeners(channel).forEach((listener) => listener(evt, data));
    broadcast(channel, data, evt.sender);
  });
};

/**
 * Broadcast message to main and renderer/s process except the sender
 *
 * @param channel Channel name
 * @param payload Data to send
 *
 */
export const broadcast = <T = unknown>(
  channel: string,
  payload: T,
  sender: WebContents
) => {
  webContents.getAllWebContents().forEach((wc) => {
    if (wc.id !== sender.id) {
      wc.send(channel, payload);
    }
  });
};

/**
 * Listen to a specific channel and perform task in the callback
 *
 * @param channel Channel name
 * @param cb Callback function
 *
 * @remarks
 *
 * This is a main process specific listener
 */
export const listen = <T = unknown, S = unknown>(
  channel: string,
  cb: (parameters: {
    payload: T;
    reply: (response: IResponse<S>) => void;
    evt: IpcMainEvent;
    sender: WebContents;
  }) => void
) => {
  ipcMain.on(channel, (evt: IpcMainEvent, payload: T) => {
    const reply = (response: IResponse<S>) => evt.reply(channel, response);
    cb({ payload, reply, sender: evt.sender, evt });
  });
};

export function done<T = unknown>(output: T) {
  return {
    isSuccess: true,
    output
  };
}

export function fail(err: any) {
  return {
    isSuccess: false,
    err
  };
}
