import type { Answer, Question } from './types'
import type { ThemeId } from './themes'

export type PackCategory =
  | 'Food & Drink'
  | 'Home & Family'
  | 'Work & School'
  | 'Sports & Outdoors'
  | 'Travel'
  | 'Entertainment'
  | 'Kids'
  | 'Animals'
  | 'Grown-Ups'
  | 'Holidays'

export interface Pack {
  /** Stable id, so the library can tell a pack has already been added. */
  id: string
  title: string
  category: PackCategory
  blurb: string
  /** Theme to switch to when this game is played. */
  theme?: ThemeId
  questions: Question[]
}

// Points are written as if 100 people were surveyed: answers are listed
// highest first and each question totals under 100.
const q = (prompt: string, ...answers: [string, number][]): Question => ({
  prompt,
  answers: answers.map(([text, points]): Answer => ({ text, points })),
})

export const PACKS: Pack[] = [
  {
    id: 'kitchen-table',
    title: 'Kitchen Table',
    category: 'Food & Drink',
    blurb: 'Snacks, dinners and everything on the menu.',
    questions: [
      q('Name a food people put ketchup on', ['French fries', 42], ['Burgers', 24], ['Hot dogs', 12], ['Eggs', 7], ['Meatloaf', 5], ['Hash browns', 3]),
      q('Name something you order at a pizza place besides pizza', ['Wings', 34], ['Breadsticks', 22], ['Salad', 14], ['Soda', 11], ['Garlic knots', 7], ['Calzone', 5]),
      q('Name a food that’s messy to eat', ['Spaghetti', 29], ['Ribs', 23], ['Tacos', 17], ['Sloppy joes', 11], ['Wings', 8], ['Corn on the cob', 5]),
      q('Name something people drink in the morning', ['Coffee', 61], ['Orange juice', 15], ['Tea', 10], ['Water', 6], ['Milk', 4]),
      q('Name a topping you put on ice cream', ['Hot fudge', 30], ['Sprinkles', 24], ['Whipped cream', 15], ['Nuts', 10], ['Cherry', 8], ['Caramel', 6]),
      q('Name a food you’d find at a summer barbecue', ['Hamburgers', 38], ['Hot dogs', 26], ['Corn on the cob', 10], ['Potato salad', 9], ['Ribs', 6], ['Watermelon', 5]),
    ],
  },
  {
    id: 'home-sweet-home',
    title: 'Home Sweet Home',
    category: 'Home & Family',
    blurb: 'Chores, couch cushions and family squabbles.',
    questions: [
      q('Name a chore kids try to get out of', ['Dishes', 31], ['Cleaning their room', 27], ['Taking out the trash', 18], ['Laundry', 10], ['Vacuuming', 6], ['Mowing the lawn', 4]),
      q('Name something you might find under a couch cushion', ['Loose change', 40], ['TV remote', 22], ['Crumbs', 15], ['Toys', 7], ['Pens', 5], ['Phone', 4]),
      q('Name a reason a family is late leaving the house', ['Can’t find keys', 30], ['Kids not ready', 26], ['Bathroom line', 13], ['Getting dressed', 11], ['Forgot something', 9], ['Lost shoes', 5]),
      q('Name something families fight over', ['TV remote', 33], ['Bathroom', 21], ['Money', 15], ['Chores', 12], ['Front seat', 9], ['Last slice', 5]),
      q('Name something people keep in the garage besides a car', ['Tools', 34], ['Bikes', 19], ['Lawn mower', 15], ['Boxes', 12], ['Holiday decorations', 8], ['Extra freezer', 4]),
      q('Name something Grandma always has in her purse', ['Tissues', 28], ['Candy', 25], ['Lipstick', 13], ['Gum', 10], ['Cash', 9], ['Hand lotion', 6]),
    ],
  },
  {
    id: 'clocking-in',
    title: 'Clocking In',
    category: 'Work & School',
    blurb: 'Bosses, homework and the mid-afternoon slump.',
    questions: [
      q('Name something you bring to a job interview', ['Résumé', 51], ['Pen', 14], ['References', 11], ['Portfolio', 8], ['A smile', 6], ['ID', 3]),
      q('Name an excuse for not turning in homework', ['The dog ate it', 43], ['Forgot it', 25], ['Left it at home', 12], ['Was sick', 8], ['Computer broke', 6]),
      q('Name something people do on a work break', ['Eat', 30], ['Smoke', 18], ['Check their phone', 17], ['Get coffee', 14], ['Go outside', 8], ['Bathroom', 5]),
      q('Name something you’d find in a teacher’s desk', ['Red pens', 34], ['Papers', 18], ['Stapler', 13], ['Candy', 11], ['Tissues', 8], ['An apple', 6]),
      q('Name a reason someone quits their job', ['Bad boss', 32], ['Low pay', 29], ['Better offer', 14], ['Stress', 9], ['Moving', 6], ['Long hours', 4]),
      q('Name something students pack in a backpack', ['Books', 34], ['Pencils', 19], ['Notebook', 15], ['Lunch', 13], ['Laptop', 9], ['Calculator', 4]),
    ],
  },
  {
    id: 'great-outdoors',
    title: 'Great Outdoors',
    category: 'Sports & Outdoors',
    blurb: 'Campfires, ballgames and rain delays.',
    questions: [
      q('Name something you take on a camping trip', ['Tent', 40], ['Sleeping bag', 21], ['Flashlight', 13], ['Food', 10], ['Bug spray', 6], ['Matches', 4]),
      q('Name a sport played with a ball', ['Basketball', 27], ['Football', 24], ['Baseball', 19], ['Soccer', 15], ['Tennis', 6], ['Golf', 4]),
      q('Name something you’d see at a baseball game', ['Hot dogs', 30], ['Players', 18], ['Fans', 14], ['Peanuts', 11], ['Umpire', 9], ['Mascot', 6]),
      q('Name a reason a game gets canceled', ['Rain', 58], ['Lightning', 16], ['Snow', 11], ['Injury', 5], ['Not enough players', 4]),
      q('Name something people do at the beach', ['Swim', 39], ['Tan', 26], ['Build sandcastles', 12], ['Surf', 8], ['Read', 6], ['Play volleyball', 4]),
      q('Name something a hockey goalie wears', ['Gloves', 41], ['Mask', 23], ['Pads', 18], ['Helmet', 8], ['Skates', 5]),
    ],
  },
  {
    id: 'road-trip',
    title: 'Road Trip',
    category: 'Travel',
    blurb: 'Packing lists, long flights and “are we there yet?”',
    questions: [
      q('Name something people bring to the beach', ['Towel', 38], ['Sunscreen', 24], ['Umbrella', 14], ['Cooler', 9], ['Chair', 7], ['Book', 5]),
      q('Name something people forget to pack for vacation', ['Toothbrush', 33], ['Phone charger', 22], ['Underwear', 13], ['Socks', 10], ['Sunscreen', 8], ['Medicine', 6]),
      q('Name something kids ask on a long car ride', ['Are we there yet?', 62], ['I’m hungry', 14], ['I have to pee', 11], ['How much longer?', 6], ['Can we stop?', 3]),
      q('Name something people do on a long flight', ['Sleep', 45], ['Watch movies', 22], ['Read', 13], ['Eat', 7], ['Listen to music', 6], ['Work', 3]),
      q('Name a popular honeymoon destination', ['Hawaii', 34], ['Paris', 17], ['Mexico', 14], ['Caribbean', 13], ['Las Vegas', 8], ['Italy', 5]),
      q('Name something you buy at a gas station besides gas', ['Snacks', 33], ['Drinks', 26], ['Lottery tickets', 13], ['Cigarettes', 11], ['Coffee', 8], ['Ice', 4]),
    ],
  },
  {
    id: 'couch-potato',
    title: 'Couch Potato',
    category: 'Entertainment',
    blurb: 'Movie nights, board games and the big top.',
    questions: [
      q('Name something people do during TV commercials', ['Get a snack', 41], ['Go to the bathroom', 25], ['Change the channel', 13], ['Check their phone', 10], ['Fast-forward', 5]),
      q('Name a snack people eat at the movies', ['Popcorn', 68], ['Candy', 15], ['Nachos', 7], ['Hot dogs', 4], ['Pretzels', 3]),
      q('Name a kind of movie people watch on a date', ['Romance', 37], ['Comedy', 26], ['Horror', 18], ['Action', 9], ['Drama', 5]),
      q('Name a musical instrument kids learn to play', ['Piano', 39], ['Guitar', 22], ['Recorder', 14], ['Drums', 9], ['Violin', 8], ['Flute', 4]),
      q('Name a board game families play', ['Monopoly', 41], ['Scrabble', 14], ['Clue', 12], ['Sorry!', 10], ['Candy Land', 8], ['The Game of Life', 6]),
      q('Name something you’d see at a circus', ['Clowns', 38], ['Elephants', 19], ['Acrobats', 15], ['Lions', 10], ['Tightrope walker', 7], ['Ringmaster', 5]),
    ],
  },
  {
    id: 'kids-table',
    title: 'Kids’ Table',
    category: 'Kids',
    blurb: 'Easy questions little ones can answer too.',
    questions: [
      q('Name an animal that lives on a farm', ['Cow', 34], ['Pig', 21], ['Horse', 15], ['Chicken', 14], ['Sheep', 8], ['Goat', 4]),
      q('Name something that’s red', ['Apple', 27], ['Fire truck', 20], ['Stop sign', 15], ['Strawberry', 12], ['Rose', 10], ['Tomato', 8]),
      q('Name a fruit that’s yellow', ['Banana', 63], ['Lemon', 21], ['Pineapple', 7], ['Mango', 4], ['Grapefruit', 2]),
      q('Name something you see at a playground', ['Slide', 35], ['Swings', 31], ['Monkey bars', 13], ['Sandbox', 9], ['Seesaw', 6], ['Merry-go-round', 3]),
      q('Name something you do before bed', ['Brush teeth', 45], ['Read a story', 18], ['Put on pajamas', 13], ['Take a bath', 10], ['Say prayers', 6], ['Go potty', 4]),
      q('Name a superhero power', ['Flying', 46], ['Invisibility', 17], ['Super strength', 14], ['Super speed', 9], ['Reading minds', 6], ['Laser eyes', 3]),
    ],
  },
  {
    id: 'animal-kingdom',
    title: 'Animal Kingdom',
    category: 'Animals',
    blurb: 'Pets, zoo favorites and creepy crawlies.',
    questions: [
      q('Name a pet that lives in a cage', ['Bird', 31], ['Hamster', 29], ['Guinea pig', 13], ['Rabbit', 11], ['Gerbil', 6], ['Mouse', 5]),
      q('Name an animal with stripes', ['Zebra', 55], ['Tiger', 30], ['Skunk', 6], ['Bee', 4], ['Raccoon', 2]),
      q('Name something a dog does that annoys people', ['Barks', 42], ['Jumps on people', 18], ['Chews things', 13], ['Begs for food', 9], ['Licks', 7], ['Sheds', 5]),
      q('Name an animal you’d see at the zoo', ['Lion', 25], ['Elephant', 22], ['Monkey', 19], ['Giraffe', 14], ['Tiger', 8], ['Bear', 5]),
      q('Name an animal people are afraid of', ['Snake', 40], ['Spider', 26], ['Shark', 13], ['Bear', 9], ['Rat', 5], ['Bat', 3]),
      q('Name an animal that’s slow', ['Turtle', 52], ['Sloth', 26], ['Snail', 15], ['Slug', 3]),
    ],
  },
  {
    id: 'adulting',
    title: 'Adulting',
    category: 'Grown-Ups',
    blurb: 'Bills, first dates and lazy Sundays.',
    questions: [
      q('Name a bill everybody has to pay', ['Rent or mortgage', 30], ['Electric', 22], ['Phone', 14], ['Water', 11], ['Car payment', 9], ['Internet', 7]),
      q('Name something people lie about on a first date', ['Age', 31], ['Job', 20], ['Weight', 14], ['Money', 12], ['Height', 9], ['Past relationships', 5]),
      q('Name a reason you might call in sick', ['Flu', 33], ['Cold', 21], ['Headache', 12], ['Stomach bug', 11], ['Hangover', 9], ['Sick kid', 7]),
      q('Name something people do to save money', ['Use coupons', 30], ['Cook at home', 22], ['Buy generic', 13], ['Shop sales', 11], ['Cancel subscriptions', 8], ['Carpool', 6]),
      q('Name something that gets more expensive every year', ['Gas', 36], ['Groceries', 24], ['Rent', 15], ['Insurance', 10], ['College tuition', 6], ['Health care', 4]),
      q('Name something people do on a lazy Sunday', ['Sleep in', 35], ['Watch TV', 26], ['Watch football', 12], ['Read', 8], ['Go to brunch', 7], ['Nap', 5]),
    ],
  },
  {
    id: 'spooky-season',
    title: 'Spooky Season',
    category: 'Holidays',
    blurb: 'Costumes, candy and things that go bump in the night.',
    theme: 'halloween',
    questions: [
      q('Name a popular Halloween costume', ['Witch', 26], ['Ghost', 18], ['Vampire', 15], ['Superhero', 13], ['Pirate', 9], ['Zombie', 7]),
      q('Name something you’d find in a haunted house', ['Ghosts', 39], ['Cobwebs', 18], ['Skeletons', 13], ['Bats', 9], ['Creaky doors', 8], ['Coffins', 5]),
      q('Name a candy kids hope to get trick-or-treating', ['Chocolate bars', 36], ['Peanut butter cups', 22], ['Gummy candy', 13], ['Lollipops', 10], ['Licorice', 6], ['Caramels', 5]),
      q('Name something people decorate for Halloween', ['Pumpkins', 74], ['Front porch', 9], ['Windows', 5], ['Yard', 5], ['Trees', 3]),
      q('Name a monster that comes out at night', ['Vampire', 36], ['Werewolf', 27], ['Zombie', 14], ['Ghost', 9], ['Bogeyman', 7], ['Mummy', 3]),
      q('Name a sound you hear in a scary movie', ['Creaky door', 32], ['Footsteps', 20], ['Screaming', 18], ['Thunder', 10], ['Phone ringing', 8], ['Owl hooting', 4]),
    ],
  },
  {
    id: 'gobble-gobble',
    title: 'Gobble Gobble',
    category: 'Holidays',
    blurb: 'Turkey, pie and the great after-dinner nap.',
    theme: 'thanksgiving',
    questions: [
      q('Name a side dish served at Thanksgiving', ['Mashed potatoes', 35], ['Stuffing', 28], ['Green bean casserole', 11], ['Cranberry sauce', 10], ['Sweet potatoes', 7], ['Rolls', 5]),
      q('Name something people do after Thanksgiving dinner', ['Nap', 41], ['Watch football', 26], ['Eat dessert', 12], ['Do the dishes', 9], ['Go for a walk', 5], ['Go shopping', 3]),
      q('Name a pie served at Thanksgiving', ['Pumpkin', 58], ['Apple', 20], ['Pecan', 14], ['Sweet potato', 4], ['Cherry', 2]),
      q('Name something people are thankful for', ['Family', 52], ['Health', 18], ['Friends', 10], ['Food', 7], ['Their job', 6], ['A home', 4]),
      q('Name something that goes wrong cooking a turkey', ['Burned it', 31], ['Too dry', 26], ['Undercooked', 20], ['Still frozen', 13], ['Dropped it', 4]),
      q('Name a topic to avoid at the Thanksgiving table', ['Politics', 64], ['Religion', 16], ['Money', 8], ['Exes', 5], ['Weight', 3]),
    ],
  },
  {
    id: 'deck-the-halls',
    title: 'Deck the Halls',
    category: 'Holidays',
    blurb: 'Trees, reindeer and last-minute shopping.',
    theme: 'christmas',
    questions: [
      q('Name something you put on a Christmas tree', ['Ornaments', 40], ['Lights', 30], ['Star', 12], ['Tinsel', 8], ['Angel', 5], ['Candy canes', 3]),
      q('Name one of Santa’s reindeer', ['Rudolph', 45], ['Dasher', 15], ['Prancer', 11], ['Comet', 8], ['Blitzen', 7], ['Donner', 6]),
      q('Name something you leave out for Santa', ['Cookies', 70], ['Milk', 22], ['Carrots', 5], ['A note', 2]),
      q('Name an easy last-minute gift', ['Gift card', 47], ['Socks', 14], ['Candle', 10], ['Chocolate', 9], ['Wine', 8], ['Perfume', 5]),
      q('Name something people do on Christmas morning', ['Open presents', 66], ['Eat breakfast', 12], ['Go to church', 8], ['Drink coffee', 6], ['Call family', 4]),
      q('Name a Christmas song everyone knows', ['Jingle Bells', 39], ['Silent Night', 17], ['White Christmas', 13], ['Rudolph', 12], ['Frosty the Snowman', 8], ['Deck the Halls', 6]),
    ],
  },
  {
    id: 'be-mine',
    title: 'Be Mine',
    category: 'Holidays',
    blurb: 'Roses, chocolates and date-night debates.',
    theme: 'valentines',
    questions: [
      q('Name a gift people give on Valentine’s Day', ['Flowers', 34], ['Chocolate', 31], ['Jewelry', 13], ['Card', 10], ['Teddy bear', 5], ['Perfume', 3]),
      q('Name something red you see on Valentine’s Day', ['Roses', 44], ['Hearts', 30], ['Cards', 8], ['Lipstick', 6], ['Wine', 5], ['Candy', 3]),
      q('Name a place people go on a romantic date', ['Restaurant', 46], ['Movies', 21], ['Beach', 10], ['Park', 8], ['Picnic', 5], ['Dancing', 4]),
      q('Name something couples argue about', ['Money', 41], ['Chores', 18], ['In-laws', 11], ['Kids', 9], ['Jealousy', 8], ['TV remote', 5]),
      q('Name a word that comes before “heart”', ['Sweet', 31], ['Broken', 25], ['Big', 13], ['Purple', 8], ['Brave', 6], ['Cold', 5]),
      q('Name a famous couple from a story or movie', ['Romeo and Juliet', 62], ['Jack and Rose', 14], ['Beauty and the Beast', 8], ['Cinderella and the Prince', 6], ['Shrek and Fiona', 4]),
    ],
  },
  {
    id: 'stars-and-stripes',
    title: 'Stars & Stripes',
    category: 'Holidays',
    blurb: 'Fireworks, cookouts and summer at the lake.',
    theme: 'independence',
    questions: [
      q('Name something you see at a Fourth of July party', ['Fireworks', 52], ['Flags', 18], ['Barbecue', 13], ['Sparklers', 6], ['Hot dogs', 5], ['Pool', 3]),
      q('Name something that’s red, white and blue', ['American flag', 66], ['Fireworks', 9], ['Popsicles', 7], ['Soda cans', 6], ['Captain America', 5], ['Uncle Sam', 3]),
      q('Name a food you grill on the Fourth of July', ['Hamburgers', 42], ['Hot dogs', 35], ['Steak', 8], ['Chicken', 7], ['Corn', 3], ['Ribs', 2]),
      q('Name something that scares a dog on the Fourth of July', ['Fireworks', 81], ['Loud music', 6], ['Crowds', 5], ['Sparklers', 3]),
      q('Name a symbol of America', ['Flag', 44], ['Bald eagle', 26], ['Statue of Liberty', 17], ['Liberty Bell', 6], ['Uncle Sam', 4]),
      q('Name something people do at the lake in summer', ['Swim', 38], ['Fish', 21], ['Go boating', 17], ['Ride jet skis', 9], ['Go tubing', 6], ['Grill out', 4]),
    ],
  },
]

export const PACK_CATEGORIES: PackCategory[] = [...new Set(PACKS.map((p) => p.category))]
