import { Checker } from "./checker";
import { CheckOptions } from './checker.model';

export const checking = async (url: string, options: CheckOptions): Promise<any> => {
  if (!url) {
    console.error('URL is not specified');
  } else {
    const checker = new Checker(url, options);

    return await checker.start()
      .then((r) => {
        return r;
      })
      .catch((r) => {
        return r;
      })
  }

  return false;
}
