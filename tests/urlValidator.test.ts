import { validateUrl } from '../src/urlValidator';

describe('URL Validator', () => {

    describe('URL syntax validation', () => {

        test('should validate a valid HTTP URL', async () => {
            const result = await validateUrl({
                url: 'https://www.google.com'
            });

            expect(result.valid).toBe(true);
        });

        test('should validate a valid HTTPS URL', async () => {
            const result = await validateUrl({
                url: 'https://www.yahoo.com'
            });

            expect(result.valid).toBe(true);
        });

        test('should reject an invalid URL', async () => {
            const result = await validateUrl({
                url: 'not-a-url'
            });

            expect(result.valid).toBe(false);
            expect(result.error).toBeDefined();
        });

        test('should reject unsupported protocols', async () => {
            const result = await validateUrl({
                url: 'ftp://example.com'
            });

            expect(result.valid).toBe(false);
            expect(result.error).toBe('Invalid protocol');
        });

        test('should return cached result for a previously validated URL', async () => {
            const url = 'https://cached-test-example.com';
        
            const fetchMock = jest
                .spyOn(global, 'fetch')
                .mockResolvedValue({
                    status: 200
                } as Response);
        
            // First call: fetches the URL and stores the result in cache
            const firstResult = await validateUrl({ url });
        
            // Second call: should return the cached result
            const secondResult = await validateUrl({ url });
        
            expect(secondResult).toEqual(firstResult);
        
            // Fetch should only happen once
            expect(fetchMock).toHaveBeenCalledTimes(1);
        
            fetchMock.mockRestore();
        });

        test('should handle fetch errors', async () => {
            const url = 'https://example.com';
        
            jest.spyOn(global, 'fetch').mockRejectedValue(
                new Error('Network error')
            );
        
            const result = await validateUrl({ url });
        
            expect(result.valid).toBe(false);
            expect(result.url).toBe(url);
            expect(result.error).toBe('Network error');
            expect(result.responseTime).toBeDefined();
        
            jest.restoreAllMocks();
        });

    });
});