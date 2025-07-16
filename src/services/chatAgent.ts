interface ChatResponse {
  message: string;
  delay?: number;
}

class LocalChatAgent {
  private responses: Record<string, string[]> = {
    greeting: [
      "Hello! How can I help you today?",
      "Hi there! What's on your mind?",
      "Hey! Great to chat with you!"
    ],
    weather: [
      "I can't check the weather right now, but I hope it's beautiful outside!",
      "Sorry, I don't have weather access. Try checking your weather app!",
      "I wish I could tell you about the weather, but that's beyond my current abilities."
    ],
    time: [
      `It's currently ${new Date().toLocaleTimeString()}.`,
      `The time right now is ${new Date().toLocaleTimeString()}.`,
      `According to my clock, it's ${new Date().toLocaleTimeString()}.`
    ],
    date: [
      `Today is ${new Date().toLocaleDateString()}.`,
      `It's ${new Date().toLocaleDateString()} today.`,
      `The date today is ${new Date().toLocaleDateString()}.`
    ],
    help: [
      "I can chat about time, date, tell jokes, or just have a conversation with you!",
      "Feel free to ask me about the time, date, or just talk about anything!",
      "I'm here to chat! Ask me questions or tell me what's on your mind."
    ],
    goodbye: [
      "Goodbye! It was great talking with you!",
      "See you later! Have an amazing day!",
      "Bye! Thanks for the chat!"
    ],
    compliment: [
      "Thank you so much! You're very kind.",
      "That's really nice of you to say!",
      "Thanks! You're pretty awesome yourself."
    ],
    joke: [
      "Why don't scientists trust atoms? Because they make up everything!",
      "I told my wife she was drawing her eyebrows too high. She looked surprised!",
      "Why did the scarecrow win an award? He was outstanding in his field!",
      "What do you call a fake noodle? An impasta!",
      "Why don't eggs tell jokes? They'd crack each other up!"
    ],
    name: [
      "I'm your voice assistant! You can just call me Assistant.",
      "I'm a voice chat assistant created to help and chat with you!",
      "I'm your friendly AI voice assistant!"
    ],
    capabilities: [
      "I can tell you the time and date, share jokes, and have conversations with you!",
      "I'm great at chatting, telling the time, sharing jokes, and answering questions!",
      "I can help with basic information like time and date, plus I love to chat!"
    ],
    default: [
      "That's really interesting! Tell me more about that.",
      "I see! What else would you like to talk about?",
      "That's a good point! Continue.",
      "Interesting! What's your take on that?",
      "Tell me more about what you're thinking.",
      "That sounds fascinating! Go on.",
      "I'd love to hear more about that!"
    ]
  };

  private getRandomResponse(category: string): string {
    const responses = this.responses[category] || this.responses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private categorizeInput(input: string): string {
    const lowerInput = input.toLowerCase();

    // Greetings
    if (lowerInput.match(/\b(hello|hi|hey|good morning|good afternoon|good evening)\b/)) {
      return 'greeting';
    }
    
    // Weather
    if (lowerInput.match(/\b(weather|temperature|rain|sunny|cloudy|forecast)\b/)) {
      return 'weather';
    }
    
    // Time
    if (lowerInput.match(/\b(time|clock|hour|minute)\b/)) {
      return 'time';
    }
    
    // Date
    if (lowerInput.match(/\b(date|today|day|month|year)\b/)) {
      return 'date';
    }
    
    // Help
    if (lowerInput.match(/\b(help|what can you|capabilities|what do you)\b/)) {
      return 'help';
    }
    
    // Goodbye
    if (lowerInput.match(/\b(bye|goodbye|see you|farewell|talk later)\b/)) {
      return 'goodbye';
    }
    
    // Compliments/Thanks
    if (lowerInput.match(/\b(thank|thanks|great|good|awesome|amazing|nice|cool)\b/)) {
      return 'compliment';
    }
    
    // Jokes
    if (lowerInput.match(/\b(joke|funny|laugh|humor|amusing)\b/)) {
      return 'joke';
    }
    
    // Name/Identity
    if (lowerInput.match(/\b(name|who are you|what are you)\b/)) {
      return 'name';
    }
    
    // Capabilities
    if (lowerInput.match(/\b(can you|able to|do you know)\b/)) {
      return 'capabilities';
    }

    return 'default';
  }

  async generateResponse(userInput: string): Promise<ChatResponse> {
    // Simulate a brief processing delay for more natural feel
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const category = this.categorizeInput(userInput);
    const message = this.getRandomResponse(category);

    return {
      message,
      delay: 0
    };
  }
}

export const chatAgent = new LocalChatAgent();