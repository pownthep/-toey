import { ipcRenderer, IpcRendererEvent } from 'electron';

/**
 * Send data to the specified channel
 *
 * @param channel Channel name
 * @param payload Data to be processed 
 * 
 */
export const publish = <T = unknown>(channel: string, payload?: T) => {
  ipcRenderer.send('pubSub', channel, payload);
};

/**
 * Send data to the specified channel and return the results if any. 
 *
 * @param channel Channel name
 * @param payload Data to be processed
 * 
 * @returns Output of the data that was process
 */
export const pubSub = <T = unknown, S = unknown>(channel: string, payload?: T): Promise<S> => {
  ipcRenderer.send('pubSub', channel, payload);
  return new Promise((resolve) =>
    ipcRenderer.once(channel, (_, response) => resolve(response))
  );
};

/**
 * Subscribe to the specified channel and run callback function when there is new data. 
 *
 * @param channel Channel name
 * @param cb Callback function
 * 
 * @returns A function to unsubscribe to the channel
 */
export const subscribe = (
  channel: string,
  cb: (evt: IpcRendererEvent, response: any) => void
) => {
  ipcRenderer.on(channel, cb);
  const unsubcribe = () => {
    ipcRenderer.removeListener(channel, cb);
  };

  return unsubcribe;
};
