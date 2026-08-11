export interface UrlValidator {
    url: string;
    statusCode?: number;
    responseTime?: number;
    valid: boolean;
    error?: string
}

const validatorCache = new Map<String, UrlValidator>();

export async function validateUrl({ url }: { url: string }): Promise<UrlValidator> {

    let passedUrl: URL;
    const cachedResult = validatorCache.get(url);
    if (cachedResult) {
        return cachedResult;
    }

    try {
        passedUrl = new URL(url);

        if (passedUrl.protocol !== 'http:' && passedUrl.protocol !== 'https:') {
            return {
                url: url,
                statusCode: undefined,
                responseTime: undefined,
                valid: false,
                error: "Invalid protocol"
            }
        }


    } catch (error) {

        return {
            url: url,
            statusCode: undefined,
            responseTime: undefined,
            valid: false,
            error: error instanceof Error ? error.message : "Invalid Url"
        }
    }
    const startTime = Date.now();
    try {

        const response = await fetch(passedUrl, {
            method: "HEAD"
        });

        const responseTime = Date.now() - startTime;

        const result: UrlValidator = {
            url: url,
            statusCode: response.status,
            responseTime: responseTime,
            valid: response.status >= 200 && response.status < 400
        }
        validatorCache.set(url, result);
        return result;

    } catch (error) {
        return {
            url: url,
            responseTime: Date.now() - startTime,
            valid: false,
            error: error instanceof Error ? error.message : "Invalid Url"
        }
    }

}