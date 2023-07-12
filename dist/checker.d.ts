import { CheckedItem, CheckOptions } from './checker.model';
export declare class Checker {
    private crawler;
    private readonly host;
    private readonly options;
    private ignored;
    private depth;
    private pagesWithErrors;
    private checkedPages;
    constructor(host: string, options: CheckOptions);
    preRequest(options: any, done: any): void;
    /**
     * Callback function for crawler
     * @param err
     * @param res
     * @param done
     */
    callback(err: any, res: any, done: any): void;
    /**
     * Handles a successful response from crawling a page.
     * @param code - HTTP status code.
     * @param options - Checked item options.
     */
    handlerSuccessPage(code: number, options: CheckedItem): void;
    /**
     * Handles an error response from crawling a page.
     * @param code - HTTP status code.
     * @param options - Checked item options.
     */
    handlerErrorPage(code: number, options: CheckedItem): void;
    /**
     * Checks if a given URI represents a parsable page.
     * @param uri - URI to check.
     * @returns True if the URI represents a parsable page, false otherwise.
     */
    isParsablePage(uri: string): boolean;
    /**
     * Checks if the options for a checked item are valid.
     * @param options - Checked item options.
     * @returns True if the options are valid, false otherwise.
     */
    isValidOptions(options: CheckedItem): boolean;
    /**
     * Prepares a URI by converting relative paths to absolute URLs.
     * @param uri - URI to prepare.
     * @returns Prepared URI or null if invalid.
     */
    prepareUri(uri: string): string | null;
    /**
     * The findLinksAndAddTaskToQueue() function is responsible for finding links in the crawled page's body and adding tasks to the crawler's queue for further processing
     * @param body
     * @param options
     */
    findLinksAndAddTaskToQueue(body: any, options: CheckedItem): void;
    /**
     * The findImagesAndAddTaskToQueue() function is responsible for finding images in the crawled page's body and adding tasks to the crawler's queue for further processing
     * @param body
     * @param options
     */
    findImagesAndAddTaskToQueue(body: any, options: CheckedItem): void;
    /**
     * Starts the crawler.
     */
    start(): Promise<unknown>;
}
