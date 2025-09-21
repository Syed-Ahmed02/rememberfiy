const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Base API client class
class ApiClient {
  private baseURL: string;

  constructor(baseURL: string = BACKEND_URL) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      } else {
        return await response.text() as unknown as T;
      }
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  // Health check
  async healthCheck(): Promise<{ status: string; message: string }> {
    return this.request('/health');
  }

  // File upload with FormData
  async uploadFile(file: File): Promise<{
    success: boolean;
    message: string;
    content?: string;
    summary?: string;
    file_path?: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    // Determine content type based on file type
    let contentType = 'pdf';
    if (file.type.startsWith('image/')) {
      contentType = 'image';
    } else if (file.type === 'text/plain') {
      contentType = 'text';
    }
    
    formData.append('content_type', contentType);

    const response = await fetch(`${this.baseURL}/api/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: 'File uploaded successfully',
      content: result.content,
      summary: result.summary,
      file_path: result.file_url,
    };
  }

  // Image upload
  async uploadImage(file: File): Promise<{
    success: boolean;
    message: string;
    content?: string;
    summary?: string;
    file_path?: string;
  }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${this.baseURL}/api/upload_image`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Image upload failed: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    return {
      success: true,
      message: 'Image uploaded successfully',
      content: result.content,
      summary: result.summary,
      file_path: result.file_url,
    };
  }

  // Text upload
  async uploadText(text: string): Promise<{
    success: boolean;
    message: string;
    content?: string;
    summary?: string;
  }> {
    const result = await this.request('/api/upload_text', {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    
    return {
      success: true,
      message: 'Text uploaded successfully',
      content: result.content,
      summary: result.summary,
    };
  }

  // Generate quiz  
  async generateQuiz(content: string, difficulty: string = 'Medium'): Promise<{
    success: boolean;
    quiz?: {
      title: string;
      questions: Array<{
        question: string;
        type: string;
        options?: string[];
        correct_answer: string;
        explanation: string;
      }>;
    };
    message?: string;
  }> {
    try {
      const response = await this.request('/api/generate_quiz', {
        method: 'POST',
        body: JSON.stringify({ 
          content, 
          difficulty: difficulty.toLowerCase(),
          num_questions: 5 
        }),
      });

      // Backend returns QuizResponse directly, need to transform it
      return {
        success: true,
        quiz: {
          title: `Quiz on ${content.substring(0, 50)}...`,
          questions: response.questions.map((q: any) => ({
            question: q.question,
            type: q.question_type || 'multiple-choice',
            options: q.options,
            correct_answer: q.correct_answer,
            explanation: q.explanation,
          }))
        }
      };
    } catch (error) {
      console.error('Quiz generation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate quiz'
      };
    }
  }

  // Generate summary
  async generateSummary(content: string): Promise<{
    success: boolean;
    summary?: string;
    message?: string;
  }> {
    try {
      const response = await this.request('/api/summary', {
        method: 'POST',
        body: JSON.stringify({ content }),
      });

      return {
        success: true,
        summary: response.summary
      };
    } catch (error) {
      console.error('Summary generation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to generate summary'
      };
    }
  }

  // Socratic tutoring
  async getSocraticResponse(
    question: string, 
    userAnswer: string, 
    attempts: number = 1
  ): Promise<{
    success: boolean;
    response?: string;
    isCorrect?: boolean;
    encouragement?: string;
    message?: string;
  }> {
    try {
      const response = await this.request('/api/socratic', {
        method: 'POST',
        body: JSON.stringify({ question, user_answer: userAnswer, attempts }),
      });

      return {
        success: true,
        response: response.response,
        isCorrect: undefined, // Backend doesn't return this yet
        encouragement: undefined // Backend doesn't return this yet
      };
    } catch (error) {
      console.error('Socratic response error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Failed to get tutor response'
      };
    }
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export types for better TypeScript support
export interface QuizQuestion {
  question: string;
  type: string;
  options?: string[];
  correct_answer: string;
  explanation: string;
}

export interface Quiz {
  title: string;
  questions: QuizQuestion[];
}

export interface UploadResponse {
  success: boolean;
  message: string;
  content?: string;
  summary?: string;
  file_path?: string;
}

export interface QuizResponse {
  success: boolean;
  quiz?: Quiz;
  message?: string;
}

export interface SummaryResponse {
  success: boolean;
  summary?: string;
  message?: string;
}

export interface SocraticResponse {
  success: boolean;
  response?: string;
  isCorrect?: boolean;
  encouragement?: string;
  message?: string;
}
