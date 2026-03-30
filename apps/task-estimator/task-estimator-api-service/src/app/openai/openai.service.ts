import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class OpenAIService {
    private readonly logger = new Logger(OpenAIService.name);
    private client: OpenAI | null = null;

    private getClient(): OpenAI | null {
        if (!process.env.OPENAI_API_KEY) return null;
        if (!this.client) {
            this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        }
        return this.client;
    }

    async estimateHours(taskName: string): Promise<{ estimatedHours: number; rawResponse: string }> {
        const client = this.getClient();
        if (!client) {
            this.logger.warn('OPENAI_API_KEY is not set — using fallback estimate of 10 hours');
            return { estimatedHours: 10, rawResponse: 'No OPENAI_API_KEY configured' };
        }
        try {
            const completion = await client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content:
                            'You are a software project estimation expert. ' +
                            'Given a task name, respond with ONLY a JSON object in the format: ' +
                            '{"estimatedHours": <number>}. ' +
                            'The number should be a realistic estimate of developer hours required. ' +
                            'Do not include any explanation or extra text.',
                    },
                    {
                        role: 'user',
                        content: `Estimate the hours required to complete the following task: "${taskName}"`,
                    },
                ],
                response_format: { type: 'json_object' },
            });

            const rawResponse = completion.choices[0]?.message?.content ?? '';
            const parsed = JSON.parse(rawResponse) as { estimatedHours: number };
            return { estimatedHours: parsed.estimatedHours, rawResponse };
        } catch (err) {
            this.logger.error('OpenAI estimation failed', err);
            return { estimatedHours: 10, rawResponse: `Error: ${String(err)}` };
        }
    }
}
