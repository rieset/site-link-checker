import { CheckedItem, CheckOptions } from './checker.model';

export class Checker {

  // Crawler instance
  private crawler;

  // Host to check
  private readonly host: string;

  // Options
  private readonly options: CheckOptions;

  // List of ignored URLs
  private ignored: string[];

  // Depth of the check
  private depth: number = 4;

  // List of pages with errors
  private pagesWithErrors = {};

  // List of checked pages
  private checkedPages = {};

  constructor(host: string, options: CheckOptions) {
    const Crawler = require('crawler');

    this.host = host;
    this.options = options;
    this.ignored = options.ignore?.split(',') || [];
    this.depth = options.depth;

    this.crawler = new Crawler({
      timeout: 60000,
      maxConnections: 5,
      preRequest: this.preRequest.bind(this),
      callback: this.callback.bind(this),
      retries: 1,
      interval: 3000
    });
  }

  preRequest(options, done) {
    const uri = options.uri;

    if (this.ignored && this.ignored.find((i: string) => uri.startsWith(i))) {
      // If the URI is found in the list of ignored URLs, abort the request
      done({
        code: 100,
        op: 'abort',
        message: 'Link ignored'
      });
    } else if (uri.startsWith('http://')) {
      // If the URI starts with 'http://', it is invalid due to using an insecure protocol
      done({
        code: 400,
        op: 'fail',
        message: 'Please replace protocol'
      });
    } else if (/^https:\/\/[^\/]+\/cdn-cgi\/.+$/.test(uri)) {
      done({
        code: 100,
        op: 'abort',
        message: 'Link generated cloudflare'
      });
    } else if (this.checkedPages[uri]) {
      // If the page has already been checked, return the previous result
      const code = this.checkedPages[uri].code;
      const op = code < 300 ? 'abort' : 'fail';
      done({
        code: code,
        op: op,
        message: 'Page already checked'
      });
    } else {
      // If none of the above conditions are met, proceed with the request
      done();
    }
  }


  /**
   * Callback function for crawler
   * @param err
   * @param res
   * @param done
   */
  callback(err, res, done) {
    if (err) {
      // Handle error response
      this.handlerErrorPage(err.code, res.options);
    } else {
      const statusCode = res.statusCode;
      const options = res.options;

      if (statusCode === 200 || statusCode === 201) {
        // Handle successful response
        this.handlerSuccessPage(statusCode, options);

        if (this.isParsablePage(options.uri) && this.isValidOptions(options)) {
          // Find links and images for further processing
          this.findLinksAndAddTaskToQueue(res, options);
          this.findImagesAndAddTaskToQueue(res, options);
        }
      } else {
        // Handle other status codes
        this.handlerErrorPage(statusCode, options);
      }
    }

    done();
  }

  /**
   * Handles a successful response from crawling a page.
   * @param code - HTTP status code.
   * @param options - Checked item options.
   */
  handlerSuccessPage(code: number, options: CheckedItem) {
    const d = Array.from(Array(options.depth)).map(() => '  ').join('');

    console.log(`${code} ${options.type} ${d} ${options.uri}`);

    this.checkedPages[options.uri] = {
      code: code,
      page: options.page,
      uri: options.uri,
      type: options.type,
    };
  }


  /**
   * Handles an error response from crawling a page.
   * @param code - HTTP status code.
   * @param options - Checked item options.
   */
  handlerErrorPage(code: number, options: CheckedItem) {
    const d = Array.from(Array(options.depth)).map(() => '  ').join('');
    const path = options.page.replace(this.host, '/').replace('//', '/');

    console.log(`${code} On page: ${path}\n ${d} ${options.uri}`);

    this.checkedPages[options.uri] = {
      code: code,
      page: options.page,
      uri: options.uri,
      type: options.type,
    };

    if (!this.pagesWithErrors[options.page]) {
      this.pagesWithErrors[options.page] = {};
    }

    this.pagesWithErrors[options.page][options.uri] = {
      code: code,
      page: options.page,
      uri: options.uri,
      type: options.type,
    };
  }


