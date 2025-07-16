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
      "I can tell you the time and date, share jokes, have conversations, and answer basic questions! Just speak naturally.",
      "Feel free to ask me about the time, date, request a joke, or just chat about anything on your mind!",
      "I'm here to help! I can tell time, share jokes, and have friendly conversations. What interests you?"
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
      "I can tell you the current time and date, share jokes, and have natural conversations with you!",
      "I'm great at chatting, telling time, sharing jokes, and answering questions! I work entirely in your browser.",
      "I can help with basic information like time and date, plus I love having conversations and telling jokes!"
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

  private getRandomResponse(category: string): string {
    const responses = this.responses[category] || this.responses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private categorizeInput(input: string): string {
    const lowerInput = input.toLowerCase();

    // Greetings
    if (lowerInput.match(/\b(hello|hi|hey|good morning|good afternoon|good evening|greetings)\b/)) {
      return 'greeting';
    }
    
    // How are you
    if (lowerInput.match(/\b(how are you|how're you|how do you feel|how's it going)\b/)) {
      return 'how_are_you';
    }
    
    // Weather
    if (lowerInput.match(/\b(weather|temperature|rain|sunny|cloudy|forecast|hot|cold|warm)\b/)) {
      return 'weather';
    }
    
    // Time
    if (lowerInput.match(/\b(time|clock|hour|minute|what time)\b/)) {
      return 'time';
    }
    
    // Date
    if (lowerInput.match(/\b(date|today|day|month|year|what day)\b/)) {
      return 'date';
    }
    
    // Help
    if (lowerInput.match(/\b(help|what can you|capabilities|what do you|can you do)\b/)) {
      return 'help';
    }
    
    // Goodbye
    if (lowerInput.match(/\b(bye|goodbye|see you|farewell|talk later|later|peace)\b/)) {
      return 'goodbye';
    }
    
    // Compliments/Thanks
    if (lowerInput.match(/\b(thank|thanks|great|good|awesome|amazing|nice|cool|wonderful|fantastic)\b/)) {
      return 'compliment';
    }
    
    // Jokes
    if (lowerInput.match(/\b(joke|funny|laugh|humor|amusing|tell me a joke|make me laugh)\b/)) {
      return 'joke';
    }
    
    // Name/Identity
    if (lowerInput.match(/\b(name|who are you|what are you|your name)\b/)) {
      return 'name';
    }
    
    // Capabilities
    if (lowerInput.match(/\b(can you|able to|do you know|what can)\b/)) {
      return 'capabilities';
    }

    return 'default';
  }

  async generateResponse(userInput: string): Promise<ChatResponse> {
    // Simulate a brief processing delay for more natural feel
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const category = this.categorizeInput(userInput);
    const message = this.getRandomResponse(category);

    console.log(`🤖 Response category: ${category}, Message: ${message}`);

    return {
      message,
      delay: 0
    };
  }
}

export const chatAgent = new LocalChatAgent();