const https = require('https');

/**
 * Maps HuggingFace emotion labels to Aura's mood types.
 */
const mapEmotionToMood = (emotion) => {
    const mapping = {
        'joy': 'awesome',
        'surprise': 'energetic',
        'neutral': 'neutral',
        'sadness': 'sad',
        'anger': 'stressed',
        'fear': 'stressed',
        'disgust': 'stressed'
    };
    if (emotion === 'joy') return 'awesome';
    return mapping[emotion] || 'neutral';
};

/**
 * Calls HuggingFace Inference API using native HTTPS module.
 */
exports.detectEmotion = async (text) => {
    // KILL ANY PROXY VARIABLES THAT MIGHT BE HIJACKING THE REQUEST
    delete process.env.http_proxy;
    delete process.env.HTTP_PROXY;
    delete process.env.https_proxy;
    delete process.env.HTTPS_PROXY;
    delete process.env.ALL_PROXY;

    return new Promise((resolve, reject) => {
        if (!process.env.HF_TOKEN || process.env.HF_TOKEN.includes('your_huggingface_token')) {
            console.warn('AI: TOKEN MISSING OR PLACEHOLDER');
            return resolve('neutral');
        }

        // INTERNET CONNECTIVITY TEST
        https.get('https://www.google.com', (testRes) => {
            console.log(`Internet Test (Google) -> Status: ${testRes.statusCode}`);
        }).on('error', (e) => {
            console.error('Internet Test Failed:', e.message);
        });

        const data = JSON.stringify({ inputs: text });
        // Trying a different subdomain/path that often avoids local DNS mocks
        const hfUrl = new URL('https://huggingface.co/api/models/j-hartmann/emotion-english-distilroberta-base');
        
        const options = {
            method: 'POST',
            agent: false, // DO NOT use global agents or proxies
            headers: {
                'Authorization': `Bearer ${process.env.HF_TOKEN.trim()}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            },
            timeout: 15000
        };

        console.log(`AI: Attempting request to ${hfUrl.href}...`);

        const req = https.request(hfUrl, options, (res) => {
            let body = '';
            console.log(`AI Response Debug -> Status: ${res.statusCode}, Server: ${res.headers.server || 'Unknown'}`);

            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
                try {
                    // If we get HTML, it's definitely NOT HuggingFace (they send JSON even for 404)
                    if (body.trim().startsWith('<!DOCTYPE html>')) {
                        console.error('CRITICAL: Local server intercepted the request! (Found HTML response)');
                        return resolve('neutral');
                    }

                    const parsed = JSON.parse(body);
                    
                    if (res.statusCode !== 200) {
                        console.error(`AI API Error (Status ${res.statusCode}):`, parsed.error || body.substring(0, 50));
                        return resolve('neutral');
                    }

                    const results = Array.isArray(parsed) && Array.isArray(parsed[0]) 
                        ? parsed[0] 
                        : (Array.isArray(parsed) ? parsed : []);

                    if (results.length === 0) return resolve('neutral');

                    const topEmotion = results.reduce((prev, current) => (prev.score > current.score) ? prev : current);
                    console.log(`AI Success [${topEmotion.label} - ${(topEmotion.score * 100).toFixed(1)}%]`);
                    
                    if (topEmotion.score < 0.2) return resolve('neutral');
                    resolve(mapEmotionToMood(topEmotion.label));
                } catch (e) {
                    console.error('AI Parsing Error:', body.substring(0, 50));
                    resolve('neutral');
                }
            });
        });

        req.on('error', (e) => {
            console.error('AI Network Error:', e.message);
            resolve('neutral');
        });

        req.write(data);
        req.end();
    });
};
