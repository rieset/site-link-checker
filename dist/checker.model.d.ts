export interface CheckOptions {
    ignore?: string;
    internal?: boolean;
    depth: number;
}
export interface CheckedItem {
    uri: string;
    depth: number;
    page: string;
    type: 'file' | 'link';
    jquery?: boolean;
}
