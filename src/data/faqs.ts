import { ElectionFAQ } from "../types";

export const electionFAQs: ElectionFAQ[] = [
  {
    id: "faq-1",
    question: "Who is eligible to vote in U.S. elections?",
    answer:
      "To vote in U.S. federal elections, you must be a U.S. citizen, at least 18 years old on or before Election Day, and meet your state's residency requirements. Some states restore voting rights to formerly incarcerated individuals; check your state's specific rules.",
    category: "voter-registration",
    relatedPhaseIds: ["voter-registration"],
  },
  {
    id: "faq-2",
    question: "How do I check my voter registration status?",
    answer:
      "You can check your registration status at vote.gov, your state's Secretary of State website, or by contacting your local election office. It's recommended to verify your registration well before any election deadline.",
    category: "voter-registration",
    relatedPhaseIds: ["voter-registration"],
  },
  {
    id: "faq-3",
    question: "What is the Electoral College and why does it exist?",
    answer:
      "The Electoral College is a body of 538 electors who formally elect the President. It was established by the Founding Fathers as a compromise between election by Congress and election by popular vote. Each state gets electors equal to its Congressional representation. A candidate needs 270 electoral votes to win.",
    category: "electoral-college",
    relatedPhaseIds: ["electoral-college", "certification"],
  },
  {
    id: "faq-4",
    question: "Can I vote if I'm living abroad or in the military?",
    answer:
      "Yes! The Uniformed and Overseas Citizens Absentee Voting Act (UOCAVA) guarantees voting rights for military members and overseas citizens. You can register and request an absentee ballot through the Federal Voting Assistance Program (FVAP) at fvap.gov.",
    category: "election-day",
    relatedPhaseIds: ["voter-registration", "election-day"],
  },
  {
    id: "faq-5",
    question: "What is the difference between a primary and a general election?",
    answer:
      "A primary election is held within a political party to choose the party's candidate for the general election. The general election is when voters choose between the candidates nominated by each party (and any independent candidates) for the actual office.",
    category: "candidate-nomination",
    relatedPhaseIds: ["candidate-nomination", "general-campaign", "election-day"],
  },
  {
    id: "faq-6",
    question: "What forms of ID do I need to vote?",
    answer:
      "Voter ID requirements vary by state. Some states require photo ID, others accept non-photo ID, and some have no ID requirement. Check your state's specific requirements at vote.gov or your state election website well before Election Day.",
    category: "election-day",
    relatedPhaseIds: ["election-day"],
  },
  {
    id: "faq-7",
    question: "What is early voting and is it available in my state?",
    answer:
      "Early voting allows you to cast your ballot before Election Day at designated polling locations. Availability and timeframes vary by state — some offer weeks of early voting while others don't offer it at all. Check your state election office for details.",
    category: "election-day",
    relatedPhaseIds: ["election-day"],
  },
  {
    id: "faq-8",
    question: "Can the popular vote winner lose the election?",
    answer:
      "Yes. Because the President is elected by the Electoral College, not direct popular vote, a candidate can win the presidency without winning the national popular vote. This has happened five times in U.S. history, most recently in 2016.",
    category: "electoral-college",
    relatedPhaseIds: ["electoral-college", "election-day"],
  },
  {
    id: "faq-9",
    question: "What happens during the presidential transition?",
    answer:
      "After the election, the incoming President (President-elect) begins assembling their administration. The Presidential Transition Act provides funding and resources. The outgoing administration shares information about operations and national security. The transition lasts from Election Day to Inauguration Day (January 20).",
    category: "inauguration",
    relatedPhaseIds: ["certification", "inauguration"],
  },
  {
    id: "faq-10",
    question: "How are congressional elections different from presidential elections?",
    answer:
      "All 435 House seats are up for election every 2 years, while about one-third of the 100 Senate seats are up every 2 years (senators serve 6-year terms). Congressional elections use direct popular vote within each state or district, unlike the Electoral College system for presidential elections.",
    category: "general-campaign",
    relatedPhaseIds: ["candidate-nomination", "election-day"],
  },
];

export function getFAQsByCategory(category: string): ElectionFAQ[] {
  return electionFAQs.filter((faq) => faq.category === category);
}

export function searchFAQs(query: string): ElectionFAQ[] {
  const lowerQuery = query.toLowerCase();
  return electionFAQs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(lowerQuery) ||
      faq.answer.toLowerCase().includes(lowerQuery),
  );
}