  /**
   * Checks if a given URI represents a parsable page.
   * @param uri - URI to check.
   * @returns True if the URI represents a parsable page, false otherwise.
   */
  isParsablePage(uri: string): boolean {
    return !!uri && (uri.startsWith('/') || uri.startsWith(this.host));
  }

  /**
   * Checks if the options for a checked item are valid.
   * @param options - Checked item options.
   * @returns True if the options are valid, false otherwise.
   */
  isValidOptions(options: CheckedItem): boolean {
    return options.depth < this.depth;
  }

  /**
   * Prepares a URI by converting relative paths to absolute URLs.
   * @param uri - URI to prepare.
   * @returns Prepared URI or null if invalid.
   */
  prepareUri(uri: string): string | null {
    if (uri && uri.startsWith('/')) {
      return new URL(uri, this.host).toString();
    }
    if (uri && uri.startsWith('http')) {
      return uri;
    }
    return null;
  }

  /**
   * The findLinksAndAddTaskToQueue() function is responsible for finding links in the crawled page's body and adding tasks to the crawler's queue for further processing
   * @param body
   * @param options
   */
  findLinksAndAddTaskToQueue(body, options: CheckedItem) {
    if (!body || !body.$) {
      return;
    }

    const links = body.$('a');

    for (let i = 0; i < links.length; i++) {
      const link = this.prepareUri(links[i]?.attribs?.href);

      if (!link) {
        continue; // If the link is invalid or empty, skip to the next iteration
      }

      const task: CheckedItem = {
        uri: link,
        depth: options.depth + 1,
        page: options.uri,
        type: options.type,
      }

      if (options.depth < this.depth) {
        // Add the task to the crawler's queue if the depth is within the allowed limit
        this.crawler.queue(task);
      }
    }
  }

  /**
   * The findImagesAndAddTaskToQueue() function is responsible for finding images in the crawled page's body and adding tasks to the crawler's queue for further processing
   * @param body
   * @param options
   */
  findImagesAndAddTaskToQueue(body, options: CheckedItem) {
    if (!body || !body.$) {
      return;
    }

    const images = body.$('img');

    for (let i = 0; i < images.length; i++) {
      let src = this.prepareUri(images[i]?.attribs?.src);

      if (!src) {
        continue; // If the source URL is still not available, skip to the next image
      }

      const task: CheckedItem = {
        uri: src,
        depth: options.depth + 1,
        page: options.uri,
        type: 'file',
        jquery: false,
      }

      if (options.depth < this.depth) {
        // Add the task to the crawler's queue if the depth is within the allowed limit
        this.crawler.queue(task);
      }
    }
  }

  /**
   * Starts the crawler.
   */
  start() {
    const root: CheckedItem = {
      uri: this.host,
      depth: 0,
      page: "/",
      type: 'link',
    }

    this.crawler.queue(root);

    return new Promise((resolve) => {
      // Event listener for the 'drain' event, which indicates that the crawler has finished processing all queued tasks
      this.crawler.on('drain', () => {
        console.log('\n\nChecked links', Object.keys(this.checkedPages).length);
        console.log('\n\nIgnored links\n', this.ignored.map((link) => '- ' + link).join('\n'));

        if (Object.keys(this.pagesWithErrors).length) {
          // If there are pages with errors, iterate through each page and its corresponding URIs with errors
          Object.keys(this.pagesWithErrors).forEach((page) => {
            console.log(`\nPage: ${page}`);
            Object.keys(this.pagesWithErrors[page]).forEach((uri) => {
              console.log(`\t${this.pagesWithErrors[page][uri].code} ${uri}`);
            })
          })

          // Resolve the promise with false indicating there are errors
          resolve(false)
        } else {
          // Resolve the promise with true indicating there are no errors
          resolve(true)
        }
      });
    })
  }


}
