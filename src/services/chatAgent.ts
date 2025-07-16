interface ChatResponse {
  message: string;
  delay?: number;
}

class LocalChatAgent {
  private responses: Record<string, string[]> = {
    greeting: [
      "Hello! How can I help you?",
      "Hi there! What's up?",
      "Hey! What can I do for you?"
    ],
    weather: [
      "I can't check weather, but I hope it's nice!",
      "No weather access, sorry!",
      "Try a weather app for that info."
    ],
    time: [
      `It's ${new Date().toLocaleTimeString()}.`,
      `The time is ${new Date().toLocaleTimeString()}.`
    ],
    date: [
      `Today is ${new Date().toLocaleDateString()}.`,
      `It's ${new Date().toLocaleDateString()}.`
    ],
    help: [
      "I can chat about time, date, or anything else!",
      "Just talk to me about whatever you want!",
      "Ask me questions or just have a chat!"
    ],
    goodbye: [
      "Goodbye! Take care!",
      "See you later!",
      "Bye! Have a great day!"
    ],
    compliment: [
      "Thank you! You're kind.",
      "That's nice of you to say!",
      "Thanks! You're great too."
    ],
    joke: [
      "Why don't scientists trust atoms? They make up everything!",
      "I told my wife her eyebrows were too high. She looked surprised.",
      "Why did the scarecrow win? He was outstanding in his field!"
    ],
    default: [
      "That's interesting! Tell me more.",
      "I see. What else?",
      "Good point! Continue.",
      "Interesting. Go on.",
      "Tell me more about that.",
      "That's cool! What else?"
    ]
  };

  private getRandomResponse(category: string): string {
    const responses = this.responses[category] || this.responses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  private categorizeInput(input: string): string {
    const lowerInput = input.toLowerCase();

    if (lowerInput.includes('hello') || lowerInput.includes('hi') || lowerInput.includes('hey')) {
      return 'greeting';
    }
    if (lowerInput.includes('weather') || lowerInput.includes('temperature')) {
      return 'weather';
    }
    if (lowerInput.includes('time') || lowerInput.includes('clock')) {
      return 'time';
    }
    if (lowerInput.includes('date') || lowerInput.includes('today')) {
      return 'date';
    }
    if (lowerInput.includes('help') || lowerInput.includes('what can you')) {
      return 'help';
    }
    if (lowerInput.includes('bye') || lowerInput.includes('goodbye')) {
      return 'goodbye';
    }
    if (lowerInput.includes('thank') || lowerInput.includes('great') || lowerInput.includes('good')) {
      return 'compliment';
    }
    if (lowerInput.includes('joke') || lowerInput.includes('funny')) {
      return 'joke';
    }

    return 'default';
  }

  async generateResponse(userInput: string): Promise<ChatResponse> {
    // Much faster response - no artificial delay
    const category = this.categorizeInput(userInput);
    const message = this.getRandomResponse(category);

    return {
      message,
      delay: 0
    };
  }
}

export const chatAgent = new LocalChatAgent();