import { ElectionPhase } from "../types";

export const electionPhases: ElectionPhase[] = [
  {
    id: "voter-registration",
    title: "Voter Registration",
    description: "The first step in participating in an election is registering to vote.",
    details: [
      "Check eligibility: Must be a U.S. citizen, meet state residency requirements, and be at least 18 years old by Election Day.",
      "Register online, by mail, or in person at your local election office.",
      "Some states offer same-day registration; others require registration 15-30 days before Election Day.",
      "Verify your registration status well before any deadlines.",
      "The National Voter Registration Act (NVRA) requires states to offer voter registration at DMVs and public assistance offices.",
      "Students can register at either their home address or school address.",
    ],
    timeline: "Ongoing — deadlines vary by state, typically 15-30 days before Election Day",
    order: 1,
    icon: "📋",
    keyDates: [
      "National Voter Registration Day (4th Tuesday of September)",
      "State-specific deadlines vary",
    ],
  },
  {
    id: "candidate-nomination",
    title: "Candidate Nomination & Primaries",
    description:
      "Political parties select their candidates through primaries and caucuses.",
    details: [
      "Candidates announce their intention to run and begin campaigning.",
      "Primary elections or caucuses are held state by state from February to June.",
      "Open primaries allow any registered voter to participate; closed primaries limit voting to registered party members.",
      "Caucuses are local meetings where party members discuss and vote for candidates.",
      "Delegates are awarded based on primary/caucus results — proportionally or winner-take-all depending on party rules.",
      "Candidates must meet filing requirements, signature thresholds, and FEC registration.",
    ],
    timeline: "February – June of election year",
    order: 2,
    icon: "🎤",
    keyDates: [
      "Iowa Caucuses (traditionally first)",
      "Super Tuesday (first Tuesday in March)",
      "Primary season concludes by June",
    ],
  },
  {
    id: "national-conventions",
    title: "National Conventions",
    description:
      "Each major party holds a national convention to formally nominate their presidential candidate.",
    details: [
      "Delegates from each state gather to cast votes for the party nominee.",
      "The nominee selects a vice-presidential running mate.",
      "The party platform (statement of goals and principles) is officially adopted.",
      "Conventions feature keynote speeches and serve to unify the party.",
      "Historically, contested conventions occurred when no candidate had a majority of delegates.",
      "Modern conventions are largely ceremonial as nominees are typically determined during primaries.",
    ],
    timeline: "July – August of election year",
    order: 3,
    icon: "🏛️",
    keyDates: [
      "Democratic National Convention (typically late July/August)",
      "Republican National Convention (typically mid-July/August)",
    ],
  },
  {
    id: "general-campaign",
    title: "General Election Campaign",
    description:
      "Nominated candidates campaign nationwide, participate in debates, and present their platforms.",
    details: [
      "Candidates travel across the country, focusing on battleground/swing states.",
      "Presidential debates (typically 3) and a vice-presidential debate are organized by the Commission on Presidential Debates.",
      "Campaign finance is regulated by the Federal Election Commission (FEC).",
      "Super PACs and political action committees play a significant role in modern campaigning.",
      "Media coverage, advertisements, social media, and grassroots organizing are key campaign strategies.",
      "Early voting and absentee ballot requests begin in many states during this period.",
    ],
    timeline: "September – early November",
    order: 4,
    icon: "📢",
    keyDates: [
      "Presidential debates (September-October)",
      "Early voting begins (varies by state)",
    ],
  },
  {
    id: "election-day",
    title: "Election Day",
    description:
      "Citizens cast their votes at polling stations or through mail-in ballots.",
    details: [
      "Election Day is the first Tuesday after the first Monday in November.",
      "Polls are open at times determined by each state, typically from early morning to evening.",
      "Voters cast ballots for President, Congress, and state/local races.",
      "Various voting methods include in-person, mail-in/absentee, and early voting.",
      "Accessibility accommodations are legally required at polling places under the ADA and Help America Vote Act.",
      "Provisional ballots are available for voters whose eligibility cannot be immediately confirmed.",
      "It is illegal to intimidate voters or campaign within a certain distance of polling places.",
    ],
    timeline: "First Tuesday after the first Monday in November",
    order: 5,
    icon: "🗳️",
    keyDates: ["Election Day (November — every 4 years for presidential elections)"],
  },
  {
    id: "electoral-college",
    title: "Electoral College Vote",
    description:
      "Electors from each state formally cast their votes for President and Vice President.",
    details: [
      "Each state has a number of electors equal to its total Congressional representation (House + Senate).",
      "There are 538 total electoral votes; a candidate needs 270 to win.",
      "Most states use a winner-take-all system; Maine and Nebraska use the congressional district method.",
      "Electors meet in their state capitals on the first Monday after the second Wednesday in December.",
      "Faithless electors — those who vote against their state's popular vote — are rare and penalized in some states.",
      "The Electoral College was established by Article II, Section 1 of the Constitution and modified by the 12th Amendment.",
    ],
    timeline: "First Monday after the second Wednesday in December",
    order: 6,
    icon: "⚖️",
    keyDates: [
      "Electoral College meets (mid-December)",
      "States certify results (late November/early December)",
    ],
  },
  {
    id: "certification",
    title: "Congressional Certification",
    description:
      "Congress meets in joint session to count and certify the electoral votes.",
    details: [
      "A joint session of Congress convenes on January 6th.",
      "The Vice President (as President of the Senate) presides over the count.",
      "Electoral votes are counted alphabetically by state.",
      "Members of Congress may object to a state's electoral votes, requiring both chambers to vote on the objection.",
      "The Electoral Count Reform Act (2022) clarified the certification process and raised the threshold for objections.",
      "If no candidate reaches 270 electoral votes, the House selects the President (one vote per state delegation).",
    ],
    timeline: "January 6th following the election",
    order: 7,
    icon: "📜",
    keyDates: ["January 6 — Joint session of Congress"],
  },
  {
    id: "inauguration",
    title: "Inauguration",
    description:
      "The President-elect is sworn into office and begins their term.",
    details: [
      "Inauguration Day is January 20th, as established by the 20th Amendment.",
      "The President takes the oath of office administered by the Chief Justice of the Supreme Court.",
      "The inaugural address outlines the new President's vision and priorities.",
      "A transition period between Election Day and Inauguration allows the incoming administration to prepare.",
      "The Presidential Transition Act provides resources and access for the incoming team.",
      "Inauguration ceremonies typically include a parade, luncheon, and inaugural balls.",
    ],
    timeline: "January 20th following the election",
    order: 8,
    icon: "🎖️",
    keyDates: [
      "January 20 — Inauguration Day",
      "Transition period: November – January",
    ],
  },
];

export function getPhaseById(id: string): ElectionPhase | undefined {
  return electionPhases.find((phase) => phase.id === id);
}

export function getPhasesByOrder(): ElectionPhase[] {
  return [...electionPhases].sort((a, b) => a.order - b.order);
}
