interface ChatResponse {
  message: string;
  delay?: number;
}

class LocalChatAgent {
  private fallbackResponses: Record<string, string[]> = {
    greeting: [
      "Hello! I'm your voice assistant. How can I help you today?",
      "Hi there! Great to hear from you. What's on your mind?",
      "Hey! I'm here and ready to chat. What would you like to talk about?"
    ],
    time: [
      `It's currently ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      `The time right now is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    ],
    date: [
      `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
      `It's ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} today.`
    ],
    default: [
      "That's an interesting question! Let me think about that.",
      "I understand what you're asking. Let me help you with that.",
      "Good question! Here's what I think about that."
    ]
  };

  private async tryHuggingFaceAPI(userInput: string): Promise<string | null> {
    try {
      // Using Hugging Face's free inference API with a conversational model
      const response = await fetch('https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: userInput,
          parameters: {
            max_length: 100,
            temperature: 0.7,
            do_sample: true
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data && data[0] && data[0].generated_text) {
          let generatedText = data[0].generated_text;
          // Clean up the response - remove the input text if it's repeated
          if (generatedText.includes(userInput)) {
            generatedText = generatedText.replace(userInput, '').trim();
          }
          if (generatedText.length > 5) {
            return generatedText;
          }
        }
      }
    } catch (error) {
      console.log('Hugging Face API not available:', error);
    }
    return null;
  }

  private async tryOpenAICompatibleAPI(userInput: string): Promise<string | null> {
    try {
      // Try a free OpenAI-compatible API
      const response = await fetch('https://api.deepinfra.com/v1/openai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'meta-llama/Llama-2-7b-chat-hf',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful voice assistant. Give concise, friendly responses in 1-2 sentences. Be conversational and natural.'
            },
            {
              role: 'user',
              content: userInput
            }
          ],
          max_tokens: 100,
          temperature: 0.7
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content.trim();
        }
      }
    } catch (error) {
      console.log('DeepInfra API not available:', error);
    }
    return null;
  }

  private async tryCohereFreeAPI(userInput: string): Promise<string | null> {
    try {
      // Try Cohere's free tier (no key needed for basic usage)
      const response = await fetch('https://api.cohere.ai/v1/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'command-light',
          prompt: `Human: ${userInput}\nAssistant: `,
          max_tokens: 100,
          temperature: 0.7,
          stop_sequences: ['Human:', 'Assistant:']
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.generations && data.generations[0]) {
          return data.generations[0].text.trim();
        }
      }
    } catch (error) {
      console.log('Cohere API not available:', error);
    }
    return null;
  }

  private evaluateMath(expression: string): string | null {
    try {
      // Enhanced math evaluation
      const mathPattern = /(?:what\s+is\s+|calculate\s+|compute\s+)?(\d+(?:\.\d+)?)\s*([\+\-\*\/])\s*(\d+(?:\.\d+)?)/i;
      const match = expression.match(mathPattern);
      
      if (match) {
        const num1 = parseFloat(match[1]);
        const operator = match[2];
        const num2 = parseFloat(match[3]);
        
        let result;
        switch (operator) {
          case '+': result = num1 + num2; break;
          case '-': result = num1 - num2; break;
          case '*': result = num1 * num2; break;
          case '/': result = num2 !== 0 ? num1 / num2 : null; break;
          default: return null;
        }
        
        if (result !== null && !isNaN(result)) {
          return `${num1} ${operator} ${num2} equals ${result}`;
        }
      }
    } catch (error) {
      console.log('Math evaluation error:', error);
    }
    return null;
  }

  private async getTimeOrDate(input: string): Promise<string | null> {
    const lowerInput = input.toLowerCase();
    
    if (lowerInput.includes('time')) {
      return `It's currently ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`;
    }
    
    if (lowerInput.includes('date') || lowerInput.includes('today') || lowerInput.includes('day')) {
      return `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`;
    }
    
    return null;
  }

  private async fetchTrivia(): Promise<string> {
    try {
      const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple');
      const data = await response.json();
      
      if (data.results && data.results.length > 0) {
        const question = data.results[0];
        const decodedQuestion = this.decodeHtml(question.question);
        const decodedAnswer = this.decodeHtml(question.correct_answer);
        return `Here's a trivia question: ${decodedQuestion} The answer is: ${decodedAnswer}`;
      }
    } catch (error) {
      console.error('Error fetching trivia:', error);
    }
    return "Here's a fun fact: Did you know that honey never spoils? Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old!";
  }

  private decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  private getRandomResponse(category: string): string {
    const responses = this.fallbackResponses[category] || this.fallbackResponses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  async generateResponse(userInput: string): Promise<ChatResponse> {
    console.log(`🎯 Processing: "${userInput}"`);
    
    // Quick local responses for time/date
    const timeOrDate = await this.getTimeOrDate(userInput);
    if (timeOrDate) {
      console.log(`⏰ Time/Date response: ${timeOrDate}`);
      return { message: timeOrDate };
    }

    // Math calculations
    const mathResult = this.evaluateMath(userInput);
    if (mathResult) {
      console.log(`🔢 Math response: ${mathResult}`);
      return { message: mathResult };
    }

    // Trivia requests
    if (userInput.toLowerCase().includes('trivia') || userInput.toLowerCase().includes('question')) {
      const triviaResponse = await this.fetchTrivia();
      console.log(`🧠 Trivia response: ${triviaResponse}`);
      return { message: triviaResponse };
    }

    // Try AI APIs for dynamic responses
    console.log('🤖 Trying AI APIs for dynamic response...');
    
    let aiResponse = await this.tryHuggingFaceAPI(userInput);
    if (!aiResponse) {
      aiResponse = await this.tryOpenAICompatibleAPI(userInput);
    }
    if (!aiResponse) {
      aiResponse = await this.tryCohereFreeAPI(userInput);
    }

    if (aiResponse && aiResponse.length > 5) {
      console.log(`🎯 AI response: ${aiResponse}`);
      return { message: aiResponse };
    }

    // Fallback to contextual responses
    console.log('📝 Using fallback response');
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return { message: this.getRandomResponse('greeting') };
    }
    
    // Enhanced fallback that tries to be more contextual
    if (lowerInput.includes('?')) {
      return { message: `That's a great question about "${userInput}". While I don't have specific information about that right now, I'd love to help you explore it further. What specifically interests you about this topic?` };
    }
    
    return { message: `I hear you talking about "${userInput}". That sounds interesting! Can you tell me more about what you'd like to know or discuss about this?` };
  }
}

export const chatAgent = new LocalChatAgent();