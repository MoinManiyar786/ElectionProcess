import { QuizQuestion } from "../types";

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    question: "What is the minimum age to vote in a U.S. federal election?",
    options: ["16 years old", "17 years old", "18 years old", "21 years old"],
    correctIndex: 2,
    explanation:
      "The 26th Amendment to the U.S. Constitution, ratified in 1971, set the minimum voting age at 18 for all federal, state, and local elections.",
    difficulty: "beginner",
    category: "voter-registration",
  },
  {
    id: "q2",
    question: "How many electoral votes are needed to win the presidency?",
    options: ["218", "270", "300", "538"],
    correctIndex: 1,
    explanation:
      "There are 538 total electoral votes. A candidate must receive at least 270 — a simple majority — to win the presidency.",
    difficulty: "beginner",
    category: "electoral-college",
  },
  {
    id: "q3",
    question: "When is Election Day in the United States?",
    options: [
      "First Monday in November",
      "First Tuesday after the first Monday in November",
      "Last Tuesday in October",
      "November 1st",
    ],
    correctIndex: 1,
    explanation:
      "By federal law (since 1845), Election Day is the first Tuesday after the first Monday in November.",
    difficulty: "beginner",
    category: "election-day",
  },
  {
    id: "q4",
    question: "What is a caucus?",
    options: [
      "A type of ballot counting method",
      "A local meeting where party members discuss and vote for candidates",
      "A committee that oversees election security",
      "A formal debate between candidates",
    ],
    correctIndex: 1,
    explanation:
      "A caucus is a local gathering of party members who discuss candidates and vote through various methods such as show of hands or physical grouping.",
    difficulty: "intermediate",
    category: "candidate-nomination",
  },
  {
    id: "q5",
    question:
      "Which Amendment established the current Inauguration Day as January 20th?",
    options: [
      "12th Amendment",
      "15th Amendment",
      "20th Amendment",
      "25th Amendment",
    ],
    correctIndex: 2,
    explanation:
      'The 20th Amendment (ratified 1933) moved Inauguration Day from March 4 to January 20, reducing the "lame duck" period.',
    difficulty: "advanced",
    category: "inauguration",
  },
  {
    id: "q6",
    question: "What happens if no candidate receives 270 electoral votes?",
    options: [
      "A runoff election is held",
      "The Supreme Court decides",
      "The House of Representatives elects the President",
      "The sitting President remains in office",
    ],
    correctIndex: 2,
    explanation:
      "Under the 12th Amendment, if no candidate wins a majority of electoral votes, the House selects the President from the top three candidates, with each state delegation casting one vote.",
    difficulty: "advanced",
    category: "electoral-college",
  },
  {
    id: "q7",
    question: "What is the purpose of a national party convention?",
    options: [
      "To register new voters",
      "To formally nominate the party's presidential candidate",
      "To count electoral votes",
      "To swear in new members of Congress",
    ],
    correctIndex: 1,
    explanation:
      "National conventions are where parties formally nominate their presidential and vice-presidential candidates, adopt the party platform, and rally supporters.",
    difficulty: "beginner",
    category: "national-conventions",
  },
  {
    id: "q8",
    question:
      "Which two states do NOT use a winner-take-all system for electoral votes?",
    options: [
      "California and Texas",
      "Maine and Nebraska",
      "New York and Florida",
      "Alaska and Hawaii",
    ],
    correctIndex: 1,
    explanation:
      "Maine and Nebraska use the congressional district method, awarding one electoral vote per congressional district and two for the statewide winner.",
    difficulty: "intermediate",
    category: "electoral-college",
  },
  {
    id: "q9",
    question: "What is Super Tuesday?",
    options: [
      "The day when the President is inaugurated",
      "The day with the most primary elections held simultaneously",
      "The day Congress certifies election results",
      "The final day to register to vote",
    ],
    correctIndex: 1,
    explanation:
      "Super Tuesday (typically the first Tuesday in March of an election year) is when the most states hold primary elections simultaneously, making it a pivotal day in the nomination process.",
    difficulty: "intermediate",
    category: "candidate-nomination",
  },
  {
    id: "q10",
    question: "Who administers the presidential oath of office?",
    options: [
      "The Speaker of the House",
      "The outgoing President",
      "The Chief Justice of the Supreme Court",
      "The Vice President",
    ],
    correctIndex: 2,
    explanation:
      "By tradition (not constitutional requirement), the Chief Justice of the Supreme Court administers the oath of office to the incoming President.",
    difficulty: "beginner",
    category: "inauguration",
  },
  {
    id: "q11",
    question: "What is the National Voter Registration Act (NVRA) also known as?",
    options: [
      "The Voting Rights Act",
      "The Motor Voter Act",
      "The Help America Vote Act",
      "The Electoral Count Act",
    ],
    correctIndex: 1,
    explanation:
      "The NVRA (1993) is commonly called the 'Motor Voter Act' because it requires states to offer voter registration at DMV offices.",
    difficulty: "intermediate",
    category: "voter-registration",
  },
  {
    id: "q12",
    question: "What is a faithless elector?",
    options: [
      "A voter who doesn't show up on Election Day",
      "An elector who votes against their state's popular vote",
      "A candidate who drops out of the race",
      "A poll worker who makes an error",
    ],
    correctIndex: 1,
    explanation:
      "A faithless elector is a member of the Electoral College who casts their vote for someone other than the candidate who won their state's popular vote. Some states have laws penalizing this behavior.",
    difficulty: "advanced",
    category: "electoral-college",
  },
  {
    id: "q13",
    question: "What federal agency regulates campaign finance?",
    options: [
      "The Department of Justice",
      "The Federal Bureau of Investigation",
      "The Federal Election Commission (FEC)",
      "The Securities and Exchange Commission",
    ],
    correctIndex: 2,
    explanation:
      "The FEC was established in 1975 to regulate campaign finance in federal elections, including contribution limits and disclosure requirements.",
    difficulty: "intermediate",
    category: "general-campaign",
  },
  {
    id: "q14",
    question:
      "Who presides over the joint session of Congress to count electoral votes?",
    options: [
      "The Speaker of the House",
      "The Chief Justice",
      "The Vice President",
      "The Secretary of State",
    ],
    correctIndex: 2,
    explanation:
      "The Vice President, as President of the Senate, presides over the joint session of Congress on January 6th to count and certify the electoral votes.",
    difficulty: "intermediate",
    category: "certification",
  },
  {
    id: "q15",
    question: "What is a provisional ballot?",
    options: [
      "A ballot cast before Election Day",
      "A ballot for voters whose eligibility cannot be immediately confirmed",
      "A ballot used only in primary elections",
      "A ballot cast by overseas military members",
    ],
    correctIndex: 1,
    explanation:
      "Provisional ballots allow voters whose eligibility is in question to cast a ballot that is counted only after their eligibility is verified, as required by the Help America Vote Act.",
    difficulty: "intermediate",
    category: "election-day",
  },
  {
    id: "q16",
    question: "How many total electoral votes are there in the United States?",
    options: ["435", "500", "538", "600"],
    correctIndex: 2,
    explanation:
      "There are 538 electoral votes total: 435 for House members, 100 for Senators, and 3 for Washington D.C. (granted by the 23rd Amendment).",
    difficulty: "beginner",
    category: "electoral-college",
  },
  {
    id: "q17",
    question: "What is the difference between an open and closed primary?",
    options: [
      "Open primaries are free; closed primaries charge a fee",
      "Open primaries allow any voter; closed primaries restrict to party members",
      "Open primaries use paper ballots; closed primaries use machines",
      "There is no difference",
    ],
    correctIndex: 1,
    explanation:
      "In an open primary, any registered voter can participate regardless of party affiliation. In a closed primary, only registered members of that party can vote.",
    difficulty: "intermediate",
    category: "candidate-nomination",
  },
  {
    id: "q18",
    question: "Which amendment lowered the voting age to 18?",
    options: [
      "19th Amendment",
      "24th Amendment",
      "26th Amendment",
      "15th Amendment",
    ],
    correctIndex: 2,
    explanation:
      "The 26th Amendment, ratified in 1971 during the Vietnam War era, lowered the voting age from 21 to 18, largely driven by the argument that those old enough to be drafted should be able to vote.",
    difficulty: "beginner",
    category: "voter-registration",
  },
  {
    id: "q19",
    question: "What is the Presidential Transition Act?",
    options: [
      "A law that sets the date of inauguration",
      "A law that provides resources for the incoming administration",
      "A law that requires candidates to debate",
      "A law that governs the Electoral College",
    ],
    correctIndex: 1,
    explanation:
      "The Presidential Transition Act (1963, updated several times) authorizes funding and access for the President-elect's transition team to ensure an orderly transfer of power.",
    difficulty: "advanced",
    category: "inauguration",
  },
  {
    id: "q20",
    question: "What did the Electoral Count Reform Act of 2022 change?",
    options: [
      "It abolished the Electoral College",
      "It clarified the certification process and raised the objection threshold",
      "It changed the number of electoral votes needed to win",
      "It moved Election Day to a weekend",
    ],
    correctIndex: 1,
    explanation:
      "The Electoral Count Reform Act (2022) clarified that the Vice President's role in certification is ministerial, raised the threshold for congressional objections, and set clearer rules for the January 6th certification process.",
    difficulty: "advanced",
    category: "certification",
  },
];

export function getQuestionsByDifficulty(
  difficulty: QuizQuestion["difficulty"],
): QuizQuestion[] {
  return quizQuestions.filter((q) => q.difficulty === difficulty);
}

export function getQuestionsByCategory(category: string): QuizQuestion[] {
  return quizQuestions.filter((q) => q.category === category);
}

export function getRandomQuestions(count: number, filters?: {
  difficulty?: QuizQuestion["difficulty"];
  category?: string;
}): QuizQuestion[] {
  let pool = [...quizQuestions];

  if (filters?.difficulty) {
    pool = pool.filter((q) => q.difficulty === filters.difficulty);
  }
  if (filters?.category) {
    pool = pool.filter((q) => q.category === filters.category);
  }

  const shuffled = pool.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
}
