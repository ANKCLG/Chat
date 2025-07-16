interface ChatResponse {
  message: string;
  delay?: number;
}

class LocalChatAgent {
  private responses: Record<string, string[]> = {
    greeting: [
      "Hello! I'm your voice assistant. How can I help you today?",
      "Hi there! Great to hear from you. What's on your mind?",
      "Hey! I'm here and ready to chat. What would you like to talk about?"
    ],
    weather: [
      "I can't check the weather right now, but I hope it's beautiful outside! You might want to check your weather app.",
      "Sorry, I don't have access to weather data. Try asking your phone or checking a weather website!",
      "I wish I could tell you about the weather, but that's beyond my current abilities. Hope it's nice out there!"
    ],
    time: [
      `It's currently ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      `The time right now is ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`,
      `According to my clock, it's ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.`
    ],
    date: [
      `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.`,
      `It's ${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} today.`,
      `The date today is ${new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}.`
    ],
    help: [
      "I can tell you the time and date, share jokes, answer trivia questions, do math, and have conversations! Just speak naturally.",
      "Feel free to ask me about the time, date, request a joke, ask trivia questions, or just chat about anything on your mind!",
      "I'm here to help! I can tell time, share jokes, answer questions, and have friendly conversations. What interests you?"
    ],
    goodbye: [
      "Goodbye! It was wonderful talking with you today!",
      "See you later! Thanks for the great conversation!",
      "Bye! Have an amazing rest of your day!"
    ],
    compliment: [
      "Thank you so much! You're very kind to say that.",
      "That's really nice of you! I appreciate the kind words.",
      "Thanks! You're pretty awesome yourself. I enjoy our chat!"
    ],
    joke: [
      "Why don't scientists trust atoms? Because they make up everything!",
      "I told my wife she was drawing her eyebrows too high. She looked surprised!",
      "Why did the scarecrow win an award? He was outstanding in his field!",
      "What do you call a fake noodle? An impasta!",
      "Why don't eggs tell jokes? They'd crack each other up!",
      "What do you call a bear with no teeth? A gummy bear!",
      "Why did the math book look so sad? Because it was full of problems!"
    ],
    name: [
      "I'm your friendly voice assistant! You can just call me Assistant.",
      "I'm a voice chat assistant created to help and chat with you! No special name needed.",
      "I'm your AI voice companion! Just think of me as your helpful assistant."
    ],
    capabilities: [
      "I can tell you the current time and date, share jokes, answer trivia questions, do math calculations, and have natural conversations with you!",
      "I'm great at chatting, telling time, sharing jokes, answering questions, and doing basic math! I work entirely in your browser.",
      "I can help with basic information like time and date, plus I love having conversations, telling jokes, and answering trivia!"
    ],
    how_are_you: [
      "I'm doing great, thank you for asking! How are you doing today?",
      "I'm wonderful! It's always nice to chat with someone. How about you?",
      "I'm doing fantastic! Thanks for asking. What's new with you?"
    ],
    default: [
      "That's really interesting! Tell me more about that.",
      "I see! What else would you like to talk about?",
      "That's a good point! Please continue.",
      "Interesting! What's your take on that?",
      "Tell me more about what you're thinking.",
      "That sounds fascinating! Go on.",
      "I'd love to hear more about that topic!",
      "That's quite thoughtful. What made you think of that?"
    ]
  };

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
    return "Here's a fun fact: Did you know that honey never spoils? Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still perfectly edible!";
  }

  private async fetchRandomFact(): Promise<string> {
    try {
      const response = await fetch('https://uselessfacts.jsph.pl/random.json?language=en');
      const data = await response.json();
      
      if (data.text) {
        return `Here's an interesting fact: ${data.text}`;
      }
    } catch (error) {
      console.error('Error fetching fact:', error);
    }
    return "Here's a fun fact: Octopuses have three hearts and blue blood!";
  }

  private decodeHtml(html: string): string {
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  private evaluateMath(expression: string): string | null {
    try {
      // Simple math evaluation - only allow basic operations
      const sanitized = expression.replace(/[^0-9+\-*/().\s]/g, '');
      if (sanitized !== expression) return null;
      
      const result = Function('"use strict"; return (' + sanitized + ')')();
      if (typeof result === 'number' && !isNaN(result)) {
        return result.toString();
      }
    } catch (error) {
      // Ignore math errors
    }
    return null;
  }

  private getRandomResponse(category: string): string {
    const responses = this.responses[category] || this.responses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private async categorizeAndRespond(input: string): Promise<string> {
    const lowerInput = input.toLowerCase();

    // Math calculations
    if (lowerInput.match(/\b(calculate|math|plus|minus|times|divided|equals|\+|\-|\*|\/|\d+\s*[\+\-\*\/]\s*\d+)\b/)) {
      const mathResult = this.evaluateMath(input);
      if (mathResult) {
        return `The answer is ${mathResult}.`;
      }
      return "I can help with basic math! Try asking me something like 'what is 15 plus 27' or '100 divided by 4'.";
    }

    // Trivia questions
    if (lowerInput.match(/\b(trivia|question|quiz|fact|interesting|random fact|tell me something)\b/)) {
      if (lowerInput.includes('fact')) {
        return await this.fetchRandomFact();
      }
      return await this.fetchTrivia();
    }

    // Greetings
    if (lowerInput.match(/\b(hello|hi|hey|good morning|good afternoon|good evening|greetings)\b/)) {
      return this.getRandomResponse('greeting');
    }
    
    // How are you
    if (lowerInput.match(/\b(how are you|how're you|how do you feel|how's it going)\b/)) {
      return this.getRandomResponse('how_are_you');
    }
    
    // Weather
    if (lowerInput.match(/\b(weather|temperature|rain|sunny|cloudy|forecast|hot|cold|warm)\b/)) {
      return this.getRandomResponse('weather');
    }
    
    // Time
    if (lowerInput.match(/\b(time|clock|hour|minute|what time)\b/)) {
      return this.getRandomResponse('time');
    }
    
    // Date
    if (lowerInput.match(/\b(date|today|day|month|year|what day)\b/)) {
      return this.getRandomResponse('date');
    }
    
    // Help
    if (lowerInput.match(/\b(help|what can you|capabilities|what do you|can you do)\b/)) {
      return this.getRandomResponse('help');
    }
    
    // Goodbye
    if (lowerInput.match(/\b(bye|goodbye|see you|farewell|talk later|later|peace)\b/)) {
      return this.getRandomResponse('goodbye');
    }
    
    // Compliments/Thanks
    if (lowerInput.match(/\b(thank|thanks|great|good|awesome|amazing|nice|cool|wonderful|fantastic)\b/)) {
      return this.getRandomResponse('compliment');
    }
    
    // Jokes
    if (lowerInput.match(/\b(joke|funny|laugh|humor|amusing|tell me a joke|make me laugh)\b/)) {
      return this.getRandomResponse('joke');
    }
    
    // Name/Identity
    if (lowerInput.match(/\b(name|who are you|what are you|your name)\b/)) {
      return this.getRandomResponse('name');
    }
    
    // Capabilities
    if (lowerInput.match(/\b(can you|able to|do you know|what can)\b/)) {
      return this.getRandomResponse('capabilities');
    }

    return this.getRandomResponse('default');
  }

  async generateResponse(userInput: string): Promise<ChatResponse> {
    // Simulate a brief processing delay for more natural feel
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const message = await this.categorizeAndRespond(userInput);

    console.log(`🤖 Response: ${message}`);

    return {
      message,
      delay: 0
    };
  }
}

export const chatAgent = new LocalChatAgent();