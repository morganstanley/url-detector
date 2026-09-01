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

    });
});