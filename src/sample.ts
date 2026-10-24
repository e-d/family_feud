import type { Game } from './types'

export function sampleGame(): Game {
  return {
    id: crypto.randomUUID(),
    title: 'Sample game night',
    createdAt: Date.now(),
    questions: [
      {
        prompt: 'Name something people bring to the beach',
        answers: [
          { text: 'Towel', points: 38 },
          { text: 'Sunscreen', points: 24 },
          { text: 'Umbrella', points: 14 },
          { text: 'Cooler', points: 9 },
          { text: 'Chair', points: 7 },
          { text: 'Book', points: 5 },
        ],
      },
      {
        prompt: 'Name a reason you might be late for work',
        answers: [
          { text: 'Traffic', points: 41 },
          { text: 'Overslept', points: 29 },
          { text: 'Car trouble', points: 12 },
          { text: 'Kids', points: 8 },
          { text: 'Weather', points: 6 },
        ],
      },
      {
        prompt: 'Name something you find in a junk drawer',
        answers: [
          { text: 'Batteries', points: 27 },
          { text: 'Rubber bands', points: 19 },
          { text: 'Pens', points: 16 },
          { text: 'Tape', points: 11 },
          { text: 'Keys', points: 9 },
          { text: 'Scissors', points: 7 },
          { text: 'Takeout menus', points: 5 },
          { text: 'Twist ties', points: 3 },
        ],
      },
      {
        prompt: 'Name a pizza topping',
        answers: [
          { text: 'Pepperoni', points: 48 },
          { text: 'Mushrooms', points: 17 },
          { text: 'Sausage', points: 13 },
          { text: 'Pineapple', points: 8 },
        ],
      },
    ],
  }
}
