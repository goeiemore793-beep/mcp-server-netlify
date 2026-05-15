export declare function handler(event: any, context: any): Promise<{
    statusCode: number;
    headers: {
        'Content-Type': string;
    };
    body: string;
}>;
export declare function discovery(event: any, context: any): Promise<{
    statusCode: number;
    headers: {
        'Content-Type': string;
    };
    body: string;
}>;
export declare function createAccount(event: any, context: any): Promise<{
    statusCode: number;
    headers: {
        'Content-Type': string;
    };
    body: string;
}>;
export declare function refreshToken(event: any, context: any): Promise<{
    statusCode: number;
    headers: {
        'Content-Type': string;
    };
    body: string;
}>;
export declare function health(event: any, context: any): Promise<{
    statusCode: number;
    headers: {
        'Content-Type': string;
    };
    body: string;
}>;
