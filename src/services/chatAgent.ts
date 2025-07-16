interface ChatResponse {
  message: string;
  delay?: number;
}

class LocalChatAgent {
  private conversationHistory: Array<{user: string, assistant: string}> = [];

  private async tryFreeGPTAPI(userInput: string): Promise<string | null> {
    try {
      // Using a free GPT API that doesn't require authentication
      const response = await fetch('https://api.freegpt.one/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
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
          max_tokens: 150,
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
      console.log('FreeGPT API not available:', error);
    }
    return null;
  }

  private async tryPizzaGPTAPI(userInput: string): Promise<string | null> {
    try {
      // Using PizzaGPT - a free ChatGPT alternative
      const response = await fetch('https://api.pizzagpt.it/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userInput
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.answer) {
          return data.answer.trim();
        }
      }
    } catch (error) {
      console.log('PizzaGPT API not available:', error);
    }
    return null;
  }

  private async tryOpenAIProxyAPI(userInput: string): Promise<string | null> {
    try {
      // Using a free OpenAI proxy
      const response = await fetch('https://chatgpt-api.shn.hk/v1/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'user',
              content: userInput
            }
          ]
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.choices && data.choices[0] && data.choices[0].message) {
          return data.choices[0].message.content.trim();
        }
      }
    } catch (error) {
      console.log('OpenAI Proxy API not available:', error);
    }
    return null;
  }

  private async tryLocalLLMAPI(userInput: string): Promise<string | null> {
    try {
      // Using a free local LLM API
      const response = await fetch('https://api.naga.ac/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful voice assistant. Give concise, friendly responses in 1-2 sentences.'
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
      console.log('Local LLM API not available:', error);
    }
    return null;
  }

  private evaluateMath(expression: string): string | null {
    try {
      // Enhanced math evaluation with more patterns
      const patterns = [
        /(?:what\s+is\s+|calculate\s+|compute\s+)?(\d+(?:\.\d+)?)\s*([\+\-\*\/×÷])\s*(\d+(?:\.\d+)?)/i,
        /(\d+(?:\.\d+)?)\s*(?:plus|add)\s*(\d+(?:\.\d+)?)/i,
        /(\d+(?:\.\d+)?)\s*(?:minus|subtract)\s*(\d+(?:\.\d+)?)/i,
        /(\d+(?:\.\d+)?)\s*(?:times|multiply|multiplied\s+by)\s*(\d+(?:\.\d+)?)/i,
        /(\d+(?:\.\d+)?)\s*(?:divided\s+by|divide)\s*(\d+(?:\.\d+)?)/i
      ];
      
      for (const pattern of patterns) {
        const match = expression.match(pattern);
        if (match) {
          let num1, num2, operator;
          
          if (match.length === 4) {
            // Pattern with operator symbol
            num1 = parseFloat(match[1]);
            operator = match[2];
            num2 = parseFloat(match[3]);
          } else {
            // Word-based patterns
            num1 = parseFloat(match[1]);
            num2 = parseFloat(match[2]);
            
            if (expression.includes('plus') || expression.includes('add')) operator = '+';
            else if (expression.includes('minus') || expression.includes('subtract')) operator = '-';
            else if (expression.includes('times') || expression.includes('multiply')) operator = '*';
            else if (expression.includes('divided') || expression.includes('divide')) operator = '/';
          }
          
          let result;
          switch (operator) {
            case '+': result = num1 + num2; break;
            case '-': result = num1 - num2; break;
            case '*': case '×': result = num1 * num2; break;
            case '/': case '÷': result = num2 !== 0 ? num1 / num2 : null; break;
            default: continue;
          }
          
          if (result !== null && !isNaN(result)) {
            const operatorWord = operator === '+' ? 'plus' : 
                               operator === '-' ? 'minus' : 
                               operator === '*' || operator === '×' ? 'times' : 'divided by';
            return `${num1} ${operatorWord} ${num2} equals ${result}`;
          }
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
      const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return `It's currently ${time}.`;
    }
    
    if (lowerInput.includes('date') || lowerInput.includes('today') || lowerInput.includes('day')) {
      const date = new Date().toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
      return `Today is ${date}.`;
    }
    
    return null;
  }

  private async fetchTrivia(): Promise<string> {
    try {
      const response = await fetch('https://opentdb.com/api.php?amount=1&type=multiple&difficulty=easy');
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
    return "Here's a fun fact: Did you know that octopuses have three hearts and blue blood?";
  }

  private async fetchRandomFact(): Promise<string> {
    try {
      const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
      const data = await response.json();
      
      if (data.text) {
        return `Here's an interesting fact: ${data.text}`;
      }
    } catch (error) {
      console.error('Error fetching random fact:', error);
    }
    return "Here's a fun fact: Bananas are berries, but strawberries aren't!";
  }

  private decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  private getIntelligentFallback(userInput: string): string {
    const lowerInput = userInput.toLowerCase();
    
    // Greeting responses
    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      const greetings = [
        "Hello! I'm your voice assistant. How can I help you today?",
        "Hi there! What would you like to talk about?",
        "Hey! I'm here and ready to chat. What's on your mind?"
      ];
      return greetings[Math.floor(Math.random() * greetings.length)];
    }
    
    // Name/identity questions
    if (lowerInput.includes('name') || lowerInput.includes('who are you')) {
      return "I'm your AI voice assistant! I'm here to help answer questions and have conversations with you.";
    }
    
    // Voice recognition questions
    if (lowerInput.includes('voice') || lowerInput.includes('recognize') || lowerInput.includes('remember')) {
      return "I can hear and understand your voice, but I don't store personal information between conversations. Each chat is fresh!";
    }
    
    // Capability questions
    if (lowerInput.includes('can you') || lowerInput.includes('what can') || lowerInput.includes('help')) {
      return "I can help with math calculations, tell you the time and date, share trivia and facts, and have conversations about various topics!";
    }
    
    // Questions (contain question words)
    if (lowerInput.includes('what') || lowerInput.includes('how') || lowerInput.includes('why') || 
        lowerInput.includes('when') || lowerInput.includes('where') || lowerInput.includes('?')) {
      return `That's a great question about "${userInput}". While I don't have specific information about that right now, I'd be happy to help you explore related topics or answer other questions!`;
    }
    
    // Default conversational response
    return `I hear you talking about "${userInput}". That's interesting! What would you like to know more about?`;
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

    // Random facts
    if (userInput.toLowerCase().includes('fact') || userInput.toLowerCase().includes('interesting')) {
      const factResponse = await this.fetchRandomFact();
      console.log(`📚 Fact response: ${factResponse}`);
      return { message: factResponse };
    }

    // Try AI APIs for dynamic responses
    console.log('🤖 Trying AI APIs for dynamic response...');
    
    let aiResponse = await this.tryFreeGPTAPI(userInput);
    if (!aiResponse) {
      aiResponse = await this.tryPizzaGPTAPI(userInput);
    }
    if (!aiResponse) {
      aiResponse = await this.tryOpenAIProxyAPI(userInput);
    }
    if (!aiResponse) {
      aiResponse = await this.tryLocalLLMAPI(userInput);
    }

    if (aiResponse && aiResponse.length > 5) {
      console.log(`🎯 AI response: ${aiResponse}`);
      // Store in conversation history
      this.conversationHistory.push({
        user: userInput,
        assistant: aiResponse
      });
      return { message: aiResponse };
    }

    // Intelligent fallback responses
    console.log('📝 Using intelligent fallback response');
    const fallbackResponse = this.getIntelligentFallback(userInput);
    return { message: fallbackResponse };
  }
}

export const chatAgent = new LocalChatAgent();